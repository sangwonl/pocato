import { tween, easeOut, easeInOut, easeIn } from './tween'

export interface WiggleController {
  stop(): void
}

export function wiggle(
  cx: number,
  cy: number,
  radius: number,
  onUpdate: (pos: { x: number; y: number }, done: boolean) => void,
): WiggleController {
  let stopped = false
  const cancellers: (() => void)[] = []

  async function run() {
    let currentRadius = 0
    let theta = 0

    // Phase 1: Expand (0.5s)
    const expand = tween({
      from: 0, to: radius,
      duration: 500, easing: easeOut,
      onUpdate: (r) => {
        if (stopped) return
        currentRadius = r
        onUpdate({ x: cx + r, y: cy }, false)
      },
    })
    cancellers.push(expand.cancel)
    await expand
    if (stopped) return

    // Phase 2: Rotate (0.5s, 0 → π)
    const rotate = tween({
      from: 0, to: Math.PI,
      duration: 500, easing: easeInOut,
      onUpdate: (t) => {
        if (stopped) return
        theta = t
        onUpdate({
          x: cx + currentRadius * Math.cos(theta),
          y: cy + currentRadius * Math.sin(theta),
        }, false)
      },
    })
    cancellers.push(rotate.cancel)
    await rotate
    if (stopped) return

    // Phase 3: Shrink (0.3s)
    const shrink = tween({
      from: currentRadius, to: 0,
      duration: 300, easing: easeIn,
      onUpdate: (r) => {
        if (stopped) return
        currentRadius = r
        onUpdate({ x: cx + r * Math.cos(theta), y: cy }, false)
      },
    })
    cancellers.push(shrink.cancel)
    await shrink

    if (!stopped) {
      onUpdate({ x: cx, y: cy }, true)
    }
  }

  run()

  return {
    stop() {
      stopped = true
      cancellers.forEach((c) => c())
    },
  }
}
