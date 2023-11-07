export type UniformStructData = Record<string, number|Iterable<number>>;

/**
 * UniformStruct provides a C-like "struct"
 * which is synchronized to an array buffer.
 */
export class UniformStruct {
  public buffer = new ArrayBuffer(0);
  public typedArrays: Record<string, Float32Array|Int32Array> = {}
  public data: UniformStructData;
  #internalData: Record<string, number|Iterable<number>> = {};

  constructor(initialData ?: UniformStructData) {
    this.#internalData = Object.assign({}, initialData || {});
    this.#createBuffer();
    const self = this;
    this.data = new Proxy<Record<string, number|Iterable<number>>>(
      this.#internalData, {
        set(target: Record<string, any>, key: string, value: any) {
          const result = Reflect.set(target, key, value);
          if (!self.typedArrays.hasOwnProperty(key)) {
            self.#createBuffer();
          } else {
            self.typedArrays[key].set(
              value instanceof Array ? value : [value]
            );
          }
          return result;
        }
    });
  }

  #createBuffer() {
    let pointer = 0;
    const offsets: Record<string, number> = {};
    for (const [key, val] of Object.entries(this.#internalData)) {
      const count = (val instanceof Array) ? val.length : 1;
      offsets[key] = pointer;
      const itemSize = 4;
      pointer += count * itemSize;
    }
    this.buffer = new ArrayBuffer(pointer);
    this.typedArrays = {};
    for (const [key, val] of (Object.entries(this.#internalData))) {
      const offset = offsets[key];
      const count = (val instanceof Array) ? val.length : 1;
      const typedArray = key.startsWith('int') ?
        new Int32Array(this.buffer, offset, count) :
        new Float32Array(this.buffer, offset, count);
      typedArray.set(val instanceof Array ? val: [val]);
      this.typedArrays[key] = typedArray;
    }
  }
}
