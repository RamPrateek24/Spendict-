import React from 'react'

interface HeroStat { value: string; label: string }

const STATS: HeroStat[] = [
  { value: 'OCR', label: 'Receipt Scanning' },
  { value: 'ML',  label: 'Auto-Categorize' },
  { value: 'AI',  label: 'Spend Prediction' },
  { value: 'NLP', label: 'Voice Entry' },
]

export default function Hero(): React.ReactElement {
  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <section style={{
      minHeight: '100vh',
      display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
      textAlign: 'center', padding: '8rem 2rem 4rem',
      position: 'relative', zIndex: 1,
    }}>
      <div className="hero-badge">
        <span className="hero-badge-dot" />
        ✦ AI-Powered Expense Intelligence
      </div>

      <h1 className="hero-title">
        Track Smarter<br />
        <span className="hero-title-accent">Spend Wiser</span>
      </h1>

      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(0.85rem, 2vw, 1.05rem)', color: 'var(--text-dim)', maxWidth: 560, lineHeight: 1.8, marginTop: '1.8rem', animation: 'fadeSlideDown 0.8s 0.2s ease both' }}>
        Spendict uses OCR, voice AI, and predictive ML to transform how you manage money —
        snap a bill, speak an expense, or just type it in.
      </p>

      <div style={{ display: 'flex', gap: '1.2rem', justifyContent: 'center', marginTop: '3rem', animation: 'fadeSlideDown 0.8s 0.3s ease both', flexWrap: 'wrap' }}>
        <button className="btn-primary" onClick={() => scrollTo('upload-anchor')}>Start Tracking Free</button>
        <button className="btn-ghost"   onClick={() => scrollTo('how')}>See How It Works →</button>
      </div>

      <div style={{ display: 'flex', gap: '3rem', justifyContent: 'center', marginTop: '4rem', animation: 'fadeSlideDown 0.8s 0.4s ease both', flexWrap: 'wrap' }}>
        {STATS.map(s => (
          <div key={s.value} style={{ textAlign: 'center' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '2rem', fontWeight: 800, color: 'var(--neon-cyan)', display: 'block', textShadow: '0 0 20px rgba(0,245,255,0.5)' }}>
              {s.value}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              {s.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
