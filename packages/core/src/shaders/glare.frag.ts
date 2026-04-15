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

void main() {
  // 기본 카드 텍스처 샘플링
  vec4 baseColor = texture2D(uImgBase, vUv);

  // 팝업 텍스처 샘플링 (움직임 반영)
  float popupOffset = 0.0;
  vec2 popupUv = vUv + (uMove / uResolution) * popupOffset; // 팝업 이동 효과
  vec4 popupColor = texture2D(uImgPopup, popupUv);

  float aSoft = smoothstep(0.4, 1.0,  popupColor.a);
  vec4 pocaColor = mix(baseColor, popupColor, aSoft);

  gl_FragColor = defaultLighting(pocaColor, uResolution, uRotate, 1.0);
}
`
