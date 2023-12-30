#version 300 es
//  ~{AUTHOR}

precision highp float;

//  IN
//  shape
layout(location = 0) in vec2 position;
layout(location = 1) in mat4 transform;
//  1, 2, 3, 4 reserved for transform
//  animation
layout(location = 5) in vec2 slotSize_and_number;
//  instance
layout(location = 6) in float instance;

//  UNIFORM
uniform float maxTextureSize;
uniform mat4 camPos;
uniform mat4 camTurn;
uniform mat4 camTilt;
uniform mat4 projection;
uniform float curvature;

//  OUT
out vec2 vTex;
out float vTextureIndex;
out vec3 vInstanceColor;

void main() {
  vec2 tex = position.xy * vec2(0.49, -0.49) + 0.5;
  vec2 slotSize = vec2(
    pow(2.0, floor(slotSize_and_number.x / 16.0)),
    pow(2.0, mod(slotSize_and_number.x, 16.0)));
  float slotNumber = slotSize_and_number.y;
  float maxCols = maxTextureSize / slotSize.x;
  float maxRows = maxTextureSize / slotSize.y;
  float slotX = mod(slotNumber, maxCols);
  float slotY = mod(floor(slotNumber / maxCols), maxRows);

  vec4 elemPosition = transform * vec4(position, 0.0, 1.0);
  // elementPosition => relativePosition
  vec4 relativePosition = camTilt * camTurn * camPos * elemPosition;
  relativePosition.y -= curvature * ((relativePosition.z * relativePosition.z) + (relativePosition.x * relativePosition.x) / 4.) / 10.;
  // relativePosition => gl_Position
  gl_Position = projection * relativePosition;


  vTex = (vec2(slotX, slotY) + tex) * slotSize / maxTextureSize;
  vTextureIndex = floor(slotNumber / (maxCols * maxRows));

  //  instance
  float r = fract(instance / (256.0 * 256.0 * 255.0));
  float g = fract(instance / (256.0 * 255.0));
  float b = fract(instance / 255.0);
  vInstanceColor = vec3(r, g, b);
}
