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

// #define GAUSSIANBLUR_2D
#include <lygia/sample/clamp2edge>
#define GAUSSIANBLUR_SAMPLER_FNC(TEX, UV) sampleClamp2edge(TEX, UV)
#include <lygia/filter/gaussianBlur>
#include <lygia/draw/digits>
#include <utils/defaultLighting>

void main() {
  vec2 pixel = 1.0 / uResolution.xy;

  // 3D parallax offset for popup layer
  vec2 popupOffset = vec2(-uRotate.x * 0.08, -uRotate.y * 0.06);
  vec2 popUpUv = vUv + popupOffset;

  vec4 baseColor = gaussianBlur(uImgBase, vUv, pixel, 12);
  vec4 popupColor = texture2D(uImgPopup, popUpUv);

  float aSoft = smoothstep(0.4, 1.0,  popupColor.a);
  vec4 pocaColor = mix(baseColor, popupColor, aSoft);

  gl_FragColor = defaultLighting(pocaColor, uResolution, uRotate, 1.0);
}
`
