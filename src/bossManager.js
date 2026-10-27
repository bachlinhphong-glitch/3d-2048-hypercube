import * as THREE from 'three';
import gsap from 'gsap';
import { getGridPosition } from './board.js';
import { soundManager } from './sound.js';
import { Boss3DController } from './boss3D.js';

/**
 * ⚡ BossManager — 4-Phase Boss Raid Lifecycle & Challenge Engine
 *
 * PHASE 1: PLANET TITAN (500 HP | 120s, +120s on clear + cleanses low [2], [4] tiles)
 * PHASE 2: SOLAR HELIOS (1,500 HP | +120s, +120s on clear)
 * PHASE 3: COSMIC SINGULARITY (2,048 HP | +120s, +120s on clear)
 * PHASE 4: OMNIVERSE GOD (2,048 HP | +120s — Merge [1024 + 1024] -> [2048] or deplete HP to obliterate)
 */
export class BossManager {
  constructor(gameApp) {
    this.gameApp = gameApp;
    this.scene = gameApp.sceneManager.scene;
    this.camera = gameApp.sceneManager.camera;

    this.isActive = false;
    this.loop = 1;
    this.usedAIBot = false;
    this.phase = 1;
    this.maxHp = 500;
    this.hp = 500;
    this.timer = 120.0;
    this.clearTime = 0.0;
    this.isDefeated = false;
    this.isObliterating = false;

    // High-Fidelity 3D Boss System with 3 Phase Models & Shaders
    this.boss3D = new Boss3DController(this.scene, this.camera);
    this.group = this.boss3D.root; // Backward compatibility
    this.vfxGroup = this.boss3D.fxGroup;

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

    this.victoryModal = document.getElementById('boss-victory-modal');
    this.victoryTimeEl = document.getElementById('boss-v-time');
    this.victoryDamageEl = document.getElementById('boss-v-damage');
    this.victoryScoreEl = document.getElementById('boss-v-score');
    this.victoryContinueBtn = document.getElementById('boss-victory-btn-continue');
    this.victoryShareBtn = document.getElementById('boss-victory-btn-share');
    this.victoryConfettiContainer = document.getElementById('boss-victory-confetti');
  }

  clearAllTweens() {
    if (this.group) {
      gsap.killTweensOf(this.group.scale);
      gsap.killTweensOf(this.group.position);
    }
    if (this.flashEl) gsap.killTweensOf(this.flashEl);
    if (this.cutinBannerEl) gsap.killTweensOf(this.cutinBannerEl);
    if (this.clearDelayedCall) {
      this.clearDelayedCall.kill();
      this.clearDelayedCall = null;
    }
    if (this.damageContainer) {
      this.damageContainer.innerHTML = '';
    }
  }

  startRaid(loop = 1) {
    this.clearAllTweens();
    this.clearVFX();
    this.isActive = true;
    this.loop = Math.max(1, parseInt(loop, 10) || 1);
    this.usedAIBot = !!(this.gameApp && this.gameApp.aiBot && this.gameApp.aiBot.isRunning);
    this.phase = 1;
    this.clearTime = 0.0;
    this.isDefeated = false;
    this.isObliterating = false;

    // Apply loop buffs to player
    if (this.gameApp && this.gameApp.gameLogic) {
      this.gameApp.gameLogic.scoreMultiplier = 1.0 + (this.loop - 1) * 0.5;
    }

    // Scaling based on Loop (New Game+)
    const hpMult = Math.pow(1.35, this.loop - 1);
    this.maxHp = Math.round(500 * hpMult);
    this.hp = this.maxHp;
    this.timer = 120.0 + Math.min(60, (this.loop - 1) * 15);

    // Show 3D Boss & Camera Framing
    if (this.boss3D) {
      this.boss3D.setVisible(true);
      this.boss3D.setHpRatio(1.0);
      this.boss3D.setPhase(1, false);
    }
    if (this.gameApp && this.gameApp.sceneManager) {
      this.gameApp.sceneManager.setBossCamera(true);
    }

    this.applyPhaseVisuals(1);
    if (this.hudEl) this.hudEl.style.display = 'flex';
    this.updateHUD();

    const loopTag = this.loop > 1 ? `[VÒNG LẶP ${this.loop}] ` : '';
    const loopSub = this.loop > 1 ? ` • Sát thương & Điểm x${(1 + (this.loop - 1) * 0.5).toFixed(1)}` : '';
    this.triggerBanner(`${loopTag}PLANET TITAN — PHASE 1`, `${this.maxHp.toLocaleString()} HP | ${Math.round(this.timer)}s${loopSub}`);
    soundManager.playPhaseTransition();
    soundManager.triggerHaptic('slide');
  }

  stopRaid() {
    this.clearAllTweens();
    this.clearVFX();
    this.isActive = false;
    this.isDefeated = false;
    this.isObliterating = false;

    if (this.gameApp && this.gameApp.gameLogic) {
      this.gameApp.gameLogic.scoreMultiplier = 1.0;
    }

    if (this.boss3D) {
      this.boss3D.setVisible(false);
    }
    if (this.gameApp && this.gameApp.sceneManager) {
      this.gameApp.sceneManager.setBossCamera(false);
    }
    if (this.hudEl) this.hudEl.style.display = 'none';
    if (this.cutinBannerEl) this.cutinBannerEl.classList.remove('active');
  }

  applyPhaseVisuals(phase) {
    this.phase = phase;
    if (this.boss3D) {
      this.boss3D.setPhase(phase, true);
    }
    const hpMult = Math.pow(1.35, (this.loop || 1) - 1);
    const loopPrefix = (this.loop > 1) ? `L${this.loop} • ` : '';

    if (phase === 1) {
      this.maxHp = Math.round(500 * hpMult);
      if (this.phaseBadgeEl) {
        this.phaseBadgeEl.textContent = `${loopPrefix}PHASE 1 • PLANET`;
        this.phaseBadgeEl.className = 'boss-phase-badge p1';
      }
    } else if (phase === 2) {
      this.maxHp = Math.round(1500 * hpMult);
      if (this.phaseBadgeEl) {
        this.phaseBadgeEl.textContent = `${loopPrefix}PHASE 2 • SOLAR SYSTEM`;
        this.phaseBadgeEl.className = 'boss-phase-badge p2';
      }
    } else if (phase === 3) {
      this.maxHp = Math.round(2048 * hpMult);
      if (this.phaseBadgeEl) {
        this.phaseBadgeEl.textContent = `${loopPrefix}PHASE 3 • UNIVERSE`;
        this.phaseBadgeEl.className = 'boss-phase-badge p3';
      }
    } else if (phase === 4) {
      this.maxHp = Math.round(2048 * hpMult);
      if (this.phaseBadgeEl) {
        this.phaseBadgeEl.textContent = `${loopPrefix}PHASE 4 • OMNIVERSE`;
        this.phaseBadgeEl.className = 'boss-phase-badge p4';
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
    if (!this.isActive) return;

    this.clearTime += delta;
    this.timer -= delta;
    this.updateHUD();

    if (this.timer <= 0 && !this.isDefeated) {
      // Emergency Spell-to-Time Bonus
      const remainingSpells = this.gameApp.gameLogic.getRemainingSpellCount();
      if (remainingSpells > 0 && this.hp > 0) {
        const bonusSeconds = remainingSpells * 15;
        this.timer += bonusSeconds;
        this.gameApp.gameLogic.consumeAllSpellsForBonus();
        this.gameApp.updateSpellUI();

        soundManager.playSpellRecharge();
        this.emitExpandingRingWave(0x38bdf8);
        this.triggerBanner('⚡ PHÉP THUẬT CỨU NGUY!', `+${bonusSeconds}s THỜI GIAN (Quy đổi ${remainingSpells} phép)`);
        this.gameApp.showSpellToast(`⚡ CỨU NGUY: Quy đổi ${remainingSpells} phép bổ trợ thành +${bonusSeconds}s chiến đấu!`, true);
        this.updateHUD();
        return;
      }

      this.onTimeout();
      return;
    }

    if (this.boss3D) {
      this.boss3D.update(delta);
    }
  }

  onTileMerge(value, tileGridPos) {
    if (!this.isActive || this.isDefeated || this.isObliterating) return;

    let damageMult = 1.0;
    if (this.gameApp && this.gameApp.aiBot && this.gameApp.aiBot.isRunning) {
      this.usedAIBot = true;
    }
    if (this.loop > 1) {
      damageMult += (this.loop - 1) * 0.25;
    }
    let damage = Math.round(value * damageMult);
    let is2048Finale = (this.phase === 4 && value >= 2048);

    // Deduct HP directly
    this.hp = Math.max(0, this.hp - damage);
    this.updateHUD();

    if (this.boss3D) {
      this.boss3D.setHpRatio(this.hp / this.maxHp);
    }
    if (this.gameApp && this.gameApp.questManager) {
      this.gameApp.questManager.recordBossDamage(damage);
    }

    const origin = getGridPosition(tileGridPos.l, tileGridPos.r, tileGridPos.c);

    // Fire 3D Energy Beam straight to Boss Core
    if (this.boss3D) {
      this.boss3D.fireEnergyBeam(origin, damage);
    }

    // Sound & Damage number
    soundManager.playBossHit(value);
    soundManager.triggerHaptic(value >= 512 ? 'merge_big' : 'merge_small');

    // Check Phase completion or Finale
    if (is2048Finale) {
      this.executeGrandFinale();
    } else if (this.hp <= 0) {
      this.onPhaseCleared();
    }
  }

  onPhaseCleared() {
    const hpMult = Math.pow(1.35, (this.loop || 1) - 1);
    const loopTag = this.loop > 1 ? `[VÒNG ${this.loop}] ` : '';

    if (this.phase === 1) {
      // Phase 1 -> Phase 2 (Solar Helios)
      this.emitExpandingRingWave(0xfbbf24);
      soundManager.playPhaseTransition();
      this.cleanseLowTiles();

      this.timer += 120.0;
      this.applyPhaseVisuals(2);
      this.hp = Math.round(1500 * hpMult);
      if (this.boss3D) this.boss3D.setHpRatio(1.0);
      this.updateHUD();

      this.triggerBanner(`${loopTag}SOLAR HELIOS — PHASE 2`, `${this.hp.toLocaleString()} HP | +120s (Đã dọn sạch các khối [2], [4])`);
    } else if (this.phase === 2) {
      // Phase 2 -> Phase 3 (Cosmic Singularity)
      this.emitExpandingRingWave(0xa855f7);
      soundManager.playPhaseTransition();

      this.timer += 120.0;
      this.applyPhaseVisuals(3);
      this.hp = Math.round(2048 * hpMult);
      if (this.boss3D) this.boss3D.setHpRatio(1.0);
      this.updateHUD();

      this.triggerBanner(`${loopTag}💥 COSMIC SINGULARITY — PHASE 3`, `${this.hp.toLocaleString()} HP | +120s • Hố Đen Quasar sụp đổ trọng lực!`);
    } else if (this.phase === 3) {
      // Phase 3 -> Phase 4 (Omniverse Transcendent God)
      this.emitExpandingRingWave(0x00f0ff);
      soundManager.playPhaseTransition();
      this.cleanseLowTiles();

      this.timer += 120.0;
      this.applyPhaseVisuals(4);
      this.hp = Math.round(2048 * hpMult);
      if (this.boss3D) this.boss3D.setHpRatio(1.0);
      this.updateHUD();

      this.triggerBanner(`${loopTag}🌌 OMNIVERSE GOD — PHASE 4`, `${this.hp.toLocaleString()} HP | +120s • Chúa Tể Đa Vũ Trụ Thức Tỉnh!`);
    } else if (this.phase === 4) {
      // Phase 4 Defeated!
      this.executeGrandFinale();
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

    // Ensure board always has at least 2 active tiles so the player cannot be soft-locked
    let remainingTiles = 0;
    for (let l = 0; l < logic.layers; l++) {
      for (let r = 0; r < logic.rows; r++) {
        for (let c = 0; c < logic.cols; c++) {
          if (logic.grid[l][r][c]) remainingTiles++;
        }
      }
    }
    while (remainingTiles < 2) {
      this.gameApp.spawnTile();
      remainingTiles++;
    }

    if (count > 0) {
      this.gameApp.showSpellToast(`✨ Đã dọn sạch ${count} khối số nhỏ [2] & [4]!`);
      this.gameApp.saveGameState();
    }
  }

  executeGrandFinale() {
    this.isObliterating = true;
    this.isDefeated = true;
    this.hp = 0;
    this.updateHUD();

    if (this.flashEl) {
      this.flashEl.style.opacity = '0.85';
      gsap.to(this.flashEl, { opacity: 0, duration: 1.2, ease: 'power2.out' });
    }

    soundManager.playBossObliteration();
    soundManager.triggerHaptic('bomb');
    this.gameApp.particleSystem.screenShake(this.camera, 0.45);

    const totalSecs = Math.round(this.clearTime);
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    const timeStr = `${m > 0 ? m + 'm ' : ''}${s}s`;

    // Sekiro God Slain Banner
    this.triggerBanner('🏆 VẠN CỔ DIỆT TRÙM — GOD SLAIN', 'Chiến tích bất tử đã khắc ghi vào vũ trụ!');

    // Achievement Pop-up Toast
    this.showAchievementUnlockToast();

    // Cascading Fireworks Burst Series
    this.spamCelebrationFireworks();

    if (this.boss3D) {
      this.boss3D.playBigBangExplosion(() => {
        this.showBossVictoryModal(timeStr);
      });
    } else {
      this.showBossVictoryModal(timeStr);
    }
  }

  execute2048Finale() {
    this.executeGrandFinale();
  }

  showAchievementUnlockToast() {
    const isAI = (this.usedAIBot || (this.gameApp && this.gameApp.aiBot && this.gameApp.aiBot.isRunning));
    if (isAI) return;
    if (soundManager.playBossExecutionFanfare) {
      soundManager.playBossExecutionFanfare();
    }
    if (soundManager.playTrophyUnlocked) {
      soundManager.playTrophyUnlocked();
    }

    const toast = document.createElement('div');
    toast.className = 'boss-achievement-toast';
    toast.innerHTML = `
      <div class="boss-ach-toast-icon">🏆</div>
      <div class="boss-ach-toast-body">
        <div class="boss-ach-toast-tag">THÀNH TỰU THẦN THOẠI MỞ KHÓA!</div>
        <div class="boss-ach-toast-title">Kẻ Hủy Diệt Hư Không (Boss Slayer)</div>
        <div class="boss-ach-toast-desc">Đã đánh bại toàn bộ các giai đoạn Trùm Hắc Ám!</div>
      </div>
    `;
    document.body.appendChild(toast);

    gsap.fromTo(toast,
      { y: -80, opacity: 0, scale: 0.8 },
      { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(2.2)' }
    );

    setTimeout(() => {
      gsap.to(toast, {
        y: -40,
        opacity: 0,
        scale: 0.9,
        duration: 0.45,
        ease: 'power2.in',
        onComplete: () => toast.remove()
      });
    }, 4500);
  }

  spamCelebrationFireworks() {
    const totalBursts = 8;
    for (let i = 0; i < totalBursts; i++) {
      setTimeout(() => {
        if (soundManager.playFireworkBurst) soundManager.playFireworkBurst();
        const colors = [0xffd700, 0x00f0ff, 0xff2a6d, 0xa855f7, 0x10b981];
        const col = colors[i % colors.length];
        const rx = (Math.random() - 0.5) * 5;
        const ry = 2.5 + Math.random() * 3.5;
        const rz = (Math.random() - 0.5) * 4;
        if (this.gameApp.particleSystem) {
          this.gameApp.particleSystem.burst(rx, ry, rz, col);
        }
        this.emitExpandingRingWave(col);
      }, i * 280);
    }
  }

  showBossVictoryModal(clearTimeStr) {
    if (!this.victoryModal) {
      this.showStageClearModal(clearTimeStr);
      return;
    }

    const isAI = (this.usedAIBot || (this.gameApp && this.gameApp.aiBot && this.gameApp.aiBot.isRunning));

    const currentSecs = Math.round(this.clearTime);
    let isNewBestTime = false;
    let bestTimeSecs = null;
    let maxLoop = 1;

    if (!isAI) {
      try {
        const storedTime = localStorage.getItem('3d2048_boss_best_time');
        if (storedTime) {
          bestTimeSecs = parseInt(storedTime, 10);
        }
        if (!bestTimeSecs || currentSecs < bestTimeSecs) {
          bestTimeSecs = currentSecs;
          localStorage.setItem('3d2048_boss_best_time', String(currentSecs));
          isNewBestTime = true;
        }
      } catch {}

      // Track Max Loop reached
      try {
        const storedLoop = localStorage.getItem('3d2048_boss_max_loop');
        if (storedLoop) {
          maxLoop = Math.max(parseInt(storedLoop, 10), this.loop);
        } else {
          maxLoop = this.loop;
        }
        localStorage.setItem('3d2048_boss_max_loop', String(maxLoop));
      } catch {}

      // Track Boss Best Score
      try {
        localStorage.setItem('3d2048_boss_defeated', 'true');
        const currentScore = this.gameApp.gameLogic.score;
        const storedBossScore = parseInt(localStorage.getItem('3d2048_boss_best_score') || '0', 10);
        if (currentScore > storedBossScore) {
          localStorage.setItem('3d2048_boss_best_score', String(currentScore));
        }
      } catch {}

      if (this.gameApp && this.gameApp.questManager) {
        this.gameApp.questManager.recordBossDefeated();
      }

      if (soundManager.playTrophyUnlocked) {
        soundManager.playTrophyUnlocked();
      }
    } else {
      try {
        const storedTime = localStorage.getItem('3d2048_boss_best_time');
        if (storedTime) bestTimeSecs = parseInt(storedTime, 10);
        const storedLoop = localStorage.getItem('3d2048_boss_max_loop');
        if (storedLoop) maxLoop = parseInt(storedLoop, 10);
      } catch {}
    }

    this.spawnBossEmbers();

    // Format best time string
    const bSecs = bestTimeSecs || currentSecs;
    const bM = Math.floor(bSecs / 60);
    const bS = bSecs % 60;
    const bestTimeStr = `${bM > 0 ? bM + 'm ' : ''}${bS}s`;

    // Compute total loop damage
    const hpMult = Math.pow(1.35, (this.loop || 1) - 1);
    const totalLoopDamage = Math.round(6096 * hpMult);

    if (this.victoryTimeEl) this.victoryTimeEl.textContent = clearTimeStr;
    if (this.victoryDamageEl) this.victoryDamageEl.textContent = `${totalLoopDamage.toLocaleString()} HP`;
    if (this.victoryScoreEl) this.victoryScoreEl.textContent = this.gameApp.gameLogic.score.toLocaleString();

    // Records Bar
    const bestTimeEl = document.getElementById('boss-v-best-time');
    if (bestTimeEl) {
      bestTimeEl.textContent = isAI ? (bestTimeSecs ? `${bestTimeStr} (Thủ công)` : '--:--') : bestTimeStr;
    }

    const newRecordBadge = document.getElementById('boss-v-new-record-badge');
    if (newRecordBadge) newRecordBadge.style.display = (!isAI && isNewBestTime) ? 'inline-flex' : 'none';

    const loopLevelEl = document.getElementById('boss-v-loop-level');
    if (loopLevelEl) {
      loopLevelEl.textContent = isAI ? `Vòng ${this.loop} (Chế độ AI)` : `Vòng ${this.loop} (Kỷ lục: Loop ${maxLoop})`;
    }

    // Action button labels
    const nextLoop = (this.loop || 1) + 1;
    const loopBtnText = document.getElementById('boss-v-btn-loop-text');
    if (loopBtnText) {
      const bonusPct = (nextLoop - 1) * 50;
      loopBtnText.textContent = `⚔️ Tiến vào Vòng lặp ${nextLoop} (New Game+ • +${bonusPct}% Điểm)`;
    }

    const headingEl = document.getElementById('boss-victory-heading');
    if (headingEl) {
      if (isAI) {
        headingEl.textContent = 'CHIẾN CÔNG (HỖ TRỢ BỞI AI)';
      } else {
        headingEl.textContent = this.loop > 1 ? `CHIẾN CÔNG VÒNG LẶP ${this.loop}!` : `CHIẾN CÔNG HIỂN HÁCH!`;
      }
    }

    // Achievement Badge updates for AI Mode
    const achTier = this.victoryModal.querySelector('.boss-achievement-tier');
    const achName = this.victoryModal.querySelector('.boss-achievement-name');
    const achDesc = this.victoryModal.querySelector('.boss-achievement-desc');
    const achBadge = this.victoryModal.querySelector('.boss-achievement-badge');

    if (isAI) {
      if (achTier) achTier.textContent = '⚠️ CHẾ ĐỘ TỰ ĐỘNG CHƠI (AI BOT)';
      if (achName) achName.textContent = 'TẠM KHÓA THÀNH TỰU (LOCKED)';
      if (achDesc) achDesc.textContent = 'Trận đánh có sự tham gia của AI. Hãy tự tay chiến đấu và kết liễu Chúa Tể Đa Chiều để mở khóa thành tựu Thần Thoại!';
      if (achBadge) achBadge.style.opacity = '0.75';
    } else {
      if (achTier) achTier.textContent = t('boss_achieve_tier');
      if (achName) achName.textContent = t('boss_achieve_name');
      if (achDesc) achDesc.textContent = t('boss_achieve_desc');
      if (achBadge) achBadge.style.opacity = '1';
    }

    this.victoryModal.style.display = 'flex';
    this.victoryModal.classList.remove('active');
    void this.victoryModal.offsetWidth;
    this.victoryModal.classList.add('active');

    const closeVictory = () => {
      this.victoryModal.classList.remove('active');
      setTimeout(() => {
        this.victoryModal.style.display = 'none';
      }, 350);
    };

    const loopBtn = document.getElementById('boss-victory-btn-loop');
    if (loopBtn) {
      loopBtn.onclick = (e) => {
        e.stopPropagation();
        closeVictory();
        this.nextLoop();
      };
    }

    const endlessBtn = document.getElementById('boss-victory-btn-endless');
    if (endlessBtn) {
      endlessBtn.onclick = (e) => {
        e.stopPropagation();
        closeVictory();
        this.enterEndlessMode();
      };
    }

    const restartBtn = document.getElementById('boss-victory-btn-restart');
    if (restartBtn) {
      restartBtn.onclick = (e) => {
        e.stopPropagation();
        closeVictory();
        this.restartFreshGame();
      };
    }

    const fireworksBtn = document.getElementById('boss-victory-btn-fireworks');
    if (fireworksBtn) {
      fireworksBtn.onclick = (e) => {
        e.stopPropagation();
        this.spamCelebrationFireworks();
      };
    }

    const viewTrophyBtn = document.getElementById('boss-victory-btn-view-trophy');
    if (viewTrophyBtn) {
      viewTrophyBtn.onclick = (e) => {
        e.stopPropagation();
        closeVictory();
        if (this.gameApp.questManager) {
          this.gameApp.questManager.openModal('boss');
        }
      };
    }

    if (this.victoryContinueBtn) {
      this.victoryContinueBtn.onclick = (e) => {
        e.stopPropagation();
        closeVictory();
        this.nextLoop();
      };
    }

    if (this.victoryShareBtn) {
      this.victoryShareBtn.onclick = (e) => {
        e.stopPropagation();
        this.gameApp.shareScore();
      };
    }
  }

  nextLoop() {
    this.loop = (this.loop || 1) + 1;
    // Keep board completely intact!
    this.startRaid(this.loop);
    const bonusPct = (this.loop - 1) * 50;
    this.gameApp.showSpellToast(`🌌 VÒNG LẶP ${this.loop}: Chúa Tể tái sinh với sức mạnh mới! (Thưởng điểm +${bonusPct}%)`, true);
  }

  enterEndlessMode() {
    this.stopRaid();
    if (this.gameApp) {
      this.gameApp.isBossRaid = false;
      const bossBtn = document.getElementById('btn-toggle-boss');
      if (bossBtn) {
        bossBtn.classList.remove('active');
        const textEl = bossBtn.querySelector('.btn-text');
        if (textEl) textEl.textContent = 'Boss Raid';
      }
      if (this.gameApp.gameLogic) {
        this.gameApp.gameLogic.keepPlaying = true;
        this.gameApp.gameLogic.scoreMultiplier = 1.0;
      }
      this.gameApp.saveGameState();
      this.gameApp.showSpellToast('🏆 CHẾ ĐỘ VÔ TẬN: Bàn cờ giữ nguyên! Hãy chinh phục khối 4096, 8192 & phá kỷ lục điểm!', true);
    }
  }

  restartFreshGame() {
    this.loop = 1;
    this.stopRaid();
    if (this.gameApp) {
      this.gameApp.isBossRaid = false;
      const bossBtn = document.getElementById('btn-toggle-boss');
      if (bossBtn) {
        bossBtn.classList.remove('active');
        const textEl = bossBtn.querySelector('.btn-text');
        if (textEl) textEl.textContent = 'Boss Raid';
      }
      this.gameApp.clearSavedGameState();
      this.gameApp.startNewGame(false);
    }
  }

  spawnBossEmbers() {
    if (!this.victoryConfettiContainer) return;
    this.victoryConfettiContainer.innerHTML = '';
    const colors = ['#ff3b30', '#ef4444', '#dc2626', '#f97316', '#b91c1c', '#27272a'];
    for (let i = 0; i < 64; i++) {
      const ember = document.createElement('div');
      ember.className = 'sekiro-ember-piece';
      ember.style.left = `${Math.random() * 100}%`;
      ember.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      const size = 4 + Math.random() * 7;
      ember.style.width = `${size}px`;
      ember.style.height = `${size}px`;
      ember.style.animationDelay = `${Math.random() * 0.6}s`;
      ember.style.animationDuration = `${1.4 + Math.random() * 1.8}s`;
      this.victoryConfettiContainer.appendChild(ember);
    }
  }

  showStageClearModal(clearTimeStr) {
    this.gameApp.showModal({
      title: 'STAGE CLEAR — CORE DESTROYED',
      message: `Tuyệt phẩm! Bạn đã hòa hợp khối [2048] và tiêu diệt hoàn toàn Dark Singularity Core!\n\nThời gian hoàn thành: ${clearTimeStr}\nĐiểm số đạt được: ${this.gameApp.gameLogic.score.toLocaleString()} điểm`,
      primaryText: 'Chơi lại ngay',
      secondaryText: 'Chia sẻ kết quả',
      onPrimary: () => {
        this.gameApp.hideModal();
        this.gameApp.isAnimating = false;
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
      title: 'THẤT BẠI (GAME OVER)',
      message: `Hết giờ trong chế độ Boss Mode!\nNăng lượng hắc ám đã tiêu hao: ${(this.maxHp - this.hp).toLocaleString()} / ${this.maxHp.toLocaleString()} HP`,
      primaryText: 'Chơi lại ngay',
      secondaryText: 'Ván mới',
      onPrimary: () => {
        this.gameApp.hideModal();
        this.gameApp.isAnimating = false;
        this.gameApp.startNewGame(false);
      },
      onSecondary: () => {
        this.gameApp.hideModal();
        this.gameApp.isAnimating = false;
        if (this.gameApp.isBossRaid) {
          this.gameApp.toggleBossRaid();
        }
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
  cyclePhaseForTest() {
    if (!this.isActive) {
      this.startRaid();
      return 1;
    }
    const nextP = this.boss3D.cyclePhaseForTest();
    if (nextP <= 4) {
      this.phase = nextP;
      this.maxHp = nextP === 1 ? 500 : (nextP === 2 ? 1500 : 2048);
      this.hp = this.maxHp;
      this.timer = 120.0;
      this.boss3D.setHpRatio(1.0);
      this.updateHUD();
      if (this.phaseBadgeEl) {
        const names = { 1: 'PHASE 1 • PLANET', 2: 'PHASE 2 • SOLAR SYSTEM', 3: 'PHASE 3 • UNIVERSE', 4: 'PHASE 4 • OMNIVERSE' };
        this.phaseBadgeEl.textContent = names[nextP] || 'PHASE 1 • PLANET';
        this.phaseBadgeEl.className = `boss-phase-badge p${nextP}`;
      }
    }
    return nextP;
  }

  setupTestPhase3() {
    if (!this.isActive) {
      this.startRaid();
    }
    this.phase = 3;
    this.applyPhaseVisuals(3);
    this.hp = 2048;
    this.timer = 120.0;
    if (this.boss3D) {
      this.boss3D.setPhase(3, true);
      this.boss3D.setHpRatio(1.0);
    }
    this.updateHUD();

    this.gameApp.cleanAllSceneTiles();
    this.gameApp.tiles3D = this.gameApp.createEmptyTileGrid();
    this.gameApp.gameLogic.reset();

    // Spawn two 1024 tiles side by side
    this.gameApp.spawnSpecificTile(0, 0, 0, 1024);
    this.gameApp.spawnSpecificTile(0, 0, 1, 1024);

    this.triggerBanner('COSMIC SINGULARITY — PHASE 3', 'Trượt sang Trái (A / ←) để gộp 2 khối [1024] -> [2048]!');
    this.gameApp.showSpellToast('Sẵn sàng: Trượt sang Trái để hủy diệt Siêu Hố Đen Vũ Trụ!');
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
