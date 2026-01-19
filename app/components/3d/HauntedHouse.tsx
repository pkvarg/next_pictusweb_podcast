'use client'

import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { OrbitControls, Sky } from '@react-three/drei'
import * as THREE from 'three'

const HauntedHouseScene = () => {
  // Load textures
  const floorAlphaTexture = useLoader(THREE.TextureLoader, '/haunted-house/floor/alpha.webp')
  const floorColorTexture = useLoader(THREE.TextureLoader, '/haunted-house/floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_diff_1k.webp')
  const floorARMTexture = useLoader(THREE.TextureLoader, '/haunted-house/floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_arm_1k.webp')
  const floorNormalTexture = useLoader(THREE.TextureLoader, '/haunted-house/floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_nor_gl_1k.webp')
  const floorDisplacementTexture = useLoader(THREE.TextureLoader, '/haunted-house/floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_disp_1k.webp')

  const wallColorTexture = useLoader(THREE.TextureLoader, '/haunted-house/wall/castle_brick_broken_06_1k/castle_brick_broken_06_diff_1k.webp')
  const wallARMTexture = useLoader(THREE.TextureLoader, '/haunted-house/wall/castle_brick_broken_06_1k/castle_brick_broken_06_arm_1k.webp')
  const wallNormalTexture = useLoader(THREE.TextureLoader, '/haunted-house/wall/castle_brick_broken_06_1k/castle_brick_broken_06_nor_gl_1k.webp')

  const roofColorTexture = useLoader(THREE.TextureLoader, '/haunted-house/roof/roof_slates_02_1k/roof_slates_02_diff_1k.webp')
  const roofARMTexture = useLoader(THREE.TextureLoader, '/haunted-house/roof/roof_slates_02_1k/roof_slates_02_arm_1k.webp')
  const roofNormalTexture = useLoader(THREE.TextureLoader, '/haunted-house/roof/roof_slates_02_1k/roof_slates_02_nor_gl_1k.webp')

  const bushColorTexture = useLoader(THREE.TextureLoader, '/haunted-house/bush/leaves_forest_ground_1k/leaves_forest_ground_diff_1k.webp')
  const bushARMTexture = useLoader(THREE.TextureLoader, '/haunted-house/bush/leaves_forest_ground_1k/leaves_forest_ground_arm_1k.webp')
  const bushNormalTexture = useLoader(THREE.TextureLoader, '/haunted-house/bush/leaves_forest_ground_1k/leaves_forest_ground_nor_gl_1k.webp')

  const graveColorTexture = useLoader(THREE.TextureLoader, '/haunted-house/grave/plastered_stone_wall_1k/plastered_stone_wall_diff_1k.webp')
  const graveARMTexture = useLoader(THREE.TextureLoader, '/haunted-house/grave/plastered_stone_wall_1k/plastered_stone_wall_arm_1k.webp')
  const graveNormalTexture = useLoader(THREE.TextureLoader, '/haunted-house/grave/plastered_stone_wall_1k/plastered_stone_wall_nor_gl_1k.webp')

  const doorColorTexture = useLoader(THREE.TextureLoader, '/haunted-house/door/color.webp')
  const doorAlphaTexture = useLoader(THREE.TextureLoader, '/haunted-house/door/alpha.webp')
  const doorAmbientOcclusionTexture = useLoader(THREE.TextureLoader, '/haunted-house/door/ambientOcclusion.webp')
  const doorHeightTexture = useLoader(THREE.TextureLoader, '/haunted-house/door/height.webp')
  const doorNormalTexture = useLoader(THREE.TextureLoader, '/haunted-house/door/normal.webp')
  const doorMetalnessTexture = useLoader(THREE.TextureLoader, '/haunted-house/door/metalness.webp')
  const doorRoughnessTexture = useLoader(THREE.TextureLoader, '/haunted-house/door/roughness.webp')

  // Configure floor textures
  useMemo(() => {
    floorColorTexture.colorSpace = THREE.SRGBColorSpace
    floorColorTexture.repeat.set(8, 8)
    floorARMTexture.repeat.set(8, 8)
    floorNormalTexture.repeat.set(8, 8)
    floorDisplacementTexture.repeat.set(8, 8)

    floorColorTexture.wrapS = THREE.RepeatWrapping
    floorARMTexture.wrapS = THREE.RepeatWrapping
    floorNormalTexture.wrapS = THREE.RepeatWrapping
    floorDisplacementTexture.wrapS = THREE.RepeatWrapping

    floorColorTexture.wrapT = THREE.RepeatWrapping
    floorARMTexture.wrapT = THREE.RepeatWrapping
    floorNormalTexture.wrapT = THREE.RepeatWrapping
    floorDisplacementTexture.wrapT = THREE.RepeatWrapping

    wallColorTexture.colorSpace = THREE.SRGBColorSpace

    roofColorTexture.colorSpace = THREE.SRGBColorSpace
    roofColorTexture.repeat.set(3, 1)
    roofARMTexture.repeat.set(3, 1)
    roofNormalTexture.repeat.set(3, 1)

    roofColorTexture.wrapS = THREE.RepeatWrapping
    roofARMTexture.wrapS = THREE.RepeatWrapping
    roofNormalTexture.wrapS = THREE.RepeatWrapping

    bushColorTexture.colorSpace = THREE.SRGBColorSpace

    graveColorTexture.colorSpace = THREE.SRGBColorSpace
    graveColorTexture.repeat.set(0.3, 0.4)
    graveARMTexture.repeat.set(0.3, 0.4)
    graveNormalTexture.repeat.set(0.3, 0.4)

    doorColorTexture.colorSpace = THREE.SRGBColorSpace
  }, [floorColorTexture, floorARMTexture, floorNormalTexture, floorDisplacementTexture, wallColorTexture, roofColorTexture, roofARMTexture, roofNormalTexture, bushColorTexture, graveColorTexture, graveARMTexture, graveNormalTexture, doorColorTexture])

  // Generate graves
  const graves = useMemo(() => {
    const gravesArray = []
    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2
      const radius = 3 + Math.random() * 4
      const x = Math.sin(angle) * radius
      const y = Math.random() * 0.4
      const z = Math.cos(angle) * radius

      gravesArray.push({
        position: [x, y, z] as [number, number, number],
        rotation: [
          (Math.random() - 0.5) * 0.4,
          (Math.random() - 0.5) * 0.4,
          (Math.random() - 0.5) * 0.4
        ] as [number, number, number]
      })
    }
    return gravesArray
  }, [])

  return (
    <>
      {/* Fog */}
      <fogExp2 attach="fog" args={['#02343f', 0.1]} />

      {/* Lights */}
      <ambientLight color="#86cdff" intensity={0.275} />
      <directionalLight
        color="#86cdff"
        intensity={1}
        position={[3, 2, -8]}
        castShadow
        shadow-mapSize-width={256}
        shadow-mapSize-height={256}
        shadow-camera-top={8}
        shadow-camera-right={8}
        shadow-camera-bottom={-8}
        shadow-camera-near={1}
        shadow-camera-far={20}
      />

      {/* Sky */}
      <Sky
        scale={[100, 100, 100]}
        turbidity={10}
        rayleigh={3}
        mieCoefficient={0.1}
        mieDirectionalG={0.95}
        sunPosition={[0.3, -0.038, -0.95]}
      />

      {/* Floor */}
      <mesh rotation-x={-Math.PI * 0.5} receiveShadow>
        <planeGeometry args={[20, 20, 100, 100]} />
        <meshStandardMaterial
          alphaMap={floorAlphaTexture}
          transparent
          map={floorColorTexture}
          aoMap={floorARMTexture}
          roughnessMap={floorARMTexture}
          metalnessMap={floorARMTexture}
          normalMap={floorNormalTexture}
          displacementMap={floorDisplacementTexture}
          displacementScale={0.3}
          displacementBias={-0.2}
        />
      </mesh>

      {/* House */}
      <group>
        {/* Walls */}
        <mesh position={[0, 1.25, 0]} castShadow receiveShadow>
          <boxGeometry args={[4, 2.5, 4]} />
          <meshStandardMaterial
            map={wallColorTexture}
            aoMap={wallARMTexture}
            roughnessMap={wallARMTexture}
            metalnessMap={wallARMTexture}
            normalMap={wallNormalTexture}
          />
        </mesh>

        {/* Roof */}
        <mesh position={[0, 3.25, 0]} rotation-y={Math.PI * 0.25} castShadow>
          <coneGeometry args={[3.5, 1.5, 4]} />
          <meshStandardMaterial
            map={roofColorTexture}
            aoMap={roofARMTexture}
            roughnessMap={roofARMTexture}
            metalnessMap={roofARMTexture}
            normalMap={roofNormalTexture}
          />
        </mesh>

        {/* Door */}
        <mesh position={[0, 1, 2.01]}>
          <planeGeometry args={[2.2, 2.2]} />
          <meshStandardMaterial
            map={doorColorTexture}
            transparent
            alphaMap={doorAlphaTexture}
            aoMap={doorAmbientOcclusionTexture}
            displacementMap={doorHeightTexture}
            displacementScale={0.15}
            displacementBias={0.01}
            normalMap={doorNormalTexture}
            metalnessMap={doorMetalnessTexture}
            roughnessMap={doorRoughnessTexture}
          />
        </mesh>

        {/* Door Light */}
        <pointLight color="#ff7d46" intensity={5} position={[0, 2.2, 2.5]} />

        {/* Bushes */}
        <mesh position={[0.8, 0.2, 2.2]} rotation-x={-0.75} scale={[0.5, 0.5, 0.5]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial
            color="#ccffcc"
            map={bushColorTexture}
            aoMap={bushARMTexture}
            roughnessMap={bushARMTexture}
            metalnessMap={bushARMTexture}
            normalMap={bushNormalTexture}
          />
        </mesh>
        <mesh position={[1.4, 0.1, 2.1]} rotation-x={-0.75} scale={[0.25, 0.25, 0.25]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial
            color="#ccffcc"
            map={bushColorTexture}
            aoMap={bushARMTexture}
            roughnessMap={bushARMTexture}
            metalnessMap={bushARMTexture}
            normalMap={bushNormalTexture}
          />
        </mesh>
        <mesh position={[-0.8, 0.1, 2.2]} rotation-x={-0.75} scale={[0.4, 0.4, 0.4]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial
            color="#ccffcc"
            map={bushColorTexture}
            aoMap={bushARMTexture}
            roughnessMap={bushARMTexture}
            metalnessMap={bushARMTexture}
            normalMap={bushNormalTexture}
          />
        </mesh>
        <mesh position={[-1, 0.05, 2.6]} rotation-x={-0.75} scale={[0.15, 0.15, 0.15]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial
            color="#ccffcc"
            map={bushColorTexture}
            aoMap={bushARMTexture}
            roughnessMap={bushARMTexture}
            metalnessMap={bushARMTexture}
            normalMap={bushNormalTexture}
          />
        </mesh>
      </group>

      {/* Graves */}
      <group>
        {graves.map((grave, i) => (
          <mesh
            key={i}
            position={grave.position}
            rotation={grave.rotation}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[0.6, 0.8, 0.2]} />
            <meshStandardMaterial
              map={graveColorTexture}
              aoMap={graveARMTexture}
              roughnessMap={graveARMTexture}
              metalnessMap={graveARMTexture}
              normalMap={graveNormalTexture}
            />
          </mesh>
        ))}
      </group>

      {/* Ghosts */}
      <Ghost1 />
      <Ghost2 />
      <Ghost3 />
    </>
  )
}

const Ghost1 = () => {
  const lightRef = useRef<THREE.PointLight>(null)

  useFrame(({ clock }) => {
    const elapsedTime = clock.getElapsedTime()
    const angle = elapsedTime * 0.5

    if (lightRef.current) {
      lightRef.current.position.x = Math.cos(angle) * 4
      lightRef.current.position.z = Math.sin(angle) * 4
      lightRef.current.position.y = Math.sin(angle) * Math.sin(angle * 2.34) * Math.sin(angle * 3.45)
    }
  })

  return (
    <pointLight
      ref={lightRef}
      color="#8800ff"
      intensity={6}
      castShadow
      shadow-mapSize-width={256}
      shadow-mapSize-height={256}
    />
  )
}

const Ghost2 = () => {
  const lightRef = useRef<THREE.PointLight>(null)

  useFrame(({ clock }) => {
    const elapsedTime = clock.getElapsedTime()
    const angle = -elapsedTime * 0.38

    if (lightRef.current) {
      lightRef.current.position.x = Math.cos(angle) * 5
      lightRef.current.position.z = Math.sin(angle) * 5
      lightRef.current.position.y = Math.sin(angle) * Math.sin(angle * 2.34) * Math.sin(angle * 3.45)
    }
  })

  return (
    <pointLight
      ref={lightRef}
      color="#ff0088"
      intensity={6}
      castShadow
      shadow-mapSize-width={256}
      shadow-mapSize-height={256}
    />
  )
}

const Ghost3 = () => {
  const lightRef = useRef<THREE.PointLight>(null)

  useFrame(({ clock }) => {
    const elapsedTime = clock.getElapsedTime()
    const angle = elapsedTime * 0.23

    if (lightRef.current) {
      lightRef.current.position.x = Math.cos(angle) * 6
      lightRef.current.position.z = Math.sin(angle) * 6
      lightRef.current.position.y = Math.sin(angle) * Math.sin(angle * 2.34) * Math.sin(angle * 3.45)
    }
  })

  return (
    <pointLight
      ref={lightRef}
      color="#ff0000"
      intensity={6}
      castShadow
      shadow-mapSize-width={256}
      shadow-mapSize-height={256}
    />
  )
}

const HauntedHouse = () => {
  return (
    <Canvas
      camera={{ position: [4, 2, 5], fov: 75 }}
      shadows
      gl={{
        shadowMap: {
          enabled: true,
          type: THREE.PCFSoftShadowMap
        }
      }}
    >
      <HauntedHouseScene />
      <OrbitControls enableDamping />
    </Canvas>
  )
}

export default HauntedHouse
