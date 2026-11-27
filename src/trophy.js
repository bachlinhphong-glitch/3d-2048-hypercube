import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { soundManager } from './sound.js';
import { textureManager } from './textureManager.js';
import { t } from './i18n.js';

/**
 * 3D 2048 Masterpiece Trophies & Interactive Studio Viewer
 * 1. Master of 2048: Sculpted Sterling Silver & 24K Vermeil Gold Imperial Hypercube Chalice
 * 2. Core Conqueror: Obsidian, Titanium & Plasma Singularity Containment Reliquary
 * 3. Tilepedia 3D Exhibit: Illuminated Museum Pedestal showcasing all 16 3D Blocks
 */

// =============================================================================
// STUDIO HDRI ENVIRONMENT MAP GENERATOR
// =============================================================================
function createStudioEnvMap(renderer, type = 'c1') {
  if (!renderer) return null;
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  if (type === 'boss') {
    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, '#07030a');
    grad.addColorStop(0.28, '#1a0a18');
    grad.addColorStop(0.5, '#3b0b19');
    grad.addColorStop(0.72, '#140610');
    grad.addColorStop(1, '#040206');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 256);

    // Crisp white-rose studio strip for sharp metallic edge reflections on dark titanium
    const strip = ctx.createLinearGradient(180, 12, 330, 120);
    strip.addColorStop(0, 'rgba(255,255,255,0)');
    strip.addColorStop(0.5, 'rgba(255,235,238,0.92)');
    strip.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = strip;
    ctx.fillRect(140, 16, 232, 34);

    const key = ctx.createRadialGradient(385, 85, 6, 385, 85, 145);
    key.addColorStop(0, 'rgba(255, 86, 86, 0.95)');
    key.addColorStop(0.35, 'rgba(225, 29, 72, 0.55)');
    key.addColorStop(0.75, 'rgba(136, 19, 55, 0.14)');
    key.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = key;
    ctx.fillRect(210, 0, 302, 210);

    const rim = ctx.createRadialGradient(110, 95, 6, 110, 95, 135);
    rim.addColorStop(0, 'rgba(168, 85, 247, 0.9)');
    rim.addColorStop(0.45, 'rgba(109, 40, 217, 0.35)');
    rim.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = rim;
    ctx.fillRect(0, 0, 240, 210);
  } else if (type === 'tilepedia') {
    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, '#07111f');
    grad.addColorStop(0.45, '#132642');
    grad.addColorStop(0.55, '#0e1d36');
    grad.addColorStop(1, '#040914');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 256);

    const overhead = ctx.createRadialGradient(256, 36, 8, 256, 36, 175);
    overhead.addColorStop(0, 'rgba(255, 255, 255, 0.98)');
    overhead.addColorStop(0.32, 'rgba(186, 230, 253, 0.65)');
    overhead.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = overhead;
    ctx.fillRect(0, 0, 512, 180);

    const sideWarm = ctx.createRadialGradient(410, 105, 6, 410, 105, 120);
    sideWarm.addColorStop(0, 'rgba(253, 224, 71, 0.72)');
    sideWarm.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = sideWarm;
    ctx.fillRect(280, 20, 232, 190);
  } else {
    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, '#070d1f');
    grad.addColorStop(0.28, '#162d5c');
    grad.addColorStop(0.48, '#3b5fa8');
    grad.addColorStop(0.56, '#213c75');
    grad.addColorStop(0.75, '#0e1b38');
    grad.addColorStop(1, '#040710');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 256);

    const topBox = ctx.createRadialGradient(256, 28, 6, 256, 28, 185);
    topBox.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
    topBox.addColorStop(0.32, 'rgba(241, 248, 255, 0.82)');
    topBox.addColorStop(0.7, 'rgba(186, 220, 255, 0.25)');
    topBox.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = topBox;
    ctx.fillRect(0, 0, 512, 185);

    // High-contrast studio reflection horizon strips for mirror sterling silver reflections
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.fillRect(68, 52, 28, 128);
    ctx.fillRect(416, 52, 28, 128);
    ctx.fillStyle = 'rgba(226, 240, 255, 0.55)';
    ctx.fillRect(190, 96, 132, 34);

    const goldKey = ctx.createRadialGradient(360, 100, 8, 360, 100, 130);
    goldKey.addColorStop(0, 'rgba(255, 222, 125, 0.9)');
    goldKey.addColorStop(0.4, 'rgba(245, 180, 50, 0.42)');
    goldKey.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = goldKey;
    ctx.fillRect(220, 15, 280, 185);

    const azureRim = ctx.createRadialGradient(130, 95, 8, 130, 95, 125);
    azureRim.addColorStop(0, 'rgba(56, 189, 248, 0.85)');
    azureRim.addColorStop(0.45, 'rgba(14, 165, 233, 0.28)');
    azureRim.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = azureRim;
    ctx.fillRect(10, 15, 240, 185);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const envMap = pmremGenerator.fromEquirectangular(texture).texture;
  pmremGenerator.dispose();
  texture.dispose();
  return envMap;
}

// =============================================================================
// PROCEDURAL TEXTURE HELPERS (NO BLOCKY PIXELS, NO HARD CUTOFFS)
// =============================================================================
function createSoftParticleTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  const rad = ctx.createRadialGradient(32, 32, 0, 32, 32, 30);
  rad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  rad.addColorStop(0.3, 'rgba(255, 248, 225, 0.8)');
  rad.addColorStop(0.65, 'rgba(255, 230, 170, 0.25)');
  rad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = rad;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(canvas);
}

function createSparkleTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  const rad = ctx.createRadialGradient(64, 64, 0, 64, 64, 58);
  rad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  rad.addColorStop(0.16, 'rgba(255, 238, 180, 0.88)');
  rad.addColorStop(0.42, 'rgba(255, 215, 0, 0.28)');
  rad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = rad;
  ctx.fillRect(0, 0, 128, 128);

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(64, 8); ctx.lineTo(64, 120);
  ctx.moveTo(8, 64); ctx.lineTo(120, 64);
  ctx.stroke();

  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(26, 26); ctx.lineTo(102, 102);
  ctx.moveTo(102, 26); ctx.lineTo(26, 102);
  ctx.stroke();

  return new THREE.CanvasTexture(canvas);
}

function createGodRayTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  const vGrad = ctx.createLinearGradient(0, 0, 0, 256);
  vGrad.addColorStop(0, 'rgba(255, 240, 160, 0)');
  vGrad.addColorStop(0.28, 'rgba(255, 235, 145, 0.45)');
  vGrad.addColorStop(0.65, 'rgba(255, 215, 70, 0.85)');
  vGrad.addColorStop(1, 'rgba(255, 215, 70, 0)');
  ctx.fillStyle = vGrad;
  ctx.fillRect(0, 0, 128, 256);
  return new THREE.CanvasTexture(canvas);
}

function createAccretionTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  const cx = 256;
  const cy = 256;

  ctx.clearRect(0, 0, 512, 512);
  const ringGrad = ctx.createRadialGradient(cx, cy, 85, cx, cy, 248);
  ringGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
  ringGrad.addColorStop(0.16, 'rgba(255, 247, 237, 0.95)');
  ringGrad.addColorStop(0.32, 'rgba(251, 146, 60, 0.85)');
  ringGrad.addColorStop(0.55, 'rgba(239, 68, 68, 0.65)');
  ringGrad.addColorStop(0.78, 'rgba(168, 85, 247, 0.32)');
  ringGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = ringGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, 248, 0, Math.PI * 2);
  ctx.fill();

  // Swirling relativistic plasma arcs
  for (let i = 0; i < 18; i++) {
    const startA = (i / 18) * Math.PI * 2;
    const r = 128 + (i % 4) * 24;
    ctx.strokeStyle = i % 2 === 0 ? 'rgba(254, 240, 138, 0.65)' : 'rgba(248, 113, 113, 0.55)';
    ctx.lineWidth = 3 + (i % 3);
    ctx.beginPath();
    ctx.arc(cx, cy, r, startA, startA + 0.9);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createMandalaTexture(type = 'c1') {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  const cx = 256;
  const cy = 256;

  ctx.clearRect(0, 0, 512, 512);

  if (type === 'boss') {
    ctx.strokeStyle = '#fb7185';
    ctx.shadowColor = '#e11d48';
    ctx.shadowBlur = 12;

    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(cx, cy, 222, 0, Math.PI * 2);
    ctx.stroke();

    ctx.lineWidth = 1.8;
    ctx.setLineDash([10, 7]);
    ctx.beginPath();
    ctx.arc(cx, cy, 198, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.lineWidth = 2.5;
    for (let i = 0; i < 8; i++) {
      const a1 = (i / 8) * Math.PI * 2;
      const a2 = ((i + 3) / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a1) * 195, cy + Math.sin(a1) * 195);
      ctx.lineTo(cx + Math.cos(a2) * 195, cy + Math.sin(a2) * 195);
      ctx.stroke();
    }

    ctx.strokeStyle = '#a855f7';
    ctx.beginPath();
    ctx.arc(cx, cy, 88, 0, Math.PI * 2);
    ctx.stroke();
  } else if (type === 'tilepedia') {
    ctx.strokeStyle = '#ffffff';
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 10;

    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, 215, 0, Math.PI * 2);
    ctx.stroke();

    ctx.lineWidth = 1.5;
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.arc(cx, cy, 185, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * 168, cy + Math.sin(a) * 168);
      ctx.lineTo(cx + Math.cos(a) * 204, cy + Math.sin(a) * 204);
      ctx.stroke();
    }
  } else {
    ctx.strokeStyle = '#ffd700';
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 12;

    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(cx, cy, 226, 0, Math.PI * 2);
    ctx.stroke();

    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(cx, cy, 206, 0, Math.PI * 2);
    ctx.stroke();

    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * 172, cy + Math.sin(a) * 172);
      ctx.lineTo(cx + Math.cos(a) * 206, cy + Math.sin(a) * 206);
      ctx.stroke();
    }

    for (let pass = 0; pass < 2; pass++) {
      const offset = pass * (Math.PI / 8);
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2 + offset;
        const x = cx + Math.cos(a) * 168;
        const y = cy + Math.sin(a) * 168;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
    }
  }

  return new THREE.CanvasTexture(canvas);
}

function createPlaqueTexture({ title, subtitle, gradStops, borderColor, innerBorderColor, titleColor, titleGlow, subColor }) {
  const plaqueCanvas = document.createElement('canvas');
  plaqueCanvas.width = 1024;
  plaqueCanvas.height = 280;
  const pCtx = plaqueCanvas.getContext('2d');

  const pGrad = pCtx.createLinearGradient(0, 0, 1024, 280);
  pGrad.addColorStop(0, gradStops[0]);
  pGrad.addColorStop(0.5, gradStops[1]);
  pGrad.addColorStop(1, gradStops[2]);
  pCtx.fillStyle = pGrad;
  pCtx.fillRect(0, 0, 1024, 280);

  pCtx.strokeStyle = borderColor;
  pCtx.lineWidth = 10;
  pCtx.strokeRect(10, 10, 1004, 260);
  pCtx.strokeStyle = innerBorderColor;
  pCtx.lineWidth = 3;
  pCtx.strokeRect(24, 24, 976, 232);

  // Subtle corner rivets
  [
    [42, 42], [982, 42], [42, 238], [982, 238]
  ].forEach(([rx, ry]) => {
    pCtx.fillStyle = borderColor;
    pCtx.beginPath();
    pCtx.arc(rx, ry, 7, 0, Math.PI * 2);
    pCtx.fill();
  });

  pCtx.textAlign = 'center';
  pCtx.textBaseline = 'middle';

  pCtx.font = '800 58px "Be Vietnam Pro", "Segoe UI", Arial, sans-serif';
  pCtx.fillStyle = titleColor;
  pCtx.shadowColor = titleGlow;
  pCtx.shadowBlur = 20;
  pCtx.fillText(title, 512, 98, 920);

  pCtx.font = '700 34px "Be Vietnam Pro", "Segoe UI", Arial, sans-serif';
  pCtx.fillStyle = subColor;
  pCtx.shadowColor = titleGlow;
  pCtx.shadowBlur = 10;
  pCtx.fillText(subtitle, 512, 190, 920);

  const tex = new THREE.CanvasTexture(plaqueCanvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

// Helper for crisp 2048 front medallion & crown face textures
function create2048EmblemTexture(isGold = true) {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 256, 256);
  if (isGold) {
    g.addColorStop(0, '#fffbeb');
    g.addColorStop(0.45, '#fde047');
    g.addColorStop(1, '#d97706');
  } else {
    g.addColorStop(0, '#1e293b');
    g.addColorStop(0.5, '#0f172a');
    g.addColorStop(1, '#020617');
  }
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);

  ctx.strokeStyle = isGold ? '#f59e0b' : '#f87171';
  ctx.lineWidth = 14;
  ctx.strokeRect(10, 10, 236, 236);
  ctx.strokeStyle = 'rgba(255,255,255,0.65)';
  ctx.lineWidth = 3;
  ctx.strokeRect(24, 24, 208, 208);

  ctx.fillStyle = isGold ? '#0f172a' : '#fef2f2';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '900 84px "Be Vietnam Pro", "Segoe UI", Arial, sans-serif';
  ctx.shadowColor = isGold ? 'rgba(255, 255, 255, 0.55)' : '#ef4444';
  ctx.shadowBlur = 14;
  ctx.fillText('2048', 128, 132);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}


// =============================================================================
// 1. MASTER OF 2048 TROPHY (Sculpted Sterling Silver & 24K Gold Hypercube Chalice)
// =============================================================================
export function createChampionsTrophyMesh(isUnlocked = true) {
  const trophyGroup = new THREE.Group();
  trophyGroup.name = 'trophy_3d_c1_champions';

  const plaqueTex = createPlaqueTexture({
    title: isUnlocked
      ? (t('trophy_plaque_c1_title_unlocked') || '★ MASTER OF 2048 ★')
      : (t('trophy_plaque_c1_title_locked') || '🔒 CÚP BẬC THẦY 2048'),
    subtitle: isUnlocked
      ? (t('trophy_plaque_c1_sub_unlocked') || 'HOÀN THÀNH 7/7 THỬ THÁCH')
      : (t('trophy_plaque_c1_sub_locked') || 'HOÀN THÀNH 7 NHIỆM VỤ ĐỂ MỞ'),
    gradStops: isUnlocked ? ['#07122e', '#17316e', '#07122e'] : ['#0f172a', '#1e293b', '#0f172a'],
    borderColor: isUnlocked ? '#ffd700' : '#475569',
    innerBorderColor: isUnlocked ? '#e0f2fe' : '#334155',
    titleColor: isUnlocked ? '#ffffff' : '#94a3b8',
    titleGlow: isUnlocked ? '#38bdf8' : '#000000',
    subColor: isUnlocked ? '#fde047' : '#64748b'
  });

  const cubeTex = create2048EmblemTexture(true);

  const silverMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    roughness: isUnlocked ? 0.07 : 0.24,
    metalness: 0.94,
    clearcoat: 1.0,
    clearcoatRoughness: 0.04,
    reflectivity: 1.0,
    emissive: 0xdbeafe,
    emissiveIntensity: isUnlocked ? 0.22 : 0.08
  });

  const goldTrimMat = new THREE.MeshPhysicalMaterial({
    color: 0xffd700,
    roughness: isUnlocked ? 0.08 : 0.22,
    metalness: 0.96,
    clearcoat: 1.0,
    clearcoatRoughness: 0.04,
    reflectivity: 1.0,
    emissive: 0xb45309,
    emissiveIntensity: isUnlocked ? 0.34 : 0.12
  });

  const vermeilInnerMat = new THREE.MeshPhysicalMaterial({
    color: 0xfde047,
    roughness: 0.14,
    metalness: 0.92,
    clearcoat: 0.9,
    emissive: 0xd97706,
    emissiveIntensity: isUnlocked ? 0.45 : 0.16,
    side: THREE.BackSide
  });

  const obsidianMat = new THREE.MeshPhysicalMaterial({
    color: 0x070b16,
    roughness: 0.1,
    metalness: 0.55,
    clearcoat: 1.0,
    clearcoatRoughness: 0.04,
    emissive: 0x0f172a,
    emissiveIntensity: 0.18
  });

  const gemMat = new THREE.MeshPhysicalMaterial({
    color: 0x67e8f9,
    roughness: 0.02,
    metalness: 0.1,
    transmission: 0.78,
    thickness: 0.8,
    ior: 2.4,
    clearcoat: 1.0,
    emissive: 0x0284c7,
    emissiveIntensity: isUnlocked ? 1.15 : 0.35,
    transparent: true,
    opacity: 0.95
  });

  const sapphireMat = new THREE.MeshPhysicalMaterial({
    color: 0x2563eb,
    roughness: 0.04,
    metalness: 0.2,
    transmission: 0.65,
    ior: 1.77,
    clearcoat: 1.0,
    emissive: 0x1d4ed8,
    emissiveIntensity: isUnlocked ? 0.95 : 0.3,
    transparent: true
  });

  const plaqueMat = new THREE.MeshBasicMaterial({ map: plaqueTex, transparent: true });
  const crownCubeMat = new THREE.MeshPhysicalMaterial({
    map: cubeTex,
    roughness: 0.1,
    metalness: 0.62,
    clearcoat: 1.0,
    clearcoatRoughness: 0.04,
    emissive: 0xf59e0b,
    emissiveIntensity: isUnlocked ? 0.35 : 0.1
  });

  // --- Tiered Sculpted Obsidian Marble Plinth (LatheGeometry) ---
  const plinthPoints = [
    new THREE.Vector2(0.0, 0.0),
    new THREE.Vector2(2.02, 0.0),
    new THREE.Vector2(2.02, 0.18),
    new THREE.Vector2(1.86, 0.34),
    new THREE.Vector2(1.78, 0.44),
    new THREE.Vector2(1.66, 0.52),
    new THREE.Vector2(1.52, 0.96),
    new THREE.Vector2(1.36, 1.08),
    new THREE.Vector2(0.0, 1.08)
  ];
  const plinthGeo = new THREE.LatheGeometry(plinthPoints, 64);
  trophyGroup.add(new THREE.Mesh(plinthGeo, obsidianMat));

  // Bevelled 24K Gold Trim Moulding Rings
  const ringData = [
    [1.86, 0.045, 0.34],
    [1.66, 0.042, 0.52],
    [1.36, 0.055, 1.09]
  ];
  ringData.forEach(([r, tRadius, y]) => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(r, tRadius, 16, 64), goldTrimMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = y;
    trophyGroup.add(ring);
  });

  // 4 Sculpted Golden Corner Anchor Brackets
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const foot = new THREE.Mesh(new RoundedBoxGeometry(0.28, 0.24, 0.36, 3, 0.06), goldTrimMat);
    foot.position.set(Math.cos(a) * 1.88, 0.13, Math.sin(a) * 1.88);
    foot.rotation.y = -a + Math.PI / 2;
    trophyGroup.add(foot);
  }

  // Front Curved Commemorative Plaque
  const plaqueGeo = new THREE.CylinderGeometry(1.56, 1.68, 0.44, 48, 1, true, -Math.PI * 0.3, Math.PI * 0.6);
  const plaqueMesh = new THREE.Mesh(plaqueGeo, plaqueMat);
  plaqueMesh.position.y = 0.76;
  plaqueMesh.rotation.y = Math.PI;
  trophyGroup.add(plaqueMesh);

  // Golden Celestial Floor Mandala
  const mandalaTex = createMandalaTexture('c1');
  const mandalaMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(5.1, 5.1),
    new THREE.MeshBasicMaterial({
      map: mandalaTex,
      transparent: true,
      opacity: isUnlocked ? 0.78 : 0.32,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  );
  mandalaMesh.rotation.x = -Math.PI / 2;
  mandalaMesh.position.y = 0.02;
  mandalaMesh.name = 'trophy_mandala';
  trophyGroup.add(mandalaMesh);

  // --- Fluted Sanctuary Colonnade & Spinning Cyan Prism Gem ---
  const lowerCollarPts = [
    new THREE.Vector2(0.0, 1.08),
    new THREE.Vector2(1.06, 1.08),
    new THREE.Vector2(0.82, 1.28),
    new THREE.Vector2(0.62, 1.48),
    new THREE.Vector2(0.0, 1.48)
  ];
  trophyGroup.add(new THREE.Mesh(new THREE.LatheGeometry(lowerCollarPts, 48), silverMat));

  const gemMesh = new THREE.Mesh(new THREE.OctahedronGeometry(0.4, 0), gemMat);
  gemMesh.position.y = 1.98;
  gemMesh.name = 'trophy_gem';
  trophyGroup.add(gemMesh);

  const gemLight = new THREE.PointLight(0x38bdf8, isUnlocked ? 1.8 : 0.55, 3.8);
  gemLight.position.y = 1.98;
  trophyGroup.add(gemLight);

  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const px = Math.cos(a) * 0.52;
    const pz = Math.sin(a) * 0.52;
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.068, 0.94, 16), goldTrimMat);
    pillar.position.set(px, 1.95, pz);
    trophyGroup.add(pillar);

    const nodeTop = new THREE.Mesh(new THREE.SphereGeometry(0.072, 12, 12), goldTrimMat);
    nodeTop.position.set(px, 2.42, pz);
    trophyGroup.add(nodeTop);

    const nodeBot = new THREE.Mesh(new THREE.SphereGeometry(0.082, 12, 12), goldTrimMat);
    nodeBot.position.set(px, 1.50, pz);
    trophyGroup.add(nodeBot);
  }

  // --- Classical Sculpted S-Curve Chalice Bowl (LatheGeometry, Zero Seams!) ---
  const bowlOuterPts = [
    new THREE.Vector2(0.0, 2.42),
    new THREE.Vector2(0.66, 2.42),
    new THREE.Vector2(0.48, 2.66),
    new THREE.Vector2(0.56, 2.88),
    new THREE.Vector2(1.06, 3.18),
    new THREE.Vector2(1.30, 3.55),
    new THREE.Vector2(1.44, 4.02),
    new THREE.Vector2(1.56, 4.55),
    new THREE.Vector2(1.62, 4.66),
    new THREE.Vector2(1.54, 4.68)
  ];
  trophyGroup.add(new THREE.Mesh(new THREE.LatheGeometry(bowlOuterPts, 64), silverMat));

  // Inner 24K Vermeil Gold Lining
  const bowlInnerPts = [
    new THREE.Vector2(0.0, 3.22),
    new THREE.Vector2(0.88, 3.30),
    new THREE.Vector2(1.18, 3.62),
    new THREE.Vector2(1.36, 4.08),
    new THREE.Vector2(1.49, 4.65)
  ];
  trophyGroup.add(new THREE.Mesh(new THREE.LatheGeometry(bowlInnerPts, 64), vermeilInnerMat));

  // Gold Waist Ring & Beaded Crown Rim
  const waistRing = new THREE.Mesh(new THREE.TorusGeometry(1.18, 0.048, 16, 64), goldTrimMat);
  waistRing.rotation.x = Math.PI / 2;
  waistRing.position.y = 3.36;
  trophyGroup.add(waistRing);

  const bowlRim = new THREE.Mesh(new THREE.TorusGeometry(1.58, 0.095, 20, 64), goldTrimMat);
  bowlRim.rotation.x = Math.PI / 2;
  bowlRim.position.y = 4.66;
  trophyGroup.add(bowlRim);

  // Front Sculpted Golden Wreath & Medallion Badge on Chalice Belly
  const medallionGroup = new THREE.Group();
  medallionGroup.position.set(0, 3.92, 1.43);
  medallionGroup.rotation.x = -0.18;
  const medalRing = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.04, 14, 36), goldTrimMat);
  medallionGroup.add(medalRing);
  const medalDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.04, 32), new THREE.MeshPhysicalMaterial({
    map: cubeTex, roughness: 0.14, metalness: 0.4, clearcoat: 1.0
  }));
  medalDisc.rotation.x = Math.PI / 2;
  medallionGroup.add(medalDisc);
  trophyGroup.add(medallionGroup);

  // 8 Rim Jewel Studs (Sapphire + Diamond Pavé)
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2 + Math.PI / 8;
    const gem = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.068, 0),
      i % 2 === 0 ? gemMat : sapphireMat
    );
    gem.position.set(Math.cos(angle) * 1.58, 4.74, Math.sin(angle) * 1.58);
    trophyGroup.add(gem);

    const bezel = new THREE.Mesh(new THREE.CylinderGeometry(0.088, 0.072, 0.05, 16), goldTrimMat);
    bezel.position.set(Math.cos(angle) * 1.58, 4.69, Math.sin(angle) * 1.58);
    trophyGroup.add(bezel);
  }

  // --- Graceful Sculpted "Tai Voi" Ribbon Handles with Scroll Finials ---
  const buildElegantHandle = (mirrorX) => {
    const s = mirrorX ? -1 : 1;
    const hGroup = new THREE.Group();
    const pts = [
      new THREE.Vector3(s * 1.18, 3.30, 0),
      new THREE.Vector3(s * 2.08, 3.46, 0),
      new THREE.Vector3(s * 2.52, 4.18, 0),
      new THREE.Vector3(s * 2.28, 4.88, 0),
      new THREE.Vector3(s * 1.62, 4.66, 0)
    ];
    const curve = new THREE.CatmullRomCurve3(pts);
    const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 56, 0.092, 18, false), silverMat);
    hGroup.add(tube);

    // Lower golden attachment ferrule cuff
    const lowCollar = new THREE.Mesh(new THREE.TorusGeometry(0.115, 0.032, 12, 24), goldTrimMat);
    lowCollar.position.set(s * 1.24, 3.32, 0);
    lowCollar.rotation.y = Math.PI / 2;
    hGroup.add(lowCollar);

    // Sculpted Top Scroll Finial Curl + Diamond Crown Bead
    const scrollCurl = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.045, 14, 28, Math.PI * 1.35), goldTrimMat);
    scrollCurl.position.set(s * 2.18, 4.88, 0);
    if (mirrorX) scrollCurl.rotation.y = Math.PI;
    scrollCurl.rotation.z = 0.25;
    hGroup.add(scrollCurl);

    const finialGem = new THREE.Mesh(new THREE.OctahedronGeometry(0.085, 0), gemMat);
    finialGem.position.set(s * 2.28, 4.98, 0);
    hGroup.add(finialGem);

    return hGroup;
  };
  trophyGroup.add(buildElegantHandle(false));
  trophyGroup.add(buildElegantHandle(true));

  // --- Floating "2048" Hypercube Tesseract Crown ---
  const crownGroup = new THREE.Group();
  crownGroup.position.y = 5.22;
  crownGroup.name = 'trophy_crown_group';

  const crownCube = new THREE.Mesh(new RoundedBoxGeometry(0.76, 0.76, 0.76, 4, 0.08), crownCubeMat);
  crownCube.name = 'trophy_crown_cube';
  crownGroup.add(crownCube);

  // Nested 4D Tesseract Wireframe Cage + Golden Corner Nodes
  const cageSize = 0.96;
  const cageEdges = new THREE.EdgesGeometry(new THREE.BoxGeometry(cageSize, cageSize, cageSize));
  const cageLine = new THREE.LineSegments(cageEdges, new THREE.LineBasicMaterial({ color: 0xfde047, transparent: true, opacity: 0.9 }));
  crownGroup.add(cageLine);
  const half = cageSize / 2;
  for (const sx of [-1, 1]) {
    for (const sy of [-1, 1]) {
      for (const sz of [-1, 1]) {
        const corner = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 10), goldTrimMat);
        corner.position.set(sx * half, sy * half, sz * half);
        crownGroup.add(corner);
      }
    }
  }

  // Radiant Crown Diadem Ring hovering above Cube
  const crownHalo = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.032, 12, 32), goldTrimMat);
  crownHalo.rotation.x = Math.PI / 2;
  crownHalo.position.y = 0.62;
  crownGroup.add(crownHalo);

  trophyGroup.add(crownGroup);

  const chaliceLight = new THREE.PointLight(0xffb703, isUnlocked ? 2.2 : 0.7, 5.0);
  chaliceLight.position.y = 4.25;
  trophyGroup.add(chaliceLight);

  // Subtle Wide Orbital Rings Framing Crown (Never clipping the bowl belly)
  const ring1 = new THREE.Mesh(
    new THREE.TorusGeometry(2.05, 0.018, 14, 80),
    new THREE.MeshBasicMaterial({ color: 0xfde047, transparent: true, opacity: isUnlocked ? 0.78 : 0.3 })
  );
  ring1.rotation.x = Math.PI * 0.42;
  ring1.rotation.z = 0.25;
  ring1.position.y = 4.85;
  ring1.name = 'trophy_ring_1';
  trophyGroup.add(ring1);

  const ring2 = new THREE.Mesh(
    new THREE.TorusGeometry(2.22, 0.015, 14, 80),
    new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: isUnlocked ? 0.68 : 0.25 })
  );
  ring2.rotation.x = -Math.PI * 0.42;
  ring2.rotation.z = -0.25;
  ring2.position.y = 4.85;
  ring2.name = 'trophy_ring_2';
  trophyGroup.add(ring2);

  // Soft Gradient Volumetric Beam (fades smoothly top & bottom)
  const godRayTex = createGodRayTexture();
  const godRay = new THREE.Mesh(
    new THREE.CylinderGeometry(1.1, 0.55, 3.4, 32, 1, true),
    new THREE.MeshBasicMaterial({
      map: godRayTex,
      color: 0xfde047,
      transparent: true,
      opacity: isUnlocked ? 0.22 : 0.08,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  );
  godRay.position.y = 5.05;
  godRay.name = 'trophy_god_ray';
  trophyGroup.add(godRay);

  // Soft Circular Bokeh Stardust Motes
  const starCount = isUnlocked ? 90 : 30;
  const starGeo = new THREE.BufferGeometry();
  const starPositions = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    const prog = i / starCount;
    const r = 1.45 + Math.random() * 1.45;
    const theta = prog * Math.PI * 9 + Math.random() * 0.5;
    starPositions[i * 3] = r * Math.cos(theta);
    starPositions[i * 3 + 1] = 1.4 + prog * 4.3 + (Math.random() - 0.5) * 0.35;
    starPositions[i * 3 + 2] = r * Math.sin(theta);
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));

  const softTex = createSoftParticleTexture();
  const stars = new THREE.Points(
    starGeo,
    new THREE.PointsMaterial({
      map: softTex,
      color: 0xfff3b0,
      size: 0.22,
      transparent: true,
      opacity: isUnlocked ? 0.85 : 0.45,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  );
  stars.name = 'trophy_stars';
  trophyGroup.add(stars);

  const sparkleSprite = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: createSparkleTexture(),
      color: 0xffffff,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  );
  sparkleSprite.scale.set(0.85, 0.85, 1);
  sparkleSprite.name = 'trophy_sparkle_sprite';
  trophyGroup.add(sparkleSprite);

  trophyGroup.scale.set(0.57, 0.57, 0.57);
  trophyGroup.position.y = -1.42;

  return trophyGroup;
}


// =============================================================================
// 2. CORE CONQUEROR TROPHY (Titanium, Obsidian & Plasma Singularity Reliquary)
// =============================================================================
export function createBossTrophyMesh(isUnlocked = true) {
  const trophyGroup = new THREE.Group();
  trophyGroup.name = 'trophy_3d_boss_slayer';

  const plaqueTex = createPlaqueTexture({
    title: isUnlocked
      ? (t('trophy_plaque_boss_title_unlocked') || '⚡ CORE CONQUEROR ⚡')
      : (t('trophy_plaque_boss_title_locked') || '🔒 CÚP CHINH PHỤC BOSS'),
    subtitle: isUnlocked
      ? (t('trophy_plaque_boss_sub_unlocked') || 'ĐÃ VƯỢT TOÀN BỘ 4 PHASE')
      : (t('trophy_plaque_boss_sub_locked') || 'HẠ GỤC BOSS LÕI ĐỂ MỞ'),
    gradStops: isUnlocked ? ['#1b0510', '#4c0519', '#1b0510'] : ['#09090b', '#18181b', '#09090b'],
    borderColor: isUnlocked ? '#f43f5e' : '#52525b',
    innerBorderColor: isUnlocked ? '#fda4af' : '#27272a',
    titleColor: isUnlocked ? '#fff1f2' : '#9ca3af',
    titleGlow: isUnlocked ? '#e11d48' : '#000000',
    subColor: isUnlocked ? '#fbbf24' : '#71717a'
  });

  // High-Contrast Luxury Materials: Brushed Dark Titanium, Obsidian, Rose-Gold & Crimson Ruby
  const obsidianMat = new THREE.MeshPhysicalMaterial({
    color: 0x0b0b12,
    roughness: 0.14,
    metalness: 0.78,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    emissive: 0x1e0914,
    emissiveIntensity: isUnlocked ? 0.3 : 0.1
  });

  const titaniumMat = new THREE.MeshPhysicalMaterial({
    color: isUnlocked ? 0x3f3f52 : 0x27272a,
    roughness: 0.18,
    metalness: 0.95,
    clearcoat: 1.0,
    clearcoatRoughness: 0.06,
    reflectivity: 1.0,
    emissive: isUnlocked ? 0x3b0764 : 0x09090b,
    emissiveIntensity: isUnlocked ? 0.22 : 0.08
  });

  const champagneGoldMat = new THREE.MeshPhysicalMaterial({
    color: 0xfbbf24,
    roughness: 0.1,
    metalness: 0.94,
    clearcoat: 1.0,
    clearcoatRoughness: 0.04,
    emissive: 0xb45309,
    emissiveIntensity: isUnlocked ? 0.35 : 0.12
  });

  const plasmaCrimsonMat = new THREE.MeshPhysicalMaterial({
    color: 0xf43f5e,
    roughness: 0.08,
    metalness: 0.65,
    clearcoat: 1.0,
    emissive: 0xe11d48,
    emissiveIntensity: isUnlocked ? 0.9 : 0.25
  });

  const rubyGemMat = new THREE.MeshPhysicalMaterial({
    color: 0xfb7185,
    roughness: 0.03,
    metalness: 0.15,
    transmission: 0.72,
    ior: 1.77,
    clearcoat: 1.0,
    emissive: 0xe11d48,
    emissiveIntensity: isUnlocked ? 1.15 : 0.35,
    transparent: true
  });

  const plaqueMat = new THREE.MeshBasicMaterial({ map: plaqueTex, transparent: true });
  const boss2048Tex = create2048EmblemTexture(false);

  // --- Architectural Octagonal Titanium & Onyx Pedestal ---
  const baseStep1 = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 2.06, 0.36, 8), obsidianMat);
  baseStep1.position.y = 0.18;
  trophyGroup.add(baseStep1);

  const baseInlay1 = new THREE.Mesh(new THREE.TorusGeometry(1.78, 0.04, 14, 48), plasmaCrimsonMat);
  baseInlay1.rotation.x = Math.PI / 2;
  baseInlay1.position.y = 0.36;
  trophyGroup.add(baseInlay1);

  const baseStep2 = new THREE.Mesh(new THREE.CylinderGeometry(1.42, 1.7, 0.62, 8), obsidianMat);
  baseStep2.position.y = 0.67;
  trophyGroup.add(baseStep2);

  const baseCollar = new THREE.Mesh(new THREE.CylinderGeometry(1.16, 1.42, 0.14, 8), titaniumMat);
  baseCollar.position.y = 1.04;
  trophyGroup.add(baseCollar);

  const topCollarTrim = new THREE.Mesh(new THREE.TorusGeometry(1.16, 0.038, 12, 48), champagneGoldMat);
  topCollarTrim.rotation.x = Math.PI / 2;
  topCollarTrim.position.y = 1.11;
  trophyGroup.add(topCollarTrim);

  // 4 Sculpted Obsidian-Gold Corner Anchor Claws
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const talon = new THREE.Mesh(new RoundedBoxGeometry(0.24, 0.36, 0.38, 3, 0.05), titaniumMat);
    talon.position.set(Math.cos(a) * 1.82, 0.2, Math.sin(a) * 1.82);
    talon.rotation.y = -a + Math.PI / 2;
    talon.rotation.x = -0.22;
    trophyGroup.add(talon);
  }

  // Front Curved High-Res Commemorative Plaque
  const plaqueGeo = new THREE.CylinderGeometry(1.48, 1.66, 0.44, 48, 1, true, -Math.PI * 0.3, Math.PI * 0.6);
  const plaqueMesh = new THREE.Mesh(plaqueGeo, plaqueMat);
  plaqueMesh.position.y = 0.69;
  plaqueMesh.rotation.y = Math.PI;
  trophyGroup.add(plaqueMesh);

  // Arcane Floor Mandala
  const mandalaMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(5.1, 5.1),
    new THREE.MeshBasicMaterial({
      map: createMandalaTexture('boss'),
      transparent: true,
      opacity: isUnlocked ? 0.82 : 0.35,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  );
  mandalaMesh.rotation.x = -Math.PI / 2;
  mandalaMesh.position.y = 0.02;
  mandalaMesh.name = 'boss_mandala';
  trophyGroup.add(mandalaMesh);

  // --- Sculpted Hourglass Titanium Reactor Stem ---
  const stemPts = [
    new THREE.Vector2(0.0, 1.11),
    new THREE.Vector2(0.95, 1.11),
    new THREE.Vector2(0.62, 1.45),
    new THREE.Vector2(0.42, 1.95),
    new THREE.Vector2(0.68, 2.45),
    new THREE.Vector2(0.92, 2.66),
    new THREE.Vector2(0.0, 2.66)
  ];
  trophyGroup.add(new THREE.Mesh(new THREE.LatheGeometry(stemPts, 48), titaniumMat));

  const midCollar = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.045, 12, 32), champagneGoldMat);
  midCollar.rotation.x = Math.PI / 2;
  midCollar.position.y = 1.95;
  trophyGroup.add(midCollar);

  const upperStemRim = new THREE.Mesh(new THREE.TorusGeometry(0.92, 0.05, 14, 48), champagneGoldMat);
  upperStemRim.rotation.x = Math.PI / 2;
  upperStemRim.position.y = 2.66;
  trophyGroup.add(upperStemRim);

  // --- Integrated Dorsal Damascus Monolith Fin Wings (Balanced Twin Silhouette Behind Chamber) ---
  const buildRelicWing = (mirrorX) => {
    const s = mirrorX ? -1 : 1;
    const wg = new THREE.Group();
    const wingPts = [
      new THREE.Vector3(s * 0.42, 1.85, -0.35),
      new THREE.Vector3(s * 1.35, 2.75, -0.45),
      new THREE.Vector3(s * 1.92, 4.15, -0.32),
      new THREE.Vector3(s * 1.55, 5.18, -0.15)
    ];
    const wingCurve = new THREE.CatmullRomCurve3(wingPts);
    const spine = new THREE.Mesh(new THREE.TubeGeometry(wingCurve, 40, 0.075, 8, false), titaniumMat);
    wg.add(spine);

    const plasmaEdge = new THREE.Mesh(new THREE.TubeGeometry(wingCurve, 40, 0.026, 8, false), plasmaCrimsonMat);
    plasmaEdge.position.set(s * 0.04, 0.02, 0.06);
    wg.add(plasmaEdge);

    // Wing crest spear tip
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.095, 0.48, 4), champagneGoldMat);
    tip.position.set(s * 1.5, 5.36, -0.13);
    tip.rotation.z = s * 0.22;
    wg.add(tip);
    return wg;
  };
  trophyGroup.add(buildRelicWing(false));
  trophyGroup.add(buildRelicWing(true));

  // --- Open 4-Pylon Singularity Containment Crown (Replaces Muddy Closed Red Cup) ---
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const cos = Math.cos(a);
    const sin = Math.sin(a);
    const clawPts = [
      new THREE.Vector3(cos * 0.88, 2.64, sin * 0.88),
      new THREE.Vector3(cos * 1.62, 3.25, sin * 1.62),
      new THREE.Vector3(cos * 1.72, 4.05, sin * 1.72),
      new THREE.Vector3(cos * 1.48, 4.62, sin * 1.48)
    ];
    const clawCurve = new THREE.CatmullRomCurve3(clawPts);
    const pylon = new THREE.Mesh(new THREE.TubeGeometry(clawCurve, 36, 0.095, 10, false), obsidianMat);
    trophyGroup.add(pylon);

    const goldRib = new THREE.Mesh(new THREE.TubeGeometry(clawCurve, 36, 0.036, 8, false), champagneGoldMat);
    goldRib.scale.set(1.03, 1.0, 1.03);
    trophyGroup.add(goldRib);

    // Ruby Crown Node atop each containment pylon
    const rubyNode = new THREE.Mesh(new THREE.OctahedronGeometry(0.11, 0), rubyGemMat);
    rubyNode.position.set(cos * 1.48, 4.68, sin * 1.48);
    trophyGroup.add(rubyNode);
  }

  // Open Floating Crown Halo Collar uniting the 4 Pylons
  const crownCollar = new THREE.Mesh(new THREE.TorusGeometry(1.48, 0.065, 16, 48), titaniumMat);
  crownCollar.rotation.x = Math.PI / 2;
  crownCollar.position.y = 4.62;
  trophyGroup.add(crownCollar);

  // Subtle Lower Reactor Chamber Disc (reflects plasma upward without blocking silhouette)
  const emitterDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.45, 0.16, 32), obsidianMat);
  emitterDisc.position.y = 2.74;
  trophyGroup.add(emitterDisc);

  const emitterGlow = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.03, 12, 36), plasmaCrimsonMat);
  emitterGlow.rotation.x = Math.PI / 2;
  emitterGlow.position.y = 2.83;
  trophyGroup.add(emitterGlow);

  // Front Boss Emblem Badge ("2048")
  const bossBadge = new THREE.Mesh(
    new THREE.BoxGeometry(0.46, 0.46, 0.06),
    new THREE.MeshPhysicalMaterial({ map: boss2048Tex, roughness: 0.15, metalness: 0.65, clearcoat: 1.0 })
  );
  bossBadge.position.set(0, 1.95, 0.48);
  trophyGroup.add(bossBadge);

  // --- Hovering Dark Singularity Core + Swirling Plasma Accretion Disk ---
  const voidGroup = new THREE.Group();
  voidGroup.position.y = 4.35;
  voidGroup.name = 'boss_void_group';

  const voidCore = new THREE.Mesh(
    new THREE.SphereGeometry(0.58, 48, 48),
    new THREE.MeshPhysicalMaterial({
      color: 0x020205,
      roughness: 0.03,
      metalness: 0.98,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      emissive: 0x4c0519,
      emissiveIntensity: isUnlocked ? 0.85 : 0.25
    })
  );
  voidCore.name = 'boss_void_core';
  voidGroup.add(voidCore);

  // Einstein Lensing Photon Rim Halo
  const einsteinRim = new THREE.Mesh(
    new THREE.TorusGeometry(0.61, 0.022, 14, 64),
    new THREE.MeshBasicMaterial({
      color: 0xfef08a,
      transparent: true,
      opacity: isUnlocked ? 0.9 : 0.35,
      blending: THREE.AdditiveBlending
    })
  );
  voidGroup.add(einsteinRim);

  // Textured Spiral Plasma Accretion Ring
  const accretionTex = createAccretionTexture();
  const accretionDisk = new THREE.Mesh(
    new THREE.PlaneGeometry(2.65, 2.65),
    new THREE.MeshBasicMaterial({
      map: accretionTex,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: isUnlocked ? 0.95 : 0.42,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  );
  accretionDisk.rotation.x = Math.PI / 2.8;
  accretionDisk.name = 'boss_accretion_disk';
  voidGroup.add(accretionDisk);

  // Tilted Golden Finisher Hypercube Tesseract Cage around Singularity
  const voidCageEdges = new THREE.EdgesGeometry(new THREE.BoxGeometry(1.38, 1.38, 1.38));
  const voidCage = new THREE.LineSegments(
    voidCageEdges,
    new THREE.LineBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: isUnlocked ? 0.72 : 0.28 })
  );
  voidCage.rotation.set(0.45, 0.65, 0.2);
  voidCage.name = 'boss_void_cage';
  voidGroup.add(voidCage);

  // Orbiting Violet Gyro Ring
  const voidRing = new THREE.Mesh(
    new THREE.TorusGeometry(1.56, 0.022, 14, 72),
    new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      transparent: true,
      opacity: isUnlocked ? 0.85 : 0.32,
      blending: THREE.AdditiveBlending
    })
  );
  voidRing.rotation.x = -Math.PI / 3.4;
  voidRing.name = 'boss_void_ring';
  voidGroup.add(voidRing);

  const voidLight = new THREE.PointLight(0xff2d55, isUnlocked ? 2.6 : 0.85, 5.5);
  voidGroup.add(voidLight);

  trophyGroup.add(voidGroup);

  // Soft Circular Glowing Crimson Embers
  const emberCount = isUnlocked ? 80 : 28;
  const emberGeo = new THREE.BufferGeometry();
  const emberPositions = new Float32Array(emberCount * 3);
  for (let i = 0; i < emberCount; i++) {
    const r = 1.05 + Math.random() * 1.45;
    const theta = Math.random() * Math.PI * 2;
    const phi = (Math.random() - 0.5) * Math.PI;
    emberPositions[i * 3] = r * Math.cos(theta);
    emberPositions[i * 3 + 1] = 4.2 + r * Math.sin(phi);
    emberPositions[i * 3 + 2] = r * Math.sin(theta);
  }
  emberGeo.setAttribute('position', new THREE.BufferAttribute(emberPositions, 3));

  const embers = new THREE.Points(
    emberGeo,
    new THREE.PointsMaterial({
      map: createSoftParticleTexture(),
      color: 0xff453a,
      size: 0.22,
      transparent: true,
      opacity: isUnlocked ? 0.9 : 0.45,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  );
  embers.name = 'boss_embers';
  trophyGroup.add(embers);

  const sparkleSprite = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: createSparkleTexture(),
      color: 0xffb3c1,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  );
  sparkleSprite.scale.set(0.85, 0.85, 1);
  sparkleSprite.name = 'boss_sparkle_sprite';
  trophyGroup.add(sparkleSprite);

  trophyGroup.scale.set(0.57, 0.57, 0.57);
  trophyGroup.position.y = -1.42;

  return trophyGroup;
}


// =============================================================================
// 3. TILEPEDIA 3D EXHIBIT MESH (Interactive Museum Pedestal + Live 3D Block)
// =============================================================================
function createMysteryTileTexture() {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 512;
  const ctx = c.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 512, 512);
  g.addColorStop(0, '#1e293b');
  g.addColorStop(1, '#090d16');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 512);

  ctx.strokeStyle = 'rgba(148, 163, 184, 0.45)';
  ctx.lineWidth = 14;
  ctx.strokeRect(20, 20, 472, 472);

  ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
  ctx.setLineDash([16, 12]);
  ctx.lineWidth = 5;
  ctx.strokeRect(48, 48, 416, 416);
  ctx.setLineDash([]);

  ctx.fillStyle = '#94a3b8';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '900 185px "Be Vietnam Pro", "Segoe UI", Arial, sans-serif';
  ctx.shadowColor = 'rgba(56, 189, 248, 0.45)';
  ctx.shadowBlur = 24;
  ctx.fillText('?', 256, 266);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

export function createTileExhibitMesh(tileKey = '2', isUnlocked = true) {
  const exhibit = new THREE.Group();
  exhibit.name = 'trophy_3d_tile_exhibit';

  const isWildcard = tileKey === 'wildcard';
  const isBomb = tileKey === 'bomb';
  const numVal = (!isWildcard && !isBomb) ? (parseInt(tileKey, 10) || 2) : (isWildcard ? 0 : 8);

  // Choose accent color matching tier
  let accentHex = 0x38bdf8;
  if (!isUnlocked) accentHex = 0x64748b;
  else if (isBomb) accentHex = 0xef4444;
  else if (isWildcard) accentHex = 0xec4899;
  else if (numVal >= 2048) accentHex = 0xfbbf24;
  else if (numVal >= 256) accentHex = 0xa78bfa;
  else if (numVal >= 32) accentHex = 0xfb923c;

  // --- Illuminated Museum Pedestal ---
  const darkMetal = new THREE.MeshPhysicalMaterial({
    color: 0x0f172a,
    roughness: 0.16,
    metalness: 0.88,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05
  });
  const tierRingMat = new THREE.MeshPhysicalMaterial({
    color: accentHex,
    roughness: 0.1,
    metalness: 0.5,
    emissive: accentHex,
    emissiveIntensity: isUnlocked ? 0.95 : 0.25
  });

  const pedStep1 = new THREE.Mesh(new THREE.CylinderGeometry(1.55, 1.82, 0.3, 48), darkMetal);
  pedStep1.position.y = 0.15;
  exhibit.add(pedStep1);

  const pedStep2 = new THREE.Mesh(new THREE.CylinderGeometry(1.18, 1.46, 0.28, 48), darkMetal);
  pedStep2.position.y = 0.44;
  exhibit.add(pedStep2);

  const pedLedRing = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.038, 14, 64), tierRingMat);
  pedLedRing.rotation.x = Math.PI / 2;
  pedLedRing.position.y = 0.58;
  exhibit.add(pedLedRing);

  // Frosted Glass Emitter Pad
  const glassPad = new THREE.Mesh(
    new THREE.CylinderGeometry(1.12, 1.12, 0.06, 48),
    new THREE.MeshPhysicalMaterial({
      color: accentHex,
      roughness: 0.15,
      metalness: 0.1,
      transparent: true,
      opacity: isUnlocked ? 0.45 : 0.2,
      emissive: accentHex,
      emissiveIntensity: isUnlocked ? 0.45 : 0.1
    })
  );
  glassPad.position.y = 0.61;
  exhibit.add(glassPad);

  // Floor Hologram Ring
  const mandala = new THREE.Mesh(
    new THREE.PlaneGeometry(4.3, 4.3),
    new THREE.MeshBasicMaterial({
      map: createMandalaTexture('tilepedia'),
      color: accentHex,
      transparent: true,
      opacity: isUnlocked ? 0.68 : 0.28,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  );
  mandala.rotation.x = -Math.PI / 2;
  mandala.position.y = 0.02;
  mandala.name = 'tile_exhibit_mandala';
  exhibit.add(mandala);

  // --- Floating 3D Tile Group ---
  const tileFloat = new THREE.Group();
  tileFloat.position.y = 2.05;
  tileFloat.name = 'tile_exhibit_cube_group';

  const cubeGeo = new RoundedBoxGeometry(1.62, 1.62, 1.62, 5, 0.14);
  let cubeMat;
  if (isUnlocked) {
    const faceTex = textureManager.createCanvasTexture(numVal, isBomb, 3, isWildcard);
    cubeMat = new THREE.MeshPhysicalMaterial({
      map: faceTex,
      roughness: 0.14,
      metalness: isWildcard ? 0.28 : (numVal >= 1024 ? 0.35 : 0.18),
      clearcoat: 0.9,
      clearcoatRoughness: 0.08,
      emissive: accentHex,
      emissiveIntensity: numVal >= 1024 || isWildcard || isBomb ? 0.18 : 0.06
    });
    // Mark shared texture so rebuildTrophyMesh NEVER disposes TextureManager's cache!
    cubeMat.userData = { sharedMap: true };
  } else {
    cubeMat = new THREE.MeshPhysicalMaterial({
      map: createMysteryTileTexture(),
      roughness: 0.32,
      metalness: 0.6,
      clearcoat: 0.6,
      emissive: 0x0f172a,
      emissiveIntensity: 0.25
    });
  }

  const cubeMesh = new THREE.Mesh(cubeGeo, cubeMat);
  cubeMesh.rotation.set(0.18, 0.55, 0.0);
  cubeMesh.name = 'tile_exhibit_cube';
  tileFloat.add(cubeMesh);

  // Prestige Orbital Rings for High-Tier / Special Exhibits
  if (isUnlocked && (numVal >= 512 || isWildcard || isBomb)) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.36, 0.024, 14, 64),
      new THREE.MeshBasicMaterial({
        color: accentHex,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending
      })
    );
    ring.rotation.x = Math.PI * 0.36;
    ring.name = 'tile_exhibit_ring';
    tileFloat.add(ring);

    if (numVal >= 2048 || isWildcard) {
      const ring2 = new THREE.Mesh(
        new THREE.TorusGeometry(1.52, 0.018, 12, 64),
        new THREE.MeshBasicMaterial({
          color: isWildcard ? 0x38bdf8 : 0xfef08a,
          transparent: true,
          opacity: 0.72,
          blending: THREE.AdditiveBlending
        })
      );
      ring2.rotation.x = -Math.PI * 0.34;
      ring2.rotation.z = 0.3;
      ring2.name = 'tile_exhibit_ring2';
      tileFloat.add(ring2);
    }
  }

  const tileLight = new THREE.PointLight(accentHex, isUnlocked ? 1.85 : 0.6, 5.0);
  tileLight.position.set(0, 0.4, 1.4);
  tileFloat.add(tileLight);

  exhibit.add(tileFloat);

  exhibit.scale.set(0.76, 0.76, 0.76);
  exhibit.position.y = -1.25;
  return exhibit;
}

// Backward compatible export
export function createTrophyMesh(isUnlocked = true) {
  return createChampionsTrophyMesh(isUnlocked);
}


// =============================================================================
// DEDICATED INTERACTIVE 3D TROPHY & TILEPEDIA STUDIO VIEWER
// =============================================================================
export class TrophyModalViewer {
  constructor(canvasContainer) {
    this.container = canvasContainer;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.trophyGroup = null;
    this.animId = null;
    this.isPaused = false;

    this.currentType = 'c1'; // 'c1' | 'boss' | 'tilepedia'
    this.c1Unlocked = false;
    this.bossUnlocked = false;
    this.tileKey = '2';
    this.tileUnlocked = true;

    this.envMapC1 = null;
    this.envMapBoss = null;
    this.envMapTile = null;
    this.ambientLight = null;
    this.keyLight = null;
    this.rimLight = null;
    this.fillLight = null;
    this.bottomLight = null;
    this.movingAccentLight = null;

    this.isDragging = false;
    this.prevPointerX = 0;
    this.prevPointerY = 0;
    this.rotVelocityX = 0;
    this.rotVelocityY = 0;
    this.targetZoom = 6.35;
    this.currentZoom = 6.35;

    this.init();
  }

  init() {
    const width = this.container.clientWidth || 340;
    const height = this.container.clientHeight || 300;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    this.camera.position.set(0, 0.75, this.currentZoom);
    this.camera.lookAt(0, 0.42, 0);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.22;
    this.container.appendChild(this.renderer.domElement);

    this.envMapC1 = createStudioEnvMap(this.renderer, 'c1');
    this.envMapBoss = createStudioEnvMap(this.renderer, 'boss');
    this.envMapTile = createStudioEnvMap(this.renderer, 'tilepedia');
    this.scene.environment = this.envMapC1;

    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.88);
    this.scene.add(this.ambientLight);

    this.keyLight = new THREE.DirectionalLight(0xfffae0, 2.3);
    this.keyLight.position.set(4, 6, 5);
    this.scene.add(this.keyLight);

    this.rimLight = new THREE.DirectionalLight(0x38bdf8, 2.0);
    this.rimLight.position.set(-4, 3, -4);
    this.scene.add(this.rimLight);

    this.fillLight = new THREE.DirectionalLight(0xf472b6, 0.85);
    this.fillLight.position.set(3, -2, -3);
    this.scene.add(this.fillLight);

    this.bottomLight = new THREE.PointLight(0xffaa00, 1.4, 8);
    this.bottomLight.position.set(0, -1.5, 2);
    this.scene.add(this.bottomLight);

    this.movingAccentLight = new THREE.PointLight(0xffffff, 2.2, 9);
    this.movingAccentLight.position.set(3, 4, 3);
    this.scene.add(this.movingAccentLight);

    this.rebuildTrophyMesh();
    this.setupInteractions();

    this.animate = this.animate.bind(this);
    this.animate();
  }

  setupInteractions() {
    const dom = this.renderer.domElement;

    const onPointerDown = (e) => {
      this.isDragging = true;
      this.prevPointerX = e.clientX;
      this.prevPointerY = e.clientY;
      this.rotVelocityX = 0;
      this.rotVelocityY = 0;
      dom.style.cursor = 'grabbing';
    };

    const onPointerMove = (e) => {
      if (!this.isDragging) return;
      const deltaX = e.clientX - this.prevPointerX;
      const deltaY = e.clientY - this.prevPointerY;
      this.prevPointerX = e.clientX;
      this.prevPointerY = e.clientY;

      this.rotVelocityY = deltaX * 0.007;
      this.rotVelocityX = deltaY * 0.005;

      if (this.trophyGroup) {
        this.trophyGroup.rotation.y += this.rotVelocityY;
        this.trophyGroup.rotation.x = Math.max(-0.35, Math.min(0.35, this.trophyGroup.rotation.x + this.rotVelocityX));
      }
    };

    const onPointerUp = () => {
      this.isDragging = false;
      dom.style.cursor = 'grab';
    };

    const onWheel = (e) => {
      e.preventDefault();
      const zoomDelta = e.deltaY * 0.003;
      this.targetZoom = Math.max(3.8, Math.min(8.4, this.targetZoom + zoomDelta));
    };

    dom.style.cursor = 'grab';
    dom.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    dom.addEventListener('wheel', onWheel, { passive: false });

    this._cleanupEvents = () => {
      dom.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      dom.removeEventListener('wheel', onWheel);
    };
  }

  setTrophyType(type = 'c1', unlockedStates = {}) {
    this.currentType = type;
    if (unlockedStates.c1 !== undefined) this.c1Unlocked = unlockedStates.c1;
    if (unlockedStates.boss !== undefined) this.bossUnlocked = unlockedStates.boss;

    this.targetZoom = 6.35;
    this.rebuildTrophyMesh();
    this.updateLightingForType();
  }

  setTileExhibit(tileKey = '2', isUnlocked = true) {
    this.currentType = 'tilepedia';
    this.tileKey = String(tileKey);
    this.tileUnlocked = !!isUnlocked;
    this.targetZoom = 5.6;
    this.rebuildTrophyMesh();
    this.updateLightingForType();
  }

  setUnlocked(unlocked) {
    if (this.currentType === 'c1') {
      this.c1Unlocked = unlocked;
    } else if (this.currentType === 'boss') {
      this.bossUnlocked = unlocked;
    } else {
      this.tileUnlocked = unlocked;
    }
    this.rebuildTrophyMesh();
  }

  updateLightingForType() {
    if (this.currentType === 'boss') {
      this.scene.environment = this.envMapBoss;

      this.ambientLight.color.setHex(0xffecee);
      this.ambientLight.intensity = 0.85;

      this.keyLight.color.setHex(0xffc2c9);
      this.keyLight.intensity = 2.45;

      this.rimLight.color.setHex(0xa855f7);
      this.rimLight.intensity = 2.25;

      this.fillLight.color.setHex(0xf43f5e);
      this.fillLight.intensity = 1.25;

      this.bottomLight.color.setHex(0xe11d48);
      this.bottomLight.intensity = 1.65;

      this.movingAccentLight.color.setHex(0xffe4e6);
    } else if (this.currentType === 'tilepedia') {
      this.scene.environment = this.envMapTile;

      this.ambientLight.color.setHex(0xffffff);
      this.ambientLight.intensity = 1.05;

      this.keyLight.color.setHex(0xffffff);
      this.keyLight.intensity = 2.15;

      this.rimLight.color.setHex(0x38bdf8);
      this.rimLight.intensity = 1.65;

      this.fillLight.color.setHex(0xfde047);
      this.fillLight.intensity = 0.65;

      this.bottomLight.color.setHex(0x38bdf8);
      this.bottomLight.intensity = 1.1;

      this.movingAccentLight.color.setHex(0xffffff);
    } else {
      this.scene.environment = this.envMapC1;

      this.ambientLight.color.setHex(0xffffff);
      this.ambientLight.intensity = 0.92;

      this.keyLight.color.setHex(0xfffae0);
      this.keyLight.intensity = 2.35;

      this.rimLight.color.setHex(0x38bdf8);
      this.rimLight.intensity = 2.0;

      this.fillLight.color.setHex(0xe879f9);
      this.fillLight.intensity = 0.8;

      this.bottomLight.color.setHex(0xffaa00);
      this.bottomLight.intensity = 1.45;

      this.movingAccentLight.color.setHex(0xfffae0);
    }
  }

  disposeTrophyGroup(group) {
    if (!group) return;
    group.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        mats.forEach(m => {
          if (m.map && !(m.userData && m.userData.sharedMap)) {
            m.map.dispose();
          }
          if (m.envMap && m.envMap !== this.envMapC1 && m.envMap !== this.envMapBoss && m.envMap !== this.envMapTile) {
            m.envMap.dispose();
          }
          m.dispose();
        });
      }
    });
  }

  rebuildTrophyMesh() {
    if (this.trophyGroup) {
      this.scene.remove(this.trophyGroup);
      this.disposeTrophyGroup(this.trophyGroup);
      this.trophyGroup = null;
    }

    if (this.currentType === 'boss') {
      this.trophyGroup = createBossTrophyMesh(this.bossUnlocked);
    } else if (this.currentType === 'tilepedia') {
      this.trophyGroup = createTileExhibitMesh(this.tileKey, this.tileUnlocked);
    } else {
      this.trophyGroup = createChampionsTrophyMesh(this.c1Unlocked);
    }
    this.scene.add(this.trophyGroup);
  }

  animate() {
    if (this.isPaused) {
      this.animId = null;
      return;
    }
    this.animId = requestAnimationFrame(this.animate);
    const time = performance.now() * 0.001;

    this.currentZoom += (this.targetZoom - this.currentZoom) * 0.1;
    this.camera.position.z = this.currentZoom;

    if (this.movingAccentLight) {
      this.movingAccentLight.position.x = Math.sin(time * 0.8) * 4.2;
      this.movingAccentLight.position.z = Math.cos(time * 0.8) * 4.2;
      this.movingAccentLight.position.y = 3.5 + Math.sin(time * 1.2) * 1.1;
    }

    if (this.trophyGroup) {
      if (!this.isDragging) {
        this.rotVelocityY *= 0.92;
        this.rotVelocityX *= 0.92;
        const autoSpeed = this.currentType === 'tilepedia' ? 0.015 : 0.011;
        this.trophyGroup.rotation.y += autoSpeed + this.rotVelocityY;
        this.trophyGroup.rotation.x += this.rotVelocityX;
        this.trophyGroup.rotation.x *= 0.95;
      }

      if (this.currentType === 'c1') {
        const crownGroup = this.trophyGroup.getObjectByName('trophy_crown_group');
        if (crownGroup) {
          crownGroup.rotation.y += 0.022;
          crownGroup.position.y = 5.22 + Math.sin(time * 2.5) * 0.09;
        }
        const gem = this.trophyGroup.getObjectByName('trophy_gem');
        if (gem) {
          gem.rotation.y += 0.036;
          gem.rotation.x += 0.015;
        }
        const ring1 = this.trophyGroup.getObjectByName('trophy_ring_1');
        if (ring1) ring1.rotation.y += 0.02;
        const ring2 = this.trophyGroup.getObjectByName('trophy_ring_2');
        if (ring2) ring2.rotation.y -= 0.016;

        const godRay = this.trophyGroup.getObjectByName('trophy_god_ray');
        if (godRay) {
          godRay.material.opacity = (this.c1Unlocked ? 0.18 : 0.06) + Math.sin(time * 2.2) * 0.05;
          godRay.rotation.y -= 0.008;
        }
        const stars = this.trophyGroup.getObjectByName('trophy_stars');
        if (stars) stars.rotation.y += 0.006;

        const mandala = this.trophyGroup.getObjectByName('trophy_mandala');
        if (mandala) mandala.rotation.z += 0.004;

        const sparkle = this.trophyGroup.getObjectByName('trophy_sparkle_sprite');
        if (sparkle) {
          const sparkleCycle = (time * 1.4) % 6;
          if (sparkleCycle < 1.2) {
            const s = Math.sin((sparkleCycle / 1.2) * Math.PI);
            sparkle.position.set(1.56, 4.74, 0.25);
            sparkle.scale.set(s * 1.0, s * 1.0, 1);
            sparkle.material.opacity = s * 0.9;
          } else if (sparkleCycle > 3.0 && sparkleCycle < 4.2) {
            const s = Math.sin(((sparkleCycle - 3.0) / 1.2) * Math.PI);
            sparkle.position.set(-2.28, 4.98, 0.15);
            sparkle.scale.set(s * 1.05, s * 1.05, 1);
            sparkle.material.opacity = s * 0.9;
          } else {
            sparkle.material.opacity = 0;
          }
        }
      } else if (this.currentType === 'boss') {
        const voidGroup = this.trophyGroup.getObjectByName('boss_void_group');
        if (voidGroup) voidGroup.position.y = 4.35 + Math.sin(time * 2.4) * 0.08;

        const voidCore = this.trophyGroup.getObjectByName('boss_void_core');
        if (voidCore) voidCore.rotation.y -= 0.03;

        const accretionDisk = this.trophyGroup.getObjectByName('boss_accretion_disk');
        if (accretionDisk) accretionDisk.rotation.z += 0.04;

        const voidCage = this.trophyGroup.getObjectByName('boss_void_cage');
        if (voidCage) {
          voidCage.rotation.y += 0.018;
          voidCage.rotation.x += 0.008;
        }

        const voidRing = this.trophyGroup.getObjectByName('boss_void_ring');
        if (voidRing) voidRing.rotation.z -= 0.025;

        const embers = this.trophyGroup.getObjectByName('boss_embers');
        if (embers) {
          embers.rotation.y += 0.012;
          embers.position.y = Math.sin(time * 1.8) * 0.06;
        }

        const mandala = this.trophyGroup.getObjectByName('boss_mandala');
        if (mandala) mandala.rotation.z -= 0.005;

        const sparkle = this.trophyGroup.getObjectByName('boss_sparkle_sprite');
        if (sparkle) {
          const sparkleCycle = (time * 1.3) % 5;
          if (sparkleCycle < 1.2) {
            const s = Math.sin((sparkleCycle / 1.2) * Math.PI);
            sparkle.position.set(1.48, 4.68, 0.25);
            sparkle.scale.set(s * 0.95, s * 0.95, 1);
            sparkle.material.opacity = s * 0.85;
          } else {
            sparkle.material.opacity = 0;
          }
        }
      } else {
        // Tilepedia Exhibit Floating Animation
        const cubeGroup = this.trophyGroup.getObjectByName('tile_exhibit_cube_group');
        if (cubeGroup) {
          cubeGroup.position.y = 2.05 + Math.sin(time * 2.2) * 0.1;
          const cube = cubeGroup.getObjectByName('tile_exhibit_cube');
          if (cube) {
            cube.rotation.x = 0.2 + Math.sin(time * 1.3) * 0.08;
          }
          const ring = cubeGroup.getObjectByName('tile_exhibit_ring');
          if (ring) ring.rotation.z += 0.022;
          const ring2 = cubeGroup.getObjectByName('tile_exhibit_ring2');
          if (ring2) ring2.rotation.y -= 0.018;
        }
        const mandala = this.trophyGroup.getObjectByName('tile_exhibit_mandala');
        if (mandala) mandala.rotation.z += 0.006;
      }
    }

    this.renderer.render(this.scene, this.camera);
  }

  resize() {
    if (!this.container || !this.renderer) return;
    const width = this.container.clientWidth || 340;
    const height = this.container.clientHeight || 300;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  pause() {
    this.isPaused = true;
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
  }

  resume() {
    if (!this.isPaused && this.animId) return;
    this.isPaused = false;
    if (!this.animId) {
      this.animate();
    }
  }

  destroy() {
    if (this.animId) cancelAnimationFrame(this.animId);
    if (this._cleanupEvents) this._cleanupEvents();
    if (this.trophyGroup) {
      this.scene.remove(this.trophyGroup);
      this.disposeTrophyGroup(this.trophyGroup);
      this.trophyGroup = null;
    }
    if (this.envMapC1) this.envMapC1.dispose();
    if (this.envMapBoss) this.envMapBoss.dispose();
    if (this.envMapTile) this.envMapTile.dispose();
    if (this.renderer && this.renderer.domElement && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
    if (this.renderer) this.renderer.dispose();
  }
}
