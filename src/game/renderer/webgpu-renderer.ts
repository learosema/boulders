import { IRenderer } from "../interfaces/irenderer";
import { Dimension, Direction, Level, Position } from "../utils/level";
import { clamp, oddly } from "../utils/num-utils";
import { pixelRatio } from "../utils/pixel-ratio";
import { BufferGeometry } from "../utils/webgl/buffer-geometry";
import { textureFromURL } from "../utils/webgpu/texture";
import { UniformStruct } from "../utils/webgpu/uniform-struct";
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
      location: 0,
    },
    uv: {
      data: new Float32Array([ 0,  1,  0, 0, 1,  1, 1,  1, 1, 0,  0, 0]),
      recordSize: 2,
      location: 1,
    }
  };

  // to prevent shader errors make sure keys are sorted
  uniformStruct = new UniformStruct({
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
  })

  dimensions: Dimension = {
    width: 0,
    height: 0
  };

  /**
   * current pixel ratio
   */
  pixelRatio = 1;

  tileSize = 64;

  uniformBuffer: GPUBuffer|null = null;

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
    this.setSize();
    this.createShaderModule();
    this.createVertexBuffers();
    this.createStorageBuffer();
    this.setStorageBuffer();
    this.initUniforms();
    this.spriteTexture = await textureFromURL(this.device, this.sprites.src);
    this.sampler = this.device.createSampler({
      minFilter: 'nearest',
      magFilter: 'nearest',
    });

    this.createPipeline();
    this.createBindGroup();
  }

  frame(levelPosition?: Position | undefined, offset?: Position | undefined): void {
    const { context, level, device, pipeline, buffers, bindGroup } = this;
    if (! context || !level || !device || !pipeline || !buffers || !bindGroup) {
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
    this.setStorageBuffer();
    Object.assign(this.uniformStruct.data, {
      levelPosition: [levelPosition.x, levelPosition.y],
      levelSize: [this.level.dimensions.width, this.level.dimensions.height],
      numTiles: [numTilesX, numTilesY],
      offset: [offset.x, offset.y],
      playerAlive: this.level.playerAlive ? 1 : 0,
      playerPosition: [playerPosition?.x || 0, playerPosition?.y || 0],
      playerDirection: this.level.playerDirection === Direction.LEFT ? 1 : 0,
      resolution: [this.dimensions.width, this.dimensions.height],
      spriteSize: this.spriteSize,
      tileSize: this.tileSize,
      time: performance.now(),
    });

    this.setUniforms();

    const encoder = device.createCommandEncoder();
    const pass = encoder.beginRenderPass({
      colorAttachments: [{
        view: context.getCurrentTexture().createView(),
        loadOp: "clear",
        clearValue: [0, 0, 0.5, 1],
        storeOp: "store",
      }],
    });


    pass.setPipeline(pipeline);
    pass.setBindGroup(0, bindGroup);
    for (const [key, val] of Object.entries(this.geometry)) {
      const vertexBuffer = buffers[key];
      pass.setVertexBuffer(val.location!, vertexBuffer);
    }
    pass.draw(
      this.geometry.position.data.length / this.geometry.position.recordSize
    );
    pass.end();
    device.queue.submit([encoder.finish()]);
  }

  setSize(): void {
    const {device} = this;
    if (! device) {
      return;
    }
    this.pixelRatio = 1;

    Object.assign(this.dimensions, {
      width: clamp(this.canvas.clientWidth * this.pixelRatio, 1,
        device.limits.maxTextureDimension2D),
      height: clamp(this.canvas.clientHeight * this.pixelRatio, 1,
        device.limits.maxTextureDimension2D),
    });

    const viewportMin = Math.min(this.canvas.clientWidth, this.canvas.clientHeight);

    // display at least 10x10 tiles on screen.
    this.tileSize = Math.min(64, Math.round(viewportMin / 10)) * this.pixelRatio;

    Object.assign(this.canvas, this.dimensions);
  }

  dispose(): void {
    // destroy all buffers and textures we created
    for (const [key, val] of Object.entries(this.buffers)) {
      val.destroy();
    }
    this.uniformBuffer?.destroy();
    this.levelStorage?.destroy();
    this.spriteTexture?.destroy();
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
      usage:
        GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    })
  }

  private setStorageBuffer(): void {
    const { device, level } = this;
    if (! device) {
      throw new Error('no device')
    }

    const levelFlat = level.level.flat();
    if (!this.levelArray || !this.levelStorage) {
        console.log('möö.')
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
    this.uniformBuffer = device.createBuffer({
      size: this.uniformStruct.buffer.byteLength,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    this.setUniforms();
  }

  private setUniforms(): void {
    const { device } = this;
    if (! device) {
      throw new Error('no device');
    }
    if (! this.uniformBuffer) {
      throw new Error('call initUniforms first');
    }
    // copy the values from JavaScript to the GPU
    device.queue.writeBuffer(this.uniformBuffer, 0, this.uniformStruct.buffer);
  }

  private createPipeline() {
    const { device } = this;
    if (! device) {
      throw new Error('no device');
    }
    if (! this.shaderModule) {
      throw new Error('no shader module');
    }

    const pipelineLayout = device.createPipelineLayout({
      bindGroupLayouts: [
        this.createBindGroupLayout(), // @group(0)
      ]
    });

    this.pipeline = device.createRenderPipeline({
      label: 'Level Render Pipeline',
      layout: pipelineLayout,
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

  private createBindGroupLayout(): GPUBindGroupLayout {
    const { device } = this;
    if (! device) {
      throw new Error('no device');
    }
    const bindGroupLayout = device.createBindGroupLayout({
      entries: [{
        binding: 0, // uniforms
        visibility: GPUShaderStage.FRAGMENT,
        buffer: {},
      }, {
        binding: 1, // level storage
        visibility: GPUShaderStage.FRAGMENT,
        buffer: {
          type: 'read-only-storage',
        },
      }, {
        binding: 2, // sprite texture
        visibility: GPUShaderStage.FRAGMENT,
        texture: {
          sampleType: 'float',
          multisampled: false,
          viewDimension: '2d',
        },
      }, {
        binding: 3, // sampler
        visibility: GPUShaderStage.FRAGMENT,
        sampler: {
          type: 'filtering',
        },
      }]
    });
    return bindGroupLayout;
  }

  private createBindGroup(): void {
    const { device, pipeline, uniformBuffer, levelStorage, spriteTexture, sampler } = this;
    if (!device || !pipeline || !uniformBuffer || !levelStorage || !spriteTexture || !sampler) {
      throw new Error('not initialized');
    }
    this.bindGroup = device.createBindGroup({
      label: "My Bind Group",
      layout: this.pipeline!.getBindGroupLayout(0),
      entries: [{
        binding: 0,
        resource: { buffer: uniformBuffer }
      }, {
        binding: 1,
        resource: { buffer: levelStorage }
      }, {
        binding: 2,
        resource: this.spriteTexture!.createView(),
      }, {
        binding: 3,
        resource: this.sampler!
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
