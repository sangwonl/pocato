import { glsl } from './utils/glsl'

export default glsl`
#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 uResolution;
uniform vec2 uMouse;
uniform vec2 uMove;
uniform vec2 uRotate;
uniform float uTime;
uniform sampler2D uImgBase;
uniform sampler2D uImgPopup;

varying vec2 vUv;

#define mod289(x) mod(x, 289.)

vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

float snoise(vec2 coord) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 intPart = floor(coord + dot(coord, C.yy));
  vec2 fracPart = coord - intPart + dot(intPart, C.xx);

  vec2 offset;
  offset = (fracPart.x > fracPart.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 combined = fracPart.xyxy + C.xxzz;
  combined.xy -= offset;

  intPart = mod289(intPart);
  vec3 perm = permute(permute(intPart.y + vec3(0.0, offset.y, 1.0))
                      + intPart.x + vec3(0.0, offset.x, 1.0));

  vec3 gradient = max(0.5 - vec3(dot(fracPart, fracPart), dot(combined.xy, combined.xy), dot(combined.zw, combined.zw)), 0.0);
  gradient *= gradient;
  gradient *= gradient;

  vec3 noiseVec = 2.0 * fract(perm * C.www) - 1.0;
  vec3 absDiff = abs(noiseVec) - 0.5;
  vec3 offsetVec = floor(noiseVec + 0.5);
  vec3 gradientVec = noiseVec - offsetVec;

  gradient *= 1.79284291400159 - 0.85373472095314 * (gradientVec * gradientVec + absDiff * absDiff);

  vec3 finalGrad;
  finalGrad.x = gradientVec.x * fracPart.x + absDiff.x * fracPart.y;
  finalGrad.yz = gradientVec.yz * combined.xz + absDiff.yz * combined.yw;

  return 130.0 * dot(gradient, finalGrad);
}

float fbm(vec2 position) {
  float result = 0.0;
  float weight = 0.5;
  for (int i = 0; i < 5; i++) {
    result += weight * snoise(position);
    position *= 2.0;
    weight *= 0.5;
  }
  return result;
}

// snowfall
const int LAYERS = 66;
const float DEPTH_NEAR = 0.3;
const float WIDTH_NEAR = 0.4;
const float SPEED_NEAR = 0.6;
const float DEPTH_FAR = 0.1;
const float WIDTH_FAR = 0.3;
const float SPEED_FAR = 0.1;

float computeSnow(in vec2 uv, int layerStart, int layerEnd) {
  const mat3 permutationMatrix = mat3(13.323122, 23.5112, 21.71123, 21.1212, 28.7312, 11.9312, 21.8112, 14.7212, 61.3934);
  vec2 moveNormalized = uMove.xy / uResolution.xy;
  moveNormalized.x = max(0.15, smoothstep(0.15, 0.8, moveNormalized.x));
  uv.x += moveNormalized.x * 0.2;
  float totalLayers = float(LAYERS);
  float accumulation = 0.0;
  float depthOfField = 5.0 * sin(uTime * 0.1);
  for (int i = max(layerStart, 0); i < min(layerEnd, LAYERS); i++) {
    float layer = float(i);
    float depthFactor = smoothstep(DEPTH_NEAR, DEPTH_FAR, layer / totalLayers);
    float widthFactor = smoothstep(WIDTH_NEAR, WIDTH_FAR, layer / totalLayers);
    float speedFactor = smoothstep(SPEED_NEAR, SPEED_FAR, layer / totalLayers);
    vec2 offsetUv = uv * (1.0 + layer * depthFactor);
    float windEffect = widthFactor * mod(layer * 7.238917, 1.0) - widthFactor * 0.1 * sin(uTime * 2.0 + layer);
    offsetUv += vec2(offsetUv.y * windEffect, speedFactor * uTime / (1.0 + layer * depthFactor * 0.03));
    vec3 noiseInput = vec3(floor(offsetUv), 31.189 + layer);
    vec3 permuted = floor(noiseInput) * 0.00001 + fract(noiseInput);
    vec3 noise = fract((31415.9 + permuted) / fract(permutationMatrix * permuted));
    vec2 particleShape = abs(mod(offsetUv, 1.0) - 0.5 + 0.9 * noise.xy - 0.45);
    particleShape += 0.01 * abs(2.0 * fract(10.0 * offsetUv.yx) - 1.0);
    float distance = 0.6 * max(particleShape.x - particleShape.y, particleShape.x + particleShape.y) + max(particleShape.x, particleShape.y) - 0.01;
    float edgeThreshold = 0.05 + 0.05 * min(0.5 * abs(layer - 5.0 - depthOfField), 1.0);
    accumulation += smoothstep(edgeThreshold, -edgeThreshold, distance) * (noise.x / (1.0 + 0.02 * layer * depthFactor));
  }
  return accumulation;
}

void main() {
  vec4 baseTexture = texture2D(uImgBase, vUv);
  gl_FragColor = mix(gl_FragColor, baseTexture, baseTexture.a);

  float snowEffect = computeSnow(vUv, 5, 15);
  gl_FragColor += vec4(vec3(snowEffect), 1.0);

  // 3D parallax offset for popup layer
  vec2 popupOffset = vec2(-uRotate.x * 0.08, -uRotate.y * 0.06);
  vec2 popupOffsetUv = vUv + popupOffset;
  vec4 popupTexture = texture2D(uImgPopup, popupOffsetUv);
  gl_FragColor = mix(gl_FragColor, popupTexture, popupTexture.a);

  snowEffect = computeSnow(vUv, 16, 20);
  gl_FragColor += vec4(vec3(snowEffect), 1.0);
}
`
