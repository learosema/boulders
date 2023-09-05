import { Field, Level } from "./level";

describe('Level class', () => {

  it('can parse text and then creates a level from it', () => {
    const level = Level.parse(`
      #######
      #..$..#
      #.P.GX#
      #######
    `);
    expect(level.level).toStrictEqual([
      [Field.WALL, Field.WALL, Field.WALL, Field.WALL, Field.WALL, Field.WALL, Field.WALL,],
      [Field.WALL, Field.SAND, Field.SAND, Field.GEM, Field.SAND, Field.SAND, Field.WALL,],
      [Field.WALL, Field.SAND, Field.EMPTY, Field.SAND, Field.GHOST, Field.EXIT, Field.WALL,],
      [Field.WALL, Field.WALL, Field.WALL, Field.WALL, Field.WALL, Field.WALL, Field.WALL,],
    ])
  });

  it('can retrieve a field at a given position', () => {
    const level = Level.parse(`
      ##$
      #P#
      ###
    `);
    expect(level.getField(2,0)).toEqual(Field.GEM);
  });

  it('can retrieve a fields that are out of bounds, returning `WALL`', () => {
    const level = Level.parse(`
      ###
      #P#
      ###
    `);
    expect(level.getField(3, 0)).toEqual(Field.WALL);
    expect(level.getField(-1, 0)).toEqual(Field.WALL);
    expect(level.getField(0, -1)).toEqual(Field.WALL);
    expect(level.getField(0, 3)).toEqual(Field.WALL);
    expect(level.getField(-1, -1)).toEqual(Field.WALL);
    expect(level.getField(3, 3)).toEqual(Field.WALL);
  });

  it('should be able to modify a field at a given position', () => {
    const level = Level.parse(`
      ###
      #P#
      ###
    `);

    level.setField(0,2, Field.SAND);
    expect(level.getField(0,2)).toEqual(Field.SAND);
  });
});
