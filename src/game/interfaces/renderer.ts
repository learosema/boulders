import { Level, Position } from "../utils/level";
import { Disposable } from "./disposable";

export interface Renderer extends Disposable {
  setup(): Promise<void>;
  frame(level: Level, playerPosition: Position, offset: Position): void;
}

export class NoOpRenderer implements Renderer {
  async setup(): Promise<void> {}
  frame(): void {}
  dispose(): void {}
}
