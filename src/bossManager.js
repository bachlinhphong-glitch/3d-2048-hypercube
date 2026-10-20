import * as THREE from 'three';
import gsap from 'gsap';
import { getGridPosition } from './board.js';
import { soundManager } from './sound.js';

/**
 * ⚡ BossManager — Clean & Modern 3-Phase Energy Core Mode
 *
 * Minimalist, satisfying 3D puzzle aesthetic:
 * Phase 1: 500 HP | 60s (+45s on clear + cleanses low 2,4 tiles)
 * Phase 2: 1,500 HP | +45s (+60s on clear)
 * Phase 3: 2,048 HP — Merge 1024 + 1024 to 2048 to trigger the crystal stardust finale!
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

    // 3D Visual Group: Energy Core floating above board
    this.group = new THREE.Group();
    this.group.position.set(0, 5.0, -4.2);
    this.group.visible = false;
    this.scene.add(this.group);

    // Core Components
    this.coreMesh = null;
    this.innerCrystal = null;
    this.ringGroup = new THREE.Group();
    this.group.add(this.ringGroup);

    // Dynamic Core Glow Light
    this.coreLight = new THREE.PointLight(0x00f0ff, 2.2, 18);
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
    // 1. Central Faceted Crystal Core
    const coreGeo = new THREE.IcosahedronGeometry(1.5, 1);
    this.coreMat = new THREE.MeshStandardMaterial({
      color: 0x0d1f33,
      emissive: 0x00f0ff,
      emissiveIntensity: 0.85,
      roughness: 0.12,
      metalness: 0.88,
      flatShading: true
    });
    this.coreMesh = new THREE.Mesh(coreGeo, this.coreMat);
    this.group.add(this.coreMesh);

    // 2. Inner Glowing Octahedron Crystal
    const innerGeo = new THREE.OctahedronGeometry(1.0, 0);
    this.innerMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.75
    });
    this.innerCrystal = new THREE.Mesh(innerGeo, this.innerMat);
    this.group.add(this.innerCrystal);

    // 3. Elegant Orbital Rings (Smooth & Minimal)
    const ringGeo1 = new THREE.TorusGeometry(2.25, 0.035, 12, 48);
    this.ringMat1 = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x00a3cc,
      metalness: 0.9,
      roughness: 0.1
    });
    this.ring1 = new THREE.Mesh(ringGeo1, this.ringMat1);
    this.ringGroup.add(this.ring1);

    const ringGeo2 = new THREE.TorusGeometry(2.55, 0.03, 12, 48);
    this.ringMat2 = new THREE.MeshStandardMaterial({
      color: 0xa855f7,
      emissive: 0x7e22ce,
      metalness: 0.9,
      roughness: 0.1
    });
    this.ring2 = new THREE.Mesh(ringGeo2, this.ringMat2);
    this.ringGroup.add(this.ring2);
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
    this.group.position.set(0, 5.0, -4.2);
    gsap.to(this.group.scale, { x: 1, y: 1, z: 1, duration: 0.9, ease: 'back.out(1.7)' });

    this.applyPhaseVisuals(1);
    if (this.hudEl) this.hudEl.style.display = 'flex';
    this.updateHUD();

    this.triggerBanner('⚡ BOSS MODE ACTIVATED', 'PHASE 1 / 3 — 500 HP (60s)');
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
      this.coreMat.emissive.setHex(0x00f0ff);
      this.coreMat.emissiveIntensity = 0.85;
      this.coreLight.color.setHex(0x00f0ff);
      this.ringMat1.color.setHex(0x00f0ff);
      this.ringMat1.emissive.setHex(0x00a3cc);
      if (this.phaseBadgeEl) {
        this.phaseBadgeEl.textContent = 'PHASE 1 / 3';
        this.phaseBadgeEl.className = 'boss-phase-badge p1';
      }
    } else if (phase === 2) {
      this.maxHp = 1500;
      this.coreMat.emissive.setHex(0xd946ef); // Radiant Neon Magenta
      this.coreMat.emissiveIntensity = 1.35;
      this.coreLight.color.setHex(0xd946ef);
      this.ringMat1.color.setHex(0xf43f5e);
      this.ringMat1.emissive.setHex(0xe11d48);
      if (this.phaseBadgeEl) {
        this.phaseBadgeEl.textContent = 'PHASE 2 / 3';
        this.phaseBadgeEl.className = 'boss-phase-badge p2';
      }
    } else if (phase === 3) {
      this.maxHp = 2048;
      this.coreMat.emissive.setHex(0xfbbf24); // Celestial Gold
      this.coreMat.emissiveIntensity = 1.8;
      this.coreLight.color.setHex(0xfbbf24);
      this.ringMat1.color.setHex(0xf59e0b);
      this.ringMat1.emissive.setHex(0xd97706);
      if (this.phaseBadgeEl) {
        this.phaseBadgeEl.textContent = 'FINAL PHASE';
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

    // Gentle floating breathing animation
    const speed = this.phase === 3 ? 2.2 : (this.phase === 2 ? 1.6 : 1.0);
    this.group.position.y = 5.0 + Math.sin(time * 1.6) * 0.18;

    if (this.coreMesh) {
      this.coreMesh.rotation.y += delta * 0.35 * speed;
      this.coreMesh.rotation.x += delta * 0.2 * speed;
    }
    if (this.innerCrystal) {
      this.innerCrystal.rotation.y -= delta * 0.6 * speed;
      this.innerCrystal.rotation.z += delta * 0.4 * speed;
    }
    if (this.ring1) {
      this.ring1.rotation.x += delta * 0.7 * speed;
      this.ring1.rotation.y += delta * 0.5 * speed;
    }
    if (this.ring2) {
      this.ring2.rotation.y -= delta * 0.6 * speed;
      this.ring2.rotation.z += delta * 0.4 * speed;
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
      this.emitExpandingRingWave(0x00f0ff);
      soundManager.playPhaseTransition();
      this.cleanseLowTiles();

      this.timer += 45.0;
      this.applyPhaseVisuals(2);
      this.hp = 1500;
      this.updateHUD();

      this.triggerBanner('✨ PHASE 2 / 3', '+45s & Đã dọn sạch các khối [2], [4]!');
    } else if (this.phase === 2) {
      // Phase 2 -> Phase 3
      this.emitExpandingRingWave(0xd946ef);
      soundManager.playPhaseTransition();

      this.timer += 60.0;
      this.applyPhaseVisuals(3);
      this.hp = 2048;
      this.updateHUD();

      this.triggerBanner('🌟 FINAL PHASE', 'Gộp khối [1024 + 1024] thành [2048] để hoàn tất!');
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
      title: '✨ STAGE CLEAR — 2048 COMPLETE',
      message: `Tuyệt phẩm! Bạn đã hòa hợp khối [2048] và hoàn tất trọn vẹn cả 3 Phase của Energy Core!\n\n⏱️ Thời gian hoàn thành: ${clearTimeStr}\nĐiểm số đạt được: ${this.gameApp.gameLogic.score.toLocaleString()} điểm`,
      primaryText: 'Chơi ván mới',
      secondaryText: 'Chia sẻ kết quả',
      onPrimary: () => {
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
      title: '⌛ HẾT THỜI GIAN',
      message: `Hết giờ trong chế độ Boss Mode!\nNăng lượng đã tiêu hao: ${(this.maxHp - this.hp).toLocaleString()} HP`,
      primaryText: 'Thử lại ngay',
      secondaryText: 'Thoát chế độ',
      onPrimary: () => {
        this.startRaid();
        this.gameApp.startNewGame(false);
      },
      onSecondary: () => {
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

    this.triggerBanner('⚡ TEST: FINAL PHASE READY', 'Trượt sang Trái (A / ←) để gộp 2 khối [1024] -> [2048]!');
    this.gameApp.showSpellToast('⚡ Sẵn sàng: Trượt sang Trái để gộp 2048 và xem pháo hoa pha lê!');
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
