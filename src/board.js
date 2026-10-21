import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

let currentMode = '4x4'; // '4x4' or '3x3x3'
let layerSpacingMultiplier = 1.0; // 1.0 = normal, 1.85 = exploded view

export function setBoardMode(mode) {
  currentMode = mode;
}

export function getBoardMode() {
  return currentMode;
}

export function setLayerSpacingMultiplier(mult) {
  layerSpacingMultiplier = mult;
}

export function getLayerSpacingMultiplier() {
  return layerSpacingMultiplier;
}

export function getTileDimensions() {
  if (currentMode === '3x3x3') {
    return { size: 1.4, height: 1.4 };
  }
  return { size: 1.6, height: 0.8 };
}

export function getGridPosition(layer, row, col) {
  if (currentMode === '3x3x3') {
    const pitch = 2.05;
    const yPitch = 2.05 * layerSpacingMultiplier;
    const x = (col - 1) * pitch;
    const y = (layer - 1) * yPitch + 2.4;
    const z = (row - 1) * pitch;
    return { x, y, z };
  } else {
    const pitch = 1.8;
    const x = (col - 1.5) * pitch;
    const z = (row - 1.5) * pitch;
    const y = 0.8 / 2 + 0.05; // 0.45
    return { x, y, z };
  }
}

export class Board {
  constructor(mode = '4x4', theme = 'galaxy') {
    this.group = new THREE.Group();
    this.mode = mode;
    this.theme = theme;
    setBoardMode(mode);
    this.createBoard();
  }

  setTheme(themeName) {
    if (this.theme === themeName) return;
    this.theme = themeName;
    this.setMode(this.mode);
  }

  setMode(mode) {
    this.mode = mode;
    setBoardMode(mode);
    while (this.group.children.length > 0) {
      const child = this.group.children[0];
      this.group.remove(child);
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
        else child.material.dispose();
      }
    }
    this.createBoard();
  }

  createBoard() {
    if (this.mode === '3x3x3') {
      this.createHypercubeBoard();
    } else {
      this.createClassic4x4Board();
    }
  }

  createClassic4x4Board() {
    const isLight = this.theme === 'gentle_light' || this.theme === 'zen_clay';
    const isDark = this.theme === 'gentle_dark' || this.theme === 'modern_slate';

    const baseWidth = 8.0;
    const baseDepth = 8.0;
    const baseHeight = 0.5;
    const baseGeo = new RoundedBoxGeometry(baseWidth, baseHeight, baseDepth, 1, 0.25);

    let baseColor = 0x1a212d;
    let baseRoughness = 0.45;
    let baseMetalness = 0.3;
    let rimColor = 0x263143;
    let rimRoughness = 0.35;
    let rimMetalness = 0.45;
    let slotColor = 0x0f131a;
    let slotRoughness = 0.75;
    let slotBorderColor = 0x242d3d;

    if (isLight) {
      baseColor = 0xbbada0;      // Iconic 2048 warm taupe clay tray
      baseRoughness = 0.65;
      baseMetalness = 0.02;
      rimColor = 0xa8998b;       // Soft warm taupe beveled border
      rimRoughness = 0.6;
      rimMetalness = 0.02;
      slotColor = 0xcdc1b4;      // Warm sand recessed slot (perfect contrast with #eee4da & #ede0c8)
      slotRoughness = 0.8;
      slotBorderColor = 0xbaa99c; // Subtle separation groove
    } else if (isDark) {
      baseColor = 0x272421;      // Warm dark espresso / roasted walnut tray
      baseRoughness = 0.6;
      baseMetalness = 0.06;
      rimColor = 0x332f2b;       // Warm coffee beveled frame
      rimRoughness = 0.5;
      rimMetalness = 0.08;
      slotColor = 0x1b1917;      // Deep warm peat / espresso recessed slot
      slotRoughness = 0.75;
      slotBorderColor = 0x24201d; // Subtle warm seam line
    }

    const baseMat = new THREE.MeshStandardMaterial({
      color: baseColor,
      roughness: baseRoughness,
      metalness: baseMetalness
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = -baseHeight / 2;
    this.group.add(baseMesh);

    // Beveled frame rims
    const rimThickness = 0.22;
    const rimHeight = 0.25;
    const rimMat = new THREE.MeshStandardMaterial({
      color: rimColor,
      roughness: rimRoughness,
      metalness: rimMetalness
    });

    const rimLength = baseWidth - 0.1;
    const nsGeo = new RoundedBoxGeometry(rimLength, rimHeight, rimThickness, 1, 0.06);
    const northRim = new THREE.Mesh(nsGeo, rimMat);
    northRim.position.set(0, rimHeight / 2, -(baseDepth / 2 - rimThickness / 2));
    this.group.add(northRim);

    const southRim = new THREE.Mesh(nsGeo, rimMat);
    southRim.position.set(0, rimHeight / 2, baseDepth / 2 - rimThickness / 2);
    this.group.add(southRim);

    const ewGeo = new RoundedBoxGeometry(rimThickness, rimHeight, rimLength, 1, 0.06);
    const eastRim = new THREE.Mesh(ewGeo, rimMat);
    eastRim.position.set(baseWidth / 2 - rimThickness / 2, rimHeight / 2, 0);
    this.group.add(eastRim);

    const westRim = new THREE.Mesh(ewGeo, rimMat);
    westRim.position.set(-(baseWidth / 2 - rimThickness / 2), rimHeight / 2, 0);
    this.group.add(westRim);

    // 16 Recessed Cell Slots with InstancedMesh
    const slotGeo = new RoundedBoxGeometry(1.65, 0.08, 1.65, 1, 0.12);
    const slotMat = new THREE.MeshStandardMaterial({
      color: slotColor,
      roughness: slotRoughness,
      metalness: isLight ? 0.0 : (isDark ? 0.04 : 0.2)
    });

    const slotBorderGeo = new THREE.BoxGeometry(1.68, 0.02, 1.68);
    const slotBorderMat = new THREE.MeshStandardMaterial({
      color: slotBorderColor,
      roughness: 0.5,
      metalness: isLight ? 0.02 : (isDark ? 0.06 : 0.35)
    });

    const totalCells = 16;
    const borderInstanced = new THREE.InstancedMesh(slotBorderGeo, slotBorderMat, totalCells);
    const slotInstanced = new THREE.InstancedMesh(slotGeo, slotMat, totalCells);

    const dummy = new THREE.Object3D();
    let idx = 0;
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const { x, z } = getGridPosition(0, r, c);

        dummy.position.set(x, 0.01, z);
        dummy.updateMatrix();
        borderInstanced.setMatrixAt(idx, dummy.matrix);

        dummy.position.set(x, 0.03, z);
        dummy.updateMatrix();
        slotInstanced.setMatrixAt(idx, dummy.matrix);

        idx++;
      }
    }
    borderInstanced.instanceMatrix.needsUpdate = true;
    slotInstanced.instanceMatrix.needsUpdate = true;
    this.group.add(borderInstanced);
    this.group.add(slotInstanced);
  }

  createHypercubeBoard() {
    const pitch = 2.05;
    const cubeSpan = pitch * 3; // ~6.15

    // 1. High-tech Pedestal Base (Dày dặn, bo góc rõ nét)
    const baseGeo = new RoundedBoxGeometry(8.6, 1.0, 8.6, 1, 0.45);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x161c28,
      roughness: 0.4,
      metalness: 0.4
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = -0.5;
    this.group.add(baseMesh);

    // 2. Outer Hypercube Wireframe Casing
    const outerBoxGeo = new THREE.BoxGeometry(cubeSpan, cubeSpan, cubeSpan);
    const outerEdges = new THREE.EdgesGeometry(outerBoxGeo);
    const outerLineMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.45,
      linewidth: 2
    });
    const outerLines = new THREE.LineSegments(outerEdges, outerLineMat);
    outerLines.position.set(0, 2.4, 0);
    this.group.add(outerLines);

    // 3. Merged 27 Subtle Transparent Cell Cages in 1 single draw call
    const h = 0.8;
    const vertices = new Float32Array(27 * 72);
    let vOffset = 0;

    for (let l = 0; l < 3; l++) {
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          const { x: cx, y: cy, z: cz } = getGridPosition(l, r, c);
          const x0 = cx - h, x1 = cx + h;
          const y0 = cy - h, y1 = cy + h;
          const z0 = cz - h, z1 = cz + h;

          const segs = [
            // 4 parallel to X
            x0, y0, z0,  x1, y0, z0,
            x0, y1, z0,  x1, y1, z0,
            x0, y0, z1,  x1, y0, z1,
            x0, y1, z1,  x1, y1, z1,
            // 4 parallel to Y
            x0, y0, z0,  x0, y1, z0,
            x1, y0, z0,  x1, y1, z0,
            x0, y0, z1,  x0, y1, z1,
            x1, y0, z1,  x1, y1, z1,
            // 4 parallel to Z
            x0, y0, z0,  x0, y0, z1,
            x1, y0, z0,  x1, y0, z1,
            x0, y1, z0,  x0, y1, z1,
            x1, y1, z0,  x1, y1, z1
          ];

          vertices.set(segs, vOffset);
          vOffset += 72;
        }
      }
    }

    const mergedCagesGeo = new THREE.BufferGeometry();
    mergedCagesGeo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    const cellLineMat = new THREE.LineBasicMaterial({
      color: 0x4f709c,
      transparent: true,
      opacity: 0.22
    });
    const mergedCages = new THREE.LineSegments(mergedCagesGeo, cellLineMat);
    this.group.add(mergedCages);

    // 4. Layer Separation Guides (Faint glowing planes)
    this.layerPlanes = [];
    for (let l = 0; l < 3; l++) {
      const planeGeo = new THREE.PlaneGeometry(cubeSpan - 0.2, cubeSpan - 0.2);
      const planeMat = new THREE.MeshBasicMaterial({
        color: l === 1 ? 0x00f0ff : 0x7928ca,
        transparent: true,
        opacity: 0.04,
        side: THREE.DoubleSide
      });
      const plane = new THREE.Mesh(planeGeo, planeMat);
      plane.rotation.x = -Math.PI / 2;
      const y = (l - 1) * pitch * layerSpacingMultiplier + 2.4 - 0.8;
      plane.position.set(0, y, 0);
      this.layerPlanes.push(plane);
      this.group.add(plane);
    }
  }

  updateExplodedPlanes(mult) {
    if (!this.layerPlanes || this.layerPlanes.length === 0) return;
    const pitch = 2.05;
    for (let l = 0; l < this.layerPlanes.length; l++) {
      const y = (l - 1) * pitch * mult + 2.4 - 0.8;
      this.layerPlanes[l].position.y = y;
    }
  }

  dispose() {
    while (this.group.children.length > 0) {
      const child = this.group.children[0];
      this.group.remove(child);
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) child.material.forEach(m => m.dispose && m.dispose());
        else if (child.material.dispose) child.material.dispose();
      }
    }
    this.layerPlanes = [];
  }
}
