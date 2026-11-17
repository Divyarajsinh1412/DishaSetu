import React from 'react';

/**
 * DishaSetu Official Navigation Brand Logo
 * Geometry: Precision Navigational Compass Rose + Directional Vector + Location Core
 * Color Palette:
 * - Background Deep Navy: #071B32
 * - Emerald Green Accent: #00A878
 * - Light Blue Accent: #B8D5E8
 * - Pure White: #FFFFFF
 */
export default function DishaSetuLogo({
  size = 48,
  animated = false,
  className = ''
}) {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative flex items-center justify-center shrink-0 select-none ${className}`}
    >
      {/* Outer ambient glow */}
      <div
        className={`absolute inset-0 rounded-full bg-gradient-to-tr from-[#00A878]/30 via-[#38BDF8]/20 to-transparent blur-md ${
          animated ? 'animate-pulse' : ''
        }`}
      />

      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10 drop-shadow-lg"
      >
        <defs>
          {/* Emerald Gradient */}
          <linearGradient id="emeraldGrad" x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#00A878" />
          </linearGradient>

          {/* Light Blue Gradient */}
          <linearGradient id="lightBlueGrad" x1="80" y1="20" x2="20" y2="80" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#E0F2FE" />
            <stop offset="100%" stopColor="#B8D5E8" />
          </linearGradient>

          {/* Deep Navy Ring Gradient */}
          <linearGradient id="ringGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#00A878" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#071B32" stopOpacity="0.9" />
          </linearGradient>
        </defs>

        {/* Outer Circular Compass Gyroscope Ring */}
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="url(#ringGrad)"
          strokeWidth="2.5"
          strokeDasharray="1.5 5"
          className={animated ? 'origin-center animate-spin' : ''}
          style={{ animationDuration: '30s' }}
        />

        {/* Cardinal Direction Tick Marks (N, E, S, W) */}
        <line x1="50" y1="8" x2="50" y2="14" stroke="#00A878" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="92" y1="50" x2="86" y2="50" stroke="#B8D5E8" strokeWidth="2" strokeLinecap="round" />
        <line x1="50" y1="92" x2="50" y2="86" stroke="#B8D5E8" strokeWidth="2" strokeLinecap="round" />
        <line x1="8" y1="50" x2="14" y2="50" stroke="#B8D5E8" strokeWidth="2" strokeLinecap="round" />

        {/* Inner Location Pin / Octagon Shield Background */}
        <path
          d="M50 15 L78 30 L85 60 L50 85 L15 60 L22 30 Z"
          fill="#071B32"
          stroke="#00A878"
          strokeWidth="1.5"
          strokeOpacity="0.6"
        />

        {/* Compass Pointer Arrow - North-East Primary Facet (Emerald) */}
        <path
          d="M50 20 L66 50 L50 44 Z"
          fill="url(#emeraldGrad)"
        />

        {/* Compass Pointer Arrow - North-West Secondary Facet (White/Light Blue) */}
        <path
          d="M50 20 L34 50 L50 44 Z"
          fill="url(#lightBlueGrad)"
        />

        {/* Compass Pointer Arrow - South-West Tail (Deep Navy / Slate) */}
        <path
          d="M50 80 L34 50 L50 44 Z"
          fill="#1E293B"
          stroke="#334155"
          strokeWidth="0.5"
        />

        {/* Compass Pointer Arrow - South-East Tail (Muted Light Blue) */}
        <path
          d="M50 80 L66 50 L50 44 Z"
          fill="#0F2B48"
          stroke="#334155"
          strokeWidth="0.5"
        />

        {/* Central Core Navigational Pivot */}
        <circle cx="50" cy="46" r="5" fill="#FFFFFF" />
        <circle cx="50" cy="46" r="2.5" fill="#00A878" />

        {/* North Directional Star Flare */}
        <circle cx="50" cy="18" r="1.5" fill="#10B981" />
      </svg>
    </div>
  );
}
