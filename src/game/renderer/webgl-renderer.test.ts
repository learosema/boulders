import { Level } from "../utils/level";
import { WebGLRenderer } from "./webgl-renderer";

describe('WebGL Renderer', () => {
  let canvas: HTMLCanvasElement, sprites: HTMLImageElement;

  beforeEach(() => {
    global.Image = window.Image;
    sprites = new Image(8 * 16, 16);
    sprites.src='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'

    canvas = document.createElement('canvas');
    document.body.appendChild(canvas);
  });

  it('should instantiate', () => {
    expect(new WebGLRenderer(canvas, sprites)).toBeTruthy();
  });

  it('should setup the 2D rendering context', async () => {
    const renderer = new WebGLRenderer(canvas, sprites);
    await renderer.setup();
    expect(renderer.gl).toBeTruthy();
    expect(renderer.gl).toBeInstanceOf(CanvasRenderingContext2D);
  });

  it('should render a level', async () => {
    canvas.width = 320;
    canvas.height = 200;
    window.devicePixelRatio = 1;
    const renderer = new WebGLRenderer(canvas, sprites);
    await renderer.setup();
    const level = Level.parse(`
      ####
      #P.#
      ####
    `);
    expect(() => renderer.frame(level)).not.toThrow();
  });

});
