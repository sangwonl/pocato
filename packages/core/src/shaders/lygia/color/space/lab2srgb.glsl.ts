// generated from projects/poca-card/src/lib/v2/shaders/lygia/color/space/lab2srgb.glsl
export default `#include <lygia/color/space/lab2xyz>
#include <lygia/color/space/xyz2srgb>

/*
contributors: Patricio Gonzalez Vivo
description: |
    Converts a Lab color to RGB color space. https://en.wikipedia.org/wiki/CIELAB_color_space
use: <vec3|vec4> lab2srgb(<vec3|vec4> color)
license:
    - Copyright (c) 2021 Patricio Gonzalez Vivo under Prosperity License - https://prosperitylicense.com/versions/3.0.0
    - Copyright (c) 2021 Patricio Gonzalez Vivo under Patron License - https://lygia.xyz/license
*/

#ifndef FNC_LAB2SRGB
#define FNC_LAB2SRGB
vec3 lab2srgb(const in vec3 lab) { return xyz2srgb( lab2xyz( lab ) ); }
vec4 lab2srgb(const in vec4 lab) { return vec4(lab2srgb(lab.rgb), lab.a); }
#endif`;
