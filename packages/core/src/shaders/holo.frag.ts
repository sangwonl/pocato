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

#include <utils/defaultLighting>

// HSV to RGB conversion
vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0/3.0, 1.0/3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
  vec4 baseColor = texture2D(uImgBase, vUv);
  vec4 popupColor = texture2D(uImgPopup, vUv);

  // Iridescence on base only
  float angle = uRotate.x * 2.0 + uRotate.y * 1.5;
  float hue = fract(vUv.y * 0.8 + vUv.x * 0.3 + angle * 0.5 + uTime * 0.05);
  vec3 rainbow = hsv2rgb(vec3(hue, 0.6, 1.0));

  float tiltAmount = length(uRotate) * 3.0;
  float holoIntensity = smoothstep(0.0, 1.0, tiltAmount) * 0.35;

  vec3 holoBase = baseColor.rgb + rainbow * holoIntensity;

  // Composite popup on top without holo
  float aSoft = smoothstep(0.4, 1.0, popupColor.a);
  vec3 finalColor = mix(holoBase, popupColor.rgb, aSoft);

  gl_FragColor = defaultLighting(vec4(finalColor, 1.0), uResolution, uRotate, 1.0);
}
`
