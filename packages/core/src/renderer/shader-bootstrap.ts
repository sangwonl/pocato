import * as THREE from 'three'

import permute from '../shaders/lygia/math/permute.glsl'
import mod289 from '../shaders/lygia/math/mod289.glsl'
import taylorInvSqrt from '../shaders/lygia/math/taylorInvSqrt.glsl'
import grad4 from '../shaders/lygia/math/grad4.glsl'
import rotate4d from '../shaders/lygia/math/rotate4d.glsl'
import cubic from '../shaders/lygia/math/cubic.glsl'
import quintic from '../shaders/lygia/math/quintic.glsl'
import sum from '../shaders/lygia/math/sum.glsl'
import saturate from '../shaders/lygia/math/saturate.glsl'
import gaussian from '../shaders/lygia/math/gaussian.glsl'
import ratio from '../shaders/lygia/space/ratio.glsl'
import random from '../shaders/lygia/generative/random.glsl'
import srandom from '../shaders/lygia/generative/srandom.glsl'
import gnoise from '../shaders/lygia/generative/gnoise.glsl'
import snoise from '../shaders/lygia/generative/snoise.glsl'
import fbm from '../shaders/lygia/generative/fbm.glsl'
import dilation from '../shaders/lygia/morphological/dilation.glsl'
import sampler from '../shaders/lygia/sampler.glsl'
import clamp2edge from '../shaders/lygia/sample/clamp2edge.glsl'
import digits from '../shaders/lygia/draw/digits.glsl'
import gaussianBlur from '../shaders/lygia/filter/gaussianBlur.glsl'
import gaussianBlur2D from '../shaders/lygia/filter/gaussianBlur/2D.glsl'
import gaussianBlur1D from '../shaders/lygia/filter/gaussianBlur/1D.glsl'
import gaussianBlur1DFast13 from '../shaders/lygia/filter/gaussianBlur/1D_fast13.glsl'
import gaussianBlur1DFast9 from '../shaders/lygia/filter/gaussianBlur/1D_fast9.glsl'
import gaussianBlur1DFast5 from '../shaders/lygia/filter/gaussianBlur/1D_fast5.glsl'
import kuwahara from '../shaders/lygia/filter/kuwahara.glsl'

import defaultLighting from '../shaders/utils/default-lighting.glsl'

let bootstrapped = false

export function bootstrapShaders(): void {
  if (bootstrapped) return
  bootstrapped = true

  const ThreeShaderChunk = THREE.ShaderChunk as any
  ThreeShaderChunk['lygia/math/permute'] = permute
  ThreeShaderChunk['lygia/math/mod289'] = mod289
  ThreeShaderChunk['lygia/math/taylorInvSqrt'] = taylorInvSqrt
  ThreeShaderChunk['lygia/math/grad4'] = grad4
  ThreeShaderChunk['lygia/math/rotate4d'] = rotate4d
  ThreeShaderChunk['lygia/math/cubic'] = cubic
  ThreeShaderChunk['lygia/math/quintic'] = quintic
  ThreeShaderChunk['lygia/math/sum'] = sum
  ThreeShaderChunk['lygia/math/saturate'] = saturate
  ThreeShaderChunk['lygia/math/gaussian'] = gaussian
  ThreeShaderChunk['lygia/space/ratio'] = ratio
  ThreeShaderChunk['lygia/generative/random'] = random
  ThreeShaderChunk['lygia/generative/srandom'] = srandom
  ThreeShaderChunk['lygia/generative/gnoise'] = gnoise
  ThreeShaderChunk['lygia/generative/snoise'] = snoise
  ThreeShaderChunk['lygia/generative/fbm'] = fbm
  ThreeShaderChunk['lygia/morphological/dilation'] = dilation
  ThreeShaderChunk['lygia/sampler'] = sampler
  ThreeShaderChunk['lygia/sample/clamp2edge'] = clamp2edge
  ThreeShaderChunk['lygia/draw/digits'] = digits
  ThreeShaderChunk['lygia/filter/gaussianBlur'] = gaussianBlur
  ThreeShaderChunk['lygia/filter/gaussianBlur/2D'] = gaussianBlur2D
  ThreeShaderChunk['lygia/filter/gaussianBlur/1D'] = gaussianBlur1D
  ThreeShaderChunk['lygia/filter/gaussianBlur/1D_fast13'] = gaussianBlur1DFast13
  ThreeShaderChunk['lygia/filter/gaussianBlur/1D_fast9'] = gaussianBlur1DFast9
  ThreeShaderChunk['lygia/filter/gaussianBlur/1D_fast5'] = gaussianBlur1DFast5
  ThreeShaderChunk['lygia/filter/kuwahara'] = kuwahara
  ThreeShaderChunk['utils/defaultLighting'] = defaultLighting
}
