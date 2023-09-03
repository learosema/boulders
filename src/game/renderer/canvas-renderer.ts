import { Renderer } from "../interfaces/renderer";
import { Level, Position } from "../utils/level";
import { loadImage } from "../utils/load-image";
import { pixelRatio } from "../utils/pixel-ratio";

export class CanvasRenderer implements Renderer {

  /**
   * tiles on the spritesheet are 16x16 pixels
   */
  get spriteSize() {
    return this.sprites.height;
  };

  context: CanvasRenderingContext2D|null = null;

  /**
   * dimensions of the screen and zoom factor of the tiles.
   */
  dimensions = {width: 0, height: 0};

  /**
   * current pixel ratio
   */
  pixelRatio = 1;

  tileSize = 64;

  constructor(
    public canvas: HTMLCanvasElement,
    public sprites: HTMLImageElement,
  ) {}

  /**
   * sets up canvas and rendering context
   */
  async setup(): Promise<void> {
    this.context = this.canvas.getContext('2d');
    if (! this.context) {
      throw new Error('Context failed to initialize');
    }

    this.onResize();
    window.addEventListener('resize', this.onResize, false);

  }

  onResize = () => {
    this.pixelRatio = pixelRatio();
    this.dimensions = {
      width: this.canvas.clientWidth * this.pixelRatio,
      height: this.canvas.clientHeight * this.pixelRatio,
    };
    Object.assign(this.canvas, this.dimensions);
  }

  /**
   * Render the level onto canvas
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
    const { width, height } = this.dimensions;
    const { tileSize, pixelRatio, spriteSize } = this;
    const dimX = Math.floor(width / tileSize) + 1;
    const dimY = Math.floor(height / tileSize) + 1;

    offset.x = -Math.floor(tileSize / 2);
    offset.y = -Math.floor(tileSize / 2);

    const { playerPosition } = level;

    const levelPosition = {
      x:Math.floor((playerPosition?.x || 0) - tileSize / 2),
      y: Math.floor((playerPosition?.y || 0) - tileSize / 2)
    }

    for (let y = 0; y < dimY; y++) {
      for (let x = 0; x < dimX; x++) {
        const field = level.getField(x, y);
        const dx = offset.x * pixelRatio + x * tileSize * pixelRatio;
        const dy = offset.y * pixelRatio + y * tileSize * pixelRatio;
        if (field === 0) {
          this.context.fillStyle = '#000';
          this.context.fillRect(dx, dy, tileSize * pixelRatio, tileSize * pixelRatio)
        } else {
          const sx = (field - 1) * spriteSize;
          this.context.imageSmoothingEnabled = false;
          this.context.drawImage(this.sprites, sx, 0 , spriteSize, spriteSize, dx, dy, (tileSize) * pixelRatio, (tileSize) * pixelRatio);
        }
      }
    }
  }

  dispose(): void | Promise<void> {
    window.removeEventListener('resize', this.onResize, false);
  }
}
