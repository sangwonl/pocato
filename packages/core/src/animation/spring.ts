export interface SpringOpts {
  stiffness?: number
  damping?: number
  precision?: number
}

export interface SpringUpdateOpts {
  hard?: boolean
  soft?: number | boolean
}

export interface Spring<T> {
  set(value: T, opts?: SpringUpdateOpts): Promise<void>
  get(): T
  stiffness: number
  damping: number
  precision: number
}

// Global animation loop shared across all springs
const tasks: Set<() => boolean> = new Set()
let rafId: number | null = null

function runLoop() {
  if (tasks.size === 0) {
    rafId = null
    return
  }
  for (const task of tasks) {
    if (!task()) {
      tasks.delete(task)
    }
  }
  rafId = requestAnimationFrame(runLoop)
}

function scheduleTask(task: () => boolean) {
  tasks.add(task)
  if (rafId === null) {
    rafId = requestAnimationFrame(runLoop)
  }
}

function tickSpring(
  ctx: { val: number; lastVal: number; target: number; invMass: number },
  stiffness: number,
  damping: number,
  precision: number,
): boolean {
  const delta = ctx.target - ctx.val
  const velocity = ctx.val - ctx.lastVal
  const springForce = stiffness * delta
  const damperForce = damping * velocity
  const acceleration = (springForce - damperForce) * ctx.invMass
  const d = velocity + acceleration

  if (Math.abs(d) < precision && Math.abs(delta) < precision) {
    ctx.val = ctx.target
    ctx.lastVal = ctx.target
    return false // settled
  }

  ctx.lastVal = ctx.val
  ctx.val += d
  return true // still moving
}

export function spring(
  initialValue: number,
  onChange: (value: number) => void,
  opts: SpringOpts = {},
): Spring<number> {
  const stiffness = opts.stiffness ?? 0.15
  const damping = opts.damping ?? 0.8
  const precision = opts.precision ?? 0.01

  const ctx = {
    val: initialValue,
    lastVal: initialValue,
    target: initialValue,
    invMass: 1,
  }
  let currentResolve: (() => void) | null = null

  const s: Spring<number> = {
    stiffness,
    damping,
    precision,
    get() {
      return ctx.val
    },
    set(value: number, updateOpts?: SpringUpdateOpts) {
      ctx.target = value

      if (updateOpts?.hard) {
        ctx.val = value
        ctx.lastVal = value
        onChange(value)
        return Promise.resolve()
      }

      if (updateOpts?.soft) {
        const rate = typeof updateOpts.soft === 'number' ? updateOpts.soft : 0.5
        ctx.invMass = Math.min(ctx.invMass, rate)
      }

      return new Promise<void>((resolve) => {
        currentResolve = resolve
        scheduleTask(() => {
          const invMassTarget = 1
          ctx.invMass = Math.min(ctx.invMass + 0.02, invMassTarget)

          const moving = tickSpring(ctx, s.stiffness, s.damping, s.precision)
          onChange(ctx.val)

          if (!moving) {
            currentResolve?.()
            currentResolve = null
          }
          return moving
        })
      })
    },
  }

  return s
}

// Convenience: spring for {x, y} objects
// Uses batched onChange — ticks all components per frame, calls onChange once
export function springVec2(
  initial: { x: number; y: number },
  onChange: (value: { x: number; y: number }) => void,
  opts: SpringOpts = {},
): Spring<{ x: number; y: number }> {
  const state = { x: initial.x, y: initial.y }
  let dirty = false

  const flush = () => {
    if (dirty) {
      dirty = false
      onChange({ ...state })
    }
  }

  const sx = spring(initial.x, (v) => {
    state.x = v
    dirty = true
    // Use microtask to batch x+y updates within the same frame
    queueMicrotask(flush)
  }, opts)

  const sy = spring(initial.y, (v) => {
    state.y = v
    dirty = true
    queueMicrotask(flush)
  }, opts)

  return {
    get stiffness() { return sx.stiffness },
    set stiffness(v) { sx.stiffness = v; sy.stiffness = v },
    get damping() { return sx.damping },
    set damping(v) { sx.damping = v; sy.damping = v },
    get precision() { return sx.precision },
    set precision(v) { sx.precision = v; sy.precision = v },
    get() {
      return { x: sx.get(), y: sy.get() }
    },
    async set(value, updateOpts) {
      await Promise.all([
        sx.set(value.x, updateOpts),
        sy.set(value.y, updateOpts),
      ])
    },
  }
}

// Convenience: spring for {x, y, o} (glare)
export function springVec3(
  initial: { x: number; y: number; o: number },
  onChange: (value: { x: number; y: number; o: number }) => void,
  opts: SpringOpts = {},
): Spring<{ x: number; y: number; o: number }> {
  const state = { x: initial.x, y: initial.y, o: initial.o }
  let dirty = false

  const flush = () => {
    if (dirty) {
      dirty = false
      onChange({ ...state })
    }
  }

  const sx = spring(initial.x, (v) => {
    state.x = v
    dirty = true
    queueMicrotask(flush)
  }, opts)

  const sy = spring(initial.y, (v) => {
    state.y = v
    dirty = true
    queueMicrotask(flush)
  }, opts)

  const so = spring(initial.o, (v) => {
    state.o = v
    dirty = true
    queueMicrotask(flush)
  }, opts)

  return {
    get stiffness() { return sx.stiffness },
    set stiffness(v) { sx.stiffness = v; sy.stiffness = v; so.stiffness = v },
    get damping() { return sx.damping },
    set damping(v) { sx.damping = v; sy.damping = v; so.damping = v },
    get precision() { return sx.precision },
    set precision(v) { sx.precision = v; sy.precision = v; so.precision = v },
    get() {
      return { x: sx.get(), y: sy.get(), o: so.get() }
    },
    async set(value, updateOpts) {
      await Promise.all([
        sx.set(value.x, updateOpts),
        sy.set(value.y, updateOpts),
        so.set(value.o, updateOpts),
      ])
    },
  }
}
