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
  Eye,
  Camera,
  Map as MapIcon,
  Globe,
  ChevronRight,
  Info,
  X,
  Footprints,
  Clock,
  Sparkles
} from 'lucide-react';
import {
  gpsToWorld,
  worldToGps,
  REF_LAT,
  REF_LNG,
  CAMPUS_BUILDING_SPECS
} from './campusCoords';
import {
  buildGroundAndRoads,
  buildSportsComplex,
  buildParkingAndVehicles,
  buildLandscapingAndTrees,
  buildBuildingMesh
} from './campusGeometryBuilder';

/**
 * DishaSetu: Photorealistic 3D Campus Digital Twin
 * Front-Facing Isometric Campus View for Presidency University Bengaluru
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
  onSwitchToImmersive,
  onSwitchToMap,
  userLocation = null
}) {
  const mountRef = useRef(null);
  const canvasRef = useRef(null);

  // Three.js State Container in ref to prevent recreation on render
  const threeRef = useRef({
    scene: null,
    camera: null,
    renderer: null,
    controls: null,
    buildingsGroup: null,
    routeGroup: null,
    dynamicGroup: null,
    raycaster: new THREE.Raycaster(),
    mouse: new THREE.Vector2(),
    animationFrameId: null,
    buildingMeshes: new Map() // specId -> THREE.Group
  });

  // UI States
  const [activeCategory, setActiveCategory] = useState('all');
  const [viewAngle, setViewAngle] = useState('front_isometric'); // 'front_isometric', 'angled_perspective', 'top_down'
  const [hoveredBuilding, setHoveredBuilding] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0, visible: false });
  const [isNavigating, setIsNavigating] = useState(false);

  // Merged Building Specs: Merges static calibrated 3D models with dynamic MongoDB records
  const mergedBuildingList = useMemo(() => {
    const list = Object.values(CAMPUS_BUILDING_SPECS);
    
    // Add dynamic buildings from MongoDB if not already present
    if (buildings && buildings.length > 0) {
      buildings.forEach(b => {
        const existing = list.find(s => s.shortCode === b.shortCode || s.name === b.name);
        if (!existing && b.entranceCoordinates?.lat) {
          list.push({
            id: `dyn_${b._id || b.shortCode}`,
            name: b.name,
            shortCode: b.shortCode,
            category: b.category || 'Academic',
            centerGps: { lat: b.entranceCoordinates.lat, lng: b.entranceCoordinates.lng },
            dimensions: { width: 35, depth: 25, height: (b.totalFloors || 3) * 4.5, floors: b.totalFloors || 3 },
            rotation: -0.12,
            color: '#FFFFFF',
            accentColor: '#10B981',
            roofType: 'flat_solar',
            entranceOffset: { x: 0, z: 0 },
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
    { id: 'all', label: 'Campus Overview', icon: Compass },
    { id: 'Academic', label: 'Buildings', icon: Building2 },
    { id: 'Administrative', label: 'Departments', icon: Layers },
    { id: 'Laboratories', label: 'Laboratories', icon: FlaskConical },
    { id: 'Library', label: 'Library', icon: BookOpen },
    { id: 'Cafe', label: 'Food & Dining', icon: Coffee },
    { id: 'Medical', label: 'Medical Care', icon: HeartPulse },
    { id: 'Sports', label: 'Sports Arena', icon: Trophy },
    { id: 'Garden', label: 'Gardens & Quads', icon: Trees },
    { id: 'Parking', label: 'Parking Zones', icon: Car }
  ];

  // Camera presets
  const applyCameraPreset = useCallback((preset) => {
    const { camera, controls } = threeRef.current;
    if (!camera || !controls) return;

    if (preset === 'front_isometric') {
      // Front-Facing Angled Isometric View looking from Main Gate (North) into Campus
      camera.position.set(0, 150, -240);
      controls.target.set(0, 5, 25);
    } else if (preset === 'angled_perspective') {
      // Dramatic Angled 45° Perspective View
      camera.position.set(160, 130, -140);
      controls.target.set(-10, 8, 15);
    } else if (preset === 'top_down') {
      // 90° Top-Down Plan View
      camera.position.set(0, 320, 15);
      controls.target.set(0, 0, 15);
    }
    controls.update();
    setViewAngle(preset);
  }, []);

  // Initialize Three.js Scene
  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // 1. Scene & Atmospheric Fog
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x071B32);
    scene.fog = new THREE.FogExp2(0x071B32, 0.0016);

    // 2. Camera Setup (Isometric Front View default)
    const camera = new THREE.PerspectiveCamera(40, width / height, 1, 1500);
    camera.position.set(0, 150, -240);

    // 3. WebGL Renderer with High-Fidelity Tone Mapping & Soft Shadows
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.05; // Do not go below ground
    controls.minDistance = 30;
    controls.maxDistance = 500;
    controls.target.set(0, 5, 25);
    controls.update();

    // 5. Lighting Setup (Directional Sunlight + Soft Blue Hemispherical Sky Bounce)
    const hemiLight = new THREE.HemisphereLight(0xE0F2FE, 0x0F172A, 0.75);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xFFFBEB, 1.3);
    dirLight.position.set(120, 180, -90);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 10;
    dirLight.shadow.camera.far = 450;
    dirLight.shadow.camera.left = -180;
    dirLight.shadow.camera.right = 180;
    dirLight.shadow.camera.top = 180;
    dirLight.shadow.camera.bottom = -180;
    dirLight.shadow.bias = -0.0005;
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0x38BDF8, 0.4);
    fillLight.position.set(-100, 60, 120);
    scene.add(fillLight);

    // 6. Build Procedural Environment Geometries (Ground, Roads, Sports, Trees, Vehicles)
    buildGroundAndRoads(scene);
    buildSportsComplex(scene);
    buildParkingAndVehicles(scene);
    buildLandscapingAndTrees(scene);

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

      // Pulsate any route or beacon markers
      const time = performance.now() * 0.003;
      routeGroup.children.forEach(c => {
        if (c.userData?.isBeacon) {
          c.rotation.y = time;
          c.position.y = c.userData.baseY + Math.sin(time * 2) * 0.4;
        }
      });

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      isRunning = false;
      cancelAnimationFrame(threeRef.current.animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      controls.dispose();
    };
  }, []);

  // Update Building Meshes whenever buildings, selection, or category changes
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
      const isSelected = selectedLocation && (selectedLocation.shortCode === spec.shortCode || selectedLocation.name === spec.name);
      
      const mesh = buildBuildingMesh(spec, isSelected, false);
      
      // If dimmed by category filter
      if (!isMatchCategory) {
        mesh.traverse(child => {
          if (child.isMesh && child.material) {
            child.material.transparent = true;
            child.material.opacity = 0.35;
          }
        });
      }

      buildingsGroup.add(mesh);
      threeRef.current.buildingMeshes.set(spec.id, mesh);
    });
  }, [mergedBuildingList, activeCategory, selectedLocation]);

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
      // Find root building group
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
    // Only handle primary click
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
        if (onSelectLocation) {
          onSelectLocation(spec.mongoRecord || {
            locationId: spec.id,
            name: spec.name,
            shortCode: spec.shortCode,
            category: spec.category,
            coordinates: spec.centerGps,
            entranceCoordinates: spec.centerGps,
            departments: spec.departments,
            description: `${spec.name} — ${spec.dimensions.floors} floors, modern academic facility at Presidency University.`
          });
        }
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
      return new THREE.Vector3(v.x, 0.4, v.z);
    });

    // Create Smooth 3D Spline Curve
    const curve = new THREE.CatmullRomCurve3(worldPoints);
    const tubeGeom = new THREE.TubeGeometry(curve, 120, 0.6, 8, false);
    const tubeMat = new THREE.MeshStandardMaterial({
      color: 0x00A878,
      emissive: 0x10B981,
      emissiveIntensity: 0.8,
      roughness: 0.2
    });
    const tubeMesh = new THREE.Mesh(tubeGeom, tubeMat);
    tubeMesh.castShadow = true;
    routeGroup.add(tubeMesh);

    // Origin Pin Beacon
    const originPos = worldPoints[0];
    const originPin = new THREE.Mesh(
      new THREE.CylinderGeometry(1.2, 0.1, 3.5, 16),
      new THREE.MeshBasicMaterial({ color: 0x38BDF8 })
    );
    originPin.position.set(originPos.x, 2.5, originPos.z);
    originPin.userData = { isBeacon: true, baseY: 2.5 };
    routeGroup.add(originPin);

    // Destination Pin Beacon
    const destPos = worldPoints[worldPoints.length - 1];
    const destPin = new THREE.Mesh(
      new THREE.ConeGeometry(1.5, 4.0, 16),
      new THREE.MeshBasicMaterial({ color: 0x00A878 })
    );
    destPin.rotation.x = Math.PI;
    destPin.position.set(destPos.x, 3.5, destPos.z);
    destPin.userData = { isBeacon: true, baseY: 3.5 };
    routeGroup.add(destPin);

  }, [activeRoute]);

  // Fit Campus View Action
  const handleFitCampus = () => {
    applyCameraPreset('front_isometric');
  };

  // Zoom Controls
  const handleZoom = (delta) => {
    const { camera, controls } = threeRef.current;
    if (!camera || !controls) return;
    const factor = delta > 0 ? 0.8 : 1.25;
    camera.position.sub(controls.target).multiplyScalar(factor).add(controls.target);
    controls.update();
  };

  return (
    <div
      ref={mountRef}
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerDown}
      className="relative w-full h-full select-none overflow-hidden bg-[#071B32]"
    >
      <canvas ref={canvasRef} className="w-full h-full block cursor-grab active:cursor-grabbing" />

      {/* ======================================================== */}
      {/* 1. LEFT-SIDE NAVIGATION TOOLBAR (Matching Reference UI)   */}
      {/* ======================================================== */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-1 bg-[#0F172A]/90 backdrop-blur-md p-2 rounded-2xl border border-slate-700/80 shadow-2xl max-h-[85vh] overflow-y-auto w-56 scrollbar-thin">
        <div className="px-3 py-2 border-b border-slate-800 flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-emerald-400 animate-spin" style={{ animationDuration: '20s' }} />
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-100">Presidency 3D</span>
          </div>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
            Live
          </span>
        </div>

        {navCategories.map(cat => {
          const IconComponent = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <IconComponent className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span className="truncate">{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* ======================================================== */}
      {/* 2. RIGHT-SIDE FLOATING CAMERA & VIEW CONTROLS            */}
      {/* ======================================================== */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        {/* Zoom & View Presets Box */}
        <div className="bg-[#0F172A]/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-700/80 shadow-2xl flex flex-col gap-1">
          <button
            onClick={() => handleZoom(1)}
            className="p-2.5 hover:bg-slate-800 rounded-xl text-slate-300 hover:text-white transition-all"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleZoom(-1)}
            className="p-2.5 hover:bg-slate-800 rounded-xl text-slate-300 hover:text-white transition-all"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleFitCampus}
            className="p-2.5 hover:bg-slate-800 rounded-xl text-emerald-400 hover:text-emerald-300 transition-all font-bold"
            title="Fit Entire Campus in Viewport"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => applyCameraPreset('front_isometric')}
            className="p-2.5 hover:bg-slate-800 rounded-xl text-slate-300 hover:text-white transition-all"
            title="Reset Camera (Front Isometric)"
          >
            <RotateCcw className="w-4 h-4" />
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

        {/* Switch View Mode: 360° Aerial Tour & 2D GPS Map */}
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
            title="Switch to 2D GPS Ground Map"
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">2D Map</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. HOVER TOOLTIP FLOATING ON 3D CANVAS                    */}
      {/* ======================================================== */}
      {tooltipPos.visible && hoveredBuilding && (
        <div
          className="fixed pointer-events-none z-50 bg-[#0F172A]/95 text-white px-3 py-2 rounded-xl border border-emerald-500/40 shadow-2xl text-xs transform -translate-x-1/2 -translate-y-full -mt-2 backdrop-blur-md"
          style={{ left: tooltipPos.x, top: tooltipPos.y }}
        >
          <div className="font-bold text-emerald-400 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5" />
            <span>{hoveredBuilding.name}</span>
          </div>
          <div className="text-[11px] text-slate-300 mt-0.5">
            {hoveredBuilding.dimensions.floors} Floors · {hoveredBuilding.category}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. BOTTOM CAMPUS INFORMATION PANEL (Matching Screenshot) */}
      {/* ======================================================== */}
      <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0F172A]/90 backdrop-blur-md p-3.5 sm:px-6 rounded-2xl border border-slate-700/80 shadow-2xl">
        {/* Campus Brand & Verified Footprint */}
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-extrabold text-white flex items-center gap-2">
              <span>Presidency University Bengaluru</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold border border-emerald-500/30">
                13.1706°N, 77.5358°E
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-3">
              <span>60+ Acres Digital Twin</span>
              <span>•</span>
              <span className="text-emerald-400 font-semibold">{mergedBuildingList.length} Major Blocks</span>
              <span>•</span>
              <span>43 Verified Facilities</span>
              <span>•</span>
              <span>4 Parking Sectors</span>
            </div>
          </div>
        </div>

        {/* Selected Building Details Action Pill */}
        {selectedLocation ? (
          <div className="flex items-center gap-3 bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-700/80 shadow-inner">
            <div className="text-right">
              <div className="text-xs font-bold text-white truncate max-w-[200px]">
                {selectedLocation.name}
              </div>
              <div className="text-[10px] text-emerald-400 font-medium">
                {selectedLocation.category || 'Academic Complex'}
              </div>
            </div>

            <button
              onClick={() => {
                if (onStartNavigation) onStartNavigation(selectedLocation);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-bold rounded-lg shadow-md transition-all hover:scale-105"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Navigate</span>
            </button>

            <button
              onClick={() => {
                if (onOpenIndoor) onOpenIndoor(selectedLocation);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-bold rounded-lg border border-slate-700 transition-all hover:scale-105"
              title="Explore Multi-Floor Indoor Plan"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Floors</span>
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
            <Info className="w-3.5 h-3.5 text-sky-400" />
            <span>Click any 3D academic block to inspect, navigate, or view indoor floor plans</span>
          </div>
        )}
      </div>
    </div>
  );
}
