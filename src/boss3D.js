import * as THREE from 'three';
import gsap from 'gsap';

/**
 * 🌌 Boss3DController — 3-Phase High-Fidelity 3D Boss System
 *
 * PHASE 1: PLANET TITAN (500 HP) — Molten lava planet, floating tectonic crust armor,
 *           150-rock 3D asteroid belt, 2 elliptical orbiting moons with light trails.
 * PHASE 2: SOLAR HELIOS (1,500 HP) — Thermonuclear Sun with 3D-noise GLSL plasma shader,
 *           dual Dyson Sphere gimbal rings, 6 Keplerian orbiting planets (Earth+Moon, Saturn+Ring).
 * PHASE 3: COSMIC SINGULARITY (2,048 HP) — Gargantua Black Hole with absolute event horizon,
 *           sharp photon ring, warped gravitational lensing accretion disks, 3,000-star spiral
 *           galaxy particle cloud, and dual relativistic polar quasar jets.
 */
export class Boss3DController {
  constructor(scene, camera = null) {
    this.scene = scene;
    this.camera = camera;
    this.currentPhase = 1;
    this.visible = false;
    this.speedMultiplier = 1.0;
    this.clock = new THREE.Clock();
    this.hpRatio = 1.0;

    // Root Group: Positioned above the board with generous headroom
    this.root = new THREE.Group();
    this.root.position.set(0, 4.35, -4.5);
    this.root.visible = false;
    this.scene.add(this.root);

    // Anim Group: Handles floating/bobbing independently from root hit recoil
    this.animGroup = new THREE.Group();
    this.root.add(this.animGroup);

    // Dynamic Point Light: Changes color & intensity per phase
    this.bossPointLight = new THREE.PointLight(0xff5500, 3.2, 14);
    this.bossPointLight.position.set(0, 0, 0.6);
    this.animGroup.add(this.bossPointLight);

    // High-Contrast Backdrop Halo: Ensures vibrant colors on both Light & Dark themes
    this.backdropHalo = this._createBacklightHalo();
    this.animGroup.add(this.backdropHalo);

    // 4 Distinct 3D Groups for 4 Phases + Active VFX Container
    this.phase1Group = new THREE.Group();
    this.phase2Group = new THREE.Group();
    this.phase3Group = new THREE.Group();
    this.phase4Group = new THREE.Group();
    this.fxGroup = new THREE.Group();

    this.animGroup.add(this.phase1Group);
    this.animGroup.add(this.phase2Group);
    this.animGroup.add(this.phase3Group);
    this.animGroup.add(this.phase4Group);
    this.animGroup.add(this.fxGroup);

    // Shared Shader Uniforms
    this.uniforms = {
      uTime: { value: 0 },
      uHitFlash: { value: 0 },
      uHpRatio: { value: 1.0 }
    };

    // Build the 4 distinct 3D models
    this._buildPhase1Planet();
    this._buildPhase2SolarSystem();
    this._buildPhase3Universe();
    this._buildPhase4Omniverse();

    this.setPhase(1, false);

    // Realtime animation loop driven externally by BossManager / main render loop
    this._rafId = null;
    this._lastAspect = 0;
  }

  // ==========================================================================
  // 0. BACKLIGHT CONTRAST HALO (Vibrant on both Light & Dark themes)
  // ==========================================================================
  _createBacklightHalo() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(256, 256, 16, 256, 256, 256);
    grad.addColorStop(0.0, 'rgba(5, 7, 16, 0.96)');
    grad.addColorStop(0.38, 'rgba(8, 12, 28, 0.82)');
    grad.addColorStop(0.68, 'rgba(12, 18, 42, 0.38)');
    grad.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    const mat = new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      depthWrite: false
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(15.5, 15.5), mat);
    mesh.position.set(0, 0, -2.2);
    return mesh;
  }

  // ==========================================================================
  // 1. PHASE 1: PLANET TITAN (Lava Planet, Crust Armor, 3D Asteroids, 2 Moons)
  // ==========================================================================
  _buildPhase1Planet() {
    // 1.1 Procedural Molten Lava Planet Texture
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Dark basalt / obsidian crust base
    ctx.fillStyle = '#0c0e14';
    ctx.fillRect(0, 0, 1024, 512);

    // Procedural rock texture mottling
    for (let i = 0; i < 3500; i++) {
      const rx = Math.random() * 1024;
      const ry = Math.random() * 512;
      const shade = Math.floor(14 + Math.random() * 22);
      ctx.fillStyle = `rgb(${shade}, ${shade + 2}, ${shade + 6})`;
      ctx.fillRect(rx, ry, 2 + Math.random() * 4, 2 + Math.random() * 4);
    }

    // Volcanic magma fissure cracks
    for (let i = 0; i < 110; i++) {
      ctx.strokeStyle = i % 4 === 0 ? '#ffb703' : (i % 2 === 0 ? '#fb5607' : '#ff0054');
      ctx.lineWidth = 2 + Math.random() * 5.5;
      ctx.shadowColor = '#ff5400';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      let x = Math.random() * 1024;
      let y = Math.random() * 512;
      ctx.moveTo(x, y);
      for (let s = 0; s < 7; s++) {
        x += (Math.random() - 0.5) * 120;
        y += (Math.random() - 0.5) * 80;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    const planetTex = new THREE.CanvasTexture(canvas);
    planetTex.colorSpace = THREE.SRGBColorSpace;
    const planetGeo = new THREE.SphereGeometry(1.35, 64, 64);
    const planetMat = new THREE.MeshStandardMaterial({
      map: planetTex,
      emissiveMap: planetTex,
      emissive: new THREE.Color(0xff3b00),
      emissiveIntensity: 1.35,
      roughness: 0.48,
      metalness: 0.38
    });

    this.p1Core = new THREE.Mesh(planetGeo, planetMat);
    this.phase1Group.add(this.p1Core);

    // 1.2 Floating Tectonic Crust Armor (Icosahedron Armor Plating)
    const crustGeo = new THREE.IcosahedronGeometry(1.54, 1);
    const crustEdges = new THREE.EdgesGeometry(crustGeo);
    const crustLineMat = new THREE.LineBasicMaterial({
      color: 0xff7b00,
      transparent: true,
      opacity: 0.85
    });
    this.p1CrustLines = new THREE.LineSegments(crustEdges, crustLineMat);

    const crustFaceMat = new THREE.MeshStandardMaterial({
      color: 0x141722,
      emissive: 0x3d0b04,
      roughness: 0.8,
      metalness: 0.2,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide
    });
    this.p1CrustFaces = new THREE.Mesh(crustGeo, crustFaceMat);

    this.p1Crust = new THREE.Group();
    this.p1Crust.add(this.p1CrustLines, this.p1CrustFaces);
    this.phase1Group.add(this.p1Crust);

    // 1.3 150-Rock 3D Asteroid Belt (InstancedMesh with Real Orbital Motion)
    const asteroidCount = 150;
    const rockGeo = new THREE.DodecahedronGeometry(0.08, 0);
    const rockMat = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      emissive: 0x2e0c06,
      roughness: 0.82,
      metalness: 0.25
    });

    this.p1AsteroidBelt = new THREE.InstancedMesh(rockGeo, rockMat, asteroidCount);
    this.p1AsteroidBelt.frustumCulled = false;
    this.p1AsteroidData = [];
    this._dummyObj = new THREE.Object3D();

    for (let i = 0; i < asteroidCount; i++) {
      const angle = (i / asteroidCount) * Math.PI * 2 + Math.random() * 0.15;
      const radius = 2.05 + (Math.random() - 0.5) * 0.75;
      const yOffset = (Math.random() - 0.5) * 0.26;
      const scale = 0.45 + Math.random() * 1.35;
      const speed = 0.35 + Math.random() * 0.45;
      const spinX = (Math.random() - 0.5) * 2.0;
      const spinY = (Math.random() - 0.5) * 2.0;

      this.p1AsteroidData.push({ angle, radius, yOffset, scale, speed, spinX, spinY, curSpinX: 0, curSpinY: 0 });
      this._dummyObj.position.set(Math.cos(angle) * radius, yOffset, Math.sin(angle) * radius);
      this._dummyObj.scale.setScalar(scale);
      this._dummyObj.updateMatrix();
      this.p1AsteroidBelt.setMatrixAt(i, this._dummyObj.matrix);
    }
    this.p1AsteroidBelt.instanceMatrix.needsUpdate = true;

    this.p1BeltPivot = new THREE.Group();
    this.p1BeltPivot.rotation.set(0.38, 0, -0.28);
    this.p1BeltPivot.add(this.p1AsteroidBelt);
    this.phase1Group.add(this.p1BeltPivot);

    // 1.4 Two Elliptical Orbiting Moons with Light Trails
    this.p1Moons = [];
    const moonConfigs = [
      { a: 2.95, b: 2.35, r: 0.22, color: 0xf97316, tiltX: 0.52, tiltZ: 0.32, speed: 1.45 },
      { a: 3.55, b: 2.85, r: 0.17, color: 0x38bdf8, tiltX: -0.42, tiltZ: -0.48, speed: -1.05 }
    ];

    moonConfigs.forEach((cfg) => {
      const orbitGroup = new THREE.Group();
      orbitGroup.rotation.set(cfg.tiltX, 0, cfg.tiltZ);

      // Elliptical Orbit Line
      const pts = [];
      for (let i = 0; i <= 64; i++) {
        const theta = (i / 64) * Math.PI * 2;
        pts.push(new THREE.Vector3(Math.cos(theta) * cfg.a, 0, Math.sin(theta) * cfg.b));
      }
      const orbitLine = new THREE.LineLoop(
        new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineBasicMaterial({ color: cfg.color, transparent: true, opacity: 0.32 })
      );
      orbitGroup.add(orbitLine);

      // Moon Mesh
      const moonMesh = new THREE.Mesh(
        new THREE.SphereGeometry(cfg.r, 24, 24),
        new THREE.MeshStandardMaterial({
          color: cfg.color,
          emissive: cfg.color,
          emissiveIntensity: 0.85,
          roughness: 0.35
        })
      );
      orbitGroup.add(moonMesh);

      // Comet Tail Light Trail (16 historical positions)
      const trailPointsCount = 16;
      const trailPositions = new Float32Array(trailPointsCount * 3);
      const trailColors = new Float32Array(trailPointsCount * 3);
      const baseColor = new THREE.Color(cfg.color);

      for (let t = 0; t < trailPointsCount; t++) {
        const alpha = 1.0 - t / trailPointsCount;
        trailColors[t * 3]     = baseColor.r * alpha;
        trailColors[t * 3 + 1] = baseColor.g * alpha;
        trailColors[t * 3 + 2] = baseColor.b * alpha;
      }

      const trailGeo = new THREE.BufferGeometry();
      trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
      trailGeo.setAttribute('color', new THREE.BufferAttribute(trailColors, 3));

      const trailMat = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.75,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const trailLine = new THREE.Line(trailGeo, trailMat);
      orbitGroup.add(trailLine);

      this.phase1Group.add(orbitGroup);
      this.p1Moons.push({
        mesh: moonMesh,
        trailLine,
        trailPositions,
        history: [],
        a: cfg.a,
        b: cfg.b,
        speed: cfg.speed
      });
    });
  }

  // ==========================================================================
  // 2. PHASE 2: SOLAR HELIOS (Thermonuclear Sun, Dyson Rings, 6 Kepler Planets)
  // ==========================================================================
  _buildPhase2SolarSystem() {
    // 2.1 Thermonuclear Sun Core with 3D-Noise Seam-Free GLSL Plasma Shader
    const sunGeo = new THREE.SphereGeometry(1.22, 64, 64);
    const sunShaderMat = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vWorldPos;
        varying vec3 vViewPos;

        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPos = position; // 3D model space coords -> ZERO seams at poles
          vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
          vViewPos = -mvPos.xyz;
          gl_Position = projectionMatrix * mvPos;
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uHitFlash;
        varying vec3 vNormal;
        varying vec3 vWorldPos;
        varying vec3 vViewPos;

        // 3D Simplex-Style Noise for seamless planetary/solar surfaces
        vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
        vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

        float snoise(vec3 v){
          const vec2 C = vec2(1.0/6.0, 1.0/3.0);
          const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
          vec3 i  = floor(v + dot(v, C.yyy));
          vec3 x0 = v - i + dot(i, C.xxx);
          vec3 g = step(x0.yzx, x0.xyz);
          vec3 l = 1.0 - g;
          vec3 i1 = min(g.xyz, l.zxy);
          vec3 i2 = max(g.xyz, l.zxy);
          vec3 x1 = x0 - i1 + 1.0 * C.xxx;
          vec3 x2 = x0 - i2 + 2.0 * C.xxx;
          vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
          i = mod(i, 289.0);
          vec4 p = permute(permute(permute(
                    i.z + vec4(0.0, i1.z, i2.z, 1.0))
                  + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                  + i.x + vec4(0.0, i1.x, i2.x, 1.0));
          float n_ = 0.142857142857;
          vec3 ns = n_ * D.wyz - D.xzx;
          vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
          vec4 x_ = floor(j * ns.z);
          vec4 y_ = floor(j - 7.0 * x_);
          vec4 x = x_ *ns.x + ns.yyyy;
          vec4 y = y_ *ns.x + ns.yyyy;
          vec4 h = 1.0 - abs(x) - abs(y);
          vec4 b0 = vec4(x.xy, y.xy);
          vec4 b1 = vec4(x.zw, y.zw);
          vec4 s0 = floor(b0)*2.0 + 1.0;
          vec4 s1 = floor(b1)*2.0 + 1.0;
          vec4 sh = -step(h, vec4(0.0));
          vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
          vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
          vec3 p0 = vec3(a0.xy, h.x);
          vec3 p1 = vec3(a0.zw, h.y);
          vec3 p2 = vec3(a1.xy, h.z);
          vec3 p3 = vec3(a1.zw, h.w);
          vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
          p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
          vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
          m = m * m;
          return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
        }

        void main() {
          vec3 p = vWorldPos * 2.3;
          float n1 = snoise(p + vec3(0.0, uTime * 0.45, uTime * 0.25));
          float n2 = snoise(p * 2.1 - vec3(uTime * 0.65, 0.0, uTime * 0.35));
          float n = (n1 * 0.65 + n2 * 0.35) * 0.5 + 0.5;

          vec3 darkFlame  = vec3(0.85, 0.12, 0.02);
          vec3 brightGold = vec3(1.0, 0.76, 0.12);
          vec3 coreWhite  = vec3(1.0, 0.98, 0.88);

          vec3 col = mix(darkFlame, brightGold, smoothstep(0.22, 0.65, n));
          col = mix(col, coreWhite, smoothstep(0.65, 0.94, n));

          // Pulsing Corona Rim Glow (Fresnel)
          float fresnel = pow(1.0 - abs(dot(vNormal, normalize(vViewPos))), 2.4);
          col += vec3(1.0, 0.62, 0.15) * fresnel * 1.8;
          col = mix(col, vec3(1.0), uHitFlash);

          gl_FragColor = vec4(col, 1.0);
        }
      `
    });

    this.p2Sun = new THREE.Mesh(sunGeo, sunShaderMat);
    this.phase2Group.add(this.p2Sun);

    // 2.2 Dual Concentric Dyson Sphere Gimbal Rings
    const dysonMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.85,
      metalness: 0.92,
      roughness: 0.18
    });
    this.p2Dyson1 = new THREE.Mesh(new THREE.TorusGeometry(1.42, 0.038, 16, 64), dysonMat);
    this.p2Dyson2 = new THREE.Mesh(new THREE.TorusGeometry(1.58, 0.032, 16, 64), dysonMat);
    this.p2Dyson1.rotation.x = Math.PI / 3;
    this.p2Dyson2.rotation.y = Math.PI / 4;
    this.phase2Group.add(this.p2Dyson1, this.p2Dyson2);

    // 2.3 6 Keplerian Orbiting 3D Planets with Elliptical Orbits
    this.p2SystemTilt = new THREE.Group();
    this.p2SystemTilt.rotation.set(0.42, 0, -0.16);
    this.phase2Group.add(this.p2SystemTilt);

    const planetsDef = [
      { name: 'Mercury', a: 1.85, b: 1.70, r: 0.09, color: 0x94a3b8, speed: 2.35, phase: 0.2 },
      { name: 'Venus',   a: 2.25, b: 2.10, r: 0.13, color: 0xfde047, speed: 1.75, phase: 1.4 },
      { name: 'Earth',   a: 2.75, b: 2.55, r: 0.15, color: 0x0ea5e9, speed: 1.35, phase: 2.8, hasMoon: true },
      { name: 'Mars',    a: 3.20, b: 2.95, r: 0.12, color: 0xf97316, speed: 1.05, phase: 4.1 },
      { name: 'Jupiter', a: 3.78, b: 3.45, r: 0.28, color: 0xfb923c, speed: 0.72, phase: 0.9 },
      { name: 'Saturn',  a: 4.45, b: 4.05, r: 0.23, color: 0xfacc15, speed: 0.52, phase: 3.5, hasRing: true }
    ];

    this.p2Planets = [];
    planetsDef.forEach((p) => {
      // Elliptical Orbit Line
      const pts = [];
      for (let i = 0; i <= 72; i++) {
        const theta = (i / 72) * Math.PI * 2;
        pts.push(new THREE.Vector3(Math.cos(theta) * p.a, 0, Math.sin(theta) * p.b));
      }
      const orbitLine = new THREE.LineLoop(
        new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineBasicMaterial({ color: p.color, transparent: true, opacity: 0.32 })
      );
      this.p2SystemTilt.add(orbitLine);

      // Planet Group
      const pGroup = new THREE.Group();
      const pMesh = new THREE.Mesh(
        new THREE.SphereGeometry(p.r, 28, 28),
        new THREE.MeshStandardMaterial({
          color: p.color,
          emissive: p.color,
          emissiveIntensity: 0.52,
          roughness: 0.35,
          metalness: 0.25
        })
      );
      pGroup.add(pMesh);

      // Sub-Moon for Earth
      let subMoon = null;
      if (p.hasMoon) {
        subMoon = new THREE.Mesh(
          new THREE.SphereGeometry(0.045, 14, 14),
          new THREE.MeshBasicMaterial({ color: 0xf8fafc })
        );
        pGroup.add(subMoon);
      }

      // Tilted Dual Rings for Saturn
      if (p.hasRing) {
        const satRing = new THREE.Mesh(
          new THREE.RingGeometry(p.r * 1.35, p.r * 2.35, 36),
          new THREE.MeshBasicMaterial({
            color: 0xfef08a,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.85
          })
        );
        satRing.rotation.x = Math.PI * 0.38;
        pGroup.add(satRing);
      }

      this.p2SystemTilt.add(pGroup);
      this.p2Planets.push({ ...p, group: pGroup, subMoon, baseScale: 1.0 });
    });
  }

  // ==========================================================================
  // 3. PHASE 3: COSMIC SINGULARITY (Gargantua Black Hole, Spiral Galaxy, Quasars)
  // ==========================================================================
  _buildPhase3Universe() {
    // 3.1 Event Horizon: Absolute Pitch-Black Void
    const bhCoreGeo = new THREE.SphereGeometry(0.98, 64, 64);
    const bhCoreMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    this.p3BlackHole = new THREE.Mesh(bhCoreGeo, bhCoreMat);
    this.phase3Group.add(this.p3BlackHole);

    // 3.2 Razor-Sharp Photon Ring (Extreme Fresnel Rim Shader)
    const photonGeo = new THREE.SphereGeometry(1.06, 64, 64);
    const photonMat = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewPos;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
          vViewPos = -mvPos.xyz;
          gl_Position = projectionMatrix * mvPos;
        }
      `,
      fragmentShader: `
        uniform float uHitFlash;
        varying vec3 vNormal;
        varying vec3 vViewPos;
        void main() {
          float fresnel = pow(1.0 - abs(dot(vNormal, normalize(vViewPos))), 4.2);
          vec3 col = mix(vec3(0.18, 0.85, 1.0), vec3(0.95, 0.9, 1.0), fresnel);
          col = mix(col, vec3(1.0), uHitFlash);
          gl_FragColor = vec4(col, fresnel * 1.85);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      depthWrite: false
    });
    this.phase3Group.add(new THREE.Mesh(photonGeo, photonMat));

    // 3.3 Interstellar Gargantua Warped Accretion Disks with Doppler Beaming
    const diskShaderMat = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vPos;
        void main() {
          vUv = uv;
          vPos = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uHitFlash;
        varying vec2 vUv;
        varying vec3 vPos;

        void main() {
          float r = length(vPos.xy);
          float normR = clamp((r - 1.15) / (3.25 - 1.15), 0.0, 1.0);
          float angle = atan(vPos.y, vPos.x);

          // Doppler Beaming: Left-approaching matter is significantly brighter and blueshifted
          float doppler = 0.5 + 0.5 * cos(angle + 0.3);

          // Relativistic Spiral Pattern & Granular Turbulence
          float spiral = sin(angle * 6.0 - normR * 20.0 + uTime * 4.5) * 0.5 + 0.5;
          float bands = sin(normR * 42.0 - uTime * 6.8) * 0.5 + 0.5;
          float intensity = mix(spiral, bands, 0.52);

          // Thermal Spectral Gradient
          vec3 innerCol = vec3(1.0, 0.98, 0.86); // White-hot matter near horizon
          vec3 midCol   = vec3(1.0, 0.42, 0.08); // Fiery accretion orange
          vec3 outerCol = vec3(0.62, 0.14, 0.92); // Cosmic UV purple outer boundary

          vec3 col = mix(innerCol, midCol, smoothstep(0.0, 0.42, normR));
          col = mix(col, outerCol, smoothstep(0.42, 1.0, normR));
          col *= (0.65 + 0.85 * intensity) * (0.8 + 0.6 * doppler);
          col = mix(col, vec3(1.0), uHitFlash);

          float alpha = sin(normR * 3.14159) * (0.65 + 0.45 * intensity);
          gl_FragColor = vec4(col, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    // Primary Horizontal Warped Accretion Disk
    const diskGeo = new THREE.RingGeometry(1.15, 3.25, 128, 16);
    this.p3DiskMain = new THREE.Mesh(diskGeo, diskShaderMat);
    this.p3DiskMain.rotation.x = Math.PI * 0.42;

    // Vertical Arched Lensing Disk (Gravitational Lensing Halo arching behind)
    this.p3DiskLensed = new THREE.Mesh(diskGeo, diskShaderMat);
    this.p3DiskLensed.rotation.x = -Math.PI * 0.12;
    this.p3DiskLensed.position.set(0, 0.08, -0.15);
    this.p3DiskLensed.scale.set(0.88, 0.88, 0.88);

    this.phase3Group.add(this.p3DiskMain, this.p3DiskLensed);

    // 3.4 3-Arm Spiral Galaxy Particle Cloud (3,000 Particle Stars)
    const starCount = 3000;
    const galGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    const colorInside = new THREE.Color(0xffffff);
    const colorMid = new THREE.Color(0x38bdf8);
    const colorOutside = new THREE.Color(0xd946ef);

    for (let i = 0; i < starCount; i++) {
      const i3 = i * 3;
      const radius = 1.25 + Math.pow(Math.random(), 1.6) * 3.75;
      const spinAngle = radius * 2.5;
      const branchAngle = ((i % 3) / 3) * Math.PI * 2;

      const randX = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.32;
      const randY = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.24;
      const randZ = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.32;

      positions[i3]     = Math.cos(branchAngle + spinAngle) * radius + randX;
      positions[i3 + 1] = randY;
      positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randZ;

      const t = (radius - 1.25) / 3.75;
      const mixedColor = colorInside.clone().lerp(colorMid, Math.min(1.0, t * 1.5));
      if (t > 0.45) mixedColor.lerp(colorOutside, (t - 0.45) * 1.8);

      colors[i3]     = mixedColor.r;
      colors[i3 + 1] = mixedColor.g;
      colors[i3 + 2] = mixedColor.b;
    }

    galGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    galGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const galMat = new THREE.PointsMaterial({
      size: 0.075,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.95,
      depthWrite: false
    });

    this.p3Galaxy = new THREE.Points(galGeo, galMat);
    this.p3Galaxy.rotation.set(0.38, 0, -0.18);
    this.phase3Group.add(this.p3Galaxy);

    // 3.5 Relativistic Polar Quasar Jets with Feathered Soft Edge Shaders
    const jetShaderMat = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        void main() {
          // Soft fade at root (vUv.y ~ 0) and feathered fade at beam tip (vUv.y ~ 1)
          float edgeFade = sin(vUv.y * 3.14159);
          vec3 jetColor = mix(vec3(0.22, 0.75, 1.0), vec3(0.9, 0.95, 1.0), vUv.y);
          gl_FragColor = vec4(jetColor, edgeFade * 0.48);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    const jetGeo = new THREE.CylinderGeometry(0.08, 0.42, 3.8, 24, 8, true);
    this.p3JetNorth = new THREE.Mesh(jetGeo, jetShaderMat);
    this.p3JetNorth.position.y = 2.05;

    this.p3JetSouth = new THREE.Mesh(jetGeo, jetShaderMat);
    this.p3JetSouth.rotation.x = Math.PI;
    this.p3JetSouth.position.y = -2.05;

    this.p3JetsGroup = new THREE.Group();
    this.p3JetsGroup.rotation.z = -0.18;
    this.p3JetsGroup.add(this.p3JetNorth, this.p3JetSouth);
    this.phase3Group.add(this.p3JetsGroup);
  }

  // ==========================================================================
  // 3.5. PHASE 4: OMNIVERSE GOD (Quantum Tesseract, Merkaba Rings, God-Rays)
  // ==========================================================================
  _buildPhase4Omniverse() {
    // 4.1 Quantum Polyhedron Core with Custom Chromatic Iridescent Shader
    const coreVertexShader = `
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewPosition = -mvPosition.xyz;
        gl_Position = projectionMatrix * mvPosition;
      }
    `;

    const coreFragmentShader = `
      uniform float uTime;
      uniform float uHitFlash;
      varying vec3 vNormal;
      varying vec3 vViewPosition;

      void main() {
        vec3 normal = normalize(vNormal);
        vec3 viewDir = normalize(vViewPosition);
        float fresnel = pow(1.0 - abs(dot(normal, viewDir)), 2.2);

        // Chromatic multi-spectral color cycle (Gold, Cyan, Magenta, Violet)
        vec3 gold = vec3(1.0, 0.84, 0.0);
        vec3 cyan = vec3(0.0, 0.94, 1.0);
        vec3 rose = vec3(1.0, 0.15, 0.55);
        vec3 violet = vec3(0.68, 0.32, 0.98);

        float t = uTime * 1.8;
        vec3 col = mix(gold, cyan, sin(t + normal.x * 3.5) * 0.5 + 0.5);
        col = mix(col, rose, cos(t * 1.2 + normal.y * 3.5) * 0.5 + 0.5);
        col = mix(col, violet, sin(t * 1.5 + normal.z * 3.5) * 0.5 + 0.5);

        // Core divine white center highlight & hit flash
        col += fresnel * vec3(1.0, 1.0, 1.0) * 1.35;
        col += vec3(uHitFlash * 1.5);

        gl_FragColor = vec4(col, 0.95);
      }
    `;

    const coreShaderMat = new THREE.ShaderMaterial({
      vertexShader: coreVertexShader,
      fragmentShader: coreFragmentShader,
      uniforms: this.uniforms,
      transparent: true,
      blending: THREE.AdditiveBlending
    });

    const innerGeo = new THREE.OctahedronGeometry(0.85, 0);
    this.p4InnerCore = new THREE.Mesh(innerGeo, coreShaderMat);
    this.phase4Group.add(this.p4InnerCore);

    // 4.2 Outer Tesseract Geometric Cage (Icosahedron with golden edges & holographic faces)
    const cageGeo = new THREE.IcosahedronGeometry(1.48, 1);
    const cageEdges = new THREE.EdgesGeometry(cageGeo);
    const edgeMat = new THREE.LineBasicMaterial({
      color: 0xffd700,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });
    this.p4CageWire = new THREE.LineSegments(cageEdges, edgeMat);
    this.phase4Group.add(this.p4CageWire);

    const faceMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.16,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    this.p4CageFaces = new THREE.Mesh(cageGeo, faceMat);
    this.phase4Group.add(this.p4CageFaces);

    // 4.3 3 Sacred Merkaba Gimbal Rings (Yaw, Pitch, Roll)
    this.p4RingsGroup = new THREE.Group();

    // Ring 1 - Gold (X-plane)
    const r1Geo = new THREE.TorusGeometry(1.88, 0.038, 16, 64);
    const r1Mat = new THREE.MeshBasicMaterial({
      color: 0xffd700,
      transparent: true,
      opacity: 0.92,
      blending: THREE.AdditiveBlending
    });
    this.p4Ring1 = new THREE.Mesh(r1Geo, r1Mat);
    this.p4RingsGroup.add(this.p4Ring1);

    // Ring 2 - Cyan (Y-plane)
    const r2Geo = new THREE.TorusGeometry(2.22, 0.038, 16, 64);
    const r2Mat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.92,
      blending: THREE.AdditiveBlending
    });
    this.p4Ring2 = new THREE.Mesh(r2Geo, r2Mat);
    this.p4Ring2.rotation.x = Math.PI / 2;
    this.p4RingsGroup.add(this.p4Ring2);

    // Ring 3 - Neon Magenta (Z-plane)
    const r3Geo = new THREE.TorusGeometry(2.56, 0.038, 16, 64);
    const r3Mat = new THREE.MeshBasicMaterial({
      color: 0xff007f,
      transparent: true,
      opacity: 0.92,
      blending: THREE.AdditiveBlending
    });
    this.p4Ring3 = new THREE.Mesh(r3Geo, r3Mat);
    this.p4Ring3.rotation.y = Math.PI / 2;
    this.p4RingsGroup.add(this.p4Ring3);

    // 12 Sacred Orbiting Diamonds (4 on each ring)
    this.p4Satellites = [];
    const satGeo = new THREE.OctahedronGeometry(0.1, 0);
    const satMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending
    });

    for (let r = 0; r < 3; r++) {
      const radius = r === 0 ? 1.88 : (r === 1 ? 2.22 : 2.56);
      for (let s = 0; s < 4; s++) {
        const satMesh = new THREE.Mesh(satGeo, satMat);
        this.p4RingsGroup.add(satMesh);
        this.p4Satellites.push({
          mesh: satMesh,
          ringIdx: r,
          radius,
          angleOffset: (s * Math.PI) / 2,
          speed: (r === 0 ? 1.4 : (r === 1 ? -1.1 : 1.7)) * (0.8 + s * 0.05)
        });
      }
    }

    this.phase4Group.add(this.p4RingsGroup);

    // 4.4 6 Cardinal Trans-Dimensional Quasar God-Ray Beams
    this.p4BeamsGroup = new THREE.Group();
    const beamGeo = new THREE.ConeGeometry(0.24, 3.8, 16, 1, true);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    const dirs = [
      { rot: [0, 0, -Math.PI / 2], pos: [2.0, 0, 0] },
      { rot: [0, 0, Math.PI / 2], pos: [-2.0, 0, 0] },
      { rot: [0, 0, 0], pos: [0, 2.0, 0] },
      { rot: [Math.PI, 0, 0], pos: [0, -2.0, 0] },
      { rot: [Math.PI / 2, 0, 0], pos: [0, 0, 2.0] },
      { rot: [-Math.PI / 2, 0, 0], pos: [0, 0, -2.0] }
    ];

    dirs.forEach(d => {
      const b = new THREE.Mesh(beamGeo, beamMat);
      b.rotation.set(d.rot[0], d.rot[1], d.rot[2]);
      b.position.set(d.pos[0], d.pos[1], d.pos[2]);
      this.p4BeamsGroup.add(b);
    });
    this.phase4Group.add(this.p4BeamsGroup);

    // 4.5 Transcendent Omniverse Particle Cloud (2,500 particles in harmonic toroid cloud)
    const pCount = 2500;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    const pCols = new Float32Array(pCount * 3);
    const pColPalette = [
      new THREE.Color(0xffd700),
      new THREE.Color(0x00f0ff),
      new THREE.Color(0xff2a6d),
      new THREE.Color(0xa855f7),
      new THREE.Color(0xffffff)
    ];

    for (let i = 0; i < pCount; i++) {
      const u = Math.random() * Math.PI * 2;
      const v = Math.random() * Math.PI * 2;
      const R = 2.0 + Math.random() * 0.8;
      const r = 0.5 + Math.random() * 0.6;
      pPos[i * 3]     = (R + r * Math.cos(v)) * Math.cos(u);
      pPos[i * 3 + 1] = r * Math.sin(v);
      pPos[i * 3 + 2] = (R + r * Math.cos(v)) * Math.sin(u);

      const c = pColPalette[i % pColPalette.length];
      pCols[i * 3]     = c.r;
      pCols[i * 3 + 1] = c.g;
      pCols[i * 3 + 2] = c.b;
    }

    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    pGeo.setAttribute('color', new THREE.BufferAttribute(pCols, 3));

    const pMat = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.p4ParticleCloud = new THREE.Points(pGeo, pMat);
    this.phase4Group.add(this.p4ParticleCloud);
  }

  // ==========================================================================
  // 4. PHASE MORPHING & TRANSITION ANIMATIONS
  // ==========================================================================
  setVisible(vis) {
    this.visible = vis;
    this.root.visible = vis;
    document.body.classList.toggle('in-boss-mode', vis);
  }

  setHpRatio(ratio) {
    this.hpRatio = Math.max(0, Math.min(1.0, ratio));
    this.uniforms.uHpRatio.value = this.hpRatio;

    // Phase 1: Tectonic crust physically expands and cracks wider as HP drops!
    if (this.currentPhase === 1 && this.p1Crust) {
      const expansion = 1.0 + (1.0 - this.hpRatio) * 0.32;
      gsap.to(this.p1Crust.scale, {
        x: expansion,
        y: expansion,
        z: expansion,
        duration: 0.35,
        ease: 'power2.out'
      });
    }
  }

  setPhase(phaseNum, animateTransition = true) {
    this.currentPhase = phaseNum;

    // Update dynamic point light color per phase
    const lightColors = { 1: 0xff5500, 2: 0xffaa22, 3: 0x00f0ff, 4: 0xff00ff };
    if (this.bossPointLight) {
      this.bossPointLight.color.setHex(lightColors[phaseNum] || 0xff5500);
      this.bossPointLight.intensity = phaseNum === 4 ? 4.5 : 3.2;
    }

    const groups = [null, this.phase1Group, this.phase2Group, this.phase3Group, this.phase4Group];
    const targetGroup = groups[phaseNum];
    if (!targetGroup) return;

    // Safety: Kill previous tweens on all groups to avoid fast Alt+B overlap bugs
    gsap.killTweensOf(this.phase1Group.scale);
    gsap.killTweensOf(this.phase2Group.scale);
    gsap.killTweensOf(this.phase3Group.scale);
    gsap.killTweensOf(this.phase4Group.scale);

    if (!animateTransition) {
      this.phase1Group.visible = phaseNum === 1;
      this.phase2Group.visible = phaseNum === 2;
      this.phase3Group.visible = phaseNum === 3;
      this.phase4Group.visible = phaseNum === 4;
      this.phase1Group.scale.set(1, 1, 1);
      this.phase2Group.scale.set(1, 1, 1);
      this.phase3Group.scale.set(1, 1, 1);
      this.phase4Group.scale.set(1, 1, 1);
      return;
    }

    // Shockwave Ring on morphing
    const ringColor = phaseNum === 2 ? 0xfbbf24 : (phaseNum === 3 ? 0xa855f7 : (phaseNum === 4 ? 0x00f0ff : 0xff5500));
    this._spawnShockwaveRing(ringColor, 0.9);

    // Phase 2 Transition: If moving to Phase 3, planets spiral into the center first!
    if (phaseNum === 3 && this.phase2Group.visible) {
      this.p2Planets.forEach(p => {
        gsap.to(p.group.scale, { x: 0.01, y: 0.01, z: 0.01, duration: 0.32, ease: 'power3.in' });
        gsap.to(p.group.position, { x: 0, y: 0, z: 0, duration: 0.32, ease: 'power3.in' });
      });
    }

    // Shrink out old groups
    [this.phase1Group, this.phase2Group, this.phase3Group, this.phase4Group].forEach((g, idx) => {
      if (idx + 1 !== phaseNum && g.visible) {
        gsap.to(g.scale, {
          x: 0.01, y: 0.01, z: 0.01,
          duration: 0.35,
          ease: 'back.in(2)',
          onComplete: () => {
            g.visible = false;
            // Restore scale of planets for future runs
            if (idx + 1 === 2) {
              this.p2Planets.forEach(p => p.group.scale.set(1, 1, 1));
            }
          }
        });
      }
    });

    // Expand in target group
    targetGroup.visible = true;
    targetGroup.scale.set(0.01, 0.01, 0.01);
    gsap.to(targetGroup.scale, {
      x: 1, y: 1, z: 1,
      duration: 0.75,
      delay: 0.22,
      ease: 'elastic.out(1, 0.55)'
    });
  }

  cyclePhaseForTest() {
    this.setVisible(true);
    if (this.currentPhase === 1) {
      this.setPhase(2, true);
    } else if (this.currentPhase === 2) {
      this.setPhase(3, true);
    } else if (this.currentPhase === 3) {
      this.setPhase(4, true);
    } else if (this.currentPhase === 4) {
      this.playBigBangExplosion(() => {
        this.setPhase(1, true);
      });
      return 5;
    } else {
      this.setPhase(1, true);
    }
    return this.currentPhase;
  }

  // ==========================================================================
  // 5. HIT REACTIONS, ENERGY BEAMS & BIG BANG SUPERNOVA
  // ==========================================================================
  fireEnergyBeam(fromWorldPos, damageValue = 256) {
    if (!this.visible) return;

    const startVec = fromWorldPos
      ? new THREE.Vector3(fromWorldPos.x, fromWorldPos.y + 0.35, fromWorldPos.z)
      : new THREE.Vector3(0, 0.5, 0);
    const endVec = this.root.position.clone();

    // 3D Laser Energy Beam connecting merged tile to Boss core
    const distance = startVec.distanceTo(endVec);
    const beamGeo = new THREE.CylinderGeometry(0.06, 0.22, distance, 12, 1, true);
    const beamColor = damageValue >= 1024 ? 0xffd700 : (damageValue >= 512 ? 0xf43f5e : (damageValue >= 128 ? 0x00f0ff : 0xa855f7));
    const beamMat = new THREE.MeshBasicMaterial({
      color: beamColor,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const beamMesh = new THREE.Mesh(beamGeo, beamMat);
    const midPoint = startVec.clone().add(endVec).multiplyScalar(0.5);
    beamMesh.position.copy(midPoint);
    beamMesh.lookAt(endVec);
    beamMesh.rotateX(Math.PI / 2);
    this.scene.add(beamMesh);

    gsap.to(beamMesh.scale, { x: 2.2, z: 2.2, duration: 0.16 });
    gsap.to(beamMat, {
      opacity: 0,
      duration: 0.32,
      onComplete: () => {
        this.scene.remove(beamMesh);
        beamGeo.dispose();
        beamMat.dispose();
      }
    });

    // Boss Hit Recoil on root position (independent from animGroup hover!)
    gsap.killTweensOf(this.root.position);
    gsap.fromTo(
      this.root.position,
      { z: -4.5 },
      { z: -5.0, duration: 0.12, yoyo: true, repeat: 1, ease: 'power2.out', onComplete: () => { this.root.position.z = -4.5; } }
    );

    // Hit Flash & 4x Orbital Acceleration Burst
    gsap.fromTo(this.uniforms.uHitFlash, { value: 0.95 }, { value: 0, duration: 0.35 });
    gsap.fromTo(this, { speedMultiplier: 4.2 }, { speedMultiplier: 1.0, duration: 0.55, ease: 'power2.out' });

    this._spawnShockwaveRing(beamColor, 0.55);
    this._spawnDamagePopup(damageValue);
  }

  _spawnShockwaveRing(colorHex = 0x00f0ff, duration = 0.75) {
    const ringGeo = new THREE.RingGeometry(0.35, 0.65, 48);
    const ringMat = new THREE.MeshBasicMaterial({
      color: colorHex,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    this.fxGroup.add(ring);

    gsap.to(ring.scale, { x: 8.5, y: 8.5, z: 8.5, duration, ease: 'expo.out' });
    gsap.to(ringMat, {
      opacity: 0,
      duration,
      onComplete: () => {
        this.fxGroup.remove(ring);
        ringGeo.dispose();
        ringMat.dispose();
      }
    });
  }

  _spawnDamagePopup(damageValue) {
    const popup = document.createElement('div');
    popup.className = 'boss-dmg-popup';
    popup.textContent = `-${damageValue.toLocaleString()}`;
    if (damageValue >= 1024) popup.classList.add('crit');
    document.body.appendChild(popup);
    setTimeout(() => popup.remove(), 950);
  }

  playBigBangExplosion(onComplete = null) {
    const count = 3500;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const vel = [];
    const cols = new Float32Array(count * 3);
    const palette = [
      new THREE.Color(0xffd700),
      new THREE.Color(0x00f0ff),
      new THREE.Color(0xff2a6d),
      new THREE.Color(0xa855f7),
      new THREE.Color(0xffffff)
    ];

    for (let i = 0; i < count; i++) {
      pos[i * 3] = 0;
      pos[i * 3 + 1] = 0;
      pos[i * 3 + 2] = 0;

      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const speed = 2.0 + Math.random() * 13.0;
      vel.push({
        vx: Math.sin(phi) * Math.cos(theta) * speed,
        vy: Math.sin(phi) * Math.sin(theta) * speed,
        vz: Math.cos(phi) * speed
      });

      const c = palette[i % palette.length];
      cols[i * 3] = c.r;
      cols[i * 3 + 1] = c.g;
      cols[i * 3 + 2] = c.b;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(cols, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.15,
      vertexColors: true,
      transparent: true,
      opacity: 1,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const supernova = new THREE.Points(geo, mat);
    this.fxGroup.add(supernova);

    const state = { progress: 0 };
    gsap.killTweensOf(this.phase3Group.scale);
    gsap.killTweensOf(this.phase4Group.scale);
    gsap.to(this.phase3Group.scale, { x: 0.001, y: 0.001, z: 0.001, duration: 0.28, ease: 'power3.in' });
    gsap.to(this.phase4Group.scale, { x: 0.001, y: 0.001, z: 0.001, duration: 0.28, ease: 'power3.in' });

    gsap.to(state, {
      progress: 1,
      duration: 1.85,
      ease: 'expo.out',
      onUpdate: () => {
        const arr = geo.attributes.position.array;
        for (let i = 0; i < count; i++) {
          arr[i * 3]     = vel[i].vx * state.progress;
          arr[i * 3 + 1] = vel[i].vy * state.progress;
          arr[i * 3 + 2] = vel[i].vz * state.progress;
        }
        geo.attributes.position.needsUpdate = true;
        mat.opacity = 1 - state.progress * 0.85;
      },
      onComplete: () => {
        this.fxGroup.remove(supernova);
        geo.dispose();
        mat.dispose();
        // Reset scale of Phases 3 & 4 for future iterations
        this.phase3Group.scale.set(1, 1, 1);
        this.phase4Group.scale.set(1, 1, 1);
        if (onComplete) onComplete();
      }
    });
  }

  // ==========================================================================
  // 6. REALTIME 3D ANIMATION LOOP
  // ==========================================================================
  _startInternalLoop() {
    const tick = () => {
      this._rafId = requestAnimationFrame(tick);
      if (!this.visible) return;
      const dt = Math.min(0.05, this.clock.getDelta());
      this.update(dt);
    };
    tick();
  }

  update(dt) {
    const effDt = dt * this.speedMultiplier;
    this.uniforms.uTime.value += effDt;
    const t = this.uniforms.uTime.value;

    // Responsive Scale based on camera aspect ratio: avoids matrix recalculation every frame
    if (this.camera && this.camera.aspect && this._lastAspect !== this.camera.aspect) {
      this._lastAspect = this.camera.aspect;
      const respScale = Math.min(1.0, this.camera.aspect / 1.15);
      this.root.scale.setScalar(respScale);
    }

    // Billboarding: Halo always faces the camera
    if (this.camera && this.backdropHalo) {
      this.backdropHalo.quaternion.copy(this.camera.quaternion);
    }

    // Smooth hover/bobbing floating on animGroup (does not overwrite root recoil!)
    this.animGroup.position.y = Math.sin(t * 1.8) * 0.12;

    // --- PHASE 1 ANIMATIONS ---
    if (this.currentPhase === 1) {
      if (this.p1Core) this.p1Core.rotation.y += effDt * 0.45;
      if (this.p1Crust) {
        this.p1Crust.rotation.y -= effDt * 0.65;
        this.p1Crust.rotation.x += effDt * 0.25;
      }
      if (this.p1BeltPivot) {
        this.p1BeltPivot.rotation.y += effDt * 0.28;
      }

      // Live 3D Asteroid Orbiting
      if (this.p1AsteroidBelt && this.p1AsteroidData) {
        for (let i = 0; i < this.p1AsteroidData.length; i++) {
          const d = this.p1AsteroidData[i];
          d.angle += d.speed * effDt;
          d.curSpinX += d.spinX * effDt;
          d.curSpinY += d.spinY * effDt;

          this._dummyObj.position.set(
            Math.cos(d.angle) * d.radius,
            d.yOffset + Math.sin(d.angle * 2.5) * 0.05,
            Math.sin(d.angle) * d.radius
          );
          this._dummyObj.rotation.set(d.curSpinX, d.curSpinY, 0);
          this._dummyObj.scale.setScalar(d.scale);
          this._dummyObj.updateMatrix();
          this.p1AsteroidBelt.setMatrixAt(i, this._dummyObj.matrix);
        }
        this.p1AsteroidBelt.instanceMatrix.needsUpdate = true;
      }

      // Moons Elliptical Motion & Comet Trails
      if (this.p1Moons) {
        this.p1Moons.forEach((m) => {
          const angle = t * m.speed;
          const mx = Math.cos(angle) * m.a;
          const mz = Math.sin(angle) * m.b;
          m.mesh.position.set(mx, 0, mz);

          // Update trail history
          m.history.unshift(new THREE.Vector3(mx, 0, mz));
          if (m.history.length > 16) m.history.pop();

          const posArr = m.trailPositions;
          for (let i = 0; i < 16; i++) {
            const p = m.history[i] || m.mesh.position;
            posArr[i * 3]     = p.x;
            posArr[i * 3 + 1] = p.y;
            posArr[i * 3 + 2] = p.z;
          }
          m.trailLine.geometry.attributes.position.needsUpdate = true;
        });
      }
    }

    // --- PHASE 2 ANIMATIONS ---
    else if (this.currentPhase === 2) {
      if (this.p2Dyson1) {
        this.p2Dyson1.rotation.z += effDt * 0.85;
        this.p2Dyson1.rotation.y += effDt * 0.52;
      }
      if (this.p2Dyson2) {
        this.p2Dyson2.rotation.x -= effDt * 0.72;
        this.p2Dyson2.rotation.z += effDt * 0.45;
      }

      // 6 Planets Keplerian Elliptical Orbits
      if (this.p2Planets) {
        this.p2Planets.forEach((p) => {
          const angle = t * p.speed + p.phase;
          p.group.position.set(Math.cos(angle) * p.a, 0, Math.sin(angle) * p.b);
          p.group.rotation.y += effDt * 1.6;

          if (p.subMoon) {
            const ma = t * 4.5;
            p.subMoon.position.set(Math.cos(ma) * 0.28, 0.04, Math.sin(ma) * 0.28);
          }
        });
      }
    }

    // --- PHASE 3 ANIMATIONS ---
    else if (this.currentPhase === 3) {
      if (this.p3Galaxy) this.p3Galaxy.rotation.y += effDt * 0.55;
      if (this.p3DiskMain) this.p3DiskMain.rotation.z -= effDt * 1.25;
      if (this.p3DiskLensed) this.p3DiskLensed.rotation.z += effDt * 0.95;
    }

    // --- PHASE 4 ANIMATIONS (OMNIVERSE GOD) ---
    else if (this.currentPhase === 4) {
      if (this.p4InnerCore) {
        this.p4InnerCore.rotation.x += effDt * 1.6;
        this.p4InnerCore.rotation.y += effDt * 2.4;
      }
      if (this.p4CageWire) {
        this.p4CageWire.rotation.x -= effDt * 0.85;
        this.p4CageWire.rotation.z += effDt * 0.65;
      }
      if (this.p4CageFaces) {
        this.p4CageFaces.rotation.x = this.p4CageWire.rotation.x;
        this.p4CageFaces.rotation.z = this.p4CageWire.rotation.z;
      }
      if (this.p4Ring1) this.p4Ring1.rotation.z += effDt * 1.35;
      if (this.p4Ring2) this.p4Ring2.rotation.y -= effDt * 1.15;
      if (this.p4Ring3) this.p4Ring3.rotation.x += effDt * 0.95;

      if (this.p4Satellites) {
        this.p4Satellites.forEach(s => {
          const a = t * s.speed + s.angleOffset;
          if (s.ringIdx === 0) {
            s.mesh.position.set(Math.cos(a) * s.radius, Math.sin(a) * s.radius, 0);
          } else if (s.ringIdx === 1) {
            s.mesh.position.set(Math.cos(a) * s.radius, 0, Math.sin(a) * s.radius);
          } else {
            s.mesh.position.set(0, Math.cos(a) * s.radius, Math.sin(a) * s.radius);
          }
          s.mesh.rotation.x += effDt * 2.5;
          s.mesh.rotation.y += effDt * 2.5;
        });
      }

      if (this.p4BeamsGroup) {
        this.p4BeamsGroup.rotation.y += effDt * 0.45;
        this.p4BeamsGroup.rotation.x = Math.sin(t * 1.2) * 0.15;
      }

      if (this.p4ParticleCloud) {
        this.p4ParticleCloud.rotation.y += effDt * 0.35;
        this.p4ParticleCloud.rotation.z = Math.sin(t * 0.8) * 0.2;
      }
    }
  }

  dispose() {
    if (this._rafId) cancelAnimationFrame(this._rafId);
    this.root.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
        else obj.material.dispose();
      }
    });
    this.scene.remove(this.root);
  }
}
