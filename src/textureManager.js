import * as THREE from 'three';

// 1. Cyberpunk / Legacy Theme Palette
const TILE_STYLES = {
  2:     { bg: '#4d94ff', text: '#ffffff', emissive: '#70b5ff', intensity: 0.68, rim: '#dbeafe' },  // Radiant Electric Sky Cobalt (+15% brighter)
  4:     { bg: '#00d4ff', text: '#ffffff', emissive: '#38e1ff', intensity: 0.85, rim: '#e0f7fa' },  // Sparkling Aqua Cyan / Electric Turquoise
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

// 2. [HƯỚNG SÁNG] Gentle Light (Hiền Hòa Sáng / Harmonious Classic Warm Silk Palette)
// Tông màu dịu mắt, chuyển tiếp tự nhiên, không chói lóa, số hiển thị sắc nét rõ ràng
const TILE_STYLES_GENTLE_LIGHT = {
  2:     { bg: '#f8f5ee', text: '#5c5248', emissive: '#f8f5ee', intensity: 0, rim: '#ffffff' }, // Delicate Silk Cream
  4:     { bg: '#e8c79b', text: '#451a03', emissive: '#e8c79b', intensity: 0, rim: '#fff6e9' }, // Warm Caramel Sand (Distinct from 2)
  8:     { bg: '#f2b179', text: '#ffffff', emissive: '#f2b179', intensity: 0, rim: '#fff1e5' }, // Soft Apricot
  16:    { bg: '#f59563', text: '#ffffff', emissive: '#f59563', intensity: 0, rim: '#ffede5' }, // Warm Coral
  32:    { bg: '#f67c5f', text: '#ffffff', emissive: '#f67c5f', intensity: 0, rim: '#ffe8e0' }, // Soft Terracotta
  64:    { bg: '#ea580c', text: '#ffffff', emissive: '#ea580c', intensity: 0, rim: '#ffedd5' }, // Rich Amber Clay
  128:   { bg: '#edcf72', text: '#451a03', emissive: '#edcf72', intensity: 0, rim: '#fffde8' }, // Gentle Sunlight (High-contrast dark text)
  256:   { bg: '#edcc61', text: '#451a03', emissive: '#edcc61', intensity: 0, rim: '#fffde8' }, // Warm Honey Gold
  512:   { bg: '#edc850', text: '#451a03', emissive: '#edc850', intensity: 0, rim: '#fffde8' }, // Pure Gold
  1024:  { bg: '#edc53f', text: '#ffffff', emissive: '#edc53f', intensity: 0, rim: '#fffde8' }, // Burnished Crown Gold
  2048:  { bg: '#eab308', text: '#ffffff', emissive: '#facc15', intensity: 0.15, rim: '#fef08a' }, // Classic 2048 Crown Gold
  4096:  { bg: '#a855f7', text: '#ffffff', emissive: '#a855f7', intensity: 0, rim: '#f3e8ff' }, // Soft Amethyst
  8192:  { bg: '#3b82f6', text: '#ffffff', emissive: '#3b82f6', intensity: 0, rim: '#eff6ff' }, // Soft Cobalt
  16384: { bg: '#10b981', text: '#ffffff', emissive: '#10b981', intensity: 0, rim: '#ecfdf5' }  // Soft Sage
};
const TILE_STYLES_ZEN = TILE_STYLES_GENTLE_LIGHT; // Backwards compatibility alias

// 3. [HƯỚNG TỐI] Gentle Dark (Hiền Hòa Tối / Velvet Night & Vivid Jewel Progression)
const TILE_STYLES_GENTLE_DARK = {
  2:     { bg: '#334155', text: '#f1f5f9', emissive: '#1e293b', intensity: 0.10, rim: '#475569' }, // Slate Navy Foundation
  4:     { bg: '#1e293b', text: '#f8fafc', emissive: '#0f172a', intensity: 0.12, rim: '#334155' }, // Deep Midnight Slate
  8:     { bg: '#c2410c', text: '#fff7ed', emissive: '#ea580c', intensity: 0.22, rim: '#fdba74' }, // Spiced Tangerine
  16:    { bg: '#b45309', text: '#fef3c7', emissive: '#d97706', intensity: 0.25, rim: '#fcd34d' }, // Roasted Flame Amber
  32:    { bg: '#be123c', text: '#ffe4e6', emissive: '#e11d48', intensity: 0.28, rim: '#fda4af' }, // Velvet Ruby Coral
  64:    { bg: '#991b1b', text: '#fef2f2', emissive: '#dc2626', intensity: 0.32, rim: '#fca5a5' }, // Deep Blood Crimson
  128:   { bg: '#a16207', text: '#fefce8', emissive: '#ca8a04', intensity: 0.35, rim: '#fde047' }, // Antique Sun Gold
  256:   { bg: '#0e7490', text: '#ecfeff', emissive: '#06b6d4', intensity: 0.38, rim: '#67e8f9' }, // Ocean Cyan
  512:   { bg: '#047857', text: '#ecfdf5', emissive: '#10b981', intensity: 0.42, rim: '#6ee7b7' }, // Deep Emerald Forest
  1024:  { bg: '#6d28d9', text: '#f5f3ff', emissive: '#8b5cf6', intensity: 0.45, rim: '#c4b5fd' }, // Royal Amethyst
  2048:  { bg: '#d97706', text: '#fffbeb', emissive: '#f59e0b', intensity: 0.52, rim: '#fef08a' }, // Imperial Burnished Gold
  4096:  { bg: '#be185d', text: '#fdf2f8', emissive: '#ec4899', intensity: 0.58, rim: '#f472b6' }, // Velvet Rose
  8192:  { bg: '#1d4ed8', text: '#eff6ff', emissive: '#3b82f6', intensity: 0.62, rim: '#93c5fd' }, // Cobalt Azure
  16384: { bg: '#4338ca', text: '#eef2ff', emissive: '#6366f1', intensity: 0.68, rim: '#a5b4fc' }  // Midnight Indigo
};
const TILE_STYLES_SLATE = TILE_STYLES_GENTLE_DARK; // Backwards compatibility alias

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
    if (this.currentTheme === 'gentle_light' || this.currentTheme === 'zen_clay') {
      return TILE_STYLES_GENTLE_LIGHT[value] || { bg: '#e2dad0', text: '#776e65', emissive: '#000000', intensity: 0, rim: '#ffffff' };
    }
    if (this.currentTheme === 'gentle_dark' || this.currentTheme === 'modern_slate') {
      return TILE_STYLES_GENTLE_DARK[value] || { bg: '#1c1917', text: '#fef3e2', emissive: '#000000', intensity: 0, rim: '#38322c' };
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
  createCanvasTexture(value, isBomb = false, bombCountdown = 0, isWildcard = false) {
    const isWild = !!isWildcard || value === 0;
    const isLight = this.currentTheme === 'gentle_light' || this.currentTheme === 'zen_clay';
    const isDark = this.currentTheme === 'gentle_dark' || this.currentTheme === 'modern_slate';
    const isMinimalist = isLight || isDark;

    const cacheKey = `${this.currentTheme}_${value}_${isBomb}_${bombCountdown}_${isWild}_${this.isHyperNeon}`;
    if (this.textureCache.has(cacheKey)) {
      return this.textureCache.get(cacheKey);
    }

    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    if (isWild) {
      this.drawWildcardFace(ctx, size);
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.generateMipmaps = true;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.anisotropy = 16;
      texture.needsUpdate = true;
      this.textureCache.set(cacheKey, texture);
      return texture;
    }

    const style = this.getStyle(value);

    if (value === 2048 && !isBomb) {
      this.drawGrand2048Face(ctx, size, isMinimalist, isLight);
    } else if (value === 1024 && !isBomb) {
      this.drawGrand1024Face(ctx, size, isMinimalist, isLight);
    } else if (isMinimalist) {
      // ===== PURE MINIMALIST TEXTURE (HIỀN HÒA, NO NEON, TACTILE SATIN FINISH) =====
      const grad = ctx.createLinearGradient(0, 0, size, size);
      if (isBomb) {
        grad.addColorStop(0, '#e05347');
        grad.addColorStop(1, '#991b1b');
      } else if (isLight) {
        grad.addColorStop(0, this.adjustBrightness(style.bg, 4));
        grad.addColorStop(0.5, style.bg);
        grad.addColorStop(1, this.adjustBrightness(style.bg, -5));
      } else {
        grad.addColorStop(0, this.adjustBrightness(style.bg, 6));
        grad.addColorStop(0.5, style.bg);
        grad.addColorStop(1, this.adjustBrightness(style.bg, -8));
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);

      // Subtle chamfer bevel highlight around edges (organic tactile feeling)
      ctx.strokeStyle = isLight ? 'rgba(255, 255, 255, 0.65)' : 'rgba(255, 255, 255, 0.10)';
      ctx.lineWidth = 6;
      ctx.strokeRect(10, 10, size - 20, size - 20);

      // Clean, comforting typography with optimal optical sizing
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const str = String(value);
      let fontSize = 210;
      if (str.length === 3) fontSize = 160;
      else if (str.length === 4) fontSize = 120;
      else if (str.length >= 5) fontSize = 90;

      ctx.font = `800 ${fontSize}px "Clear Sans", -apple-system, BlinkMacSystemFont, "SF Pro Display", "Plus Jakarta Sans", "Inter", sans-serif`;

      // Soft natural ambient shadow for supreme legibility without harsh glare
      if (isLight) {
        if (value <= 4) {
          ctx.shadowColor = 'rgba(255, 255, 255, 0.45)';
          ctx.shadowBlur = 0;
          ctx.shadowOffsetY = 1;
        } else if (value >= 128) {
          // Subtle warm contour behind text to ensure crisp 10/10 legibility
          ctx.save();
          ctx.strokeStyle = 'rgba(90, 50, 0, 0.3)';
          ctx.lineWidth = str.length >= 4 ? 6 : 8;
          ctx.lineJoin = 'round';
          ctx.strokeText(str, size / 2, size / 2 + (isBomb ? -26 : 6));
          ctx.restore();

          ctx.shadowColor = 'rgba(75, 45, 5, 0.45)';
          ctx.shadowBlur = 5;
          ctx.shadowOffsetY = 2;
        } else {
          ctx.shadowColor = 'rgba(0, 0, 0, 0.22)';
          ctx.shadowBlur = 4;
          ctx.shadowOffsetY = 2;
        }
      } else {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 3;
      }

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
    texture.anisotropy = 16;
    texture.needsUpdate = true;

    this.textureCache.set(cacheKey, texture);
    return texture;
  }

  // Create circular billboard sprite texture for Spheres, Octahedrons & Complex 3D Models
  createSpriteTexture(value, isBomb = false, bombCountdown = 0, isWildcard = false) {
    const isWild = !!isWildcard || value === 0;
    const isLight = this.currentTheme === 'gentle_light' || this.currentTheme === 'zen_clay';
    const cacheKey = `sprite_${this.currentTheme}_${value}_${isBomb}_${bombCountdown}_${isWild}`;
    if (this.spriteTextureCache.has(cacheKey)) {
      return this.spriteTextureCache.get(cacheKey);
    }

    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    if (isWild) {
      this.drawWildcardSprite(ctx, size);
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.generateMipmaps = true;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.anisotropy = 16;
      texture.needsUpdate = true;
      this.spriteTextureCache.set(cacheKey, texture);
      return texture;
    }

    const style = this.getStyle(value);

    if (value === 2048 && !isBomb) {
      this.drawGrand2048Sprite(ctx, size, isLight);
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.generateMipmaps = true;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.anisotropy = 16;
      texture.needsUpdate = true;
      this.spriteTextureCache.set(cacheKey, texture);
      return texture;
    } else if (value === 1024 && !isBomb) {
      this.drawGrand1024Sprite(ctx, size, isLight);
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.generateMipmaps = true;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.anisotropy = 16;
      texture.needsUpdate = true;
      this.spriteTextureCache.set(cacheKey, texture);
      return texture;
    }

    // Clear transparent background
    ctx.clearRect(0, 0, size, size);

    // Lens backing with soft falloff matching tile geometry
    const radGrad = ctx.createRadialGradient(size / 2, size / 2, 20, size / 2, size / 2, 230);
    const baseColor = new THREE.Color(style.bg);
    const r = Math.round(baseColor.r * 255);
    const g = Math.round(baseColor.g * 255);
    const b = Math.round(baseColor.b * 255);

    if (isBomb) {
      radGrad.addColorStop(0, 'rgba(220, 38, 38, 0.95)');
      radGrad.addColorStop(0.75, 'rgba(185, 28, 28, 0.55)');
      radGrad.addColorStop(1, 'rgba(185, 28, 28, 0.0)');
    } else if (isLight) {
      // In light mode, lens backing matches tile body tone so white text never blends into a white background
      radGrad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.96)`);
      radGrad.addColorStop(0.75, `rgba(${r}, ${g}, ${b}, 0.82)`);
      radGrad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0.0)`);
    } else {
      radGrad.addColorStop(0, 'rgba(15, 23, 42, 0.72)');
      radGrad.addColorStop(0.75, 'rgba(15, 23, 42, 0.38)');
      radGrad.addColorStop(1, 'rgba(15, 23, 42, 0.0)');
    }
    ctx.fillStyle = radGrad;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, 230, 0, Math.PI * 2);
    ctx.fill();

    // Elegant accent rim
    const ringColor = isBomb ? '#ff3838' : (isLight ? (value <= 4 ? '#d8cebf' : this.adjustBrightness(style.bg, -15)) : (style.emissive && style.emissive !== '#000000' ? style.emissive : style.bg));
    ctx.save();
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, 218, 0, Math.PI * 2);
    ctx.strokeStyle = ringColor;
    ctx.lineWidth = isLight ? 6 : 12;
    ctx.shadowColor = isLight ? 'transparent' : ringColor;
    ctx.shadowBlur = isLight ? 0 : 20;
    ctx.stroke();

    // Inner subtle accent rim
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, 198, 0, Math.PI * 2);
    ctx.strokeStyle = isBomb ? '#fffa65' : (isLight ? 'rgba(255, 255, 255, 0.45)' : 'rgba(255, 255, 255, 0.35)');
    ctx.lineWidth = 2.5;
    ctx.shadowColor = 'transparent';
    ctx.stroke();

    // Cardinal Micro Ticks
    ctx.fillStyle = isBomb ? '#fffa65' : (isLight ? ringColor : (style.rim || '#ffffff'));
    const tickAngles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
    tickAngles.forEach(angle => {
      const tx = size / 2 + Math.cos(angle) * 208;
      const ty = size / 2 + Math.sin(angle) * 208;
      ctx.beginPath();
      ctx.arc(tx, ty, isLight ? 3 : 4, 0, Math.PI * 2);
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
    
    // Ambient drop shadow for high contrast legibility
    if (isLight) {
      if (value <= 4) {
        ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetY = 1;
      } else {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 4;
      }
    } else {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.88)';
      ctx.shadowBlur = 16;
      ctx.shadowOffsetY = 6;
    }
    ctx.fillText(str, size / 2, size / 2 + (isBomb ? -26 : 5));

    // Foreground text
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    if (isBomb) {
      ctx.fillStyle = '#ffffff';
    } else if (isLight) {
      ctx.fillStyle = (value <= 4) ? '#776e65' : '#ffffff';
    } else {
      ctx.fillStyle = style.text || '#ffffff';
    }
    ctx.fillText(str, size / 2, size / 2 + (isBomb ? -26 : 5));

    if (isBomb) {
      ctx.fillStyle = '#fffa65';
      ctx.font = '900 68px "Montserrat", sans-serif';
      ctx.fillText(`💣 ${bombCountdown}`, size / 2, size / 2 + 110);
    }
    ctx.restore();

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.anisotropy = 16;
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

  getTileMaterials(value, isBomb = false, bombCountdown = 0, isWildcard = false) {
    const isWild = !!isWildcard || value === 0;
    const matKey = `mat_${this.currentTheme}_${value}_${isBomb}_${bombCountdown}_${isWild}_${this.isHyperNeon}`;
    if (this.materialCache.has(matKey)) {
      return this.materialCache.get(matKey);
    }

    const isLight = this.currentTheme === 'gentle_light' || this.currentTheme === 'zen_clay';
    const isDark = this.currentTheme === 'gentle_dark' || this.currentTheme === 'modern_slate';
    const isMinimalist = isLight || isDark;

    const style = this.getStyle(value);
    const texture = this.createCanvasTexture(value, isBomb, bombCountdown, isWild);

    const emissiveColor = isWild ? new THREE.Color(0xfbbf24) : new THREE.Color(isBomb ? 0xff2222 : (isMinimalist ? 0x000000 : style.emissive));
    const multiplier = this.isHyperNeon ? 1.5 : 1.0;
    const emissiveIntensity = isWild ? 0.35 : (isMinimalist ? 0 : ((isBomb ? 0.7 : style.intensity) * multiplier));

    const isGrand2048 = value >= 2048 && !isBomb && !isWild;
    const isGrand1024 = value === 1024 && !isBomb && !isWild;

    let roughness = isLight ? 0.55 : (isDark ? 0.48 : 0.18);
    let metalness = isLight ? 0.02 : (isDark ? 0.08 : 0.22);
    let finalEmissiveColor = emissiveColor;
    let finalEmissiveIntensity = emissiveIntensity;

    if (isWild) {
      roughness = 0.15;
      metalness = 0.35;
      finalEmissiveColor = new THREE.Color(0xfbbf24);
      finalEmissiveIntensity = 0.40;
    } else if (isGrand2048) {
      // Sovereign 24K Imperial Mirror Gold
      roughness = 0.10;
      metalness = 0.95;
      finalEmissiveColor = new THREE.Color(0xf59e0b);
      finalEmissiveIntensity = 0.42;
    } else if (isGrand1024) {
      // Platinum Diamond Sovereign
      roughness = 0.14;
      metalness = 0.88;
      finalEmissiveColor = new THREE.Color(0x38bdf8);
      finalEmissiveIntensity = 0.35;
    }

    const sideColor = isWild
      ? 0xff4d94
      : (isBomb 
        ? 0xcc1111 
        : (isGrand2048 ? 0xb45309 : (isGrand1024 ? 0x1e293b : style.bg)));

    // High-performance tactile standard material
    const faceMatWithText = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: roughness,
      metalness: metalness,
      emissive: finalEmissiveColor,
      emissiveIntensity: finalEmissiveIntensity
    });

    const solidSideMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(sideColor),
      roughness: roughness,
      metalness: metalness,
      emissive: finalEmissiveColor,
      emissiveIntensity: finalEmissiveIntensity * 0.45
    });

    // ONLY the top face (+Y, index 2) displays the number and emblem!
    // All side faces (+X, -X, +Z, -Z) and bottom (-Y) use sleek solid materials
    // to keep the 3D isometric look clean, crisp, and prevent duplicate numbers.
    const materials = [
      solidSideMat,    // +X (Right vertical face)
      solidSideMat,    // -X (Left vertical face)
      faceMatWithText, // +Y (Top face - ONLY primary face has number!)
      solidSideMat,    // -Y (Bottom face)
      solidSideMat,    // +Z (Front vertical face - sleek solid accent)
      solidSideMat     // -Z (Back vertical face)
    ];

    this.materialCache.set(matKey, materials);
    return materials;
  }

  getOctahedronMaterial(value, isBomb = false) {
    const key = `octa_${this.currentTheme}_${value}_${isBomb}_${this.isHyperNeon}`;
    if (this.materialCache.has(key)) return this.materialCache.get(key);

    const isLight = this.currentTheme === 'gentle_light' || this.currentTheme === 'zen_clay';
    const style = this.getStyle(value);
    const color = new THREE.Color(isBomb ? 0xff3838 : style.bg);
    const emissiveColor = isBomb 
      ? new THREE.Color(0xff1111) 
      : (style.emissive && style.emissive !== '#000000' ? new THREE.Color(style.emissive) : new THREE.Color(style.bg));
    
    // High-performance crystal standard material (fast 60+ FPS on all GPUs)
    const mat = new THREE.MeshStandardMaterial({
      color: color,
      roughness: isLight ? 0.52 : 0.12,
      metalness: isLight ? 0.04 : 0.25,
      transparent: !isLight,
      opacity: isLight ? 1.0 : 0.92,
      emissive: emissiveColor,
      emissiveIntensity: isBomb ? 0.75 : (isLight ? 0 : (this.isHyperNeon ? 1.1 : (style.intensity ? Math.max(0.68, style.intensity * 1.15) : 0.68)))
    });
    this.materialCache.set(key, mat);
    return mat;
  }

  getOctahedronCoreMaterial(value, isBomb = false) {
    const key = `octa_core_${this.currentTheme}_${value}_${isBomb}_${this.isHyperNeon}`;
    if (this.materialCache.has(key)) return this.materialCache.get(key);

    const isLight = this.currentTheme === 'gentle_light' || this.currentTheme === 'zen_clay';
    const style = this.getStyle(value);
    const emissive = isBomb 
      ? new THREE.Color(0xff2222) 
      : (style.emissive && style.emissive !== '#000000' ? new THREE.Color(style.emissive) : new THREE.Color(style.bg));
    const mat = new THREE.MeshStandardMaterial({
      color: emissive,
      emissive: emissive,
      emissiveIntensity: isBomb ? 0.8 : (isLight ? 0 : (style.intensity ? Math.max(1.3, style.intensity * 1.8) : 1.4)),
      roughness: isLight ? 0.55 : 0.1,
      metalness: isLight ? 0.05 : 0.8
    });
    this.materialCache.set(key, mat);
    return mat;
  }

  getOctahedronLineMaterial(valOrBomb = 2, isBomb = false) {
    const value = typeof valOrBomb === 'number' ? valOrBomb : 2;
    const bomb = typeof valOrBomb === 'boolean' ? valOrBomb : !!isBomb;
    const isLight = this.currentTheme === 'gentle_light' || this.currentTheme === 'zen_clay';
    const key = `octa_lines_${this.currentTheme}_${value}_${bomb}_${this.isHyperNeon}`;
    if (this.materialCache.has(key)) return this.materialCache.get(key);

    const style = this.getStyle(value);
    const lineColor = bomb 
      ? 0xffff00 
      : (isLight ? (style.rim || style.bg) : 0xffffff);

    const lineMat = new THREE.LineBasicMaterial({
      color: new THREE.Color(lineColor),
      linewidth: 1.5,
      transparent: true,
      opacity: isLight ? 0.25 : 0.85
    });
    this.materialCache.set(key, lineMat);
    return lineMat;
  }

  getSphereMaterial(value, isBomb = false) {
    const key = `sphere_${this.currentTheme}_${value}_${isBomb}_${this.isHyperNeon}`;
    if (this.materialCache.has(key)) return this.materialCache.get(key);

    const isLight = this.currentTheme === 'gentle_light' || this.currentTheme === 'zen_clay';
    const style = this.getStyle(value);
    const color = new THREE.Color(isBomb ? 0xff3838 : style.bg);
    const emissive = isBomb 
      ? new THREE.Color(0xff1111) 
      : (style.emissive && style.emissive !== '#000000' ? new THREE.Color(style.emissive) : new THREE.Color(style.bg));
    const mat = new THREE.MeshStandardMaterial({
      color: color,
      roughness: isLight ? 0.50 : 0.14,
      metalness: isLight ? 0.05 : 0.35,
      emissive: emissive,
      emissiveIntensity: isBomb ? 0.9 : (isLight ? 0 : (this.isHyperNeon ? 0.95 : 0.55))
    });
    this.materialCache.set(key, mat);
    return mat;
  }

  getTorusMaterial(value, isBomb = false) {
    const key = `torus_${this.currentTheme}_${value}_${isBomb}_${this.isHyperNeon}`;
    if (this.materialCache.has(key)) return this.materialCache.get(key);

    const isLight = this.currentTheme === 'gentle_light' || this.currentTheme === 'zen_clay';
    const style = this.getStyle(value);
    const emissive = isBomb 
      ? new THREE.Color(0xff1111) 
      : (style.emissive && style.emissive !== '#000000' ? new THREE.Color(style.emissive) : new THREE.Color(style.bg));
    const torusMat = new THREE.MeshStandardMaterial({
      color: isBomb ? 0xfffa65 : new THREE.Color(style.rim || style.bg),
      emissive: emissive,
      emissiveIntensity: isBomb ? 0.8 : (isLight ? 0 : 0.85),
      roughness: isLight ? 0.5 : 0.1,
      metalness: isLight ? 0.05 : 0.88
    });
    this.materialCache.set(key, torusMat);
    return torusMat;
  }

  getBillboardMaterial(value, isBomb = false, bombCountdown = 0, isWildcard = false) {
    const isWild = !!isWildcard || value === 0;
    const key = `billboard_${this.currentTheme}_${value}_${isBomb}_${bombCountdown}_${isWild}_${this.isHyperNeon}`;
    if (this.materialCache.has(key)) return this.materialCache.get(key);

    const spriteTex = this.createSpriteTexture(value, isBomb, bombCountdown, isWild);
    const spriteMat = new THREE.SpriteMaterial({
      map: spriteTex,
      transparent: true,
      depthTest: false,
      depthWrite: false
    });
    this.materialCache.set(key, spriteMat);
    return spriteMat;
  }

  /**
   * Compact, high-contrast floating numeral texture for sculpted 3D shapes
   * (Ring, Knot, Sphere) so the 3D geometry stays visible around the digits.
   */
  createSculptedSpriteTexture(value, isBomb = false, bombCountdown = 0, isWildcard = false) {
    const isWild = !!isWildcard || value === 0;
    const isLight = this.currentTheme === 'gentle_light' || this.currentTheme === 'zen_clay';
    const cacheKey = `sculpt_sprite_${this.currentTheme}_${value}_${isBomb}_${bombCountdown}_${isWild}`;
    if (this.spriteTextureCache.has(cacheKey)) {
      return this.spriteTextureCache.get(cacheKey);
    }

    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, size, size);

    const style = this.getStyle(value);
    const labelStr = isWild ? '★' : String(value);

    // Subtle soft aura scrim strictly behind digits (no opaque circle covering 3D body)
    const rad = ctx.createRadialGradient(256, 256, 18, 256, 256, 175);
    if (isBomb) {
      rad.addColorStop(0, 'rgba(127, 29, 29, 0.72)');
      rad.addColorStop(0.55, 'rgba(127, 29, 29, 0.28)');
      rad.addColorStop(1, 'rgba(127, 29, 29, 0)');
    } else if (isLight) {
      rad.addColorStop(0, 'rgba(255, 255, 255, 0.62)');
      rad.addColorStop(0.58, 'rgba(255, 255, 255, 0.24)');
      rad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    } else {
      rad.addColorStop(0, 'rgba(8, 12, 24, 0.56)');
      rad.addColorStop(0.55, 'rgba(8, 12, 24, 0.22)');
      rad.addColorStop(1, 'rgba(8, 12, 24, 0)');
    }
    ctx.fillStyle = rad;
    ctx.beginPath();
    ctx.arc(256, 256, 175, 0, Math.PI * 2);
    ctx.fill();

    // Small sovereign crest above 1024 / 2048
    if (!isBomb && !isWild && value >= 2048) {
      ctx.save();
      ctx.fillStyle = '#fde047';
      ctx.shadowColor = 'rgba(251, 191, 36, 0.9)';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(212, 134);
      ctx.lineTo(222, 92);
      ctx.lineTo(240, 114);
      ctx.lineTo(256, 82);
      ctx.lineTo(272, 114);
      ctx.lineTo(290, 92);
      ctx.lineTo(300, 134);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    } else if (!isBomb && !isWild && value === 1024) {
      this.drawDiamondStar(ctx, 256, 108, 26, 11, '#ffffff', '#38bdf8');
    }

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    let fontSize = 210;
    if (isWild) fontSize = 230;
    else if (labelStr.length === 2) fontSize = 195;
    else if (labelStr.length === 3) fontSize = 160;
    else if (labelStr.length === 4) fontSize = 126;
    else if (labelStr.length >= 5) fontSize = 98;

    const textY = isBomb ? 228 : (value >= 1024 && !isWild ? 274 : 258);
    ctx.font = `900 ${fontSize}px "Outfit", "Be Vietnam Pro", "Segoe UI", Arial, sans-serif`;

    // Crisp outline halo + shadow so digits never blend with glossy highlights
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;
    ctx.lineWidth = isLight ? 16 : 22;
    ctx.strokeStyle = isLight ? 'rgba(255, 255, 255, 0.92)' : 'rgba(6, 10, 20, 0.92)';
    ctx.shadowColor = isLight ? 'rgba(15, 23, 42, 0.25)' : 'rgba(0, 0, 0, 0.9)';
    ctx.shadowBlur = 14;
    ctx.shadowOffsetY = 4;
    ctx.strokeText(labelStr, 256, textY);

    ctx.shadowColor = (!isLight && value >= 1024) ? (style.emissive || '#fde047') : 'transparent';
    ctx.shadowBlur = (!isLight && value >= 1024) ? 14 : 0;
    ctx.shadowOffsetY = 0;

    if (isWild) {
      const wg = ctx.createLinearGradient(170, 170, 342, 342);
      wg.addColorStop(0, '#f472b6');
      wg.addColorStop(0.5, '#fde047');
      wg.addColorStop(1, '#38bdf8');
      ctx.fillStyle = wg;
    } else if (isBomb) {
      ctx.fillStyle = '#ffffff';
    } else if (isLight) {
      ctx.fillStyle = value <= 4 ? '#44403c' : '#0f172a';
    } else {
      ctx.fillStyle = value >= 2048 ? '#fffbeb' : '#ffffff';
    }
    ctx.fillText(labelStr, 256, textY);

    if (isBomb) {
      ctx.font = '900 72px "Outfit", "Segoe UI", sans-serif';
      ctx.lineWidth = 14;
      ctx.strokeStyle = 'rgba(0,0,0,0.88)';
      ctx.strokeText(`💣 ${bombCountdown}`, 256, 366);
      ctx.fillStyle = '#fef08a';
      ctx.fillText(`💣 ${bombCountdown}`, 256, 366);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.anisotropy = 16;
    texture.needsUpdate = true;
    this.spriteTextureCache.set(cacheKey, texture);
    return texture;
  }

  getSculptedBillboardMaterial(value, isBomb = false, bombCountdown = 0, isWildcard = false) {
    const isWild = !!isWildcard || value === 0;
    const key = `sculpt_billboard_${this.currentTheme}_${value}_${isBomb}_${bombCountdown}_${isWild}_${this.isHyperNeon}`;
    if (this.materialCache.has(key)) return this.materialCache.get(key);

    const spriteTex = this.createSculptedSpriteTexture(value, isBomb, bombCountdown, isWild);
    const spriteMat = new THREE.SpriteMaterial({
      map: spriteTex,
      transparent: true,
      depthTest: false,
      depthWrite: false
    });
    this.materialCache.set(key, spriteMat);
    return spriteMat;
  }

  getSculptedBodyMaterial(value, isBomb = false, isWildcard = false) {
    const isWild = !!isWildcard || value === 0;
    const isLight = this.currentTheme === 'gentle_light' || this.currentTheme === 'zen_clay';
    const key = `sculpt_body_${this.currentTheme}_${value}_${isBomb}_${isWild}_${this.isHyperNeon}`;
    if (this.materialCache.has(key)) return this.materialCache.get(key);

    const style = isWild
      ? { bg: '#ec4899', emissive: '#38bdf8', intensity: 0.9, rim: '#fde047' }
      : this.getStyle(value);
    const baseCol = new THREE.Color(isBomb ? 0xdc2626 : style.bg);
    const emissiveCol = isBomb
      ? new THREE.Color(0xef4444)
      : (style.emissive && style.emissive !== '#000000' ? new THREE.Color(style.emissive) : baseCol);
    const isHighMetallic = !isLight && !isBomb && (value >= 1024 || isWild);

    const mat = new THREE.MeshPhysicalMaterial({
      color: baseCol,
      roughness: isLight ? 0.24 : (isHighMetallic ? 0.08 : 0.12),
      metalness: isLight ? 0.14 : (isHighMetallic ? 0.72 : 0.36),
      clearcoat: 1.0,
      clearcoatRoughness: isLight ? 0.12 : 0.05,
      reflectivity: 1.0,
      emissive: emissiveCol,
      emissiveIntensity: isBomb ? 0.78 : (isLight ? 0.04 : (this.isHyperNeon ? 0.72 : 0.38))
    });
    this.materialCache.set(key, mat);
    return mat;
  }

  getSculptedAccentMaterial(value, isBomb = false, isWildcard = false) {
    const isWild = !!isWildcard || value === 0;
    const isLight = this.currentTheme === 'gentle_light' || this.currentTheme === 'zen_clay';
    const key = `sculpt_accent_${this.currentTheme}_${value}_${isBomb}_${isWild}_${this.isHyperNeon}`;
    if (this.materialCache.has(key)) return this.materialCache.get(key);

    let accentHex = 0xe2e8f0;
    let emissiveHex = 0x94a3b8;
    if (isBomb) {
      accentHex = 0xfef08a;
      emissiveHex = 0xf59e0b;
    } else if (isWild) {
      accentHex = 0xfef08a;
      emissiveHex = 0xec4899;
    } else if (value >= 2048) {
      accentHex = 0xffd700;
      emissiveHex = 0xd97706;
    } else if (value === 1024) {
      accentHex = 0xe0f2fe;
      emissiveHex = 0x38bdf8;
    } else if (isLight) {
      accentHex = 0xfffbeb;
      emissiveHex = 0xd6d3d1;
    } else {
      const style = this.getStyle(value);
      accentHex = new THREE.Color(style.rim || '#f8fafc').getHex();
      emissiveHex = new THREE.Color(style.emissive && style.emissive !== '#000000' ? style.emissive : style.bg).getHex();
    }

    const mat = new THREE.MeshPhysicalMaterial({
      color: accentHex,
      roughness: isLight ? 0.18 : 0.07,
      metalness: isLight ? 0.45 : 0.94,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04,
      reflectivity: 1.0,
      emissive: emissiveHex,
      emissiveIntensity: isBomb ? 0.75 : (isLight ? 0.08 : 0.42)
    });
    this.materialCache.set(key, mat);
    return mat;
  }

  getSculptedNodeMaterial(value, isBomb = false, isWildcard = false) {
    const isWild = !!isWildcard || value === 0;
    const isLight = this.currentTheme === 'gentle_light' || this.currentTheme === 'zen_clay';
    const key = `sculpt_node_${this.currentTheme}_${value}_${isBomb}_${isWild}_${this.isHyperNeon}`;
    if (this.materialCache.has(key)) return this.materialCache.get(key);

    const style = isWild
      ? { bg: '#38bdf8', emissive: '#fde047', rim: '#ffffff' }
      : this.getStyle(value);
    const nodeColor = isBomb
      ? new THREE.Color(0xfef08a)
      : new THREE.Color(value >= 2048 ? 0xfffbeb : (style.rim || '#ffffff'));
    const emissiveColor = isBomb
      ? new THREE.Color(0xff453a)
      : new THREE.Color(style.emissive && style.emissive !== '#000000' ? style.emissive : style.bg);

    const mat = new THREE.MeshPhysicalMaterial({
      color: nodeColor,
      roughness: 0.05,
      metalness: 0.25,
      clearcoat: 1.0,
      emissive: emissiveColor,
      emissiveIntensity: isBomb ? 1.2 : (isLight ? 0.22 : 1.05)
    });
    this.materialCache.set(key, mat);
    return mat;
  }

  getSculptedCrystalMaterial(value, isBomb = false, isWildcard = false, smooth = false) {
    const isWild = !!isWildcard || value === 0;
    const isLight = this.currentTheme === 'gentle_light' || this.currentTheme === 'zen_clay';
    const key = `sculpt_crystal_v2_${this.currentTheme}_${value}_${isBomb}_${isWild}_${this.isHyperNeon}_${smooth}`;
    if (this.materialCache.has(key)) return this.materialCache.get(key);

    const style = isWild
      ? { bg: '#ec4899', emissive: '#38bdf8', intensity: 0.85, rim: '#fde047' }
      : this.getStyle(value);
    const baseCol = new THREE.Color(isBomb ? 0xdc2626 : style.bg);
    const emissiveCol = isBomb
      ? new THREE.Color(0xef4444)
      : (style.emissive && style.emissive !== '#000000' ? new THREE.Color(style.emissive) : baseCol);

    const mat = new THREE.MeshPhysicalMaterial({
      color: baseCol,
      flatShading: !smooth,
      roughness: isLight ? 0.14 : 0.04,
      metalness: isLight ? 0.04 : 0.10,
      clearcoat: 1.0,
      clearcoatRoughness: 0.03,
      reflectivity: 1.0,
      ior: 1.56,
      iridescence: isBomb ? 0.25 : (isLight ? 0.45 : 0.90),
      iridescenceIOR: 1.38,
      iridescenceThicknessRange: [180, 560],
      transparent: true,
      opacity: isBomb ? 0.80 : (isLight ? 0.70 : 0.45),
      depthWrite: isLight,
      emissive: emissiveCol,
      emissiveIntensity: isBomb ? 0.55 : (isLight ? 0.05 : (this.isHyperNeon ? 0.62 : 0.30))
    });
    this.materialCache.set(key, mat);
    return mat;
  }

  getSculptedCrystalCoreMaterial(value, isBomb = false, isWildcard = false) {
    const isWild = !!isWildcard || value === 0;
    const isLight = this.currentTheme === 'gentle_light' || this.currentTheme === 'zen_clay';
    const key = `sculpt_crystal_core_${this.currentTheme}_${value}_${isBomb}_${isWild}_${this.isHyperNeon}`;
    if (this.materialCache.has(key)) return this.materialCache.get(key);

    const style = isWild
      ? { bg: '#ec4899', emissive: '#38bdf8', rim: '#fde047' }
      : this.getStyle(value);
    const coreColor = isBomb
      ? new THREE.Color(0xfef08a)
      : (isLight
        ? new THREE.Color(this.adjustBrightness(style.bg, value <= 4 ? -22 : -14))
        : new THREE.Color(style.emissive && style.emissive !== '#000000' ? style.emissive : style.bg));
    const emissiveColor = isBomb
      ? new THREE.Color(0xff3838)
      : (isLight ? coreColor : new THREE.Color(style.emissive && style.emissive !== '#000000' ? style.emissive : style.bg));

    const mat = new THREE.MeshStandardMaterial({
      color: coreColor,
      flatShading: true,
      roughness: isLight ? 0.22 : 0.06,
      metalness: isLight ? 0.12 : 0.45,
      emissive: emissiveColor,
      emissiveIntensity: isBomb ? 1.25 : (isLight ? 0.18 : (this.isHyperNeon ? 1.65 : 1.25))
    });
    this.materialCache.set(key, mat);
    return mat;
  }

  getSculptedCrystalLineMaterial(value, isBomb = false, isWildcard = false, opacityOverride = null) {
    const isWild = !!isWildcard || value === 0;
    const isLight = this.currentTheme === 'gentle_light' || this.currentTheme === 'zen_clay';
    const key = `sculpt_crystal_line_${this.currentTheme}_${value}_${isBomb}_${isWild}_${this.isHyperNeon}_${opacityOverride}`;
    if (this.materialCache.has(key)) return this.materialCache.get(key);

    const style = isWild
      ? { bg: '#ec4899', emissive: '#38bdf8', rim: '#fdf4ff' }
      : this.getStyle(value);
    const lineColor = isBomb
      ? 0xfef08a
      : (isLight
        ? this.adjustBrightness(style.bg, value <= 4 ? -34 : -26)
        : (value >= 2048 ? 0xfef08a : (style.rim || 0xffffff)));

    const mat = new THREE.LineBasicMaterial({
      color: new THREE.Color(lineColor),
      transparent: true,
      opacity: opacityOverride !== null ? opacityOverride : (isLight ? 0.62 : 0.90)
    });
    this.materialCache.set(key, mat);
    return mat;
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

  getContactShadowMaterial() {
    const key = 'tile_contact_shadow_mat';
    if (this.materialCache.has(key)) return this.materialCache.get(key);

    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(64, 64, 8, 64, 64, 64);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.42)');
    grad.addColorStop(0.45, 'rgba(0, 0, 0, 0.20)');
    grad.addColorStop(0.8, 'rgba(0, 0, 0, 0.05)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);

    const tex = new THREE.CanvasTexture(canvas);
    tex.generateMipmaps = false;
    tex.minFilter = THREE.LinearFilter;
    const mat = new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1
    });
    this.materialCache.set(key, mat);
    return mat;
  }
  // ================= THE ICONIC 1024 & 2048 SOVEREIGN MASTERPIECE DRAWING METHODS =================
  drawDiamondStar(ctx, cx, cy, rOuter, rInner, color1 = '#ffffff', color2 = '#38bdf8') {
    ctx.save();
    // 8-point faceted diamond star
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4 - Math.PI / 2;
      const r = (i % 2 === 0) ? rOuter : rInner;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();

    const starGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, rOuter);
    starGrad.addColorStop(0, color1);
    starGrad.addColorStop(0.55, color2);
    starGrad.addColorStop(1, '#0284c7');
    ctx.fillStyle = starGrad;
    ctx.shadowColor = 'rgba(56, 189, 248, 0.85)';
    ctx.shadowBlur = 14;
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Central brilliant diamond sparkle
    ctx.beginPath();
    ctx.arc(cx, cy, rInner * 0.45, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 8;
    ctx.fill();

    // Horizontal satellite spark dots
    [-rOuter * 1.6, rOuter * 1.6].forEach(dx => {
      ctx.beginPath();
      ctx.arc(cx + dx, cy, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#e0f2fe';
      ctx.fill();
    });

    ctx.restore();
  }

  drawCornerDiamond(ctx, x, y, dSize) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.PI / 4);

    // Outer platinum bezel
    ctx.beginPath();
    ctx.rect(-dSize / 2 - 2, -dSize / 2 - 2, dSize + 4, dSize + 4);
    ctx.fillStyle = '#cbd5e1';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    ctx.shadowBlur = 4;
    ctx.fill();

    // Brilliant Cut Diamond Core
    ctx.beginPath();
    ctx.rect(-dSize / 2, -dSize / 2, dSize, dSize);
    const diaGrad = ctx.createRadialGradient(0, 0, 1, 0, 0, dSize * 0.7);
    diaGrad.addColorStop(0, '#ffffff');
    diaGrad.addColorStop(0.35, '#e0f2fe');
    diaGrad.addColorStop(0.8, '#38bdf8');
    diaGrad.addColorStop(1, '#0284c7');
    ctx.fillStyle = diaGrad;
    ctx.shadowColor = 'transparent';
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Specular lens sparkle
    ctx.beginPath();
    ctx.arc(-dSize * 0.22, -dSize * 0.22, dSize * 0.16, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    ctx.restore();
  }

  drawGrand1024Face(ctx, size, isMinimalist = false, isLight = false) {
    const cx = size / 2;
    const cy = size / 2;

    // 1. Radiant Platinum Diamond Metallic Foundation
    const grad = ctx.createLinearGradient(0, 0, size, size);
    if (isLight) {
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.2, '#f1f5f9');
      grad.addColorStop(0.55, '#e2e8f0');
      grad.addColorStop(0.85, '#cbd5e1');
      grad.addColorStop(1, '#94a3b8');
    } else {
      grad.addColorStop(0, '#f8fafc');
      grad.addColorStop(0.18, '#e2e8f0');
      grad.addColorStop(0.52, '#cbd5e1');
      grad.addColorStop(0.82, '#94a3b8');
      grad.addColorStop(1, '#64748b');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    // 2. Iridescent Prismatic Diamond Glaze (45-degree rainbow sheen)
    ctx.save();
    const prismGrad = ctx.createLinearGradient(0, size, size, 0);
    prismGrad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
    prismGrad.addColorStop(0.25, 'rgba(56, 189, 248, 0.16)'); // Cyan
    prismGrad.addColorStop(0.50, 'rgba(168, 85, 247, 0.12)'); // Violet
    prismGrad.addColorStop(0.75, 'rgba(244, 114, 182, 0.08)'); // Rose
    prismGrad.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
    ctx.fillStyle = prismGrad;
    ctx.fillRect(0, 0, size, size);

    // 3. Precision Diamond-Lattice Guilloché Pattern
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.lineWidth = 1.2;
    for (let d = -size; d < size * 2; d += 36) {
      ctx.beginPath();
      ctx.moveTo(d, 0);
      ctx.lineTo(d + size, size);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(d, size);
      ctx.lineTo(d + size, 0);
      ctx.stroke();
    }
    ctx.restore();

    // 4. Double Beveled Platinum Chamfer Inset Frame
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 5;
    ctx.strokeRect(10, 10, size - 20, size - 20);

    ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
    ctx.lineWidth = 2;
    ctx.strokeRect(18, 18, size - 36, size - 36);
    ctx.restore();

    // 5. 4 Corner Diamond Inset Jewels
    const cornerOffset = 30;
    this.drawCornerDiamond(ctx, cornerOffset, cornerOffset, 16);
    this.drawCornerDiamond(ctx, size - cornerOffset, cornerOffset, 16);
    this.drawCornerDiamond(ctx, cornerOffset, size - cornerOffset, 16);
    this.drawCornerDiamond(ctx, size - cornerOffset, size - cornerOffset, 16);

    // 6. Celestial 8-Point Diamond Star Emblem
    this.drawDiamondStar(ctx, cx, 118, 48, 22, '#ffffff', '#38bdf8');

    // 7. 3D Chiseled Platinum Typography ('1024')
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '900 132px "Outfit", "Clear Sans", -apple-system, BlinkMacSystemFont, "SF Pro Display", "Montserrat", sans-serif';

    const textY = 292;

    // Deep dark contrast dropshadow
    ctx.shadowColor = 'rgba(15, 23, 42, 0.95)';
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 7;

    // Chiseled deep slate border
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 11;
    ctx.lineJoin = 'round';
    ctx.strokeText('1024', cx, textY);

    // Pure brilliant diamond white fill
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'transparent';
    ctx.fillText('1024', cx, textY);
    ctx.restore();

    // 8. Engraved Platinum Title Banner (Deep Velvet Navy Pill)
    ctx.save();
    const bannerY = 412;
    const bannerW = 310;
    const bannerH = 38;

    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(cx - bannerW / 2, bannerY - bannerH / 2, bannerW, bannerH, 19);
    } else {
      ctx.rect(cx - bannerW / 2, bannerY - bannerH / 2, bannerW, bannerH);
    }
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '900 20px "Outfit", "Clear Sans", -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 0;
    ctx.fillText('◆ PLATINUM DIAMOND ◆', cx, bannerY + 1);
    ctx.restore();
  }

  drawGrand1024Sprite(ctx, size, isLight = false) {
    const cx = size / 2;
    const cy = size / 2;
    ctx.clearRect(0, 0, size, size);

    // Platinum Radial Medallion
    const radGrad = ctx.createRadialGradient(cx, cy, 20, cx, cy, size * 0.46);
    radGrad.addColorStop(0, '#ffffff');
    radGrad.addColorStop(0.35, '#e2e8f0');
    radGrad.addColorStop(0.85, '#94a3b8');
    radGrad.addColorStop(1, 'rgba(100, 116, 139, 0)');
    ctx.fillStyle = radGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, size * 0.46, 0, Math.PI * 2);
    ctx.fill();

    // Concentric Diamond Rim
    ctx.beginPath();
    ctx.arc(cx, cy, size * 0.43, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, size * 0.40, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.55)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Emblem
    this.drawDiamondStar(ctx, cx, 140, 36, 16, '#ffffff', '#38bdf8');

    // Typography
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '900 120px "Outfit", "Clear Sans", -apple-system, BlinkMacSystemFont, sans-serif';

    const textY = 300;
    ctx.shadowColor = 'rgba(15, 23, 42, 0.85)';
    ctx.shadowBlur = 14;
    ctx.shadowOffsetY = 5;

    ctx.strokeStyle = 'rgba(30, 41, 59, 0.95)';
    ctx.lineWidth = 7;
    ctx.strokeText('1024', cx, textY);

    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'transparent';
    ctx.fillText('1024', cx, textY);
    ctx.restore();
  }

  drawCornerJewel(ctx, x, y, radius, jewelColor = '#dc2626') {
    ctx.save();
    // Gold Bezel Setting
    ctx.beginPath();
    ctx.arc(x, y, radius + 3, 0, Math.PI * 2);
    const goldBezel = ctx.createLinearGradient(x - radius, y - radius, x + radius, y + radius);
    goldBezel.addColorStop(0, '#ffffff');
    goldBezel.addColorStop(0.35, '#fde047');
    goldBezel.addColorStop(1, '#854d0e');
    ctx.fillStyle = goldBezel;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
    ctx.shadowBlur = 4;
    ctx.fill();

    // Brilliant Faceted Gemstone
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    const gemGrad = ctx.createRadialGradient(x - radius * 0.35, y - radius * 0.35, 1, x, y, radius);
    gemGrad.addColorStop(0, '#fca5a5');
    gemGrad.addColorStop(0.35, jewelColor);
    gemGrad.addColorStop(0.85, '#7f1d1d');
    gemGrad.addColorStop(1, '#450a0a');
    ctx.fillStyle = gemGrad;
    ctx.shadowColor = 'transparent';
    ctx.fill();

    // Specular highlight sparkle
    ctx.beginPath();
    ctx.arc(x - radius * 0.35, y - radius * 0.35, radius * 0.28, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fill();
    ctx.restore();
  }

  drawRoyalCrown(ctx, cx, cy, width, height) {
    ctx.save();
    // Halo glow behind crown
    const halo = ctx.createRadialGradient(cx, cy, 10, cx, cy, width * 0.85);
    halo.addColorStop(0, 'rgba(254, 240, 138, 0.75)');
    halo.addColorStop(0.5, 'rgba(245, 158, 11, 0.40)');
    halo.addColorStop(1, 'rgba(245, 158, 11, 0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(cx, cy, width * 0.85, 0, Math.PI * 2);
    ctx.fill();

    // Base Crown Band
    const bandY = cy + height * 0.36;
    const bandH = height * 0.24;
    const bandW = width * 0.86;

    // Golden 5-Peak Crown Silhouette
    ctx.beginPath();
    ctx.moveTo(cx - bandW / 2, bandY + bandH);
    ctx.lineTo(cx + bandW / 2, bandY + bandH);
    ctx.lineTo(cx + bandW / 2 + 5, bandY);
    ctx.lineTo(cx + width * 0.44, cy - height * 0.18);
    ctx.lineTo(cx + width * 0.26, cy + height * 0.08);
    ctx.lineTo(cx + width * 0.20, cy - height * 0.42);
    ctx.lineTo(cx + width * 0.10, cy + height * 0.05);
    ctx.lineTo(cx, cy - height * 0.65); // Center majestic peak
    ctx.lineTo(cx - width * 0.10, cy + height * 0.05);
    ctx.lineTo(cx - width * 0.20, cy - height * 0.42);
    ctx.lineTo(cx - width * 0.26, cy + height * 0.08);
    ctx.lineTo(cx - width * 0.44, cy - height * 0.18);
    ctx.lineTo(cx - bandW / 2, bandY);
    ctx.closePath();

    const crownGrad = ctx.createLinearGradient(cx - bandW / 2, cy - height * 0.65, cx + bandW / 2, bandY + bandH);
    crownGrad.addColorStop(0, '#fffbeb');
    crownGrad.addColorStop(0.28, '#fde047');
    crownGrad.addColorStop(0.70, '#eab308');
    crownGrad.addColorStop(1, '#ca8a04');
    ctx.fillStyle = crownGrad;
    ctx.shadowColor = 'rgba(120, 53, 15, 0.75)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 4;
    ctx.fill();

    // Outline
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Crown Band Inset
    ctx.beginPath();
    ctx.rect(cx - bandW / 2 + 4, bandY + 4, bandW - 8, bandH - 6);
    ctx.fillStyle = '#b45309';
    ctx.shadowColor = 'transparent';
    ctx.fill();
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 5 Jewels on Crown Band
    const jewelCols = ['#10b981', '#ef4444', '#3b82f6', '#ef4444', '#10b981']; // Emerald, Ruby, Sapphire, Ruby, Emerald
    const step = (bandW - 24) / 4;
    for (let j = 0; j < 5; j++) {
      const jx = (cx - bandW / 2 + 12) + j * step;
      const jy = bandY + bandH / 2 + 1;
      // Gold bezel
      ctx.beginPath();
      ctx.arc(jx, jy, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#fde047';
      ctx.fill();
      // Jewel
      ctx.beginPath();
      ctx.arc(jx, jy, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = jewelCols[j];
      ctx.fill();
      // Sparkle
      ctx.beginPath();
      ctx.arc(jx - 1.5, jy - 1.5, 1.2, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    }

    // Orb & Cross on Center Peak
    const orbY = cy - height * 0.65;
    ctx.beginPath();
    ctx.arc(cx, orbY - 4, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#fef08a';
    ctx.fill();
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Ruby on mid-peaks
    [cx - width * 0.20, cx + width * 0.20].forEach(px => {
      ctx.beginPath();
      ctx.arc(px, cy - height * 0.42, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#ef4444';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    // Pearls on outer peaks
    [cx - width * 0.44, cx + width * 0.44].forEach(px => {
      ctx.beginPath();
      ctx.arc(px, cy - height * 0.18, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    ctx.restore();
  }

  drawWildcardFace(ctx, size) {
    const cx = size / 2;
    const cy = size / 2;

    // 1. Radiant 3-Color Rainbow Gradient (#ff4d94 -> #fbbf24 -> #22d3ee)
    const grad = ctx.createLinearGradient(0, 0, size, size);
    grad.addColorStop(0, '#ff4d94');   // Hot vibrant pink
    grad.addColorStop(0.5, '#fbbf24'); // Sunlit golden amber
    grad.addColorStop(1, '#22d3ee');   // Luminous bright cyan
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    // 2. Brilliant White Border
    ctx.save();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 14;
    ctx.strokeRect(16, 16, size - 32, size - 32);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 4;
    ctx.strokeRect(26, 26, size - 52, size - 52);
    ctx.restore();

    // 3. Bold White Star ★ with soft drop shadow
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '900 240px "Clear Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    ctx.shadowBlur = 18;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 4;
    ctx.fillStyle = '#ffffff';
    ctx.fillText('★', cx, cy + 6);
    ctx.restore();
  }

  drawWildcardSprite(ctx, size) {
    const cx = size / 2;
    const cy = size / 2;
    ctx.clearRect(0, 0, size, size);

    // 1. Circular Rainbow Gradient Disc
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, 220, 0, Math.PI * 2);
    ctx.closePath();
    const grad = ctx.createLinearGradient(cx - 200, cy - 200, cx + 200, cy + 200);
    grad.addColorStop(0, '#ff4d94');
    grad.addColorStop(0.5, '#fbbf24');
    grad.addColorStop(1, '#22d3ee');
    ctx.fillStyle = grad;
    ctx.fill();

    // 2. White Rim
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 12;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, 206, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.restore();

    // 3. Bold White Star ★
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '900 220px "Clear Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 16;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 4;
    ctx.fillStyle = '#ffffff';
    ctx.fillText('★', cx, cy + 4);
    ctx.restore();
  }

  drawGrand2048Face(ctx, size, isMinimalist = false, isLight = false) {
    const cx = size / 2;
    const cy = size / 2;

    // 1. Radiant 24K Imperial Gold Satin Foundation
    const grad = ctx.createLinearGradient(0, 0, size, size);
    if (isLight) {
      grad.addColorStop(0, '#fffbeb');   // Brilliant sunlight crown
      grad.addColorStop(0.22, '#fde047'); // Pure sparkling gold
      grad.addColorStop(0.60, '#eab308'); // Warm golden amber
      grad.addColorStop(1, '#ca8a04');    // Deep gold chamfer
    } else {
      grad.addColorStop(0, '#fff6a3');   // Incandescent solar highlight
      grad.addColorStop(0.20, '#ffd700'); // Pure 24K Radiant Gold
      grad.addColorStop(0.58, '#f59e0b'); // Rich Honey Gold Core
      grad.addColorStop(0.85, '#d97706'); // Deep Warm Gold Bevel
      grad.addColorStop(1, '#854d0e');    // Antique Gold Ingot Rim
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    // 2. Imperial Guilloché Sunburst Engraving
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
    ctx.lineWidth = 1.5;
    for (let a = 0; a < 36; a++) {
      const angle = (a * Math.PI * 2) / 36;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * size, cy + Math.sin(angle) * size);
      ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(180, 83, 9, 0.18)';
    ctx.lineWidth = 1.2;
    for (let r = 50; r < size * 0.7; r += 28) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();

    // 3. Double Beveled Imperial Gold Chamfer Frame
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 6;
    ctx.strokeRect(10, 10, size - 20, size - 20);

    ctx.strokeStyle = 'rgba(254, 240, 138, 0.65)';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(18, 18, size - 36, size - 36);
    ctx.restore();

    // 4. 4 Corner Inset Imperial Ruby Gemstones
    const cornerOffset = 30;
    this.drawCornerJewel(ctx, cornerOffset, cornerOffset, 9, '#ef4444');
    this.drawCornerJewel(ctx, size - cornerOffset, cornerOffset, 9, '#ef4444');
    this.drawCornerJewel(ctx, cornerOffset, size - cornerOffset, 9, '#ef4444');
    this.drawCornerJewel(ctx, size - cornerOffset, size - cornerOffset, 9, '#ef4444');

    // 5. Majestic Royal Imperial Crown (👑)
    this.drawRoyalCrown(ctx, cx, 118, 148, 88);

    // 6. 3D Chiseled Imperial Gold Typography ('2048')
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '900 138px "Outfit", "Clear Sans", -apple-system, BlinkMacSystemFont, "SF Pro Display", "Montserrat", sans-serif';

    const textY = 292;

    // Heavy warm bronze dropshadow
    ctx.shadowColor = 'rgba(69, 26, 3, 0.95)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetY = 7;

    // Chiseled deep bronze bevel
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 11;
    ctx.lineJoin = 'round';
    ctx.strokeText('2048', cx, textY);

    // Pure brilliant diamond white fill
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'transparent';
    ctx.fillText('2048', cx, textY);
    ctx.restore();

    // 7. Imperial Sovereign Title Banner (Deep Imperial Velvet Pill)
    ctx.save();
    const bannerY = 412;
    const bannerW = 310;
    const bannerH = 38;

    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(cx - bannerW / 2, bannerY - bannerH / 2, bannerW, bannerH, 19);
    } else {
      ctx.rect(cx - bannerW / 2, bannerY - bannerH / 2, bannerW, bannerH);
    }
    ctx.fillStyle = '#451a03';
    ctx.fill();
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '900 20px "Outfit", "Clear Sans", -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 0;
    ctx.fillText('★ SOVEREIGN 2048 ★', cx, bannerY + 1);
    ctx.restore();
  }

  drawGrand2048Sprite(ctx, size, isLight = false) {
    const cx = size / 2;
    const cy = size / 2;
    ctx.clearRect(0, 0, size, size);

    // Radiant Gold Circular Disc with Soft Feathered Edge
    const radGrad = ctx.createRadialGradient(cx, cy, 20, cx, cy, size * 0.46);
    radGrad.addColorStop(0, '#fef08a');
    radGrad.addColorStop(0.35, '#f59e0b');
    radGrad.addColorStop(0.85, '#d97706');
    radGrad.addColorStop(1, 'rgba(180, 83, 9, 0)');
    ctx.fillStyle = radGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, size * 0.46, 0, Math.PI * 2);
    ctx.fill();

    // Subtle Apple Glass Outer Ring
    ctx.beginPath();
    ctx.arc(cx, cy, size * 0.43, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, size * 0.40, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(254, 240, 138, 0.65)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Crown
    this.drawRoyalCrown(ctx, cx, 140, 110, 68);

    // Pristine Centered Typography
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '900 126px "Outfit", "Clear Sans", -apple-system, BlinkMacSystemFont, sans-serif';

    const textY = 300;
    ctx.shadowColor = 'rgba(67, 20, 7, 0.85)';
    ctx.shadowBlur = 16;
    ctx.shadowOffsetY = 5;

    ctx.strokeStyle = 'rgba(120, 53, 15, 0.95)';
    ctx.lineWidth = 7;
    ctx.strokeText('2048', cx, textY);

    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'transparent';
    ctx.fillText('2048', cx, textY);
    ctx.restore();
  }


  // ================= CELESTIAL PLANETARY EVOLUTION TEXTURES & MATERIALS =================
  getAsteroidTexture(value = 2) {
    const key = `asteroid_v2_tex_${value}`;
    if (this.textureCache.has(key)) return this.textureCache.get(key);

    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Clean moonstone / metallic platinum-slate crystal foundation (distinct from dark board!)
    const isVal4 = value >= 4;
    const grad = ctx.createLinearGradient(0, 0, size, size);
    if (isVal4) {
      grad.addColorStop(0, '#67e8f9');
      grad.addColorStop(0.35, '#0284c7');
      grad.addColorStop(0.75, '#1e3a5f');
      grad.addColorStop(1, '#0f172a');
    } else {
      grad.addColorStop(0, '#cbd5e1');
      grad.addColorStop(0.4, '#64748b');
      grad.addColorStop(0.8, '#334155');
      grad.addColorStop(1, '#1e293b');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    // Clean luminous mineral crystal veins (no dirty noise speckles)
    ctx.save();
    ctx.strokeStyle = isVal4 ? 'rgba(186, 230, 253, 0.55)' : 'rgba(224, 242, 254, 0.42)';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    const veins = [
      [[40, 120], [160, 185], [270, 150], [420, 220]],
      [[160, 185], [210, 310], [340, 390]],
      [[90, 360], [210, 310], [450, 140]]
    ];
    veins.forEach(pts => {
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.stroke();
    });
    ctx.restore();

    // Soft sculpted impact basins
    const craters = [
      { x: 140, y: 150, r: 42 },
      { x: 370, y: 180, r: 52 },
      { x: 250, y: 340, r: 44 }
    ];
    craters.forEach(c => {
      const cGrad = ctx.createRadialGradient(c.x, c.y, c.r * 0.1, c.x, c.y, c.r);
      cGrad.addColorStop(0, isVal4 ? 'rgba(12, 74, 110, 0.65)' : 'rgba(15, 23, 42, 0.55)');
      cGrad.addColorStop(0.75, 'rgba(51, 65, 85, 0.2)');
      cGrad.addColorStop(1, 'rgba(255, 255, 255, 0.18)');
      ctx.fillStyle = cGrad;
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
      ctx.fill();
    });

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    this.textureCache.set(key, tex);
    return tex;
  }

  getMagmaTexture(value = 8) {
    const key = `magma_v2_tex_${value}`;
    if (this.textureCache.has(key)) return this.textureCache.get(key);

    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    const isEmerald8 = value <= 8;
    const baseGrad = ctx.createLinearGradient(0, 0, size, size);
    if (isEmerald8) {
      baseGrad.addColorStop(0, '#064e3b');
      baseGrad.addColorStop(0.5, '#022c22');
      baseGrad.addColorStop(1, '#052e16');
    } else {
      baseGrad.addColorStop(0, '#431407');
      baseGrad.addColorStop(0.5, '#290d05');
      baseGrad.addColorStop(1, '#1c0a04');
    }
    ctx.fillStyle = baseGrad;
    ctx.fillRect(0, 0, size, size);

    // Smooth Bezier volcanic plasma rivers (clean curves, no jagged zigzags)
    const curves = [
      [[0, 170], [130, 120], [260, 220], [512, 160]],
      [[0, 340], [160, 390], [320, 290], [512, 350]],
      [[180, 0], [150, 170], [240, 330], [210, 512]],
      [[350, 0], [380, 160], [310, 340], [360, 512]]
    ];

    ctx.lineCap = 'round';
    ctx.shadowColor = isEmerald8 ? '#10b981' : '#f97316';
    ctx.shadowBlur = 22;
    ctx.strokeStyle = isEmerald8 ? '#059669' : '#ea580c';
    ctx.lineWidth = 18;
    curves.forEach(([p0, p1, p2, p3]) => {
      ctx.beginPath();
      ctx.moveTo(p0[0], p0[1]);
      ctx.bezierCurveTo(p1[0], p1[1], p2[0], p2[1], p3[0], p3[1]);
      ctx.stroke();
    });

    ctx.shadowColor = isEmerald8 ? '#6ee7b7' : '#fde047';
    ctx.shadowBlur = 10;
    ctx.strokeStyle = isEmerald8 ? '#a7f3d0' : '#fef08a';
    ctx.lineWidth = 5;
    curves.forEach(([p0, p1, p2, p3]) => {
      ctx.beginPath();
      ctx.moveTo(p0[0], p0[1]);
      ctx.bezierCurveTo(p1[0], p1[1], p2[0], p2[1], p3[0], p3[1]);
      ctx.stroke();
    });

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    this.textureCache.set(key, tex);
    return tex;
  }

  getGasGiantTexture(value = 32) {
    const key = `gas_giant_v2_tex_${value}`;
    if (this.textureCache.has(key)) return this.textureCache.get(key);

    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Clean, luminous planetary atmosphere gradients (no muddy brown noise!)
    const g = ctx.createLinearGradient(0, 0, 0, size);
    if (value <= 32) {
      // Sunset Tangerine Jupiter
      g.addColorStop(0.0, '#7c2d12');
      g.addColorStop(0.18, '#ea580c');
      g.addColorStop(0.32, '#fdba74');
      g.addColorStop(0.48, '#c2410c');
      g.addColorStop(0.64, '#ffedd5');
      g.addColorStop(0.80, '#f97316');
      g.addColorStop(1.0, '#7c2d12');
    } else if (value <= 64) {
      // Rose Nebula Exoplanet
      g.addColorStop(0.0, '#4c0519');
      g.addColorStop(0.2, '#be123c');
      g.addColorStop(0.36, '#fda4af');
      g.addColorStop(0.52, '#e11d48');
      g.addColorStop(0.7, '#ffe4e6');
      g.addColorStop(0.85, '#f43f5e');
      g.addColorStop(1.0, '#4c0519');
    } else if (value <= 128) {
      // Fuchsia Saturnian Giant
      g.addColorStop(0.0, '#4a044e');
      g.addColorStop(0.22, '#a21caf');
      g.addColorStop(0.42, '#f0abfc');
      g.addColorStop(0.58, '#c026d3');
      g.addColorStop(0.76, '#fae8ff');
      g.addColorStop(1.0, '#4a044e');
    } else {
      // Hyper Ice Cyan-Sapphire Giant (256+)
      g.addColorStop(0.0, '#082f49');
      g.addColorStop(0.22, '#0284c7');
      g.addColorStop(0.4, '#7dd3fc');
      g.addColorStop(0.56, '#0ea5e9');
      g.addColorStop(0.74, '#e0f2fe');
      g.addColorStop(0.88, '#0369a1');
      g.addColorStop(1.0, '#082f49');
    }
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);

    // Silky translucent atmospheric wave ribbons
    for (let b = 0; b < 7; b++) {
      const y = (b + 0.5) * (size / 7);
      ctx.strokeStyle = b % 2 === 0 ? 'rgba(255, 255, 255, 0.22)' : 'rgba(15, 23, 42, 0.14)';
      ctx.lineWidth = 10 + (b % 3) * 4;
      ctx.beginPath();
      for (let x = 0; x <= size; x += 16) {
        const wy = y + Math.sin((x / size) * Math.PI * 2 + b) * 7;
        if (x === 0) ctx.moveTo(x, wy);
        else ctx.lineTo(x, wy);
      }
      ctx.stroke();
    }

    // Smooth glowing Great Storm Vortex
    const sx = size * 0.65;
    const sy = size * 0.62;
    const sg = ctx.createRadialGradient(sx, sy, 4, sx, sy, 52);
    sg.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
    sg.addColorStop(0.45, 'rgba(255, 255, 255, 0.3)');
    sg.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = sg;
    ctx.beginPath();
    ctx.ellipse(sx, sy, 52, 28, -0.1, 0, Math.PI * 2);
    ctx.fill();

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    this.textureCache.set(key, tex);
    return tex;
  }

  getSaturnRingTexture(value = 128) {
    const key = `saturn_ring_v2_tex_${value}`;
    if (this.textureCache.has(key)) return this.textureCache.get(key);

    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, size, size);
    const cx = size / 2;
    const cy = size / 2;

    const style = this.getStyle(value);
    const col = new THREE.Color(style.rim || style.emissive || '#bae6fd');
    const cr = Math.round(col.r * 255);
    const cg = Math.round(col.g * 255);
    const cb = Math.round(col.b * 255);

    // Clean, silky luminous ice-crystal planetary ring with crisp Cassini division
    const ringGrad = ctx.createRadialGradient(cx, cy, 138, cx, cy, 248);
    ringGrad.addColorStop(0.0, 'rgba(255, 255, 255, 0)');
    ringGrad.addColorStop(0.08, `rgba(${cr}, ${cg}, ${cb}, 0.55)`);
    ringGrad.addColorStop(0.28, 'rgba(255, 255, 255, 0.88)');
    ringGrad.addColorStop(0.48, `rgba(${cr}, ${cg}, ${cb}, 0.72)`);
    ringGrad.addColorStop(0.56, 'rgba(10, 14, 28, 0.08)'); // Clean Cassini Gap
    ringGrad.addColorStop(0.64, 'rgba(255, 255, 255, 0.85)');
    ringGrad.addColorStop(0.84, `rgba(${cr}, ${cg}, ${cb}, 0.48)`);
    ringGrad.addColorStop(1.0, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = ringGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 248, 0, Math.PI * 2);
    ctx.fill();

    // Subtle specular highlight arcs along the rings
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.lineWidth = 2;
    [164, 198, 224].forEach(r => {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    });

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    this.textureCache.set(key, tex);
    return tex;
  }

  getPulsarCoronaTexture(value = 512) {
    const key = `pulsar_v2_tex_${value}`;
    if (this.textureCache.has(key)) return this.textureCache.get(key);

    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    const cx = size / 2;
    const cy = size / 2;
    const isSolar = value >= 1024;
    const coreGrad = ctx.createRadialGradient(cx, cy, 12, cx, cy, 248);
    if (isSolar) {
      coreGrad.addColorStop(0, '#ffffff');
      coreGrad.addColorStop(0.28, '#fef08a');
      coreGrad.addColorStop(0.62, '#38bdf8');
      coreGrad.addColorStop(1, '#0369a1');
    } else {
      coreGrad.addColorStop(0, '#ffffff');
      coreGrad.addColorStop(0.26, '#c7d2fe');
      coreGrad.addColorStop(0.6, '#6366f1');
      coreGrad.addColorStop(1, '#312e81');
    }
    ctx.fillStyle = coreGrad;
    ctx.fillRect(0, 0, size, size);

    // Clean symmetric plasma latitude ribbons (no messy random sticks)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.32)';
    ctx.lineWidth = 3;
    for (let i = 1; i <= 5; i++) {
      ctx.beginPath();
      ctx.arc(cx, cy, i * 42, 0, Math.PI * 2);
      ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    this.textureCache.set(key, tex);
    return tex;
  }

  getBlackHoleDiskTexture(value = 2048) {
    const key = `black_hole_disk_v2_tex_${value}`;
    if (this.textureCache.has(key)) return this.textureCache.get(key);

    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    const cx = size / 2;
    const cy = size / 2;
    ctx.clearRect(0, 0, size, size);

    // High-contrast, razor-clean relativistic accretion disk (tinted cleanly per value)
    const style = value ? this.getStyle(value) : { emissive: '#f59e0b', bg: '#fbbf24' };
    const col = new THREE.Color(value === 2048 || !value ? '#f59e0b' : (style.emissive && style.emissive !== '#000000' ? style.emissive : style.bg));
    const cr = Math.round(col.r * 255);
    const cg = Math.round(col.g * 255);
    const cb = Math.round(col.b * 255);

    const diskGrad = ctx.createRadialGradient(cx, cy, 108, cx, cy, 248);
    diskGrad.addColorStop(0.0, 'rgba(255, 255, 255, 0)');
    diskGrad.addColorStop(0.06, 'rgba(255, 255, 255, 0.96)');
    diskGrad.addColorStop(0.22, 'rgba(254, 249, 195, 0.92)');
    diskGrad.addColorStop(0.48, `rgba(${cr}, ${cg}, ${cb}, 0.78)`);
    diskGrad.addColorStop(0.76, `rgba(${cr}, ${cg}, ${cb}, 0.28)`);
    diskGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = diskGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 248, 0, Math.PI * 2);
    ctx.fill();

    // Clean golden photon orbital streams (subtle, smooth, zero muddy streaks)
    [138, 166, 194].forEach((r, idx) => {
      ctx.strokeStyle = idx === 0 ? 'rgba(255, 255, 255, 0.75)' : 'rgba(254, 240, 138, 0.42)';
      ctx.lineWidth = idx === 0 ? 3.0 : 1.8;
      ctx.beginPath();
      ctx.arc(cx, cy, r, idx * 0.7, idx * 0.7 + Math.PI * 1.45);
      ctx.stroke();
    });

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    this.textureCache.set(key, tex);
    return tex;
  }

  getCelestialMaterial(stage, value = 2) {
    const key = `celestial_v2_mat_${stage}_${value}`;
    if (this.materialCache.has(key)) return this.materialCache.get(key);

    let mat;
    if (stage === 'asteroid') {
      mat = new THREE.MeshPhysicalMaterial({
        map: this.getAsteroidTexture(value),
        roughness: 0.35,
        metalness: 0.45,
        clearcoat: 0.65,
        flatShading: true
      });
    } else if (stage === 'magma') {
      const magmaTex = this.getMagmaTexture(value);
      mat = new THREE.MeshPhysicalMaterial({
        map: magmaTex,
        emissiveMap: magmaTex,
        emissive: new THREE.Color(value <= 8 ? 0x10b981 : 0xf97316),
        emissiveIntensity: 0.85,
        roughness: 0.25,
        metalness: 0.35,
        clearcoat: 0.85
      });
    } else if (stage === 'gas_giant') {
      mat = new THREE.MeshPhysicalMaterial({
        map: this.getGasGiantTexture(value),
        roughness: 0.24,
        metalness: 0.12,
        clearcoat: 0.75,
        clearcoatRoughness: 0.14
      });
    } else if (stage === 'saturn') {
      mat = new THREE.MeshPhysicalMaterial({
        map: this.getGasGiantTexture(value),
        roughness: 0.22,
        metalness: 0.18,
        clearcoat: 0.8,
        clearcoatRoughness: 0.12
      });
    } else if (stage === 'saturn_ring') {
      mat = new THREE.MeshBasicMaterial({
        map: this.getSaturnRingTexture(value),
        transparent: true,
        opacity: 0.94,
        side: THREE.DoubleSide,
        depthWrite: false
      });
    } else if (stage === 'pulsar') {
      const pulsarTex = this.getPulsarCoronaTexture(value);
      mat = new THREE.MeshPhysicalMaterial({
        map: pulsarTex,
        emissiveMap: pulsarTex,
        emissive: new THREE.Color(value >= 1024 ? 0x38bdf8 : 0x6366f1),
        emissiveIntensity: 0.85,
        roughness: 0.12,
        metalness: 0.35,
        clearcoat: 0.9
      });
    } else if (stage === 'black_hole_core') {
      mat = new THREE.MeshPhysicalMaterial({
        color: 0x020206,
        emissive: 0x090414,
        emissiveIntensity: 0.25,
        roughness: 0.04,
        metalness: 0.94,
        clearcoat: 1.0,
        clearcoatRoughness: 0.02,
        reflectivity: 1.0
      });
    } else if (stage === 'black_hole_disk') {
      const diskTex = this.getBlackHoleDiskTexture(value);
      mat = new THREE.MeshBasicMaterial({
        map: diskTex,
        transparent: true,
        opacity: 0.96,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
    } else if (stage === 'einstein_ring') {
      const style = value ? this.getStyle(value) : { rim: '#fde047' };
      const rimCol = value === 2048 ? 0xfde047 : new THREE.Color(style.rim || '#fde047').getHex();
      mat = new THREE.MeshBasicMaterial({
        color: rimCol,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
    } else {
      mat = this.getSphereMaterial(value);
    }

    this.materialCache.set(key, mat);
    return mat;
  }
}

export const textureManager = new TextureManager();
