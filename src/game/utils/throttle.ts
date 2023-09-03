export function throttle(callback: CallableFunction, ms: number) {
  let lastCalled = NaN;
  return (...args: any[]) => {
    const now = performance.now();
    if (Number.isNaN(lastCalled) || (now - lastCalled >= ms)) {
      lastCalled = now;
      callback(...args);
    }
  }
}
