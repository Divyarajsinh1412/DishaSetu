import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import {
  Compass,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Camera,
  Layers,
  MapPin,
  Navigation as NavigationIcon,
  Sparkles,
  Info,
  X,
  ArrowRight,
  ChevronRight,
  Eye,
  Building2,
  Coffee,
  Trophy,
  BookOpen
} from 'lucide-react';
import CampusPanoramaMenu from './CampusPanoramaMenu';

export default function ImmersiveViewer({
  scenes = [],
  hotspots = [],
  currentSceneId,
  onSceneChange,
  onStartNavigation,
  onOpenBuildingPopup,
  onOpenIndoorMap,
  onStartIndoorNavigation,
  onSwitchToMap,
  activeRoute = null,
  onClearRoute
}) {
  const mountRef = useRef(null);
  const canvasRef = useRef(null);

  // Active scene
  const activeScene = useMemo(() => {
    return scenes.find(s => s.sceneId === currentSceneId) || scenes[0] || null;
  }, [scenes, currentSceneId]);

  // Hotspots for current scene
  const currentHotspots = useMemo(() => {
    if (!activeScene) return [];
    return hotspots.filter(h => h.sceneId === activeScene.sceneId && h.active !== false);
  }, [hotspots, activeScene]);

  // Three.js State Refs (to avoid re-renders on every animation frame)
  const threeRef = useRef({
    scene: null,
    camera: null,
    renderer: null,
    sphereMesh: null,
    textureLoader: new THREE.TextureLoader(),
    isUserInteracting: false,
    onMouseDownMouseX: 0,
    onMouseDownMouseY: 0,
    lon: 0,
    lat: 0,
    onMouseDownLon: 0,
    onMouseDownLat: 0,
    phi: 0,
    theta: 0,
    target: new THREE.Vector3(),
    fov: 75,
    autoRotate: true,
    autoRotateSpeed: 0.08,
    lastInteractionTime: Date.now(),
    animationFrameId: null,
    touchDistance: 0
  });

  // UI Interactive States
  const [isMenuOpen, setIsMenuOpen] = useState(() => typeof window !== 'undefined' ? window.innerWidth >= 1024 : false);
  const [isAutoRotate, setIsAutoRotate] = useState(true);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedHotspot, setSelectedHotspot] = useState(null);
  const [hoveredHotspot, setHoveredHotspot] = useState(null);
  const [projectedHotspots, setProjectedHotspots] = useState([]);
  const [showSceneDrawer, setShowSceneDrawer] = useState(false);
  const [isSceneLoading, setIsSceneLoading] = useState(true);
  const [panoramaLoadError, setPanoramaLoadError] = useState(false);

  // Web Audio Context & Node Refs for Ambiance Synthesis
  const audioCtxRef = useRef(null);
  const audioNodesRef = useRef(null);

  // Initialize Three.js WebGL Scene
  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // Three.js Scene
    const scene = new THREE.Scene();

    // Perspective Camera inside the 360° sphere
    const initialFov = activeScene?.initialZoom || 75;
    const camera = new THREE.PerspectiveCamera(initialFov, width / height, 1, 1100);
    camera.target = new THREE.Vector3(0, 0, 0);

    // WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);

    // Inverted 360° Sphere Geometry
    const geometry = new THREE.SphereGeometry(500, 64, 40);
    geometry.scale(-1, 1, 1); // Invert so inside is visible

    // Initial Material
    const material = new THREE.MeshBasicMaterial({
      color: 0x1e293b // Dark slate placeholder while image loads
    });

    const sphereMesh = new THREE.Mesh(geometry, material);
    scene.add(sphereMesh);

    threeRef.current.scene = scene;
    threeRef.current.camera = camera;
    threeRef.current.renderer = renderer;
    threeRef.current.sphereMesh = sphereMesh;
    threeRef.current.lon = activeScene?.initialYaw || 0;
    threeRef.current.lat = activeScene?.initialPitch || -10;
    threeRef.current.fov = initialFov;

    // Resize handler
    const handleResize = () => {
      if (!mountRef.current || !threeRef.current.camera || !threeRef.current.renderer) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      threeRef.current.camera.aspect = w / h;
      threeRef.current.camera.updateProjectionMatrix();
      threeRef.current.renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Animation & Render Loop
    let frameId;
    const animate = () => {
      frameId = requestAnimationFrame(animate);

      const state = threeRef.current;
      if (!state.camera || !state.renderer || !state.scene) return;

      // Auto-rotation logic (resumes after 4s idle)
      const isIdle = Date.now() - state.lastInteractionTime > 4000;
      if (state.autoRotate && !state.isUserInteracting && isIdle) {
        state.lon += state.autoRotateSpeed;
      }

      // Constrain Pitch between -85° and 85°
      state.lat = Math.max(-85, Math.min(85, state.lat));

      // Convert spherical coordinates to 3D lookAt target
      state.phi = THREE.MathUtils.degToRad(90 - state.lat);
      state.theta = THREE.MathUtils.degToRad(state.lon);

      state.target.x = 500 * Math.sin(state.phi) * Math.cos(state.theta);
      state.target.y = 500 * Math.cos(state.phi);
      state.target.z = 500 * Math.sin(state.phi) * Math.sin(state.theta);

      state.camera.lookAt(state.target);
      state.renderer.render(state.scene, state.camera);

      // Project hotspots to 2D screen positions
      projectHotspotsToScreen(state.camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, []);

  // Load / Switch Panorama Texture when activeScene changes
  useEffect(() => {
    if (!activeScene || !threeRef.current.sphereMesh) return;

    setIsSceneLoading(true);
    setPanoramaLoadError(false);
    const texturePath = activeScene.panoramaImage;

    threeRef.current.textureLoader.load(
      texturePath,
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.minFilter = THREE.LinearFilter;
        texture.generateMipmaps = false;

        if (threeRef.current.sphereMesh) {
          threeRef.current.sphereMesh.material.map = texture;
          threeRef.current.sphereMesh.material.needsUpdate = true;
        }

        // Animate camera to scene default view
        threeRef.current.lon = activeScene.initialYaw || 0;
        threeRef.current.lat = activeScene.initialPitch || -10;
        threeRef.current.fov = activeScene.initialZoom || 75;
        if (threeRef.current.camera) {
          threeRef.current.camera.fov = threeRef.current.fov;
          threeRef.current.camera.updateProjectionMatrix();
        }

        setIsSceneLoading(false);
        setPanoramaLoadError(false);
      },
      undefined,
      (err) => {
        console.warn('Failed to load panorama texture:', texturePath, err);
        setIsSceneLoading(false);
        setPanoramaLoadError(true);
      }
    );
  }, [activeScene]);

  // Project Spherical Hotspots to 2D Screen Coordinates
  const projectHotspotsToScreen = useCallback((camera) => {
    if (!mountRef.current || !currentHotspots.length) {
      setProjectedHotspots([]);
      return;
    }

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;
    const projected = [];

    for (let i = 0; i < currentHotspots.length; i++) {
      const spot = currentHotspots[i];
      // Convert spot yaw and pitch to 3D Cartesian coordinates on sphere
      // Note: yaw=0 points forward, pitch=0 is horizon
      const phi = THREE.MathUtils.degToRad(90 - spot.pitch);
      const theta = THREE.MathUtils.degToRad(spot.yaw + 180);

      const x = -480 * Math.sin(phi) * Math.cos(theta);
      const y = 480 * Math.cos(phi);
      const z = 480 * Math.sin(phi) * Math.sin(theta);

      const vector = new THREE.Vector3(x, y, z);
      vector.project(camera);

      // Check if in front of camera (vector.z < 1)
      if (vector.z < 1) {
        const screenX = (vector.x * 0.5 + 0.5) * width;
        const screenY = (-vector.y * 0.5 + 0.5) * height;

        // Only include if inside or near screen viewport
        if (screenX >= -50 && screenX <= width + 50 && screenY >= -50 && screenY <= height + 50) {
          projected.push({
            ...spot,
            screenX,
            screenY
          });
        }
      }
    }

    setProjectedHotspots(projected);
  }, [currentHotspots]);

  // Mouse & Touch Controls
  const handlePointerDown = (e) => {
    // Only drag on canvas / background, not when clicking interactive UI elements
    if (e.target.closest('button') || e.target.closest('.interactive-hotspot') || e.target.closest('aside')) return;

    const state = threeRef.current;
    state.isUserInteracting = true;
    state.lastInteractionTime = Date.now();

    const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;

    state.onMouseDownMouseX = clientX;
    state.onMouseDownMouseY = clientY;
    state.onMouseDownLon = state.lon;
    state.onMouseDownLat = state.lat;

    if (e.touches && e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      state.touchDistance = Math.hypot(dx, dy);
    }
  };

  const handlePointerMove = (e) => {
    const state = threeRef.current;
    if (!state.isUserInteracting) return;
    state.lastInteractionTime = Date.now();

    // Pinch zoom handling for multi-touch
    if (e.touches && e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const newDistance = Math.hypot(dx, dy);
      const factor = state.touchDistance / newDistance;
      state.touchDistance = newDistance;

      if (state.camera) {
        state.camera.fov = Math.max(35, Math.min(90, state.camera.fov * factor));
        state.camera.updateProjectionMatrix();
      }
      return;
    }

    const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;

    // Inverted drag factor so dragging left pans camera left
    const factor = 0.15 * (state.camera ? state.camera.fov / 75 : 1);
    state.lon = (state.onMouseDownMouseX - clientX) * factor + state.onMouseDownLon;
    state.lat = (clientY - state.onMouseDownMouseY) * factor + state.onMouseDownLat;
  };

  const handlePointerUp = () => {
    threeRef.current.isUserInteracting = false;
    threeRef.current.lastInteractionTime = Date.now();
  };

  const handleWheel = (e) => {
    const state = threeRef.current;
    state.lastInteractionTime = Date.now();
    if (!state.camera) return;

    // Smooth FOV zoom
    state.camera.fov = Math.max(35, Math.min(90, state.camera.fov + e.deltaY * 0.05));
    state.camera.updateProjectionMatrix();
  };

  // Center Camera smoothly on a specific Hotspot / Direction
  const centerCameraOnHotspot = (hotspot) => {
    const state = threeRef.current;
    state.lastInteractionTime = Date.now();

    // If hotspot is in a different scene, switch scene first
    if (hotspot.sceneId && hotspot.sceneId !== currentSceneId) {
      onSceneChange(hotspot.sceneId);
    }

    // Target yaw & pitch
    const targetLon = hotspot.yaw || 0;
    const targetLat = hotspot.pitch || 0;

    // Smooth interpolation animation over 600ms
    const startLon = state.lon % 360;
    const startLat = state.lat;
    const startTime = performance.now();
    const duration = 600;

    // Shortest angular distance
    let diffLon = (targetLon - startLon) % 360;
    if (diffLon > 180) diffLon -= 360;
    if (diffLon < -180) diffLon += 360;

    const animStep = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // easeOutCubic
      const ease = 1 - Math.pow(1 - progress, 3);

      state.lon = startLon + diffLon * ease;
      state.lat = startLat + (targetLat - startLat) * ease;

      if (progress < 1) {
        requestAnimationFrame(animStep);
      } else {
        setSelectedHotspot(hotspot);
      }
    };

    requestAnimationFrame(animStep);
  };

  // Reset to default scene viewpoint
  const handleResetHome = () => {
    if (!activeScene) return;
    const state = threeRef.current;
    state.lon = activeScene.initialYaw || 0;
    state.lat = activeScene.initialPitch || -10;
    if (state.camera) {
      state.camera.fov = activeScene.initialZoom || 75;
      state.camera.updateProjectionMatrix();
    }
  };

  // Toggle Auto-rotation
  const toggleAutoRotate = () => {
    const next = !isAutoRotate;
    setIsAutoRotate(next);
    threeRef.current.autoRotate = next;
  };

  // Web Audio Campus Breeze & Subtle Ambiance Synthesizer
  const toggleAudioAmbiance = () => {
    if (isAudioPlaying) {
      // Stop audio
      if (audioNodesRef.current) {
        audioNodesRef.current.gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtxRef.current.currentTime + 0.5);
        setTimeout(() => {
          audioCtxRef.current?.suspend();
        }, 500);
      }
      setIsAudioPlaying(false);
    } else {
      // Start synthesized ambient breeze
      try {
        if (!audioCtxRef.current) {
          const AudioContext = window.AudioContext || window.webkitAudioContext;
          audioCtxRef.current = new AudioContext();
        }

        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') {
          ctx.resume();
        }

        // Generate gentle pink/filtered noise for soft natural breeze
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
          b6 = white * 0.115926;
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        // Bandpass filter centered at 320 Hz for gentle wind sound
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(320, ctx.currentTime);
        filter.Q.setValueAtTime(1.8, ctx.currentTime);

        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0.001, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.35, ctx.currentTime + 1.2);

        whiteNoise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);

        whiteNoise.start();

        audioNodesRef.current = { whiteNoise, filter, gainNode };
        setIsAudioPlaying(true);
      } catch (e) {
        console.warn('Web Audio Ambiance not supported or blocked:', e);
      }
    }
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      mountRef.current?.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Camera Snapshot (Take PNG of current 360° perspective)
  const handleTakeSnapshot = () => {
    if (!canvasRef.current) return;
    try {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `Presidency_University_360_${activeScene?.sceneId || 'aerial'}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      console.warn('Snapshot capture failed:', e);
    }
  };

  // Handle clicking on a hotspot
  const handleHotspotClick = (spot) => {
    // If it's a scene portal, transition scene
    if (spot.hotspotType === 'scene_portal' && spot.targetSceneId) {
      onSceneChange(spot.targetSceneId);
      return;
    }

    // Otherwise open preview card
    setSelectedHotspot(spot);

    const isBuilding = spot.buildingShortCode || spot.title?.includes('Block') || spot.title?.includes('Library');
    if (isBuilding && onOpenBuildingPopup) {
      onOpenBuildingPopup({
        name: spot.title,
        shortCode: spot.buildingShortCode || 'PU-BLD',
        category: 'Academic Block',
        description: spot.description,
        totalFloors: 4
      });
    }
  };

  return (
    <div
      ref={mountRef}
      onMouseDown={handlePointerDown}
      onMouseMove={handlePointerMove}
      onMouseUp={handlePointerUp}
      onTouchStart={handlePointerDown}
      onTouchMove={handlePointerMove}
      onTouchEnd={handlePointerUp}
      onWheel={handleWheel}
      className="relative w-full h-full overflow-hidden select-none bg-slate-950 cursor-grab active:cursor-grabbing"
    >
      {/* WebGL Canvas */}
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* Loading Overlay */}
      {isSceneLoading && (
        <div className="absolute inset-0 z-30 bg-slate-950/70 backdrop-blur-md flex flex-col items-center justify-center pointer-events-none">
          <div className="w-12 h-12 rounded-full border-4 border-sky-500/20 border-t-sky-400 animate-spin mb-3"></div>
          <div className="text-white text-sm font-semibold tracking-wide flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Loading 360° High-Resolution Aerial Vista...
          </div>
          <div className="text-xs text-slate-400 mt-1">Presidency University Bengaluru</div>
        </div>
      )}

      {/* Campus 360° Left Accordion Directory Menu */}
      <CampusPanoramaMenu
        scenes={scenes}
        hotspots={hotspots}
        currentSceneId={currentSceneId}
        onSelectScene={(id) => {
          onSceneChange(id);
          setShowSceneDrawer(false);
        }}
        onFocusHotspot={centerCameraOnHotspot}
        onStartNavigation={(spot) => {
          onStartNavigation(spot);
          setSelectedHotspot(null);
        }}
        isOpen={isMenuOpen}
        onToggle={() => setIsMenuOpen(!isMenuOpen)}
      />

      {/* 2D Projected Hotspot Pins Overlay */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        {projectedHotspots.map((spot) => {
          const isSelected = selectedHotspot?.hotspotId === spot.hotspotId;
          const isHovered = hoveredHotspot?.hotspotId === spot.hotspotId;
          const isPortal = spot.hotspotType === 'scene_portal';

          return (
            <div
              key={spot.hotspotId}
              style={{
                transform: `translate3d(${spot.screenX}px, ${spot.screenY}px, 0) translate(-50%, -50%)`,
                transition: 'transform 0.05s linear'
              }}
              className="absolute pointer-events-auto interactive-hotspot group"
              onClick={() => handleHotspotClick(spot)}
              onMouseEnter={() => setHoveredHotspot(spot)}
              onMouseLeave={() => setHoveredHotspot(null)}
            >
              {/* Pulsing Target Ring */}
              <div
                className={`absolute inset-0 rounded-full animate-ping opacity-60 ${
                  isPortal ? 'bg-amber-400' : 'bg-orange-500'
                }`}
              />

              {/* Authentic Presidency University Orange Teardrop Pin */}
              <div
                className={`relative transition-all duration-200 transform cursor-pointer ${
                  isSelected ? 'scale-125 drop-shadow-[0_0_15px_rgba(249,115,22,0.8)]' : 'group-hover:scale-125'
                }`}
              >
                <svg width="40" height="52" viewBox="0 0 40 52" fill="none" className="drop-shadow-2xl">
                  {/* Orange Teardrop Shape */}
                  <path
                    d="M20 0 C9 0 0 9 0 20 C0 35 20 52 20 52 C20 52 40 35 40 20 C40 9 31 0 20 0 Z"
                    fill={isPortal ? '#d97706' : '#ea580c'}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                  {/* Inner Dark Navy Crest Badge */}
                  <circle cx="20" cy="20" r="14.5" fill="#071B32" stroke="#ffffff" strokeWidth="0.8" />
                  {/* Presidency Monogram & Emblem */}
                  <g transform="translate(10, 10) scale(0.55)">
                    <path d="M18 4 L7 18 L29 18 Z" fill="#ffffff" />
                    <path d="M18 7 L10 17 L26 17 Z" fill="#071B32" />
                    <path d="M18 9 L13 16 L23 16 Z" fill="#ffffff" />
                    <text x="18" y="24" textAnchor="middle" fill="#ffffff" fontSize="4.2" fontWeight="bold" fontFamily="sans-serif">
                      PRESIDENCY
                    </text>
                  </g>
                </svg>
              </div>

              {/* Hover Floating Pill Tag */}
              <div
                className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-xl shadow-2xl whitespace-nowrap pointer-events-none transition-all duration-200 ${
                  isHovered || isSelected ? 'opacity-100 scale-100' : 'opacity-0 scale-90 translate-y-1'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                  <span>{spot.title}</span>
                  {spot.buildingShortCode && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 font-mono">
                      {spot.buildingShortCode}
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-400 font-normal">
                  {isPortal ? 'Jump to Aerial Vista' : 'Click to view & navigate'}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Top Left Circular MENU Button (Matches Reference Screenshots) */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-3">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="w-12 h-12 rounded-full bg-slate-950/85 hover:bg-slate-900 border-2 border-white/80 shadow-2xl flex flex-col items-center justify-center text-white transition-all hover:scale-105 active:scale-95"
          title="Toggle Campus Directory Menu"
        >
          <div className="flex flex-col gap-0.5 items-center mb-0.5">
            <span className="w-4 h-0.5 bg-white rounded-full"></span>
            <span className="w-4 h-0.5 bg-white rounded-full"></span>
            <span className="w-4 h-0.5 bg-white rounded-full"></span>
          </div>
          <span className="text-[7.5px] font-black tracking-widest uppercase">MENU</span>
        </button>
      </div>

      {/* Top Floating View Info Pill & Grid Button */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <div className="px-3.5 py-2 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl text-xs text-slate-200 shadow-xl hidden sm:flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-semibold">{activeScene?.sceneName || 'Aerial 360°'}</span>
          <span className="text-slate-400">·</span>
          <span className="text-slate-400 font-mono">Alt: {activeScene?.altitudeMeters || 120}m</span>
        </div>

        {/* Switch to 2D GPS Map Button */}
        <button
          onClick={onSwitchToMap}
          className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600/90 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xl transition-all hover:scale-105 active:scale-95"
          title="Switch to 2D Ground GPS Map"
        >
          <Compass className="w-4 h-4 text-white" />
          <span className="hidden sm:inline">2D Ground Map</span>
        </button>

        {/* 9-Dot Grid Scene Selector Button (Matches Reference) */}
        <button
          onClick={() => setShowSceneDrawer(!showSceneDrawer)}
          className="w-11 h-11 rounded-full bg-slate-950/85 hover:bg-slate-900 border-2 border-white/80 shadow-2xl flex items-center justify-center text-white transition-all hover:scale-105 active:scale-95"
          title="All Aerial Vistas"
        >
          <div className="grid grid-cols-3 gap-0.5">
            <span className="w-1 h-1 bg-white rounded-full"></span>
            <span className="w-1 h-1 bg-white rounded-full"></span>
            <span className="w-1 h-1 bg-white rounded-full"></span>
            <span className="w-1 h-1 bg-white rounded-full"></span>
            <span className="w-1 h-1 bg-white rounded-full"></span>
            <span className="w-1 h-1 bg-white rounded-full"></span>
            <span className="w-1 h-1 bg-white rounded-full"></span>
            <span className="w-1 h-1 bg-white rounded-full"></span>
            <span className="w-1 h-1 bg-white rounded-full"></span>
          </div>
        </button>
      </div>

      {/* Active Navigation Route Banner (if user started walking guidance) */}
      {activeRoute && (
        <div className="absolute top-16 right-4 z-20 max-w-sm bg-gradient-to-r from-slate-900/95 to-indigo-950/95 backdrop-blur-md border border-emerald-500/50 rounded-2xl p-3 shadow-2xl animate-in fade-in slide-in-from-top-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                <NavigationIcon className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                  Walking Route Active
                </div>
                <div className="text-xs font-bold text-white truncate max-w-[200px]">
                  {activeRoute.destination?.name || 'Destination'}
                </div>
              </div>
            </div>

            <button
              onClick={onClearRoute}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              title="Cancel Navigation"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
            <div className="text-slate-300 font-mono">
              <span className="font-bold text-white">{activeRoute.summary?.totalDistanceMeters || 0}m</span> · ~{activeRoute.summary?.estimatedWalkingMinutes || 1} min
            </div>
            <button
              onClick={onSwitchToMap}
              className="flex items-center gap-1 text-sky-400 hover:text-sky-300 font-semibold"
            >
              <span>View Route on Map</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Fallback Placeholder when 360° Panorama Image is Not Available */}
      {panoramaLoadError && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md text-center">
          <div className="w-16 h-16 rounded-3xl bg-blue-950/70 border border-blue-500/40 flex items-center justify-center mb-4 text-blue-400 shadow-xl">
            <Camera className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-white mb-2 tracking-tight">360° Panorama Not Available</h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mb-6 leading-relaxed">
            High-altitude aerial photography for this specific campus quadrant is currently scheduled for calibration.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => onSwitchToMap ? onSwitchToMap() : null}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg transition-all"
            >
              Return to Official Map
            </button>
            {scenes && scenes.length > 0 && (
              <button
                onClick={() => onSceneChange && onSceneChange(scenes[0].sceneId)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 font-bold text-xs transition-all"
              >
                View Central Campus 360°
              </button>
            )}
          </div>
        </div>
      )}

      {/* Selected Hotspot Details Modal / Drawer */}
      {selectedHotspot && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 w-[90%] max-w-md bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl p-4 text-slate-200 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-sky-500/20">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-white">{selectedHotspot.title}</span>
                  {selectedHotspot.buildingShortCode && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono font-bold">
                      {selectedHotspot.buildingShortCode}
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400">Presidency University Campus</div>
              </div>
            </div>

            <button
              onClick={() => setSelectedHotspot(null)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">
            {selectedHotspot.description || 'Key academic and instructional facility at Presidency University Bengaluru.'}
          </p>

          <div className="mt-3.5 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
            <button
              onClick={() => {
                centerCameraOnHotspot(selectedHotspot);
                setSelectedHotspot(null);
              }}
              className="flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-sky-400" />
              <span>Center</span>
            </button>

            {onOpenIndoorMap && (selectedHotspot.buildingShortCode || selectedHotspot.title?.includes('Block')) && (
              <button
                onClick={() => {
                  onOpenIndoorMap({
                    name: selectedHotspot.title,
                    shortCode: selectedHotspot.buildingShortCode,
                    totalFloors: 4
                  });
                  setSelectedHotspot(null);
                }}
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-md transition-all hover:scale-105"
                title="BUTTON 1: Open Indoor Map"
              >
                <Compass className="w-3.5 h-3.5 text-emerald-200" />
                <span>Indoor Map</span>
              </button>
            )}

            {onStartIndoorNavigation && (selectedHotspot.buildingShortCode || selectedHotspot.title?.includes('Block')) && (
              <button
                onClick={() => {
                  onStartIndoorNavigation({
                    name: selectedHotspot.title,
                    shortCode: selectedHotspot.buildingShortCode,
                    totalFloors: 4
                  });
                  setSelectedHotspot(null);
                }}
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition-all hover:scale-105"
                title="BUTTON 2: Start Indoor Navigation"
              >
                <NavigationIcon className="w-3.5 h-3.5 text-sky-200" />
                <span>Indoor Nav</span>
              </button>
            )}

            <button
              onClick={() => {
                onStartNavigation(selectedHotspot);
                setSelectedHotspot(null);
              }}
              className="flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-all hover:scale-105"
            >
              <NavigationIcon className="w-3.5 h-3.5 text-sky-400" />
              <span>Walk Here</span>
            </button>
          </div>
        </div>
      )}

      {/* Floating Bottom Circular Controls Toolbar (Matches Reference Screenshots) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5 p-2 bg-slate-950/75 backdrop-blur-xl border border-white/25 rounded-full shadow-2xl">
        {/* Reset Home View */}
        <button
          onClick={handleResetHome}
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-slate-950/90 hover:bg-slate-900 border-2 border-white/80 text-white flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-95"
          title="Reset Camera View to Default"
        >
          <Compass className="w-5 h-5 text-sky-400" />
        </button>

        {/* Ambient Campus Sound Synthesizer */}
        <button
          onClick={toggleAudioAmbiance}
          className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full border-2 border-white/80 flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-95 ${
            isAudioPlaying
              ? 'bg-amber-500 text-slate-950 font-bold'
              : 'bg-slate-950/90 hover:bg-slate-900 text-white'
          }`}
          title={isAudioPlaying ? 'Mute Campus Ambiance' : 'Play Gentle Campus Breeze Ambiance'}
        >
          {isAudioPlaying ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-slate-950/90 hover:bg-slate-900 border-2 border-white/80 text-white flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-95"
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        >
          {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
        </button>

        {/* Auto Rotate Toggle */}
        <button
          onClick={toggleAutoRotate}
          className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full border-2 border-white/80 flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-95 ${
            isAutoRotate ? 'bg-sky-500 text-white' : 'bg-slate-950/90 hover:bg-slate-900 text-white'
          }`}
          title={isAutoRotate ? 'Pause 360° Auto-Rotation' : 'Start 360° Auto-Rotation'}
        >
          <RotateCw className={`w-5 h-5 ${isAutoRotate ? 'animate-spin' : ''}`} style={{ animationDuration: '8s' }} />
        </button>

        {/* Camera Snapshot */}
        <button
          onClick={handleTakeSnapshot}
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-slate-950/90 hover:bg-slate-900 border-2 border-white/80 text-white flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-95"
          title="Capture Snapshot Image"
        >
          <Camera className="w-5 h-5 text-indigo-300" />
        </button>

        {/* Scene Switcher Drawer Trigger */}
        <button
          onClick={() => setShowSceneDrawer(!showSceneDrawer)}
          className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full border-2 border-white/80 flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-95 ${
            showSceneDrawer ? 'bg-indigo-600 text-white' : 'bg-slate-950/90 hover:bg-slate-900 text-white'
          }`}
          title="Switch Aerial 360° Vista"
        >
          <Layers className="w-5 h-5 text-emerald-300" />
        </button>
      </div>

      {/* Aerial Scenes Quick Switcher Drawer */}
      {showSceneDrawer && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 p-3 bg-slate-950/95 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl overflow-x-auto max-w-[95vw] custom-scrollbar animate-in fade-in slide-in-from-bottom-3">
          {scenes.map((scene) => {
            const isCurrent = scene.sceneId === currentSceneId;
            return (
              <div
                key={scene.sceneId}
                onClick={() => {
                  onSceneChange(scene.sceneId);
                  setShowSceneDrawer(false);
                }}
                className={`flex-shrink-0 cursor-pointer group rounded-xl p-1.5 transition-all ${
                  isCurrent
                    ? 'ring-2 ring-sky-500 bg-sky-900/30'
                    : 'hover:bg-slate-900 border border-transparent'
                }`}
              >
                <div className="w-28 h-16 rounded-lg overflow-hidden relative border border-slate-700/80 bg-slate-900">
                  <img
                    src={scene.thumbnail || scene.panoramaImage}
                    alt={scene.sceneName}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                  {isCurrent && (
                    <div className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-sky-400 border border-white"></div>
                  )}
                </div>
                <div className="text-[11px] font-semibold text-slate-200 mt-1 truncate max-w-[112px]">
                  {scene.sceneName.split('—')[0]}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}