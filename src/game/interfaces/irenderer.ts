import { Level, Position } from "../utils/level";
import { IDisposable } from "./idisposable";

export interface IRenderer extends IDisposable {
  setup(): Promise<void>;
  frame(level: Level, levelPosition?: Position, offset?: Position): void;
}

