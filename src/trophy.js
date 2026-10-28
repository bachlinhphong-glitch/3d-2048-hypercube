import * as THREE from 'three';
import { soundManager } from './sound.js';
import { t } from './i18n.js';

/**
 * 3D 2048 Masterpiece Trophies & Interactive Studio Viewer
 * 1. UEFA Champions League C1 Style: "Tai Voi" Imperial 24K Gold & 999 Sterling Silver Master Trophy
 * 2. Sekiro / Isshin Ashina Style: Dark Singularity Slayer "不死斬り" Mythic Katana Trophy
 * 
 * Featuring:
 * - Physically Based Rendering (MeshPhysicalMaterial with clearcoat, reflectivity & vermeil gold wash)
 * - Procedural Studio HDRI Environment Maps for photorealistic metallic reflections
 * - Animated Moving Specular Sparkle Glints (Bling Flare FX)
 * - Orbiting Astral Rings & Celestial Coordinate Gyroscopes
 * - Volumetric God Ray Auras & Double-Helix Golden Stardust Clouds
 * - Floor-Projected Divine Arcane Mandalas & Runic Seals
 * - Interactive 360° Drag & Smooth Wheel/Pinch Zoom Controls
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
    // Dark Void Forge Studio: Deep obsidian-crimson gradient, intense blazing plasma softboxes, violet rim
    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, '#0a0205');
    grad.addColorStop(0.35, '#1e050e');
    grad.addColorStop(0.55, '#3b0816');
    grad.addColorStop(0.75, '#180208');
    grad.addColorStop(1, '#050002');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 256);

    // Blazing Crimson Key Softbox
    const key = ctx.createRadialGradient(380, 80, 5, 380, 80, 160);
    key.addColorStop(0, 'rgba(255, 68, 68, 0.95)');
    key.addColorStop(0.3, 'rgba(220, 38, 38, 0.6)');
    key.addColorStop(0.7, 'rgba(153, 27, 27, 0.15)');
    key.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = key;
    ctx.fillRect(200, 0, 312, 200);

    // Deep Violet Accent Rim
    const rim = ctx.createRadialGradient(100, 90, 5, 100, 90, 140);
    rim.addColorStop(0, 'rgba(168, 85, 247, 0.85)');
    rim.addColorStop(0.4, 'rgba(126, 34, 206, 0.3)');
    rim.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = rim;
    ctx.fillRect(0, 0, 220, 200);
  } else {
    // Imperial UEFA Champions Studio: Royal navy twilight, brilliant 24K gold bounce light, pure diamond white softboxes
    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, '#060a17');
    grad.addColorStop(0.3, '#0d1938');
    grad.addColorStop(0.5, '#1a2c5b');
    grad.addColorStop(0.7, '#0d152a');
    grad.addColorStop(1, '#04060c');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 256);

    // Main diamond white overhead studio softbox
    const topBox = ctx.createRadialGradient(256, 30, 5, 256, 30, 160);
    topBox.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
    topBox.addColorStop(0.25, 'rgba(240, 248, 255, 0.7)');
    topBox.addColorStop(0.65, 'rgba(186, 215, 255, 0.2)');
    topBox.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = topBox;
    ctx.fillRect(0, 0, 512, 160);

    // Warm 24K Golden Key Reflection (Right)
    const goldKey = ctx.createRadialGradient(420, 90, 8, 420, 90, 140);
    goldKey.addColorStop(0, 'rgba(255, 220, 120, 0.9)');
    goldKey.addColorStop(0.35, 'rgba(245, 180, 50, 0.45)');
    goldKey.addColorStop(0.75, 'rgba(217, 119, 6, 0.15)');
    goldKey.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = goldKey;
    ctx.fillRect(260, 10, 252, 180);

    // Royal Azure Specular Rim (Left)
    const azureRim = ctx.createRadialGradient(90, 90, 8, 90, 90, 130);
    azureRim.addColorStop(0, 'rgba(56, 189, 248, 0.85)');
    azureRim.addColorStop(0.4, 'rgba(14, 165, 233, 0.3)');
    azureRim.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = azureRim;
    ctx.fillRect(0, 10, 240, 180);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const envMap = pmremGenerator.fromEquirectangular(texture).texture;
  pmremGenerator.dispose();
  texture.dispose();
  return envMap;
}

// =============================================================================
// PROCEDURAL SPARKLE / STARBURST TEXTURE GENERATOR
// =============================================================================
function createSparkleTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  // Radial soft glow
  const rad = ctx.createRadialGradient(64, 64, 0, 64, 64, 60);
  rad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  rad.addColorStop(0.18, 'rgba(255, 235, 170, 0.9)');
  rad.addColorStop(0.45, 'rgba(255, 215, 0, 0.35)');
  rad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = rad;
  ctx.fillRect(0, 0, 128, 128);

  // 8-pointed starburst rays
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  ctx.beginPath();
  // Cardinal rays
  ctx.moveTo(64, 4); ctx.lineTo(64, 124);
  ctx.moveTo(4, 64); ctx.lineTo(124, 64);
  ctx.stroke();

  // Diagonal rays
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(22, 22); ctx.lineTo(106, 106);
  ctx.moveTo(106, 22); ctx.lineTo(22, 106);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  return tex;
}

// =============================================================================
// PROCEDURAL CELESTIAL MANDALA / RUNE SEAL TEXTURE
// =============================================================================
function createMandalaTexture(type = 'c1') {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  const cx = 256;
  const cy = 256;

  ctx.clearRect(0, 0, 512, 512);

  if (type === 'boss') {
    // Crimson Void Blood Pentagram & Arcane Glyphs
    ctx.strokeStyle = '#ef4444';
    ctx.shadowColor = '#dc2626';
    ctx.shadowBlur = 12;

    // Outer Ring
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(cx, cy, 220, 0, Math.PI * 2);
    ctx.stroke();

    // Secondary dashed ring
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.arc(cx, cy, 195, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // 8-pointed star of eradication
    ctx.lineWidth = 3;
    for (let i = 0; i < 8; i++) {
      const a1 = (i / 8) * Math.PI * 2;
      const a2 = ((i + 3) / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a1) * 195, cy + Math.sin(a1) * 195);
      ctx.lineTo(cx + Math.cos(a2) * 195, cy + Math.sin(a2) * 195);
      ctx.stroke();
    }

    // Central Void Ring
    ctx.beginPath();
    ctx.arc(cx, cy, 75, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    // Golden Celestial Star Mandala (UEFA Champions Laurels)
    ctx.strokeStyle = '#ffd700';
    ctx.shadowColor = '#ffaa00';
    ctx.shadowBlur = 14;

    // Outer concentric rings
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(cx, cy, 230, 0, Math.PI * 2);
    ctx.stroke();

    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, 212, 0, Math.PI * 2);
    ctx.stroke();

    // 12 rays of glory
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * 170, cy + Math.sin(a) * 170);
      ctx.lineTo(cx + Math.cos(a) * 212, cy + Math.sin(a) * 212);
      ctx.stroke();
    }

    // Concentric 8-pointed golden star
    for (let pass = 0; pass < 2; pass++) {
      const offset = pass * (Math.PI / 8);
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2 + offset;
        const x = cx + Math.cos(a) * 170;
        const y = cy + Math.sin(a) * 170;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
    }

    // Inner glowing ring
    ctx.beginPath();
    ctx.arc(cx, cy, 85, 0, Math.PI * 2);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  return tex;
}


// =============================================================================
// 1. UEFA CHAMPIONS LEAGUE C1 MASTER TROPHY (7/7 Quests Master)
// =============================================================================
export function createChampionsTrophyMesh(isUnlocked = true) {
  const trophyGroup = new THREE.Group();
  trophyGroup.name = 'trophy_3d_c1_champions';

  // ---------------------------------------------------------------------------
  // Plaque Texture: Royal Blue & Deep Gold Commemorative Plaque
  // ---------------------------------------------------------------------------
  const plaqueCanvas = document.createElement('canvas');
  plaqueCanvas.width = 512;
  plaqueCanvas.height = 140;
  const pCtx = plaqueCanvas.getContext('2d');

  const pGrad = pCtx.createLinearGradient(0, 0, 512, 140);
  if (isUnlocked) {
    pGrad.addColorStop(0, '#060d24');
    pGrad.addColorStop(0.5, '#152554');
    pGrad.addColorStop(1, '#060d24');
  } else {
    pGrad.addColorStop(0, '#0f172a');
    pGrad.addColorStop(0.5, '#1e293b');
    pGrad.addColorStop(1, '#0f172a');
  }
  pCtx.fillStyle = pGrad;
  pCtx.fillRect(0, 0, 512, 140);

  // Ornate Double Gold Borders
  pCtx.strokeStyle = isUnlocked ? '#ffd700' : '#475569';
  pCtx.lineWidth = 6;
  pCtx.strokeRect(6, 6, 500, 128);
  pCtx.strokeStyle = isUnlocked ? '#ffffff' : '#334155';
  pCtx.lineWidth = 2;
  pCtx.strokeRect(12, 12, 488, 116);

  // Plaque Typography
  pCtx.textAlign = 'center';
  pCtx.textBaseline = 'middle';
  if (isUnlocked) {
    pCtx.font = '900 34px "Segoe UI", Arial, sans-serif';
    pCtx.fillStyle = '#ffffff';
    pCtx.shadowColor = '#00d2ff';
    pCtx.shadowBlur = 18;
    pCtx.fillText(t('trophy_plaque_c1_title_unlocked') || '★ CHAMPIONS OF 2048 ★', 256, 48);

    pCtx.font = 'bold 20px "Segoe UI", Arial, sans-serif';
    pCtx.fillStyle = '#ffd700';
    pCtx.shadowColor = '#ffaa00';
    pCtx.shadowBlur = 10;
    pCtx.fillText(t('trophy_plaque_c1_sub_unlocked') || 'TRI ÂN BẬC THẦY HOÀN THÀNH 7/7 NHIỆM VỤ', 256, 96);
  } else {
    pCtx.font = '900 32px "Segoe UI", Arial, sans-serif';
    pCtx.fillStyle = '#94a3b8';
    pCtx.shadowColor = '#000';
    pCtx.shadowBlur = 8;
    pCtx.fillText(t('trophy_plaque_c1_title_locked') || '🔒 CÚP BẬC THẦY 2048', 256, 48);

    pCtx.font = 'bold 18px "Segoe UI", Arial, sans-serif';
    pCtx.fillStyle = '#64748b';
    pCtx.fillText(t('trophy_plaque_c1_sub_locked') || 'HOÀN THÀNH 7 NHIỆM VỤ ĐỂ MỞ', 256, 96);
  }
  const plaqueTex = new THREE.CanvasTexture(plaqueCanvas);

  // ---------------------------------------------------------------------------
  // 2048 Floating Cube Texture (Embossed Gold & Diamond)
  // ---------------------------------------------------------------------------
  const cubeCanvas = document.createElement('canvas');
  cubeCanvas.width = 256;
  cubeCanvas.height = 256;
  const cCtx = cubeCanvas.getContext('2d');
  const cGrad = cCtx.createLinearGradient(0, 0, 256, 256);
  cGrad.addColorStop(0, '#ffffff');
  cGrad.addColorStop(0.5, '#fef08a');
  cGrad.addColorStop(1, '#eab308');
  cCtx.fillStyle = cGrad;
  cCtx.fillRect(0, 0, 256, 256);

  cCtx.strokeStyle = '#ffd700';
  cCtx.lineWidth = 14;
  cCtx.strokeRect(8, 8, 240, 240);

  cCtx.fillStyle = '#0f172a';
  cCtx.textAlign = 'center';
  cCtx.textBaseline = 'middle';
  cCtx.font = '900 88px "Segoe UI", Arial, sans-serif';
  cCtx.shadowColor = '#ffd700';
  cCtx.shadowBlur = 20;
  cCtx.fillText('2048', 128, 128);
  const cubeTex = new THREE.CanvasTexture(cubeCanvas);

  // ---------------------------------------------------------------------------
  // Advanced PBR Materials (MeshPhysicalMaterial with Automotive Clearcoat)
  // ---------------------------------------------------------------------------
  // 1. Sovereign 999 Fine Silver (Mirror Finish Chalice & Handles)
  const silverMat = new THREE.MeshPhysicalMaterial({
    color: 0xf8fafc,
    roughness: isUnlocked ? 0.05 : 0.25,
    metalness: 0.98,
    clearcoat: 1.0,
    clearcoatRoughness: 0.04,
    reflectivity: 1.0,
    emissive: 0xdbeafe,
    emissiveIntensity: isUnlocked ? 0.35 : 0.12
  });

  // 2. Imperial 24K Polished Gold (Filigree Trims, Crowns & Rims)
  const goldTrimMat = new THREE.MeshPhysicalMaterial({
    color: 0xffd700,
    roughness: isUnlocked ? 0.07 : 0.22,
    metalness: 0.96,
    clearcoat: 1.0,
    clearcoatRoughness: 0.04,
    reflectivity: 1.0,
    emissive: 0xd97706,
    emissiveIntensity: isUnlocked ? 0.48 : 0.18
  });

  // 3. Vermeil Gold Chalice Interior (Warm Golden Glow inside the silver bowl)
  const vermeilInnerMat = new THREE.MeshPhysicalMaterial({
    color: 0xffe066,
    roughness: 0.12,
    metalness: 0.92,
    clearcoat: 0.8,
    emissive: 0xf59e0b,
    emissiveIntensity: isUnlocked ? 0.65 : 0.2,
    side: THREE.BackSide
  });

  // 4. Polished Obsidian Black Marble (Pedestal Plinth)
  const obsidianMat = new THREE.MeshPhysicalMaterial({
    color: 0x060913,
    roughness: 0.12,
    metalness: 0.45,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    emissive: 0x1e293b,
    emissiveIntensity: 0.15
  });

  // 5. Prismatic Celestial Diamond Gem
  const gemMat = new THREE.MeshPhysicalMaterial({
    color: 0x67e8f9,
    roughness: 0.02,
    metalness: 0.15,
    transmission: 0.75,
    thickness: 0.8,
    ior: 2.4, // Real diamond index of refraction
    clearcoat: 1.0,
    emissive: 0x0284c7,
    emissiveIntensity: isUnlocked ? 1.1 : 0.35,
    transparent: true,
    opacity: 0.95
  });

  // 6. Royal Sapphire Rim Gemstones
  const sapphireMat = new THREE.MeshPhysicalMaterial({
    color: 0x2563eb,
    roughness: 0.04,
    metalness: 0.2,
    transmission: 0.65,
    ior: 1.77,
    clearcoat: 1.0,
    emissive: 0x1d4ed8,
    emissiveIntensity: isUnlocked ? 1.0 : 0.3,
    transparent: true
  });

  // 7. Plaque Material
  const plaqueMat = new THREE.MeshBasicMaterial({
    map: plaqueTex,
    transparent: true
  });

  // 8. Crown Jewel Cube Material
  const crownCubeMat = new THREE.MeshPhysicalMaterial({
    map: cubeTex,
    roughness: 0.08,
    metalness: 0.85,
    clearcoat: 1.0,
    clearcoatRoughness: 0.04,
    emissive: 0xf59e0b,
    emissiveIntensity: isUnlocked ? 0.6 : 0.2
  });

  // ---------------------------------------------------------------------------
  // --- Pedestal Base: Tiered Obsidian Plinth with Gold Mouldings & Lion Paws ---
  // ---------------------------------------------------------------------------
  // Plinth Step 1 (Octagonal bottom plinth)
  const baseStep1 = new THREE.Mesh(new THREE.CylinderGeometry(1.75, 2.0, 0.45, 8), obsidianMat);
  baseStep1.position.y = 0.225;
  trophyGroup.add(baseStep1);

  // 4 Golden Corner Gryphon/Lion Paws anchoring the pedestal
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const pawGroup = new THREE.Group();
    pawGroup.position.set(Math.cos(angle) * 1.85, 0.12, Math.sin(angle) * 1.85);

    const pawMesh = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.22, 0.35), goldTrimMat);
    pawMesh.rotation.y = -angle;
    pawGroup.add(pawMesh);

    // 3 Claws
    for (let c = -1; c <= 1; c++) {
      const claw = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.16, 8), goldTrimMat);
      claw.rotation.x = Math.PI / 2;
      claw.rotation.y = -angle;
      claw.position.set(Math.cos(angle) * 0.16 + c * 0.07, -0.05, Math.sin(angle) * 0.16);
      pawGroup.add(claw);
    }
    trophyGroup.add(pawGroup);
  }

  // Polished 24K Gold Bevelled Ring 1
  const baseRing1 = new THREE.Mesh(new THREE.TorusGeometry(1.72, 0.065, 16, 48), goldTrimMat);
  baseRing1.rotation.x = Math.PI / 2;
  baseRing1.position.y = 0.45;
  trophyGroup.add(baseRing1);

  // Plinth Step 2 (Middle cylindrical marble drum)
  const baseStep2 = new THREE.Mesh(new THREE.CylinderGeometry(1.42, 1.65, 0.58, 36), obsidianMat);
  baseStep2.position.y = 0.45 + 0.29;
  trophyGroup.add(baseStep2);

  // Bevelled Gold Crown Collar
  const baseCollar = new THREE.Mesh(new THREE.CylinderGeometry(1.22, 1.45, 0.18, 36), goldTrimMat);
  baseCollar.position.y = 1.03;
  trophyGroup.add(baseCollar);

  // Front Curved Commemorative Plaque
  const plaqueGeo = new THREE.CylinderGeometry(1.46, 1.66, 0.48, 36, 1, true, -Math.PI * 0.32, Math.PI * 0.64);
  const plaqueMesh = new THREE.Mesh(plaqueGeo, plaqueMat);
  plaqueMesh.position.y = 0.74;
  plaqueMesh.rotation.y = Math.PI;
  trophyGroup.add(plaqueMesh);

  // Floor-Projected Golden Celestial Mandala
  const mandalaTex = createMandalaTexture('c1');
  const mandalaGeo = new THREE.PlaneGeometry(5.2, 5.2);
  const mandalaMat = new THREE.MeshBasicMaterial({
    map: mandalaTex,
    transparent: true,
    opacity: isUnlocked ? 0.85 : 0.4,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending
  });
  const mandalaMesh = new THREE.Mesh(mandalaGeo, mandalaMat);
  mandalaMesh.rotation.x = -Math.PI / 2;
  mandalaMesh.position.y = 0.02;
  mandalaMesh.name = 'trophy_mandala';
  trophyGroup.add(mandalaMesh);

  // ---------------------------------------------------------------------------
  // --- Stem: Sovereign Fluted Corinthian Colonnade with Floating Gem ---
  // ---------------------------------------------------------------------------
  const stemLower = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.92, 0.62, 32), silverMat);
  stemLower.position.y = 1.34;
  trophyGroup.add(stemLower);

  // Floating Prismatic Celestial Diamond inside Colonnade Sanctuary
  const gemMesh = new THREE.Mesh(new THREE.IcosahedronGeometry(0.42, 0), gemMat);
  gemMesh.position.y = 1.96;
  gemMesh.name = 'trophy_gem';
  trophyGroup.add(gemMesh);

  // Inner Gem Point Light (casts dynamic blue radiance through columns)
  const gemLight = new THREE.PointLight(0x00f0ff, isUnlocked ? 1.8 : 0.6, 3.5);
  gemLight.position.y = 1.96;
  trophyGroup.add(gemLight);

  // 6 Fluted Corinthian Pillars surrounding gem
  const pillarCount = 6;
  for (let i = 0; i < pillarCount; i++) {
    const angle = (i / pillarCount) * Math.PI * 2;
    const px = Math.cos(angle) * 0.48;
    const pz = Math.sin(angle) * 0.48;

    // Pillar shaft
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.85, 16), goldTrimMat);
    pillar.position.set(px, 1.96, pz);
    trophyGroup.add(pillar);

    // Pillar Capital
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.07, 0.08, 12), goldTrimMat);
    cap.position.set(px, 2.39, pz);
    trophyGroup.add(cap);

    // Pillar Base
    const baseP = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.1, 0.08, 12), goldTrimMat);
    baseP.position.set(px, 1.54, pz);
    trophyGroup.add(baseP);
  }

  const stemUpper = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.42, 0.62, 32), silverMat);
  stemUpper.position.y = 2.58;
  trophyGroup.add(stemUpper);

  // ---------------------------------------------------------------------------
  // --- Trophy Bowl / Chalice (Iconic UEFA Champions League Body) ---
  // ---------------------------------------------------------------------------
  const chaliceBase = new THREE.Mesh(new THREE.CylinderGeometry(1.28, 0.76, 0.52, 36), silverMat);
  chaliceBase.position.y = 3.08;
  trophyGroup.add(chaliceBase);

  // Embossed Golden Laurel Waist Ring
  const waistRing = new THREE.Mesh(new THREE.TorusGeometry(1.3, 0.05, 16, 48), goldTrimMat);
  waistRing.rotation.x = Math.PI / 2;
  waistRing.position.y = 3.34;
  trophyGroup.add(waistRing);

  // Chalice Outer Wall (Mirror Sterling Silver)
  const chaliceBowl = new THREE.Mesh(new THREE.CylinderGeometry(1.58, 1.28, 1.45, 48, 1, true), silverMat);
  chaliceBowl.position.y = 4.02;
  trophyGroup.add(chaliceBowl);

  // Chalice Inner Wall (Warm 24K Vermeil Gold Plating)
  const chaliceInner = new THREE.Mesh(new THREE.CylinderGeometry(1.49, 1.18, 1.4, 48, 1, true), vermeilInnerMat);
  chaliceInner.position.y = 4.07;
  trophyGroup.add(chaliceInner);

  // Chalice Inner Floor
  const innerFloor = new THREE.Mesh(new THREE.CircleGeometry(1.18, 36), vermeilInnerMat);
  innerFloor.rotation.x = -Math.PI / 2;
  innerFloor.position.y = 3.38;
  trophyGroup.add(innerFloor);

  // Chalice 24K Gold Beaded Rim
  const bowlRim = new THREE.Mesh(new THREE.TorusGeometry(1.58, 0.1, 16, 48), goldTrimMat);
  bowlRim.rotation.x = Math.PI / 2;
  bowlRim.position.y = 4.75;
  trophyGroup.add(bowlRim);

  // 8 Royal Sapphire & Diamond Jewels set along the chalice rim
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const isDiamond = (i % 2 === 0);
    const gemGeo = new THREE.OctahedronGeometry(0.08, 0);
    const gem = new THREE.Mesh(gemGeo, isDiamond ? gemMat : sapphireMat);
    gem.position.set(Math.cos(angle) * 1.58, 4.82, Math.sin(angle) * 1.58);
    trophyGroup.add(gem);

    // Gold bezel prong
    const bezel = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.08, 0.06, 12), goldTrimMat);
    bezel.position.set(Math.cos(angle) * 1.58, 4.77, Math.sin(angle) * 1.58);
    trophyGroup.add(bezel);
  }

  // ---------------------------------------------------------------------------
  // --- Iconic UEFA Champions "Tai Voi" (Elephant Ears) Grand Handles ---
  // ---------------------------------------------------------------------------
  const handlePointsRight = [
    new THREE.Vector3(1.24, 3.28, 0),    // Lower chalice anchor
    new THREE.Vector3(2.26, 3.45, 0),    // Sweeps broad outward
    new THREE.Vector3(2.68, 4.25, 0),    // Tall outer apex loop (Tai Voi crest)
    new THREE.Vector3(2.35, 4.98, 0),    // Soars proudly above trophy rim!
    new THREE.Vector3(1.56, 4.75, 0)     // Anchors securely into rim
  ];

  const rightCurve = new THREE.CatmullRomCurve3(handlePointsRight);
  const handleRightGeo = new THREE.TubeGeometry(rightCurve, 48, 0.105, 16, false);
  const handleRight = new THREE.Mesh(handleRightGeo, silverMat);
  trophyGroup.add(handleRight);

  // 24K Gold Acanthus Leaf Crest atop right handle apex
  const crestRight = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.4, 8), goldTrimMat);
  crestRight.position.set(2.42, 5.08, 0);
  crestRight.rotation.z = -Math.PI * 0.18;
  trophyGroup.add(crestRight);

  // Left Handle: Exact negative X mirror for 100% bilateral symmetry
  const handlePointsLeft = handlePointsRight.map(p => new THREE.Vector3(-p.x, p.y, p.z));
  const leftCurve = new THREE.CatmullRomCurve3(handlePointsLeft);
  const handleLeftGeo = new THREE.TubeGeometry(leftCurve, 48, 0.105, 16, false);
  const handleLeft = new THREE.Mesh(handleLeftGeo, silverMat);
  trophyGroup.add(handleLeft);

  const crestLeft = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.4, 8), goldTrimMat);
  crestLeft.position.set(-2.42, 5.08, 0);
  crestLeft.rotation.z = Math.PI * 0.18;
  trophyGroup.add(crestLeft);

  // ---------------------------------------------------------------------------
  // --- Floating "2048" Crown Jewel Hypercube & Astral Coordinate Rings ---
  // ---------------------------------------------------------------------------
  const crownGroup = new THREE.Group();
  crownGroup.position.y = 5.15;
  crownGroup.name = 'trophy_crown_group';

  // 2048 Core Cube
  const crownCube = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.85, 0.85), crownCubeMat);
  crownCube.name = 'trophy_crown_cube';
  crownGroup.add(crownCube);

  // Outer Golden Filigree Cage Bevels
  const cageEdges = new THREE.EdgesGeometry(new THREE.BoxGeometry(0.92, 0.92, 0.92));
  const cageLine = new THREE.LineSegments(cageEdges, new THREE.LineBasicMaterial({ color: 0xffd700, linewidth: 2 }));
  crownGroup.add(cageLine);

  // Radiant Golden Diadem Crown atop Cube
  const diademGeo = new THREE.CylinderGeometry(0.42, 0.32, 0.22, 16, 1, true);
  const diadem = new THREE.Mesh(diademGeo, goldTrimMat);
  diadem.position.y = 0.55;
  crownGroup.add(diadem);

  // 8 Crown Diadem Diamond Spikes
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const spike = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.22, 8), gemMat);
    spike.position.set(Math.cos(angle) * 0.42, 0.72, Math.sin(angle) * 0.42);
    crownGroup.add(spike);
  }

  trophyGroup.add(crownGroup);

  // Inner Chalice Warm Glow Light
  const chaliceLight = new THREE.PointLight(0xffb703, isUnlocked ? 2.2 : 0.8, 4.5);
  chaliceLight.position.y = 4.2;
  trophyGroup.add(chaliceLight);

  // Orbiting Astral Gyro Rings
  const ring1 = new THREE.Mesh(
    new THREE.TorusGeometry(2.25, 0.028, 16, 72),
    new THREE.MeshBasicMaterial({ color: 0xffd700, transparent: true, opacity: isUnlocked ? 0.95 : 0.45 })
  );
  ring1.rotation.x = Math.PI * 0.35;
  ring1.position.y = 4.2;
  ring1.name = 'trophy_ring_1';
  trophyGroup.add(ring1);

  const ring2 = new THREE.Mesh(
    new THREE.TorusGeometry(2.45, 0.024, 16, 72),
    new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: isUnlocked ? 0.85 : 0.35 })
  );
  ring2.rotation.x = -Math.PI * 0.35;
  ring2.rotation.z = Math.PI * 0.25;
  ring2.position.y = 4.2;
  ring2.name = 'trophy_ring_2';
  trophyGroup.add(ring2);

  // Volumetric Golden God Ray Cylinder
  const godRayGeo = new THREE.CylinderGeometry(0.9, 0.4, 4.5, 32, 1, true);
  const godRayMat = new THREE.MeshBasicMaterial({
    color: 0xffea00,
    transparent: true,
    opacity: isUnlocked ? 0.16 : 0.06,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const godRay = new THREE.Mesh(godRayGeo, godRayMat);
  godRay.position.y = 5.4;
  godRay.name = 'trophy_god_ray';
  trophyGroup.add(godRay);

  // ---------------------------------------------------------------------------
  // --- Swirling Double-Helix Golden Stardust & Diamond Motes Particle Cloud ---
  // ---------------------------------------------------------------------------
  const starCount = isUnlocked ? 120 : 40;
  const starGeo = new THREE.BufferGeometry();
  const starPositions = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    const t = i / starCount;
    const r = 1.2 + Math.random() * 1.6;
    const theta = t * Math.PI * 10 + Math.random() * 0.5;
    starPositions[i * 3] = r * Math.cos(theta);
    starPositions[i * 3 + 1] = 1.2 + t * 4.6 + (Math.random() - 0.5) * 0.4;
    starPositions[i * 3 + 2] = r * Math.sin(theta);
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));

  const starMat = new THREE.PointsMaterial({
    color: 0xfffae0,
    size: 0.12,
    transparent: true,
    opacity: isUnlocked ? 0.95 : 0.55,
    blending: THREE.AdditiveBlending
  });
  const stars = new THREE.Points(starGeo, starMat);
  stars.name = 'trophy_stars';
  trophyGroup.add(stars);

  // ---------------------------------------------------------------------------
  // Dynamic Sparkle Glint Sprite (Traveling Bling Highlight)
  // ---------------------------------------------------------------------------
  const sparkleTex = createSparkleTexture();
  const sparkleMat = new THREE.SpriteMaterial({
    map: sparkleTex,
    color: 0xffffff,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending
  });
  const sparkleSprite = new THREE.Sprite(sparkleMat);
  sparkleSprite.scale.set(0.9, 0.9, 1);
  sparkleSprite.name = 'trophy_sparkle_sprite';
  sparkleSprite.position.set(1.58, 4.85, 0.2);
  trophyGroup.add(sparkleSprite);

  trophyGroup.scale.set(0.64, 0.64, 0.64);
  trophyGroup.position.y = -1.68;

  return trophyGroup;
}


// =============================================================================
// 2. SEKIRO / ISSHIN ASHINA BOSS SLAYER TROPHY ("不死斬り • KẺ HỦY DIỆT HƯ KHÔNG")
// =============================================================================
export function createBossTrophyMesh(isUnlocked = true) {
  const trophyGroup = new THREE.Group();
  trophyGroup.name = 'trophy_3d_boss_slayer';

  // ---------------------------------------------------------------------------
  // Plaque Texture: Dark Crimson Japanese Calligraphy & Void Seals
  // ---------------------------------------------------------------------------
  const plaqueCanvas = document.createElement('canvas');
  plaqueCanvas.width = 512;
  plaqueCanvas.height = 140;
  const pCtx = plaqueCanvas.getContext('2d');

  const pGrad = pCtx.createLinearGradient(0, 0, 512, 140);
  if (isUnlocked) {
    pGrad.addColorStop(0, '#1a0404');
    pGrad.addColorStop(0.5, '#450a0a');
    pGrad.addColorStop(1, '#1a0404');
  } else {
    pGrad.addColorStop(0, '#09090b');
    pGrad.addColorStop(0.5, '#18181b');
    pGrad.addColorStop(1, '#09090b');
  }
  pCtx.fillStyle = pGrad;
  pCtx.fillRect(0, 0, 512, 140);

  // Blood-Crimson Borders
  pCtx.strokeStyle = isUnlocked ? '#ef4444' : '#52525b';
  pCtx.lineWidth = 6;
  pCtx.strokeRect(6, 6, 500, 128);
  pCtx.strokeStyle = isUnlocked ? '#fca5a5' : '#27272a';
  pCtx.lineWidth = 2;
  pCtx.strokeRect(12, 12, 488, 116);

  // Plaque Typography
  pCtx.textAlign = 'center';
  pCtx.textBaseline = 'middle';
  if (isUnlocked) {
    pCtx.font = '900 32px "Segoe UI", Arial, sans-serif';
    pCtx.fillStyle = '#fef2f2';
    pCtx.shadowColor = '#dc2626';
    pCtx.shadowBlur = 18;
    pCtx.fillText(t('trophy_plaque_boss_title_unlocked') || '⚔ SINGULARITY SLAYER ⚔', 256, 48);

    pCtx.font = 'bold 20px "Segoe UI", Arial, sans-serif';
    pCtx.fillStyle = '#f87171';
    pCtx.shadowColor = '#991b1b';
    pCtx.shadowBlur = 10;
    pCtx.fillText(t('trophy_plaque_boss_sub_unlocked') || 'KẺ THANH TRỪNG HƯ KHÔNG — ENTITY SEVERED', 256, 96);
  } else {
    pCtx.font = '900 30px "Segoe UI", Arial, sans-serif';
    pCtx.fillStyle = '#71717a';
    pCtx.shadowColor = '#000';
    pCtx.shadowBlur = 8;
    pCtx.fillText(t('trophy_plaque_boss_title_locked') || '🔒 CÚP TRẢM THẦN HƯ KHÔNG', 256, 48);

    pCtx.font = 'bold 18px "Segoe UI", Arial, sans-serif';
    pCtx.fillStyle = '#52525b';
    pCtx.fillText(t('trophy_plaque_boss_sub_locked') || 'TIÊU DIỆT TRÙM SINGULARITY ĐỂ MỞ', 256, 96);
  }
  const plaqueTex = new THREE.CanvasTexture(plaqueCanvas);

  // ---------------------------------------------------------------------------
  // Materials: Damascus Steel, Blood-Gold, Obsidian & Void Plasma
  // ---------------------------------------------------------------------------
  const obsidianMat = new THREE.MeshPhysicalMaterial({
    color: 0x07040a,
    roughness: 0.15,
    metalness: 0.85,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    emissive: 0x200308,
    emissiveIntensity: isUnlocked ? 0.45 : 0.15
  });

  const bloodSteelMat = new THREE.MeshPhysicalMaterial({
    color: isUnlocked ? 0x1f0b12 : 0x27272a,
    roughness: 0.12,
    metalness: 0.98,
    clearcoat: 1.0,
    clearcoatRoughness: 0.04,
    emissive: isUnlocked ? 0x7f1d1d : 0x09090b,
    emissiveIntensity: isUnlocked ? 0.65 : 0.2
  });

  const bladeEdgeMat = new THREE.MeshPhysicalMaterial({
    color: 0xfca5a5,
    roughness: 0.04,
    metalness: 0.98,
    clearcoat: 1.0,
    emissive: 0xdc2626,
    emissiveIntensity: isUnlocked ? 0.95 : 0.25
  });

  const crimsonGoldMat = new THREE.MeshPhysicalMaterial({
    color: 0xef4444,
    roughness: 0.1,
    metalness: 0.92,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    emissive: 0x991b1b,
    emissiveIntensity: isUnlocked ? 0.75 : 0.25
  });

  const plaqueMat = new THREE.MeshBasicMaterial({
    map: plaqueTex,
    transparent: true
  });

  // ---------------------------------------------------------------------------
  // --- Pedestal Base: Dark Tiered Obsidian Shrine with Dragon Talons ---
  // ---------------------------------------------------------------------------
  const baseStep1 = new THREE.Mesh(new THREE.CylinderGeometry(1.75, 2.05, 0.48, 8), obsidianMat);
  baseStep1.position.y = 0.24;
  trophyGroup.add(baseStep1);

  const baseRing1 = new THREE.Mesh(new THREE.TorusGeometry(1.72, 0.06, 12, 32), crimsonGoldMat);
  baseRing1.rotation.x = Math.PI / 2;
  baseRing1.position.y = 0.48;
  trophyGroup.add(baseRing1);

  const baseStep2 = new THREE.Mesh(new THREE.CylinderGeometry(1.42, 1.68, 0.58, 8), obsidianMat);
  baseStep2.position.y = 0.48 + 0.29;
  trophyGroup.add(baseStep2);

  const baseCollar = new THREE.Mesh(new THREE.CylinderGeometry(1.22, 1.48, 0.18, 8), crimsonGoldMat);
  baseCollar.position.y = 1.06;
  trophyGroup.add(baseCollar);

  // Front Curved Plaque
  const plaqueGeo = new THREE.CylinderGeometry(1.44, 1.68, 0.46, 36, 1, true, -Math.PI * 0.32, Math.PI * 0.64);
  const plaqueMesh = new THREE.Mesh(plaqueGeo, plaqueMat);
  plaqueMesh.position.y = 0.77;
  plaqueMesh.rotation.y = Math.PI;
  trophyGroup.add(plaqueMesh);

  // Floor-Projected Crimson Blood Mandala
  const mandalaTex = createMandalaTexture('boss');
  const mandalaGeo = new THREE.PlaneGeometry(5.2, 5.2);
  const mandalaMat = new THREE.MeshBasicMaterial({
    map: mandalaTex,
    transparent: true,
    opacity: isUnlocked ? 0.88 : 0.45,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending
  });
  const mandalaMesh = new THREE.Mesh(mandalaGeo, mandalaMat);
  mandalaMesh.rotation.x = -Math.PI / 2;
  mandalaMesh.position.y = 0.02;
  mandalaMesh.name = 'boss_mandala';
  trophyGroup.add(mandalaMesh);

  // ---------------------------------------------------------------------------
  // --- Stem: Dark Dragon Pillar with 4 Talons ---
  // ---------------------------------------------------------------------------
  const stemLower = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.95, 0.68, 16), bloodSteelMat);
  stemLower.position.y = 1.42;
  trophyGroup.add(stemLower);

  // 4 Dark Guard Talons
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2;
    const talonGeo = new THREE.ConeGeometry(0.09, 0.58, 8);
    const talon = new THREE.Mesh(talonGeo, crimsonGoldMat);
    talon.position.set(Math.cos(angle) * 0.54, 1.46, Math.sin(angle) * 0.54);
    talon.rotation.x = Math.PI * 0.2;
    talon.rotation.y = angle;
    trophyGroup.add(talon);
  }

  // ---------------------------------------------------------------------------
  // --- Crossed Mythic Katana Swords (Kusabimaru & Mortal Blade Style) ---
  // ---------------------------------------------------------------------------
  const makeKatana = (angleZ, isMortal) => {
    const swordGroup = new THREE.Group();

    // Hilt / Tsuka
    const hiltGeo = new THREE.CylinderGeometry(0.048, 0.048, 0.78, 12);
    const hiltMat = new THREE.MeshPhysicalMaterial({
      color: isMortal ? 0x450a0a : 0x18181b,
      roughness: 0.4,
      metalness: 0.6,
      clearcoat: 0.8
    });
    const hilt = new THREE.Mesh(hiltGeo, hiltMat);
    hilt.position.y = -1.22;
    swordGroup.add(hilt);

    // Tsuba / Dragon Guard
    const tsubaGeo = new THREE.CylinderGeometry(0.19, 0.19, 0.045, 16);
    const tsuba = new THREE.Mesh(tsubaGeo, crimsonGoldMat);
    tsuba.position.y = -0.82;
    swordGroup.add(tsuba);

    // Habaki Blade Collar
    const habaki = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.12, 12), crimsonGoldMat);
    habaki.position.y = -0.74;
    swordGroup.add(habaki);

    // Blade
    const bladeGeo = new THREE.BoxGeometry(0.042, 2.25, 0.125);
    const blade = new THREE.Mesh(bladeGeo, isMortal ? bladeEdgeMat : bloodSteelMat);
    blade.position.y = 0.35;
    swordGroup.add(blade);

    // Sharp Edge Spine
    const edgeGeo = new THREE.BoxGeometry(0.016, 2.22, 0.045);
    const edge = new THREE.Mesh(edgeGeo, bladeEdgeMat);
    edge.position.set(0, 0.35, 0.075);
    swordGroup.add(edge);

    swordGroup.rotation.z = angleZ;
    return swordGroup;
  };

  const sword1 = makeKatana(-Math.PI * 0.15, true);  // Mortal Blade (Crimson Death Flame)
  sword1.position.set(0, 2.5, -0.15);
  trophyGroup.add(sword1);

  const sword2 = makeKatana(Math.PI * 0.15, false);  // Kusabimaru (Shadow Damascus Steel)
  sword2.position.set(0, 2.5, 0.15);
  trophyGroup.add(sword2);

  // ---------------------------------------------------------------------------
  // --- Chalice Altar & Spiked Wyrm Dragon Handles ---
  // ---------------------------------------------------------------------------
  const chaliceBase = new THREE.Mesh(new THREE.CylinderGeometry(1.28, 0.78, 0.52, 16), obsidianMat);
  chaliceBase.position.y = 3.12;
  trophyGroup.add(chaliceBase);

  const chaliceBowl = new THREE.Mesh(new THREE.CylinderGeometry(1.58, 1.28, 1.35, 16), bloodSteelMat);
  chaliceBowl.position.y = 3.98;
  trophyGroup.add(chaliceBowl);

  const innerMat = new THREE.MeshPhysicalMaterial({
    color: 0x1f0207,
    roughness: 0.18,
    metalness: 0.95,
    clearcoat: 1.0,
    emissive: 0x450a0a,
    emissiveIntensity: 0.5,
    side: THREE.BackSide
  });
  const chaliceInner = new THREE.Mesh(new THREE.CylinderGeometry(1.48, 1.18, 1.3, 16), innerMat);
  chaliceInner.position.y = 4.02;
  trophyGroup.add(chaliceInner);

  const bowlRim = new THREE.Mesh(new THREE.TorusGeometry(1.58, 0.1, 16, 48), crimsonGoldMat);
  bowlRim.rotation.x = Math.PI / 2;
  bowlRim.position.y = 4.65;
  trophyGroup.add(bowlRim);

  // Dual Spiked Wyrm Dragon Handles
  const handlePointsRight = [
    new THREE.Vector3(1.24, 3.28, 0),
    new THREE.Vector3(2.12, 3.48, 0),
    new THREE.Vector3(2.42, 4.15, 0),
    new THREE.Vector3(2.12, 4.72, 0),
    new THREE.Vector3(1.54, 4.65, 0)
  ];
  const rightCurve = new THREE.CatmullRomCurve3(handlePointsRight);
  const handleRightGeo = new THREE.TubeGeometry(rightCurve, 36, 0.095, 12, false);
  const handleRight = new THREE.Mesh(handleRightGeo, crimsonGoldMat);
  trophyGroup.add(handleRight);

  const handlePointsLeft = handlePointsRight.map(p => new THREE.Vector3(-p.x, p.y, p.z));
  const leftCurve = new THREE.CatmullRomCurve3(handlePointsLeft);
  const handleLeftGeo = new THREE.TubeGeometry(leftCurve, 36, 0.095, 12, false);
  const handleLeft = new THREE.Mesh(handleLeftGeo, crimsonGoldMat);
  trophyGroup.add(handleLeft);

  // ---------------------------------------------------------------------------
  // --- Miniature Dark Singularity Void Core Floating Above Chalice ---
  // ---------------------------------------------------------------------------
  const voidGroup = new THREE.Group();
  voidGroup.position.y = 5.05;
  voidGroup.name = 'boss_void_group';

  // Pitch-Black Event Horizon Core
  const voidCoreGeo = new THREE.SphereGeometry(0.58, 36, 36);
  const voidCoreMat = new THREE.MeshPhysicalMaterial({
    color: 0x010103,
    roughness: 0.05,
    metalness: 0.98,
    clearcoat: 1.0,
    emissive: 0x4c0519,
    emissiveIntensity: isUnlocked ? 1.0 : 0.35
  });
  const voidCore = new THREE.Mesh(voidCoreGeo, voidCoreMat);
  voidCore.name = 'boss_void_core';
  voidGroup.add(voidCore);

  // Dynamic Crimson Point Light from Singularity
  const voidLight = new THREE.PointLight(0xff1e27, isUnlocked ? 2.5 : 0.9, 5.0);
  voidGroup.add(voidLight);

  // Swirling Relativistic Crimson Accretion Disk
  const accretionGeo = new THREE.RingGeometry(0.62, 1.25, 48);
  const accretionMat = new THREE.MeshBasicMaterial({
    color: 0xef4444,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: isUnlocked ? 0.9 : 0.45,
    blending: THREE.AdditiveBlending
  });
  const accretionDisk = new THREE.Mesh(accretionGeo, accretionMat);
  accretionDisk.rotation.x = Math.PI / 3.2;
  accretionDisk.name = 'boss_accretion_disk';
  voidGroup.add(accretionDisk);

  // Secondary Orbiting Violet Photon Ring
  const ringGeo = new THREE.TorusGeometry(1.42, 0.028, 12, 64);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x8b5cf6,
    transparent: true,
    opacity: isUnlocked ? 0.85 : 0.4,
    blending: THREE.AdditiveBlending
  });
  const voidRing = new THREE.Mesh(ringGeo, ringMat);
  voidRing.rotation.x = -Math.PI / 3.8;
  voidRing.name = 'boss_void_ring';
  voidGroup.add(voidRing);

  trophyGroup.add(voidGroup);

  // ---------------------------------------------------------------------------
  // --- Floating Crimson Ember Ashes Particle Cloud ---
  // ---------------------------------------------------------------------------
  const emberCount = isUnlocked ? 95 : 35;
  const emberGeo = new THREE.BufferGeometry();
  const emberPositions = new Float32Array(emberCount * 3);
  for (let i = 0; i < emberCount; i++) {
    const r = 0.9 + Math.random() * 1.5;
    const theta = Math.random() * Math.PI * 2;
    const phi = (Math.random() - 0.5) * Math.PI;
    emberPositions[i * 3] = r * Math.cos(theta);
    emberPositions[i * 3 + 1] = 4.6 + r * Math.sin(phi);
    emberPositions[i * 3 + 2] = r * Math.sin(theta);
  }
  emberGeo.setAttribute('position', new THREE.BufferAttribute(emberPositions, 3));

  const emberMat = new THREE.PointsMaterial({
    color: 0xff3b30,
    size: 0.12,
    transparent: true,
    opacity: isUnlocked ? 0.95 : 0.55,
    blending: THREE.AdditiveBlending
  });
  const embers = new THREE.Points(emberGeo, emberMat);
  embers.name = 'boss_embers';
  trophyGroup.add(embers);

  // Dynamic Sparkle Glint Sprite
  const sparkleTex = createSparkleTexture();
  const sparkleMat = new THREE.SpriteMaterial({
    map: sparkleTex,
    color: 0xff4444,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending
  });
  const sparkleSprite = new THREE.Sprite(sparkleMat);
  sparkleSprite.scale.set(0.9, 0.9, 1);
  sparkleSprite.name = 'boss_sparkle_sprite';
  sparkleSprite.position.set(1.54, 4.75, 0.2);
  trophyGroup.add(sparkleSprite);

  trophyGroup.scale.set(0.64, 0.64, 0.64);
  trophyGroup.position.y = -1.68;

  return trophyGroup;
}

// Backward compatible export for existing callers
export function createTrophyMesh(isUnlocked = true) {
  return createChampionsTrophyMesh(isUnlocked);
}


// =============================================================================
// DEDICATED INTERACTIVE 3D TROPHY STUDIO VIEWER
// =============================================================================
export class TrophyModalViewer {
  constructor(canvasContainer) {
    this.container = canvasContainer;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.trophyGroup = null;
    this.animId = null;

    this.currentType = 'c1'; // 'c1' | 'boss'
    this.c1Unlocked = false;
    this.bossUnlocked = false;

    // Studio Environment & Lighting
    this.envMapC1 = null;
    this.envMapBoss = null;
    this.ambientLight = null;
    this.keyLight = null;
    this.rimLight = null;
    this.fillLight = null;
    this.bottomLight = null;
    this.movingAccentLight = null;

    // Interaction states
    this.isDragging = false;
    this.prevPointerX = 0;
    this.prevPointerY = 0;
    this.rotVelocityX = 0;
    this.rotVelocityY = 0;
    this.targetZoom = 6.2;
    this.currentZoom = 6.2;

    this.init();
  }

  init() {
    const width = this.container.clientWidth || 340;
    const height = this.container.clientHeight || 380;

    // 1. Scene & Camera
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    this.camera.position.set(0, 0.8, this.currentZoom);
    this.camera.lookAt(0, 0.5, 0);

    // 2. High-Precision Physical Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;
    this.container.appendChild(this.renderer.domElement);

    // 3. Procedural Studio HDRI Reflection Environments
    this.envMapC1 = createStudioEnvMap(this.renderer, 'c1');
    this.envMapBoss = createStudioEnvMap(this.renderer, 'boss');
    this.scene.environment = this.envMapC1;

    // 4. Studio Multi-Light Rig
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    this.scene.add(this.ambientLight);

    this.keyLight = new THREE.DirectionalLight(0xfffae0, 2.4);
    this.keyLight.position.set(4, 6, 5);
    this.scene.add(this.keyLight);

    this.rimLight = new THREE.DirectionalLight(0x00f0ff, 2.0);
    this.rimLight.position.set(-4, 3, -4);
    this.scene.add(this.rimLight);

    this.fillLight = new THREE.DirectionalLight(0xff00aa, 0.9);
    this.fillLight.position.set(3, -2, -3);
    this.scene.add(this.fillLight);

    this.bottomLight = new THREE.PointLight(0xffaa00, 1.6, 8);
    this.bottomLight.position.set(0, -1.5, 2);
    this.scene.add(this.bottomLight);

    // Dynamic Orbiting Specular Accent Light (creates traveling glints on metal)
    this.movingAccentLight = new THREE.PointLight(0xffffff, 2.5, 9);
    this.movingAccentLight.position.set(3, 4, 3);
    this.scene.add(this.movingAccentLight);

    // 5. Build Initial Trophy
    this.rebuildTrophyMesh();

    // 6. Setup 360° Drag & Smooth Wheel Zoom
    this.setupInteractions();

    // 7. Animation Loop
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
      this.targetZoom = Math.max(3.6, Math.min(8.2, this.targetZoom + zoomDelta));
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

    this.rebuildTrophyMesh();
    this.updateLightingForType();
  }

  setUnlocked(unlocked) {
    if (this.currentType === 'c1') {
      this.c1Unlocked = unlocked;
    } else {
      this.bossUnlocked = unlocked;
    }
    this.rebuildTrophyMesh();
  }

  updateLightingForType() {
    if (this.currentType === 'boss') {
      this.scene.environment = this.envMapBoss;

      this.ambientLight.color.setHex(0xffdddd);
      this.ambientLight.intensity = 0.75;

      this.keyLight.color.setHex(0xff3344);
      this.keyLight.intensity = 2.6;

      this.rimLight.color.setHex(0x8b5cf6);
      this.rimLight.intensity = 2.2;

      this.fillLight.color.setHex(0xd90429);
      this.fillLight.intensity = 1.3;

      this.bottomLight.color.setHex(0xff1100);
      this.bottomLight.intensity = 1.9;

      this.movingAccentLight.color.setHex(0xff7788);
    } else {
      this.scene.environment = this.envMapC1;

      this.ambientLight.color.setHex(0xffffff);
      this.ambientLight.intensity = 0.9;

      this.keyLight.color.setHex(0xfffae0);
      this.keyLight.intensity = 2.4;

      this.rimLight.color.setHex(0x00f0ff);
      this.rimLight.intensity = 2.0;

      this.fillLight.color.setHex(0xff00aa);
      this.fillLight.intensity = 0.95;

      this.bottomLight.color.setHex(0xffaa00);
      this.bottomLight.intensity = 1.6;

      this.movingAccentLight.color.setHex(0xfffae0);
    }
  }

  rebuildTrophyMesh() {
    if (this.trophyGroup) {
      this.scene.remove(this.trophyGroup);
      this.trophyGroup.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
          else obj.material.dispose();
        }
      });
    }

    if (this.currentType === 'boss') {
      this.trophyGroup = createBossTrophyMesh(this.bossUnlocked);
    } else {
      this.trophyGroup = createChampionsTrophyMesh(this.c1Unlocked);
    }
    this.scene.add(this.trophyGroup);
  }

  animate() {
    this.animId = requestAnimationFrame(this.animate);
    const time = performance.now() * 0.001;

    // Smooth camera zoom interpolation
    this.currentZoom += (this.targetZoom - this.currentZoom) * 0.1;
    this.camera.position.z = this.currentZoom;

    // Moving studio specular accent light (slow continuous orbit)
    if (this.movingAccentLight) {
      this.movingAccentLight.position.x = Math.sin(time * 0.8) * 4.2;
      this.movingAccentLight.position.z = Math.cos(time * 0.8) * 4.2;
      this.movingAccentLight.position.y = 3.5 + Math.sin(time * 1.2) * 1.2;
    }

    if (this.trophyGroup) {
      // Auto-rotation when not dragging
      if (!this.isDragging) {
        this.rotVelocityY *= 0.92;
        this.rotVelocityX *= 0.92;
        this.trophyGroup.rotation.y += 0.012 + this.rotVelocityY;
        this.trophyGroup.rotation.x += this.rotVelocityX;
        this.trophyGroup.rotation.x *= 0.95;
      }

      if (this.currentType === 'c1') {
        // Floating Crown Group Animation
        const crownGroup = this.trophyGroup.getObjectByName('trophy_crown_group');
        if (crownGroup) {
          crownGroup.rotation.y += 0.024;
          crownGroup.position.y = 5.15 + Math.sin(time * 2.8) * 0.12;
        }

        // Inner Prismatic Gem
        const gem = this.trophyGroup.getObjectByName('trophy_gem');
        if (gem) {
          gem.rotation.y += 0.038;
          gem.rotation.x += 0.018;
        }

        // Orbiting Astral Gyro Rings
        const ring1 = this.trophyGroup.getObjectByName('trophy_ring_1');
        if (ring1) ring1.rotation.y += 0.022;

        const ring2 = this.trophyGroup.getObjectByName('trophy_ring_2');
        if (ring2) ring2.rotation.y -= 0.018;

        // God ray breathing aura
        const godRay = this.trophyGroup.getObjectByName('trophy_god_ray');
        if (godRay) {
          godRay.material.opacity = 0.12 + Math.sin(time * 2.2) * 0.06;
          godRay.rotation.y -= 0.008;
        }

        // Rising Golden Stardust
        const stars = this.trophyGroup.getObjectByName('trophy_stars');
        if (stars) {
          stars.rotation.y += 0.008;
        }

        // Celestial Mandala Floor Projection
        const mandala = this.trophyGroup.getObjectByName('trophy_mandala');
        if (mandala) {
          mandala.rotation.z += 0.004;
        }

        // Traveling Specular Bling Sparkle Glint
        const sparkle = this.trophyGroup.getObjectByName('trophy_sparkle_sprite');
        if (sparkle) {
          const sparkleCycle = (time * 1.4) % 6;
          if (sparkleCycle < 1.2) {
            // Pulse at right rim
            const s = Math.sin((sparkleCycle / 1.2) * Math.PI);
            sparkle.position.set(1.58, 4.82, 0.2);
            sparkle.scale.set(s * 1.1, s * 1.1, 1);
            sparkle.material.opacity = s * 0.95;
          } else if (sparkleCycle > 3.0 && sparkleCycle < 4.2) {
            // Pulse at left Tai Voi crest
            const s = Math.sin(((sparkleCycle - 3.0) / 1.2) * Math.PI);
            sparkle.position.set(-2.4, 5.08, 0.1);
            sparkle.scale.set(s * 1.2, s * 1.2, 1);
            sparkle.material.opacity = s * 0.95;
          } else {
            sparkle.material.opacity = 0;
          }
        }
      } else {
        // Boss Slayer Animations: Swirling Void Core & Accretion Disk
        const voidGroup = this.trophyGroup.getObjectByName('boss_void_group');
        if (voidGroup) {
          voidGroup.position.y = 5.05 + Math.sin(time * 2.5) * 0.1;
        }

        const voidCore = this.trophyGroup.getObjectByName('boss_void_core');
        if (voidCore) {
          voidCore.rotation.y -= 0.035;
        }

        const accretionDisk = this.trophyGroup.getObjectByName('boss_accretion_disk');
        if (accretionDisk) {
          accretionDisk.rotation.z += 0.045;
        }

        const voidRing = this.trophyGroup.getObjectByName('boss_void_ring');
        if (voidRing) {
          voidRing.rotation.z -= 0.028;
        }

        const embers = this.trophyGroup.getObjectByName('boss_embers');
        if (embers) {
          embers.rotation.y += 0.014;
          embers.position.y = Math.sin(time * 1.8) * 0.08;
        }

        const mandala = this.trophyGroup.getObjectByName('boss_mandala');
        if (mandala) {
          mandala.rotation.z -= 0.005;
        }

        // Boss Sparkle Glint (travels along Mortal Blade)
        const sparkle = this.trophyGroup.getObjectByName('boss_sparkle_sprite');
        if (sparkle) {
          const sparkleCycle = (time * 1.3) % 5;
          if (sparkleCycle < 1.2) {
            const s = Math.sin((sparkleCycle / 1.2) * Math.PI);
            sparkle.position.set(0.65, 3.8, 0.1);
            sparkle.scale.set(s * 1.1, s * 1.1, 1);
            sparkle.material.opacity = s * 0.9;
          } else {
            sparkle.material.opacity = 0;
          }
        }
      }
    }

    this.renderer.render(this.scene, this.camera);
  }

  resize() {
    if (!this.container || !this.renderer) return;
    const width = this.container.clientWidth || 340;
    const height = this.container.clientHeight || 380;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  destroy() {
    if (this.animId) cancelAnimationFrame(this.animId);
    if (this._cleanupEvents) this._cleanupEvents();
    if (this.trophyGroup) {
      this.scene.remove(this.trophyGroup);
    }
    if (this.renderer && this.renderer.domElement && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
    if (this.renderer) this.renderer.dispose();
  }
}
