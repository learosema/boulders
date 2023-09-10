export type BufferGeometry = Record<string, BufferAttribute>;

export type BufferAttribute<T = Float32Array> = {
  data: T;
  recordSize: number;
  location?: number;
}
