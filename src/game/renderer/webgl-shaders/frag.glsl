precision highp float;

uniform vec2 resolution;
uniform sampler2D levelTexture;
varying vec2 vUv;

void main() {  
  vec2 pos = gl_FragCoord.xy;
  vec4 level = texture2D(levelTexture, vUv);
  gl_FragColor = vec4(level.rgb * 30., 1.);
}
