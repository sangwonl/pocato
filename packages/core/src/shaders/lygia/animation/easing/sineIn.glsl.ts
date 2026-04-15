// generated from projects/poca-card/src/lib/v2/shaders/lygia/animation/easing/sineIn.glsl
export default `#include <lygia/math/const>

/*
contributors: Hugh Kennedy (https://github.com/hughsk)
description: Sine in easing. From https://github.com/stackgl/glsl-easings
use: sineIn(<float> x)
examples:
    - https://raw.githubusercontent.com/patriciogonzalezvivo/lygia_examples/main/animation_easing.frag
*/

#ifndef FNC_SINEIN
#define FNC_SINEIN
float sineIn(in float t) { return sin((t - 1.0) * HALF_PI) + 1.0; }
#endif`;
