// generated from projects/poca-card/src/lib/v2/shaders/lygia/sdf/opRound.glsl
export default `/*
contributors:  Inigo Quiles
description: round SDFs 
use: <float> opRound( in <float> d, <float> h ) 
*/

#ifndef FNC_OPROUND
#define FNC_OPROUND

float opRound( in float d, in float h ) {
    return d - h;
}

#endif

`;
