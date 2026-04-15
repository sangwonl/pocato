# Pocato

Interactive trading card UI library with WebGL shader effects and 3D tilt interaction.

**[Live Demo](https://sangwonl.github.io/pocato/)**

## Features

- WebGL shader effects (glare, snowfall, blur, brush + 3D variants)
- Spring physics-based 3D card tilt on pointer interaction
- Flip animation with back face support
- Wiggle animation for attention-grabbing
- Custom shader injection
- Container-responsive sizing
- Framework-agnostic core + React adapter

## Packages

| Package | Description |
|---|---|
| `@sangwonl/pocato-core` | Vanilla TypeScript core |
| `@sangwonl/pocato-react` | React adapter component |

## Installation

```bash
# React
npm install @sangwonl/pocato-react

# Vanilla (core only)
npm install @sangwonl/pocato-core
```

## Usage (React)

```tsx
import { useRef } from 'react'
import { PocaCard, type PocaCardHandle } from '@sangwonl/pocato-react'

function App() {
  const cardRef = useRef<PocaCardHandle>(null)

  return (
    <div style={{ width: 300, height: 420 }}>
      <PocaCard
        ref={cardRef}
        type="glare-3d"
        baseImage="/images/card-base.png"
        popupImage="/images/card-popup.png"
        flippable
        onFlip={(flipped) => console.log('flipped:', flipped)}
      >
        {/* Optional: overlay content on front face */}
        <div style={{ padding: 12 }}>My Card</div>
      </PocaCard>

      <button onClick={() => cardRef.current?.flip()}>Flip</button>
      <button onClick={() => cardRef.current?.wiggle()}>Wiggle</button>
      <button onClick={() => cardRef.current?.reset()}>Reset</button>
    </div>
  )
}
```

## Usage (Vanilla)

```ts
import { PocaCard } from '@sangwonl/pocato-core'

const card = new PocaCard(document.getElementById('card-container')!, {
  type: 'glare-3d',
  baseImage: '/images/card-base.png',
  popupImage: '/images/card-popup.png',
  flippable: true,
})

card.on('flip', (flipped) => console.log('flipped:', flipped))
card.on('ready', () => console.log('card ready'))

// Imperative control
card.flip()
card.wiggle()
card.reset()

// Cleanup
card.destroy()
```

## Card Types

| Type | Description |
|---|---|
| `glare` | Basic glare with specular lighting |
| `glare-3d` | Glare with popup parallax offset |
| `snowfall` | Animated snowfall particles |
| `snowfall-3d` | Snowfall with popup parallax |
| `blur` | Gaussian blur base with sharp popup |
| `blur-3d` | Blur with popup parallax |
| `brush` | Kuwahara oil-painting filter |
| `brush-3d` | Brush with popup parallax |

## Props (React)

| Prop | Type | Description |
|---|---|---|
| `type` | `string` | Shader effect type |
| `baseImage` | `string` | Base card image URL |
| `popupImage` | `string` | Popup overlay image URL |
| `maskImage` | `string` | Mask image URL |
| `backImage` | `string` | Back face image URL |
| `flippable` | `boolean` | Enable double-click flip |
| `initialFlipped` | `boolean` | Start flipped |
| `customShader` | `string` | Custom GLSL fragment shader |
| `children` | `ReactNode` | Front face overlay content |
| `backContent` | `ReactNode` | Back face overlay content |
| `onFlip` | `(flipped: boolean) => void` | Flip event |
| `onReady` | `() => void` | Card ready event |
| `onError` | `(error: Error) => void` | Error event |
| `style` | `CSSProperties` | Container style |
| `className` | `string` | Container class |

## Imperative API

```ts
interface PocaCardHandle {
  flip(): void
  wiggle(): void
  reset(): void
}
```

## License

MIT
