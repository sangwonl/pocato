// generated from projects/poca-card/src/lib/v2/shaders/lygia/lighting/common/clampNoV.glsl
export default `#ifndef FNC_CLAMPNOV
#define FNC_CLAMPNOV

#ifndef MIN_N_DOT_V
#define MIN_N_DOT_V 1e-4
#endif
// Neubelt and Pettineo 2013, "Crafting a Next-gen Material Pipeline for The Order: 1886"
float clampNoV(const in float NoV) {
    return max(NoV, MIN_N_DOT_V);
}
#endif`;
