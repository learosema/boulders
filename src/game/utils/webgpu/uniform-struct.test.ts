import { UniformStruct } from "./uniform-struct";

describe('UniformStruct', () => {

  it('should create an empty buffer and data structure by default', () => {
    const us = new UniformStruct();

    expect(us.buffer).toBeInstanceOf(ArrayBuffer);
    expect(us.buffer.byteLength).toBe(0);

    expect(us.data).toStrictEqual({});
  });

  it('should hold numeric data in the buffer',() => {
    const us = new UniformStruct();
    us.data.vector = [1,2,3];

    expect(us.buffer).toStrictEqual(Float32Array.from([1, 2, 3]).buffer);
    expect(us.buffer.byteLength).toEqual(3 * 4);
  });

  it('should be able to initialize a data structure in the constructor', () => {
    const us = new UniformStruct({
      aVector: [1,2,3],
      roughlyPi: 22 / 7,
      aNumber: 4,
    });

    expect(us.buffer).toStrictEqual(
      Float32Array.from([1,2,3, 22 / 7, 4]).buffer
    );
    expect(us.buffer.byteLength).toEqual(5 * 4);
  });

  it('should be able to modify data inside the structure', () => {
    const us = new UniformStruct({
      arbitraryVector: [1,2,3],
      roughlyPi: 22 / 7,
      arbitraryNumber: 4
    });

    us.data.arbitraryNumber = 42;
    us.data.arbitraryVector = [4, 5, 6];

    expect(us.buffer).toStrictEqual(
      Float32Array.from([4, 5, 6, 22 / 7, 42]).buffer
    );
  });

  it('should be able to add properties inside the structure', () => {
    const us = new UniformStruct({
      arbitraryVector: [1,2,3],
      roughlyPi: 22 / 7,
      arbitraryNumber: 42
    });

    us.data.anotherNumber = 666;

    expect(us.buffer).toStrictEqual(
      Float32Array.from([1,2,3, 22 / 7, 42, 666]).buffer
    );
  });

  it('should be able to add int (i32) properties', () => {
    const us = new UniformStruct();
    us.data.intNumber = 42;
    expect(us.buffer).toStrictEqual(
      new Int32Array([42]).buffer
    );
  });


});
