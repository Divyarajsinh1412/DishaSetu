import * as THREE from 'three';
import { mapToWorld, CAMPUS_BUILDING_SPECS, CAMPUS_LANDMARK_SPECS } from './campusCoords';

/**
 * Premium Architectural Miniature Campus Builder for Presidency University Bengaluru
 * Strictly following the Official Campus Master Map layout with enlarged, spacious dimensions.
 */

// Shared Materials Cache for High-Performance Rendering & Studio Lighting
export const materials = {
  // Architectural Plinth & Grounds
  plinthPedestal: new THREE.MeshStandardMaterial({ color: 0x0B132B, roughness: 0.8, metalness: 0.2 }),
  plinthBevel: new THREE.MeshStandardMaterial({ color: 0x1C2D4A, roughness: 0.5, metalness: 0.4 }),
  campusGround: new THREE.MeshStandardMaterial({ color: 0xCBD5E1, roughness: 0.85 }),
  pavedPlaza: new THREE.MeshStandardMaterial({ color: 0xE2E8F0, roughness: 0.6 }),
  courtyardStone: new THREE.MeshStandardMaterial({ color: 0xD8B4FE, roughness: 0.7 }),

  // Lawns & Greenery
  mainLawnGrass: new THREE.MeshStandardMaterial({ color: 0x16A34A, roughness: 0.85 }),
  lawnStripeDark: new THREE.MeshStandardMaterial({ color: 0x15803D, roughness: 0.85 }),
  hedgeGreen: new THREE.MeshLambertMaterial({ color: 0x14532D }),
  treeCanopy1: new THREE.MeshLambertMaterial({ color: 0x166534 }),
  treeCanopy2: new THREE.MeshLambertMaterial({ color: 0x15803D }),
  treeTrunk: new THREE.MeshLambertMaterial({ color: 0x5C3A21 }),

  // Roads & Infrastructure
  roadAsphalt: new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 }),
  roadMarking: new THREE.MeshBasicMaterial({ color: 0xFFFFFF }),
  busTransitStrip: new THREE.MeshStandardMaterial({ color: 0x6D28D9, roughness: 0.7 }), // Purple bus boarding strip as on map
  parkingAsphalt: new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.85 }),
  parkingStallLine: new THREE.MeshBasicMaterial({ color: 0x94A3B8 }),

  // Building Facades & Finishes
  facadeWhite: new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.25, metalness: 0.05 }),
  facadeCream: new THREE.MeshStandardMaterial({ color: 0xFEF3C7, roughness: 0.35, metalness: 0.05 }), // Warm tone for map-highlighted blocks
  facadeSlate: new THREE.MeshStandardMaterial({ color: 0xF1F5F9, roughness: 0.3 }),
  roofConcrete: new THREE.MeshStandardMaterial({ color: 0xE2E8F0, roughness: 0.7 }),
  roofParapet: new THREE.MeshStandardMaterial({ color: 0x64748B, roughness: 0.5 }),
  solarPanel: new THREE.MeshStandardMaterial({ color: 0x1E3A8A, roughness: 0.2, metalness: 0.7 }),
  hvacMetal: new THREE.MeshStandardMaterial({ color: 0x94A3B8, metalness: 0.6, roughness: 0.4 }),
  windowRibbon: new THREE.MeshStandardMaterial({ color: 0x0F2942, roughness: 0.15, metalness: 0.4 }),
  windowSelected: new THREE.MeshStandardMaterial({ color: 0x0284C7, emissive: 0x0284C7, emissiveIntensity: 0.4 }),

  // Fountain & Water
  fountainWater: new THREE.MeshPhysicalMaterial({
    color: 0x06B6D4,
    roughness: 0.1,
    transmission: 0.85,
    transparent: true,
    opacity: 0.82
  }),
  fountainStone: new THREE.MeshStandardMaterial({ color: 0x94A3B8, roughness: 0.4 }),
  fountainJet: new THREE.MeshBasicMaterial({ color: 0xE0F2FE, transparent: true, opacity: 0.8 }),

  // Sports Courts
  footballTurf: new THREE.MeshStandardMaterial({ color: 0x15803D, roughness: 0.9 }),
  courtLineWhite: new THREE.MeshBasicMaterial({ color: 0xFFFFFF }),
  basketballBlue: new THREE.MeshStandardMaterial({ color: 0x2563EB, roughness: 0.6 }),
  basketballRed: new THREE.MeshStandardMaterial({ color: 0xDC2626, roughness: 0.6 }),
  volleyballSand: new THREE.MeshStandardMaterial({ color: 0xD97706, roughness: 0.9 }),
  cricketTurf: new THREE.MeshStandardMaterial({ color: 0x16A34A, roughness: 0.85 }),

  // Vehicles
  busYellow: new THREE.MeshStandardMaterial({ color: 0xFACC15, roughness: 0.3 }),
  vehicleWhite: new THREE.MeshStandardMaterial({ color: 0xF8FAFC, roughness: 0.3 }),
  vehicleSilver: new THREE.MeshStandardMaterial({ color: 0x94A3B8, metalness: 0.6, roughness: 0.3 }),
  vehicleBlue: new THREE.MeshStandardMaterial({ color: 0x1D4ED8, roughness: 0.3 }),
  vehicleGlass: new THREE.MeshBasicMaterial({ color: 0x0F172A }),

  // Selection Glow & Highlights
  highlightEmerald: new THREE.MeshStandardMaterial({
    color: 0x00A878,
    emissive: 0x00A878,
    emissiveIntensity: 0.6,
    roughness: 0.2
  }),
  redCross: new THREE.MeshBasicMaterial({ color: 0xDC2626 })
};

/**
 * 1. Build the Architectural Model Presentation Pedestal & Plinth (Enlarged)
 */
export function buildPresentationPlinth(scene) {
  const plinthGroup = new THREE.Group();
  plinthGroup.name = 'architectural_plinth_group';

  // Heavy Architectural Pedestal Base (420m x 600m x 10m)
  const baseGeom = new THREE.BoxGeometry(420, 10, 600);
  const baseMesh = new THREE.Mesh(baseGeom, materials.plinthPedestal);
  baseMesh.position.set(10, -5.05, -35);
  baseMesh.receiveShadow = true;
  plinthGroup.add(baseMesh);

  // Chamfered Metal/Slate Rim
  const rimGeom = new THREE.BoxGeometry(424, 0.6, 604);
  const rimMesh = new THREE.Mesh(rimGeom, materials.plinthBevel);
  rimMesh.position.set(10, -0.2, -35);
  plinthGroup.add(rimMesh);

  // Top Ground Surface
  const groundGeom = new THREE.PlaneGeometry(418, 598);
  const groundMesh = new THREE.Mesh(groundGeom, materials.campusGround);
  groundMesh.rotation.x = -Math.PI / 2;
  groundMesh.position.set(10, -0.05, -35);
  groundMesh.receiveShadow = true;
  plinthGroup.add(groundMesh);

  scene.add(plinthGroup);
  return plinthGroup;
}

/**
 * 2. Build Campus Road Network & Walking Avenues (Enlarged & Spacious)
 */
export function buildRoadNetwork(scene) {
  const roadGroup = new THREE.Group();
  roadGroup.name = 'campus_roads_group';

  // Helper to create straight road strip
  const createRoad = (width, length, x, z, rotY = 0) => {
    const geom = new THREE.PlaneGeometry(width, length);
    const mesh = new THREE.Mesh(geom, materials.roadAsphalt);
    mesh.rotation.x = -Math.PI / 2;
    mesh.rotation.z = -rotY;
    mesh.position.set(x, 0.02, z);
    mesh.receiveShadow = true;
    roadGroup.add(mesh);
    return mesh;
  };

  // A. Top North Highway/Perimeter Road (Passing Entry/Exit, Main Gate, Visitor Parking, Gate 2)
  createRoad(16, 290, 75, -235, 0.08);

  // Road connecting North highway to Main Student Parking
  createRoad(14, 110, -2, -265, -0.4);

  // B. Main Avenue: North Gate down to Central Fountain
  // Runs along west edge of Main Lawn, length ~220m, width ~18m
  createRoad(18, 220, 22, -110, 0.16);

  // C. Secondary East Avenue: Gate 2 / Visitor Parking down to Central Fountain & Auditorium
  // Runs along east edge of Main Lawn, length ~220m, width ~14m
  createRoad(14, 220, 84, -105, -0.12);

  // D. Central Fountain Roundabout (Enlarged Circular Road Ring)
  const roundaboutGeom = new THREE.RingGeometry(16, 28, 48);
  const roundaboutMesh = new THREE.Mesh(roundaboutGeom, materials.roadAsphalt);
  roundaboutMesh.rotation.x = -Math.PI / 2;
  roundaboutMesh.position.set(0, 0.025, 0);
  roundaboutMesh.receiveShadow = true;
  roadGroup.add(roundaboutMesh);

  // E. West Academic Arteries & Promenade:
  // Branch from Fountain into Admission / H Block and D/E/F/L blocks
  createRoad(14, 130, -55, 0, 1.57); // Connector west from fountain
  createRoad(12, 195, -90, 110, 0.0); // Wide promenade between D/E/F/L and H/J/N/P/Q
  createRoad(12, 205, -148, 115, 0.0); // West outer perimeter road
  createRoad(12, 100, -90, 210, 1.57); // Southern connector road at U Block

  // F. Central-East Academic Arteries:
  // Road past Plaza, HR, Fee Counter, Library, MBA/SOM, connecting to Auditorium
  createRoad(12, 140, 50, 30, 1.57); // East road from fountain to auditorium
  createRoad(12, 105, 80, 95, 0.1); // Road between Library and MBA/SOM
  createRoad(12, 115, 120, 72, -0.1); // Road in front of Auditorium

  // Zebra Crossings / White Markings at Fountain Roundabout entries
  const createZebra = (x, z, rotY = 0) => {
    const zebraG = new THREE.Group();
    zebraG.position.set(x, 0.03, z);
    zebraG.rotation.y = rotY;
    for (let i = -4; i <= 4; i++) {
      const stripe = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 6.0), materials.roadMarking);
      stripe.rotation.x = -Math.PI / 2;
      stripe.position.set(i * 1.6, 0, 0);
      zebraG.add(stripe);
    }
    roadGroup.add(zebraG);
  };

  createZebra(6, -29, 0.16); // North entrance to fountain
  createZebra(-27, 0, 1.57); // West entrance to fountain
  createZebra(27, 0, 1.57); // East entrance to fountain

  scene.add(roadGroup);
  return roadGroup;
}

/**
 * 3. Build Iconic Main Lawn, Bus Boarding Strip & Green Lawns (Enlarged)
 */
export function buildMainLawnAndGardens(scene) {
  const lawnGroup = new THREE.Group();
  lawnGroup.name = 'campus_lawns_group';

  // A. Official Main Lawn (Grand Trapezoid between North Gate and Central Fountain)
  // Spanning from z: -205 to z: -18, centered at x: 55, width ~52m
  const lawnShape = new THREE.Shape();
  lawnShape.moveTo(28, -205);
  lawnShape.lineTo(78, -205);
  lawnShape.lineTo(94, -18);
  lawnShape.lineTo(16, -18);
  lawnShape.closePath();

  const lawnGeom = new THREE.ShapeGeometry(lawnShape);
  const lawnMesh = new THREE.Mesh(lawnGeom, materials.mainLawnGrass);
  lawnMesh.rotation.x = -Math.PI / 2;
  lawnMesh.position.set(0, 0.04, 0);
  lawnMesh.receiveShadow = true;
  lawnGroup.add(lawnMesh);

  // Decorative Mowing Stripes across Main Lawn
  for (let z = -195; z < -25; z += 18) {
    const stripe = new THREE.Mesh(new THREE.PlaneGeometry(58, 8), materials.lawnStripeDark);
    stripe.rotation.x = -Math.PI / 2;
    stripe.rotation.z = 0.05;
    stripe.position.set(55, 0.045, z);
    stripe.receiveShadow = true;
    lawnGroup.add(stripe);
  }

  // Low Manicured Boxwood Hedges enclosing the Main Lawn perimeter
  const createHedgeLine = (x1, z1, x2, z2) => {
    const dist = Math.hypot(x2 - x1, z2 - z1);
    const hedge = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.9, dist), materials.hedgeGreen);
    hedge.position.set((x1 + x2) / 2, 0.45, (z1 + z2) / 2);
    hedge.rotation.y = -Math.atan2(z2 - z1, x2 - x1) + Math.PI / 2;
    hedge.castShadow = true;
    lawnGroup.add(hedge);
  };
  createHedgeLine(28, -205, 78, -205); // North edge
  createHedgeLine(78, -205, 94, -18); // East edge
  createHedgeLine(94, -18, 16, -18); // South edge
  createHedgeLine(16, -18, 28, -205); // West edge

  // B. Official Bus Boarding Strip (Purple Strip along West Edge of Main Lawn as on Map)
  // Coordinates: x: 12.5, z: -54.0 (Length 75m, Width 12m)
  const busStrip = new THREE.Mesh(new THREE.PlaneGeometry(12, 75), materials.busTransitStrip);
  busStrip.rotation.x = -Math.PI / 2;
  busStrip.rotation.z = -0.16;
  busStrip.position.set(13.5, 0.048, -54);
  busStrip.receiveShadow = true;
  lawnGroup.add(busStrip);

  // Staged Miniature Yellow University Buses at Bus Boarding (4 Buses)
  for (let b = -1.5; b <= 1.5; b += 1.0) {
    const bus = createMiniatureBus();
    bus.position.set(13.5 - b * 2.0, 0.05, -54 + b * 20);
    bus.rotation.y = -0.16;
    lawnGroup.add(bus);
  }

  // C. DSA Pocket Lawn (x: 41, z: 65, Size: 26m x 20m)
  const dsaLawn = new THREE.Mesh(new THREE.PlaneGeometry(26, 20), materials.mainLawnGrass);
  dsaLawn.rotation.x = -Math.PI / 2;
  dsaLawn.position.set(41, 0.04, 65);
  dsaLawn.receiveShadow = true;
  lawnGroup.add(dsaLawn);

  // D. Central Plaza Promenade (South of Fountain: x: -23, z: 32, Size: 38m x 28m)
  const plaza = new THREE.Mesh(new THREE.PlaneGeometry(38, 28), materials.pavedPlaza);
  plaza.rotation.x = -Math.PI / 2;
  plaza.position.set(-23, 0.03, 32);
  plaza.receiveShadow = true;
  lawnGroup.add(plaza);

  scene.add(lawnGroup);
  return lawnGroup;
}

/**
 * 4. Build Animated Central Fountain & Water Plaza (Enlarged & Prominent at x: 0, z: 0)
 */
export function buildCentralFountain(scene) {
  const fountainGroup = new THREE.Group();
  fountainGroup.name = 'central_fountain_group';
  fountainGroup.position.set(0, 0, 0);

  // A. Outer Paved Stone Promenade (Radius: 18m to 24m)
  const outerPlazaGeom = new THREE.RingGeometry(18, 24, 48);
  const outerPlaza = new THREE.Mesh(outerPlazaGeom, materials.pavedPlaza);
  outerPlaza.rotation.x = -Math.PI / 2;
  outerPlaza.position.y = 0.03;
  outerPlaza.receiveShadow = true;
  fountainGroup.add(outerPlaza);

  // B. Concentric Floral Garden Ring (Radius: 15m to 18m with vibrant landscaping)
  const gardenRingGeom = new THREE.RingGeometry(15, 18, 48);
  const gardenRing = new THREE.Mesh(gardenRingGeom, materials.hedgeGreen);
  gardenRing.rotation.x = -Math.PI / 2;
  gardenRing.position.y = 0.04;
  gardenRing.receiveShadow = true;
  fountainGroup.add(gardenRing);

  // Concentric Low Ornamental Floral Hedge
  const hedgeTorus = new THREE.Mesh(new THREE.TorusGeometry(17.8, 0.9, 8, 48), materials.hedgeGreen);
  hedgeTorus.rotation.x = -Math.PI / 2;
  hedgeTorus.position.y = 0.45;
  hedgeTorus.castShadow = true;
  fountainGroup.add(hedgeTorus);

  // Golden / Yellow Flower Accents around the hedge
  const flowerMat = new THREE.MeshBasicMaterial({ color: 0xFBBF24 });
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 12) {
    const flw = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.6, 0.8), flowerMat);
    flw.position.set(Math.cos(a) * 16.5, 0.5, Math.sin(a) * 16.5);
    fountainGroup.add(flw);
  }

  // C. Raised Limestone Fountain Basin (Radius: 14.0m, Height: 1.6m)
  const basinGeom = new THREE.CylinderGeometry(13.6, 14.5, 1.6, 48);
  const basin = new THREE.Mesh(basinGeom, materials.fountainStone);
  basin.position.y = 0.8;
  basin.castShadow = true;
  basin.receiveShadow = true;
  fountainGroup.add(basin);

  // D. Coping Rim
  const rimGeom = new THREE.TorusGeometry(14.2, 0.6, 8, 48);
  const rim = new THREE.Mesh(rimGeom, materials.fountainStone);
  rim.rotation.x = -Math.PI / 2;
  rim.position.y = 1.6;
  fountainGroup.add(rim);

  // E. Sparkling Aquamarine Water Surface (Radius: 13.4m)
  const waterGeom = new THREE.CircleGeometry(13.4, 48);
  const water = new THREE.Mesh(waterGeom, materials.fountainWater);
  water.rotation.x = -Math.PI / 2;
  water.position.y = 1.45;
  water.userData = { isFountainWater: true };
  fountainGroup.add(water);

  // F. Central Tiered Pedestal & Multi-Tier Water Jets
  const pedestalGeom = new THREE.CylinderGeometry(3.5, 4.8, 2.4, 32);
  const pedestal = new THREE.Mesh(pedestalGeom, materials.fountainStone);
  pedestal.position.y = 1.8;
  fountainGroup.add(pedestal);

  // Central Vertical Geyser Jet
  const jetGeom = new THREE.ConeGeometry(1.2, 7.5, 16);
  const jet = new THREE.Mesh(jetGeom, materials.fountainJet);
  jet.position.y = 5.6;
  fountainGroup.add(jet);

  // 8 Radial Arching Jets
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI * 2) / 8;
    const radialJet = new THREE.Mesh(new THREE.ConeGeometry(0.5, 4.2, 8), materials.fountainJet);
    radialJet.position.set(Math.cos(angle) * 7.5, 2.8, Math.sin(angle) * 7.5);
    radialJet.rotation.z = Math.cos(angle) * 0.4;
    radialJet.rotation.x = Math.sin(angle) * 0.4;
    fountainGroup.add(radialJet);
  }

  scene.add(fountainGroup);
  return fountainGroup;
}

/**
 * 5. Build Sports Zone on the West Campus (Enlarged & Regulation Proportions)
 */
export function buildSportsComplex(scene) {
  const sportsGroup = new THREE.Group();
  sportsGroup.name = 'campus_sports_group';

  // A. Football Court (x: -24.7, z: -143.6, 48m x 72m)
  const fbGroup = new THREE.Group();
  fbGroup.position.set(-24.7, 0.03, -143.6);

  const fbPitch = new THREE.Mesh(new THREE.PlaneGeometry(48, 72), materials.footballTurf);
  fbPitch.rotation.x = -Math.PI / 2;
  fbPitch.receiveShadow = true;
  fbGroup.add(fbPitch);

  // Boundary line
  const fbLine = new THREE.Mesh(new THREE.RingGeometry(32.5, 33.0, 4), materials.courtLineWhite);
  fbLine.rotation.x = -Math.PI / 2;
  fbLine.rotation.z = Math.PI / 4;
  fbLine.position.y = 0.01;
  fbGroup.add(fbLine);

  // Center circle
  const centerCircle = new THREE.Mesh(new THREE.RingGeometry(5.0, 5.4, 32), materials.courtLineWhite);
  centerCircle.rotation.x = -Math.PI / 2;
  centerCircle.position.y = 0.01;
  fbGroup.add(centerCircle);

  // Center line
  const centerLine = new THREE.Mesh(new THREE.PlaneGeometry(46, 0.4), materials.courtLineWhite);
  centerLine.rotation.x = -Math.PI / 2;
  centerLine.position.y = 0.01;
  fbGroup.add(centerLine);

  // White Goalposts (North & South ends)
  const createGoalpost = (zPos) => {
    const postG = new THREE.Group();
    postG.position.set(0, 0, zPos);
    const barMat = materials.courtLineWhite;
    const postL = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 3.2, 8), barMat);
    postL.position.set(-5.0, 1.6, 0);
    const postR = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 3.2, 8), barMat);
    postR.position.set(5.0, 1.6, 0);
    const crossbar = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 10.0, 8), barMat);
    crossbar.rotation.z = Math.PI / 2;
    crossbar.position.set(0, 3.2, 0);
    postG.add(postL, postR, crossbar);
    return postG;
  };
  fbGroup.add(createGoalpost(-35));
  fbGroup.add(createGoalpost(35));
  sportsGroup.add(fbGroup);

  // B. Volleyball Nets (x: -71.1, z: -76.3, 24m x 32m)
  const vbGroup = new THREE.Group();
  vbGroup.position.set(-71.1, 0.03, -76.3);

  const vbCourt = new THREE.Mesh(new THREE.PlaneGeometry(24, 32), materials.volleyballSand);
  vbCourt.rotation.x = -Math.PI / 2;
  vbCourt.receiveShadow = true;
  vbGroup.add(vbCourt);

  // Volleyball net & poles
  const vbPoleL = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 3.4, 8), materials.hvacMetal);
  vbPoleL.position.set(-11, 1.7, 0);
  const vbPoleR = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 3.4, 8), materials.hvacMetal);
  vbPoleR.position.set(11, 1.7, 0);
  const vbNet = new THREE.Mesh(
    new THREE.PlaneGeometry(22, 1.4),
    new THREE.MeshBasicMaterial({ color: 0xFFFFFF, wireframe: true, transparent: true, opacity: 0.65 })
  );
  vbNet.position.set(0, 2.5, 0);
  vbGroup.add(vbPoleL, vbPoleR, vbNet);
  sportsGroup.add(vbGroup);

  // C. Basketball Court (x: -121.2, z: -35.2, 26m x 40m, FIBA Royal Blue & Terracotta Red)
  const bbGroup = new THREE.Group();
  bbGroup.position.set(-121.2, 0.03, -35.2);

  // Terracotta Red Outer Apron
  const bbApron = new THREE.Mesh(new THREE.PlaneGeometry(26, 40), materials.basketballRed);
  bbApron.rotation.x = -Math.PI / 2;
  bbApron.receiveShadow = true;
  bbGroup.add(bbApron);

  // Royal Blue Inner Playing Area (22m x 36m)
  const bbBlue = new THREE.Mesh(new THREE.PlaneGeometry(22, 36), materials.basketballBlue);
  bbBlue.rotation.x = -Math.PI / 2;
  bbBlue.position.y = 0.01;
  bbBlue.receiveShadow = true;
  bbGroup.add(bbBlue);

  // Basketball hoops & backboards
  const createHoop = (zPos) => {
    const hoopG = new THREE.Group();
    hoopG.position.set(0, 0, zPos);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 4.6, 8), materials.hvacMetal);
    pole.position.set(0, 2.3, 0);
    const backboard = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.5, 0.1), materials.facadeWhite);
    backboard.position.set(0, 3.8, zPos > 0 ? -0.5 : 0.5);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.05, 8, 16), materials.basketballRed);
    ring.rotation.x = Math.PI / 2;
    ring.position.set(0, 3.4, zPos > 0 ? -0.9 : 0.9);
    hoopG.add(pole, backboard, ring);
    return hoopG;
  };
  bbGroup.add(createHoop(-17));
  bbGroup.add(createHoop(17));
  sportsGroup.add(bbGroup);

  // D. Cricket Practice Nets (x: -67.2, z: -35.2, 20m x 36m)
  const crGroup = new THREE.Group();
  crGroup.position.set(-67.2, 0.03, -35.2);

  for (let i = -1; i <= 1; i++) {
    const pitch = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 32), materials.cricketTurf);
    pitch.rotation.x = -Math.PI / 2;
    pitch.position.set(i * 6.0, 0.01, 0);
    crGroup.add(pitch);

    // Green Cage Netting
    const cage = new THREE.Mesh(
      new THREE.BoxGeometry(4.6, 3.8, 32),
      new THREE.MeshBasicMaterial({ color: 0x166534, wireframe: true, transparent: true, opacity: 0.35 })
    );
    cage.position.set(i * 6.0, 1.9, 0);
    crGroup.add(cage);
  }
  sportsGroup.add(crGroup);

  scene.add(sportsGroup);
  return sportsGroup;
}

/**
 * 6. Build Open Air Theatre (O.A.T), Mess & East Cultural Amenities (Enlarged)
 */
export function buildEastSectorAmenities(scene) {
  const eastGroup = new THREE.Group();
  eastGroup.name = 'east_sector_group';

  // Open Air Theatre (O.A.T) at x: 125.8, z: 17.2
  // Tiered semi-circular amphitheater bowl
  const oatGroup = new THREE.Group();
  oatGroup.position.set(125.8, 0.04, 17.2);

  // 5 Concentric stepped seating tiers
  for (let tier = 1; tier <= 5; tier++) {
    const radius = 5 + tier * 2.8;
    const tierGeom = new THREE.RingGeometry(radius, radius + 2.4, 32, 1, 0, Math.PI);
    const tierMesh = new THREE.Mesh(tierGeom, materials.pavedPlaza);
    tierMesh.rotation.x = -Math.PI / 2;
    tierMesh.position.y = tier * 0.45;
    oatGroup.add(tierMesh);

    // Riser wall
    const wallGeom = new THREE.CylinderGeometry(radius, radius, 0.45, 32, 1, true, 0, Math.PI);
    const wallMesh = new THREE.Mesh(wallGeom, materials.facadeSlate);
    wallMesh.position.y = tier * 0.45 - 0.225;
    oatGroup.add(wallMesh);
  }

  // Semi-circular Performance Stage
  const stageGeom = new THREE.CircleGeometry(5.2, 32, 0, Math.PI);
  const stageMesh = new THREE.Mesh(stageGeom, materials.facadeCream);
  stageMesh.rotation.x = -Math.PI / 2;
  stageMesh.position.y = 0.25;
  oatGroup.add(stageMesh);

  eastGroup.add(oatGroup);
  scene.add(eastGroup);
  return eastGroup;
}

/**
 * 7. Build Parking Zones & Miniature Vehicles (Enlarged & Prominent)
 */
export function buildParkingZones(scene) {
  const parkGroup = new THREE.Group();
  parkGroup.name = 'campus_parking_group';

  const createParkingLot = (width, depth, x, z, angle = 0, numCars = 8) => {
    const lotG = new THREE.Group();
    lotG.position.set(x, 0.03, z);
    lotG.rotation.y = angle;

    const asphalt = new THREE.Mesh(new THREE.PlaneGeometry(width, depth), materials.parkingAsphalt);
    asphalt.rotation.x = -Math.PI / 2;
    asphalt.receiveShadow = true;
    lotG.add(asphalt);

    // Parked Miniature Cars
    for (let c = 0; c < numCars; c++) {
      const xOffset = -width / 2 + 4 + (c % (numCars / 2)) * 6.5;
      const zOffset = c >= numCars / 2 ? depth / 4 : -depth / 4;
      const car = createMiniatureCar(c % 3);
      car.position.set(xOffset, 0.05, zOffset);
      lotG.add(car);
    }
    parkGroup.add(lotG);
  };

  // A. Main Student Parking (North): x: -1.6, z: -308.1 (55m x 36m)
  createParkingLot(55, 36, -1.6, -308.1, 0.05, 12);

  // B. Visitor Parking: x: 79.5, z: -240.8 (44m x 28m)
  createParkingLot(44, 28, 79.5, -240.8, 0.08, 8);

  // C. Student 2W Parking: x: 13.9, z: -210.9 (38m x 24m)
  createParkingLot(38, 24, 13.9, -210.9, 0.16, 6);

  // D. 4 Wheeler Parking: x: 151.2, z: -166.0 (46m x 30m)
  createParkingLot(46, 30, 151.2, -166.0, -0.1, 10);

  // E. Faculty 2W & 4W Parking: x: 110.3, z: -117.4 & x: 102.6, z: -72.5
  createParkingLot(32, 24, 110.3, -117.4, -0.12, 6);
  createParkingLot(38, 26, 102.6, -72.5, -0.12, 8);

  // F. Bus Point 2 (Near Gate 2): x: 135.8, z: -225.9 with 3 Staged University Buses
  const busPt2 = new THREE.Group();
  busPt2.position.set(135.8, 0.05, -225.9);
  for (let b = -1; b <= 1; b++) {
    const bus = createMiniatureBus();
    bus.position.set(b * 5.5, 0, 0);
    bus.rotation.y = -0.1;
    busPt2.add(bus);
  }
  parkGroup.add(busPt2);

  scene.add(parkGroup);
  return parkGroup;
}

/**
 * 8. Build Architectural Trees & Landscaping Accents
 * Neatly aligned along Main Avenue and lawn perimeters without cluttering buildings
 */
export function buildCampusTrees(scene) {
  const treeGroup = new THREE.Group();
  treeGroup.name = 'campus_trees_group';

  // Helper to place a minimal architectural tree
  const placeTree = (x, z, scale = 1.2) => {
    const tG = new THREE.Group();
    tG.position.set(x, 0, z);
    tG.scale.setScalar(scale);

    // Wooden trunk
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.36, 3.6, 6), materials.treeTrunk);
    trunk.position.y = 1.8;
    trunk.castShadow = true;
    tG.add(trunk);

    // Clean geometric faceted canopy crown
    const canopyMat = (x + z) % 2 === 0 ? materials.treeCanopy1 : materials.treeCanopy2;
    const crown = new THREE.Mesh(new THREE.DodecahedronGeometry(2.2, 1), canopyMat);
    crown.position.y = 4.8;
    crown.castShadow = true;
    tG.add(crown);

    treeGroup.add(tG);
  };

  // Main Avenue West Tree Line (bordering Main Lawn)
  for (let z = -190; z < -25; z += 20) {
    placeTree(11.0, z, 1.2);
  }

  // Main Avenue East Tree Line (bordering Main Lawn)
  for (let z = -190; z < -25; z += 20) {
    placeTree(95.0, z, 1.2);
  }

  // Around Central Fountain Roundabout Perimeter
  const fountainRadius = 22;
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
    placeTree(Math.cos(a) * fountainRadius, Math.sin(a) * fountainRadius, 1.1);
  }

  // Perimeter trees
  for (let z = -140; z <= 180; z += 35) {
    placeTree(-160, z, 1.3);
    placeTree(165, z, 1.3);
  }

  scene.add(treeGroup);
  return treeGroup;
}

/**
 * 9. Master Architectural Building Mesh Builder (Spacious, Large, Clearly Legible)
 */
export function buildBuildingMesh(spec, isSelected = false, isHovered = false) {
  const { dimensions, color, accentColor, roofType, imageX, imageY } = spec;
  const { width = 44, depth = 20, height = 20, floors = 4 } = dimensions;

  const worldPos = mapToWorld(imageX, imageY);
  const buildingGroup = new THREE.Group();
  buildingGroup.name = `building_${spec.id}`;
  buildingGroup.position.set(worldPos.x, 0, worldPos.z);
  buildingGroup.rotation.y = spec.rotation || 0;

  // Metadata for raycaster picking
  buildingGroup.userData = {
    isBuilding: true,
    spec: spec,
    baseY: 0
  };

  // A. Entrance Steps / Foundation Plinth
  const plinthGeom = new THREE.BoxGeometry(width + 2.4, 0.8, depth + 2.4);
  const plinthMesh = new THREE.Mesh(plinthGeom, materials.facadeSlate);
  plinthMesh.position.y = 0.4;
  plinthMesh.receiveShadow = true;
  buildingGroup.add(plinthMesh);

  // B. Main Facade Block (Crisp White or Soft Cream for Map Highlights)
  const isHighlightedBlock = color === '#FFFBEB' || spec.id === 'loc_admission_register' || spec.id === 'loc_auditorium';
  const facadeMaterial = isSelected
    ? materials.highlightEmerald
    : isHighlightedBlock
    ? materials.facadeCream
    : materials.facadeWhite;

  const facadeGeom = new THREE.BoxGeometry(width, height, depth);
  const facadeMesh = new THREE.Mesh(facadeGeom, facadeMaterial);
  facadeMesh.position.y = height / 2 + 0.8;
  facadeMesh.castShadow = true;
  facadeMesh.receiveShadow = true;
  buildingGroup.add(facadeMesh);

  // C. Architectural Ribbon Windows on each floor
  const floorHeight = height / floors;
  for (let f = 0; f < floors; f++) {
    const bandY = 0.8 + (f + 0.5) * floorHeight;
    const windowMat = isSelected ? materials.windowSelected : materials.windowRibbon;

    // Front window strip
    const winFront = new THREE.Mesh(new THREE.BoxGeometry(width - 4.0, floorHeight * 0.48, 0.35), windowMat);
    winFront.position.set(0, bandY, depth / 2 + 0.08);
    buildingGroup.add(winFront);

    // Back window strip
    const winBack = new THREE.Mesh(new THREE.BoxGeometry(width - 4.0, floorHeight * 0.48, 0.35), windowMat);
    winBack.position.set(0, bandY, -depth / 2 - 0.08);
    buildingGroup.add(winBack);

    // Left window strip
    const winLeft = new THREE.Mesh(new THREE.BoxGeometry(0.35, floorHeight * 0.48, depth - 4.0), windowMat);
    winLeft.position.set(-width / 2 - 0.08, bandY, 0);
    buildingGroup.add(winLeft);

    // Right window strip
    const winRight = new THREE.Mesh(new THREE.BoxGeometry(0.35, floorHeight * 0.48, depth - 4.0), windowMat);
    winRight.position.set(width / 2 + 0.08, bandY, 0);
    buildingGroup.add(winRight);
  }

  // D. Rooftop Parapet & Recessed Concrete Terrace
  const roofY = height + 0.8;
  const parapetGeom = new THREE.BoxGeometry(width + 0.6, 0.8, depth + 0.6);
  const parapetMesh = new THREE.Mesh(parapetGeom, materials.roofParapet);
  parapetMesh.position.y = roofY + 0.4;
  parapetMesh.castShadow = true;
  buildingGroup.add(parapetMesh);

  const roofTerrace = new THREE.Mesh(new THREE.BoxGeometry(width - 1.8, 0.3, depth - 1.8), materials.roofConcrete);
  roofTerrace.position.y = roofY + 0.15;
  roofTerrace.receiveShadow = true;
  buildingGroup.add(roofTerrace);

  // E. Architectural Rooftop Elements based on roofType
  if (roofType === 'solar_terrace') {
    // Solar Panel Array Rows
    for (let r = -depth / 3; r <= depth / 3; r += 5.0) {
      const panelRow = new THREE.Mesh(new THREE.BoxGeometry(width - 8, 0.5, 3.2), materials.solarPanel);
      panelRow.rotation.x = 0.15;
      panelRow.position.set(0, roofY + 0.8, r);
      panelRow.castShadow = true;
      buildingGroup.add(panelRow);
    }
  } else if (roofType === 'skylight_atrium') {
    // Central University Library Glass Pyramid Skylight
    const skylightGeom = new THREE.ConeGeometry(6.5, 4.5, 4);
    const skylightMesh = new THREE.Mesh(skylightGeom, materials.fountainWater);
    skylightMesh.rotation.y = Math.PI / 4;
    skylightMesh.position.set(0, roofY + 2.5, 0);
    skylightMesh.castShadow = true;
    buildingGroup.add(skylightMesh);
  } else if (roofType === 'auditorium_flytower') {
    // Grand Auditorium Stage Fly Tower
    const towerGeom = new THREE.BoxGeometry(width * 0.42, 8.5, depth * 0.75);
    const towerMesh = new THREE.Mesh(towerGeom, materials.facadeSlate);
    towerMesh.position.set(width * 0.22, roofY + 4.25, 0);
    towerMesh.castShadow = true;
    buildingGroup.add(towerMesh);
  } else if (roofType === 'red_cross_roof') {
    // Medical Center Red Cross Roof Emblem
    const crossH = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.6, 1.8), materials.redCross);
    crossH.position.set(0, roofY + 0.4, 0);
    const crossV = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.6, 5.0), materials.redCross);
    crossV.position.set(0, roofY + 0.4, 0);
    buildingGroup.add(crossH, crossV);
  } else {
    // Standard Rooftop HVAC Chiller Unit
    const hvac = new THREE.Mesh(new THREE.BoxGeometry(5.0, 2.4, 3.5), materials.hvacMetal);
    hvac.position.set(-width / 4, roofY + 1.2, 0);
    hvac.castShadow = true;
    buildingGroup.add(hvac);
  }

  // F. Ground Floor Entrance Canopy & Glass Portico
  const canopyGeom = new THREE.BoxGeometry(12, 0.5, 5.0);
  const canopyMesh = new THREE.Mesh(canopyGeom, materials.facadeWhite);
  canopyMesh.position.set(0, 4.2, depth / 2 + 2.5);
  canopyMesh.castShadow = true;
  buildingGroup.add(canopyMesh);

  // Slender entrance support columns
  const colL = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 4.0, 8), materials.hvacMetal);
  colL.position.set(-5.0, 2.0, depth / 2 + 4.5);
  const colR = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 4.0, 8), materials.hvacMetal);
  colR.position.set(5.0, 2.0, depth / 2 + 4.5);
  buildingGroup.add(colL, colR);

  // G. 3D WebGL Billboard Sprite Floating Above Building
  const billboard = createBuildingBillboardSprite(spec.label || spec.name, spec.accentColor);
  if (billboard) {
    billboard.position.set(0, height + 9.5, 0);
    buildingGroup.add(billboard);
  }

  // Subtle elevation if selected
  if (isSelected) {
    buildingGroup.position.y = 1.5;
  }

  return buildingGroup;
}

/**
 * Helper: Create High-Resolution WebGL Billboard Sprite with Canvas Texture
 */
export function createBuildingBillboardSprite(label, accentColor = '#10B981') {
  if (typeof document === 'undefined') return null;
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Dark pill container
    ctx.fillStyle = 'rgba(11, 19, 43, 0.94)';
    ctx.beginPath();
    ctx.roundRect(8, 8, 496, 112, 56);
    ctx.fill();

    // Vibrant accent border
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 7;
    ctx.stroke();

    // Glowing indicator circle
    ctx.fillStyle = '#10B981';
    ctx.beginPath();
    ctx.arc(68, 64, 18, 0, Math.PI * 2);
    ctx.fill();

    // High-contrast clean uppercase text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 44px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, 108, 64);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    const spriteMat = new THREE.SpriteMaterial({
      map: texture,
      depthTest: false,
      transparent: true
    });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(36, 9.0, 1);
    sprite.userData = { isBillboard: true };
    return sprite;
  } catch (err) {
    return null;
  }
}

/**
 * Helper: Minimal Scaled University Bus
 */
function createMiniatureBus() {
  const busG = new THREE.Group();

  const body = new THREE.Mesh(new THREE.BoxGeometry(3.2, 3.0, 11.5), materials.busYellow);
  body.position.y = 1.7;
  body.castShadow = true;
  busG.add(body);

  // Dark glass window strip
  const glass = new THREE.Mesh(new THREE.BoxGeometry(3.25, 1.1, 10.2), materials.vehicleGlass);
  glass.position.y = 2.1;
  busG.add(glass);

  // Wheels
  const wheelMat = materials.vehicleGlass;
  for (let z of [-3.5, 3.5]) {
    for (let x of [-1.55, 1.55]) {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.4, 12), wheelMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(x, 0.55, z);
      busG.add(wheel);
    }
  }

  return busG;
}

/**
 * Helper: Minimal Scaled Passenger Car
 */
function createMiniatureCar(variant = 0) {
  const carG = new THREE.Group();
  const mat = variant === 0 ? materials.vehicleWhite : variant === 1 ? materials.vehicleSilver : materials.vehicleBlue;

  // Car lower body
  const lower = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.1, 4.8), mat);
  lower.position.y = 0.75;
  lower.castShadow = true;
  carG.add(lower);

  // Car cabin roof
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.9, 2.7), materials.vehicleGlass);
  cabin.position.set(0, 1.45, -0.2);
  carG.add(cabin);

  return carG;
}
