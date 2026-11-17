import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  MapContainer,
  TileLayer,
  Polyline,
  Polygon,
  Marker,
  Popup,
  useMap,
  useMapEvents,
  Tooltip
} from 'react-leaflet';
import L from 'leaflet';
import {
  Compass,
  Maximize2,
  Navigation,
  Layers,
  MapPin,
  Trees,
  Car,
  Footprints,
  Info,
  CheckCircle2,
  Droplets,
  Building2,
  Crosshair,
  Accessibility
} from 'lucide-react';

// Custom SVG Icons
const createDivIcon = (svgString, className = '', size = [36, 36]) => {
  return L.divIcon({
    html: `<div class="custom-map-pin ${className}" style="width:${size[0]}px;height:${size[1]}px;">${svgString}</div>`,
    className: 'leaflet-custom-marker',
    iconSize: size,
    iconAnchor: [size[0] / 2, size[1] / 2],
    popupAnchor: [0, -size[1] / 2]
  });
};

// Gate Icon (Emerald)
const gateIcon = createDivIcon(`
  <div style="background:#10b981; border:2px solid #ffffff; width:100%; height:100%; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 0 12px rgba(16,185,129,0.8);">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 21h18M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16M9 9h6M9 13h6M9 17h6" />
    </svg>
  </div>
`, 'gate-pin', [40, 40]);

// Fountain Icon (Aquatic Blue)
const fountainIcon = createDivIcon(`
  <div style="background:#0ea5e9; border:2px solid #ffffff; width:100%; height:100%; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 0 12px rgba(14,165,233,0.8);">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 2v20M12 7a5 5 0 0 1 5 5M12 7a5 5 0 0 0-5 5M12 12a3 3 0 0 1 3 3M12 12a3 3 0 0 0-3 3" />
    </svg>
  </div>
`, 'fountain-pin', [38, 38]);

// Parking Icon (Orange)
const parkingIcon = createDivIcon(`
  <div style="background:#f97316; border:2px solid #ffffff; width:100%; height:100%; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 0 12px rgba(249,115,22,0.8);">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="3" fill="#ea580c"/>
      <path d="M9 17V7h4a3 3 0 0 1 0 6H9" stroke="#ffffff" stroke-width="2.5"/>
    </svg>
  </div>
`, 'parking-pin', [36, 36]);

// Garden Icon (Lush Green)
const gardenIcon = createDivIcon(`
  <div style="background:#15803d; border:2px solid #ffffff; width:100%; height:100%; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 0 12px rgba(21,128,61,0.8);">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 2c2 3 6 4 6 9a6 6 0 0 1-12 0c0-5 4-6 6-9z" fill="#22c55e"/>
      <path d="M12 12v9" stroke="#ffffff" stroke-width="2.5"/>
    </svg>
  </div>
`, 'garden-pin', [36, 36]);

// Building Entrance Icon (Indigo / Accessible Green)
const createEntranceIcon = (isAccessible = true, isPrimary = false) => createDivIcon(`
  <div style="background:${isAccessible ? '#059669' : '#4f46e5'}; border:2px solid ${isPrimary ? '#38bdf8' : '#ffffff'}; width:100%; height:100%; border-radius:8px; display:flex; align-items:center; justify-content:center; box-shadow:0 0 10px rgba(79,70,229,0.8);">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M18 20V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v14" />
      <path d="M2 20h20" />
      <path d="M14 12v.01" />
    </svg>
  </div>
`, 'entrance-pin', [32, 32]);

// Temporary Pick Pin Icon
const pickPinIcon = createDivIcon(`
  <div style="background:#ef4444; border:3px solid #ffffff; width:100%; height:100%; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 0 15px rgba(239,68,68,1); animation:pulse-ring 1.5s infinite;">
    <div style="width:8px; height:8px; border-radius:50%; background:#ffffff;"></div>
  </div>
`, 'pick-pin', [36, 36]);

// User GPS Icon (Pulsing Azure)
const userGpsIcon = createDivIcon(`
  <div style="position:relative; width:100%; height:100%; display:flex; align-items:center; justify-content:center;">
    <div class="pulse-marker" style="position:absolute; width:44px; height:44px; border-radius:50%; background:rgba(56,189,248,0.4);"></div>
    <div style="background:#0284c7; border:3px solid #ffffff; width:22px; height:22px; border-radius:50%; box-shadow:0 0 10px rgba(2,132,199,1);"></div>
  </div>
`, 'gps-pin', [44, 44]);

// Start Point Icon (A - Emerald)
const startRouteIcon = createDivIcon(`
  <div style="background:#10b981; border:3px solid #ffffff; width:100%; height:100%; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 0 15px rgba(16,185,129,0.9); font-weight:800; color:#ffffff; font-size:16px;">
    A
  </div>
`, 'start-pin', [36, 36]);

// Destination Point Icon (B - Rose)
const endRouteIcon = createDivIcon(`
  <div style="background:#f43f5e; border:3px solid #ffffff; width:100%; height:100%; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 0 15px rgba(244,63,94,0.9); font-weight:800; color:#ffffff; font-size:16px;">
    B
  </div>
`, 'end-pin', [36, 36]);

// Waypoint Step Marker
const createStepIcon = (num) => createDivIcon(`
  <div style="background:#0284c7; border:2px solid #ffffff; width:100%; height:100%; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 0 10px rgba(2,132,199,0.9); font-weight:700; color:#ffffff; font-size:11px;">
    ${num}
  </div>
`, 'step-pin', [26, 26]);

// Map Controller Subcomponent for Imperative Actions
function MapController({
  focusMainGateTrigger,
  fitCampusTrigger,
  userLocation,
  defaultLocation,
  bounds,
  activeRoute
}) {
  const map = useMap();

  useEffect(() => {
    if (defaultLocation && defaultLocation.lat && defaultLocation.lng) {
      map.flyTo([defaultLocation.lat, defaultLocation.lng], defaultLocation.zoom || 18, {
        duration: 1.2,
        easeLinearity: 0.25
      });
    }
  }, [focusMainGateTrigger, defaultLocation, map]);

  useEffect(() => {
    if (fitCampusTrigger && bounds) {
      map.flyToBounds(
        [bounds.southWest, bounds.northEast],
        { padding: [50, 50], duration: 1.2 }
      );
    }
  }, [fitCampusTrigger, bounds, map]);

  useEffect(() => {
    if (userLocation) {
      map.flyTo([userLocation.lat, userLocation.lng], 19, { duration: 1.2 });
    }
  }, [userLocation, map]);

  useEffect(() => {
    if (activeRoute && activeRoute.geometry && activeRoute.geometry.length > 1) {
      const lats = activeRoute.geometry.map(p => Array.isArray(p) ? p[0] : p.lat);
      const lngs = activeRoute.geometry.map(p => Array.isArray(p) ? p[1] : p.lng);
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);
      map.flyToBounds(
        [[minLat, minLng], [maxLat, maxLng]],
        { padding: [80, 80], duration: 1.2 }
      );
    }
  }, [activeRoute, map]);

  return null;
}

// Map Click Listener for Entrance Coordinate Picking
function MapClickHandler({ isPicking, onPickCoordinates }) {
  useMapEvents({
    click(e) {
      if (isPicking && onPickCoordinates) {
        onPickCoordinates({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    }
  });
  return null;
}

export default function CampusMap({
  campus,
  features = [],
  locations = [],
  routes = [],
  buildings = [],
  walkingPaths = [],
  selectedLocation,
  onSelectLocation,
  activeRoute,
  isPickingCoordinates,
  onCoordinatePicked,
  pickedCoordinates
}) {
  const [mapType, setMapType] = useState('street');
  const [focusMainGateTrigger, setFocusMainGateTrigger] = useState(0);
  const [fitCampusTrigger, setFitCampusTrigger] = useState(0);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [layerVisibility, setLayerVisibility] = useState({
    corridor: true,
    garden: true,
    parking: true,
    treeDivider: true,
    routes: true,
    landmarks: true,
    entrances: true,
    walkingNetwork: false
  });
  const [showLayerMenu, setShowLayerMenu] = useState(false);

  const defaultCoords = campus?.defaultLocation?.coordinates || {
    lat: 13.1717995,
    lng: 77.5361915,
    zoom: 18
  };

  const campusBounds = campus?.bounds || {
    southWest: [13.169044795226714, 77.53496327115832],
    northEast: [13.171866, 77.53670086988951]
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy
        });
        setLocationError(null);
      },
      (err) => {
        setLocationError('Could not retrieve current location. Please allow GPS permissions.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );
  };

  // Group features by category
  const featureGroups = useMemo(() => {
    const corridor = features.find(f => f.featureId === 'feature_walking_avenue_corridor');
    const gardenArea = features.find(f => f.featureId === 'feature_campus_garden_area');
    const gardenInterior = features.find(f => f.featureId === 'feature_garden_interior_boundary');
    const treeDivider = features.find(f => f.featureId === 'feature_central_tree_divider');
    const parkingArea = features.find(f => f.featureId === 'feature_two_wheeler_parking_area');
    const parkingEntry = features.find(f => f.featureId === 'feature_parking_entry_span');
    const mainGateSpan = features.find(f => f.featureId === 'feature_main_gate_span');
    const rightAvenue = features.find(f => f.featureId === 'feature_walking_avenue_right_side');
    const leftAvenue = features.find(f => f.featureId === 'feature_walking_avenue_left_side');

    return {
      corridor,
      gardenArea,
      gardenInterior,
      treeDivider,
      parkingArea,
      parkingEntry,
      mainGateSpan,
      rightAvenue,
      leftAvenue
    };
  }, [features]);

  // Extract all surveyed building entrances
  const allBuildingEntrances = useMemo(() => {
    const list = [];
    buildings.forEach(b => {
      if (b.entrances && b.entrances.length > 0) {
        b.entrances.forEach(ent => {
          list.push({
            ...ent,
            buildingName: b.name,
            buildingCode: b.shortCode,
            buildingId: b._id
          });
        });
      }
    });
    return list;
  }, [buildings]);

  return (
    <div className={`relative w-full h-full bg-[#0b132b] overflow-hidden ${isPickingCoordinates ? 'cursor-crosshair' : ''}`}>
      {/* Coordinate Picker Active Banner */}
      {isPickingCoordinates && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[500] bg-blue-600 text-white px-5 py-2.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-blue-400 font-semibold text-xs animate-bounce">
          <Crosshair className="w-4 h-4 text-white animate-spin" />
          <span>Click anywhere on the map to set Entrance coordinates!</span>
        </div>
      )}

      {/* Leaflet Map Container */}
      <MapContainer
        center={[defaultCoords.lat, defaultCoords.lng]}
        zoom={defaultCoords.zoom || 18}
        minZoom={15}
        maxZoom={22}
        zoomControl={false}
        className="w-full h-full"
      >
        <MapController
          focusMainGateTrigger={focusMainGateTrigger}
          fitCampusTrigger={fitCampusTrigger}
          userLocation={userLocation}
          defaultLocation={defaultCoords}
          bounds={campusBounds}
          activeRoute={activeRoute}
        />

        <MapClickHandler
          isPicking={isPickingCoordinates}
          onPickCoordinates={onCoordinatePicked}
        />

        {/* Base Tile Layer */}
        {mapType === 'street' ? (
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors | Presidency University"
            maxZoom={20}
          />
        ) : (
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution="Tiles &copy; Esri, Earthstar Geographics | Presidency University"
            maxZoom={20}
          />
        )}

        {/* 1. Main Walking Avenue Corridor */}
        {layerVisibility.corridor && featureGroups.corridor && (
          <Polygon
            positions={featureGroups.corridor.coordinates}
            pathOptions={{
              color: '#3b82f6',
              fillColor: '#60a5fa',
              weight: 2,
              opacity: 0.85,
              fillOpacity: 0.3
            }}
          >
            <Tooltip sticky>
              <div className="font-semibold text-blue-400">Main Walking Avenue Corridor</div>
              <div className="text-xs text-slate-300">Paved pedestrian walkway from Main Gate</div>
            </Tooltip>
          </Polygon>
        )}

        {/* 2. Left & Right Avenue Boundaries */}
        {layerVisibility.corridor && featureGroups.rightAvenue && (
          <Polyline
            positions={featureGroups.rightAvenue.coordinates}
            pathOptions={{ color: '#2563eb', weight: 4, opacity: 0.9 }}
          />
        )}
        {layerVisibility.corridor && featureGroups.leftAvenue && (
          <Polyline
            positions={featureGroups.leftAvenue.coordinates}
            pathOptions={{ color: '#2563eb', weight: 4, opacity: 0.9 }}
          />
        )}

        {/* 3. Central Tree Divider */}
        {layerVisibility.treeDivider && featureGroups.treeDivider && (
          <Polyline
            positions={featureGroups.treeDivider.coordinates}
            pathOptions={{
              color: '#059669',
              weight: 6,
              opacity: 0.95,
              dashArray: '8, 6'
            }}
          >
            <Tooltip sticky>
              <div className="font-semibold text-emerald-400">Central Tree Divider</div>
              <div className="text-xs text-slate-300">Landscaped median along the walking avenue</div>
            </Tooltip>
          </Polyline>
        )}

        {/* 4. Campus Garden Area */}
        {layerVisibility.garden && featureGroups.gardenArea && (
          <Polygon
            positions={featureGroups.gardenArea.coordinates}
            pathOptions={{
              color: '#15803d',
              fillColor: '#22c55e',
              weight: 2,
              opacity: 0.9,
              fillOpacity: 0.4
            }}
          >
            <Tooltip sticky>
              <div className="font-semibold text-green-400">Presidency Campus Garden</div>
              <div className="text-xs text-slate-300">Lush landscaped student lawns and seating</div>
            </Tooltip>
          </Polygon>
        )}

        {/* 5. Garden Interior Ending Boundary */}
        {layerVisibility.garden && featureGroups.gardenInterior && (
          <Polyline
            positions={featureGroups.gardenInterior.coordinates}
            pathOptions={{
              color: '#166534',
              weight: 3,
              opacity: 0.85,
              dashArray: '4, 4'
            }}
          />
        )}

        {/* 6. Two-Wheeler Parking Area Polygon */}
        {layerVisibility.parking && featureGroups.parkingArea && (
          <Polygon
            positions={featureGroups.parkingArea.coordinates}
            pathOptions={{
              color: '#c2410c',
              fillColor: '#f97316',
              weight: 2,
              opacity: 0.9,
              fillOpacity: 0.35
            }}
          >
            <Tooltip sticky>
              <div className="font-semibold text-orange-400">Two-Wheeler Parking Area</div>
              <div className="text-xs text-slate-300">Student & Staff designated two-wheeler parking</div>
            </Tooltip>
          </Polygon>
        )}

        {/* 7. Two-Wheeler Parking Entry Span */}
        {layerVisibility.parking && featureGroups.parkingEntry && (
          <Polyline
            positions={featureGroups.parkingEntry.coordinates}
            pathOptions={{ color: '#ea580c', weight: 6, opacity: 1.0 }}
          />
        )}

        {/* 8. Main Gate Entrance Span */}
        {featureGroups.mainGateSpan && (
          <Polyline
            positions={featureGroups.mainGateSpan.coordinates}
            pathOptions={{ color: '#10b981', weight: 8, opacity: 1.0 }}
          >
            <Tooltip sticky permanent>
              <div className="font-bold text-emerald-400">Main Gate Entrance Span</div>
            </Tooltip>
          </Polyline>
        )}

        {/* 9. Verified Navigation Walking Route */}
        {layerVisibility.routes && routes.map(route => (
          <Polyline
            key={route._id || route.routeId}
            positions={route.geometry}
            pathOptions={{ color: '#38bdf8', weight: 4, opacity: 0.6 }}
          >
            <Tooltip sticky>
              <div className="font-bold text-sky-400">{route.name}</div>
              <div className="text-xs text-slate-200">
                {route.distanceMeters}m &bull; ~{route.estimatedWalkingMinutes} min walk
              </div>
            </Tooltip>
          </Polyline>
        ))}

        {/* 9A. Complete Pedestrian Network Graph (When Toggled) */}
        {layerVisibility.walkingNetwork && walkingPaths && walkingPaths.map(p => (
          <Polyline
            key={p.pathId}
            positions={p.geometry}
            pathOptions={{
              color: p.status === 'active' ? '#64748b' : '#ef4444',
              weight: 3,
              opacity: 0.7,
              dashArray: '4, 6'
            }}
          >
            <Tooltip sticky>
              <div className="font-semibold text-slate-200">{p.name}</div>
              <div className="text-[10px] text-slate-400">
                {p.distanceMeters}m &bull; {p.status} &bull; {p.accessibility ? 'Accessible' : 'Restricted'}
              </div>
            </Tooltip>
          </Polyline>
        ))}

        {/* 9B. LIVE ACTIVE WALKING ROUTE (GLOWING BLUE PATH + TURN PINS) */}
        {activeRoute && activeRoute.geometry && activeRoute.geometry.length > 0 && (
          <>
            {/* Outer Glow Halo */}
            <Polyline
              positions={activeRoute.geometry}
              pathOptions={{
                color: '#0284c7',
                weight: 12,
                opacity: 0.5,
                lineCap: 'round',
                lineJoin: 'round'
              }}
            />

            {/* Inner Vibrant Animated-Style Path */}
            <Polyline
              positions={activeRoute.geometry}
              pathOptions={{
                color: '#38bdf8',
                weight: 5,
                opacity: 1.0,
                dashArray: '8, 8',
                lineCap: 'round',
                lineJoin: 'round'
              }}
            >
              <Tooltip sticky permanent>
                <div className="font-bold text-sky-400">Active Walking Route</div>
                <div className="text-xs text-slate-200">
                  {activeRoute.distanceMeters} m &bull; ~{activeRoute.estimatedWalkingMinutes} min walk
                </div>
              </Tooltip>
            </Polyline>

            {/* Route Start Point Marker (A) */}
            <Marker
              position={activeRoute.geometry[0]}
              icon={startRouteIcon}
            >
              <Popup>
                <div className="p-1">
                  <div className="text-[10px] uppercase font-bold text-emerald-400">Route Origin (A)</div>
                  <div className="font-bold text-xs text-white">{activeRoute.startLocation?.name || 'Start Point'}</div>
                </div>
              </Popup>
            </Marker>

            {/* Route Destination Marker (B) */}
            <Marker
              position={activeRoute.geometry[activeRoute.geometry.length - 1]}
              icon={endRouteIcon}
            >
              <Popup>
                <div className="p-1">
                  <div className="text-[10px] uppercase font-bold text-rose-400">Route Destination (B)</div>
                  <div className="font-bold text-xs text-white">{activeRoute.endLocation?.name || 'Destination'}</div>
                </div>
              </Popup>
            </Marker>

            {/* Turn Waypoint Markers */}
            {activeRoute.waypoints && activeRoute.waypoints.map((step, idx) => {
              if (idx === 0 || idx === activeRoute.waypoints.length - 1) return null;
              const stepGeom = activeRoute.geometry[Math.min(idx, activeRoute.geometry.length - 1)];
              if (!stepGeom) return null;
              return (
                <Marker
                  key={`step_${idx}`}
                  position={stepGeom}
                  icon={createStepIcon(step.stepIndex)}
                >
                  <Tooltip sticky>
                    <div className="font-bold text-sky-300">Turn #{step.stepIndex}</div>
                    <div className="text-xs text-white">{step.instruction}</div>
                  </Tooltip>
                </Marker>
              );
            })}
          </>
        )}

        {/* 10. Markers / POIs */}
        {layerVisibility.landmarks && locations.map(loc => {
          let icon = gateIcon;
          if (loc.category === 'Landmark') icon = fountainIcon;
          else if (loc.category === 'Parking') icon = parkingIcon;
          else if (loc.category === 'Garden') icon = gardenIcon;

          return (
            <Marker
              key={loc._id || loc.shortCode}
              position={[loc.coordinates.lat, loc.coordinates.lng]}
              icon={icon}
              eventHandlers={{
                click: () => onSelectLocation && onSelectLocation(loc)
              }}
            >
              <Popup>
                <div className="p-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      {loc.category}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">{loc.shortCode}</span>
                  </div>
                  <h3 className="font-bold text-sm text-white mb-1">{loc.name}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed mb-2">{loc.description}</p>
                  <div className="text-[10px] text-slate-400 font-mono mb-2">
                    {loc.coordinates.lat.toFixed(6)}, {loc.coordinates.lng.toFixed(6)}
                  </div>
                  <button
                    onClick={() => onSelectLocation && onSelectLocation(loc)}
                    className="w-full py-1.5 px-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Navigation className="w-3.5 h-3.5" /> Start Navigation
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* 11. Surveyed Building Entrances */}
        {layerVisibility.entrances && allBuildingEntrances.map(ent => (
          <Marker
            key={ent.entranceId}
            position={[ent.coordinates.lat, ent.coordinates.lng]}
            icon={createEntranceIcon(ent.isAccessible, ent.isPrimary)}
            eventHandlers={{
              click: () => onSelectLocation && onSelectLocation({
                name: `${ent.buildingName} (${ent.name})`,
                shortCode: `${ent.buildingCode}-ENT`,
                category: 'Building',
                description: `Surveyed entrance door for ${ent.buildingName}. Accessible: ${ent.isAccessible ? 'Yes' : 'No'}.`,
                coordinates: ent.coordinates
              })
            }}
          >
            <Tooltip sticky>
              <div className="font-bold text-indigo-300">{ent.buildingName}</div>
              <div className="text-xs text-slate-200">{ent.name} {ent.isPrimary ? '(Primary)' : ''}</div>
              {ent.isAccessible && <div className="text-[10px] text-emerald-400 flex items-center gap-1">Wheelchair Accessible</div>}
            </Tooltip>
          </Marker>
        ))}

        {/* 12. Temporary Pick Pin on Map */}
        {pickedCoordinates && (
          <Marker position={[pickedCoordinates.lat, pickedCoordinates.lng]} icon={pickPinIcon}>
            <Tooltip permanent>
              <div className="font-bold text-rose-400">Captured Entrance Point</div>
              <div className="text-[10px] font-mono text-white">
                {pickedCoordinates.lat.toFixed(6)}, {pickedCoordinates.lng.toFixed(6)}
              </div>
            </Tooltip>
          </Marker>
        )}

        {/* 13. User Live GPS Marker */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userGpsIcon}>
            <Popup>
              <div className="text-xs font-semibold text-white">Your Current GPS Position</div>
              <div className="text-[10px] text-slate-400">Accuracy: &plusmn;{Math.round(userLocation.accuracy)}m</div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Floating Modern Dark Navy Map Controls */}
      <div className="absolute top-4 right-4 z-[400] flex flex-col gap-2">
        <div className="relative">
          <button
            onClick={() => setShowLayerMenu(!showLayerMenu)}
            title="Map Layers & Filters"
            className="w-11 h-11 bg-[#1e293b]/95 hover:bg-[#334155] border border-slate-700/80 rounded-xl text-slate-200 shadow-xl backdrop-blur-md flex items-center justify-center transition-all hover:scale-105 active:scale-95"
          >
            <Layers className="w-5 h-5 text-sky-400" />
          </button>

          {showLayerMenu && (
            <div className="absolute right-0 top-13 w-64 bg-[#1e293b]/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-4 shadow-2xl text-xs space-y-3">
              <div className="font-bold text-sm text-white border-b border-slate-700/60 pb-2 flex items-center justify-between">
                <span>Map Layers</span>
                <span className="text-[10px] text-sky-400 uppercase tracking-wider font-mono">Presidency GIS</span>
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1.5">Map View</label>
                <div className="grid grid-cols-2 gap-1.5 bg-[#0f172a] p-1 rounded-lg border border-slate-800">
                  <button
                    onClick={() => setMapType('street')}
                    className={`py-1.5 rounded-md font-semibold text-xs transition-all ${
                      mapType === 'street' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Street Map
                  </button>
                  <button
                    onClick={() => setMapType('satellite')}
                    className={`py-1.5 rounded-md font-semibold text-xs transition-all ${
                      mapType === 'satellite' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Satellite
                  </button>
                </div>
              </div>

              <div className="space-y-2 pt-1 border-t border-slate-700/60">
                <label className="text-slate-400 font-medium block mb-1">Feature Overlays</label>
                <label className="flex items-center justify-between text-slate-300 hover:text-white cursor-pointer py-0.5">
                  <span className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-indigo-400" /> Building Entrances
                  </span>
                  <input
                    type="checkbox"
                    checked={layerVisibility.entrances}
                    onChange={e => setLayerVisibility({ ...layerVisibility, entrances: e.target.checked })}
                    className="rounded bg-slate-800 border-slate-700 text-indigo-600"
                  />
                </label>
                <label className="flex items-center justify-between text-slate-300 hover:text-white cursor-pointer py-0.5">
                  <span className="flex items-center gap-2">
                    <Footprints className="w-3.5 h-3.5 text-blue-400" /> Walking Corridor
                  </span>
                  <input
                    type="checkbox"
                    checked={layerVisibility.corridor}
                    onChange={e => setLayerVisibility({ ...layerVisibility, corridor: e.target.checked })}
                    className="rounded bg-slate-800 border-slate-700 text-blue-600"
                  />
                </label>
                <label className="flex items-center justify-between text-slate-300 hover:text-white cursor-pointer py-0.5">
                  <span className="flex items-center gap-2">
                    <Trees className="w-3.5 h-3.5 text-green-400" /> Campus Garden
                  </span>
                  <input
                    type="checkbox"
                    checked={layerVisibility.garden}
                    onChange={e => setLayerVisibility({ ...layerVisibility, garden: e.target.checked })}
                    className="rounded bg-slate-800 border-slate-700 text-green-600"
                  />
                </label>
                <label className="flex items-center justify-between text-slate-300 hover:text-white cursor-pointer py-0.5">
                  <span className="flex items-center gap-2">
                    <Car className="w-3.5 h-3.5 text-orange-400" /> Parking Area
                  </span>
                  <input
                    type="checkbox"
                    checked={layerVisibility.parking}
                    onChange={e => setLayerVisibility({ ...layerVisibility, parking: e.target.checked })}
                    className="rounded bg-slate-800 border-slate-700 text-orange-600"
                  />
                </label>
                <label className="flex items-center justify-between text-slate-300 hover:text-white cursor-pointer py-0.5">
                  <span className="flex items-center gap-2">
                    <Navigation className="w-3.5 h-3.5 text-sky-400" /> Walking Route
                  </span>
                  <input
                    type="checkbox"
                    checked={layerVisibility.routes}
                    onChange={e => setLayerVisibility({ ...layerVisibility, routes: e.target.checked })}
                    className="rounded bg-slate-800 border-slate-700 text-sky-600"
                  />
                </label>
                <label className="flex items-center justify-between text-slate-300 hover:text-white cursor-pointer py-0.5">
                  <span className="flex items-center gap-2">
                    <Compass className="w-3.5 h-3.5 text-slate-400" /> Pedestrian Network Grid
                  </span>
                  <input
                    type="checkbox"
                    checked={layerVisibility.walkingNetwork}
                    onChange={e => setLayerVisibility({ ...layerVisibility, walkingNetwork: e.target.checked })}
                    className="rounded bg-slate-800 border-slate-700 text-slate-500"
                  />
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Focus Main Gate */}
        <button
          onClick={() => setFocusMainGateTrigger(t => t + 1)}
          title="Focus Main Gate (Default Entrance View)"
          className="w-11 h-11 bg-[#1e293b]/95 hover:bg-[#334155] border border-slate-700/80 rounded-xl text-slate-200 shadow-xl backdrop-blur-md flex items-center justify-center transition-all hover:scale-105 active:scale-95 group"
        >
          <Compass className="w-5 h-5 text-emerald-400 group-hover:rotate-45 transition-transform" />
        </button>

        {/* Fit Campus */}
        <button
          onClick={() => setFitCampusTrigger(t => t + 1)}
          title="Fit Campus (Show All Mapped Features)"
          className="w-11 h-11 bg-[#1e293b]/95 hover:bg-[#334155] border border-slate-700/80 rounded-xl text-slate-200 shadow-xl backdrop-blur-md flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        >
          <Maximize2 className="w-5 h-5 text-blue-400" />
        </button>

        {/* Locate Me */}
        <button
          onClick={handleLocateMe}
          title="Locate Me (Current GPS Position)"
          className="w-11 h-11 bg-[#1e293b]/95 hover:bg-[#334155] border border-slate-700/80 rounded-xl text-slate-200 shadow-xl backdrop-blur-md flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        >
          <Navigation className="w-5 h-5 text-amber-400" />
        </button>
      </div>

      {/* GPS Location Error Banner */}
      {locationError && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[400] bg-red-950/90 border border-red-500/50 text-red-200 px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-2xl backdrop-blur-md">
          <Info className="w-4 h-4 text-red-400 shrink-0" />
          <span>{locationError}</span>
          <button onClick={() => setLocationError(null)} className="ml-2 font-bold hover:text-white">&times;</button>
        </div>
      )}

      {/* Campus Map Status Pill */}
      <div className="absolute bottom-4 left-4 z-[400] bg-[#1e293b]/90 backdrop-blur-md border border-slate-700/60 rounded-full px-3.5 py-1.5 text-[11px] text-slate-300 flex items-center gap-2 shadow-xl">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span className="font-semibold text-white">Presidency University</span>
        <span className="text-slate-500">|</span>
        <span className="text-slate-400">
          {allBuildingEntrances.length} Surveyed Entrances &bull; 13.1718&deg;N, 77.5362&deg;E
        </span>
      </div>
    </div>
  );
}
