import { FreqMod } from "./audio/FreqMod";
import { IRenderer } from "./interfaces/irenderer";
import { CanvasRenderer } from "./renderer/canvas-renderer";
import { AnimationLoop } from "./utils/animation-interval";
import { Level, LevelCallbackFunction } from "./utils/level";
import { loadImage } from "./utils/load-image";
import { throttle } from "./utils/throttle";

export class BouldersGame extends HTMLElement {

  canvas: HTMLCanvasElement | null = null;
  renderer: IRenderer | null = null;
  level: Level | null = null;
  timer = NaN;
  initialized = false;
  sprites: HTMLImageElement|null = null;
  animationLoop: AnimationLoop|null = null;
  inputQueue: string[] = [];
  audioContext = new AudioContext();
  mainGain = this.audioContext.createGain();
  framecycles = 0;

  constructor() {
    super();
  }

  static observedAttributes = ['autofocus'];

  static register() {
    customElements.define('boulders-game', BouldersGame);
  }

  /* attributes */

  get autofocus(): boolean {
    return this.hasAttribute('autofocus');
  }

  /* lifecycle callbacks */

  async connectedCallback() {
    await this.setup();
    console.log('connected');
  }

  disconnectedCallback() {
    this.dispose();
  }

  private initializeLevel() {
    this.level = Level.parse(this.querySelector('script')?.textContent || '');
  }

  private async createRenderer()  {
    if (! this.sprites) {
      throw new Error('sprites not loaded.');
    }
    if (this.canvas) {
      this.canvas.remove();
      this.canvas = null;
    }
    this.canvas = document.createElement('canvas');
    this.canvas.setAttribute('tabindex', '0');
    this.appendChild(this.canvas);
    this.renderer = new CanvasRenderer(this.canvas, this.sprites);
    await this.renderer.setup();
    if (this.autofocus) {
      setTimeout(() => this.canvas?.focus(), 0);
    }
  }

  private async setup() {
    this.audioContext.resume();
    this.mainGain.gain.value = .2;
    this.mainGain.connect(this.audioContext.destination);
    if (! this.sprites) {
      this.sprites = await loadImage('/gfx/sprites.png');
    }
    if (! this.renderer) {
      this.createRenderer();
    }
    if (! this.level) {
      this.initializeLevel();
    }
    if (! this.level ||  ! this.renderer) {
      throw Error('Something went wrong');
    }
    this.renderer.frame(this.level);
    if (! this.animationLoop) {
      this.animationLoop = new AnimationLoop();
      this.animationLoop.add(this.renderLoop, 1000 / 25);
      this.animationLoop.add(this.inputLoop, 50);
      this.animationLoop.add(this.stoneLoop, 200);
      this.level.subscribe(this.onGameEvent)
    }
    this.initialized = true;
    if (! this.canvas) {
      throw Error('Canvas creation failed.');
    }

    this.canvas.addEventListener('focus', this.onFocus, false);
    this.canvas.addEventListener('blur', this.onBlur, false);
    this.canvas.addEventListener('keydown', this.onKeyDown, false);
    window.addEventListener('resize', this.onResize, false);
  }

  dispose() {
    if (this.canvas) {
      this.canvas.removeEventListener('focus', this.onFocus, false);
      this.canvas.removeEventListener('blur', this.onBlur, false);
      this.canvas.removeEventListener('keydown', this.onKeyDown, false);
    }
    this.renderer?.dispose();
    this.animationLoop?.dispose();
    this.renderer = null;
    window.removeEventListener('resize', this.onResize, false);
  }

  onGameEvent: LevelCallbackFunction = (eventName: string) => {
    if (eventName === 'gem') {
      const FM = new FreqMod(this.audioContext, this.mainGain, 12, 4);
      FM.play('C6', this.audioContext.currentTime, this.audioContext.currentTime + .25);
      setTimeout(() => FM.dispose(), 500);
    }
    if (eventName === 'push') {
      const FM = new FreqMod(this.audioContext, this.mainGain, 1, 4, 'sawtooth', 'sine');
      FM.play('C0', this.audioContext.currentTime, this.audioContext.currentTime + .25, 0, 1);
      setTimeout(() => FM.dispose(), 250);
    }
  }

  onKeyDown = (e: KeyboardEvent) => {
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    if (e.code === 'ArrowUp' || e.code === 'KeyW') {
      this.inputQueue.push('up');
    }
    if (e.code === 'ArrowDown' || e.code === 'KeyS') {
      this.inputQueue.push('down');
    }
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
      this.inputQueue.push('left');
    }
    if (e.code === 'ArrowRight' || e.code === 'KeyD') {
      this.inputQueue.push('right');
    }
    if (e.code === 'Escape') {
      const gameMenu: HTMLDialogElement = document.getElementById('gameMenu') as HTMLDialogElement;
      window.setTimeout(() => gameMenu.showModal(), 0);
    }
  };

  onFocus = () => {
    this.animationLoop?.run();
  }

  onBlur = () => {
    this.animationLoop?.stop();
  }

  onResize = () => {
    this.renderer?.setSize();
    if (this.level) {
      this.renderer?.frame(this.level);
    }
  }

  renderLoop = (t: DOMHighResTimeStamp) => {
    if (!this.level) {
      return;
    }
    if (this.level) {
      this.renderer?.frame(this.level);
    }
  }

  stoneLoop = () => {
    if (this.level) {
      this.level?.stoneFall();
      this.renderer?.frame(this.level!);
    }
  }

  inputLoop = () => {
    const code = this.inputQueue.pop();
    const { level } = this;
    if (! level) {
      return;
    }
    if (code === 'up') {
      level.move(0, -1);
      this.renderer?.frame(level);
    }
    if (code === 'down') {
      level.move(0, 1);
      this.renderer?.frame(level);
    }
    if (code === 'left') {
      level.move(-1, 0);
      this.renderer?.frame(level);
    }
    if (code === 'right') {
      level.move(1, 0);
      this.renderer?.frame(level);
    }
  }
}

BouldersGame.register();
