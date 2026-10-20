import * as THREE from 'three';
import gsap from 'gsap';
import { getGridPosition, getTileDimensions } from './board.js';
import { soundManager } from './sound.js';

/**
 * ⚔️ BossManager — 3-Phase Boss Raid Entity & Cinematic 2048 Execution Engine
 *
 * Phase 1: Hộ Thể Ma Tượng (500 HP | 60s)
 * Phase 2: Cuồng Nộ Thiên Ma (1500 HP | +45s)
 * Phase 3: Bản Thể Hư Không (2048 HP | +60s | 2048 One-Hit Obliteration)
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

    // 3D Visual Group
    this.group = new THREE.Group();
    this.group.position.set(0, 5.2, -4.5); // Floating majestically above & behind board
    this.group.visible = false;
    this.scene.add(this.group);

    // Boss 3D Components
    this.coreMesh = null;
    this.innerAura = null;
    this.shieldMesh = null;
    this.ringGroup = new THREE.Group();
    this.spikesGroup = new THREE.Group();
    this.group.add(this.ringGroup);
    this.group.add(this.spikesGroup);

    // Boss Dynamic Light
    this.bossLight = new THREE.PointLight(0x00f0ff, 2.5, 16);
    this.bossLight.position.set(0, 0, 1.2);
    this.group.add(this.bossLight);

    // Active Beams & Shards container
    this.vfxGroup = new THREE.Group();
    this.scene.add(this.vfxGroup);

    this.initBossMeshes();
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

  initBossMeshes() {
    // 1. Central Core: High-poly Icosahedron
    const coreGeo = new THREE.IcosahedronGeometry(1.6, 2);
    this.coreMat = new THREE.MeshStandardMaterial({
      color: 0x071524,
      emissive: 0x00d4ff,
      emissiveIntensity: 0.9,
      roughness: 0.15,
      metalness: 0.85,
      flatShading: true
    });
    this.coreMesh = new THREE.Mesh(coreGeo, this.coreMat);
    this.group.add(this.coreMesh);

    // Inner glowing sphere
    const auraGeo = new THREE.SphereGeometry(1.2, 16, 16);
    this.auraMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.65,
      wireframe: true
    });
    this.innerAura = new THREE.Mesh(auraGeo, this.auraMat);
    this.group.add(this.innerAura);

    // 2. Orbital Rings
    const ringGeo1 = new THREE.TorusGeometry(2.35, 0.06, 8, 36);
    const ringMat1 = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x0088cc,
      metalness: 0.9,
      roughness: 0.1
    });
    this.ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    this.ringGroup.add(this.ring1);

    const ringGeo2 = new THREE.TorusGeometry(2.7, 0.05, 8, 36);
    const ringMat2 = new THREE.MeshStandardMaterial({
      color: 0x7928ca,
      emissive: 0x5500aa,
      metalness: 0.9,
      roughness: 0.1
    });
    this.ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    this.ringGroup.add(this.ring2);

    // 3. Spikes / Halo Blades (Phase 2 & 3)
    const spikeGeo = new THREE.ConeGeometry(0.2, 1.2, 4);
    const spikeMat = new THREE.MeshStandardMaterial({
      color: 0xff0055,
      emissive: 0xaa0033,
      metalness: 0.8,
      roughness: 0.2
    });
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const spike = new THREE.Mesh(spikeGeo, spikeMat);
      spike.position.set(Math.cos(angle) * 2.3, Math.sin(angle) * 2.3, 0);
      spike.rotation.z = angle - Math.PI / 2;
      this.spikesGroup.add(spike);
    }
    this.spikesGroup.visible = false;

    // 4. Void Shield (Phase 3)
    const shieldGeo = new THREE.IcosahedronGeometry(3.0, 1);
    this.shieldMat = new THREE.MeshBasicMaterial({
      color: 0xffd700,
      wireframe: true,
      transparent: true,
      opacity: 0.35
    });
    this.shieldMesh = new THREE.Mesh(shieldGeo, this.shieldMat);
    this.shieldMesh.visible = false;
    this.group.add(this.shieldMesh);
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
    this.group.position.set(0, 5.2, -4.5);
    gsap.to(this.group.scale, { x: 1, y: 1, z: 1, duration: 1.2, ease: 'back.out(1.8)' });

    this.applyPhaseVisuals(1);
    if (this.hudEl) this.hudEl.style.display = 'flex';
    this.updateHUD();

    this.triggerCutInBanner('⚔️ BOSS RAID KHỞI TRANH', 'PHASE 1: Hộ Thể Ma Tượng (500 HP | 60s)');
    soundManager.playPhaseTransition();
    soundManager.triggerHaptic('bomb');
  }

  stopRaid() {
    this.isActive = false;
    this.group.visible = false;
    if (this.hudEl) this.hudEl.style.display = 'none';
    if (this.gameApp.sceneManager.setEclipseMode) {
      this.gameApp.sceneManager.setEclipseMode(false);
    }
    this.clearVFX();
  }

  applyPhaseVisuals(phase) {
    this.phase = phase;
    if (phase === 1) {
      this.maxHp = 500;
      this.coreMat.emissive.setHex(0x00d4ff);
      this.coreMat.emissiveIntensity = 0.9;
      this.auraMat.color.setHex(0x00f0ff);
      this.bossLight.color.setHex(0x00f0ff);
      this.spikesGroup.visible = false;
      this.shieldMesh.visible = false;
      if (this.phaseBadgeEl) {
        this.phaseBadgeEl.textContent = 'PHASE 1: HỘ THỂ MA TƯỢNG';
        this.phaseBadgeEl.className = 'boss-phase-badge p1';
      }
    } else if (phase === 2) {
      this.maxHp = 1500;
      this.coreMat.emissive.setHex(0xff0044);
      this.coreMat.emissiveIntensity = 1.6;
      this.auraMat.color.setHex(0xffaa00);
      this.bossLight.color.setHex(0xff0055);
      this.spikesGroup.visible = true;
      this.shieldMesh.visible = false;
      if (this.phaseBadgeEl) {
        this.phaseBadgeEl.textContent = 'PHASE 2: CUỒNG NỘ THIÊN MA';
        this.phaseBadgeEl.className = 'boss-phase-badge p2';
      }
    } else if (phase === 3) {
      this.maxHp = 2048;
      this.coreMat.emissive.setHex(0xffd700);
      this.coreMat.emissiveIntensity = 2.2;
      this.auraMat.color.setHex(0xfffa65);
      this.bossLight.color.setHex(0xffd700);
      this.spikesGroup.visible = true;
      this.shieldMesh.visible = true;
      if (this.phaseBadgeEl) {
        this.phaseBadgeEl.textContent = 'PHASE 3: BẢN THỂ HƯ KHÔNG';
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

    // Check Enrage Timer Fail
    if (this.timer <= 0 && !this.isDefeated) {
      this.onEnrageTimeout();
      return;
    }

    // Boss Idle floating & rotations
    const speed = this.phase === 3 ? 3.0 : (this.phase === 2 ? 2.0 : 1.0);
    this.group.position.y = 5.2 + Math.sin(time * 1.8) * 0.25;

    if (this.coreMesh) {
      this.coreMesh.rotation.y += delta * 0.45 * speed;
      this.coreMesh.rotation.x += delta * 0.25 * speed;
    }
    if (this.innerAura) {
      this.innerAura.rotation.y -= delta * 0.8 * speed;
    }
    if (this.ring1) {
      this.ring1.rotation.x += delta * 0.9 * speed;
      this.ring1.rotation.y += delta * 0.6 * speed;
    }
    if (this.ring2) {
      this.ring2.rotation.y -= delta * 0.8 * speed;
      this.ring2.rotation.z += delta * 0.5 * speed;
    }
    if (this.spikesGroup && this.spikesGroup.visible) {
      this.spikesGroup.rotation.z -= delta * 1.5 * speed;
    }
    if (this.shieldMesh && this.shieldMesh.visible) {
      this.shieldMesh.rotation.y += delta * 0.3;
      this.shieldMesh.rotation.x += delta * 0.15;
    }
  }

  onTileMerge(value, tileGridPos) {
    if (!this.isActive || this.isDefeated || this.isObliterating) return;

    let damage = value;
    let isCritical = value >= 128;
    let is2048Execution = false;

    // Phase 3 Special Mechanics:
    if (this.phase === 3) {
      if (value === 2048) {
        // ONE-HIT OBLITERATION EXECUTION!
        damage = this.hp;
        isCritical = true;
        is2048Execution = true;
      } else {
        // Small merges chip through void shield
        damage = Math.max(1, Math.floor(value * 0.2));
        isCritical = false;
      }
    } else {
      if (value < 32) {
        damage = Math.max(1, Math.floor(value * 0.3)); // Nominal damage
        isCritical = false;
      }
    }

    // World position of the merging tile
    const origin = getGridPosition(tileGridPos.l, tileGridPos.r, tileGridPos.c);
    const bossTarget = this.group.position.clone();

    // 1. Fire 3D Energy Slash Beam from tile to Boss
    this.fireEnergySlash(origin, bossTarget, value, is2048Execution);

    // 2. Apply Boss Hit & Recoil
    this.takeDamage(damage, value, isCritical, is2048Execution);
  }

  fireEnergySlash(startPos, endPos, tileValue, isExecution = false) {
    const beamColor = isExecution
      ? 0xffd700
      : (tileValue >= 512 ? 0xff0055 : (tileValue >= 128 ? 0x00f0ff : 0x7928ca));

    // Dynamic 3D Laser Beam Geometry
    const curve = new THREE.LineCurve3(
      new THREE.Vector3(startPos.x, startPos.y + 0.3, startPos.z),
      new THREE.Vector3(endPos.x, endPos.y, endPos.z)
    );
    const radius = isExecution ? 0.38 : (tileValue >= 512 ? 0.22 : 0.12);
    const tubeGeo = new THREE.TubeGeometry(curve, 8, radius, 8, false);
    const tubeMat = new THREE.MeshBasicMaterial({
      color: beamColor,
      transparent: true,
      opacity: 0.95
    });
    const beamMesh = new THREE.Mesh(tubeGeo, tubeMat);
    this.vfxGroup.add(beamMesh);

    // Play beam audio
    soundManager.playBossLaser(tileValue);

    // Animate beam flash & fade
    gsap.to(tubeMat, {
      opacity: 0,
      duration: isExecution ? 0.55 : 0.28,
      ease: 'power2.out',
      onComplete: () => {
        tubeGeo.dispose();
        tubeMat.dispose();
        this.vfxGroup.remove(beamMesh);
      }
    });

    // Particle burst along path
    this.gameApp.particleSystem.burst(startPos.x, startPos.y + 0.4, startPos.z, tileValue);
  }

  takeDamage(amount, tileValue, isCritical, isExecution) {
    if (isExecution) {
      this.execute2048Obliteration();
      return;
    }

    this.hp = Math.max(0, this.hp - amount);
    this.updateHUD();

    // Sound & Haptics
    soundManager.playBossHit(tileValue);
    soundManager.triggerHaptic(tileValue >= 512 ? 'bomb' : 'merge_big');

    // Boss mesh hit recoil & white flash
    gsap.killTweensOf(this.group.position);
    gsap.fromTo(this.group.position,
      { z: -4.5 - (isCritical ? 0.6 : 0.25) },
      { z: -4.5, duration: 0.25, ease: 'back.out(2.5)' }
    );

    const prevEmissive = this.coreMat.emissive.getHex();
    this.coreMat.emissive.setHex(0xffffff);
    gsap.delayedCall(0.08, () => {
      this.coreMat.emissive.setHex(prevEmissive);
    });

    // Camera micro-shake on critical hit
    if (isCritical) {
      this.gameApp.particleSystem.screenShake(this.camera, 0.25);
    }

    // Spawn floating damage text in DOM
    this.spawnDamageNumber(amount, isCritical);

    // Check Phase Clear
    if (this.hp <= 0) {
      this.onPhaseDefeated();
    }
  }

  spawnDamageNumber(amount, isCritical) {
    if (!this.damageContainer) return;

    const el = document.createElement('div');
    el.className = `boss-damage-number ${isCritical ? 'critical' : 'normal'}`;
    el.textContent = isCritical ? `-${amount.toLocaleString()}! CRITICAL` : `-${amount}`;

    // Random slight offset around boss center
    const rx = (Math.random() - 0.5) * 160;
    const ry = (Math.random() - 0.5) * 60;
    el.style.transform = `translate(calc(-50% + ${rx}px), calc(-50% + ${ry}px))`;

    this.damageContainer.appendChild(el);
    setTimeout(() => el.remove(), 950);
  }

  onPhaseDefeated() {
    if (this.phase === 1) {
      // Transition to Phase 2
      soundManager.playPhaseTransition();
      this.gameApp.particleSystem.screenShake(this.camera, 0.38);

      // Cleanse all low junk tiles (2 and 4) from the board!
      this.cleanseLowTiles();

      // Bonus Time +45s
      this.timer += 45.0;
      this.applyPhaseVisuals(2);
      this.hp = 1500;
      this.updateHUD();

      this.triggerCutInBanner('⚡ PHASE 2: AWAKENED ⚡', 'Cuồng Nộ Thiên Ma xuất thế! (+45s & Đã thanh tẩy rác [2],[4])');
    } else if (this.phase === 2) {
      // Transition to Phase 3 (End Phase)
      soundManager.playPhaseTransition();
      this.gameApp.particleSystem.screenShake(this.camera, 0.45);

      // Trigger Eclipse Sky in SceneManager
      if (this.gameApp.sceneManager.setEclipseMode) {
        this.gameApp.sceneManager.setEclipseMode(true);
      }

      // Bonus Time +60s
      this.timer += 60.0;
      this.applyPhaseVisuals(3);
      this.hp = 2048;
      this.updateHUD();

      this.triggerCutInBanner('🔥 FINAL PHASE: MERGE 2048 TO EXECUTE! 🔥', 'Bản Thể Hư Không — Hợp nhất khối [2048] để trảm diệt! (+60s)');
    }
  }

  cleanseLowTiles() {
    let cleansedCount = 0;
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
              this.gameApp.particleSystem.burst(pos.x, pos.y + 0.3, pos.z, 512);
              tile3D.dispose(true);
              tiles3D[l][r][c] = null;
            }
            logic.grid[l][r][c] = null;
            cleansedCount++;
          }
        }
      }
    }
    if (cleansedCount > 0) {
      this.gameApp.showSpellToast(`✨ ĐẠO LỰC THANH TẨY: Đã quét sạch ${cleansedCount} khối [2] và [4] rác!`);
      this.gameApp.saveGameState();
    }
  }

  execute2048Obliteration() {
    this.isObliterating = true;
    this.isDefeated = true;
    this.hp = 0;
    this.updateHUD();

    // 1. Hit-Stop & Cinematic Golden Flash
    if (this.flashEl) {
      this.flashEl.style.opacity = '0.9';
      gsap.to(this.flashEl, { opacity: 0, duration: 1.2, ease: 'power2.out' });
    }

    // 2. Play Ultimate Obliteration Sound & Extreme Screen Shake
    soundManager.playBossObliteration();
    soundManager.triggerHaptic('bomb');
    this.gameApp.particleSystem.screenShake(this.camera, 0.65);

    this.spawnDamageNumber(2048, true);

    // 3. Supernova Shatter: Boss Core ruptures into dozens of 3D geometric shards
    this.supernovaShatter();

    // 4. Show Victory Modal after cinematic
    const totalSecs = Math.round(this.clearTime);
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    const timeStr = `${m > 0 ? m + 'm ' : ''}${s}s`;

    gsap.delayedCall(2.2, () => {
      this.showVictoryModal(timeStr);
    });
  }

  supernovaShatter() {
    const shardCount = 48;
    const shardGeo = new THREE.TetrahedronGeometry(0.35, 0);
    const shardMat = new THREE.MeshBasicMaterial({
      color: 0xffd700,
      wireframe: false
    });

    const shards = [];
    const origin = this.group.position.clone();

    for (let i = 0; i < shardCount; i++) {
      const mesh = new THREE.Mesh(shardGeo, shardMat);
      mesh.position.copy(origin);
      this.vfxGroup.add(mesh);

      const vx = (Math.random() - 0.5) * 14;
      const vy = (Math.random() - 0.5) * 12;
      const vz = (Math.random() - 0.5) * 10;

      shards.push({ mesh, vx, vy, vz });
    }

    // Disperse shards outwards
    shards.forEach(({ mesh, vx, vy, vz }) => {
      gsap.to(mesh.position, {
        x: origin.x + vx,
        y: origin.y + vy,
        z: origin.z + vz,
        duration: 1.8,
        ease: 'power3.out'
      });
      gsap.to(mesh.scale, {
        x: 0.01,
        y: 0.01,
        z: 0.01,
        duration: 1.8,
        ease: 'power2.in',
        onComplete: () => {
          this.vfxGroup.remove(mesh);
        }
      });
      gsap.to(mesh.rotation, {
        x: Math.random() * 12,
        y: Math.random() * 12,
        duration: 1.8
      });
    });

    // Shrink and vanish boss main mesh
    gsap.to(this.group.scale, {
      x: 0.001,
      y: 0.001,
      z: 0.001,
      duration: 0.8,
      ease: 'power4.in',
      onComplete: () => {
        this.group.visible = false;
      }
    });
  }

  showVictoryModal(clearTimeStr) {
    this.gameApp.showModal({
      title: '👑 BẤT BẠI — GOD SLAIN!',
      message: `Tuyệt phẩm! Bạn đã thi triển trảm kích [2048 OBLITERATION] kết liễu Bản Thể Hư Không!\n\n⏱️ Thời gian phá đảo: ${clearTimeStr}\nĐiểm số đạt được: ${this.gameApp.gameLogic.score.toLocaleString()} điểm`,
      primaryText: 'Chơi ván mới',
      secondaryText: 'Chia sẻ chiến tích',
      onPrimary: () => {
        this.stopRaid();
        this.gameApp.startNewGame(false);
      },
      onSecondary: () => {
        this.gameApp.shareScore();
      }
    });
  }

  onEnrageTimeout() {
    this.isDefeated = true;
    soundManager.playGameOver();
    soundManager.triggerHaptic('bomb');

    this.gameApp.showModal({
      title: '💀 DIỆT VONG — CUỒNG BẠO HÓA!',
      message: `Hết thời gian! Thực thể Boss đã cuồng nộ và phóng xuất bão hư không hủy diệt bàn cờ!\nSát thương gây ra: ${(this.maxHp - this.hp).toLocaleString()} DMG`,
      primaryText: 'Thử lại Boss Raid',
      secondaryText: 'Về chế độ thường',
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

  triggerCutInBanner(title, subtitle) {
    if (!this.cutinBannerEl) return;
    if (this.cutinTitleEl) this.cutinTitleEl.textContent = title;
    if (this.cutinSubtitleEl) this.cutinSubtitleEl.textContent = subtitle;

    this.cutinBannerEl.classList.remove('active');
    void this.cutinBannerEl.offsetWidth; // trigger reflow
    this.cutinBannerEl.classList.add('active');

    setTimeout(() => {
      this.cutinBannerEl.classList.remove('active');
    }, 2400);
  }

  // Developer / User Quick Debug: Setup Phase 3 with two 1024 tiles side by side
  setupTestPhase3() {
    if (!this.isActive) {
      this.startRaid();
    }
    this.phase = 3;
    this.applyPhaseVisuals(3);
    this.hp = 2048;
    this.timer = 60.0;
    this.updateHUD();

    if (this.gameApp.sceneManager.setEclipseMode) {
      this.gameApp.sceneManager.setEclipseMode(true);
    }

    // Clear board and place two 1024 tiles at (0, 0, 0) and (0, 0, 1)
    this.gameApp.cleanAllSceneTiles();
    this.gameApp.tiles3D = this.gameApp.createEmptyTileGrid();
    this.gameApp.gameLogic.reset();

    // Place tile 1: 1024 at layer 0, row 0, col 0
    const tile1 = this.gameApp.spawnSpecificTile(0, 0, 0, 1024);
    // Place tile 2: 1024 at layer 0, row 0, col 1
    const tile2 = this.gameApp.spawnSpecificTile(0, 0, 1, 1024);

    this.triggerCutInBanner('⚡ TEST MODE: PHASE 3 READY', 'Đã đặt 2 khối [1024] cạnh nhau! Trượt (A / ←) để gộp 2048!');
    this.gameApp.showSpellToast('⚡ Đã sẵn sàng! Trượt sang TRÁI để gộp 1024 + 1024 thành 2048 kết liễu Boss!');
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
