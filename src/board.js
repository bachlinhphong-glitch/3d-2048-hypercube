import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

let currentMode = '4x4'; // '4x4' or '3x3x3'

export function setBoardMode(mode) {
  currentMode = mode;
}

export function getBoardMode() {
  return currentMode;
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
    const x = (col - 1) * pitch;
    const y = (layer - 1) * pitch + 2.4;
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
  constructor(mode = '4x4') {
    this.group = new THREE.Group();
    this.mode = mode;
    setBoardMode(mode);
    this.createBoard();
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
    const baseWidth = 8.0;
    const baseDepth = 8.0;
    const baseHeight = 0.5;
    const baseGeo = new RoundedBoxGeometry(baseWidth, baseHeight, baseDepth, 1, 0.25);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x1a212d,
      roughness: 0.45,
      metalness: 0.3
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = -baseHeight / 2;
    this.group.add(baseMesh);

    // Beveled frame rims (Viền mỏng nhẹ tinh tế cao 0.25 đơn vị, gờ nổi nhẹ quanh đế)
    const rimThickness = 0.22;
    const rimHeight = 0.25;
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0x263143,
      roughness: 0.35,
      metalness: 0.45
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

    // 16 Recessed Cell Slots with InstancedMesh for extreme 60+ FPS performance
    const slotGeo = new RoundedBoxGeometry(1.65, 0.08, 1.65, 1, 0.12);
    const slotMat = new THREE.MeshStandardMaterial({
      color: 0x0f131a,
      roughness: 0.75,
      metalness: 0.2
    });

    const slotBorderGeo = new THREE.BoxGeometry(1.68, 0.02, 1.68);
    const slotBorderMat = new THREE.MeshStandardMaterial({
      color: 0x242d3d,
      roughness: 0.5,
      metalness: 0.35
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
      const y = (l - 1) * pitch + 2.4 - 0.8;
      plane.position.set(0, y, 0);
      this.group.add(plane);
    }
  }
}
