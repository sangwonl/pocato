// generated from projects/poca-card/src/lib/v2/shaders/lygia/draw/circle.glsl
export default `
#include <lygia/sdf/circleSDF>

#include <lygia/draw/fill>
#include <lygia/draw/stroke>

/*
contributors: Patricio Gonzalez Vivo
description: Draw a circle filled or not.
use: <float> circle(<vec2> st, <float> size [, <float> width])
license:
    - Copyright (c) 2021 Patricio Gonzalez Vivo under Prosperity License - https://prosperitylicense.com/versions/3.0.0
    - Copyright (c) 2021 Patricio Gonzalez Vivo under Patron License - https://lygia.xyz/license
*/

#ifndef FNC_CIRCLE
#define FNC_CIRCLE
float circle(vec2 st, float size) {
    return fill(circleSDF(st), size);
}

float circle(vec2 st, float size, float strokeWidth) {
    return stroke(circleSDF(st), size, strokeWidth);
}
#endif`;
