# 🌍 Globe Explorer

An interactive 3D globe built with React and Three.js that lets you explore 
every country in the world with real-time data, live weather, currency 
conversion, and travel guides.

## 🔗 Live Demo
[globeexlorer3d.netlify.app](https://globeexlorer3d.netlify.app)

## ✨ Features

### 3D Globe
- Spinning Earth rendered with React Three Fiber and Three.js
- Real-time day/night shader showing current sunlight across Earth
- 6000 star particle background
- Atmosphere glow and grid overlay
- Cinematic camera zoom on page load
- Drag to rotate, scroll to zoom

### Country Markers
- 20 major countries with pulsing animated dot markers
- Click any marker to open the country info panel
- Quadratic Bezier arc connections between major trading partners
- Smooth GSAP camera animation flying to clicked country

### Country Info Panel
- Real country flag image
- Unsplash landscape photo of the country
- Live ticking clock showing current local time
- Population, area, capital, calling code, TLD
- Currency name and symbol
- INR → local currency converter with live exchange rates
- Languages spoken
- Live weather — temperature, humidity, wind, visibility
- Wikivoyage travel guide summary with link to full guide

### Search
- Search any of 195 countries by name
- Instant filtered results
- Click to open country panel directly

## 🛠 Tech Stack

### Frontend
- **React** — component architecture
- **Three.js** — 3D rendering engine
- **React Three Fiber** — React renderer for Three.js
- **Drei** — Three.js helpers (OrbitControls, Stars)
- **GSAP** — cinematic animations
- **Framer Motion** — UI transitions
- **Vite** — build tool

### APIs
- **REST Countries API** — country data for 195 countries (free, no key)
- **OpenWeatherMap API** — live weather data
- **Unsplash API** — country landscape photography
- **ExchangeRate API** — live currency conversion (free, no key)
- **Wikivoyage API** — travel guides (free, no key)

### Deployment
- **Netlify** — frontend hosting with continuous deployment
- **GitHub** — version control, linked to Netlify for auto-deploy

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- OpenWeatherMap API key (free at openweathermap.org)
- Unsplash API key (free at unsplash.com/developers)

### Installation

```bash
# Clone the repo
git clone https://github.com/amangusain0707/Globe_Explorer.git
cd Globe_Explorer

# Install dependencies
npm install

# Start dev server
npm run dev
```

Open `http://localhost:5173`

### Add your API keys
In `src/components/CountryPanel.jsx`:
```js
const API_KEY = 'your_openweather_key'
const UNSPLASH_KEY = 'your_unsplash_key'
```

### Build for production
```bash
npm run build
```

## 📁 Project Structure
Globe_Explorer/

├── index.html

├── vite.config.js

├── package.json

└── src/

├── main.jsx

├── index.css

├── App.jsx

└── components/

├── Globe.jsx        # 3D globe, markers, arcs, day/night

├── Navbar.jsx       # Top navigation

├── SearchBar.jsx    # Country search

└── CountryPanel.jsx # Side panel with all country data

## 🔧 Key Technical Concepts

### Spherical Coordinate Conversion
Converting geographic lat/lng to 3D XYZ positions on the sphere:
```js
function latLngToVector3(lat, lng, radius = 1.02) {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lng + 180) * (Math.PI / 180)
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  )
}
```

### Bezier Arc Connections
Country connection arcs use Quadratic Bezier Curves with a midpoint pushed 
outward from the globe surface to create realistic flight-path style arcs:
```js
const mid = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5)
mid.normalize().multiplyScalar(1.3) // push outward from globe
const curve = new THREE.QuadraticBezierCurve3(a, mid, b)
```

### Day/Night Shader
Real-time hemisphere shadow based on current UTC time:
```js
const hours = now.getUTCHours() + now.getUTCMinutes() / 60
const angle = ((hours / 24) * Math.PI * 2) - Math.PI
meshRef.current.rotation.y = angle
```

## 👨‍💻 Author
**Aman Gusain**
- 📍 Dehradun, Uttarakhand
- 🔗 [LinkedIn](https://www.linkedin.com/in/aman-gusain-298310258)
- 🐙 [GitHub](https://github.com/amangusain0707)
