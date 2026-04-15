// generated from projects/poca-card/src/lib/v2/shaders/lygia/math/fcos.glsl
export default `#include <lygia/math/const>

/*
contributors: Inigo Quiles
description: A band-limited variant of cos(x) which reduces aliasing at high frequencies. From https://iquilezles.org/articles/bandlimiting/
use: fcos(<float> value)
*/

#ifndef FNC_FCOS
#define FNC_FCOS

float fcos(in float x){
    float w = fwidth(x);
    return cos(x) * smoothstep( TWO_PI, 0.0, w );
}

#endif`;
