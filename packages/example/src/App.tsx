import { useEffect, useRef, type ReactNode } from 'react'
import { PocaCard, type PocaCardHandle } from '@sangwonl/pocato-react'

const BASE = import.meta.env.BASE_URL

const CARD_TYPES = [
  'glare',
  'glare-3d',
  'snowfall',
  'holo',
  'holo-3d',
] as const

interface CardDemoProps {
  type: typeof CARD_TYPES[number]
  index: number
  flipSpeed?: number
  frontContent?: ReactNode
  backContent?: ReactNode
}

function CardDemo({ type, index, flipSpeed, frontContent, backContent }: CardDemoProps) {
  const cardRef = useRef<PocaCardHandle>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      cardRef.current?.wiggle()
    }, 1000 * (index + 1))
    return () => clearTimeout(timer)
  }, [index])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <h3>{type}{flipSpeed != null ? ` (x${flipSpeed})` : ''}</h3>
      <PocaCard
        ref={cardRef}
        type={type}
        baseImage={`${BASE}images/sample-base.webp`}
        popupImage={`${BASE}images/sample-popup.webp`}
        backImage={backContent ? `${BASE}images/sample-base.webp` : undefined}
        flippable
        flipSpeed={flipSpeed}
        frontContent={frontContent}
        backContent={backContent}
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

const overlayBase: React.CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-end',
  padding: 16,
  boxSizing: 'border-box',
  color: '#fff',
  fontFamily: 'system-ui, sans-serif',
}

function FrontOverlay() {
  return (
    <div style={overlayBase}>
      <div style={{ fontSize: 20, fontWeight: 700, textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}>
        Pocato Card
      </div>
      <div style={{ fontSize: 12, opacity: 0.85, marginTop: 4, textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
        Double-click to flip
      </div>
    </div>
  )
}

function BackOverlay() {
  const stats = [
    { label: 'ATK', value: 85 },
    { label: 'DEF', value: 72 },
    { label: 'SPD', value: 91 },
    { label: 'HP', value: 120 },
  ]
  return (
    <div style={{
      ...overlayBase,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 10,
      background: 'rgba(0,0,0,0.45)',
      borderRadius: 12,
    }}>
      <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: 2 }}>STATS</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px', fontSize: 14 }}>
        {stats.map(s => (
          <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
            <span style={{ opacity: 0.7 }}>{s.label}</span>
            <span style={{ fontWeight: 600 }}>{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function App() {
  return (
    <div style={{ padding: 32 }}>
      <h1>Pocato Card Gallery</h1>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, marginTop: 24 }}>
        {CARD_TYPES.map((type, i) => (
          <CardDemo
            key={type}
            type={type}
            index={i}
            flipSpeed={i === 0 ? 0.2 : i === 1 ? 1 : i === 2 ? 5 : undefined}
            frontContent={i === 0 ? <FrontOverlay /> : undefined}
            backContent={i === 0 ? <BackOverlay /> : undefined}
          />
        ))}
      </div>
    </div>
  )
}
