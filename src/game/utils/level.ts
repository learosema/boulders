export type LevelCallbackFunction = (eventName: string, payload?: any) => void;

export enum Flag {
  NONE = 0,
  FALLING = 1,
  EXIT = 2,
};

export enum Field {
  EMPTY = 0,
  WALL = 1,
  SAND = 2,
  STONE = 3,
  GEM = 4,
  EXIT = 5,
  GHOST = 6,
  PLAYER = 7,
  PLAYER_LEFT = 8,
};

export enum Direction {
  LEFT = 1,
  RIGHT = 0,
}

export type Position = {
  x: number;
  y: number;
}

export type Dimension = {
  width: number;
  height: number;
};

export class Level {
  /**
   * Additional store for flags for each field
   */
  flags: Flag[][];

  constructor(
    public level: Field[][],
    public playerPosition: Position|null,
  ) {
    this.flags = level.map(row => row.map(x => 0));
    this.numGems = this.countGems();
  }

  get dimensions(): Dimension {
    return {
      width: this.level[0]?.length || 0,
      height: this.level.length
    };
  }

  playerDirection = Direction.RIGHT;

  collectedGems = 0;

  fallingItems: Array<Position> = [];

  playerAlive = true;

  numGems = 0;

  listeners: Array<LevelCallbackFunction> = [];

  subscribe(callback: LevelCallbackFunction) {
    this.listeners.push(callback);
  }

  notify(eventName: string, payload?: any) {
    for (const listener of this.listeners) {
      listener(eventName, payload)
    }
  }

  static parse(data: string): Level {
    const symbols = ' #.o$XGP';
    let position = null;
    const map = data.replace(/\/\/.\n/g, '')
      .trim()
      .split(/[\n,]/)
      .map((row, rowIndex) => row.trim().split('').map((col, colIndex) => {
        const thing = symbols.indexOf(col);
        if (thing === Field.PLAYER) {
          position = {
            x: colIndex,
            y: rowIndex
          };
          return Field.EMPTY;
        }
        return thing;
      })
    );

    return new Level(
      map,
      position
    );
  }

  private countGems() {
    let numGems = 0;
    const {width, height} = this.dimensions;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (this.getField(x, y) === Field.GEM) {
          numGems += 1;
        }
      }
    }
    return numGems;
  }

  move(xr: number, yr: number) {
    const { playerPosition } = this;

    if (Math.abs(xr) + Math.abs(yr) > 1) {
      throw new Error('no diagonal moves');
    }

    if (this.playerAlive === false || playerPosition === null) {
      throw new Error('game over');
    }

    const newPos = {
      x: playerPosition.x + xr,
      y: playerPosition.y + yr,
    };

    if (xr === 1) {
      this.playerDirection = Direction.RIGHT;
    }

    if (xr === -1) {
      this.playerDirection = Direction.LEFT;
    }

    const field = this.getField(newPos.x, newPos.y);

    if (field === Field.STONE && yr === 0) {
      const nextField = this.getField(newPos.x + xr, newPos.y);
      if (nextField === Field.EMPTY) {
        this.setField(newPos.x, newPos.y, Field.EMPTY);
        this.setField(newPos.x + xr, newPos.y, Field.STONE);
        playerPosition.x = newPos.x;
        playerPosition.y = newPos.y;
        this.notify('push');
      }
    }

    if (field === Field.GEM) {
      this.collectedGems += 1;
      this.notify('gem');
    }

    if (field === Field.EMPTY || field === Field.SAND || field === Field.GEM) {
      this.setField(newPos.x, newPos.y, 0);
      playerPosition.x = newPos.x;
      playerPosition.y = newPos.y;
    }
  }

  getField(x: number, y: number) {
    const { level } = this;
    const yMax = level.length - 1;
    const row = y >= 0 && y <= yMax ? level[y] : undefined;
    const field = row instanceof Array ? row[x] : undefined;
    return typeof field === "number" ? field : Field.WALL;
  }

  setField(x: number, y: number, value: Field) {
    if (y >= 0 && y < this.dimensions.height && x >= 0 && x < this.dimensions.width) {
      const field = this.level[y][x];
      if (typeof field !== 'undefined') {
        this.level[y][x] = value;
      }
    }
  }

  getFlag(x: number, y: number) {
    const { flags } = this;
    const yMax = flags.length - 1;
    const row = y >= 0 && y <= yMax ? flags[y] : undefined;
    const flag = row instanceof Array ? row[x] : undefined;
    return typeof flag === "number" ? flag : Flag.NONE;
  }

  setFlag(x: number, y: number, value: Flag) {
    if (y >= 0 && y < this.dimensions.height && x >= 0 && x < this.dimensions.width) {
      const field = this.level[y][x];
      if (typeof field !== 'undefined') {
        this.flags[y][x] = value;
      }
    }
  }

  stoneFall() {
    if (this.playerPosition !== null && this.playerAlive) {
      if (this.getField(this.playerPosition.x, this.playerPosition.y) === Field.EMPTY) {
        this.setField(this.playerPosition.x, this.playerPosition.y, Field.PLAYER);
      }
    }

    for (let y = this.dimensions.height; y >= 0; y--) {
      for (let x = 0; x < this.dimensions.width; x++) {
        const field = this.getField(x, y);
        const flag = this.getFlag(x, y);
        const below = this.getField(x, y + 1);
        if (field !== Field.STONE && field !== Field.GEM) {
          continue;
        }
        if (below === Field.EMPTY) {
          this.setField(x, y + 1, field);
          this.setField(x, y, Field.EMPTY);
          this.setFlag(x, y, Flag.NONE);
          this.setFlag(x, y + 1, Flag.FALLING);
          continue;
        }

        if (below === Field.PLAYER && flag === Flag.FALLING) {
          this.setField(x, y + 1, field);
          this.setField(x, y, Field.EMPTY);
          this.setFlag(x, y, Flag.NONE);
          this.setFlag(x, y + 1, Flag.FALLING);

          this.setField(x - 1, y - 1, Field.GEM);
          this.setField(x    , y - 1, Field.GEM);
          this.setField(x + 1, y - 1, Field.GEM);
          this.setField(x - 1, y, Field.GEM);
          this.setField(x + 1, y, Field.GEM);
          this.setField(x - 1, y + 1, Field.GEM);
          this.setField(x    , y + 1, Field.GEM);
          this.setField(x + 1, y + 1, Field.GEM);

          this.playerAlive = false;
          this.notify('gameover');
          continue;
        }

        if (below === Field.GEM || below === Field.STONE) {
          const right = this.getField(x + 1, y);
          const rightBelow = this.getField(x + 1, y + 1);
          if (right === Field.EMPTY && rightBelow === Field.EMPTY) {
            this.setField(x + 1, y, field);
            this.setField(x, y, Field.EMPTY);
            this.setFlag(x, y, Flag.NONE);
            this.setFlag(x + 1, y, Flag.FALLING);
            continue;
          }
          const left = this.getField(x - 1, y);
          const leftBelow = this.getField(x - 1, y + 1);
          if (left === Field.EMPTY && leftBelow === Field.EMPTY) {
            this.setField(x - 1, y, field);
            this.setField(x, y, Field.EMPTY);
            this.setFlag(x, y, Flag.NONE);
            this.setFlag(x - 1, y, Flag.FALLING);
            continue;
          }
        }
        if (flag === Flag.FALLING) {
          this.notify('ground');
          this.setFlag(x, y, Flag.NONE);
        }

      }
    }

    if (this.playerPosition !== null && this.playerAlive) {
      if (this.getField(this.playerPosition.x, this.playerPosition.y) === Field.PLAYER) {
        this.setField(this.playerPosition.x, this.playerPosition.y, Field.EMPTY);
      }
    }
  }
}
