import { glsl } from './utils/glsl'

export default glsl`
// three.js built-in attributes
// attribute vec3 position;
// attribute vec3 normal;
// attribute vec2 uv;

// three.js built-in uniforms
// uniform mat4 modelMatrix;  // a.k.a worldMatrix
// uniform mat4 viewMatrix;
// uniform mat4 modelViewMatrix;
// uniform mat3 normalMatrix;
// uniform mat4 projectionMatrix;
// uniform vec3 cameraPosition;

// world transformed attributes for the fragment shader
varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUv;
varying vec3 vView;

void main() {
  // vec4 pos = viewMatrix * modelMatrix * vec4(position, 1.0);
  vec4 pos = modelViewMatrix * vec4(position, 1.0);

  // normalMatrix = transpose(inverse(mat3(modelMatrix)));
  // because transform matrix for normal vector is L^-1T
  vUv = uv;
  vPosition = pos.xyz;
  vView = normalize(cameraPosition - vPosition);
  vNormal = normalize(normalMatrix * normal);

  // transform the position to clip space
  gl_Position = projectionMatrix * pos;
}
`
