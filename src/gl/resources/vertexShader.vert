#version 300 es
//  ~{AUTHOR}

precision highp float;

const float TEXTURE_SIZE = 4096.;

//  IN
//  shape
layout(location = 0) in vec4 position_and_tex;
layout(location = 1) in mat4 transform;
//  2, 3, 4
//  animation
layout(location = 5) in vec3 slotSize_and_number;

//  UNIFORM
uniform mat4 cam;
uniform mat4 projection;

//  OUT
out vec2 vTex;
out float textureIndex;

void main() {
  vec2 position = position_and_tex.xy;
  vec2 tex = position_and_tex.zw;
  vec2 slotSize = slotSize_and_number.xy;
  float slotNumber = slotSize_and_number.z;

  gl_Position = projection * cam * transform * vec4(position, 0.0, 1.0);
  vTex = tex * (slotSize / TEXTURE_SIZE);
  textureIndex = 0.;
}
