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

  it('should set the initial player position', () => {
    const level = Level.parse(`
      ###
      #P#
      ###
    `);
    expect(level.playerPosition).toEqual({x:1, y:1});
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

  it('should provide a move method for moving the player', () => {
    const level = Level.parse(`
      #####
      #P .#
      #####
    `);

    level.move(1, 0);
    expect(level.playerPosition).toEqual({x: 2, y: 1});
  });

  it('should be possible to move onto a sand field via move()', () => {
    const level = Level.parse(`
      #####
      # P.#
      #####
    `);

    level.move(1, 0);
    expect(level.playerPosition).toEqual({x: 3, y: 1});
  });

  it('should not be possible to move onto a wall field via move()', () => {
    const level = Level.parse(`
      #####
      #  P#
      #####
    `);

    level.move(1, 0);
    expect(level.playerPosition).toEqual({x: 3, y: 1});
  });

  it('should not be possible to move diagonally via move()', () => {
    const level = Level.parse(`
      #####
      # P #
      #   #
      #####
    `);
    expect(() => level.move(1, 1)).toThrow();
    expect(level.playerPosition).toEqual({x: 3, y: 1});
  });
});
