// generated from projects/poca-card/src/lib/v2/shaders/lygia/math/quat/neg.glsl
export default `#include <lygia/math/quat/type>

/*
contributors: Patricio Gonzalez Vivo
description: "Quaternion negative. \\n"
use: <QUAT> quatNeg(<QUAT> a)
license:
    - Copyright (c) 2021 Patricio Gonzalez Vivo under Prosperity License - https://prosperitylicense.com/versions/3.0.0
    - Copyright (c) 2021 Patricio Gonzalez Vivo under Patron License - https://lygia.xyz/license
*/

#ifndef FNC_QUATNEG
#define FNC_QUATNEG
QUAT quatNeg(QUAT q) { return QUAT(-q.xyz, -q.w); }
#endif`;
