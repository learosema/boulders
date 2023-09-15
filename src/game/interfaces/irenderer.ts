import { Position } from "../utils/level";
import { IDisposable } from "./idisposable";

export interface IRenderer extends IDisposable {
  setup(): Promise<void>;
  frame(levelPosition?: Position, offset?: Position): void;
  setSize(): void;
}

