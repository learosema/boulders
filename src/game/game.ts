import { FreqMod, createFilter } from "./audio/FreqMod";
import { IRenderer } from "./interfaces/irenderer";
import { CanvasRenderer } from "./renderer/canvas-renderer";
import { SupportedEngines, rendererFactory } from "./renderer/engines";
import { AnimationLoop } from "./utils/animation-interval";
import { Level, LevelCallbackFunction } from "./utils/level";
import { loadImage } from "./utils/load-image";

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
  lowPass1 = createFilter(this.audioContext, 'lowpass', 800);
  lowPass2 = createFilter(this.audioContext, 'lowpass', 350);
  framecycles = 0;

  constructor() {
    super();
  }

  static observedAttributes = ['autofocus', 'engine'];

  static register() {
    customElements.define('boulders-game', BouldersGame);
  }

  /* attributes */

  get autofocus(): boolean {
    return this.hasAttribute('autofocus');
  }

  get engine(): SupportedEngines {
    const engine = this.getAttribute('engine');
    if (! engine) {
      return 'canvas2d';
    }
    if (engine !== 'canvas2d' && engine !== 'webgl' && engine !== 'noop') {
      throw new Error('Unsupported Engine');
    }
    return engine;
  }

  /* lifecycle callbacks */

  async connectedCallback() {
    await this.setup();
  }

  disconnectedCallback() {
    this.dispose();
  }

  async attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    console.log(name, oldValue, newValue);
    if (name === 'engine') {
      this.createRenderer();
    }
  }

  /* private methods */

  private initializeLevel() {
    this.level = Level.parse(this.querySelector('script')?.textContent || '');
  }

  private async createRenderer()  {
    if (! this.sprites) {
      this.sprites = await loadImage('/gfx/sprites.png');
    }
    this.createCanvas();
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer = null;
    }
    this.renderer = rendererFactory(this.engine, this.canvas!, this.sprites);
    await this.renderer.setup();
    if (this.level) {
      this.renderer.setSize();
      this.renderer.frame(this.level);
    }
    if (this.autofocus) {
      setTimeout(() => this.canvas?.focus(), 0);
    }
  }

  private createCanvas(): void {
    this.destroyCanvas();
    this.canvas = document.createElement('canvas');
    this.canvas.setAttribute('tabindex', '0');
    this.appendChild(this.canvas);
    if (! this.canvas) {
      throw Error('Canvas creation failed.');
    }
    this.canvas.addEventListener('focus', this.onFocus, false);
    this.canvas.addEventListener('blur', this.onBlur, false);
    this.canvas.addEventListener('keydown', this.onKeyDown, false);
    window.addEventListener('resize', this.onResize, false);
  }

  private destroyCanvas(): void {
    if (this.canvas) {
      window.removeEventListener('resize', this.onResize, false);
      this.canvas.removeEventListener('focus', this.onFocus, false);
      this.canvas.removeEventListener('blur', this.onBlur, false);
      this.canvas.removeEventListener('keydown', this.onKeyDown, false);
      this.canvas.remove();
      this.canvas = null;
    }
  }

  private async setup() {
    this.audioContext.resume();

    this.mainGain.gain.value = .25;
    this.mainGain.connect(this.audioContext.destination);
    if (! this.level) {
      this.initializeLevel();
    }
    if (! this.level) {
      throw Error('Level initialization failed.');
    }
    if (! this.renderer) {
      await this.createRenderer();
    }
    if (! this.animationLoop) {
      this.animationLoop = new AnimationLoop();
      this.animationLoop.add(this.renderLoop, 1000 / 25);
      this.animationLoop.add(this.inputLoop, 50);
      this.animationLoop.add(this.stoneLoop, 200);
    }
    this.level.subscribe(this.onGameEvent);

    this.initialized = true;
  }

  dispose() {
    this.animationLoop?.dispose();
    this.renderer?.dispose();
    this.destroyCanvas();
    this.level?.unsubscribe();
    this.level = null;
    this.renderer = null;
    this.initialized = false;
  }

  onGameEvent: LevelCallbackFunction = (eventName: string) => {
    if (eventName === 'gem') {
      const FM = new FreqMod(this.audioContext, 12, 4).withFilter(this.lowPass1).toDestination(this.mainGain);
      FM.play('C6', this.audioContext.currentTime, this.audioContext.currentTime + .25);
      setTimeout(() => FM.dispose(), 500);
    }
    if (eventName === 'push') {
      const FM = new FreqMod(this.audioContext, 2, 2, 'sawtooth', 'sine').withFilter(this.lowPass2).toDestination(this.mainGain);
      FM.play('C0', this.audioContext.currentTime, this.audioContext.currentTime + .25, .5, 1);
      setTimeout(() => FM.dispose(), 250);
    }
    if (eventName === 'ground') {
      const FM = new FreqMod(this.audioContext, 2, 2, 'sawtooth', 'sawtooth').withFilter(this.lowPass2).toDestination(this.mainGain);
      FM.play('A0', this.audioContext.currentTime, this.audioContext.currentTime + .25);
      setTimeout(() => FM.dispose(), 250);
    }
    if (eventName === 'gameover') {
      const FM = new FreqMod(this.audioContext, 24, 4).withFilter(this.lowPass1).toDestination(this.mainGain);
      FM.play('D#3', this.audioContext.currentTime, this.audioContext.currentTime + .25);
      FM.play('D3', this.audioContext.currentTime + .26, this.audioContext.currentTime + .5);
      FM.play('A#2', this.audioContext.currentTime + .51, this.audioContext.currentTime + .75);
      FM.play('G2', this.audioContext.currentTime + .76, this.audioContext.currentTime + 1.);
      setTimeout(() => FM.dispose(), 1300);
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
    if (!this.renderer) {
      return;
    }

    this.renderer.setSize();
    if (this.level) {
      this.renderer.frame(this.level);
    }
  }

  renderLoop = (t: DOMHighResTimeStamp) => {
    if (!this.level || !this.renderer) {
      return;
    }
    this.renderer.frame(this.level);
  }

  stoneLoop = () => {
    if (this.level) {
      this.level.stoneFall();
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
