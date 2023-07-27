export enum Field {
  EMPTY = 0,
  WALL = 1,
  STONE = 2,
  GEM = 3,
  EXIT = 4,
  GHOST = 5,
  PLAYER = 6,
};

export class Level {
    
  constructor(public level: Field[][] = []) {}

  static parse(data: string): Level {
    const symbols = ' #.o$XGP';
    return new Level(
      data.replace(/\/\/.\n/g, '')
        .trim()
        .split(/[\n,]/)
        .map((row) => row.split('').map((col) => symbols.indexOf(col)))
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
