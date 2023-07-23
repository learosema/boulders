export class Level {
    
  constructor(public level: number[][] = []) {}

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
