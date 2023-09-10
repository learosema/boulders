import { IDisposable } from "../interfaces/idisposable";
import { IRenderer } from "../interfaces/irenderer";
import { Level, Position } from "../utils/level";
import { BufferGeometry } from "../utils/webgl/buffer-geometry";
import { TextureFilter, Texture } from "../utils/webgl/texture";

export class WebGLRenderer implements IRenderer {

  readonly geometry: BufferGeometry = {
    position: {
      data: new Float32Array([-1, -1, -1, 1, 1, -1, 1, -1, 1, 1, -1, 1]),
      recordSize: 2,
    }
  };

  buffer: Record<string, WebGLBuffer|null> = {};

  /**
   * tiles on the spritesheet are 16x16 pixels
   */
  get spriteSize() {
    return this.sprites.height;
  };

  /**
   * dimensions of the screen and zoom factor of the tiles.
   */
  dimensions = {width: 0, height: 0};

  /**
   * current pixel ratio
   */
  pixelRatio = 1;

  tileSize = 64;

  spriteTexture: Texture|null = null;

  gl: WebGLRenderingContext|null = null;
  program: WebGLProgram|null = null;

  constructor(
    public canvas: HTMLCanvasElement,
    public sprites: HTMLImageElement,
  ) {}

  async setup(): Promise<void> {
    this.gl = this.canvas.getContext('webgl');
    if (! this.gl) {
      throw new Error('webgl initialization failed.');
    }
    this.spriteTexture = new Texture(this.sprites);
    this.spriteTexture.upload(this.gl, 0);

  }

  frame(level: Level, levelPosition?: Position | undefined, offset?: Position | undefined): void {

  }

  setSize(): void {

  }

  dispose() {}

  private createBuffers() {
    if (! this.gl) {
      throw new Error('context not initialized');
    }
    const { gl } = this;
    for (const [name, attrib] of Object.entries(this.geometry)) {
      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, attrib.data, gl.STATIC_DRAW);
      this.buffer[name] = buffer;
    }
  }

  private enableBuffers() {
    const { program, gl } = this;
    if (! gl) {
      throw new Error('context not initialized');
    }
    if (! program) {
      throw new Error('program not initialized')
    }
    for (const [name, attrib] of Object.entries(this.geometry)) {
      attrib.location = gl.getAttribLocation(program, name);
      gl.enableVertexAttribArray(attrib.location);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer[name]);
      gl.vertexAttribPointer(attrib.location, attrib.recordSize, gl.FLOAT, false, 0, 0);
    }
  }


}
