// generated from projects/poca-card/src/lib/v2/shaders/lygia/animation/easing/sineOut.glsl
export default `#include <lygia/math/const>

/*
contributors: Hugh Kennedy (https://github.com/hughsk)
description: Sine out easing. From https://github.com/stackgl/glsl-easings
use: sineOut(<float> x)
examples:
    - https://raw.githubusercontent.com/patriciogonzalezvivo/lygia_examples/main/animation_easing.frag
*/

#ifndef FNC_SINEOUT
#define FNC_SINEOUT
float sineOut(in float t) { return sin(t * HALF_PI); }
#endif`;
