// generated from projects/poca-card/src/lib/v2/shaders/lygia/lighting/specular.glsl
export default `#include <lygia/lighting/shadingData/new>
#include <lygia/lighting/specular/phong>
#include <lygia/lighting/specular/blinnPhong>
#include <lygia/lighting/specular/cookTorrance>
#include <lygia/lighting/specular/gaussian>
#include <lygia/lighting/specular/beckmann>

/*
contributors: Patricio Gonzalez Vivo
description: Calculate specular contribution
use:
    - specular(<vec3> L, <vec3> N, <vec3> V, <float> roughness[, <float> fresnel])
    - specular(<vec3> L, <vec3> N, <vec3> V, <float> NoV, <float> NoL, <float> roughness, <float> fresnel)
options:
    - SPECULAR_FNC: specularGaussian, specularBeckmann, specularCookTorrance (default), specularPhongRoughness, specularBlinnPhongRoughness (default on mobile)
license:
    - Copyright (c) 2021 Patricio Gonzalez Vivo under Prosperity License - https://prosperitylicense.com/versions/3.0.0
    - Copyright (c) 2021 Patricio Gonzalez Vivo under Patron License - https://lygia.xyz/license
*/

#ifndef SPECULAR_FNC
#if defined(TARGET_MOBILE) || defined(PLATFORM_RPI) || defined(PLATFORM_WEBGL)
#define SPECULAR_FNC specularBlinnPhongRoughness
#else
#define SPECULAR_FNC specularCookTorrance
#endif  
#endif

#ifndef FNC_SPECULAR
#define FNC_SPECULAR
vec3 specular(ShadingData shadingData) { return vec3(1.0, 1.0, 1.0) * SPECULAR_FNC(shadingData); }
#endif`;
