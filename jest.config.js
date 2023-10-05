/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  testEnvironmentOptions: {
    resources: 'usable',
  },
  setupFiles: ['jest-webgl-canvas-mock'],
  transform: {
    '\\.(glsl|frag|vert|wgsl)$': '<rootDir>/jest/string-transformer.js',
  }
};
