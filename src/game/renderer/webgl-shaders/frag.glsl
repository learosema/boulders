precision highp float;

#define NUM_SPRITES 8

uniform vec2 resolution;
uniform vec2 spriteSize;
uniform vec2 levelSize;
uniform vec2 offset;
uniform vec2 levelPosition;
uniform vec2 playerPosition;
uniform float playerDirection;
uniform float tileSize;

uniform sampler2D levelTexture;
uniform sampler2D spriteTexture;

varying vec2 vUv;

int getField(vec2 p) {
  // We could get rid of this if branching and just 
  // rely on CLAMP_TO_EDGE, requiring the level is always surrounded by walls.
  if (p.x >= 0. && p.x < levelSize.x && p.y >= 0. && p.y < levelSize.y) {
    vec4 level = texture2D(levelTexture, (p + 0.5) / levelSize);
    return int(level.r * 255.);
  }
  return 1;
}

void main() { 
  vec2 pos = vUv * resolution;
  vec2 XY = floor((pos - offset) / tileSize);
  vec2 xy = mod((pos - offset), tileSize) / tileSize;
  int tile = getField(XY + levelPosition);
  vec4 sprite = vec4(0., 0., 0., 1.);
  if (tile > 0) {
    vec2 spriteOffset = vec2((xy.x + float(tile - 1)) * 1. / float(NUM_SPRITES), xy.y);
    sprite = texture2D(spriteTexture, spriteOffset);
  }
  
  vec4 color = sprite;

  // draw Player
  // TODO: can be optimized via step function.
  vec2 absPlayerPos = offset + (playerPosition - levelPosition) * tileSize;
  if (pos.x > absPlayerPos.x &&
      pos.x <  absPlayerPos.x + tileSize && 
      pos.y > absPlayerPos.y && pos.y < absPlayerPos.y + tileSize) {
    vec2 normalizedPos = (pos - absPlayerPos) / tileSize;
    vec2 playerSpriteOffset = vec2((normalizedPos.x + 7. - playerDirection) / float(NUM_SPRITES), normalizedPos.y);
    color = texture2D(spriteTexture, playerSpriteOffset);
  }

  gl_FragColor = color;
}
