// generated from projects/poca-card/src/lib/v2/shaders/lygia/animation/easing/backOut.glsl
export default `#include <lygia/animation/easing/backIn>

/*
contributors: Hugh Kennedy (https://github.com/hughsk)
description: Back out easing. From https://github.com/stackgl/glsl-easings
use: backOut(<float> x)
examples:
    - https://raw.githubusercontent.com/patriciogonzalezvivo/lygia_examples/main/animation_easing.frag
*/

#ifndef FNC_BACKOUT
#define FNC_BACKOUT
float backOut(in float t) { return 1. - backIn(1. - t); }
#endif`;
