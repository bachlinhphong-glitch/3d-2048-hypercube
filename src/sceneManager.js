import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import gsap from 'gsap';

export class SceneManager {
  constructor(container) {
    this.container = container;
    this.mode = '4x4';
    this.theme = 'classic'; // 'classic', 'telemetry', 'neon'

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
    this.initControls();
    this.handleResize();

    window.addEventListener('resize', () => this.handleResize());
  }

  initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0e17);
    this.scene.fog = new THREE.FogExp2(0x0a0e17, 0.018);
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
      depth: true
    });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(1.0);

    // Completely disable dynamic shadow maps for ultra-smooth 60+ FPS
    this.renderer.shadowMap.enabled = false;

    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;

    this.container.appendChild(this.renderer.domElement);
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
    // 1. Synthwave Neon Grid Helper
    this.neonGrid = new THREE.GridHelper(30, 30, 0xff007f, 0x7928ca);
    this.neonGrid.position.y = -0.52;
    this.neonGrid.visible = false;
    this.scene.add(this.neonGrid);

    // 2. Floating Cyber Dust Particles (for Neon Theme)
    const dustCount = 80;
    const dustGeo = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount * 3; i += 3) {
      dustPositions[i] = (Math.random() - 0.5) * 20;
      dustPositions[i + 1] = Math.random() * 10 - 1;
      dustPositions[i + 2] = (Math.random() - 0.5) * 20;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    const dustMat = new THREE.PointsMaterial({
      color: 0x00f0ff,
      size: 0.12,
      transparent: true,
      opacity: 0.6
    });
    this.cyberDust = new THREE.Points(dustGeo, dustMat);
    this.cyberDust.visible = false;
    this.scene.add(this.cyberDust);
  }

  setTheme(themeName) {
    this.theme = themeName;
    if (themeName === 'neon') {
      this.scene.background.set(0x0a0518);
      this.scene.fog.color.set(0x0a0518);
      this.neonGrid.visible = true;
      this.cyberDust.visible = true;
      this.pointLight1.intensity = 2.4;
      this.pointLight2.intensity = 2.4;
      this.renderer.toneMappingExposure = 1.25;
    } else if (themeName === 'telemetry') {
      this.scene.background.set(0x050c12);
      this.scene.fog.color.set(0x050c12);
      this.neonGrid.visible = false;
      this.cyberDust.visible = false;
      this.pointLight1.intensity = 0;
      this.pointLight2.intensity = 0;
      this.renderer.toneMappingExposure = 1.05;
    } else {
      // Classic
      this.scene.background.set(0x0d1117);
      this.scene.fog.color.set(0x0d1117);
      this.neonGrid.visible = false;
      this.cyberDust.visible = false;
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
      ONE: null,
      TWO: THREE.TOUCH.DOLLY_PAN
    };

    this.controls.addEventListener('change', () => {
      this.requestShadowUpdate(2);
    });
  }

  resetCamera() {
    this.requestShadowUpdate(55);
    gsap.killTweensOf(this.camera.position);
    gsap.killTweensOf(this.controls.target);

    const targetPos = this.mode === '3x3x3' ? this.defaultCamPos3x3 : this.defaultCamPos4x4;
    const targetLook = this.mode === '3x3x3' ? this.defaultTarget3x3 : this.defaultTarget4x4;

    gsap.to(this.camera.position, {
      x: targetPos.x,
      y: targetPos.y,
      z: targetPos.z,
      duration: 0.8,
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
      duration: 0.8,
      ease: 'power2.inOut'
    });
  }

  handleResize() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
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
    if (this.theme === 'neon') {
      // Rotate colored point lights around board
      const t = time * 0.8;
      this.pointLight1.position.x = Math.cos(t) * 7;
      this.pointLight1.position.z = Math.sin(t) * 7;
      this.pointLight2.position.x = Math.cos(t + Math.PI) * 7;
      this.pointLight2.position.z = Math.sin(t + Math.PI) * 7;

      // Slowly pulse cyber dust
      if (this.cyberDust) {
        this.cyberDust.rotation.y = time * 0.05;
      }
    }

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}
