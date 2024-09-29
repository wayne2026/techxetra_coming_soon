
import * as THREE from 'three'
import React, { Suspense, useEffect, useState, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Reflector, Text, useTexture, useGLTF } from '@react-three/drei'
import './styles.css'

export default function App() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <Canvas
      gl={{ alpha: false }}
      pixelRatio={isMobile ? [1, 1] : [1, 1.5]}
      camera={{ position: isMobile ? [0, 5, 15] : [0, 3, 100], fov: isMobile ? 25 : 15 }}
    >
      <color attach="background" args={['#0f0f0f']} />
      <Suspense fallback={null}>
        <group position={[0, isMobile ? -0.5 : -1, 0]}>
          <Carla rotation={[0, Math.PI - 0.4, 0]} position={[-1.2, 0, 0.6]} scale={isMobile ? [0.15, 0.15, 0.15] : [0.26, 0.26, 0.26]} />
          <VideoText position={[0, isMobile ? 2 : 2, -5]} />
          <Ground />
        </group>
        <ambientLight intensity={0.5} />
        <spotLight position={[0, 10, 0]} intensity={0.3} />
        <directionalLight position={[-50, 0, -40]} intensity={0.7} />
        <Intro />
      </Suspense>
    </Canvas>
  )
}

function Carla(props) {
  const { scene } = useGLTF('/carla-draco.glb')
  return <primitive object={scene} {...props} />
}

function VideoText(props) {
  const [video] = useState(() => Object.assign(document.createElement('video'), { src: '/Techxetra.mp4', crossOrigin: 'Anonymous', loop: true, muted: true }))
  useEffect(() => void video.play(), [video])
  return (
    <Text font="/LEMONMILK-Regular.otf" fontSize={2.5} letterSpacing={0.1} {...props}>
      Coming Soon
      <meshBasicMaterial toneMapped={false}>
        <videoTexture attach="map" args={[video]} encoding={THREE.sRGBEncoding} />
      </meshBasicMaterial>
    </Text>
  )
}

function Ground() {
  const [floor, normal] = useTexture(['/SurfaceImperfections003_1K_var1.jpg', '/SurfaceImperfections003_1K_Normal.jpg'])
  return (
    <Reflector blur={[500, 100]} resolution={256} args={[20, 20]} mirror={0.4} mixBlur={6} mixStrength={1.2} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
      {(Material, props) => <Material color="#a0a0a0" metalness={0.4} roughnessMap={floor} normalMap={normal} normalScale={[2, 2]} {...props} />}
    </Reflector>
  )
}

function Intro() {
  const [vec] = useState(() => new THREE.Vector3())
  const inputRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (event) => {
      inputRef.current.x = (event.clientX / window.innerWidth) * 2 - 1
      inputRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1
    }

    const handleTouchMove = (event) => {
      const touch = event.touches[0]
      inputRef.current.x = (touch.clientX / window.innerWidth) * 2 - 1
      inputRef.current.y = -(touch.clientY / window.innerHeight) * 2 + 1
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('touchmove', handleTouchMove)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('touchmove', handleTouchMove)
    }
  }, [])

  return useFrame((state) => {
    state.camera.position.lerp(vec.set(inputRef.current.x * 10, 3 + inputRef.current.y * 5, 14), 0.1)
    state.camera.lookAt(0, 1, 0)
  })
}

