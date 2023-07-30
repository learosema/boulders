import { Renderer } from "../interfaces/renderer";
import { loadImage } from "../utils/load-image";
import { pixelRatio } from "../utils/pixel-ratio";

export class CanvasRenderer implements Renderer {

  sprites: HTMLImageElement|null = null;
  context: CanvasRenderingContext2D|null = null;
  dimensions = {width: 0, height: 0};
  pixelRatio = 1;

  constructor(
    public canvas: HTMLCanvasElement
  ) {}


  async setup(): Promise<void> {
    this.sprites = await loadImage('/gfx/sprites.png');
    this.context = this.canvas.getContext('2d');
    this.setDimensions();
  }

  setDimensions() {
    this.pixelRatio = pixelRatio();
    Object.assign(this.dimensions, {
      width: this.canvas.clientWidth * this.pixelRatio,
      height: this.canvas.clientHeight * this.pixelRatio
    });
  }

  frame(): void {
    throw new Error("Method not implemented.");
  }

  dispose(): void | Promise<void> {
    throw new Error("Method not implemented.");
  }

}
