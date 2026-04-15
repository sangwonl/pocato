import { glsl } from './utils/glsl'

export default glsl`
#ifdef GL_ES
precision mediump float;
#endif
uniform vec2 uResolution,uMouse,uMove,uRotate;uniform float uTime;uniform sampler2D uImgBase,uImgPopup;varying vec2 vUv;
#include <lygia/sample/clamp2edge>
#define GAUSSIANBLUR_SAMPLER_FNC(TEX, UV) sampleClamp2edge(TEX, UV)
#include <lygia/filter/gaussianBlur>
#include <lygia/draw/digits>
#include <utils/defaultLighting>
void main(){vec4 e=gaussianBlur(uImgBase,vUv,1./uResolution.xy,12),u=texture2D(uImgPopup,vUv+uMove.xy/uResolution.xy*.008);gl_FragColor=defaultLighting(mix(e,u,smoothstep(.4,1.,u.w)),uResolution,uRotate,1.);}
`
