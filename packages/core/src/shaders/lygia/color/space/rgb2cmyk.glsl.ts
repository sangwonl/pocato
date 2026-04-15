// generated from projects/poca-card/src/lib/v2/shaders/lygia/color/space/rgb2cmyk.glsl
export default `#include <lygia/math/mmin>
#include <lygia/math/saturate>

/*
contributors: Patricio Gonzalez Vivo
description: Convert CMYK to RGB
use: rgb2cmyk(<vec3|vec4> rgba)
license:
    - Copyright (c) 2021 Patricio Gonzalez Vivo under Prosperity License - https://prosperitylicense.com/versions/3.0.0
    - Copyright (c) 2021 Patricio Gonzalez Vivo under Patron License - https://lygia.xyz/license
*/

#ifndef FNC_RGB2CMYK
#define FNC_RGB2CMYK
vec4 rgb2cmyk(const in vec3 rgb) {
    float k = mmin(1.0 - rgb);
    float invK = 1.0 - k;
    vec3 cmy = (1.0 - rgb - k) / invK;
    cmy *= step(0.0, invK);
    return saturate(vec4(cmy, k));
}
#endif`;
