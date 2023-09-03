import { IRenderer } from "./interfaces/irenderer";
import { CanvasRenderer } from "./renderer/canvas-renderer";
import { AnimationInterval, AnimationLoop } from "./utils/animation-interval";
import { Level } from "./utils/level";
import { loadImage } from "./utils/load-image";

export class BouldersGame extends HTMLElement {

  canvas: HTMLCanvasElement | null = null;
  renderer: IRenderer | null = null;
  level: Level | null = null;
  timer = NaN;
  initialized = false;
  sprites: HTMLImageElement|null = null;
  animationLoop: AnimationLoop|null = null;

  constructor() {
    super();
  }

  static register() {
    customElements.define('boulders-game', BouldersGame);
  }

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
    this.appendChild(this.canvas);
    this.renderer = new CanvasRenderer(this.canvas, this.sprites);
    await this.renderer.setup();
  }

  async setup() {
    if (! this.sprites) {
      this.sprites = await loadImage('/gfx/sprites.png');
    }
    if (! this.renderer) {
      this.createRenderer();
    }
    if (! this.level) {
      this.initializeLevel();
    }
    if (! this.animationLoop) {
      this.animationLoop = new AnimationLoop();
      this.animationLoop.add(this.gameLoop, 1000 / 25);
      this.animationLoop.run();
    }
    this.initialized = true;
  }

  dispose() {
    this.renderer?.dispose();
    this.renderer = null;
  }

  gameLoop = (t: DOMHighResTimeStamp) => {
    if (this.level) {
      this.renderer?.frame(this.level);
    }
    console.log(t);
  }
}

BouldersGame.register();
