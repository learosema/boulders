import { NoOpRenderer, Renderer } from "./interfaces/renderer";
import { CanvasRenderer } from "./renderer/canvas-renderer";
import { Level } from "./utils/level";

export class BouldersGame extends HTMLElement {

  canvas: HTMLCanvasElement | null = null;
  renderer: Renderer | null = null;
  level: Level | null = null;
  timer = NaN;
  initialized = false;

  constructor() {
    super();
  }

  static register() {
    customElements.define('boulders-game', BouldersGame);
  }

  async connectedCallback() {
    if (! this.renderer) {
      this.createRenderer();
      await this.setup();
    }
    console.log('connected');
    requestAnimationFrame(this.gameLoop);
  }

  disconnectedCallback() {
    this.dispose();
  }

  private initializeLevel() {
    this.level = Level.parse(this.querySelector('script')?.textContent || '');
  }

  private createRenderer()  {
    if (this.canvas) {
      this.canvas.remove();
      this.canvas = null;
    }
    this.canvas = document.createElement('canvas');
    this.appendChild(this.canvas);
    this.renderer = new CanvasRenderer(this.canvas);
  }

  async setup() {
    if (! this.renderer) {
      throw new Error('Renderer needs to be initialized.');
    }
    await this.renderer.setup();
    this.initializeLevel();
  }

  dispose() {
    this.renderer?.dispose();
    this.renderer = null;
  }

  gameLoop = () => {
    if (this.level) {
      this.renderer?.frame(this.level, {x:0, y:0})
    }

    requestAnimationFrame(this.gameLoop);
  }
}

BouldersGame.register();
