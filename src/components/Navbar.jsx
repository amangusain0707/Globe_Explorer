export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-logo">
        Globe<span>Explorer</span>
      </div>
      <ul className="nav-links">
        <li><a href="#">Explore</a></li>
        <li><a href="#">Countries</a></li>
        <li><a href="#">Weather</a></li>
        <li><a href="#">About</a></li>
      </ul>
      <button className="nav-btn">🌍 Discover</button>
    </nav>
  )
}