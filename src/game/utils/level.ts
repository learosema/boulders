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

export class Level {

  constructor(
    public level: Field[][] = [],
    public playerPosition: Position|null,
  ) {}

  playerDirection = Direction.RIGHT;

  playerAlive = true;

  static parse(data: string): Level {
    const symbols = ' #.o$XGP';
    let position = null;
    const map = data.replace(/\/\/.\n/g, '')
      .trim()
      .split(/[\n,]/)
      .map((row, rowIndex) => row.split('').map((col, colIndex) => {
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

  getField(x: number, y: number) {
    const { level } = this;
    const yMax = level.length - 1;
    const row = y >= 0 && y <= yMax ? level[y] : undefined;
    const field = row instanceof Array ? row[x] : undefined;
    return typeof field === "number" ? field : 1;
  }
}
