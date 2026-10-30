import * as THREE from 'three';
import { textureManager } from './textureManager.js';
import gsap from 'gsap';

const MAX_PARTICLES = 128;

export class ParticleSystem {
  constructor(scene) {
    this.scene = scene;
    this.isHyperNeon = false;

    // Shared geometry for particles
    this.sharedGeo = new THREE.BoxGeometry(0.12, 0.12, 0.12);
    this.sharedMat = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0.95
    });

    // Zero-allocation InstancedMesh for ALL particles
    this.instancedMesh = new THREE.InstancedMesh(this.sharedGeo, this.sharedMat, MAX_PARTICLES);
    this.instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.instancedMesh.setColorAt(0, new THREE.Color(0xffffff)); // initialize color buffer
    this.instancedMesh.instanceColor.setUsage(THREE.DynamicDrawUsage);

    // Initial state: all particles hidden at scale 0
    const dummy = new THREE.Object3D();
    dummy.scale.set(0, 0, 0);
    dummy.updateMatrix();
    for (let i = 0; i < MAX_PARTICLES; i++) {
      this.instancedMesh.setMatrixAt(i, dummy.matrix);
    }
    this.instancedMesh.instanceMatrix.needsUpdate = true;
    this.scene.add(this.instancedMesh);

    // Flat pre-allocated TypedArrays for pool state
    this.active = new Uint8Array(MAX_PARTICLES);
    this.posX = new Float32Array(MAX_PARTICLES);
    this.posY = new Float32Array(MAX_PARTICLES);
    this.posZ = new Float32Array(MAX_PARTICLES);

    this.velX = new Float32Array(MAX_PARTICLES);
    this.velY = new Float32Array(MAX_PARTICLES);
    this.velZ = new Float32Array(MAX_PARTICLES);

    this.rotX = new Float32Array(MAX_PARTICLES);
    this.rotY = new Float32Array(MAX_PARTICLES);

    this.rotSpeedX = new Float32Array(MAX_PARTICLES);
    this.rotSpeedY = new Float32Array(MAX_PARTICLES);

    this.age = new Float32Array(MAX_PARTICLES);
    this.maxAge = new Float32Array(MAX_PARTICLES);

    this.dummy = new THREE.Object3D();
    this.tempColor = new THREE.Color();
    this.activeCount = 0;
  }

  setHyperNeon(enabled) {
    this.isHyperNeon = enabled;
  }

  burst(x, y, z, value = 4) {
    const style = textureManager.getStyle(value);
    const count = this.isHyperNeon ? 36 : 20;
    const neonPalette = [0xff007f, 0x00f0ff, 0xffd700, 0x7928ca, 0x00ff88];

    let spawned = 0;
    for (let i = 0; i < MAX_PARTICLES && spawned < count; i++) {
      if (this.active[i] === 0) {
        this.active[i] = 1;
        this.age[i] = 0;
        this.maxAge[i] = 0.45 + Math.random() * 0.25;

        this.posX[i] = x + (Math.random() - 0.5) * 0.4;
        this.posY[i] = y + 0.2 + (Math.random() - 0.5) * 0.2;
        this.posZ[i] = z + (Math.random() - 0.5) * 0.4;

        this.rotX[i] = Math.random() * Math.PI;
        this.rotY[i] = Math.random() * Math.PI;
        this.rotSpeedX[i] = (Math.random() - 0.5) * 12;
        this.rotSpeedY[i] = (Math.random() - 0.5) * 12;

        const angle = Math.random() * Math.PI * 2;
        const speedMultiplier = this.isHyperNeon ? 1.5 : 1.0;
        const speed = (2.0 + Math.random() * 3.5) * speedMultiplier;
        const upward = (2.5 + Math.random() * 3.0) * speedMultiplier;

        this.velX[i] = Math.cos(angle) * speed;
        this.velY[i] = upward;
        this.velZ[i] = Math.sin(angle) * speed;

        if (this.isHyperNeon) {
          this.tempColor.setHex(neonPalette[Math.floor(Math.random() * neonPalette.length)]);
        } else {
          this.tempColor.set(style.emissive !== '#000000' ? style.emissive : style.bg);
        }
        this.instancedMesh.setColorAt(i, this.tempColor);

        // Initial transform
        this.dummy.position.set(this.posX[i], this.posY[i], this.posZ[i]);
        this.dummy.rotation.set(this.rotX[i], this.rotY[i], 0);
        this.dummy.scale.set(1, 1, 1);
        this.dummy.updateMatrix();
        this.instancedMesh.setMatrixAt(i, this.dummy.matrix);

        spawned++;
      }
    }

    this.activeCount += spawned;
    this.instancedMesh.instanceColor.needsUpdate = true;
    this.instancedMesh.instanceMatrix.needsUpdate = true;
  }

  // Supernova celestial burst with shockwave particles and camera shake
  supernovaBurst(x, y, z, value = 256, camera = null) {
    this.burst(x, y, z, value);
    if (camera) {
      let intensity = 0.22;
      if (value >= 2048) intensity = 0.58;
      else if (value >= 1024) intensity = 0.44;
      else if (value >= 512) intensity = 0.34;
      else if (value >= 256) intensity = 0.26;
      this.screenShake(camera, intensity);
    }
  }

  // Camera screen shake for impactful big merges
  screenShake(camera, intensity = 0.22) {
    const originalPos = camera.position.clone();
    const timeline = gsap.timeline();

    for (let i = 0; i < 4; i++) {
      const offsetX = (Math.random() - 0.5) * intensity;
      const offsetY = (Math.random() - 0.5) * intensity;
      const offsetZ = (Math.random() - 0.5) * intensity;
      timeline.to(camera.position, {
        x: originalPos.x + offsetX,
        y: originalPos.y + offsetY,
        z: originalPos.z + offsetZ,
        duration: 0.04,
        ease: 'power1.inOut'
      });
    }

    timeline.to(camera.position, {
      x: originalPos.x,
      y: originalPos.y,
      z: originalPos.z,
      duration: 0.08,
      ease: 'power2.out'
    });
  }

  update(delta) {
    if (this.activeCount === 0) return;

    let matrixNeedsUpdate = false;
    for (let i = 0; i < MAX_PARTICLES; i++) {
      if (this.active[i] === 1) {
        this.age[i] += delta;
        if (this.age[i] >= this.maxAge[i]) {
          this.active[i] = 0;
          this.activeCount--;
          this.dummy.scale.set(0, 0, 0);
          this.dummy.updateMatrix();
          this.instancedMesh.setMatrixAt(i, this.dummy.matrix);
          matrixNeedsUpdate = true;
          continue;
        }

        // Gravity
        this.velY[i] -= 9.8 * delta * 0.7;

        this.posX[i] += this.velX[i] * delta;
        this.posY[i] += this.velY[i] * delta;
        this.posZ[i] += this.velZ[i] * delta;

        this.rotX[i] += this.rotSpeedX[i] * delta;
        this.rotY[i] += this.rotSpeedY[i] * delta;

        const progress = this.age[i] / this.maxAge[i];
        const scale = Math.max(0.001, 1 - progress);

        this.dummy.position.set(this.posX[i], this.posY[i], this.posZ[i]);
        this.dummy.rotation.set(this.rotX[i], this.rotY[i], 0);
        this.dummy.scale.set(scale, scale, scale);
        this.dummy.updateMatrix();
        this.instancedMesh.setMatrixAt(i, this.dummy.matrix);
        matrixNeedsUpdate = true;
      }
    }

    if (matrixNeedsUpdate) {
      this.instancedMesh.instanceMatrix.needsUpdate = true;
    }
  }

  clear() {
    this.dummy.scale.set(0, 0, 0);
    this.dummy.updateMatrix();
    for (let i = 0; i < MAX_PARTICLES; i++) {
      if (this.active[i] === 1) {
        this.active[i] = 0;
        this.instancedMesh.setMatrixAt(i, this.dummy.matrix);
      }
    }
    this.activeCount = 0;
    this.instancedMesh.instanceMatrix.needsUpdate = true;
  }

  dispose() {
    this.clear();
    if (this.instancedMesh && this.instancedMesh.parent) {
      this.instancedMesh.parent.remove(this.instancedMesh);
    }
    if (this.sharedGeo) this.sharedGeo.dispose();
    if (this.sharedMat) this.sharedMat.dispose();
    if (this.instancedMesh && this.instancedMesh.dispose) {
      this.instancedMesh.dispose();
    }
  }
}
