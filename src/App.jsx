import { useEffect, useRef, useState } from 'react'
import CountryPanel from './components/CountryPanel'
import Globe from './components/Globe'
import Navbar from './components/Navbar'
import SearchBar from './components/SearchBar'

const ALL_MARKERS = [
  'India', 'United States', 'China', 'Brazil', 'Russia',
  'Australia', 'Japan', 'Germany', 'France', 'Canada',
  'United Kingdom', 'Italy', 'South Africa', 'Mexico', 'Argentina',
  'Egypt', 'Nigeria', 'Saudi Arabia', 'Indonesia', 'Turkey',
  'South Korea', 'Pakistan', 'Bangladesh', 'Thailand', 'Vietnam',
  'Malaysia', 'Philippines', 'Iran', 'Iraq', 'Israel',
  'United Arab Emirates', 'Singapore', 'Nepal', 'Sri Lanka', 'Kazakhstan',
  'Spain', 'Ukraine', 'Poland', 'Netherlands', 'Sweden',
  'Norway', 'Switzerland', 'Portugal', 'Greece', 'Colombia',
  'Chile', 'Peru', 'Venezuela', 'Cuba', 'Ethiopia',
  'Kenya', 'Ghana', 'Tanzania', 'Morocco', 'Algeria', 'New Zealand',
]

export default function App() {
  const [selectedCountry, setSelectedCountry] = useState(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const [introVisible, setIntroVisible] = useState(true)
  const [targetCountry, setTargetCountry] = useState(null)
  const [showCountries, setShowCountries] = useState(false)
  const [showAbout, setShowAbout] = useState(false)
  const cursorRef = useRef(null)
  const ringRef = useRef(null)
  let mx = 0, my = 0, rx = 0, ry = 0

  useEffect(() => {
    const move = (e) => {
      mx = e.clientX
      my = e.clientY
      if (cursorRef.current) {
        cursorRef.current.style.left = mx + 'px'
        cursorRef.current.style.top = my + 'px'
      }
    }
    document.addEventListener('mousemove', move)
    const animate = () => {
      rx += (mx - rx) * 0.1
      ry += (my - ry) * 0.1
      if (ringRef.current) {
        ringRef.current.style.left = rx + 'px'
        ringRef.current.style.top = ry + 'px'
      }
      requestAnimationFrame(animate)
    }
    animate()
    return () => document.removeEventListener('mousemove', move)
  }, [])

  useEffect(() => {
    const t = setTimeout(() => setIntroVisible(false), 2500)
    return () => clearTimeout(t)
  }, [])

  const handleCountrySelect = (country) => {
    setSelectedCountry(country)
    setPanelOpen(true)
    setTargetCountry(country.name)
    setShowCountries(false)
  }

  const handlePanelClose = () => {
    setPanelOpen(false)
    setTimeout(() => setSelectedCountry(null), 500)
  }

  const handleExplore = () => {
    setPanelOpen(false)
    setShowCountries(false)
    setShowAbout(false)
    setTargetCountry(null)
    setTimeout(() => setSelectedCountry(null), 500)
  }

  const handleWeather = () => {
    const random = ALL_MARKERS[Math.floor(Math.random() * ALL_MARKERS.length)]
    handleCountrySelect({ name: random })
  }

  return (
    <div className="app">
      <div className="cursor" ref={cursorRef} />
      <div className="cursor-ring" ref={ringRef} />

      <div className={`intro-overlay ${!introVisible ? 'hidden' : ''}`}>
        <h1 className="intro-title">Globe<span>Explorer</span></h1>
        <p className="intro-sub">Discovering the world, one click at a time</p>
        <div className="intro-bar"><div className="intro-bar-fill" /></div>
      </div>

      <Navbar
        onExplore={handleExplore}
        onCountries={() => { setShowCountries(!showCountries); setShowAbout(false) }}
        onWeather={handleWeather}
        onAbout={() => { setShowAbout(!showAbout); setShowCountries(false) }}
      />

      <div className="globe-canvas">
        <Globe onCountrySelect={handleCountrySelect} targetCountry={targetCountry} />
      </div>

      <SearchBar onCountrySelect={handleCountrySelect} />

      <CountryPanel
        country={selectedCountry}
        isOpen={panelOpen}
        onClose={handlePanelClose}
      />

      {/* Countries sidebar */}
      {showCountries && (
        <div style={{
          position: 'fixed', top: 0, right: panelOpen ? '360px' : 0,
          width: '280px', height: '100vh',
          background: 'rgba(5,5,20,0.92)',
          borderLeft: '1px solid rgba(79,195,247,0.15)',
          backdropFilter: 'blur(20px)',
          zIndex: 99, overflowY: 'auto',
          padding: '5rem 1.2rem 2rem',
          transition: 'right 0.3s ease'
        }}>
          <p style={{ fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(79,195,247,0.6)', marginBottom: '1rem', fontWeight: 600 }}>
            🌍 All Countries ({ALL_MARKERS.length})
          </p>
          {ALL_MARKERS.map(name => (
            <div key={name}
              onClick={() => handleCountrySelect({ name })}
              style={{
                padding: '0.6rem 0.8rem',
                fontSize: '0.85rem',
                color: 'rgba(240,244,255,0.7)',
                borderBottom: '1px solid rgba(79,195,247,0.06)',
                transition: 'all 0.2s',
                borderRadius: '2px',
              }}
              onMouseEnter={e => { e.target.style.background = 'rgba(79,195,247,0.08)'; e.target.style.color = '#f0f4ff' }}
              onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = 'rgba(240,244,255,0.7)' }}
            >
              {name}
            </div>
          ))}
        </div>
      )}

      {/* About modal */}
      {showAbout && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,15,0.8)',
          backdropFilter: 'blur(10px)',
          zIndex: 200,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}
          onClick={() => setShowAbout(false)}
        >
          <div style={{
            background: 'rgba(5,5,20,0.95)',
            border: '1px solid rgba(79,195,247,0.2)',
            padding: '3rem',
            maxWidth: '480px',
            width: '90%',
            position: 'relative'
          }}
            onClick={e => e.stopPropagation()}
          >
            <button onClick={() => setShowAbout(false)} style={{
              position: 'absolute', top: '1rem', right: '1rem',
              background: 'rgba(79,195,247,0.1)', border: '1px solid rgba(79,195,247,0.2)',
              color: '#4fc3f7', width: '32px', height: '32px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1rem', borderRadius: '2px'
            }}>✕</button>

            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌍</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800, color: '#f0f4ff', marginBottom: '0.3rem', letterSpacing: '-0.02em' }}>
              Globe Explorer
            </h2>
            <p style={{ fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#4fc3f7', marginBottom: '1.5rem' }}>
              Interactive 3D World Atlas
            </p>
            <p style={{ color: 'rgba(240,244,255,0.6)', fontSize: '0.9rem', lineHeight: 1.8, marginBottom: '1.5rem', fontWeight: 300 }}>
              Built with React, Three.js, and React Three Fiber. Explore 195 countries with live weather, real-time timezone clocks, currency conversion, and travel guides — all on a stunning 3D globe.
            </p>

            <div style={{ borderTop: '1px solid rgba(79,195,247,0.1)', paddingTop: '1.5rem' }}>
              <p style={{ fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(79,195,247,0.6)', marginBottom: '1rem' }}>Built by</p>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 700, color: '#f0f4ff', marginBottom: '0.8rem' }}>Aman Gusain</p>
              <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
                <a href="https://github.com/amangusain0707" target="_blank" rel="noreferrer"
                  style={{ background: 'rgba(79,195,247,0.08)', border: '1px solid rgba(79,195,247,0.2)', color: '#4fc3f7', padding: '0.5rem 1rem', fontSize: '0.75rem', textDecoration: 'none', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  GitHub →
                </a>
                <a href="https://www.linkedin.com/in/aman-gusain-298310258" target="_blank" rel="noreferrer"
                  style={{ background: 'rgba(79,195,247,0.08)', border: '1px solid rgba(79,195,247,0.2)', color: '#4fc3f7', padding: '0.5rem 1rem', fontSize: '0.75rem', textDecoration: 'none', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  LinkedIn →
                </a>
                <a href="https://globeexplorer3d.netlify.app" target="_blank" rel="noreferrer"
                  style={{ background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.2)', color: '#00e5ff', padding: '0.5rem 1rem', fontSize: '0.75rem', textDecoration: 'none', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  Live Site →
                </a>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(79,195,247,0.1)', paddingTop: '1.2rem' }}>
              <p style={{ fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(79,195,247,0.6)', marginBottom: '0.8rem' }}>Tech Stack</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {['React', 'Three.js', 'React Three Fiber', 'GSAP', 'TopoJSON', 'OpenWeather API', 'Unsplash API', 'REST Countries', 'Vite', 'Netlify'].map(t => (
                  <span key={t} style={{ background: 'rgba(79,195,247,0.06)', border: '1px solid rgba(79,195,247,0.12)', color: 'rgba(240,244,255,0.6)', fontSize: '0.7rem', padding: '0.25rem 0.6rem', borderRadius: '1px' }}>{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="hud-bottom">
        <div className="hud-pill">🌍 <span>195</span> Countries</div>
        <div className="hud-pill">Click globe to <span>explore</span></div>
        <div className="hud-pill">Drag to <span>rotate</span></div>
      </div>
    </div>
  )
}