import * as THREE from 'three'
import React, { Suspense, useEffect, useState, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Reflector, Text, useTexture, useGLTF } from '@react-three/drei'
import './styles.css'
import { FaVolumeUp, FaVolumeMute } from 'react-icons/fa'

export default function App() {
  const [isMuted, setIsMuted] = useState(false)
  const audioRef = useRef()

  useEffect(() => {
    audioRef.current = new Audio('/bgm.mp3')
    audioRef.current.loop = true
    audioRef.current.volume = 0.5

    const handleUserInteraction = () => {
      audioRef.current.play().catch((error) => {
        console.error('Audio playback failed:', error)
      })
      window.removeEventListener('click', handleUserInteraction)
    }

    window.addEventListener('click', handleUserInteraction)

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
      }
      window.removeEventListener('click', handleUserInteraction)
    }
  }, [])

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  return (
    <>
    <div className='canvas-container'>
      <div className='logo'>
        <img src="/logo-transparent.png" alt="" width={150} height={150}/>
      </div>
      <Canvas
        concurrent
        gl={{ alpha: false }}
        pixelRatio={window.innerWidth < 768 ? [1, 2] : [1, 1.5]}
        camera={{ position: [0, 3, window.innerWidth < 768 ? 50 : 100], fov: window.innerWidth < 768 ? 25 : 15 }}
      >
        <color attach="background" args={['#0f0f0f']} />
        <Suspense fallback={null}>
          <group position={[0, -1, 0]}>
            <Carla rotation={[0, Math.PI - 0.4, 0]} position={[-1.2, 0, 0.6]} scale={[0.26, 0.26, 0.26]} />
            <VideoText position={[0, 2, -5]} />
            <Ground />
          </group>
          <ambientLight intensity={0.5} />
          <spotLight position={[0, 10, 0]} intensity={0.3} />
          <directionalLight position={[-50, 0, -40]} intensity={0.7} />
          <Intro />
        </Suspense>
      </Canvas>
    </div>
      
      <div className="speaker-icon" onClick={toggleMute}>
        
        {isMuted ? <FaVolumeMute size={30} color="white" /> : <FaVolumeUp size={30} color="white" />}
      </div>
    </>
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
    <Reflector
      blur={[1000, 100]}
      resolution={window.innerWidth < 768 ? 256 : 512}
      args={[20, 20]}
      mirror={0.5}
      mixBlur={6}
      mixStrength={1.5}
      rotation={[-Math.PI / 2, 0, Math.PI / 2]}
    >
      {(Material, props) => <Material color="#a0a0a0" metalness={0.4} roughnessMap={floor} normalMap={normal} normalScale={[3, 3]} {...props} />}
    </Reflector>
  )
}

function Intro() {
  const [vec] = useState(() => new THREE.Vector3())
  const lastTouch = useRef({ x: 0, y: 0 })
  const deltaTouch = useRef({ x: 0, y: 0 })
  const cameraPosition = useRef({ x: 0, y: 3 })

  useEffect(() => {
    if (isMobile()) {
      const handleTouchStart = (event) => {
        const touch = event.touches[0]
        lastTouch.current = {
          x: (touch.clientX / window.innerWidth) * 2 - 1,
          y: -(touch.clientY / window.innerHeight) * 2 + 1,
        }
      }

      const handleTouchMove = (event) => {
        const touch = event.touches[0]
        const currentTouch = {
          x: (touch.clientX / window.innerWidth) * 2 - 1,
          y: -(touch.clientY / window.innerHeight) * 2 + 1,
        }

        deltaTouch.current = {
          x: currentTouch.x - lastTouch.current.x,
          y: currentTouch.y - lastTouch.current.y,
        }

        cameraPosition.current = {
          x: cameraPosition.current.x + deltaTouch.current.x * 5,
          y: cameraPosition.current.y + deltaTouch.current.y * 5,
        }

        lastTouch.current = currentTouch
      }

      window.addEventListener('touchstart', handleTouchStart)
      window.addEventListener('touchmove', handleTouchMove)

      return () => {
        window.removeEventListener('touchstart', handleTouchStart)
        window.removeEventListener('touchmove', handleTouchMove)
      }
    }
  }, [])

  return useFrame((state) => {
    if (!isMobile()) {
      state.camera.position.lerp(vec.set(state.mouse.x * 15, 3 + state.mouse.y * 5, 14), 0.1)
    } else {
      vec.set(cameraPosition.current.x, cameraPosition.current.y, 14)
      state.camera.position.lerp(vec, 0.1)
    }
    state.camera.lookAt(0, 1, 0)
  })
}

function isMobile() {
  return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}












