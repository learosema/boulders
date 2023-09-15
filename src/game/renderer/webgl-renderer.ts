import { IDisposable } from "../interfaces/idisposable";
import { IRenderer } from "../interfaces/irenderer";
import { Direction, Level, Position } from "../utils/level";
import { BufferGeometry } from "../utils/webgl/buffer-geometry";
import { TextureFilter, Texture } from "../utils/webgl/texture";
import vertexShader from './webgl-shaders/vert.glsl';
import fragmentShader from './webgl-shaders/frag.glsl';
import { createProgram } from "../utils/webgl/shader";
import { pixelRatio } from "../utils/pixel-ratio";
import { clamp, oddly } from "../utils/num-utils";

export class WebGLRenderer implements IRenderer {

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

  buffer: Record<string, WebGLBuffer|null> = {};

  /**
   * tiles on the spritesheet are 16x16 pixels
   */
  get spriteSize() {
    return [this.sprites.width, this.sprites.height];
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

  levelTexture: Texture|null = null;

  gl: WebGLRenderingContext|null = null;
  program: WebGLProgram|null = null;
  levelImageData: ImageData|null = null;

  uniforms: Record<string, any> = {}

  constructor(
    public canvas: HTMLCanvasElement,
    public sprites: HTMLImageElement,
    public level: Level
  ) {}

  async setup(): Promise<void> {
    this.gl = this.canvas.getContext('webgl');
    if (! this.gl) {
      throw new Error('webgl initialization failed.');
    }
    this.spriteTexture = new Texture(this.sprites);
    this.uniforms.spriteTexture = this.spriteTexture;
    this.spriteTexture.upload(this.gl, 0);
    this.createBuffers();
    this.program = createProgram(this.gl, vertexShader, fragmentShader);
    this.gl.useProgram(this.program);
    this.enableBuffers();
  }

  frame(levelPosition?: Position | undefined, offset?: Position | undefined): void {
    const { gl, level } = this;
    if (! gl || !level) {
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

    this.setLevelTexture(level);
    this.uniforms.levelPosition = [levelPosition.x, levelPosition.y];
    this.uniforms.offset = [offset?.x * pixelRatio, offset?.y * pixelRatio];
    this.uniforms.numTiles = [numTilesX, numTilesY];
    this.uniforms.tileSize = tileSize * pixelRatio;
    this.uniforms.resolution = [width, height];
    this.uniforms.levelSize = [level.dimensions.width, level.dimensions.height];
    this.uniforms.spriteSize = spriteSize;
    this.uniforms.playerAlive = level.playerAlive;
    this.uniforms.playerPosition = [playerPosition?.x || 0, playerPosition?.y || 0];
    this.uniforms.playerDirection = level.playerDirection === Direction.RIGHT ? 1 : 0;
    this.uniforms.time = performance.now();
    this.setUniforms();
    gl.drawArrays(WebGLRenderingContext.TRIANGLES, 0, 6);
  }

  setSize() {
    const { gl, canvas } = this;
    if (! gl || !canvas) {
      throw new Error('Canvas not initialized.');
    }
    this.pixelRatio = pixelRatio();
    const width = this.canvas.clientWidth * this.pixelRatio;
    const height = this.canvas.clientHeight * this.pixelRatio;
    this.dimensions = {
      width,
      height,
    };
    Object.assign(canvas, this.dimensions);
    gl.viewport(0, 0, width, height);
    const viewportMin = Math.min(this.canvas.clientWidth, this.canvas.clientHeight);

    // try to display at least 10x10 tiles on screen, show more on desktops, don't shrink sprites below 16x16
    // and please let's use integer pixels.
    this.tileSize = Math.floor(clamp(Math.round(viewportMin / 10), 16, 64));
  }

  dispose() {
    this.uniforms = {};
    this.spriteTexture?.dispose();
    this.levelTexture?.dispose();
    this.spriteTexture = null;
    this.levelTexture = null;
    this.levelImageData = null;
    this.deleteBuffers();
  }

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

  private deleteBuffers() {
    if (! this.gl) {
      return;
    }
    const { gl } = this;
    for (const [name, attrib] of Object.entries(this.geometry)) {
      if (typeof attrib.location !== 'undefined') {
        gl.disableVertexAttribArray(attrib.location);
      }
      gl.bindBuffer(gl.ARRAY_BUFFER, null);
      gl.deleteBuffer(this.buffer[name]);
    }
  }

  private setLevelTexture(level: Level): void {
    if (!this.gl) {
      throw new Error('context not initialized');
    }
    const sizeChanged = !this.levelImageData ||
      this.levelImageData.width !== level.dimensions.width ||
      this.levelImageData.height !== level.dimensions.height;

    if (!this.levelImageData || sizeChanged) {
      this.levelImageData = new ImageData(level.dimensions.width, level.dimensions.height);
    }
    for (let y = 0; y < level.dimensions.height; y++) {
      for (let x = 0; x < level.dimensions.width; x++) {
        this.levelImageData.data[(y * level.dimensions.width + x) * 4] = level.getField(x, y);
      }
    }
    if (!this.levelTexture || sizeChanged) {
      if (this.levelTexture) {
        this.levelTexture.dispose();
      }
      this.levelTexture = new Texture(this.levelImageData);
      this.levelTexture.upload(this.gl, 1);
    } else {
      this.levelTexture.update();
    }
    this.uniforms.levelTexture = this.levelTexture;
  }

  private setUniforms(): void {
    const { gl, program } = this;
    if (!gl || !program) {
      throw new Error('context not initialized');
    }

    for (const [key, val] of Object.entries(this.uniforms)) {
      const loc = gl.getUniformLocation(program, key);
      if (typeof val === 'boolean') {
        gl.uniform1i(loc, val ? 1 : 0);
      }
      if (typeof val === 'number') {
        if (key.startsWith('int')) {
          gl.uniform1i(loc, val);
          continue;
        }
        gl.uniform1f(loc, val);
      }
      if (val instanceof Texture) {
        gl.uniform1i(loc, (val as Texture).textureIndex);
      }
      if (val instanceof Array && val.length === 2) {
        gl.uniform2fv(loc, val);
      }
      if (val instanceof Array && val.length === 3) {
        gl.uniform3fv(loc, val);
      }
    }
  }

}
