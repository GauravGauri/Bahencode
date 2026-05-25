'use client';

import React, { useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

interface FlowerProps {
  color: string;
  position: [number, number, number];
  speed: number;
  scale: number;
}

// A floating 3D torus knot resembling a twisted silk bloom
const BlossomMesh: React.FC<FlowerProps> = ({ color, position, speed, scale }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();
    
    // Slow organic float
    meshRef.current.position.y = position[1] + Math.sin(time * speed) * 0.2;
    meshRef.current.position.x = position[0] + Math.cos(time * speed * 0.5) * 0.1;
    
    // Gentle rotation
    meshRef.current.rotation.x += 0.003 * speed;
    meshRef.current.rotation.y += 0.005 * speed;
  });

  return (
    <Float speed={1.5} rotationIntensity={0.8} floatIntensity={1.2}>
      <mesh
        ref={meshRef}
        position={position}
        scale={hovered ? scale * 1.15 : scale}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <torusKnotGeometry args={[0.5, 0.16, 80, 12, 2, 3]} />
        <meshStandardMaterial
          color={color}
          roughness={0.15}
          metalness={0.1}
          emissive={color}
          emissiveIntensity={0.05}
        />
      </mesh>
    </Float>
  );
};

// Controls tracking mouse positioning to affect coordinates
const InteractionHandler: React.FC = () => {
  const { pointer } = useThree();
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!groupRef.current) return;
    // Smooth lerp to mouse/pointer position
    const targetX = pointer.x * 1.2;
    const targetY = pointer.y * 1.2;
    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, 0.05);
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.05);
  });

  return (
    <group ref={groupRef}>
      {/* Main center blossom */}
      <BlossomMesh color="#d4856a" position={[0, 0, 0]} speed={1.0} scale={1.8} />
      {/* Surrounding smaller blossoms */}
      <BlossomMesh color="#f2d5d0" position={[-2.0, 1.2, -1]} speed={0.7} scale={0.9} />
      <BlossomMesh color="#c4a49a" position={[2.0, -1.0, -1]} speed={1.2} scale={1.1} />
      <BlossomMesh color="#f2d5d0" position={[1.5, 1.4, -2]} speed={0.9} scale={0.7} />
      <BlossomMesh color="#c4a49a" position={[-1.5, -1.2, -2]} speed={1.1} scale={0.8} />
    </group>
  );
};

export default function Canvas3D() {
  return (
    <div className="w-full h-full min-h-[300px] md:min-h-[450px] lg:min-h-[550px] select-none cursor-pointer">
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }} gl={{ antialias: true }}>
        <ambientLight intensity={1.8} />
        <directionalLight position={[5, 5, 5]} intensity={2.0} />
        <pointLight position={[-5, -5, -5]} intensity={1.2} color="#f2d5d0" />
        <InteractionHandler />
      </Canvas>
    </div>
  );
}
