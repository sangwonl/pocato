// generated from projects/poca-card/src/lib/v2/shaders/lygia/color/blend/saturation.glsl
export default `#include <lygia/color/space/rgb2hsv>
#include <lygia/color/space/hsv2rgb>

/*
contributors: Romain Dura
description: Saturation Blend mode creates the result color by combining the hue and luminance of the base color with the saturation of the blend color.
use: blendSaturation(<float|vec3> base, <float|vec3> blend [, <float> opacity])
license: MIT License (MIT) Copyright (c) 2015 Jamie Owen
*/

#ifndef FNC_BLENDSATURATION
#define FNC_BLENDSATURATION
vec3 blendSaturation(vec3 base, vec3 blend) {
  vec3 baseHSL = rgb2hsv(base);
  vec3 blendHSL = rgb2hsv(blend);
  return hsv2rgb(
      vec3(baseHSL.x, blendHSL.y, baseHSL.z));
}
vec3  blendSaturation(in vec3 base, in vec3 blend, float opacity) { 
    return (blendSaturation(base, blend) * opacity + base * (1. - opacity)); 
}
#endif
`;
