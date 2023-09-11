precision highp float;

uniform vec2 resolution;

void main() {  
  vec2 pos = gl_FragCoord.xy;

  gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);
}
