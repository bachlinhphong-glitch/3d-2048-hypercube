import { t } from './i18n.js';
import { TrophyModalViewer } from './trophy.js';

export const QUEST_DEFS = [
  {
    id: 'q_reach_128',
    icon: '🧊',
    titleKey: 'quest_1_title',
    descKey: 'quest_1_desc',
    target: 128,
    unit: ''
  },
  {
    id: 'q_all_modes',
    icon: '🌌',
    titleKey: 'quest_2_title',
    descKey: 'quest_2_desc',
    target: 3,
    unit: 'mode'
  },
  {
    id: 'q_rush_score',
    icon: '⚡',
    titleKey: 'quest_3_title',
    descKey: 'quest_3_desc',
    target: 1000,
    unit: 'pts'
  },
  {
    id: 'q_boss_hit',
    icon: '⚔️',
    titleKey: 'quest_4_title',
    descKey: 'quest_4_desc',
    target: 300,
    unit: 'DMG'
  },
  {
    id: 'q_spells_master',
    icon: '🔮',
    titleKey: 'quest_5_title',
    descKey: 'quest_5_desc',
    target: 3,
    unit: 'spell'
  },
  {
    id: 'q_combo_3',
    icon: '💥',
    titleKey: 'quest_6_title',
    descKey: 'quest_6_desc',
    target: 3,
    unit: 'combo'
  },
  {
    id: 'q_reach_2048',
    icon: '👑',
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
    this.trophyClaimedCelebrated = false;

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

    if (saved && typeof saved === 'object') {
      return { ...defaultState, ...saved };
    }
    return defaultState;
  }

  saveState() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    } catch {}
  }

  initUI() {
    if (this.btnToggle) {
      this.btnToggle.addEventListener('click', () => {
        this.openModal();
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

    const celebrateBtn = document.getElementById('trophy-celebrate-btn');
    if (celebrateBtn) {
      celebrateBtn.addEventListener('click', () => {
        this.triggerConfetti();
        if (this.game.soundManager) {
          if (this.isAllCompleted() && this.game.soundManager.playTrophyUnlockFanfare) {
            this.game.soundManager.playTrophyUnlockFanfare();
          } else if (this.game.soundManager.playSpellRecharge) {
            this.game.soundManager.playSpellRecharge();
          }
        }
      });
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
      if (q.current >= 3 && !q.completed) {
        this.markCompleted('q_all_modes');
      } else {
        this.saveState();
      }
    }
  }

  recordMoveMergesAndTiles(mergesCount, maxTile) {
    // 1. Combo merges in 1 move
    if (mergesCount >= 3) {
      const qCombo = this.state.q_combo_3;
      if (mergesCount > qCombo.current) qCombo.current = mergesCount;
      if (!qCombo.completed) {
        this.markCompleted('q_combo_3');
      }
    }

    // 2. Tile 128
    if (maxTile >= 128) {
      const q128 = this.state.q_reach_128;
      if (maxTile > q128.current) q128.current = maxTile;
      if (!q128.completed) {
        this.markCompleted('q_reach_128');
      }
    }

    // 3. Tile 2048
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
        this.badgeEl.textContent = '🏆 2048';
      } else {
        this.badgeEl.classList.remove('all-done');
      }
    }
  }

  celebrateGrandTrophyUnlock() {
    if (this.game.soundManager && this.game.soundManager.playTrophyUnlockFanfare) {
      this.game.soundManager.playTrophyUnlockFanfare();
    }

    this.triggerConfetti();

    if (this.game.showSpellToast) {
      this.game.showSpellToast('🏆 BẠN ĐÃ MỞ KHÓA CÚP 2048 ĐỘC QUYỀN!');
    }

    // Open modal to show trophy
    this.openModal();
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

    // Trophy status text
    const statusEl = document.getElementById('trophy-status-pill');
    if (statusEl) {
      if (this.isAllCompleted()) {
        statusEl.className = 'trophy-status-pill unlocked';
        statusEl.innerHTML = '✨ ĐÃ MỞ KHÓA — CÚP VÀNG RÒNG 2048';
      } else {
        statusEl.className = 'trophy-status-pill locked';
        statusEl.innerHTML = `🔒 KHÓA — CÒN ${totalCount - completedCount} NHIỆM VỤ`;
      }
    }

    QUEST_DEFS.forEach((def, index) => {
      const q = this.state[def.id] || { completed: false, current: 0 };
      const isDone = q.completed;
      const progressVal = Math.min(q.current || 0, def.target);
      const pct = isDone ? 100 : Math.min(100, Math.round((progressVal / def.target) * 100));

      const card = document.createElement('div');
      card.className = `quest-item-card ${isDone ? 'completed' : ''}`;

      card.innerHTML = `
        <div class="quest-item-icon">${def.icon}</div>
        <div class="quest-item-details">
          <div class="quest-item-header">
            <span class="quest-item-title">${t(def.titleKey)}</span>
            <span class="quest-item-status">${isDone ? '✅ Hoàn thành' : `${progressVal}/${def.target} ${def.unit}`}</span>
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

  openModal() {
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
      this.trophyViewer.setUnlocked(this.isAllCompleted());
      setTimeout(() => {
        if (this.trophyViewer) this.trophyViewer.resize();
      }, 50);
    }
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

    container.innerHTML = '';
    const colors = ['#ffd700', '#ffea70', '#00f0ff', '#ff007f', '#00ff88', '#ffffff'];
    const count = 60;

    for (let i = 0; i < count; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      piece.style.left = `${Math.random() * 100}%`;
      piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      piece.style.animationDuration = `${1.2 + Math.random() * 1.6}s`;
      piece.style.animationDelay = `${Math.random() * 0.3}s`;
      piece.style.transform = `rotate(${Math.random() * 360}deg)`;
      container.appendChild(piece);
    }

    setTimeout(() => {
      container.innerHTML = '';
    }, 3000);
  }
}
