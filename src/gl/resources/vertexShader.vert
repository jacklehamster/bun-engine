#version 300 es
//  ~{AUTHOR}

precision highp float;

//  FUNCTIONS
float rand(vec2 co){
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}



//  CONST
const mat4 identity = mat4(1.0);
const float SPRITE = 1.0;
const float HUD = 2.0;
const float DISTANT = 3.0;
const float WAVE = 4.0;

//  IN
//  shape
layout(location = 0) in vec2 position;
layout(location = 1) in mat4 transform;
//  1, 2, 3, 4 reserved for transform
//  animation
layout(location = 5) in vec4 slotSize_and_number;
layout(location = 6) in vec4 animation;
//  instance
layout(location = 7) in float instance;
layout(location = 8) in float spriteType;

//  UNIFORM
uniform float maxTextureSize;
uniform mat4 camPos;
uniform mat4 camTurn;
uniform mat4 camTilt;
uniform float camDist;
uniform mat4 projection;
uniform float curvature;
uniform float time;

//  OUT
out float vTextureIndex;
out vec2 vTex;
out float dist;
out vec3 vInstanceColor;
out vec2 var;
out vec3 vNormal;

void main() {
  vec2 slotSize = vec2(
    pow(2.0, floor(slotSize_and_number.x / 16.0)),
    pow(2.0, mod(slotSize_and_number.x, 16.0)));
  float slotNumber = slotSize_and_number.y;
  vec2 spriteSize = abs(slotSize_and_number.zw);
  vec2 tex = (position.xy) * vec2(0.49, -0.49) * sign(slotSize_and_number.zw) + 0.5; //  Texture corners 0..1
  float sheetCols = ceil(1. / spriteSize[0]);
  float frameStart = animation[0];
  float frameEnd = animation[1];
  float fps = animation[2];
  float maxFrameCount = animation[3];
  float frameOffset = floor(mod(min(time * fps / 1000., maxFrameCount), frameEnd + 1.));
  float frame = frameStart + frameOffset;
  tex += vec2(1., 0) * mod(frame, sheetCols) + vec2(0, 1.) * floor(frame / sheetCols);
  tex *= spriteSize;

  float maxCols = maxTextureSize / slotSize.x;
  float maxRows = maxTextureSize / slotSize.y;
  float slotX = mod(slotNumber, maxCols);
  float slotY = mod(floor(slotNumber / maxCols), maxRows);

  vec4 basePosition = vec4(position, 0.0, 1.0);

  float isHud = max(0., 1. - 2. * abs(spriteType - HUD));
  float isSprite = max(0., 1. - 2. * abs(spriteType - SPRITE));
  float isDistant = max(0., 1. - 2. * abs(spriteType - DISTANT));
  float isWave = max(0., 1. - 2. * abs(spriteType - WAVE));

  mat4 billboardMatrix = inverse(camTilt * camTurn);
  float isBillboard = max(isDistant, isSprite);
  basePosition = (isBillboard * billboardMatrix + (1. - isBillboard) * identity) * basePosition;

  vec4 worldPosition = transform * basePosition;
  var = vec2(rand(worldPosition.xz), rand(worldPosition.xz - worldPosition.yx));

	float noise = rand(worldPosition.xz) * 13.;
  worldPosition.y += isWave * sin(noise + time/1000.);

  vNormal.y = 1.5 + isWave * sin(noise + 1333. + time/777.);
  vNormal.x = isWave * sin(noise + time/1000.);
  vNormal.z = isWave * cos(noise + time/1001.);

  // worldPosition => relativePositio
  vec4 relativePosition = camTilt * camTurn * camPos * worldPosition;

  float actualCurvature = curvature * (1. - isDistant);
  relativePosition.y -= actualCurvature * ((relativePosition.z * relativePosition.z) + (relativePosition.x * relativePosition.x) / 4.) / 10.;
  relativePosition.x /= (1. + actualCurvature * 1.4);

  relativePosition.z -= camDist;

  dist = max(isDistant, isHud) + (1. - max(isDistant, isHud)) * (relativePosition.z*relativePosition.z + relativePosition.x*relativePosition.x);
  // relativePosition => gl_Position
  relativePosition = isHud * worldPosition + (1. - isHud) * relativePosition;
  gl_Position = projection * relativePosition;



  vTex = (vec2(slotX, slotY) + tex) * slotSize / maxTextureSize;
  vTextureIndex = floor(slotNumber / (maxCols * maxRows));

  //  instance
  float r = fract(instance / (256.0 * 256.0 * 255.0));
  float g = fract(instance / (256.0 * 255.0));
  float b = fract(instance / 255.0);
  vInstanceColor = vec3(r, g, b);
}
