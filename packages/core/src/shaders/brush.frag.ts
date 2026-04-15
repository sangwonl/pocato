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

#include <lygia/sample/clamp2edge>
#define KUWAHARA_SAMPLER_FNC(TEX, UV) sampleClamp2edge(TEX, UV)
#include <lygia/filter/kuwahara>
#include <lygia/draw/digits>
#include <utils/defaultLighting>

void main() {
  vec2 pixel = 1.0 / uResolution.xy;
  vec2 popUpUv = vUv + (uMove.xy / uResolution.xy) * 0.008;

  vec4 baseColor = kuwahara(uImgBase, vUv, pixel, 4.0);
  vec4 popupColor = kuwahara(uImgPopup, popUpUv, pixel, 4.0);

  float aSoft = smoothstep(0.4, 1.0,  popupColor.a);
  vec4 pocaColor = mix(baseColor, popupColor, aSoft);

  gl_FragColor = defaultLighting(pocaColor, uResolution, uRotate, 1.0);
}
`
