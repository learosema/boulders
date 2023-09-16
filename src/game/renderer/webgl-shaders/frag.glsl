precision highp float;

#define NUM_SPRITES 8
#define GEM 4
#define PLAYER 7

uniform vec2 resolution;
uniform vec2 spriteSize;
uniform vec2 levelSize;
uniform vec2 offset;
uniform vec2 levelPosition;
uniform int playerAlive;
uniform vec2 playerPosition;
uniform float playerDirection;
uniform float tileSize;

uniform sampler2D levelTexture;
uniform sampler2D spriteTexture;

varying vec2 vUv;

vec3 blend(vec3 a, vec3 b, float t) {
  return sqrt(
    (1. - t) * pow(a,vec3(2.)) + t * pow(b,vec3(2.)));
}

int getField(vec2 p) {
  // We could get rid of this if branching and just 
  // rely on CLAMP_TO_EDGE, requiring the level is always surrounded by walls.
  if (p.x >= 0. && p.x < levelSize.x && p.y >= 0. && p.y < levelSize.y) {
    vec4 level = texture2D(levelTexture, (p + 0.5) / levelSize);
    return int(0.5 + level.r * 255.);
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
  if (playerAlive > 0 && pos.x > absPlayerPos.x &&
      pos.x <  absPlayerPos.x + tileSize && 
      pos.y > absPlayerPos.y && pos.y < absPlayerPos.y + tileSize) {
    vec2 normalizedPos = (pos - absPlayerPos) / tileSize;
    vec2 playerSpriteOffset = vec2((normalizedPos.x + float(PLAYER) - playerDirection) / float(NUM_SPRITES), normalizedPos.y);
    color = texture2D(spriteTexture, playerSpriteOffset);
  }
  
  // Lighting
  float d = 1000.;
  vec2 centerPlayerPos = absPlayerPos + tileSize / 2.;
  d = min(d, distance(pos, centerPlayerPos) * .00125);

  
/*
  Unfortunately, this is too slow.

  for (int y = -8; y < 8; y++) {
    for (int x = -8; x < 8; x++) {
      XY = vec2(float(x), float(y)) + playerPosition;
      if (getField(XY) == GEM) {
        vec2 gemCenter = offset + (XY - levelPosition + .5) * tileSize;
        float gemD = distance(pos, gemCenter) * (1. / 300.);
        d = min(d, gemD);
      }
    }
  }
*/
  vec3 blendedColor = blend(vec3(.4), vec3(1.), 1. - min(d, 1.)) * color.rgb;
  gl_FragColor = vec4(blendedColor, 1.);
  // gl_FragColor = vec4(texture2D(levelTexture, vUv).rrr * 40., 1.);
}
