import { useRef } from 'react'
import { PocaCard, type PocaCardHandle } from '@sangwonl/pocato-react'

const CARD_TYPES = [
  'glare',
  'glare-3d',
  'snowfall',
  'snowfall-3d',
  'brush',
  'brush-3d',
  'blur',
  'blur-3d'
] as const

function CardDemo({ type }: { type: typeof CARD_TYPES[number] }) {
  const cardRef = useRef<PocaCardHandle>(null)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <h3>{type}</h3>
      <PocaCard
        ref={cardRef}
        type={type}
        baseImage="/images/sample-base.webp"
        popupImage="/images/sample-popup.webp"
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
