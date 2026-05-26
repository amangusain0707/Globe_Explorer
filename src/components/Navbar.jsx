export default function Navbar({ onExplore, onCountries, onWeather, onAbout }) {
  return (
    <nav className="navbar">
      <div className="nav-logo">
        Globe<span>Explorer</span>
      </div>
      <ul className="nav-links">
        <li><a href="#" onClick={(e) => { e.preventDefault(); onExplore() }}>Explore</a></li>
        <li><a href="#" onClick={(e) => { e.preventDefault(); onCountries() }}>Countries</a></li>
        <li><a href="#" onClick={(e) => { e.preventDefault(); onWeather() }}>Weather</a></li>
        <li><a href="#" onClick={(e) => { e.preventDefault(); onAbout() }}>About</a></li>
      </ul>
      <button className="nav-btn" onClick={onExplore}>🌍 Discover</button>
    </nav>
  )
}