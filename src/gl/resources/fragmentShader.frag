#version 300 es
//  ~{AUTHOR}

precision highp float;

//  CONST
const int NUM_TEXTURES = 16;
const float threshold = 0.00001;

//  IN
//  texture
in float vTextureIndex;
in vec2 vTex;
in float dist;
in vec3 vInstanceColor;
in vec2 var;
in vec3 vNormal;

//  OUT
out vec4 fragColor;

// UNIFORMS
uniform sampler2D uTextures[NUM_TEXTURES];
uniform vec3 bgColor;
uniform float bgBlur;
uniform float time;
uniform float fade;

//  FUNCTIONS
vec4 getTextureColor(float textureSlot, vec2 vTexturePoint);

float rand(vec2 co) {
  return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

struct DirectionalLight {
  vec3 direction;
  vec3 ambient;
  vec3 diffuse;
  vec3 specular;
};

// Function to calculate combined color with directional light
vec3 calculateDirectionalLight(DirectionalLight dirLight, vec3 existingColor,
                               vec3 normal) {
  // Calculate diffuse reflection
  float diff = max(dot(normal, -dirLight.direction), 0.0);
  vec3 diffuse = dirLight.diffuse * diff;

  // Combine existing color with diffuse reflection
  return existingColor * (dirLight.ambient + diffuse);
}

void main() {
  vec2 vFragment = vTex;
  float blur = bgBlur * pow(dist, .7) / 20000.;
  vec4 color = getTextureColor(vTextureIndex, vTex);
  if (color.a < rand(vTex)) {
    discard;
  };
  int blurPass = 8;
  vec2 vecSeed = vTex * mod(time, 7.);
  for (int i = 0; i < blurPass; i++) {
    vFragment = vTex + blur * (rand(vecSeed + dist * float(i) - .5));
    color += getTextureColor(vTextureIndex, vFragment);
  }
  color /= float(blurPass + 1);

  float colorFactor = 1. * pow(dist, -.12) * (1. - fade);
  color.rg += var.x * .02;
  color.gb += var.y * .03;
  color.rgb = color.rgb * colorFactor + bgColor * (1. - colorFactor);

  color.rgb += vInstanceColor / 10.;

  // Hardcoded DirectionalLight
  DirectionalLight dirLight;
  dirLight.direction = normalize(vec3(-1.0, -1.0, -1.0)); // Example direction
  dirLight.ambient = vec3(0.1, 0.1, 0.1);       // Example ambient color
  dirLight.diffuse = vec3(1.0, 1.0, 1.0) * 1.5; // More intense diffuse color
  dirLight.specular = vec3(1.0, 1.0, 1.0);      // Example specular color

  color.rgb = calculateDirectionalLight(dirLight, color.rgb, vNormal);

  fragColor = vec4(color.rgb, 1.);
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
