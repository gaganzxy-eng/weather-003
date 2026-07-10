"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Sphere, MeshDistortMaterial, Stars, Html } from "@react-three/drei";
import * as THREE from "three";
import { useTheme } from "next-themes";
import { useWeather } from "@/hooks/useWeatherContext";

export default function EarthGlobe() {
  const meshRef = useRef<THREE.Group>(null);
  const { theme } = useTheme();
  const { location } = useWeather();
  
  // Rotate the globe slowly
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.05;
    }
  });

  const isDark = theme === "dark";
  const radius = 2.5;

  // Convert lat/lon to 3D Cartesian coordinates
  const markerPosition = useMemo(() => {
    if (!location) return null;
    
    const lat = location.latitude;
    const lon = location.longitude;

    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);

    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = (radius * Math.sin(phi) * Math.sin(theta));
    const y = (radius * Math.cos(phi));

    return new THREE.Vector3(x, y, z);
  }, [location]);

  return (
    <group ref={meshRef}>
      <ambientLight intensity={isDark ? 0.2 : 0.8} />
      <directionalLight position={[5, 3, 5]} intensity={isDark ? 1 : 2} />
      
      {/* Background stars for dark mode */}
      {isDark && <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />}

      <Sphere args={[radius, 64, 64]}>
        <MeshDistortMaterial
          color={isDark ? "#1E293B" : "#E2E8F0"}
          emissive={isDark ? "#0F172A" : "#FFFFFF"}
          wireframe={true}
          distort={0.1}
          speed={1}
          transparent
          opacity={0.3}
        />
      </Sphere>

      {/* Inner solid sphere */}
      <Sphere args={[radius - 0.02, 64, 64]}>
        <meshStandardMaterial 
          color={isDark ? "#020617" : "#F8FAFC"}
          roughness={0.8}
        />
      </Sphere>

      {/* Location Marker */}
      {markerPosition && (
        <group position={markerPosition}>
          <Sphere args={[0.08, 16, 16]}>
            <meshBasicMaterial color="#3B82F6" />
          </Sphere>
          <Sphere args={[0.12, 16, 16]}>
            <meshBasicMaterial color="#3B82F6" transparent opacity={0.4} />
          </Sphere>
          <Html center distanceFactor={15}>
            <div className="flex items-center gap-2 pointer-events-none">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-ping" />
              <div className="px-2 py-1 bg-black/50 backdrop-blur-md rounded border border-blue-500/30 text-white text-xs font-bold whitespace-nowrap">
                {location?.name || "Your Location"}
              </div>
            </div>
          </Html>
        </group>
      )}
    </group>
  );
}
