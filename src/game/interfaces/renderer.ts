import { Disposable } from "./disposable";

export interface Renderer extends Disposable {
  setup(): Promise<void>;
  frame(): void;
}

export class NoOpRenderer implements Renderer {
  async setup(): Promise<void> {}
  frame(): void {}
  dispose(): void {}
}
