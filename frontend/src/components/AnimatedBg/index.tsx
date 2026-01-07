import { Canvas } from '@react-three/fiber'
// import { lazy } from 'react'
// const Scene = lazy(() => import('./Scene'))
import Scene from './Scene'

export default function AnimatedBackground() {
  return (
    <div className='absolute inset-0 z-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950'>
      <Canvas
        camera={{ position: [0, 0, 10], fov: 50 }}
        style={{ width: '100%', height: '100%' }}
      >
          <Scene />
      </Canvas>
    </div>
  )
}
