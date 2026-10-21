import * as THREE from 'three';
import gsap from 'gsap';
import { SceneManager } from './sceneManager.js';
import { Board, getGridPosition, setLayerSpacingMultiplier } from './board.js';
import { Tile3D } from './tile.js';
import { ParticleSystem } from './particles.js';
import { Game2048Logic } from './gameLogic.js';
import { InputManager } from './inputManager.js';
import { soundManager } from './sound.js';
import { textureManager } from './textureManager.js';
import { GhostPreview } from './ghostPreview.js';
import { AIBot } from './aiBot.js';
import { BossManager } from './bossManager.js';
import { i18n, t, setLanguage, getCurrentLanguage } from './i18n.js';
import { QuestManager } from './questManager.js';
import { createChampionsTrophyMesh, createBossTrophyMesh } from './trophy.js';

class GameApp {
  constructor() {
    this.container = document.getElementById('canvas-container');
    this.mode = localStorage.getItem('3d2048_last_mode') || '4x4';
    this.currentShape = localStorage.getItem('3d2048_shape') || 'auto_evolution';
    
    // Theme preference: 'system' by default (auto sync with browser/OS), or user choice
    this.themePreference = localStorage.getItem('3d2048_theme_pref') || 'system';
    const isDark = (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (this.themePreference === 'system') {
      this.currentTheme = isDark ? 'gentle_dark' : 'gentle_light';
    } else if (this.themePreference === 'zen_clay') {
      this.currentTheme = 'gentle_light';
    } else if (this.themePreference === 'modern_slate') {
      this.currentTheme = 'gentle_dark';
    } else {
      this.currentTheme = this.themePreference;
    }

    this.sceneManager = new SceneManager(this.container);
    this.particleSystem = new ParticleSystem(this.sceneManager.scene);
    this.gameLogic = new Game2048Logic(this.mode);
    this.board = new Board(this.mode, this.currentTheme);
    textureManager.setTheme(this.currentTheme);
    this.sceneManager.scene.add(this.board.group);
    this.aiBot = new AIBot(this);
    this.soundManager = soundManager;
    window.soundManager = soundManager;
    this.bossManager = new BossManager(this);
    this.isBossRaid = false;
    this.trophyMascot = null;
    this.bossTrophyMascot = null;
    this.questManager = new QuestManager(this);
    this.questManager.recordMode(this.mode);
    window.gameApp = this;
    window.THREE = THREE;
    window.textureManager = textureManager;
    window.Tile3D = Tile3D;

    // 3D tiles grid: tiles3D[layer][row][col]
    this.tiles3D = this.createEmptyTileGrid();

    this.isAnimating = false;
    this.clock = new THREE.Clock();

    // Rush Mode State
    this.isRushMode = false;
    this.rushTime = 30.0;
    this.maxRushTime = 45.0;

    // Telemetry & Stats State
    this.frameCount = 0;
    this.lastFpsTimestamp = performance.now();
    this.lastFrameTime = 16.6;
    this.recentMoves = []; // Timestamps for APM
    this.fpsHistory = new Array(40).fill(60);
    this.msHistory = new Array(40).fill(16);

    // Summoner Spells State (Gợi ý, Đi lại, Đổi vị trí)
    this.isSwapMode = false;
    this.swapSelectedTile = null;
    this.hoveredTile = null;
    this.toastTimeout = null;

    // Slice View State (for 3x3x3 X-Ray / Exploded View)
    this.sliceMode = 'all'; // 'all' | 0 | 1 | 2 | 'exploded'
    this._sliceCycleOrder = ['all', 0, 1, 2, 'exploded'];
    this._sliceCycleIdx = 0;

    // Combo counter for merge audio
    this.comboCount = 0;

    // Match Analytics & Tracking
    this.moveCount = 0;
    this.matchStartTime = Date.now();
    this.elapsedSeconds = 0;
    this.maxTileValue = 2;
    this.mergeCount = 0;
    this.mergeTierCounts = {};

    // Hardware Adaptive Performance State & Graphics Quality (high, medium, low)
    this.graphicsQuality = localStorage.getItem('3d2048_graphics_quality') || 
      (localStorage.getItem('3d2048_target_fps') === '30' ? 'low' : 
       localStorage.getItem('3d2048_target_fps') === '60' ? 'medium' : 'high');
    this.targetFps = this.graphicsQuality === 'low' ? '30' : this.graphicsQuality === 'medium' ? '60' : '120';
    if (this.sceneManager && this.sceneManager.setGraphicsQuality) {
      this.sceneManager.setGraphicsQuality(this.graphicsQuality);
    }
    this.lastRenderTimestamp = performance.now();
    this.lastUserInteraction = performance.now();
    this.lastIdleTimestamp = performance.now();

    // In-App Browser & Visual Juice Architecture (v6.6.0)
    this.celebratedMilestones = new Set();
    this.firstSwipeGuideShown = false;
    this.firstSwipeGuideTimer = null;
    this.floatingScoreContainer = document.getElementById('floating-score-container');
    this.comboCalloutEl = document.getElementById('combo-callout');
    this.milestoneBannerEl = document.getElementById('milestone-banner');
    this.firstSwipeHandEl = document.getElementById('first-swipe-hand');

    this.detectInAppBrowser();

    this.initUI();
    this.initTelemetryCanvas();
    this.initInput();
    this.initGhostPreview();
    this.initFirstSwipeGuide();
    this.startNewGame(true);

    // Dedicated timer running fixed 5 times/second (every 200ms) for DOM stats, APM, FPS & Canvas graph
    // Eliminates Layout Thrashing in requestAnimationFrame
    this.telemetryInterval = setInterval(() => this.updateTelemetryAndStats(), 200);

    this.animate();
  }

  createEmptyTileGrid() {
    const layers = this.mode === '3x3x3' ? 3 : 1;
    const rows = this.mode === '3x3x3' ? 3 : 4;
    const cols = this.mode === '3x3x3' ? 3 : 4;
    return Array.from({ length: layers }, () =>
      Array.from({ length: rows }, () =>
        Array(cols).fill(null)
      )
    );
  }

  initUI() {
    this.scoreEl = document.getElementById('score-val');
    this.bestScoreEl = document.getElementById('best-val');
    this.scoreBadge = document.getElementById('score-badge');
    this.fpsEl = document.getElementById('fps-counter');

    // Modals
    this.modalOverlay = document.getElementById('modal-overlay');
    this.modalTitle = document.getElementById('modal-title');
    this.modalMessage = document.getElementById('modal-message');
    this.modalBtnPrimary = document.getElementById('modal-btn-primary');
    this.modalBtnSecondary = document.getElementById('modal-btn-secondary');

    if (this.modalOverlay) {
      this.modalOverlay.style.display = 'none';
      this.modalOverlay.style.pointerEvents = 'none';
    }

    // Rush Mode Elements
    this.rushPanel = document.getElementById('rush-panel');
    this.rushTimerEl = document.getElementById('rush-timer-val');
    this.rushProgressBar = document.getElementById('rush-progress-bar');
    this.rushToggleBtn = document.getElementById('btn-toggle-rush');
    this.rushFloatingContainer = document.getElementById('rush-floating-fx');

    // Apply Initial Translations
    i18n.applyToDOM();

    // Action Buttons
    const newGameBtn = document.getElementById('btn-new-game');
    if (newGameBtn) {
      newGameBtn.addEventListener('click', () => {
        this.startNewGame(false);
      });
    }

    const resetCamBtn = document.getElementById('btn-reset-camera');
    if (resetCamBtn) {
      resetCamBtn.addEventListener('click', () => {
        this.sceneManager.resetCamera();
      });
    }

    // Settings Modal
    const settingsModal = document.getElementById('settings-modal');
    const settingsToggleBtn = document.getElementById('btn-settings-toggle');
    const settingsCloseBtn = document.getElementById('btn-close-settings');

    if (settingsToggleBtn && settingsModal) {
      settingsToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        settingsModal.style.display = 'flex';
        settingsModal.classList.add('active');
      });
    }

    const closeSettings = () => {
      if (!settingsModal) return;
      settingsModal.classList.remove('active');
      setTimeout(() => {
        settingsModal.style.display = 'none';
      }, 220);
    };

    if (settingsCloseBtn) {
      settingsCloseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeSettings();
      });
    }
    if (settingsModal) {
      settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) closeSettings();
      });
    }
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && settingsModal && settingsModal.classList.contains('active')) {
        closeSettings();
      }
    });

    // Welcome & Intro Onboarding Modal
    const welcomeModal = document.getElementById('welcome-modal');
    const helpToggleBtn = document.getElementById('btn-help-toggle');
    const welcomeCloseBtn = document.getElementById('welcome-modal-close');
    const welcomeStartBtn = document.getElementById('welcome-modal-start-btn');
    const dontShowCheckbox = document.getElementById('welcome-dont-show-checkbox');

    const openWelcome = () => {
      if (!welcomeModal) return;
      welcomeModal.style.display = 'flex';
      requestAnimationFrame(() => {
        welcomeModal.classList.add('active');
      });
      soundManager.playClick();
    };

    const closeWelcome = () => {
      if (!welcomeModal) return;
      if (dontShowCheckbox && dontShowCheckbox.checked) {
        try {
          localStorage.setItem('3d2048_welcome_seen', 'true');
        } catch {}
      }
      welcomeModal.classList.remove('active');
      setTimeout(() => {
        welcomeModal.style.display = 'none';
      }, 250);
      soundManager.playClick();
    };

    if (helpToggleBtn) {
      helpToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openWelcome();
      });
    }

    if (welcomeCloseBtn) {
      welcomeCloseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeWelcome();
      });
    }

    // Welcome Modal Language Switcher (VN / EN)
    const updateWelcomeLangActive = (currentLang) => {
      document.querySelectorAll('.welcome-lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-lang') === currentLang);
      });
    };
    updateWelcomeLangActive(getCurrentLanguage());

    document.querySelectorAll('.welcome-lang-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const lang = btn.getAttribute('data-lang');
        setLanguage(lang);
        updateWelcomeLangActive(lang);
        const langSelect = document.getElementById('select-lang');
        if (langSelect) langSelect.value = lang;
        soundManager.playClick();
      });
    });

    window.addEventListener('languageChanged', (e) => {
      updateWelcomeLangActive(e.detail.lang);
    });

    if (welcomeStartBtn) {
      welcomeStartBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeWelcome();
      });
    }

    if (welcomeModal) {
      welcomeModal.addEventListener('click', (e) => {
        if (e.target === welcomeModal) closeWelcome();
      });
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && welcomeModal && welcomeModal.classList.contains('active')) {
        closeWelcome();
      }
    });

    // Auto show on first open
    const hasSeenWelcome = localStorage.getItem('3d2048_welcome_seen');
    if (!hasSeenWelcome) {
      setTimeout(() => {
        openWelcome();
      }, 400);
    }

    // Language Selector
    const langSelect = document.getElementById('select-lang');
    if (langSelect) {
      langSelect.value = getCurrentLanguage();
      langSelect.addEventListener('change', (e) => {
        setLanguage(e.target.value);
        this.updateDynamicLanguageTexts();
      });
    }

    window.addEventListener('languageChanged', () => {
      this.updateDynamicLanguageTexts();
    });

    const muteBtn = document.getElementById('btn-sound-toggle');
    if (muteBtn) {
      const sfxLabel = document.getElementById('label-sfx');
      muteBtn.addEventListener('click', () => {
        const isMuted = soundManager.toggleMute();
        if (sfxLabel) sfxLabel.textContent = isMuted ? t('btn_sfx_off') : t('btn_sfx');
        muteBtn.classList.toggle('muted', isMuted);
      });
    }

    const bgmBtn = document.getElementById('btn-bgm-toggle');
    if (bgmBtn) {
      const bgmStorage = localStorage.getItem('3d2048_bgm');
      // Default to true for first-time visitors before they even log in/interact
      const isBgmActive = bgmStorage === null || bgmStorage === 'true';
      const bgmLabel = document.getElementById('label-bgm');
      if (isBgmActive) {
        if (bgmLabel) bgmLabel.textContent = t('btn_bgm_on');
        bgmBtn.classList.add('active');
        const startOnUserAction = () => {
          soundManager.startBGM();
          window.removeEventListener('pointerdown', startOnUserAction);
          window.removeEventListener('touchstart', startOnUserAction);
          window.removeEventListener('keydown', startOnUserAction);
        };
        window.addEventListener('pointerdown', startOnUserAction, { once: true, passive: true });
        window.addEventListener('touchstart', startOnUserAction, { once: true, passive: true });
        window.addEventListener('keydown', startOnUserAction, { once: true });
      } else {
        if (bgmLabel) bgmLabel.textContent = t('btn_bgm_off');
        bgmBtn.classList.remove('active');
      }

      bgmBtn.addEventListener('click', () => {
        const isPlaying = soundManager.toggleBGM();
        if (bgmLabel) bgmLabel.textContent = isPlaying ? t('btn_bgm_on') : t('btn_bgm_off');
        bgmBtn.classList.toggle('active', isPlaying);
        localStorage.setItem('3d2048_bgm', isPlaying ? 'true' : 'false');
        this.showSpellToast(isPlaying ? `🎵 ${t('btn_bgm')}: ON` : `🔇 ${t('btn_bgm')}: OFF`);
        this.registerInteraction();
      });
    }

    const shareBtn = document.getElementById('btn-share-score');
    if (shareBtn) {
      shareBtn.addEventListener('click', () => {
        this.shareScore();
      });
    }

    const modalShareBtn = document.getElementById('modal-btn-share');
    if (modalShareBtn) {
      modalShareBtn.addEventListener('click', () => {
        this.shareScore();
      });
    }

    // Boss Mode Button & Testing Shortcut
    const bossBtn = document.getElementById('btn-toggle-boss');
    if (bossBtn) {
      bossBtn.addEventListener('click', () => {
        this.handleBossToggleClick();
      });
    }

    if (this.rushToggleBtn) {
      this.rushToggleBtn.addEventListener('click', () => {
        this.handleRushToggleClick();
      });
    }

    // Keyboard shortcut Alt+B for testing Phase 3
    window.addEventListener('keydown', (e) => {
      if (e.altKey && (e.code === 'KeyB' || e.key === 'b' || e.key === 'B')) {
        e.preventDefault();
        if (!this.isBossRaid) this.activateBossModeWithCleanReset();
        this.bossManager.setupTestPhase3();
      }
    });

    this.setupModeConfirmModal();

    // AI Auto-Play Button
    const aiBtn = document.getElementById('btn-ai-toggle');
    if (aiBtn) {
      aiBtn.addEventListener('click', () => {
        const isRunning = this.aiBot.toggle();
        aiBtn.classList.toggle('active', isRunning);
        const textEl = aiBtn.querySelector('.btn-text');
        if (textEl) textEl.textContent = isRunning ? t('btn_ai_active') : t('btn_ai');
        this.showSpellToast(isRunning ? t('toast_ai_start') : t('toast_ai_stop'));
        this.registerInteraction();
      });
      this.aiBot.onStatusChange = (running) => {
        aiBtn.classList.toggle('active', running);
        const textEl = aiBtn.querySelector('.btn-text');
        if (textEl) textEl.textContent = running ? t('btn_ai_active') : t('btn_ai');
      };
    }

    // Dimension Mode Selector
    const modeSelect = document.getElementById('select-mode');
    if (modeSelect) {
      modeSelect.value = this.mode;
      modeSelect.addEventListener('change', (e) => {
        this.switchDimensionMode(e.target.value);
      });
    }

    const dpadDepth = document.querySelector('.dpad-depth-row');
    if (dpadDepth) {
      dpadDepth.style.display = this.mode === '3x3x3' ? 'flex' : 'none';
    }
    const sliceControls = document.getElementById('slice-controls');
    if (sliceControls) {
      sliceControls.style.display = this.mode === '3x3x3' ? 'flex' : 'none';
    }

    // Tile Shape Selector (Header quick select & Settings modal select)
    const headerShapeSelect = document.getElementById('header-select-shape');
    const shapeSelect = document.getElementById('select-shape');
    if (headerShapeSelect) {
      headerShapeSelect.value = this.currentShape;
      headerShapeSelect.addEventListener('change', (e) => {
        this.switchTileShape(e.target.value);
      });
    }
    if (shapeSelect) {
      shapeSelect.value = this.currentShape;
      shapeSelect.addEventListener('change', (e) => {
        this.switchTileShape(e.target.value);
      });
    }

    // Theme & Background Selector
    const themeSelect = document.getElementById('select-theme');
    const bgUploadInput = document.getElementById('bg-upload-input');
    if (themeSelect) {
      themeSelect.value = this.themePreference;
      themeSelect.addEventListener('change', (e) => {
        if (e.target.value === 'custom') {
          if (bgUploadInput) bgUploadInput.click();
          return;
        }
        this.setThemePreference(e.target.value);
      });
    }
    if (bgUploadInput) {
      bgUploadInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) {
          if (themeSelect) themeSelect.value = this.currentTheme;
          return;
        }
        if (file.size > 5 * 1024 * 1024) {
          this.showSpellToast('Ảnh quá lớn! Chọn ảnh < 5MB');
          if (themeSelect) themeSelect.value = this.currentTheme;
          return;
        }
        const reader = new FileReader();
        reader.onload = (ev) => {
          try { localStorage.setItem('3d2048_custom_bg', ev.target.result); } catch {}
          this.switchTheme('custom');
          localStorage.setItem('3d2048_theme', 'custom');
          this.showSpellToast('🖼️ Đã đặt ảnh nền của bạn!');
        };
        reader.readAsDataURL(file);
        // Reset so same file can be re-selected
        bgUploadInput.value = '';
      });
    }

    // 3-Tier Graphics Quality & FPS Profile Selector
    this.graphicsSelect = document.getElementById('select-graphics');
    this.fpsSelect = document.getElementById('select-fps');

    if (this.graphicsSelect) {
      this.graphicsSelect.value = this.graphicsQuality;
      this.graphicsSelect.addEventListener('change', (e) => {
        this.setGraphicsQuality(e.target.value);
      });
    }

    if (this.fpsSelect) {
      this.fpsSelect.value = this.targetFps;
      this.fpsSelect.addEventListener('change', (e) => {
        const fpsVal = e.target.value;
        const qualityVal = fpsVal === '30' ? 'low' : fpsVal === '60' ? 'medium' : 'high';
        this.setGraphicsQuality(qualityVal);
      });
    }

    // Virtual D-Pad Selector (Mobile & Desktop UX with Device Auto-Adaptation)
    const dpadSelect = document.getElementById('select-dpad');
    const dirPad = document.getElementById('dir-pad');
    const savedDpadMode = localStorage.getItem('3d2048_dpad_mode') || 'auto';

    const isTouchDevice = () => {
      return ('ontouchstart' in window) || 
             (navigator.maxTouchPoints > 0) || 
             (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) ||
             (window.innerWidth <= 768) ||
             (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };

    const applyDpadMode = (mode) => {
      if (!dirPad) return;
      dirPad.classList.remove('hide-dpad', 'force-show', 'device-touch-adapted');
      if (mode === 'hidden') {
        dirPad.classList.add('hide-dpad');
      } else if (mode === 'visible') {
        dirPad.classList.add('force-show');
        if (isTouchDevice()) {
          dirPad.classList.add('device-touch-adapted');
        }
      } else {
        // 'auto' mode: automatically adapt to device
        if (isTouchDevice()) {
          dirPad.classList.add('force-show', 'device-touch-adapted');
        }
      }
    };

    if (dpadSelect) {
      dpadSelect.value = savedDpadMode;
      applyDpadMode(savedDpadMode);
      dpadSelect.addEventListener('change', (e) => {
        const mode = e.target.value;
        localStorage.setItem('3d2048_dpad_mode', mode);
        applyDpadMode(mode);
        const label = e.target.options[e.target.selectedIndex].text;
        this.showSpellToast(`🎮 ${t('setting_dpad') || 'Điều hướng'}: ${label}`);
        this.registerInteraction();
      });
    } else {
      applyDpadMode(savedDpadMode);
    }

    window.addEventListener('resize', () => {
      const currentMode = localStorage.getItem('3d2048_dpad_mode') || 'auto';
      applyDpadMode(currentMode);
    });

    // Multi-App Social Sharing Modal Setup
    this.setupShareModal();

    // Auto-detect & Display Hardware GPU
    this.gpuBadgeEl = document.getElementById('gpu-badge');
    this.gpuInfo = this.sceneManager.getGPUInfo();
    if (this.gpuBadgeEl && this.gpuInfo) {
      this.gpuBadgeEl.textContent = this.gpuInfo.renderer;
      this.gpuBadgeEl.title = `Card đồ họa: ${this.gpuInfo.full}`;
    }

    // Track user activity to support Smart Idle Throttling
    const recordActivity = () => {
      this.registerInteraction();
      this.dismissFirstSwipeGuide();
    };
    window.addEventListener('pointerdown', recordActivity, { passive: true });
    window.addEventListener('pointermove', recordActivity, { passive: true });
    window.addEventListener('keydown', recordActivity, { passive: true });
    window.addEventListener('touchstart', recordActivity, { passive: true });

    // Unlock iOS Safari / Mobile Web Audio Context on first user touch/click
    const unlockAudio = () => soundManager.ensureContext();
    window.addEventListener('touchstart', unlockAudio, { once: true, passive: true });
    window.addEventListener('pointerdown', unlockAudio, { once: true, passive: true });


    // Summoner Spells Elements (Gợi ý, Đi lại, Đổi vị trí)
    this.btnSpellHint = document.getElementById('btn-spell-hint');
    this.btnSpellUndo = document.getElementById('btn-spell-undo');
    this.btnSpellSwap = document.getElementById('btn-spell-swap');
    this.badgeSpellHint = document.getElementById('badge-spell-hint');
    this.badgeSpellUndo = document.getElementById('badge-spell-undo');
    this.badgeSpellSwap = document.getElementById('badge-spell-swap');
    this.spellToastEl = document.getElementById('spell-toast');

    if (this.btnSpellHint) {
      this.btnSpellHint.addEventListener('click', (e) => {
        e.stopPropagation();
        this.handleSpellHint();
      });
    }
    if (this.btnSpellUndo) {
      this.btnSpellUndo.addEventListener('click', (e) => {
        e.stopPropagation();
        this.handleSpellUndo();
      });
    }
    if (this.btnSpellSwap) {
      this.btnSpellSwap.addEventListener('click', (e) => {
        e.stopPropagation();
        this.handleSpellSwap();
      });
    }

    this.updateScoreUI();
    this.updateSpellUI();
    this.switchTheme(this.currentTheme);
    this.updateTrophyMascot();
  }

  registerInteraction() {
    this.lastUserInteraction = performance.now();
  }

  initTelemetryCanvas() {
    this.telemetryPanel = document.getElementById('telemetry-panel');
    this.telemetryCanvas = document.getElementById('telemetry-canvas');
    if (this.telemetryCanvas) {
      this.telemetryCtx = this.telemetryCanvas.getContext('2d');
    }
    this.statEls = {
      fps: document.getElementById('stat-fps'),
      ms: document.getElementById('stat-ms'),
      calls: document.getElementById('stat-calls'),
      tris: document.getElementById('stat-tris'),
      gpu: document.getElementById('stat-gpu'),
      fpsTarget: document.getElementById('stat-fps-target'),
      apm: document.getElementById('stat-apm'),
      density: document.getElementById('stat-density')
    };
  }

  switchDimensionMode(newMode) {
    if (this.mode === newMode) return;
    this.mode = newMode;
    localStorage.setItem('3d2048_last_mode', newMode);
    this.board.setMode(newMode);
    this.sceneManager.setMode(newMode);
    this.gameLogic.setMode(newMode);
    if (this.questManager) {
      this.questManager.recordMode(newMode);
    }

    const sliceControls = document.getElementById('slice-controls');
    if (sliceControls) {
      sliceControls.style.display = newMode === '3x3x3' ? 'flex' : 'none';
    }

    const dpadDepth = document.querySelector('.dpad-depth-row');
    if (dpadDepth) {
      dpadDepth.style.display = newMode === '3x3x3' ? 'flex' : 'none';
    }

    // Reset slice mode
    this._sliceCycleIdx = 0;
    this.sliceMode = 'all';

    this.sceneManager.requestShadowUpdate(30);
    this.startNewGame(true);
  }

  switchTileShape(newShape) {
    this.currentShape = newShape;
    try {
      localStorage.setItem('3d2048_shape', newShape);
    } catch {}

    const headerShapeSelect = document.getElementById('header-select-shape');
    if (headerShapeSelect && headerShapeSelect.value !== newShape) {
      headerShapeSelect.value = newShape;
    }
    const shapeSelect = document.getElementById('select-shape');
    if (shapeSelect && shapeSelect.value !== newShape) {
      shapeSelect.value = newShape;
    }

    for (let l = 0; l < this.tiles3D.length; l++) {
      for (let r = 0; r < this.tiles3D[l].length; r++) {
        for (let c = 0; c < this.tiles3D[l][r].length; c++) {
          const tile = this.tiles3D[l][r][c];
          if (tile) {
            tile.setShape(newShape);
          }
        }
      }
    }
    this.sceneManager.requestShadowUpdate(20);
  }

  switchTheme(newTheme) {
    this.currentTheme = newTheme;
    document.body.className = `theme-${newTheme}`;
    this.sceneManager.setTheme(newTheme);
    if (this.board && this.board.setTheme) {
      this.board.setTheme(newTheme);
    }
    textureManager.setTheme(newTheme);

    this.updateDemoSwitcherUI();

    // Custom background: read from localStorage and set as CSS background-image
    if (newTheme === 'custom') {
      try {
        const customBg = localStorage.getItem('3d2048_custom_bg');
        if (customBg) {
          const container = document.getElementById('canvas-container');
          if (container) container.style.backgroundImage = `url('${customBg}')`;
        }
      } catch {}
    } else {
      // Let CSS handle background for built-in themes
      const container = document.getElementById('canvas-container');
      if (container) container.style.backgroundImage = '';
    }

    const isNeon = newTheme === 'neon';
    this.particleSystem.setHyperNeon(isNeon);
    textureManager.setHyperNeon(isNeon);

    if (this.telemetryPanel) {
      this.telemetryPanel.style.display = newTheme === 'telemetry' ? 'block' : 'none';
    }

    // Refresh existing tiles materials
    for (let l = 0; l < this.tiles3D.length; l++) {
      for (let r = 0; r < this.tiles3D[l].length; r++) {
        for (let c = 0; c < this.tiles3D[l][r].length; c++) {
          const tile = this.tiles3D[l][r][c];
          if (tile) {
            tile.buildGeometry();
          }
        }
      }
    }
    this.sceneManager.requestShadowUpdate(25);
  }

  setSliceMode(mode) {
    this.sliceMode = mode;

    if (mode === 'exploded') {
      setLayerSpacingMultiplier(1.85);
      if (this.board) this.board.updateExplodedPlanes(1.85);
    } else {
      setLayerSpacingMultiplier(1.0);
      if (this.board) this.board.updateExplodedPlanes(1.0);
    }

    for (let l = 0; l < this.tiles3D.length; l++) {
      for (let r = 0; r < this.tiles3D[l].length; r++) {
        for (let c = 0; c < this.tiles3D[l][r].length; c++) {
          const tile = this.tiles3D[l][r][c];
          if (!tile) continue;
          if (mode === 'all' || mode === 'exploded') {
            tile.setSliceDim(false);
          } else {
            const isDimmed = (l !== mode);
            tile.setSliceDim(isDimmed);
          }
          tile.updateExplodedPosition(0.32);
        }
      }
    }

    // Update button active state
    const bar = document.getElementById('slice-controls');
    if (bar) {
      bar.querySelectorAll('.slice-btn').forEach(btn => {
        const val = btn.dataset.slice;
        const parsed = (val === 'all' || val === 'exploded') ? val : parseInt(val, 10);
        btn.classList.toggle('active', parsed === mode);
      });
    }

    this.sceneManager.requestShadowUpdate(15);
  }

  cycleSliceMode() {
    if (this.mode !== '3x3x3') return;
    this._sliceCycleIdx = (this._sliceCycleIdx + 1) % this._sliceCycleOrder.length;
    const next = this._sliceCycleOrder[this._sliceCycleIdx];
    this.setSliceMode(next);
  }

  toggleRushMode(forceState = null) {
    const targetState = forceState !== null ? forceState : !this.isRushMode;
    this.isRushMode = targetState;
    this.gameLogic.setRushMode(this.isRushMode);

    if (this.rushToggleBtn) {
      const textEl = this.rushToggleBtn.querySelector('.btn-text');
      if (textEl) textEl.textContent = t('btn_rush') || 'Đua giờ';
      this.rushToggleBtn.classList.toggle('active', this.isRushMode);
    }

    if (this.rushPanel) {
      this.rushPanel.style.display = this.isRushMode ? 'flex' : 'none';
    }

    this.rushTime = 30.0;
  }

  toggleBossRaid(forceState = null) {
    const targetState = forceState !== null ? forceState : !this.isBossRaid;
    this.isBossRaid = targetState;
    const bossBtn = document.getElementById('btn-toggle-boss');
    if (bossBtn) {
      bossBtn.classList.toggle('active', this.isBossRaid);
      const textEl = bossBtn.querySelector('.btn-text');
      if (textEl) textEl.textContent = this.isBossRaid ? t('btn_boss_active') : t('btn_boss');
    }
    if (this.isBossRaid) {
      this.bossManager.startRaid();
    } else {
      this.bossManager.stopRaid();
    }
    this.registerInteraction();
  }

  handleBossToggleClick() {
    if (this.isBossRaid) {
      this.toggleBossRaid(false);
      this.showSpellToast('Đã thoát chế độ Đấu Trùm.');
      return;
    }

    const skipConfirm = localStorage.getItem('3d2048_boss_confirm_skip') === 'true';
    if (skipConfirm) {
      this.activateBossModeWithCleanReset();
      return;
    }

    this.openModeConfirmModal('boss');
  }

  handleRushToggleClick() {
    if (this.isRushMode) {
      this.toggleRushMode(false);
      this.showSpellToast('Đã thoát chế độ Đua Giờ.');
      return;
    }

    const skipConfirm = localStorage.getItem('3d2048_rush_confirm_skip') === 'true';
    if (skipConfirm) {
      this.activateRushModeWithCleanReset();
      return;
    }

    this.openModeConfirmModal('rush');
  }

  activateBossModeWithCleanReset() {
    if (this.isRushMode) {
      this.toggleRushMode(false);
    }
    this.clearSavedGameState();
    this.startNewGame(false);
    if (!this.isBossRaid) {
      this.toggleBossRaid(true);
    }
    this.showSpellToast('⚔️ Chế độ Đấu Trùm đã kích hoạt!');
  }

  activateRushModeWithCleanReset() {
    if (this.isBossRaid) {
      this.toggleBossRaid(false);
    }
    this.clearSavedGameState();
    this.startNewGame(false);
    if (!this.isRushMode) {
      this.toggleRushMode(true);
    }
    this.showSpellToast('⚡ Chế độ Đua Giờ đã kích hoạt!');
  }

  setupModeConfirmModal() {
    const modal = document.getElementById('mode-confirm-modal');
    if (!modal) return;

    const closeBtn = document.getElementById('mode-confirm-close');
    const cancelBtn = document.getElementById('btn-mode-confirm-cancel');
    const startBtn = document.getElementById('btn-mode-confirm-start');
    const dontShowCheckbox = document.getElementById('mode-confirm-dont-show');

    const closeModal = () => {
      modal.classList.remove('active');
      setTimeout(() => {
        modal.style.display = 'none';
      }, 220);
    };

    if (closeBtn) closeBtn.onclick = closeModal;
    if (cancelBtn) cancelBtn.onclick = closeModal;
    modal.onclick = (e) => {
      if (e.target === modal) closeModal();
    };

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
      }
    });

    if (startBtn) {
      startBtn.onclick = () => {
        const mode = modal.dataset.pendingMode;
        if (dontShowCheckbox && dontShowCheckbox.checked) {
          try {
            localStorage.setItem(`3d2048_${mode}_confirm_skip`, 'true');
          } catch {}
        }
        try {
          localStorage.setItem(`3d2048_${mode}_tutorial_seen`, 'true');
        } catch {}

        closeModal();

        if (mode === 'boss') {
          this.activateBossModeWithCleanReset();
        } else if (mode === 'rush') {
          this.activateRushModeWithCleanReset();
        }
      };
    }
  }

  openModeConfirmModal(mode) {
    const modal = document.getElementById('mode-confirm-modal');
    if (!modal) return;

    modal.dataset.pendingMode = mode;
    const titleEl = document.getElementById('mode-confirm-title');
    const subtitleEl = document.getElementById('mode-confirm-subtitle');
    const iconBox = document.getElementById('mode-confirm-icon-box');
    const badgeEl = document.getElementById('mode-tutorial-badge');
    const badgeTextEl = document.getElementById('mode-tutorial-badge-text');
    const contentEl = document.getElementById('mode-tutorial-content');
    const dontShowCheckbox = document.getElementById('mode-confirm-dont-show');

    if (dontShowCheckbox) dontShowCheckbox.checked = false;

    const isFirstTime = !localStorage.getItem(`3d2048_${mode}_tutorial_seen`);

    if (mode === 'boss') {
      if (titleEl) titleEl.textContent = t('mode_confirm_boss_title');
      if (subtitleEl) subtitleEl.textContent = t('mode_confirm_boss_subtitle');
      if (iconBox) {
        iconBox.classList.remove('rush');
        iconBox.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14.5 17.5L3 6V3h3l11.5 11.5"></path>
            <path d="M13 19l6-6"></path>
            <path d="M16 16l4 4"></path>
            <path d="M19 21l2-2"></path>
            <path d="M9.5 17.5L21 6V3h-3L6.5 14.5"></path>
            <path d="M11 19l-6-6"></path>
            <path d="M8 16l-4 4"></path>
            <path d="M5 21l-2-2"></path>
          </svg>`;
      }
      if (badgeEl) badgeEl.classList.toggle('first-time', isFirstTime);
      if (badgeTextEl) {
        badgeTextEl.textContent = isFirstTime ? t('mode_tutorial_badge_first') : t('mode_tutorial_badge');
      }
      if (contentEl) {
        contentEl.innerHTML = `
          <div class="mode-rule-item">
            <span class="mode-rule-bullet">🎯</span>
            <div><strong>${t('rule_boss_goal_title')}</strong> ${t('rule_boss_goal_desc')}</div>
          </div>
          <div class="mode-rule-item">
            <span class="mode-rule-bullet">💥</span>
            <div><strong>${t('rule_boss_dmg_title')}</strong> ${t('rule_boss_dmg_desc')}</div>
          </div>
          <div class="mode-rule-item">
            <span class="mode-rule-bullet">⏱️</span>
            <div><strong>${t('rule_boss_time_title')}</strong> ${t('rule_boss_time_desc')}</div>
          </div>
          <div class="mode-rule-item highlight">
            <span class="mode-rule-bullet">🛡️</span>
            <div><strong>${t('rule_boss_bonus_title')}</strong> ${t('rule_boss_bonus_desc')}</div>
          </div>
        `;
      }
    } else if (mode === 'rush') {
      if (titleEl) titleEl.textContent = t('mode_confirm_rush_title');
      if (subtitleEl) subtitleEl.textContent = t('mode_confirm_rush_subtitle');
      if (iconBox) {
        iconBox.classList.add('rush');
        iconBox.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
          </svg>`;
      }
      if (badgeEl) badgeEl.classList.toggle('first-time', isFirstTime);
      if (badgeTextEl) {
        badgeTextEl.textContent = isFirstTime ? t('mode_tutorial_badge_first') : t('mode_tutorial_badge');
      }
      if (contentEl) {
        contentEl.innerHTML = `
          <div class="mode-rule-item">
            <span class="mode-rule-bullet">🎯</span>
            <div><strong>${t('rule_rush_goal_title')}</strong> ${t('rule_rush_goal_desc')}</div>
          </div>
          <div class="mode-rule-item">
            <span class="mode-rule-bullet">⏳</span>
            <div><strong>${t('rule_rush_time_title')}</strong> ${t('rule_rush_time_desc')}</div>
          </div>
          <div class="mode-rule-item highlight">
            <span class="mode-rule-bullet">🛡️</span>
            <div><strong>${t('rule_rush_bonus_title')}</strong> ${t('rule_rush_bonus_desc')}</div>
          </div>
        `;
      }
    }

    soundManager.playClick();
    modal.style.display = 'flex';
    modal.classList.add('active');
  }

  updateDynamicLanguageTexts() {
    const bossBtn = document.getElementById('btn-toggle-boss');
    if (bossBtn) {
      const textEl = bossBtn.querySelector('.btn-text');
      if (textEl) textEl.textContent = this.isBossRaid ? t('btn_boss_active') : t('btn_boss');
    }
    const aiBtn = document.getElementById('btn-ai-toggle');
    if (aiBtn) {
      const isRunning = this.aiBot && this.aiBot.isRunning;
      const textEl = aiBtn.querySelector('.btn-text');
      if (textEl) textEl.textContent = isRunning ? t('btn_ai_active') : t('btn_ai');
    }
    const muteBtn = document.getElementById('btn-sound-toggle');
    if (muteBtn) {
      const sfxLabel = document.getElementById('label-sfx');
      if (sfxLabel) sfxLabel.textContent = soundManager.muted ? t('btn_sfx_off') : t('btn_sfx');
    }
    const bgmBtn = document.getElementById('btn-bgm-toggle');
    if (bgmBtn) {
      const bgmLabel = document.getElementById('label-bgm');
      if (bgmLabel) bgmLabel.textContent = soundManager.bgmPlaying ? t('btn_bgm_on') : t('btn_bgm_off');
    }
    if (this.rushToggleBtn) {
      const textEl = this.rushToggleBtn.querySelector('.btn-text');
      if (textEl) textEl.textContent = t('btn_rush') || 'Đua giờ';
    }
  }

  spawnSpecificTile(l, r, c, value) {
    const tile3D = new Tile3D(l, r, c, value, this.sceneManager.scene, this.currentShape, false, 0);
    this.tiles3D[l][r][c] = tile3D;
    this.gameLogic.setTile(l, r, c, { value, id: tile3D.id, isBomb: false, bombCountdown: 0 });
    tile3D.spawnAnimation();
    return tile3D;
  }

  initInput() {
    this.inputManager = new InputManager(
      this.container,
      (direction) => this.handleMove(direction),
      {
        hint: () => this.handleSpellHint(),
        undo: () => this.handleSpellUndo(),
        swap: () => this.handleSpellSwap(),
        cancel: () => this.cancelSwapMode()
      },
      (clientX, clientY) => this.handleCanvasClick(clientX, clientY),
      (preset) => this.sceneManager.snapCamera(preset),
      () => this.cycleSliceMode()
    );

    this.container.addEventListener('pointermove', (e) => {
      if (!this.isSwapMode || this.isAnimating) return;
      this.handleCanvasPointerMove(e.clientX, e.clientY);
    });

    this.container.addEventListener('pointerleave', () => {
      if (this.hoveredTile) {
        if (this.hoveredTile !== this.swapSelectedTile) {
          this.hoveredTile.setHovered(false);
        }
        this.hoveredTile = null;
      }
    });

    this.setupDirPad();
    this.setupCameraSnapBar();
    this.setupSliceControls();
    this.setupDemoSwitcher();
  }

  setupDemoSwitcher() {
    this.setupSystemThemeListener();

    document.querySelectorAll('.demo-switch-btn[data-theme]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const theme = btn.dataset.theme;
        this.setThemePreference(theme);
      });
    });

    const closeDemoBtn = document.getElementById('btn-close-demo');
    if (closeDemoBtn) {
      closeDemoBtn.addEventListener('click', () => {
        const bar = document.getElementById('demo-theme-switcher');
        if (bar) bar.style.display = 'none';
      });
    }

    this.updateDemoSwitcherUI();
  }

  setThemePreference(pref) {
    this.themePreference = pref;
    try {
      localStorage.setItem('3d2048_theme_pref', pref);
      localStorage.setItem('3d2048_theme', pref);
    } catch {}

    let targetTheme = pref;
    if (pref === 'system') {
      const isDark = (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
      targetTheme = isDark ? 'gentle_dark' : 'gentle_light';
      this.showSpellToast(`THEO MÁY: ${isDark ? 'Tối Hiền Hòa' : 'Sáng Hiền Hòa'}`);
    } else if (pref === 'gentle_light' || pref === 'zen_clay') {
      targetTheme = 'gentle_light';
      this.showSpellToast('GIAO DIỆN: Sáng Hiền Hòa');
    } else if (pref === 'gentle_dark' || pref === 'modern_slate') {
      targetTheme = 'gentle_dark';
      this.showSpellToast('GIAO DIỆN: Tối Hiền Hòa');
    } else {
      const themeSelect = document.getElementById('select-theme');
      const label = themeSelect && themeSelect.selectedOptions && themeSelect.selectedOptions[0] ? themeSelect.selectedOptions[0].text : pref;
      this.showSpellToast(`HÌNH NỀN: ${label}`);
    }

    this.switchTheme(targetTheme);
    this.updateDemoSwitcherUI();

    const themeSelect = document.getElementById('select-theme');
    if (themeSelect) themeSelect.value = pref;
    this.registerInteraction();
  }

  updateDemoSwitcherUI() {
    const buttons = document.querySelectorAll('.demo-switch-btn[data-theme]');
    if (!buttons || buttons.length === 0) return;
    buttons.forEach(btn => {
      const t = btn.dataset.theme;
      if (t === 'system') {
        btn.classList.toggle('active', this.themePreference === 'system');
      } else {
        const isActive = (this.themePreference === t) ||
                         (this.themePreference === 'system' && this.currentTheme === t);
        btn.classList.toggle('active', isActive);
      }
    });
  }

  setupSystemThemeListener() {
    if (!window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSchemeChange = (e) => {
      if (this.themePreference === 'system') {
        const newTheme = e.matches ? 'gentle_dark' : 'gentle_light';
        console.log(`🌓 Trình duyệt đổi giao diện sang: ${e.matches ? 'TỐI' : 'SÁNG'} -> Áp dụng ${newTheme}`);
        this.switchTheme(newTheme);
        this.updateDemoSwitcherUI();
      }
    };
    try {
      mediaQuery.addEventListener('change', handleSchemeChange);
    } catch {
      mediaQuery.addListener(handleSchemeChange);
    }
  }

  setupDirPad() {
    const dirPad = document.getElementById('dir-pad');
    if (!dirPad) return;

    dirPad.querySelectorAll('.dpad-btn[data-dir]').forEach(btn => {
      const dir = btn.dataset.dir;

      // Ghost preview on hover & pointer
      btn.addEventListener('pointerenter', () => {
        if (dir !== 'iso' && this.ghostPreview) {
          this.ghostPreview.showGhost(dir);
        }
      });
      btn.addEventListener('pointerleave', () => {
        if (this.ghostPreview) this.ghostPreview.hideGhost();
      });
      btn.addEventListener('pointercancel', () => {
        if (this.ghostPreview) this.ghostPreview.hideGhost();
      });

      // Click / tap to move
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.ghostPreview) this.ghostPreview.hideGhost();
        if (!this.inputManager.enabled) return;
        if (dir === 'iso') {
          this.sceneManager.snapCamera(1);
        } else {
          this.handleMove(dir);
        }
      });
    });
  }

  setupCameraSnapBar() {
    const bar = document.getElementById('camera-snap-bar');
    if (!bar) return;
    bar.querySelectorAll('.cam-btn[data-preset]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const preset = parseInt(btn.dataset.preset, 10);
        this.sceneManager.snapCamera(preset);
        this.registerInteraction();
      });
    });
  }

  setupSliceControls() {
    const bar = document.getElementById('slice-controls');
    if (!bar) return;
    bar.querySelectorAll('.slice-btn[data-slice]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const val = btn.dataset.slice;
        const parsed = (val === 'all' || val === 'exploded') ? val : parseInt(val, 10);
        this.setSliceMode(parsed);
        this.registerInteraction();
      });
    });
  }

  initGhostPreview() {
    this.ghostPreview = new GhostPreview(this.sceneManager.scene, this.gameLogic);
  }

  findTileFromPoint(clientX, clientY) {
    if (!this.container || !this.sceneManager || !this.sceneManager.camera) return null;
    const rect = this.container.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return null;
    const x = ((clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), this.sceneManager.camera);

    const tileGroups = [];
    for (let l = 0; l < this.tiles3D.length; l++) {
      for (let r = 0; r < this.tiles3D[l].length; r++) {
        for (let c = 0; c < this.tiles3D[l][r].length; c++) {
          const tile = this.tiles3D[l][r][c];
          if (tile && tile.group) {
            tileGroups.push(tile.group);
          }
        }
      }
    }

    const intersects = raycaster.intersectObjects(tileGroups, true);
    if (intersects.length === 0) return null;

    for (let i = 0; i < intersects.length; i++) {
      let obj = intersects[i].object;
      while (obj) {
        if (obj.userData && obj.userData.tileInstance) {
          return obj.userData.tileInstance;
        }
        obj = obj.parent;
      }
    }
    return null;
  }

  handleCanvasPointerMove(clientX, clientY) {
    if (!this.isSwapMode || this.isAnimating || this.gameLogic.gameOver) return;

    const hitTile = this.findTileFromPoint(clientX, clientY);

    if (hitTile !== this.hoveredTile) {
      if (this.hoveredTile && this.hoveredTile !== this.swapSelectedTile) {
        this.hoveredTile.setHovered(false);
      }
      this.hoveredTile = hitTile;
      if (hitTile && hitTile !== this.swapSelectedTile) {
        hitTile.setHovered(true);
      }
    }
  }

  updateScoreUI(addedScore = 0) {
    this.scoreEl.textContent = this.gameLogic.score;
    this.bestScoreEl.textContent = this.gameLogic.bestScore;

    if (addedScore > 0) {
      this.scoreBadge.classList.remove('score-bump');
      void this.scoreBadge.offsetWidth;
      this.scoreBadge.classList.add('score-bump');
    }
  }

  cleanAllSceneTiles() {
    // 1. Dispose all tiles tracked in this.tiles3D
    if (this.tiles3D) {
      for (let l = 0; l < this.tiles3D.length; l++) {
        for (let r = 0; r < this.tiles3D[l].length; r++) {
          for (let c = 0; c < this.tiles3D[l][r].length; c++) {
            if (this.tiles3D[l][r][c]) {
              this.tiles3D[l][r][c].dispose(true);
              this.tiles3D[l][r][c] = null;
            }
          }
        }
      }
    }

    // 2. Safety sweep: sweep the Three.js scene for ANY orphaned Tile3D groups
    const orphanedTileGroups = [];
    this.sceneManager.scene.children.forEach(child => {
      if (child.userData && child.userData.isTile3D) {
        orphanedTileGroups.push(child);
      }
    });

    orphanedTileGroups.forEach(grp => {
      gsap.killTweensOf(grp);
      gsap.killTweensOf(grp.position);
      gsap.killTweensOf(grp.scale);
      gsap.killTweensOf(grp.rotation);
      if (grp.userData && grp.userData.tileInstance) {
        grp.userData.tileInstance.dispose(true);
      }
      if (grp.parent) {
        grp.parent.remove(grp);
      }
    });
  }

  saveGameState() {
    try {
      if (this.gameLogic.gameOver) {
        this.clearSavedGameState();
        return;
      }
      const state = this.gameLogic.serializeState();
      state.rushTime = this.rushTime;
      state.moveCount = this.moveCount;
      state.elapsedSeconds = Math.round((Date.now() - this.matchStartTime) / 1000);
      state.maxTileValue = this.maxTileValue;
      state.mergeCount = this.mergeCount;
      state.mergeTierCounts = this.mergeTierCounts;
      localStorage.setItem(`3d2048_saved_${this.mode}`, JSON.stringify(state));
    } catch {}
  }

  clearSavedGameState() {
    try {
      localStorage.removeItem(`3d2048_saved_${this.mode}`);
    } catch {}
  }

  restoreSavedGame() {
    try {
      const raw = localStorage.getItem(`3d2048_saved_${this.mode}`);
      if (!raw) return false;
      const data = JSON.parse(raw);
      if (!data || !data.grid || data.gameOver) return false;

      let tileCount = 0;
      data.grid.forEach(layer => layer.forEach(row => row.forEach(c => { if (c) tileCount++; })));
      if (tileCount === 0) return false;

      this.cleanAllSceneTiles();
      this.tiles3D = this.createEmptyTileGrid();
      this.particleSystem.clear();

      this.gameLogic.deserializeState(data);
      this.rushTime = data.rushTime || 30.0;
      this.moveCount = data.moveCount || 0;
      this.elapsedSeconds = data.elapsedSeconds || 0;
      this.matchStartTime = Date.now() - (this.elapsedSeconds * 1000);
      this.maxTileValue = data.maxTileValue || 2;
      this.mergeCount = data.mergeCount || 0;
      this.mergeTierCounts = data.mergeTierCounts || {};

      for (let l = 0; l < data.grid.length; l++) {
        for (let r = 0; r < data.grid[l].length; r++) {
          for (let c = 0; c < data.grid[l][r].length; c++) {
            const cell = data.grid[l][r][c];
            if (cell) {
              const tile3D = new Tile3D(l, r, c, cell.value, this.sceneManager.scene, this.currentShape, cell.isBomb, cell.bombCountdown);
              this.tiles3D[l][r][c] = tile3D;
              this.gameLogic.setTile(l, r, c, { value: cell.value, id: tile3D.id, isBomb: cell.isBomb, bombCountdown: cell.bombCountdown });
              tile3D.spawnAnimation();
              this.maxTileValue = Math.max(this.maxTileValue, cell.value);
            }
          }
        }
      }

      this.updateScoreUI();
      this.updateSpellUI();
      this.showSpellToast(t('toast_restore_saved'));

      if (!this.gameLogic.hasValidMoves()) {
        setTimeout(() => {
          this.triggerGameOverModal();
        }, 300);
      }
      return true;
    } catch (e) {
      console.warn('Could not restore saved game:', e);
      return false;
    }
  }

  setGraphicsQuality(quality) {
    this.graphicsQuality = quality;
    this.targetFps = quality === 'low' ? '30' : quality === 'medium' ? '60' : '120';
    try {
      localStorage.setItem('3d2048_graphics_quality', quality);
      localStorage.setItem('3d2048_target_fps', this.targetFps);
    } catch {}

    if (this.graphicsSelect && this.graphicsSelect.value !== quality) {
      this.graphicsSelect.value = quality;
    }
    if (this.fpsSelect && this.fpsSelect.value !== this.targetFps) {
      this.fpsSelect.value = this.targetFps;
    }

    if (this.sceneManager && this.sceneManager.setGraphicsQuality) {
      this.sceneManager.setGraphicsQuality(quality);
    }

    const labelKey = quality === 'high' ? 'graphics_high' : quality === 'medium' ? 'graphics_medium' : 'graphics_low';
    const labelText = t(labelKey) || quality.toUpperCase();
    this.showSpellToast(`🎮 ${t('setting_graphics') || 'Đồ họa & FPS'}: ${labelText}`);
    this.registerInteraction();
  }

  setupShareModal() {
    const modal = document.getElementById('share-modal');
    if (!modal) return;

    const closeBtn = document.getElementById('btn-close-share');
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.closeShareModal();
      });
    }

    modal.addEventListener('click', (e) => {
      if (e.target === modal) this.closeShareModal();
    });

    modal.querySelectorAll('.share-app-btn[data-app]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const app = btn.dataset.app;
        this.executeShare(app);
      });
    });

    // 1-Tap Viral Challenge Copy (Zalo / Telegram / Chat Groups)
    const copyChallengeBtn = document.getElementById('btn-copy-challenge');
    if (copyChallengeBtn) {
      copyChallengeBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        this.registerInteraction();
        soundManager.playClick();
        soundManager.triggerHaptic('click');

        const score = this.gameLogic ? this.gameLogic.score : 0;
        let maxTileVal = this.maxTileValue || 2;
        if (this.tiles3D) {
          for (let l = 0; l < this.tiles3D.length; l++) {
            for (let r = 0; r < this.tiles3D[l].length; r++) {
              for (let c = 0; c < this.tiles3D[l][r].length; c++) {
                if (this.tiles3D[l][r][c] && this.tiles3D[l][r][c].value > maxTileVal) {
                  maxTileVal = this.tiles3D[l][r][c].value;
                }
              }
            }
          }
        }
        const modeName = this.mode === '3x3x3' ? '3x3x3 Hypercube' : '4x4 Classic';
        const shareUrl = window.location.href.split('?')[0].split('#')[0] || 'https://bachlinhphong-glitch.github.io/3d-2048-hypercube/';
        
        const challengeText = `⚡ THÁCH ĐẤU 2048 KHÔNG GIAN 3D ⚡\n🏆 Điểm kỷ lục: ${Number(score).toLocaleString()} điểm (${modeName})\n💎 Khối đỉnh cao: ${maxTileVal}\n🎯 Bạn có vượt qua được kỷ lục này không?\n👉 Bấm vào chơi ngay (không cần cài đặt):\n${shareUrl}`;

        try {
          await navigator.clipboard.writeText(challengeText);
          this.showSpellToast(t('challenge_copied') || '⚡ Đã chép lời thách đấu! Dán ngay vào Zalo/Telegram để so tài!');
        } catch {
          this.showSpellToast(`🎮 ${shareUrl}`);
        }
        this.closeShareModal();
      });
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.style.display !== 'none') {
        this.closeShareModal();
      }
    });
  }

  openShareModal() {
    this.registerInteraction();
    const modal = document.getElementById('share-modal');
    if (!modal) return;

    const score = this.gameLogic ? this.gameLogic.score : 0;
    const modeName = this.mode === '3x3x3' ? '3x3x3 Hypercube' : '4x4 Classic';

    const scoreEl = document.getElementById('share-preview-score');
    const modeEl = document.getElementById('share-preview-mode');
    if (scoreEl) scoreEl.textContent = Number(score).toLocaleString();
    if (modeEl) modeEl.textContent = `Chế độ: ${modeName}`;

    // Update challenge snippet preview
    const challengeScoreEl = document.getElementById('challenge-score-val');
    const challengeTileEl = document.getElementById('challenge-tile-val');
    let maxTileVal = this.maxTileValue || 2;
    if (this.tiles3D) {
      for (let l = 0; l < this.tiles3D.length; l++) {
        for (let r = 0; r < this.tiles3D[l].length; r++) {
          for (let c = 0; c < this.tiles3D[l][r].length; c++) {
            if (this.tiles3D[l][r][c] && this.tiles3D[l][r][c].value > maxTileVal) {
              maxTileVal = this.tiles3D[l][r][c].value;
            }
          }
        }
      }
    }
    if (challengeScoreEl) challengeScoreEl.textContent = Number(score).toLocaleString();
    if (challengeTileEl) challengeTileEl.textContent = maxTileVal;

    modal.style.display = 'flex';
    requestAnimationFrame(() => {
      modal.classList.add('active');
    });
    soundManager.playClick();
  }

  closeShareModal() {
    const modal = document.getElementById('share-modal');
    if (modal) {
      modal.classList.remove('active');
      setTimeout(() => {
        if (!modal.classList.contains('active')) {
          modal.style.display = 'none';
        }
      }, 150);
      soundManager.playClick();
    }
  }

  async executeShare(app) {
    this.registerInteraction();
    const score = this.gameLogic ? this.gameLogic.score : 0;
    const modeName = this.mode === '3x3x3' ? '3x3x3 Hypercube' : '4x4 Classic';
    const shareText = `🎮 Tôi vừa đạt ${Number(score).toLocaleString()} điểm ở chế độ ${modeName} trong tựa game 3D 2048 & Hypercube! Bạn có vượt qua được không?`;
    const shareUrl = window.location.href.split('?')[0].split('#')[0] || 'https://bachlinhphong-glitch.github.io/3d-2048-hypercube/';

    let snapshotFile = null;
    try {
      if (this.sceneManager && this.sceneManager.captureSnapshotBlob) {
        const blob = await this.sceneManager.captureSnapshotBlob();
        if (blob) {
          snapshotFile = new File([blob], `2048-score-${score}.png`, { type: 'image/png' });
        }
      }
    } catch (e) {
      console.warn('Canvas snapshot error:', e);
    }

    switch (app) {
      case 'facebook': {
        const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
        window.open(fbUrl, '_blank', 'width=620,height=520,menubar=no,toolbar=no');
        break;
      }
      case 'zalo': {
        const zaloUrl = `https://sp.zalo.me/plugins/share?url=${encodeURIComponent(shareUrl)}`;
        window.open(zaloUrl, '_blank', 'width=620,height=520,menubar=no,toolbar=no');
        break;
      }
      case 'messenger': {
        const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
        if (isMobile) {
          window.location.href = `fb-messenger://share/?link=${encodeURIComponent(shareUrl)}`;
        } else {
          const msgrUrl = `https://www.facebook.com/dialog/send?link=${encodeURIComponent(shareUrl)}&app_id=291494419107518&redirect_uri=${encodeURIComponent(shareUrl)}`;
          window.open(msgrUrl, '_blank', 'width=620,height=520,menubar=no,toolbar=no');
        }
        break;
      }
      case 'telegram': {
        const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
        window.open(tgUrl, '_blank', 'width=620,height=520,menubar=no,toolbar=no');
        break;
      }
      case 'whatsapp': {
        const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
        window.open(waUrl, '_blank', 'width=620,height=520,menubar=no,toolbar=no');
        break;
      }
      case 'x': {
        const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        window.open(xUrl, '_blank', 'width=620,height=520,menubar=no,toolbar=no');
        break;
      }
      case 'reddit': {
        const redditUrl = `https://reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareText)}`;
        window.open(redditUrl, '_blank', 'width=700,height=600,menubar=no,toolbar=no');
        break;
      }
      case 'system': {
        if (navigator.share) {
          try {
            const shareData = {
              title: '3D 2048 & Hypercube WebGL',
              text: shareText,
              url: shareUrl
            };
            if (snapshotFile && navigator.canShare && navigator.canShare({ files: [snapshotFile] })) {
              shareData.files = [snapshotFile];
            }
            await navigator.share(shareData);
            this.showSpellToast(t('share_success') || 'Đã chia sẻ thành công!');
            this.closeShareModal();
            return;
          } catch (err) {
            if (err.name === 'AbortError') return;
            console.warn('System share error:', err);
          }
        }
        await this.copyShareLink(shareText, shareUrl);
        break;
      }
      case 'copy':
      default: {
        await this.copyShareLink(shareText, shareUrl);
        break;
      }
    }
  }

  async copyShareLink(shareText, shareUrl) {
    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      this.showSpellToast(t('toast_link_copied') || '📋 Đã sao chép liên kết vào bộ nhớ tạm!');
    } catch {
      this.showSpellToast(`🎮 ${shareUrl}`);
    }
    this.closeShareModal();
  }

  async shareScore() {
    this.openShareModal();
  }

  startNewGame(checkSaved = false) {
    if (this.aiBot) this.aiBot.stop();
    this.hideModal();
    this.cancelSwapMode();
    this.isAnimating = false;

    if (checkSaved && this.restoreSavedGame()) {
      this.isAnimating = false;
      return;
    }

    this.clearSavedGameState();

    // Reset match analytics
    this.moveCount = 0;
    this.matchStartTime = Date.now();
    this.elapsedSeconds = 0;
    this.maxTileValue = 2;
    this.mergeCount = 0;
    this.mergeTierCounts = {};
    if (this.celebratedMilestones) this.celebratedMilestones.clear();

    // Clean all 3D tiles from grid and scene
    this.cleanAllSceneTiles();

    this.tiles3D = this.createEmptyTileGrid();
    this.particleSystem.clear();
    this.gameLogic.reset();
    this.gameLogic.gameOver = false;
    this.rushTime = 30.0;
    this.updateScoreUI();
    this.updateSpellUI();

    // Spawn 2 initial tiles
    this.spawnTile();
    this.spawnTile();

    this.playBoardEntrance();

    if (this.isBossRaid && this.bossManager) {
      this.bossManager.startRaid();
    }

    this.saveGameState();
    this.isAnimating = false;
  }

  spawnTile() {
    const spawnInfo = this.gameLogic.getRandomSpawnInfo();
    if (!spawnInfo) return null;

    const { l, r, c, value, isBomb, bombCountdown } = spawnInfo;
    const tile3D = new Tile3D(l, r, c, value, this.sceneManager.scene, this.currentShape, isBomb, bombCountdown);
    this.tiles3D[l][r][c] = tile3D;
    this.gameLogic.setTile(l, r, c, { value, id: tile3D.id, isBomb, bombCountdown });

    tile3D.spawnAnimation();
    if (this.mode === '3x3x3' && typeof this.sliceMode === 'number') {
      tile3D.setSliceDim(l !== this.sliceMode);
    }
    this.sceneManager.requestShadowUpdate(20);
    if (isBomb) {
      soundManager.playBombTick();
    }
    return tile3D;
  }

  addRushTime(seconds) {
    this.rushTime = Math.min(this.maxRushTime, this.rushTime + seconds);
    soundManager.playTimeBonus();

    // Show floating +Time indicator
    if (this.rushFloatingContainer) {
      const floatEl = document.createElement('div');
      floatEl.className = 'floating-time-bonus';
      floatEl.textContent = `+${seconds.toFixed(1)}s`;
      this.rushFloatingContainer.appendChild(floatEl);
      setTimeout(() => floatEl.remove(), 900);
    }
  }

  // --- In-App Browser & Visual Juice Architecture (v6.6.0) ---

  detectInAppBrowser() {
    const ua = (navigator.userAgent || navigator.vendor || window.opera || '').toLowerCase();
    const isInApp = /zalo|telegram|fban|fbav|messenger|instagram|line|micromessenger|bytedance|tiktok|webview/i.test(ua);
    if (isInApp) {
      document.body.classList.add('in-app-browser');
    }
  }

  initFirstSwipeGuide() {
    if (this.firstSwipeGuideShown) return;
    this.firstSwipeGuideTimer = setTimeout(() => {
      if (this.moveCount === 0 && !this.firstSwipeGuideShown) {
        this.showFirstSwipeGuide();
      }
    }, 1400);
  }

  showFirstSwipeGuide() {
    if (this.firstSwipeGuideShown || this.moveCount > 0) return;
    this.firstSwipeGuideShown = true;
    if (!this.firstSwipeHandEl) return;
    this.firstSwipeHandEl.classList.remove('hidden');
    this.firstSwipeHandEl.removeAttribute('aria-hidden');
    gsap.killTweensOf(this.firstSwipeHandEl);
    gsap.fromTo(this.firstSwipeHandEl,
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 0.45, ease: 'power2.out' }
    );
  }

  dismissFirstSwipeGuide() {
    if (this.firstSwipeGuideTimer) {
      clearTimeout(this.firstSwipeGuideTimer);
      this.firstSwipeGuideTimer = null;
    }
    if (this.firstSwipeHandEl && !this.firstSwipeHandEl.classList.contains('hidden')) {
      gsap.killTweensOf(this.firstSwipeHandEl);
      gsap.to(this.firstSwipeHandEl, {
        opacity: 0,
        scale: 0.85,
        duration: 0.25,
        ease: 'power2.in',
        onComplete: () => {
          this.firstSwipeHandEl.classList.add('hidden');
          this.firstSwipeHandEl.setAttribute('aria-hidden', 'true');
        }
      });
    }
  }

  project3DToScreen(worldPos) {
    if (!this.sceneManager || !this.sceneManager.camera) return null;
    const p = worldPos.clone().project(this.sceneManager.camera);
    if (p.z > 1) return null;
    const x = (p.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-(p.y * 0.5) + 0.5) * window.innerHeight;
    return { x, y };
  }

  spawnFloatingScore(text, screenPos, value = 4) {
    if (!this.floatingScoreContainer || !screenPos) return;
    const el = document.createElement('div');
    el.className = 'floating-score-item';
    el.textContent = text;

    if (value >= 1024) el.classList.add('tier-gold');
    else if (value >= 256) el.classList.add('tier-magenta');
    else if (value >= 64) el.classList.add('tier-cyan');

    const jitterX = (Math.random() - 0.5) * 20;
    const jitterY = (Math.random() - 0.5) * 10;
    el.style.left = `${screenPos.x + jitterX}px`;
    el.style.top = `${screenPos.y + jitterY}px`;

    this.floatingScoreContainer.appendChild(el);

    gsap.fromTo(el,
      { scale: 0.55, opacity: 1, y: 0 },
      {
        scale: value >= 256 ? 1.4 : 1.15,
        opacity: 0,
        y: -52,
        duration: 0.88,
        ease: 'power2.out',
        onComplete: () => el.remove()
      }
    );
  }

  showComboCallout(count) {
    if (!this.comboCalloutEl) return;
    let text = '';
    let cls = 'combo-x2';
    if (count === 2) {
      text = t('combo_2') || 'Combo x2 🔥';
    } else if (count === 3) {
      text = t('combo_3') || 'Siêu Combo x3 ⚡';
      cls = 'combo-x3';
    } else if (count === 4) {
      text = t('combo_4') || 'Bùng Nổ x4 💥';
      cls = 'combo-x4';
    } else {
      const raw = t('combo_5') || 'Thần Thoại x{n} 🌟';
      text = raw.replace('{n}', count);
      cls = 'combo-x5';
    }

    this.comboCalloutEl.className = `combo-callout ${cls}`;
    this.comboCalloutEl.textContent = text;
    this.comboCalloutEl.classList.remove('hidden');
    this.comboCalloutEl.removeAttribute('aria-hidden');

    gsap.killTweensOf(this.comboCalloutEl);
    gsap.fromTo(this.comboCalloutEl,
      { scale: 0.4, opacity: 0, y: 18 },
      { scale: 1, opacity: 1, y: 0, duration: 0.28, ease: 'back.out(2.2)' }
    );
    gsap.to(this.comboCalloutEl, {
      opacity: 0,
      y: -22,
      scale: 0.92,
      duration: 0.35,
      delay: 1.15,
      ease: 'power2.in',
      onComplete: () => {
        this.comboCalloutEl.classList.add('hidden');
        this.comboCalloutEl.setAttribute('aria-hidden', 'true');
      }
    });
  }

  showMilestoneCelebration(value) {
    soundManager.playMilestoneUnlock(value);
    
    // Trigger sparkling milestone confetti
    if (this.particleSystem) {
      const burstCount = value >= 1024 ? 4 : (value >= 256 ? 3 : 2);
      for (let b = 0; b < burstCount; b++) {
        this.particleSystem.burst(0, 1.2 + 0.4 * b, 0, value);
      }
    }

    if (!this.milestoneBannerEl) return;
    const title = t('milestone_title') || 'CỘT MỐC MỚI!';
    const rawDesc = t('milestone_desc') || 'Mở khóa khối {val} thành công!';
    const desc = rawDesc.replace('{val}', value);

    this.milestoneBannerEl.innerHTML = `
      <div class="milestone-icon">🌟</div>
      <div class="milestone-body">
        <div class="milestone-title">${title}</div>
        <div class="milestone-desc">${desc}</div>
      </div>
      <div class="milestone-val">${value}</div>
    `;
    this.milestoneBannerEl.classList.remove('hidden');
    this.milestoneBannerEl.removeAttribute('aria-hidden');

    gsap.killTweensOf(this.milestoneBannerEl);
    gsap.fromTo(this.milestoneBannerEl,
      { y: -70, opacity: 0, scale: 0.85 },
      { y: 0, opacity: 1, scale: 1, duration: 0.42, ease: 'back.out(1.8)' }
    );
    gsap.to(this.milestoneBannerEl, {
      y: -65,
      opacity: 0,
      scale: 0.9,
      duration: 0.38,
      delay: 2.2,
      ease: 'power2.in',
      onComplete: () => {
        this.milestoneBannerEl.classList.add('hidden');
        this.milestoneBannerEl.setAttribute('aria-hidden', 'true');
      }
    });
  }

  playBoardEntrance() {
    if (!this.board || !this.board.group) return;
    gsap.killTweensOf(this.board.group.position);
    gsap.fromTo(this.board.group.position,
      { y: 2.5 },
      { y: 0, duration: 0.72, ease: 'back.out(1.5)' }
    );
    if (this.tiles3D) {
      for (let l = 0; l < this.tiles3D.length; l++) {
        for (let r = 0; r < this.tiles3D[l].length; r++) {
          for (let c = 0; c < this.tiles3D[l][r].length; c++) {
            const tile = this.tiles3D[l][r][c];
            if (tile && tile.group) {
              const pos = getGridPosition(l, r, c);
              gsap.killTweensOf(tile.group.position);
              gsap.fromTo(tile.group.position,
                { y: pos.y + 2.5 },
                { y: pos.y, duration: 0.72, ease: 'back.out(1.5)', delay: 0.04 }
              );
            }
          }
        }
      }
    }
  }

  async handleMove(direction) {
    this.registerInteraction();
    this.dismissFirstSwipeGuide();
    if (this.ghostPreview) this.ghostPreview.hideGhost();
    if (this.isAnimating) return;
    if (this.isSwapMode) {
      this.cancelSwapMode();
    }

    if (this.gameLogic.gameOver || !this.gameLogic.hasValidMoves()) {
      this.triggerGameOverModal();
      return;
    }

    const result = this.gameLogic.move(direction);
    if (!result.moved) {
      if (!this.gameLogic.hasValidMoves()) {
        this.triggerGameOverModal();
      }
      return;
    }

    this.isAnimating = true;
    this.moveCount++;
    this.comboCount = 0; // Reset combo per move
    this.recentMoves.push(performance.now());
    this.sceneManager.requestShadowUpdate(25);

    if (direction === 'layerUp' || direction === 'layerDown') {
      soundManager.playLayerMove(direction === 'layerUp' ? 'up' : 'down');
    } else {
      soundManager.playSlide();
    }

    const slideDuration = 0.16;
    const animations = [];
    const mergesToProcess = [];

    // Clone old tiles3D
    const oldTiles3D = this.tiles3D.map(layer => layer.map(row => [...row]));
    this.tiles3D = this.createEmptyTileGrid();

    result.movements.forEach(m => {
      const tile3D = oldTiles3D[m.from.l][m.from.r][m.from.c];
      if (!tile3D) return;

      if (!m.mergedInto) {
        this.tiles3D[m.to.l][m.to.r][m.to.c] = tile3D;
        animations.push(tile3D.slideTo(m.to.l, m.to.r, m.to.c, slideDuration));
      } else {
        animations.push(tile3D.slideTo(m.to.l, m.to.r, m.to.c, slideDuration));
        mergesToProcess.push({
          sourceTile: tile3D,
          targetL: m.to.l,
          targetR: m.to.r,
          targetC: m.to.c,
          newValue: m.newValue
        });
      }
    });

    // Place unmoved tiles
    for (let l = 0; l < this.gameLogic.layers; l++) {
      for (let r = 0; r < this.gameLogic.rows; r++) {
        for (let c = 0; c < this.gameLogic.cols; c++) {
          const logicTile = this.gameLogic.grid[l][r][c];
          if (logicTile && !this.tiles3D[l][r][c]) {
            const unchanged = oldTiles3D[l][r][c];
            if (unchanged && unchanged.id === logicTile.id) {
              this.tiles3D[l][r][c] = unchanged;
            } else if (unchanged && unchanged.value === logicTile.value) {
              // Self-healing fallback: sync ID
              logicTile.id = unchanged.id;
              this.tiles3D[l][r][c] = unchanged;
            } else if (logicTile) {
              // Resilient spawn if tile was somehow missing
              const freshTile = new Tile3D(l, r, c, logicTile.value, this.sceneManager.scene, this.currentShape, logicTile.isBomb, logicTile.bombCountdown);
              freshTile.group.scale.set(1, 1, 1);
              this.tiles3D[l][r][c] = freshTile;
              logicTile.id = freshTile.id;
            }
          }
        }
      }
    }

    // Safety sweep: ensure any tile from oldTiles3D not preserved or merged is explicitly disposed
    const activeTileSet = new Set();
    for (let l = 0; l < this.gameLogic.layers; l++) {
      for (let r = 0; r < this.gameLogic.rows; r++) {
        for (let c = 0; c < this.gameLogic.cols; c++) {
          if (this.tiles3D[l][r][c]) activeTileSet.add(this.tiles3D[l][r][c]);
        }
      }
    }
    mergesToProcess.forEach(m => activeTileSet.add(m.sourceTile));

    for (let l = 0; l < oldTiles3D.length; l++) {
      for (let r = 0; r < oldTiles3D[l].length; r++) {
        for (let c = 0; c < oldTiles3D[l][r].length; c++) {
          const oldT = oldTiles3D[l][r][c];
          if (oldT && !activeTileSet.has(oldT)) {
            oldT.dispose(true);
          }
        }
      }
    }

    await Promise.all(animations);

    // Process merges
    let maxMergedVal = 0;
    mergesToProcess.forEach(m => {
      const surviving = this.tiles3D[m.targetL][m.targetR][m.targetC];
      maxMergedVal = Math.max(maxMergedVal, m.newValue);
      this.mergeCount++;
      this.maxTileValue = Math.max(this.maxTileValue, m.newValue);
      this.mergeTierCounts[m.newValue] = (this.mergeTierCounts[m.newValue] || 0) + 1;

      if (surviving && surviving !== m.sourceTile) {
        m.sourceTile.dispose(true);
        surviving.upgradeTo(m.newValue);

        this.comboCount++;
        const pos = getGridPosition(m.targetL, m.targetR, m.targetC);
        const burstCount = m.newValue >= 512 ? 3 : 1;
        for (let b = 0; b < burstCount; b++) {
          this.particleSystem.burst(pos.x, pos.y + 0.5 * b, pos.z, m.newValue);
        }
        soundManager.playMerge(m.newValue, this.comboCount);
        if (m.newValue >= 512) {
          this.particleSystem.screenShake(this.sceneManager.camera, 0.18);
        }
        if (this.isBossRaid && this.bossManager) {
          this.bossManager.onTileMerge(m.newValue, { l: m.targetL, r: m.targetR, c: m.targetC });
        }

        // 3D Floating Score Popup
        const screenPos = this.project3DToScreen(new THREE.Vector3(pos.x, pos.y + 0.6, pos.z));
        this.spawnFloatingScore(`+${m.newValue}`, screenPos, m.newValue);

        // Milestone Unlock Celebration
        if (m.newValue >= 64 && !this.celebratedMilestones.has(m.newValue)) {
          this.celebratedMilestones.add(m.newValue);
          this.showMilestoneCelebration(m.newValue);
        }
      } else if (!surviving) {
        this.tiles3D[m.targetL][m.targetR][m.targetC] = m.sourceTile;
        m.sourceTile.upgradeTo(m.newValue);

        this.comboCount++;
        const pos = getGridPosition(m.targetL, m.targetR, m.targetC);
        const burstCount = m.newValue >= 512 ? 3 : 1;
        for (let b = 0; b < burstCount; b++) {
          this.particleSystem.burst(pos.x, pos.y + 0.5 * b, pos.z, m.newValue);
        }
        soundManager.playMerge(m.newValue, this.comboCount);
        if (m.newValue >= 512) {
          this.particleSystem.screenShake(this.sceneManager.camera, 0.18);
        }
        if (this.isBossRaid && this.bossManager) {
          this.bossManager.onTileMerge(m.newValue, { l: m.targetL, r: m.targetR, c: m.targetC });
        }

        // 3D Floating Score Popup
        const screenPos = this.project3DToScreen(new THREE.Vector3(pos.x, pos.y + 0.6, pos.z));
        this.spawnFloatingScore(`+${m.newValue}`, screenPos, m.newValue);

        // Milestone Unlock Celebration
        if (m.newValue >= 64 && !this.celebratedMilestones.has(m.newValue)) {
          this.celebratedMilestones.add(m.newValue);
          this.showMilestoneCelebration(m.newValue);
        }
      }
    });

    // Show Combo Streak Callout
    if (this.comboCount >= 2) {
      this.showComboCallout(this.comboCount);
    }

    // Screen Shake on big merge (or if in Hyper Neon)
    if (maxMergedVal >= 64 || (this.currentTheme === 'neon' && maxMergedVal >= 32)) {
      this.particleSystem.screenShake(this.sceneManager.camera, maxMergedVal >= 128 ? 0.35 : 0.2);
    }

    // Record move merges and max tile value into QuestManager
    if (this.questManager) {
      let currentMaxTile = 0;
      for (let l = 0; l < this.tiles3D.length; l++) {
        for (let r = 0; r < this.tiles3D[l].length; r++) {
          for (let c = 0; c < this.tiles3D[l][r].length; c++) {
            const tile = this.tiles3D[l][r][c];
            if (tile && tile.value > currentMaxTile) {
              currentMaxTile = tile.value;
            }
          }
        }
      }
      this.questManager.recordMoveMergesAndTiles(this.comboCount, Math.max(maxMergedVal, currentMaxTile));
      if (this.isRushMode) {
        this.questManager.recordRushScore(this.gameLogic.score);
      }
      this.updateTrophyMascot();
    }

    // Rush mode time additions for merges
    if (this.isRushMode && maxMergedVal > 0) {
      if (maxMergedVal <= 8) this.addRushTime(0.8);
      else if (maxMergedVal <= 64) this.addRushTime(2.0);
      else this.addRushTime(4.0);
    }

    // Process Bomb Events in Rush Mode
    if (this.isRushMode) {
      if (result.defusedBombs > 0) {
        soundManager.playBombDefused();
        this.addRushTime(3.0 * result.defusedBombs);
      }
      if (result.explodedBombs && result.explodedBombs.length > 0) {
        soundManager.playBombExplode();
        this.rushTime = Math.max(0, this.rushTime - 5.0 * result.explodedBombs.length);
        this.particleSystem.screenShake(this.sceneManager.camera, 0.45);
      }

      // Update remaining bombs visually
      for (let l = 0; l < this.tiles3D.length; l++) {
        for (let r = 0; r < this.tiles3D[l].length; r++) {
          for (let c = 0; c < this.tiles3D[l][r].length; c++) {
            const tile = this.tiles3D[l][r][c];
            const logicTile = this.gameLogic.grid[l][r][c];
            if (tile && logicTile) {
              tile.setBombState(logicTile.isBomb, logicTile.bombCountdown);
            }
          }
        }
      }
    }

    this.updateScoreUI(result.scoreAdded);
    if (result.spellRecharged) {
      this.triggerSpellRecharge(result.milestoneAchieved);
    }
    await new Promise(r => setTimeout(r, 60));

    this.spawnTile();

    // Check game over right after the new tile has been placed on the grid
    const isGameOver = !this.gameLogic.hasValidMoves();
    this.gameLogic.gameOver = isGameOver;

    if (result.won) {
      soundManager.playWin();
      this.saveGameState();
      this.showModal({
        title: `🎉 ${t('modal_victory_title')}`,
        message: t('modal_victory_msg'),
        primaryText: t('modal_btn_continue'),
        secondaryText: t('modal_btn_new_game'),
        onPrimary: () => {
          this.gameLogic.keepPlaying = true;
          this.hideModal();
          this.isAnimating = false;
        },
        onSecondary: () => {
          this.startNewGame();
        }
      });
      return;
    }

    if (isGameOver) {
      this.triggerGameOverModal();
      return;
    }

    this.saveGameState();
    this.isAnimating = false;
  }

  triggerGameOverModal(customMessage) {
    this.gameLogic.gameOver = true;
    this.isAnimating = false; // UNFREEZE IMMEDIATELY
    if (this.aiBot) this.aiBot.stop();
    if (this.isBossRaid && this.bossManager) {
      this.bossManager.isDefeated = true;
    }
    soundManager.playGameOver();
    this.clearSavedGameState();

    const msg = customMessage || `${t('modal_gameover_msg')}\n${t('score')}: ${this.gameLogic.score.toLocaleString()}`;
    this.showModal({
      title: t('modal_gameover_title') || 'THẤT BẠI (GAME OVER)',
      message: msg,
      primaryText: t('modal_btn_continue') || 'Chơi lại ngay',
      secondaryText: t('modal_btn_new_game') || 'Ván mới',
      onPrimary: () => {
        this.hideModal();
        this.isAnimating = false;
        this.startNewGame(false);
      },
      onSecondary: () => {
        this.hideModal();
        this.isAnimating = false;
        if (this.isBossRaid) {
          this.toggleBossRaid();
        }
        this.startNewGame(false);
      }
    });
  }

  showModal({ title, message, primaryText, secondaryText, onPrimary, onSecondary }) {
    this.modalTitle.textContent = title;
    this.modalMessage.textContent = message;

    // Update Match Analytics UI in Modal
    const totalSecs = Math.max(1, Math.round((Date.now() - this.matchStartTime) / 1000));
    const mins = Math.floor(totalSecs / 60).toString().padStart(2, '0');
    const secs = (totalSecs % 60).toString().padStart(2, '0');
    const apm = ((this.moveCount / totalSecs) * 60).toFixed(1);

    const timeEl = document.getElementById('modal-stat-time');
    if (timeEl) timeEl.textContent = `${mins}:${secs}`;
    const movesEl = document.getElementById('modal-stat-moves');
    if (movesEl) movesEl.textContent = `${this.moveCount}`;
    const apmEl = document.getElementById('modal-stat-apm');
    if (apmEl) apmEl.textContent = `${apm}`;
    const maxTileEl = document.getElementById('modal-stat-max-tile');
    if (maxTileEl) maxTileEl.textContent = `${this.maxTileValue}`;

    const spanPri = this.modalBtnPrimary.querySelector('span');
    if (spanPri) {
      spanPri.textContent = primaryText || t('modal_btn_continue');
    } else {
      this.modalBtnPrimary.textContent = primaryText || t('modal_btn_continue');
    }

    this.modalBtnPrimary.onclick = (e) => {
      if (e) e.stopPropagation();
      this.hideModal();
      this.isAnimating = false;
      if (onPrimary) onPrimary();
    };

    if (secondaryText) {
      const spanSec = this.modalBtnSecondary.querySelector('span');
      if (spanSec) {
        spanSec.textContent = secondaryText;
      } else {
        this.modalBtnSecondary.textContent = secondaryText;
      }
      this.modalBtnSecondary.style.display = 'inline-flex';
      this.modalBtnSecondary.onclick = (e) => {
        if (e) e.stopPropagation();
        this.hideModal();
        this.isAnimating = false;
        if (onSecondary) onSecondary();
      };
    } else {
      this.modalBtnSecondary.style.display = 'none';
    }

    this.modalOverlay.style.setProperty('display', 'flex', 'important');
    this.modalOverlay.style.setProperty('pointer-events', 'auto', 'important');
    this.modalOverlay.classList.add('active');
  }

  hideModal() {
    this.modalOverlay.classList.remove('active');
    this.modalOverlay.style.setProperty('pointer-events', 'none', 'important');
    setTimeout(() => {
      if (!this.modalOverlay.classList.contains('active')) {
        this.modalOverlay.style.setProperty('display', 'none', 'important');
      }
    }, 240);
    this.isAnimating = false;
  }

  updateSpellUI() {
    const spellTypes = ['hint', 'undo', 'swap'];
    const spellNames = { hint: 'Hint', undo: 'Undo', swap: 'Swap' };

    spellTypes.forEach(type => {
      const status = this.gameLogic.getSpellStatus(type);
      const spell = this.gameLogic.spells[type];
      const remaining = Math.max(0, this.gameLogic.maxSpellUses - (spell ? spell.used : 0));
      const btn = this[`btnSpell${spellNames[type]}`];
      const badge = this[`badgeSpell${spellNames[type]}`];

      if (btn) {
        btn.classList.toggle('depleted', status === 'depleted');
        btn.classList.toggle('in-cooldown', status === 'cooldown');
        btn.classList.toggle('ready', status === 'ready');
        if (type === 'swap') {
          btn.classList.toggle('active-swap', this.isSwapMode);
        }

        if (status === 'depleted') {
          btn.title = 'Đã hết lượt trong ván này (tối đa 2 lần/game)';
        } else if (status === 'cooldown') {
          btn.title = `Đang hồi chiêu! Tạo khối [${this.gameLogic.nextRechargeMilestone}] để hồi chiêu.`;
        } else {
          btn.title = `Sẵn sàng sử dụng (Còn ${remaining}/${this.gameLogic.maxSpellUses} lần)`;
        }
      }

      if (badge) {
        if (status === 'depleted') {
          badge.textContent = '0';
          badge.title = 'Đã hết 2 lượt';
        } else if (status === 'cooldown') {
          badge.textContent = `⏱${this.gameLogic.nextRechargeMilestone}`;
          badge.title = `Cần khối ${this.gameLogic.nextRechargeMilestone} để hồi`;
        } else {
          badge.textContent = `${remaining}`;
          badge.title = `Còn ${remaining}/${this.gameLogic.maxSpellUses} lượt`;
        }
      }
    });
  }

  showSpellToast(text, isRecharge = false) {
    if (!this.spellToastEl) return;
    this.spellToastEl.textContent = text;
    this.spellToastEl.classList.toggle('recharge', isRecharge);
    this.spellToastEl.classList.add('active');

    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      if (this.spellToastEl) {
        this.spellToastEl.classList.remove('active');
      }
    }, 2800);
  }

  triggerSpellRecharge(milestone) {
    soundManager.playSpellRecharge();

    [this.btnSpellHint, this.btnSpellUndo, this.btnSpellSwap].forEach(btn => {
      if (btn) {
        btn.classList.remove('spell-recharge-anim');
        void btn.offsetWidth;
        btn.classList.add('spell-recharge-anim');
      }
    });

    this.showSpellToast(`⚡ HỒI CHIÊU: ĐẠT MỐC [${milestone}] ĐÃ HỒI LẠI KỸ NĂNG!`, true);
    this.updateSpellUI();
  }

  handleSpellHint() {
    if (this.isAnimating || this.gameLogic.gameOver) return;

    const status = this.gameLogic.getSpellStatus('hint');
    if (status === 'depleted') {
      this.showSpellToast('HẾT LƯỢT: Bạn đã dùng tối đa 2 lần Gợi ý trong ván này!');
      return;
    }
    if (status === 'cooldown') {
      this.showSpellToast(`ĐANG HỒI CHIÊU: Hãy tạo khối [${this.gameLogic.nextRechargeMilestone}] để hồi chiêu!`);
      return;
    }

    const res = this.gameLogic.getBestMove();
    if (!res || !res.direction) {
      this.showSpellToast('Không tìm thấy nước đi tối ưu!');
      return;
    }

    soundManager.playSpellHint();
    if (this.questManager) {
      this.questManager.recordSpell('hint');
    }
    const dirMap = {
      up: 'TRƯỢT LÊN TRÊN (W / ↑)',
      down: 'TRƯỢT XUỐNG DƯỚI (S / ↓)',
      left: 'TRƯỢT SANG TRÁI (A / ←)',
      right: 'TRƯỢT SANG PHẢI (D / →)',
      layerUp: 'LÊN TẦNG TRÊN (E / Space)',
      layerDown: 'XUỐNG TẦNG DƯỚI (Q / Shift)'
    };

    const dirText = dirMap[res.direction] || res.direction;
    this.showSpellToast(`GỢI Ý TỐI ƯU: ${dirText}`);
    this.updateSpellUI();
  }

  handleSpellUndo() {
    if (this.isAnimating) return;
    if (this.isSwapMode) this.cancelSwapMode();

    const status = this.gameLogic.getSpellStatus('undo');
    if (status === 'depleted') {
      this.showSpellToast('HẾT LƯỢT: Bạn đã dùng tối đa 2 lần Đi lại trong ván này!');
      return;
    }
    if (status === 'cooldown') {
      this.showSpellToast(`ĐANG HỒI CHIÊU: Hãy tạo khối [${this.gameLogic.nextRechargeMilestone}] để hồi chiêu!`);
      return;
    }

    if (this.gameLogic.history.length === 0) {
      this.showSpellToast('Chưa có nước đi nào để hoàn tác!');
      return;
    }

    const res = this.gameLogic.undo();
    if (res && res.success) {
      soundManager.playSpellUndo();
      if (this.questManager) {
        this.questManager.recordSpell('undo');
      }

      // Clean all tiles in scene and grid completely
      this.cleanAllSceneTiles();

      // Re-create 3D tiles according to restored grid
      this.tiles3D = this.createEmptyTileGrid();
      for (let l = 0; l < this.gameLogic.layers; l++) {
        for (let r = 0; r < this.gameLogic.rows; r++) {
          for (let c = 0; c < this.gameLogic.cols; c++) {
            const cell = this.gameLogic.grid[l][r][c];
            if (cell) {
              const tile3D = new Tile3D(l, r, c, cell.value, this.sceneManager.scene, this.currentShape, cell.isBomb, cell.bombCountdown);
              tile3D.group.scale.set(1, 1, 1);
              this.tiles3D[l][r][c] = tile3D;
              // Synchronize cell.id so future moves match correctly
              cell.id = tile3D.id;
            }
          }
        }
      }

      this.updateScoreUI();
      this.updateSpellUI();
      this.showSpellToast('ĐÃ HOÀN TÁC NƯỚC ĐI VỪA RỒI!');
      this.saveGameState();
    }
  }

  handleSpellSwap() {
    if (this.isAnimating || this.gameLogic.gameOver) return;

    if (this.isSwapMode) {
      this.cancelSwapMode();
      return;
    }

    const status = this.gameLogic.getSpellStatus('swap');
    if (status === 'depleted') {
      this.showSpellToast('HẾT LƯỢT: Bạn đã dùng tối đa 2 lần Đổi vị trí trong ván này!');
      return;
    }
    if (status === 'cooldown') {
      this.showSpellToast(`ĐANG HỒI CHIÊU: Hãy tạo khối [${this.gameLogic.nextRechargeMilestone}] để hồi chiêu!`);
      return;
    }

    this.isSwapMode = true;
    this.swapSelectedTile = null;
    this.container.style.cursor = 'pointer';
    document.body.classList.add('in-swap-mode');
    if (this.sceneManager && this.sceneManager.controls) {
      this.sceneManager.controls.enabled = false;
    }
    this.updateSpellUI();
    this.showSpellToast('CHỌN KHỐI THỨ NHẤT TRÊN BÀN CỜ ĐỂ ĐỔI VỊ TRÍ...');
  }

  cancelSwapMode() {
    if (!this.isSwapMode) return;
    this.isSwapMode = false;
    document.body.classList.remove('in-swap-mode');
    if (this.sceneManager && this.sceneManager.controls) {
      this.sceneManager.controls.enabled = true;
    }
    if (this.hoveredTile) {
      if (this.hoveredTile !== this.swapSelectedTile) {
        this.hoveredTile.setHovered(false);
      }
      this.hoveredTile = null;
    }
    if (this.swapSelectedTile) {
      this.swapSelectedTile.setSelected(false);
      this.swapSelectedTile = null;
    }
    this.container.style.cursor = 'default';
    this.updateSpellUI();
    this.showSpellToast('Đã hủy chế độ Đổi vị trí.');
  }

  async handleCanvasClick(clientX, clientY) {
    this.registerInteraction();
    if (!this.isSwapMode || this.isAnimating || this.gameLogic.gameOver) return;

    const clickedTile = this.findTileFromPoint(clientX, clientY);
    if (!clickedTile) {
      this.showSpellToast('HÃY BẤM VÀO MỘT KHỐI SỐ TRÊN BÀN CỜ ĐỂ ĐỔI VỊ TRÍ!');
      return;
    }

    if (!this.swapSelectedTile) {
      this.swapSelectedTile = clickedTile;
      if (clickedTile.isHovered) clickedTile.setHovered(false);
      clickedTile.setSelected(true);
      soundManager.playSlide();
      this.showSpellToast(`ĐÃ CHỌN Ô [${clickedTile.value}]. CHỌN TIẾP Ô THỨ HAI...`);
    } else if (this.swapSelectedTile === clickedTile) {
      clickedTile.setSelected(false);
      this.swapSelectedTile = null;
      this.showSpellToast('Đã bỏ chọn. Hãy chọn lại ô thứ nhất.');
    } else {
      const tileA = this.swapSelectedTile;
      const tileB = clickedTile;
      document.body.classList.remove('in-swap-mode');
      if (this.sceneManager && this.sceneManager.controls) {
        this.sceneManager.controls.enabled = true;
      }
      if (this.hoveredTile) {
        if (this.hoveredTile !== tileA && this.hoveredTile !== tileB) {
          this.hoveredTile.setHovered(false);
        }
        this.hoveredTile = null;
      }
      tileA.setSelected(false);
      tileB.setHovered(false);
      this.swapSelectedTile = null;
      this.isSwapMode = false;
      this.container.style.cursor = 'default';
      this.isAnimating = true;

      const posA = { l: tileA.layer, r: tileA.row, c: tileA.col };
      const posB = { l: tileB.layer, r: tileB.row, c: tileB.col };

      const swapResult = this.gameLogic.swapTiles(posA, posB);
      if (!swapResult || !swapResult.success) {
        this.isAnimating = false;
        this.updateSpellUI();
        this.showSpellToast('Không thể đổi vị trí hai ô này!');
        return;
      }

      this.tiles3D[posA.l][posA.r][posA.c] = tileB;
      this.tiles3D[posB.l][posB.r][posB.c] = tileA;

      soundManager.playSpellSwap();
      if (this.questManager) {
        this.questManager.recordSpell('swap');
      }

      const pA = getGridPosition(posA.l, posA.r, posA.c);
      const pB = getGridPosition(posB.l, posB.r, posB.c);
      this.particleSystem.burst(pA.x, pA.y, pA.z, tileB.value);
      this.particleSystem.burst(pB.x, pB.y, pB.z, tileA.value);

      await Promise.all([
        tileA.slideTo(posB.l, posB.r, posB.c, 0.24),
        tileB.slideTo(posA.l, posA.r, posA.c, 0.24)
      ]);

      this.isAnimating = false;
      this.updateSpellUI();
      this.showSpellToast(`ĐÃ ĐỔI VỊ TRÍ [${tileA.value}] ⇄ [${tileB.value}] THÀNH CÔNG!`);
      this.saveGameState();
    }
  }

  updateTelemetryAndStats() {
    const now = performance.now();
    if (!this.gameLogic.gameOver) {
      this.elapsedSeconds = Math.max(0, Math.round((Date.now() - this.matchStartTime) / 1000));
    }
    const elapsed = now - this.lastFpsTimestamp;
    const fps = elapsed > 0 ? Math.round((this.frameCount * 1000) / elapsed) : 60;
    this.frameCount = 0;
    this.lastFpsTimestamp = now;
    const frameTime = this.lastFrameTime || 16.6;

    // 1. Update FPS Counter DOM
    if (this.fpsEl) {
      this.fpsEl.textContent = `${fps} FPS`;
      if (fps >= 55) this.fpsEl.style.color = '#2ecc71';
      else if (fps >= 40) this.fpsEl.style.color = '#f1c40f';
      else this.fpsEl.style.color = '#e74c3c';
    }

    // 2. Update Rush Mode UI (5 times/sec instead of every frame to eliminate layout thrashing)
    if (this.isRushMode && !this.gameLogic.gameOver) {
      if (this.rushTimerEl) {
        this.rushTimerEl.textContent = `${this.rushTime.toFixed(1)}s`;
        if (this.rushTime <= 5.0) {
          this.rushTimerEl.style.color = '#ff3838';
          this.rushTimerEl.classList.add('urgent-pulse');
        } else if (this.rushTime <= 15.0) {
          this.rushTimerEl.style.color = '#f1c40f';
          this.rushTimerEl.classList.remove('urgent-pulse');
        } else {
          this.rushTimerEl.style.color = '#2ecc71';
          this.rushTimerEl.classList.remove('urgent-pulse');
        }
      }

      if (this.rushProgressBar) {
        const pct = Math.max(0, Math.min(100, (this.rushTime / this.maxRushTime) * 100));
        this.rushProgressBar.style.width = `${pct}%`;
        if (this.rushTime <= 5.0) this.rushProgressBar.style.background = '#ff3838';
        else if (this.rushTime <= 15.0) this.rushProgressBar.style.background = '#f1c40f';
        else this.rushProgressBar.style.background = '#2ecc71';
      }
    }

    // 3. Update Telemetry Panel & Canvas graph
    this.updateTelemetry(fps, frameTime);
  }

  updateTelemetry(fps, frameTime) {
    if (this.currentTheme !== 'telemetry' || !this.telemetryCtx) return;

    // Shift history
    this.fpsHistory.shift();
    this.fpsHistory.push(fps);
    this.msHistory.shift();
    this.msHistory.push(frameTime);

    // Calculate APM
    const now = performance.now();
    this.recentMoves = this.recentMoves.filter(t => now - t < 60000);
    const apm = this.recentMoves.length;

    // Density
    const activeCount = this.gameLogic.getActiveTilesCount();
    const totalCells = this.gameLogic.getTotalCells();
    const density = Math.round((activeCount / totalCells) * 100);

    const stats = this.sceneManager.getRenderStats();

    // Update Cached DOM Stats without re-querying document tree
    const s = this.statEls;
    if (s) {
      if (s.fps) s.fps.textContent = `${fps}`;
      if (s.ms) s.ms.textContent = `${frameTime.toFixed(1)}ms`;
      if (s.calls) s.calls.textContent = `${stats.calls}`;
      if (s.tris) s.tris.textContent = `${stats.triangles}`;
      if (s.gpu && this.gpuInfo) s.gpu.textContent = this.gpuInfo.renderer;
      if (s.fpsTarget) s.fpsTarget.textContent = this.targetFps === 'max' ? 'MAX' : `${this.targetFps}`;
      if (s.apm) s.apm.textContent = `${apm}`;
      if (s.density) s.density.textContent = `${density}%`;
    }

    // Render Canvas Line Graph
    const ctx = this.telemetryCtx;
    const w = this.telemetryCanvas.width;
    const h = this.telemetryCanvas.height;

    ctx.clearRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = 'rgba(0, 255, 204, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.stroke();

    // Plot FPS (Green/Cyan)
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    const step = w / (this.fpsHistory.length - 1);
    for (let i = 0; i < this.fpsHistory.length; i++) {
      const val = Math.min(140, this.fpsHistory[i]);
      const y = h - (val / 140) * h;
      if (i === 0) ctx.moveTo(0, y);
      else ctx.lineTo(i * step, y);
    }
    ctx.stroke();
  }

  animate(timestamp = performance.now()) {
    requestAnimationFrame((t) => this.animate(t));

    // 1. Hardware Target FPS Limiter (Tối ưu phần cứng & tần số quét 60 / 120 / 165 / 300)
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isMobileDevice = isIOSDevice || /Android/i.test(navigator.userAgent) || 
                           (navigator.maxTouchPoints && navigator.maxTouchPoints > 1);

    // On iOS and mobile WebKit, rAF is natively hardware VSync locked (60Hz / 120Hz ProMotion).
    // Artificially skipping frames with micro-thresholds causes WebKit to drop alternate frames down to 20-30 FPS!
    if (this.targetFps === '30') {
      const targetInterval = 1000 / 30;
      const elapsed = timestamp - this.lastRenderTimestamp;
      if (elapsed < targetInterval - 1.5) {
        return; // Battery saver mode (30 FPS)
      }
      this.lastRenderTimestamp = timestamp - (elapsed % targetInterval);
    } else if (!isMobileDevice && this.targetFps !== 'max') {
      const targetFpsNum = parseInt(this.targetFps, 10) || 120;
      const targetInterval = 1000 / targetFpsNum;
      const elapsed = timestamp - this.lastRenderTimestamp;
      if (elapsed < targetInterval - 0.75) {
        return; // Bỏ qua render frame để giảm nhiệt độ máy trên desktop
      }
      this.lastRenderTimestamp = timestamp - (elapsed % targetInterval);
    } else {
      this.lastRenderTimestamp = timestamp;
    }

    const delta = Math.min(this.clock.getDelta(), 0.05);

    // 2. Tab Background Power-Saver (Chỉ tạm dừng rAF khi người dùng chuyển tab/ẩn app)
    if (document.hidden) {
      return;
    }

    // 3. Update Rush Mode internal countdown (pure math - zero DOM writes in rAF)
    if (this.isRushMode && !this.gameLogic.gameOver && !this.isAnimating) {
      this.rushTime -= delta;
      if (this.rushTime <= 0) {
        // ⚡ Emergency Spell-to-Time Bonus (Cơ chế cứu nguy bằng phép bổ trợ)
        const remainingSpells = this.gameLogic.getRemainingSpellCount();
        if (remainingSpells > 0) {
          const bonusSeconds = remainingSpells * 15;
          this.rushTime += bonusSeconds;
          this.gameLogic.consumeAllSpellsForBonus();
          this.updateSpellUI();

          soundManager.playSpellRecharge();
          this.showSpellToast(`⚡ CỨU NGUY: Quy đổi ${remainingSpells} phép bổ trợ thành +${bonusSeconds}s sinh tồn!`, true);
        } else {
          this.rushTime = 0;
          this.gameLogic.gameOver = true;
          if (this.aiBot) this.aiBot.stop();
          this.clearSavedGameState();
          this.isAnimating = false; // UNFREEZE
          soundManager.playGameOver();
          this.showModal({
            title: t('modal_gameover_title') || 'THẤT BẠI (GAME OVER)',
            message: `Hết giờ trong chế độ Time Rush!\nĐiểm số đạt được: ${this.gameLogic.score.toLocaleString()}`,
            primaryText: t('modal_btn_continue') || 'Chơi lại ngay',
            secondaryText: t('modal_btn_new_game') || 'Ván mới',
            onPrimary: () => {
              this.hideModal();
              this.isAnimating = false;
              this.startNewGame(false);
            },
            onSecondary: () => {
              this.hideModal();
              this.isAnimating = false;
              this.startNewGame(false);
            }
          });
        }
      }
    }

    // 4. Update Active 3D Tiles (spin octahedron, torus ring, bomb pulse)
    for (let l = 0; l < this.tiles3D.length; l++) {
      for (let r = 0; r < this.tiles3D[l].length; r++) {
        for (let c = 0; c < this.tiles3D[l][r].length; c++) {
          const tile = this.tiles3D[l][r][c];
          if (tile) tile.update(delta);
        }
      }
    }

    // 5. Frame stats (pure math - no DOM manipulation in rAF)
    this.frameCount++;
    this.lastFrameTime = delta * 1000;

    if (this.bossManager) {
      this.bossManager.update(delta, this.clock.getElapsedTime());
    }

    if (this.trophyMascot) {
      this.trophyMascot.rotation.y += 0.015;
    }
    if (this.bossTrophyMascot) {
      this.bossTrophyMascot.rotation.y -= 0.012;
    }

    this.particleSystem.update(delta);
    this.sceneManager.render(this.clock.getElapsedTime());
  }

  updateTrophyMascot() {
    if (!this.questManager) return;

    // 1. 2048 Grand Master Trophy Mascot (Right corner)
    const isC1Unlocked = this.questManager.isAllCompleted();
    if (isC1Unlocked && !this.trophyMascot) {
      this.trophyMascot = createChampionsTrophyMesh(true);
      this.trophyMascot.scale.set(0.18, 0.18, 0.18);
      this.trophyMascot.position.set(2.8, 0.25, -2.8);
      this.sceneManager.scene.add(this.trophyMascot);
    } else if (!isC1Unlocked && this.trophyMascot) {
      this.sceneManager.scene.remove(this.trophyMascot);
      this.trophyMascot = null;
    }

    // 2. Dark Singularity Slayer Trophy Mascot (Left corner)
    const isBossUnlocked = this.questManager.isBossDefeated();
    if (isBossUnlocked && !this.bossTrophyMascot) {
      this.bossTrophyMascot = createBossTrophyMesh(true);
      this.bossTrophyMascot.scale.set(0.18, 0.18, 0.18);
      this.bossTrophyMascot.position.set(-2.8, 0.25, -2.8);
      this.sceneManager.scene.add(this.bossTrophyMascot);
    } else if (!isBossUnlocked && this.bossTrophyMascot) {
      this.sceneManager.scene.remove(this.bossTrophyMascot);
      this.bossTrophyMascot = null;
    }
  }
}

// Bootstrap game immediately if DOM is ready, or on DOMContentLoaded
function initGame() {
  if (window.gameApp) return;
  try {
    window.gameApp = new GameApp();
    console.log('✅ 3D 2048 GameApp Initialized Successfully');
  } catch (err) {
    console.error('CRITICAL GameApp Init Error:', err);
    window.__initError = { message: err.message, stack: err.stack, name: err.name };
  }
}

// Container is at line 26 so by script execution time it is already in DOM
if (document.getElementById('canvas-container')) {
  initGame();
} else {
  window.addEventListener('DOMContentLoaded', initGame);
  window.addEventListener('load', initGame);
}
