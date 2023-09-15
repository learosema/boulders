import { IRenderer } from "../interfaces/irenderer";
import { Level, Position } from "../utils/level";
import { oddly } from "../utils/num-utils";
import { pixelRatio } from "../utils/pixel-ratio";
import { BufferGeometry } from "../utils/webgl/buffer-geometry";
import { textureFromImg } from "../utils/webgpu/texture";
import wgslShader from './webgpu-shaders/game-field.wgsl';

export class WebGPURenderer implements IRenderer {

  /**
   * tiles on the spritesheet are 16x16 pixels
   */
  get spriteSize() {
    return [this.sprites.width, this.sprites.height];
  };

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

  dimensions = {width: 0, height: 0};

  /**
   * current pixel ratio
   */
  pixelRatio = 1;

  tileSize = 64;

  uniformValues: Float32Array|null = null;
  uniformBuffer: GPUBuffer|null = null;
  uniformOffsets: Record<string, number> = {};

  adapter: GPUAdapter|null = null;
  device: GPUDevice|null = null;
  buffers: Record<string, GPUBuffer> = {};
  spriteTexture: GPUTexture|null = null;
  sampler: GPUSampler|null = null;

  context: GPUCanvasContext|null = null;
  levelArray: Uint32Array|null = null;
  vertexBufferLayout: GPUVertexBufferLayout[] = [];
  levelStorage: GPUBuffer|null = null;
  pipeline: GPURenderPipeline|null = null;
  canvasFormat: GPUTextureFormat|null = null;
  shaderModule: GPUShaderModule|null = null;
  bindGroup: GPUBindGroup|null = null;

  constructor(
    public canvas: HTMLCanvasElement,
    public sprites: HTMLImageElement,
    public level: Level,
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
    this.canvasFormat = navigator.gpu.getPreferredCanvasFormat();
    this.context.configure({
      device: this.device,
      format: this.canvasFormat,
    });
    this.createVertexBuffers();
    this.createStorageBuffer();
    this.spriteTexture = await textureFromImg(this.device, this.sprites);
    this.sampler = this.device.createSampler({
      minFilter: 'nearest',
      magFilter: 'nearest',
    });
    this.createShaderModule();

  }

  frame(levelPosition?: Position | undefined, offset?: Position | undefined): void {
    const { context, level } = this;
    if (! context || !level) {
      return;
    }

    // number of tiles that fit into the screen
    const { width, height } = this.dimensions;
    const { tileSize, pixelRatio, spriteSize } = this;

    const numTilesX = oddly(1 + Math.round(width / (tileSize * pixelRatio)));
    const numTilesY = oddly(1 + Math.round(height / (tileSize * pixelRatio)));

    if (! offset) {
      offset = {
        x: -tileSize/2,
        y: -tileSize/2,
      };
    }

    const { playerPosition } = level;
    if (! levelPosition) {
      levelPosition = {
        x: (playerPosition?.x || 0) - Math.floor(numTilesX/2),
        y: (playerPosition?.y || 0) - Math.floor(numTilesY/2),
      }
    }
  }

  setSize(): void {
    this.pixelRatio = pixelRatio();
    this.dimensions = {
      width: this.canvas.clientWidth * this.pixelRatio,
      height: this.canvas.clientHeight * this.pixelRatio,
    };
    const viewportMin = Math.min(this.canvas.clientWidth, this.canvas.clientHeight);

    // display at least 10x10 tiles on screen.
    this.tileSize = Math.min(64, Math.round(viewportMin / 10));

    Object.assign(this.canvas, this.dimensions);
  }

  dispose(): void {

  }

  private createVertexBuffers(): void {
    const { device } = this;
    if(!device) {
      throw Error('no device');
    }
    this.vertexBufferLayout = [];
    for (const [key, val] of Object.entries(this.geometry)) {
      const vertexBuffer = device.createBuffer({
        label: key,
        size: val.data.byteLength,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
      });

      device.queue.writeBuffer(vertexBuffer, /*bufferOffset=*/0, val.data);
      this.buffers[key] = vertexBuffer;
      const recordSize = val.recordSize;
      const format = recordSize === 2 ? 'float32x2' :
        recordSize === 3 ? 'float32x3' : 'float32x4';
      const shaderLocation = this.vertexBufferLayout.length;
      this.vertexBufferLayout.push({
        arrayStride: 4 * recordSize,
        attributes: [{
          format,
          offset: 0,
          shaderLocation, // Position, see vertex shader
        }],
      });
    }
  }

  private createStorageBuffer() {
    const { device, level } = this;
    if (! device) {
      throw new Error('no device')
    }
    this.levelArray = new Uint32Array(
      level.dimensions.width *
      level.dimensions.height);
    this.levelStorage = device.createBuffer({
      label: "Level Data",
      size: this.levelArray.byteLength,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    })
  }

  private setStorageBuffer() {
    const { device, level } = this;
    if (! device) {
      throw new Error('no device')
    }
    const levelFlat = level.level.flat();
    if (!this.levelArray || !this.levelStorage ||
      !(this.levelArray.length !== levelFlat.length)) {
      this.createStorageBuffer();
    }
    if (!this.levelArray || !this.levelStorage) {
      throw new Error('storage initialization failed');
    }
    this.levelArray.set(levelFlat);
    device.queue.writeBuffer(this.levelStorage, 0, this.levelArray);
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

  private createPipeline() {
    const { device } = this;
    if (! device) {
      throw new Error('no device');
    }
    if (! this.shaderModule) {
      throw new Error('no shader module');
    }

    this.pipeline = device.createRenderPipeline({
      label: 'Level Render Pipeline',
      layout: 'auto',
      vertex: {
        module: this.shaderModule,
        entryPoint: 'vertexMain',
        buffers: this.vertexBufferLayout,
      },
      fragment: {
        module: this.shaderModule,
        entryPoint: 'fragmentMain',
        targets: [{
          format: this.canvasFormat!,
        }]
      }
    });
  }

  private createBindGroup(): void {
    const { device, pipeline, uniformBuffer, levelStorage } = this;
    if (!device || !pipeline || !uniformBuffer || !levelStorage) {
      throw new Error('not initialized');
    }
    this.bindGroup = device.createBindGroup({
      label: "Cell renderer bind group A",
      layout: this.pipeline!.getBindGroupLayout(0),
      entries: [{
        binding: 0,
        resource: { buffer: uniformBuffer }
      }, {
        binding: 1,
        resource: { buffer: levelStorage }
      }],
    });
  }


  private createShaderModule(): void {
    const { device } = this;
    if (! device) {
      throw new Error('no device');
    }
    this.shaderModule = device.createShaderModule({
      label: 'Game TileMap Shader',
      code: wgslShader
    })
  }

}
