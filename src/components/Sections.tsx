import React, { useEffect, useRef } from 'react'
import type { Step } from '../types'

const STEPS: Step[] = [
  { num: '01', title: 'Capture',  desc: 'Upload a bill image, record a voice note, or type a quick description of any expense.' },
  { num: '02', title: 'Extract',  desc: 'OCR + NLP parse merchant, amount, date, and line items with Tesseract edge processing.' },
  { num: '03', title: 'Classify', desc: 'ML models auto-categorize the expense and store it to your cloud-synced ledger instantly.' },
  { num: '04', title: 'Predict',  desc: 'Analytics engine forecasts trends and surfaces insights to help you spend smarter over time.' },
]

const TECH_TAGS = [
  'React.js', 'Next.js', 'Node.js','Firebase', 
  'Tesseract OCR', 'Naïve Bayes', 'Logistic Regression',
  'Moving Average', 'NLP Pipeline', 'FastAPI', 'Cloud Storage',
]

/* ── Scroll-reveal hook ── */
function useReveal(delay = 0) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current; if (!el) return
    el.style.opacity = '0'; el.style.transform = 'translateY(20px)'
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setTimeout(() => { el.style.opacity = '1'; el.style.transform = 'translateY(0)' }, delay)
        obs.disconnect()
      }
    }, { threshold: 0.15 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [delay])
  return ref
}

/* ── How It Works ── */
export function HowItWorksSection(): React.ReactElement {
  return (
    <section id="how" style={{ padding: '6rem 2rem', maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>
      <div className="section-label">Workflow</div>
      <h2 className="section-title">From Receipt to Insight<br />in Seconds</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', marginTop: '3.5rem', position: 'relative' }}>
        {/* Connector line */}
        <div style={{ position: 'absolute', top: 28, left: '12.5%', width: '75%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(0,245,255,0.3), transparent)' }} />

        {STEPS.map((step, i) => {
          const ref = useReveal(i * 100)
          return (
            <div key={step.num} ref={ref} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '0 1rem', transition: 'opacity 0.5s ease, transform 0.5s ease' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--bg-panel)', border: '1px solid rgba(0,245,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontWeight: 500, fontSize: '1.1rem', color: 'var(--neon-cyan)', marginBottom: '1.2rem', position: 'relative', zIndex: 1 }}>
                {step.num}
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.5rem' }}>{step.title}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{step.desc}</div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

/* ── Tech Stack ── */
export function TechSection(): React.ReactElement {
  return (
    <section id="tech" style={{ padding: '5rem 2rem', maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>
      <div className="section-label">Technology</div>
      <h2 className="section-title">Built on a Solid Stack</h2>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--text-dim)', lineHeight: 1.8, maxWidth: 600, marginTop: '1rem' }}>
        MERN-based cloud architecture with real-time OCR, predictive ML modules, and edge processing — all designed for speed and privacy.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem', marginTop: '2.5rem' }}>
        {TECH_TAGS.map((tag, i) => {
          const ref = useReveal(i * 40)
          return (
            <div key={tag} ref={ref} className="tech-tag"
              style={{ transition: 'opacity 0.4s ease, transform 0.4s ease, border-color 0.2s, color 0.2s', cursor: 'default' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--neon-cyan)'; e.currentTarget.style.color = 'var(--neon-cyan)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.color = 'var(--text-dim)' }}
            >
              {tag}
            </div>
          )
        })}
      </div>
    </section>
  )
}

/* ── CTA ── */
export function CTASection(): React.ReactElement {
  return (
    <section style={{ padding: '7rem 2rem', textAlign: 'center', position: 'relative', zIndex: 1 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 800px 400px at 50% 50%, rgba(0,245,255,0.04) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ maxWidth: 700, margin: '0 auto', background: 'var(--bg-card)', border: '1px solid rgba(0,245,255,0.15)', borderRadius: 24, padding: '4rem 3rem', position: 'relative', overflow: 'hidden' }}>
        {/* Top glow line */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, var(--neon-cyan), var(--neon-green), transparent)' }} />
        <div className="section-label" style={{ justifyContent: 'center', marginBottom: '1.5rem' }}>Join the Beta</div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '1rem' }}>
          Take Control of<br />Your Spending Today
        </h2>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem', color: 'var(--text-dim)', lineHeight: 1.7, marginBottom: '2.5rem' }}>
          Spendict is currently in development. Be the first to experience AI-powered expense tracking — no spreadsheets, no manual logging, no data fragmentation.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn-primary">Request Early Access</button>
          <button className="btn-ghost">View on GitHub</button>
        </div>
      </div>
    </section>
  )
}

/* ── Footer ── */
export function Footer(): React.ReactElement {
  return (
    <footer style={{ borderTop: '1px solid var(--border-subtle)', padding: '2rem 3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1, flexWrap: 'wrap', gap: '1rem' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        © 2026 Spendict!
      </div>
      <ul style={{ display: 'flex', gap: '2rem', listStyle: 'none' }}>
        {['Privacy', 'Terms', 'Contact'].map(item => (
          <li key={item}>
            <a href="#" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--neon-cyan)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
            >{item}</a>
          </li>
        ))}
      </ul>
    </footer>
  )
}
