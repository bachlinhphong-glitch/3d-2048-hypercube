import * as THREE from 'three';
import { SceneManager } from './sceneManager.js';
import { Board, getGridPosition, getBoardMode } from './board.js';
import { Tile3D } from './tile.js';
import { ParticleSystem } from './particles.js';
import { Game2048Logic } from './gameLogic.js';
import { InputManager } from './inputManager.js';
import { soundManager } from './sound.js';
import { textureManager } from './textureManager.js';

class GameApp {
  constructor() {
    this.container = document.getElementById('canvas-container');
    this.mode = '4x4'; // '4x4' or '3x3x3'
    this.currentShape = 'rounded_cube'; // 'rounded_cube', 'crystal_octahedron', 'core_sphere', 'auto_evolution'
    this.currentTheme = 'classic'; // 'classic', 'telemetry', 'neon'

    this.sceneManager = new SceneManager(this.container);
    this.particleSystem = new ParticleSystem(this.sceneManager.scene);
    this.gameLogic = new Game2048Logic(this.mode);
    this.board = new Board(this.mode);
    this.sceneManager.scene.add(this.board.group);

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

    this.initUI();
    this.initTelemetryCanvas();
    this.initInput();
    this.startNewGame();

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

    // Rush Mode Elements
    this.rushPanel = document.getElementById('rush-panel');
    this.rushTimerEl = document.getElementById('rush-timer-val');
    this.rushProgressBar = document.getElementById('rush-progress-bar');
    this.rushToggleBtn = document.getElementById('btn-toggle-rush');
    this.rushFloatingContainer = document.getElementById('rush-floating-fx');

    // 3D Layer Controls (Only for 3x3x3 Hypercube)
    this.layerControlsEl = document.getElementById('layer-controls');

    // Action Buttons
    document.getElementById('btn-new-game').addEventListener('click', () => {
      this.startNewGame();
    });

    document.getElementById('btn-reset-camera').addEventListener('click', () => {
      this.sceneManager.resetCamera();
    });

    const muteBtn = document.getElementById('btn-sound-toggle');
    if (muteBtn) {
      muteBtn.addEventListener('click', () => {
        const isMuted = soundManager.toggleMute();
        muteBtn.textContent = isMuted ? '🔇 Tắt' : '🔊 Bật';
        muteBtn.classList.toggle('muted', isMuted);
      });
    }

    // Dimension Mode Selector
    const modeSelect = document.getElementById('select-mode');
    if (modeSelect) {
      modeSelect.addEventListener('change', (e) => {
        this.switchDimensionMode(e.target.value);
      });
    }

    // Tile Shape Selector
    const shapeSelect = document.getElementById('select-shape');
    if (shapeSelect) {
      shapeSelect.addEventListener('change', (e) => {
        this.switchTileShape(e.target.value);
      });
    }

    // Theme Selector
    const themeSelect = document.getElementById('select-theme');
    if (themeSelect) {
      themeSelect.addEventListener('change', (e) => {
        this.switchTheme(e.target.value);
      });
    }

    // Rush Mode Toggle
    if (this.rushToggleBtn) {
      this.rushToggleBtn.addEventListener('click', () => {
        this.toggleRushMode();
      });
    }

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
      apm: document.getElementById('stat-apm'),
      density: document.getElementById('stat-density')
    };
  }

  switchDimensionMode(newMode) {
    if (this.mode === newMode) return;
    this.mode = newMode;
    this.board.setMode(newMode);
    this.sceneManager.setMode(newMode);
    this.gameLogic.setMode(newMode);

    if (this.layerControlsEl) {
      this.layerControlsEl.style.display = newMode === '3x3x3' ? 'flex' : 'none';
    }

    this.sceneManager.requestShadowUpdate(30);
    this.startNewGame();
  }

  switchTileShape(newShape) {
    this.currentShape = newShape;
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

  toggleRushMode() {
    this.isRushMode = !this.isRushMode;
    this.gameLogic.setRushMode(this.isRushMode);

    if (this.rushToggleBtn) {
      this.rushToggleBtn.textContent = this.isRushMode ? '⚡ Rush: BẬT' : '⚡ Rush: TẮT';
      this.rushToggleBtn.classList.toggle('active', this.isRushMode);
    }

    if (this.rushPanel) {
      this.rushPanel.style.display = this.isRushMode ? 'flex' : 'none';
    }

    this.rushTime = 30.0;
    this.startNewGame();
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
      (clientX, clientY) => this.handleCanvasClick(clientX, clientY)
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
  }

  handleCanvasPointerMove(clientX, clientY) {
    if (!this.isSwapMode || this.isAnimating || this.gameLogic.gameOver) return;

    const rect = this.container.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), this.sceneManager.camera);

    const activeTileMeshes = [];
    const tileMeshMap = new Map();

    for (let l = 0; l < this.tiles3D.length; l++) {
      for (let r = 0; r < this.tiles3D[l].length; r++) {
        for (let c = 0; c < this.tiles3D[l][r].length; c++) {
          const tile = this.tiles3D[l][r][c];
          if (tile && tile.innerMesh) {
            activeTileMeshes.push(tile.innerMesh);
            tileMeshMap.set(tile.innerMesh, tile);
          }
        }
      }
    }

    const intersects = raycaster.intersectObjects(activeTileMeshes, false);
    const hitTile = (intersects.length > 0) ? tileMeshMap.get(intersects[0].object) : null;

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

  startNewGame() {
    this.hideModal();
    this.cancelSwapMode();

    // Clean all 3D tiles from grid and scene
    this.cleanAllSceneTiles();

    this.tiles3D = this.createEmptyTileGrid();
    this.particleSystem.clear();
    this.gameLogic.reset();
    this.rushTime = 30.0;
    this.updateScoreUI();
    this.updateSpellUI();

    // Spawn 2 initial tiles
    this.spawnTile();
    this.spawnTile();

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

  async handleMove(direction) {
    if (this.isAnimating) return;
    if (this.isSwapMode) {
      this.cancelSwapMode();
    }

    const result = this.gameLogic.move(direction);
    if (!result.moved) return;

    this.isAnimating = true;
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

      if (surviving && surviving !== m.sourceTile) {
        m.sourceTile.dispose(true);
        surviving.upgradeTo(m.newValue);

        const pos = getGridPosition(m.targetL, m.targetR, m.targetC);
        this.particleSystem.burst(pos.x, pos.y, pos.z, m.newValue);
        soundManager.playMerge(m.newValue);
      } else if (!surviving) {
        this.tiles3D[m.targetL][m.targetR][m.targetC] = m.sourceTile;
        m.sourceTile.upgradeTo(m.newValue);

        const pos = getGridPosition(m.targetL, m.targetR, m.targetC);
        this.particleSystem.burst(pos.x, pos.y, pos.z, m.newValue);
        soundManager.playMerge(m.newValue);
      }
    });

    // Screen Shake on big merge (or if in Hyper Neon)
    if (maxMergedVal >= 64 || (this.currentTheme === 'neon' && maxMergedVal >= 32)) {
      this.particleSystem.screenShake(this.sceneManager.camera, maxMergedVal >= 128 ? 0.35 : 0.2);
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

    if (result.won) {
      soundManager.playWin();
      this.showModal({
        title: '🎉 CHIẾN THẮNG!',
        message: 'Tuyệt vời! Bạn đã mở khóa được khối 2048 danh giá.',
        primaryText: 'Tiếp tục chinh phục',
        secondaryText: 'Chơi ván mới',
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

    if (result.gameOver) {
      soundManager.playGameOver();
      this.showModal({
        title: '💀 HẾT NƯỚC ĐI!',
        message: `Bàn cờ đã đầy và không còn nước gộp khả dụng.\nĐiểm số: ${this.gameLogic.score}`,
        primaryText: 'Thử lại ngay',
        secondaryText: null,
        onPrimary: () => {
          this.startNewGame();
        }
      });
      return;
    }

    this.isAnimating = false;
  }

  showModal({ title, message, primaryText, secondaryText, onPrimary, onSecondary }) {
    this.modalTitle.textContent = title;
    this.modalMessage.textContent = message;

    this.modalBtnPrimary.textContent = primaryText;
    this.modalBtnPrimary.onclick = () => {
      if (onPrimary) onPrimary();
    };

    if (secondaryText) {
      this.modalBtnSecondary.textContent = secondaryText;
      this.modalBtnSecondary.style.display = 'inline-block';
      this.modalBtnSecondary.onclick = () => {
        if (onSecondary) onSecondary();
      };
    } else {
      this.modalBtnSecondary.style.display = 'none';
    }

    this.modalOverlay.classList.add('active');
  }

  hideModal() {
    this.modalOverlay.classList.remove('active');
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
    this.updateSpellUI();
    this.showSpellToast('CHỌN KHỐI THỨ NHẤT TRÊN BÀN CỜ ĐỂ ĐỔI VỊ TRÍ...');
  }

  cancelSwapMode() {
    if (!this.isSwapMode) return;
    this.isSwapMode = false;
    document.body.classList.remove('in-swap-mode');
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
    if (!this.isSwapMode || this.isAnimating || this.gameLogic.gameOver) return;

    const rect = this.container.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), this.sceneManager.camera);

    const activeTileMeshes = [];
    const tileMeshMap = new Map();

    for (let l = 0; l < this.tiles3D.length; l++) {
      for (let r = 0; r < this.tiles3D[l].length; r++) {
        for (let c = 0; c < this.tiles3D[l][r].length; c++) {
          const tile = this.tiles3D[l][r][c];
          if (tile && tile.innerMesh) {
            activeTileMeshes.push(tile.innerMesh);
            tileMeshMap.set(tile.innerMesh, tile);
          }
        }
      }
    }

    const intersects = raycaster.intersectObjects(activeTileMeshes, false);
    if (intersects.length === 0) return;

    const hitTileMesh = intersects[0].object;
    const clickedTile = tileMeshMap.get(hitTileMesh);
    if (!clickedTile) return;

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

      this.gameLogic.swapTiles(posA, posB);

      this.tiles3D[posA.l][posA.r][posA.c] = tileB;
      this.tiles3D[posB.l][posB.r][posB.c] = tileA;

      soundManager.playSpellSwap();

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
    }
  }

  updateTelemetryAndStats() {
    const now = performance.now();
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

  animate() {
    requestAnimationFrame(() => this.animate());
    const delta = Math.min(this.clock.getDelta(), 0.1);

    // Update Rush Mode internal countdown (pure math - zero DOM writes in rAF)
    if (this.isRushMode && !this.gameLogic.gameOver && !this.isAnimating) {
      this.rushTime -= delta;
      if (this.rushTime <= 0) {
        this.rushTime = 0;
        this.gameLogic.gameOver = true;
        soundManager.playGameOver();
        this.showModal({
          title: '⌛ HẾT THỜI GIAN!',
          message: `Hết giờ trong chế độ Time Rush!\nĐiểm số đạt được: ${this.gameLogic.score}`,
          primaryText: 'Thử lại ngay',
          secondaryText: null,
          onPrimary: () => {
            this.startNewGame();
          }
        });
      }
    }

    // Update Active 3D Tiles (spin octahedron, torus ring, bomb pulse)
    for (let l = 0; l < this.tiles3D.length; l++) {
      for (let r = 0; r < this.tiles3D[l].length; r++) {
        for (let c = 0; c < this.tiles3D[l][r].length; c++) {
          const tile = this.tiles3D[l][r][c];
          if (tile) tile.update(delta);
        }
      }
    }

    // Frame stats (pure math - no DOM manipulation in rAF)
    this.frameCount++;
    this.lastFrameTime = delta * 1000;

    this.particleSystem.update(delta);
    this.sceneManager.render(this.clock.getElapsedTime());
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
