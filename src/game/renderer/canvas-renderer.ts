import { Renderer } from "../interfaces/renderer";
import { Level, Position } from "../utils/level";
import { loadImage } from "../utils/load-image";
import { pixelRatio } from "../utils/pixel-ratio";

export class CanvasRenderer implements Renderer {

  sprites: HTMLImageElement|null = null;
  context: CanvasRenderingContext2D|null = null;
  dimensions = {width: 0, height: 0, tileSize: 64};
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

  frame(level: Level, playerPosition: Position, offset: Position): void {

    if (! this.context) {
      throw new Error('context not initialized.');
    }
    if (! this.sprites) {
      throw new Error('sprites not loaded.');
    }

    // number of tiles that fit into the screen
    const { width, height, tileSize } = this.dimensions;
    const dimX = width / tileSize + 1;
    const dimY = height / tileSize + 1;

    const levelPosition = {
      x:Math.floor(playerPosition.x - dimX / 2),
      y: Math.floor(playerPosition.y - dimY / 2)
    }

    for (let y = 0; y < this.dimensions.tileSize; y++) {
      for (let x = 0; x < this.dimensions.tileSize; x++) {
        this.context.drawImage(this.sprites, offset.x + x * tileSize, offset.y + y * tileSize)
      }
    }
  }

  dispose(): void | Promise<void> {
    throw new Error("Method not implemented.");
  }
}
