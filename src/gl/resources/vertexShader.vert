#version 300 es
//  ~{AUTHOR}

precision highp float;

//  IN
//  shape
layout(location = 0) in vec2 position;
layout(location = 1) in mat4 transform;
//  2, 3, 4 reserved for transform
//  animation
layout(location = 5) in vec2 slotSize_and_number;

//  UNIFORM
uniform float maxTextureSize;
uniform mat4 cam;
uniform mat4 projection;

//  OUT
out vec2 vTex;
out float textureIndex;

void main() {
  vec2 tex = position.xy * vec2(0.5, -0.5) + 0.5;
  vec2 slotSize = vec2(
    pow(2.0, floor(slotSize_and_number.x / 16.0)),
    pow(2.0, mod(slotSize_and_number.x, 16.0)));
  float slotNumber = slotSize_and_number.y;
  float maxCols = maxTextureSize / slotSize.x;
  float maxRows = maxTextureSize / slotSize.y;
  float slotX = mod(slotNumber, maxCols);
  float slotY = mod(floor(slotNumber / maxCols), maxRows);

  gl_Position = projection * cam * transform * vec4(position, 0.0, 1.0);
  vTex = (vec2(slotX, slotY) + tex) * slotSize / maxTextureSize;
  textureIndex = floor(slotNumber / (maxCols * maxRows));
}
