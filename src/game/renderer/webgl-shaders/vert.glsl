precision highp float;
attribute vec4 position;
attribute vec2 uv;

varying vec4 vPosition;
varying vec2 vUv;

void main() {
  gl_Position = position;
  vPosition = position;
  vUv = uv;
}
