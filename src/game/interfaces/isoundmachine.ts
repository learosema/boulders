import { IDisposable } from "./idisposable";

export interface ISoundMachine extends IDisposable {

  setup(): void;

  /**
   * sound when a gem is collected
   */
  bling(): void;

  /**
   * sound when a rock hits the ground
   */
  rock(): void;

  /**
   * sound when a rock is pushed
   */
  push(): void;

  /**
   * game over
   */
  gameover(): void;

}
