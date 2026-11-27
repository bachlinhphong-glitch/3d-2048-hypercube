import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import gsap from 'gsap';
import { getGridPosition, getTileDimensions, getBoardMode } from './board.js';
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
  sculptRing: null,
  sculptKnot: null,
  sculptSphere: null,
  sculptPrism: null,
  sculptHex: null,
  portalRingOuter: null,
  portalRingInner: null,
  portalBead: null,
  // Celestial Planetary Geometries
  asteroid: null,
  saturnRing: null,
  pulsarRing: null,
  blackHoleDisk: null,
  einsteinRing: null,
  // Prestige Masterpiece Geometries (1024 Platinum & 2048 Imperial Gold)
  prestigeRing1024: null,
  prestigeRing2048_1: null,
  prestigeRing2048_2: null,
  prestigeBeadDiamond: null,
  prestigeBeadRuby: null,
  contactShadowPlane: null
};

function getSharedContactShadowPlane(size) {
  if (!sharedGeos.contactShadowPlane) {
    sharedGeos.contactShadowPlane = new THREE.PlaneGeometry(size * 1.08, size * 1.08);
  }
  return sharedGeos.contactShadowPlane;
}

function getSharedPrestigeRing1024(size) {
  if (!sharedGeos.prestigeRing1024) {
    sharedGeos.prestigeRing1024 = new THREE.TorusGeometry(size * 0.58, size * 0.024, 12, 36);
  }
  return sharedGeos.prestigeRing1024;
}

function getSharedPrestigeRing2048_1(size) {
  if (!sharedGeos.prestigeRing2048_1) {
    sharedGeos.prestigeRing2048_1 = new THREE.TorusGeometry(size * 0.59, size * 0.026, 12, 40);
  }
  return sharedGeos.prestigeRing2048_1;
}

function getSharedPrestigeRing2048_2(size) {
  if (!sharedGeos.prestigeRing2048_2) {
    sharedGeos.prestigeRing2048_2 = new THREE.TorusGeometry(size * 0.63, size * 0.020, 12, 40);
  }
  return sharedGeos.prestigeRing2048_2;
}

function getSharedPrestigeDiamondBead(size) {
  if (!sharedGeos.prestigeBeadDiamond) {
    sharedGeos.prestigeBeadDiamond = new THREE.OctahedronGeometry(size * 0.044, 0);
  }
  return sharedGeos.prestigeBeadDiamond;
}

function getSharedPrestigeRubyBead(size) {
  if (!sharedGeos.prestigeBeadRuby) {
    sharedGeos.prestigeBeadRuby = new THREE.SphereGeometry(size * 0.040, 12, 12);
  }
  return sharedGeos.prestigeBeadRuby;
}

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
    sharedGeos.bombRing = new THREE.TorusGeometry(1.0, 0.055, 14, 64);
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
    const body = new THREE.CapsuleGeometry(0.41, 0.60, 24, 56);
    body.rotateZ(Math.PI / 2);
    const core = new THREE.CapsuleGeometry(0.22, 0.42, 16, 40);
    core.rotateZ(Math.PI / 2);
    const seamBelt = new THREE.TorusGeometry(0.425, 0.024, 16, 64);
    seamBelt.rotateY(Math.PI / 2);
    sharedGeos.capsule = { body, core, seamBelt };
  }
  return sharedGeos.capsule;
}

function getSharedTorusKnot() {
  if (!sharedGeos.torusKnot) {
    sharedGeos.torusKnot = new THREE.TorusKnotGeometry(0.68, 0.17, 56, 12, 2, 3);
    sharedGeos.knotHalo = new THREE.TorusGeometry(1.25, 0.04, 8, 24);
  }
  return { geo: sharedGeos.torusKnot, haloGeo: sharedGeos.knotHalo };
}

function getSharedSculptedRing() {
  if (!sharedGeos.sculptRing) {
    sharedGeos.sculptRing = {
      body: new THREE.TorusGeometry(0.66, 0.175, 40, 88),
      innerRim: new THREE.TorusGeometry(0.495, 0.022, 16, 80)
    };
  }
  return sharedGeos.sculptRing;
}

function getSharedSculptedKnot() {
  if (!sharedGeos.sculptKnot) {
    sharedGeos.sculptKnot = {
      body: new THREE.TorusKnotGeometry(0.54, 0.155, 144, 28, 2, 3),
      coreGem: new THREE.IcosahedronGeometry(0.24, 0),
      haloOuter: new THREE.TorusGeometry(0.92, 0.032, 16, 72),
      haloInner: new THREE.TorusGeometry(0.84, 0.022, 14, 64),
      node: new THREE.OctahedronGeometry(0.08, 0)
    };
  }
  return sharedGeos.sculptKnot;
}

function getSharedSculptedSphere() {
  if (!sharedGeos.sculptSphere) {
    sharedGeos.sculptSphere = {
      orb: new THREE.SphereGeometry(0.62, 48, 48),
      belt: new THREE.TorusGeometry(0.635, 0.036, 16, 64),
      stud: new THREE.SphereGeometry(0.055, 12, 12),
      ring1: new THREE.TorusGeometry(0.79, 0.030, 16, 64),
      ring2: new THREE.TorusGeometry(0.93, 0.032, 16, 72),
      ring3: new THREE.TorusGeometry(1.01, 0.024, 16, 72),
      diamondNode: new THREE.OctahedronGeometry(0.072, 0),
      pearlNode: new THREE.SphereGeometry(0.064, 14, 14)
    };
  }
  return sharedGeos.sculptSphere;
}

function createGemCutLathe(sides, outerR, bevelR, halfH, bevelH) {
  const profile = [
    new THREE.Vector2(0, -halfH),
    new THREE.Vector2(bevelR, -halfH),
    new THREE.Vector2(outerR, -halfH + bevelH),
    new THREE.Vector2(outerR, halfH - bevelH),
    new THREE.Vector2(bevelR, halfH),
    new THREE.Vector2(0, halfH)
  ];
  const geo = new THREE.LatheGeometry(profile, sides).toNonIndexed();
  geo.computeVertexNormals();
  return geo;
}

function createBipyramidLathe(sides, radius, halfH) {
  const profile = [
    new THREE.Vector2(0, -halfH),
    new THREE.Vector2(radius, 0),
    new THREE.Vector2(0, halfH)
  ];
  const geo = new THREE.LatheGeometry(profile, sides).toNonIndexed();
  geo.computeVertexNormals();
  return geo;
}

function getSharedSculptedPrism() {
  if (!sharedGeos.sculptPrism) {
    const body = createGemCutLathe(3, 1.0, 0.86, 0.50, 0.14);
    const innerCore = createBipyramidLathe(3, 0.47, 0.44);
    const midFrame = createGemCutLathe(3, 0.70, 0.58, 0.34, 0.09);
    sharedGeos.sculptPrism = {
      body,
      bodyEdges: new THREE.EdgesGeometry(body, 14),
      innerCore,
      innerCoreEdges: new THREE.EdgesGeometry(innerCore, 14),
      innerFrameEdges: new THREE.EdgesGeometry(midFrame, 14)
    };
  }
  return sharedGeos.sculptPrism;
}

function getSharedSculptedHex() {
  if (!sharedGeos.sculptHex) {
    const body = createGemCutLathe(6, 1.0, 0.78, 0.50, 0.18);
    const innerCore = createBipyramidLathe(6, 0.56, 0.44);
    const midFrame = createGemCutLathe(6, 0.74, 0.58, 0.36, 0.12);
    sharedGeos.sculptHex = {
      body,
      bodyEdges: new THREE.EdgesGeometry(body, 14),
      innerCore,
      innerCoreEdges: new THREE.EdgesGeometry(innerCore, 14),
      innerFrameEdges: new THREE.EdgesGeometry(midFrame, 14)
    };
  }
  return sharedGeos.sculptHex;
}

function getSharedPortalNexus() {
  if (!sharedGeos.portalRingOuter) {
    sharedGeos.portalRingOuter = new THREE.TorusGeometry(0.94, 0.044, 16, 64);
    sharedGeos.portalRingInner = new THREE.TorusGeometry(0.70, 0.032, 14, 64);
    sharedGeos.portalBead = new THREE.OctahedronGeometry(0.088, 0);
  }
  return {
    outerRing: sharedGeos.portalRingOuter,
    innerRing: sharedGeos.portalRingInner,
    bead: sharedGeos.portalBead
  };
}

function getSharedAsteroid() {
  if (!sharedGeos.asteroid) {
    sharedGeos.asteroid = new THREE.DodecahedronGeometry(1.0, 1);
  }
  return sharedGeos.asteroid;
}

function getSharedSaturnRing() {
  if (!sharedGeos.saturnRing) {
    sharedGeos.saturnRing = new THREE.PlaneGeometry(2.0, 2.0);
  }
  return sharedGeos.saturnRing;
}

function getSharedPulsarRing() {
  if (!sharedGeos.pulsarRing) {
    sharedGeos.pulsarRing = new THREE.TorusGeometry(0.96, 0.026, 14, 64);
  }
  return sharedGeos.pulsarRing;
}

function getSharedBlackHoleDisk() {
  if (!sharedGeos.blackHoleDisk) {
    sharedGeos.blackHoleDisk = new THREE.PlaneGeometry(2.0, 2.0);
    sharedGeos.einsteinRing = new THREE.TorusGeometry(0.76, 0.024, 16, 64);
  }
  return { disk: sharedGeos.blackHoleDisk, einstein: sharedGeos.einsteinRing };
}

export let tileGraphicsQuality = 'medium';
export function setTileGraphicsQuality(quality) {
  tileGraphicsQuality = quality;
}

export class Tile3D {
  constructor(layer, row, col, value, scene, shape = 'auto_evolution', isBomb = false, bombCountdown = 5, isWildcard = false) {
    this.id = nextTileId++;
    this.layer = layer;
    this.row = row;
    this.col = col;
    this.value = value;
    this.scene = scene;
    this.shapeType = shape || 'auto_evolution';
    this.isBomb = isBomb;
    this.bombCountdown = bombCountdown;
    this.isWildcard = !!isWildcard || (value === 0);

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
    if (this.shapeType === 'cosmic_evolution') {
      if (this.value <= 4) return 'asteroid';         // 2 & 4: Tiểu hành tinh đá thô ráp (Low-poly Asteroid)
      if (this.value <= 16) return 'magma_planet';    // 8 & 16: Hành tinh Dung Nham (Molten Magma Fissures)
      if (this.value <= 64) return 'gas_giant';       // 32 & 64: Hành tinh Khí Khổng Lồ (Turbulent Gas Giant)
      if (this.value <= 256) return 'saturn_rings';   // 128 & 256: Hành tinh Vành Đai Sao Thổ (Saturn Dust Rings)
      if (this.value <= 1024) return 'pulsar_star';   // 512 & 1024: Sao Xung Plasma Rực Rỡ (Solar Corona Pulsar)
      if (this.value <= 2048) return 'black_hole';    // 2048: Hố Đen Vũ Trụ (Gargantua Singularity & Relativistic Disk)
      return 'portal_nexus';                          // 4096+: Cổng Thứ Nguyên Vũ Trụ
    }
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
      this.innerMesh.traverse((child) => {
        if (child === this.bombRing || child === this.contactShadowMesh) return;
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(m => m && m.dispose && m.dispose());
          } else if (child.material.dispose) {
            child.material.dispose();
          }
        }
      });
    }
    if (this.labelSprite) {
      if (this.labelSprite.material && this.labelSprite.material.dispose) {
        this.labelSprite.material.dispose();
      }
    }
    if (this.decorGroup) {
      this.decorGroup.traverse((child) => {
        if (child === this.bombRing || child === this.contactShadowMesh) return;
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
    this.contactShadowMesh = null;
    this.ring1 = null;
    this.ring2 = null;
    this.ring3 = null;
    this.torusOuterRing = null;
    this.torusInnerGroup = null;
    this._ringPhase = 0;
    this.capsuleRing1 = null;
    this.capsuleRing2 = null;
    this.knotHalo = null;
    this.knotInnerHalo = null;
    this.hexHalo = null;
    this.hexCore = null;
    this.prismHalo = null;
    this.prismCore = null;
    this.portalOuter = null;
    this.portalInner = null;
    this.portalBeadGroup = null;
    this.saturnRing = null;
    this.pulsarRing1 = null;
    this.pulsarRing2 = null;
    this.blackHoleDisk = null;
    this.einsteinRing = null;
    if (this.labelSprite) {
      this.group.remove(this.labelSprite);
      this.labelSprite = null;
    }

    const { size, height } = getTileDimensions();
    const effShape = this.getEffectiveShape();

    if (effShape === 'rounded_cube') {
      const geo = getSharedRoundedBox(size, height);
      const mats = textureManager.getTileMaterials(this.value, this.isBomb, this.bombCountdown, this.isWildcard);
      this.innerMesh = new THREE.Mesh(geo, mats.map(m => m.clone()));
      this.group.add(this.innerMesh);

      // 3D Prestige Aura for 1024 (Platinum Diamond) & 2048 (Imperial 24K Gold)
      if (this.value === 1024 && !this.isBomb) {
        this.buildPrestige1024Aura(size);
      } else if (this.value >= 2048 && !this.isBomb) {
        this.buildPrestige2048Aura(size);
      }
    } else if (effShape === 'crystal_octahedron') {
      const radius = size * 0.48;
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

      const lineMat = textureManager.getOctahedronLineMaterial(this.value, this.isBomb);
      const lines = new THREE.LineSegments(edges, lineMat.clone());
      lines.scale.set(radius * 1.002, radius * 1.002, radius * 1.002);
      this.decorGroup.add(lines);

      this.addBillboardLabel(size);
    } else if (effShape === 'core_sphere') {
      const radius = size * 0.49;
      const g = getSharedSculptedSphere();
      const bodyMat = textureManager.getSculptedBodyMaterial(this.value, this.isBomb, this.isWildcard);
      const accentMat = textureManager.getSculptedAccentMaterial(this.value, this.isBomb, this.isWildcard);
      const nodeMat = textureManager.getSculptedNodeMaterial(this.value, this.isBomb, this.isWildcard);

      this.innerMesh = new THREE.Mesh(g.orb, bodyMat.clone());
      this.innerMesh.scale.set(radius, radius, radius);
      this.group.add(this.innerMesh);

      // Hugging Equatorial Metallic Collar + 4 Bezel Rivets
      const belt = new THREE.Mesh(g.belt, accentMat.clone());
      belt.rotation.x = Math.PI / 2;
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2;
        const stud = new THREE.Mesh(g.stud, nodeMat.clone());
        stud.position.set(Math.cos(a) * 0.65, Math.sin(a) * 0.65, 0);
        belt.add(stud);
      }
      this.innerMesh.add(belt);

      // Precision Astrolabe Gimbal Ring 1 (carries 2 opposite diamond nodes)
      const ring1 = new THREE.Mesh(g.ring1, accentMat.clone());
      ring1.scale.set(radius, radius, radius);
      ring1.rotation.set(Math.PI / 3.4, Math.PI / 6, 0);
      for (const s of [-1, 1]) {
        const gem = new THREE.Mesh(g.diamondNode, nodeMat.clone());
        gem.position.set(s * 0.79, 0, 0);
        ring1.add(gem);
      }
      this.decorGroup.add(ring1);
      this.ring1 = ring1;

      // Celestial Astrolabe Gimbal Ring 2 (carries 4 glowing orbital pearls)
      const ring2 = new THREE.Mesh(g.ring2, accentMat.clone());
      ring2.scale.set(radius, radius, radius);
      ring2.rotation.set(-Math.PI / 3.2, 0, Math.PI / 4);
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2;
        const pearl = new THREE.Mesh(g.pearlNode, nodeMat.clone());
        pearl.position.set(Math.cos(a) * 0.93, Math.sin(a) * 0.93, 0);
        ring2.add(pearl);
      }
      this.decorGroup.add(ring2);
      this.ring2 = ring2;

      // Sovereign 2048+ Meridian Gyro Ring 3
      if ((this.value >= 2048 || this.isWildcard) && !this.isBomb) {
        const ring3 = new THREE.Mesh(g.ring3, nodeMat.clone());
        ring3.scale.set(radius, radius, radius);
        ring3.rotation.x = Math.PI / 2;
        this.decorGroup.add(ring3);
        this.ring3 = ring3;
      }

      this.addBillboardLabel(size, { sculpted: true, scaleFactor: 0.64 });
    } else if (effShape === 'hex_prism') {
      const radius = size * 0.47;
      const h = height * 0.90;
      const g = getSharedSculptedHex();
      const crystalMat = textureManager.getSculptedCrystalMaterial(this.value, this.isBomb, this.isWildcard);
      const coreMat = textureManager.getSculptedCrystalCoreMaterial(this.value, this.isBomb, this.isWildcard);
      const lineMat = textureManager.getSculptedCrystalLineMaterial(this.value, this.isBomb, this.isWildcard);
      const innerLineMat = textureManager.getSculptedCrystalLineMaterial(this.value, this.isBomb, this.isWildcard, 0.55);

      // Pure Seamless Emerald-Cut Hexagonal Solitaire Crystal (zero rivets/belts/stray outer rings)
      this.innerMesh = new THREE.Mesh(g.body, crystalMat.clone());
      this.innerMesh.scale.set(radius, h, radius);
      this.innerMesh.renderOrder = 3;
      this.group.add(this.innerMesh);

      const bodyLines = new THREE.LineSegments(g.bodyEdges, lineMat.clone());
      bodyLines.scale.setScalar(1.003);
      this.innerMesh.add(bodyLines);

      // Luminous Faceted Bipyramid Diamond Core Suspended Inside the Crystal
      const hexCore = new THREE.Mesh(g.innerCore, coreMat.clone());
      hexCore.scale.set(radius, h, radius);
      hexCore.rotation.y = Math.PI / 6;
      hexCore.renderOrder = 1;
      const coreLines = new THREE.LineSegments(g.innerCoreEdges, lineMat.clone());
      coreLines.scale.setScalar(1.015);
      hexCore.add(coreLines);
      this.decorGroup.add(hexCore);
      this.hexCore = hexCore;

      // Internal Nested Spectral Hex Refraction Cage Inside the Outer Glass
      const hexInnerFrame = new THREE.LineSegments(g.innerFrameEdges, innerLineMat.clone());
      hexInnerFrame.scale.set(radius, h, radius);
      hexInnerFrame.rotation.y = Math.PI / 6;
      hexInnerFrame.renderOrder = 2;
      this.decorGroup.add(hexInnerFrame);
      this.hexHalo = hexInnerFrame;

      this.addBillboardLabel(size, { sculpted: true, scaleFactor: 0.62 });
    } else if (effShape === 'cyber_pyramid') {
      const radius = size * 0.47;
      const h = height * 1.15;
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
      const lineMat = textureManager.getOctahedronLineMaterial(this.value, this.isBomb);
      const lines = new THREE.LineSegments(edges, lineMat.clone());
      lines.rotation.y = Math.PI / 4;
      lines.scale.set(radius * 1.002, h * 1.002, radius * 1.002);
      this.decorGroup.add(lines);

      this.addBillboardLabel(size);
    } else if (effShape === 'star_dodecahedron') {
      const radius = size * 0.46;
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
      const lineMat = textureManager.getOctahedronLineMaterial(this.value, this.isBomb);
      const lines = new THREE.LineSegments(edges, lineMat.clone());
      lines.scale.set(radius * 1.002, radius * 1.002, radius * 1.002);
      this.decorGroup.add(lines);

      this.addBillboardLabel(size);
    } else if (effShape === 'plasma_torus') {
      const radius = size * 0.50;
      const g = getSharedSculptedRing();
      const bodyMat = textureManager.getSculptedBodyMaterial(this.value, this.isBomb, this.isWildcard);
      const nodeMat = textureManager.getSculptedNodeMaterial(this.value, this.isBomb, this.isWildcard);

      // Minimalist Luxury Sculpted Torus Ring + Slim Inner Luminous Bore Rim
      this.innerMesh = new THREE.Mesh(g.body, bodyMat.clone());
      this.innerMesh.scale.set(radius, radius, radius);
      this.innerMesh.rotation.set(Math.PI / 2 + 0.14, 0.12, 0);
      this.group.add(this.innerMesh);

      const innerRim = new THREE.Mesh(g.innerRim, nodeMat.clone());
      this.innerMesh.add(innerRim);

      this.addBillboardLabel(size, { sculpted: true, scaleFactor: 0.56 });
    } else if (effShape === 'prism_triangle') {
      const radius = size * 0.47;
      const h = height * 0.90;
      const g = getSharedSculptedPrism();
      const crystalMat = textureManager.getSculptedCrystalMaterial(this.value, this.isBomb, this.isWildcard);
      const coreMat = textureManager.getSculptedCrystalCoreMaterial(this.value, this.isBomb, this.isWildcard);
      const lineMat = textureManager.getSculptedCrystalLineMaterial(this.value, this.isBomb, this.isWildcard);
      const innerLineMat = textureManager.getSculptedCrystalLineMaterial(this.value, this.isBomb, this.isWildcard, 0.60);

      // Pure Swarovski Optical Triangular Crystal Prism (zero corner pipes or stray hairlines)
      this.innerMesh = new THREE.Mesh(g.body, crystalMat.clone());
      this.innerMesh.scale.set(radius, h, radius);
      this.innerMesh.renderOrder = 3;
      this.group.add(this.innerMesh);

      const bodyLines = new THREE.LineSegments(g.bodyEdges, lineMat.clone());
      bodyLines.scale.setScalar(1.003);
      this.innerMesh.add(bodyLines);

      // Inverted Glowing Inner Optical Bipyramid Core (6-Point Star Refraction)
      const prismCore = new THREE.Mesh(g.innerCore, coreMat.clone());
      prismCore.scale.set(radius, h, radius);
      prismCore.rotation.y = Math.PI / 3;
      prismCore.renderOrder = 1;
      const coreLines = new THREE.LineSegments(g.innerCoreEdges, lineMat.clone());
      coreLines.scale.setScalar(1.015);
      prismCore.add(coreLines);
      this.decorGroup.add(prismCore);
      this.prismCore = prismCore;

      // Concentric Inner Optical Crystal Refraction Cage (Parallel to Outer Glass, Zero Wall Piercing)
      const prismInnerFrame = new THREE.LineSegments(g.innerFrameEdges, innerLineMat.clone());
      prismInnerFrame.renderOrder = 2;
      this.innerMesh.add(prismInnerFrame);
      this.prismHalo = prismInnerFrame;

      this.addBillboardLabel(size, { sculpted: true, scaleFactor: 0.60 });
    } else if (effShape === 'stellar_icosahedron') {
      const radius = size * 0.46;
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
      const radius = size * 0.50;
      const g = getSharedCapsule();
      const shellMat = textureManager.getSculptedCrystalMaterial(this.value, this.isBomb, this.isWildcard, true);
      const coreMat = textureManager.getSculptedNodeMaterial(this.value, this.isBomb, this.isWildcard);
      const beltMat = textureManager.getSculptedAccentMaterial(this.value, this.isBomb, this.isWildcard);

      // Minimalist Horizontal Glass Ampoule Capsule + Glowing Core Pill + Single Waist Collar
      this.innerMesh = new THREE.Mesh(g.body, shellMat.clone());
      this.innerMesh.scale.set(radius, radius, radius);
      this.innerMesh.rotation.y = Math.PI / 5;
      this.innerMesh.renderOrder = 2;
      this.group.add(this.innerMesh);

      const corePill = new THREE.Mesh(g.core, coreMat.clone());
      corePill.renderOrder = 1;
      this.innerMesh.add(corePill);

      const seamBelt = new THREE.Mesh(g.seamBelt, beltMat.clone());
      this.innerMesh.add(seamBelt);

      this.addBillboardLabel(size, { sculpted: true, scaleFactor: 0.56 });
    } else if (effShape === 'quantum_knot') {
      const radius = size * 0.48;
      const g = getSharedSculptedKnot();
      const bodyMat = textureManager.getSculptedBodyMaterial(this.value, this.isBomb, this.isWildcard);
      const accentMat = textureManager.getSculptedAccentMaterial(this.value, this.isBomb, this.isWildcard);
      const nodeMat = textureManager.getSculptedNodeMaterial(this.value, this.isBomb, this.isWildcard);

      this.innerMesh = new THREE.Mesh(g.body, bodyMat.clone());
      this.innerMesh.scale.set(radius, radius, radius);
      this.group.add(this.innerMesh);

      // Glowing Faceted Energy Heart Seated Inside Trefoil Cavity
      const coreCrystal = new THREE.Mesh(g.coreGem, nodeMat.clone());
      this.innerMesh.add(coreCrystal);

      // Primary Precision Gimbal Halo Ring with 3-Fold Diamond Nodes (Matching Trefoil Symmetry)
      const halo = new THREE.Mesh(g.haloOuter, accentMat.clone());
      halo.scale.set(radius, radius, radius);
      halo.rotation.x = Math.PI / 3;
      for (let i = 0; i < 3; i++) {
        const a = (i / 3) * Math.PI * 2;
        const bead = new THREE.Mesh(g.node, nodeMat.clone());
        bead.position.set(Math.cos(a) * 0.92, Math.sin(a) * 0.92, 0);
        halo.add(bead);
      }
      this.decorGroup.add(halo);
      this.knotHalo = halo;

      // Secondary Cross-Tilted Inner Orbital Filament
      const innerHalo = new THREE.Mesh(g.haloInner, nodeMat.clone());
      innerHalo.scale.set(radius, radius, radius);
      innerHalo.rotation.set(-Math.PI / 3.5, Math.PI / 4, 0);
      this.decorGroup.add(innerHalo);
      this.knotInnerHalo = innerHalo;

      this.addBillboardLabel(size, { sculpted: true, scaleFactor: 0.62 });
    } else if (effShape === 'portal_nexus') {
      const radius = size * 0.49;
      const { outerRing, innerRing, bead } = getSharedPortalNexus();
      const accentMat = textureManager.getSculptedAccentMaterial(this.value, this.isBomb, this.isWildcard);
      const bodyMat = textureManager.getSculptedBodyMaterial(this.value, this.isBomb, this.isWildcard);
      const nodeMat = textureManager.getSculptedNodeMaterial(this.value, this.isBomb, this.isWildcard);

      // Outer Portal Ring
      const rOuter = new THREE.Mesh(outerRing, accentMat.clone());
      rOuter.scale.set(radius, radius, radius);
      rOuter.rotation.x = Math.PI / 2;
      this.decorGroup.add(rOuter);
      this.portalOuter = rOuter;

      // Inner Counter-Rotating Ring
      const rInner = new THREE.Mesh(innerRing, nodeMat.clone());
      rInner.scale.set(radius, radius, radius);
      rInner.rotation.x = Math.PI / 2.6;
      this.decorGroup.add(rInner);
      this.portalInner = rInner;

      // Mirror-Smooth Central Energy Core Sphere
      const sphereGeo = getSharedSculptedSphere().orb;
      this.innerMesh = new THREE.Mesh(sphereGeo, bodyMat.clone());
      this.innerMesh.scale.set(radius * 0.65, radius * 0.65, radius * 0.65);
      this.group.add(this.innerMesh);

      // 4 Orbiting Diamond Satellites
      this.portalBeadGroup = new THREE.Group();
      this.decorGroup.add(this.portalBeadGroup);
      for (let b = 0; b < 4; b++) {
        const beadMesh = new THREE.Mesh(bead, nodeMat.clone());
        beadMesh.scale.set(radius, radius, radius);
        const angle = (b * Math.PI) / 2;
        const dist = radius * 0.94;
        beadMesh.position.set(Math.cos(angle) * dist, 0, Math.sin(angle) * dist);
        this.portalBeadGroup.add(beadMesh);
      }

      this.addBillboardLabel(size, { sculpted: true, scaleFactor: 0.58 });
    } else if (effShape === 'asteroid') {
      const radius = size * 0.36;
      const geo = getSharedAsteroid();
      const mat = textureManager.getCelestialMaterial('asteroid', this.value);
      this.innerMesh = new THREE.Mesh(geo, mat.clone());
      this.innerMesh.scale.set(radius, radius, radius);
      this.group.add(this.innerMesh);
      this.addBillboardLabel(size, { sculpted: true, scaleFactor: 0.60 });
    } else if (effShape === 'magma_planet') {
      const orbRadius = size * 0.48;
      const geo = getSharedSculptedSphere().orb;
      const mat = textureManager.getCelestialMaterial('magma', this.value);
      this.innerMesh = new THREE.Mesh(geo, mat.clone());
      this.innerMesh.scale.set(orbRadius, orbRadius, orbRadius);
      this.group.add(this.innerMesh);
      this.addBillboardLabel(size, { sculpted: true, scaleFactor: 0.58 });
    } else if (effShape === 'gas_giant') {
      const orbRadius = size * 0.50;
      const geo = getSharedSculptedSphere().orb;
      const mat = textureManager.getCelestialMaterial('gas_giant', this.value);
      this.innerMesh = new THREE.Mesh(geo, mat.clone());
      this.innerMesh.scale.set(orbRadius, orbRadius, orbRadius);
      this.innerMesh.rotation.z = (15 * Math.PI) / 180;
      this.group.add(this.innerMesh);
      this.addBillboardLabel(size, { sculpted: true, scaleFactor: 0.58 });
    } else if (effShape === 'saturn_rings') {
      const tileR = size * 0.49;
      const planetScale = tileR * 0.86;
      const geo = getSharedSculptedSphere().orb;
      const mat = textureManager.getCelestialMaterial('saturn', this.value);
      this.innerMesh = new THREE.Mesh(geo, mat.clone());
      this.innerMesh.scale.set(planetScale, planetScale, planetScale);
      this.innerMesh.rotation.z = (22 * Math.PI) / 180;
      this.group.add(this.innerMesh);

      const ringGeo = getSharedSaturnRing();
      const ringMat = textureManager.getCelestialMaterial('saturn_ring', this.value);
      const ringMesh = new THREE.Mesh(ringGeo, ringMat.clone());
      // PlaneGeometry(2x2) scaled to tileR sits strictly within cell (outer = tileR)
      ringMesh.scale.set(tileR, tileR, tileR);
      ringMesh.rotation.x = Math.PI / 2.25;
      ringMesh.rotation.y = (22 * Math.PI) / 180;
      this.decorGroup.add(ringMesh);
      this.saturnRing = ringMesh;

      this.addBillboardLabel(size, { sculpted: true, scaleFactor: 0.54 });
    } else if (effShape === 'pulsar_star') {
      const tileR = size * 0.48;
      const orbScale = tileR * 0.90;
      const geo = getSharedSculptedSphere().orb;
      const mat = textureManager.getCelestialMaterial('pulsar', this.value);
      this.innerMesh = new THREE.Mesh(geo, mat.clone());
      this.innerMesh.scale.set(orbScale, orbScale, orbScale);
      this.group.add(this.innerMesh);

      const ringGeo = getSharedPulsarRing();
      const accentMat = textureManager.getSculptedAccentMaterial(this.value, this.isBomb, this.isWildcard);
      const ring1 = new THREE.Mesh(ringGeo, accentMat.clone());
      ring1.scale.set(tileR * 0.96, tileR * 0.96, tileR * 0.96);
      ring1.rotation.x = Math.PI / 3;
      this.decorGroup.add(ring1);
      this.pulsarRing1 = ring1;

      const ring2 = new THREE.Mesh(ringGeo, accentMat.clone());
      ring2.scale.set(tileR * 0.98, tileR * 0.98, tileR * 0.98);
      ring2.rotation.x = -Math.PI / 3.4;
      this.decorGroup.add(ring2);
      this.pulsarRing2 = ring2;

      this.addBillboardLabel(size, { sculpted: true, scaleFactor: 0.58 });
    } else if (effShape === 'black_hole') {
      const tileR = size * 0.49;
      const orbScale = tileR * 0.80;
      const geo = getSharedSculptedSphere().orb;
      const coreMat = textureManager.getCelestialMaterial('black_hole_core', this.value);
      this.innerMesh = new THREE.Mesh(geo, coreMat.clone());
      this.innerMesh.scale.set(orbScale, orbScale, orbScale);
      this.group.add(this.innerMesh);

      const { disk, einstein } = getSharedBlackHoleDisk();
      const diskMat = textureManager.getCelestialMaterial('black_hole_disk', this.value);
      const diskMesh = new THREE.Mesh(disk, diskMat.clone());
      diskMesh.scale.set(tileR, tileR, tileR);
      diskMesh.rotation.x = Math.PI / 2.65;
      this.decorGroup.add(diskMesh);
      this.blackHoleDisk = diskMesh;

      const einsteinMat = textureManager.getCelestialMaterial('einstein_ring', this.value);
      const einsteinMesh = new THREE.Mesh(einstein, einsteinMat.clone());
      einsteinMesh.scale.set(tileR * 0.92, tileR * 0.92, tileR * 0.92);
      einsteinMesh.rotation.x = Math.PI / 7;
      this.decorGroup.add(einsteinMesh);
      this.einsteinRing = einsteinMesh;

      this.addBillboardLabel(size, { sculpted: true, scaleFactor: 0.54 });
    }

    // Bomb indicator ring with shared geometry & cached material
    if (this.isBomb) {
      const bombGeo = getSharedBombRing();
      const bombMat = textureManager.getBombRingMaterial();
      this.bombRing = new THREE.Mesh(bombGeo, bombMat);
      this.bombRing.scale.set(size * 0.54, size * 0.54, size * 0.54);
      this.bombRing.rotation.x = Math.PI / 2;
      this.decorGroup.add(this.bombRing);
    }

    // Contact Shadow Plane (4x4 mode): adds visual ground anchoring beneath tiles
    if (getBoardMode() === '4x4') {
      const shadowGeo = getSharedContactShadowPlane(size);
      const shadowMat = textureManager.getContactShadowMaterial();
      this.contactShadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
      this.contactShadowMesh.rotation.x = -Math.PI / 2;
      this.contactShadowMesh.position.set(0, -height / 2 + 0.005, 0);
      this.contactShadowMesh.renderOrder = 1;
      this.decorGroup.add(this.contactShadowMesh);
    }

    if (this.innerMesh) {
      this.innerMesh.userData = { isTile3D: true, tileInstance: this };
    }
  }

  buildPrestige1024Aura(size) {
    const ringGeo = getSharedPrestigeRing1024(size);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      metalness: 0.94,
      roughness: 0.12,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.45
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 3;
    ring.rotation.y = Math.PI / 6;
    this.decorGroup.add(ring);
    this.ring1 = ring;

    const beadGeo = getSharedPrestigeDiamondBead(size);
    const beadMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x00f0ff,
      emissiveIntensity: 0.85,
      metalness: 0.96,
      roughness: 0.06
    });

    for (let i = 0; i < 4; i++) {
      const theta = (i * Math.PI) / 2;
      const bx = Math.cos(theta) * size * 0.58;
      const by = Math.sin(theta) * size * 0.58;
      const bead = new THREE.Mesh(beadGeo, beadMat);
      bead.position.set(bx, by, 0);
      ring.add(bead);
    }
  }

  buildPrestige2048Aura(size) {
    // Ring 1 (Inner Imperial Gold Ring with Rubies)
    const ring1Geo = getSharedPrestigeRing2048_1(size);
    const goldMat1 = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.96,
      roughness: 0.10,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.55
    });
    const r1 = new THREE.Mesh(ring1Geo, goldMat1);
    r1.rotation.x = Math.PI / 3.2;
    r1.rotation.y = Math.PI / 5;
    this.decorGroup.add(r1);
    this.ring1 = r1;

    // 4 Imperial Ruby Beads on Ring 1
    const rubyGeo = getSharedPrestigeRubyBead(size);
    const rubyMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0xdc2626,
      emissiveIntensity: 0.90,
      roughness: 0.15,
      metalness: 0.35
    });
    for (let i = 0; i < 4; i++) {
      const theta = (i * Math.PI) / 2;
      const rx = Math.cos(theta) * size * 0.59;
      const ry = Math.sin(theta) * size * 0.59;
      const ruby = new THREE.Mesh(rubyGeo, rubyMat);
      ruby.position.set(rx, ry, 0);
      r1.add(ruby);
    }

    // Ring 2 (Outer Radiant Gold Gimbal Ring)
    const ring2Geo = getSharedPrestigeRing2048_2(size);
    const goldMat2 = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      metalness: 0.92,
      roughness: 0.12,
      emissive: 0xd97706,
      emissiveIntensity: 0.45
    });
    const r2 = new THREE.Mesh(ring2Geo, goldMat2);
    r2.rotation.x = -Math.PI / 3.5;
    r2.rotation.z = Math.PI / 4;
    this.decorGroup.add(r2);
    this.ring2 = r2;
  }

  addBillboardLabel(size, options = {}) {
    const is3D = getBoardMode() === '3x3x3';
    const isSculpted = !!options.sculpted;
    const scaleFactor = options.scaleFactor || (is3D ? 0.85 : 0.9);
    const spriteMat = isSculpted
      ? textureManager.getSculptedBillboardMaterial(this.value, this.isBomb, this.bombCountdown, this.isWildcard)
      : textureManager.getBillboardMaterial(this.value, this.isBomb, this.bombCountdown, this.isWildcard);
    const clonedMat = spriteMat.clone();

    if (is3D) {
      // In 3x3x3 mode: Enable depth testing so foreground tiles occlude background tiles.
      clonedMat.depthTest = true;
      clonedMat.depthWrite = false;
      this.labelSprite = new THREE.Sprite(clonedMat);
      this.labelSprite.scale.set(size * scaleFactor, size * scaleFactor, 1);
      this.labelSprite.position.set(0, 0, 0);
      this.labelSprite.renderOrder = 30 + (this.layer || 0) * 10;

      // Ensure the tile innerMesh does not clip its own billboard label
      if (this.innerMesh && this.innerMesh.material) {
        const offsetMat = (m) => {
          m.polygonOffset = true;
          m.polygonOffsetFactor = 2;
          m.polygonOffsetUnits = 2;
        };
        if (Array.isArray(this.innerMesh.material)) {
          this.innerMesh.material.forEach(offsetMat);
        } else {
          offsetMat(this.innerMesh.material);
        }
      }
    } else {
      this.labelSprite = new THREE.Sprite(clonedMat);
      this.labelSprite.scale.set(size * scaleFactor, size * scaleFactor, 1);
      this.labelSprite.position.set(0, 0, 0);
      this.labelSprite.renderOrder = 999;
    }

    this.labelSprite.userData = { isTile3D: true, tileInstance: this };
    this.group.add(this.labelSprite);
  }

  setShape(newShape) {
    if (this.shapeType === newShape && newShape !== 'auto_evolution') return;
    this.shapeType = newShape;
    this.buildGeometry();
  }

  setBombState(isBomb, countdown) {
    if (this._disposed) return;
    const nextBomb = !!isBomb;
    const nextCd = nextBomb ? (countdown || 0) : 0;
    if (this.isBomb === nextBomb && (!nextBomb || this.bombCountdown === nextCd)) {
      return;
    }
    this.isBomb = nextBomb;
    this.bombCountdown = nextCd;
    this.buildGeometry();
  }

  setSelected(isSelected, mode = 'swap') {
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
      const boxGeo = new THREE.BoxGeometry(size * 1.03, height * 1.03, size * 1.03);
      const edgesGeo = new THREE.EdgesGeometry(boxGeo);
      boxGeo.dispose();
      const lineColor = (mode === 'destroy') ? 0xff2a55 : 0x00f0ff;
      const lineMat = new THREE.LineBasicMaterial({
        color: lineColor,
        transparent: true,
        opacity: 0.98,
        linewidth: 2
      });
      this.selectionOutline = new THREE.LineSegments(edgesGeo, lineMat);
      this.group.add(this.selectionOutline);

      // Smoothly lift up by 0.32 units on Y-axis with subtle bounce
      gsap.to(this.group.position, {
        y: basePos.y + 0.32,
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
    if (this._disposed || !this.group) return null;
    const basePos = getGridPosition(this.layer, this.row, this.col);
    gsap.killTweensOf(this.group.position);
    gsap.killTweensOf(this.group.scale);
    gsap.killTweensOf(this.group.rotation);

    // Clean, crisp spring pop-in (dứt khoát, không rơi giật từ trên trời)
    this.group.position.set(basePos.x, basePos.y, basePos.z);
    this.group.rotation.set(0, 0, 0);
    this.group.scale.set(0.1, 0.1, 0.1);

    return gsap.to(this.group.scale, {
      x: 1.0,
      y: 1.0,
      z: 1.0,
      duration: 0.08,
      delay: delay,
      ease: 'back.out(1.5)',
      onComplete: () => {
        this.group.scale.set(1, 1, 1);
      }
    });
  }

  slideTo(targetLayer, targetRow, targetCol, duration = null) {
    if (this._disposed || !this.group) return null;
    const isHigh = (tileGraphicsQuality === 'high' || window.gameApp?.graphicsQuality === 'high');
    const actualDuration = duration !== null ? duration : (isHigh ? 0.082 : 0.076);

    const dl = targetLayer - this.layer;
    const dr = targetRow - this.row;
    const dc = targetCol - this.col;

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

    this.group.scale.set(1, 1, 1);
    this.group.rotation.set(0, 0, 0);

    // Subtle aerodynamic squash & stretch along movement axis (NO rotation)
    if (Math.abs(dc) > 0) {
      gsap.to(this.group.scale, { x: 1.05, y: 0.97, z: 0.97, duration: actualDuration * 0.5, yoyo: true, repeat: 1, ease: 'sine.inOut' });
    } else if (Math.abs(dr) > 0) {
      gsap.to(this.group.scale, { x: 0.97, y: 0.97, z: 1.05, duration: actualDuration * 0.5, yoyo: true, repeat: 1, ease: 'sine.inOut' });
    } else if (Math.abs(dl) > 0) {
      gsap.to(this.group.scale, { x: 0.96, y: 1.06, z: 0.96, duration: actualDuration * 0.5, yoyo: true, repeat: 1, ease: 'sine.inOut' });
    }

    return gsap.to(this.group.position, {
      x: targetPos.x,
      y: targetPos.y,
      z: targetPos.z,
      duration: actualDuration,
      ease: 'power2.out',
      onComplete: () => {
        this.group.scale.set(1, 1, 1);
        this.group.rotation.set(0, 0, 0);
      }
    });
  }

  triggerJellyImpact(dc = 0, dr = 0, dl = 0) {
    // Lightweight, clean rest without dizzying oscillations
    gsap.to(this.group.scale, { x: 1.0, y: 1.0, z: 1.0, duration: 0.04, ease: 'power1.out' });
  }

  upgradeTo(newValue) {
    if (this._disposed) return;
    this.value = newValue;
    this.isWildcard = false;
    this.buildGeometry();

    const basePos = getGridPosition(this.layer, this.row, this.col);

    // Sound: Bubbly crystal pop
    if (soundManager && soundManager.playPop) {
      soundManager.playPop();
    }

    // Lock rotation firmly to 0 - absolute zero rotation/spinning on merge
    gsap.killTweensOf(this.group.rotation);
    this.group.rotation.set(0, 0, 0);

    // Tactile, crisp vertical spring pop (hoàn toàn không xoay, nảy đanh dứt khoát)
    const tl = gsap.timeline();
    tl.to(this.group.position, {
      y: basePos.y + 0.10,
      duration: 0.05,
      ease: 'power2.out'
    }, 0);
    tl.to(this.group.scale, {
      x: 1.15,
      y: 1.15,
      z: 1.15,
      duration: 0.05,
      ease: 'power2.out'
    }, 0);

    tl.to(this.group.position, {
      y: basePos.y,
      duration: 0.06,
      ease: 'power2.in'
    });
    tl.to(this.group.scale, {
      x: 1.0,
      y: 1.0,
      z: 1.0,
      duration: 0.06,
      ease: 'back.out(1.8)'
    }, '<');

    return tl;
  }

  update(delta) {
    if (document.body.classList.contains('reduce-motion') || (window.gameApp && window.gameApp.reduceMotion)) {
      delta *= 0.15;
    }
    const effShape = this.getEffectiveShape();
    if (effShape === 'rounded_cube') {
      if (this.value === 1024 && this.ring1) {
        this.ring1.rotation.z += delta * 1.2;
      } else if (this.value >= 2048) {
        if (this.ring1) this.ring1.rotation.z += delta * 1.5;
        if (this.ring2) this.ring2.rotation.z -= delta * 1.2;
      }
    } else if (effShape === 'crystal_octahedron' && this.innerMesh) {
      this.innerMesh.rotation.y += delta * 0.7;
      this.decorGroup.rotation.y += delta * 0.7;
    } else if (effShape === 'core_sphere') {
      if (this.innerMesh) this.innerMesh.rotation.y += delta * 0.5;
      if (this.ring1) this.ring1.rotation.z += delta * 1.6;
      if (this.ring2) this.ring2.rotation.y -= delta * 1.3;
      if (this.ring3) this.ring3.rotation.z += delta * 2.2;
    }

    if (effShape === 'hex_prism') {
      if (this.innerMesh) this.innerMesh.rotation.y += delta * 0.55;
      if (this.hexCore) this.hexCore.rotation.y -= delta * 0.95;
      if (this.hexHalo) this.hexHalo.rotation.y -= delta * 0.35;
    } else if (effShape === 'cyber_pyramid' && this.innerMesh) {
      this.innerMesh.rotation.y += delta * 0.8;
      this.decorGroup.rotation.y += delta * 0.8;
    } else if (effShape === 'star_dodecahedron' && this.innerMesh) {
      this.innerMesh.rotation.y += delta * 0.65;
      this.innerMesh.rotation.x += delta * 0.35;
      this.decorGroup.rotation.y += delta * 0.65;
      this.decorGroup.rotation.x += delta * 0.35;
    } else if (effShape === 'plasma_torus') {
      if (this.innerMesh) {
        this._ringPhase = (this._ringPhase || 0) + delta * 1.4;
        this.innerMesh.rotation.x = Math.PI / 2 + Math.sin(this._ringPhase) * 0.16;
        this.innerMesh.rotation.y = Math.cos(this._ringPhase) * 0.16;
      }
    } else if (effShape === 'prism_triangle') {
      if (this.innerMesh) this.innerMesh.rotation.y += delta * 0.55;
      if (this.prismCore) this.prismCore.rotation.y -= delta * 0.95;
    } else if (effShape === 'stellar_icosahedron' && this.innerMesh) {
      this.innerMesh.rotation.y += delta * 0.7;
      this.innerMesh.rotation.x += delta * 0.4;
      this.decorGroup.rotation.y += delta * 0.7;
      this.decorGroup.rotation.x += delta * 0.4;
    } else if (effShape === 'chrono_capsule') {
      if (this.innerMesh) this.innerMesh.rotation.y += delta * 0.65;
    } else if (effShape === 'quantum_knot') {
      if (this.innerMesh) {
        this.innerMesh.rotation.y += delta * 1.1;
        this.innerMesh.rotation.x += delta * 0.55;
      }
      if (this.knotHalo) this.knotHalo.rotation.z -= delta * 1.4;
      if (this.knotInnerHalo) this.knotInnerHalo.rotation.y += delta * 1.8;
    } else if (effShape === 'portal_nexus') {
      if (this.portalOuter) this.portalOuter.rotation.z += delta * 1.2;
      if (this.portalInner) this.portalInner.rotation.z -= delta * 1.6;
      if (this.portalBeadGroup) this.portalBeadGroup.rotation.y += delta * 2.2;
      if (this.innerMesh) this.innerMesh.rotation.y += delta * 0.8;
    } else if (effShape === 'asteroid' && this.innerMesh) {
      this.innerMesh.rotation.x += delta * 0.45;
      this.innerMesh.rotation.y += delta * 0.65;
    } else if (effShape === 'magma_planet' && this.innerMesh) {
      this.innerMesh.rotation.y += delta * 0.4;
    } else if (effShape === 'gas_giant' && this.innerMesh) {
      this.innerMesh.rotation.y += delta * 0.55;
    } else if (effShape === 'saturn_rings') {
      if (this.innerMesh) this.innerMesh.rotation.y += delta * 0.45;
      if (this.saturnRing) this.saturnRing.rotation.z += delta * 0.85;
    } else if (effShape === 'pulsar_star') {
      if (this.innerMesh) this.innerMesh.rotation.y += delta * 1.4;
      if (this.pulsarRing1) this.pulsarRing1.rotation.z += delta * 2.4;
      if (this.pulsarRing2) this.pulsarRing2.rotation.y -= delta * 1.8;
    } else if (effShape === 'black_hole') {
      if (this.blackHoleDisk) this.blackHoleDisk.rotation.z += delta * 3.6;
      if (this.einsteinRing) this.einsteinRing.rotation.y += delta * 0.9;
    }

    if (this.bombRing) {
      this.bombRing.rotation.z += delta * 3.0;
    }

    // High Quality Kinematics: Subtle Living Micro-Breathing for Grand Tiles (>= 1024)
    const isHigh = (tileGraphicsQuality === 'high' || window.gameApp?.graphicsQuality === 'high');
    if (isHigh && this.value >= 1024 && !this.isHeld && !this.isSelected) {
      const basePos = getGridPosition(this.layer, this.row, this.col);
      const dy = Math.abs(this.group.position.y - basePos.y);
      if (dy < 0.1) {
        const t = performance.now() * 0.002;
        this.group.position.y = basePos.y + Math.sin(t + this.id) * 0.012;
      }
    }
  }

  dispose(immediate = false) {
    this._disposed = true;
    if (this.group) {
      gsap.killTweensOf(this.group);
      gsap.killTweensOf(this.group.position);
      gsap.killTweensOf(this.group.scale);
      gsap.killTweensOf(this.group.rotation);
    }

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

    const cleanup = () => {
      if (this.group) {
        this.group.visible = false;
        if (this.group.parent) {
          this.group.parent.remove(this.group);
        }
      }
      if (!this._materialsDisposed) {
        this._materialsDisposed = true;
        this.disposeClonedMaterials();
      }
    };

    if (immediate || !this.group) {
      cleanup();
      return;
    }

    gsap.to(this.group.scale, {
      x: 0.001,
      y: 0.001,
      z: 0.001,
      duration: 0.12,
      ease: 'power2.in',
      onComplete: cleanup,
      onInterrupt: cleanup
    });
    setTimeout(cleanup, 160);
  }
}
