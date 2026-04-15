# Pocato Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a framework-agnostic interactive card library (core + React adapter + example app) ported from the Angular-based pocato-lib V2 renderer.

**Architecture:** Imperative Controller pattern — `PocaCard` class manages Three.js scene, pointer interaction, and spring animations. React adapter wraps core via `useEffect`/`useImperativeHandle`. npm workspaces monorepo with tsup builds.

**Tech Stack:** TypeScript, Three.js, tsup, Vite, React 19

**Spec:** `docs/superpowers/specs/2026-04-15-pocato-design.md`

**Angular Source Reference:** `pocato-lib/projects/poca-card/src/lib/` (in this same repo)

---

## File Structure

```
packages/
├── core/
│   ├── src/
│   │   ├── index.ts                    # Public API: PocaCard, PocaCardOptions, types
│   │   ├── poca-card.ts                # Main PocaCard controller class
│   │   ├── types.ts                    # PocaCardType and shared type definitions
│   │   ├── event-emitter.ts            # Lightweight typed EventEmitter
│   │   ├── renderer/
│   │   │   ├── index.ts                # Renderer class (Three.js scene management)
│   │   │   └── shader-bootstrap.ts     # LYGIA shader chunk registration
│   │   ├── shaders/
│   │   │   ├── common.vert.ts          # Shared vertex shader
│   │   │   ├── glare.frag.ts           # Glare effect
│   │   │   ├── glare-3d.frag.ts        # 3D parallax glare
│   │   │   ├── snowfall.frag.ts        # Snowfall particles
│   │   │   ├── brush.frag.ts           # Kuwahara brush filter
│   │   │   ├── blur.frag.ts            # Gaussian blur filter
│   │   │   ├── utils/
│   │   │   │   ├── glsl.ts             # Tagged template literal helper
│   │   │   │   └── default-lighting.glsl.ts  # Blinn-Phong lighting function
│   │   │   └── lygia/                  # LYGIA shader library chunks (copy)
│   │   ├── interaction/
│   │   │   └── index.ts                # InteractionHandler class
│   │   ├── animation/
│   │   │   ├── spring.ts               # Spring physics (ported from motion.ts)
│   │   │   └── wiggle.ts               # Wiggle animation (ported from circle.helper.ts)
│   │   └── utils/
│   │       └── math.ts                 # round, clamp, adjust, distance
│   ├── package.json
│   ├── tsconfig.json
│   └── tsup.config.ts
├── react/
│   ├── src/
│   │   ├── index.ts                    # Re-export PocaCard component + types
│   │   └── PocaCard.tsx                # React wrapper component
│   ├── package.json
│   ├── tsconfig.json
│   └── tsup.config.ts
└── example/
    ├── src/
    │   ├── main.tsx                    # React entry point
    │   └── App.tsx                     # Gallery page with all card types
    ├── public/
    │   └── images/                     # Sample card images
    ├── index.html
    ├── package.json
    └── vite.config.ts
```

---

## Task 1: Monorepo Scaffolding

**Files:**
- Create: `package.json` (root)
- Create: `tsconfig.base.json`
- Create: `.gitignore`
- Create: `packages/core/package.json`
- Create: `packages/core/tsconfig.json`
- Create: `packages/core/tsup.config.ts`
- Create: `packages/react/package.json`
- Create: `packages/react/tsconfig.json`
- Create: `packages/react/tsup.config.ts`
- Create: `packages/example/package.json`
- Create: `packages/example/vite.config.ts`
- Create: `packages/example/tsconfig.json`
- Create: `packages/example/index.html`

- [ ] **Step 1: Create root package.json**

```json
{
  "name": "pocato",
  "private": true,
  "workspaces": [
    "packages/*"
  ],
  "scripts": {
    "build": "npm run build -w packages/core && npm run build -w packages/react",
    "dev": "npm run dev -w packages/example"
  }
}
```

- [ ] **Step 2: Create tsconfig.base.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

- [ ] **Step 3: Create .gitignore**

```
node_modules/
dist/
*.tsbuildinfo
```

- [ ] **Step 4: Create packages/core/package.json**

```json
{
  "name": "@pineple/pocato-core",
  "version": "0.1.0",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "files": ["dist"],
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch"
  },
  "dependencies": {
    "three": "^0.179.0"
  },
  "devDependencies": {
    "tsup": "^8.0.0",
    "typescript": "^5.8.0",
    "@types/three": "^0.179.0"
  }
}
```

- [ ] **Step 5: Create packages/core/tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src"]
}
```

- [ ] **Step 6: Create packages/core/tsup.config.ts**

```ts
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
})
```

- [ ] **Step 7: Create packages/react/package.json**

```json
{
  "name": "@pineple/pocato-react",
  "version": "0.1.0",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "files": ["dist"],
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch"
  },
  "dependencies": {
    "@pineple/pocato-core": "0.1.0"
  },
  "peerDependencies": {
    "react": "^18.0.0 || ^19.0.0",
    "react-dom": "^18.0.0 || ^19.0.0"
  },
  "devDependencies": {
    "tsup": "^8.0.0",
    "typescript": "^5.8.0",
    "react": "^19.0.0",
    "@types/react": "^19.0.0"
  }
}
```

- [ ] **Step 8: Create packages/react/tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "jsx": "react-jsx"
  },
  "include": ["src"]
}
```

- [ ] **Step 9: Create packages/react/tsup.config.ts**

```ts
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom'],
})
```

- [ ] **Step 10: Create packages/example/package.json**

```json
{
  "name": "pocato-example",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  },
  "dependencies": {
    "@pineple/pocato-react": "0.1.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "typescript": "^5.8.0",
    "vite": "^6.0.0"
  }
}
```

- [ ] **Step 11: Create packages/example/vite.config.ts**

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

- [ ] **Step 12: Create packages/example/tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "jsx": "react-jsx"
  },
  "include": ["src"]
}
```

- [ ] **Step 13: Create packages/example/index.html**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Pocato Example</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 14: Install dependencies and verify workspace**

Run: `npm install`
Expected: Successful install, `node_modules` created, workspace symlinks in place.

- [ ] **Step 15: Commit**

```bash
git add -A
git commit -m "chore: scaffold pocato monorepo with core, react, and example packages"
```

---

## Task 2: Core Utils & Event Emitter

**Files:**
- Create: `packages/core/src/utils/math.ts`
- Create: `packages/core/src/event-emitter.ts`

- [ ] **Step 1: Create math.ts**

Port directly from `pocato-lib/projects/poca-card/src/lib/utils/math.ts`:

```ts
export const round = (value: number, precision = 3): number =>
  parseFloat(value.toFixed(precision))

export const clamp = (value: number, min = 0, max = 100): number =>
  Math.min(Math.max(value, min), max)

export const adjust = (
  value: number,
  fromMin: number,
  fromMax: number,
  toMin: number,
  toMax: number,
): number =>
  round(toMin + ((toMax - toMin) * (value - fromMin)) / (fromMax - fromMin))

export const distance = (x1: number, y1: number, x2: number, y2: number): number =>
  Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
```

- [ ] **Step 2: Create event-emitter.ts**

```ts
type Handler = (...args: any[]) => void

export class EventEmitter {
  private listeners = new Map<string, Set<Handler>>()

  on(event: string, handler: Handler): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(handler)
  }

  off(event: string, handler: Handler): void {
    this.listeners.get(event)?.delete(handler)
  }

  protected emit(event: string, ...args: any[]): void {
    this.listeners.get(event)?.forEach((handler) => {
      try {
        handler(...args)
      } catch (e) {
        console.error(`[pocato] Error in ${event} handler:`, e)
      }
    })
  }

  protected removeAllListeners(): void {
    this.listeners.clear()
  }
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build -w packages/core`
Expected: Build succeeds (even though index.ts is empty, tsup should handle it).

- [ ] **Step 4: Commit**

```bash
git add packages/core/src/utils/math.ts packages/core/src/event-emitter.ts
git commit -m "feat(core): add math utilities and event emitter"
```

---

## Task 3: Spring Physics

**Files:**
- Create: `packages/core/src/animation/spring.ts`

Port from `pocato-lib/projects/poca-card/src/lib/utils/motion.ts`, removing RxJS `BehaviorSubject` and replacing with callback-based approach.

- [ ] **Step 1: Create spring.ts**

```ts
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
    stiffness: opts.stiffness ?? 0.15,
    damping: opts.damping ?? 0.8,
    precision: opts.precision ?? 0.01,
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
    stiffness: opts.stiffness ?? 0.15,
    damping: opts.damping ?? 0.8,
    precision: opts.precision ?? 0.01,
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
```

- [ ] **Step 2: Verify build**

Run: `npm run build -w packages/core`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add packages/core/src/animation/spring.ts
git commit -m "feat(core): add spring physics animation system"
```

---

## Task 4: Shaders

**Files:**
- Create: `packages/core/src/shaders/utils/glsl.ts`
- Create: `packages/core/src/shaders/utils/default-lighting.glsl.ts`
- Create: `packages/core/src/shaders/common.vert.ts`
- Create: `packages/core/src/shaders/glare.frag.ts`
- Create: `packages/core/src/shaders/glare-3d.frag.ts`
- Create: `packages/core/src/shaders/snowfall.frag.ts`
- Create: `packages/core/src/shaders/brush.frag.ts`
- Create: `packages/core/src/shaders/blur.frag.ts`
- Copy: `packages/core/src/shaders/lygia/` directory
- Create: `packages/core/src/renderer/shader-bootstrap.ts`

- [ ] **Step 1: Copy shader utility files**

Copy these files directly from Angular source:
- `pocato-lib/projects/poca-card/src/lib/v2/shaders/utils/glsl.ts` → `packages/core/src/shaders/utils/glsl.ts`
- `pocato-lib/projects/poca-card/src/lib/v2/shaders/utils/defaultLighting.glsl.ts` → `packages/core/src/shaders/utils/default-lighting.glsl.ts`

Rename the import path if needed but keep content identical.

- [ ] **Step 2: Copy vertex shader**

Copy `pocato-lib/projects/poca-card/src/lib/v2/shaders/common.vert.ts` → `packages/core/src/shaders/common.vert.ts`

Content is framework-agnostic GLSL, direct copy.

- [ ] **Step 3: Copy fragment shaders (5 in-scope)**

Copy the **un-minified** `.frag.ts` variants (not `.frag.min.ts`) from Angular source. The un-minified versions are more maintainable and contain `#include` directives resolved by the LYGIA bootstrap. Adjust import paths for `glsl` and `defaultLighting`:
- `glare.frag.ts`
- `glare-3d.frag.ts`
- `snowfall.frag.ts`
- `brush.frag.ts`
- `blur.frag.ts`

Update imports from `'./utils/glsl'` and `'./utils/defaultLighting.glsl'` to match new paths (`'./utils/glsl'` and `'./utils/default-lighting.glsl'`).

- [ ] **Step 4: Copy LYGIA shader library**

Copy the entire `pocato-lib/projects/poca-card/src/lib/v2/shaders/lygia/` directory to `packages/core/src/shaders/lygia/`.

These are static GLSL string exports, no framework dependency.

- [ ] **Step 5: Create shader-bootstrap.ts**

Copy verbatim from `pocato-lib/projects/poca-card/src/lib/v2/shaders/bootstrap.ts`, updating import paths from `'./lygia/...'` to `'../shaders/lygia/...'`.

The file contains ~62 lines of LYGIA chunk imports and `THREE.ShaderChunk` registrations. The logic is pure Three.js with no Angular dependency. Wrap the registration in a function:

```ts
import * as THREE from 'three'
// Copy ALL import lines from bootstrap.ts, updating paths

let bootstrapped = false

export function bootstrapShaders(): void {
  if (bootstrapped) return
  bootstrapped = true

  // Copy ALL THREE.ShaderChunk assignments from bootstrap.ts verbatim
  // e.g. THREE.ShaderChunk['lygia/...'] = importedChunk
}
```

Add the `bootstrapped` guard to avoid redundant registration when multiple cards exist on the same page.

- [ ] **Step 6: Verify build**

Run: `npm run build -w packages/core`
Expected: Build succeeds.

- [ ] **Step 7: Commit**

```bash
git add packages/core/src/shaders/ packages/core/src/renderer/shader-bootstrap.ts
git commit -m "feat(core): add GLSL shaders and LYGIA bootstrap"
```

---

## Task 5: Renderer

**Files:**
- Create: `packages/core/src/renderer/index.ts`

Port the Three.js setup from `poca-v2.component.ts`, extracting only the rendering concerns.

- [ ] **Step 1: Create renderer/index.ts**

```ts
import * as THREE from 'three'
import { bootstrapShaders } from './shader-bootstrap'
import { vertexShader } from '../shaders/common.vert'
import { fragShaderGlare } from '../shaders/glare.frag'
import { fragShaderGlare3d } from '../shaders/glare-3d.frag'
import { fragShaderSnowfall } from '../shaders/snowfall.frag'
import { fragBrushGlare } from '../shaders/brush.frag'
import { fragBlurGlare } from '../shaders/blur.frag'
import type { PocaCardType } from '../types'

const FRAG_SHADERS: Record<PocaCardType, string> = {
  'glare': fragShaderGlare,
  'glare-3d': fragShaderGlare3d,
  'snowfall': fragShaderSnowfall,
  'brush': fragBrushGlare,
  'blur': fragBlurGlare,
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

    const fragmentShader = this.options.customShader
      ?? FRAG_SHADERS[this.options.type]

    this.material = new THREE.ShaderMaterial({
      vertexShader,
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

    // Signal ready after base image attempt
    // (matching Angular behavior — ready fires after init, not after all textures load)
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

  // Called by InteractionHandler to update uniforms
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
    this.material.fragmentShader = fragmentShader
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
```

Note: `PocaCardType` will be defined in the types section of `index.ts`. For now, define it inline or create a `types.ts`:

```ts
// packages/core/src/types.ts
export type PocaCardType = 'glare' | 'glare-3d' | 'snowfall' | 'brush' | 'blur'
```

- [ ] **Step 2: Verify build**

Run: `npm run build -w packages/core`
Expected: Build succeeds (imports from shaders must resolve correctly).

- [ ] **Step 3: Commit**

```bash
git add packages/core/src/renderer/ packages/core/src/types.ts
git commit -m "feat(core): add Three.js renderer with shader material and resize handling"
```

---

## Task 6: Interaction Handler

**Files:**
- Create: `packages/core/src/interaction/index.ts`

Port from `move.service.ts`, removing Angular Signals and RxJS. Each `PocaCard` instance gets its own handler.

- [ ] **Step 1: Create interaction/index.ts**

```ts
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
  private lastClickTime = 0
  private clickCount = 0
  private dblClickTimer: ReturnType<typeof setTimeout> | null = null

  // Bound event handlers for cleanup
  private boundPointerDown: (e: PointerEvent) => void
  private boundPointerMove: (e: PointerEvent) => void
  private boundPointerUp: (e: PointerEvent) => void
  private boundClick: (e: MouseEvent) => void

  constructor(
    private container: HTMLElement,
    private callbacks: InteractionCallbacks,
    private flippable: boolean,
    initialFlipped: boolean,
  ) {
    this.flipped = initialFlipped

    this.springRotate = springVec2({ x: 0, y: 0 }, (v) => {
      callbacks.onRotate(v)
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

    this.container.addEventListener('pointerdown', this.boundPointerDown)
    this.container.addEventListener('pointermove', this.boundPointerMove)
    this.container.addEventListener('pointerup', this.boundPointerUp)
    this.container.addEventListener('pointerleave', this.boundPointerUp)
    this.container.addEventListener('click', this.boundClick)
  }

  updateRect(rect: Rect): void {
    this.boundingRect = rect
  }

  private onPointerDown(e: PointerEvent): void {
    e.preventDefault()
    this.interacting = true
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

  private onPointerUp(_e: PointerEvent): void {
    if (!this.interacting) return
    this.interacting = false
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
    this.container.removeEventListener('pointerdown', this.boundPointerDown)
    this.container.removeEventListener('pointermove', this.boundPointerMove)
    this.container.removeEventListener('pointerup', this.boundPointerUp)
    this.container.removeEventListener('pointerleave', this.boundPointerUp)
    this.container.removeEventListener('click', this.boundClick)
    if (this.dblClickTimer) clearTimeout(this.dblClickTimer)
  }
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build -w packages/core`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add packages/core/src/interaction/
git commit -m "feat(core): add interaction handler with pointer tracking and flip detection"
```

---

## Task 7: Wiggle Animation

**Files:**
- Create: `packages/core/src/animation/wiggle.ts`

Port from `circle.helper.ts`, replacing `motion` library's `animate()` with rAF-based tweens.

- [ ] **Step 1: Create wiggle.ts**

```ts
export interface WiggleController {
  stop(): void
}

type EasingFn = (t: number) => number

const easeOut: EasingFn = (t) => 1 - (1 - t) ** 3
const easeInOut: EasingFn = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2
const easeIn: EasingFn = (t) => t * t * t

interface TweenOpts {
  from: number
  to: number
  duration: number
  easing: EasingFn
  onUpdate: (value: number) => void
}

function tween(opts: TweenOpts): Promise<void> & { cancel: () => void } {
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

  const controller = Object.assign(promise, {
    cancel() {
      cancelled = true
      if (rafId !== null) cancelAnimationFrame(rafId)
    },
  })

  return controller
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
```

- [ ] **Step 2: Verify build**

Run: `npm run build -w packages/core`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add packages/core/src/animation/wiggle.ts
git commit -m "feat(core): add wiggle animation with rAF-based tweens"
```

---

## Task 8: PocaCard Main Controller

**Files:**
- Create: `packages/core/src/poca-card.ts`
- Create: `packages/core/src/index.ts`

This is the main public API class that composes Renderer, InteractionHandler, and wiggle animation.

- [ ] **Step 1: Create poca-card.ts**

```ts
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

    this.interaction = new InteractionHandler(
      container,
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
```

- [ ] **Step 2: Create index.ts**

```ts
export { PocaCard } from './poca-card'
export type { PocaCardOptions } from './poca-card'
export type { PocaCardType } from './types'
```

- [ ] **Step 3: Build core package**

Run: `npm run build -w packages/core`
Expected: Build succeeds, `dist/` contains `index.js`, `index.d.ts`.

- [ ] **Step 4: Commit**

```bash
git add packages/core/src/poca-card.ts packages/core/src/index.ts
git commit -m "feat(core): add PocaCard controller class with public API"
```

---

## Task 9: React Adapter

**Files:**
- Create: `packages/react/src/PocaCard.tsx`
- Create: `packages/react/src/index.ts`

- [ ] **Step 1: Create PocaCard.tsx**

```tsx
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  type CSSProperties,
} from 'react'
import { PocaCard as CorePocaCard, type PocaCardOptions } from '@pineple/pocato-core'

export interface PocaCardHandle {
  flip(): void
  wiggle(): void
  reset(): void
}

export interface PocaCardProps {
  type: PocaCardOptions['type']
  baseImage: string
  popupImage?: string
  maskImage?: string
  backImage?: string
  flippable?: boolean
  initialFlipped?: boolean
  customShader?: string
  onFlip?: (flipped: boolean) => void
  onReady?: () => void
  onError?: (error: Error) => void
  style?: CSSProperties
  className?: string
}

export const PocaCard = forwardRef<PocaCardHandle, PocaCardProps>(
  (props, ref) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const cardRef = useRef<CorePocaCard | null>(null)

    // Create/destroy core instance
    useEffect(() => {
      if (!containerRef.current) return

      const card = new CorePocaCard(containerRef.current, {
        type: props.type,
        baseImage: props.baseImage,
        popupImage: props.popupImage,
        maskImage: props.maskImage,
        backImage: props.backImage,
        flippable: props.flippable,
        initialFlipped: props.initialFlipped,
        customShader: props.customShader,
      })

      cardRef.current = card

      return () => {
        card.destroy()
        cardRef.current = null
      }
    // Re-create only when type changes (major config change)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.type])

    // Sync image options
    useEffect(() => {
      cardRef.current?.updateOptions({
        baseImage: props.baseImage,
        popupImage: props.popupImage,
        maskImage: props.maskImage,
      })
    }, [props.baseImage, props.popupImage, props.maskImage])

    // Sync custom shader
    useEffect(() => {
      if (props.customShader) {
        cardRef.current?.updateOptions({ customShader: props.customShader })
      }
    }, [props.customShader])

    // Bind events
    useEffect(() => {
      const card = cardRef.current
      if (!card) return

      const onFlip = props.onFlip
      const onReady = props.onReady
      const onError = props.onError

      if (onFlip) card.on('flip', onFlip)
      if (onReady) card.on('ready', onReady)
      if (onError) card.on('error', onError)

      return () => {
        if (onFlip) card.off('flip', onFlip)
        if (onReady) card.off('ready', onReady)
        if (onError) card.off('error', onError)
      }
    }, [props.onFlip, props.onReady, props.onError])

    // Expose imperative handle
    useImperativeHandle(ref, () => ({
      flip: () => cardRef.current?.flip(),
      wiggle: () => cardRef.current?.wiggle(),
      reset: () => cardRef.current?.reset(),
    }))

    return (
      <div
        ref={containerRef}
        style={props.style}
        className={props.className}
      />
    )
  },
)

PocaCard.displayName = 'PocaCard'
```

- [ ] **Step 2: Create index.ts**

```ts
export { PocaCard } from './PocaCard'
export type { PocaCardHandle, PocaCardProps } from './PocaCard'
export type { PocaCardType } from '@pineple/pocato-core'
```

- [ ] **Step 3: Build react package**

Run: `npm run build -w packages/core && npm run build -w packages/react`
Expected: Both packages build successfully.

- [ ] **Step 4: Commit**

```bash
git add packages/react/src/
git commit -m "feat(react): add PocaCard React adapter component"
```

---

## Task 10: Example App

**Files:**
- Create: `packages/example/src/main.tsx`
- Create: `packages/example/src/App.tsx`
- Add: sample images to `packages/example/public/images/`

- [ ] **Step 1: Create main.tsx**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 2: Create App.tsx**

```tsx
import { useRef } from 'react'
import { PocaCard, type PocaCardHandle } from '@pineple/pocato-react'

const CARD_TYPES = ['glare', 'glare-3d', 'snowfall', 'brush', 'blur'] as const

function CardDemo({ type }: { type: typeof CARD_TYPES[number] }) {
  const cardRef = useRef<PocaCardHandle>(null)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <h3>{type}</h3>
      <PocaCard
        ref={cardRef}
        type={type}
        baseImage="/images/sample-base.png"
        popupImage="/images/sample-popup.png"
        flippable
        onFlip={(f) => console.log(`${type} flipped:`, f)}
        onReady={() => console.log(`${type} ready`)}
        style={{ width: 250, height: 350 }}
      />
      <div style={{ display: 'flex', gap: 4 }}>
        <button onClick={() => cardRef.current?.flip()}>Flip</button>
        <button onClick={() => cardRef.current?.wiggle()}>Wiggle</button>
        <button onClick={() => cardRef.current?.reset()}>Reset</button>
      </div>
    </div>
  )
}

export function App() {
  return (
    <div style={{ padding: 32 }}>
      <h1>Pocato Card Gallery</h1>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, marginTop: 24 }}>
        {CARD_TYPES.map((type) => (
          <CardDemo key={type} type={type} />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Add sample images**

Copy sample card images from the Angular project or use placeholder images:

```bash
mkdir -p packages/example/public/images
# Copy from Angular project if available, or use placeholder PNGs
cp pocato-lib/path/to/sample/images/* packages/example/public/images/ 2>/dev/null || echo "Add sample images manually to packages/example/public/images/"
```

Need at minimum:
- `sample-base.png` — base card artwork
- `sample-popup.png` — popup/overlay layer (transparent PNG)

- [ ] **Step 4: Build all packages and start dev server**

Run: `npm run build && npm run dev`
Expected: Vite dev server starts, gallery page loads at `http://localhost:5173` with 5 card types displayed.

- [ ] **Step 5: Manual visual verification**

Check in browser:
- All 5 card types render with WebGL canvas
- Mouse hover produces 3D tilt effect
- Glare/shine follows cursor
- Flip button triggers card flip animation
- Wiggle button triggers circular wiggle animation
- Reset button returns card to default state
- Resizing browser window updates card canvas correctly

- [ ] **Step 6: Commit**

```bash
git add packages/example/
git commit -m "feat(example): add Vite gallery app with all card types"
```

---

## Task 11: Final Integration & Cleanup

**Files:**
- Modify: various files for any issues found during testing

- [ ] **Step 1: Full build from clean state**

```bash
rm -rf packages/*/dist node_modules
npm install
npm run build
```

Expected: All packages build cleanly.

- [ ] **Step 2: Run example and verify**

```bash
npm run dev
```

Open browser, verify all card interactions work.

- [ ] **Step 3: Verify package exports**

Check that `@pineple/pocato-core` exports:
- `PocaCard` class
- `PocaCardOptions` type
- `PocaCardType` type

Check that `@pineple/pocato-react` exports:
- `PocaCard` component
- `PocaCardHandle` type
- `PocaCardProps` type
- `PocaCardType` type (re-export)

- [ ] **Step 4: Commit any fixes**

```bash
git add -A
git commit -m "fix: integration fixes and cleanup"
```
