# Pocato Design Spec

## Overview

Pocato is a framework-agnostic interactive trading card UI library. The core logic (WebGL rendering, shader effects, pointer interaction, spring animations) lives in a vanilla TypeScript package. Thin framework adapters (React first, Angular and Web Component later) wrap the core for each ecosystem.

The library is extracted from the existing Angular-based `pocato-lib` (`@pineple/poca-card`), taking only the V2 (Three.js/WebGL) rendering path.

## Repository

- **Name:** `pineple/pocato`
- **License:** Open source (TBD)
- **Monorepo:** npm workspaces

## Packages

| Package | npm Name | Purpose |
|---|---|---|
| `packages/core` | `@pineple/pocato-core` | Vanilla TS core — rendering, interaction, animation |
| `packages/react` | `@pineple/pocato-react` | React adapter component |
| `packages/example` | (private) | Vite + React demo gallery |

### Future packages (out of scope for now)

- `@pineple/pocato-angular` — Angular adapter
- `@pineple/pocato-wc` — Web Component adapter

## Repository Structure

```
pocato/
├── packages/
│   ├── core/
│   │   ├── src/
│   │   │   ├── index.ts              # Public API exports
│   │   │   ├── poca-card.ts           # PocaCard controller class
│   │   │   ├── renderer/              # Three.js scene, camera, materials
│   │   │   ├── shaders/               # GLSL fragment/vertex shaders
│   │   │   ├── interaction/           # Pointer tracking, tilt/glare calculation
│   │   │   ├── animation/             # Spring physics, wiggle sequences
│   │   │   └── utils/                 # Math helpers (clamp, lerp, distance)
│   │   ├── tsup.config.ts
│   │   └── package.json
│   ├── react/
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   └── PocaCard.tsx           # React wrapper component
│   │   ├── tsup.config.ts
│   │   └── package.json
│   └── example/
│       ├── src/
│       │   ├── main.tsx
│       │   └── App.tsx                # Gallery page showing all card types
│       ├── public/images/             # Sample card images
│       ├── index.html
│       ├── vite.config.ts
│       └── package.json
├── package.json                       # npm workspaces root
├── tsconfig.base.json                 # Shared TypeScript config
└── .github/                           # CI/CD (future)
```

## Build & Distribution

- **Build tool:** tsup
- **Module format:** ESM only
- **Type declarations:** Generated via tsup (dts)
- **Three.js:** Bundled directly into core (not a peer dependency)
- **Publishing:** GitHub Packages Registry under `@pineple` scope

## Core Package Design (`@pineple/pocato-core`)

### Public API

```ts
class PocaCard {
  constructor(container: HTMLElement, options: PocaCardOptions)

  // Methods
  flip(): void
  wiggle(): void
  reset(): void
  updateOptions(options: Partial<PocaCardOptions>): void
  destroy(): void

  // Events
  on(event: 'flip', handler: (flipped: boolean) => void): void
  on(event: 'ready', handler: () => void): void
  on(event: 'error', handler: (error: Error) => void): void
  off(event: string, handler: Function): void
}

interface PocaCardOptions {
  type: 'glare' | 'glare-3d' | 'snowfall' | 'brush' | 'blur'
  baseImage: string
  popupImage?: string
  maskImage?: string
  backImage?: string
  flippable?: boolean            // default: false
  initialFlipped?: boolean       // default: false
  customShader?: string          // custom GLSL fragment shader code
}
```

### Internal Architecture

The `PocaCard` class composes three internal modules:

#### Renderer (`renderer/`)

- Creates and manages Three.js `Scene`, `Camera`, `WebGLRenderer`
- Sets up shader materials based on card `type`
- Handles canvas resize via `ResizeObserver` (container size tracking)
- Manages texture loading for base/popup/mask images
- Updates shader uniforms each frame (time, mouse, rotation, etc.)

**Source mapping:** Ported from `poca-v2.component.ts`

#### InteractionHandler (`interaction/`)

- Binds pointer events (`pointerdown`, `pointermove`, `pointerup`) on the container
- Converts pointer coordinates to rotation and glare values
- Handles double-click flip detection (gated by `flippable` option)
- Exposes callbacks for state changes (rotation, glare position, flip)
- Each `PocaCard` instance creates its own `InteractionHandler` — no shared singleton state

**Source mapping:** Ported from `move.service.ts` (Angular Signals/RxJS removed, replaced with plain callbacks. The Angular `providedIn: 'root'` singleton pattern is intentionally not carried over.)

#### AnimationLoop (`animation/`)

- Custom spring physics implementation (stiffness, damping, precision)
- `requestAnimationFrame`-based animation loop, shared as a singleton scheduler across all card instances on the page (same pattern as the original `motion.ts` `tasks` Set)
- Wiggle animation sequence (expand → rotate → shrink), reimplemented with the rAF-based spring/loop system (the Angular `motion` npm package dependency is dropped)
- Coordinates spring targets for interaction and flip transitions

**Source mapping:** Ported from `motion.ts` (RxJS `Observable` replaced with rAF + callbacks) and `circle.helper.ts`

#### Shaders (`shaders/`)

- GLSL fragment and vertex shaders, ported directly from `v2/shaders/`
- Available types: `glare`, `glare-3d`, `snowfall`, `brush`, `blur` — only these 5 are ported initially; other experimental shaders in the Angular source (`drop`, `heartfall`, `heartfirework`, `hexashield`, `startsunami`, `test`) are excluded from scope
- Supports custom shader injection at runtime via `customShader` option — `updateOptions({ customShader })` hot-swaps the fragment shader on the existing material without re-creating the scene

#### Utils (`utils/`)

- `round(value, precision)` — precision rounding
- `clamp(value, min, max)` — value clamping
- `adjust(value, fromMin, fromMax, toMin, toMax)` — linear interpolation/remapping
- `distance(x1, y1, x2, y2)` — 2D distance

**Source mapping:** Ported directly from `math.ts`

### Event System

Simple built-in `EventEmitter` (no external dependency):

- `on(event, handler)` — subscribe
- `off(event, handler)` — unsubscribe
- `emit(event, ...args)` — internal use only

### Sizing Strategy

The card fills its container element at 100% width and height. The library does not control sizing — consumers set the container dimensions via CSS. A `ResizeObserver` watches the container and updates the Three.js renderer (`renderer.setSize()`) and camera aspect ratio on resize. This is new behavior — the Angular source only sets size once at init; the core adds proper responsive resize handling.

### Shader Uniforms

Each frame, the renderer updates these uniforms:

| Uniform | Type | Description |
|---|---|---|
| `uTime` | `float` | Elapsed animation time |
| `uResolution` | `vec2` | Canvas resolution |
| `uMouse` | `vec2` | Normalized mouse position |
| `uMove` | `vec2` | Movement delta |
| `uRotate` | `vec2` | Card rotation (degrees) |
| `uCardOpacity` | `float` | Card transparency |
| `uImgBase` | `sampler2D` | Base image texture |
| `uImgPopup` | `sampler2D` | Popup image texture |
| `uImgMask` | `sampler2D` | Mask image texture |

## React Package Design (`@pineple/pocato-react`)

### Component API

```tsx
import { PocaCard, type PocaCardHandle } from '@pineple/pocato-react'

const cardRef = useRef<PocaCardHandle>(null)

<PocaCard
  ref={cardRef}
  type="glare"
  baseImage="/img/base.png"
  popupImage="/img/popup.png"
  flippable
  onFlip={(flipped) => {}}
  onReady={() => {}}
  onError={(error) => {}}
/>

// Imperative methods
cardRef.current.flip()
cardRef.current.wiggle()
cardRef.current.reset()
```

### PocaCardHandle

```ts
interface PocaCardHandle {
  flip(): void
  wiggle(): void
  reset(): void
}
```

### Implementation

A thin wrapper (~50-80 lines) using:

- `forwardRef` + `useImperativeHandle` for imperative API
- `useEffect` for core instance lifecycle (create on mount, destroy on unmount)
- `useEffect` for options sync (`updateOptions` on prop changes)
- `useEffect` for event binding/cleanup (`on`/`off`)
- `useRef` for container div reference

The React package depends on `@pineple/pocato-core` as a regular dependency.

## Example App

- **Framework:** Vite + React
- **Content:** Single-page gallery displaying all 5 card types
- **Controls:** Flip, wiggle, reset buttons per card
- **Purpose:** Development and visual testing
- **Publishing:** Private (`"private": true`), not published to npm

## Migration Path from pocato-lib

| Angular Source | Core Target |
|---|---|
| `v2/poca-v2.component.ts` | `renderer/`, `poca-card.ts` |
| `service/move.service.ts` | `interaction/` |
| `utils/motion.ts` | `animation/spring.ts` |
| `service/wiggles/circle.helper.ts` | `animation/wiggle.ts` |
| `v2/shaders/*.ts` | `shaders/` (direct copy) |
| `utils/math.ts` | `utils/math.ts` (direct copy) |
| `poca-card.component.ts` (V1 routing, `version` input) | Not ported — V2 only, no version routing needed |
| `v1/` | Not ported |
| `v2/shaders/` (experimental: drop, heartfall, etc.) | Not ported — only 5 core shader types |

## Key Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Rendering version | V2 only | WebGL/shader focus, V1 (CSS) is legacy |
| Three.js bundling | Direct bundle | Simpler DX, no peer dep management |
| State management | Event-based callbacks | No RxJS dependency, framework-agnostic |
| Module format | ESM only | Modern target, no CJS overhead |
| Sizing | Container-following | Flexible, responsive via CSS |
| Core pattern | Imperative Controller class | Natural for stateful WebGL lifecycle |
| Monorepo tool | npm workspaces | Minimal tooling, sufficient for 3 packages |
| Build tool | tsup | Fast, simple, ESM + dts |
| Wiggle animation | Reimplement with rAF spring | Drop `motion` npm dependency, use existing spring system |
| Error handling | `error` event on core | Texture loading failures etc. emitted as events |
