// generated from projects/poca-card/src/lib/v2/shaders/lygia/lighting/common/kelemen.glsl
export default `
#include <lygia/math/saturateMediump>

#ifndef FNC_KELEMEN
#define FNC_KELEMEN

// Kelemen 2001, "A Microfacet Based Coupled Specular-Matte BRDF Model with Importance Sampling"
float kelemen(const in float LoH) {
    return saturateMediump(0.25 / (LoH * LoH));
}

#endif`;
