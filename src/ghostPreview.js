import * as THREE from 'three';
import { getGridPosition, getTileDimensions } from './board.js';

/**
 * GhostPreview — renders transparent dashed-edge "ghost" tiles
 * at predicted destination positions after a simulated move.
 *
 * Usage:
 *   const ghost = new GhostPreview(scene, gameLogic);
 *   ghost.showGhost('left');
 *   ghost.hideGhost();
 */
export class GhostPreview {
  constructor(scene, gameLogic) {
    this.scene = scene;
    this.gameLogic = gameLogic;
    this.ghostMeshes = [];
    this._shiftHeld = false;
    this._pendingDir = null;

    // Track shift key for Shift+direction ghost preview
    this._onKeyDown = (e) => {
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        this._shiftHeld = true;
      }
      if (this._shiftHeld && this._dirFromCode(e.code)) {
        const dir = this._dirFromCode(e.code);
        this._pendingDir = dir;
        this.showGhost(dir);
      }
    };
    this._onKeyUp = (e) => {
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        this._shiftHeld = false;
        this.hideGhost();
        this._pendingDir = null;
      }
    };
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
  }

  _dirFromCode(code) {
    const map = {
      ArrowUp: 'up', KeyW: 'up',
      ArrowDown: 'down', KeyS: 'down',
      ArrowLeft: 'left', KeyA: 'left',
      ArrowRight: 'right', KeyD: 'right',
      KeyE: 'layerUp', KeyQ: 'layerDown',
    };
    return map[code] || null;
  }

  showGhost(direction) {
    this.hideGhost();

    const sim = this.gameLogic.simulateMove(direction);
    if (!sim || !sim.moved) return;

    const { movements } = sim;
    if (!movements || movements.length === 0) return;

    // Build a set of merge destination positions for colour coding
    const mergeDestSet = new Set();
    if (sim.merges) {
      sim.merges.forEach(m => {
        // merges have .to or .from1 / .from2 depending on version
        if (m.to) mergeDestSet.add(`${m.to.l},${m.to.r},${m.to.c}`);
        else if (m.from1) mergeDestSet.add(`${m.from1.l},${m.from1.r},${m.from1.c}`);
      });
    }

    // Also mark isMerge destinations from movements
    movements.forEach(m => {
      if (m.isMerge) mergeDestSet.add(`${m.to.l},${m.to.r},${m.to.c}`);
    });

    const { size, height } = getTileDimensions();
    const boxGeo = new THREE.BoxGeometry(size * 0.98, height * 0.98, size * 0.98);
    const edgesGeo = new THREE.EdgesGeometry(boxGeo);
    boxGeo.dispose();
    this.activeEdgesGeo = edgesGeo;

    movements.forEach(m => {
      const key = `${m.to.l},${m.to.r},${m.to.c}`;
      const isMerge = mergeDestSet.has(key);

      const mat = new THREE.LineDashedMaterial({
        color: isMerge ? 0xffd700 : 0x00f0ff,
        transparent: true,
        opacity: isMerge ? 0.65 : 0.35,
        dashSize: 0.18,
        gapSize: 0.10,
        linewidth: 1,
      });

      const lines = new THREE.LineSegments(edgesGeo, mat);
      lines.computeLineDistances();

      const pos = getGridPosition(m.to.l, m.to.r, m.to.c);
      lines.position.set(pos.x, pos.y, pos.z);
      lines.userData.isGhost = true;

      this.scene.add(lines);
      this.ghostMeshes.push(lines);
    });
  }

  hideGhost() {
    this.ghostMeshes.forEach(m => {
      this.scene.remove(m);
      if (m.material) m.material.dispose();
    });
    this.ghostMeshes = [];
    if (this.activeEdgesGeo) {
      this.activeEdgesGeo.dispose();
      this.activeEdgesGeo = null;
    }
  }

  dispose() {
    this.hideGhost();
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup', this._onKeyUp);
  }
}
