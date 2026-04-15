import { EventEmitter } from './event-emitter'
import { Renderer, type RendererOptions } from './renderer'
import { InteractionHandler } from './interaction'
import { wiggle, type WiggleController } from './animation/wiggle'
import type { PocaCardType } from './types'

export interface PocaCardOptions {
  type: PocaCardType
  baseImage: string
  popupImage?: string
  maskImage?: string
  backImage?: string
  flippable?: boolean
  initialFlipped?: boolean
  customShader?: string
}

export class PocaCard extends EventEmitter {
  private renderer: Renderer
  private interaction: InteractionHandler
  private wiggleController: WiggleController | null = null

  constructor(container: HTMLElement, options: PocaCardOptions) {
    super()

    this.renderer = new Renderer(
      container,
      {
        type: options.type,
        baseImage: options.baseImage,
        popupImage: options.popupImage,
        maskImage: options.maskImage,
        customShader: options.customShader,
      },
      (error) => this.emit('error', error),
      () => this.emit('ready'),
    )

    // Bind pointer events on the rotator element (inside the perspective container)
    this.interaction = new InteractionHandler(
      this.renderer.getRotatorEl(),
      {
        onRotate: (rotate) => this.renderer.updateUniforms({ rotate }),
        onGlare: (_glare) => {
          // Glare is handled via shader uniforms (mouse/move), not a separate uniform
        },
        onMousePos: (pos) => this.renderer.updateUniforms({ mouse: pos }),
        onMoveDelta: (delta) => this.renderer.updateUniforms({ move: delta }),
        onDistFromCenter: (_dist) => {
          // Could be used for opacity or other effects in the future
        },
        onFlip: (flipped) => this.emit('flip', flipped),
      },
      options.flippable ?? false,
      options.initialFlipped ?? false,
    )
  }

  flip(): void {
    this.interaction.flip()
  }

  wiggle(): void {
    this.wiggleController?.stop()
    const rect = this.renderer.getContainerRect()
    this.interaction.updateRect({
      x: rect.x, y: rect.y,
      width: rect.width, height: rect.height,
    })

    this.wiggleController = wiggle(50, 50, 15, (pos, done) => {
      if (done) {
        this.interaction.simulateEndInteract()
        this.wiggleController = null
      } else {
        this.interaction.simulateInteract(pos.x, pos.y)
      }
    })
  }

  reset(): void {
    this.wiggleController?.stop()
    this.wiggleController = null
    this.interaction.simulateEndInteract()
  }

  updateOptions(options: Partial<PocaCardOptions>): void {
    if (options.customShader) {
      this.renderer.updateShader(options.customShader)
    }
    if (options.baseImage || options.popupImage || options.maskImage) {
      this.renderer.updateTextures(options)
    }
  }

  destroy(): void {
    this.wiggleController?.stop()
    this.interaction.destroy()
    this.renderer.destroy()
    this.removeAllListeners()
  }
}
