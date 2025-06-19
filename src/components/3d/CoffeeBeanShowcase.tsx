'use client';

import { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment } from '@react-three/drei';
import { Group } from 'three';

interface CoffeeBeanShowcaseProps {
  className?: string;
  autoRotate?: boolean;
  modelPath?: string;
}

function RotatingCoffeeBean({ modelPath = '/images/coffee beans falling mid-air.glb' }: { modelPath?: string }) {
  const groupRef = useRef<Group>(null);
  const { scene } = useGLTF(modelPath);
  
  useFrame((state) => {
    if (groupRef.current) {
      // Gentle rotation
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
      // Subtle floating motion
      groupRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 0.8) * 0.1;
    }
  });

  return (
    <group ref={groupRef} scale={[0.8, 0.8, 0.8]}>
      <primitive object={scene.clone()} />
    </group>
  );
}

function LoadingFallback() {
  return (
    <mesh>
      <sphereGeometry args={[0.5, 16, 16]} />
      <meshStandardMaterial color="#8B4513" opacity={0.7} transparent />
    </mesh>
  );
}

export default function CoffeeBeanShowcase({ 
  className = "", 
  autoRotate = true, 
  modelPath 
}: CoffeeBeanShowcaseProps) {
  return (
    <div className={`w-full h-64 ${className}`}>
      <Canvas
        camera={{ position: [2, 1, 3], fov: 45 }}
        dpr={[1, 2]}
        performance={{ min: 0.5 }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight 
          position={[5, 5, 5]} 
          intensity={0.8}
          castShadow
        />
        <pointLight position={[-3, 2, -3]} intensity={0.4} color="#F4A74B" />
        
        {/* Environment for reflections */}
        <Environment preset="studio" />
        
        {/* 3D Model */}
        <Suspense fallback={<LoadingFallback />}>
          <RotatingCoffeeBean modelPath={modelPath} />
        </Suspense>
        
        {/* Controls */}
        {autoRotate && (
          <OrbitControls 
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={1}
            maxPolarAngle={Math.PI / 2}
            minPolarAngle={Math.PI / 3}
          />
        )}
      </Canvas>
    </div>
  );
}

// Preload models
useGLTF.preload('/images/coffee beans falling mid-air.glb');
useGLTF.preload('/images/Falling coffee beans.glb');