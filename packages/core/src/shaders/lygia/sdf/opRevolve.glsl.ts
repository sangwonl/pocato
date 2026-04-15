// generated from projects/poca-card/src/lib/v2/shaders/lygia/sdf/opRevolve.glsl
export default `/*
contributors:  Inigo Quiles
description: revolve operation of a 2D SDFs into a 3D one
use: <vec2> opRevolve( in <vec3> p, <float> w ) 
*/

#ifndef FNC_OPREVOLVE
#define FNC_OPREVOLVE

vec2 opRevolve( in vec3 p, float w ) {
    return vec2( length(p.xz) - w, p.y );
}

#endif

`;
