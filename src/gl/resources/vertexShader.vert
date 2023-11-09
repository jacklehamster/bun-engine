#version 300 es
//  ~{AUTHOR}

precision highp float;

const float TEXTURE_SIZE = 4096.;

//  IN
//  shape
layout(location = 0) in vec4 position;
layout(location = 1) in mat4 transform;
//  2, 3, 4
//  animation
layout(location = 5) in vec2 tex;
layout(location = 6) in vec2 slotSize;

//  UNIFORM
uniform mat4 cam;

//  OUT
out vec2 vTex;
out float textureIndex;
out float opacity;

void main() {
  gl_Position = cam * transform * position;
  vTex = tex * (slotSize / TEXTURE_SIZE);
  textureIndex = 0.;
  opacity = 1.;
}