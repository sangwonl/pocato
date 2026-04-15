// generated from projects/poca-card/src/lib/v2/shaders/lygia/math/quat/inverse.glsl
export default `#include <lygia/math/quat/div>
#include <lygia/math/quat/conj>
#include <lygia/math/quat/lengthSq>

/*
contributors: Patricio Gonzalez Vivo
description: "Quaternion inverse \\n"
use: <QUAT> quatDiv(<QUAT> a, <QUAT> b)
license:
    - Copyright (c) 2021 Patricio Gonzalez Vivo under Prosperity License - https://prosperitylicense.com/versions/3.0.0
    - Copyright (c) 2021 Patricio Gonzalez Vivo under Patron License - https://lygia.xyz/license
*/

#ifndef FNC_QUATINVERSE
#define FNC_QUATINVERSE
QUAT quatInverse(QUAT q) { return quatDiv(quatConj(q), quatLengthSq(q)); }
#endif`;
