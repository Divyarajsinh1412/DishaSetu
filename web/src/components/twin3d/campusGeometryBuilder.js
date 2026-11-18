import * as THREE from 'three';
import { gpsToWorld, CAMPUS_BUILDING_SPECS } from './campusCoords';

/**
 * Procedural Realistic 3D Campus Builder for Presidency University Bengaluru
 * Sourced directly from actual drone photography (Panoramas 1-5)
 */

// Shared Materials Cache for High-Performance WebGL Rendering
const materials = {
  // Ground Surfaces
  groundGrass: new THREE.MeshLambertMaterial({ color: 0x228B22 }), // Vibrant lawn
  groundCampusBase: new THREE.MeshLambertMaterial({ color: 0xCBD5E1 }), // Paved campus concrete
  groundQuadLawn: new THREE.MeshLambertMaterial({ color: 0x2E8B57 }), // Manicured quadrangle
  
  // Roads & Walkways
  roadAsphalt: new THREE.MeshStandardMaterial({ color: 0x1E293B, roughness: 0.8 }), // Dark navy asphalt
  roadMarking: new THREE.MeshBasicMaterial({ color: 0xFFFFFF }), // Crisp white paint
  curbStone: new THREE.MeshLambertMaterial({ color: 0xF1F5F9 }), // Curbstones
  paverWalkway: new THREE.MeshLambertMaterial({ color: 0xE2E8F0 }), // Pedestrian stone
  
  // Buildings & Architecture
  buildingWhiteFacade: new THREE.MeshStandardMaterial({
    color: 0xFFFFFF,
    roughness: 0.3,
    metalness: 0.05
  }),
  buildingGlass: new THREE.MeshPhysicalMaterial({
    color: 0x0284C7,
    roughness: 0.1,
    transmission: 0.6,
    thickness: 1.2,
    transparent: true,
    opacity: 0.85
  }),
  windowDarkGlass: new THREE.MeshStandardMaterial({
    color: 0x0F2942,
    roughness: 0.2,
    metalness: 0.3
  }),
  buildingBlueAccent: new THREE.MeshStandardMaterial({ color: 0x0369A1, roughness: 0.4 }),
  buildingRedPillar: new THREE.MeshStandardMaterial({ color: 0xDC2626, roughness: 0.4 }),
  roofConcrete: new THREE.MeshStandardMaterial({ color: 0xE2E8F0, roughness: 0.6 }),
  solarPanel: new THREE.MeshStandardMaterial({
    color: 0x1E3A8A,
    roughness: 0.1,
    metalness: 0.8
  }),
  metalFrame: new THREE.MeshStandardMaterial({ color: 0x64748B, metalness: 0.7, roughness: 0.3 }),
  
  // Fountain & Water
  fountainWater: new THREE.MeshPhysicalMaterial({
    color: 0x06B6D4,
    roughness: 0.1,
    transmission: 0.8,
    transparent: true,
    opacity: 0.75
  }),
  fountainStone: new THREE.MeshStandardMaterial({ color: 0x94A3B8, roughness: 0.5 }),
  
  // Sports Areas
  basketballCourtBlue: new THREE.MeshStandardMaterial({ color: 0x2563EB, roughness: 0.7 }),
  basketballCourtRed: new THREE.MeshStandardMaterial({ color: 0xDC2626, roughness: 0.7 }),
  sportsTurfGreen: new THREE.MeshStandardMaterial({ color: 0x15803D, roughness: 0.9 }),
  courtLineWhite: new THREE.MeshBasicMaterial({ color: 0xFFFFFF }),
  
  // Parking & Vehicles
  parkingMarkingBlue: new THREE.MeshBasicMaterial({ color: 0x38BDF8 }),
  busYellow: new THREE.MeshStandardMaterial({ color: 0xEAB308, roughness: 0.4 }),
  carBodyWhite: new THREE.MeshStandardMaterial({ color: 0xF8FAFC, roughness: 0.3 }),
  carBodySilver: new THREE.MeshStandardMaterial({ color: 0x94A3B8, metalness: 0.5 }),
  carBodyBlue: new THREE.MeshStandardMaterial({ color: 0x2563EB, roughness: 0.3 }),
  vehicleGlass: new THREE.MeshBasicMaterial({ color: 0x0F172A }),
  bikeBlack: new THREE.MeshStandardMaterial({ color: 0x1E293B, roughness: 0.5 }),
  
  // Vegetation
  treeFoliageDark: new THREE.MeshLambertMaterial({ color: 0x14532D }),
  treeFoliageMedium: new THREE.MeshLambertMaterial({ color: 0x15803D }),
  treeFoliageLight: new THREE.MeshLambertMaterial({ color: 0x22C55E }),
  treeTrunk: new THREE.MeshLambertMaterial({ color: 0x78350F }),
  hedgeGreen: new THREE.MeshLambertMaterial({ color: 0x166534 }),
  
  // High Voltage Pylon
  pylonMetal: new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.4 })
};

/**
 * 1. Build Ground, Internal Roads & Walking Avenues
 */
export function buildGroundAndRoads(scene) {
  const group = new THREE.Group();
  group.name = 'ground_roads_group';

  // A. Main Campus Ground Plane (60+ acres)
  const baseGeom = new THREE.PlaneGeometry(600, 700);
  const baseMesh = new THREE.Mesh(baseGeom, materials.groundCampusBase);
  baseMesh.rotation.x = -Math.PI / 2;
  baseMesh.position.set(0, -0.2, 0);
  baseMesh.receiveShadow = true;
  group.add(baseMesh);

  // B. Large Central Quadrangle Lawn (Image 3 & 4)
  const quadGeom = new THREE.PlaneGeometry(160, 180);
  const quadMesh = new THREE.Mesh(quadGeom, materials.groundQuadLawn);
  quadMesh.rotation.x = -Math.PI / 2;
  quadMesh.position.set(-25, -0.15, 20);
  quadMesh.receiveShadow = true;
  group.add(quadMesh);

  // C. Main Walking Avenue (from Main Gate at North to Central Fountain at South)
  // Length ~280m, Width 14m
  const avenueGeom = new THREE.PlaneGeometry(14, 290);
  const avenueMesh = new THREE.Mesh(avenueGeom, materials.roadAsphalt);
  avenueMesh.rotation.x = -Math.PI / 2;
  avenueMesh.position.set(5, -0.1, 10);
  avenueMesh.receiveShadow = true;
  group.add(avenueMesh);

  // Avenue Central Landscaped Tree Divider (from GPS dataset)
  const dividerGeom = new THREE.BoxGeometry(2, 0.4, 260);
  const dividerMesh = new THREE.Mesh(dividerGeom, materials.hedgeGreen);
  dividerMesh.position.set(5, 0.1, 15);
  group.add(dividerMesh);

  // D. Transverse Connecting Roads
  // East-West Road at Academic Quad
  const crossRoad1 = new THREE.Mesh(new THREE.PlaneGeometry(240, 10), materials.roadAsphalt);
  crossRoad1.rotation.x = -Math.PI / 2;
  crossRoad1.position.set(0, -0.09, -30);
  group.add(crossRoad1);

  // East-West Road at Southern Fountain Plaza
  const crossRoad2 = new THREE.Mesh(new THREE.PlaneGeometry(220, 10), materials.roadAsphalt);
  crossRoad2.rotation.x = -Math.PI / 2;
  crossRoad2.position.set(-10, -0.09, 130);
  group.add(crossRoad2);

  // E. Central Circular Fountain Plaza (Drone Images 3 & 4)
  // Coordinates: 13.169277°N, 77.534963°E -> (x: -90, z: +146)
  const fountainCenter = gpsToWorld(13.169277, 77.534963);
  const fountainGroup = new THREE.Group();
  fountainGroup.position.set(fountainCenter.x + 35, 0, fountainCenter.y + 10); // calibrated to campus axis

  // Outer Circular Paved Ring
  const outerRingGeom = new THREE.RingGeometry(18, 30, 48);
  const outerRing = new THREE.Mesh(outerRingGeom, materials.paverWalkway);
  outerRing.rotation.x = -Math.PI / 2;
  outerRing.position.y = 0.05;
  fountainGroup.add(outerRing);

  // Concentric Hedge Ring 1
  const hedgeRing1 = new THREE.TorusGeometry(24, 1.2, 8, 36);
  const hedge1 = new THREE.Mesh(hedgeRing1, materials.hedgeGreen);
  hedge1.rotation.x = -Math.PI / 2;
  hedge1.position.y = 0.6;
  fountainGroup.add(hedge1);

  // Concentric Hedge Ring 2
  const hedgeRing2 = new THREE.TorusGeometry(14, 1.0, 8, 32);
  const hedge2 = new THREE.Mesh(hedgeRing2, materials.hedgeGreen);
  hedge2.rotation.x = -Math.PI / 2;
  hedge2.position.y = 0.5;
  fountainGroup.add(hedge2);

  // Central Stone Fountain Basin
  const basinGeom = new THREE.CylinderGeometry(8, 9, 1.2, 32);
  const basin = new THREE.Mesh(basinGeom, materials.fountainStone);
  basin.position.y = 0.6;
  basin.castShadow = true;
  basin.receiveShadow = true;
  fountainGroup.add(basin);

  // Fountain Water Surface
  const waterGeom = new THREE.CircleGeometry(7.5, 32);
  const water = new THREE.Mesh(waterGeom, materials.fountainWater);
  water.rotation.x = -Math.PI / 2;
  water.position.y = 1.15;
  fountainGroup.add(water);

  // Central Water Jet Spire
  const spireGeom = new THREE.ConeGeometry(0.8, 3.5, 16);
  const spire = new THREE.Mesh(spireGeom, materials.fountainWater);
  spire.position.y = 2.8;
  fountainGroup.add(spire);

  group.add(fountainGroup);

  // F. Main Gate Entrance Plaza & Canopy Arch (North Gate, Image 1)
  const gateCoords = gpsToWorld(13.1717995, 77.5361915);
  const gateGroup = new THREE.Group();
  gateGroup.position.set(gateCoords.x, 0, gateCoords.z);

  // Paved Fan Plaza
  const plazaGeom = new THREE.CircleGeometry(26, 32, 0, Math.PI);
  const plaza = new THREE.Mesh(plazaGeom, materials.paverWalkway);
  plaza.rotation.x = -Math.PI / 2;
  plaza.position.y = 0.05;
  gateGroup.add(plaza);

  // Curved Entrance Gate Canopy Arch
  const archCurve = new THREE.CubicBezierCurve3(
    new THREE.Vector3(-18, 0, 0),
    new THREE.Vector3(-10, 11, 0),
    new THREE.Vector3(10, 11, 0),
    new THREE.Vector3(18, 0, 0)
  );
  const archGeom = new THREE.TubeGeometry(archCurve, 32, 0.8, 8, false);
  const archMesh = new THREE.Mesh(archGeom, materials.metalFrame);
  archMesh.castShadow = true;
  gateGroup.add(archMesh);

  // Security Gatehouses
  const cabinGeom = new THREE.BoxGeometry(4, 3.2, 4);
  const cabinLeft = new THREE.Mesh(cabinGeom, materials.buildingWhiteFacade);
  cabinLeft.position.set(-14, 1.6, 2);
  cabinLeft.castShadow = true;
  gateGroup.add(cabinLeft);

  const cabinRight = new THREE.Mesh(cabinGeom, materials.buildingWhiteFacade);
  cabinRight.position.set(14, 1.6, 2);
  cabinRight.castShadow = true;
  gateGroup.add(cabinRight);

  group.add(gateGroup);

  scene.add(group);
  return group;
}

/**
 * 2. Build Realistic Sports Complex & Facilities (Drone Photos 3 & 5)
 */
export function buildSportsComplex(scene) {
  const group = new THREE.Group();
  group.name = 'sports_complex_group';

  // Sports Complex Location: East of Academic Greens (~ x: 80, z: 60)
  const sportsBaseX = 80;
  const sportsBaseZ = 60;

  // A. Basketball Court (Distinct Blue playing surface with Terracotta Red border)
  const courtGroup = new THREE.Group();
  courtGroup.position.set(sportsBaseX, 0.1, sportsBaseZ);

  // Red Outer Border (34m x 20m)
  const redApron = new THREE.Mesh(new THREE.PlaneGeometry(34, 20), materials.basketballCourtRed);
  redApron.rotation.x = -Math.PI / 2;
  redApron.receiveShadow = true;
  courtGroup.add(redApron);

  // Vibrant Blue Inner Court (28m x 15m)
  const blueCourt = new THREE.Mesh(new THREE.PlaneGeometry(28, 15), materials.basketballCourtBlue);
  blueCourt.rotation.x = -Math.PI / 2;
  blueCourt.position.y = 0.02;
  blueCourt.receiveShadow = true;
  courtGroup.add(blueCourt);

  // Court Markings (White center circle, key lines, 3-point lines)
  const centerCircle = new THREE.Mesh(new THREE.RingGeometry(1.8, 2.0, 24), materials.courtLineWhite);
  centerCircle.rotation.x = -Math.PI / 2;
  centerCircle.position.y = 0.04;
  courtGroup.add(centerCircle);

  const centerLine = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 15), materials.courtLineWhite);
  centerLine.rotation.x = -Math.PI / 2;
  centerLine.position.y = 0.04;
  courtGroup.add(centerLine);

  // Basketball Hoops & Poles (Both ends)
  const createHoop = (xPos) => {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 4.5, 8), materials.metalFrame);
    pole.position.set(xPos, 2.25, 0);
    pole.castShadow = true;

    const backboard = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.2, 1.8), materials.buildingWhiteFacade);
    backboard.position.set(xPos > 0 ? xPos - 0.5 : xPos + 0.5, 3.5, 0);

    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.04, 8, 16), materials.buildingRedPillar);
    rim.rotation.x = Math.PI / 2;
    rim.position.set(xPos > 0 ? xPos - 0.9 : xPos + 0.9, 3.1, 0);

    const hoopGroup = new THREE.Group();
    hoopGroup.add(pole, backboard, rim);
    return hoopGroup;
  };
  courtGroup.add(createHoop(-14));
  courtGroup.add(createHoop(14));

  group.add(courtGroup);

  // B. Football / Athletics Turf Field (North of Basketball Court)
  const fieldGroup = new THREE.Group();
  fieldGroup.position.set(sportsBaseX + 15, 0.08, sportsBaseZ - 50);

  const turf = new THREE.Mesh(new THREE.PlaneGeometry(70, 45), materials.sportsTurfGreen);
  turf.rotation.x = -Math.PI / 2;
  turf.receiveShadow = true;
  fieldGroup.add(turf);

  // Soccer field perimeter lines
  const fieldPerimeter = new THREE.Mesh(new THREE.RingGeometry(34, 34.3, 4), materials.courtLineWhite);
  fieldPerimeter.rotation.x = -Math.PI / 2;
  fieldPerimeter.rotation.z = Math.PI / 4;
  fieldPerimeter.position.y = 0.02;
  fieldGroup.add(fieldPerimeter);

  group.add(fieldGroup);

  // C. Cricket Practice Pitches & Safety Nets
  const cricketGroup = new THREE.Group();
  cricketGroup.position.set(sportsBaseX - 30, 0.1, sportsBaseZ + 10);

  // 3 Parallel practice strips
  for (let i = -1; i <= 1; i++) {
    const pitch = new THREE.Mesh(new THREE.PlaneGeometry(22, 2.5), materials.paverWalkway);
    pitch.rotation.x = -Math.PI / 2;
    pitch.position.set(0, 0.02, i * 4);
    cricketGroup.add(pitch);

    // Green Cage Net Frame
    const cage = new THREE.Mesh(
      new THREE.BoxGeometry(22, 3.5, 3.2),
      new THREE.MeshBasicMaterial({ color: 0x166534, wireframe: true, transparent: true, opacity: 0.4 })
    );
    cage.position.set(0, 1.75, i * 4);
    cricketGroup.add(cage);
  }
  group.add(cricketGroup);

  // D. 3 Parallel Workshop / Lab Sheds with Pitched Roofs (from Image 2)
  const shedGroup = new THREE.Group();
  shedGroup.position.set(-85, 0, 75);

  for (let s = 0; s < 3; s++) {
    const singleShed = new THREE.Group();
    singleShed.position.set(0, 0, s * 22);

    // Shed Base Walls
    const shedWall = new THREE.Mesh(new THREE.BoxGeometry(50, 5, 12), materials.buildingWhiteFacade);
    shedWall.position.y = 2.5;
    shedWall.castShadow = true;
    singleShed.add(shedWall);

    // Corrugated Pitched Roof
    const roofGeom = new THREE.ConeGeometry(8, 3, 4);
    const roofMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 8, 50, 4),
      new THREE.MeshStandardMaterial({ color: 0x71717A, roughness: 0.7 })
    );
    roofMesh.rotation.z = Math.PI / 2;
    roofMesh.rotation.y = Math.PI / 4;
    roofMesh.position.y = 6.5;
    roofMesh.castShadow = true;
    singleShed.add(roofMesh);

    shedGroup.add(singleShed);
  }
  group.add(shedGroup);

  scene.add(group);
  return group;
}

/**
 * 3. Build Parking Areas, Vehicles & Transmission Tower (Drone Image 1)
 */
export function buildParkingAndVehicles(scene) {
  const group = new THREE.Group();
  group.name = 'parking_vehicles_group';

  // A. Two-Wheeler Motorcycle Parking Zone (Right / West of Main Gate, Image 1)
  const bikeParkCoords = gpsToWorld(13.1714, 77.5356);
  const bikeParking = new THREE.Group();
  bikeParking.position.set(bikeParkCoords.x - 15, 0.05, bikeParkCoords.z);

  const bikeAsphalt = new THREE.Mesh(new THREE.PlaneGeometry(45, 60), materials.roadAsphalt);
  bikeAsphalt.rotation.x = -Math.PI / 2;
  bikeAsphalt.receiveShadow = true;
  bikeParking.add(bikeAsphalt);

  // Procedural Motorcycle Rows (represented as compact bike clusters)
  const bikeClusterGeom = new THREE.BoxGeometry(1.6, 1.1, 0.6);
  for (let row = -22; row <= 22; row += 5) {
    for (let col = -16; col <= 16; col += 2.2) {
      if (Math.random() > 0.15) { // 85% parked density
        const bike = new THREE.Mesh(bikeClusterGeom, materials.bikeBlack);
        bike.position.set(col, 0.55, row);
        bike.castShadow = true;
        bikeParking.add(bike);
      }
    }
  }
  group.add(bikeParking);

  // B. High-Voltage Power Transmission Pylon Tower (Image 1 & 3)
  const pylonCoords = gpsToWorld(13.1718, 77.5352);
  const pylonGroup = new THREE.Group();
  pylonGroup.position.set(pylonCoords.x - 20, 0, pylonCoords.z);

  // Lattice Pylon Spire (Height 42m)
  const pylonTower = new THREE.Mesh(
    new THREE.CylinderGeometry(1.2, 5.5, 42, 4),
    new THREE.MeshBasicMaterial({ color: 0x94A3B8, wireframe: true })
  );
  pylonTower.position.y = 21;
  pylonGroup.add(pylonTower);

  // Horizontal Crossarms
  for (const armY of [26, 33, 40]) {
    const crossArm = new THREE.Mesh(new THREE.BoxGeometry(14 - (armY * 0.15), 0.6, 0.6), materials.pylonMetal);
    crossArm.position.y = armY;
    pylonGroup.add(crossArm);
  }
  group.add(pylonGroup);

  // C. Campus Bus Parking Bay (Fleet of Signature Yellow Buses, Image 1)
  const busBayCoords = gpsToWorld(13.1716, 77.5353);
  const busBay = new THREE.Group();
  busBay.position.set(busBayCoords.x - 15, 0.05, busBayCoords.z);

  const busGeom = new THREE.BoxGeometry(3.2, 3.4, 11);
  const busRoofGeom = new THREE.BoxGeometry(3.0, 0.4, 10.8);

  for (let b = 0; b < 6; b++) {
    const bus = new THREE.Group();
    bus.position.set(b * 5.5 - 14, 0, 0);

    const busBody = new THREE.Mesh(busGeom, materials.busYellow);
    busBody.position.y = 1.7;
    busBody.castShadow = true;

    // Windshield & windows band
    const glassBand = new THREE.Mesh(new THREE.BoxGeometry(3.22, 1.2, 10.2), materials.vehicleGlass);
    glassBand.position.y = 2.3;

    bus.add(busBody, glassBand);
    busBay.add(bus);
  }
  group.add(busBay);

  // D. Faculty & Staff Car Parking Bays (Near SOM and Admin)
  const carParkCoords = gpsToWorld(13.1702, 77.5365);
  const carPark = new THREE.Group();
  carPark.position.set(carParkCoords.x, 0.05, carParkCoords.z);

  const carAsphalt = new THREE.Mesh(new THREE.PlaneGeometry(35, 45), materials.roadAsphalt);
  carAsphalt.rotation.x = -Math.PI / 2;
  carAsphalt.receiveShadow = true;
  carPark.add(carAsphalt);

  const carGeom = new THREE.BoxGeometry(2.1, 1.5, 4.4);
  const carRoofGeom = new THREE.BoxGeometry(1.9, 0.9, 2.4);
  const carMats = [materials.carBodyWhite, materials.carBodySilver, materials.carBodyBlue];

  for (let r = -16; r <= 16; r += 7) {
    for (let c = -12; c <= 12; c += 4.5) {
      if (Math.random() > 0.2) {
        const car = new THREE.Group();
        car.position.set(c, 0, r);

        const mat = carMats[Math.floor(Math.random() * carMats.length)];
        const body = new THREE.Mesh(carGeom, mat);
        body.position.y = 0.75;
        body.castShadow = true;

        const cabin = new THREE.Mesh(carRoofGeom, materials.vehicleGlass);
        cabin.position.set(0, 1.45, -0.2);

        car.add(body, cabin);
        carPark.add(car);
      }
    }
  }
  group.add(carPark);

  scene.add(group);
  return group;
}

/**
 * 4. Build Campus Trees & Landscaping
 */
export function buildLandscapingAndTrees(scene) {
  const group = new THREE.Group();
  group.name = 'trees_landscaping_group';

  // Tree Prototype geometries
  const trunkGeom = new THREE.CylinderGeometry(0.3, 0.5, 3.5, 8);
  const canopyConeGeom = new THREE.ConeGeometry(2.5, 5.5, 8);
  const canopySphereGeom = new THREE.SphereGeometry(2.8, 8, 8);

  const createTree = (x, z, scale = 1.0, isRound = true) => {
    const tree = new THREE.Group();
    tree.position.set(x, 0, z);
    tree.scale.set(scale, scale, scale);

    const trunk = new THREE.Mesh(trunkGeom, materials.treeTrunk);
    trunk.position.y = 1.75;
    trunk.castShadow = true;
    tree.add(trunk);

    const mat = Math.random() > 0.5 ? materials.treeFoliageMedium : materials.treeFoliageDark;
    const foliage = isRound
      ? new THREE.Mesh(canopySphereGeom, mat)
      : new THREE.Mesh(canopyConeGeom, mat);
    foliage.position.y = 4.5;
    foliage.castShadow = true;
    tree.add(foliage);

    return tree;
  };

  // Plant trees along Avenue sides (Orders 0 to 9)
  for (let z = -120; z <= 120; z += 12) {
    // West tree line
    group.add(createTree(-4.5, z, 0.8 + Math.random() * 0.3, Math.random() > 0.4));
    // East tree line
    group.add(createTree(14.5, z, 0.8 + Math.random() * 0.3, Math.random() > 0.4));
  }

  // Plant trees around Central Quadrangle & Gardens
  const quadTreePositions = [
    [-65, 30], [-70, 0], [-68, -25], [-35, -45],
    [40, 20], [45, 45], [42, 70], [35, 95],
    [-20, 80], [-40, 85], [-60, 90]
  ];
  for (const [tx, tz] of quadTreePositions) {
    group.add(createTree(tx, tz, 1.1 + Math.random() * 0.3, true));
  }

  scene.add(group);
  return group;
}

/**
 * 5. Procedural Realistic White Building Mesh Generator
 * Produces crisp, authentic modern architecture with solar arrays and entrances.
 */
export function buildBuildingMesh(spec, isSelected = false, isHovered = false) {
  const {
    id,
    name,
    dimensions,
    centerGps,
    rotation = 0,
    color = '#FFFFFF',
    accentColor = '#00A878',
    roofType = 'flat_solar',
    entranceOffset = { x: 0, z: 0 }
  } = spec;

  const worldPos = gpsToWorld(centerGps.lat, centerGps.lng);
  const buildingGroup = new THREE.Group();
  buildingGroup.name = `bld_${id}`;
  buildingGroup.position.set(worldPos.x, 0, worldPos.z);
  buildingGroup.rotation.y = rotation;
  buildingGroup.userData = { spec, isBuilding: true };

  const { width, depth, height, floors = 4 } = dimensions;

  // Highlight / Base Material
  let mainWallMat = materials.buildingWhiteFacade;
  if (isSelected) {
    mainWallMat = new THREE.MeshStandardMaterial({
      color: 0x10B981,
      roughness: 0.2,
      emissive: 0x059669,
      emissiveIntensity: 0.35
    });
  } else if (isHovered) {
    mainWallMat = new THREE.MeshStandardMaterial({
      color: 0x38BDF8,
      roughness: 0.2,
      emissive: 0x0284C7,
      emissiveIntensity: 0.25
    });
  }

  // A. Main Building Volume
  const mainBox = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), mainWallMat);
  mainBox.position.y = height / 2;
  mainBox.castShadow = true;
  mainBox.receiveShadow = true;
  buildingGroup.add(mainBox);

  // B. Recessed Window Bands across Floors
  const floorHeight = height / floors;
  for (let f = 1; f <= floors; f++) {
    const bandY = (f - 0.5) * floorHeight;
    // Front and back window strips
    const frontWindow = new THREE.Mesh(
      new THREE.BoxGeometry(width * 0.88, floorHeight * 0.45, 0.2),
      materials.windowDarkGlass
    );
    frontWindow.position.set(0, bandY, depth / 2 + 0.05);
    buildingGroup.add(frontWindow);

    const backWindow = new THREE.Mesh(
      new THREE.BoxGeometry(width * 0.88, floorHeight * 0.45, 0.2),
      materials.windowDarkGlass
    );
    backWindow.position.set(0, bandY, -depth / 2 - 0.05);
    buildingGroup.add(backWindow);
  }

  // C. Roof Features (Solar panels, skylights, parapet)
  // Parapet rim
  const parapet = new THREE.Mesh(
    new THREE.BoxGeometry(width + 0.6, 0.8, depth + 0.6),
    materials.curbStone
  );
  parapet.position.y = height + 0.4;
  buildingGroup.add(parapet);

  // Solar Panel Arrays
  if (roofType === 'solar_canopy' || roofType === 'flat_solar' || roofType === 'mega_stepped') {
    const panelGroup = new THREE.Group();
    panelGroup.position.set(0, height + 0.8, 0);

    const panelRows = Math.floor(depth / 8);
    const panelCols = Math.floor(width / 10);

    for (let r = 0; r < panelRows; r++) {
      for (let c = 0; c < panelCols; c++) {
        const pMesh = new THREE.Mesh(new THREE.BoxGeometry(6, 0.2, 4), materials.solarPanel);
        pMesh.position.set(
          (c - panelCols / 2 + 0.5) * 8,
          0.3,
          (r - panelRows / 2 + 0.5) * 6
        );
        pMesh.rotation.x = 0.15; // angled towards sun
        panelGroup.add(pMesh);
      }
    }
    buildingGroup.add(panelGroup);
  }

  // Central Glass Atrium for Mega-Complex
  if (roofType === 'mega_stepped') {
    const atrium = new THREE.Mesh(
      new THREE.ConeGeometry(width * 0.25, 6, 4),
      materials.buildingGlass
    );
    atrium.rotation.y = Math.PI / 4;
    atrium.position.set(0, height + 3, 0);
    buildingGroup.add(atrium);
  }

  // D. Architectural Entrance Portico & Canopy (Ground Floor)
  const portico = new THREE.Group();
  portico.position.set(entranceOffset.x, 0, depth / 2 + 3);

  // Cantilevered canopy slab
  const canopy = new THREE.Mesh(new THREE.BoxGeometry(10, 0.6, 6), materials.buildingWhiteFacade);
  canopy.position.y = 4.2;
  canopy.castShadow = true;

  // Support pillars
  const pillarGeom = new THREE.CylinderGeometry(0.3, 0.3, 4.2, 8);
  const p1 = new THREE.Mesh(pillarGeom, materials.buildingWhiteFacade);
  p1.position.set(-4, 2.1, 2.2);
  const p2 = new THREE.Mesh(pillarGeom, materials.buildingWhiteFacade);
  p2.position.set(4, 2.1, 2.2);

  // Glass entrance doors
  const glassDoors = new THREE.Mesh(new THREE.BoxGeometry(6, 3.2, 0.2), materials.buildingGlass);
  glassDoors.position.set(0, 1.6, -2.5);

  portico.add(canopy, p1, p2, glassDoors);
  buildingGroup.add(portico);

  // E. Selection / Entrance Indicator Beacon
  if (isSelected) {
    const beacon = new THREE.Mesh(
      new THREE.ConeGeometry(1.5, 4, 16),
      new THREE.MeshBasicMaterial({ color: 0x10B981 })
    );
    beacon.rotation.x = Math.PI; // pointing down
    beacon.position.set(entranceOffset.x, height + 6, depth / 2 + 3);
    buildingGroup.add(beacon);
  }

  return buildingGroup;
}
