"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Sphere, Stars, Html } from "@react-three/drei";
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
      meshRef.current.rotation.y += delta * 0.015;
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

  // Generate a procedural Earth-like sphere with gradient colors
  const earthMaterial = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext("2d")!;

    // Create ocean gradient
    const oceanGradient = ctx.createLinearGradient(0, 0, 0, 256);
    oceanGradient.addColorStop(0, "#1a3a5c");
    oceanGradient.addColorStop(0.3, "#1e6091");
    oceanGradient.addColorStop(0.5, "#2980b9");
    oceanGradient.addColorStop(0.7, "#1e6091");
    oceanGradient.addColorStop(1, "#1a3a5c");
    ctx.fillStyle = oceanGradient;
    ctx.fillRect(0, 0, 512, 256);

    // Add some "continent" shapes with noise-like blobs
    const continentColor = isDark ? "#1a472a" : "#2d6a4f";
    ctx.fillStyle = continentColor;
    // Rough continent blobs
    const blobs = [
      { x: 280, y: 80, rx: 40, ry: 50 },   // Europe/Africa
      { x: 300, y: 120, rx: 30, ry: 60 },
      { x: 340, y: 100, rx: 45, ry: 40 },   // Asia
      { x: 380, y: 110, rx: 35, ry: 30 },
      { x: 120, y: 90, rx: 50, ry: 40 },    // Americas
      { x: 130, y: 130, rx: 25, ry: 50 },
      { x: 100, y: 80, rx: 35, ry: 30 },
      { x: 400, y: 180, rx: 30, ry: 20 },   // Australia
      { x: 270, y: 40, rx: 20, ry: 15 },    // Northern
    ];
    blobs.forEach(b => {
      ctx.beginPath();
      ctx.ellipse(b.x, b.y, b.rx, b.ry, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    // Add polar ice caps
    ctx.fillStyle = "#e8f4f8";
    ctx.fillRect(0, 0, 512, 18);
    ctx.fillRect(0, 238, 512, 18);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
  }, [isDark]);

  return (
    <group ref={meshRef}>
      {/* Sun / Light sources */}
      <ambientLight intensity={isDark ? 0.3 : 0.7} />
      <directionalLight position={[10, 5, 10]} intensity={isDark ? 1.5 : 2.5} castShadow />
      
      {/* Background stars for dark mode */}
      {isDark && <Stars radius={120} depth={60} count={3500} factor={6} saturation={0.5} fade speed={1.5} />}

      {/* Procedural Earth Sphere */}
      <Sphere args={[radius, 64, 64]}>
        <meshStandardMaterial
          map={earthMaterial}
          roughness={0.4}
          metalness={0.1}
        />
      </Sphere>

      {/* Atmospheric glow ring */}
      <Sphere args={[radius + 0.03, 64, 64]}>
        <meshBasicMaterial
          color={isDark ? "#4488ff" : "#88bbff"}
          transparent
          opacity={0.08}
          side={THREE.BackSide}
        />
      </Sphere>

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
