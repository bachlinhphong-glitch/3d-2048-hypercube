export class Game2048Logic {
  constructor(mode = '4x4') {
    this.mode = mode; // '4x4' or '3x3x3'
    this.initDimensions();

    this.grid = this.createEmptyGrid();
    this.score = 0;
    this.bestScore = this.loadBestScore();
    this.won = false;
    this.keepPlaying = false;
    this.gameOver = false;

    // Rush Mode Properties
    this.isRushMode = false;
    this.moveCount = 0;

    // Summoner Spells / Phép bổ trợ (Gợi ý, Đi lại, Đổi vị trí)
    this.maxCharges = 2;
    this.spellCharges = {
      hint: 2,
      undo: 2,
      swap: 2
    };
    this.maxTileValueAchieved = 4;
    this.history = [];
  }

  initDimensions() {
    if (this.mode === '3x3x3') {
      this.layers = 3;
      this.rows = 3;
      this.cols = 3;
    } else {
      this.layers = 1;
      this.rows = 4;
      this.cols = 4;
    }
  }

  setMode(mode) {
    this.mode = mode;
    this.initDimensions();
    this.reset();
  }

  setRushMode(enabled) {
    this.isRushMode = enabled;
    this.moveCount = 0;
  }

  createEmptyGrid() {
    return Array.from({ length: this.layers }, () =>
      Array.from({ length: this.rows }, () =>
        Array(this.cols).fill(null)
      )
    );
  }

  loadBestScore() {
    try {
      const key = `3d2048_best_${this.mode}`;
      return parseInt(localStorage.getItem(key) || '0', 10);
    } catch {
      return 0;
    }
  }

  saveBestScore() {
    try {
      const key = `3d2048_best_${this.mode}`;
      localStorage.setItem(key, String(this.bestScore));
    } catch {}
  }

  reset() {
    this.grid = this.createEmptyGrid();
    this.score = 0;
    this.bestScore = this.loadBestScore();
    this.won = false;
    this.keepPlaying = false;
    this.gameOver = false;
    this.moveCount = 0;

    // Reset summoner spells to initial 2 charges
    this.spellCharges = {
      hint: 2,
      undo: 2,
      swap: 2
    };
    this.maxTileValueAchieved = 4;
    this.history = [];
  }

  getEmptyCells() {
    const cells = [];
    for (let l = 0; l < this.layers; l++) {
      for (let r = 0; r < this.rows; r++) {
        for (let c = 0; c < this.cols; c++) {
          if (!this.grid[l][r][c]) {
            cells.push({ l, r, c });
          }
        }
      }
    }
    return cells;
  }

  getTotalCells() {
    return this.layers * this.rows * this.cols;
  }

  getActiveTilesCount() {
    return this.getTotalCells() - this.getEmptyCells().length;
  }

  // Get spawn info. If in Rush Mode and moveCount is a multiple of 6, spawn a Bomb Tile
  getRandomSpawnInfo() {
    const emptyCells = this.getEmptyCells();
    if (emptyCells.length === 0) return null;
    const cell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const value = Math.random() < 0.9 ? 2 : 4;

    let isBomb = false;
    if (this.isRushMode && this.moveCount > 0 && this.moveCount % 6 === 0) {
      isBomb = true;
    }

    return {
      l: cell.l,
      r: cell.r,
      c: cell.c,
      value,
      isBomb,
      bombCountdown: isBomb ? 5 : 0
    };
  }

  setTile(l, r, c, tile) {
    this.grid[l][r][c] = tile;
  }

  hasValidMoves() {
    // 1. Any empty cells?
    if (this.getEmptyCells().length > 0) return true;

    // 2. Any adjacent matching tiles in 3D?
    for (let l = 0; l < this.layers; l++) {
      for (let r = 0; r < this.rows; r++) {
        for (let c = 0; c < this.cols; c++) {
          const val = this.grid[l][r][c].value;
          // Check Right (X)
          if (c < this.cols - 1 && this.grid[l][r][c + 1].value === val) return true;
          // Check Down (Z)
          if (r < this.rows - 1 && this.grid[l][r + 1][c].value === val) return true;
          // Check Up Layer (Y)
          if (l < this.layers - 1 && this.grid[l + 1][r][c].value === val) return true;
        }
      }
    }
    return false;
  }

  // Move in 6 directions: 'up', 'down', 'left', 'right', 'layerUp', 'layerDown'
  move(direction) {
    const vectors = {
      up:        { l: 0,  r: -1, c: 0 },
      down:      { l: 0,  r: 1,  c: 0 },
      left:      { l: 0,  r: 0,  c: -1 },
      right:     { l: 0,  r: 0,  c: 1 },
      layerUp:   { l: 1,  r: 0,  c: 0 },
      layerDown: { l: -1, r: 0,  c: 0 }
    };

    const vector = vectors[direction];
    if (!vector) return { moved: false };

    // Ignore layer moves in 4x4
    if (this.mode === '4x4' && vector.l !== 0) return { moved: false };

    // Determine traversal order
    const layerIndices = vector.l === 1 ? Array.from({ length: this.layers }, (_, i) => this.layers - 1 - i) : Array.from({ length: this.layers }, (_, i) => i);
    const rowIndices = vector.r === 1 ? Array.from({ length: this.rows }, (_, i) => this.rows - 1 - i) : Array.from({ length: this.rows }, (_, i) => i);
    const colIndices = vector.c === 1 ? Array.from({ length: this.cols }, (_, i) => this.cols - 1 - i) : Array.from({ length: this.cols }, (_, i) => i);

    let moved = false;
    let scoreAdded = 0;
    const movements = [];
    const mergedGrid = this.createEmptyGrid();
    const newGrid = this.createEmptyGrid();

    // Snapshot board state before making a move (for Undo spell)
    this.saveSnapshot();

    let defusedBombs = 0;

    for (const l of layerIndices) {
      for (const r of rowIndices) {
        for (const c of colIndices) {
          const tile = this.grid[l][r][c];
          if (!tile) continue;

          let currL = l;
          let currR = r;
          let currC = c;

          let nextL = currL + vector.l;
          let nextR = currR + vector.r;
          let nextC = currC + vector.c;

          // Slide through empty space
          while (
            nextL >= 0 && nextL < this.layers &&
            nextR >= 0 && nextR < this.rows &&
            nextC >= 0 && nextC < this.cols &&
            !newGrid[nextL][nextR][nextC]
          ) {
            currL = nextL;
            currR = nextR;
            currC = nextC;
            nextL = currL + vector.l;
            nextR = currR + vector.r;
            nextC = currC + vector.c;
          }

          // Check for collision with an existing tile
          if (
            nextL >= 0 && nextL < this.layers &&
            nextR >= 0 && nextR < this.rows &&
            nextC >= 0 && nextC < this.cols &&
            newGrid[nextL][nextR][nextC] &&
            newGrid[nextL][nextR][nextC].value === tile.value &&
            !mergedGrid[nextL][nextR][nextC]
          ) {
            // Merge!
            const targetTile = newGrid[nextL][nextR][nextC];
            const newValue = targetTile.value * 2;
            scoreAdded += newValue;

            if (tile.isBomb || targetTile.isBomb) {
              defusedBombs++;
              targetTile.isBomb = false;
              targetTile.bombCountdown = 0;
            }

            movements.push({
              tile: tile,
              from: { l, r, c },
              to: { l: nextL, r: nextR, c: nextC },
              mergedInto: targetTile,
              newValue: newValue
            });

            mergedGrid[nextL][nextR][nextC] = true;
            targetTile.value = newValue;
            moved = true;
          } else {
            // Normal slide to farthest empty slot
            newGrid[currL][currR][currC] = tile;
            if (currL !== l || currR !== r || currC !== c) {
              moved = true;
              movements.push({
                tile: tile,
                from: { l, r, c },
                to: { l: currL, r: currR, c: currC },
                mergedInto: null,
                newValue: null
              });
            }
          }
        }
      }
    }

    if (moved) {
      this.grid = newGrid;
      this.score += scoreAdded;
      if (this.score > this.bestScore) {
        this.bestScore = this.score;
        this.saveBestScore();
      }

      this.moveCount++;

      // Process Bomb Countdowns if in Rush Mode
      const explodedBombs = [];
      const updatedBombs = [];
      if (this.isRushMode) {
        for (let l = 0; l < this.layers; l++) {
          for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
              const tile = this.grid[l][r][c];
              if (tile && tile.isBomb) {
                tile.bombCountdown--;
                if (tile.bombCountdown <= 0) {
                  explodedBombs.push(tile);
                  tile.isBomb = false;
                } else {
                  updatedBombs.push(tile);
                }
              }
            }
          }
        }
      }

      // Check win condition (2048)
      let wonThisTurn = false;
      if (!this.won && !this.keepPlaying) {
        for (let l = 0; l < this.layers; l++) {
          for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
              if (this.grid[l][r][c] && this.grid[l][r][c].value >= 2048) {
                this.won = true;
                wonThisTurn = true;
                break;
              }
            }
            if (wonThisTurn) break;
          }
          if (wonThisTurn) break;
        }
      }

      const isOver = !this.hasValidMoves();
      this.gameOver = isOver;

      // Check if new highest tile created -> Summoner Spell Cooldown Recharge!
      let maxTileMerged = 0;
      for (const m of movements) {
        if (m.mergedInto && m.newValue) {
          maxTileMerged = Math.max(maxTileMerged, m.newValue);
        }
      }

      let spellRecharged = false;
      let newMilestone = this.maxTileValueAchieved;
      if (maxTileMerged > this.maxTileValueAchieved) {
        this.maxTileValueAchieved = maxTileMerged;
        spellRecharged = true;
        newMilestone = maxTileMerged;
        for (const k in this.spellCharges) {
          this.spellCharges[k] = Math.min(this.maxCharges, this.spellCharges[k] + 1);
        }
      }

      return {
        moved: true,
        scoreAdded,
        movements,
        defusedBombs,
        explodedBombs,
        updatedBombs,
        won: wonThisTurn,
        gameOver: isOver,
        spellRecharged,
        newMilestone,
        spellCharges: { ...this.spellCharges }
      };
    }

    // If move failed, discard the redundant snapshot
    this.history.pop();
    return { moved: false };
  }

  saveSnapshot() {
    const gridCopy = this.grid.map(layer =>
      layer.map(row =>
        row.map(cell => cell ? { ...cell } : null)
      )
    );
    this.history.push({
      grid: gridCopy,
      score: this.score,
      moveCount: this.moveCount,
      maxTileValueAchieved: this.maxTileValueAchieved
    });
    if (this.history.length > 25) {
      this.history.shift();
    }
  }

  canUndo() {
    return this.spellCharges.undo > 0 && this.history.length > 0;
  }

  undo() {
    if (!this.canUndo()) return null;
    const previous = this.history.pop();
    this.spellCharges.undo--;
    this.grid = previous.grid;
    this.score = previous.score;
    this.moveCount = previous.moveCount;
    this.maxTileValueAchieved = previous.maxTileValueAchieved;
    this.gameOver = false;
    return {
      success: true,
      grid: this.grid,
      score: this.score,
      spellCharges: { ...this.spellCharges }
    };
  }

  canSwap() {
    return this.spellCharges.swap > 0;
  }

  swapTiles(posA, posB) {
    if (!this.canSwap()) return false;
    if (posA.l === posB.l && posA.r === posB.r && posA.c === posB.c) return false;

    this.saveSnapshot();

    const tileA = this.grid[posA.l][posA.r][posA.c];
    const tileB = this.grid[posB.l][posB.r][posB.c];

    this.grid[posA.l][posA.r][posA.c] = tileB;
    this.grid[posB.l][posB.r][posB.c] = tileA;

    this.spellCharges.swap--;
    this.gameOver = !this.hasValidMoves();
    return {
      success: true,
      spellCharges: { ...this.spellCharges }
    };
  }

  simulateMove(direction) {
    const vectors = {
      up:        { l: 0,  r: -1, c: 0 },
      down:      { l: 0,  r: 1,  c: 0 },
      left:      { l: 0,  r: 0,  c: -1 },
      right:     { l: 0,  r: 0,  c: 1 },
      layerUp:   { l: 1,  r: 0,  c: 0 },
      layerDown: { l: -1, r: 0,  c: 0 }
    };

    const vector = vectors[direction];
    if (!vector) return { moved: false };
    if (this.mode === '4x4' && vector.l !== 0) return { moved: false };

    const layerIndices = vector.l === 1 ? Array.from({ length: this.layers }, (_, i) => this.layers - 1 - i) : Array.from({ length: this.layers }, (_, i) => i);
    const rowIndices = vector.r === 1 ? Array.from({ length: this.rows }, (_, i) => this.rows - 1 - i) : Array.from({ length: this.rows }, (_, i) => i);
    const colIndices = vector.c === 1 ? Array.from({ length: this.cols }, (_, i) => this.cols - 1 - i) : Array.from({ length: this.cols }, (_, i) => i);

    let moved = false;
    let scoreAdded = 0;
    const mergedGrid = this.createEmptyGrid();
    const newGrid = this.createEmptyGrid();

    for (const l of layerIndices) {
      for (const r of rowIndices) {
        for (const c of colIndices) {
          const tile = this.grid[l][r][c];
          if (!tile) continue;

          let currL = l, currR = r, currC = c;
          let nextL = currL + vector.l;
          let nextR = currR + vector.r;
          let nextC = currC + vector.c;

          while (
            nextL >= 0 && nextL < this.layers &&
            nextR >= 0 && nextR < this.rows &&
            nextC >= 0 && nextC < this.cols &&
            !newGrid[nextL][nextR][nextC]
          ) {
            currL = nextL; currR = nextR; currC = nextC;
            nextL = currL + vector.l;
            nextR = currR + vector.r;
            nextC = currC + vector.c;
          }

          if (
            nextL >= 0 && nextL < this.layers &&
            nextR >= 0 && nextR < this.rows &&
            nextC >= 0 && nextC < this.cols &&
            newGrid[nextL][nextR][nextC] &&
            newGrid[nextL][nextR][nextC].value === tile.value &&
            !mergedGrid[nextL][nextR][nextC]
          ) {
            const newValue = tile.value * 2;
            scoreAdded += newValue;
            mergedGrid[nextL][nextR][nextC] = true;
            newGrid[nextL][nextR][nextC] = { ...tile, value: newValue };
            moved = true;
          } else {
            newGrid[currL][currR][currC] = { ...tile };
            if (currL !== l || currR !== r || currC !== c) {
              moved = true;
            }
          }
        }
      }
    }

    return { moved, grid: newGrid, scoreAdded };
  }

  evaluateBoard(grid, scoreAdded) {
    let emptyCount = 0;
    let maxTile = 0;
    let maxTilePos = null;
    let smoothness = 0;

    for (let l = 0; l < this.layers; l++) {
      for (let r = 0; r < this.rows; r++) {
        for (let c = 0; c < this.cols; c++) {
          const cell = grid[l][r][c];
          if (!cell) {
            emptyCount++;
          } else {
            const val = cell.value;
            if (val > maxTile) {
              maxTile = val;
              maxTilePos = { l, r, c };
            }

            if (c < this.cols - 1 && grid[l][r][c + 1]) {
              smoothness -= Math.abs(Math.log2(val) - Math.log2(grid[l][r][c + 1].value));
            }
            if (r < this.rows - 1 && grid[l][r + 1][c]) {
              smoothness -= Math.abs(Math.log2(val) - Math.log2(grid[l][r + 1][c].value));
            }
          }
        }
      }
    }

    let cornerBonus = 0;
    if (maxTilePos) {
      const isCorner = (maxTilePos.r === 0 || maxTilePos.r === this.rows - 1) &&
                       (maxTilePos.c === 0 || maxTilePos.c === this.cols - 1);
      if (isCorner) cornerBonus = 800;
    }

    return (emptyCount * 180) + (scoreAdded * 2.5) + cornerBonus + (smoothness * 20);
  }

  getBestMove() {
    if (this.spellCharges.hint <= 0) return null;

    const directions = this.mode === '3x3x3'
      ? ['up', 'down', 'left', 'right', 'layerUp', 'layerDown']
      : ['up', 'down', 'left', 'right'];

    let bestDir = null;
    let bestScore = -Infinity;

    for (const dir of directions) {
      const sim = this.simulateMove(dir);
      if (!sim.moved) continue;
      const score = this.evaluateBoard(sim.grid, sim.scoreAdded);
      if (score > bestScore) {
        bestScore = score;
        bestDir = dir;
      }
    }

    if (bestDir) {
      this.spellCharges.hint--;
    }
    return {
      direction: bestDir,
      spellCharges: { ...this.spellCharges }
    };
  }
}
