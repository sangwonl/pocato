// generated from projects/poca-card/src/lib/v2/shaders/lygia/space/eulerView.glsl
export default `/*
contributors:  Shadi El Hajj
description: Create a view matrix from camera position and camera rotation (euler angles)
use: <mat4> eulerView(in <vec3> position, in <vec3> euler)
license: MIT License (MIT) Copyright (c) 2024 Shadi EL Hajj
*/

#include <lygia/math/rotate3dX>
#include <lygia/math/rotate3dY>
#include <lygia/math/rotate3dZ>
#include <lygia/space/translate>

#ifndef FNC_EULERVIEW
#define FNC_EULERVIEW

 mat4 eulerView(vec3 position, vec3 euler) {
    mat3 rotZ = rotate3dZ(euler.z);
    mat3 rotX = rotate3dX(euler.x);
    mat3 rotY = rotate3dY(euler.y);
    mat3 identity = mat3(1.0);
    mat3 rotation = rotY * rotX * rotZ * identity;
    return translate(rotation, position);
}

#endif`;
