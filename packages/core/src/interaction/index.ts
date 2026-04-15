import { round, clamp, adjust, distance } from '../utils/math'
import { springVec2, springVec3, type Spring } from '../animation/spring'

export interface InteractionCallbacks {
  onRotate: (rotate: { x: number; y: number }) => void
  onGlare: (glare: { x: number; y: number; o: number }) => void
  onMousePos: (pos: { x: number; y: number }) => void
  onMoveDelta: (delta: { x: number; y: number }) => void
  onDistFromCenter: (dist: number) => void
  onFlip: (flipped: boolean) => void
}

interface Rect {
  x: number
  y: number
  width: number
  height: number
}

const SPRING_INTERACT = { stiffness: 0.095, damping: 0.5 }
const SPRING_FLIP = { stiffness: 0.03, damping: 0.25 }
const THROTTLE_MS = 1000 / 60
const DBLCLICK_MS = 200

export class InteractionHandler {
  private flipped = false
  private interacting = false
  private boundingRect: Rect = { x: 0, y: 0, width: 0, height: 0 }
  private interactionOrigin = { x: 0, y: 0 }

  private springRotate: Spring<{ x: number; y: number }>
  private springGlare: Spring<{ x: number; y: number; o: number }>

  private lastThrottleTime = 0
  private clickCount = 0
  private dblClickTimer: ReturnType<typeof setTimeout> | null = null
  private activePointerId: number | null = null

  // Bound event handlers for cleanup
  private boundPointerDown: (e: PointerEvent) => void
  private boundPointerMove: (e: PointerEvent) => void
  private boundPointerUp: (e: PointerEvent) => void
  private boundClick: (e: MouseEvent) => void
  private boundTouchHandler: (e: TouchEvent) => void

  constructor(
    private container: HTMLElement,
    private callbacks: InteractionCallbacks,
    private flippable: boolean,
    initialFlipped: boolean,
  ) {
    this.flipped = initialFlipped

    this.springRotate = springVec2({ x: 0, y: 0 }, (v) => {
      // Account for flip state: mirror rotation when flipped
      const rotateForCSS = this.flipped
        ? { x: 180 - v.x, y: -v.y }
        : { x: -v.x, y: v.y }
      callbacks.onRotate(rotateForCSS)
      callbacks.onDistFromCenter(clamp(distance(v.x, v.y, 0, 0) / 50, 0, 1))
    }, SPRING_INTERACT)

    this.springGlare = springVec3({ x: 50, y: 50, o: 0 }, (v) => {
      callbacks.onGlare(v)
    }, SPRING_INTERACT)

    // Bind handlers
    this.boundPointerDown = this.onPointerDown.bind(this)
    this.boundPointerMove = this.onPointerMove.bind(this)
    this.boundPointerUp = this.onPointerUp.bind(this)
    this.boundClick = this.onClick.bind(this)
    this.boundTouchHandler = (e: TouchEvent) => { e.stopPropagation() }

    this.container.addEventListener('pointerdown', this.boundPointerDown)
    this.container.addEventListener('pointermove', this.boundPointerMove)
    this.container.addEventListener('pointerup', this.boundPointerUp)
    this.container.addEventListener('pointercancel', this.boundPointerUp)
    this.container.addEventListener('click', this.boundClick)
    // Prevent parent scroll interference on mobile
    this.container.addEventListener('touchstart', this.boundTouchHandler, { passive: true })
    this.container.addEventListener('touchmove', this.boundTouchHandler, { passive: true })
  }

  updateRect(rect: Rect): void {
    this.boundingRect = rect
  }

  private onPointerDown(e: PointerEvent): void {
    e.preventDefault()
    e.stopPropagation()
    this.interacting = true
    this.activePointerId = e.pointerId

    // Capture pointer so events continue even when pointer leaves the element
    this.container.setPointerCapture(e.pointerId)

    const rect = this.container.getBoundingClientRect()
    this.boundingRect = { x: rect.x, y: rect.y, width: rect.width, height: rect.height }
    this.interactionOrigin = { x: e.clientX, y: e.clientY }
    this.doInteract(e.clientX, e.clientY)
  }

  private onPointerMove(e: PointerEvent): void {
    if (!this.interacting) return
    const now = performance.now()
    if (now - this.lastThrottleTime < THROTTLE_MS) return
    this.lastThrottleTime = now
    this.doInteract(e.clientX, e.clientY)
  }

  private onPointerUp(e: PointerEvent): void {
    if (!this.interacting) return
    this.interacting = false

    // Release pointer capture
    if (this.activePointerId !== null) {
      try { this.container.releasePointerCapture(this.activePointerId) } catch {}
      this.activePointerId = null
    }

    this.endInteract()
  }

  private onClick(_e: MouseEvent): void {
    if (!this.flippable) return

    this.clickCount++
    if (this.dblClickTimer) clearTimeout(this.dblClickTimer)

    this.dblClickTimer = setTimeout(() => {
      if (this.clickCount >= 2) {
        this.flip()
      }
      this.clickCount = 0
    }, DBLCLICK_MS)
  }

  private doInteract(clientX: number, clientY: number): void {
    const rect = this.boundingRect
    if (rect.width === 0 || rect.height === 0) return

    // Delta from interaction origin (matching Angular: delta-based, not absolute)
    const deltaX = clientX - this.interactionOrigin.x
    const deltaY = clientY - this.interactionOrigin.y

    // Touch position from center of card + delta
    const touchPosFromCenterX = rect.width / 2 + deltaX
    const touchPosFromCenterY = rect.height / 2 + deltaY

    // Convert to percentage (0-100)
    const pctFromCenterX = clamp(round((100 / rect.width) * touchPosFromCenterX))
    const pctFromCenterY = clamp(round((100 / rect.height) * touchPosFromCenterY))

    // From center base (-50 to 50)
    const basedCenterX = pctFromCenterX - 50
    const basedCenterY = pctFromCenterY - 50

    // Rotation (matching Angular axis mapping: x→rotateX, y→rotateY)
    const rotateX = round(basedCenterX / 3.5)
    const rotateY = round(basedCenterY / 2)

    // Glare position (inverted)
    const glareX = adjust(pctFromCenterX, 0, 100, 100, 0)
    const glareY = adjust(pctFromCenterY, 0, 100, 100, 0)

    // Movement delta (no DPR scaling, matching Angular)
    this.callbacks.onMoveDelta({ x: round(deltaX), y: round(deltaY) })

    // Mouse position in pixels with DPR (matching Angular for shader uMouse)
    const dpr = window.devicePixelRatio || 1
    const mouseX = (clientX - rect.x) * dpr
    const mouseY = (rect.height - (clientY - rect.y)) * dpr  // Y-flipped for WebGL
    this.callbacks.onMousePos({ x: round(mouseX), y: round(mouseY) })

    this.springRotate.set({ x: rotateX, y: rotateY })
    this.springGlare.set({ x: glareX, y: glareY, o: 1 })
  }

  private endInteract(): void {
    this.springRotate.set({ x: 0, y: 0 })
    this.springGlare.set({ x: 50, y: 50, o: 0 })
    this.callbacks.onMoveDelta({ x: 0, y: 0 })

    // Reset mouse to center (matching Angular default)
    const rect = this.boundingRect
    const dpr = window.devicePixelRatio || 1
    this.callbacks.onMousePos({
      x: round((rect.width / 2) * dpr),
      y: round((rect.height / 2) * dpr),
    })
  }

  flip(flipped?: boolean): boolean {
    this.flipped = flipped ?? !this.flipped

    // Swap spring params for smoother flip
    this.springRotate.stiffness = SPRING_FLIP.stiffness
    this.springRotate.damping = SPRING_FLIP.damping

    const targetX = this.flipped ? 180 : 0
    this.springRotate.set({ x: targetX, y: 0 }).then(() => {
      // Restore interaction spring params
      this.springRotate.stiffness = SPRING_INTERACT.stiffness
      this.springRotate.damping = SPRING_INTERACT.damping
    })

    this.callbacks.onFlip(this.flipped)
    return this.flipped
  }

  // Called externally by wiggle animation
  simulateInteract(x: number, y: number): void {
    this.doInteract(
      this.boundingRect.x + (x / 100) * this.boundingRect.width,
      this.boundingRect.y + (y / 100) * this.boundingRect.height,
    )
  }

  simulateEndInteract(): void {
    this.endInteract()
  }

  isFlipped(): boolean {
    return this.flipped
  }

  destroy(): void {
    if (this.activePointerId !== null) {
      try { this.container.releasePointerCapture(this.activePointerId) } catch {}
    }
    this.container.removeEventListener('pointerdown', this.boundPointerDown)
    this.container.removeEventListener('pointermove', this.boundPointerMove)
    this.container.removeEventListener('pointerup', this.boundPointerUp)
    this.container.removeEventListener('pointercancel', this.boundPointerUp)
    this.container.removeEventListener('click', this.boundClick)
    this.container.removeEventListener('touchstart', this.boundTouchHandler)
    this.container.removeEventListener('touchmove', this.boundTouchHandler)
    if (this.dblClickTimer) clearTimeout(this.dblClickTimer)
  }
}
