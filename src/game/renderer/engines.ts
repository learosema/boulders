import { IRenderer } from "../interfaces/irenderer";
import { CanvasRenderer } from "./canvas-renderer";
import { WebGLRenderer } from "./webgl-renderer";
import { NoOpRenderer } from "./noop-renderer";


export type SupportedEngines = 'canvas2d' | 'webgl' | 'noop';

export function rendererFactory(
  type: SupportedEngines,
  canvas: HTMLCanvasElement,
  sprites: HTMLImageElement): IRenderer;
export function rendererFactory(
  type: string,
  canvas: HTMLCanvasElement,
  sprites: HTMLImageElement,
): IRenderer {
  if (type === 'webgl') {
    return new WebGLRenderer(canvas, sprites);
  }
  if (type === 'canvas2d') {
    return new CanvasRenderer(canvas, sprites);
  }
  if (type === 'noop') {
    return new NoOpRenderer();
  }
  throw new Error('Unsupported type');
}
