import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import AuthPage from './components/AuthPage'
import BackgroundEffects from './components/BackgroundEffects'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import InputSection from './components/InputSection'
import FeaturesSection from './components/FeaturesSection'
import ExpenseDashboard from './components/ExpenseDashboard'
import { HowItWorksSection, TechSection, CTASection, Footer } from './components/Sections'

function SectionDivider(): React.ReactElement {
  return <div className="section-divider" />
}

function HomePage(): React.ReactElement {
  return (
    <>
      <BackgroundEffects />
      <Navbar />
      <main>
        <Hero />
        <SectionDivider />
        <InputSection />
        <SectionDivider />
        <FeaturesSection />
        <SectionDivider />
        <HowItWorksSection />
        <SectionDivider />
        <TechSection />
        <CTASection />
      </main>
      <Footer />
    </>
  )
}

function DashboardPage(): React.ReactElement {
  return (
    <>
      <BackgroundEffects />
      <Navbar />
      <main style={{ paddingTop: '100px' }}>
        <section style={{ padding: '3rem 2rem', maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <h1 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '2.5rem', fontFamily: 'var(--font-display)', fontWeight: 800 }}>
            Expense Dashboard
          </h1>
          <ExpenseDashboard />
        </section>
      </main>
      <Footer />
    </>
  )
}

function AppContent(): React.ReactElement {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-base)',
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(0, 245, 255, 0.2)',
            borderTop: '3px solid var(--neon-cyan)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }} />
          <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Checking authentication...</p>
        </div>
      </div>
    )
  }

  // Show auth page if not logged in
  if (!user) {
    return <AuthPage />
  }

  // Show routes if logged in
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
    </Routes>
  )
}

export default function App(): React.ReactElement {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  )
}
