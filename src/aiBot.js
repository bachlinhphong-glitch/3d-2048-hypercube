/**
 * 🤖 Grandmaster AI Auto-Play Bot
 * Full Expectimax Search Tree (Depth 3-4 with Chance Nodes)
 * Multi-Corner Snake Gradient Matrices & True Monotonicity
 * Supports 4x4 Classic & 3x3x3 Hypercube Modes + Rush Mode Bomb Defusal
 */

export class AIBot {
  constructor(gameApp) {
    this.gameApp = gameApp;
    this.isRunning = false;
    this.timer = null;
    this.intervalMs = 280; // Smooth 280ms per move
    this.onStatusChange = null;

    // Precompute 4x4 Snake Weight Matrices (4 Corners x 2 Orientations = 8 Patterns)
    this.snakeMatrices4x4 = this.buildSnakeMatrices4x4();
  }

  toggle() {
    if (this.isRunning) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    if (this.onStatusChange) this.onStatusChange(true);
    this.scheduleNextStep(50);
  }

  stop() {
    this.isRunning = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.onStatusChange) this.onStatusChange(false);
  }

  scheduleNextStep(delay = this.intervalMs) {
    if (!this.isRunning) return;
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => this.step(), delay);
  }

  step() {
    if (!this.isRunning) return;

    const gameLogic = this.gameApp.gameLogic;
    if (!gameLogic || gameLogic.gameOver) {
      this.stop();
      return;
    }

    // Wait if the 3D scene is currently animating
    if (this.gameApp.isAnimating) {
      this.scheduleNextStep(60);
      return;
    }

    const bestDir = this.findBestMove();
    if (!bestDir) {
      this.stop();
      return;
    }

    // Execute move through GameApp orchestrator
    this.gameApp.handleMove(bestDir);

    // Schedule next decision
    this.scheduleNextStep(this.intervalMs);
  }

  /**
   * Builds the 8 snake gradient matrices for 4x4 grids
   * Exponential decay along serpentine path anchors max tiles into corners.
   */
  buildSnakeMatrices4x4() {
    // Serpentine order of coordinates for Top-Left corner (horizontal first)
    const baseCoordsTL_H = [
      [0,0], [0,1], [0,2], [0,3],
      [1,3], [1,2], [1,1], [1,0],
      [2,0], [2,1], [2,2], [2,3],
      [3,3], [3,2], [3,1], [3,0]
    ];

    // Serpentine order for Top-Left corner (vertical first)
    const baseCoordsTL_V = [
      [0,0], [1,0], [2,0], [3,0],
      [3,1], [2,1], [1,1], [0,1],
      [0,2], [1,2], [2,2], [3,2],
      [3,3], [2,3], [1,3], [0,3]
    ];

    const matrices = [];
    const basePaths = [baseCoordsTL_H, baseCoordsTL_V];

    // Transformations for all 4 corners:
    // (r, c) -> (r, c) [TL], (r, 3-c) [TR], (3-r, c) [BL], (3-r, 3-c) [BR]
    const transforms = [
      ([r, c]) => [r, c],
      ([r, c]) => [r, 3 - c],
      ([r, c]) => [3 - r, c],
      ([r, c]) => [3 - r, 3 - c]
    ];

    transforms.forEach(tx => {
      basePaths.forEach(path => {
        const mat = new Float64Array(16);
        path.forEach(([r, c], index) => {
          const [tr, tc] = tx([r, c]);
          // Weight decreases from 4^15 down to 4^0 along snake path
          mat[tr * 4 + tc] = Math.pow(3.5, 15 - index);
        });
        matrices.push(mat);
      });
    });

    return matrices;
  }

  /**
   * Main Decision Engine:
   * Uses Expectimax lookahead tree for 4x4 and 3x3x3 boards.
   */
  findBestMove() {
    const gameLogic = this.gameApp.gameLogic;
    const is3D = gameLogic.mode === '3x3x3';

    if (is3D) {
      return this.findBestMove3D(gameLogic);
    } else {
      return this.findBestMove2D(gameLogic);
    }
  }

  // ===========================================================================
  // 4x4 2D EXPECTIMAX ENGINE
  // ===========================================================================

  findBestMove2D(gameLogic) {
    const directions = ['up', 'left', 'down', 'right'];
    const flatGrid = new Int32Array(16);

    // Convert game logic grid to 16-element integer array
    let emptyCount = 0;
    let hasBomb = false;
    let bombPos = -1;
    let bombCountdown = 99;

    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const cell = gameLogic.grid[0][r][c];
        const idx = r * 4 + c;
        if (cell) {
          flatGrid[idx] = cell.value;
          if (cell.isBomb) {
            hasBomb = true;
            bombPos = idx;
            bombCountdown = cell.bombCountdown || 0;
          }
        } else {
          flatGrid[idx] = 0;
          emptyCount++;
        }
      }
    }

    // Dynamic depth: Depth 4 if board is crowded (empty <= 4), Depth 3 if open
    const maxDepth = emptyCount <= 4 ? 4 : 3;

    let bestDir = null;
    let bestScore = -Infinity;

    for (const dir of directions) {
      const sim = this.fastSimulate2D(flatGrid, dir);
      if (!sim.moved) continue;

      // Bomb defusal priority bonus in Rush mode
      let movePriority = 0;
      if (hasBomb) {
        if (sim.mergesBomb) {
          movePriority += 1000000; // Urgent defusal!
        } else if (bombCountdown <= 2) {
          movePriority -= 50000; // Danger of explosion
        }
      }

      // Run expectimax on resulting state (starts with Chance node)
      const expectedScore = this.expectimax2D(sim.grid, maxDepth - 1, false) + movePriority + (sim.scoreAdded * 3.0);

      if (expectedScore > bestScore) {
        bestScore = expectedScore;
        bestDir = dir;
      }
    }

    return bestDir;
  }

  expectimax2D(grid, depth, isPlayerTurn) {
    if (depth <= 0) {
      return this.evaluateFlat2D(grid);
    }

    if (isPlayerTurn) {
      // MAX Node (Player's turn to choose direction)
      let maxScore = -Infinity;
      let hasValidMove = false;

      const directions = ['up', 'left', 'down', 'right'];
      for (const dir of directions) {
        const sim = this.fastSimulate2D(grid, dir);
        if (!sim.moved) continue;
        hasValidMove = true;
        const score = this.expectimax2D(sim.grid, depth - 1, false) + (sim.scoreAdded * 2.0);
        if (score > maxScore) maxScore = score;
      }

      return hasValidMove ? maxScore : -100000; // Dead end penalty
    } else {
      // CHANCE Node (Random tile spawn: 90% tile 2, 10% tile 4)
      const emptyIndices = [];
      for (let i = 0; i < 16; i++) {
        if (grid[i] === 0) emptyIndices.push(i);
      }

      if (emptyIndices.length === 0) {
        return this.evaluateFlat2D(grid);
      }

      // If too many empty spaces, sample top 3 most critical spots to keep performance < 10ms
      let sampleIndices = emptyIndices;
      if (emptyIndices.length > 3) {
        sampleIndices = this.sampleStrategicEmptySpots2D(grid, emptyIndices, 3);
      }

      let totalExpected = 0;
      const count = sampleIndices.length;

      for (const idx of sampleIndices) {
        // Tile 2 (90% probability)
        grid[idx] = 2;
        const score2 = this.expectimax2D(grid, depth - 1, true);

        // Tile 4 (10% probability)
        grid[idx] = 4;
        const score4 = this.expectimax2D(grid, depth - 1, true);

        grid[idx] = 0; // Revert cell

        const cellExpected = (0.90 * score2) + (0.10 * score4);
        totalExpected += cellExpected;
      }

      return totalExpected / count;
    }
  }

  sampleStrategicEmptySpots2D(grid, emptyIndices, maxCount) {
    // Pick empty spots that border non-zero tiles (highest tactical influence)
    const scored = emptyIndices.map(idx => {
      const r = Math.floor(idx / 4);
      const c = idx % 4;
      let neighborWeight = 0;
      if (r > 0 && grid[(r - 1) * 4 + c] > 0) neighborWeight += 1;
      if (r < 3 && grid[(r + 1) * 4 + c] > 0) neighborWeight += 1;
      if (c > 0 && grid[r * 4 + c - 1] > 0) neighborWeight += 1;
      if (c < 3 && grid[r * 4 + c + 1] > 0) neighborWeight += 1;
      return { idx, score: neighborWeight };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, maxCount).map(s => s.idx);
  }

  fastSimulate2D(grid, direction) {
    const out = new Int32Array(16);
    let moved = false;
    let scoreAdded = 0;

    if (direction === 'left') {
      for (let r = 0; r < 4; r++) {
        const o = r * 4;
        let target = 0;
        let lastVal = 0;
        for (let c = 0; c < 4; c++) {
          const val = grid[o + c];
          if (!val) continue;
          if (lastVal === val) {
            out[o + target - 1] = val * 2;
            scoreAdded += val * 2;
            lastVal = 0;
            moved = true;
          } else {
            out[o + target] = val;
            lastVal = val;
            if (target !== c) moved = true;
            target++;
          }
        }
      }
    } else if (direction === 'right') {
      for (let r = 0; r < 4; r++) {
        const o = r * 4;
        let target = 3;
        let lastVal = 0;
        for (let c = 3; c >= 0; c--) {
          const val = grid[o + c];
          if (!val) continue;
          if (lastVal === val) {
            out[o + target + 1] = val * 2;
            scoreAdded += val * 2;
            lastVal = 0;
            moved = true;
          } else {
            out[o + target] = val;
            lastVal = val;
            if (target !== c) moved = true;
            target--;
          }
        }
      }
    } else if (direction === 'up') {
      for (let c = 0; c < 4; c++) {
        let target = 0;
        let lastVal = 0;
        for (let r = 0; r < 4; r++) {
          const val = grid[r * 4 + c];
          if (!val) continue;
          if (lastVal === val) {
            out[(target - 1) * 4 + c] = val * 2;
            scoreAdded += val * 2;
            lastVal = 0;
            moved = true;
          } else {
            out[target * 4 + c] = val;
            lastVal = val;
            if (target !== r) moved = true;
            target++;
          }
        }
      }
    } else if (direction === 'down') {
      for (let c = 0; c < 4; c++) {
        let target = 3;
        let lastVal = 0;
        for (let r = 3; r >= 0; r--) {
          const val = grid[r * 4 + c];
          if (!val) continue;
          if (lastVal === val) {
            out[(target + 1) * 4 + c] = val * 2;
            scoreAdded += val * 2;
            lastVal = 0;
            moved = true;
          } else {
            out[target * 4 + c] = val;
            lastVal = val;
            if (target !== r) moved = true;
            target--;
          }
        }
      }
    }

    return { moved, grid: out, scoreAdded };
  }

  /**
   * Grandmaster Heuristic Evaluation for 4x4
   */
  evaluateFlat2D(grid) {
    let emptyCount = 0;
    let maxTile = 0;
    let maxIndex = 0;
    let smoothness = 0;
    let mergeBonus = 0;

    // 1. Snake Gradient Score (Evaluate across all 8 orientations and take maximum)
    const snakeScores = new Float64Array(this.snakeMatrices4x4.length);

    for (let i = 0; i < 16; i++) {
      const val = grid[i];
      if (val === 0) {
        emptyCount++;
        continue;
      }

      if (val > maxTile) {
        maxTile = val;
        maxIndex = i;
      }

      const logVal = Math.log2(val);
      for (let s = 0; s < this.snakeMatrices4x4.length; s++) {
        snakeScores[s] += this.snakeMatrices4x4[s][i] * logVal;
      }

      // Smoothness & Merge Potential (Right and Down neighbors)
      const r = Math.floor(i / 4);
      const c = i % 4;

      if (c < 3) {
        const rightVal = grid[i + 1];
        if (rightVal > 0) {
          smoothness -= Math.abs(logVal - Math.log2(rightVal));
          if (val === rightVal) mergeBonus += logVal * 32;
        }
      }
      if (r < 3) {
        const downVal = grid[i + 4];
        if (downVal > 0) {
          smoothness -= Math.abs(logVal - Math.log2(downVal));
          if (val === downVal) mergeBonus += logVal * 32;
        }
      }
    }

    // 2. True Monotonicity Penalty
    let monoPenalty = 0;
    // Rows
    for (let r = 0; r < 4; r++) {
      let inc = 0, dec = 0;
      const o = r * 4;
      for (let c = 0; c < 3; c++) {
        const v1 = grid[o + c] ? Math.log2(grid[o + c]) : 0;
        const v2 = grid[o + c + 1] ? Math.log2(grid[o + c + 1]) : 0;
        if (v1 > v2) dec += (v1 - v2);
        else inc += (v2 - v1);
      }
      monoPenalty -= Math.min(inc, dec) * 65;
    }
    // Cols
    for (let c = 0; c < 4; c++) {
      let inc = 0, dec = 0;
      for (let r = 0; r < 3; r++) {
        const v1 = grid[r * 4 + c] ? Math.log2(grid[r * 4 + c]) : 0;
        const v2 = grid[(r + 1) * 4 + c] ? Math.log2(grid[(r + 1) * 4 + c]) : 0;
        if (v1 > v2) dec += (v1 - v2);
        else inc += (v2 - v1);
      }
      monoPenalty -= Math.min(inc, dec) * 65;
    }

    // 3. Corner Locking vs Center Trap
    let cornerBonus = 0;
    const isCorner = (maxIndex === 0 || maxIndex === 3 || maxIndex === 12 || maxIndex === 15);
    const isCenter = (maxIndex === 5 || maxIndex === 6 || maxIndex === 9 || maxIndex === 10);

    if (isCorner) {
      cornerBonus += Math.log2(maxTile) * 200;
    } else if (isCenter) {
      cornerBonus -= Math.log2(maxTile) * 350; // Severe penalty for getting largest tile trapped in center
    }

    // 4. Empty Space Value
    const emptyScore = (emptyCount * 320) + (emptyCount > 0 ? Math.log2(emptyCount) * 160 : 0);

    // Max snake gradient value across all 8 orientations
    let bestSnake = 0;
    for (let s = 0; s < snakeScores.length; s++) {
      if (snakeScores[s] > bestSnake) bestSnake = snakeScores[s];
    }

    return (bestSnake * 0.0001) +
           emptyScore +
           (smoothness * 24) +
           monoPenalty +
           cornerBonus +
           mergeBonus;
  }

  // ===========================================================================
  // 3x3x3 HYPERCUBE 3D ENGINE
  // ===========================================================================

  findBestMove3D(gameLogic) {
    const directions = ['up', 'left', 'down', 'right', 'layerDown', 'layerUp'];
    let bestDir = null;
    let bestScore = -Infinity;

    for (const dir of directions) {
      const sim = gameLogic.simulateMove(dir);
      if (!sim || !sim.moved) continue;

      let score = this.evaluateGrid3D(sim.grid, sim.scoreAdded);

      // 2-ply lookahead for 3D
      let bestFollowUp = -Infinity;
      for (const dir2 of directions) {
        const sim2 = gameLogic.simulateMove(dir2, sim.grid);
        if (sim2 && sim2.moved) {
          const score2 = this.evaluateGrid3D(sim2.grid, sim2.scoreAdded);
          if (score2 > bestFollowUp) bestFollowUp = score2;
        }
      }

      if (bestFollowUp !== -Infinity) {
        score += bestFollowUp * 0.70;
      }

      if (score > bestScore) {
        bestScore = score;
        bestDir = dir;
      }
    }

    return bestDir;
  }

  evaluateGrid3D(grid, scoreAdded = 0) {
    const layers = 3;
    const rows = 3;
    const cols = 3;

    let emptyCount = 0;
    let maxVal = 0;
    let maxPos = null;
    let smoothness = 0;

    for (let l = 0; l < layers; l++) {
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const cell = grid[l][r][c];
          if (!cell) {
            emptyCount++;
          } else {
            const val = cell.value;
            if (val > maxVal) {
              maxVal = val;
              maxPos = { l, r, c };
            }
            const logVal = Math.log2(val);

            // Smoothness along X, Y, Z
            if (c < cols - 1 && grid[l][r][c + 1]) {
              smoothness -= Math.abs(logVal - Math.log2(grid[l][r][c + 1].value));
            }
            if (r < rows - 1 && grid[l][r + 1][c]) {
              smoothness -= Math.abs(logVal - Math.log2(grid[l][r + 1][c].value));
            }
            if (l < layers - 1 && grid[l + 1][r][c]) {
              smoothness -= Math.abs(logVal - Math.log2(grid[l + 1][r][c].value));
            }
          }
        }
      }
    }

    // Corner bonus in 3D (8 outer corners of the 3x3x3 cube)
    let cornerBonus = 0;
    if (maxPos) {
      const isCornerX = (maxPos.c === 0 || maxPos.c === cols - 1);
      const isCornerY = (maxPos.r === 0 || maxPos.r === rows - 1);
      const isCornerZ = (maxPos.l === 0 || maxPos.l === layers - 1);
      if (isCornerX && isCornerY && isCornerZ) {
        cornerBonus = Math.log2(maxVal) * 220;
      }
    }

    // Monotonicity along 3 dimensions
    let monoPenalty = 0;
    for (let l = 0; l < layers; l++) {
      for (let r = 0; r < rows; r++) {
        let diffInc = 0, diffDec = 0;
        for (let c = 0; c < cols - 1; c++) {
          const v1 = grid[l][r][c] ? Math.log2(grid[l][r][c].value) : 0;
          const v2 = grid[l][r][c + 1] ? Math.log2(grid[l][r][c + 1].value) : 0;
          if (v1 > v2) diffDec += (v1 - v2);
          else diffInc += (v2 - v1);
        }
        monoPenalty -= Math.min(diffInc, diffDec) * 45;
      }
      for (let c = 0; c < cols; c++) {
        let diffInc = 0, diffDec = 0;
        for (let r = 0; r < rows - 1; r++) {
          const v1 = grid[l][r][c] ? Math.log2(grid[l][r][c].value) : 0;
          const v2 = grid[l][r + 1][c] ? Math.log2(grid[l][r + 1][c].value) : 0;
          if (v1 > v2) diffDec += (v1 - v2);
          else diffInc += (v2 - v1);
        }
        monoPenalty -= Math.min(diffInc, diffDec) * 45;
      }
    }

    return (emptyCount * 280) +
           (smoothness * 22) +
           cornerBonus +
           monoPenalty +
           (scoreAdded * 3.0);
  }

  /**
   * Backwards compatibility helper for external callers
   */
  evaluateGrid(grid, is3D, scoreAdded = 0) {
    if (is3D) {
      return this.evaluateGrid3D(grid, scoreAdded);
    } else {
      const flat = new Int32Array(16);
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          flat[r * 4 + c] = grid[0][r][c] ? grid[0][r][c].value : 0;
        }
      }
      return this.evaluateFlat2D(flat);
    }
  }
}
