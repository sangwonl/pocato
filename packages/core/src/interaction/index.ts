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
  left: number
  top: number
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
  private boundingRect: Rect = { left: 0, top: 0, width: 0, height: 0 }
  private interactionOrigin = { x: 0, y: 0 }

  private springRotate: Spring<{ x: number; y: number }>
  private springGlare: Spring<{ x: number; y: number; o: number }>

  private lastThrottleTime = 0
  private clickCount = 0
  private dblClickTimer: ReturnType<typeof setTimeout> | null = null
  private activePointerId: number | null = null

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

    // Spring rotate onChange: apply flip-aware sign to CSS rotation
    // Angular: { x: flipped ? 180 - v.x : -v.x, y: flipped ? -v.y : v.y }
    this.springRotate = springVec2({ x: 0, y: 0 }, (v) => {
      callbacks.onRotate(v)
      callbacks.onDistFromCenter(clamp(distance(v.x, v.y, 0, 0) / 50, 0, 1))
    }, SPRING_INTERACT)

    this.springGlare = springVec3({ x: 50, y: 50, o: 0 }, (v) => {
      callbacks.onGlare(v)
    }, SPRING_INTERACT)

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
    this.container.setPointerCapture(e.pointerId)

    const rect = this.container.getBoundingClientRect()
    this.boundingRect = { left: rect.left, top: rect.top, width: rect.width, height: rect.height }
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

  private onPointerUp(_e: PointerEvent): void {
    if (!this.interacting) return
    this.interacting = false
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

  /**
   * Core interaction math — faithfully ported from Angular move.service.ts doInteract()
   */
  private doInteract(clientX: number, clientY: number): void {
    const rect = this.boundingRect
    if (rect.width === 0 || rect.height === 0) return

    const deltaX = clientX - this.interactionOrigin.x
    const deltaY = clientY - this.interactionOrigin.y

    // touchPosFromLT: absolute position within card (for glare)
    const touchPosFromLT = {
      x: clientX - rect.left,
      y: clientY - rect.top,
    }
    const touchPercentFromLT = {
      x: clamp(round((100 / rect.width) * touchPosFromLT.x)),
      y: clamp(round((100 / rect.height) * touchPosFromLT.y)),
    }

    // touchPosFromCenter: delta-based center offset (for rotation)
    const touchPosFromCenter = {
      x: rect.width / 2 + deltaX,
      y: rect.height / 2 + deltaY,
    }
    const touchPercentFromCenter = {
      x: clamp(round((100 / rect.width) * touchPosFromCenter.x)),
      y: clamp(round((100 / rect.height) * touchPosFromCenter.y)),
    }
    const touchPercentBasedCenter = {
      x: touchPercentFromCenter.x - 50,
      y: touchPercentFromCenter.y - 50,
    }

    // moveDelta: raw pixel delta (no DPR)
    this.callbacks.onMoveDelta({ x: deltaX, y: deltaY })

    // mousePos: absolute position in card, DPR-scaled, Y-flipped for WebGL
    const dpr = window.devicePixelRatio || 1
    this.callbacks.onMousePos({
      x: (clientX - rect.left) * dpr,
      y: (rect.height - (clientY - rect.top)) * dpr,
    })

    // Rotation: basedCenter / divisor
    const rotate = {
      x: round(touchPercentBasedCenter.x / 3.5),
      y: round(touchPercentBasedCenter.y / 2),
    }

    // Glare: absolute percentage from left-top
    const glare = {
      x: round(touchPercentFromLT.x),
      y: round(touchPercentFromLT.y),
      o: 1 as number,
    }

    this.updateSprings(glare, rotate)
  }

  /**
   * Apply spring targets with flip-aware rotation sign.
   * Angular: { x: flipped ? 180 - rotate.x : -rotate.x, y: flipped ? -rotate.y : rotate.y }
   */
  private updateSprings(
    glare: { x: number; y: number; o: number },
    rotate: { x: number; y: number },
  ): void {
    this.springGlare.stiffness = SPRING_INTERACT.stiffness
    this.springGlare.damping = SPRING_INTERACT.damping
    this.springGlare.set(glare)

    this.springRotate.stiffness = SPRING_INTERACT.stiffness
    this.springRotate.damping = SPRING_INTERACT.damping
    this.springRotate.set({
      x: this.flipped ? 180 - rotate.x : -rotate.x,
      y: this.flipped ? -rotate.y : rotate.y,
    })
  }

  private endInteract(): void {
    this.springRotate.set({ x: this.flipped ? 180 : 0, y: 0 })
    this.springGlare.set({ x: 50, y: 50, o: 0 })
    this.callbacks.onMoveDelta({ x: 0, y: 0 })

    const rect = this.boundingRect
    const dpr = window.devicePixelRatio || 1
    this.callbacks.onMousePos({
      x: (rect.width / 2) * dpr,
      y: (rect.height / 2) * dpr,
    })
  }

  flip(flipped?: boolean): boolean {
    this.flipped = flipped ?? !this.flipped
    this.springRotate.stiffness = SPRING_FLIP.stiffness
    this.springRotate.damping = SPRING_FLIP.damping
    this.springRotate.set({ x: this.flipped ? 180 : 0, y: 0 })
    this.callbacks.onFlip(this.flipped)
    return this.flipped
  }

  /**
   * Wiggle support: start a synthetic interaction, then feed positions.
   * Matches Angular: startInteraction(0,0,false) then doInteract({x,y})
   */
  startSyntheticInteraction(): void {
    const rect = this.container.getBoundingClientRect()
    this.boundingRect = { left: rect.left, top: rect.top, width: rect.width, height: rect.height }
    // Origin at (0,0) so that delta == clientXY
    this.interactionOrigin = { x: 0, y: 0 }
  }

  /**
   * Feed wiggle position as clientX/Y coordinates.
   * x,y are percentage (0-100) of the card area.
   */
  simulateInteract(x: number, y: number): void {
    const rect = this.boundingRect
    // Convert percentage to clientX/Y
    const clientX = rect.left + (x / 100) * rect.width
    const clientY = rect.top + (y / 100) * rect.height
    // Set origin so delta-based center offset works correctly
    this.interactionOrigin = { x: clientX, y: clientY }
    this.doInteract(clientX, clientY)
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
