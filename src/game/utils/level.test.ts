import { Direction, Field, Flag, GHOST_DIR, Level } from "./level";

describe('Level class', () => {

  it('should be able to create a zero-dimension Level', () => {
    expect(() => new Level([], null)).not.toThrow();
  });

  it('should return dimension 0 for a zero-dimension level', () => {
    const level = new Level([], null);
    expect(level.dimensions).toEqual({width: 0, height: 0});
  });

  it('can parse text and then creates a level from it', () => {
    const level = Level.parse(`
      #######
      #..$..#
      #.P.GX#
      #######
    `);
    expect(level.dimensions).toEqual({width: 7, height: 4});
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
    expect(level.playerPosition).toEqual({x: 2, y: 1});
  });

  it('shoud set the playerDirection to Direction.LEFT when moving left', () => {
    const level = Level.parse(`
      #####
      #  P#
      #####
    `);

    level.move(-1, 0);
    expect(level.playerDirection).toEqual(Direction.LEFT);
  });

  it('should set the playerDirection to Direction.RIGHT when moving right', () => {
    const level = Level.parse(`
      #####
      #P  #
      #####
    `);
    level.playerDirection = Direction.LEFT;

    level.move(1, 0);
    expect(level.playerDirection).toEqual(Direction.RIGHT);
  });

  it('should move a stone to the right when moving right and there is empty space.', () => {
    const level = Level.parse(`
      #####
      #Po #
      #####
    `);

    level.move(1, 0);
    expect(level.playerPosition).toEqual({x:2, y: 1});
    expect(level.getField(3,1)).toEqual(Field.STONE);
  });

  it('should count up the collectedGems property when a gem is collected via move() and notify subscribers about it', () => {
    const level = Level.parse(`
      ####
      #P$#
      ####
    `);
    const spy = jest.fn();
    level.subscribe(spy);

    level.move(1, 0);
    expect(level.collectedGems).toEqual(1);
    expect(spy).toHaveBeenCalledWith('gem', undefined);
  });

  it('should notify subscribers about the game was won when the player moves to the exit and no gems are left', () => {
    const level = Level.parse(`
      #####
      #PX #
      #####
    `);
    const spy = jest.fn();
    level.subscribe(spy);

    level.move(1, 0);
    expect(spy).toHaveBeenCalledWith('won', undefined);
  });

  it('should not notify subscribers about the game was won when the player moves to the exit but gems are left', () => {
    const level = Level.parse(`
      #####
      #PX$#
      #####
    `);
    const spy = jest.fn();
    level.subscribe(spy);

    level.move(1, 0);
    expect(spy).not.toHaveBeenCalledWith('won', undefined);
  });


  it('should throw an Error when trying to move but the player is not alive', () => {
    const level = Level.parse(`
      ####
      #P #
      ####
    `);
    level.playerAlive = false;

    expect(() => level.move(1, 0)).toThrow();
  });

  it('should process stones falling down', () => {
    const level = Level.parse(`
      ####
      #Po#
      #. #
      ####
    `);

    level.stoneFall();

    // expect the stone to have moved one field down
    expect(level.getField(2, 1)).toEqual(Field.EMPTY);
    expect(level.getField(2, 2)).toEqual(Field.STONE);

    // expect the stone to have the FALLING flag set
    expect(level.getFlags(2,2)).toBe(Flag.FALLING);
  });

  it('should notify subscribers when a falling stone hits the ground', () => {
    const level = Level.parse(`
      ####
      #P #
      #.o#
      ####
    `);
    level.setFlag(2, 2, Flag.FALLING);
    const spy = jest.fn();
    level.subscribe(spy);

    level.stoneFall();

    // as the falling stone has hit the ground
    // the falling flag is expected to be cleared.
    expect(level.getFlags(2,2)).toBe(Flag.NONE);
    expect(spy).toHaveBeenCalledWith('ground', undefined);
  });

  it('should kill the player when a stone falls down on them', () => {
    const level = Level.parse(`
      ###
      #o#
      # #
      #P#
      ###
    `);
    const spy = jest.fn();
    level.subscribe(spy);

    level.stoneFall();
    level.stoneFall();

    expect(level.playerAlive).toBe(false);
  });

  it('should not kill the player when they move on a sand field under a stone', () => {
    const level = Level.parse(`
      ####
      # o#
      #P.#
      ####
    `);
    const spy = jest.fn();
    level.subscribe(spy);

    level.move(1, 0);
    level.stoneFall();

    expect(level.playerAlive).toBe(true);
  });

  it('should move a stone to the right when there is a stone or gem below', () => {
    const level = Level.parse(`
      ######
      #P o #
      #  o #
      ######
    `);

    level.stoneFall();

    expect(level.getField(3, 1)).toBe(Field.EMPTY);
    expect(level.getField(4, 1)).toBe(Field.STONE);
    expect(level.getFlags(3, 1)).toBe(Flag.NONE);
    expect(level.getFlags(4, 1)).toBe(Flag.FALLING);
  });

  it('should move a stone to the left when there is a stone or gem below but the right side is blocked', () => {
    const level = Level.parse(`
      ######
      #P o #
      #  oo#
      ######
    `);

    level.stoneFall();
    expect(level.getField(3, 1)).toBe(Field.EMPTY);
    expect(level.getField(2, 1)).toBe(Field.STONE);

    expect(level.getFlags(3, 1)).toBe(Flag.NONE);
    expect(level.getFlags(2, 1)).toBe(Flag.FALLING);
  });

  it('should move a ghost in the direction it is facing', () => {
    const level = Level.parse(`
      ####
      #P #
      # G#
      ####
    `);
    level.setFlag(2, 2, GHOST_DIR.LEFT);
    level.moveGhosts();

    expect(level.getField(1, 2)).toEqual(Field.GHOST);
    expect(level.getField(2, 2)).toEqual(Field.EMPTY);
  });
});
