// generated from projects/poca-card/src/lib/v2/shaders/lygia/color/space/rgb2xyY.glsl
export default `#include <lygia/color/space/rgb2xyz>
#include <lygia/color/space/xyz2xyY>

/*
contributors: Patricio Gonzalez Vivo
description: 'Converts a linear RGB color to xyY color space.'
use: <vec3|vec4> rgb2xyY(<vec3|vec4> rgb)
license:
    - Copyright (c) 2021 Patricio Gonzalez Vivo under Prosperity License - https://prosperitylicense.com/versions/3.0.0
    - Copyright (c) 2021 Patricio Gonzalez Vivo under Patron License - https://lygia.xyz/license
*/

#ifndef FNC_RGB2XYY
#define FNC_RGB2XYY
vec3 rgb2xyY(vec3 rgb) { return xyz2xyY(rgb2xyz(rgb));}
vec4 rgb2xyY(vec4 rgb) { return vec4(rgb2xyY(rgb.rgb), rgb.a);}
#endif`;
