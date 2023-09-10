export type ShaderType = WebGLRenderingContext["FRAGMENT_SHADER"] | WebGLRenderingContext['VERTEX_SHADER'];

function compileShader(gl: WebGLRenderingContext, shaderType: ShaderType, code: string): WebGLShader {
  if (!gl) {
    throw new Error('no webgl context');
  }
  const sh = gl.createShader(shaderType);
  if (!sh) {
    throw new Error('error creating shader.');
  }
  gl.shaderSource(sh, code);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    throw gl.getShaderInfoLog(sh);
  }
  return sh;
}

export function createProgram(
  gl: WebGLRenderingContext,
  vertexShader: string,
  fragmentShader: string
): WebGLProgram {
  if (!gl) {
    throw new Error('WebGL context not initialized');
  }
  const program = gl.createProgram();
  if (!program) {
    throw new Error('Program compilation failed');
  }
  const fragShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShader);
  const vertShader = compileShader(gl, gl.VERTEX_SHADER, vertexShader);
  gl.attachShader(program, fragShader);
  gl.attachShader(program, vertShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw gl.getProgramInfoLog(program);
  }
  return program;
}
