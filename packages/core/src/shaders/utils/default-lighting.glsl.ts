import { glsl } from './glsl'

export default glsl`
mat3 rotationX(float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return mat3(
    1.0, 0.0, 0.0,
    0.0,  c,  -s,
    0.0,  s,   c
  );
}

mat3 rotationY(float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return mat3(
     c, 0.0, s,
    0.0, 1.0, 0.0,
    -s, 0.0, c
  );
}

vec4 defaultLighting(vec4 color, vec2 res, vec2 rot, float diff) {
  float aspectRatio = res.y / res.x;
  vec2 uv = (gl_FragCoord.xy / res.xy) * 2.0 - 1.0;
  vec2 specPos = vec2(rot.x * 3.8, rot.y * 2.2);

  vec3 baseNormal = vec3(0.0, 0.0, 1.0);
  mat3 rotMatrix = rotationX(rot.y) * rotationY(rot.x);
  vec3 normal = normalize(rotMatrix * baseNormal);

  vec3 lightDir = normalize(vec3(0.1, 0.5, 1.0));
  vec3 viewDir = normalize(vec3(0.0, 0.0, 1.0));

  vec3 halfDir = normalize(lightDir + viewDir);
  float spec = pow(max(dot(normal, halfDir), 0.0), 64.0);

  vec2 diffPos = uv - specPos;
  diffPos.y *= aspectRatio;
  float dist = length(diffPos);
  float mask = exp(-dist * 0.6);
  float lightFalloff = 1.0 / (dist + 1.3);
  spec *= mask * lightFalloff;

  return vec4(color.rgb * diff + vec3(1.0) * spec, 1.0);
}
`
