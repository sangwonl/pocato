// generated from projects/poca-card/src/lib/v2/shaders/lygia/color/luma.glsl
export default `#include <lygia/color/space/rgb2luma>

/*
contributors: Hugh Kennedy (https://github.com/hughsk)
description: Get the luminosity of a color. From https://github.com/hughsk/glsl-luma/blob/master/index.glsl
use: luma(<vec3|vec4> color)
*/

#ifndef FNC_LUMA
#define FNC_LUMA
float luma(float v) { return v; }
float luma(in vec3 v) { return rgb2luma(v); }
float luma(in vec4 v) { return rgb2luma(v.rgb); }
#endif
`;
