"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Sphere, Stars, Html, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { useTheme } from "next-themes";
import { useWeather } from "@/hooks/useWeatherContext";

export default function EarthGlobe() {
  const meshRef = useRef<THREE.Group>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const { theme } = useTheme();
  const { location } = useWeather();
  
  // Load high-resolution realistic Earth textures via CDN (with CORS support)
  const textures = useTexture({
    day: "https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg",
    night: "https://unpkg.com/three-globe/example/img/earth-night.jpg",
    clouds: "https://unpkg.com/three-globe/example/img/earth-clouds.png"
  });

  // Rotate the globe and clouds slowly at different speeds for high realism
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.015; // Slow natural rotation
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.022; // Clouds drift slightly faster
    }
  });

  const isDark = theme === "dark";
  const radius = 2.5;

  // Convert lat/lon to 3D Cartesian coordinates
  const markerPosition = useMemo(() => {
    if (!location) return null;
    
    const lat = location.latitude;
    // Offset longitude by 90 degrees to align texture seam correctly
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
      {/* Sun / Light sources */}
      <ambientLight intensity={isDark ? 0.3 : 0.7} />
      <directionalLight position={[10, 5, 10]} intensity={isDark ? 1.5 : 2.5} castShadow />
      
      {/* Background stars for dark mode */}
      {isDark && <Stars radius={120} depth={60} count={3500} factor={6} saturation={0.5} fade speed={1.5} />}

      {/* Realistic Earth Sphere */}
      <Sphere args={[radius, 64, 64]}>
        <meshStandardMaterial
          map={isDark ? textures.night : textures.day}
          roughness={0.4}
          metalness={0.1}
        />
      </Sphere>

      {/* Independently Rotating Atmospheric Cloud Layer */}
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[radius + 0.02, 64, 64]} />
        <meshStandardMaterial
          alphaMap={textures.clouds}
          transparent
          color="#ffffff"
          opacity={0.35}
          depthWrite={false}
        />
      </mesh>

      {/* Location Marker */}
      {markerPosition && (
        <group position={markerPosition}>
          {/* Glowing core */}
          <Sphere args={[0.08, 16, 16]}>
            <meshBasicMaterial color="#ef4444" />
          </Sphere>
          {/* Pulsing ring */}
          <Sphere args={[0.15, 16, 16]}>
            <meshBasicMaterial color="#ef4444" transparent opacity={0.3} />
          </Sphere>
          <Html center distanceFactor={15}>
            <div className="flex items-center gap-2 pointer-events-none">
              <div className="w-3.5 h-3.5 bg-red-500 rounded-full animate-ping" />
              <div 
                className="px-2.5 py-1 rounded-md text-white text-xs font-bold whitespace-nowrap shadow-lg"
                style={{
                  background: "rgba(15, 23, 42, 0.85)",
                  border: "1px solid rgba(239, 68, 68, 0.5)",
                  backdropFilter: "blur(4px)"
                }}
              >
                📍 {location?.name || "Your Location"}
              </div>
            </div>
          </Html>
        </group>
      )}
    </group>
  );
}
