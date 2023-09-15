import { IRenderer } from "../interfaces/irenderer";
import { CanvasRenderer } from "./canvas-renderer";
import { WebGLRenderer } from "./webgl-renderer";
import { NoOpRenderer } from "./noop-renderer";
import { WebGPURenderer } from "./webgpu-renderer";
import { Level } from "../utils/level";


export type SupportedEngines = 'webgpu' | 'canvas2d' | 'webgl' | 'noop';

export function rendererFactory(
  type: SupportedEngines,
  canvas: HTMLCanvasElement,
  sprites: HTMLImageElement,
  level: Level): IRenderer;
export function rendererFactory(
  type: string,
  canvas: HTMLCanvasElement,
  sprites: HTMLImageElement,
  level: Level,
): IRenderer {
  if (type === 'webgpu') {
    return new WebGPURenderer(canvas, sprites, level);
  }
  if (type === 'webgl') {
    return new WebGLRenderer(canvas, sprites, level);
  }
  if (type === 'canvas2d') {
    return new CanvasRenderer(canvas, sprites, level);
  }
  if (type === 'noop') {
    return new NoOpRenderer();
  }
  throw new Error('Unsupported type');
}
