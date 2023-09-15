import { Level } from "../utils/level";
import { WebGLRenderer } from "./webgl-renderer";

describe('WebGL Renderer', () => {
  let canvas: HTMLCanvasElement, sprites: HTMLImageElement;
  const level = Level.parse(`
    #####
    #P.$#
    #####
  `);

  beforeEach(() => {
    global.Image = window.Image;
    sprites = new Image(8 * 16, 16);
    sprites.src='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'

    canvas = document.createElement('canvas');
    document.body.appendChild(canvas);
  });

  it('should instantiate', () => {
    expect(new WebGLRenderer(canvas, sprites, level)).toBeTruthy();
  });

  it('should setup the WebGL Rendering Context', async () => {
    const renderer = new WebGLRenderer(canvas, sprites, level);
    await renderer.setup();
    expect(renderer.gl).toBeTruthy();
    expect(renderer.gl).toBeInstanceOf(WebGLRenderingContext);
  });

  it('should render a level', async () => {
    canvas.width = 320;
    canvas.height = 200;
    window.devicePixelRatio = 1;
    const renderer = new WebGLRenderer(canvas, sprites, level);
    await renderer.setup();
    expect(() => renderer.frame()).not.toThrow();
  });

});
