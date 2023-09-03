export function oddly(n: number) {
  return n % 2 === 0 ? (n + 1) : n;
}

export function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max);
}
