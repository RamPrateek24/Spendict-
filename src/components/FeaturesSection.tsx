import React, { useEffect, useRef } from 'react'
import type { Feature } from '../types'

const FEATURES: Feature[] = [
  { icon: '🔍', name: 'OCR Receipt Scanning',     accent: 'var(--neon-cyan)',   desc: 'Tesseract-powered edge processing reads any physical bill or digital receipt in seconds. No manual typing ever again.' },
  { icon: '🎙️', name: 'Voice Expense Logging',    accent: 'var(--neon-green)',  desc: 'Just speak naturally. Our NLP engine parses amounts, merchants, and dates from casual spoken phrases automatically.' },
  { icon: '🤖', name: 'ML Auto-Categorization',   accent: 'var(--neon-violet)', desc: 'Naïve Bayes classifier and Logistic Regression models sort expenses into the right category with 94%+ accuracy.' },
  { icon: '📈', name: 'Predictive Analytics',     accent: 'var(--neon-amber)',  desc: 'Moving Average forecasting predicts your future spending patterns and flags budget overruns before they happen.' },
  { icon: '📊', name: 'Live Spending Dashboard',  accent: 'var(--neon-cyan)',   desc: 'Real-time visibility into your spending habits with interactive charts and category breakdowns updated instantly.' },
  { icon: '🔐', name: 'Secure Auth System',       accent: 'var(--neon-green)',  desc: 'JWT-based authentication with MERN cloud architecture ensures your financial data stays private and encrypted.' },
]

function Card({ feature, index }: { feature: Feature; index: number }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current; if (!el) return
    el.style.opacity = '0'; el.style.transform = 'translateY(24px)'
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setTimeout(() => { el.style.opacity = '1'; el.style.transform = 'translateY(0)' }, index * 80)
        obs.disconnect()
      }
    }, { threshold: 0.15 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [index])

  return (
    <div
      ref={ref}
      className="feature-card"
      style={{ transition: 'opacity 0.5s ease, transform 0.5s ease, border-color 0.3s, background 0.3s, box-shadow 0.3s' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = `${feature.accent}44`; e.currentTarget.style.background = `${feature.accent}0a`; e.currentTarget.style.transform = 'translateY(-4px)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.transform = 'translateY(0)' }}
    >
      <div style={{ width: 48, height: 48, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.2rem', fontSize: '1.5rem', background: `${feature.accent}18` }}>
        {feature.icon}
      </div>
      <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.6rem', letterSpacing: '-0.01em' }}>{feature.name}</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-dim)', lineHeight: 1.7 }}>{feature.desc}</div>
    </div>
  )
}

export default function FeaturesSection(): React.ReactElement {
  return (
    <section id="features" style={{ padding: '6rem 2rem', maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>
      <div className="section-label">Capabilities</div>
      <h2 className="section-title">Everything You Need<br />to Master Your Finances</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '3.5rem' }}>
        {FEATURES.map((f, i) => <Card key={f.name} feature={f} index={i} />)}
      </div>
    </section>
  )
}
