/**
 * 🤖 AI Auto-Play Bot (Expectimax / Heuristic Evaluation Engine)
 * Supports both 4x4 Classic and 3x3x3 Hypercube modes.
 */

export class AIBot {
  constructor(gameApp) {
    this.gameApp = gameApp;
    this.isRunning = false;
    this.timer = null;
    this.intervalMs = 280; // Smooth 280ms per move as specified
    this.onStatusChange = null;
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

    // Wait if the 3D scene is currently executing a slide animation
    if (this.gameApp.isAnimating) {
      this.scheduleNextStep(60);
      return;
    }

    const bestDir = this.findBestMove();
    if (!bestDir) {
      // No valid moves left
      this.stop();
      return;
    }

    // Execute move through GameApp
    this.gameApp.handleMove(bestDir);

    // Schedule next decision
    this.scheduleNextStep(this.intervalMs);
  }

  findBestMove() {
    const gameLogic = this.gameApp.gameLogic;
    const is3D = gameLogic.mode === '3x3x3';
    const directions = is3D
      ? ['up', 'left', 'down', 'right', 'layerDown', 'layerUp']
      : ['up', 'left', 'down', 'right'];

    let bestDir = null;
    let bestScore = -Infinity;

    for (const dir of directions) {
      const sim1 = gameLogic.simulateMove(dir);
      if (!sim1 || !sim1.moved) continue;

      let score1 = this.evaluateGrid(sim1.grid, is3D, sim1.scoreAdded);

      // 2-ply lookahead: evaluate best possible follow-up move
      let bestFollowUp = -Infinity;
      for (const dir2 of directions) {
        const sim2 = gameLogic.simulateMove(dir2, sim1.grid);
        if (sim2 && sim2.moved) {
          const score2 = this.evaluateGrid(sim2.grid, is3D, sim2.scoreAdded);
          if (score2 > bestFollowUp) bestFollowUp = score2;
        }
      }

      if (bestFollowUp !== -Infinity) {
        score1 += bestFollowUp * 0.65;
      }

      if (score1 > bestScore) {
        bestScore = score1;
        bestDir = dir;
      }
    }

    return bestDir;
  }

  evaluateGrid(grid, is3D, scoreAdded = 0) {
    const layers = is3D ? 3 : 1;
    const rows = is3D ? 3 : 4;
    const cols = is3D ? 3 : 4;

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

            // Smoothness with right neighbor
            if (c < cols - 1 && grid[l][r][c + 1]) {
              smoothness -= Math.abs(logVal - Math.log2(grid[l][r][c + 1].value));
            }
            // Smoothness with bottom neighbor
            if (r < rows - 1 && grid[l][r + 1][c]) {
              smoothness -= Math.abs(logVal - Math.log2(grid[l][r + 1][c].value));
            }
            // Smoothness with upper layer neighbor in 3D
            if (is3D && l < layers - 1 && grid[l + 1][r][c]) {
              smoothness -= Math.abs(logVal - Math.log2(grid[l + 1][r][c].value));
            }
          }
        }
      }
    }

    // Corner bonus: strongly favor keeping the highest tile in an outer corner
    let cornerBonus = 0;
    if (maxPos) {
      const isCorner2D = (maxPos.r === 0 || maxPos.r === rows - 1) &&
                         (maxPos.c === 0 || maxPos.c === cols - 1);
      const isCorner3D = !is3D || (maxPos.l === 0 || maxPos.l === layers - 1);
      if (isCorner2D && isCorner3D) {
        cornerBonus = Math.log2(maxVal) * 160;
      }
    }

    // Monotonicity: values should decrease or increase monotonically along lines
    let monoR = 0;
    let monoC = 0;
    for (let l = 0; l < layers; l++) {
      for (let r = 0; r < rows; r++) {
        let diffInc = 0, diffDec = 0;
        for (let c = 0; c < cols - 1; c++) {
          const v1 = grid[l][r][c] ? Math.log2(grid[l][r][c].value) : 0;
          const v2 = grid[l][r][c + 1] ? Math.log2(grid[l][r][c + 1].value) : 0;
          if (v1 > v2) diffDec += (v1 - v2);
          else diffInc += (v2 - v1);
        }
        monoC += Math.max(diffInc, diffDec);
      }
      for (let c = 0; c < cols; c++) {
        let diffInc = 0, diffDec = 0;
        for (let r = 0; r < rows - 1; r++) {
          const v1 = grid[l][r][c] ? Math.log2(grid[l][r][c].value) : 0;
          const v2 = grid[l][r + 1][c] ? Math.log2(grid[l][r + 1][c].value) : 0;
          if (v1 > v2) diffDec += (v1 - v2);
          else diffInc += (v2 - v1);
        }
        monoR += Math.max(diffInc, diffDec);
      }
    }

    return (emptyCount * 300) +
           (smoothness * 18) +
           (cornerBonus) +
           (scoreAdded * 3.5) +
           (monoR * 6) +
           (monoC * 6);
  }
}
