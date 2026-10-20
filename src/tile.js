import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import gsap from 'gsap';
import { getGridPosition, getTileDimensions } from './board.js';
import { textureManager } from './textureManager.js';

let nextTileId = 1;

// ================= ZERO-ALLOCATION SHARED GEOMETRY POOL =================
const sharedGeos = {
  roundedBox: new Map(),
  octahedron: null,
  octahedronEdges: null,
  sphere: null,
  torus: null,
  bombRing: null
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

export class Tile3D {
  constructor(layer, row, col, value, scene, shape = 'rounded_cube', isBomb = false, bombCountdown = 5) {
    this.id = nextTileId++;
    this.layer = layer;
    this.row = row;
    this.col = col;
    this.value = value;
    this.scene = scene;
    this.shapeType = shape;
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
    this.isSelected = false;
    this.isHovered = false;

    this.group.add(this.decorGroup);

    this.buildGeometry();

    const pos = getGridPosition(this.layer, this.row, this.col);
    this.group.position.set(pos.x, pos.y, pos.z);

    this.group.scale.set(0, 0, 0);
    this.scene.add(this.group);
  }

  getEffectiveShape() {
    if (this.shapeType === 'auto_evolution') {
      if (this.value <= 16) return 'rounded_cube';
      if (this.value <= 128) return 'crystal_octahedron';
      return 'core_sphere';
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
  }

  addBillboardLabel(size) {
    const spriteMat = textureManager.getBillboardMaterial(this.value, this.isBomb, this.bombCountdown);
    this.labelSprite = new THREE.Sprite(spriteMat);
    this.labelSprite.scale.set(size * 0.9, size * 0.9, 1);
    this.labelSprite.position.set(0, 0, 0);
    this.labelSprite.renderOrder = 999;
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

  setHovered(isHovered) {
    if (this.isHovered === isHovered) return;
    this.isHovered = isHovered;
    if (this.isSelected) return; // Do not override lift or outline if selected

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

  spawnAnimation() {
    return gsap.to(this.group.scale, {
      x: 1,
      y: 1,
      z: 1,
      duration: 0.32,
      ease: 'back.out(2.0)'
    });
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
    this.isSelected = false;
    this.isHovered = false;

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

    return gsap.fromTo(
      this.group.scale,
      { x: 1.28, y: 1.28, z: 1.28 },
      {
        x: 1,
        y: 1,
        z: 1,
        duration: 0.28,
        ease: 'back.out(2.5)'
      }
    );
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
    this.isSelected = false;
    this.isHovered = false;

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
