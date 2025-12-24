'use client'

import { Canvas } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import { Suspense } from 'react'
import { InteractiveCube } from './InteractiveCube'

export default function Scene3D() {
  return (
    <div className="fixed inset-0 w-full h-full z-0">
      <Canvas
        camera={{ position: [0, 2, 8], fov: 75 }}
      >
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.6} />
          <directionalLight
            position={[10, 10, 10]}
            intensity={1}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <pointLight position={[-10, 10, -10]} intensity={0.5} />

          {/* Environment for better reflections */}
          <Environment preset="sunset" />

          {/* Ground plane - invisible but shows shadow */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
            <planeGeometry args={[50, 50]} />
            <meshStandardMaterial
              color="#000000"
              transparent
              opacity={0}
              shadowSide={2}
            />
          </mesh>

          <InteractiveCube />
        </Suspense>
      </Canvas>
    </div>
  )
}
