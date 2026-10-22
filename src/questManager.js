import { t } from './i18n.js';
import { TrophyModalViewer } from './trophy.js';

export const QUEST_DEFS = [
  {
    id: 'q_reach_128',
    icon: `<svg class="quest-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`,
    titleKey: 'quest_1_title',
    descKey: 'quest_1_desc',
    target: 128,
    unit: ''
  },
  {
    id: 'q_all_modes',
    icon: `<svg class="quest-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>`,
    titleKey: 'quest_2_title',
    descKey: 'quest_2_desc',
    target: 2,
    unit: ''
  },
  {
    id: 'q_rush_score',
    icon: `<svg class="quest-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
    titleKey: 'quest_3_title',
    descKey: 'quest_3_desc',
    target: 1000,
    unit: 'pts'
  },
  {
    id: 'q_boss_hit',
    icon: `<svg class="quest-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 17.5L3 6V3h3l11.5 11.5"/><path d="M13 19l6-6"/><path d="M16 16l4 4"/><path d="M19 21l2-2"/><path d="M9.5 6.5L18 15"/></svg>`,
    titleKey: 'quest_4_title',
    descKey: 'quest_4_desc',
    target: 300,
    unit: 'DMG'
  },
  {
    id: 'q_spells_master',
    icon: `<svg class="quest-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M15 4V2"/><path d="M15 16v-2"/><path d="M8 9h2"/><path d="M20 9h2"/><path d="M17.8 11.8L19 13"/><path d="M15 9h0"/><path d="M17.8 6.2L19 5"/><path d="M3 21l9-9"/><path d="M12.2 6.2L11 5"/></svg>`,
    titleKey: 'quest_5_title',
    descKey: 'quest_5_desc',
    target: 3,
    unit: ''
  },
  {
    id: 'q_combo_3',
    icon: `<svg class="quest-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`,
    titleKey: 'quest_6_title',
    descKey: 'quest_6_desc',
    target: 3,
    unit: 'combo'
  },
  {
    id: 'q_reach_2048',
    icon: `<svg class="quest-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14v2H5z"/></svg>`,
    titleKey: 'quest_7_title',
    descKey: 'quest_7_desc',
    target: 2048,
    unit: ''
  }
];

export class QuestManager {
  constructor(gameApp) {
    this.game = gameApp;
    this.storageKey = '3d2048_quests_v1';
    this.trophyViewer = null;
    this.currentTab = 'c1'; // 'c1' | 'boss'

    // Internal state
    this.state = this.loadState();

    // Elements
    this.modal = document.getElementById('trophy-modal');
    this.btnToggle = document.getElementById('btn-quests-toggle');
    this.badgeEl = document.getElementById('quest-badge');

    this.initUI();
    this.updateBadge();
  }

  loadState() {
    let saved = null;
    try {
      saved = JSON.parse(localStorage.getItem(this.storageKey));
    } catch {}

    const defaultState = {
      q_reach_128: { completed: false, current: 0 },
      q_all_modes: { completed: false, current: 0, modes: [] },
      q_rush_score: { completed: false, current: 0 },
      q_boss_hit: { completed: false, current: 0 },
      q_spells_master: { completed: false, current: 0, spells: [] },
      q_combo_3: { completed: false, current: 0 },
      q_reach_2048: { completed: false, current: 0 },
      trophy_unlocked: false,
      trophy_claimed: false
    };

    const state = (saved && typeof saved === 'object') ? { ...defaultState, ...saved } : defaultState;

    // Auto-migrate q_all_modes: 2 spatial modes exist (4x4 & 3x3x3). If player has explored >= 2, mark complete!
    if (state.q_all_modes && !state.q_all_modes.completed) {
      const explored = (state.q_all_modes.modes && state.q_all_modes.modes.length) || state.q_all_modes.current || 0;
      if (explored >= 2) {
        state.q_all_modes.completed = true;
        state.q_all_modes.current = 2;
      }
    }

    return state;
  }

  saveState() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    } catch {}
  }

  isBossDefeated() {
    try {
      return localStorage.getItem('3d2048_boss_defeated') === 'true';
    } catch {
      return false;
    }
  }

  initUI() {
    if (this.btnToggle) {
      this.btnToggle.addEventListener('click', () => {
        this.openModal('c1');
      });
    }

    const closeBtn = document.getElementById('trophy-modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.closeModal();
      });
    }

    // Backdrop click to close
    if (this.modal) {
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal) {
          this.closeModal();
        }
      });
    }

    // Tabs switching
    const tabC1Btn = document.getElementById('trophy-tab-c1');
    const tabBossBtn = document.getElementById('trophy-tab-boss');
    if (tabC1Btn) {
      tabC1Btn.addEventListener('click', () => this.switchTab('c1'));
    }
    if (tabBossBtn) {
      tabBossBtn.addEventListener('click', () => this.switchTab('boss'));
    }

    // Celebrate button (Spammable with bounce animation)
    const celebrateBtn = document.getElementById('trophy-celebrate-btn');
    if (celebrateBtn) {
      celebrateBtn.addEventListener('click', () => {
        celebrateBtn.classList.remove('spam-punch');
        void celebrateBtn.offsetWidth;
        celebrateBtn.classList.add('spam-punch');
        setTimeout(() => celebrateBtn.classList.remove('spam-punch'), 120);

        this.celebrateCurrentTab();
      });
    }

    // Boss play button in trophy modal
    const playBossBtn = document.getElementById('boss-trophy-play-btn');
    if (playBossBtn) {
      playBossBtn.addEventListener('click', () => {
        this.closeModal();
        this.game.toggleBossRaid(true);
      });
    }
  }

  switchTab(tab = 'c1') {
    this.currentTab = tab;

    const tabC1Btn = document.getElementById('trophy-tab-c1');
    const tabBossBtn = document.getElementById('trophy-tab-boss');
    const c1Pane = document.getElementById('trophy-c1-pane');
    const bossPane = document.getElementById('trophy-boss-pane');
    const celebrateLabel = document.getElementById('trophy-celebrate-label');

    if (tab === 'boss') {
      if (tabC1Btn) tabC1Btn.classList.remove('active');
      if (tabBossBtn) tabBossBtn.classList.add('active');
      if (c1Pane) c1Pane.style.display = 'none';
      if (bossPane) bossPane.style.display = 'block';
      if (celebrateLabel) celebrateLabel.textContent = t('trophy_celebrate_boss_btn') || 'Bắn Pháo Lửa Diệt Trùm';

      // Update boss status details
      const bossStatusEl = document.getElementById('boss-t-status');
      if (bossStatusEl) {
        if (this.isBossDefeated()) {
          bossStatusEl.className = 'val unlocked';
          bossStatusEl.innerHTML = '⚔️ ĐÃ TIÊU DIỆT HOÀN TẤT';
        } else {
          bossStatusEl.className = 'val locked';
          bossStatusEl.innerHTML = '🔒 Chưa tiêu diệt';
        }
      }
    } else {
      if (tabC1Btn) tabC1Btn.classList.add('active');
      if (tabBossBtn) tabBossBtn.classList.remove('active');
      if (c1Pane) c1Pane.style.display = 'flex';
      if (bossPane) bossPane.style.display = 'none';
      if (celebrateLabel) celebrateLabel.textContent = t('trophy_celebrate_btn') || 'Bắn Pháo Hoa Ăn Mừng';
    }

    this.updateStatusPill();

    // Update 3D Viewer Mesh & Lighting
    if (this.trophyViewer) {
      this.trophyViewer.setTrophyType(this.currentTab, {
        c1: this.isAllCompleted(),
        boss: this.isBossDefeated()
      });
    }
  }

  updateStatusPill() {
    const statusEl = document.getElementById('trophy-status-pill');
    if (!statusEl) return;

    if (this.currentTab === 'boss') {
      const isDefeated = this.isBossDefeated();
      if (isDefeated) {
        statusEl.className = 'trophy-status-pill unlocked boss';
        statusEl.innerHTML = '⚔️ ĐÃ MỞ KHÓA — CÚP TRẢM TƯỚNG HẮC ÁM';
      } else {
        statusEl.className = 'trophy-status-pill locked';
        statusEl.innerHTML = '🔒 KHÓA — TIÊU DIỆT TRÙM ĐỂ MỞ';
      }
    } else {
      const completedCount = this.getCompletedCount();
      const totalCount = QUEST_DEFS.length;
      if (this.isAllCompleted()) {
        statusEl.className = 'trophy-status-pill unlocked';
        statusEl.innerHTML = '🏆 ĐÃ MỞ KHÓA — CÚP BẬC THẦY 2048';
      } else {
        statusEl.className = 'trophy-status-pill locked';
        statusEl.innerHTML = `🔒 KHÓA — CÒN ${totalCount - completedCount} NHIỆM VỤ`;
      }
    }
  }

  celebrateCurrentTab() {
    if (this.currentTab === 'boss') {
      if (this.game.soundManager) {
        if (this.game.soundManager.playFireworkBurst) {
          this.game.soundManager.playFireworkBurst();
        }
        if (this.game.soundManager.playBossExecutionFanfare && !this._bossFanfarePlaying) {
          this._bossFanfarePlaying = true;
          this.game.soundManager.playBossExecutionFanfare();
          setTimeout(() => { this._bossFanfarePlaying = false; }, 3200);
        }
      }
      this.triggerSekiroEmbers();
      if (this.game.particleSystem && this.trophyViewer && this.trophyViewer.camera) {
        this.game.particleSystem.screenShake(this.trophyViewer.camera, 0.24);
      }
      if (this.game.showSpellToast) {
        this.game.showSpellToast('⚔️ Mưa lửa trảm tướng diệt trùm thành công!');
      }
    } else {
      if (this.game.soundManager) {
        if (this.game.soundManager.playFireworkBurst) {
          this.game.soundManager.playFireworkBurst();
        }
        if (this.game.soundManager.playChampionsLeagueFanfare && !this._fanfarePlaying) {
          this._fanfarePlaying = true;
          this.game.soundManager.playChampionsLeagueFanfare();
          setTimeout(() => { this._fanfarePlaying = false; }, 3000);
        }
      }
      this.triggerConfetti();
      if (this.game.particleSystem && this.trophyViewer && this.trophyViewer.camera) {
        this.game.particleSystem.screenShake(this.trophyViewer.camera, 0.14);
      }
      if (this.game.showSpellToast) {
        this.game.showSpellToast('🎉 Rực rỡ pháo hoa ăn mừng chiến tích!');
      }
    }
  }

  // --- Event Trackers ---

  recordMode(modeName) {
    if (!modeName) return;
    const q = this.state.q_all_modes;
    if (!q.modes) q.modes = [];
    if (!q.modes.includes(modeName)) {
      q.modes.push(modeName);
      q.current = q.modes.length;
      if (q.current >= 2 && !q.completed) {
        this.markCompleted('q_all_modes');
      } else {
        this.saveState();
      }
    }
  }

  recordMoveMergesAndTiles(mergesCount, maxTile) {
    if (mergesCount >= 3) {
      const qCombo = this.state.q_combo_3;
      if (mergesCount > qCombo.current) qCombo.current = mergesCount;
      if (!qCombo.completed) {
        this.markCompleted('q_combo_3');
      }
    }

    if (maxTile >= 128) {
      const q128 = this.state.q_reach_128;
      if (maxTile > q128.current) q128.current = maxTile;
      if (!q128.completed) {
        this.markCompleted('q_reach_128');
      }
    }

    if (maxTile >= 2048) {
      const q2048 = this.state.q_reach_2048;
      if (maxTile > q2048.current) q2048.current = maxTile;
      if (!q2048.completed) {
        this.markCompleted('q_reach_2048');
      }
    }

    this.saveState();
  }

  recordRushScore(score) {
    const q = this.state.q_rush_score;
    if (score > q.current) q.current = score;
    if (q.current >= 1000 && !q.completed) {
      this.markCompleted('q_rush_score');
    } else {
      this.saveState();
    }
  }

  recordBossDamage(damage) {
    const q = this.state.q_boss_hit;
    q.current = (q.current || 0) + damage;
    if (q.current >= 300 && !q.completed) {
      this.markCompleted('q_boss_hit');
    } else {
      this.saveState();
    }
  }

  recordSpell(spellType) {
    if (!spellType) return;
    const q = this.state.q_spells_master;
    if (!q.spells) q.spells = [];
    if (!q.spells.includes(spellType)) {
      q.spells.push(spellType);
      q.current = q.spells.length;
      if (q.current >= 3 && !q.completed) {
        this.markCompleted('q_spells_master');
      } else {
        this.saveState();
      }
    }
  }

  // --- Completion & Rewards ---

  markCompleted(questId) {
    const q = this.state[questId];
    if (!q || q.completed) return;

    q.completed = true;
    this.saveState();
    this.updateBadge();

    const def = QUEST_DEFS.find(d => d.id === questId);
    const title = def ? t(def.titleKey) : questId;

    if (this.game.showSpellToast) {
      this.game.showSpellToast(`🎉 HOÀN THÀNH: ${title}! (${this.getCompletedCount()}/7)`);
    }

    if (this.game.soundManager && this.game.soundManager.playSpellRecharge) {
      this.game.soundManager.playSpellRecharge();
    }

    // Check if ALL 7 are completed
    if (this.isAllCompleted() && !this.state.trophy_unlocked) {
      this.state.trophy_unlocked = true;
      this.saveState();
      setTimeout(() => {
        this.celebrateGrandTrophyUnlock();
      }, 600);
    }
  }

  getCompletedCount() {
    let count = 0;
    for (const def of QUEST_DEFS) {
      if (this.state[def.id] && this.state[def.id].completed) {
        count++;
      }
    }
    return count;
  }

  isAllCompleted() {
    return this.getCompletedCount() >= QUEST_DEFS.length;
  }

  updateBadge() {
    const completed = this.getCompletedCount();
    const total = QUEST_DEFS.length;
    if (this.badgeEl) {
      this.badgeEl.textContent = `${completed}/${total}`;
      if (completed >= total) {
        this.badgeEl.classList.add('all-done');
        this.badgeEl.textContent = '2048';
      } else {
        this.badgeEl.classList.remove('all-done');
      }
    }
  }

  celebrateGrandTrophyUnlock() {
    if (this.game.soundManager && this.game.soundManager.playChampionsLeagueFanfare) {
      this.game.soundManager.playChampionsLeagueFanfare();
    }

    this.triggerConfetti();

    if (this.game.showSpellToast) {
      this.game.showSpellToast('🏆 BẠN ĐÃ MỞ KHÓA CÚP BẬC THẦY 2048!');
    }

    this.openModal('c1');
  }

  renderQuestList() {
    const listContainer = document.getElementById('trophy-quests-list');
    if (!listContainer) return;

    listContainer.innerHTML = '';

    const completedCount = this.getCompletedCount();
    const totalCount = QUEST_DEFS.length;

    // Progress bar summary
    const summaryBar = document.getElementById('trophy-progress-fill');
    const summaryText = document.getElementById('trophy-progress-text');
    if (summaryBar) {
      const pct = Math.round((completedCount / totalCount) * 100);
      summaryBar.style.width = `${pct}%`;
    }
    if (summaryText) {
      summaryText.textContent = `${completedCount} / ${totalCount} (${Math.round((completedCount / totalCount) * 100)}%)`;
    }

    QUEST_DEFS.forEach((def) => {
      const q = this.state[def.id] || { completed: false, current: 0 };
      const isDone = q.completed;
      const progressVal = Math.min(q.current || 0, def.target);
      const pct = isDone ? 100 : Math.min(100, Math.round((progressVal / def.target) * 100));

      const card = document.createElement('div');
      card.className = `quest-item-card ${isDone ? 'completed' : ''}`;

      const unitStr = def.unit ? ` ${def.unit}` : '';

      card.innerHTML = `
        <div class="quest-item-icon">${def.icon}</div>
        <div class="quest-item-details">
          <div class="quest-item-header">
            <span class="quest-item-title">${t(def.titleKey)}</span>
            <span class="quest-item-status">${isDone ? '<span class="quest-done-badge"><svg class="ui-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="width:12px;height:12px;vertical-align:-1px;margin-right:3px;"><polyline points="20 6 9 17 4 12"/></svg>Hoàn thành</span>' : `${progressVal}/${def.target}${unitStr}`}</span>
          </div>
          <div class="quest-item-desc">${t(def.descKey)}</div>
          <div class="quest-item-progress-track">
            <div class="quest-item-progress-fill" style="width: ${pct}%"></div>
          </div>
        </div>
      `;
      listContainer.appendChild(card);
    });
  }

  openModal(tab = 'c1') {
    if (!this.modal) return;

    this.modal.style.display = 'flex';
    requestAnimationFrame(() => {
      this.modal.classList.add('active');
    });

    this.renderQuestList();

    // Initialize or refresh 3D Trophy Viewer
    const viewport = document.getElementById('trophy-3d-viewport');
    if (viewport) {
      if (!this.trophyViewer) {
        this.trophyViewer = new TrophyModalViewer(viewport);
      }
      setTimeout(() => {
        if (this.trophyViewer) this.trophyViewer.resize();
      }, 50);
    }

    this.switchTab(tab);
  }

  closeModal() {
    if (!this.modal) return;
    this.modal.classList.remove('active');
    setTimeout(() => {
      this.modal.style.display = 'none';
    }, 240);
  }

  triggerConfetti() {
    const container = document.getElementById('trophy-confetti-container');
    if (!container) return;

    const colors = [
      '#ffd700', '#f59e0b', '#fbbf24', // Luxury Gold
      '#00f0ff', '#38bdf8', '#0ea5e9', // Cyber Cyan
      '#ff4d6d', '#f43f5e', '#ec4899', // Vivid Rose & Pink
      '#10b981', '#34d399',             // Emerald
      '#a855f7', '#c084fc',             // Electric Purple
      '#ffffff', '#f8fafc'              // Pure White & Silver
    ];

    const shapes = ['rect', 'star', 'circle', 'ribbon'];
    const swayactions = ['confetti-sway-1', 'confetti-sway-2', 'confetti-sway-3'];

    const spawnWave = (count, options = {}) => {
      // Soft cap on total pieces in DOM to guarantee >60 FPS during heavy spam
      while (container.childElementCount > 650) {
        container.firstElementChild.remove();
      }

      const fragment = document.createDocumentFragment();
      for (let i = 0; i < count; i++) {
        const piece = document.createElement('div');
        const shape = options.shape || shapes[Math.floor(Math.random() * shapes.length)];
        const sway = swayactions[Math.floor(Math.random() * swayactions.length)];

        let cls = 'confetti-piece';
        if (options.cannon === 'left') {
          cls += ' cannon-left';
          const angle = 0.55 + (Math.random() - 0.5) * 0.45; // ~20 to 50 degrees
          const power = 340 + Math.random() * 320;
          const tx = Math.cos(angle) * power;
          const ty = -Math.sin(angle) * power * 1.35;
          piece.style.setProperty('--tx', `${Math.round(tx)}px`);
          piece.style.setProperty('--ty', `${Math.round(ty)}px`);
          piece.style.setProperty('--drift', `${Math.round(40 + Math.random() * 90)}px`);
          piece.style.setProperty('--rot', `${Math.round(Math.random() * 720 - 360)}deg`);
        } else if (options.cannon === 'right') {
          cls += ' cannon-right';
          const angle = 0.55 + (Math.random() - 0.5) * 0.45;
          const power = 340 + Math.random() * 320;
          const tx = -Math.cos(angle) * power;
          const ty = -Math.sin(angle) * power * 1.35;
          piece.style.setProperty('--tx', `${Math.round(tx)}px`);
          piece.style.setProperty('--ty', `${Math.round(ty)}px`);
          piece.style.setProperty('--drift', `${Math.round(-(40 + Math.random() * 90))}px`);
          piece.style.setProperty('--rot', `${Math.round(Math.random() * 720 - 360)}deg`);
        } else {
          cls += ` ${sway}`;
          if (shape === 'star') cls += ' confetti-star';
          else if (shape === 'circle') cls += ' confetti-circle';
          else if (shape === 'ribbon') cls += ' confetti-ribbon';
          piece.style.left = `${Math.random() * 100}%`;
          piece.style.top = `${-20 - Math.random() * 75}px`;
        }

        piece.className = cls;
        const color = colors[Math.floor(Math.random() * colors.length)];
        piece.style.backgroundColor = color;
        piece.style.color = color;

        const dur = (options.cannon ? (1.6 + Math.random() * 1.2) : (2.2 + Math.random() * 1.8));
        piece.style.animationDuration = `${dur}s`;
        piece.style.animationDelay = `${Math.random() * 0.15}s`;

        if (!options.cannon && shape === 'rect') {
          const w = 8 + Math.random() * 6;
          const h = 12 + Math.random() * 8;
          piece.style.width = `${w}px`;
          piece.style.height = `${h}px`;
        }

        // Each piece safely removes itself when done without touching active particles
        piece.addEventListener('animationend', () => piece.remove(), { once: true });
        fragment.appendChild(piece);
      }
      container.appendChild(fragment);
    };

    // Continuous Multi-Wave Cascade (Spawn 6 waves per click)
    // Wave 0: Instant double cannon explosive blast + center shower
    spawnWave(30, { cannon: 'left' });
    spawnWave(30, { cannon: 'right' });
    spawnWave(50);

    // Wave 1 (+180ms): Second shower wave
    setTimeout(() => spawnWave(45), 180);

    // Wave 2 (+360ms): Secondary cannons + sparkling stars
    setTimeout(() => {
      spawnWave(25, { cannon: 'left' });
      spawnWave(25, { cannon: 'right' });
      spawnWave(40, { shape: 'star' });
    }, 360);

    // Wave 3 (+560ms): Glitter circles shower
    setTimeout(() => spawnWave(45, { shape: 'circle' }), 560);

    // Wave 4 (+780ms): Long cascading streamers
    setTimeout(() => spawnWave(40, { shape: 'ribbon' }), 780);

    // Wave 5 (+1020ms): Grand finale gold shower
    setTimeout(() => spawnWave(50), 1020);
  }

  triggerSekiroEmbers() {
    const container = document.getElementById('trophy-confetti-container');
    if (!container) return;

    const emberColors = ['#ff3b30', '#ef4444', '#dc2626', '#f97316', '#fbbf24', '#7f1d1d', '#ffe4e6'];

    const spawnEmberWave = (count) => {
      while (container.childElementCount > 650) {
        container.firstElementChild.remove();
      }

      const fragment = document.createDocumentFragment();
      for (let i = 0; i < count; i++) {
        const ember = document.createElement('div');
        ember.className = 'sekiro-ember-piece';
        ember.style.left = `${Math.random() * 100}%`;
        const color = emberColors[Math.floor(Math.random() * emberColors.length)];
        ember.style.backgroundColor = color;
        ember.style.color = color;
        const size = 5 + Math.random() * 9;
        ember.style.width = `${size}px`;
        ember.style.height = `${size}px`;
        ember.style.animationDuration = `${1.8 + Math.random() * 2.0}s`;
        ember.style.animationDelay = `${Math.random() * 0.2}s`;
        ember.addEventListener('animationend', () => ember.remove(), { once: true });
        fragment.appendChild(ember);
      }
      container.appendChild(fragment);
    };

    spawnEmberWave(60);
    setTimeout(() => spawnEmberWave(50), 200);
    setTimeout(() => spawnEmberWave(55), 450);
    setTimeout(() => spawnEmberWave(65), 750);
    setTimeout(() => spawnEmberWave(50), 1050);
  }
}
