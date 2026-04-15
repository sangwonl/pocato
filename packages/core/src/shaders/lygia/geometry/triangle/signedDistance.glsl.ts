// generated from projects/poca-card/src/lib/v2/shaders/lygia/geometry/triangle/signedDistance.glsl
export default `#include <lygia/geometry/triangle/triangle>
#include <lygia/geometry/triangle/normal>
#include <lygia/geometry/triangle/closestPoint>

/*
contributors: 
description: Returns the signed distance from the surface of a triangle to a point
use: <vec3> closestDistance(<Triangle> tri, <vec3> _pos) 
*/

#ifndef FNC_TRIANGLE_SIGNED_DISTANCE
#define FNC_TRIANGLE_SIGNED_DISTANCE

float signedDistance(Triangle _tri, vec3 _triNormal, vec3 _p) {
    vec3 nearest = closestPoint(_tri, _triNormal, _p);
    vec3 delta = _p - nearest;
    float distance = length(delta);
    distance *= sign( dot(delta/distance, _triNormal) );
    return distance;
}

float signedDistance(Triangle _tri, vec3 _p) { return signedDistance(_tri, normal(_tri), _p); }

#endif`;
