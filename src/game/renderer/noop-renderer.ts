import { IRenderer } from "../interfaces/irenderer";

export class NoOpRenderer implements IRenderer {
  async setup(): Promise<void> {}
  frame(): void {}
  dispose(): void {}
}
