import { glsl } from './utils/glsl'

export default glsl`
#ifdef GL_ES
precision mediump float;
#endif
uniform vec2 uResolution,uMouse,uMove,uRotate;uniform float uTime;uniform sampler2D uImgBase,uImgPopup;varying vec2 vUv;
#include <utils/defaultLighting>
void main(){vec4 u=texture2D(uImgPopup,vUv+vec2(-uRotate.x*.08,-uRotate.y*.06));gl_FragColor=defaultLighting(mix(texture2D(uImgBase,vUv),u,smoothstep(.4,1.,u.w)),uResolution,uRotate,1.);}
`
