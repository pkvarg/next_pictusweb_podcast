'use client'

import { useRef, useEffect } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface AliceCharacterProps {
  position?: [number, number, number]
  scale?: number
}

export function AliceCharacter({ position = [0, 0, 0], scale = 1 }: AliceCharacterProps) {
  const group = useRef<THREE.Group>(null)
  const { scene, animations } = useGLTF('/cesium-man.glb')
  const { actions, mixer } = useAnimations(animations, group)

  // Walking path parameters - much larger to cover the screen
  const pathRadius = 12
  const walkSpeed = 0.3
  const timeRef = useRef(0)

  useEffect(() => {
    // Debug: Log all available animations
    console.log('Available animations:', animations.map(anim => anim.name))
    console.log('Number of animations:', animations.length)

    if (actions && Object.keys(actions).length > 0) {
      console.log('Available actions:', Object.keys(actions))

      // Play ALL animations to see what happens
      Object.values(actions).forEach((action, index) => {
        console.log(`Playing animation ${index}:`, Object.keys(actions)[index])
        action?.reset().play()
        action!.timeScale = 1 // Normal speed
      })
    } else {
      console.log('No actions available')
    }

    // Log the bounding box to understand model dimensions
    if (scene) {
      const box = new THREE.Box3().setFromObject(scene)
      const size = new THREE.Vector3()
      box.getSize(size)
      console.log('Model size:', size)
      console.log('Model min Y:', box.min.y)
      console.log('Model max Y:', box.max.y)
    }
  }, [actions, animations, scene])

  useFrame((state, delta) => {
    if (!group.current) return

    // Update time
    timeRef.current += delta * walkSpeed

    // Calculate circular path
    const x = Math.cos(timeRef.current) * pathRadius
    const z = Math.sin(timeRef.current) * pathRadius

    // Update position
    group.current.position.x = x + position[0]
    group.current.position.z = z + position[2]

    // Calculate rotation to face movement direction
    const angle = Math.atan2(
      Math.sin(timeRef.current),
      Math.cos(timeRef.current)
    )
    group.current.rotation.y = angle + Math.PI / 2
  })

  // Calculate the offset needed to put the model's feet on the ground
  const modelOffset = useRef<number>(0)

  useEffect(() => {
    if (scene) {
      const box = new THREE.Box3().setFromObject(scene)
      modelOffset.current = -box.min.y // Offset to place feet at y=0
      console.log('Model Y offset:', modelOffset.current)
    }
  }, [scene])

  return (
    <group ref={group} position={position}>
      <primitive
        object={scene}
        scale={scale}
        position={[0, modelOffset.current, 0]}
      />
    </group>
  )
}

// Preload the model
useGLTF.preload('/cesium-man.glb')
