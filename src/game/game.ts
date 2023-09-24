import { SoundMachine } from "./audio/sound-machine";
import { IRenderer } from "./interfaces/irenderer";
import { SupportedEngines, rendererFactory } from "./renderer/engines";
import { AnimationLoop } from "./utils/animation-interval";
import { Level, LevelCallbackFunction } from "./utils/level";
import { loadImage } from "./utils/load-image";

export class BouldersGame extends HTMLElement {

  canvas: HTMLCanvasElement | null = null;
  renderer: IRenderer | null = null;
  level: Level;
  timer = NaN;
  initialized = false;
  sprites: HTMLImageElement|null = null;
  animationLoop: AnimationLoop|null = null;
  inputQueue: string[] = [];
  framecycles = 0;
  soundMachine = new SoundMachine();

  constructor() {
    super();
    this.level = Level.parse(this.querySelector('script')?.textContent || '');
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
    if (engine !== 'webgpu' && engine !== 'canvas2d' && engine !== 'webgl' && engine !== 'noop') {
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

  private async createRenderer()  {
    if (!this.level) {
      throw new Error('no level');
    }
    if (! this.sprites) {
      this.sprites = await loadImage('/gfx/sprites.png');
    }
    this.createCanvas();
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer = null;
    }
    this.renderer = rendererFactory(this.engine, this.canvas!, this.sprites, this.level);
    await this.renderer.setup();
    if (this.level) {
      this.renderer.setSize();
      this.renderer.frame();
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
    this.soundMachine.setup();
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
    this.soundMachine.dispose();
    this.destroyCanvas();
    this.level?.unsubscribe();
    this.renderer = null;
    this.initialized = false;
  }

  onGameEvent: LevelCallbackFunction = (eventName: string) => {
    if (eventName === 'gem') {
      this.soundMachine.bling();
    }
    if (eventName === 'push') {
      this.soundMachine.push();
    }
    if (eventName === 'ground') {
      this.soundMachine.rock();
    }
    if (eventName === 'gameover') {
      this.soundMachine.gameover();
    }
  }

  onKeyDown = (e: KeyboardEvent) => {
    if (e.code === 'Escape') {
      const gameMenu: HTMLDialogElement = document.getElementById('gameMenu') as HTMLDialogElement;
      window.setTimeout(() => gameMenu.showModal(), 0);
    }
    if (!this.level?.playerAlive) {
      return;
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

  };

  onPointerDown = (e: PointerEvent) => {
    const thirdX = this.clientWidth / 3;
    const thirdY = this.clientHeight / 3;
    const [X, Y] = [(e.clientX / thirdX)|0, (e.clientY / thirdY)|0];

    if (!this.level.playerAlive) {
      return;
    }
    if (X === 1 && Y === 0) {
      this.inputQueue.push('up');
    }
    if (X === 0 && Y === 1) {
      this.inputQueue.push('left');
    }
    if (X === 2 && Y === 1) {
      this.inputQueue.push('right');
    }
    if (X === 1 && Y === 2) {
      this.inputQueue.push('down');
    }
  }

  onFocus = () => {
    this.animationLoop?.run();
    window.setTimeout(() =>
      this.addEventListener('pointerdown', this.onPointerDown, false), 100
    );
  }

  onBlur = () => {
    this.animationLoop?.stop();
    this.removeEventListener('pointerdown', this.onPointerDown, false)
  }

  onResize = () => {
    if (!this.renderer) {
      return;
    }

    this.renderer.setSize();
    if (this.level) {
      this.renderer.frame();
    }
  }

  renderLoop = (t: DOMHighResTimeStamp) => {
    if (!this.level || !this.renderer) {
      return;
    }
    this.renderer.frame();
  }

  stoneLoop = () => {
    if (this.level) {
      this.level.stoneFall();
      this.renderer?.frame();
    }
  }

  inputLoop = () => {
    const code = this.inputQueue.pop();
    const { level } = this;
    if (! level || !level.playerAlive) {
      return;
    }
    if (code === 'up') {
      level.move(0, -1);
      this.renderer?.frame();
    }
    if (code === 'down') {
      level.move(0, 1);
      this.renderer?.frame();
    }
    if (code === 'left') {
      level.move(-1, 0);
      this.renderer?.frame();
    }
    if (code === 'right') {
      level.move(1, 0);
      this.renderer?.frame();
    }
  }
}

BouldersGame.register();
