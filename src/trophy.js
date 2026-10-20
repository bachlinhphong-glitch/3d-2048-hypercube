import * as THREE from 'three';

/**
 * Procedural 3D 2048 Trophy & Interactive Modal Viewer
 * Honors player mastery with an exclusive, luxury 3D trophy.
 */

export function createTrophyMesh(isUnlocked = true) {
  const trophyGroup = new THREE.Group();
  trophyGroup.name = 'trophy_3d_master';

  // 1. Textures
  const plaqueCanvas = document.createElement('canvas');
  plaqueCanvas.width = 512;
  plaqueCanvas.height = 140;
  const pCtx = plaqueCanvas.getContext('2d');

  const pGrad = pCtx.createLinearGradient(0, 0, 512, 140);
  if (isUnlocked) {
    pGrad.addColorStop(0, '#1c1507');
    pGrad.addColorStop(0.5, '#3b2b10');
    pGrad.addColorStop(1, '#1c1507');
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
  pCtx.strokeStyle = isUnlocked ? '#fff275' : '#334155';
  pCtx.lineWidth = 2;
  pCtx.strokeRect(12, 12, 488, 116);

  // Plaque Typography
  pCtx.textAlign = 'center';
  pCtx.textBaseline = 'middle';
  if (isUnlocked) {
    pCtx.font = '900 36px "Segoe UI", Arial, sans-serif';
    pCtx.fillStyle = '#fffae0';
    pCtx.shadowColor = '#ffbb00';
    pCtx.shadowBlur = 16;
    pCtx.fillText('★ 2048 SUPREME MASTER ★', 256, 48);

    pCtx.font = 'bold 21px "Segoe UI", Arial, sans-serif';
    pCtx.fillStyle = '#ffcc00';
    pCtx.shadowBlur = 8;
    pCtx.fillText('TRI ÂN BẬC THẦY KHÔNG GIAN', 256, 96);
  } else {
    pCtx.font = '900 32px "Segoe UI", Arial, sans-serif';
    pCtx.fillStyle = '#94a3b8';
    pCtx.shadowColor = '#000';
    pCtx.shadowBlur = 8;
    pCtx.fillText('🔒 CÚP 2048 ĐỘC QUYỀN', 256, 48);

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
  if (isUnlocked) {
    cGrad.addColorStop(0, '#ffe066');
    cGrad.addColorStop(0.5, '#f59e0b');
    cGrad.addColorStop(1, '#d97706');
  } else {
    cGrad.addColorStop(0, '#475569');
    cGrad.addColorStop(1, '#1e293b');
  }
  cCtx.fillStyle = cGrad;
  cCtx.fillRect(0, 0, 256, 256);

  cCtx.strokeStyle = isUnlocked ? '#ffffff' : '#64748b';
  cCtx.lineWidth = 10;
  cCtx.strokeRect(8, 8, 240, 240);

  cCtx.fillStyle = '#ffffff';
  cCtx.textAlign = 'center';
  cCtx.textBaseline = 'middle';
  cCtx.font = '900 86px "Segoe UI", Arial, sans-serif';
  cCtx.shadowColor = isUnlocked ? '#ffd700' : '#000';
  cCtx.shadowBlur = isUnlocked ? 20 : 6;
  cCtx.fillText('2048', 128, 128);
  const cubeTex = new THREE.CanvasTexture(cubeCanvas);

  // 2. Materials
  const goldColor = isUnlocked ? 0xffd700 : 0x64748b;
  const goldShine = isUnlocked ? 0xfff085 : 0x94a3b8;
  const goldRough = isUnlocked ? 0.2 : 0.6;
  const goldMetal = isUnlocked ? 0.95 : 0.3;

  const goldMat = new THREE.MeshStandardMaterial({
    color: goldColor,
    roughness: goldRough,
    metalness: goldMetal,
    emissive: isUnlocked ? 0x332000 : 0x000000,
    emissiveIntensity: isUnlocked ? 0.35 : 0
  });

  const goldTrimMat = new THREE.MeshStandardMaterial({
    color: goldShine,
    roughness: goldRough * 0.7,
    metalness: 0.98,
    emissive: isUnlocked ? 0x442a00 : 0x000000,
    emissiveIntensity: isUnlocked ? 0.4 : 0
  });

  const pedestalMat = new THREE.MeshStandardMaterial({
    color: isUnlocked ? 0x0f141f : 0x0b0f17,
    roughness: 0.3,
    metalness: 0.6
  });

  const plaqueMat = new THREE.MeshBasicMaterial({
    map: plaqueTex,
    transparent: true
  });

  const gemMat = new THREE.MeshStandardMaterial({
    color: isUnlocked ? 0x00f0ff : 0x38bdf8,
    roughness: 0.1,
    metalness: 0.3,
    emissive: isUnlocked ? 0x00aaff : 0x002244,
    emissiveIntensity: isUnlocked ? 0.8 : 0.2,
    transparent: true,
    opacity: isUnlocked ? 0.95 : 0.5
  });

  const crownCubeMat = new THREE.MeshStandardMaterial({
    map: cubeTex,
    roughness: 0.15,
    metalness: isUnlocked ? 0.85 : 0.2,
    emissive: isUnlocked ? 0xff8800 : 0x000000,
    emissiveIntensity: isUnlocked ? 0.4 : 0
  });

  // 3. Geometry Construction

  // --- Pedestal Base ---
  // Lower step
  const baseStep1 = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.8, 0.45, 36), pedestalMat);
  baseStep1.position.y = 0.225;
  trophyGroup.add(baseStep1);

  // Lower gold ring
  const baseRing1 = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.045, 16, 48), goldTrimMat);
  baseRing1.rotation.x = Math.PI / 2;
  baseRing1.position.y = 0.45;
  trophyGroup.add(baseRing1);

  // Upper pedestal step
  const baseStep2 = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.48, 0.55, 36), pedestalMat);
  baseStep2.position.y = 0.45 + 0.275;
  trophyGroup.add(baseStep2);

  // Upper gold collar
  const baseCollar = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.32, 0.15, 36), goldTrimMat);
  baseCollar.position.y = 1.0;
  trophyGroup.add(baseCollar);

  // Front Curved Plaque
  const plaqueGeo = new THREE.CylinderGeometry(1.32, 1.5, 0.45, 36, 1, true, -Math.PI * 0.32, Math.PI * 0.64);
  const plaqueMesh = new THREE.Mesh(plaqueGeo, plaqueMat);
  plaqueMesh.position.y = 0.72;
  plaqueMesh.rotation.y = Math.PI; // Face forward
  trophyGroup.add(plaqueMesh);

  // --- Stem Column ---
  const stemLower = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.85, 0.6, 32), goldMat);
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

  const stemUpper = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.38, 0.6, 32), goldMat);
  stemUpper.position.y = 2.55;
  trophyGroup.add(stemUpper);

  // --- Trophy Bowl / Chalice ---
  // Chalice base flare
  const chaliceBase = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 0.65, 0.5, 36), goldMat);
  chaliceBase.position.y = 3.05;
  trophyGroup.add(chaliceBase);

  // Chalice main bowl
  const chaliceBowl = new THREE.Mesh(new THREE.CylinderGeometry(1.45, 1.15, 1.25, 36), goldMat);
  chaliceBowl.position.y = 3.9;
  trophyGroup.add(chaliceBowl);

  // Chalice inner depth cavity
  const innerMat = new THREE.MeshStandardMaterial({
    color: isUnlocked ? 0xffaa00 : 0x1e293b,
    roughness: 0.3,
    metalness: 0.9,
    side: THREE.BackSide
  });
  const chaliceInner = new THREE.Mesh(new THREE.CylinderGeometry(1.36, 1.05, 1.2, 36), innerMat);
  chaliceInner.position.y = 3.95;
  trophyGroup.add(chaliceInner);

  // Chalice gold top lip
  const bowlRim = new THREE.Mesh(new THREE.TorusGeometry(1.45, 0.09, 16, 48), goldTrimMat);
  bowlRim.rotation.x = Math.PI / 2;
  bowlRim.position.y = 4.52;
  trophyGroup.add(bowlRim);

  // --- Dual Curved Handles ---
  const handleGeo = new THREE.TorusGeometry(0.7, 0.08, 16, 32, Math.PI * 1.35);

  const handleLeft = new THREE.Mesh(handleGeo, goldTrimMat);
  handleLeft.position.set(-1.42, 3.8, 0);
  handleLeft.rotation.z = Math.PI * 0.32;
  trophyGroup.add(handleLeft);

  const handleRight = new THREE.Mesh(handleGeo, goldTrimMat);
  handleRight.position.set(1.42, 3.8, 0);
  handleRight.rotation.z = -Math.PI * 0.32 + Math.PI;
  trophyGroup.add(handleRight);

  // --- Floating "2048" Crown Jewel ---
  const crownCube = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.75, 0.75), crownCubeMat);
  crownCube.position.y = 4.8;
  crownCube.name = 'trophy_crown_cube';
  trophyGroup.add(crownCube);

  // --- Orbiting Planetary Rings ---
  const ring1 = new THREE.Mesh(
    new THREE.TorusGeometry(2.0, 0.025, 12, 64),
    isUnlocked
      ? new THREE.MeshBasicMaterial({ color: 0xffd700, transparent: true, opacity: 0.75 })
      : new THREE.MeshBasicMaterial({ color: 0x475569, transparent: true, opacity: 0.3 })
  );
  ring1.rotation.x = Math.PI * 0.35;
  ring1.position.y = 3.9;
  ring1.name = 'trophy_ring_1';
  trophyGroup.add(ring1);

  const ring2 = new THREE.Mesh(
    new THREE.TorusGeometry(2.15, 0.022, 12, 64),
    isUnlocked
      ? new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.65 })
      : new THREE.MeshBasicMaterial({ color: 0x334155, transparent: true, opacity: 0.25 })
  );
  ring2.rotation.x = -Math.PI * 0.35;
  ring2.rotation.z = Math.PI * 0.25;
  ring2.position.y = 3.9;
  ring2.name = 'trophy_ring_2';
  trophyGroup.add(ring2);

  // --- Golden Star Particles Cloud ---
  const starCount = isUnlocked ? 70 : 25;
  const starGeo = new THREE.BufferGeometry();
  const starPositions = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    const r = 1.2 + Math.random() * 1.5;
    const theta = Math.random() * Math.PI * 2;
    const phi = (Math.random() - 0.5) * Math.PI;
    starPositions[i * 3] = r * Math.cos(theta) * Math.cos(phi);
    starPositions[i * 3 + 1] = 3.9 + r * Math.sin(phi);
    starPositions[i * 3 + 2] = r * Math.sin(theta) * Math.cos(phi);
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));

  const starMat = new THREE.PointsMaterial({
    color: isUnlocked ? 0xffe066 : 0x94a3b8,
    size: 0.09,
    transparent: true,
    opacity: isUnlocked ? 0.9 : 0.4
  });
  const stars = new THREE.Points(starGeo, starMat);
  stars.name = 'trophy_stars';
  trophyGroup.add(stars);

  // Scale and center entire trophy
  trophyGroup.scale.set(0.68, 0.68, 0.68);
  trophyGroup.position.y = -1.65;

  return trophyGroup;
}

/**
 * Dedicated Interactive 3D Trophy Modal Viewer
 */
export class TrophyModalViewer {
  constructor(canvasContainer) {
    this.container = canvasContainer;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.trophyGroup = null;
    this.animId = null;
    this.isUnlocked = false;

    // Interaction states
    this.isDragging = false;
    this.prevPointerX = 0;
    this.prevPointerY = 0;
    this.rotVelocityX = 0;
    this.rotVelocityY = 0;
    this.targetRotationY = 0;
    this.targetRotationX = 0;

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
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    this.scene.add(ambientLight);

    // Key warm gold light
    const keyLight = new THREE.DirectionalLight(0xfffae0, 2.2);
    keyLight.position.set(4, 6, 5);
    this.scene.add(keyLight);

    // Rim cyan light
    const rimLight = new THREE.DirectionalLight(0x00f0ff, 1.8);
    rimLight.position.set(-4, 3, -4);
    this.scene.add(rimLight);

    // Fill soft magenta/gold light
    const fillLight = new THREE.DirectionalLight(0xff00aa, 0.9);
    fillLight.position.set(3, -2, -3);
    this.scene.add(fillLight);

    // Bottom glow light
    const bottomLight = new THREE.PointLight(0xffaa00, 1.5, 8);
    bottomLight.position.set(0, -1.5, 2);
    this.scene.add(bottomLight);

    // 4. Initial Trophy Mesh
    this.setUnlocked(false);

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

  setUnlocked(unlocked) {
    this.isUnlocked = unlocked;
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

    this.trophyGroup = createTrophyMesh(unlocked);
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
        // Slowly return pitch to zero
        this.trophyGroup.rotation.x *= 0.95;
      }

      // Floating Crown Cube Animation
      const crownCube = this.trophyGroup.getObjectByName('trophy_crown_cube');
      if (crownCube) {
        crownCube.rotation.y += 0.025;
        crownCube.rotation.x = Math.sin(time * 2) * 0.15;
        crownCube.position.y = 4.8 + Math.sin(time * 3) * 0.12;
      }

      // Embedded Diamond Gem Animation
      const gem = this.trophyGroup.getObjectByName('trophy_gem');
      if (gem) {
        gem.rotation.y += 0.04;
        gem.rotation.x += 0.02;
      }

      // Orbiting Planetary Rings
      const ring1 = this.trophyGroup.getObjectByName('trophy_ring_1');
      if (ring1) ring1.rotation.y += 0.022;

      const ring2 = this.trophyGroup.getObjectByName('trophy_ring_2');
      if (ring2) ring2.rotation.y -= 0.018;

      // Orbiting Stars
      const stars = this.trophyGroup.getObjectByName('trophy_stars');
      if (stars) stars.rotation.y += 0.006;
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
