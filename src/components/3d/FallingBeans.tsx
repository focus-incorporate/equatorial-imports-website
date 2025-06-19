'use client';

import { useRef, Suspense, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Group } from 'three';

interface FallingBeanProps {
  position: [number, number, number];
  delay: number;
  speed: number;
  modelPath: string;
}

function CoffeeBeanModel({ modelPath }: { modelPath: string }) {
  // Load the GLB model with error handling
  const gltf = useGLTF(modelPath);
  
  // Clone and prepare the scene
  const model = useMemo(() => {
    if (gltf && gltf.scene) {
      try {
        const clone = gltf.scene.clone();
        
        // Enhanced material setup for maximum quality
        clone.traverse((child) => {
          if (child.isMesh) {
            if (child.material) {
              // Clone and enhance materials
              const material = child.material.clone();
              
              // Enhance material properties for better visibility
              if (material.color) {
                material.color.multiplyScalar(1.2); // Brighten colors
              }
              material.roughness = Math.max(0.3, material.roughness || 0.5);
              material.metalness = Math.min(0.8, material.metalness || 0.1);
              
              child.material = material;
              child.castShadow = true;
              child.receiveShadow = true;
            }
          }
        });
        
        // Ensure model is properly sized
        clone.scale.setScalar(1.2);
        return clone;
      } catch (error) {
        console.warn('GLB scene processing failed:', error);
        return null;
      }
    }
    return null;
  }, [gltf]);
  
  if (model) {
    return <primitive object={model} />;
  }
  
  // Enhanced fallback with better coffee bean shape
  return (
    <group>
      <mesh castShadow receiveShadow>
        <capsuleGeometry args={[0.12, 0.35, 4, 8]} />
        <meshStandardMaterial 
          color="#8B4513" 
          roughness={0.7} 
          metalness={0.1}
        />
      </mesh>
      {/* Coffee bean crack */}
      <mesh position={[0, 0, 0.121]} castShadow>
        <boxGeometry args={[0.02, 0.25, 0.01]} />
        <meshStandardMaterial 
          color="#654321" 
          roughness={0.9} 
        />
      </mesh>
    </group>
  );
}

function FallingBean({ position, delay, speed, modelPath }: FallingBeanProps) {
  const groupRef = useRef<Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.getElapsedTime();
      
      // Apply delay before starting animation
      if (time > delay) {
        const adjustedTime = (time - delay) * speed;
        
        // Slower, more graceful falling motion
        groupRef.current.position.y = position[1] - (adjustedTime % 30) * 1.0;
        groupRef.current.position.x = position[0] + Math.sin(adjustedTime * 0.3) * 0.8;
        
        // Enhanced rotation for better 3D showcase
        groupRef.current.rotation.x = adjustedTime * 0.6;
        groupRef.current.rotation.y = adjustedTime * 0.4;
        groupRef.current.rotation.z = adjustedTime * 0.2;
        
        // Reset position when off screen with more variation
        if (groupRef.current.position.y < -15) {
          groupRef.current.position.y = position[1] + Math.random() * 5;
          groupRef.current.position.x = position[0] + (Math.random() - 0.5) * 2;
        }
      }
    }
  });

  return (
    <group ref={groupRef} position={position} scale={[2.5, 2.5, 2.5]}>
      <Suspense fallback={null}>
        <CoffeeBeanModel modelPath={modelPath} />
      </Suspense>
    </group>
  );
}

function MultipleFallingBeans() {
  const beanPositions: Array<[number, number, number]> = [
    // Closer to camera (z: 0 to 2) and better distributed
    [-6, 10, 1], [-2, 12, 0], [3, 9, 2], [6, 11, 0], [-4, 13, 1],
    [1, 10, 0], [4, 8, 2], [-1, 11, 1], [7, 9, 0], [-5, 8, 2],
    [2, 12, 1], [0, 9, 0], [5, 10, 2], [-3, 11, 1], [8, 8, 0]
  ];

  // Use different models for variety (absolute paths from public folder)
  const models = [
    '/images/Falling coffee beans.glb',
    '/images/coffee beans falling mid-air.glb'
  ];

  return (
    <>
      {beanPositions.map((position, index) => (
        <FallingBean
          key={index}
          position={position}
          delay={index * 0.8}
          speed={0.3 + Math.random() * 0.4}
          modelPath={models[index % models.length]}
        />
      ))}
    </>
  );
}

// Loading fallback component
function LoadingFallback() {
  return (
    <mesh>
      <sphereGeometry args={[0.1, 8, 8]} />
      <meshBasicMaterial color="#8B4513" transparent opacity={0.3} />
    </mesh>
  );
}

export default function FallingBeans() {
  return (
    <div className="absolute inset-0 pointer-events-none z-0 opacity-60">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 85 }}
        style={{ background: 'transparent' }}
        dpr={[1, 2]}
        performance={{ min: 0.5 }}
        gl={{ antialias: true, alpha: true }}
      >
        {/* Enhanced lighting setup */}
        <ambientLight intensity={0.8} color="#FDF8F6" />
        <directionalLight 
          position={[15, 15, 8]} 
          intensity={1.2} 
          color="#F4A74B"
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-far={50}
          shadow-camera-left={-20}
          shadow-camera-right={20}
          shadow-camera-top={20}
          shadow-camera-bottom={-20}
        />
        <pointLight position={[-8, 5, 3]} intensity={0.6} color="#8B4513" />
        <pointLight position={[8, -5, 3]} intensity={0.4} color="#D2691E" />
        <spotLight
          position={[0, 20, 5]}
          angle={0.3}
          penumbra={0.5}
          intensity={0.8}
          color="#F4A74B"
          castShadow
        />
        <Suspense fallback={<LoadingFallback />}>
          <MultipleFallingBeans />
        </Suspense>
      </Canvas>
    </div>
  );
}

// Preload GLB models for better performance
if (typeof window !== 'undefined') {
  useGLTF.preload('/images/Falling coffee beans.glb');
  useGLTF.preload('/images/coffee beans falling mid-air.glb');
}