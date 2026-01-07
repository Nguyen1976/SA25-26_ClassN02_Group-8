import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import type { Mesh } from 'three'

export default function FloatingCube({
  position,
  scale,
  color,
  speed,
  orbitRadius,
  orbitSpeed,
}: {
  position: [number, number, number]
  scale: number
  color: string
  speed: number
  orbitRadius?: number
  orbitSpeed?: number
}) {
  const meshRef = useRef<Mesh>(null)
  // eslint-disable-next-line react-hooks/purity
  const timeRef = useRef(Math.random() * Math.PI * 2)

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.001 * speed
      meshRef.current.rotation.y += 0.002 * speed

      if (orbitRadius && orbitSpeed) {
        timeRef.current += delta * orbitSpeed
        const baseX = position[0]
        const baseY = position[1]
        meshRef.current.position.x =
          baseX + Math.cos(timeRef.current) * orbitRadius
        meshRef.current.position.y =
          baseY + Math.sin(timeRef.current) * orbitRadius * 0.5
      }
    }
  })

  return (
    <Float
      speed={speed}
      rotationIntensity={0.5}
      floatIntensity={0.5}
      floatingRange={[-0.5, 0.5]}
    >
      <mesh ref={meshRef} position={position} scale={scale}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color={color}
          metalness={0.3}
          roughness={0.2}
          transparent
          opacity={0.8}
        />
      </mesh>
    </Float>
  )
}
