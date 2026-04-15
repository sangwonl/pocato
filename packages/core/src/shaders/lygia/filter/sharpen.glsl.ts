// generated from projects/poca-card/src/lib/v2/shaders/lygia/filter/sharpen.glsl
export default `#include <lygia/sampler>

/*
contributors: Patricio Gonzalez Vivo
description: Sharpening filter
use: sharpen(<SAMPLER_TYPE> texture, <vec2> st, <vec2> renderSize [, float streanght])
options:
    - SHARPEN_KERNELSIZE: Defaults 2
    - SHARPEN_TYPE: defaults to vec3
    - SHARPEN_SAMPLER_FNC(TEX, UV): defaults to texture2D(TEX, UV).rgb
    - SHARPEN_FNC: defaults to sharpenFast
    - SAMPLER_FNC(TEX, UV): optional depending the target version of GLSL (texture2D(...) or texture(...))
license:
    - Copyright (c) 2021 Patricio Gonzalez Vivo under Prosperity License - https://prosperitylicense.com/versions/3.0.0
    - Copyright (c) 2021 Patricio Gonzalez Vivo under Patron License - https://lygia.xyz/license
*/

#ifndef RADIALBLUR_SAMPLER_FNC
#define RADIALBLUR_SAMPLER_FNC(TEX, UV) SAMPLER_FNC(TEX, UV)
#endif

#ifndef SHARPEN_TYPE
#define SHARPEN_TYPE vec3
#endif

#ifndef SHARPEN_SAMPLER_FNC
#define SHARPEN_SAMPLER_FNC(TEX, UV) SAMPLER_FNC(TEX, UV).rgb
#endif

#ifndef SHARPEN_FNC
#define SHARPEN_FNC sharpenFast
#endif

#include <lygia/filter/sharpen/fast>
#include <lygia/filter/sharpen/adaptive>
#include <lygia/filter/sharpen/contrastAdaptive>

#ifndef FNC_SHARPEN
#define FNC_SHARPEN

SHARPEN_TYPE sharpen(in SAMPLER_TYPE tex, in vec2 st, in vec2 pixel, float strength) {
    return SHARPEN_FNC (tex, st, pixel, strength);
}

SHARPEN_TYPE sharpen(in SAMPLER_TYPE tex, in vec2 st, in vec2 pixel) {
    return SHARPEN_FNC (tex, st, pixel);
}

#endif `;
