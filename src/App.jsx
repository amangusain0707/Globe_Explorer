import { useEffect, useRef, useState } from 'react'
import CountryPanel from './components/CountryPanel'
import Globe from './components/Globe'
import Navbar from './components/Navbar'
import SearchBar from './components/SearchBar'

export default function App() {
  const [selectedCountry, setSelectedCountry] = useState(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const [introVisible, setIntroVisible] = useState(true)
  const [targetCountry, setTargetCountry] = useState(null)
  const cursorRef = useRef(null)
  const ringRef = useRef(null)
  let mx = 0, my = 0, rx = 0, ry = 0

  // Custom cursor
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

  // Hide intro after 2.5s
  useEffect(() => {
    const t = setTimeout(() => setIntroVisible(false), 2500)
    return () => clearTimeout(t)
  }, [])

  const handleCountrySelect = (country) => {
    setSelectedCountry(country)
    setPanelOpen(true)
    setTargetCountry(country.name)
  }

  const handlePanelClose = () => {
    setPanelOpen(false)
    setTimeout(() => setSelectedCountry(null), 500)
  }

  return (
    <div className="app">
      <div className="cursor" ref={cursorRef} />
      <div className="cursor-ring" ref={ringRef} />

      <div className={`intro-overlay ${!introVisible ? 'hidden' : ''}`}>
        <h1 className="intro-title">Globe<span>Explorer</span></h1>
        <p className="intro-sub">Discovering the world, one click at a time</p>
        <div className="intro-bar">
          <div className="intro-bar-fill" />
        </div>
      </div>

      <Navbar />

      <div className="globe-canvas">
        <Globe onCountrySelect={handleCountrySelect} targetCountry={targetCountry} />
      </div>

      <SearchBar onCountrySelect={handleCountrySelect} />

      <CountryPanel
        country={selectedCountry}
        isOpen={panelOpen}
        onClose={handlePanelClose}
      />

      <div className="hud-bottom">
        <div className="hud-pill">🌍 <span>195</span> Countries</div>
        <div className="hud-pill">Click globe to <span>explore</span></div>
        <div className="hud-pill">Drag to <span>rotate</span></div>
      </div>
    </div>
  )
}