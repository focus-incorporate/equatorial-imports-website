'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Group } from 'three';

interface FallingBeanProps {
  position: [number, number, number];
  delay: number;
  speed: number;
}

function CoffeeBeanShape() {
  return (
    <group>
      {/* Main bean body */}
      <mesh>
        <capsuleGeometry args={[0.08, 0.25, 4, 8]} />
        <meshStandardMaterial 
          color="#8B4513" 
          roughness={0.7} 
          metalness={0.1}
        />
      </mesh>
      {/* Bean split line */}
      <mesh position={[0, 0, 0.081]}>
        <boxGeometry args={[0.02, 0.2, 0.01]} />
        <meshStandardMaterial 
          color="#654321" 
          roughness={0.9} 
        />
      </mesh>
    </group>
  );
}

function FallingBean({ position, delay, speed }: FallingBeanProps) {
  const groupRef = useRef<Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.getElapsedTime();
      
      // Apply delay before starting animation
      if (time > delay) {
        const adjustedTime = (time - delay) * speed;
        
        // Falling motion with slight horizontal drift
        groupRef.current.position.y = position[1] - (adjustedTime % 25) * 1.5;
        groupRef.current.position.x = position[0] + Math.sin(adjustedTime * 0.5) * 0.3;
        
        // Natural rotation for coffee bean effect
        groupRef.current.rotation.x = adjustedTime * 0.8;
        groupRef.current.rotation.y = adjustedTime * 0.3;
        groupRef.current.rotation.z = adjustedTime * 0.4;
        
        // Reset position when off screen
        if (groupRef.current.position.y < -12) {
          groupRef.current.position.y = position[1] + Math.random() * 3;
          groupRef.current.position.x = position[0];
        }
      }
    }
  });

  return (
    <group ref={groupRef} position={position} scale={[1.2, 1.2, 1.2]}>
      <CoffeeBeanShape />
    </group>
  );
}

function MultipleFallingBeans() {
  const beanPositions = useMemo(() => [
    [-8, 8, -2], [-3, 9, -1], [2, 7, -3], [7, 8, -1], [-5, 10, -2],
    [0, 9, -1], [5, 7, -3], [-2, 8, -2], [8, 9, -1], [-7, 7, -3],
    [3, 8, -2], [-1, 10, -1], [6, 7, -3], [-4, 9, -2], [1, 8, -1]
  ], []);

  return (
    <>
      {beanPositions.map((position, index) => (
        <FallingBean
          key={index}
          position={position as [number, number, number]}
          delay={index * 0.8}
          speed={0.3 + Math.random() * 0.4}
        />
      ))}
    </>
  );
}

export default function SimpleFallingBeans() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 opacity-50">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 75 }}
        style={{ background: 'transparent' }}
        dpr={[1, 1.5]}
        performance={{ min: 0.5 }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={0.8} 
        />
        <pointLight position={[-5, -5, -5]} intensity={0.3} color="#F4A74B" />
        <MultipleFallingBeans />
      </Canvas>
    </div>
  );
}