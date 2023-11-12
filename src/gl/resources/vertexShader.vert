#version 300 es
//  ~{AUTHOR}

precision highp float;

const float TEXTURE_SIZE = 4096.;

//  IN
//  shape
layout(location = 0) in vec2 position;
layout(location = 1) in mat4 transform;
//  2, 3, 4
//  animation
layout(location = 5) in vec2 tex;
layout(location = 6) in vec2 slotSize;

//  UNIFORM
uniform mat4 cam;
uniform mat4 projection;

//  OUT
out vec2 vTex;
out float textureIndex;

void main() {
  gl_Position = projection * cam * transform * vec4(position, 0.0, 1.0);
  vTex = tex * (slotSize / TEXTURE_SIZE);
  textureIndex = 0.;
}
