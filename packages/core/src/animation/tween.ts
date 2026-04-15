export type EasingFn = (t: number) => number

export const easeOut: EasingFn = (t) => 1 - (1 - t) ** 3
export const easeInOut: EasingFn = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2
export const easeIn: EasingFn = (t) => t * t * t

export interface TweenOpts {
  from: number
  to: number
  duration: number
  easing: EasingFn
  onUpdate: (value: number) => void
}

export function tween(opts: TweenOpts): Promise<void> & { cancel: () => void } {
  let cancelled = false
  let rafId: number | null = null

  const promise = new Promise<void>((resolve) => {
    const start = performance.now()
    const range = opts.to - opts.from

    function tick(now: number) {
      if (cancelled) { resolve(); return }
      const elapsed = now - start
      const t = Math.min(elapsed / opts.duration, 1)
      const value = opts.from + range * opts.easing(t)
      opts.onUpdate(value)

      if (t < 1) {
        rafId = requestAnimationFrame(tick)
      } else {
        resolve()
      }
    }
    rafId = requestAnimationFrame(tick)
  })

  return Object.assign(promise, {
    cancel() {
      cancelled = true
      if (rafId !== null) cancelAnimationFrame(rafId)
    },
  })
}
