import * as THREE from 'three';

const TILE_STYLES = {
  2:     { bg: '#0284c7', text: '#ffffff', emissive: '#0ea5e9', intensity: 0.35, rim: '#7dd3fc' },
  4:     { bg: '#059669', text: '#ffffff', emissive: '#10b981', intensity: 0.40, rim: '#6ee7b7' },
  8:     { bg: '#d97706', text: '#ffffff', emissive: '#f59e0b', intensity: 0.45, rim: '#fde68a' },
  16:    { bg: '#ea580c', text: '#ffffff', emissive: '#f97316', intensity: 0.50, rim: '#fed7aa' },
  32:    { bg: '#dc2626', text: '#ffffff', emissive: '#ef4444', intensity: 0.55, rim: '#fca5a5' },
  64:    { bg: '#db2777', text: '#ffffff', emissive: '#ec4899', intensity: 0.60, rim: '#fbcfe8' },
  128:   { bg: '#ca8a04', text: '#ffffff', emissive: '#eab308', intensity: 0.70, rim: '#fef08a' },
  256:   { bg: '#7c3aed', text: '#ffffff', emissive: '#8b5cf6', intensity: 0.75, rim: '#ddd6fe' },
  512:   { bg: '#4f46e5', text: '#ffffff', emissive: '#6366f1', intensity: 0.80, rim: '#c7d2fe' },
  1024:  { bg: '#0891b2', text: '#ffffff', emissive: '#06b6d4', intensity: 0.90, rim: '#a5f3fc' },
  2048:  { bg: '#b45309', text: '#ffffff', emissive: '#ffd700', intensity: 1.10, rim: '#fffbeb' },
  4096:  { bg: '#9333ea', text: '#ffffff', emissive: '#c084fc', intensity: 1.20, rim: '#f3e8ff' },
  8192:  { bg: '#059669', text: '#ffffff', emissive: '#34d399', intensity: 1.30, rim: '#d1fae5' },
  16384: { bg: '#e11d48', text: '#ffffff', emissive: '#fb7185', intensity: 1.40, rim: '#ffe4e6' }
};

export class TextureManager {
  constructor() {
    this.textureCache = new Map();
    this.materialCache = new Map();
    this.spriteTextureCache = new Map();
    this.isHyperNeon = false;
  }

  setHyperNeon(enabled) {
    this.isHyperNeon = enabled;
    this.materialCache.clear();
  }

  getStyle(value) {
    if (TILE_STYLES[value]) {
      return TILE_STYLES[value];
    }
    return {
      bg: '#1e293b',
      text: '#38bdf8',
      emissive: '#0ea5e9',
      intensity: 0.95,
      rim: '#7dd3fc'
    };
  }

  // Create high-res 512x512 CanvasTexture for cubes with luxury glass/metal finish
  createCanvasTexture(value, isBomb = false, bombCountdown = 0) {
    const cacheKey = `${value}_${isBomb}_${bombCountdown}_${this.isHyperNeon}`;
    if (this.textureCache.has(cacheKey)) {
      return this.textureCache.get(cacheKey);
    }

    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    const style = this.getStyle(value);

    // 1. Rich multi-stop gradient background
    const grad = ctx.createLinearGradient(0, 0, size, size);
    if (isBomb) {
      grad.addColorStop(0, '#ff4757');
      grad.addColorStop(0.5, '#b31217');
      grad.addColorStop(1, '#530a0d');
    } else if (this.isHyperNeon) {
      grad.addColorStop(0, this.adjustBrightness(style.bg, 35));
      grad.addColorStop(0.5, style.bg);
      grad.addColorStop(1, this.adjustBrightness(style.bg, -30));
    } else {
      grad.addColorStop(0, this.adjustBrightness(style.bg, 25));
      grad.addColorStop(0.5, style.bg);
      grad.addColorStop(1, this.adjustBrightness(style.bg, -25));
    }

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    // 2. Glossy curved specular highlight (lacquer/glass sheen)
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(size / 2, 75, size * 0.42, 75, 0, 0, Math.PI * 2);
    const sheenGrad = ctx.createLinearGradient(0, 0, 0, 150);
    sheenGrad.addColorStop(0, 'rgba(255, 255, 255, 0.40)');
    sheenGrad.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
    ctx.fillStyle = sheenGrad;
    ctx.fill();
    ctx.restore();

    // 3. Soft rounded inset border highlight matching tile bevel
    ctx.strokeStyle = isBomb ? 'rgba(255, 250, 100, 0.45)' : 'rgba(255, 255, 255, 0.26)';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.roundRect(24, 24, size - 48, size - 48, 56);
    ctx.stroke();

    // 4. Large crisp typography with bold 3D depth
    ctx.fillStyle = isBomb ? '#ffffff' : style.text;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const str = String(value);
    let fontSize = 210;
    if (str.length === 3) fontSize = 165;
    else if (str.length === 4) fontSize = 125;
    else if (str.length >= 5) fontSize = 95;

    ctx.font = `900 ${fontSize}px "Montserrat", "Inter", "Segoe UI", sans-serif`;
    
    // Ambient drop shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 10;
    ctx.fillText(str, size / 2, size / 2 + (isBomb ? -26 : 6));

    // Crisp foreground text overlay
    ctx.shadowColor = 'transparent';
    ctx.fillText(str, size / 2, size / 2 + (isBomb ? -26 : 6));

    // If bomb, draw bomb countdown indicator
    if (isBomb) {
      ctx.fillStyle = '#fffa65';
      ctx.font = '900 78px "Montserrat", sans-serif';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 10;
      ctx.fillText(`💣 ${bombCountdown}s`, size / 2, size / 2 + 130);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.anisotropy = 4;
    texture.needsUpdate = true;

    this.textureCache.set(cacheKey, texture);
    return texture;
  }

  // Create circular billboard sprite texture for Spheres & Octahedrons
  createSpriteTexture(value, isBomb = false, bombCountdown = 0) {
    const cacheKey = `sprite_${value}_${isBomb}_${bombCountdown}`;
    if (this.spriteTextureCache.has(cacheKey)) {
      return this.spriteTextureCache.get(cacheKey);
    }

    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    const style = this.getStyle(value);

    // Clear transparent background
    ctx.clearRect(0, 0, size, size);

    // Outer glowing neon ring
    ctx.save();
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, 224, 0, Math.PI * 2);
    ctx.strokeStyle = isBomb ? '#ff3838' : (style.emissive || style.bg);
    ctx.lineWidth = 18;
    ctx.shadowColor = isBomb ? '#ff3838' : (style.emissive || style.bg);
    ctx.shadowBlur = 25;
    ctx.stroke();

    // Dark cosmic glass core disc
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, 214, 0, Math.PI * 2);
    ctx.fillStyle = isBomb ? 'rgba(180, 20, 20, 0.92)' : 'rgba(10, 16, 28, 0.90)';
    ctx.fill();

    // Inner gold/cyan accent rim
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, 195, 0, Math.PI * 2);
    ctx.strokeStyle = isBomb ? '#fffa65' : 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Number text
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const str = String(value);
    let fontSize = 185;
    if (str.length === 3) fontSize = 145;
    else if (str.length === 4) fontSize = 110;
    else if (str.length >= 5) fontSize = 85;

    ctx.font = `900 ${fontSize}px "Montserrat", "Inter", "Segoe UI", sans-serif`;
    ctx.shadowColor = 'rgba(0,0,0,0.85)';
    ctx.shadowBlur = 14;
    ctx.fillText(str, size / 2, size / 2 + (isBomb ? -26 : 5));

    if (isBomb) {
      ctx.fillStyle = '#fffa65';
      ctx.font = '900 68px "Montserrat", sans-serif';
      ctx.fillText(`💣 ${bombCountdown}`, size / 2, size / 2 + 110);
    }
    ctx.restore();

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;

    this.spriteTextureCache.set(cacheKey, texture);
    return texture;
  }

  adjustBrightness(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, Math.min(255, (num >> 16) + amt));
    const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amt));
    const B = Math.max(0, Math.min(255, (num & 0x0000ff) + amt));
    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
  }

  getTileMaterials(value, isBomb = false, bombCountdown = 0) {
    const matKey = `mat_${value}_${isBomb}_${bombCountdown}_${this.isHyperNeon}`;
    if (this.materialCache.has(matKey)) {
      return this.materialCache.get(matKey);
    }

    const style = this.getStyle(value);
    const texture = this.createCanvasTexture(value, isBomb, bombCountdown);

    const emissiveColor = new THREE.Color(isBomb ? 0xff2222 : style.emissive);
    const multiplier = this.isHyperNeon ? 1.5 : 1.0;
    const emissiveIntensity = (isBomb ? 0.7 : style.intensity) * multiplier;

    // High-performance glossy standard material (ultra-fast 60+ FPS on all GPUs)
    const faceMatWithText = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.18,
      metalness: 0.22,
      emissive: emissiveColor,
      emissiveIntensity: emissiveIntensity
    });

    const solidSideMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(isBomb ? 0xcc1111 : style.bg),
      roughness: 0.18,
      metalness: 0.22,
      emissive: emissiveColor,
      emissiveIntensity: emissiveIntensity * 0.35
    });

    // ONLY the top face (+Y, index 2) has the number!
    // All 4 vertical lateral faces (+X, -X, +Z, -Z) and bottom (-Y) are solid, smooth, and clean.
    const materials = [
      solidSideMat,    // +X (Right vertical face)
      solidSideMat,    // -X (Left vertical face)
      faceMatWithText, // +Y (Top face - ONLY top has number!)
      solidSideMat,    // -Y (Bottom face)
      solidSideMat,    // +Z (Front vertical face)
      solidSideMat     // -Z (Back vertical face)
    ];

    this.materialCache.set(matKey, materials);
    return materials;
  }

  getOctahedronMaterial(value, isBomb = false) {
    const key = `octa_${value}_${isBomb}_${this.isHyperNeon}`;
    if (this.materialCache.has(key)) return this.materialCache.get(key);

    const style = this.getStyle(value);
    const color = new THREE.Color(isBomb ? 0xff3838 : style.bg);
    const emissive = new THREE.Color(isBomb ? 0xff1111 : style.emissive);
    
    // High-performance crystal standard material (fast 60+ FPS on all GPUs)
    const mat = new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.12,
      metalness: 0.25,
      transparent: true,
      opacity: 0.92,
      emissive: emissive,
      emissiveIntensity: isBomb ? 0.75 : (this.isHyperNeon ? 0.9 : 0.45)
    });
    this.materialCache.set(key, mat);
    return mat;
  }

  getOctahedronCoreMaterial(value, isBomb = false) {
    const key = `octa_core_${value}_${isBomb}_${this.isHyperNeon}`;
    if (this.materialCache.has(key)) return this.materialCache.get(key);

    const style = this.getStyle(value);
    const emissive = new THREE.Color(isBomb ? 0xff2222 : style.emissive);
    const mat = new THREE.MeshStandardMaterial({
      color: emissive,
      emissive: emissive,
      emissiveIntensity: 1.2,
      roughness: 0.1,
      metalness: 0.8
    });
    this.materialCache.set(key, mat);
    return mat;
  }

  getOctahedronLineMaterial(isBomb = false) {
    const key = `octa_lines_${isBomb}_${this.isHyperNeon}`;
    if (this.materialCache.has(key)) return this.materialCache.get(key);

    const lineMat = new THREE.LineBasicMaterial({
      color: isBomb ? 0xffff00 : 0xffffff,
      linewidth: 2,
      transparent: true,
      opacity: 0.85
    });
    this.materialCache.set(key, lineMat);
    return lineMat;
  }

  getSphereMaterial(value, isBomb = false) {
    const key = `sphere_${value}_${isBomb}_${this.isHyperNeon}`;
    if (this.materialCache.has(key)) return this.materialCache.get(key);

    const style = this.getStyle(value);
    const color = new THREE.Color(isBomb ? 0xff3838 : style.bg);
    const emissive = new THREE.Color(isBomb ? 0xff1111 : style.emissive);
    const mat = new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.14,
      metalness: 0.35,
      emissive: emissive,
      emissiveIntensity: isBomb ? 0.9 : (this.isHyperNeon ? 0.95 : 0.55)
    });
    this.materialCache.set(key, mat);
    return mat;
  }

  getTorusMaterial(value, isBomb = false) {
    const key = `torus_${value}_${isBomb}_${this.isHyperNeon}`;
    if (this.materialCache.has(key)) return this.materialCache.get(key);

    const style = this.getStyle(value);
    const torusMat = new THREE.MeshStandardMaterial({
      color: isBomb ? 0xfffa65 : new THREE.Color(style.rim || '#ffffff'),
      emissive: isBomb ? 0xff1111 : new THREE.Color(style.emissive),
      emissiveIntensity: 0.85,
      roughness: 0.1,
      metalness: 0.88
    });
    this.materialCache.set(key, torusMat);
    return torusMat;
  }

  getBillboardMaterial(value, isBomb = false, bombCountdown = 0) {
    const key = `billboard_${value}_${isBomb}_${bombCountdown}_${this.isHyperNeon}`;
    if (this.materialCache.has(key)) return this.materialCache.get(key);

    const spriteTex = this.createSpriteTexture(value, isBomb, bombCountdown);
    const spriteMat = new THREE.SpriteMaterial({
      map: spriteTex,
      transparent: true,
      depthTest: false,
      depthWrite: false
    });
    this.materialCache.set(key, spriteMat);
    return spriteMat;
  }

  getBombRingMaterial() {
    const key = 'bomb_ring_mat';
    if (this.materialCache.has(key)) return this.materialCache.get(key);

    const bombMat = new THREE.MeshBasicMaterial({
      color: 0xff3838,
      transparent: true,
      opacity: 0.9
    });
    this.materialCache.set(key, bombMat);
    return bombMat;
  }
}

export const textureManager = new TextureManager();
