import * as THREE from 'three';
import gsap from 'gsap';
import { SceneManager } from './sceneManager.js';
import { Board, getGridPosition, setLayerSpacingMultiplier } from './board.js';
import { Tile3D, setTileGraphicsQuality } from './tile.js';
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
export const SHAPE_NAMES = {
  auto_evolution: 'Tiến Hóa',
  auto: 'Tiến Hóa',
  rounded_cube: 'Cube',
  prism_triangle: 'Prism',
  hex_prism: 'Hex',
  cyber_pyramid: 'Pyramid',
  crystal_octahedron: 'Crystal',
  star_dodecahedron: 'Gem',
  stellar_icosahedron: 'Icosa',
  chrono_capsule: 'Capsule',
  plasma_torus: 'Ring',
  quantum_knot: 'Knot',
  core_sphere: 'Sphere',
  portal_nexus: 'Nexus',
  cosmic_evolution: 'Cosmic',
  black_hole: 'Black Hole',
  saturn_rings: 'Saturn',
  pulsar_star: 'Pulsar',
  magma_planet: 'Magma',
  asteroid: 'Asteroid',
};


export const SHAPE_I18N_KEYS = {
  auto_evolution: 'shape_auto',
  auto: 'shape_auto',
  rounded_cube: 'shape_cube',
  prism_triangle: 'shape_triangle',
  hex_prism: 'shape_hex',
  cyber_pyramid: 'shape_pyramid',
  crystal_octahedron: 'shape_octahedron',
  star_dodecahedron: 'shape_dodecahedron',
  stellar_icosahedron: 'shape_icosahedron',
  chrono_capsule: 'shape_capsule',
  plasma_torus: 'shape_torus',
  quantum_knot: 'shape_knot',
  core_sphere: 'shape_sphere',
  portal_nexus: 'shape_portal',
  cosmic_evolution: 'shape_cosmic',
  black_hole: 'shape_black_hole',
  saturn_rings: 'shape_saturn',
  pulsar_star: 'shape_pulsar',
  magma_planet: 'shape_magma',
  asteroid: 'shape_asteroid'
};

export const GAME_OVER_MEMES = {
  tier1: [
    {
      img: './assets/memes/pikachu_shocked.jpg',
      badge: '⚡ ỦA ALO?',
      roast: 'Bấm nhanh hơn não đúng không? Mới nhấp vài cái đã kẹt cứng =))',
      title: 'HẾT CỨU! 💀'
    },
    {
      img: './assets/memes/clown_makeup.jpg',
      badge: '🤡 CHÚ HỀ BẤM PHÍM',
      roast: 'Tưởng trình gánh team, ai ngờ gánh còng lưng không nổi 128 =))',
      title: 'ẢO TƯỞNG SỨC MẠNH 🤡'
    },
    {
      img: './assets/memes/patrick_lost.png',
      badge: '🌟 TAY NHANH HƠN NÃO',
      roast: 'Trượt vu vơ không nhìn bàn cờ và cái kết đắng nghét!',
      title: 'BẤM LOẠN XẠ =))'
    }
  ],
  tier2: [
    {
      img: './assets/memes/cheems_crying.png',
      badge: '🥺 TRẦM CẢM NHẸ',
      roast: '128 thôi à sếp? Đang tính xem biểu diễn combo mà toang rồi =))',
      title: 'XONG CON ONG! 🐝'
    },
    {
      img: './assets/memes/elmo_burn.png',
      badge: '🔥 BỐC HỎA TỰ HỦY',
      roast: 'Bàn cờ bốc cháy ngùn ngụt, không còn một kẽ hở để thở!',
      title: 'CHÁY MÁY RỒI ÔNG GIÁO! 🔥'
    },
    {
      img: './assets/memes/cat_crying.png',
      badge: '💔 ĐAU Ở ĐÂY NÀY',
      roast: 'Nhìn thì tưởng sắp ra 512, chớp mắt một cái game over luôn :(',
      title: 'THẾ LÀ HẾT! 😿'
    }
  ],
  tier3: [
    {
      img: './assets/memes/sad_escobar.jpg',
      badge: '🚬 TRẦM TƯ NGẪM ĐỜI',
      roast: 'Cách vinh quang 2048 đúng một bước trượt định mệnh... Cayyy =))',
      title: 'CÁI KẾT ĐẮNG LÒNG 🥀'
    },
    {
      img: './assets/memes/cheems_crying.png',
      badge: '🌶️ CAY MŨI LUÔN',
      roast: 'Người tính không bằng tay trượt nhầm. Tiếc hùi hụi!',
      title: 'SUÝT THÀNH THẦN! 😭'
    },
    {
      img: './assets/memes/elmo_burn.png',
      badge: '💥 NỔ TUNG NÃO',
      roast: 'Bàn cờ chật như xe buýt giờ cao điểm, không cứu nổi nữa rồi!',
      title: 'NÚT THẮT TỬ THẦN 💣'
    }
  ],
  victory: [
    {
      img: './assets/memes/disaster_girl.jpg',
      badge: '🗿 GIGACHAD THẦN THÁNH',
      roast: 'Đỉnh nóc kịch trần bay phấp phới! Bái phục tay trượt thần sầu! 👑',
      title: 'CHIẾN THẮNG 2048! 🎉'
    }
  ]
};

class GameApp {
  constructor() {
    this.container = document.getElementById('canvas-container');
    this.mode = localStorage.getItem('3d2048_last_mode') || '4x4';
    let savedShape = localStorage.getItem('3d2048_shape') || 'auto_evolution';
    if (savedShape === 'auto') savedShape = 'auto_evolution';
    this.currentShape = savedShape;
    
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

    // Expose global references EARLY so external callers and UI can always link
    window.gameApp = this;
    window.THREE = THREE;
    window.textureManager = textureManager;
    window.Tile3D = Tile3D;
    window.soundManager = soundManager;
    window.setLanguage = setLanguage;
    window.i18n = i18n;
    window.t = t;
    this.soundManager = soundManager;

    this.isBossRaid = false;
    this.isRescueMode = false;
    this.trophyMascot = null;
    this.bossTrophyMascot = null;
    this.isAnimating = false;
    this.clock = (typeof THREE !== 'undefined' && THREE.Clock) ? new THREE.Clock() : null;

    // 3D tiles grid: tiles3D[layer][row][col]
    this.tiles3D = this.createEmptyTileGrid();

    // Rush Mode State (Pure Time Rush)
    this.isRushMode = false;
    this.rushTime = 25.0;
    this.maxRushTime = 30.0;
    this.rushElapsed = 0.0;
    this.rushLevel = 1;
    this.isOverdriveMode = false;

    // Telemetry & Stats State
    this.frameCount = 0;
    this.lastFpsTimestamp = performance.now();
    this.lastFrameTime = 16.6;
    this.recentMoves = []; // Timestamps for APM
    this.fpsHistory = new Array(40).fill(60);
    this.msHistory = new Array(40).fill(16);

    // Summoner Spells State (Lùi lại, Gợi ý, Đổi chỗ, Phá khối)
    this.isSwapMode = false;
    this.swapSelectedTileA = null;
    this.swapSelectedTileB = null;
    this.isDestroyMode = false;
    this.destroyTargetTile = null;
    this.hoveredTile = null;
    this.toastTimeout = null;

    // 3D Tile Grab, Inspection Tilt & Fling-to-Move State
    this.heldTile = null;
    this.heldTileOrigin = null;
    this.tileLiftElevation = 0;
    this.dragStartPointer = null;
    this.lastPointer = null;
    this.pointerVelocity = { vx: 0, vy: 0 };
    this.lastGhostDir = null;

    // Slice View State (for 3x3x3 X-Ray / Exploded View)
    this.sliceMode = 'all';
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

    // Input Buffer & Zero-Allocation Math Vector Cache
    this.moveQueue = [];
    this.maxQueuedMoves = 2;
    this._moveToken = 0;
    this._activeMoveContext = null;
    this._raycaster = (typeof THREE !== 'undefined' && THREE.Raycaster) ? new THREE.Raycaster() : null;
    this._ndcVec = (typeof THREE !== 'undefined' && THREE.Vector2) ? new THREE.Vector2() : null;
    this._dragPlane = (typeof THREE !== 'undefined' && THREE.Plane && THREE.Vector3) ? new THREE.Plane(new THREE.Vector3(0, 1, 0), 0) : null;
    this._dragTargetPos = (typeof THREE !== 'undefined' && THREE.Vector3) ? new THREE.Vector3() : null;
    this._projVec = (typeof THREE !== 'undefined' && THREE.Vector3) ? new THREE.Vector3() : null;
    this._tileGroupCache = [];

    // Accessibility & Motion Preference
    this.reduceMotion = localStorage.getItem('3d2048_reduce_motion') === 'true';
    if (this.reduceMotion) {
      document.body.classList.add('reduce-motion');
    }

    // Hardware Adaptive Performance State & Graphics Quality (high, medium, low)
    this.graphicsQuality = localStorage.getItem('3d2048_graphics_quality') || 
      (localStorage.getItem('3d2048_target_fps') === '30' ? 'low' : 
       localStorage.getItem('3d2048_target_fps') === '60' ? 'medium' : 'high');
    this.targetFps = this.graphicsQuality === 'low' ? '30' : this.graphicsQuality === 'medium' ? '60' : '120';
    setTileGraphicsQuality(this.graphicsQuality);
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

    // Initialize pure-logic modules (zero WebGL dependencies)
    this.gameLogic = new Game2048Logic(this.mode);
    this.questManager = new QuestManager(this);
    this.questManager.recordMode(this.mode);
    this.aiBot = new AIBot(this);

    // STEP 1: Always initialize UI listeners FIRST so all modals, buttons & settings are 100% interactive
    this.initUI();
    this.initTelemetryCanvas();

    // STEP 2: Initialize 3D Engine & Scene safely inside try/catch so WebGL hiccups never kill the UI
    this.init3D();
  }

  init3D() {
    try {
      this.sceneManager = new SceneManager(this.container);
      this.particleSystem = new ParticleSystem(this.sceneManager.scene);
      this.board = new Board(this.mode, this.currentTheme);
      textureManager.setTheme(this.currentTheme);
      this.sceneManager.scene.add(this.board.group);

      this.bossManager = new BossManager(this);
      this.boss3D = this.bossManager.boss3D;
      window.boss3D = this.boss3D;

      if (this.sceneManager && this.sceneManager.setGraphicsQuality) {
        this.sceneManager.setGraphicsQuality(this.graphicsQuality);
      }
      this.updateGPUInfo();

      this.initInput();
      this.initGhostPreview();
      this.initFirstSwipeGuide();
      this.startNewGame(true);

      // Render 1 immediate synchronous frame so canvas is NEVER blank or black on startup
      if (this.sceneManager && this.sceneManager.render) {
        this.sceneManager.render(0);
      }

      this.telemetryInterval = setInterval(() => this.updateTelemetryAndStats(), 200);
      this.animate();
    } catch (err) {
      console.error('❌ CRITICAL: 3D WebGL Initialization Error:', err);
      window.__lastInit3DError = { message: err.message, stack: err.stack };
      this.showWebGLErrorFallback(err);
    }
  }

  showWebGLErrorFallback(err) {
    if (!this.container) return;
    const msg = (err && err.message) ? err.message : 'WebGL không phản hồi';
    this.container.innerHTML = `
      <div style="
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;
        background: rgba(13, 17, 23, 0.94);
        backdrop-filter: blur(18px);
        -webkit-backdrop-filter: blur(18px);
        border: 1px solid rgba(239, 68, 68, 0.45);
        border-radius: 18px;
        padding: 24px 28px;
        color: #f87171;
        max-width: 90vw;
        width: 420px;
        box-shadow: 0 16px 48px rgba(0,0,0,0.7), 0 0 24px rgba(239, 68, 68, 0.2);
        font-family: inherit;
        z-index: 15;
      ">
        <div style="font-size: 36px; margin-bottom: 10px;">⚠️</div>
        <h4 style="font-size: 17px; font-weight: 800; color: #ffffff; margin: 0 0 8px 0;">${t('webgl_error_title') || 'Đồ họa 3D WebGL Chưa Sẵn Sàng'}</h4>
        <p style="font-size: 13px; color: #94a3b8; line-height: 1.5; margin: 0 0 14px 0;">
          ${t('webgl_error_desc') || 'Trình duyệt của bạn có thể đang tắt tính năng Tăng tốc phần cứng (Hardware Acceleration) hoặc chưa cấp quyền WebGL.'}<br>
          <small style="color:#ef4444; opacity: 0.85;">(${msg})</small>
        </p>
        <button onclick="window.location.reload()" style="
          background: linear-gradient(135deg, #38bdf8 0%, #0284c7 100%);
          color: #030712;
          font-weight: 700;
          border: none;
          padding: 8px 20px;
          border-radius: 10px;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(56, 189, 248, 0.4);
        ">${t('webgl_reload_btn') || 'Tải lại trang'}</button>
      </div>
    `;
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
    this.nextTileBadgeEl = document.getElementById('next-tile-badge');
    this.nextTileValEl = document.getElementById('next-tile-val');
    this.streakFeverPillEl = document.getElementById('streak-fever-pill');
    this.streakCountTextEl = document.getElementById('streak-count-text');
    this.feverModeTagEl = document.getElementById('fever-mode-tag');
    this._lastDangerEmpty = null;
    this._lastHeartbeatAt = 0;
    this.fpsEl = document.getElementById('fps-counter');

    // Modals
    this.modalOverlay = document.getElementById('modal-overlay');
    this.modalTitle = document.getElementById('modal-title');
    this.modalMessage = document.getElementById('modal-message');
    this.modalBtnPrimary = document.getElementById('modal-btn-primary');
    this.modalBtnSecondary = document.getElementById('modal-btn-secondary');
    this.modalMemeWrap = document.getElementById('modal-meme-wrap');
    this.modalMemeImg = document.getElementById('modal-meme-img');
    this.modalMemeBadge = document.getElementById('modal-meme-badge');
    this.modalMemeQuote = document.getElementById('modal-meme-quote');
    this._isLastModalVictory = false;

    if (this.modalMemeWrap) {
      this.modalMemeWrap.addEventListener('click', () => {
        this.rollMemeReaction(this._isLastModalVictory);
      });
    }

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

    this.initZenMode();
    this.initCameraLock();

    const resetCamBtn = document.getElementById('btn-reset-camera');
    if (resetCamBtn) {
      resetCamBtn.addEventListener('click', () => {
        if (this.sceneManager && this.sceneManager.resetCamera) {
          this.sceneManager.resetCamera();
        }
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

    // Rescue Mode (Second Wind) Give Up Button
    const rescueGiveupBtn = document.getElementById('btn-rescue-giveup');
    if (rescueGiveupBtn) {
      rescueGiveupBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.registerInteraction();
        this.giveUpFromRescueMode();
      });
    }

    // Easter Egg: Tap logo '2048' 5 times within 2.5s for Dev Signature & Confetti
    const gameTitleLogo = document.querySelector('.game-title');
    if (gameTitleLogo) {
      let logoClicks = 0;
      let lastLogoClick = 0;
      gameTitleLogo.addEventListener('click', (e) => {
        e.stopPropagation();
        this.registerInteraction();
        const now = performance.now();
        if (now - lastLogoClick > 2500) {
          logoClicks = 0;
        }
        lastLogoClick = now;
        logoClicks++;

        soundManager.playClick();
        soundManager.triggerHaptic('click');

        gsap.killTweensOf(gameTitleLogo);
        gsap.fromTo(gameTitleLogo, 
          { scale: 0.88, rotate: (logoClicks % 2 === 0 ? 6 : -6) },
          { scale: 1, rotate: 0, duration: 0.28, ease: 'back.out(2)' }
        );

        if (logoClicks >= 5) {
          logoClicks = 0;
          soundManager.playClick();
          soundManager.triggerHaptic('win');
        }
      });
    }

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

    // Welcome modal available on demand via '?' button (#btn-help-toggle)

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
      this.updateStreakFeverUI();
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
        if (isPlaying) {
          const track = soundManager.getBGMTrack();
          const trackKey = `bgm_track_${track.id}`;
          const trackName = t(trackKey) || track.name;
          this.showSpellToast(`🎵 ${t('btn_bgm')}: ON (${trackName})`);
        } else {
          this.showSpellToast(`🔇 ${t('btn_bgm')}: OFF`);
        }
        this.registerInteraction();
      });
    }

    const sfxProfileSelect = document.getElementById('select-sfx-profile');
    if (sfxProfileSelect) {
      sfxProfileSelect.value = soundManager.sfxProfile || 'water';
      sfxProfileSelect.addEventListener('change', (e) => {
        soundManager.setSFXProfile(e.target.value);
        const profileName = sfxProfileSelect.options[sfxProfileSelect.selectedIndex].text;
        this.showSpellToast(`🔊 ${t('setting_sfx_profile') || 'Gói âm thanh'}: ${profileName}`);
        soundManager.playMerge(16, 1);
        this.registerInteraction();
      });
    }

    const bgmTrackSelect = document.getElementById('select-bgm-track');
    if (bgmTrackSelect) {
      bgmTrackSelect.value = soundManager.currentBgmTrack.toString();
      bgmTrackSelect.addEventListener('change', (e) => {
        const track = soundManager.setBGMTrack(parseInt(e.target.value, 10));
        const trackKey = `bgm_track_${track.id}`;
        const trackName = t(trackKey) || track.name;
        this.showSpellToast(`🎵 ${t('setting_bgm_track') || 'Giai điệu'}: ${trackName}`);
        this.registerInteraction();
      });
    }

    // SFX & BGM Smooth Volume Sliders
    const sfxSlider = document.getElementById('slider-sfx-volume');
    const sfxValLabel = document.getElementById('label-sfx-vol-val');
    if (sfxSlider) {
      const currentSfxVal = Math.round((soundManager.sfxVolume ?? 0.8) * 100);
      sfxSlider.value = currentSfxVal;
      if (sfxValLabel) sfxValLabel.textContent = `${currentSfxVal}%`;
      sfxSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        soundManager.setSFXVolume(val);
        if (sfxValLabel) sfxValLabel.textContent = `${val}%`;
      });
      sfxSlider.addEventListener('change', () => {
        soundManager.playSlide();
      });
    }

    const bgmSlider = document.getElementById('slider-bgm-volume');
    const bgmValLabel = document.getElementById('label-bgm-vol-val');
    if (bgmSlider) {
      const currentBgmVal = Math.round((soundManager.bgmVolume ?? 0.5) * 100);
      bgmSlider.value = currentBgmVal;
      if (bgmValLabel) bgmValLabel.textContent = `${currentBgmVal}%`;
      bgmSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        soundManager.setBGMVolume(val);
        if (bgmValLabel) bgmValLabel.textContent = `${val}%`;
      });
    }

    // AI Bot Speed Selector
    const aiSpeedSelect = document.getElementById('select-ai-speed');
    if (aiSpeedSelect) {
      aiSpeedSelect.value = (this.aiBot && this.aiBot.intervalMs) ? this.aiBot.intervalMs.toString() : '220';
      aiSpeedSelect.addEventListener('change', (e) => {
        const speed = parseInt(e.target.value, 10);
        if (this.aiBot) this.aiBot.setSpeed(speed);
        const speedText = aiSpeedSelect.options[aiSpeedSelect.selectedIndex].text;
        this.showSpellToast(`🤖 ${t('setting_ai_speed') || 'Tốc độ AI'}: ${speedText}`);
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

    const modalCopyEmojiBtn = document.getElementById('modal-btn-copy-emoji');
    if (modalCopyEmojiBtn) {
      modalCopyEmojiBtn.addEventListener('click', () => {
        this.copyEmojiGridSummary();
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

    // Keyboard shortcut Alt+B to cycle Phase 1 -> Phase 2 -> Phase 3 -> Big Bang Supernova
    window.addEventListener('keydown', (e) => {
      if (e.altKey && (e.code === 'KeyB' || e.key === 'b' || e.key === 'B')) {
        e.preventDefault();
        if (!this.isBossRaid) {
          this.activateBossModeWithCleanReset();
          this.showSpellToast('PHASE 1 • CORE PRIME: LÕI HÀNH TINH (500 HP | 120s)');
          return;
        }
        const nextP = this.bossManager.cyclePhaseForTest();
        if (nextP === 4) {
          // Prepare two 1024 tiles for testing the 2048 obliteration strike on Phase 4
          this.cleanAllSceneTiles();
          this.tiles3D = this.createEmptyTileGrid();
          this.gameLogic.reset();
          this.spawnSpecificTile(0, 0, 0, 1024);
          this.spawnSpecificTile(0, 0, 1, 1024);
          this.showSpellToast('PHASE 4 • OMNIVERSE SOVEREIGN (2,048 HP | +120s) — Gộp khối 2048 để hủy diệt!');
        } else {
          const toastNames = {
            1: 'PHASE 1 • CORE PRIME: LÕI HÀNH TINH (500 HP | 120s)',
            2: 'PHASE 2 • SOLAR QUASAR (1,500 HP | +120s)',
            3: 'PHASE 3 • SINGULARITY CORE (2,048 HP | +120s)',
            5: '💥 BIG BANG SUPERNOVA FINALE'
          };
          this.showSpellToast(toastNames[nextP] || `Boss Phase ${nextP}`);
        }
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
        if (isRunning && this.bossManager && this.isBossRaid) {
          this.bossManager.usedAIBot = true;
        }
        this.showSpellToast(isRunning ? t('toast_ai_start') : t('toast_ai_stop'));
        this.registerInteraction();
      });
      if (this.aiBot) {
        this.aiBot.onStatusChange = (running) => {
        aiBtn.classList.toggle('active', running);
        const textEl = aiBtn.querySelector('.btn-text');
        if (textEl) textEl.textContent = running ? t('btn_ai_active') : t('btn_ai');
        if (running && this.bossManager && this.isBossRaid) {
          this.bossManager.usedAIBot = true;
        }
      };
      }
    }

    // Dimension Mode Selector
    const modeSelect = document.getElementById('select-mode');
    if (modeSelect) {
      modeSelect.value = this.mode;
      modeSelect.addEventListener('change', (e) => {
        this.switchDimensionMode(e.target.value);
      });
    }

    this.updateDpadLayerDock();
    const sliceControls = document.getElementById('slice-controls');
    if (sliceControls) {
      sliceControls.style.display = this.mode === '3x3x3' ? 'flex' : 'none';
    }

    // Tile Shape Selector (Header Apple Glass dropdown & Settings modal select)
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

    const shapeTriggerBtn = document.getElementById('btn-shape-trigger');
    const shapeGlassMenu = document.getElementById('shape-glass-menu');
    const shapeDropdownWrapper = document.getElementById('shape-dropdown-wrapper');
    const shapeTriggerLabel = document.getElementById('shape-trigger-label');

    if (shapeTriggerLabel) {
      const shapeKey = SHAPE_I18N_KEYS[this.currentShape] || 'shape_auto';
      shapeTriggerLabel.setAttribute('data-i18n', shapeKey);
      shapeTriggerLabel.textContent = (shapeKey ? t(shapeKey) : null) || SHAPE_NAMES[this.currentShape] || t('shape_auto') || 'Tiến Hóa';
    }

    if (shapeTriggerBtn && shapeGlassMenu) {
      shapeTriggerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = shapeDropdownWrapper?.classList.contains('open') || shapeGlassMenu.classList.contains('open');
        if (isOpen) {
          shapeDropdownWrapper?.classList.remove('open');
          shapeGlassMenu.classList.remove('open');
          shapeGlassMenu.style.setProperty('display', 'none', 'important');
          shapeTriggerBtn.setAttribute('aria-expanded', 'false');
        } else {
          const isLight = document.body.classList.contains('theme-gentle_light') ||
                          document.body.classList.contains('theme-zen_clay') ||
                          this.currentTheme === 'gentle_light' ||
                          this.currentTheme === 'zen_clay';
          shapeGlassMenu.classList.toggle('light-theme', isLight);
          shapeDropdownWrapper?.classList.add('open');
          shapeGlassMenu.classList.add('open');
          shapeGlassMenu.style.setProperty('display', 'flex', 'important');
          shapeTriggerBtn.setAttribute('aria-expanded', 'true');
        }
        soundManager.playClick();
      });

      const menuItems = shapeGlassMenu.querySelectorAll('.apple-glass-menu-item');
      menuItems.forEach(item => {
        if (item.dataset.value === this.currentShape) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
        item.addEventListener('click', (e) => {
          e.stopPropagation();
          const chosenShape = item.dataset.value;
          this.switchTileShape(chosenShape);
          shapeDropdownWrapper?.classList.remove('open');
          shapeGlassMenu.classList.remove('open');
          shapeGlassMenu.style.setProperty('display', 'none', 'important');
          shapeTriggerBtn.setAttribute('aria-expanded', 'false');
          soundManager.playClick();
        });
      });

      document.addEventListener('click', (e) => {
        if (shapeDropdownWrapper?.classList.contains('open') && !shapeDropdownWrapper?.contains(e.target)) {
          shapeDropdownWrapper?.classList.remove('open');
          shapeGlassMenu.classList.remove('open');
          shapeGlassMenu.style.setProperty('display', 'none', 'important');
          shapeTriggerBtn.setAttribute('aria-expanded', 'false');
        }
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
          this.showSpellToast(t('bg_size_error') || 'Ảnh quá lớn! Vui lòng chọn ảnh dưới 5MB.');
          if (themeSelect) themeSelect.value = this.currentTheme;
          return;
        }
        const reader = new FileReader();
        reader.onload = (ev) => {
          try { localStorage.setItem('3d2048_custom_bg', ev.target.result); } catch {}
          this.switchTheme('custom');
          localStorage.setItem('3d2048_theme', 'custom');
          this.showSpellToast(t('bg_applied_toast') || '🖼️ Đã áp dụng hình nền cá nhân!');
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
      const isMobileUA = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isCoarsePointer = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
      const isSmallScreen = (window.innerWidth || 800) <= 768;
      return isMobileUA || isCoarsePointer || isSmallScreen;
    };

    const applyDpadMode = (mode) => {
      if (!dirPad) return;
      dirPad.classList.remove('hide-dpad', 'force-show', 'device-touch-adapted', 'auto-hide-desktop');
      if (mode === 'hidden') {
        dirPad.classList.add('hide-dpad');
      } else if (mode === 'visible') {
        dirPad.classList.add('force-show');
        if (isTouchDevice()) {
          dirPad.classList.add('device-touch-adapted');
        }
      } else {
        // 'auto' mode: on touch/mobile devices, hidden by default because intuitive swipe gesture is active.
        // Can be explicitly enabled in Settings ('visible') if the player desires an on-screen arcade D-pad disc.
        dirPad.classList.add('hide-dpad');
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

    // Auto-detect & Display Hardware GPU element reference
    this.gpuBadgeEl = document.getElementById('gpu-badge');

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

    // Battery & Performance: Page Visibility API for background power saving (5h away / tab switch)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.saveGameState(true);
        this.hiddenTimestamp = Date.now();
        soundManager.suspend();
      } else {
        if (this.hiddenTimestamp) {
          const pausedDuration = Date.now() - this.hiddenTimestamp;
          this.matchStartTime += pausedDuration;
          this.hiddenTimestamp = null;
        }
        soundManager.resume();
        if (this.clock) {
          this.clock.getDelta(); // Flush delta so no sudden physics jump occurs
        }
      }
    });

    window.addEventListener('beforeunload', () => {
      this.saveGameState(true);
    });


    // Summoner Spells Elements (Lùi lại, Gợi ý, Đổi chỗ)
    this.btnSpellHint = document.getElementById('btn-spell-hint');
    this.btnSpellUndo = document.getElementById('btn-spell-undo');
    this.btnSpellSwap = document.getElementById('btn-spell-swap');
    this.badgeSpellHint = document.getElementById('badge-spell-hint');
    this.badgeSpellUndo = document.getElementById('badge-spell-undo');
    this.badgeSpellSwap = document.getElementById('badge-spell-swap');
    this.spellToastEl = document.getElementById('spell-toast');
    this.swapActionHud = document.getElementById('swap-action-hud');
    this.swapHudText = document.getElementById('swap-hud-text');
    this.swapHudPreview = document.getElementById('swap-hud-preview');
    this.swapTileATag = document.getElementById('swap-tile-a-tag');
    this.swapTileBTag = document.getElementById('swap-tile-b-tag');
    this.swapHudActionsConfirm = document.getElementById('swap-hud-actions-confirm');
    this.btnSwapHudConfirm = document.getElementById('btn-swap-hud-confirm');
    this.btnSwapHudCancel = document.getElementById('btn-swap-hud-cancel');
    this.btnSpellDestroy = document.getElementById('btn-spell-destroy');
    this.badgeSpellDestroy = document.getElementById('badge-spell-destroy');
    this.destroyActionHud = document.getElementById('destroy-action-hud');
    this.destroyHudText = document.getElementById('destroy-hud-text');
    this.destroyHudPreview = document.getElementById('destroy-hud-preview');
    this.destroyTileTargetTag = document.getElementById('destroy-tile-target-tag');
    this.destroyHudActionsConfirm = document.getElementById('destroy-hud-actions-confirm');
    this.btnDestroyHudConfirm = document.getElementById('btn-destroy-hud-confirm');
    this.btnDestroyHudCancel = document.getElementById('btn-destroy-hud-cancel');

    // Helper to reliably trigger spell taps without ghost double-clicks or touch cancellation
    const bindSpellTap = (btn, handler) => {
      if (!btn) return;
      let lastTrigger = 0;
      let touchStartX = 0;
      let touchStartY = 0;
      let touchStartTime = 0;
      let touchHandled = false;

      const trigger = (e) => {
        const now = performance.now();
        if (now - lastTrigger < 450) return;
        lastTrigger = now;
        if (e) {
          if (e.cancelable) e.preventDefault();
          e.stopPropagation();
        }
        handler();
      };

      btn.addEventListener('touchstart', (e) => {
        touchHandled = false;
        if (e.touches && e.touches[0]) {
          touchStartX = e.touches[0].clientX;
          touchStartY = e.touches[0].clientY;
          touchStartTime = performance.now();
        }
      }, { passive: true });

      btn.addEventListener('touchend', (e) => {
        if (e.changedTouches && e.changedTouches[0]) {
          const dx = Math.abs(e.changedTouches[0].clientX - touchStartX);
          const dy = Math.abs(e.changedTouches[0].clientY - touchStartY);
          const dt = performance.now() - touchStartTime;
          if (dx < 18 && dy < 18 && dt < 600) {
            touchHandled = true;
            trigger(e);
          }
        }
      }, { passive: false });

      btn.addEventListener('pointerup', (e) => {
        if (e.pointerType === 'mouse' && e.button === 0) {
          trigger(e);
        }
      });

      btn.addEventListener('click', (e) => {
        if (touchHandled) {
          touchHandled = false;
          if (e.cancelable) e.preventDefault();
          e.stopPropagation();
          return;
        }
        trigger(e);
      });
    };

    if (this.btnSwapHudConfirm) {
      bindSpellTap(this.btnSwapHudConfirm, () => this.confirmExecuteSwap());
    }
    if (this.btnSwapHudCancel) {
      bindSpellTap(this.btnSwapHudCancel, () => this.cancelSwapMode());
    }
    if (this.btnDestroyHudCancel) {
      bindSpellTap(this.btnDestroyHudCancel, () => this.cancelDestroyMode());
    }

    bindSpellTap(this.btnSpellHint, () => this.handleSpellHint());
    bindSpellTap(this.btnSpellUndo, () => this.handleSpellUndo());
    bindSpellTap(this.btnSpellSwap, () => this.handleSpellSwap());
    bindSpellTap(this.btnSpellDestroy, () => this.handleSpellDestroy());

    this.updateScoreUI();
    this.updateSpellUI();
    this.switchTheme(this.currentTheme);
    this.updateTrophyMascot();

    // Universal Escape & Android Back Button (popstate) Handler
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.closeTopActiveModal()) {
          e.preventDefault();
          e.stopPropagation();
        }
      }
    });

    window.addEventListener('popstate', () => {
      if (this.isAnyModalOpen()) {
        this.closeTopActiveModal();
      }
    });

// Tab Inactivity listener consolidated above
  }

  registerInteraction() {
    this.lastUserInteraction = performance.now();
  }

  updateGPUInfo() {
    this.gpuBadgeEl = document.getElementById('gpu-badge');
    this.gpuInfo = (this.sceneManager && this.sceneManager.getGPUInfo) ? this.sceneManager.getGPUInfo() : null;
    if (this.gpuBadgeEl && this.gpuInfo) {
      this.gpuBadgeEl.textContent = this.gpuInfo.renderer;
      this.gpuBadgeEl.title = `Card đồ họa: ${this.gpuInfo.full}`;
    }
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
    if (this.sceneManager && this.sceneManager.setMode) this.sceneManager.setMode(newMode);
    this.gameLogic.setMode(newMode);
    if (this.questManager) {
      this.questManager.recordMode(newMode);
    }

    if (newMode === '3x3x3') {
      // Default to rounded_cube for crystal-clear readability across all 27 dice faces
      if (this.currentShape === 'auto_evolution') {
        this.switchTileShape('rounded_cube');
        this._autoSwitchedToCube = true;
      }
    } else if (newMode === '4x4') {
      if (this._autoSwitchedToCube) {
        this.switchTileShape('auto_evolution');
        this._autoSwitchedToCube = false;
      }
    }

    const sliceControls = document.getElementById('slice-controls');
    if (sliceControls) {
      sliceControls.style.display = newMode === '3x3x3' ? 'flex' : 'none';
    }

    this.updateDpadLayerDock();

    // Reset slice mode
    this._sliceCycleIdx = 0;
    this.setSliceMode('all');

    if (this.sceneManager && this.sceneManager.requestShadowUpdate) this.sceneManager.requestShadowUpdate(30);
    this.startNewGame(true);
  }

  initZenMode() {
    const zenBtn = document.getElementById('btn-zen-mode');
    const zenToggleSwitch = document.getElementById('toggle-zen-ui');
    const isZenSaved = localStorage.getItem('3d2048_zen_mode') === 'true';
    if (isZenSaved) {
      document.body.classList.add('zen-ui-mode');
      if (zenBtn) {
        zenBtn.classList.add('active');
        zenBtn.setAttribute('aria-pressed', 'true');
      }
      if (zenToggleSwitch) {
        zenToggleSwitch.checked = true;
      }
    }

    const toggleZen = () => {
      const active = document.body.classList.toggle('zen-ui-mode');
      localStorage.setItem('3d2048_zen_mode', active ? 'true' : 'false');
      if (zenBtn) {
        zenBtn.classList.toggle('active', active);
        zenBtn.setAttribute('aria-pressed', active ? 'true' : 'false');
      }
      if (zenToggleSwitch) {
        zenToggleSwitch.checked = active;
      }
      this.showSpellToast(active ? t('zen_mode_on') : t('zen_mode_off'));
      if (soundManager && soundManager.playClick) soundManager.playClick();
    };

    if (zenBtn) {
      zenBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleZen();
      });
    }

    if (zenToggleSwitch) {
      zenToggleSwitch.addEventListener('change', () => {
        toggleZen();
      });
    }

    // Reduce Motion Toggle Switch
    const reduceMotionSwitch = document.getElementById('toggle-reduce-motion');
    if (reduceMotionSwitch) {
      reduceMotionSwitch.checked = this.reduceMotion;
      reduceMotionSwitch.addEventListener('change', (e) => {
        this.reduceMotion = e.target.checked;
        localStorage.setItem('3d2048_reduce_motion', this.reduceMotion ? 'true' : 'false');
        document.body.classList.toggle('reduce-motion', this.reduceMotion);
        this.showSpellToast(this.reduceMotion ? (t('setting_reduce_motion') + ': ON') : (t('setting_reduce_motion') + ': OFF'));
        if (soundManager && soundManager.playClick) soundManager.playClick();
      });
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'F2') {
        e.preventDefault();
        toggleZen();
      }
    });
  }

  initCameraLock() {
    this.isCameraLocked = localStorage.getItem('3d2048_camera_locked') === 'true';
    const lockBtn = document.getElementById('btn-camera-lock');
    const lockToggleSwitch = document.getElementById('toggle-camera-lock');
    const mobileHintRotate = document.getElementById('hint-mobile-rotate-container');
    const mobileRotateText = document.getElementById('hint-mobile-rotate-text');

    const updateUI = (locked) => {
      if (lockBtn) {
        lockBtn.classList.toggle('locked', locked);
        lockBtn.setAttribute('aria-pressed', locked ? 'true' : 'false');
      }
      if (lockToggleSwitch) {
        lockToggleSwitch.checked = locked;
      }
      if (mobileHintRotate) {
        const iconUnlocked = mobileHintRotate.querySelector('.hint-icon-unlocked');
        const iconLocked = mobileHintRotate.querySelector('.hint-icon-locked');
        if (iconUnlocked) iconUnlocked.style.display = locked ? 'none' : 'inline-block';
        if (iconLocked) iconLocked.style.display = locked ? 'inline-block' : 'none';
        if (mobileRotateText) {
          mobileRotateText.textContent = locked ? (t('hint_mobile_cam_locked') || 'Góc nhìn đã khóa') : (t('hint_mobile_rotate') || '2 ngón để xoay');
        }
      }
      if (this.sceneManager && this.sceneManager.setCameraLocked) {
        this.sceneManager.setCameraLocked(locked);
      }
    };

    updateUI(this.isCameraLocked);

    const toggleLock = (showToast = true) => {
      this.isCameraLocked = !this.isCameraLocked;
      try {
        localStorage.setItem('3d2048_camera_locked', this.isCameraLocked ? 'true' : 'false');
      } catch {}
      updateUI(this.isCameraLocked);
      if (showToast) {
        this.showSpellToast(this.isCameraLocked ? t('camera_locked_toast') : t('camera_unlocked_toast'));
      }
      if (soundManager && soundManager.playClick) soundManager.playClick();
    };

    if (lockBtn) {
      lockBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleLock(true);
      });
    }

    if (lockToggleSwitch) {
      lockToggleSwitch.addEventListener('change', () => {
        toggleLock(true);
      });
    }

    if (mobileHintRotate) {
      mobileHintRotate.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleLock(true);
      });
    }
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

    const shapeTriggerLabel = document.getElementById('shape-trigger-label');
    if (shapeTriggerLabel) {
      const i18nKeyMap = {
        auto_evolution: 'shape_auto',
        rounded_cube: 'shape_cube',
        prism_triangle: 'shape_triangle',
        hex_prism: 'shape_hex',
        cyber_pyramid: 'shape_pyramid',
        crystal_octahedron: 'shape_octahedron',
        star_dodecahedron: 'shape_dodecahedron',
        stellar_icosahedron: 'shape_icosahedron',
        chrono_capsule: 'shape_capsule',
        plasma_torus: 'shape_torus',
        quantum_knot: 'shape_knot',
        core_sphere: 'shape_sphere',
        portal_nexus: 'shape_portal',
        cosmic_evolution: 'shape_cosmic',
        black_hole: 'shape_black_hole',
        saturn_rings: 'shape_saturn',
        pulsar_star: 'shape_pulsar',
        magma_planet: 'shape_magma',
        asteroid: 'shape_asteroid'
      };
      const key = SHAPE_I18N_KEYS[newShape] || 'shape_auto';
      if (key) shapeTriggerLabel.setAttribute('data-i18n', key);
      shapeTriggerLabel.textContent = (key ? t(key) : null) || SHAPE_NAMES[newShape] || t('shape_auto') || 'Tiến Hóa';
    }
    const shapeGlassMenu = document.getElementById('shape-glass-menu');
    if (shapeGlassMenu) {
      const items = shapeGlassMenu.querySelectorAll('.apple-glass-menu-item');
      items.forEach(item => {
        item.classList.toggle('active', item.dataset.value === newShape);
      });
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
    if (this.sceneManager && this.sceneManager.requestShadowUpdate) this.sceneManager.requestShadowUpdate(20);
  }

  switchTheme(newTheme) {
    this.currentTheme = newTheme;
    const wasZen = document.body.classList.contains('zen-ui-mode') || this.isZenMode;
    document.body.className = `theme-${newTheme}`;
    const shapeGlassMenu = document.getElementById('shape-glass-menu');
    if (shapeGlassMenu) {
      const isLight = (newTheme === 'gentle_light' || newTheme === 'zen_clay');
      shapeGlassMenu.classList.toggle('light-theme', isLight);
    }
    if (this.isBossRaid) {
      document.body.classList.add('in-boss-mode');
    }
    if (wasZen) {
      document.body.classList.add('zen-ui-mode');
    }
    if (this.sceneManager && this.sceneManager.setTheme) this.sceneManager.setTheme(newTheme);
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
    if (this.particleSystem && this.particleSystem.setHyperNeon) {
      this.particleSystem.setHyperNeon(isNeon);
    }
    if (textureManager && textureManager.setHyperNeon) {
      textureManager.setHyperNeon(isNeon);
    }

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
    if (this.sceneManager && this.sceneManager.requestShadowUpdate) this.sceneManager.requestShadowUpdate(25);
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

    if (this.sceneManager && this.sceneManager.requestShadowUpdate) this.sceneManager.requestShadowUpdate(15);
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

    this.rushTime = 25.0;
    this.rushElapsed = 0.0;
    this.rushLevel = 1;
    if (this.isRushMode && this.isOverdriveMode) {
      this.isOverdriveMode = false;
      if (this.gameLogic) this.gameLogic.setOverdriveMode(false);
      this.updateOverdriveHUD();
    }
    if (this.gameLogic) this.gameLogic.rushLevel = 1;
    this.updateRushHeatBadge();
    this.updateNextTileUI();
    this.updateStreakFeverUI();
  }

  toggleBossRaid(forceState = null) {
    const targetState = forceState !== null ? forceState : !this.isBossRaid;
    this.isBossRaid = targetState;
    if (this.isBossRaid && this.isOverdriveMode) {
      this.isOverdriveMode = false;
      if (this.gameLogic) this.gameLogic.setOverdriveMode(false);
      this.updateOverdriveHUD();
    }
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

  startOverdriveMode() {
    if (this.isRushMode) this.toggleRushMode(false);
    if (this.isBossRaid) this.toggleBossRaid(false);
    this.isOverdriveMode = true;
    if (this.gameLogic) this.gameLogic.setOverdriveMode(true);
    this.startNewGame(false);
    this.showSpellToast(t('overdrive_activated_toast') || '✨ OVERDRIVE KÍCH HOẠT: Chỉ sinh khối 4-8, Cầu Vồng ★ & Điểm x1.5!');
    this.updateOverdriveHUD();
    this.updateNextTileUI();
  }

  updateOverdriveHUD() {
    const badge = document.getElementById('badge-overdrive-mode');
    if (!badge) return;
    badge.style.display = this.isOverdriveMode ? 'inline-flex' : 'none';
  }

  handleBossToggleClick() {
    if (this.isBossRaid) {
      this.toggleBossRaid(false);
      this.showSpellToast(t('boss_exited_toast') || 'Đã rời khỏi chế độ Đấu Trùm.');
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
      this.showSpellToast(t('rush_exited_toast') || 'Đã rời khỏi chế độ Đua Giờ.');
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
    this.showSpellToast(t('boss_activated_toast') || '⚔️ Chiến dịch Đấu Trùm đã khởi động!');
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
    this.showSpellToast(t('rush_activated_toast') || '⚡ Chế độ Đua Giờ đã kích hoạt!');
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
    const warningTitleEl = modal.querySelector('.mode-warning-text strong');
    const warningDescEl = modal.querySelector('.mode-warning-text span');
    const dontAskSpan = modal.querySelector('.mode-dont-ask span');
    const cancelBtn = document.getElementById('btn-mode-confirm-cancel');
    const startBtnText = document.getElementById('mode-confirm-start-text');

    if (dontShowCheckbox) dontShowCheckbox.checked = false;
    if (warningTitleEl) warningTitleEl.textContent = t('mode_warning_title');
    if (warningDescEl) warningDescEl.textContent = t('mode_warning_desc');
    if (dontAskSpan) dontAskSpan.textContent = t('mode_dont_ask');
    if (cancelBtn) {
      const span = cancelBtn.querySelector('span');
      if (span) span.textContent = t('mode_btn_cancel');
    }
    if (startBtnText) startBtnText.textContent = t('mode_btn_start');

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
            <span class="mode-rule-bullet">⚡</span>
            <div><strong>${t('rule_rush_bonus_title')}</strong> ${t('rule_rush_bonus_desc')}</div>
          </div>
        `;
      }
    }

    const bodyEl = modal.querySelector('.mode-confirm-body');
    if (bodyEl) bodyEl.scrollTop = 0;

    soundManager.playClick();
    modal.style.display = 'flex';
    modal.classList.add('active');
  }

  updateDynamicLanguageTexts() {
    const confirmModal = document.getElementById('mode-confirm-modal');
    if (confirmModal && confirmModal.classList.contains('active') && confirmModal.dataset.pendingMode) {
      this.openModeConfirmModal(confirmModal.dataset.pendingMode);
    }
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
      if (textEl) textEl.textContent = t('btn_rush') || 'RUSH';
    }
    const mobileRotateText = document.getElementById('hint-mobile-rotate-text');
    if (mobileRotateText) {
      mobileRotateText.textContent = this.isCameraLocked ? (t('hint_mobile_cam_locked') || 'Góc nhìn đã khóa') : (t('hint_mobile_rotate') || '2 ngón để xoay');
    }
  }

  spawnSpecificTile(l, r, c, value, delay = 0, isWildcard = false) {
    const tile3D = new Tile3D(l, r, c, value, this.sceneManager.scene, this.currentShape, false, 0, isWildcard);
    this.tiles3D[l][r][c] = tile3D;
    this.gameLogic.setTile(l, r, c, { value, id: tile3D.id, isBomb: false, bombCountdown: 0, isWildcard });
    const spawnTween = tile3D.spawnAnimation(delay);
    if (!this._activeSpawnTweens) this._activeSpawnTweens = [];
    if (spawnTween) this._activeSpawnTweens.push(spawnTween);
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
        destroy: () => this.handleSpellDestroy(),
        cancel: () => {
          if (this.isSwapMode) this.cancelSwapMode();
          if (this.isDestroyMode) this.cancelDestroyMode();
        }
      },
      (clientX, clientY, altX, altY) => this.handleCanvasClick(clientX, clientY, altX, altY),
      (preset) => {
        if (preset === 'orbit') {
          const isRotating = this.sceneManager.toggleAutoRotate();
          document.getElementById('btn-toggle-orbit')?.classList.toggle('active', isRotating);
        } else {
          this.sceneManager.snapCamera(preset);
          document.getElementById('btn-toggle-orbit')?.classList.remove('active');
        }
      },
      () => this.cycleSliceMode()
    );

    this.initTileGrabControls();

    this.container.addEventListener('pointermove', (e) => {
      if (!this.isSwapMode || this.isAnimating) return;
      this.handleCanvasPointerMove(e.clientX, e.clientY);
    });

    this.container.addEventListener('pointerleave', () => {
      if (this.hoveredTile) {
        if (!this.isTileSwapSelected(this.hoveredTile)) {
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
      const modeName = isDark ? t('theme_gentle_dark') : t('theme_gentle_light');
      this.showSpellToast((t('theme_toast_sys') || 'THEO THIẾT BỊ: {mode}').replace('{mode}', modeName));
    } else if (pref === 'gentle_light' || pref === 'zen_clay') {
      targetTheme = 'gentle_light';
      this.showSpellToast(t('theme_toast_light') || 'GIAO DIỆN: Sáng dịu mắt');
    } else if (pref === 'gentle_dark' || pref === 'modern_slate') {
      targetTheme = 'gentle_dark';
      this.showSpellToast(t('theme_toast_dark') || 'GIAO DIỆN: Tối sâu thẳm');
    } else {
      const themeSelect = document.getElementById('select-theme');
      const label = themeSelect && themeSelect.selectedOptions && themeSelect.selectedOptions[0] ? themeSelect.selectedOptions[0].text : pref;
      this.showSpellToast((t('theme_toast_bg') || 'HÌNH NỀN: {label}').replace('{label}', label));
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
    const disc = document.getElementById('dpad-disc');
    if (!dirPad || !disc) return;

    let activePointerId = null;
    let lastTriggeredDir = null;
    let lastTriggerTime = 0;

    const petals = {
      up: disc.querySelector('.dpad-petal-up'),
      right: disc.querySelector('.dpad-petal-right'),
      down: disc.querySelector('.dpad-petal-down'),
      left: disc.querySelector('.dpad-petal-left')
    };

    const clearActivePetals = () => {
      Object.values(petals).forEach(p => p && p.classList.remove('active'));
      disc.style.transform = '';
      if (this.ghostPreview) this.ghostPreview.hideGhost();
      lastTriggeredDir = null;
    };

    const triggerDir = (dir) => {
      if (!dir) return;
      const now = performance.now();
      if (dir === lastTriggeredDir && now - lastTriggerTime < 160) {
        return;
      }
      lastTriggeredDir = dir;
      lastTriggerTime = now;

      // Visual highlight on petal
      Object.entries(petals).forEach(([d, p]) => {
        if (!p) return;
        if (d === dir) p.classList.add('active');
        else p.classList.remove('active');
      });

      // 3D tactile tilt on the unified disc
      const tilts = {
        up: 'perspective(360px) rotateX(7deg) translateY(-2px)',
        down: 'perspective(360px) rotateX(-7deg) translateY(2px)',
        left: 'perspective(360px) rotateY(-7deg) translateX(-2px)',
        right: 'perspective(360px) rotateY(7deg) translateX(2px)'
      };
      disc.style.transform = tilts[dir] || '';

      // Ghost preview
      if (this.ghostPreview) this.ghostPreview.showGhost(dir);

      // Tactile haptic feedback
      if (navigator.vibrate) {
        try { navigator.vibrate(10); } catch {}
      }

      // Execute move immediately
      if (this.inputManager && !this.inputManager.enabled) return;
      this.handleMove(dir);
    };

    const getDirFromCoords = (clientX, clientY) => {
      const rect = disc.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = clientX - cx;
      const dy = clientY - cy;
      const dist = Math.hypot(dx, dy);

      // Deadzone around center hub (14px)
      if (dist < 14) return null;

      const angleDeg = Math.atan2(dy, dx) * (180 / Math.PI);
      if (angleDeg >= -135 && angleDeg < -45) return 'up';
      if (angleDeg >= -45 && angleDeg < 45) return 'right';
      if (angleDeg >= 45 && angleDeg < 135) return 'down';
      return 'left';
    };

    // Full 360-degree pointer drag & continuous glide across petals
    disc.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      activePointerId = e.pointerId;
      try { disc.setPointerCapture(e.pointerId); } catch {}
      const dir = getDirFromCoords(e.clientX, e.clientY);
      if (dir) triggerDir(dir);
    });

    disc.addEventListener('pointermove', (e) => {
      if (activePointerId !== e.pointerId) return;
      e.preventDefault();
      e.stopPropagation();
      const dir = getDirFromCoords(e.clientX, e.clientY);
      if (dir && dir !== lastTriggeredDir) {
        triggerDir(dir);
      }
    });

    const onPointerRelease = (e) => {
      if (activePointerId === e.pointerId) {
        activePointerId = null;
        try { disc.releasePointerCapture(e.pointerId); } catch {}
      }
      setTimeout(clearActivePetals, 90);
    };

    disc.addEventListener('pointerup', onPointerRelease);
    disc.addEventListener('pointercancel', onPointerRelease);

    // Support discrete tapping on individual petals
    disc.querySelectorAll('.dpad-petal[data-dir]').forEach(petal => {
      petal.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        triggerDir(petal.dataset.dir);
        setTimeout(clearActivePetals, 100);
      });
    });

    // Layer up / down buttons in 3D mode
    const layerUp = document.getElementById('btn-layer-up');
    const layerDown = document.getElementById('btn-layer-down');
    [layerUp, layerDown].forEach(btn => {
      if (!btn) return;
      const onLayerTrigger = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const dir = btn.dataset.dir;
        btn.classList.add('active');
        if (navigator.vibrate) { try { navigator.vibrate(10); } catch {} }
        if (this.inputManager && !this.inputManager.enabled) return;
        this.handleMove(dir);
        setTimeout(() => btn.classList.remove('active'), 120);
      };
      btn.addEventListener('pointerdown', onLayerTrigger);
      btn.addEventListener('click', onLayerTrigger);
    });

    this.updateDpadLayerDock();
  }

  updateDpadLayerDock() {
    const dock = document.getElementById('dpad-layer-dock');
    if (!dock) return;
    dock.style.display = this.mode === '3x3x3' ? 'flex' : 'none';
  }

  setupCameraSnapBar() {
    const bar = document.getElementById('camera-snap-bar');
    if (!bar) return;

    const toggleBtn = document.getElementById('btn-camera-menu-toggle');
    const badgeLabel = document.getElementById('cam-active-preset-label');
    let autoCollapseTimer = null;

    const collapseMenu = () => {
      bar.classList.add('collapsed');
      bar.classList.remove('expanded');
      if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
      if (autoCollapseTimer) {
        clearTimeout(autoCollapseTimer);
        autoCollapseTimer = null;
      }
    };

    const expandMenu = () => {
      bar.classList.remove('collapsed');
      bar.classList.add('expanded');
      if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'true');
      if (autoCollapseTimer) clearTimeout(autoCollapseTimer);
      autoCollapseTimer = setTimeout(() => {
        collapseMenu();
      }, 4000);
    };

    if (toggleBtn) {
      toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (bar.classList.contains('expanded')) {
          collapseMenu();
        } else {
          expandMenu();
        }
        this.registerInteraction();
      });
    }

    // Isolate camera snap bar and flyout from canvas pointer/touch gestures
    bar.addEventListener('pointerdown', (e) => e.stopPropagation());
    bar.addEventListener('touchstart', (e) => e.stopPropagation(), { passive: true });

    document.addEventListener('pointerdown', (e) => {
      if (bar.classList.contains('expanded') && !bar.contains(e.target)) {
        collapseMenu();
      }
    });

    const presetLabels = {
      '1': 'Iso',
      '2': 'Top',
      '3': 'Front',
      'orbit': '360°'
    };

    bar.querySelectorAll('.cam-btn[data-preset]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const presetKey = btn.dataset.preset;
        if (presetKey === 'orbit') {
          const isRotating = this.sceneManager.toggleAutoRotate();
          btn.classList.toggle('active', isRotating);
          if (badgeLabel) badgeLabel.textContent = isRotating ? '360°' : 'Iso';
        } else {
          const preset = parseInt(presetKey, 10);
          this.sceneManager.snapCamera(preset);
          document.getElementById('btn-toggle-orbit')?.classList.remove('active');
          bar.querySelectorAll('.cam-btn[data-preset]').forEach(b => {
            if (b.dataset.preset !== 'orbit') b.classList.toggle('active', b === btn);
          });
          if (badgeLabel && presetLabels[presetKey]) {
            badgeLabel.textContent = presetLabels[presetKey];
          }
        }
        this.registerInteraction();
        setTimeout(() => {
          collapseMenu();
        }, 220);
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

    if (!this._tileGroupCache) this._tileGroupCache = [];
    const tileGroups = this._tileGroupCache;
    tileGroups.length = 0;
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
    if (tileGroups.length === 0) return null;

    const raycaster = this._raycaster || (this._raycaster = new THREE.Raycaster());
    const ndc = this._ndcVec || (this._ndcVec = new THREE.Vector2());

    const probe = (px, py) => {
      const x = ((px - rect.left) / rect.width) * 2 - 1;
      const y = -((py - rect.top) / rect.height) * 2 + 1;
      ndc.set(x, y);
      raycaster.setFromCamera(ndc, this.sceneManager.camera);
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
    };

    let hit = probe(clientX, clientY);
    if (hit) return hit;

    // Mobile touch & WebKit proximity fallback: check slight offsets (±14px, ±22px)
    const offsets = [
      [0, -14], [0, 14], [-14, 0], [14, 0],
      [-12, -12], [12, -12], [-12, 12], [12, 12],
      [0, -22], [0, 22], [-22, 0], [22, 0]
    ];
    for (let i = 0; i < offsets.length; i++) {
      hit = probe(clientX + offsets[i][0], clientY + offsets[i][1]);
      if (hit) return hit;
    }

    // 2D Screen-space Proximity Projection (Guarantees 100% mobile touch reliability)
    let closestTile = null;
    let minDistance = 140; // 140px generous proximity allowance for touch and mouse clicks
    const worldPos = this._projVec || (this._projVec = new THREE.Vector3());

    for (let l = 0; l < this.tiles3D.length; l++) {
      for (let r = 0; r < this.tiles3D[l].length; r++) {
        for (let c = 0; c < this.tiles3D[l][r].length; c++) {
          const tile = this.tiles3D[l][r][c];
          if (!tile || !tile.group) continue;

          tile.group.getWorldPosition(worldPos);
          worldPos.y += 0.25;
          worldPos.project(this.sceneManager.camera);

          // Only consider tiles in front of the camera (z < 1)
          if (worldPos.z >= 1) continue;

          const screenX = rect.left + (worldPos.x * 0.5 + 0.5) * rect.width;
          const screenY = rect.top + (-(worldPos.y * 0.5) + 0.5) * rect.height;
          const dist = Math.hypot(clientX - screenX, clientY - screenY);

          if (dist < minDistance) {
            minDistance = dist;
            closestTile = tile;
          }
        }
      }
    }
    if (closestTile) return closestTile;

    return null;
  }

  handleCanvasPointerMove(clientX, clientY) {
    if (!this.isSwapMode || this.isAnimating || this.gameLogic.gameOver) return;

    const hitTile = this.findTileFromPoint(clientX, clientY);

    if (hitTile !== this.hoveredTile) {
      if (this.hoveredTile && !this.isTileSwapSelected(this.hoveredTile)) {
        this.hoveredTile.setHovered(false);
      }
      this.hoveredTile = hitTile;
      if (hitTile && !this.isTileSwapSelected(hitTile)) {
        hitTile.setHovered(true);
      }
    }
  }

  isTileSwapSelected(tile) {
    return Boolean(tile && (tile === this.swapSelectedTileA || tile === this.swapSelectedTileB || tile === this.destroyTargetTile));
  }

  initTileGrabControls() {
    // Tile Grab feature permanently decommissioned: all touches and pointer interactions
    // are now dedicated 100% to instant, butter-smooth 2048 board swiping via InputManager.
    // This completely eliminates gesture hijacking, perceived input lag, and mobile freezes.
  }

  onTileGrabStart() {}
  onTileGrabMove() {}
  onTileGrabEnd() {}
  onTileGrabCancel() {
    if (this.heldTile) {
      try { this.heldTile.setHeld(false); } catch {}
      this.heldTile = null;
      this.heldTileOrigin = null;
    }
    document.body.classList.remove('tile-grabbing');
    if (this.container) this.container.style.cursor = 'default';
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

  updateNextTileUI() {
    if (!this.nextTileValEl || !this.gameLogic || typeof this.gameLogic.getNextSpawnPreview !== 'function') return;
    const preview = this.gameLogic.getNextSpawnPreview();
    if (!preview) return;

    this.nextTileValEl.className = 'next-tile-chip';
    if (preview.isBomb) {
      this.nextTileValEl.textContent = '💣';
      this.nextTileValEl.classList.add('is-bomb');
    } else if (preview.isWildcard || preview.value === 0) {
      this.nextTileValEl.textContent = '★';
      this.nextTileValEl.classList.add('is-wildcard');
    } else {
      this.nextTileValEl.textContent = String(preview.value);
      this.nextTileValEl.classList.add(`is-val-${preview.value}`);
    }
  }

  updateStreakFeverUI(justActivatedFever = false) {
    const streak = this.gameLogic ? (this.gameLogic.mergeStreak || 0) : 0;
    const isFever = streak >= 5;
    document.body.classList.toggle('fever-active', isFever);

    if (this.streakFeverPillEl) {
      if (streak >= 2) {
        this.streakFeverPillEl.style.display = 'inline-flex';
        this.streakFeverPillEl.classList.toggle('is-fever', isFever);
        if (this.streakCountTextEl) {
          this.streakCountTextEl.textContent = `${t('streak_label') || 'CHUỖI'} ×${streak}`;
        }
        if (this.feverModeTagEl) {
          this.feverModeTagEl.style.display = isFever ? 'inline-flex' : 'none';
          this.feverModeTagEl.textContent = t('fever_badge_label') || 'FEVER x2';
        }
      } else {
        this.streakFeverPillEl.style.display = 'none';
        this.streakFeverPillEl.classList.remove('is-fever');
      }
    }

    if (justActivatedFever && !(this.aiBot && this.aiBot.isRunning)) {
      soundManager.playFeverActivate();
      this.showSpellToast(t('fever_activated_toast') || '🔥 FEVER x2 KÍCH HOẠT! (Gộp liên hoàn 5 nước — Nhân đôi điểm)');
    }
  }

  updateDangerState() {
    if (!this.gameLogic) return;
    const empty = this.gameLogic.getEmptyCellsCount();
    const isAi = !!(this.aiBot && this.aiBot.isRunning);
    const isDanger = !this.gameLogic.gameOver && empty > 0 && empty <= 2 && !isAi;

    document.body.classList.toggle('board-danger-pulse', isDanger);
    document.body.classList.toggle('danger-critical', isDanger && empty === 1);

    if (isDanger) {
      const now = performance.now();
      const enteredDanger = (this._lastDangerEmpty === null || this._lastDangerEmpty > 2);
      const worsenedToCritical = (this._lastDangerEmpty === 2 && empty === 1);
      if ((enteredDanger || worsenedToCritical) && (now - (this._lastHeartbeatAt || 0) > 1400)) {
        this._lastHeartbeatAt = now;
        soundManager.playHeartbeatPulse(empty === 1);
      }
    }
    this._lastDangerEmpty = empty;
  }

  buildEmojiBoardSummary() {
    const score = this.gameLogic ? this.gameLogic.score : 0;
    const maxTile = this.maxTileValue || 2;
    const bestStreak = this.gameLogic ? (this.gameLogic.maxMergeStreak || 0) : 0;
    const modeParts = [this.mode === '3x3x3' ? '3x3x3' : '4x4'];
    if (this.isRushMode) modeParts.push('Rush');
    if (this.isBossRaid) modeParts.push('Boss');
    if (this.isOverdriveMode) modeParts.push('Overdrive');

    const toEmoji = (cell) => {
      if (!cell) return '⬛';
      if (cell.isWildcard || cell.value === 0) return '🌈';
      if (cell.isBomb) return '💣';
      const v = cell.value;
      if (v >= 2048) return '👑';
      if (v >= 1024) return '🔮';
      if (v >= 256) return '🟪';
      if (v >= 64) return '🟥';
      if (v >= 16) return '🟧';
      if (v >= 8) return '🟩';
      return '🟦';
    };

    const lines = [`🧊 3D 2048 (${modeParts.join(' • ')})`, `🏆 ${Number(score).toLocaleString()} | Max: ${maxTile}${bestStreak >= 2 ? ` | 🔥 ×${bestStreak}` : ''}`];
    if (this.gameLogic && this.gameLogic.grid) {
      for (let l = 0; l < this.gameLogic.layers; l++) {
        if (this.gameLogic.layers > 1) {
          lines.push(`L${l + 1}:`);
        }
        for (let r = 0; r < this.gameLogic.rows; r++) {
          lines.push(this.gameLogic.grid[l][r].map(toEmoji).join(''));
        }
      }
    }
    return lines.join('\n');
  }

  async copyEmojiGridSummary() {
    const text = this.buildEmojiBoardSummary();
    let copied = false;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        copied = true;
      }
    } catch {}
    if (!copied) {
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        copied = document.execCommand('copy');
        ta.remove();
      } catch {}
    }
    this.showSpellToast(t('emoji_grid_copied') || '📋 Đã chép lưới Emoji chiến tích vào bộ nhớ tạm!');
    return text;
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
    if (this.sceneManager && this.sceneManager.scene && this.sceneManager.scene.children) {
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
  }


  isAnyModalOpen() {
    const modalIds = [
      'settings-modal',
      'welcome-modal',
      'trophy-modal',
      'mode-confirm-modal',
      'share-modal',
      'boss-victory-modal',
      'modal-overlay'
    ];
    return modalIds.some(id => {
      const el = document.getElementById(id);
      if (!el) return false;
      return el.classList.contains('active');
    });
  }

  closeTopActiveModal() {
    const checkModal = (id) => {
      const el = document.getElementById(id);
      return el && (el.classList.contains('active') || (el.style.display !== 'none' && el.style.display !== ''));
    };

    if (checkModal('settings-modal')) {
      const closeBtn = document.getElementById('btn-close-settings');
      if (closeBtn) closeBtn.click();
      else document.getElementById('settings-modal').classList.remove('active');
      return true;
    }
    if (checkModal('share-modal')) {
      const closeBtn = document.getElementById('btn-close-share');
      if (closeBtn) closeBtn.click();
      else document.getElementById('share-modal').style.display = 'none';
      return true;
    }
    if (checkModal('trophy-modal')) {
      const closeBtn = document.getElementById('trophy-modal-close');
      if (closeBtn) closeBtn.click();
      else document.getElementById('trophy-modal').style.display = 'none';
      return true;
    }
    if (checkModal('mode-confirm-modal')) {
      const closeBtn = document.getElementById('mode-confirm-close');
      if (closeBtn) closeBtn.click();
      else document.getElementById('mode-confirm-modal').style.display = 'none';
      return true;
    }
    if (checkModal('welcome-modal')) {
      const closeBtn = document.getElementById('welcome-modal-close');
      if (closeBtn) closeBtn.click();
      else document.getElementById('welcome-modal').style.display = 'none';
      return true;
    }
    if (checkModal('boss-victory-modal')) {
      const closeBtn = document.getElementById('boss-victory-btn-restart');
      if (closeBtn) closeBtn.click();
      else document.getElementById('boss-victory-modal').style.display = 'none';
      return true;
    }
    if (checkModal('modal-overlay')) {
      const closeBtn = document.getElementById('modal-btn-secondary');
      if (closeBtn) closeBtn.click();
      else document.getElementById('modal-overlay').classList.remove('active');
      return true;
    }

    const shapeDropdownWrapper = document.getElementById('shape-dropdown-wrapper');
    if (shapeDropdownWrapper && shapeDropdownWrapper.classList.contains('open')) {
      shapeDropdownWrapper.classList.remove('open');
      const shapeGlassMenu = document.getElementById('shape-glass-menu');
      if (shapeGlassMenu) {
        shapeGlassMenu.classList.remove('open');
        shapeGlassMenu.style.setProperty('display', 'none', 'important');
      }
      return true;
    }

    if (this.isSwapMode) {
      this.cancelSwapMode();
      return true;
    }
    if (this.isDestroyMode) {
      this.cancelDestroyMode();
      return true;
    }

    return false;
  }

  saveGameState(immediate = false) {
    if (immediate) {
      if (this._saveGameDebounceTimer) {
        clearTimeout(this._saveGameDebounceTimer);
        this._saveGameDebounceTimer = null;
      }
      this._flushSaveGameState();
      return;
    }
    if (this._saveGameDebounceTimer) clearTimeout(this._saveGameDebounceTimer);
    this._saveGameDebounceTimer = setTimeout(() => {
      this._saveGameDebounceTimer = null;
      this._flushSaveGameState();
    }, 250);
  }

  _flushSaveGameState() {
    try {
      if (this.gameLogic.gameOver) {
        this.clearSavedGameState();
        return;
      }
      const state = this.gameLogic.serializeState();
      state.rushTime = this.rushTime;
      state.rushElapsed = this.rushElapsed || 0;
      state.rushLevel = this.rushLevel || 1;
      state.moveCount = this.moveCount;
      state.elapsedSeconds = Math.round((Date.now() - this.matchStartTime) / 1000);
      state.maxTileValue = this.maxTileValue;
      state.mergeCount = this.mergeCount;
      state.mergeTierCounts = this.mergeTierCounts;
      if (this.isBossRaid && this.bossManager) {
        state.isBossRaid = true;
        state.bossState = {
          phase: this.bossManager.phase,
          hp: this.bossManager.hp,
          maxHp: this.bossManager.maxHp,
          timer: this.bossManager.timer,
          clearTime: this.bossManager.clearTime
        };
      }
      localStorage.setItem(`3d2048_saved_${this.mode}`, JSON.stringify(state));
    } catch {}
  }

  clearSavedGameState() {
    if (this._saveGameDebounceTimer) {
      clearTimeout(this._saveGameDebounceTimer);
      this._saveGameDebounceTimer = null;
    }
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
      this.isRushMode = !!this.gameLogic.isRushMode;
      if (this.rushToggleBtn) {
        const textEl = this.rushToggleBtn.querySelector('.btn-text');
        if (textEl) textEl.textContent = t('btn_rush') || 'RUSH';
        this.rushToggleBtn.classList.toggle('active', this.isRushMode);
      }
      if (this.rushPanel) {
        this.rushPanel.style.display = this.isRushMode ? 'flex' : 'none';
      }
      this.isOverdriveMode = !!this.gameLogic.isOverdriveMode;
      this.updateOverdriveHUD();
      this.rushTime = typeof data.rushTime === 'number' ? data.rushTime : 25.0;
      this.rushElapsed = data.rushElapsed || 0;
      this.rushLevel = data.rushLevel || 1;
      if (this.gameLogic) this.gameLogic.rushLevel = this.rushLevel;
      this.updateRushHeatBadge();
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
              const tile3D = new Tile3D(l, r, c, cell.value, this.sceneManager.scene, this.currentShape, cell.isBomb, cell.bombCountdown, cell.isWildcard);
              this.tiles3D[l][r][c] = tile3D;
              this.gameLogic.setTile(l, r, c, { value: cell.value, id: tile3D.id, isBomb: cell.isBomb, bombCountdown: cell.bombCountdown, isWildcard: cell.isWildcard });
              tile3D.spawnAnimation();
              this.maxTileValue = Math.max(this.maxTileValue, cell.value);
            }
          }
        }
      }

      if (data.isBossRaid && this.bossManager) {
        this.isBossRaid = true;
        this.bossManager.isActive = true;
        if (data.bossState) {
          this.bossManager.phase = data.bossState.phase || 1;
          this.bossManager.hp = data.bossState.hp !== undefined ? data.bossState.hp : this.bossManager.maxHp;
          this.bossManager.maxHp = data.bossState.maxHp || this.bossManager.maxHp;
          this.bossManager.timer = data.bossState.timer !== undefined ? data.bossState.timer : 120.0;
          this.bossManager.clearTime = data.bossState.clearTime || 0;
          this.bossManager.loop = data.bossState.loop || 1;
        }
        document.body.classList.add('in-boss-mode');
        if (this.bossManager.hudEl) this.bossManager.hudEl.style.display = 'flex';
        if (this.bossManager.boss3D) {
          this.bossManager.boss3D.setVisible(true);
          this.bossManager.boss3D.setPhase(this.bossManager.phase, false);
          this.bossManager.boss3D.setHpRatio(this.bossManager.hp / this.bossManager.maxHp);
        }
        if (this.bossManager.updateHUD) this.bossManager.updateHUD();
      }
      this.updateScoreUI();
      this.updateSpellUI();
      this.updateNextTileUI();
      this.updateStreakFeverUI();
      this.updateDangerState();
      this.showSpellToast(t('toast_restore_saved'));

      if (!this.gameLogic.hasValidMoves()) {
        setTimeout(() => {
          if (this.hasRescueSpell()) {
            this.enterRescueMode();
          } else {
            this.triggerGameOverModal();
          }
        }, 300);
      }
      return true;
    } catch (e) {
      console.warn('Could not restore saved game:', e);
      return false;
    }
  }

  handleContextRestored() {
    console.log('♻️ Rebuilding all tile textures & 3D meshes after WebGL recovery...');
    if (this.textureManager) {
      this.textureManager.disposeAll();
    }
    for (let l = 0; l < this.tiles3D.length; l++) {
      for (let r = 0; r < this.tiles3D[l].length; r++) {
        for (let c = 0; c < this.tiles3D[l][r].length; c++) {
          const tile = this.tiles3D[l][r][c];
          if (tile) tile.buildGeometry();
        }
      }
    }
    if (this.board && this.board.buildBoard) {
      this.board.buildBoard();
    }
    if (this.sceneManager) {
      this.sceneManager.resetCamera();
    }
    this.isAnimating = false;
    this.showSpellToast(t('webgl_recovered_toast') || '⚡ Đã khôi phục đồ họa WebGL!');
  }

  setGraphicsQuality(quality) {
    this.graphicsQuality = quality;
    setTileGraphicsQuality(quality);
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
    this.showSpellToast(`🎮 ${labelText}`);
    this.registerInteraction();
  }

  reactBoardToMove(direction) {
    if (this.graphicsQuality !== 'high') return;
    if (!this.board || !this.board.group) return;

    gsap.killTweensOf(this.board.group.rotation);

    let tiltX = 0;
    let tiltZ = 0;
    // Classy micro-tilt: barely ~0.35 deg, provides tactile weight without dizziness
    if (direction === 'left') {
      tiltZ = -0.007;
    } else if (direction === 'right') {
      tiltZ = 0.007;
    } else if (direction === 'up') {
      tiltX = -0.007;
    } else if (direction === 'down') {
      tiltX = 0.007;
    }

    if (tiltX !== 0 || tiltZ !== 0) {
      gsap.to(this.board.group.rotation, {
        x: tiltX,
        z: tiltZ,
        duration: 0.05,
        ease: 'power2.out',
        onComplete: () => {
          gsap.to(this.board.group.rotation, {
            x: 0,
            y: 0,
            z: 0,
            duration: 0.12,
            ease: 'power2.out'
          });
        }
      });
    }
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
        const modeName = this.mode === '3x3x3' ? t('mode_3x3x3') : t('mode_4x4');
        const shareUrl = window.location.href.split('?')[0].split('#')[0] || 'https://3d-2048-hypercube-goll.vercel.app/';

        const challengeText = (t('challenge_msg_template') || '⚡ THÁCH ĐẤU 2048 KHÔNG GIAN 3D ⚡\n🏆 Kỷ lục: {score} điểm ({mode})\n💎 Khối đỉnh cao: {tile}\n🎯 Bạn có vượt qua được mốc này không?\n👉 Chơi ngay trên trình duyệt:\n{url}')
          .replace('{score}', Number(score).toLocaleString())
          .replace('{mode}', modeName)
          .replace('{tile}', maxTileVal)
          .replace('{url}', shareUrl);

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

    // Close Settings modal if open so share modal takes clear foreground focus
    const settingsModal = document.getElementById('settings-modal');
    if (settingsModal && (settingsModal.classList.contains('active') || settingsModal.style.display !== 'none')) {
      settingsModal.classList.remove('active');
      settingsModal.style.display = 'none';
    }

    const score = this.gameLogic ? this.gameLogic.score : 0;
    const modeName = this.mode === '3x3x3' ? t('mode_3x3x3') : t('mode_4x4');

    const scoreEl = document.getElementById('share-preview-score');
    const modeEl = document.getElementById('share-preview-mode');
    if (scoreEl) scoreEl.textContent = Number(score).toLocaleString();
    if (modeEl) modeEl.textContent = `${t('share_mode_prefix') || 'Chế độ'}: ${modeName}`;

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

  async createShareCardBlob(score, maxTileVal, modeName) {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1080;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      // 1. Background gradient (Rich Dark Cyber & Deep Cosmic)
      const bgGrad = ctx.createLinearGradient(0, 0, 1080, 1080);
      bgGrad.addColorStop(0, '#090d16');
      bgGrad.addColorStop(0.5, '#111827');
      bgGrad.addColorStop(1, '#05070e');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1080, 1080);

      // Radial subtle ambient glow
      const radialGlow = ctx.createRadialGradient(540, 540, 50, 540, 540, 600);
      radialGlow.addColorStop(0, 'rgba(59, 130, 246, 0.18)');
      radialGlow.addColorStop(0.6, 'rgba(139, 92, 246, 0.08)');
      radialGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = radialGlow;
      ctx.fillRect(0, 0, 1080, 1080);

      // 2. Draw 3D board snapshot in center (fit inside 740x740 at x: 170, y: 160)
      if (this.sceneManager && this.sceneManager.renderer) {
        const webglCanvas = this.sceneManager.renderer.domElement;
        if (webglCanvas && webglCanvas.width > 0 && webglCanvas.height > 0) {
          this.sceneManager.renderer.render(this.sceneManager.scene, this.sceneManager.camera);
          const boardW = 740;
          const boardH = 740;
          const boardX = (1080 - boardW) / 2;
          const boardY = 160;

          ctx.save();
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(boardX, boardY, boardW, boardH, 24);
          } else {
            ctx.rect(boardX, boardY, boardW, boardH);
          }
          ctx.clip();
          ctx.drawImage(webglCanvas, 0, 0, webglCanvas.width, webglCanvas.height, boardX, boardY, boardW, boardH);
          ctx.restore();

          // Border for the 3D board
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
          ctx.lineWidth = 3;
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(boardX, boardY, boardW, boardH, 24);
          } else {
            ctx.rect(boardX, boardY, boardW, boardH);
          }
          ctx.stroke();
        }
      }

      // 3. Top Header: Title & Mode badge
      ctx.textAlign = 'center';
      ctx.fillStyle = '#60a5fa';
      ctx.font = 'bold 32px system-ui, -apple-system, sans-serif';
      ctx.fillText('3D 2048 & HYPERCUBE', 540, 80);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '600 20px system-ui, -apple-system, sans-serif';
      const modeLabel = (t('share_card_mode') || 'CHẾ ĐỘ').toUpperCase();
      ctx.fillText(`${modeLabel}: ${modeName.toUpperCase()}`, 540, 120);

      // 4. Bottom Score Banner Card
      const cardY = 935;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.90)';
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(140, cardY, 800, 105, 22);
      } else {
        ctx.rect(140, cardY, 800, 105);
      }
      ctx.fill();
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.45)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Score column (left)
      ctx.textAlign = 'left';
      ctx.fillStyle = '#94a3b8';
      ctx.font = '600 20px system-ui, -apple-system, sans-serif';
      ctx.fillText(t('share_card_score') || '🏆 ĐIỂM SỐ', 180, cardY + 42);

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 40px system-ui, -apple-system, sans-serif';
      ctx.fillText(Number(score).toLocaleString(), 180, cardY + 84);

      // Max tile column (right)
      ctx.textAlign = 'right';
      ctx.fillStyle = '#94a3b8';
      ctx.font = '600 20px system-ui, -apple-system, sans-serif';
      ctx.fillText(t('share_card_max_tile') || '⭐ KHỐI CAO NHẤT', 900, cardY + 42);

      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 40px system-ui, -apple-system, sans-serif';
      ctx.fillText(String(maxTileVal || 2), 900, cardY + 84);

      return new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), 'image/png');
      });
    } catch (err) {
      console.warn('Share card generation failed:', err);
      return null;
    }
  }

  async executeShare(app) {
    this.registerInteraction();
    const score = this.gameLogic ? this.gameLogic.score : 0;
    const modeName = this.mode === '3x3x3' ? t('mode_3x3x3') : t('mode_4x4');
    const shareText = (t('share_msg_template') || '🎮 Tôi vừa đạt {score} điểm ở chế độ {mode} trong 3D 2048 & Hypercube!')
      .replace('{score}', Number(score).toLocaleString())
      .replace('{mode}', modeName);
    const shareUrl = window.location.href.split('?')[0].split('#')[0] || 'https://3d-2048-hypercube-goll.vercel.app/';

    let snapshotFile = null;
    try {
      const cardBlob = await this.createShareCardBlob(score, this.maxTileValue, modeName);
      if (cardBlob) {
        snapshotFile = new File([cardBlob], `2048-share-${score}.png`, { type: 'image/png' });
      } else if (this.sceneManager && this.sceneManager.captureSnapshotBlob) {
        const rawBlob = await this.sceneManager.captureSnapshotBlob();
        if (rawBlob) {
          snapshotFile = new File([rawBlob], `2048-score-${score}.png`, { type: 'image/png' });
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
    if (!this.gameLogic || !this.sceneManager || !this.board) return;
    if (this.moveQueue) this.moveQueue.length = 0;
    if (this.heldTile) this.onTileGrabCancel();
    if (this.aiBot) this.aiBot.stop();
    this.hideModal();
    this.exitRescueMode(false);
    this.cancelSwapMode();
    this.cancelDestroyMode();
    this.isAnimating = false;

    if (checkSaved && this.restoreSavedGame()) {
      this.playBoardEntrance(true);
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
    this.rushTime = 25.0;
    this.rushElapsed = 0.0;
    this.rushLevel = 1;
    if (this.isOverdriveMode) {
      if (this.gameLogic) this.gameLogic.setOverdriveMode(true);
    } else {
      if (this.gameLogic) this.gameLogic.setOverdriveMode(false);
    }
    this.updateOverdriveHUD();
    if (this.gameLogic) this.gameLogic.rushLevel = 1;
    this.updateRushHeatBadge();
    this.updateScoreUI();
    this.updateSpellUI();
    this._lastDangerEmpty = null;

    // Spawn 2 initial tiles with staggered brick drop
    this.spawnTile(0);
    this.spawnTile(0.09);
    this.updateNextTileUI();
    this.updateStreakFeverUI();
    this.updateDangerState();

    this.playBoardEntrance();

    if (this.isBossRaid && this.bossManager) {
      this.bossManager.startRaid();
    }

    this.saveGameState();
    this.isAnimating = false;
  }

  spawnTile(delay = 0) {
    const spawnInfo = this.gameLogic.getRandomSpawnInfo();
    if (!spawnInfo) return null;

    const { l, r, c, value, isBomb, bombCountdown, isWildcard } = spawnInfo;
    const tile3D = new Tile3D(l, r, c, value, this.sceneManager.scene, this.currentShape, isBomb, bombCountdown, isWildcard);
    this.tiles3D[l][r][c] = tile3D;
    this.gameLogic.setTile(l, r, c, { value, id: tile3D.id, isBomb, bombCountdown, isWildcard });

    const spawnTween = tile3D.spawnAnimation(delay);
    if (!this._activeSpawnTweens) this._activeSpawnTweens = [];
    if (spawnTween) this._activeSpawnTweens.push(spawnTween);
    if (this.mode === '3x3x3' && typeof this.sliceMode === 'number') {
      tile3D.setSliceDim(l !== this.sliceMode);
    }
    if (this.sceneManager && this.sceneManager.requestShadowUpdate) this.sceneManager.requestShadowUpdate(20);
    if (isBomb) {
      soundManager.playBombTick();
    }
    this.updateNextTileUI();
    if (this.questManager) {
      this.questManager.recordTileDiscovery(isWildcard ? 'wildcard' : (isBomb ? 'bomb' : value));
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

  updateRushHeatBadge() {
    const badge = document.getElementById('rush-heat-badge');
    if (!badge) return;
    const rate = 1.0 + ((this.rushLevel || 1) - 1) * 0.25;
    badge.textContent = `x${rate.toFixed(2)}`;
    badge.className = `rush-heat-badge heat-lvl-${this.rushLevel || 1}`;
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

  showComboCallout(count, screenPos = null) {
    if (!this.comboCalloutEl) return;
    let text = '';
    let cls = 'combo-x2';
    if (count === 2) {
      text = t('combo_2') || 'Combo x2';
    } else if (count === 3) {
      text = t('combo_3') || 'Combo x3';
      cls = 'combo-x3';
    } else if (count === 4) {
      text = t('combo_4') || 'Combo x4';
      cls = 'combo-x4';
    } else {
      const raw = t('combo_5') || 'Combo x{n}';
      text = raw.replace('{n}', count);
      cls = 'combo-x5';
    }

    this.comboCalloutEl.className = `combo-callout ${cls}`;
    this.comboCalloutEl.textContent = text;
    this.comboCalloutEl.classList.remove('hidden');
    this.comboCalloutEl.removeAttribute('aria-hidden');

    if (screenPos) {
      this.comboCalloutEl.style.left = `${screenPos.x}px`;
      this.comboCalloutEl.style.top = `${screenPos.y - 32}px`;
      this.comboCalloutEl.style.transform = 'translate(-50%, -50%)';
    } else {
      this.comboCalloutEl.style.left = '50%';
      this.comboCalloutEl.style.top = '145px';
      this.comboCalloutEl.style.transform = 'translate(-50%, -50%)';
    }

    gsap.killTweensOf(this.comboCalloutEl);
    gsap.fromTo(this.comboCalloutEl,
      { scale: 0.6, opacity: 1, y: 0 },
      {
        scale: 1.25,
        opacity: 0,
        y: -48,
        duration: 0.95,
        ease: 'power2.out',
        onComplete: () => {
          this.comboCalloutEl.classList.add('hidden');
          this.comboCalloutEl.setAttribute('aria-hidden', 'true');
        }
      }
    );
  }

  showMilestoneCelebration(value) {
    if (this.aiBot && this.aiBot.isRunning) return;
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

  playBoardEntrance(isRestoring = false) {
    if (!this.board || !this.board.group) return;

    // 1. Futuristic Intro Audio Chime & Sub-bass Impact (guarded against autoplay restrictions)
    if (this.hasInteracted && soundManager && soundManager.playGameStartEntrance) {
      soundManager.playGameStartEntrance();
    }

    // 2. Camera Intro Glide / Dynamic Swoop
    if (this.sceneManager && this.sceneManager.playEntranceCameraSwoop) {
      this.sceneManager.playEntranceCameraSwoop(0.88);
    }

    // 3. Board Group 3D Descent with subtle tilt
    gsap.killTweensOf(this.board.group.position);
    gsap.killTweensOf(this.board.group.rotation);

    this.board.group.position.set(0, 0, 0);
    this.board.group.rotation.set(-0.08, 0.08, 0);

    gsap.to(this.board.group.rotation, {
      x: 0,
      y: 0,
      z: 0,
      duration: 0.85,
      ease: 'power3.out'
    });

    // 4. Ground Shockwave Ring on Impact (Zero screenShake here to protect camera alignment)
    setTimeout(() => {
      if (this.sceneManager && this.sceneManager.emitEntranceShockwave) {
        const waveColor = this.mode === '3x3x3' ? 0xa855f7 : 0x00f0ff;
        this.sceneManager.emitEntranceShockwave(waveColor);
      }
    }, 320);

    // 5. Cascading Tile Materialization with 360 Spin & Particle Sparks
    if (this.tiles3D) {
      let delayStep = 0.16;
      for (let l = 0; l < this.tiles3D.length; l++) {
        for (let r = 0; r < this.tiles3D[l].length; r++) {
          for (let c = 0; c < this.tiles3D[l][r].length; c++) {
            const tile = this.tiles3D[l][r][c];
            if (tile && tile.group) {
              const pos = getGridPosition(l, r, c);
              gsap.killTweensOf(tile.group.position);
              gsap.killTweensOf(tile.group.rotation);
              gsap.killTweensOf(tile.group.scale);

              tile.group.position.set(pos.x, pos.y, pos.z);
              tile.group.rotation.set(0, 0, 0);
              tile.group.scale.set(1, 1, 1);

              const currentTile = tile;
              gsap.fromTo(currentTile.group.scale,
                { x: 0.65, y: 0.65, z: 0.65 },
                {
                  x: 1, y: 1, z: 1,
                  duration: 0.24,
                  delay: delayStep,
                  ease: 'back.out(1.3)'
                }
              );

              delayStep += isRestoring ? 0.05 : 0.14;
            }
          }
        }
      }
    }

    // 6. Holographic Entrance Toast & Ambient Radial Flash
    this.showEntranceToast(isRestoring);
  }

  showEntranceToast(isRestoring = false) {
    // 1. Ambient Radial Lens Flare Flash
    let flash = document.querySelector('.game-intro-flash');
    if (!flash) {
      flash = document.createElement('div');
      flash.className = 'game-intro-flash';
      document.body.appendChild(flash);
    }
    gsap.killTweensOf(flash);
    gsap.fromTo(flash,
      { opacity: 0.65 },
      { opacity: 0, duration: 0.65, ease: 'power2.out' }
    );

    // 2. Holographic Entrance Toast
    const existing = document.querySelector('.game-entrance-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'game-entrance-toast';

    const is3D = this.mode === '3x3x3';
    const isBoss = this.isBossRaid;
    const isRush = this.isRushMode;

    let icon = '⚡';
    let title = isRestoring ? (t('welcome_back') || 'TRỞ LẠI') : (t('game_ready_callout') || 'SẴN SÀNG');
    let sub = is3D ? (t('mode_3x3x3') || '3x3x3 Khối 3D') : (t('game_ready_sub') || 'Vuốt để gộp số');

    if (isBoss) {
      icon = '⚔️';
      title = 'BOSS RAID';
      sub = '4 Phase';
    } else if (isRush) {
      icon = '⚡';
      title = 'TIME RUSH';
      sub = 'Chạy đua 30s';
    }

    toast.innerHTML = `
      <span class="entrance-toast-icon">${icon}</span>
      <div class="entrance-toast-content">
        <div class="entrance-toast-title">${title}</div>
        <div class="entrance-toast-sub">${sub}</div>
      </div>
    `;
    document.body.appendChild(toast);

    gsap.fromTo(toast,
      { y: -60, opacity: 0, scale: 0.8 },
      { y: 0, opacity: 1, scale: 1, duration: 0.55, ease: 'back.out(2.0)' }
    );

    setTimeout(() => {
      gsap.to(toast, {
        y: -30,
        opacity: 0,
        scale: 0.9,
        duration: 0.4,
        ease: 'power2.in',
        onComplete: () => toast.remove()
      });
    }, 1500);
  }

  /**
   * Authoritatively synchronize this.tiles3D and scene children with this.gameLogic.grid,
   * ensuring zero lingering ghost/orphaned Tile3D meshes after merges, lag, or early returns.
   */
  reconcileSceneTiles(newlySpawnedTile = null) {
    if (!this.gameLogic || !this.sceneManager?.scene) return;
    if (!this.tiles3D) {
      this.tiles3D = this.createEmptyTileGrid();
    }

    const validGroups = new Set();
    for (let l = 0; l < this.gameLogic.layers; l++) {
      for (let r = 0; r < this.gameLogic.rows; r++) {
        for (let c = 0; c < this.gameLogic.cols; c++) {
          const logicTile = this.gameLogic.grid[l]?.[r]?.[c] || null;
          let tile3D = this.tiles3D[l]?.[r]?.[c] || null;

          if (!logicTile) {
            if (tile3D) {
              tile3D.dispose(true);
              this.tiles3D[l][r][c] = null;
            }
            continue;
          }

          const needsRebuild = !tile3D || tile3D._disposed || !tile3D.group || !tile3D.group.parent ||
            (!!tile3D.isWildcard !== !!logicTile.isWildcard);

          if (needsRebuild) {
            if (tile3D && !tile3D._disposed) {
              tile3D.dispose(true);
            }
            tile3D = new Tile3D(
              l, r, c,
              logicTile.value,
              this.sceneManager.scene,
              this.currentShape,
              logicTile.isBomb,
              logicTile.bombCountdown,
              logicTile.isWildcard
            );
            this.tiles3D[l][r][c] = tile3D;
          } else {
            if (tile3D.value !== logicTile.value) {
              tile3D.upgradeTo(logicTile.value);
            }
            tile3D.setBombState(logicTile.isBomb, logicTile.bombCountdown);
            if (tile3D !== newlySpawnedTile) {
              tile3D.layer = l;
              tile3D.row = r;
              tile3D.col = c;
              const targetPos = getGridPosition(l, r, c);
              tile3D.group.position.set(targetPos.x, targetPos.y, targetPos.z);
              tile3D.group.scale.set(1, 1, 1);
              tile3D.group.rotation.set(0, 0, 0);
            }
          }

          if (tile3D && tile3D.group) {
            validGroups.add(tile3D.group);
          }
        }
      }
    }

    // Sweep any orphaned or disposed Tile3D groups left anywhere in the Three.js scene
    const sceneChildren = [...this.sceneManager.scene.children];
    for (let i = 0; i < sceneChildren.length; i++) {
      const child = sceneChildren[i];
      if (!child || !child.userData || !child.userData.isTile3D) continue;
      const inst = child.userData.tileInstance;
      if (!validGroups.has(child) || (inst && inst._disposed)) {
        if (inst && typeof inst.dispose === 'function') {
          inst.dispose(true);
        } else {
          gsap.killTweensOf(child);
          if (child.position) gsap.killTweensOf(child.position);
          if (child.scale) gsap.killTweensOf(child.scale);
          if (child.rotation) gsap.killTweensOf(child.rotation);
          child.visible = false;
          if (child.parent) child.parent.remove(child);
        }
      }
    }
  }

  settleInFlightAnimations() {
    if (this._activeSlideTweens && this._activeSlideTweens.length > 0) {
      this._activeSlideTweens.forEach(t => {
        try {
          if (t && typeof t.totalProgress === 'function') t.totalProgress(1);
        } catch {}
      });
      this._activeSlideTweens = [];
    }
    if (this._activeMoveContext && this._activeMoveContext.token !== this._moveToken) {
      const ctx = this._activeMoveContext;
      this._activeMoveContext = null;
      if (Array.isArray(ctx.mergesToProcess)) {
        ctx.mergesToProcess.forEach(m => {
          if (m && m.sourceTile && !m.sourceTile._disposed) {
            const surviving = this.tiles3D?.[m.targetL]?.[m.targetR]?.[m.targetC];
            if (surviving !== m.sourceTile) {
              m.sourceTile.dispose(true);
            }
          }
        });
      }
    }
    if (!this.tiles3D) return;
    for (let l = 0; l < this.tiles3D.length; l++) {
      for (let r = 0; r < this.tiles3D[l].length; r++) {
        for (let c = 0; c < this.tiles3D[l][r].length; c++) {
          const tile = this.tiles3D[l][r][c];
          if (tile && tile.group) {
            gsap.killTweensOf(tile.group.position);
            gsap.killTweensOf(tile.group.scale);
            gsap.killTweensOf(tile.group.rotation);
            const targetPos = getGridPosition(l, r, c);
            tile.group.position.set(targetPos.x, targetPos.y, targetPos.z);
            tile.group.scale.set(1, 1, 1);
            tile.group.rotation.set(0, 0, 0);
          }
        }
      }
    }
  }

  async handleMove(direction) {
    if (this.heldTile) {
      this.onTileGrabCancel();
    }
    this.registerInteraction();
    this.dismissFirstSwipeGuide();
    if (this.ghostPreview) this.ghostPreview.hideGhost();

    // Input Buffer & Move Chaining: queue up to 2 moves when animating
    if (this.isAnimating) {
      if (!this.moveQueue) this.moveQueue = [];
      if (this.moveQueue.length < this.maxQueuedMoves) {
        this.moveQueue.push(direction);
      }
      return;
    }
    if (this.isSwapMode) {
      this.cancelSwapMode();
    }
    if (this.isDestroyMode) {
      this.cancelDestroyMode();
    }

    if (this.gameLogic.gameOver || !this.gameLogic.hasValidMoves()) {
      if (this.hasRescueSpell()) {
        this.enterRescueMode();
      } else {
        this.triggerGameOverModal();
      }
      return;
    }

    const prevStreak = this.gameLogic.mergeStreak || 0;
    const result = this.gameLogic.move(direction);
    if (!result.moved) {
      if (!this.gameLogic.hasValidMoves()) {
        if (this.hasRescueSpell()) {
          this.enterRescueMode();
        } else {
          this.triggerGameOverModal();
        }
      }
      return;
    }

    this.isAnimating = true;

    // Fast Reconcile: Guarantee all active tiles on board have healthy scale and upright rotation before move starts
    for (let l = 0; l < this.tiles3D.length; l++) {
      for (let r = 0; r < this.tiles3D[l].length; r++) {
        for (let c = 0; c < this.tiles3D[l][r].length; c++) {
          const t = this.tiles3D[l][r][c];
          if (t && t.group) {
            gsap.killTweensOf(t.group.scale);
            gsap.killTweensOf(t.group.rotation);
            t.group.scale.set(1, 1, 1);
            t.group.rotation.set(0, 0, 0);
          }
        }
      }
    }

    const moveToken = ++this._moveToken;
    const moveContext = {
      token: moveToken,
      mergesToProcess: [],
      spawned: false
    };
    this._activeMoveContext = moveContext;

    // Hard Watchdog: Guarantee isAnimating NEVER stays stuck on mobile/tablet while settling cleanly
    if (this._animWatchdog) clearTimeout(this._animWatchdog);
    this._animWatchdog = setTimeout(() => {
      if (this.isAnimating && this._moveToken === moveToken) {
        console.warn('⚠️ Animation watchdog settling stalled move!');
        this._moveToken++;
        this.settleInFlightAnimations();
        if (!moveContext.spawned && this.gameLogic && !this.gameLogic.gameOver) {
          moveContext.spawned = true;
          const emergencySpawn = this.spawnTile();
          this.reconcileSceneTiles(emergencySpawn);
        } else {
          this.reconcileSceneTiles();
        }
        this._activeMoveContext = null;
        this.isAnimating = false;
        const modalOpen = this.isAnyModalOpen && this.isAnyModalOpen();
        if (!modalOpen && this.moveQueue && this.moveQueue.length > 0 && !this.gameLogic.gameOver) {
          const next = this.moveQueue.shift();
          queueMicrotask(() => this.handleMove(next));
        } else if (modalOpen && this.moveQueue) {
          this.moveQueue.length = 0;
        }
      }
    }, 450);

    try {
      this.moveCount++;
      this.comboCount = 0; // Reset combo per move
      this.recentMoves.push(performance.now());
      if (this.sceneManager && this.sceneManager.requestShadowUpdate) this.sceneManager.requestShadowUpdate(25);

      if (direction === 'layerUp' || direction === 'layerDown') {
        soundManager.playLayerMove(direction === 'layerUp' ? 'up' : 'down');
      } else {
        soundManager.playSlide();
      }

      if (this.graphicsQuality === 'high') {
        this.reactBoardToMove(direction);
        if (this.sceneManager && this.sceneManager.impulseCamera) {
          this.sceneManager.impulseCamera(direction, 1.0);
        }
      }

      const slideDuration = this.graphicsQuality === 'high' ? 0.082 : 0.076;
      const slideMs = Math.round(slideDuration * 1000) + 120;
      const toAnimPromise = (tween) => {
        if (!tween || typeof tween.then !== 'function') return Promise.resolve();
        return new Promise(resolve => {
          let done = false;
          const finish = () => {
            if (!done) {
              done = true;
              resolve();
            }
          };
          try {
            tween.then(finish);
            if (typeof tween.eventCallback === 'function') {
              const prevInterrupt = tween.eventCallback('onInterrupt');
              tween.eventCallback('onInterrupt', () => {
                if (typeof prevInterrupt === 'function') {
                  try { prevInterrupt(); } catch {}
                }
                finish();
              });
            }
          } catch {
            finish();
          }
          setTimeout(finish, slideMs);
        });
      };

      const animations = [];
      const mergesToProcess = moveContext.mergesToProcess;
      this._activeSlideTweens = [];

      // Clone old tiles3D
      const oldTiles3D = this.tiles3D.map(layer => layer.map(row => [...row]));
      this.tiles3D = this.createEmptyTileGrid();

      result.movements.forEach(m => {
        const tile3D = oldTiles3D[m.from.l][m.from.r][m.from.c];
        if (!tile3D) return;

        if (!m.mergedInto) {
          this.tiles3D[m.to.l][m.to.r][m.to.c] = tile3D;
          const tween = tile3D.slideTo(m.to.l, m.to.r, m.to.c, slideDuration);
          animations.push(toAnimPromise(tween));
          if (tween) this._activeSlideTweens.push(tween);
        } else {
          const tween = tile3D.slideTo(m.to.l, m.to.r, m.to.c, slideDuration);
          animations.push(toAnimPromise(tween));
          if (tween) this._activeSlideTweens.push(tween);
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
                const freshTile = new Tile3D(l, r, c, logicTile.value, this.sceneManager.scene, this.currentShape, logicTile.isBomb, logicTile.bombCountdown, logicTile.isWildcard);
                freshTile.group.scale.set(1, 1, 1);
                this.tiles3D[l][r][c] = freshTile;
                logicTile.id = freshTile.id;
              }

              // Guarantee unmoved tile is seated exactly at its slot coordinates
              const placedTile = this.tiles3D[l][r][c];
              if (placedTile && placedTile.group) {
                const expectedPos = getGridPosition(l, r, c);
                const curPos = placedTile.group.position;
                const dist = Math.hypot(curPos.x - expectedPos.x, curPos.y - expectedPos.y, curPos.z - expectedPos.z);
                if (dist > 0.04) {
                  placedTile.group.position.set(expectedPos.x, expectedPos.y, expectedPos.z);
                  placedTile.group.rotation.set(0, 0, 0);
                  placedTile.group.scale.set(1, 1, 1);
                }
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
      this.settleInFlightAnimations();
      if (moveToken !== this._moveToken) {
        mergesToProcess.forEach(m => {
          if (m.sourceTile && !m.sourceTile._disposed) {
            const surviving = this.tiles3D?.[m.targetL]?.[m.targetR]?.[m.targetC];
            if (surviving !== m.sourceTile) {
              m.sourceTile.dispose(true);
            }
          }
        });
        return;
      }

    // Process merges
    let maxMergedVal = 0;
    let lastMergeScreenPos = null;
    const bossLoopMult = (this.isBossRaid && this.bossManager && this.bossManager.loop > 1)
      ? (1 + (this.bossManager.loop - 1) * 0.5)
      : 1.0;
    const totalPopupMult = (result.scoreMultiplier || 1.0) * bossLoopMult;
    const effectiveAudioStreak = Math.min(8, Math.floor((result.mergeStreak || 0) / 1.5));

    mergesToProcess.forEach(m => {
      const surviving = this.tiles3D[m.targetL][m.targetR][m.targetC];
      maxMergedVal = Math.max(maxMergedVal, m.newValue);
      this.mergeCount++;
      this.maxTileValue = Math.max(this.maxTileValue, m.newValue);
      this.mergeTierCounts[m.newValue] = (this.mergeTierCounts[m.newValue] || 0) + 1;
      if (this.questManager) {
        this.questManager.recordTileDiscovery(m.newValue);
      }

      if (surviving && surviving !== m.sourceTile) {
        m.sourceTile.dispose(true);
        surviving.upgradeTo(m.newValue);

        this.comboCount++;
        const pos = getGridPosition(m.targetL, m.targetR, m.targetC);
        // High Performance Kinematics: 3D Camera Impulse & Board Impact Dip on Merge
        if (this.graphicsQuality === 'high') {
          if (this.sceneManager && this.sceneManager.impulseCamera) {
            this.sceneManager.impulseCamera('merge', Math.min(2.0, m.newValue / 128));
          }
          if (this.board && this.board.group) {
            gsap.killTweensOf(this.board.group.position);
            gsap.to(this.board.group.position, { y: -0.015, duration: 0.04, yoyo: true, repeat: 1, ease: 'power2.out' });
          }
        }
        // No fine dust particles on regular merges - clean tactile brick slam instead
        soundManager.playMerge(m.newValue, Math.max(this.comboCount, effectiveAudioStreak));
        if (m.newValue >= 128) {
          if (this.particleSystem && this.particleSystem.supernovaBurst) {
            this.particleSystem.supernovaBurst(pos.x, pos.y + 0.25, pos.z, m.newValue, this.sceneManager.camera);
          }
        }
        if (this.isBossRaid && this.bossManager) {
          this.bossManager.onTileMerge(m.newValue, { l: m.targetL, r: m.targetR, c: m.targetC });
        }

        // 3D Floating Score Popup
        const screenPos = this.project3DToScreen(new THREE.Vector3(pos.x, pos.y + 0.6, pos.z));
        lastMergeScreenPos = screenPos;
        if (totalPopupMult > 1.01) {
          const scoreVal = Math.round(m.newValue * totalPopupMult);
          this.spawnFloatingScore(`+${scoreVal} (x${Number(totalPopupMult.toFixed(1))})`, screenPos, m.newValue);
        } else {
          this.spawnFloatingScore(`+${m.newValue}`, screenPos, m.newValue);
        }

        // Track All-Time Max Tile Record (Only when playing manually)
        if (!this.aiBot || !this.aiBot.isRunning) {
          try {
            const prevMax = parseInt(localStorage.getItem('3d2048_max_tile') || '0', 10);
            if (m.newValue > prevMax) {
              localStorage.setItem('3d2048_max_tile', String(m.newValue));
            }
          } catch {}
        }

        // Milestone Unlock Celebration
        if (m.newValue >= 64 && !this.celebratedMilestones.has(m.newValue)) {
          this.celebratedMilestones.add(m.newValue);
          this.showMilestoneCelebration(m.newValue);
        }
      } else if (!surviving) {
        const logicCell = this.gameLogic.grid[m.targetL]?.[m.targetR]?.[m.targetC];
        if (logicCell && m.sourceTile && !m.sourceTile._disposed) {
          this.tiles3D[m.targetL][m.targetR][m.targetC] = m.sourceTile;
          m.sourceTile.upgradeTo(logicCell.value);
        } else if (m.sourceTile) {
          m.sourceTile.dispose(true);
        }

        this.comboCount++;
        const pos = getGridPosition(m.targetL, m.targetR, m.targetC);
        // High Performance Kinematics: 3D Camera Impulse & Board Impact Dip on Merge
        if (this.graphicsQuality === 'high') {
          if (this.sceneManager && this.sceneManager.impulseCamera) {
            this.sceneManager.impulseCamera('merge', Math.min(2.0, m.newValue / 128));
          }
          if (this.board && this.board.group) {
            gsap.killTweensOf(this.board.group.position);
            gsap.to(this.board.group.position, { y: -0.015, duration: 0.04, yoyo: true, repeat: 1, ease: 'power2.out' });
          }
        }
        // No fine dust particles on regular merges - clean tactile brick slam instead
        soundManager.playMerge(m.newValue, Math.max(this.comboCount, effectiveAudioStreak));
        if (m.newValue >= 128) {
          if (this.particleSystem && this.particleSystem.supernovaBurst) {
            this.particleSystem.supernovaBurst(pos.x, pos.y + 0.25, pos.z, m.newValue, this.sceneManager.camera);
          }
        }
        if (this.isBossRaid && this.bossManager) {
          this.bossManager.onTileMerge(m.newValue, { l: m.targetL, r: m.targetR, c: m.targetC });
        }

        // 3D Floating Score Popup
        const screenPos = this.project3DToScreen(new THREE.Vector3(pos.x, pos.y + 0.6, pos.z));
        lastMergeScreenPos = screenPos;
        if (totalPopupMult > 1.01) {
          const scoreVal = Math.round(m.newValue * totalPopupMult);
          this.spawnFloatingScore(`+${scoreVal} (x${Number(totalPopupMult.toFixed(1))})`, screenPos, m.newValue);
        } else {
          this.spawnFloatingScore(`+${m.newValue}`, screenPos, m.newValue);
        }

        // Track All-Time Max Tile Record (Only when playing manually)
        if (!this.aiBot || !this.aiBot.isRunning) {
          try {
            const prevMax = parseInt(localStorage.getItem('3d2048_max_tile') || '0', 10);
            if (m.newValue > prevMax) {
              localStorage.setItem('3d2048_max_tile', String(m.newValue));
            }
          } catch {}
        }

        // Milestone Unlock Celebration
        if (m.newValue >= 64 && !this.celebratedMilestones.has(m.newValue)) {
          this.celebratedMilestones.add(m.newValue);
          this.showMilestoneCelebration(m.newValue);
        }
      }
    });

    // Update Consecutive Streak & FEVER x2 HUD
    this.updateStreakFeverUI(prevStreak < 5 && (result.mergeStreak || 0) >= 5);

    // Show Combo Streak Callout
    if (this.comboCount >= 2) {
      this.showComboCallout(this.comboCount, lastMergeScreenPos);
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

    // Rush mode time additions for merges (Rebalanced v6.8.69: +0.25s / +0.75s / +1.5s)
    if (this.isRushMode && maxMergedVal > 0) {
      if (maxMergedVal <= 8) this.addRushTime(0.25);
      else if (maxMergedVal <= 64) this.addRushTime(0.75);
      else this.addRushTime(1.5);
    }

    // Process Bomb Events in Rush Mode (Defuse: +2.0s, Explode: -8.0s)
    if (this.isRushMode) {
      if (result.defusedBombs > 0) {
        soundManager.playBombDefused();
        const bonus = 2.0 * result.defusedBombs;
        this.addRushTime(bonus);
        const msg = (t('rush_bomb_defused_toast') || '🛡️ GỠ BOM: +{time}s!').replace('{time}', bonus.toFixed(1));
        this.showSpellToast(msg);
      }
      if (result.explodedBombs && result.explodedBombs.length > 0) {
        soundManager.playBombExplode();
        const penalty = 8.0 * result.explodedBombs.length;
        this.rushTime = Math.max(0, this.rushTime - penalty);
        this.particleSystem.screenShake(this.sceneManager.camera, 0.75);
        if (soundManager.triggerHaptic) soundManager.triggerHaptic('bomb');
        const msg = (t('rush_bomb_detonated_toast') || '💥 BOM NỔ: -{time}s!').replace('{time}', penalty.toFixed(1));
        this.showSpellToast(msg, true);
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

    const newlySpawnedTile = this.spawnTile();
    moveContext.spawned = true;
    this.reconcileSceneTiles(newlySpawnedTile);
    if (this._activeMoveContext === moveContext) {
      this._activeMoveContext = null;
    }

    // Check game over right after the new tile has been placed on the grid
    const isGameOver = !this.gameLogic.hasValidMoves();
    this.gameLogic.gameOver = isGameOver;
    this.updateNextTileUI();
    this.updateDangerState();

    if (result.won && !this.isBossRaid) {
      soundManager.playWin();
      this.saveGameState();
      this.showModal({
        title: t('modal_victory_title') || '👑 CHINH PHỤC 2048!',
        message: t('modal_victory_msg'),
        primaryText: t('modal_btn_continue'),
        secondaryText: t('modal_btn_new_game'),
        isVictory: true,
        forceTitle: true,
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

    // Safety Grid Reconciliation:
    // Guarantees all active tiles are seated exactly at their grid coordinates with zero drift
    for (let l = 0; l < this.gameLogic.layers; l++) {
      for (let r = 0; r < this.gameLogic.rows; r++) {
        for (let c = 0; c < this.gameLogic.cols; c++) {
          const tile = this.tiles3D[l]?.[r]?.[c];
          if (tile && tile.group) {
            tile.setHeld(false);
            tile.isSelected = false;
            tile.isHovered = false;
            const targetPos = getGridPosition(l, r, c);
            const dist = Math.hypot(
              tile.group.position.x - targetPos.x,
              tile.group.position.y - targetPos.y,
              tile.group.position.z - targetPos.z
            );
            if (dist > 0.04) {
              tile.group.position.set(targetPos.x, targetPos.y, targetPos.z);
            }
            tile.group.rotation.set(0, 0, 0);
            if (tile !== newlySpawnedTile && (tile.group.scale.x < 0.8 || tile.group.scale.y < 0.8 || tile.group.scale.z < 0.8)) {
              tile.group.scale.set(1, 1, 1);
            }
          }
        }
      }
    }

    if (isGameOver) {
      if (!(this.isRushMode && this.rushTime <= 0) && this.hasRescueSpell()) {
        this.gameLogic.gameOver = false;
        this.enterRescueMode();
        this.saveGameState();
        return;
      }
      this.triggerGameOverModal();
      return;
    } else if (this.isRescueMode) {
      this.exitRescueMode(true);
    }

    this.saveGameState();
  } catch (err) {
    console.error('Error during move processing:', err);
  } finally {
    if (moveToken === this._moveToken) {
      if (this._animWatchdog) {
        clearTimeout(this._animWatchdog);
        this._animWatchdog = null;
      }
      if (this._activeMoveContext === moveContext) {
        this._activeMoveContext = null;
      }
      this.isAnimating = false;

      // Move Buffering Queue: Instantly execute chained move via microtask
      if (this.moveQueue && this.moveQueue.length > 0 && !this.gameLogic.gameOver) {
        const isModalOpen = this.isAnyModalOpen ? this.isAnyModalOpen() : false;
        if (!isModalOpen) {
          const nextMove = this.moveQueue.shift();
          queueMicrotask(() => this.handleMove(nextMove));
        } else {
          this.moveQueue.length = 0;
        }
      }
    }
  } // end finally
  } // end handleMove

  rollMemeReaction(isVictory = false) {
    if (!this.modalMemeWrap) return;

    let pool = GAME_OVER_MEMES.tier2;
    if (isVictory || this.maxTileValue >= 2048) {
      pool = GAME_OVER_MEMES.victory;
    } else if (this.maxTileValue < 128) {
      pool = GAME_OVER_MEMES.tier1;
    } else if (this.maxTileValue >= 512) {
      pool = GAME_OVER_MEMES.tier3;
    }

    const item = pool[Math.floor(Math.random() * pool.length)];
    if (!item) return;

    const lang = getCurrentLanguage();
    const fallbackTitle = isVictory ? t('modal_victory_title') : t('modal_gameover_title');
    if (this.modalMemeImg) this.modalMemeImg.src = item.img;
    if (this.modalMemeBadge) {
      this.modalMemeBadge.textContent = lang === 'vi' ? item.badge : (isVictory ? '👑 GGWP' : '💀 GAME OVER');
    }
    if (this.modalMemeQuote) {
      this.modalMemeQuote.style.display = lang === 'vi' ? 'block' : 'none';
      this.modalMemeQuote.textContent = `"${item.roast}"`;
    }
    if (this.modalTitle) this.modalTitle.textContent = lang === 'vi' ? item.title : fallbackTitle;

    const frame = document.getElementById('modal-meme-frame');
    if (frame && typeof gsap !== 'undefined') {
      gsap.fromTo(frame, { scale: 0.82, rotate: -6 }, { scale: 1, rotate: 0, duration: 0.35, ease: 'back.out(2)' });
    }
  }

  hasRescueSpell() {
    if (!this.gameLogic) return false;
    return this.gameLogic.hasRescueSpell();
  }

  enterRescueMode() {
    if (this.isRescueMode || this.gameLogic.gameOver) return;
    this.isRescueMode = true;
    this.gameLogic.gameOver = false;

    // Show Rescue Alert Banner
    this.showRescueBanner();

    // Pulse usable rescue spell buttons
    this.updateRescueSpellPulses();

    // Audio chime warning
    if (soundManager && soundManager.playWarningChime) {
      soundManager.playWarningChime();
    }
    if (soundManager && soundManager.triggerHaptic) {
      soundManager.triggerHaptic('bomb');
    }
  }

  exitRescueMode(success = true) {
    if (!this.isRescueMode) return;
    this.isRescueMode = false;

    // Hide Rescue Alert Banner
    this.hideRescueBanner();

    // Remove pulse animations
    this.clearRescueSpellPulses();

    if (success) {
      const toastMsg = typeof t === 'function' ? (t('rescue_success_toast') || '✨ Cứu nguy thành công! Bàn cờ đã có lại nước đi.') : '✨ Cứu nguy thành công! Bàn cờ đã có lại nước đi.';
      this.showSpellToast(toastMsg, true);
      if (soundManager && soundManager.playSpellRecharge) {
        soundManager.playSpellRecharge();
      }
      if (soundManager && soundManager.triggerHaptic) {
        soundManager.triggerHaptic('win');
      }
    }
  }

  evaluateRescueState() {
    if (!this.isRescueMode) return;
    if (this.gameLogic.hasValidMoves()) {
      this.exitRescueMode(true);
    } else {
      if (this.hasRescueSpell()) {
        this.updateRescueSpellPulses();
        const toastMsg = typeof t === 'function' ? (t('rescue_still_stuck_toast') || 'Bàn cờ vẫn kẹt! Hãy dùng thêm phép để mở đường.') : 'Bàn cờ vẫn kẹt! Hãy dùng thêm phép để mở đường.';
        this.showSpellToast(toastMsg, true);
      } else {
        this.exitRescueMode(false);
        this.triggerGameOverModal();
      }
    }
  }

  showRescueBanner() {
    let banner = document.getElementById('rescue-mode-banner');
    if (!banner) return;
    banner.style.display = 'block';
    void banner.offsetWidth;
    banner.classList.add('active');
  }

  hideRescueBanner() {
    let banner = document.getElementById('rescue-mode-banner');
    if (!banner) return;
    banner.classList.remove('active');
    setTimeout(() => {
      if (!this.isRescueMode) {
        banner.style.display = 'none';
      }
    }, 280);
  }

  updateRescueSpellPulses() {
    if (!this.isRescueMode) {
      this.clearRescueSpellPulses();
      return;
    }
    const undoBtn = document.getElementById('btn-spell-undo');
    const swapBtn = document.getElementById('btn-spell-swap');
    const destroyBtn = document.getElementById('btn-spell-destroy');

    if (undoBtn) undoBtn.classList.toggle('spell-rescue-pulse', this.gameLogic.canUndo());
    if (swapBtn) swapBtn.classList.toggle('spell-rescue-pulse', this.gameLogic.canSwap());
    if (destroyBtn) destroyBtn.classList.toggle('spell-rescue-pulse', this.gameLogic.canDestroy());
  }

  clearRescueSpellPulses() {
    const undoBtn = document.getElementById('btn-spell-undo');
    const swapBtn = document.getElementById('btn-spell-swap');
    const destroyBtn = document.getElementById('btn-spell-destroy');
    if (undoBtn) undoBtn.classList.remove('spell-rescue-pulse');
    if (swapBtn) swapBtn.classList.remove('spell-rescue-pulse');
    if (destroyBtn) destroyBtn.classList.remove('spell-rescue-pulse');
  }

  giveUpFromRescueMode() {
    if (!this.isRescueMode) return;
    this.exitRescueMode(false);
    this.triggerGameOverModal();
  }

  triggerGameOverModal(customMessage) {
    if (this.isRescueMode) {
      this.exitRescueMode(false);
    }
    this.gameLogic.gameOver = true;
    this.updateDangerState();
    this.updateStreakFeverUI();
    this.isAnimating = false; // UNFREEZE IMMEDIATELY
    if (this.aiBot) this.aiBot.stop();
    if (this.isBossRaid && this.bossManager) {
      this.bossManager.isDefeated = true;
    }
    soundManager.playGameOver();
    this.clearSavedGameState();

    this._isLastModalVictory = false;
    const msg = customMessage || `${t('modal_gameover_msg')}\n${t('score')}: ${this.gameLogic.score.toLocaleString()}`;
    this.showModal({
      title: t('modal_gameover_title') || 'HẾT NƯỚC ĐI!',
      message: msg,
      primaryText: t('modal_btn_retry') || '🔥 Chơi Lại Ngay',
      secondaryText: t('modal_btn_new_game') || 'Ván Mới',
      isVictory: false,
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

  showModal({ title, message, primaryText, secondaryText, isVictory = false, forceTitle = false, onPrimary, onSecondary }) {
    this._isLastModalVictory = isVictory;
    this.rollMemeReaction(isVictory);

    if (title && (forceTitle || !this.modalTitle.textContent)) {
      this.modalTitle.textContent = title;
    }
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

  getTileLabel(tile) {
    if (!tile) return '';
    return (tile.isWildcard || tile.value === 0) ? '★' : String(tile.value);
  }

  updateSpellUI() {
    const spellTypes = ['undo', 'hint', 'swap', 'destroy'];
    const spellNames = { hint: 'Hint', undo: 'Undo', swap: 'Swap', destroy: 'Destroy' };
    const maxUses = this.gameLogic.maxSpellUses;
    const milestone = this.gameLogic.nextRechargeMilestone;

    spellTypes.forEach(type => {
      const status = this.gameLogic.getSpellStatus(type);
      const spell = this.gameLogic.spells[type];
      const remaining = Math.max(0, maxUses - (spell ? spell.used : 0));
      const btn = this[`btnSpell${spellNames[type]}`];
      const badge = this[`badgeSpell${spellNames[type]}`];

      if (btn) {
        btn.classList.toggle('depleted', status === 'depleted');
        btn.classList.toggle('in-cooldown', status === 'cooldown');
        btn.classList.toggle('ready', status === 'ready');

        if (status === 'depleted') {
          btn.title = (t('spell_tooltip_depleted') || 'Đã hết lượt trong ván này (tối đa {max} lần)').replace('{max}', maxUses);
        } else if (status === 'cooldown') {
          btn.title = (t('spell_tooltip_cooldown') || 'Đang tạm khóa! Ghép đạt khối [{milestone}] để mở khóa tiếp.').replace('{milestone}', milestone);
        } else {
          btn.title = (t('spell_tooltip_ready') || 'Sẵn sàng sử dụng (Còn {rem}/{max} lượt)').replace('{rem}', remaining).replace('{max}', maxUses);
        }

        if (type === 'swap') {
          btn.classList.toggle('active-swap', this.isSwapMode);
          const nameSpan = btn.querySelector('.spell-name');
          if (nameSpan) {
            nameSpan.textContent = this.isSwapMode ? (t('spell_cancel_mode') || 'Hủy chọn') : (t('spell_swap') || 'Đổi chỗ');
          }
          if (this.isSwapMode) {
            btn.title = t('spell_tooltip_cancel_swap') || 'Bấm để hủy chọn Đổi chỗ';
          }
        }
        if (type === 'destroy') {
          btn.classList.toggle('active-destroy', this.isDestroyMode);
          const nameSpan = btn.querySelector('.spell-name');
          if (nameSpan) {
            nameSpan.textContent = this.isDestroyMode ? (t('spell_cancel_mode') || 'Hủy chọn') : (t('spell_destroy') || 'Phá khối');
          }
          if (this.isDestroyMode) {
            btn.title = t('spell_tooltip_cancel_destroy') || 'Bấm để hủy chọn Phá khối';
          }
        }
      }

      if (badge) {
        if (status === 'depleted') {
          badge.textContent = '0';
          badge.title = (t('spell_badge_depleted') || 'Đã hết {max} lượt').replace('{max}', maxUses);
        } else if (status === 'cooldown') {
          badge.textContent = `${milestone}`;
          badge.title = (t('spell_badge_cooldown') || 'Đạt khối [{milestone}] để hồi lượt').replace('{milestone}', milestone);
        } else {
          badge.textContent = `${remaining}`;
          badge.title = (t('spell_badge_ready') || 'Còn {rem}/{max} lượt').replace('{rem}', remaining).replace('{max}', maxUses);
        }
      }
    });

    if (this.isRescueMode) {
      this.updateRescueSpellPulses();
    }
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

    [this.btnSpellHint, this.btnSpellUndo, this.btnSpellSwap, this.btnSpellDestroy].forEach(btn => {
      if (btn) {
        btn.classList.remove('spell-recharge-anim');
        void btn.offsetWidth;
        btn.classList.add('spell-recharge-anim');
      }
    });

    this.showSpellToast((t('spell_recharged_toast') || '✨ Đạt mốc [{milestone}] — Đã mở khóa lượt trợ giúp tiếp theo!').replace('{milestone}', milestone), true);
    this.updateSpellUI();
  }

  handleSpellHint() {
    if (this.isAnimating || this.gameLogic.gameOver) return;
    if (this.isSwapMode) this.cancelSwapMode(null);
    if (this.isDestroyMode) this.cancelDestroyMode(null);

    const status = this.gameLogic.getSpellStatus('hint');
    if (status === 'depleted') {
      this.showSpellToast(t('spell_err_hint_depleted') || 'Hết lượt! Bạn đã dùng hết Gợi ý trong ván này.');
      return;
    }
    if (status === 'cooldown') {
      this.showSpellToast((t('spell_err_cooldown') || 'Đang tạm khóa: Ghép đạt khối [{milestone}] để mở khóa tiếp.').replace('{milestone}', this.gameLogic.nextRechargeMilestone));
      return;
    }

    let bestDir = null;
    if (this.aiBot && typeof this.aiBot.findBestMove === 'function') {
      bestDir = this.aiBot.findBestMove();
    }
    if (!bestDir) {
      const res = this.gameLogic.getBestMove();
      bestDir = res ? res.direction : null;
    } else {
      this.gameLogic.useHint();
    }
    if (!bestDir) {
      this.showSpellToast(t('spell_err_no_hint') || 'Không tìm thấy nước đi hợp lệ!');
      return;
    }
    const res = { direction: bestDir };

    soundManager.playSpellHint();
    if (this.questManager) {
      this.questManager.recordSpell('hint');
    }

    // Trigger visual Ghost Preview trajectory if available
    if (this.ghostPreview) {
      this.ghostPreview.showGhost(res.direction);
      if (this.hintGhostTimeout) clearTimeout(this.hintGhostTimeout);
      this.hintGhostTimeout = setTimeout(() => {
        if (this.ghostPreview) {
          this.ghostPreview.hideGhost();
        }
      }, 3500);
    }

    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || window.innerWidth <= 768;
    const prefix = isTouchDevice ? 'dir_touch_' : 'dir_desktop_';
    const dirText = t(`${prefix}${res.direction}`) || res.direction;
    this.showSpellToast(`${t('toast_hint_prefix') || 'GỢI Ý TỐI ƯU:'} ${dirText}`);
    this.updateSpellUI();
    this.saveGameState();
  }

  handleSpellUndo() {
    if (this.isAnimating) return;
    if (this.isSwapMode) this.cancelSwapMode(null);
    if (this.isDestroyMode) this.cancelDestroyMode(null);

    const status = this.gameLogic.getSpellStatus('undo');
    if (status === 'depleted') {
      this.showSpellToast(t('spell_err_undo_depleted') || 'Hết lượt! Bạn đã dùng hết Lùi lại trong ván này.');
      return;
    }
    if (status === 'cooldown') {
      this.showSpellToast((t('spell_err_cooldown') || 'Đang tạm khóa: Ghép đạt khối [{milestone}] để mở khóa tiếp.').replace('{milestone}', this.gameLogic.nextRechargeMilestone));
      return;
    }

    if (this.gameLogic.history.length === 0) {
      this.showSpellToast(t('spell_err_no_undo') || 'Chưa có nước đi nào để hoàn tác!');
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
              const tile3D = new Tile3D(l, r, c, cell.value, this.sceneManager.scene, this.currentShape, cell.isBomb, cell.bombCountdown, cell.isWildcard);
              tile3D.group.scale.set(1, 1, 1);
              this.tiles3D[l][r][c] = tile3D;
              // Synchronize cell.id so future moves match correctly
              cell.id = tile3D.id;
            }
          }
        }
      }

      if (this.mode === '3x3x3' && typeof this.setSliceMode === 'function') {
        this.setSliceMode(this.sliceMode);
      }
      this.updateScoreUI();
      this.updateSpellUI();
      this.updateNextTileUI();
      this.updateStreakFeverUI();
      this.updateDangerState();
      this.showSpellToast(t('spell_undo_done_toast') || '↩️ Đã hoàn tác nước đi vừa rồi!');
      this.saveGameState();
      if (this.isRescueMode) {
        this.evaluateRescueState();
      }
    }
  }

  handleSpellSwap() {
    if (this.isAnimating || this.gameLogic.gameOver) return;

    if (this.isDestroyMode) {
      this.cancelDestroyMode(null);
    }

    if (this.isSwapMode) {
      this.cancelSwapMode();
      return;
    }

    const status = this.gameLogic.getSpellStatus('swap');
    if (status === 'depleted') {
      this.showSpellToast(t('spell_err_swap_depleted') || 'Hết lượt! Bạn đã dùng hết Đổi chỗ trong ván này.');
      return;
    }
    if (status === 'cooldown') {
      this.showSpellToast((t('spell_err_cooldown') || 'Đang tạm khóa: Ghép đạt khối [{milestone}] để mở khóa tiếp.').replace('{milestone}', this.gameLogic.nextRechargeMilestone));
      return;
    }

    this.isSwapMode = true;
    this.swapSelectedTileA = null;
    this.swapSelectedTileB = null;
    this.container.style.cursor = 'pointer';
    document.body.classList.add('in-swap-mode');
    if (this.sceneManager && this.sceneManager.controls) {
      this.sceneManager.controls.enabled = false;
    }
    this.updateSpellUI();
    this.showSwapHud(t('swap_hud_step1') || 'Chạm khối thứ nhất trên bàn cờ...');
    this.showSpellToast(t('spell_swap_start_toast') || '⇄ ĐỔI CHỖ: Chạm 2 khối bất kỳ để hoán đổi vị trí');
  }

  cancelSwapMode(toastMsg = undefined) {
    if (!this.isSwapMode) return;
    this.isSwapMode = false;
    document.body.classList.remove('in-swap-mode');
    if (this.sceneManager && this.sceneManager.controls) {
      this.sceneManager.controls.enabled = true;
    }
    if (this.hoveredTile) {
      if (!this.isTileSwapSelected(this.hoveredTile)) {
        this.hoveredTile.setHovered(false);
      }
      this.hoveredTile = null;
    }
    if (this.swapSelectedTileA) {
      this.swapSelectedTileA.setSelected(false);
      this.swapSelectedTileA = null;
    }
    if (this.swapSelectedTileB) {
      this.swapSelectedTileB.setSelected(false);
      this.swapSelectedTileB = null;
    }
    this.hideSwapHud();
    this.container.style.cursor = 'default';
    this.updateSpellUI();
    const finalMsg = toastMsg === undefined ? (t('spell_swap_cancelled_toast') || 'Đã hủy chế độ Đổi chỗ.') : toastMsg;
    if (finalMsg) {
      this.showSpellToast(finalMsg);
    }
  }

  showSwapHud(stepText, tileAValue = null, tileBValue = null) {
    if (!this.swapActionHud) return;
    this.swapActionHud.style.display = 'flex';

    if (this.swapHudText) {
      this.swapHudText.textContent = stepText;
    }

    if (this.swapHudPreview && this.swapTileATag && this.swapTileBTag) {
      if (tileAValue !== null) {
        this.swapHudPreview.style.display = 'flex';
        this.swapTileATag.textContent = tileAValue;
        this.swapTileATag.classList.add('selected');
        if (tileBValue !== null) {
          this.swapTileBTag.textContent = tileBValue;
          this.swapTileBTag.classList.add('selected');
        } else {
          this.swapTileBTag.textContent = '?';
          this.swapTileBTag.classList.remove('selected');
        }
      } else {
        this.swapHudPreview.style.display = 'none';
        this.swapTileATag.textContent = '--';
        this.swapTileBTag.textContent = '--';
      }
    }

    if (this.swapHudActionsConfirm) {
      this.swapHudActionsConfirm.style.display = (tileAValue !== null && tileBValue !== null) ? 'block' : 'none';
    }
  }

  hideSwapHud() {
    if (!this.swapActionHud) return;
    this.swapActionHud.style.display = 'none';
    if (this.swapHudActionsConfirm) {
      this.swapHudActionsConfirm.style.display = 'none';
    }
    if (this.swapHudPreview) {
      this.swapHudPreview.style.display = 'none';
    }
  }

  handleCanvasClick(clientX, clientY, altX = null, altY = null) {
    this.registerInteraction();
    if ((!this.isSwapMode && !this.isDestroyMode) || this.isAnimating || this.gameLogic.gameOver) return;

    if (this.isDestroyMode) {
      let clickedTile = this.findTileFromPoint(clientX, clientY);
      if (!clickedTile && altX !== null && altY !== null) {
        clickedTile = this.findTileFromPoint(altX, altY);
      }

      if (!clickedTile) {
        this.showSpellToast(t('spell_destroy_miss_toast') || 'Chạm vào 1 khối trên bàn cờ để phá hủy!');
        return;
      }

      // INSTANT 1-TAP OBLITERATION — ZERO LAG, ZERO DELAY!
      this.confirmExecuteDestroy(clickedTile);
      return;
    }

    let clickedTile = this.findTileFromPoint(clientX, clientY);
    if (!clickedTile && altX !== null && altY !== null) {
      clickedTile = this.findTileFromPoint(altX, altY);
    }

    if (!clickedTile) {
      // Gentle reminder if user tapped empty space or missed a tile — NEVER cancel!
      if (!this.swapSelectedTileA) {
        this.showSwapHud(t('spell_swap_miss_hint') || 'Hãy chạm trực tiếp vào một khối trên bàn cờ...');
      } else if (!this.swapSelectedTileB) {
        const labelA = this.getTileLabel(this.swapSelectedTileA);
        this.showSwapHud((t('spell_swap_selected_step1') || 'Đã chọn [{val}]. Chạm khối thứ 2 để đổi chỗ...').replace('{val}', labelA), labelA);
      }
      return;
    }

    const clickedLabel = this.getTileLabel(clickedTile);

    if (!this.swapSelectedTileA) {
      // Step 1: Select first tile
      this.swapSelectedTileA = clickedTile;
      if (clickedTile.isHovered) clickedTile.setHovered(false);
      clickedTile.setSelected(true);
      soundManager.playSlide();
      const stepMsg = (t('spell_swap_selected_step1') || 'Đã chọn [{val}]. Chạm khối thứ 2 để đổi chỗ...').replace('{val}', clickedLabel);
      this.showSwapHud(stepMsg, clickedLabel);
      this.showSpellToast(stepMsg);
    } else if (this.swapSelectedTileA === clickedTile) {
      // Tapped tile A again -> deselect
      clickedTile.setSelected(false);
      this.swapSelectedTileA = null;
      if (this.swapSelectedTileB) {
        this.swapSelectedTileB.setSelected(false);
        this.swapSelectedTileB = null;
      }
      soundManager.playSlide();
      this.showSwapHud(t('swap_hud_step1') || 'Chạm khối thứ nhất trên bàn cờ...');
      this.showSpellToast(t('spell_swap_deselected') || 'Đã bỏ chọn. Hãy chọn lại khối thứ nhất.');
    } else if (this.swapSelectedTileB === clickedTile) {
      // Tapped tile B again when both A and B are selected -> EXECUTE SWAP IMMEDIATELY!
      this.confirmExecuteSwap();
    } else {
      // Selected tile B (or re-selecting a different tile B)
      const labelA = this.getTileLabel(this.swapSelectedTileA);
      if (clickedTile.value === this.swapSelectedTileA.value && !clickedTile.isWildcard && !this.swapSelectedTileA.isWildcard) {
        soundManager.playTileDrop();
        this.showSpellToast((t('spell_swap_same_val') || 'Hai khối cùng giá trị [{val}], hãy chọn một khối khác!').replace('{val}', clickedLabel));
        return;
      }

      if (this.swapSelectedTileB) {
        this.swapSelectedTileB.setSelected(false);
      }
      this.swapSelectedTileB = clickedTile;
      clickedTile.setSelected(true);
      soundManager.playSlide();

      // Show full preview + Confirm button
      const confirmPrompt = (t('spell_swap_confirm_prompt') || 'Đổi [{a}] ⇄ [{b}]? Chạm lại [{b}] hoặc bấm Xác nhận')
        .replace('{a}', labelA)
        .replaceAll('{b}', clickedLabel);
      this.showSwapHud(confirmPrompt, labelA, clickedLabel);
      this.showSpellToast((t('spell_swap_confirm_toast') || 'Chạm lại khối [{b}] hoặc bấm "Xác nhận" để đổi!').replace('{b}', clickedLabel));
    }
  }

  async confirmExecuteSwap() {
    if (!this.isSwapMode || !this.swapSelectedTileA || !this.swapSelectedTileB || this.isAnimating || this.gameLogic.gameOver) return;

    const tileA = this.swapSelectedTileA;
    const tileB = this.swapSelectedTileB;
    const labelA = this.getTileLabel(tileA);
    const labelB = this.getTileLabel(tileB);

    document.body.classList.remove('in-swap-mode');
    if (this.sceneManager && this.sceneManager.controls) {
      this.sceneManager.controls.enabled = true;
    }
    if (this.hoveredTile) {
      this.hoveredTile.setHovered(false);
      this.hoveredTile = null;
    }
    tileA.setSelected(false);
    tileB.setSelected(false);
    this.swapSelectedTileA = null;
    this.swapSelectedTileB = null;
    this.isSwapMode = false;
    this.hideSwapHud();
    this.container.style.cursor = 'default';
    this.isAnimating = true;

    const posA = { l: tileA.layer, r: tileA.row, c: tileA.col };
    const posB = { l: tileB.layer, r: tileB.row, c: tileB.col };

    const swapResult = this.gameLogic.swapTiles(posA, posB);
    if (!swapResult || !swapResult.success) {
      this.isAnimating = false;
      this.updateSpellUI();
      this.showSpellToast(t('spell_swap_fail_toast') || 'Không thể hoán đổi hai vị trí này!');
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
    this.updateDangerState();
    this.showSpellToast((t('spell_swap_done_toast') || '⇄ Đã hoán đổi [{a}] ⇄ [{b}] thành công!').replace('{a}', labelA).replace('{b}', labelB));
    this.saveGameState();
    if (this.isRescueMode) {
      this.evaluateRescueState();
    }
  }

  handleSpellDestroy() {
    if (this.isAnimating || this.gameLogic.gameOver) return;

    if (this.isSwapMode) {
      this.cancelSwapMode(null);
    }

    if (this.isDestroyMode) {
      this.cancelDestroyMode();
      return;
    }

    const status = this.gameLogic.getSpellStatus('destroy');
    if (status === 'depleted') {
      this.showSpellToast(t('spell_err_destroy_depleted') || 'Hết lượt! Bạn đã dùng hết Phá khối trong ván này.');
      return;
    }
    if (status === 'cooldown') {
      this.showSpellToast((t('spell_err_cooldown') || 'Đang tạm khóa: Ghép đạt khối [{milestone}] để mở khóa tiếp.').replace('{milestone}', this.gameLogic.nextRechargeMilestone));
      return;
    }

    this.isDestroyMode = true;
    this.container.style.cursor = 'crosshair';
    document.body.classList.add('in-destroy-mode');
    if (this.sceneManager && this.sceneManager.controls) {
      this.sceneManager.controls.enabled = false;
    }
    this.updateSpellUI();
    this.showDestroyHud();
  }

  cancelDestroyMode(toastMsg = undefined) {
    if (!this.isDestroyMode) return;
    this.isDestroyMode = false;
    document.body.classList.remove('in-destroy-mode');
    if (this.sceneManager && this.sceneManager.controls) {
      this.sceneManager.controls.enabled = true;
    }
    if (this.destroyTargetTile) {
      this.destroyTargetTile.setSelected(false);
      this.destroyTargetTile = null;
    }
    if (this.hoveredTile) {
      this.hoveredTile.setHovered(false);
      this.hoveredTile = null;
    }
    this.hideDestroyHud();
    this.container.style.cursor = 'default';
    this.updateSpellUI();
    const finalMsg = toastMsg === undefined ? (t('destroy_cancelled') || 'Đã hủy chế độ Phá khối.') : toastMsg;
    if (finalMsg) {
      this.showSpellToast(finalMsg);
    }
  }

  showDestroyHud(stepText = null) {
    if (!this.destroyActionHud) return;
    this.destroyActionHud.style.display = 'flex';
    if (this.destroyHudText) {
      this.destroyHudText.textContent = stepText || t('destroy_hud_step') || 'Chạm vào một khối bất kỳ trên bàn cờ để loại bỏ ngay!';
    }
  }

  hideDestroyHud() {
    if (!this.destroyActionHud) return;
    this.destroyActionHud.style.display = 'none';
  }

  async confirmExecuteDestroy(tile) {
    if (!tile || this.isAnimating || this.gameLogic.gameOver) return;
    this.isAnimating = true;

    try {
      // 1. Resolve target coordinates with full self-healing
      let targetL = tile.layer;
      let targetR = tile.row;
      let targetC = tile.col;
      const val = tile.value;
      const tileLabel = this.getTileLabel(tile);

      // Verify coordinates match logic grid, fallback scan if needed
      if (!this.gameLogic.grid[targetL]?.[targetR]?.[targetC] || this.gameLogic.grid[targetL][targetR][targetC].value !== val) {
        for (let l = 0; l < this.gameLogic.layers; l++) {
          for (let r = 0; r < this.gameLogic.rows; r++) {
            for (let c = 0; c < this.gameLogic.cols; c++) {
              if (this.tiles3D[l] && this.tiles3D[l][r] && this.tiles3D[l][r][c] === tile) {
                targetL = l; targetR = r; targetC = c;
                break;
              }
            }
          }
        }
      }

      if (this.destroyTargetTile) {
        this.destroyTargetTile.setSelected(false);
        this.destroyTargetTile = null;
      }

      // Immediately cancel destroy mode so cursor and controls are restored without 1ms of lag
      this.cancelDestroyMode(null);

      const result = this.gameLogic.destroyTile({ l: targetL, r: targetR, c: targetC });
      if (!result || !result.success) {
        this.showSpellToast(t('spell_destroy_fail_toast') || 'Không thể phá hủy khối này!');
        return;
      }

      // Punchy, ultra-fast 160ms audio & telemetry
      soundManager.playBombExplode();
      if (this.questManager) {
        this.questManager.recordSpell('destroy');
      }

      // Instant particle burst & micro camera impulse (no conflicting screen-shake)
      const pos = getGridPosition(targetL, targetR, targetC);
      if (this.particleSystem && this.particleSystem.burst) {
        this.particleSystem.burst(pos.x, pos.y + 0.2, pos.z, 0xff2a55);
      }
      if (this.sceneManager && this.sceneManager.impulseCamera) {
        this.sceneManager.impulseCamera('merge', 0.8);
      }

      // Free 3D grid slot immediately so board is fully ready for next swipe
      if (this.tiles3D[targetL] && this.tiles3D[targetL][targetR]) {
        this.tiles3D[targetL][targetR][targetC] = null;
      }
      tile.dispose();

      this.showSpellToast((t('spell_destroy_done_toast') || '💣 Đã phá hủy khối [{val}]!').replace('{val}', tileLabel));
      this.updateDangerState();
      this.saveGameState();
      if (this.isRescueMode) {
        this.evaluateRescueState();
      }
    } catch (err) {
      console.error('Destroy error:', err);
    } finally {
      this.isAnimating = false;
      this.updateSpellUI();
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

    // Dynamic Frame Pacing & High-Refresh VSync (60Hz / 120Hz ProMotion / 144Hz / 165Hz)
    if (this.targetFps === '30') {
      const targetInterval = 1000 / 30;
      const elapsed = timestamp - this.lastRenderTimestamp;
      if (elapsed < targetInterval - 2.0) {
        return; // Battery saver mode (30 FPS)
      }
      this.lastRenderTimestamp = timestamp - (elapsed % targetInterval);
    } else if (!isMobileDevice && this.targetFps === '60') {
      const targetInterval = 1000 / 60;
      const elapsed = timestamp - this.lastRenderTimestamp;
      if (elapsed < targetInterval * 0.8) {
        return; // Target 60 FPS on high-refresh desktop monitors without micro-stutter
      }
      this.lastRenderTimestamp = timestamp - (elapsed % targetInterval);
    } else {
      // 120Hz, 144Hz, 165Hz, Max, and Mobile: native hardware VSync with zero artificial skips
      this.lastRenderTimestamp = timestamp;
    }

    const delta = Math.min(this.clock.getDelta(), 0.05);

    // 2. Tab Background Power-Saver (Chỉ tạm dừng rAF khi người dùng chuyển tab/ẩn app)
    if (document.hidden) {
      return;
    }

    // 3. Update Rush Mode internal countdown (pure survival drain & heat escalation)
    if (this.isRushMode && !this.gameLogic.gameOver && !this.isRescueMode && !this.isAnyModalOpen()) {
      this.rushElapsed = (this.rushElapsed || 0) + delta;
      const calculatedLevel = Math.min(6, Math.floor(this.rushElapsed / 25.0) + 1);
      if (calculatedLevel !== this.rushLevel) {
        this.rushLevel = calculatedLevel;
        if (this.gameLogic) this.gameLogic.rushLevel = this.rushLevel;
        const rate = (1.0 + (this.rushLevel - 1) * 0.25).toFixed(2);
        soundManager.playMilestoneCelebration();
        const heatMsg = (t('rush_heat_up_toast') || '🔥 TĂNG TỐC CẤP {lvl}: Đồng hồ trôi x{rate}!')
          .replace('{lvl}', this.rushLevel)
          .replace('{rate}', rate);
        this.showSpellToast(heatMsg, true);
        this.updateRushHeatBadge();
      }

      const timeDrainRate = 1.0 + ((this.rushLevel || 1) - 1) * 0.25;
      this.rushTime -= delta * timeDrainRate;

      if (this.rushTime <= 0) {
        this.rushTime = 0;
        if (this.rushTimerEl) {
          this.rushTimerEl.textContent = '0.0s';
          this.rushTimerEl.style.color = '#ff3838';
          this.rushTimerEl.classList.remove('urgent-pulse');
        }
        if (this.rushProgressBar) {
          this.rushProgressBar.style.width = '0%';
          this.rushProgressBar.style.background = '#ff3838';
        }
        this.cancelSwapMode(null);
        this.cancelDestroyMode(null);
        this.gameLogic.gameOver = true;
        if (this.aiBot) this.aiBot.stop();
        this.clearSavedGameState();
        this.isAnimating = false;
        soundManager.playGameOver();
        const rushTimeoutMsg = (t('rush_gameover_msg') || 'Đồng hồ đã chạm mốc 0.0s trong Đua Giờ!\nĐiểm số chung cuộc: {score}')
          .replace('{score}', this.gameLogic.score.toLocaleString());
        this.showModal({
          title: t('rush_gameover_title') || '⏱️ HẾT GIỜ!',
          message: rushTimeoutMsg,
          primaryText: t('rush_btn_retry') || '⚡ Đua Lại Ngay',
          secondaryText: t('rush_btn_exit') || 'Thoát Rush',
          forceTitle: true,
          onPrimary: () => {
            this.hideModal();
            this.isAnimating = false;
            this.startNewGame(false);
          },
          onSecondary: () => {
            this.hideModal();
            this.isAnimating = false;
            if (this.isRushMode) {
              this.toggleRushMode(false);
            }
            this.startNewGame(false);
          }
        });
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

    // 1. 2048 Grand Master Trophy Mascot (Right flank outside board)
    const isC1Unlocked = this.questManager.isAllCompleted();
    if (isC1Unlocked && !this.trophyMascot) {
      this.trophyMascot = createChampionsTrophyMesh(true);
      this.trophyMascot.scale.set(0.24, 0.24, 0.24);
      this.trophyMascot.position.set(4.85, 0.0, -2.4);
      this.sceneManager.scene.add(this.trophyMascot);
    } else if (!isC1Unlocked && this.trophyMascot) {
      this.sceneManager.scene.remove(this.trophyMascot);
      this.trophyMascot = null;
    }

    // 2. Dark Singularity Slayer Trophy Mascot (Left flank outside board)
    const isBossUnlocked = this.questManager.isBossDefeated();
    if (isBossUnlocked && !this.bossTrophyMascot) {
      this.bossTrophyMascot = createBossTrophyMesh(true);
      this.bossTrophyMascot.scale.set(0.24, 0.24, 0.24);
      this.bossTrophyMascot.position.set(-4.85, 0.0, -2.4);
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
