import { NoOpRenderer, Renderer } from "./interfaces/renderer";
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

  connectedCallback() {
    if (! this.renderer) {
      this.setup();
    }
    console.log('connected');
    requestAnimationFrame(this.gameLoop);
  }

  private initializeLevel() {
    this.level = Level.parse(this.querySelector('script')?.textContent || '');
  }

  disconnectedCallback() {
    this.dispose();
  }

  async setup() {
    const renderer = new NoOpRenderer();
    await renderer.setup();
    this.renderer = renderer;
    this.initializeLevel();
  }

  dispose() {
    this.renderer?.dispose();
    this.renderer = null;
  }

  gameLoop = () => {
    requestAnimationFrame(this.gameLoop);
  }
}

BouldersGame.register();
