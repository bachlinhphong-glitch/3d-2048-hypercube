import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import gsap from 'gsap';
import { getGridPosition, getTileDimensions } from './board.js';
import { textureManager } from './textureManager.js';
import { soundManager } from './sound.js';

let nextTileId = 1;

// ================= ZERO-ALLOCATION SHARED GEOMETRY POOL =================
const sharedGeos = {
  roundedBox: new Map(),
  octahedron: null,
  octahedronEdges: null,
  sphere: null,
  torus: null,
  bombRing: null,
  hexCylinder: null,
  hexEdges: null,
  cone: null,
  coneEdges: null,
  dodecahedron: null,
  dodecahedronEdges: null,
  plasmaTorus: null,
  plasmaOuterRing: null,
  // 5 New Majestic Shapes
  trianglePrism: null,
  triangleEdges: null,
  icosahedron: null,
  icosahedronEdges: null,
  capsule: null,
  capsuleRing: null,
  torusKnot: null,
  knotHalo: null,
  portalRingOuter: null,
  portalRingInner: null,
  portalBead: null
};

function getSharedRoundedBox(size, height) {
  const radius = Math.min(size, height) * 0.18;
  const key = `${size.toFixed(2)}_${height.toFixed(2)}_${radius.toFixed(2)}`;
  if (!sharedGeos.roundedBox.has(key)) {
    sharedGeos.roundedBox.set(key, new RoundedBoxGeometry(size, height, size, 1, radius));
  }
  return sharedGeos.roundedBox.get(key);
}

function getSharedOctahedron() {
  if (!sharedGeos.octahedron) {
    sharedGeos.octahedron = new THREE.OctahedronGeometry(1.0, 0);
    sharedGeos.octahedronEdges = new THREE.EdgesGeometry(sharedGeos.octahedron);
  }
  return { geo: sharedGeos.octahedron, edges: sharedGeos.octahedronEdges };
}

function getSharedSphere() {
  if (!sharedGeos.sphere) {
    sharedGeos.sphere = new THREE.SphereGeometry(1.0, 16, 16);
  }
  return sharedGeos.sphere;
}

function getSharedTorus() {
  if (!sharedGeos.torus) {
    sharedGeos.torus = new THREE.TorusGeometry(1.32, 0.05, 8, 20);
  }
  return sharedGeos.torus;
}

function getSharedBombRing() {
  if (!sharedGeos.bombRing) {
    sharedGeos.bombRing = new THREE.TorusGeometry(1.0, 0.07, 8, 18);
  }
  return sharedGeos.bombRing;
}

function getSharedHexCylinder() {
  if (!sharedGeos.hexCylinder) {
    sharedGeos.hexCylinder = new THREE.CylinderGeometry(1.0, 1.0, 1.0, 6);
    sharedGeos.hexEdges = new THREE.EdgesGeometry(sharedGeos.hexCylinder);
  }
  return { geo: sharedGeos.hexCylinder, edges: sharedGeos.hexEdges };
}

function getSharedCone() {
  if (!sharedGeos.cone) {
    sharedGeos.cone = new THREE.ConeGeometry(1.0, 1.3, 4);
    sharedGeos.coneEdges = new THREE.EdgesGeometry(sharedGeos.cone);
  }
  return { geo: sharedGeos.cone, edges: sharedGeos.coneEdges };
}

function getSharedDodecahedron() {
  if (!sharedGeos.dodecahedron) {
    sharedGeos.dodecahedron = new THREE.DodecahedronGeometry(1.0, 0);
    sharedGeos.dodecahedronEdges = new THREE.EdgesGeometry(sharedGeos.dodecahedron);
  }
  return { geo: sharedGeos.dodecahedron, edges: sharedGeos.dodecahedronEdges };
}

function getSharedPlasmaTorus() {
  if (!sharedGeos.plasmaTorus) {
    sharedGeos.plasmaTorus = new THREE.TorusGeometry(1.0, 0.32, 12, 32);
    sharedGeos.plasmaOuterRing = new THREE.TorusGeometry(1.28, 0.045, 8, 24);
  }
  return { geo: sharedGeos.plasmaTorus, outerGeo: sharedGeos.plasmaOuterRing };
}

function getSharedTrianglePrism() {
  if (!sharedGeos.trianglePrism) {
    sharedGeos.trianglePrism = new THREE.CylinderGeometry(1.0, 1.0, 1.0, 3);
    sharedGeos.triangleEdges = new THREE.EdgesGeometry(sharedGeos.trianglePrism);
  }
  return { geo: sharedGeos.trianglePrism, edges: sharedGeos.triangleEdges };
}

function getSharedIcosahedron() {
  if (!sharedGeos.icosahedron) {
    sharedGeos.icosahedron = new THREE.IcosahedronGeometry(1.0, 0);
    sharedGeos.icosahedronEdges = new THREE.EdgesGeometry(sharedGeos.icosahedron);
  }
  return { geo: sharedGeos.icosahedron, edges: sharedGeos.icosahedronEdges };
}

function getSharedCapsule() {
  if (!sharedGeos.capsule) {
    sharedGeos.capsule = new THREE.CapsuleGeometry(0.55, 0.5, 10, 18);
    sharedGeos.capsuleRing = new THREE.TorusGeometry(0.85, 0.04, 8, 20);
  }
  return { geo: sharedGeos.capsule, ringGeo: sharedGeos.capsuleRing };
}

function getSharedTorusKnot() {
  if (!sharedGeos.torusKnot) {
    sharedGeos.torusKnot = new THREE.TorusKnotGeometry(0.68, 0.17, 56, 12, 2, 3);
    sharedGeos.knotHalo = new THREE.TorusGeometry(1.25, 0.04, 8, 24);
  }
  return { geo: sharedGeos.torusKnot, haloGeo: sharedGeos.knotHalo };
}

function getSharedPortalNexus() {
  if (!sharedGeos.portalRingOuter) {
    sharedGeos.portalRingOuter = new THREE.TorusGeometry(1.08, 0.065, 8, 24);
    sharedGeos.portalRingInner = new THREE.TorusGeometry(0.76, 0.045, 8, 20);
    sharedGeos.portalBead = new THREE.SphereGeometry(0.12, 8, 8);
  }
  return {
    outerRing: sharedGeos.portalRingOuter,
    innerRing: sharedGeos.portalRingInner,
    bead: sharedGeos.portalBead
  };
}

export class Tile3D {
  constructor(layer, row, col, value, scene, shape = 'auto_evolution', isBomb = false, bombCountdown = 5) {
    this.id = nextTileId++;
    this.layer = layer;
    this.row = row;
    this.col = col;
    this.value = value;
    this.scene = scene;
    this.shapeType = shape || 'auto_evolution';
    this.isBomb = isBomb;
    this.bombCountdown = bombCountdown;

    this.group = new THREE.Group();
    this.group.userData = { isTile3D: true, tileInstance: this };
    this.innerMesh = null;
    this.decorGroup = new THREE.Group();
    this.labelSprite = null;
    this.bombRing = null;
    this.selectionOutline = null;
    this.hoverOutline = null;
    this.heldOutline = null;
    this.isSelected = false;
    this.isHovered = false;
    this.isHeld = false;

    this.group.add(this.decorGroup);

    this.buildGeometry();

    const pos = getGridPosition(this.layer, this.row, this.col);
    this.group.position.set(pos.x, pos.y, pos.z);

    this.group.scale.set(0, 0, 0);
    this.scene.add(this.group);
  }

  getEffectiveShape() {
    if (this.shapeType === 'auto_evolution') {
      if (this.value <= 2) return 'rounded_cube';         // 2: Bo Góc Tinh Giản
      if (this.value <= 4) return 'prism_triangle';       // 4: Lăng Kính Tam Giác
      if (this.value <= 8) return 'hex_prism';            // 8: Lăng Trụ Lục Giác
      if (this.value <= 16) return 'cyber_pyramid';       // 16: Kim Tự Tháp Cyber
      if (this.value <= 32) return 'crystal_octahedron';  // 32: Bát Diện Pha Lê
      if (this.value <= 64) return 'star_dodecahedron';   // 64: Thập Nhị Diện Tinh Tú
      if (this.value <= 128) return 'stellar_icosahedron';// 128: Nhị Thập Diện Cầu 20 Mặt
      if (this.value <= 256) return 'chrono_capsule';     // 256: Viên Nang Lượng Tử
      if (this.value <= 512) return 'plasma_torus';       // 512: Vòng Xoáy Plasma
      if (this.value <= 1024) return 'quantum_knot';      // 1024: Nút Thắt Lượng Tử
      if (this.value <= 2048) return 'core_sphere';       // 2048: Lõi Cầu Thiên Hà Hoàng Gia
      return 'portal_nexus';                              // 4096+: Cổng Thứ Nguyên Tối Thượng
    }
    return this.shapeType;
  }

  disposeClonedMaterials() {
    if (this.innerMesh) {
      if (Array.isArray(this.innerMesh.material)) {
        this.innerMesh.material.forEach(m => m.dispose && m.dispose());
      } else if (this.innerMesh.material && this.innerMesh.material.dispose) {
        this.innerMesh.material.dispose();
      }
    }
    if (this.labelSprite) {
      if (this.labelSprite.material && this.labelSprite.material.dispose) {
        this.labelSprite.material.dispose();
      }
    }
    if (this.decorGroup) {
      this.decorGroup.traverse((child) => {
        if (child === this.bombRing) return;
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(m => m.dispose && m.dispose());
          } else if (child.material.dispose) {
            child.material.dispose();
          }
        }
      });
    }
  }

  buildGeometry() {
    // Clean up existing mesh references and dispose cloned materials
    this.disposeClonedMaterials();
    if (this.innerMesh) {
      this.group.remove(this.innerMesh);
      this.innerMesh = null;
    }
    while (this.decorGroup.children.length > 0) {
      const child = this.decorGroup.children[0];
      this.decorGroup.remove(child);
    }
    this.ring1 = null;
    this.ring2 = null;
    this.ring3 = null;
    this.torusOuterRing = null;
    this.capsuleRing1 = null;
    this.capsuleRing2 = null;
    this.knotHalo = null;
    this.portalOuter = null;
    this.portalInner = null;
    this.portalBeadGroup = null;
    if (this.labelSprite) {
      this.group.remove(this.labelSprite);
      this.labelSprite = null;
    }

    const { size, height } = getTileDimensions();
    const effShape = this.getEffectiveShape();

    if (effShape === 'rounded_cube') {
      const geo = getSharedRoundedBox(size, height);
      const mats = textureManager.getTileMaterials(this.value, this.isBomb, this.bombCountdown);
      this.innerMesh = new THREE.Mesh(geo, mats.map(m => m.clone()));
      this.group.add(this.innerMesh);
    } else if (effShape === 'crystal_octahedron') {
      const radius = size * 0.58;
      const { geo, edges } = getSharedOctahedron();
      const mat = textureManager.getOctahedronMaterial(this.value, this.isBomb);
      this.innerMesh = new THREE.Mesh(geo, mat.clone());
      this.innerMesh.scale.set(radius, radius, radius);
      this.group.add(this.innerMesh);

      // Inner glowing core
      const coreMat = textureManager.getOctahedronCoreMaterial(this.value, this.isBomb);
      const coreMesh = new THREE.Mesh(geo, coreMat.clone());
      coreMesh.scale.set(radius * 0.48, radius * 0.48, radius * 0.48);
      this.decorGroup.add(coreMesh);

      const lineMat = textureManager.getOctahedronLineMaterial(this.isBomb);
      const lines = new THREE.LineSegments(edges, lineMat.clone());
      lines.scale.set(radius * 1.002, radius * 1.002, radius * 1.002);
      this.decorGroup.add(lines);

      this.addBillboardLabel(size);
    } else if (effShape === 'core_sphere') {
      const radius = size * 0.5;
      const geo = getSharedSphere();
      const mat = textureManager.getSphereMaterial(this.value, this.isBomb);
      this.innerMesh = new THREE.Mesh(geo, mat.clone());
      this.innerMesh.scale.set(radius * 0.82, radius * 0.82, radius * 0.82);
      this.group.add(this.innerMesh);

      // Dual Gimbal Orbit Rings
      const torusGeo = getSharedTorus();
      const torusMat = textureManager.getTorusMaterial(this.value, this.isBomb);

      const ring1 = new THREE.Mesh(torusGeo, torusMat.clone());
      ring1.scale.set(radius * 0.85, radius * 0.85, radius * 0.85);
      ring1.rotation.x = Math.PI / 4;
      ring1.rotation.y = Math.PI / 6;
      this.decorGroup.add(ring1);
      this.ring1 = ring1;

      const ring2 = new THREE.Mesh(torusGeo, torusMat.clone());
      ring2.scale.set(radius * 0.96, radius * 0.96, radius * 0.96);
      ring2.rotation.x = -Math.PI / 4;
      ring2.rotation.z = Math.PI / 3;
      this.decorGroup.add(ring2);
      this.ring2 = ring2;

      if (this.value >= 2048 && !this.isBomb) {
        const ring3 = new THREE.Mesh(torusGeo, torusMat.clone());
        ring3.scale.set(radius * 1.08, radius * 1.08, radius * 1.08);
        ring3.rotation.x = Math.PI / 2;
        this.decorGroup.add(ring3);
        this.ring3 = ring3;
      }

      this.addBillboardLabel(size);
    } else if (effShape === 'hex_prism') {
      const radius = size * 0.52;
      const h = height * 0.95;
      const { geo, edges } = getSharedHexCylinder();
      const mat = textureManager.getOctahedronMaterial(this.value, this.isBomb);
      this.innerMesh = new THREE.Mesh(geo, mat.clone());
      this.innerMesh.scale.set(radius, h, radius);
      this.group.add(this.innerMesh);

      // Inner glowing core
      const coreMat = textureManager.getOctahedronCoreMaterial(this.value, this.isBomb);
      const coreMesh = new THREE.Mesh(geo, coreMat.clone());
      coreMesh.scale.set(radius * 0.5, h * 0.5, radius * 0.5);
      this.decorGroup.add(coreMesh);

      // Wireframe neon edge lines
      const lineMat = textureManager.getOctahedronLineMaterial(this.isBomb);
      const lines = new THREE.LineSegments(edges, lineMat.clone());
      lines.scale.set(radius * 1.002, h * 1.002, radius * 1.002);
      this.decorGroup.add(lines);

      this.addBillboardLabel(size);
    } else if (effShape === 'cyber_pyramid') {
      const radius = size * 0.56;
      const h = height * 1.4;
      const { geo, edges } = getSharedCone();
      const mat = textureManager.getOctahedronMaterial(this.value, this.isBomb);
      this.innerMesh = new THREE.Mesh(geo, mat.clone());
      this.innerMesh.rotation.y = Math.PI / 4;
      this.innerMesh.scale.set(radius, h, radius);
      this.group.add(this.innerMesh);

      // Inner glowing core
      const coreMat = textureManager.getOctahedronCoreMaterial(this.value, this.isBomb);
      const coreMesh = new THREE.Mesh(geo, coreMat.clone());
      coreMesh.rotation.y = Math.PI / 4;
      coreMesh.scale.set(radius * 0.45, h * 0.45, radius * 0.45);
      this.decorGroup.add(coreMesh);

      // Wireframe neon edges
      const lineMat = textureManager.getOctahedronLineMaterial(this.isBomb);
      const lines = new THREE.LineSegments(edges, lineMat.clone());
      lines.rotation.y = Math.PI / 4;
      lines.scale.set(radius * 1.002, h * 1.002, radius * 1.002);
      this.decorGroup.add(lines);

      this.addBillboardLabel(size);
    } else if (effShape === 'star_dodecahedron') {
      const radius = size * 0.52;
      const { geo, edges } = getSharedDodecahedron();
      const mat = textureManager.getOctahedronMaterial(this.value, this.isBomb);
      this.innerMesh = new THREE.Mesh(geo, mat.clone());
      this.innerMesh.scale.set(radius, radius, radius);
      this.group.add(this.innerMesh);

      // Inner glowing core
      const coreMat = textureManager.getOctahedronCoreMaterial(this.value, this.isBomb);
      const coreMesh = new THREE.Mesh(geo, coreMat.clone());
      coreMesh.scale.set(radius * 0.45, radius * 0.45, radius * 0.45);
      this.decorGroup.add(coreMesh);

      // Faceted glittering wireframe lines
      const lineMat = textureManager.getOctahedronLineMaterial(this.isBomb);
      const lines = new THREE.LineSegments(edges, lineMat.clone());
      lines.scale.set(radius * 1.002, radius * 1.002, radius * 1.002);
      this.decorGroup.add(lines);

      this.addBillboardLabel(size);
    } else if (effShape === 'plasma_torus') {
      const radius = size * 0.48;
      const { geo, outerGeo } = getSharedPlasmaTorus();
      const mat = textureManager.getOctahedronMaterial(this.value, this.isBomb);
      this.innerMesh = new THREE.Mesh(geo, mat.clone());
      this.innerMesh.scale.set(radius, radius, radius);
      this.innerMesh.rotation.x = Math.PI / 2;
      this.group.add(this.innerMesh);

      // Spinning outer accent ring
      const torusMat = textureManager.getTorusMaterial(this.value, this.isBomb);
      const outerRing = new THREE.Mesh(outerGeo, torusMat.clone());
      outerRing.scale.set(radius * 0.95, radius * 0.95, radius * 0.95);
      outerRing.rotation.x = Math.PI / 3;
      outerRing.rotation.y = Math.PI / 6;
      this.decorGroup.add(outerRing);
      this.torusOuterRing = outerRing;

      this.addBillboardLabel(size);
    } else if (effShape === 'prism_triangle') {
      const radius = size * 0.54;
      const h = height * 1.0;
      const { geo, edges } = getSharedTrianglePrism();
      const mat = textureManager.getOctahedronMaterial(this.value, this.isBomb);
      this.innerMesh = new THREE.Mesh(geo, mat.clone());
      this.innerMesh.scale.set(radius, h, radius);
      this.group.add(this.innerMesh);

      // Inner glowing core
      const coreMat = textureManager.getOctahedronCoreMaterial(this.value, this.isBomb);
      const coreMesh = new THREE.Mesh(geo, coreMat.clone());
      coreMesh.scale.set(radius * 0.48, h * 0.48, radius * 0.48);
      this.decorGroup.add(coreMesh);

      // Neon edges
      const lineMat = textureManager.getOctahedronLineMaterial(this.value, this.isBomb);
      const lines = new THREE.LineSegments(edges, lineMat.clone());
      lines.scale.set(radius * 1.002, h * 1.002, radius * 1.002);
      this.decorGroup.add(lines);

      this.addBillboardLabel(size);
    } else if (effShape === 'stellar_icosahedron') {
      const radius = size * 0.54;
      const { geo, edges } = getSharedIcosahedron();
      const mat = textureManager.getOctahedronMaterial(this.value, this.isBomb);
      this.innerMesh = new THREE.Mesh(geo, mat.clone());
      this.innerMesh.scale.set(radius, radius, radius);
      this.group.add(this.innerMesh);

      // Inner glowing core
      const coreMat = textureManager.getOctahedronCoreMaterial(this.value, this.isBomb);
      const coreMesh = new THREE.Mesh(geo, coreMat.clone());
      coreMesh.scale.set(radius * 0.46, radius * 0.46, radius * 0.46);
      this.decorGroup.add(coreMesh);

      // 20-facet wireframe lines
      const lineMat = textureManager.getOctahedronLineMaterial(this.value, this.isBomb);
      const lines = new THREE.LineSegments(edges, lineMat.clone());
      lines.scale.set(radius * 1.002, radius * 1.002, radius * 1.002);
      this.decorGroup.add(lines);

      this.addBillboardLabel(size);
    } else if (effShape === 'chrono_capsule') {
      const radius = size * 0.52;
      const { geo, ringGeo } = getSharedCapsule();
      const mat = textureManager.getSphereMaterial(this.value, this.isBomb);
      this.innerMesh = new THREE.Mesh(geo, mat.clone());
      this.innerMesh.scale.set(radius, radius, radius);
      this.group.add(this.innerMesh);

      // Dual tilted stabilizer rings
      const torusMat = textureManager.getTorusMaterial(this.value, this.isBomb);
      const ring1 = new THREE.Mesh(ringGeo, torusMat.clone());
      ring1.scale.set(radius, radius, radius);
      ring1.rotation.x = Math.PI / 4;
      ring1.rotation.y = Math.PI / 6;
      this.decorGroup.add(ring1);
      this.capsuleRing1 = ring1;

      const ring2 = new THREE.Mesh(ringGeo, torusMat.clone());
      ring2.scale.set(radius * 0.95, radius * 0.95, radius * 0.95);
      ring2.rotation.x = -Math.PI / 4;
      ring2.rotation.y = -Math.PI / 6;
      this.decorGroup.add(ring2);
      this.capsuleRing2 = ring2;

      this.addBillboardLabel(size);
    } else if (effShape === 'quantum_knot') {
      const radius = size * 0.50;
      const { geo, haloGeo } = getSharedTorusKnot();
      const mat = textureManager.getSphereMaterial(this.value, this.isBomb);
      this.innerMesh = new THREE.Mesh(geo, mat.clone());
      this.innerMesh.scale.set(radius, radius, radius);
      this.group.add(this.innerMesh);

      // Outer accent gimbal halo
      const torusMat = textureManager.getTorusMaterial(this.value, this.isBomb);
      const halo = new THREE.Mesh(haloGeo, torusMat.clone());
      halo.scale.set(radius * 0.92, radius * 0.92, radius * 0.92);
      halo.rotation.x = Math.PI / 3;
      this.decorGroup.add(halo);
      this.knotHalo = halo;

      this.addBillboardLabel(size);
    } else if (effShape === 'portal_nexus') {
      const radius = size * 0.50;
      const { outerRing, innerRing, bead } = getSharedPortalNexus();
      const torusMat = textureManager.getTorusMaterial(this.value, this.isBomb);

      // Outer Portal Ring
      const rOuter = new THREE.Mesh(outerRing, torusMat.clone());
      rOuter.scale.set(radius, radius, radius);
      rOuter.rotation.x = Math.PI / 2;
      this.decorGroup.add(rOuter);
      this.portalOuter = rOuter;

      // Inner Counter-Rotating Ring
      const rInner = new THREE.Mesh(innerRing, torusMat.clone());
      rInner.scale.set(radius, radius, radius);
      rInner.rotation.x = Math.PI / 2;
      this.decorGroup.add(rInner);
      this.portalInner = rInner;

      // Central Energy Core Sphere
      const sphereGeo = getSharedSphere();
      const sphereMat = textureManager.getSphereMaterial(this.value, this.isBomb);
      this.innerMesh = new THREE.Mesh(sphereGeo, sphereMat.clone());
      this.innerMesh.scale.set(radius * 0.42, radius * 0.42, radius * 0.42);
      this.group.add(this.innerMesh);

      // 4 Orbiting Quantum Satellites (beads)
      this.portalBeadGroup = new THREE.Group();
      this.decorGroup.add(this.portalBeadGroup);
      const beadMat = textureManager.getOctahedronCoreMaterial(this.value, this.isBomb);
      for (let b = 0; b < 4; b++) {
        const beadMesh = new THREE.Mesh(bead, beadMat.clone());
        const angle = (b * Math.PI) / 2;
        const dist = radius * 0.92;
        beadMesh.position.set(Math.cos(angle) * dist, 0, Math.sin(angle) * dist);
        this.portalBeadGroup.add(beadMesh);
      }

      this.addBillboardLabel(size);
    }

    // Bomb indicator ring with shared geometry & cached material
    if (this.isBomb) {
      const bombGeo = getSharedBombRing();
      const bombMat = textureManager.getBombRingMaterial();
      this.bombRing = new THREE.Mesh(bombGeo, bombMat);
      this.bombRing.scale.set(size * 0.7, size * 0.7, size * 0.7);
      this.bombRing.rotation.x = Math.PI / 2;
      this.decorGroup.add(this.bombRing);
    }

    if (this.innerMesh) {
      this.innerMesh.userData = { isTile3D: true, tileInstance: this };
    }
  }

  addBillboardLabel(size) {
    const spriteMat = textureManager.getBillboardMaterial(this.value, this.isBomb, this.bombCountdown);
    this.labelSprite = new THREE.Sprite(spriteMat);
    this.labelSprite.scale.set(size * 0.9, size * 0.9, 1);
    this.labelSprite.position.set(0, 0, 0);
    this.labelSprite.renderOrder = 999;
    this.labelSprite.userData = { isTile3D: true, tileInstance: this };
    this.group.add(this.labelSprite);
  }

  setShape(newShape) {
    if (this.shapeType === newShape && newShape !== 'auto_evolution') return;
    this.shapeType = newShape;
    this.buildGeometry();
  }

  setBombState(isBomb, countdown) {
    this.isBomb = isBomb;
    this.bombCountdown = countdown;
    this.buildGeometry();
  }

  setSelected(isSelected) {
    this.isSelected = isSelected;

    // Clean up hover outline if currently present
    if (this.hoverOutline) {
      this.group.remove(this.hoverOutline);
      if (this.hoverOutline.geometry) this.hoverOutline.geometry.dispose();
      if (this.hoverOutline.material) this.hoverOutline.material.dispose();
      this.hoverOutline = null;
    }

    // Clean up previous selection outline
    if (this.selectionOutline) {
      this.group.remove(this.selectionOutline);
      if (this.selectionOutline.geometry) this.selectionOutline.geometry.dispose();
      if (this.selectionOutline.material) this.selectionOutline.material.dispose();
      this.selectionOutline = null;
    }

    const basePos = getGridPosition(this.layer, this.row, this.col);

    if (isSelected) {
      const { size, height } = getTileDimensions();
      const boxGeo = new THREE.BoxGeometry(size * 1.025, height * 1.025, size * 1.025);
      const edgesGeo = new THREE.EdgesGeometry(boxGeo);
      boxGeo.dispose();
      const lineMat = new THREE.LineBasicMaterial({
        color: 0x00f0ff,
        transparent: true,
        opacity: 0.95
      });
      this.selectionOutline = new THREE.LineSegments(edgesGeo, lineMat);
      this.group.add(this.selectionOutline);

      // Smoothly lift up by 0.3 units on Y-axis with subtle bounce
      gsap.to(this.group.position, {
        y: basePos.y + 0.3,
        duration: 0.22,
        ease: 'back.out(1.8)'
      });
    } else {
      // Smoothly lower back down to base position
      gsap.to(this.group.position, {
        y: basePos.y,
        duration: 0.2,
        ease: 'power2.inOut'
      });
    }
  }

  setHeld(isHeld) {
    if (this.isHeld === isHeld) return;
    this.isHeld = isHeld;

    if (this.heldOutline) {
      this.group.remove(this.heldOutline);
      if (this.heldOutline.geometry) this.heldOutline.geometry.dispose();
      if (this.heldOutline.material) this.heldOutline.material.dispose();
      this.heldOutline = null;
    }
    if (this.hoverOutline) {
      this.group.remove(this.hoverOutline);
      if (this.hoverOutline.geometry) this.hoverOutline.geometry.dispose();
      if (this.hoverOutline.material) this.hoverOutline.material.dispose();
      this.hoverOutline = null;
    }

    if (isHeld) {
      const { size, height } = getTileDimensions();
      const boxGeo = new THREE.BoxGeometry(size * 1.035, height * 1.035, size * 1.035);
      const edgesGeo = new THREE.EdgesGeometry(boxGeo);
      boxGeo.dispose();
      const isGrandTile = this.value >= 2048;
      const lineMat = new THREE.LineBasicMaterial({
        color: isGrandTile ? 0xffaa00 : 0x00f0ff,
        transparent: true,
        opacity: 0.95
      });
      this.heldOutline = new THREE.LineSegments(edgesGeo, lineMat);
      this.group.add(this.heldOutline);
    }
  }

  setHovered(isHovered) {
    if (this.isHovered === isHovered) return;
    this.isHovered = isHovered;
    if (this.isSelected || this.isHeld) return; // Do not override lift or outline if selected or held

    const basePos = getGridPosition(this.layer, this.row, this.col);

    if (isHovered) {
      if (!this.hoverOutline) {
        const { size, height } = getTileDimensions();
        const boxGeo = new THREE.BoxGeometry(size * 1.015, height * 1.015, size * 1.015);
        const edgesGeo = new THREE.EdgesGeometry(boxGeo);
        boxGeo.dispose();
        const lineMat = new THREE.LineBasicMaterial({
          color: 0x38bdf8,
          transparent: true,
          opacity: 0.8
        });
        this.hoverOutline = new THREE.LineSegments(edgesGeo, lineMat);
        this.group.add(this.hoverOutline);
      }

      gsap.to(this.group.position, {
        y: basePos.y + 0.1,
        duration: 0.16,
        ease: 'power2.out'
      });
    } else {
      if (this.hoverOutline) {
        this.group.remove(this.hoverOutline);
        if (this.hoverOutline.geometry) this.hoverOutline.geometry.dispose();
        if (this.hoverOutline.material) this.hoverOutline.material.dispose();
        this.hoverOutline = null;
      }

      gsap.to(this.group.position, {
        y: basePos.y,
        duration: 0.16,
        ease: 'power2.inOut'
      });
    }
  }

  setSliceDim(dimmed, targetOpacity = 0.12, targetScale = 0.82) {
    this.isDimmed = dimmed;
    const finalOpacity = dimmed ? targetOpacity : 1.0;
    const finalScale = dimmed ? targetScale : 1.0;

    gsap.to(this.group.scale, {
      x: finalScale,
      y: finalScale,
      z: finalScale,
      duration: 0.28,
      ease: 'power2.out'
    });

    this.group.traverse((child) => {
      if (child.isMesh) {
        if (Array.isArray(child.material)) {
          child.material.forEach((mat) => {
            mat.transparent = true;
            gsap.to(mat, { opacity: finalOpacity, duration: 0.25 });
          });
        } else if (child.material) {
          child.material.transparent = true;
          gsap.to(child.material, { opacity: finalOpacity, duration: 0.25 });
        }
      }
      if (child.isSprite && child.material) {
        child.material.transparent = true;
        gsap.to(child.material, { opacity: finalOpacity, duration: 0.25 });
      }
    });
  }

  updateExplodedPosition(duration = 0.32) {
    const targetPos = getGridPosition(this.layer, this.row, this.col);
    return gsap.to(this.group.position, {
      y: targetPos.y,
      duration: duration,
      ease: 'power2.out'
    });
  }

  spawnAnimation(delay = 0) {
    const basePos = getGridPosition(this.layer, this.row, this.col);
    const dropHeight = 2.4;

    const tl = gsap.timeline({ delay });

    // Set initial airborne falling state at beginning of timeline
    tl.set(this.group.position, {
      x: basePos.x,
      y: basePos.y + dropHeight,
      z: basePos.z
    });
    tl.set(this.group.scale, {
      x: 0.84,
      y: 1.26,
      z: 0.84
    });

    // Phase 1: High velocity drop towards the board
    tl.to(this.group.position, {
      y: basePos.y,
      duration: 0.22,
      ease: 'power3.in',
      onComplete: () => {
        if (soundManager && soundManager.playTileDrop) {
          soundManager.playTileDrop();
        }
      }
    });

    // Phase 2: Instant physical impact squash (flattening against the floor)
    tl.to(this.group.scale, {
      x: 1.24,
      y: 0.74,
      z: 1.24,
      duration: 0.08,
      ease: 'power2.out'
    });

    // Phase 3: Elastic upward rebound
    tl.to(this.group.position, {
      y: basePos.y + 0.16,
      duration: 0.09,
      ease: 'power1.out'
    }, '-=0.02');

    tl.to(this.group.scale, {
      x: 0.94,
      y: 1.08,
      z: 0.94,
      duration: 0.09,
      ease: 'power1.out'
    }, '<');

    // Phase 4: Final solid thud settle onto the board
    tl.to(this.group.position, {
      y: basePos.y,
      duration: 0.1,
      ease: 'bounce.out'
    });

    tl.to(this.group.scale, {
      x: 1.0,
      y: 1.0,
      z: 1.0,
      duration: 0.1,
      ease: 'power2.out'
    }, '<');

    return tl;
  }

  slideTo(targetLayer, targetRow, targetCol, duration = 0.16) {
    this.layer = targetLayer;
    this.row = targetRow;
    this.col = targetCol;
    const targetPos = getGridPosition(targetLayer, targetRow, targetCol);

    if (this.selectionOutline) {
      this.group.remove(this.selectionOutline);
      if (this.selectionOutline.geometry) this.selectionOutline.geometry.dispose();
      if (this.selectionOutline.material) this.selectionOutline.material.dispose();
      this.selectionOutline = null;
    }
    if (this.hoverOutline) {
      this.group.remove(this.hoverOutline);
      if (this.hoverOutline.geometry) this.hoverOutline.geometry.dispose();
      if (this.hoverOutline.material) this.hoverOutline.material.dispose();
      this.hoverOutline = null;
    }
    if (this.heldOutline) {
      this.group.remove(this.heldOutline);
      if (this.heldOutline.geometry) this.heldOutline.geometry.dispose();
      if (this.heldOutline.material) this.heldOutline.material.dispose();
      this.heldOutline = null;
    }
    this.isSelected = false;
    this.isHovered = false;
    this.isHeld = false;

    gsap.killTweensOf(this.group.position);
    gsap.killTweensOf(this.group.rotation);
    gsap.killTweensOf(this.group.scale);

    gsap.to(this.group.rotation, { x: 0, y: 0, z: 0, duration: duration, ease: 'power2.out' });
    gsap.to(this.group.scale, { x: 1, y: 1, z: 1, duration: duration, ease: 'power2.out' });

    return gsap.to(this.group.position, {
      x: targetPos.x,
      y: targetPos.y,
      z: targetPos.z,
      duration: duration,
      ease: 'power2.out'
    });
  }

  upgradeTo(newValue) {
    this.value = newValue;
    this.buildGeometry();

    const basePos = getGridPosition(this.layer, this.row, this.col);
    const tl = gsap.timeline();

    // Phase 1: Collision pop & upward fusion surge
    tl.to(this.group.position, {
      y: basePos.y + 0.32,
      duration: 0.08,
      ease: 'power2.out'
    });
    tl.to(this.group.scale, {
      x: 1.26,
      y: 1.26,
      z: 1.26,
      duration: 0.08,
      ease: 'power2.out'
    }, '<');

    // Phase 2: Heavy impact slam back down into the slot
    tl.to(this.group.position, {
      y: basePos.y,
      duration: 0.11,
      ease: 'power3.in',
      onComplete: () => {
        if (soundManager && soundManager.playTileDrop) {
          soundManager.playTileDrop();
        }
      }
    });

    // Phase 3: Physical squash on impact against the grid
    tl.to(this.group.scale, {
      x: 1.18,
      y: 0.82,
      z: 1.18,
      duration: 0.07,
      ease: 'power2.out'
    });

    // Phase 4: Crisp elastic settle
    tl.to(this.group.scale, {
      x: 1.0,
      y: 1.0,
      z: 1.0,
      duration: 0.12,
      ease: 'elastic.out(1.2, 0.5)'
    });

    return tl;
  }

  update(delta) {
    const effShape = this.getEffectiveShape();
    if (effShape === 'crystal_octahedron' && this.innerMesh) {
      this.innerMesh.rotation.y += delta * 0.7;
      this.decorGroup.rotation.y += delta * 0.7;
    } else if (effShape === 'core_sphere') {
      if (this.innerMesh) this.innerMesh.rotation.y += delta * 0.5;
      if (this.ring1) this.ring1.rotation.z += delta * 1.6;
      if (this.ring2) this.ring2.rotation.y -= delta * 1.3;
      if (this.ring3) this.ring3.rotation.z += delta * 2.2;
    }

    if (effShape === 'hex_prism' && this.innerMesh) {
      this.innerMesh.rotation.y += delta * 0.6;
      this.decorGroup.rotation.y += delta * 0.6;
    } else if (effShape === 'cyber_pyramid' && this.innerMesh) {
      this.innerMesh.rotation.y += delta * 0.8;
      this.decorGroup.rotation.y += delta * 0.8;
    } else if (effShape === 'star_dodecahedron' && this.innerMesh) {
      this.innerMesh.rotation.y += delta * 0.65;
      this.innerMesh.rotation.x += delta * 0.35;
      this.decorGroup.rotation.y += delta * 0.65;
      this.decorGroup.rotation.x += delta * 0.35;
    } else if (effShape === 'plasma_torus') {
      if (this.innerMesh) this.innerMesh.rotation.z += delta * 1.2;
      if (this.torusOuterRing) this.torusOuterRing.rotation.z -= delta * 1.6;
    } else if (effShape === 'prism_triangle' && this.innerMesh) {
      this.innerMesh.rotation.y += delta * 0.65;
      this.decorGroup.rotation.y += delta * 0.65;
    } else if (effShape === 'stellar_icosahedron' && this.innerMesh) {
      this.innerMesh.rotation.y += delta * 0.7;
      this.innerMesh.rotation.x += delta * 0.4;
      this.decorGroup.rotation.y += delta * 0.7;
      this.decorGroup.rotation.x += delta * 0.4;
    } else if (effShape === 'chrono_capsule') {
      if (this.innerMesh) this.innerMesh.rotation.y += delta * 0.5;
      if (this.capsuleRing1) this.capsuleRing1.rotation.z += delta * 1.8;
      if (this.capsuleRing2) this.capsuleRing2.rotation.z -= delta * 1.5;
    } else if (effShape === 'quantum_knot') {
      if (this.innerMesh) {
        this.innerMesh.rotation.y += delta * 1.1;
        this.innerMesh.rotation.x += delta * 0.6;
      }
      if (this.knotHalo) this.knotHalo.rotation.z -= delta * 1.4;
    } else if (effShape === 'portal_nexus') {
      if (this.portalOuter) this.portalOuter.rotation.z += delta * 1.2;
      if (this.portalInner) this.portalInner.rotation.z -= delta * 1.6;
      if (this.portalBeadGroup) this.portalBeadGroup.rotation.y += delta * 2.2;
      if (this.innerMesh) this.innerMesh.rotation.y += delta * 0.8;
    }

    if (this.bombRing) {
      this.bombRing.rotation.z += delta * 3.0;
    }
  }

  dispose(immediate = false) {
    gsap.killTweensOf(this.group);
    gsap.killTweensOf(this.group.position);
    gsap.killTweensOf(this.group.scale);
    gsap.killTweensOf(this.group.rotation);

    if (this.selectionOutline) {
      this.group.remove(this.selectionOutline);
      if (this.selectionOutline.geometry) this.selectionOutline.geometry.dispose();
      if (this.selectionOutline.material) this.selectionOutline.material.dispose();
      this.selectionOutline = null;
    }
    if (this.hoverOutline) {
      this.group.remove(this.hoverOutline);
      if (this.hoverOutline.geometry) this.hoverOutline.geometry.dispose();
      if (this.hoverOutline.material) this.hoverOutline.material.dispose();
      this.hoverOutline = null;
    }
    if (this.heldOutline) {
      this.group.remove(this.heldOutline);
      if (this.heldOutline.geometry) this.heldOutline.geometry.dispose();
      if (this.heldOutline.material) this.heldOutline.material.dispose();
      this.heldOutline = null;
    }
    this.isSelected = false;
    this.isHovered = false;
    this.isHeld = false;

    if (immediate) {
      this.disposeClonedMaterials();
      if (this.group.parent) {
        this.group.parent.remove(this.group);
      }
      return;
    }

    gsap.to(this.group.scale, {
      x: 0.001,
      y: 0.001,
      z: 0.001,
      duration: 0.12,
      ease: 'power2.in',
      onComplete: () => {
        this.disposeClonedMaterials();
        if (this.group.parent) {
          this.group.parent.remove(this.group);
        }
      }
    });
  }
}
