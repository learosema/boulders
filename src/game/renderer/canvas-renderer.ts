import { IRenderer } from "../interfaces/irenderer";
import { Field, Level, Position } from "../utils/level";
import { oddly } from "../utils/num-utils";
import { pixelRatio } from "../utils/pixel-ratio";

export class CanvasRenderer implements IRenderer {

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
    this.setSize();
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
  frame(level: Level, levelPosition?: Position, offset?: Position): void {
    if (! this.context) {
      throw new Error('context not initialized.');
    }
    if (! this.sprites) {
      throw new Error('sprites not loaded.');
    }

    // number of tiles that fit into the screen
    const { width, height } = this.dimensions;
    const { tileSize, pixelRatio, spriteSize } = this;
    // TODO needs a little more brain acrobatics
    const numTilesX = oddly(1 + Math.floor(width / (tileSize * pixelRatio)));
    const numTilesY = oddly(1 + Math.floor(height / (tileSize * pixelRatio)));

    if (! offset) {
      offset = {
        x: -tileSize/2,
        y: -tileSize/2,
      };
    }

    const { playerPosition } = level;
    if (! levelPosition) {
      levelPosition = {
        x: (playerPosition?.x || 0) - Math.floor(numTilesX/2),
        y: (playerPosition?.y || 0) - Math.floor(numTilesY/2),
      }
    }

    for (let y = 0; y < numTilesY; y++) {
      for (let x = 0; x < numTilesX; x++) {
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
