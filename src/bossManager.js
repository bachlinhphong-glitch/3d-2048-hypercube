import * as THREE from 'three';
import gsap from 'gsap';
import { getGridPosition } from './board.js';
import { soundManager } from './sound.js';

/**
 * ⚡ BossManager — Dark Singularity Core Mode (Hố Đen / Cầu Năng Lượng Hắc Ám)
 *
 * 3-Phase Multi-Stage Challenge:
 * Phase 1: CORE — PHASER 1 (500 HP | 60s, +45s on clear + cleanses low 2,4 tiles)
 * Phase 2: CORE — PHASER 2 (1,500 HP | +45s, +60s on clear)
 * Phase 3: CORE — ABSOLUTE OBLITERATION (2,048 HP — Merge 1024 + 1024 to 2048 to obliterate the Singularity)
 */
export class BossManager {
  constructor(gameApp) {
    this.gameApp = gameApp;
    this.scene = gameApp.sceneManager.scene;
    this.camera = gameApp.sceneManager.camera;

    this.isActive = false;
    this.phase = 1;
    this.maxHp = 500;
    this.hp = 500;
    this.timer = 60.0;
    this.clearTime = 0.0;
    this.isDefeated = false;
    this.isObliterating = false;

    // 3D Visual Group: Dark Singularity Core floating above board
    this.group = new THREE.Group();
    this.group.position.set(0, 5.2, -4.2);
    this.group.visible = false;
    this.scene.add(this.group);

    // Core Components
    this.coreMesh = null;
    this.accretionDisk = null;
    this.ringGroup = new THREE.Group();
    this.group.add(this.ringGroup);

    // Dynamic Core Glow Light
    this.coreLight = new THREE.PointLight(0x8b5cf6, 2.5, 18);
    this.coreLight.position.set(0, 0, 0.5);
    this.group.add(this.coreLight);

    // Active VFX Container (Beams, shockwave rings, floating shards)
    this.vfxGroup = new THREE.Group();
    this.scene.add(this.vfxGroup);

    this.initCoreMeshes();
    this.initDOM();
  }

  initDOM() {
    this.hudEl = document.getElementById('boss-hud');
    this.phaseBadgeEl = document.getElementById('boss-phase-badge');
    this.hpFillEl = document.getElementById('boss-hp-fill');
    this.hpTextEl = document.getElementById('boss-hp-text');
    this.timerEl = document.getElementById('boss-timer-val');
    this.cutinBannerEl = document.getElementById('boss-cutin-banner');
    this.cutinTitleEl = document.getElementById('boss-cutin-title');
    this.cutinSubtitleEl = document.getElementById('boss-cutin-subtitle');
    this.damageContainer = document.getElementById('boss-damage-container');
    this.flashEl = document.getElementById('cinematic-flash');
  }

  initCoreMeshes() {
    // 1. Central Pitch-Black Light-Absorbing Singularity Sphere
    const coreGeo = new THREE.SphereGeometry(1.35, 48, 48);
    this.coreMat = new THREE.MeshStandardMaterial({
      color: 0x030306,
      roughness: 0.22,
      metalness: 0.96,
      emissive: 0x1f062e,
      emissiveIntensity: 0.8
    });
    this.coreMesh = new THREE.Mesh(coreGeo, this.coreMat);
    this.group.add(this.coreMesh);

    // 2. Accretion Event Horizon Disk
    const accretionGeo = new THREE.RingGeometry(1.38, 2.2, 64);
    this.accretionMat = new THREE.MeshBasicMaterial({
      color: 0x8b5cf6,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.45,
      depthWrite: false
    });
    this.accretionDisk = new THREE.Mesh(accretionGeo, this.accretionMat);
    this.accretionDisk.rotation.x = Math.PI / 3.4;
    this.group.add(this.accretionDisk);

    // 3. Three High-Speed Counter-Rotating Mechanical Gimbal Rings
    const ringGeo1 = new THREE.TorusGeometry(1.95, 0.045, 16, 72);
    this.ringMat1 = new THREE.MeshStandardMaterial({
      color: 0x12121c,
      emissive: 0x8b5cf6,
      emissiveIntensity: 0.95,
      metalness: 0.94,
      roughness: 0.16
    });
    this.ring1 = new THREE.Mesh(ringGeo1, this.ringMat1);
    this.ringGroup.add(this.ring1);

    const ringGeo2 = new THREE.TorusGeometry(2.50, 0.040, 16, 72);
    this.ringMat2 = new THREE.MeshStandardMaterial({
      color: 0x12121c,
      emissive: 0xd90429,
      emissiveIntensity: 0.95,
      metalness: 0.94,
      roughness: 0.16
    });
    this.ring2 = new THREE.Mesh(ringGeo2, this.ringMat2);
    this.ringGroup.add(this.ring2);

    const ringGeo3 = new THREE.TorusGeometry(3.10, 0.038, 16, 72);
    this.ringMat3 = new THREE.MeshStandardMaterial({
      color: 0x12121c,
      emissive: 0xc026d3,
      emissiveIntensity: 0.95,
      metalness: 0.94,
      roughness: 0.16
    });
    this.ring3 = new THREE.Mesh(ringGeo3, this.ringMat3);
    this.ringGroup.add(this.ring3);

    // 4. Procedural Crackling Electronic Lightning Arcs (Blood Crimson & Deep Violet)
    this.lightningCount = 10;
    this.lightningSegments = 5;
    const totalVerts = this.lightningCount * this.lightningSegments * 2;
    this.lightningGeo = new THREE.BufferGeometry();
    this.lightningPositions = new Float32Array(totalVerts * 3);
    this.lightningGeo.setAttribute('position', new THREE.BufferAttribute(this.lightningPositions, 3));
    this.lightningMat = new THREE.LineBasicMaterial({
      color: 0x8b5cf6,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });
    this.lightningMesh = new THREE.LineSegments(this.lightningGeo, this.lightningMat);
    this.group.add(this.lightningMesh);
    this.lightningTimer = 0;
  }

  updateLightningArcs() {
    if (!this.lightningGeo || !this.lightningPositions) return;
    const pos = this.lightningPositions;
    let ptr = 0;

    for (let i = 0; i < this.lightningCount; i++) {
      // Pick random point on singularity sphere (radius 1.35)
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const rInner = 1.35;
      const startX = rInner * Math.sin(phi) * Math.cos(theta);
      const startY = rInner * Math.sin(phi) * Math.sin(theta);
      const startZ = rInner * Math.cos(phi);

      // Pick target on outer gimbal rings (radius 2.0 to 3.1)
      const rOuter = 2.0 + Math.random() * 1.1;
      const endX = rOuter * Math.sin(phi + (Math.random() - 0.5) * 0.5) * Math.cos(theta + (Math.random() - 0.5) * 0.5);
      const endY = rOuter * Math.sin(phi + (Math.random() - 0.5) * 0.5) * Math.sin(theta + (Math.random() - 0.5) * 0.5);
      const endZ = rOuter * Math.cos(phi + (Math.random() - 0.5) * 0.5);

      // Jittered zigzag arc
      let prevX = startX;
      let prevY = startY;
      let prevZ = startZ;

      for (let s = 1; s <= this.lightningSegments; s++) {
        const frac = s / this.lightningSegments;
        const jitter = s < this.lightningSegments ? (Math.random() - 0.5) * 0.45 : 0;
        const currX = startX + (endX - startX) * frac + jitter;
        const currY = startY + (endY - startY) * frac + jitter;
        const currZ = startZ + (endZ - startZ) * frac + jitter;

        pos[ptr++] = prevX;
        pos[ptr++] = prevY;
        pos[ptr++] = prevZ;
        pos[ptr++] = currX;
        pos[ptr++] = currY;
        pos[ptr++] = currZ;

        prevX = currX;
        prevY = currY;
        prevZ = currZ;
      }
    }

    this.lightningGeo.attributes.position.needsUpdate = true;
  }

  startRaid() {
    this.isActive = true;
    this.phase = 1;
    this.maxHp = 500;
    this.hp = 500;
    this.timer = 60.0;
    this.clearTime = 0.0;
    this.isDefeated = false;
    this.isObliterating = false;

    this.group.visible = true;
    this.group.scale.set(0.01, 0.01, 0.01);
    this.group.position.set(0, 5.2, -4.2);
    gsap.to(this.group.scale, { x: 1, y: 1, z: 1, duration: 0.9, ease: 'back.out(1.7)' });

    this.applyPhaseVisuals(1);
    if (this.hudEl) this.hudEl.style.display = 'flex';
    this.updateHUD();

    this.triggerBanner('⚔️ CORE — PHASE 1', '500 HP | 60s');
    soundManager.playPhaseTransition();
    soundManager.triggerHaptic('slide');
  }

  stopRaid() {
    this.isActive = false;
    this.group.visible = false;
    if (this.hudEl) this.hudEl.style.display = 'none';
    this.clearVFX();
  }

  applyPhaseVisuals(phase) {
    this.phase = phase;
    if (phase === 1) {
      this.maxHp = 500;
      this.coreMat.emissive.setHex(0x1f062e);
      this.coreMat.emissiveIntensity = 0.8;
      this.coreLight.color.setHex(0x8b5cf6);
      this.accretionMat.color.setHex(0x8b5cf6);
      this.ringMat1.emissive.setHex(0x8b5cf6);
      this.ringMat2.emissive.setHex(0xd90429);
      this.ringMat3.emissive.setHex(0x6d28d9);
      this.lightningMat.color.setHex(0x8b5cf6);
      if (this.phaseBadgeEl) {
        this.phaseBadgeEl.textContent = 'CORE — PHASE 1';
        this.phaseBadgeEl.className = 'boss-phase-badge p1';
      }
    } else if (phase === 2) {
      this.maxHp = 1500;
      this.coreMat.emissive.setHex(0x3a0410);
      this.coreMat.emissiveIntensity = 1.35;
      this.coreLight.color.setHex(0xd90429);
      this.accretionMat.color.setHex(0xd90429);
      this.ringMat1.emissive.setHex(0xd90429);
      this.ringMat2.emissive.setHex(0xc026d3);
      this.ringMat3.emissive.setHex(0xef4444);
      this.lightningMat.color.setHex(0xd90429);
      if (this.phaseBadgeEl) {
        this.phaseBadgeEl.textContent = 'CORE — PHASE 2';
        this.phaseBadgeEl.className = 'boss-phase-badge p2';
      }
    } else if (phase === 3) {
      this.maxHp = 2048;
      this.coreMat.emissive.setHex(0x450a0a);
      this.coreMat.emissiveIntensity = 1.8;
      this.coreLight.color.setHex(0xfbbf24);
      this.accretionMat.color.setHex(0xf59e0b);
      this.ringMat1.emissive.setHex(0xfbbf24);
      this.ringMat2.emissive.setHex(0xd90429);
      this.ringMat3.emissive.setHex(0xa855f7);
      this.lightningMat.color.setHex(0xfbbf24);
      if (this.phaseBadgeEl) {
        this.phaseBadgeEl.textContent = 'CORE — PHASE 3';
        this.phaseBadgeEl.className = 'boss-phase-badge p3';
      }
    }
  }

  updateHUD() {
    if (!this.hudEl) return;
    const pct = Math.max(0, Math.min(100, (this.hp / this.maxHp) * 100));
    if (this.hpFillEl) {
      this.hpFillEl.style.width = `${pct}%`;
    }
    if (this.hpTextEl) {
      this.hpTextEl.textContent = `${Math.ceil(this.hp)} / ${this.maxHp} HP`;
    }
    if (this.timerEl) {
      const mins = Math.floor(Math.max(0, this.timer) / 60);
      const secs = Math.floor(Math.max(0, this.timer) % 60);
      this.timerEl.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      this.timerEl.classList.toggle('danger', this.timer <= 15);
    }
  }

  update(delta, time) {
    if (!this.isActive || !this.group.visible) return;

    this.clearTime += delta;
    this.timer -= delta;
    this.updateHUD();

    if (this.timer <= 0 && !this.isDefeated) {
      this.onTimeout();
      return;
    }

    // High-speed counter-rotations and floating animation
    const speed = this.phase === 3 ? 3.0 : (this.phase === 2 ? 2.2 : 1.6);
    this.group.position.y = 5.2 + Math.sin(time * 2.0) * 0.16;

    if (this.coreMesh) {
      this.coreMesh.rotation.y += delta * 0.5 * speed;
      this.coreMesh.rotation.x += delta * 0.3 * speed;
    }
    if (this.accretionDisk) {
      this.accretionDisk.rotation.z += delta * 1.5 * speed;
    }
    if (this.ring1) {
      this.ring1.rotation.x += delta * 2.2 * speed;
      this.ring1.rotation.y += delta * 1.8 * speed;
    }
    if (this.ring2) {
      this.ring2.rotation.y -= delta * 2.6 * speed;
      this.ring2.rotation.z += delta * 2.0 * speed;
    }
    if (this.ring3) {
      this.ring3.rotation.z += delta * 2.4 * speed;
      this.ring3.rotation.x -= delta * 1.6 * speed;
    }

    // Procedural Lightning Arcs Update (every 0.05s)
    this.lightningTimer += delta;
    if (this.lightningTimer > 0.05) {
      this.lightningTimer = 0;
      this.updateLightningArcs();
    }
  }

  onTileMerge(value, tileGridPos) {
    if (!this.isActive || this.isDefeated || this.isObliterating) return;

    let damage = value;
    let is2048Finale = false;

    if (this.phase === 3) {
      if (value === 2048) {
        damage = this.hp;
        is2048Finale = true;
      }
    }

    // Deduct HP directly
    this.hp = Math.max(0, this.hp - damage);
    this.updateHUD();

    const origin = getGridPosition(tileGridPos.l, tileGridPos.r, tileGridPos.c);
    const coreTarget = this.group.position.clone();

    // 1. Light Beam for merges >= 64
    if (value >= 64 || is2048Finale) {
      this.fireLightBeam(origin, coreTarget, value, is2048Finale);
    }

    // 2. Core elastic bounce & flash
    this.pulseCoreOnHit(value, is2048Finale);

    // 3. Sound & Damage number
    soundManager.playBossHit(value);
    soundManager.triggerHaptic(value >= 512 ? 'merge_big' : 'merge_small');
    this.spawnDamageNumber(damage, value >= 512 || is2048Finale);

    // 4. Check Phase completion or Finale
    if (is2048Finale) {
      this.execute2048Finale();
    } else if (this.hp <= 0) {
      this.onPhaseCleared();
    }
  }

  fireLightBeam(startPos, endPos, tileValue, isFinale = false) {
    const beamColor = isFinale
      ? 0xfbbf24
      : (tileValue >= 512 ? 0xf43f5e : (tileValue >= 128 ? 0x00f0ff : 0xa855f7));

    const curve = new THREE.LineCurve3(
      new THREE.Vector3(startPos.x, startPos.y + 0.3, startPos.z),
      new THREE.Vector3(endPos.x, endPos.y, endPos.z)
    );
    const radius = isFinale ? 0.28 : (tileValue >= 512 ? 0.16 : 0.09);
    const tubeGeo = new THREE.TubeGeometry(curve, 6, radius, 8, false);
    const tubeMat = new THREE.MeshBasicMaterial({
      color: beamColor,
      transparent: true,
      opacity: 0.95
    });
    const beamMesh = new THREE.Mesh(tubeGeo, tubeMat);
    this.vfxGroup.add(beamMesh);

    soundManager.playBossLaser(tileValue);

    gsap.to(tubeMat, {
      opacity: 0,
      duration: isFinale ? 0.45 : 0.25,
      ease: 'power2.out',
      onComplete: () => {
        tubeGeo.dispose();
        tubeMat.dispose();
        this.vfxGroup.remove(beamMesh);
      }
    });

    this.gameApp.particleSystem.burst(startPos.x, startPos.y + 0.3, startPos.z, tileValue);
  }

  pulseCoreOnHit(tileValue, isFinale) {
    if (!this.coreMesh) return;

    // Satisfying elastic bounce pulse with GSAP
    gsap.killTweensOf(this.coreMesh.scale);
    const punch = isFinale ? 1.45 : (tileValue >= 512 ? 1.25 : 1.12);
    gsap.fromTo(this.coreMesh.scale,
      { x: punch, y: 1 / punch, z: punch },
      { x: 1, y: 1, z: 1, duration: 0.45, ease: 'elastic.out(1.2, 0.4)' }
    );

    // Subtle white glow flash
    const prevEmissive = this.coreMat.emissive.getHex();
    this.coreMat.emissive.setHex(0xffffff);
    gsap.delayedCall(0.08, () => {
      this.coreMat.emissive.setHex(prevEmissive);
    });

    if (tileValue >= 512) {
      this.gameApp.particleSystem.screenShake(this.camera, 0.16);
    }
  }

  spawnDamageNumber(amount, isHighlight) {
    if (!this.damageContainer) return;

    const el = document.createElement('div');
    el.className = `boss-damage-number ${isHighlight ? 'critical' : 'normal'}`;
    el.textContent = `-${amount.toLocaleString()}`;

    const rx = (Math.random() - 0.5) * 120;
    const ry = (Math.random() - 0.5) * 40;
    el.style.transform = `translate(calc(-50% + ${rx}px), calc(-50% + ${ry}px))`;

    this.damageContainer.appendChild(el);
    setTimeout(() => el.remove(), 850);
  }

  onPhaseCleared() {
    if (this.phase === 1) {
      // Phase 1 -> Phase 2
      this.emitExpandingRingWave(0xd90429);
      soundManager.playPhaseTransition();
      this.cleanseLowTiles();

      this.timer += 45.0;
      this.applyPhaseVisuals(2);
      this.hp = 1500;
      this.updateHUD();

      this.triggerBanner('⚡ CORE — PHASE 2', '1,500 HP | +45s (Đã dọn gọn các khối [2], [4])');
    } else if (this.phase === 2) {
      // Phase 2 -> Phase 3
      this.emitExpandingRingWave(0xfbbf24);
      soundManager.playPhaseTransition();

      this.timer += 60.0;
      this.applyPhaseVisuals(3);
      this.hp = 2048;
      this.updateHUD();

      this.triggerBanner('💥 CORE — PHASE 3', '2,048 HP | Gộp khối [1024 + 1024] -> [2048] để hủy diệt!');
    }
  }

  // Expanding light ring sweeping gracefully across the board
  emitExpandingRingWave(colorHex) {
    const ringGeo = new THREE.RingGeometry(0.2, 0.6, 48);
    const ringMat = new THREE.MeshBasicMaterial({
      color: colorHex,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide
    });
    const waveMesh = new THREE.Mesh(ringGeo, ringMat);
    waveMesh.rotation.x = -Math.PI / 2;
    waveMesh.position.set(0, 0.25, 0);
    this.vfxGroup.add(waveMesh);

    gsap.to(waveMesh.scale, {
      x: 22,
      y: 22,
      z: 22,
      duration: 1.1,
      ease: 'power2.out'
    });
    gsap.to(ringMat, {
      opacity: 0,
      duration: 1.1,
      ease: 'power2.in',
      onComplete: () => {
        ringGeo.dispose();
        ringMat.dispose();
        this.vfxGroup.remove(waveMesh);
      }
    });

    this.gameApp.particleSystem.screenShake(this.camera, 0.2);
  }

  cleanseLowTiles() {
    let count = 0;
    const logic = this.gameApp.gameLogic;
    const tiles3D = this.gameApp.tiles3D;

    for (let l = 0; l < logic.layers; l++) {
      for (let r = 0; r < logic.rows; r++) {
        for (let c = 0; c < logic.cols; c++) {
          const cell = logic.grid[l][r][c];
          if (cell && (cell.value === 2 || cell.value === 4)) {
            const tile3D = tiles3D[l][r][c];
            if (tile3D) {
              const pos = getGridPosition(l, r, c);
              this.gameApp.particleSystem.burst(pos.x, pos.y + 0.3, pos.z, 256);
              tile3D.dispose(true);
              tiles3D[l][r][c] = null;
            }
            logic.grid[l][r][c] = null;
            count++;
          }
        }
      }
    }
    if (count > 0) {
      this.gameApp.showSpellToast(`✨ Đã dọn gọn ${count} khối số nhỏ [2] & [4]!`);
      this.gameApp.saveGameState();
    }
  }

  execute2048Finale() {
    this.isObliterating = true;
    this.isDefeated = true;
    this.hp = 0;
    this.updateHUD();

    // 1. Subtle soft golden slow-mo flash
    if (this.flashEl) {
      this.flashEl.style.opacity = '0.75';
      gsap.to(this.flashEl, { opacity: 0, duration: 1.0, ease: 'power2.out' });
    }

    // 2. Play lush celestial chime sound & haptic
    soundManager.playBossObliteration();
    soundManager.triggerHaptic('bomb');
    this.gameApp.particleSystem.screenShake(this.camera, 0.35);

    // 3. Stardust Crystal Fireworks (Weightless floating crystal particles)
    this.spawnCrystalFireworks();

    // 4. Elegant Stage Clear Modal
    const totalSecs = Math.round(this.clearTime);
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    const timeStr = `${m > 0 ? m + 'm ' : ''}${s}s`;

    gsap.delayedCall(1.8, () => {
      this.showStageClearModal(timeStr);
    });
  }

  spawnCrystalFireworks() {
    const shardCount = 64;
    const shardGeo = new THREE.OctahedronGeometry(0.2, 0);
    const shardMat = new THREE.MeshBasicMaterial({
      color: 0xfbbf24,
      wireframe: false
    });

    const origin = this.group.position.clone();

    for (let i = 0; i < shardCount; i++) {
      const mesh = new THREE.Mesh(shardGeo, shardMat);
      mesh.position.copy(origin);
      this.vfxGroup.add(mesh);

      const vx = (Math.random() - 0.5) * 12;
      const vy = (Math.random() - 0.2) * 10;
      const vz = (Math.random() - 0.5) * 10;

      gsap.to(mesh.position, {
        x: origin.x + vx,
        y: origin.y + vy,
        z: origin.z + vz,
        duration: 2.2,
        ease: 'power3.out'
      });
      gsap.to(mesh.scale, {
        x: 0.01,
        y: 0.01,
        z: 0.01,
        duration: 2.2,
        ease: 'power2.in',
        onComplete: () => {
          this.vfxGroup.remove(mesh);
        }
      });
      gsap.to(mesh.rotation, {
        x: Math.random() * 8,
        y: Math.random() * 8,
        duration: 2.2
      });
    }

    // Smoothly dissolve Core
    gsap.to(this.group.scale, {
      x: 0.001,
      y: 0.001,
      z: 0.001,
      duration: 0.7,
      ease: 'power3.in',
      onComplete: () => {
        this.group.visible = false;
      }
    });
  }

  showStageClearModal(clearTimeStr) {
    this.gameApp.showModal({
      title: '✨ STAGE CLEAR — CORE DESTROYED',
      message: `Tuyệt phẩm! Bạn đã hòa hợp khối [2048] và tiêu diệt hoàn toàn Dark Singularity Core!\n\n⏱️ Thời gian hoàn thành: ${clearTimeStr}\nĐiểm số đạt được: ${this.gameApp.gameLogic.score.toLocaleString()} điểm`,
      primaryText: '🎮 Chơi lại ngay',
      secondaryText: '📤 Chia sẻ kết quả',
      onPrimary: () => {
        this.gameApp.hideModal();
        this.gameApp.isAnimating = false;
        this.stopRaid();
        this.gameApp.startNewGame(false);
      },
      onSecondary: () => {
        this.gameApp.shareScore();
      }
    });
  }

  onTimeout() {
    this.isDefeated = true;
    soundManager.playGameOver();

    this.gameApp.showModal({
      title: '💀 THẤT BẠI (GAME OVER)',
      message: `Hết giờ trong chế độ Boss Mode!\nNăng lượng hắc ám đã tiêu hao: ${(this.maxHp - this.hp).toLocaleString()} / ${this.maxHp.toLocaleString()} HP`,
      primaryText: '🎮 Chơi lại ngay',
      secondaryText: '🎮 Ván mới',
      onPrimary: () => {
        this.gameApp.hideModal();
        this.gameApp.isAnimating = false;
        this.startRaid();
        this.gameApp.startNewGame(false);
      },
      onSecondary: () => {
        this.gameApp.hideModal();
        this.gameApp.isAnimating = false;
        this.stopRaid();
        this.gameApp.startNewGame(false);
      }
    });
  }

  triggerBanner(title, subtitle) {
    if (!this.cutinBannerEl) return;
    if (this.cutinTitleEl) this.cutinTitleEl.textContent = title;
    if (this.cutinSubtitleEl) this.cutinSubtitleEl.textContent = subtitle;

    this.cutinBannerEl.classList.remove('active');
    void this.cutinBannerEl.offsetWidth;
    this.cutinBannerEl.classList.add('active');

    setTimeout(() => {
      this.cutinBannerEl.classList.remove('active');
    }, 2200);
  }

  // Developer & Quick Test shortcut (Alt+B)
  setupTestPhase3() {
    if (!this.isActive) {
      this.startRaid();
    }
    this.phase = 3;
    this.applyPhaseVisuals(3);
    this.hp = 2048;
    this.timer = 60.0;
    this.updateHUD();

    this.gameApp.cleanAllSceneTiles();
    this.gameApp.tiles3D = this.gameApp.createEmptyTileGrid();
    this.gameApp.gameLogic.reset();

    // Spawn two 1024 tiles side by side
    this.gameApp.spawnSpecificTile(0, 0, 0, 1024);
    this.gameApp.spawnSpecificTile(0, 0, 1, 1024);

    this.triggerBanner('💥 CORE — PHASE 3', 'Trượt sang Trái (A / ←) để gộp 2 khối [1024] -> [2048]!');
    this.gameApp.showSpellToast('⚡ Sẵn sàng: Trượt sang Trái để hủy diệt Dark Singularity Core!');
  }

  clearVFX() {
    while (this.vfxGroup.children.length > 0) {
      const obj = this.vfxGroup.children[0];
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
        else obj.material.dispose();
      }
      this.vfxGroup.remove(obj);
    }
  }
}
