import { NoOpRenderer, Renderer } from "./interfaces/renderer";

export class BouldersGame extends HTMLElement {

  canvas: HTMLCanvasElement | null = null;
  shadowRoot: ShadowRoot | null = null;
  renderer: Renderer | null = null;
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
    requestAnimationFrame(this.gameLoop);
  }

  disconnectedCallback() {
    this.dispose();
  }

  async setup() {
    const renderer = new NoOpRenderer();
    await renderer.setup();
    this.renderer = renderer;
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
