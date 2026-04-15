import * as THREE from 'three'
import { bootstrapShaders, resolveIncludes } from './shader-bootstrap'
import vertexShader from '../shaders/common.vert'
import fragShaderGlare from '../shaders/glare.frag'
import fragShaderGlare3d from '../shaders/glare-3d.frag'
import fragShaderSnowfall from '../shaders/snowfall.frag'
import fragShaderBrush from '../shaders/brush.frag'
import fragShaderBlur from '../shaders/blur.frag'
import type { PocaCardType } from '../types'

const FRAG_SHADERS: Record<PocaCardType, string> = {
  'glare': fragShaderGlare,
  'glare-3d': fragShaderGlare3d,
  'snowfall': fragShaderSnowfall,
  'brush': fragShaderBrush,
  'blur': fragShaderBlur,
}

export interface RendererOptions {
  type: PocaCardType
  baseImage: string
  popupImage?: string
  maskImage?: string
  customShader?: string
}

export class Renderer {
  private scene: THREE.Scene | null = null
  private camera: THREE.Camera | null = null
  private webglRenderer: THREE.WebGLRenderer | null = null
  private material: THREE.ShaderMaterial | null = null
  private mesh: THREE.Mesh | null = null
  private clock = new THREE.Clock()
  private rafId: number | null = null
  private textures: THREE.Texture[] = []
  private canvas: HTMLCanvasElement
  private resizeObserver: ResizeObserver | null = null

  constructor(
    private container: HTMLElement,
    private options: RendererOptions,
    private onError?: (error: Error) => void,
    private onReady?: () => void,
  ) {
    this.canvas = document.createElement('canvas')
    this.canvas.style.width = '100%'
    this.canvas.style.height = '100%'
    this.canvas.style.display = 'block'
    this.container.appendChild(this.canvas)

    bootstrapShaders()
    this.init()
  }

  private init(): void {
    const { width, height } = this.container.getBoundingClientRect()

    this.scene = new THREE.Scene()
    this.camera = new THREE.Camera()

    this.webglRenderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
    })
    this.webglRenderer.setPixelRatio(window.devicePixelRatio)
    this.webglRenderer.setSize(width, height)

    const uniforms = this.createUniforms(width, height)

    const rawFragmentShader = this.options.customShader
      ?? FRAG_SHADERS[this.options.type]

    // Resolve all #include directives before passing to Three.js
    const fragmentShader = resolveIncludes(rawFragmentShader)

    this.material = new THREE.ShaderMaterial({
      vertexShader: resolveIncludes(vertexShader),
      fragmentShader,
      uniforms,
      transparent: true,
    })

    const geometry = new THREE.PlaneGeometry(2, 2)
    this.mesh = new THREE.Mesh(geometry, this.material)
    this.scene.add(this.mesh)

    this.loadTextures()
    this.setupResizeObserver()
    this.startRenderLoop()
  }

  private createUniforms(width: number, height: number): Record<string, THREE.IUniform> {
    return {
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(width, height) },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uMove: { value: new THREE.Vector2(0, 0) },
      uRotate: { value: new THREE.Vector2(0, 0) },
      uCardOpacity: { value: 1.0 },
      uImgBase: { value: null },
      uImgPopup: { value: null },
      uImgMask: { value: null },
    }
  }

  private loadTextures(): void {
    const loader = new THREE.TextureLoader()
    const load = (url: string | undefined, uniform: string) => {
      if (!url) return
      loader.load(
        url,
        (texture) => {
          this.textures.push(texture)
          if (this.material) {
            this.material.uniforms[uniform].value = texture
          }
        },
        undefined,
        () => {
          this.onError?.(new Error(`Failed to load texture: ${url}`))
        },
      )
    }

    load(this.options.baseImage, 'uImgBase')
    load(this.options.popupImage, 'uImgPopup')
    load(this.options.maskImage, 'uImgMask')

    this.onReady?.()
  }

  private setupResizeObserver(): void {
    this.resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      const { width, height } = entry.contentRect
      if (width === 0 || height === 0) return

      this.webglRenderer?.setSize(width, height)
      if (this.material) {
        this.material.uniforms.uResolution.value.set(width, height)
      }
    })
    this.resizeObserver.observe(this.container)
  }

  private startRenderLoop(): void {
    const animate = () => {
      this.rafId = requestAnimationFrame(animate)
      if (!this.material || !this.scene || !this.camera || !this.webglRenderer) return

      const delta = this.clock.getDelta()
      this.material.uniforms.uTime.value += delta
      this.webglRenderer.render(this.scene, this.camera)
    }
    this.rafId = requestAnimationFrame(animate)
  }

  updateUniforms(updates: {
    rotate?: { x: number; y: number }
    mouse?: { x: number; y: number }
    move?: { x: number; y: number }
    opacity?: number
  }): void {
    if (!this.material) return
    const u = this.material.uniforms
    // Convert degrees to radians for shader consumption (matching Angular source)
    if (updates.rotate) u.uRotate.value.set(
      updates.rotate.x * (Math.PI / 180),
      updates.rotate.y * (Math.PI / 180),
    )
    if (updates.mouse) u.uMouse.value.set(updates.mouse.x, updates.mouse.y)
    if (updates.move) u.uMove.value.set(updates.move.x, updates.move.y)
    if (updates.opacity !== undefined) u.uCardOpacity.value = updates.opacity
  }

  updateShader(fragmentShader: string): void {
    if (!this.material) return
    this.material.fragmentShader = resolveIncludes(fragmentShader)
    this.material.needsUpdate = true
  }

  updateTextures(options: Partial<RendererOptions>): void {
    const loader = new THREE.TextureLoader()
    const load = (url: string | undefined, uniform: string) => {
      if (!url) return
      loader.load(url, (texture) => {
        this.textures.push(texture)
        if (this.material) {
          this.material.uniforms[uniform].value = texture
        }
      })
    }
    if (options.baseImage) load(options.baseImage, 'uImgBase')
    if (options.popupImage) load(options.popupImage, 'uImgPopup')
    if (options.maskImage) load(options.maskImage, 'uImgMask')
  }

  getContainerRect(): DOMRect {
    return this.container.getBoundingClientRect()
  }

  destroy(): void {
    if (this.rafId !== null) cancelAnimationFrame(this.rafId)
    this.resizeObserver?.disconnect()
    this.textures.forEach((t) => t.dispose())
    this.mesh?.geometry.dispose()
    this.material?.dispose()
    this.webglRenderer?.dispose()
    if (this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas)
    }
    this.scene = null
    this.camera = null
    this.webglRenderer = null
    this.material = null
    this.mesh = null
  }
}
