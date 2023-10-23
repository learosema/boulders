/**
 * Makes an integer number odd.
 * @param n an arbitrary integer value
 * @returns (n + 1) when the number is even, else n
 */
export function oddly(n: number) {
  return n % 2 === 0 ? (n + 1) : n;
}

/**
 * Clamps the a number between a min and a max limit
 * @param n an arbitrary value
 * @param min minimum limit
 * @param max maximum limit
 * @returns clamped value
 */
export function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max);
}
