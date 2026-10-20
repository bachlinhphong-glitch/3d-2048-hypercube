import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import gsap from 'gsap';

export class SceneManager {
  constructor(container) {
    this.container = container;
    this.mode = '4x4';
    this.theme = 'cat_moon'; // 'cat_moon', 'elmo_fire', 'patrick_space', 'galaxy', etc.
    this.backgroundCache = new Map();

    this.defaultCamPos4x4 = new THREE.Vector3(0, 10.5, 7.6);
    this.defaultTarget4x4 = new THREE.Vector3(0, 0.6, 0);

    this.defaultCamPos3x3 = new THREE.Vector3(0, 13.0, 9.5);
    this.defaultTarget3x3 = new THREE.Vector3(0, 2.4, 0);

    this.initScene();
    this.initCamera();
    this.initRenderer();
    this.initEnvironmentMap();
    this.initLights();
    this.initThemeDecorations();
    this.setTheme(this.theme);
    this.initControls();
    this.handleResize();

    window.addEventListener('resize', () => this.handleResize());
  }

  initScene() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x0a0518, 0.015);
  }

  initCamera() {
    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(42, aspect, 0.1, 100);
    this.camera.position.copy(this.defaultCamPos4x4);
    this.camera.lookAt(this.defaultTarget4x4);
  }

  initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      stencil: false,
      depth: true,
      alpha: true,
      preserveDrawingBuffer: false,
      failIfMajorPerformanceCaveat: false
    });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(1.0);

    // Completely disable dynamic shadow maps for ultra-smooth 60+ FPS
    this.renderer.shadowMap.enabled = false;

    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;

    // WebGL Context Restoration for dual-GPU laptops (NVIDIA Optimus / Iris Xe switching)
    this.renderer.domElement.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      console.warn('⚠️ WebGL Context Lost! Switching GPU or display mode...');
    }, false);

    this.renderer.domElement.addEventListener('webglcontextrestored', () => {
      console.log('✅ WebGL Context Restored! Reinitializing 3D pipeline...');
      this.initEnvironmentMap();
    }, false);

    this.container.appendChild(this.renderer.domElement);
  }

  getGPUInfo() {
    try {
      const gl = this.renderer.getContext();
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        const unmaskedRenderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '';
        let cleanName = unmaskedRenderer;
        if (/RTX\s*\d+/i.test(unmaskedRenderer)) {
          const match = unmaskedRenderer.match(/RTX\s*[0-9]+[A-Za-z\s]*/i);
          if (match) cleanName = 'NVIDIA ' + match[0].trim();
        } else if (/Iris/i.test(unmaskedRenderer)) {
          cleanName = 'Intel Iris Xe';
        } else if (/GeForce/i.test(unmaskedRenderer)) {
          const match = unmaskedRenderer.match(/GeForce\s*[^,\(\)]+/i);
          if (match) cleanName = match[0].trim();
        } else if (/Radeon/i.test(unmaskedRenderer)) {
          const match = unmaskedRenderer.match(/Radeon\s*[^,\(\)]+/i);
          if (match) cleanName = match[0].trim();
        } else {
          const match = unmaskedRenderer.match(/(?:NVIDIA|Intel|AMD|Apple)\s*[^,\(\)]+/i);
          if (match) cleanName = match[0].trim();
        }
        return {
          renderer: cleanName,
          full: unmaskedRenderer,
          vendor: gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || ''
        };
      }
    } catch (e) {
      console.warn('Could not query GPU info:', e);
    }
    return { renderer: 'Hardware WebGL', full: 'Generic WebGL', vendor: 'Generic' };
  }

  initEnvironmentMap() {
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    pmremGenerator.compileEquirectangularShader();

    // Create a 512x256 studio HDRI equirectangular canvas
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Smooth gradient background: deep navy ceiling down to dark reflective floor
    const skyGrad = ctx.createLinearGradient(0, 0, 0, 256);
    skyGrad.addColorStop(0, '#111827');
    skyGrad.addColorStop(0.35, '#1e293b');
    skyGrad.addColorStop(0.5, '#334155');
    skyGrad.addColorStop(0.65, '#0f172a');
    skyGrad.addColorStop(1, '#050811');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, 512, 256);

    // Main overhead studio softbox
    const softbox = ctx.createRadialGradient(256, 35, 5, 256, 35, 170);
    softbox.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    softbox.addColorStop(0.25, 'rgba(235, 245, 255, 0.65)');
    softbox.addColorStop(0.65, 'rgba(180, 210, 255, 0.18)');
    softbox.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = softbox;
    ctx.fillRect(0, 0, 512, 170);

    // Warm specular key bounce (right side)
    const keyLight = ctx.createRadialGradient(420, 95, 10, 420, 95, 130);
    keyLight.addColorStop(0, 'rgba(255, 215, 160, 0.7)');
    keyLight.addColorStop(0.5, 'rgba(255, 190, 120, 0.2)');
    keyLight.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = keyLight;
    ctx.fillRect(260, 20, 250, 160);

    // Cyan rim bounce (left side)
    const rimLight = ctx.createRadialGradient(90, 95, 10, 90, 95, 130);
    rimLight.addColorStop(0, 'rgba(56, 189, 248, 0.7)');
    rimLight.addColorStop(0.5, 'rgba(14, 165, 233, 0.2)');
    rimLight.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = rimLight;
    ctx.fillRect(0, 20, 240, 160);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const envMap = pmremGenerator.fromEquirectangular(texture).texture;
    pmremGenerator.dispose();
    texture.dispose();

    this.scene.environment = envMap;
  }

  requestShadowUpdate() {
    // No-op: shadows disabled for maximum performance
  }

  initLights() {
    // Ambient light with natural indigo sky tint
    this.ambientLight = new THREE.AmbientLight(0xdbeafe, 0.85);
    this.scene.add(this.ambientLight);

    // Directional light without shadow overhead
    this.sunLight = new THREE.DirectionalLight(0xfff7ed, 1.6);
    this.sunLight.position.set(8.5, 18, 8.5);
    this.scene.add(this.sunLight);

    // Crisp rim backlight for dramatic edge bevel highlights
    this.rimLight = new THREE.DirectionalLight(0x38bdf8, 1.0);
    this.rimLight.position.set(-10, 14, -10);
    this.scene.add(this.rimLight);

    // Subtle warm ground fill
    this.fillLight = new THREE.DirectionalLight(0xfef08a, 0.4);
    this.fillLight.position.set(6, -4, -6);
    this.scene.add(this.fillLight);

    // Dynamic Colored PointLights for Hyper Neon Theme
    this.pointLight1 = new THREE.PointLight(0xff007f, 0, 18);
    this.pointLight1.position.set(4, 6, 4);
    this.scene.add(this.pointLight1);

    this.pointLight2 = new THREE.PointLight(0x00f0ff, 0, 18);
    this.pointLight2.position.set(-4, 6, -4);
    this.scene.add(this.pointLight2);
  }

  initThemeDecorations() {
    // 1. Synthwave Neon Grid Floor
    this.neonGrid = new THREE.GridHelper(32, 32, 0xff007f, 0x7928ca);
    this.neonGrid.position.y = -0.52;
    this.neonGrid.visible = false;
    this.scene.add(this.neonGrid);

    // 2. 3D Celestial Starfield (450 multi-colored stars on a spherical shell)
    const starCount = 450;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    const cWhite = new THREE.Color(0xffffff);
    const cBlue = new THREE.Color(0x93c5fd);
    const cPurple = new THREE.Color(0xd8b4fe);
    const cGold = new THREE.Color(0xfef08a);

    for (let i = 0; i < starCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 30 + Math.random() * 22;

      starPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPos[i * 3 + 2] = r * Math.cos(phi);

      const pick = Math.random();
      const col = pick < 0.45 ? cWhite : pick < 0.7 ? cBlue : pick < 0.88 ? cPurple : cGold;
      starColors[i * 3] = col.r;
      starColors[i * 3 + 1] = col.g;
      starColors[i * 3 + 2] = col.b;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMat = new THREE.PointsMaterial({
      size: 0.22,
      vertexColors: true,
      transparent: true,
      opacity: 0.85
    });
    this.starfield = new THREE.Points(starGeo, starMat);
    this.starfield.visible = true;
    this.scene.add(this.starfield);

    // 3. Floating Atmospheric Dust Particles
    const dustCount = 80;
    const dustGeo = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount * 3; i += 3) {
      dustPositions[i] = (Math.random() - 0.5) * 22;
      dustPositions[i + 1] = Math.random() * 12 - 1.5;
      dustPositions[i + 2] = (Math.random() - 0.5) * 22;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    this.dustMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.14,
      transparent: true,
      opacity: 0.7
    });
    this.cyberDust = new THREE.Points(dustGeo, this.dustMat);
    this.cyberDust.visible = true;
    this.scene.add(this.cyberDust);
  }

  getBackgroundTexture(themeName) {
    if (this.backgroundCache.has(themeName)) {
      return this.backgroundCache.get(themeName);
    }

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    if (themeName === 'galaxy') {
      // Cosmic Deep Space with Purple & Cyan Nebula Clouds
      const grad = ctx.createRadialGradient(256, 256, 30, 256, 256, 360);
      grad.addColorStop(0, '#1b1035');
      grad.addColorStop(0.35, '#110b26');
      grad.addColorStop(0.68, '#08081a');
      grad.addColorStop(1, '#020108');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 512);

      // Nebula cloud puffs
      ctx.fillStyle = 'rgba(139, 92, 246, 0.14)';
      ctx.beginPath();
      ctx.arc(170, 190, 150, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(14, 165, 233, 0.1)';
      ctx.beginPath();
      ctx.arc(350, 310, 160, 0, Math.PI * 2);
      ctx.fill();
    } else if (themeName === 'sunset') {
      // Synthwave Retro Sunset Horizon
      const grad = ctx.createLinearGradient(0, 0, 0, 512);
      grad.addColorStop(0, '#160424');
      grad.addColorStop(0.35, '#3b0a40');
      grad.addColorStop(0.65, '#7a1452');
      grad.addColorStop(0.84, '#cf430b');
      grad.addColorStop(1, '#f59f00');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 512);

      // Distant Sunset Horizon Glow
      const hGlow = ctx.createRadialGradient(256, 440, 30, 256, 440, 280);
      hGlow.addColorStop(0, 'rgba(255, 235, 120, 0.5)');
      hGlow.addColorStop(0.35, 'rgba(255, 90, 95, 0.28)');
      hGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = hGlow;
      ctx.fillRect(0, 180, 512, 332);
    } else if (themeName === 'aurora') {
      // Polar Arctic Night with Emerald Aurora Borealis
      const grad = ctx.createLinearGradient(0, 0, 0, 512);
      grad.addColorStop(0, '#020a14');
      grad.addColorStop(0.38, '#031b24');
      grad.addColorStop(0.7, '#04382e');
      grad.addColorStop(1, '#021c15');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 512);

      // Luminous Aurora Glow
      const aGrad = ctx.createRadialGradient(256, 190, 40, 256, 190, 300);
      aGrad.addColorStop(0, 'rgba(52, 211, 153, 0.38)');
      aGrad.addColorStop(0.4, 'rgba(6, 182, 212, 0.22)');
      aGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = aGrad;
      ctx.fillRect(0, 0, 512, 390);
    } else if (themeName === 'studio') {
      // Architectural Slate & Charcoal Studio Vignette
      const grad = ctx.createRadialGradient(256, 210, 30, 256, 210, 360);
      grad.addColorStop(0, '#263142');
      grad.addColorStop(0.55, '#171e28');
      grad.addColorStop(1, '#0e1218');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 512);
    } else if (themeName === 'neon') {
      const grad = ctx.createRadialGradient(256, 256, 50, 256, 256, 360);
      grad.addColorStop(0, '#150624');
      grad.addColorStop(0.7, '#0a0312');
      grad.addColorStop(1, '#05010a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 512);
    } else if (themeName === 'telemetry') {
      ctx.fillStyle = '#050c12';
      ctx.fillRect(0, 0, 512, 512);
    } else {
      // Classic Dark Glass
      const grad = ctx.createRadialGradient(256, 256, 50, 256, 256, 360);
      grad.addColorStop(0, '#131b26');
      grad.addColorStop(0.7, '#0d1117');
      grad.addColorStop(1, '#070a0e');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 512);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    this.backgroundCache.set(themeName, tex);
    return tex;
  }

  setTheme(themeName) {
    this.theme = themeName;

    const imageThemes = {
      cat_moon: './assets/backgrounds/cat_moon.png',
      elmo_fire: './assets/backgrounds/elmo_fire.png',
      patrick_space: './assets/backgrounds/patrick_space.png'
    };

    let customBg = null;
    try {
      customBg = localStorage.getItem('3d2048_custom_bg');
    } catch {}

    if (themeName === 'custom' && customBg) {
      this.scene.background = null;
      this.renderer.setClearColor(0x000000, 0);
      this.container.style.backgroundImage = `url("${customBg}")`;
      this.container.style.backgroundSize = 'cover';
      this.container.style.backgroundPosition = 'center';
      this.container.style.backgroundRepeat = 'no-repeat';
    } else if (imageThemes[themeName]) {
      this.scene.background = null;
      this.renderer.setClearColor(0x000000, 0);
      this.container.style.backgroundImage = `url("${imageThemes[themeName]}")`;
      this.container.style.backgroundSize = 'cover';
      this.container.style.backgroundPosition = 'center';
      this.container.style.backgroundRepeat = 'no-repeat';
    } else {
      this.container.style.backgroundImage = 'none';
      this.renderer.setClearColor(0x000000, 1);
      this.scene.background = this.getBackgroundTexture(themeName);
    }

    const fogColors = {
      custom: 0x070914,
      cat_moon: 0x060814,
      elmo_fire: 0x1f0604,
      patrick_space: 0x050a14,
      galaxy: 0x09081a,
      sunset: 0x3b0a40,
      aurora: 0x031b24,
      neon: 0x0a0518,
      studio: 0x171e28,
      telemetry: 0x050c12,
      classic: 0x0d1117
    };
    const fogCol = fogColors[themeName] || 0x0d1117;
    this.scene.fog.color.set(fogCol);

    if (themeName === 'custom') {
      this.starfield.visible = false;
      this.neonGrid.visible = false;
      this.cyberDust.visible = true;
      this.dustMat.color.set(0x38bdf8);
      this.ambientLight.color.set(0xffffff);
      this.ambientLight.intensity = 0.9;
      this.sunLight.color.set(0xfff7ed);
      this.sunLight.intensity = 1.6;
      this.rimLight.color.set(0x38bdf8);
      this.rimLight.intensity = 1.2;
      this.pointLight1.intensity = 0;
      this.pointLight2.intensity = 0;
      this.renderer.toneMappingExposure = 1.15;
    } else if (themeName === 'cat_moon') {
      this.starfield.visible = false;
      this.neonGrid.visible = false;
      this.cyberDust.visible = true;
      this.dustMat.color.set(0xfef08a);
      this.ambientLight.color.set(0x93c5fd);
      this.ambientLight.intensity = 0.9;
      this.sunLight.color.set(0xfef08a);
      this.sunLight.intensity = 1.7;
      this.rimLight.color.set(0xa78bfa);
      this.rimLight.intensity = 1.2;
      this.pointLight1.intensity = 0;
      this.pointLight2.intensity = 0;
      this.renderer.toneMappingExposure = 1.18;
    } else if (themeName === 'elmo_fire') {
      this.starfield.visible = false;
      this.neonGrid.visible = false;
      this.cyberDust.visible = true;
      this.dustMat.color.set(0xff7675);
      this.ambientLight.color.set(0xff7675);
      this.ambientLight.intensity = 0.8;
      this.sunLight.color.set(0xfb923c);
      this.sunLight.intensity = 1.9;
      this.rimLight.color.set(0xff3838);
      this.rimLight.intensity = 1.5;
      this.pointLight1.intensity = 2.0;
      this.pointLight1.color.set(0xff5722);
      this.pointLight2.intensity = 1.6;
      this.pointLight2.color.set(0xff9800);
      this.renderer.toneMappingExposure = 1.25;
    } else if (themeName === 'patrick_space') {
      this.starfield.visible = false;
      this.neonGrid.visible = false;
      this.cyberDust.visible = true;
      this.dustMat.color.set(0x38bdf8);
      this.ambientLight.color.set(0x94a3b8);
      this.ambientLight.intensity = 0.85;
      this.sunLight.color.set(0xf8fafc);
      this.sunLight.intensity = 1.65;
      this.rimLight.color.set(0x38bdf8);
      this.rimLight.intensity = 1.35;
      this.pointLight1.intensity = 0;
      this.pointLight2.intensity = 0;
      this.renderer.toneMappingExposure = 1.16;
    } else if (themeName === 'galaxy') {
      this.starfield.visible = true;
      this.neonGrid.visible = false;
      this.cyberDust.visible = true;
      this.dustMat.color.set(0xa78bfa);
      this.ambientLight.color.set(0xc4b5fd);
      this.ambientLight.intensity = 0.95;
      this.sunLight.color.set(0xfff7ed);
      this.sunLight.intensity = 1.6;
      this.rimLight.color.set(0x38bdf8);
      this.rimLight.intensity = 1.2;
      this.pointLight1.intensity = 0;
      this.pointLight2.intensity = 0;
      this.renderer.toneMappingExposure = 1.18;
    } else if (themeName === 'sunset') {
      this.starfield.visible = true;
      this.neonGrid.visible = true;
      this.cyberDust.visible = true;
      this.dustMat.color.set(0xfb923c);
      this.ambientLight.color.set(0xfde047);
      this.ambientLight.intensity = 0.75;
      this.sunLight.color.set(0xfb923c);
      this.sunLight.intensity = 1.8;
      this.rimLight.color.set(0xf43f5e);
      this.rimLight.intensity = 1.4;
      this.pointLight1.intensity = 1.6;
      this.pointLight1.color.set(0xff5722);
      this.pointLight2.intensity = 1.6;
      this.pointLight2.color.set(0xff007f);
      this.renderer.toneMappingExposure = 1.25;
    } else if (themeName === 'aurora') {
      this.starfield.visible = true;
      this.neonGrid.visible = false;
      this.cyberDust.visible = true;
      this.dustMat.color.set(0x34d399);
      this.ambientLight.color.set(0x99f6e4);
      this.ambientLight.intensity = 0.85;
      this.sunLight.color.set(0x67e8f9);
      this.sunLight.intensity = 1.55;
      this.rimLight.color.set(0x10b981);
      this.rimLight.intensity = 1.35;
      this.pointLight1.intensity = 0;
      this.pointLight2.intensity = 0;
      this.renderer.toneMappingExposure = 1.15;
    } else if (themeName === 'neon') {
      this.starfield.visible = false;
      this.neonGrid.visible = true;
      this.cyberDust.visible = true;
      this.dustMat.color.set(0x00f0ff);
      this.pointLight1.intensity = 2.4;
      this.pointLight1.color.set(0xff007f);
      this.pointLight2.intensity = 2.4;
      this.pointLight2.color.set(0x00f0ff);
      this.ambientLight.color.set(0xdbeafe);
      this.ambientLight.intensity = 0.7;
      this.sunLight.intensity = 1.2;
      this.rimLight.color.set(0x00f0ff);
      this.renderer.toneMappingExposure = 1.25;
    } else if (themeName === 'studio') {
      this.starfield.visible = false;
      this.neonGrid.visible = false;
      this.cyberDust.visible = false;
      this.ambientLight.color.set(0xffffff);
      this.ambientLight.intensity = 0.95;
      this.sunLight.color.set(0xffffff);
      this.sunLight.intensity = 1.5;
      this.rimLight.color.set(0x94a3b8);
      this.rimLight.intensity = 0.8;
      this.pointLight1.intensity = 0;
      this.pointLight2.intensity = 0;
      this.renderer.toneMappingExposure = 1.12;
    } else if (themeName === 'telemetry') {
      this.starfield.visible = false;
      this.neonGrid.visible = false;
      this.cyberDust.visible = false;
      this.ambientLight.color.set(0x00f0ff);
      this.ambientLight.intensity = 0.65;
      this.sunLight.intensity = 1.4;
      this.rimLight.color.set(0x00f0ff);
      this.pointLight1.intensity = 0;
      this.pointLight2.intensity = 0;
      this.renderer.toneMappingExposure = 1.05;
    } else {
      // Classic
      this.starfield.visible = false;
      this.neonGrid.visible = false;
      this.cyberDust.visible = false;
      this.ambientLight.color.set(0xdbeafe);
      this.ambientLight.intensity = 0.85;
      this.sunLight.color.set(0xfff7ed);
      this.sunLight.intensity = 1.6;
      this.rimLight.color.set(0x38bdf8);
      this.rimLight.intensity = 1.0;
      this.pointLight1.intensity = 0;
      this.pointLight2.intensity = 0;
      this.renderer.toneMappingExposure = 1.1;
    }
  }

  setMode(mode) {
    this.mode = mode;
    this.resetCamera();
  }

  initControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.target.copy(this.defaultTarget4x4);

    this.controls.minPolarAngle = Math.PI / 8;
    this.controls.maxPolarAngle = Math.PI / 2.1;
    this.controls.minDistance = 8;
    this.controls.maxDistance = 28;

    this.controls.mouseButtons = {
      LEFT: null,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: THREE.MOUSE.ROTATE
    };

    this.controls.touches = {
      ONE: null, // 1-finger touch reserved for game swipe / tap
      TWO: THREE.TOUCH.DOLLY_ROTATE // 2-finger touch allows zoom and 3D orbit
    };

    this.controls.addEventListener('change', () => {
      this.requestShadowUpdate(2);
    });
  }

  resetCamera() {
    this.snapCamera(1);
  }

  snapCamera(preset = 1) {
    this.requestShadowUpdate(55);
    gsap.killTweensOf(this.camera.position);
    gsap.killTweensOf(this.controls.target);

    const is3D = this.mode === '3x3x3';
    let targetPos, targetLook;

    if (preset === 1 || preset === 'iso') {
      // 1. Isometric Standard 3D Diagonal View (Bao quát cả 3 trục)
      targetPos = is3D ? new THREE.Vector3(0, 9.5, 7.5) : new THREE.Vector3(0, 10.5, 7.6);
      targetLook = is3D ? this.defaultTarget3x3 : this.defaultTarget4x4;
    } else if (preset === 2 || preset === 'top') {
      // 2. Top-Down View (Nhìn thẳng từ đỉnh xuống như 2D)
      targetPos = is3D ? new THREE.Vector3(0, 13.0, 0.01) : new THREE.Vector3(0, 13.0, 0.01);
      targetLook = is3D ? this.defaultTarget3x3 : this.defaultTarget4x4;
    } else if (preset === 3 || preset === 'side') {
      // 3. Front / Side Layer View (Nhìn ngang soi rõ độ cao giữa 3 tầng)
      targetPos = is3D ? new THREE.Vector3(0, 3.5, 12.0) : new THREE.Vector3(0, 2.0, 10.0);
      targetLook = is3D ? this.defaultTarget3x3 : this.defaultTarget4x4;
    } else {
      targetPos = is3D ? this.defaultCamPos3x3 : this.defaultCamPos4x4;
      targetLook = is3D ? this.defaultTarget3x3 : this.defaultTarget4x4;
    }

    gsap.to(this.camera.position, {
      x: targetPos.x,
      y: targetPos.y,
      z: targetPos.z,
      duration: 0.65,
      ease: 'power2.inOut',
      onUpdate: () => {
        this.controls.update();
        this.requestShadowUpdate(2);
      }
    });

    gsap.to(this.controls.target, {
      x: targetLook.x,
      y: targetLook.y,
      z: targetLook.z,
      duration: 0.65,
      ease: 'power2.inOut'
    });
  }

  handleResize() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    const aspect = width / height;
    this.camera.aspect = aspect;

    // Mobile / Tablet portrait dynamic FOV adaptation
    // Standard 42 deg FOV is designed for landscape monitors.
    // In portrait on phones (aspect ~0.45 - 0.6) or tablets (aspect ~0.75), a fixed vertical FOV
    // would clip the left/right edges of the 3D board!
    // We adjust FOV dynamically so the board is always perfectly fitted horizontally and vertically.
    if (aspect < 0.65) {
      // Tall smartphones (iPhone 12-16, Samsung Galaxy, Pixel)
      const baseFovRad = 42 * (Math.PI / 180);
      const targetVFOVDeg = 2 * Math.atan(Math.tan(baseFovRad / 2) / (aspect * 1.05)) * (180 / Math.PI);
      this.camera.fov = Math.min(68, Math.max(46, targetVFOVDeg));
    } else if (aspect < 1.0) {
      // Wider phones / small foldable portrait
      const baseFovRad = 42 * (Math.PI / 180);
      const targetVFOVDeg = 2 * Math.atan(Math.tan(baseFovRad / 2) / (aspect * 1.08)) * (180 / Math.PI);
      this.camera.fov = Math.min(58, Math.max(44, targetVFOVDeg));
    } else if (aspect < 1.35) {
      // Tablets (iPad portrait, Galaxy Tab portrait)
      this.camera.fov = 48;
    } else {
      // Desktop / Landscape tablets
      this.camera.fov = 42;
    }
    this.camera.updateProjectionMatrix();

    // Mobile hardware pixel ratio clamping:
    // Mobile screens often have 3x or 3.5x DPR. Clamping to max 1.75 on mobile preserves razor-sharp
    // visuals while preventing GPU thermal throttling and battery drain.
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
                     (navigator.maxTouchPoints && navigator.maxTouchPoints > 1);
    const maxDPR = isMobile ? 1.75 : 1.0;
    const dpr = Math.min(window.devicePixelRatio || 1, maxDPR);
    this.renderer.setPixelRatio(dpr);

    this.renderer.setSize(width, height);
  }

  getRenderStats() {
    return {
      calls: this.renderer.info.render.calls,
      triangles: this.renderer.info.render.triangles,
      geometries: this.renderer.info.memory.geometries
    };
  }

  render(time = 0) {
    if (this.theme === 'neon' || this.theme === 'sunset') {
      const t = time * 0.8;
      this.pointLight1.position.x = Math.cos(t) * 7;
      this.pointLight1.position.z = Math.sin(t) * 7;
      this.pointLight2.position.x = Math.cos(t + Math.PI) * 7;
      this.pointLight2.position.z = Math.sin(t + Math.PI) * 7;
    }

    if (this.starfield && this.starfield.visible) {
      this.starfield.rotation.y = time * 0.012;
      this.starfield.rotation.x = Math.sin(time * 0.008) * 0.03;
    }

    if (this.cyberDust && this.cyberDust.visible) {
      this.cyberDust.rotation.y = time * 0.035;
    }

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  async captureSnapshotBlob() {
    this.renderer.render(this.scene, this.camera);
    return new Promise(resolve => {
      this.renderer.domElement.toBlob(blob => resolve(blob), 'image/png');
    });
  }
}
