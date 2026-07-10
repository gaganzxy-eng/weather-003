"use client";

/**
 * Weather AI — Animated Weather Icons
 * Beautiful animated SVG icons for each weather condition.
 */

import { motion } from "framer-motion";

interface WeatherIconProps {
  code: number;
  isDay?: boolean;
  size?: number;
  className?: string;
}

export default function WeatherIcon({ code, isDay = true, size = 64, className = "" }: WeatherIconProps) {
  const iconSize = size;

  // Clear sky / Mainly clear
  if (code <= 1) {
    return isDay ? <SunIcon size={iconSize} className={className} /> : <MoonIcon size={iconSize} className={className} />;
  }
  // Partly cloudy
  if (code === 2) {
    return isDay
      ? <CloudSunIcon size={iconSize} className={className} />
      : <CloudMoonIcon size={iconSize} className={className} />;
  }
  // Overcast
  if (code === 3) return <CloudIcon size={iconSize} className={className} />;
  // Fog
  if (code === 45 || code === 48) return <FogIcon size={iconSize} className={className} />;
  // Drizzle
  if (code >= 51 && code <= 57) return <DrizzleIcon size={iconSize} className={className} />;
  // Rain
  if (code >= 61 && code <= 67) return <RainIcon size={iconSize} className={className} />;
  // Snow
  if (code >= 71 && code <= 77) return <SnowIcon size={iconSize} className={className} />;
  // Rain showers
  if (code >= 80 && code <= 82) return <RainIcon size={iconSize} className={className} />;
  // Snow showers
  if (code >= 85 && code <= 86) return <SnowIcon size={iconSize} className={className} />;
  // Thunderstorm
  if (code >= 95) return <ThunderstormIcon size={iconSize} className={className} />;

  return <CloudIcon size={iconSize} className={className} />;
}

// ─── Individual Animated Icons ──────────────────────────────────────────────

function SunIcon({ size, className }: { size: number; className: string }) {
  return (
    <motion.svg
      width={size} height={size} viewBox="0 0 64 64" className={className}
      animate={{ rotate: 360 }}
      transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
    >
      {/* Sun rays */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
        <motion.line
          key={i}
          x1="32" y1="8" x2="32" y2="14"
          stroke="#FBBF24" strokeWidth="2.5" strokeLinecap="round"
          transform={`rotate(${angle} 32 32)`}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, delay: i * 0.15, repeat: Infinity }}
        />
      ))}
      {/* Sun body */}
      <motion.circle
        cx="32" cy="32" r="12"
        fill="#FBBF24"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <circle cx="32" cy="32" r="10" fill="#FCD34D" />
    </motion.svg>
  );
}

function MoonIcon({ size, className }: { size: number; className: string }) {
  return (
    <motion.svg
      width={size} height={size} viewBox="0 0 64 64" className={className}
      animate={{ y: [0, -2, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    >
      <motion.path
        d="M36 16c-1.1 0-2.2.1-3.3.2A14 14 0 0 1 42 28a14 14 0 0 1-14 14c-2.8 0-5.4-.8-7.6-2.2A18 18 0 1 0 36 16z"
        fill="#CBD5E1"
        animate={{ opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      {/* Stars */}
      {[[14, 14], [50, 20], [10, 42]].map(([cx, cy], i) => (
        <motion.circle
          key={i} cx={cx} cy={cy} r="1.5" fill="#FDE68A"
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
          transition={{ duration: 2, delay: i * 0.7, repeat: Infinity }}
        />
      ))}
    </motion.svg>
  );
}

function CloudIcon({ size, className }: { size: number; className: string }) {
  return (
    <motion.svg
      width={size} height={size} viewBox="0 0 64 64" className={className}
      animate={{ x: [0, 3, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
    >
      <motion.path
        d="M48 38H16a10 10 0 0 1-1-19.9A14 14 0 0 1 41.5 14 12 12 0 0 1 48 38z"
        fill="#94A3B8" fillOpacity="0.8"
      />
      <path
        d="M48 38H16a10 10 0 0 1-1-19.9A14 14 0 0 1 41.5 14 12 12 0 0 1 48 38z"
        fill="none" stroke="#CBD5E1" strokeWidth="1"
      />
    </motion.svg>
  );
}

function CloudSunIcon({ size, className }: { size: number; className: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className}>
      {/* Sun behind */}
      <motion.circle
        cx="42" cy="22" r="10" fill="#FBBF24"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      {/* Cloud in front */}
      <motion.path
        d="M42 42H14a9 9 0 0 1-.9-17.9A12.5 12.5 0 0 1 37 20 10.5 10.5 0 0 1 42 42z"
        fill="#94A3B8" fillOpacity="0.85"
        animate={{ x: [0, 2, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
    </svg>
  );
}

function CloudMoonIcon({ size, className }: { size: number; className: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className}>
      {/* Moon behind */}
      <motion.path
        d="M48 10c-.7 0-1.4.1-2.1.1A9 9 0 0 1 52 18a9 9 0 0 1-9 9c-1.8 0-3.5-.5-4.9-1.4A12 12 0 1 0 48 10z"
        fill="#CBD5E1"
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      {/* Cloud */}
      <motion.path
        d="M42 44H14a9 9 0 0 1-.9-17.9A12.5 12.5 0 0 1 37 22 10.5 10.5 0 0 1 42 44z"
        fill="#64748B" fillOpacity="0.85"
        animate={{ x: [0, 2, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
    </svg>
  );
}

function FogIcon({ size, className }: { size: number; className: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className}>
      {[24, 32, 40, 48].map((y, i) => (
        <motion.line
          key={i}
          x1={12 + i * 2} y1={y} x2={52 - i * 2} y2={y}
          stroke="#94A3B8" strokeWidth="3" strokeLinecap="round"
          animate={{ x: [-3, 3, -3], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 3, delay: i * 0.3, repeat: Infinity }}
        />
      ))}
    </svg>
  );
}

function DrizzleIcon({ size, className }: { size: number; className: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className}>
      {/* Cloud */}
      <motion.path
        d="M46 30H18a8 8 0 0 1-.8-15.9A11 11 0 0 1 39.5 10 9 9 0 0 1 46 30z"
        fill="#64748B"
        animate={{ x: [0, 1.5, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      {/* Drizzle drops */}
      {[[24, 36], [32, 38], [40, 35]].map(([x, y], i) => (
        <motion.circle
          key={i} cx={x} cy={y} r="1.5" fill="#60A5FA"
          animate={{ y: [0, 18], opacity: [1, 0] }}
          transition={{ duration: 1.2, delay: i * 0.4, repeat: Infinity }}
        />
      ))}
    </svg>
  );
}

function RainIcon({ size, className }: { size: number; className: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className}>
      {/* Cloud */}
      <motion.path
        d="M46 28H18a8 8 0 0 1-.8-15.9A11 11 0 0 1 39.5 8 9 9 0 0 1 46 28z"
        fill="#475569"
      />
      {/* Rain drops */}
      {[[22, 34], [28, 36], [34, 33], [40, 35], [46, 32]].map(([x, y], i) => (
        <motion.line
          key={i}
          x1={x} y1={y} x2={x! - 2} y2={y! + 8}
          stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"
          animate={{ y: [0, 16], opacity: [1, 0] }}
          transition={{ duration: 0.8, delay: i * 0.15, repeat: Infinity }}
        />
      ))}
    </svg>
  );
}

function SnowIcon({ size, className }: { size: number; className: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className}>
      {/* Cloud */}
      <path
        d="M46 28H18a8 8 0 0 1-.8-15.9A11 11 0 0 1 39.5 8 9 9 0 0 1 46 28z"
        fill="#94A3B8"
      />
      {/* Snowflakes */}
      {[[24, 36], [32, 40], [40, 34], [28, 44], [36, 48]].map(([x, y], i) => (
        <motion.text
          key={i} x={x} y={y}
          fontSize="8" fill="#E2E8F0" textAnchor="middle"
          animate={{ y: [0, 16], opacity: [1, 0], rotate: [0, 180] }}
          transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
        >
          ❄
        </motion.text>
      ))}
    </svg>
  );
}

function ThunderstormIcon({ size, className }: { size: number; className: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className}>
      {/* Dark cloud */}
      <path
        d="M48 26H16a8 8 0 0 1-.8-15.9A11 11 0 0 1 39.5 6 9 9 0 0 1 48 26z"
        fill="#334155"
      />
      {/* Lightning bolt */}
      <motion.polygon
        points="30,28 34,28 28,42 32,42 24,56 36,38 32,38 38,28"
        fill="#FBBF24"
        animate={{ opacity: [0, 1, 1, 0, 0, 1, 0] }}
        transition={{ duration: 2, repeat: Infinity, times: [0, 0.1, 0.2, 0.3, 0.7, 0.8, 1] }}
      />
      {/* Rain */}
      {[[20, 30], [42, 32], [48, 28]].map(([x, y], i) => (
        <motion.line
          key={i}
          x1={x} y1={y} x2={x! - 2} y2={y! + 8}
          stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round"
          animate={{ y: [0, 18], opacity: [0.7, 0] }}
          transition={{ duration: 0.7, delay: i * 0.2, repeat: Infinity }}
        />
      ))}
    </svg>
  );
}
