// generated from projects/poca-card/src/lib/v2/shaders/lygia/space/lookAtView.glsl
export default `/*
contributors:  Shadi El Hajj
description: Create a look-at view matrix
use: <mat4> lookAtView(in <vec3> position, in <vec3> target, in <vec3> up)
license: MIT License (MIT) Copyright (c) 2024 Shadi EL Hajj
*/

#include <lygia/space/lookAt>
#include <lygia/space/translate>

#ifndef FNC_LOOKATVIEW
#define FNC_LOOKATVIEW

mat4 lookAtView( in vec3 position, in vec3 target, in vec3 up ) {
    mat3 m = lookAt(position, target, up);
    return translate(m, position);
}

mat4 lookAtView( in vec3 position, in vec3 target, in float roll ) {
    mat3 m = lookAt(position, target, roll);
    return translate(m, position);
}

mat4 lookAtView( in vec3 position, in vec3 lookAt ) {
    return lookAtView(position, lookAt, vec3(0.0, 1.0, 0.0));
}

#endif`;
