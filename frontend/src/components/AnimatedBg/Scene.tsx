import { Environment } from '@react-three/drei'
import FloatingCube from './FloatingCube'

//lazy thằng này
export default function Scene() {
  return (
    <>
      <Environment preset='studio' />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <directionalLight position={[-10, -10, -5]} intensity={0.5} />

      <FloatingCube
        position={[-8, 2, -5]}
        scale={1.5}
        color='#6366f1'
        speed={1}
        orbitRadius={1.5}
        orbitSpeed={0.3}
      />
      <FloatingCube
        position={[8, -2, -7]}
        scale={1.2}
        color='#8b5cf6'
        speed={0.8}
        orbitRadius={1.2}
        orbitSpeed={0.4}
      />
      <FloatingCube
        position={[-9, -3, -10]}
        scale={1.8}
        color='#4f46e5'
        speed={0.6}
        orbitRadius={1.0}
        orbitSpeed={0.25}
      />
      <FloatingCube
        position={[9, 3, -8]}
        scale={1}
        color='#7c3aed'
        speed={1.2}
        orbitRadius={1.3}
        orbitSpeed={0.35}
      />
      <FloatingCube
        position={[-7, 5, -6]}
        scale={1.3}
        color='#6366f1'
        speed={0.9}
        orbitRadius={1.4}
        orbitSpeed={0.3}
      />
      <FloatingCube
        position={[7, -4, -9]}
        scale={1.1}
        color='#5b21b6'
        speed={1.1}
        orbitRadius={1.1}
        orbitSpeed={0.32}
      />
      <FloatingCube
        position={[10, 0, -12]}
        scale={1.6}
        color='#4f46e5'
        speed={0.7}
        orbitRadius={1.5}
        orbitSpeed={0.28}
      />
      <FloatingCube
        position={[-10, 1, -7]}
        scale={0.9}
        color='#8b5cf6'
        speed={1.3}
        orbitRadius={1.0}
        orbitSpeed={0.38}
      />
      <FloatingCube
        position={[-6, -5, -8]}
        scale={1.4}
        color='#6366f1'
        speed={0.85}
        orbitRadius={1.2}
        orbitSpeed={0.33}
      />
      <FloatingCube
        position={[6, 5, -11]}
        scale={1.1}
        color='#7c3aed'
        speed={1.15}
        orbitRadius={1.3}
        orbitSpeed={0.29}
      />
    </>
  )
}
