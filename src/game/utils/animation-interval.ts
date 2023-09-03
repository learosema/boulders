import { IDisposable } from "../interfaces/idisposable";

export interface AnimationInterval {
  callback: FrameRequestCallback;
  timeout: number;
  elapsed: number;
  calls: number;
}

export class AnimationLoop implements IDisposable {

  lastTimestamp = 0;
  timer = NaN;

  intervals: AnimationInterval[] = [];

  get running() {
    return (! Number.isNaN(this.timer));
  }

  add(callback: FrameRequestCallback, timeout: number) {
    this.intervals.push({
      callback,
      timeout,
      elapsed: 0,
      calls: 0,
    });
  }

  run() {
    if (Number.isNaN(this.timer)) {
      this.lastTimestamp = -Infinity;
      this.timer = requestAnimationFrame(this.loop);
    }
  }

  stop() {
    if (! Number.isNaN(this.timer)) {
      cancelAnimationFrame(this.timer);
      this.timer = NaN;
    }
  }

  loop = (t: DOMHighResTimeStamp) => {
    const timePassed = (t - this.lastTimestamp);
    for (const interval of this.intervals) {
      interval.elapsed += timePassed;
      if (interval.elapsed >= interval.timeout) {
        interval.calls += 1;
        interval.elapsed = 0;
        interval.callback(t);
      }
    }
    this.lastTimestamp = t;
    this.timer = requestAnimationFrame(this.loop);
  }

  dispose(): void | Promise<void> {
    this.intervals.splice(0, this.intervals.length);
    this.stop();
  }

}
