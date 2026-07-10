"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";
import EarthGlobe from "./EarthGlobe";
import { useWeather } from "@/hooks/useWeatherContext";

function WeatherParticles({ type }: { type: "rain" | "snow" | "none" }) {
  const count = type === "rain" ? 2000 : type === "snow" ? 1000 : 0;
  const mesh = useRef<THREE.InstancedMesh>(null);
  
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 20;
      const y = Math.random() * 20;
      const z = (Math.random() - 0.5) * 20;
      const speed = type === "rain" ? 0.2 + Math.random() * 0.2 : 0.05 + Math.random() * 0.05;
      temp.push({ x, y, z, speed });
    }
    return temp;
  }, [count, type]);

  useFrame(() => {
    const currentMesh = mesh.current;
    if (!currentMesh || count === 0) return;
    
    particles.forEach((particle, i) => {
      particle.y -= particle.speed;
      if (particle.y < -10) {
        particle.y = 10;
        particle.x = (Math.random() - 0.5) * 20;
        particle.z = (Math.random() - 0.5) * 20;
      }
      
      dummy.position.set(particle.x, particle.y, particle.z);
      if (type === "rain") {
        dummy.scale.set(0.02, 0.5, 0.02);
      } else {
        dummy.scale.set(0.05, 0.05, 0.05);
      }
      dummy.updateMatrix();
      currentMesh.setMatrixAt(i, dummy.matrix);
    });
    currentMesh.instanceMatrix.needsUpdate = true;
  });

  if (count === 0) return null;

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      {type === "rain" ? (
        <cylinderGeometry args={[1, 1, 1, 8]} />
      ) : (
        <sphereGeometry args={[1, 8, 8]} />
      )}
      <meshBasicMaterial 
        color={type === "rain" ? "#88CCFF" : "#FFFFFF"} 
        transparent 
        opacity={0.6} 
      />
    </instancedMesh>
  );
}

export default function WeatherEnvironment() {
  const { weather } = useWeather();
  
  // Determine particle type based on weather code
  let particleType: "rain" | "snow" | "none" = "none";
  if (weather?.current) {
    const code = weather.current.weather_code;
    if (code >= 51 && code <= 67) particleType = "rain"; // Drizzle & Rain
    if (code >= 71 && code <= 77) particleType = "snow"; // Snow
    if (code >= 80 && code <= 82) particleType = "rain"; // Showers
    if (code >= 85 && code <= 86) particleType = "snow"; // Snow showers
    if (code >= 95) particleType = "rain"; // Thunderstorm (rainy)
  }

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <Suspense fallback={null}>
          <OrbitControls 
            enableZoom={false} 
            enablePan={false}
            autoRotate
            autoRotateSpeed={0.5}
            maxPolarAngle={Math.PI / 2 + 0.1}
            minPolarAngle={Math.PI / 2 - 0.5}
          />
          <EarthGlobe />
          <WeatherParticles type={particleType} />
        </Suspense>
      </Canvas>
    </div>
  );
}
