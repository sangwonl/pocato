// generated from projects/poca-card/src/lib/v2/shaders/lygia/lighting/common/rayleigh.glsl
export default `#include <lygia/math/const>

#ifndef FNC_RAYLEIGH
#define FNC_RAYLEIGH

// Rayleigh phase
float rayleigh(const in float mu) {
    return 3. * (1. + mu*mu) / (16. * PI);
}

#endif`;
