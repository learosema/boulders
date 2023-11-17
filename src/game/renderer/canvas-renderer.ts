import { IRenderer } from "../interfaces/irenderer";
import { Dimension, Field, Level, Position } from "../utils/level";
import { oddly } from "../utils/num-utils";
import { pixelRatio } from "../utils/pixel-ratio";

export class CanvasRenderer implements IRenderer {

  /**
   * tiles on the spritesheet are 16x16 pixels
   */
  spriteSize = 16;

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
    public level: Level,
  ) {}

  /**
   * sets up canvas and rendering context
   */
  async setup(): Promise<void> {
    this.context = this.canvas.getContext('2d');
    if (! this.context) {
      throw new Error('Context failed to initialize');
    }
  }

  setSize() {
    this.pixelRatio = pixelRatio();
    this.dimensions = {
      width: this.canvas.clientWidth * this.pixelRatio,
      height: this.canvas.clientHeight * this.pixelRatio,
    };
    const viewportMin = Math.min(this.canvas.clientWidth, this.canvas.clientHeight);

    // display at least 10x10 tiles on screen.
    this.tileSize = Math.min(64, Math.round(viewportMin / 10));

    Object.assign(this.canvas, this.dimensions);
  }

  /**
   * Render the level onto canvas
   * @param level level instance
   * @param levelPosition position of the first top left tile (default 0,0)
   * @param offset pixel offset to draw at. (default 0,0)
   */
  frame(levelPosition?: Position, offset?: Position, numTiles?: Dimension): void {
    const { level } = this;
    if (! this.context) {
      throw new Error('context not initialized.');
    }
    if (! this.sprites) {
      throw new Error('sprites not loaded.');
    }

    // number of tiles that fit into the screen
    const { width, height } = this.dimensions;
    const { tileSize, pixelRatio, spriteSize } = this;

    if (! numTiles) {
      numTiles = {
        width: oddly(1 + Math.round(width / (tileSize * pixelRatio))),
        height: oddly(1 + Math.round(height / (tileSize * pixelRatio))),
      }
    }

    if (! offset) {
      offset = {
        x: -tileSize/2,
        y: -tileSize/2,
      };
    }

    const { playerPosition } = level;
    if (! levelPosition) {
      levelPosition = {
        x: (playerPosition?.x || 0) - Math.floor(numTiles.width / 2),
        y: (playerPosition?.y || 0) - Math.floor(numTiles.height / 2),
      }
    }

    for (let y = 0; y < numTiles.height; y++) {
      for (let x = 0; x < numTiles.width; x++) {
        const field = level.getField(levelPosition.x + x, levelPosition.y + y);
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

    // draw Player
    if (level.playerAlive && playerPosition) {
      const x = playerPosition.x - levelPosition.x;
      const y = playerPosition.y - levelPosition.y;
      const dx = offset.x * pixelRatio + x * tileSize * pixelRatio;
      const dy = offset.y * pixelRatio + y * tileSize * pixelRatio;
      this.context.imageSmoothingEnabled = false;
      this.context.drawImage(this.sprites,
          (level.playerDirection + Field.PLAYER - 1) * spriteSize, 0,
          spriteSize, spriteSize,
          dx, dy,
          tileSize * pixelRatio, tileSize * pixelRatio
      );
    }
  }

  dispose(): void | Promise<void> {
  }
}
