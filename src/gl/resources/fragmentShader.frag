#version 300 es
//  ~{AUTHOR}
precision highp float;

//  CONST
const int NUM_TEXTURES = 16;
const float threshold = 0.00001;

//  IN
//  texture
uniform sampler2D uTextures[NUM_TEXTURES];
in float vTextureIndex;
in vec2 vTex;
in float opacity;
in vec3 vInstanceColor;

//  OUT
out vec4 fragColor;

//  FUNCTIONS
vec4 getTextureColor(float textureSlot, vec2 vTexturePoint);

void main() {
  vec4 color = getTextureColor(vTextureIndex, vTex);
  if (color.a <= .0001) {
    discard;
  };
  fragColor = color;
//  fragColor = vec4(vInstanceColor.rgb, 1.0);
}

vec4 getTextureColor(float textureSlot, vec2 vTexturePoint) {
  if (abs(0.0 - textureSlot) < threshold) {
    return texture(uTextures[0], vTexturePoint);
  }
  if (abs(1.0 - textureSlot) < threshold) {
    return texture(uTextures[1], vTexturePoint);
  }
  if (abs(2.0 - textureSlot) < threshold) {
    return texture(uTextures[2], vTexturePoint);
  }
  if (abs(3.0 - textureSlot) < threshold) {
    return texture(uTextures[3], vTexturePoint);
  }
  if (abs(4.0 - textureSlot) < threshold) {
    return texture(uTextures[4], vTexturePoint);
  }
  if (abs(5.0 - textureSlot) < threshold) {
    return texture(uTextures[5], vTexturePoint);
  }
  if (abs(6.0 - textureSlot) < threshold) {
    return texture(uTextures[6], vTexturePoint);
  }
  if (abs(7.0 - textureSlot) < threshold) {
    return texture(uTextures[7], vTexturePoint);
  }
  if (abs(8.0 - textureSlot) < threshold) {
    return texture(uTextures[8], vTexturePoint);
  }
  if (abs(9.0 - textureSlot) < threshold) {
    return texture(uTextures[9], vTexturePoint);
  }
  if (abs(10.0 - textureSlot) < threshold) {
    return texture(uTextures[10], vTexturePoint);
  }
  if (abs(11.0 - textureSlot) < threshold) {
    return texture(uTextures[11], vTexturePoint);
  }
  if (abs(12.0 - textureSlot) < threshold) {
    return texture(uTextures[12], vTexturePoint);
  }
  if (abs(13.0 - textureSlot) < threshold) {
    return texture(uTextures[13], vTexturePoint);
  }
  if (abs(14.0 - textureSlot) < threshold) {
    return texture(uTextures[14], vTexturePoint);
  }
  if (abs(15.0 - textureSlot) < threshold) {
    return texture(uTextures[15], vTexturePoint);
  }
  return texture(uTextures[0], vTexturePoint);
}
