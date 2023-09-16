struct VertexInput {
  @location(0) pos: vec2f,
  @location(1) uv: vec2f,
};

struct VertexOutput {
  @builtin(position) pos: vec4f,
  @location(0) uv: vec2f
};

struct Uniforms {
  levelPosition: vec2f,
  levelSize: vec2f,
  numTiles: vec2f,
  offset: vec2f,
  playerAlive: f32,
  playerDirection: f32,
  playerPosition: vec2f,
  resolution: vec2f,
  spriteSize: vec2f,
  tileSize: f32,
  time: f32,
};

@vertex
fn vertexMain(input: VertexInput) -> VertexOutput {
  var output: VertexOutput;
  output.pos = vec4f(input.pos, 0, 1);
  output.uv = input.uv;
  return output;
}

// Bindings visible at the fragment stage
@group(0) @binding(0) var<uniform> uniforms: Uniforms;
@group(0) @binding(1) var<storage> levelStorage: array<u32>; 
@group(0) @binding(2) var spriteTexture: texture_2d<f32>;
@group(0) @binding(3) var spriteSampler: sampler;

fn getField(field: vec2i) -> u32 {
  let dim = vec2i(uniforms.levelSize);
  if (field.x >= 0 && field.y >= 0 && field.x < dim.x && field.y < dim.y) {
    return levelStorage[field.y * dim.x + field.x];
  }
  return 1;
}

@fragment
fn fragmentMain(input: VertexOutput) -> @location(0) vec4f {
  let uv = input.uv;

  let color = textureSample(spriteTexture, spriteSampler, uv);
  return color;
  // return vec4f(uv.x, uv.y, 1, 1);
}
