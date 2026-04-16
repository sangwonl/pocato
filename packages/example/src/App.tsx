import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from 'react'
import { PocaCard, type PocaCardHandle } from '@sangwonl/pocato-react'

const BASE = import.meta.env.BASE_URL

// ─── Custom Shader (sepia tone) ──────────────────────────────────────────────

const CUSTOM_SHADER_SEPIA = `
#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 uResolution;
uniform vec2 uMouse;
uniform vec2 uMove;
uniform vec2 uRotate;
uniform float uTime;
uniform sampler2D uImgBase;
uniform sampler2D uImgPopup;

varying vec2 vUv;

#include <utils/defaultLighting>

void main() {
  vec4 baseColor = texture2D(uImgBase, vUv);
  vec4 popupColor = texture2D(uImgPopup, vUv);

  float aSoft = smoothstep(0.4, 1.0, popupColor.a);
  vec4 pocaColor = mix(baseColor, popupColor, aSoft);

  // Sepia transform
  float r = dot(pocaColor.rgb, vec3(0.393, 0.769, 0.189));
  float g = dot(pocaColor.rgb, vec3(0.349, 0.686, 0.168));
  float b = dot(pocaColor.rgb, vec3(0.272, 0.534, 0.131));
  vec3 sepia = vec3(r, g, b);

  // Vignette
  vec2 center = vUv - 0.5;
  float vignette = 1.0 - dot(center, center) * 1.2;

  gl_FragColor = defaultLighting(vec4(sepia * vignette, 1.0), uResolution, uRotate, 1.0);
}
`

// ─── Section Config ──────────────────────────────────────────────────────────

interface CardConfig {
  type: string
  label: string
  description: string
  flipSpeed?: number
  customShader?: string
  backImage?: string
  frontContent?: ReactNode
  backContent?: ReactNode
}

interface SectionConfig {
  title: string
  subtitle: string
  cards: CardConfig[]
}

const SECTIONS: SectionConfig[] = [
  {
    title: 'Shader Effects',
    subtitle: 'Built-in WebGL shader types',
    cards: [
      { type: 'holo-3d', label: 'Holo 3D', description: 'Holographic iridescence with parallax' },
      { type: 'holo', label: 'Holo', description: 'Rainbow color shift on tilt' },
      { type: 'glare-3d', label: 'Glare 3D', description: 'Specular lighting with parallax' },
      { type: 'glare', label: 'Glare', description: 'Classic light reflection' },
      { type: 'snowfall', label: 'Snowfall', description: 'Procedural falling snow' },
    ],
  },
  {
    title: 'Front & Back Content',
    subtitle: 'Overlay HTML content on card faces via React portals',
    cards: [
      {
        type: 'holo-3d',
        label: 'Front Overlay',
        description: 'HTML content on front face',
        frontContent: <FrontOverlay />,
      },
      {
        type: 'glare-3d',
        label: 'Back Overlay',
        description: 'Flip to see back content',
        backImage: `${BASE}images/sample-base.webp`,
        backContent: <BackOverlay />,
      },
      {
        type: 'holo',
        label: 'Both Sides',
        description: 'Content on front and back',
        backImage: `${BASE}images/sample-base.webp`,
        frontContent: <FrontOverlay />,
        backContent: <BackOverlay />,
      },
    ],
  },
  {
    title: 'Flip Speed',
    subtitle: 'Control flip animation speed with flipSpeed multiplier',
    cards: [
      { type: 'glare', label: 'Slow (x0.2)', description: 'flipSpeed={0.2}', flipSpeed: 0.2 },
      { type: 'glare', label: 'Normal (x1)', description: 'flipSpeed={1} (default)', flipSpeed: 1 },
      { type: 'glare', label: 'Fast (x5)', description: 'flipSpeed={5}', flipSpeed: 5 },
    ],
  },
  {
    title: 'Custom Shader',
    subtitle: 'Pass your own GLSL fragment shader',
    cards: [
      {
        type: 'custom',
        label: 'Sepia + Vignette',
        description: 'Custom GLSL with sepia tone',
        customShader: CUSTOM_SHADER_SEPIA,
      },
    ],
  },
]

// ─── Overlays ────────────────────────────────────────────────────────────────

function FrontOverlay() {
  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
      padding: 20, boxSizing: 'border-box',
    }}>
      <div style={{
        fontSize: 22, fontFamily: "'Unbounded', sans-serif", fontWeight: 700,
        color: '#fff', textShadow: '0 2px 12px rgba(0,0,0,0.7)',
      }}>
        Pocato
      </div>
      <div style={{
        fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 4,
        letterSpacing: 1.5, textTransform: 'uppercase',
        textShadow: '0 1px 4px rgba(0,0,0,0.5)',
      }}>
        Double-click to flip
      </div>
    </div>
  )
}

function BackOverlay() {
  const stats = [
    { label: 'ATK', value: 85, color: '#ff6b6b' },
    { label: 'DEF', value: 72, color: '#4ecdc4' },
    { label: 'SPD', value: 91, color: '#ffe66d' },
    { label: 'HP', value: 120, color: '#a8e6cf' },
  ]
  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      justifyContent: 'center', alignItems: 'center', gap: 16,
      background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)',
      borderRadius: 12, boxSizing: 'border-box', padding: 24,
    }}>
      <div style={{
        fontSize: 13, fontWeight: 600, letterSpacing: 3,
        textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)',
        fontFamily: "'Unbounded', sans-serif",
      }}>
        Stats
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '60%' }}>
        {stats.map(s => (
          <div key={s.label}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              fontSize: 12, marginBottom: 4, color: 'rgba(255,255,255,0.7)',
            }}>
              <span>{s.label}</span>
              <span style={{ fontWeight: 600, color: '#fff' }}>{s.value}</span>
            </div>
            <div style={{ height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.08)' }}>
              <div style={{
                height: '100%', borderRadius: 2,
                width: `${(s.value / 150) * 100}%`,
                background: s.color,
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Card Demo ───────────────────────────────────────────────────────────────

function CardDemo({ config, index }: { config: CardConfig; index: number }) {
  const cardRef = useRef<PocaCardHandle>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 120 * index)
    const t2 = setTimeout(() => cardRef.current?.wiggle(), 1000 + 600 * index)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [index])

  const btn: CSSProperties = {
    padding: '6px 14px',
    fontSize: 12,
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 500,
    color: 'rgba(255,255,255,0.7)',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 6,
    cursor: 'pointer',
    transition: 'all 0.2s',
    backdropFilter: 'blur(4px)',
  }

  const hoverIn = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.background = 'rgba(255,255,255,0.12)'
    e.currentTarget.style.color = '#fff'
  }
  const hoverOut = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
    e.currentTarget.style.color = 'rgba(255,255,255,0.7)'
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(24px)',
      transition: 'opacity 0.6s ease, transform 0.6s ease',
    }}>
      {/* Badge */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <span style={{
          display: 'inline-block',
          padding: '4px 12px', fontSize: 11, fontWeight: 600,
          letterSpacing: 1.5, textTransform: 'uppercase',
          color: '#a78bfa',
          background: 'rgba(167, 139, 250, 0.1)',
          border: '1px solid rgba(167, 139, 250, 0.2)',
          borderRadius: 20,
          fontFamily: "'Unbounded', sans-serif",
        }}>
          {config.label}
        </span>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', maxWidth: 200, textAlign: 'center' }}>
          {config.description}
        </span>
      </div>

      {/* Card */}
      <PocaCard
        ref={cardRef}
        type={config.type}
        baseImage={`${BASE}images/sample-base.webp`}
        popupImage={`${BASE}images/sample-popup.webp`}
        backImage={config.backImage}
        flippable
        flipSpeed={config.flipSpeed}
        customShader={config.customShader}
        frontContent={config.frontContent}
        backContent={config.backContent}
        onFlip={(f) => console.log(`${config.label} flipped:`, f)}
        onReady={() => console.log(`${config.label} ready`)}
        style={{ width: 240, height: 336 }}
      />

      {/* Controls */}
      <div style={{ display: 'flex', gap: 6 }}>
        <button style={btn} onMouseEnter={hoverIn} onMouseLeave={hoverOut}
          onClick={() => cardRef.current?.flip()}>Flip</button>
        <button style={btn} onMouseEnter={hoverIn} onMouseLeave={hoverOut}
          onClick={() => cardRef.current?.wiggle()}>Wiggle</button>
        <button style={btn} onMouseEnter={hoverIn} onMouseLeave={hoverOut}
          onClick={() => cardRef.current?.reset()}>Reset</button>
      </div>
    </div>
  )
}

// ─── Section ─────────────────────────────────────────────────────────────────

function Section({ section, baseIndex }: { section: SectionConfig; baseIndex: number }) {
  return (
    <section style={{ width: '100%' }}>
      {/* Section header */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <h2 style={{
          fontFamily: "'Unbounded', sans-serif",
          fontSize: 24, fontWeight: 700,
          color: '#e8e6e3',
          marginBottom: 8,
        }}>
          {section.title}
        </h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.35)', maxWidth: 400, marginInline: 'auto' }}>
          {section.subtitle}
        </p>
      </div>

      {/* Cards */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 48,
      }}>
        {section.cards.map((config, i) => (
          <CardDemo key={`${config.type}-${config.label}`} config={config} index={baseIndex + i} />
        ))}
      </div>
    </section>
  )
}

// ─── App ─────────────────────────────────────────────────────────────────────

export function App() {
  let runningIndex = 0

  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* Ambient glow */}
      <div style={{
        position: 'fixed', top: '-30%', left: '50%', transform: 'translateX(-50%)',
        width: '120vw', height: '60vh',
        background: 'radial-gradient(ellipse at center, rgba(167,139,250,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Hero */}
      <header style={{ textAlign: 'center', padding: '80px 24px 48px' }}>
        <h1 style={{
          fontFamily: "'Unbounded', sans-serif",
          fontSize: 'clamp(36px, 6vw, 56px)',
          fontWeight: 900, letterSpacing: -1,
          background: 'linear-gradient(135deg, #e8e6e3 30%, #a78bfa 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          lineHeight: 1.1,
        }}>
          Pocato
        </h1>
        <p style={{
          marginTop: 16, fontSize: 16,
          color: 'rgba(255,255,255,0.4)',
          maxWidth: 420, marginInline: 'auto', lineHeight: 1.6,
        }}>
          Interactive card effects powered by WebGL shaders.
          <br />
          Drag, tilt, and double-click to explore.
        </p>
      </header>

      {/* Sections */}
      <main style={{
        display: 'flex', flexDirection: 'column', gap: 80,
        padding: '32px 24px 96px',
        maxWidth: 1400, marginInline: 'auto',
      }}>
        {SECTIONS.map((section) => {
          const idx = runningIndex
          runningIndex += section.cards.length
          return (
            <div key={section.title}>
              {/* Divider */}
              <div style={{
                marginBottom: 48, marginInline: 'auto',
                width: 48, height: 1,
                background: 'linear-gradient(90deg, transparent, rgba(167,139,250,0.3), transparent)',
              }} />
              <Section section={section} baseIndex={idx} />
            </div>
          )
        })}
      </main>

      {/* Footer */}
      <footer style={{
        textAlign: 'center', padding: 24,
        color: 'rgba(255,255,255,0.2)', fontSize: 12,
        borderTop: '1px solid rgba(255,255,255,0.04)',
      }}>
        <a
          href="https://github.com/sangwonl/pocato"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'rgba(255,255,255,0.3)', textDecoration: 'none', transition: 'color 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.color = '#a78bfa'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
        >
          github.com/sangwonl/pocato
        </a>
      </footer>
    </div>
  )
}
