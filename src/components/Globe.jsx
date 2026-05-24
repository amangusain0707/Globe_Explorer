import { OrbitControls, Stars } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { gsap } from 'gsap'
import { useCallback, useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

const COUNTRY_MARKERS = [
  { name: 'India', lat: 20.5937, lng: 78.9629, color: '#ff6b6b' },
  { name: 'United States', lat: 37.0902, lng: -95.7129, color: '#4fc3f7' },
  { name: 'China', lat: 35.8617, lng: 104.1954, color: '#ff9800' },
  { name: 'Brazil', lat: -14.2350, lng: -51.9253, color: '#66bb6a' },
  { name: 'Russia', lat: 61.5240, lng: 105.3188, color: '#ab47bc' },
  { name: 'Australia', lat: -25.2744, lng: 133.7751, color: '#ffca28' },
  { name: 'Japan', lat: 36.2048, lng: 138.2529, color: '#ef5350' },
  { name: 'Germany', lat: 51.1657, lng: 10.4515, color: '#26c6da' },
  { name: 'France', lat: 46.2276, lng: 2.2137, color: '#7e57c2' },
  { name: 'Canada', lat: 56.1304, lng: -106.3468, color: '#ec407a' },
  { name: 'United Kingdom', lat: 55.3781, lng: -3.4360, color: '#29b6f6' },
  { name: 'Italy', lat: 41.8719, lng: 12.5674, color: '#26a69a' },
  { name: 'South Africa', lat: -30.5595, lng: 22.9375, color: '#d4e157' },
  { name: 'Mexico', lat: 23.6345, lng: -102.5528, color: '#ff7043' },
  { name: 'Argentina', lat: -38.4161, lng: -63.6167, color: '#42a5f5' },
  { name: 'Egypt', lat: 26.8206, lng: 30.8025, color: '#ffa726' },
  { name: 'Nigeria', lat: 9.0820, lng: 8.6753, color: '#66bb6a' },
  { name: 'Saudi Arabia', lat: 23.8859, lng: 45.0792, color: '#26c6da' },
  { name: 'Indonesia', lat: -0.7893, lng: 113.9213, color: '#ef5350' },
  { name: 'Turkey', lat: 38.9637, lng: 35.2433, color: '#ab47bc' },
]

function latLngToVector3(lat, lng, radius = 1.02) {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lng + 180) * (Math.PI / 180)
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  )
}

function DayNightShader() {
  const meshRef = useRef()

  useFrame(() => {
    if (meshRef.current) {
      const now = new Date()
      const hours = now.getUTCHours() + now.getUTCMinutes() / 60
      const angle = ((hours / 24) * Math.PI * 2) - Math.PI
      meshRef.current.rotation.y = angle
    }
  })

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1.003, 64, 64]} />
      <meshPhongMaterial
        color="#000008"
        transparent
        opacity={0.75}
        side={THREE.FrontSide}
        depthWrite={false}
      />
    </mesh>
  )
}

function Atmosphere() {
  return (
    <mesh>
      <sphereGeometry args={[1.08, 64, 64]} />
      <meshPhongMaterial color="#1a6ba0" transparent opacity={0.08} side={THREE.BackSide} />
    </mesh>
  )
}

function GlowRing() {
  return (
    <mesh>
      <sphereGeometry args={[1.15, 64, 64]} />
      <meshPhongMaterial color="#00e5ff" transparent opacity={0.03} side={THREE.BackSide} />
    </mesh>
  )
}

function Marker({ lat, lng, color, name, onClick }) {
  const meshRef = useRef()
  const [hovered, setHovered] = useState(false)
  const pos = latLngToVector3(lat, lng)

  useFrame((state) => {
    if (meshRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 2 + lat) * 0.1 + 1
      if (!hovered) meshRef.current.scale.setScalar(pulse * 0.8)
      else meshRef.current.scale.setScalar(1.8)
    }
  })

  return (
    <mesh
      ref={meshRef}
      position={pos}
      onClick={(e) => { e.stopPropagation(); onClick(name) }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <sphereGeometry args={[0.012, 8, 8]} />
      <meshStandardMaterial
        color={hovered ? '#ffffff' : color}
        emissive={color}
        emissiveIntensity={hovered ? 2 : 0.8}
        transparent
        opacity={0.9}
      />
    </mesh>
  )
}

function MarkerRing({ lat, lng, color }) {
  const meshRef = useRef()
  const pos = latLngToVector3(lat, lng, 1.022)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.material.opacity =
        Math.sin(state.clock.elapsedTime * 1.5 + lat) * 0.3 + 0.3
    }
  })

  return (
    <mesh ref={meshRef} position={pos}>
      <ringGeometry args={[0.018, 0.026, 16]} />
      <meshBasicMaterial color={color} transparent opacity={0.4} side={THREE.DoubleSide} />
    </mesh>
  )
}

function ConnectionLines() {
  const linesRef = useRef()

  useEffect(() => {
    if (!linesRef.current) return
    const group = linesRef.current
    while (group.children.length) group.remove(group.children[0])

    const pairs = [
      [0, 1], [0, 6], [1, 9], [2, 7], [3, 14], [4, 7],
      [5, 6], [7, 8], [8, 11], [9, 10], [10, 7], [1, 2],
    ]

    pairs.forEach(([i, j]) => {
      const a = latLngToVector3(COUNTRY_MARKERS[i].lat, COUNTRY_MARKERS[i].lng, 1.02)
      const b = latLngToVector3(COUNTRY_MARKERS[j].lat, COUNTRY_MARKERS[j].lng, 1.02)
      const mid = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5)
      mid.normalize().multiplyScalar(1.3)

      const curve = new THREE.QuadraticBezierCurve3(a, mid, b)
      const points = curve.getPoints(40)
      const geo = new THREE.BufferGeometry().setFromPoints(points)
      const mat = new THREE.LineBasicMaterial({
        color: '#4fc3f7',
        transparent: true,
        opacity: 0.15,
      })
      group.add(new THREE.Line(geo, mat))
    })
  }, [])

  return <group ref={linesRef} />
}

function Earth({ onCountryClick }) {
  const globeRef = useRef()

  useFrame((state, delta) => {
    if (globeRef.current) {
      globeRef.current.rotation.y += delta * 0.08
    }
  })

  return (
    <group ref={globeRef}>
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[1, 64, 64]} />
        <meshPhongMaterial
          color="#1a3a5c"
          emissive="#0a1a2e"
          emissiveIntensity={0.3}
          shininess={15}
          specular={new THREE.Color('#4fc3f7')}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.001, 32, 32]} />
        <meshBasicMaterial color="#1e3a5f" wireframe transparent opacity={0.08} />
      </mesh>
      <DayNightShader />
      <Atmosphere />
      <GlowRing />
      <ConnectionLines />
      {COUNTRY_MARKERS.map((country) => (
        <group key={country.name}>
          <Marker
            lat={country.lat}
            lng={country.lng}
            color={country.color}
            name={country.name}
            onClick={onCountryClick}
          />
          <MarkerRing lat={country.lat} lng={country.lng} color={country.color} />
        </group>
      ))}
    </group>
  )
}

function CameraController({ targetCountry }) {
  const { camera } = useThree()

  // Cinematic intro zoom
  useEffect(() => {
    camera.position.set(0, 0, 8)
    gsap.to(camera.position, {
      z: 2.8,
      duration: 3,
      ease: 'power3.inOut'
    })
  }, [])

  // Zoom to country
  useEffect(() => {
    if (targetCountry) {
      const country = COUNTRY_MARKERS.find(c => c.name === targetCountry)
      if (country) {
        const target = latLngToVector3(country.lat, country.lng, 2.5)
        gsap.to(camera.position, {
          x: target.x, y: target.y, z: target.z,
          duration: 1.5, ease: 'power3.inOut'
        })
      }
    }
  }, [targetCountry, camera])

  return null
}

export default function Globe({ onCountrySelect }) {
  const [targetCountry, setTargetCountry] = useState(null)

  const handleCountryClick = useCallback((name) => {
    setTargetCountry(name)
    onCountrySelect({ name })
  }, [onCountrySelect])

  return (
    <Canvas
      camera={{ position: [0, 0, 2.8], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 3, 5]} intensity={1.2} color="#ffffff" />
      <pointLight position={[-5, -3, -5]} intensity={0.3} color="#4fc3f7" />
      <pointLight position={[0, 5, 0]} intensity={0.2} color="#00e5ff" />
      <Stars radius={100} depth={50} count={6000} factor={4} saturation={0.5} fade speed={0.3} />
      <Earth onCountryClick={handleCountryClick} />
      <CameraController targetCountry={targetCountry} />
      <OrbitControls
        enableZoom={true}
        enablePan={false}
        zoomSpeed={0.5}
        rotateSpeed={0.4}
        minDistance={1.5}
        maxDistance={5}
      />
    </Canvas>
  )
}