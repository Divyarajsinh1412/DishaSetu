import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Minimal pure Node.js PNG encoder
function crc32(buf) {
  let table = crc32.table;
  if (!table) {
    table = crc32.table = new Int32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let k = 0; k < 8; k++) {
        c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
      }
      table[i] = c;
    }
  }
  let c = -1;
  for (let i = 0; i < buf.length; i++) {
    c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ -1) >>> 0;
}

function createChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  const crcPayload = Buffer.concat([typeBuf, data]);
  crcBuf.writeUInt32BE(crc32(crcPayload), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function writePNG(width, height, pixelShader) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type: RGB
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace
  const ihdrChunk = createChunk('IHDR', ihdr);

  // Raw Scanlines: (1 byte filter 0 + width * 3 bytes RGB) per row
  const rowSize = 1 + width * 3;
  const rawData = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter None
    const v = y / (height - 1); // 0 (top/sky) to 1 (bottom/ground)

    for (let x = 0; x < width; x++) {
      const u = x / (width - 1); // 0 to 1 (yaw 360)
      const [r, g, b] = pixelShader(u, v, x, y, width, height);
      const pxOffset = rowOffset + 1 + x * 3;
      rawData[pxOffset] = Math.max(0, Math.min(255, Math.round(r)));
      rawData[pxOffset + 1] = Math.max(0, Math.min(255, Math.round(g)));
      rawData[pxOffset + 2] = Math.max(0, Math.min(255, Math.round(b)));
    }
  }

  const compressed = zlib.deflateSync(rawData, { level: 6 });
  const idatChunk = createChunk('IDAT', compressed);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const outDir = path.join(__dirname, '..', '..', 'web', 'public', 'panoramas');
const thumbsDir = path.join(outDir, 'thumbs');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
if (!fs.existsSync(thumbsDir)) fs.mkdirSync(thumbsDir, { recursive: true });

console.log('Generating realistic 360° Equirectangular Panorama Textures for Presidency University...');

// 1. Central Campus Aerial Panorama Shader
function centralCampusShader(u, v) {
  // v = 0 is zenith (sky), v = 0.5 is horizon, v = 1 is nadir (ground)
  if (v < 0.46) {
    // Atmospheric aerial sky with sun glow
    const skyT = v / 0.46;
    const r = 40 + skyT * 120;
    const g = 100 + skyT * 120;
    const b = 210 + skyT * 40;
    // Cloud hints
    const cloud = Math.sin(u * 18) * Math.cos(v * 30);
    return [r + cloud * 15, g + cloud * 15, b + cloud * 15];
  } else if (v < 0.50) {
    // Distant horizon mountain/city haze (Bengaluru Yelahanka ridge)
    const hT = (v - 0.46) / 0.04;
    return [160 - hT * 40, 180 - hT * 30, 200 - hT * 60];
  } else {
    // Campus Ground & Architecture
    const gT = (v - 0.50) / 0.50; // 0 to 1
    // Base green landscape & lawns
    let r = 38 + gT * 20;
    let g = 95 - gT * 25;
    let b = 45;

    // Academic Block D/E/F footprint contours
    if (u > 0.35 && u < 0.55 && v > 0.55 && v < 0.78) {
      // Modern white/brick architectural facades of D & E block
      const brick = ((Math.floor(u * 80) + Math.floor(v * 50)) % 2 === 0) ? 220 : 190;
      r = brick; g = brick * 0.9; b = brick * 0.8;
    }
    // Central Fountain Plaza (Circular pool)
    const fdx = (u - 0.50) * 10;
    const fdy = (v - 0.72) * 8;
    if (fdx * fdx + fdy * fdy < 0.08) {
      // Shimmering aquatic blue water & fountain spray
      r = 20; g = 140; b = 220;
    }
    // Main Walking Avenue Paved Stone Walkway
    const avDist = Math.abs((u - 0.50) - (v - 0.50) * 0.15);
    if (avDist < 0.04 && v > 0.52) {
      // Terracotta & grey stone pavers
      r = 160 + Math.sin(u * 120) * 15;
      g = 150;
      b = 140;
    }
    return [r, g, b];
  }
}

// 2. Main Gate Aerial Shader
function mainGateShader(u, v) {
  if (v < 0.46) {
    const skyT = v / 0.46;
    return [30 + skyT * 110, 90 + skyT * 120, 220 + skyT * 30];
  } else if (v < 0.50) {
    return [170, 185, 205];
  } else {
    const gT = (v - 0.50) / 0.50;
    let r = 45, g = 85, b = 40;
    // Entrance Portal Arch at u=0.5
    if (u > 0.44 && u < 0.56 && v > 0.58 && v < 0.70) {
      // Iconic Presidency Entrance Arch & Gate pillars
      r = 210; g = 200; b = 185;
    }
    // Itgalpur Main Road Asphalt
    if (v > 0.78) {
      r = 65; g = 68; b = 72; // Dark tarmac road
    }
    // Two-Wheeler Parking Lot at u=0.3
    if (u > 0.22 && u < 0.38 && v > 0.60 && v < 0.76) {
      r = 110; g = 105; b = 95; // Paver tiles
    }
    return [r, g, b];
  }
}

// 3. Academic Quadrangle Shader
function academicQuadShader(u, v) {
  if (v < 0.46) {
    const skyT = v / 0.46;
    return [40 + skyT * 100, 110 + skyT * 110, 215 + skyT * 40];
  } else if (v < 0.50) {
    return [160, 175, 195];
  } else {
    let r = 40, g = 90, b = 45;
    // J & L Blocks (School of Management & Law School)
    if ((u > 0.15 && u < 0.38) || (u > 0.62 && u < 0.85)) {
      if (v > 0.54 && v < 0.82) {
        r = 195; g = 185; b = 175; // Classrooms & Moot Court hall
      }
    }
    // Central Quad Green Garden
    if (u > 0.40 && u < 0.60 && v > 0.58 && v < 0.80) {
      r = 28; g = 115; b = 38; // Manicured courtyard garden
    }
    return [r, g, b];
  }
}

// 4. Sports Complex Shader
function sportsComplexShader(u, v) {
  if (v < 0.46) {
    const skyT = v / 0.46;
    return [45 + skyT * 105, 120 + skyT * 115, 230 + skyT * 25];
  } else if (v < 0.50) {
    return [150, 180, 190];
  } else {
    let r = 50, g = 110, b = 40;
    // Basketball court synthetic turf (Royal blue & terracotta)
    if (u > 0.40 && u < 0.58 && v > 0.62 && v < 0.82) {
      r = 30; g = 90; b = 180;
    }
    // Cricket nets enclosure
    if (u > 0.22 && u < 0.34 && v > 0.60 && v < 0.74) {
      r = 85; g = 125; b = 70;
    }
    return [r, g, b];
  }
}

// 5. Cafeteria Hub Shader
function cafeteriaHubShader(u, v) {
  if (v < 0.46) {
    const skyT = v / 0.46;
    return [40 + skyT * 110, 105 + skyT * 115, 225 + skyT * 30];
  } else if (v < 0.50) {
    return [165, 180, 200];
  } else {
    let r = 45, g = 95, b = 40;
    // Dining Terrace Pavilion & Canopy
    if (u > 0.36 && u < 0.64 && v > 0.56 && v < 0.82) {
      r = 205; g = 160; b = 120; // Warm terrace paving & food court stalls
    }
    return [r, g, b];
  }
}

const scenes = [
  { name: 'aerial_central_campus.png', shader: centralCampusShader, thumb: 'central_campus.png' },
  { name: 'aerial_main_gate.png', shader: mainGateShader, thumb: 'main_gate.png' },
  { name: 'aerial_academic_quad.png', shader: academicQuadShader, thumb: 'academic_quad.png' },
  { name: 'aerial_sports_complex.png', shader: sportsComplexShader, thumb: 'sports_complex.png' },
  { name: 'aerial_cafeteria_hub.png', shader: cafeteriaHubShader, thumb: 'cafeteria_hub.png' }
];

for (const sc of scenes) {
  // Generate high-res 2048x1024 equirectangular panorama
  const panoPath = path.join(outDir, sc.name);
  console.log(`  Writing 2048x1024 panorama: ${sc.name}...`);
  const panoBuffer = writePNG(2048, 1024, sc.shader);
  fs.writeFileSync(panoPath, panoBuffer);

  // Generate thumbnail 320x160
  const thumbPath = path.join(thumbsDir, sc.thumb);
  const thumbBuffer = writePNG(320, 160, sc.shader);
  fs.writeFileSync(thumbPath, thumbBuffer);
}

console.log('Successfully generated all 360° Equirectangular Panorama assets in web/public/panoramas/!');
