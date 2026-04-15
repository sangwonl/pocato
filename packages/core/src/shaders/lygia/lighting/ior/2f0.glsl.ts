// generated from projects/poca-card/src/lib/v2/shaders/lygia/lighting/ior/2f0.glsl
export default `#include <lygia/math/pow2>

/*
contributors: Patricio Gonzalez Vivo
description: Index of refraction to reflectance at 0 degree https://handlespixels.wordpress.com/tag/f0-reflectance/
use: <float|vec3|vec4> ior2f0(<float|vec3|vec4> ior)
license:
    - Copyright (c) 2021 Patricio Gonzalez Vivo under Prosperity License - https://prosperitylicense.com/versions/3.0.0
    - Copyright (c) 2021 Patricio Gonzalez Vivo under Patron License - https://lygia.xyz/license
*/

#ifndef FNC_IOR2F0
#define FNC_IOR2F0
float ior2f0(const in float ior) { return pow2(ior - 1.0) / pow2(ior + 1.0); }
vec3 ior2f0(const in vec3 ior) { return pow2(ior - 1.0) / pow2(ior + 1.0); }
vec4 ior2f0(const in vec4 ior) { return vec4(pow2(ior.rgb - 1.0) / pow2(ior.rgb + 1.0), ior.a); }
#endif`;
