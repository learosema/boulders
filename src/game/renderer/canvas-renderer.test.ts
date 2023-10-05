import { Level } from '../utils/level';
import { CanvasRenderer } from './canvas-renderer';

describe('Canvas Renderer', () => {
  let canvas: HTMLCanvasElement, sprites: HTMLImageElement;

  const level = Level.parse(`
    ####
    #P.#
    ####
  `);

  beforeEach(() => {
    global.Image = window.Image;
    sprites = new Image(8 * 16, 16);
    sprites.src='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'

    canvas = document.createElement('canvas');
    document.body.appendChild(canvas);
  });

  it('should instantiate', () => {
    expect(new CanvasRenderer(canvas, sprites, level)).toBeTruthy();
  });

  it('should setup the 2D rendering context', async () => {
    const renderer = new CanvasRenderer(canvas, sprites, level);
    await renderer.setup();
    expect(renderer.context).toBeTruthy();
    expect(renderer.context).toBeInstanceOf(CanvasRenderingContext2D);
  });

  it('should render a level', async () => {
    canvas.width = 320;
    canvas.height = 200;
    window.devicePixelRatio = 1;



    const renderer = new CanvasRenderer(canvas, sprites, level);
    await renderer.setup();

    expect(() => renderer.frame()).not.toThrow();
  });

});
