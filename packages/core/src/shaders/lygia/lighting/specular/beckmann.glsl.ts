// generated from projects/poca-card/src/lib/v2/shaders/lygia/lighting/specular/beckmann.glsl
export default `#include <lygia/lighting/common/beckmann>

#ifndef FNC_SPECULAR_BECKMANN
#define FNC_SPECULAR_BECKMANN

float specularBeckmann(ShadingData shadingData) {
    return beckmann(shadingData.NoH, shadingData.roughness);
}

#endif`;
