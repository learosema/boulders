import { NoOpRenderer, Renderer } from "./interfaces/renderer";

export class BouldersGame extends HTMLElement {

  canvas: HTMLCanvasElement;
  shadowRoot: ShadowRoot | null;
  renderer: Renderer | null = null;
  timer = NaN;
  initialized = false;

  constructor() {
    super();
    this.shadowRoot = this.attachShadow({mode: 'open'});
    this.canvas = document.createElement('canvas');
    this.canvas.style.display = 'block';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.background = '#000';
    this.shadowRoot.appendChild(this.canvas);
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
