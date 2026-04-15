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
  backImage?: string
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
  private cardEl: HTMLDivElement
  private rotatorEl: HTMLDivElement
  private frontEl: HTMLDivElement
  private backEl: HTMLDivElement
  private resizeObserver: ResizeObserver | null = null

  constructor(
    private container: HTMLElement,
    private options: RendererOptions,
    private onError?: (error: Error) => void,
    private onReady?: () => void,
  ) {
    this.injectStyles()

    // Build DOM:
    // .pocato-card > .pocato-rotator > .pocato-back
    //                                > .pocato-front > canvas
    this.cardEl = document.createElement('div')
    this.cardEl.className = 'pocato-card pocato-loading'

    this.rotatorEl = document.createElement('div')
    this.rotatorEl.className = 'pocato-rotator'

    // Back face
    this.backEl = document.createElement('div')
    this.backEl.className = 'pocato-back'
    if (options.backImage) {
      const backImg = document.createElement('img')
      backImg.src = options.backImage
      backImg.className = 'pocato-back-img'
      this.backEl.appendChild(backImg)
    }

    // Front face
    this.frontEl = document.createElement('div')
    this.frontEl.className = 'pocato-front'

    this.canvas = document.createElement('canvas')
    this.canvas.className = 'pocato-canvas'

    this.frontEl.appendChild(this.canvas)

    this.rotatorEl.appendChild(this.backEl)
    this.rotatorEl.appendChild(this.frontEl)
    this.cardEl.appendChild(this.rotatorEl)
    this.container.appendChild(this.cardEl)

    bootstrapShaders()
    this.init()
  }

  private injectStyles(): void {
    const id = 'pocato-styles'
    if (document.getElementById(id)) return

    const style = document.createElement('style')
    style.id = id
    style.textContent = `
      .pocato-card {
        width: 100%;
        height: 100%;
        perspective: 1000px;
        touch-action: none;
        user-select: none;
        transform: translate3d(0,0,0);
        opacity: 0;
        transition: opacity 0.5s ease;
      }
      .pocato-card.pocato-ready {
        opacity: 1;
      }
      .pocato-rotator {
        width: 100%;
        height: 100%;
        position: relative;
        transform-style: preserve-3d;
        transform-origin: center;
        transform: rotateY(var(--pocato-rotate-x, 0deg)) rotateX(var(--pocato-rotate-y, 0deg));
        border-radius: 2%;
        will-change: transform, box-shadow;
        transition: box-shadow 0.4s ease;
        box-shadow:
          0px 10px 20px -5px rgba(0,0,0,0.4),
          0 2px 15px -5px rgba(0,0,0,0.3);
        pointer-events: auto;
      }
      .pocato-front {
        position: absolute;
        top: 0; left: 0;
        width: 100%;
        height: 100%;
        backface-visibility: hidden;
        -webkit-backface-visibility: hidden;
        transform: translate3d(0,0,0);
        border-radius: 2%;
        overflow: hidden;
      }
      .pocato-back {
        position: absolute;
        top: 0; left: 0;
        width: 100%;
        height: 100%;
        backface-visibility: hidden;
        -webkit-backface-visibility: hidden;
        transform: rotateY(180deg) translateZ(0);
        border-radius: 2%;
        overflow: hidden;
        background-color: #1a1a2e;
      }
      .pocato-back-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        pointer-events: none;
      }
      .pocato-canvas {
        width: 100%;
        height: 100%;
        display: block;
      }
    `
    document.head.appendChild(style)
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

    // Use actual pixel dimensions (CSS size × DPR) for uResolution,
    // matching Angular which uses renderer.domElement.width/height
    const pixelWidth = this.canvas.width
    const pixelHeight = this.canvas.height
    const uniforms = this.createUniforms(pixelWidth, pixelHeight)

    const rawFragmentShader = this.options.customShader
      ?? FRAG_SHADERS[this.options.type]

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

    // Fade in after a short delay (matching Angular loading behavior)
    requestAnimationFrame(() => {
      this.cardEl.classList.remove('pocato-loading')
      this.cardEl.classList.add('pocato-ready')
    })
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
      // Use pixel dimensions after setSize (accounts for DPR)
      if (this.material) {
        this.material.uniforms.uResolution.value.set(this.canvas.width, this.canvas.height)
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
    if (updates.rotate) {
      // CSS transform for 3D card tilt (degrees)
      this.rotatorEl.style.setProperty('--pocato-rotate-x', `${updates.rotate.x}deg`)
      this.rotatorEl.style.setProperty('--pocato-rotate-y', `${updates.rotate.y}deg`)
      // Shader uniform (radians)
      u.uRotate.value.set(
        updates.rotate.x * (Math.PI / 180),
        updates.rotate.y * (Math.PI / 180),
      )
    }
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

  getRotatorEl(): HTMLDivElement {
    return this.rotatorEl
  }

  destroy(): void {
    if (this.rafId !== null) cancelAnimationFrame(this.rafId)
    this.resizeObserver?.disconnect()
    this.textures.forEach((t) => t.dispose())
    this.mesh?.geometry.dispose()
    this.material?.dispose()
    this.webglRenderer?.dispose()
    if (this.cardEl.parentNode) {
      this.cardEl.parentNode.removeChild(this.cardEl)
    }
    this.scene = null
    this.camera = null
    this.webglRenderer = null
    this.material = null
    this.mesh = null
  }
}
