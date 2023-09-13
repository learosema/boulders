import { IRenderer } from "../interfaces/irenderer";
import { Level, Position } from "../utils/level";
import { BufferGeometry } from "../utils/webgl/buffer-geometry";
import { textureFromImg } from "../utils/webgpu/texture";

export class WebGPURenderer implements IRenderer {

  readonly geometry: BufferGeometry = {
    position: {
      data: new Float32Array([-1, -1, -1, 1, 1, -1, 1, -1, 1, 1, -1, 1]),
      recordSize: 2,
    },
    uv: {
      data: new Float32Array([ 0,  1,  0, 0, 1,  1, 1,  1, 1, 0,  0, 0]),
      recordSize: 2,
    }
  };

  // to prevent shader errors make sure keys are sorted
  uniforms = {
    levelPosition: [0,0],
    levelSize: [0,0],
    numTiles: [0,0],
    offset: [0,0],
    playerAlive: 0,
    playerDirection: 0,
    playerPosition: [0, 0],
    resolution: [0,0],
    spriteSize: [0,0],
    tileSize: 0,
    time: 0,
  }

  uniformValues: Float32Array|null = null;
  uniformBuffer: GPUBuffer|null = null;
  uniformOffsets: Record<string, number> = {};

  adapter: GPUAdapter|null = null;
  device: GPUDevice|null = null;
  buffers: Record<string, GPUBuffer> = {};
  spriteTexture: GPUTexture|null = null;
  sampler: GPUSampler|null = null;

  context: GPUCanvasContext|null = null;

  constructor(
    public canvas: HTMLCanvasElement,
    public sprites: HTMLImageElement,
  ) {}

  async setup(): Promise<void> {
    this.adapter = await navigator.gpu?.requestAdapter();
    if (! this.adapter) {
      throw new Error('WebGPU unsupported.');
    }
    this.device = await this.adapter.requestDevice();
    this.context = this.canvas.getContext("webgpu");
    if (! this.context || !this.device) {
      throw new Error('WebGPU context init failed.');
    }
    this.context.configure({
      device: this.device,
      format: navigator.gpu.getPreferredCanvasFormat(),
    });
    this.createBuffers();
    this.spriteTexture = await textureFromImg(this.device, this.sprites);
    this.sampler = this.device.createSampler({
      minFilter: 'nearest',
      magFilter: 'nearest',
    })
  }

  frame(level: Level, levelPosition?: Position | undefined, offset?: Position | undefined): void {

  }

  setSize(): void {
    throw new Error("Method not implemented.");
  }

  dispose(): void {

  }

  private createBuffers(): void {
    const { device } = this;
    if(!device) {
      throw Error('no device');
    }
    for (const [key, val] of Object.entries(this.geometry)) {
      const vertexBuffer = device.createBuffer({
        label: key,
        size: val.data.byteLength,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
      });

      device.queue.writeBuffer(vertexBuffer, /*bufferOffset=*/0, val.data);
      this.buffers[key] = vertexBuffer;
    }
  }


  private initUniforms(): void {
    const { device } = this;
    if (! device) {
      throw new Error('no device')
    }
    let size = 0;
    const sortedKeys = Object.keys(this.uniforms).sort();
    for (const [key, val] of Object.entries(this.uniforms)) {
      const itemSize = (val instanceof Array) ? val.length : 1;
      this.uniformOffsets[key] = size;
      size += itemSize;
    }
    this.uniformValues = new Float32Array(size);
    this.uniformBuffer = device.createBuffer({
      size: size * 4,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    this.setUniforms();
  }

  private setUniforms(): void {
    const { device } = this;
    if (! device) {
      throw new Error('no device')
    }
    if (! this.uniformBuffer || !this.uniformValues || !this.uniformOffsets) {
      throw new Error('call initUniforms first');
    }
    for (const [key, val] of Object.entries(this.uniforms)) {
      const offset = this.uniformOffsets[key];
      if (typeof offset === 'undefined') {
        continue;
      }
      this.uniformValues.set(val instanceof Array ? val: [val], offset);
    }
    // copy the values from JavaScript to the GPU
    device.queue.writeBuffer(this.uniformBuffer, 0, this.uniformValues);
  }



}
