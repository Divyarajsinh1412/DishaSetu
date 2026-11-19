import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  Compass,
  Building2,
  BookOpen,
  Coffee,
  Trophy,
  Trees,
  Car,
  HeartPulse,
  FlaskConical,
  Layers,
  MapPin,
  Navigation,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  Target,
  Eye,
  EyeOff,
  Camera,
  Map as MapIcon,
  Globe,
  ChevronLeft,
  ChevronRight,
  Info,
  X,
  Footprints,
  Clock,
  Sparkles,
  Search,
  CheckCircle2
} from 'lucide-react';
import {
  mapToWorld,
  worldToMap,
  gpsToWorld,
  worldToGps,
  REF_LAT,
  REF_LNG,
  CAMPUS_BUILDING_SPECS,
  CAMPUS_LANDMARK_SPECS
} from './campusCoords';
import {
  materials,
  buildPresentationPlinth,
  buildRoadNetwork,
  buildMainLawnAndGardens,
  buildCentralFountain,
  buildSportsComplex,
  buildEastSectorAmenities,
  buildParkingZones,
  buildCampusTrees,
  buildBuildingMesh
} from './campusGeometryBuilder';

/**
 * DishaSetu: Premium 3D Campus Digital Twin
 * Large, Spacious Architectural Miniature Model for Presidency University Bengaluru
 * Calibrated with increased scale, generous building spacing, and comprehensive map controls.
 */
export default function CampusDigitalTwin3D({
  buildings = [],
  locations = [],
  features = [],
  walkingPaths = [],
  selectedLocation = null,
  onSelectLocation,
  activeRoute = null,
  onClearRoute,
  onStartNavigation,
  onOpenIndoor,
  onOpenBuildingPopup,
  onOpenIndoorMap,
  onStartIndoorNavigation,
  onSwitchToImmersive,
  onSwitchToMap,
  userLocation = null
}) {
  const mountRef = useRef(null);
  const canvasRef = useRef(null);
  const lastLabelUpdateRef = useRef(0);

  // Three.js State Container in ref to prevent recreation on render
  const threeRef = useRef({
    scene: null,
    camera: null,
    renderer: null,
    controls: null,
    buildingsGroup: null,
    routeGroup: null,
    waterMesh: null,
    raycaster: new THREE.Raycaster(),
    mouse: new THREE.Vector2(),
    animationFrameId: null,
    buildingMeshes: new Map() // specId -> THREE.Group
  });

  // UI States
  const [activeCategory, setActiveCategory] = useState('all');
  const [viewAngle, setViewAngle] = useState('front_isometric');
  const [showLabels, setShowLabels] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredBuilding, setHoveredBuilding] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0, visible: false });
  const [screenLabels, setScreenLabels] = useState([]);

  // Merged Building Specs: Merges calibrated 3D models with dynamic MongoDB records
  const mergedBuildingList = useMemo(() => {
    const list = Object.values(CAMPUS_BUILDING_SPECS);
    
    // Add dynamic buildings from MongoDB if not already present
    if (buildings && buildings.length > 0) {
      buildings.forEach(b => {
        const existing = list.find(s => s.shortCode === b.shortCode || s.name === b.name);
        if (existing) {
          existing.mongoRecord = b;
        } else if (b.entranceCoordinates?.lat) {
          list.push({
            id: `dyn_${b._id || b.shortCode}`,
            name: b.name,
            label: b.shortCode || b.name,
            shortCode: b.shortCode,
            category: b.category || 'Academic',
            imageX: 0.4666,
            imageY: 0.5995,
            centerGps: { lat: b.entranceCoordinates.lat, lng: b.entranceCoordinates.lng },
            dimensions: { width: 44, depth: 22, height: (b.totalFloors || 4) * 4.5, floors: b.totalFloors || 4 },
            rotation: 0.0,
            color: '#FFFFFF',
            accentColor: '#10B981',
            roofType: 'flat_modern',
            departments: b.departments || [],
            mongoRecord: b
          });
        }
      });
    }
    return list;
  }, [buildings]);

  // Left Toolbar Navigation Categories
  const navCategories = [
    { id: 'all', label: 'All Campus', icon: Compass },
    { id: 'Academic', label: 'Academic Blocks', icon: Building2 },
    { id: 'Administrative', label: 'Administrative', icon: Layers },
    { id: 'Library', label: 'Library', icon: BookOpen },
    { id: 'Cafe', label: 'Food & Dining', icon: Coffee },
    { id: 'Medical', label: 'Medical Care', icon: HeartPulse },
    { id: 'Sports', label: 'Sports Arena', icon: Trophy },
    { id: 'Garden', label: 'Main Lawn & Quads', icon: Trees },
    { id: 'Parking', label: 'Parking Sectors', icon: Car }
  ];

  // Camera presets tuned to the enlarged 3D model footprint
  const applyCameraPreset = useCallback((preset) => {
    const { camera, controls } = threeRef.current;
    if (!camera || !controls) return;

    if (preset === 'front_isometric') {
      // Bold front isometric view framing Main Gate, Lawn, Fountain, and Academic wings closely
      camera.position.set(-95, 125, -155);
      controls.target.set(5, 8, -10);
    } else if (preset === 'angled_perspective') {
      // Perspective from East looking past Auditorium and Fountain towards West Academic wings
      camera.position.set(155, 120, 85);
      controls.target.set(-15, 8, 10);
    } else if (preset === 'top_down') {
      // 90° Bird's-Eye Architectural Master Plan Blueprint View
      camera.position.set(5, 290, -15);
      controls.target.set(5, 0, -15);
    }
    controls.update();
    setViewAngle(preset);
  }, []);

  // Initialize Three.js Scene
  useEffect(() => {
    if (!mountRef.current) return;
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // 1. Scene & Deep Architectural Sky Background
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0A1128); // Deep architectural midnight navy
    scene.fog = new THREE.FogExp2(0x0A1128, 0.0008);

    // 2. Camera Setup (Perspective tuned for large architectural models)
    const camera = new THREE.PerspectiveCamera(42, width / height, 1, 2000);
    camera.position.set(-95, 125, -155);

    // 3. WebGL Renderer with High-Fidelity Tone Mapping & Soft Shadows
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 4. OrbitControls with smooth damping
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.04;
    controls.minDistance = 35;
    controls.maxDistance = 750;
    controls.target.set(5, 8, -10);
    controls.update();

    // 5. Studio Lighting Setup
    // A. Hemisphere Light (Soft Sky & Ground Ambient Fill)
    const hemiLight = new THREE.HemisphereLight(0xF1F5F9, 0x1E293B, 0.9);
    scene.add(hemiLight);

    // B. Key Directional Sunlight (Casting Soft Shadows)
    const sunLight = new THREE.DirectionalLight(0xFFFBF0, 1.6);
    sunLight.position.set(160, 240, -120);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 700;
    sunLight.shadow.camera.left = -280;
    sunLight.shadow.camera.right = 280;
    sunLight.shadow.camera.top = 280;
    sunLight.shadow.camera.bottom = -280;
    sunLight.shadow.bias = -0.0003;
    scene.add(sunLight);

    // C. Soft Blue Fill Light
    const fillLight = new THREE.DirectionalLight(0x38BDF8, 0.45);
    fillLight.position.set(-160, 110, 160);
    scene.add(fillLight);

    // 6. Build Master Architectural Model Environment
    buildPresentationPlinth(scene);
    buildRoadNetwork(scene);
    buildMainLawnAndGardens(scene);
    const fountainGroup = buildCentralFountain(scene);
    buildSportsComplex(scene);
    buildEastSectorAmenities(scene);
    buildParkingZones(scene);
    buildCampusTrees(scene);

    // Find fountain water mesh for ripple animation
    let waterMesh = null;
    fountainGroup.traverse(child => {
      if (child.userData?.isFountainWater) {
        waterMesh = child;
      }
    });

    // Container Groups for Buildings & Routes
    const buildingsGroup = new THREE.Group();
    buildingsGroup.name = 'all_buildings_group';
    scene.add(buildingsGroup);

    const routeGroup = new THREE.Group();
    routeGroup.name = 'navigation_route_group';
    scene.add(routeGroup);

    // Save Three.js instances
    threeRef.current.scene = scene;
    threeRef.current.camera = camera;
    threeRef.current.renderer = renderer;
    threeRef.current.controls = controls;
    threeRef.current.buildingsGroup = buildingsGroup;
    threeRef.current.routeGroup = routeGroup;
    threeRef.current.waterMesh = waterMesh;

    // Resize Handler
    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let isRunning = true;
    const animate = () => {
      if (!isRunning) return;
      threeRef.current.animationFrameId = requestAnimationFrame(animate);
      controls.update();

      // Gentle animated water ripple on the fountain
      if (waterMesh) {
        waterMesh.rotation.z += 0.003;
      }

      // Pulsate any route beacons
      const time = performance.now() * 0.003;
      routeGroup.children.forEach(c => {
        if (c.userData?.isBeacon) {
          c.rotation.y = time;
          c.position.y = c.userData.baseY + Math.sin(time * 2.5) * 0.4;
        }
      });

      renderer.render(scene, camera);

      // Smart Throttled Level-of-Detail (LOD) Label Projection
      const now = performance.now();
      if (showLabels && camera && mountRef.current && (now - lastLabelUpdateRef.current > 80)) {
        lastLabelUpdateRef.current = now;
        const w = mountRef.current.clientWidth;
        const h = mountRef.current.clientHeight;
        const rawLabels = [];

        // Camera distance for intelligent Level-of-Detail
        const camDist = controls ? camera.position.distanceTo(controls.target) : 300;
        const isFarOverview = camDist > 360;
        const isMidZoom = camDist > 200 && camDist <= 360;

        // Key landmarks to show labels for
        const keyItems = [
          ...mergedBuildingList,
          { id: 'fountain', name: 'Campus Fountain', label: 'FOUNTAIN', imageX: 0.4666, imageY: 0.5995, category: 'Landmark', height: 6, priority: 9 },
          { id: 'mainLawn', name: 'Main Lawn', label: 'MAIN LAWN', imageX: 0.5918, imageY: 0.4403, category: 'Garden', height: 3, priority: 4 },
          { id: 'football', name: 'Football Ground', label: 'FOOTBALL ARENA', imageX: 0.4117, imageY: 0.3679, category: 'Sports', height: 3, priority: 7 },
          { id: 'basketball', name: 'Basketball Court', label: 'BASKETBALL COURT', imageX: 0.1973, imageY: 0.5428, category: 'Sports', height: 3, priority: 5 },
          { id: 'mainGate', name: 'Main Gate', label: 'MAIN GATE', imageX: 0.5695, imageY: 0.2449, category: 'Gate', height: 14, priority: 10 }
        ];

        keyItems.forEach(item => {
          if (activeCategory !== 'all' && item.category !== activeCategory) return;

          // Priority LOD filtering
          const isSelected = selectedLocation?.shortCode === item.shortCode || selectedLocation?.buildingId === item.id;
          const isHovered = hoveredBuilding?.id === item.id;
          const isMajor = item.priority >= 8 || item.id === 'bld_d_block' || item.id === 'mainGate' || item.id === 'fountain';

          if (!isSelected && !isHovered) {
            if (isFarOverview && !isMajor) return;
            if (isMidZoom && item.category !== 'Academic' && !isMajor) return;
          }

          const worldPos = mapToWorld(item.imageX, item.imageY, (item.dimensions?.height || item.height || 18) + 3);
          const projected = worldPos.clone().project(camera);

          if (projected.z < 1) {
            const sx = (projected.x * 0.5 + 0.5) * w;
            const sy = (-(projected.y * 0.5) + 0.5) * h;
            if (sx >= -40 && sx <= w + 40 && sy >= -40 && sy <= h + 40) {
              rawLabels.push({
                id: item.id,
                name: item.label || item.name,
                category: item.category,
                x: sx,
                y: sy,
                spec: item,
                priority: isSelected ? 100 : isHovered ? 90 : (item.priority || 5)
              });
            }
          }
        });

        // Anti-Collision Screen De-cluttering
        rawLabels.sort((a, b) => b.priority - a.priority);
        const placed = [];
        const uncluttered = [];

        rawLabels.forEach(lbl => {
          if (lbl.priority >= 90) {
            placed.push({ x: lbl.x, y: lbl.y });
            uncluttered.push(lbl);
            return;
          }
          const collides = placed.some(p => Math.abs(p.x - lbl.x) < 75 && Math.abs(p.y - lbl.y) < 32);
          if (!collides) {
            placed.push({ x: lbl.x, y: lbl.y });
            uncluttered.push(lbl);
          }
        });

        setScreenLabels(uncluttered);
      }
    };
    animate();

    return () => {
      isRunning = false;
      cancelAnimationFrame(threeRef.current.animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      controls.dispose();
    };
  }, [showLabels, activeCategory, mergedBuildingList]);

  // Update Building Meshes whenever buildings, selection, or category filter changes
  useEffect(() => {
    const { buildingsGroup } = threeRef.current;
    if (!buildingsGroup) return;

    // Clear old building meshes
    while (buildingsGroup.children.length > 0) {
      const obj = buildingsGroup.children.pop();
      if (obj.geometry) obj.geometry.dispose();
    }
    threeRef.current.buildingMeshes.clear();

    // Rebuild buildings matching active category filter
    mergedBuildingList.forEach(spec => {
      const isMatchCategory = activeCategory === 'all' || spec.category === activeCategory;
      const isSelected = selectedLocation && (
        selectedLocation.shortCode === spec.shortCode ||
        selectedLocation.name === spec.name ||
        selectedLocation._id === spec.id ||
        selectedLocation.id === spec.id
      );
      
      const mesh = buildBuildingMesh(spec, isSelected, false);
      
      // If dimmed by category filter
      if (!isMatchCategory) {
        mesh.traverse(child => {
          if (child.isMesh && child.material) {
            child.material.transparent = true;
            child.material.opacity = 0.25;
          }
        });
      }

      buildingsGroup.add(mesh);
      threeRef.current.buildingMeshes.set(spec.id, mesh);
    });
  }, [mergedBuildingList, activeCategory, selectedLocation]);

  // Toggle billboard sprite visibility when showLabels changes
  useEffect(() => {
    const { buildingsGroup } = threeRef.current;
    if (buildingsGroup) {
      buildingsGroup.traverse(child => {
        if (child.userData?.isBillboard) {
          child.visible = showLabels;
        }
      });
    }
  }, [showLabels]);

  // Handle Raycasting for Mouse Hover & Selection
  const handlePointerMove = (e) => {
    if (!mountRef.current || !threeRef.current.camera || !threeRef.current.buildingsGroup) return;
    const rect = mountRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    threeRef.current.mouse.set(x, y);
    threeRef.current.raycaster.setFromCamera(threeRef.current.mouse, threeRef.current.camera);

    const intersects = threeRef.current.raycaster.intersectObjects(
      threeRef.current.buildingsGroup.children,
      true
    );

    if (intersects.length > 0) {
      let obj = intersects[0].object;
      while (obj && !obj.userData?.isBuilding && obj.parent) {
        obj = obj.parent;
      }
      if (obj && obj.userData?.spec) {
        setHoveredBuilding(obj.userData.spec);
        setTooltipPos({ x: e.clientX, y: e.clientY, visible: true });
        return;
      }
    }
    setTooltipPos(prev => ({ ...prev, visible: false }));
  };

  const handlePointerDown = (e) => {
    if (e.button !== 0 || !mountRef.current) return;
    const rect = mountRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    threeRef.current.mouse.set(x, y);
    threeRef.current.raycaster.setFromCamera(threeRef.current.mouse, threeRef.current.camera);

    const intersects = threeRef.current.raycaster.intersectObjects(
      threeRef.current.buildingsGroup.children,
      true
    );

    if (intersects.length > 0) {
      let obj = intersects[0].object;
      while (obj && !obj.userData?.isBuilding && obj.parent) {
        obj = obj.parent;
      }
      if (obj && obj.userData?.spec) {
        const spec = obj.userData.spec;
        selectBuilding(spec);
      }
    }
  };

  // Helper to select and smoothly zoom/frame a building in 3D
  const selectBuilding = useCallback((spec) => {
    if (!spec) return;
    const { camera, controls } = threeRef.current;
    if (camera && controls) {
      const worldPos = mapToWorld(spec.imageX, spec.imageY);
      // Smoothly pan camera to frame the selected building closely
      controls.target.set(worldPos.x, 8, worldPos.z);
      camera.position.set(worldPos.x - 55, 65, worldPos.z - 65);
      controls.update();
    }

    const buildingRecord = spec.mongoRecord || {
      _id: spec.id,
      buildingId: spec.id,
      locationId: spec.id,
      name: spec.name,
      shortCode: spec.shortCode,
      category: spec.category,
      coordinates: spec.centerGps,
      entranceCoordinates: spec.centerGps,
      imageX: spec.imageX,
      imageY: spec.imageY,
      totalFloors: spec.dimensions?.floors || 4,
      departments: spec.departments,
      description: `${spec.name} — ${spec.dimensions?.floors || 4} floors, modern academic block at Presidency University.`
    };

    if (onSelectLocation) {
      onSelectLocation(buildingRecord);
    }

    if (onOpenBuildingPopup && (spec.category === 'Academic' || spec.shortCode?.includes('BLOCK') || spec.name?.includes('Block') || spec.category === 'Library')) {
      onOpenBuildingPopup(buildingRecord);
    }
  }, [onSelectLocation, onOpenBuildingPopup]);

  // Focus Selected Building Action (Explicit Map Control)
  const handleFocusSelected = () => {
    if (selectedLocation) {
      const spec = mergedBuildingList.find(b =>
        b.shortCode === selectedLocation.shortCode ||
        b.name === selectedLocation.name ||
        b.id === selectedLocation._id ||
        b.id === selectedLocation.id
      );
      if (spec) {
        selectBuilding(spec);
      }
    }
  };

  // Render 3D Dijkstra Walking Path when activeRoute is present
  useEffect(() => {
    const { routeGroup, scene } = threeRef.current;
    if (!routeGroup || !scene) return;

    // Clear old route objects
    while (routeGroup.children.length > 0) {
      const obj = routeGroup.children.pop();
      if (obj.geometry) obj.geometry.dispose();
    }

    if (!activeRoute || !activeRoute.points || activeRoute.points.length < 2) return;

    // Convert route GPS lat/lng points to 3D world curve
    const worldPoints = activeRoute.points.map(pt => {
      const lat = Array.isArray(pt) ? pt[0] : pt.lat;
      const lng = Array.isArray(pt) ? pt[1] : pt.lng;
      const v = gpsToWorld(lat, lng);
      return new THREE.Vector3(v.x, 0.6, v.z);
    });

    // Create Smooth 3D Spline Curve
    const curve = new THREE.CatmullRomCurve3(worldPoints);
    const tubeGeom = new THREE.TubeGeometry(curve, 140, 0.9, 8, false);
    const tubeMat = new THREE.MeshStandardMaterial({
      color: 0x00A878,
      emissive: 0x10B981,
      emissiveIntensity: 0.95,
      roughness: 0.2
    });
    const tubeMesh = new THREE.Mesh(tubeGeom, tubeMat);
    tubeMesh.castShadow = true;
    routeGroup.add(tubeMesh);

    // Origin Pin Beacon
    const originPos = worldPoints[0];
    const originPin = new THREE.Mesh(
      new THREE.CylinderGeometry(1.6, 0.2, 5.0, 16),
      new THREE.MeshBasicMaterial({ color: 0x38BDF8 })
    );
    originPin.position.set(originPos.x, 3.0, originPos.z);
    originPin.userData = { isBeacon: true, baseY: 3.0 };
    routeGroup.add(originPin);

    // Destination Pin Beacon
    const destPos = worldPoints[worldPoints.length - 1];
    const destPin = new THREE.Mesh(
      new THREE.ConeGeometry(2.0, 5.5, 16),
      new THREE.MeshBasicMaterial({ color: 0x00A878 })
    );
    destPin.rotation.x = Math.PI;
    destPin.position.set(destPos.x, 4.5, destPos.z);
    destPin.userData = { isBeacon: true, baseY: 4.5 };
    routeGroup.add(destPin);

  }, [activeRoute]);

  // Fit Campus View Action (1 of 6 required controls)
  const handleFitCampus = () => {
    applyCameraPreset('front_isometric');
  };

  // Zoom Controls (Controls 1 & 2)
  const handleZoom = (delta) => {
    const { camera, controls } = threeRef.current;
    if (!camera || !controls) return;
    const factor = delta > 0 ? 0.8 : 1.25;
    camera.position.sub(controls.target).multiplyScalar(factor).add(controls.target);
    controls.update();
  };

  // Fullscreen Toggle (Control 6)
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      mountRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  // Filtered search list
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return mergedBuildingList.filter(b =>
      b.name.toLowerCase().includes(q) ||
      b.shortCode?.toLowerCase().includes(q) ||
      b.departments?.some(d => d.toLowerCase().includes(q))
    ).slice(0, 6);
  }, [searchQuery, mergedBuildingList]);

  return (
    <div
      ref={mountRef}
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerDown}
      className="relative w-full h-full select-none overflow-hidden bg-[#0A1128]"
    >
      <canvas ref={canvasRef} className="w-full h-full block cursor-grab active:cursor-grabbing" />

      {/* ======================================================== */}
      {/* 1. FLOATING 3D SCREEN LABELS OVER KEY CAMPUS BUILDINGS   */}
      {/* ======================================================== */}
      {showLabels && screenLabels.map(lbl => (
        <div
          key={lbl.id}
          onClick={(e) => {
            e.stopPropagation();
            if (lbl.spec?.dimensions) selectBuilding(lbl.spec);
          }}
          className={`absolute pointer-events-auto cursor-pointer transform -translate-x-1/2 -translate-y-full mb-2 transition-all duration-150 ${
            hoveredBuilding?.id === lbl.id || selectedLocation?.shortCode === lbl.spec?.shortCode
              ? 'scale-115 z-30'
              : 'hover:scale-105 z-10'
          }`}
          style={{ left: `${Math.round(lbl.x)}px`, top: `${Math.round(lbl.y)}px` }}
        >
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0F172A]/95 backdrop-blur-md border border-slate-700/80 shadow-xl text-[11px] font-bold text-slate-100 hover:border-emerald-400 hover:text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="tracking-wide uppercase">{lbl.name}</span>
          </div>
        </div>
      ))}

      {/* ======================================================== */}
      {/* 2. LEFT NAVIGATION & SEARCH TOOLBAR (Collapsible)        */}
      {/* ======================================================== */}
      <div className={`absolute top-4 left-4 z-20 transition-all duration-300 flex flex-col gap-2 max-h-[85vh] ${
        isSidebarCollapsed ? 'w-14' : 'w-64'
      }`}>
        {/* Toggle Collapse Button Header */}
        <div className="bg-[#0F172A]/90 backdrop-blur-md rounded-2xl border border-slate-700/80 shadow-2xl p-2 flex items-center justify-between">
          {!isSidebarCollapsed ? (
            <div className="flex items-center gap-2 px-1">
              <Compass className="w-4 h-4 text-emerald-400 animate-spin" style={{ animationDuration: '24s' }} />
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-100">Presidency 3D</span>
            </div>
          ) : (
            <Compass className="w-5 h-5 text-emerald-400 mx-auto" />
          )}

          <button
            onClick={() => setIsSidebarCollapsed(prev => !prev)}
            className="p-1.5 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors"
            title={isSidebarCollapsed ? 'Expand Menu' : 'Collapse Menu (Maximize Map)'}
          >
            {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Search Input Box (Hidden when collapsed) */}
        {!isSidebarCollapsed && (
          <div className="relative bg-[#0F172A]/90 backdrop-blur-md rounded-2xl border border-slate-700/80 shadow-2xl p-1.5">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Search campus buildings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-7 py-2 bg-slate-900/80 text-xs text-white placeholder-slate-400 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500 font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Search Dropdown */}
            {searchResults.length > 0 && (
              <div className="mt-1.5 pt-1.5 border-t border-slate-800 flex flex-col gap-1 max-h-48 overflow-y-auto scrollbar-thin">
                {searchResults.map(b => (
                  <button
                    key={b.id}
                    onClick={() => {
                      selectBuilding(b);
                      setSearchQuery('');
                    }}
                    className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-xs hover:bg-slate-800 transition-all text-slate-200"
                  >
                    <span className="font-semibold truncate">{b.name}</span>
                    <span className="text-[10px] text-emerald-400 font-mono ml-2">{b.shortCode}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Category Filter Pills (Icons only when collapsed) */}
        <div className="bg-[#0F172A]/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-700/80 shadow-2xl flex flex-col gap-1 overflow-y-auto scrollbar-thin">
          {navCategories.map(cat => {
            const IconComponent = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                title={cat.label}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                } ${isSidebarCollapsed ? 'justify-center px-2' : ''}`}
              >
                <IconComponent className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {!isSidebarCollapsed && <span className="truncate">{cat.label}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. RIGHT-SIDE FLOATING CONTROLS (ALL 6 REQUIRED CONTROLS) */}
      {/* ======================================================== */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        {/* Navigation & Zoom Presets Box */}
        <div className="bg-[#0F172A]/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-700/80 shadow-2xl flex flex-col gap-1">
          {/* 1. Zoom In */}
          <button
            onClick={() => handleZoom(1)}
            className="p-2.5 hover:bg-slate-800 rounded-xl text-slate-300 hover:text-white transition-all"
            title="1. Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          {/* 2. Zoom Out */}
          <button
            onClick={() => handleZoom(-1)}
            className="p-2.5 hover:bg-slate-800 rounded-xl text-slate-300 hover:text-white transition-all"
            title="2. Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          {/* 3. Fit Entire Campus */}
          <button
            onClick={handleFitCampus}
            className="p-2.5 hover:bg-slate-800 rounded-xl text-emerald-400 hover:text-emerald-300 transition-all font-bold"
            title="3. Fit Entire Campus in Viewport"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          {/* 4. Focus Selected Building */}
          <button
            onClick={handleFocusSelected}
            disabled={!selectedLocation}
            className={`p-2.5 rounded-xl transition-all ${
              selectedLocation
                ? 'text-sky-400 hover:bg-sky-500/20 hover:text-sky-300 cursor-pointer'
                : 'text-slate-600 cursor-not-allowed'
            }`}
            title="4. Focus Selected Building (Zoom Directly into Selection)"
          >
            <Target className="w-4 h-4" />
          </button>

          {/* 5. Reset View */}
          <button
            onClick={() => applyCameraPreset('front_isometric')}
            className="p-2.5 hover:bg-slate-800 rounded-xl text-slate-300 hover:text-white transition-all"
            title="5. Reset View (Default Front Isometric)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* 6. Full Screen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2.5 hover:bg-slate-800 rounded-xl text-amber-300 hover:text-amber-200 transition-all"
            title="6. Full Screen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Label Toggle */}
          <button
            onClick={() => setShowLabels(prev => !prev)}
            className={`p-2.5 rounded-xl transition-all ${
              showLabels ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-slate-400 hover:bg-slate-800'
            }`}
            title={showLabels ? 'Hide 3D Building Labels' : 'Show 3D Building Labels'}
          >
            {showLabels ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
        </div>

        {/* Camera Angle Selector */}
        <div className="bg-[#0F172A]/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-700/80 shadow-2xl flex flex-col gap-1 text-[11px] font-semibold">
          <button
            onClick={() => applyCameraPreset('front_isometric')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              viewAngle === 'front_isometric'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Isometric
          </button>
          <button
            onClick={() => applyCameraPreset('angled_perspective')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              viewAngle === 'angled_perspective'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Angled
          </button>
          <button
            onClick={() => applyCameraPreset('top_down')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              viewAngle === 'top_down'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Top-Down
          </button>
        </div>

        {/* Switch View Mode: 360° Aerial Tour & 2D Official Map */}
        <div className="bg-[#0F172A]/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-700/80 shadow-2xl flex flex-col gap-1">
          <button
            onClick={onSwitchToImmersive}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-amber-300 hover:bg-amber-500/10 transition-all border border-amber-500/20"
            title="Switch to 360° Drone Aerial Tour"
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">360° Aerial</span>
          </button>
          <button
            onClick={onSwitchToMap}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-sky-400 hover:bg-sky-500/10 transition-all border border-sky-500/20"
            title="Switch to Official Master Campus Map"
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Official Map</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. HOVER TOOLTIP FLOATING ON 3D CANVAS                    */}
      {/* ======================================================== */}
      {tooltipPos.visible && hoveredBuilding && (
        <div
          className="fixed pointer-events-none z-50 bg-[#0F172A]/95 text-white px-3.5 py-2.5 rounded-xl border border-emerald-500/40 shadow-2xl text-xs transform -translate-x-1/2 -translate-y-full -mt-2 backdrop-blur-md"
          style={{ left: tooltipPos.x, top: tooltipPos.y }}
        >
          <div className="font-bold text-emerald-400 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5" />
            <span>{hoveredBuilding.name}</span>
          </div>
          <div className="text-[11px] text-slate-300 mt-1 flex items-center gap-2">
            <span>{hoveredBuilding.dimensions?.floors || 4} Floors</span>
            <span>•</span>
            <span className="text-sky-300">{hoveredBuilding.category}</span>
          </div>
          {hoveredBuilding.departments && hoveredBuilding.departments.length > 0 && (
            <div className="text-[10px] text-slate-400 mt-1 truncate max-w-xs">
              {hoveredBuilding.departments.slice(0, 2).join(' · ')}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. BOTTOM CAMPUS INFORMATION PANEL                       */}
      {/* ======================================================== */}
      <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0F172A]/90 backdrop-blur-md p-3.5 sm:px-6 rounded-2xl border border-slate-700/80 shadow-2xl">
        {/* Campus Brand & Architecture Model Stats */}
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 shrink-0">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-extrabold text-white flex items-center gap-2">
              <span>Presidency University Bengaluru</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold border border-emerald-500/30">
                Spacious 3D Model
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-3">
              <span>Architectural Miniature</span>
              <span>•</span>
              <span className="text-emerald-400 font-semibold">{mergedBuildingList.length} Verified Blocks</span>
              <span>•</span>
              <span>Generous Separation</span>
              <span>•</span>
              <span>Sports & Lawns</span>
            </div>
          </div>
        </div>

        {/* Selected Building Details Action Drawer: Unified Requirement 10 Buttons */}
        {selectedLocation ? (
          <div className="flex flex-wrap items-center gap-2 bg-slate-900/95 px-4 py-2.5 rounded-xl border border-slate-700 shadow-inner">
            <div className="text-left sm:text-right mr-1">
              <div className="text-xs font-bold text-white truncate max-w-[200px]">
                {selectedLocation.name}
              </div>
              <div className="text-[10px] text-emerald-400 font-medium">
                {selectedLocation.category || 'Academic Facility'} · {selectedLocation.shortCode || 'PU-CAMPUS'}
              </div>
            </div>

            {onOpenBuildingPopup && (
              <button
                onClick={() => onOpenBuildingPopup(selectedLocation)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-950/60 hover:bg-indigo-900 text-indigo-300 text-xs font-bold rounded-lg border border-indigo-500/30 transition-all hover:scale-105"
                title="Inspect Building Info"
              >
                <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">Inspect</span>
              </button>
            )}

            {(onOpenIndoorMap || onOpenIndoor) && (
              <button
                onClick={() => onOpenIndoorMap ? onOpenIndoorMap(selectedLocation) : onOpenIndoor(selectedLocation)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-lg shadow-md transition-all hover:scale-105"
                title="BUTTON 1: Open Indoor Map"
              >
                <MapIcon className="w-3.5 h-3.5 text-emerald-200" />
                <span>Indoor Map</span>
              </button>
            )}

            {onStartIndoorNavigation && (
              <button
                onClick={() => onStartIndoorNavigation(selectedLocation)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-bold rounded-lg shadow-md transition-all hover:scale-105"
                title="BUTTON 2: Start Indoor Navigation"
              >
                <Navigation className="w-3.5 h-3.5 text-sky-200" />
                <span>Indoor Nav</span>
              </button>
            )}

            <button
              onClick={() => {
                if (onStartNavigation) onStartNavigation(selectedLocation);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg border border-slate-700 transition-all hover:scale-105"
              title="Walk to building via outdoor paths"
            >
              <Footprints className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden md:inline">Outdoor Walk</span>
            </button>

            <button
              onClick={() => {
                if (onSelectLocation) onSelectLocation(null);
              }}
              className="p-1 text-slate-400 hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-emerald-400" />
            <span>Click any 3D academic block, lawn, or fountain to inspect details or navigate</span>
          </div>
        )}
      </div>
    </div>
  );
}
