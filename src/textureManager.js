import * as THREE from 'three';

// 1. Cyberpunk / Legacy Theme Palette
const TILE_STYLES = {
  2:     { bg: '#2563eb', text: '#ffffff', emissive: '#3b82f6', intensity: 0.38, rim: '#93c5fd' },  // Vibrant Royal Azure
  4:     { bg: '#0891b2', text: '#ffffff', emissive: '#06b6d4', intensity: 0.42, rim: '#67e8f9' },  // Electric Cyan Teal
  8:     { bg: '#059669', text: '#ffffff', emissive: '#10b981', intensity: 0.48, rim: '#6ee7b7' },  // Emerald Jade
  16:    { bg: '#d97706', text: '#ffffff', emissive: '#f59e0b', intensity: 0.52, rim: '#fde68a' },  // Warm Amber Gold
  32:    { bg: '#ea580c', text: '#ffffff', emissive: '#f97316', intensity: 0.58, rim: '#fed7aa' },  // Sunset Tangerine
  64:    { bg: '#e11d48', text: '#ffffff', emissive: '#f43f5e', intensity: 0.65, rim: '#fecdd3' },  // Crimson Coral
  128:   { bg: '#c026d3', text: '#ffffff', emissive: '#d946ef', intensity: 0.72, rim: '#f5d0fe' },  // Neon Fuchsia
  256:   { bg: '#7c3aed', text: '#ffffff', emissive: '#8b5cf6', intensity: 0.78, rim: '#ddd6fe' },  // Royal Amethyst
  512:   { bg: '#4f46e5', text: '#ffffff', emissive: '#6366f1', intensity: 0.85, rim: '#c7d2fe' },  // Astral Indigo
  1024:  { bg: '#0284c7', text: '#ffffff', emissive: '#00f0ff', intensity: 0.95, rim: '#e0f2fe' },  // Hyper Diamond Cyan
  2048:  { bg: '#b45309', text: '#ffffff', emissive: '#ffd700', intensity: 1.15, rim: '#fffbeb' },  // Imperial Gold Singularity
  4096:  { bg: '#9333ea', text: '#ffffff', emissive: '#c084fc', intensity: 1.25, rim: '#f3e8ff' },  // Cosmic Plasma Orchid
  8192:  { bg: '#059669', text: '#ffffff', emissive: '#34d399', intensity: 1.35, rim: '#d1fae5' },  // Celestial Jade Aurora
  16384: { bg: '#e11d48', text: '#ffffff', emissive: '#fb7185', intensity: 1.45, rim: '#ffe4e6' }   // Supernova Magenta
};

// 2. [HƯỚNG A] Zen Ceramic & Studio Palette (Bắc Âu / Warm Clay & Porcelain Pastel)
const TILE_STYLES_ZEN = {
  2:     { bg: '#eee4da', text: '#433c38', emissive: '#000000', intensity: 0, rim: '#ffffff' }, // Sand Porcelain
  4:     { bg: '#ede0c8', text: '#433c38', emissive: '#000000', intensity: 0, rim: '#ffffff' }, // Warm Oatmeal
  8:     { bg: '#f2b179', text: '#ffffff', emissive: '#000000', intensity: 0, rim: '#ffffff' }, // Coral Terracotta
  16:    { bg: '#f59563', text: '#ffffff', emissive: '#000000', intensity: 0, rim: '#ffffff' }, // Rich Clay
  32:    { bg: '#f67c5f', text: '#ffffff', emissive: '#000000', intensity: 0, rim: '#ffffff' }, // Sunset Tangerine
  64:    { bg: '#f65e3b', text: '#ffffff', emissive: '#000000', intensity: 0, rim: '#ffffff' }, // Burnt Sienna
  128:   { bg: '#edcf72', text: '#ffffff', emissive: '#000000', intensity: 0, rim: '#ffffff' }, // Mellow Saffron
  256:   { bg: '#edcc61', text: '#ffffff', emissive: '#000000', intensity: 0, rim: '#ffffff' }, // Warm Ochre
  512:   { bg: '#edc850', text: '#ffffff', emissive: '#000000', intensity: 0, rim: '#ffffff' }, // Amber Honey
  1024:  { bg: '#edc53f', text: '#ffffff', emissive: '#000000', intensity: 0, rim: '#ffffff' }, // Nordic Brass
  2048:  { bg: '#e5b722', text: '#ffffff', emissive: '#000000', intensity: 0, rim: '#ffffff' }, // Master 24K Ceramic
  4096:  { bg: '#60a5fa', text: '#ffffff', emissive: '#000000', intensity: 0, rim: '#ffffff' }, // Sky Glaze
  8192:  { bg: '#34d399', text: '#ffffff', emissive: '#000000', intensity: 0, rim: '#ffffff' }  // Sage Porcelain
};

// 3. [HƯỚNG B] Modern Slate & Charcoal Palette (Apple / Linear Dark Mode)
const TILE_STYLES_SLATE = {
  2:     { bg: '#1c2230', text: '#94a3b8', emissive: '#000000', intensity: 0, rim: '#334155' }, // Deep Slate
  4:     { bg: '#232b3d', text: '#f1f5f9', emissive: '#000000', intensity: 0, rim: '#475569' }, // Matte Steel
  8:     { bg: '#1e3a5f', text: '#f8fafc', emissive: '#000000', intensity: 0, rim: '#38bdf8' }, // Ocean Abyss
  16:    { bg: '#134e4a', text: '#f8fafc', emissive: '#000000', intensity: 0, rim: '#2dd4bf' }, // Deep Emerald
  32:    { bg: '#78350f', text: '#f8fafc', emissive: '#000000', intensity: 0, rim: '#f59e0b' }, // Dark Amber
  64:    { bg: '#7c2d12', text: '#f8fafc', emissive: '#000000', intensity: 0, rim: '#f97316' }, // Dark Bronze
  128:   { bg: '#7f1d1d', text: '#f8fafc', emissive: '#000000', intensity: 0, rim: '#ef4444' }, // Deep Crimson
  256:   { bg: '#701a75', text: '#f8fafc', emissive: '#000000', intensity: 0, rim: '#d946ef' }, // Plum Obsidian
  512:   { bg: '#4c1d95', text: '#f8fafc', emissive: '#000000', intensity: 0, rim: '#8b5cf6' }, // Royal Amethyst
  1024:  { bg: '#1e3a8a', text: '#f8fafc', emissive: '#000000', intensity: 0, rim: '#3b82f6' }, // Midnight Sapphire
  2048:  { bg: '#a16207', text: '#ffffff', emissive: '#000000', intensity: 0, rim: '#fbbf24' }, // Titanium Gold
  4096:  { bg: '#0f766e', text: '#ffffff', emissive: '#000000', intensity: 0, rim: '#14b8a6' },
  8192:  { bg: '#15803d', text: '#ffffff', emissive: '#000000', intensity: 0, rim: '#22c55e' }
};

export class TextureManager {
  constructor() {
    this.textureCache = new Map();
    this.materialCache = new Map();
    this.spriteTextureCache = new Map();
    this.isHyperNeon = false;
    this.currentTheme = 'galaxy';
  }

  setTheme(theme) {
    if (this.currentTheme === theme) return;
    this.currentTheme = theme;
    this.disposeAll();
  }

  setHyperNeon(enabled) {
    if (this.isHyperNeon === enabled) return;
    this.isHyperNeon = enabled;
    this.disposeAll();
  }

  disposeAll() {
    this.materialCache.forEach(mat => {
      if (Array.isArray(mat)) {
        mat.forEach(m => m && m.dispose && m.dispose());
      } else if (mat && mat.dispose) {
        mat.dispose();
      }
    });
    this.materialCache.clear();

    this.textureCache.forEach(tex => {
      if (tex && tex.dispose) tex.dispose();
    });
    this.textureCache.clear();

    this.spriteTextureCache.forEach(tex => {
      if (tex && tex.dispose) tex.dispose();
    });
    this.spriteTextureCache.clear();
  }

  getStyle(value) {
    if (this.currentTheme === 'zen_clay') {
      return TILE_STYLES_ZEN[value] || { bg: '#e2dad0', text: '#ffffff', emissive: '#000000', intensity: 0, rim: '#ffffff' };
    }
    if (this.currentTheme === 'modern_slate') {
      return TILE_STYLES_SLATE[value] || { bg: '#0f172a', text: '#ffffff', emissive: '#000000', intensity: 0, rim: '#38bdf8' };
    }
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

  // Create high-res 512x512 CanvasTexture for cubes
  createCanvasTexture(value, isBomb = false, bombCountdown = 0) {
    const isZen = this.currentTheme === 'zen_clay';
    const isSlate = this.currentTheme === 'modern_slate';
    const isMinimalist = isZen || isSlate;

    const cacheKey = `${this.currentTheme}_${value}_${isBomb}_${bombCountdown}_${this.isHyperNeon}`;
    if (this.textureCache.has(cacheKey)) {
      return this.textureCache.get(cacheKey);
    }

    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    const style = this.getStyle(value);

    if (isMinimalist) {
      // ===== PURE MINIMALIST TEXTURE (NO GRID, NO NEON, CLEAN SATIN FINISH) =====
      const grad = ctx.createLinearGradient(0, 0, size, size);
      if (isBomb) {
        grad.addColorStop(0, '#ef4444');
        grad.addColorStop(1, '#991b1b');
      } else if (isZen) {
        grad.addColorStop(0, this.adjustBrightness(style.bg, 6));
        grad.addColorStop(0.5, style.bg);
        grad.addColorStop(1, this.adjustBrightness(style.bg, -6));
      } else {
        grad.addColorStop(0, this.adjustBrightness(style.bg, 10));
        grad.addColorStop(0.5, style.bg);
        grad.addColorStop(1, this.adjustBrightness(style.bg, -10));
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);

      // Subtle chamfer bevel highlight around edges (tactile tile feeling)
      ctx.strokeStyle = isZen ? 'rgba(255, 255, 255, 0.45)' : 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 6;
      ctx.strokeRect(12, 12, size - 24, size - 24);

      // Clean typography
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const str = String(value);
      let fontSize = 210;
      if (str.length === 3) fontSize = 160;
      else if (str.length === 4) fontSize = 120;
      else if (str.length >= 5) fontSize = 90;

      ctx.font = `800 ${fontSize}px -apple-system, BlinkMacSystemFont, "SF Pro Display", "Plus Jakarta Sans", "Inter", sans-serif`;

      // Soft natural ambient shadow for legibility
      ctx.shadowColor = isZen ? 'rgba(0, 0, 0, 0.1)' : 'rgba(0, 0, 0, 0.6)';
      ctx.shadowBlur = isZen ? 6 : 10;
      ctx.shadowOffsetY = isZen ? 3 : 5;
      ctx.fillStyle = isBomb ? '#ffffff' : style.text;
      ctx.fillText(str, size / 2, size / 2 + (isBomb ? -26 : 6));

      if (isBomb) {
        ctx.fillStyle = '#fef08a';
        ctx.font = '800 72px sans-serif';
        ctx.fillText(`💣 ${bombCountdown}s`, size / 2, size / 2 + 130);
      }
    } else {
      // ===== CYBERPUNK / LEGACY TEXTURE WITH GRID & NEON GLOW =====
      const grad = ctx.createLinearGradient(0, 0, size, size);
      if (isBomb) {
        grad.addColorStop(0, '#ff4757');
        grad.addColorStop(0.5, '#b31217');
        grad.addColorStop(1, '#3b0609');
      } else if (this.isHyperNeon) {
        grad.addColorStop(0, this.adjustBrightness(style.bg, 40));
        grad.addColorStop(0.48, style.bg);
        grad.addColorStop(1, this.adjustBrightness(style.bg, -35));
      } else {
        grad.addColorStop(0, this.adjustBrightness(style.bg, 32));
        grad.addColorStop(0.45, style.bg);
        grad.addColorStop(1, this.adjustBrightness(style.bg, -30));
      }

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);

      // Luminous inner vignette
      const centerRadial = ctx.createRadialGradient(size / 2, size / 2 - 15, 20, size / 2, size / 2, size * 0.48);
      centerRadial.addColorStop(0, 'rgba(255, 255, 255, 0.24)');
      centerRadial.addColorStop(0.65, 'rgba(255, 255, 255, 0.05)');
      centerRadial.addColorStop(1, 'rgba(0, 0, 0, 0.28)');
      ctx.fillStyle = centerRadial;
      ctx.fillRect(0, 0, size, size);

      // Micro geometric grid sheen
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      for (let i = 48; i < size; i += 48) {
        ctx.beginPath();
        ctx.moveTo(i, 24);
        ctx.lineTo(i, size - 24);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(24, i);
        ctx.lineTo(size - 24, i);
        ctx.stroke();
      }

      // Specular highlight
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(size / 2, 70, size * 0.42, 65, 0, 0, Math.PI * 2);
      const sheenGrad = ctx.createLinearGradient(0, 0, 0, 140);
      sheenGrad.addColorStop(0, 'rgba(255, 255, 255, 0.46)');
      sheenGrad.addColorStop(0.7, 'rgba(255, 255, 255, 0.12)');
      sheenGrad.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
      ctx.fillStyle = sheenGrad;
      ctx.fill();
      ctx.restore();

      // Chamfer border
      ctx.save();
      ctx.strokeStyle = isBomb ? 'rgba(255, 71, 87, 0.9)' : (style.rim || '#ffffff');
      ctx.lineWidth = 8;
      ctx.shadowColor = isBomb ? '#ff3838' : (style.emissive || style.bg);
      ctx.shadowBlur = 12;
      ctx.strokeRect(18, 18, size - 36, size - 36);
      ctx.restore();

      // Number text
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const str = String(value);
      let fontSize = 210;
      if (str.length === 3) fontSize = 160;
      else if (str.length === 4) fontSize = 120;
      else if (str.length >= 5) fontSize = 90;

      ctx.font = `900 ${fontSize}px "Outfit", "Montserrat", "Inter", -apple-system, sans-serif`;

      ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
      ctx.shadowBlur = 18;
      ctx.shadowOffsetY = 8;
      ctx.fillText(str, size / 2, size / 2 + (isBomb ? -26 : 6));

      ctx.shadowColor = isBomb ? '#ff3838' : (style.emissive || style.bg);
      ctx.shadowBlur = 14;
      ctx.shadowOffsetY = 0;
      ctx.fillText(str, size / 2, size / 2 + (isBomb ? -26 : 6));

      ctx.shadowColor = 'transparent';
      ctx.fillStyle = isBomb ? '#ffffff' : style.text;
      ctx.fillText(str, size / 2, size / 2 + (isBomb ? -26 : 6));

      if (isBomb) {
        ctx.fillStyle = '#fffa65';
        ctx.font = '900 78px "Montserrat", sans-serif';
        ctx.fillText(`💣 ${bombCountdown}s`, size / 2, size / 2 + 130);
      }
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

  // Create circular billboard sprite texture for Spheres, Octahedrons & Complex 3D Models
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

    // Ethereal translucent glass lens backing (smooth falloff so 3D crystal shines through)
    const radGrad = ctx.createRadialGradient(size / 2, size / 2, 20, size / 2, size / 2, 230);
    radGrad.addColorStop(0, isBomb ? 'rgba(180, 20, 20, 0.85)' : 'rgba(10, 16, 28, 0.72)');
    radGrad.addColorStop(0.75, isBomb ? 'rgba(120, 10, 10, 0.45)' : 'rgba(10, 16, 28, 0.35)');
    radGrad.addColorStop(1, 'rgba(10, 16, 28, 0.0)');
    ctx.fillStyle = radGrad;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, 230, 0, Math.PI * 2);
    ctx.fill();

    // Outer glowing holographic neon ring
    ctx.save();
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, 218, 0, Math.PI * 2);
    ctx.strokeStyle = isBomb ? '#ff3838' : (style.emissive || style.bg);
    ctx.lineWidth = 14;
    ctx.shadowColor = isBomb ? '#ff3838' : (style.emissive || style.bg);
    ctx.shadowBlur = 24;
    ctx.stroke();

    // Inner subtle gold/cyan accent rim
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, 198, 0, Math.PI * 2);
    ctx.strokeStyle = isBomb ? '#fffa65' : 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 3;
    ctx.shadowColor = 'transparent';
    ctx.stroke();

    // Cardinal Micro Ticks
    ctx.fillStyle = isBomb ? '#fffa65' : (style.rim || '#ffffff');
    const tickAngles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
    tickAngles.forEach(angle => {
      const tx = size / 2 + Math.cos(angle) * 208;
      const ty = size / 2 + Math.sin(angle) * 208;
      ctx.beginPath();
      ctx.arc(tx, ty, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // Number text
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const str = String(value);
    let fontSize = 185;
    if (str.length === 3) fontSize = 145;
    else if (str.length === 4) fontSize = 110;
    else if (str.length >= 5) fontSize = 85;

    ctx.font = `900 ${fontSize}px "Outfit", "Montserrat", "Inter", -apple-system, sans-serif`;
    
    // Deep ambient shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.88)';
    ctx.shadowBlur = 16;
    ctx.shadowOffsetY = 6;
    ctx.fillText(str, size / 2, size / 2 + (isBomb ? -26 : 5));

    // Luminous halo
    ctx.shadowColor = isBomb ? '#ff3838' : (style.emissive || style.bg);
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 0;
    ctx.fillText(str, size / 2, size / 2 + (isBomb ? -26 : 5));

    // Foreground text
    ctx.shadowColor = 'transparent';
    ctx.fillStyle = value === 2048 ? '#fef08a' : '#ffffff';
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
    const matKey = `mat_${this.currentTheme}_${value}_${isBomb}_${bombCountdown}_${this.isHyperNeon}`;
    if (this.materialCache.has(matKey)) {
      return this.materialCache.get(matKey);
    }

    const isZen = this.currentTheme === 'zen_clay';
    const isSlate = this.currentTheme === 'modern_slate';
    const isMinimalist = isZen || isSlate;

    const style = this.getStyle(value);
    const texture = this.createCanvasTexture(value, isBomb, bombCountdown);

    const emissiveColor = new THREE.Color(isBomb ? 0xff2222 : (isMinimalist ? 0x000000 : style.emissive));
    const multiplier = this.isHyperNeon ? 1.5 : 1.0;
    const emissiveIntensity = isMinimalist ? 0 : ((isBomb ? 0.7 : style.intensity) * multiplier);

    const roughness = isZen ? 0.65 : (isSlate ? 0.45 : 0.18);
    const metalness = isZen ? 0.04 : (isSlate ? 0.15 : 0.22);

    // High-performance tactile standard material
    const faceMatWithText = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: roughness,
      metalness: metalness,
      emissive: emissiveColor,
      emissiveIntensity: emissiveIntensity
    });

    const solidSideMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(isBomb ? 0xcc1111 : style.bg),
      roughness: roughness,
      metalness: metalness,
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
