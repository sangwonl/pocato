// generated from projects/poca-card/src/lib/v2/shaders/lygia/lighting/light/resolve.glsl
export default `#include <lygia/lighting/light/point>
#include <lygia/lighting/light/pointEvaluate>
#include <lygia/lighting/light/directional>
#include <lygia/lighting/light/directionalEvaluate>
#include <lygia/lighting/material>

#ifndef FNC_LIGHT_RESOLVE
#define FNC_LIGHT_RESOLVE

void lightResolve(LightPoint L, Material mat, inout ShadingData shadingData) {
    lightPointEvaluate(L, mat, shadingData);
}


void lightResolve(LightDirectional L, Material mat, inout ShadingData shadingData) {
    lightDirectionalEvaluate(L, mat, shadingData);
}

#endif`;
