import * as THREE from 'three';

/**
 * Procedural 3D Trophies & Interactive Modal Viewer
 * 1. UEFA Champions League C1 Style: "Tai Voi" Grand Silver & Gold 2048 Master Trophy
 * 2. Sekiro / Isshin Ashina Style: Dark Singularity Slayer "不死斬り" Katana Trophy
 */

// =============================================================================
// 1. UEFA CHAMPIONS LEAGUE C1 STYLE TROPHY (7/7 Quests Master)
// =============================================================================
export function createChampionsTrophyMesh(isUnlocked = true) {
  const trophyGroup = new THREE.Group();
  trophyGroup.name = 'trophy_3d_c1_champions';

  // Plaque Texture
  const plaqueCanvas = document.createElement('canvas');
  plaqueCanvas.width = 512;
  plaqueCanvas.height = 140;
  const pCtx = plaqueCanvas.getContext('2d');

  const pGrad = pCtx.createLinearGradient(0, 0, 512, 140);
  if (isUnlocked) {
    pGrad.addColorStop(0, '#0a1128');
    pGrad.addColorStop(0.5, '#1c2d5a');
    pGrad.addColorStop(1, '#0a1128');
  } else {
    pGrad.addColorStop(0, '#0f172a');
    pGrad.addColorStop(0.5, '#1e293b');
    pGrad.addColorStop(1, '#0f172a');
  }
  pCtx.fillStyle = pGrad;
  pCtx.fillRect(0, 0, 512, 140);

  // Borders
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
    pCtx.fillText('★ CHAMPIONS OF 2048 ★', 256, 48);

    pCtx.font = 'bold 20px "Segoe UI", Arial, sans-serif';
    pCtx.fillStyle = '#ffd700';
    pCtx.shadowColor = '#ffaa00';
    pCtx.shadowBlur = 8;
    pCtx.fillText('TRI ÂN BẬC THẦY HOÀN THÀNH 7/7 NHIỆM VỤ', 256, 96);
  } else {
    pCtx.font = '900 32px "Segoe UI", Arial, sans-serif';
    pCtx.fillStyle = '#94a3b8';
    pCtx.shadowColor = '#000';
    pCtx.shadowBlur = 8;
    pCtx.fillText('🔒 CÚP BẬC THẦY 2048', 256, 48);

    pCtx.font = 'bold 18px "Segoe UI", Arial, sans-serif';
    pCtx.fillStyle = '#64748b';
    pCtx.fillText('HOÀN THÀNH 7 NHIỆM VỤ ĐỂ MỞ', 256, 96);
  }
  const plaqueTex = new THREE.CanvasTexture(plaqueCanvas);

  // 2048 Floating Cube Texture
  const cubeCanvas = document.createElement('canvas');
  cubeCanvas.width = 256;
  cubeCanvas.height = 256;
  const cCtx = cubeCanvas.getContext('2d');
  const cGrad = cCtx.createLinearGradient(0, 0, 256, 256);
  cGrad.addColorStop(0, '#ffffff');
  cGrad.addColorStop(0.5, '#e2e8f0');
  cGrad.addColorStop(1, '#94a3b8');
  cCtx.fillStyle = cGrad;
  cCtx.fillRect(0, 0, 256, 256);

  cCtx.strokeStyle = '#ffd700';
  cCtx.lineWidth = 12;
  cCtx.strokeRect(8, 8, 240, 240);

  cCtx.fillStyle = '#0f172a';
  cCtx.textAlign = 'center';
  cCtx.textBaseline = 'middle';
  cCtx.font = '900 86px "Segoe UI", Arial, sans-serif';
  cCtx.shadowColor = '#ffd700';
  cCtx.shadowBlur = 16;
  cCtx.fillText('2048', 128, 128);
  const cubeTex = new THREE.CanvasTexture(cubeCanvas);

  // Materials - Iconic UEFA Sterling Silver 925 & Imperial 24K Gold Trim
  const silverColor = 0xffffff;
  const silverMat = new THREE.MeshStandardMaterial({
    color: silverColor,
    roughness: isUnlocked ? 0.16 : 0.35,
    metalness: 0.58,
    emissive: 0xdbeafe,
    emissiveIntensity: isUnlocked ? 0.38 : 0.15
  });

  const goldTrimMat = new THREE.MeshStandardMaterial({
    color: 0xffd700,
    roughness: 0.18,
    metalness: 0.82,
    emissive: 0xd97706,
    emissiveIntensity: isUnlocked ? 0.45 : 0.2
  });

  const pedestalMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.35,
    metalness: 0.65,
    emissive: 0x1e293b,
    emissiveIntensity: 0.2
  });

  const plaqueMat = new THREE.MeshBasicMaterial({
    map: plaqueTex,
    transparent: true
  });

  const gemMat = new THREE.MeshStandardMaterial({
    color: 0x00f0ff,
    roughness: 0.08,
    metalness: 0.25,
    emissive: 0x0284c7,
    emissiveIntensity: isUnlocked ? 0.95 : 0.35,
    transparent: true,
    opacity: 0.92
  });

  const crownCubeMat = new THREE.MeshStandardMaterial({
    map: cubeTex,
    roughness: 0.18,
    metalness: 0.55,
    emissive: 0xf59e0b,
    emissiveIntensity: isUnlocked ? 0.5 : 0.2
  });

  // --- Pedestal Base ---
  const baseStep1 = new THREE.Mesh(new THREE.CylinderGeometry(1.65, 1.88, 0.45, 36), pedestalMat);
  baseStep1.position.y = 0.225;
  trophyGroup.add(baseStep1);

  const baseRing1 = new THREE.Mesh(new THREE.TorusGeometry(1.65, 0.05, 16, 48), goldTrimMat);
  baseRing1.rotation.x = Math.PI / 2;
  baseRing1.position.y = 0.45;
  trophyGroup.add(baseRing1);

  const baseStep2 = new THREE.Mesh(new THREE.CylinderGeometry(1.35, 1.55, 0.55, 36), pedestalMat);
  baseStep2.position.y = 0.45 + 0.275;
  trophyGroup.add(baseStep2);

  const baseCollar = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.38, 0.15, 36), goldTrimMat);
  baseCollar.position.y = 1.0;
  trophyGroup.add(baseCollar);

  // Front Curved Plaque
  const plaqueGeo = new THREE.CylinderGeometry(1.38, 1.56, 0.45, 36, 1, true, -Math.PI * 0.32, Math.PI * 0.64);
  const plaqueMesh = new THREE.Mesh(plaqueGeo, plaqueMat);
  plaqueMesh.position.y = 0.72;
  plaqueMesh.rotation.y = Math.PI;
  trophyGroup.add(plaqueMesh);

  // --- Stem Column ---
  const stemLower = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.85, 0.6, 32), silverMat);
  stemLower.position.y = 1.35;
  trophyGroup.add(stemLower);

  // Floating Diamond Gem Inside Stem Cutout
  const gemMesh = new THREE.Mesh(new THREE.OctahedronGeometry(0.35, 0), gemMat);
  gemMesh.position.y = 1.95;
  gemMesh.name = 'trophy_gem';
  trophyGroup.add(gemMesh);

  // Stem pillars surrounding gem
  const pillarCount = 4;
  for (let i = 0; i < pillarCount; i++) {
    const angle = (i / pillarCount) * Math.PI * 2;
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.8, 12), goldTrimMat);
    pillar.position.set(Math.cos(angle) * 0.42, 1.95, Math.sin(angle) * 0.42);
    trophyGroup.add(pillar);
  }

  const stemUpper = new THREE.Mesh(new THREE.CylinderGeometry(0.78, 0.38, 0.6, 32), silverMat);
  stemUpper.position.y = 2.55;
  trophyGroup.add(stemUpper);

  // --- Trophy Bowl / Chalice (Iconic Champions League Body) ---
  const chaliceBase = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 0.7, 0.5, 36), silverMat);
  chaliceBase.position.y = 3.05;
  trophyGroup.add(chaliceBase);

  // Chalice Outer Wall (openEnded so top is open)
  const chaliceBowl = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.2, 1.35, 36, 1, true), silverMat);
  chaliceBowl.position.y = 3.95;
  trophyGroup.add(chaliceBowl);

  // Chalice Inner Wall (bright silver-white interior)
  const innerMat = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9,
    roughness: 0.28,
    metalness: 0.45,
    emissive: 0x94a3b8,
    emissiveIntensity: 0.35,
    side: THREE.BackSide
  });
  const chaliceInner = new THREE.Mesh(new THREE.CylinderGeometry(1.42, 1.1, 1.3, 36, 1, true), innerMat);
  chaliceInner.position.y = 4.0;
  trophyGroup.add(chaliceInner);

  // Chalice Inner Base Floor (circular disk at bottom of cup)
  const innerFloor = new THREE.Mesh(new THREE.CircleGeometry(1.1, 36), innerMat);
  innerFloor.rotation.x = -Math.PI / 2;
  innerFloor.position.y = 3.36;
  trophyGroup.add(innerFloor);

  const bowlRim = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.09, 16, 48), goldTrimMat);
  bowlRim.rotation.x = Math.PI / 2;
  bowlRim.position.y = 4.62;
  trophyGroup.add(bowlRim);

  // --- Iconic UEFA Champions "Tai Voi" (Grand Elephant Ears) Handles ---
  const handlePointsRight = [
    new THREE.Vector3(1.18, 3.25, 0),    // Lower chalice anchor
    new THREE.Vector3(2.15, 3.4, 0),     // Sweeps broad outward
    new THREE.Vector3(2.55, 4.15, 0),    // Tall outer apex loop (Tai Voi crest)
    new THREE.Vector3(2.25, 4.85, 0),    // Soars above trophy rim!
    new THREE.Vector3(1.48, 4.62, 0)     // Anchors securely into rim
  ];

  const rightCurve = new THREE.CatmullRomCurve3(handlePointsRight);
  const handleRightGeo = new THREE.TubeGeometry(rightCurve, 40, 0.095, 16, false);
  const handleRight = new THREE.Mesh(handleRightGeo, silverMat);
  trophyGroup.add(handleRight);

  // Left handle: exact negative X mirroring for 100% bilateral symmetry
  const handlePointsLeft = handlePointsRight.map(p => new THREE.Vector3(-p.x, p.y, p.z));
  const leftCurve = new THREE.CatmullRomCurve3(handlePointsLeft);
  const handleLeftGeo = new THREE.TubeGeometry(leftCurve, 40, 0.095, 16, false);
  const handleLeft = new THREE.Mesh(handleLeftGeo, silverMat);
  trophyGroup.add(handleLeft);

  // --- Floating "2048" Crown Jewel ---
  const crownCube = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.78, 0.78), crownCubeMat);
  crownCube.position.y = 4.95;
  crownCube.name = 'trophy_crown_cube';
  trophyGroup.add(crownCube);

  // --- Orbiting Planetary Rings ---
  const ring1 = new THREE.Mesh(
    new THREE.TorusGeometry(2.1, 0.026, 12, 64),
    new THREE.MeshBasicMaterial({ color: 0xffd700, transparent: true, opacity: isUnlocked ? 0.9 : 0.5 })
  );
  ring1.rotation.x = Math.PI * 0.35;
  ring1.position.y = 4.0;
  ring1.name = 'trophy_ring_1';
  trophyGroup.add(ring1);

  const ring2 = new THREE.Mesh(
    new THREE.TorusGeometry(2.3, 0.022, 12, 64),
    new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: isUnlocked ? 0.8 : 0.4 })
  );
  ring2.rotation.x = -Math.PI * 0.35;
  ring2.rotation.z = Math.PI * 0.25;
  ring2.position.y = 4.0;
  ring2.name = 'trophy_ring_2';
  trophyGroup.add(ring2);

  // --- Golden Star Particles Cloud ---
  const starCount = isUnlocked ? 75 : 25;
  const starGeo = new THREE.BufferGeometry();
  const starPositions = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    const r = 1.3 + Math.random() * 1.6;
    const theta = Math.random() * Math.PI * 2;
    const phi = (Math.random() - 0.5) * Math.PI;
    starPositions[i * 3] = r * Math.cos(theta) * Math.cos(phi);
    starPositions[i * 3 + 1] = 4.0 + r * Math.sin(phi);
    starPositions[i * 3 + 2] = r * Math.sin(theta) * Math.cos(phi);
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));

  const starMat = new THREE.PointsMaterial({
    color: 0xffea70,
    size: 0.1,
    transparent: true,
    opacity: isUnlocked ? 0.95 : 0.6
  });
  const stars = new THREE.Points(starGeo, starMat);
  stars.name = 'trophy_stars';
  trophyGroup.add(stars);

  trophyGroup.scale.set(0.66, 0.66, 0.66);
  trophyGroup.position.y = -1.65;

  return trophyGroup;
}

// =============================================================================
// 2. SEKIRO / ISSHIN ASHINA BOSS SLAYER TROPHY ("不死斬り • KẺ HỦY DIỆT HƯ KHÔNG")
// =============================================================================
export function createBossTrophyMesh(isUnlocked = true) {
  const trophyGroup = new THREE.Group();
  trophyGroup.name = 'trophy_3d_boss_slayer';

  // Plaque Texture - Dark Crimson Japanese Calligraphy
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
    pCtx.fillText('⚔ SINGULARITY SLAYER ⚔', 256, 48);

    pCtx.font = 'bold 20px "Segoe UI", Arial, sans-serif';
    pCtx.fillStyle = '#f87171';
    pCtx.shadowColor = '#991b1b';
    pCtx.shadowBlur = 8;
    pCtx.fillText('KẺ THANH TRỪNG HƯ KHÔNG — ENTITY SEVERED', 256, 96);
  } else {
    pCtx.font = '900 30px "Segoe UI", Arial, sans-serif';
    pCtx.fillStyle = '#71717a';
    pCtx.shadowColor = '#000';
    pCtx.shadowBlur = 8;
    pCtx.fillText('🔒 CÚP TRẢM THẦN HƯ KHÔNG', 256, 48);

    pCtx.font = 'bold 18px "Segoe UI", Arial, sans-serif';
    pCtx.fillStyle = '#52525b';
    pCtx.fillText('TIÊU DIỆT TRÙM SINGULARITY ĐỂ MỞ', 256, 96);
  }
  const plaqueTex = new THREE.CanvasTexture(plaqueCanvas);

  // Materials - Dark Obsidian, Blood Damascus Steel, Void Emission
  const obsidianMat = new THREE.MeshStandardMaterial({
    color: 0x09050b,
    roughness: 0.35,
    metalness: 0.85,
    emissive: 0x200308,
    emissiveIntensity: isUnlocked ? 0.45 : 0.15
  });

  const bloodSteelMat = new THREE.MeshStandardMaterial({
    color: isUnlocked ? 0x1f0b12 : 0x27272a,
    roughness: 0.18,
    metalness: 0.95,
    emissive: isUnlocked ? 0x7f1d1d : 0x09090b,
    emissiveIntensity: isUnlocked ? 0.6 : 0.2
  });

  const bladeEdgeMat = new THREE.MeshStandardMaterial({
    color: 0xfca5a5,
    roughness: 0.08,
    metalness: 0.98,
    emissive: 0xdc2626,
    emissiveIntensity: isUnlocked ? 0.85 : 0.2
  });

  const crimsonGoldMat = new THREE.MeshStandardMaterial({
    color: 0xef4444,
    roughness: 0.15,
    metalness: 0.9,
    emissive: 0x991b1b,
    emissiveIntensity: isUnlocked ? 0.7 : 0.25
  });

  const plaqueMat = new THREE.MeshBasicMaterial({
    map: plaqueTex,
    transparent: true
  });

  // --- Pedestal Base (Dark Tiered Obsidian Shrine) ---
  const baseStep1 = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.95, 0.48, 8), obsidianMat);
  baseStep1.position.y = 0.24;
  trophyGroup.add(baseStep1);

  const baseRing1 = new THREE.Mesh(new THREE.TorusGeometry(1.68, 0.05, 12, 32), crimsonGoldMat);
  baseRing1.rotation.x = Math.PI / 2;
  baseRing1.position.y = 0.48;
  trophyGroup.add(baseRing1);

  const baseStep2 = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.62, 0.58, 8), obsidianMat);
  baseStep2.position.y = 0.48 + 0.29;
  trophyGroup.add(baseStep2);

  const baseCollar = new THREE.Mesh(new THREE.CylinderGeometry(1.18, 1.42, 0.16, 8), crimsonGoldMat);
  baseCollar.position.y = 1.06;
  trophyGroup.add(baseCollar);

  // Front Curved Plaque
  const plaqueGeo = new THREE.CylinderGeometry(1.42, 1.63, 0.45, 36, 1, true, -Math.PI * 0.32, Math.PI * 0.64);
  const plaqueMesh = new THREE.Mesh(plaqueGeo, plaqueMat);
  plaqueMesh.position.y = 0.77;
  plaqueMesh.rotation.y = Math.PI;
  trophyGroup.add(plaqueMesh);

  // --- Stem: Dark Dragon Pillar with Spikes ---
  const stemLower = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.9, 0.65, 16), bloodSteelMat);
  stemLower.position.y = 1.42;
  trophyGroup.add(stemLower);

  // 4 Dark Guard Talons
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2;
    const talonGeo = new THREE.ConeGeometry(0.08, 0.55, 8);
    const talon = new THREE.Mesh(talonGeo, crimsonGoldMat);
    talon.position.set(Math.cos(angle) * 0.52, 1.45, Math.sin(angle) * 0.52);
    talon.rotation.x = Math.PI * 0.2;
    talon.rotation.y = angle;
    trophyGroup.add(talon);
  }

  // --- Crossed Katana Swords (Kusabimaru & Mortal Blade Style) ---
  const makeKatana = (angleZ, isMortal) => {
    const swordGroup = new THREE.Group();

    // Hilt / Tsuka
    const hiltGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.75, 12);
    const hiltMat = new THREE.MeshStandardMaterial({
      color: isMortal ? 0x450a0a : 0x18181b,
      roughness: 0.4,
      metalness: 0.6
    });
    const hilt = new THREE.Mesh(hiltGeo, hiltMat);
    hilt.position.y = -1.2;
    swordGroup.add(hilt);

    // Tsuba / Guard
    const tsubaGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.04, 16);
    const tsuba = new THREE.Mesh(tsubaGeo, crimsonGoldMat);
    tsuba.position.y = -0.82;
    swordGroup.add(tsuba);

    // Blade
    const bladeGeo = new THREE.BoxGeometry(0.04, 2.2, 0.12);
    const blade = new THREE.Mesh(bladeGeo, isMortal ? bladeEdgeMat : bloodSteelMat);
    blade.position.y = 0.3;
    swordGroup.add(blade);

    // Sharp Edge Spine
    const edgeGeo = new THREE.BoxGeometry(0.015, 2.18, 0.04);
    const edge = new THREE.Mesh(edgeGeo, bladeEdgeMat);
    edge.position.set(0, 0.3, 0.07);
    swordGroup.add(edge);

    swordGroup.rotation.z = angleZ;
    return swordGroup;
  };

  const sword1 = makeKatana(-Math.PI * 0.15, true);  // Mortal Blade (Crimson)
  sword1.position.set(0, 2.5, -0.15);
  trophyGroup.add(sword1);

  const sword2 = makeKatana(Math.PI * 0.15, false);  // Kusabimaru (Shadow Steel)
  sword2.position.set(0, 2.5, 0.15);
  trophyGroup.add(sword2);

  // --- Chalice Altar / Dark Calderon ---
  const chaliceBase = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 0.75, 0.5, 16), obsidianMat);
  chaliceBase.position.y = 3.1;
  trophyGroup.add(chaliceBase);

  const chaliceBowl = new THREE.Mesh(new THREE.CylinderGeometry(1.55, 1.25, 1.3, 16), bloodSteelMat);
  chaliceBowl.position.y = 3.95;
  trophyGroup.add(chaliceBowl);

  const innerMat = new THREE.MeshStandardMaterial({
    color: 0x1f0207,
    roughness: 0.25,
    metalness: 0.9,
    side: THREE.BackSide
  });
  const chaliceInner = new THREE.Mesh(new THREE.CylinderGeometry(1.45, 1.15, 1.25, 16), innerMat);
  chaliceInner.position.y = 4.0;
  trophyGroup.add(chaliceInner);

  const bowlRim = new THREE.Mesh(new THREE.TorusGeometry(1.55, 0.09, 16, 48), crimsonGoldMat);
  bowlRim.rotation.x = Math.PI / 2;
  bowlRim.position.y = 4.6;
  trophyGroup.add(bowlRim);

  // Dual Spiked Wyrm Dragon Handles
  const handlePointsRight = [
    new THREE.Vector3(1.22, 3.25, 0),
    new THREE.Vector3(2.05, 3.45, 0),
    new THREE.Vector3(2.35, 4.1, 0),
    new THREE.Vector3(2.05, 4.65, 0),
    new THREE.Vector3(1.52, 4.6, 0)
  ];
  const rightCurve = new THREE.CatmullRomCurve3(handlePointsRight);
  const handleRightGeo = new THREE.TubeGeometry(rightCurve, 36, 0.09, 12, false);
  const handleRight = new THREE.Mesh(handleRightGeo, crimsonGoldMat);
  trophyGroup.add(handleRight);

  const handlePointsLeft = handlePointsRight.map(p => new THREE.Vector3(-p.x, p.y, p.z));
  const leftCurve = new THREE.CatmullRomCurve3(handlePointsLeft);
  const handleLeftGeo = new THREE.TubeGeometry(leftCurve, 36, 0.09, 12, false);
  const handleLeft = new THREE.Mesh(handleLeftGeo, crimsonGoldMat);
  trophyGroup.add(handleLeft);

  // --- Miniature Dark Singularity Void Core Floating Above Chalice ---
  const voidCoreGeo = new THREE.SphereGeometry(0.55, 36, 36);
  const voidCoreMat = new THREE.MeshStandardMaterial({
    color: 0x030306,
    roughness: 0.15,
    metalness: 0.98,
    emissive: 0x4c0519,
    emissiveIntensity: isUnlocked ? 0.9 : 0.3
  });
  const voidCore = new THREE.Mesh(voidCoreGeo, voidCoreMat);
  voidCore.position.y = 4.95;
  voidCore.name = 'boss_void_core';
  trophyGroup.add(voidCore);

  // Swirling Crimson Accretion Disk
  const accretionGeo = new THREE.RingGeometry(0.6, 1.15, 48);
  const accretionMat = new THREE.MeshBasicMaterial({
    color: 0xef4444,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: isUnlocked ? 0.85 : 0.4
  });
  const accretionDisk = new THREE.Mesh(accretionGeo, accretionMat);
  accretionDisk.position.y = 4.95;
  accretionDisk.rotation.x = Math.PI / 3.2;
  accretionDisk.name = 'boss_accretion_disk';
  trophyGroup.add(accretionDisk);

  // Swirling Secondary Purple Ring
  const ringGeo = new THREE.TorusGeometry(1.35, 0.025, 12, 64);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x8b5cf6,
    transparent: true,
    opacity: isUnlocked ? 0.8 : 0.4
  });
  const voidRing = new THREE.Mesh(ringGeo, ringMat);
  voidRing.position.y = 4.95;
  voidRing.rotation.x = -Math.PI / 3.8;
  voidRing.name = 'boss_void_ring';
  trophyGroup.add(voidRing);

  // --- Floating Crimson Ember Ashes Particle Cloud ---
  const emberCount = isUnlocked ? 80 : 30;
  const emberGeo = new THREE.BufferGeometry();
  const emberPositions = new Float32Array(emberCount * 3);
  for (let i = 0; i < emberCount; i++) {
    const r = 0.9 + Math.random() * 1.5;
    const theta = Math.random() * Math.PI * 2;
    const phi = (Math.random() - 0.5) * Math.PI;
    emberPositions[i * 3] = r * Math.cos(theta) * Math.cos(phi);
    emberPositions[i * 3 + 1] = 4.5 + r * Math.sin(phi);
    emberPositions[i * 3 + 2] = r * Math.sin(theta) * Math.cos(phi);
  }
  emberGeo.setAttribute('position', new THREE.BufferAttribute(emberPositions, 3));

  const emberMat = new THREE.PointsMaterial({
    color: 0xff3b30,
    size: 0.11,
    transparent: true,
    opacity: isUnlocked ? 0.95 : 0.55
  });
  const embers = new THREE.Points(emberGeo, emberMat);
  embers.name = 'boss_embers';
  trophyGroup.add(embers);

  trophyGroup.scale.set(0.66, 0.66, 0.66);
  trophyGroup.position.y = -1.65;

  return trophyGroup;
}

// Backward compatible export for existing callers
export function createTrophyMesh(isUnlocked = true) {
  return createChampionsTrophyMesh(isUnlocked);
}

/**
 * Dedicated Interactive 3D Trophy Modal Viewer
 * Seamlessly toggles between 'c1' (UEFA Champions 2048) and 'boss' (Sekiro Singularity Slayer)
 */
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

    // Studio Lights
    this.ambientLight = null;
    this.keyLight = null;
    this.rimLight = null;
    this.fillLight = null;
    this.bottomLight = null;

    // Interaction states
    this.isDragging = false;
    this.prevPointerX = 0;
    this.prevPointerY = 0;
    this.rotVelocityX = 0;
    this.rotVelocityY = 0;

    this.init();
  }

  init() {
    const width = this.container.clientWidth || 340;
    const height = this.container.clientHeight || 380;

    // 1. Scene & Camera
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    this.camera.position.set(0, 0.8, 6.2);
    this.camera.lookAt(0, 0.5, 0);

    // 2. Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.container.appendChild(this.renderer.domElement);

    // 3. Studio Lighting Setup
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    this.scene.add(this.ambientLight);

    this.keyLight = new THREE.DirectionalLight(0xfffae0, 2.2);
    this.keyLight.position.set(4, 6, 5);
    this.scene.add(this.keyLight);

    this.rimLight = new THREE.DirectionalLight(0x00f0ff, 1.8);
    this.rimLight.position.set(-4, 3, -4);
    this.scene.add(this.rimLight);

    this.fillLight = new THREE.DirectionalLight(0xff00aa, 0.9);
    this.fillLight.position.set(3, -2, -3);
    this.scene.add(this.fillLight);

    this.bottomLight = new THREE.PointLight(0xffaa00, 1.5, 8);
    this.bottomLight.position.set(0, -1.5, 2);
    this.scene.add(this.bottomLight);

    // 4. Initial Trophy Mesh
    this.rebuildTrophyMesh();

    // 5. Input Listeners for 360 Drag Interaction
    this.setupInteractions();

    // 6. Animation loop
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

    dom.style.cursor = 'grab';
    dom.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    this._cleanupEvents = () => {
      dom.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
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
      // Dark Crimson & Purple Atmosphere for Sekiro Boss
      this.ambientLight.color.setHex(0xffdddd);
      this.ambientLight.intensity = 0.7;

      this.keyLight.color.setHex(0xff3344);
      this.keyLight.intensity = 2.4;

      this.rimLight.color.setHex(0x8b5cf6);
      this.rimLight.intensity = 2.0;

      this.fillLight.color.setHex(0xd90429);
      this.fillLight.intensity = 1.2;

      this.bottomLight.color.setHex(0xff1100);
      this.bottomLight.intensity = 1.8;
    } else {
      // Brilliant Silver & Royal Gold for UEFA C1
      this.ambientLight.color.setHex(0xffffff);
      this.ambientLight.intensity = 0.85;

      this.keyLight.color.setHex(0xfffae0);
      this.keyLight.intensity = 2.2;

      this.rimLight.color.setHex(0x00f0ff);
      this.rimLight.intensity = 1.8;

      this.fillLight.color.setHex(0xff00aa);
      this.fillLight.intensity = 0.9;

      this.bottomLight.color.setHex(0xffaa00);
      this.bottomLight.intensity = 1.5;
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
        // Floating Crown Cube Animation
        const crownCube = this.trophyGroup.getObjectByName('trophy_crown_cube');
        if (crownCube) {
          crownCube.rotation.y += 0.025;
          crownCube.rotation.x = Math.sin(time * 2) * 0.15;
          crownCube.position.y = 4.95 + Math.sin(time * 3) * 0.12;
        }

        const gem = this.trophyGroup.getObjectByName('trophy_gem');
        if (gem) {
          gem.rotation.y += 0.04;
          gem.rotation.x += 0.02;
        }

        const ring1 = this.trophyGroup.getObjectByName('trophy_ring_1');
        if (ring1) ring1.rotation.y += 0.022;

        const ring2 = this.trophyGroup.getObjectByName('trophy_ring_2');
        if (ring2) ring2.rotation.y -= 0.018;

        const stars = this.trophyGroup.getObjectByName('trophy_stars');
        if (stars) stars.rotation.y += 0.006;
      } else {
        // Boss Slayer Animations: Swirling Void Core & Accretion Disk
        const voidCore = this.trophyGroup.getObjectByName('boss_void_core');
        if (voidCore) {
          voidCore.rotation.y -= 0.035;
          voidCore.position.y = 4.95 + Math.sin(time * 2.5) * 0.1;
        }

        const accretionDisk = this.trophyGroup.getObjectByName('boss_accretion_disk');
        if (accretionDisk) {
          accretionDisk.rotation.z += 0.04;
        }

        const voidRing = this.trophyGroup.getObjectByName('boss_void_ring');
        if (voidRing) {
          voidRing.rotation.z -= 0.025;
        }

        const embers = this.trophyGroup.getObjectByName('boss_embers');
        if (embers) {
          embers.rotation.y += 0.012;
          embers.position.y = Math.sin(time * 1.8) * 0.08;
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
