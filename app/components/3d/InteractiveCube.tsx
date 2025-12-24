'use client'

import React, { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface SubCubeProps {
  initialPosition: THREE.Vector3
  targetPosition: THREE.Vector3
  color: string
}

const SubCube = ({ initialPosition, targetPosition, color }: SubCubeProps) => {
  const meshRef = useRef<THREE.Mesh>(null!)

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.position.lerp(targetPosition, delta * 5)
    }
  })

  return (
    <mesh ref={meshRef} position={initialPosition}>
      <boxGeometry args={[0.9, 0.9, 0.9]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
};

interface InteractiveCubeProps {
  position?: [number, number, number]
  scale?: number
}

export function InteractiveCube({ position = [0, 1, 0], scale = 1 }: InteractiveCubeProps) {
  const groupRef = useRef<THREE.Group>(null!)
  const [isExploded, setIsExploded] = useState(false);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.1
    }
  })

  const subCubesData = [
    { position: [-0.5, -0.5, -0.5], color: '#61DAFB' },
    { position: [-0.5, -0.5, 0.5], color: '#000000' },
    { position: [-0.5, 0.5, -0.5], color: '#FFFFFF' },
    { position: [-0.5, 0.5, 0.5], color: '#3178C6' },
    { position: [0.5, -0.5, -0.5], color: '#2D3748' },
    { position: [0.5, -0.5, 0.5], color: '#000000' },
    { position: [0.5, 0.5, -0.5], color: '#61DAFB' },
    { position: [0.5, 0.5, 0.5], color: '#3178C6' },
  ];

  return (
    <group 
      ref={groupRef} 
      position={position} 
      scale={[scale, scale, scale]}
      onPointerDown={() => setIsExploded(prev => !prev)}
    >
      {subCubesData.map((data, i) => {
        const initialPos = new THREE.Vector3(data.position[0], data.position[1], data.position[2]);
        const explodedPos = new THREE.Vector3(data.position[0] * 2, data.position[1] * 2, data.position[2] * 2);
        return (
          <SubCube 
            key={i} 
            initialPosition={initialPos}
            targetPosition={isExploded ? explodedPos : initialPos} 
            color={data.color} 
          />
        )
      })}
    </group>
  )
}
