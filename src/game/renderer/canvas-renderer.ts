import { Renderer } from "../interfaces/renderer";
import { Level, Position } from "../utils/level";
import { loadImage } from "../utils/load-image";
import { pixelRatio } from "../utils/pixel-ratio";

export class CanvasRenderer implements Renderer {

  sprites: HTMLImageElement|null = null;

  /**
   * tiles on the spritesheet are 16x16 pixels
   */
  spriteSize = 16;

  context: CanvasRenderingContext2D|null = null;

  /**
   * dimensions of the screen and zoom factor of the tiles.
   */
  dimensions = {width: 0, height: 0, tileSize: 64};

  /**
   * current pixel ratio
   */
  pixelRatio = 1;

  constructor(
    public canvas: HTMLCanvasElement
  ) {}


  async setup(): Promise<void> {
    this.sprites = await loadImage('/gfx/sprites.png');
    this.context = this.canvas.getContext('2d');
    this.#setDimensions();
  }

  #setDimensions() {
    this.pixelRatio = pixelRatio();
    Object.assign(this.dimensions, {
      width: this.canvas.clientWidth * this.pixelRatio,
      height: this.canvas.clientHeight * this.pixelRatio
    });
  }

  /**
   * Render the level
   * @param level level instance
   * @param offset pixel offset to draw at.
   */
  frame(level: Level, offset: Position): void {

    if (! this.context) {
      throw new Error('context not initialized.');
    }
    if (! this.sprites) {
      throw new Error('sprites not loaded.');
    }

    // number of tiles that fit into the screen
    const { width, height, tileSize } = this.dimensions;
    // TODO: get divisions right, as soon as I get to remove all this
    // brainfog due to toxic relationship
    const dimX = width / tileSize;
    const dimY = height / tileSize;

    const { playerPosition } = level;

    const levelPosition = {
      x:Math.floor((playerPosition?.x || 0) - dimX / 2),
      y: Math.floor((playerPosition?.y || 0) - dimY / 2)
    }

    for (let y = 0; y < this.dimensions.tileSize; y++) {
      for (let x = 0; x < this.dimensions.tileSize; x++) {
        const field = level.getField()


        this.context.drawImage(this.sprites, offset.x + x * tileSize, offset.y + y * tileSize)
      }
    }
  }

  dispose(): void | Promise<void> {
    throw new Error("Method not implemented.");
  }
}
