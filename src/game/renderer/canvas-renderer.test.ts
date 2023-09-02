import { CanvasRenderer } from './canvas-renderer';
import { CanvasRenderingContext2D } from 'canvas';

describe('Canvas Renderer', () => {
  let canvas: HTMLCanvasElement, sprites: HTMLImageElement;

  beforeEach(() => {

    global.Image = window.Image;
    sprites = new Image(8 * 16, 16);
    sprites.src='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'

    canvas = document.createElement('canvas');
    document.body.appendChild(canvas);
  });

  it('should instantiate', () => {
    expect(new CanvasRenderer(canvas, sprites)).toBeTruthy();
  });

  it('should setup the 2D rendering context', async () => {
    const renderer = new CanvasRenderer(canvas, sprites);
    await renderer.setup();
    expect(renderer.context).toBeTruthy();
    expect(renderer.context).toBeInstanceOf(CanvasRenderingContext2D);
  });

  it('should render a level', () => {

  });

});
