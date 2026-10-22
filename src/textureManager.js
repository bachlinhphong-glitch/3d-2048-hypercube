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

// 2. [HƯỚNG SÁNG] Gentle Light (Hiền Hòa Sáng / Harmonious Classic Warm Silk Palette)
// Tông màu dịu mắt, chuyển tiếp tự nhiên, không chói lóa, số hiển thị sắc nét rõ ràng
const TILE_STYLES_GENTLE_LIGHT = {
  2:     { bg: '#eee4da', text: '#776e65', emissive: '#eee4da', intensity: 0, rim: '#ffffff' }, // Warm Silk Ivory
  4:     { bg: '#ede0c8', text: '#776e65', emissive: '#ede0c8', intensity: 0, rim: '#ffffff' }, // Warm Toasted Linen
  8:     { bg: '#f2b179', text: '#ffffff', emissive: '#f2b179', intensity: 0, rim: '#fff1e5' }, // Soft Apricot
  16:    { bg: '#f59563', text: '#ffffff', emissive: '#f59563', intensity: 0, rim: '#ffede5' }, // Warm Coral
  32:    { bg: '#f67c5f', text: '#ffffff', emissive: '#f67c5f', intensity: 0, rim: '#ffe8e0' }, // Soft Terracotta
  64:    { bg: '#ea580c', text: '#ffffff', emissive: '#ea580c', intensity: 0, rim: '#ffedd5' }, // Rich Amber Clay
  128:   { bg: '#edcf72', text: '#ffffff', emissive: '#edcf72', intensity: 0, rim: '#fffde8' }, // Gentle Sunlight
  256:   { bg: '#edcc61', text: '#ffffff', emissive: '#edcc61', intensity: 0, rim: '#fffde8' }, // Warm Honey Gold
  512:   { bg: '#edc850', text: '#ffffff', emissive: '#edc850', intensity: 0, rim: '#fffde8' }, // Pure Gold
  1024:  { bg: '#edc53f', text: '#ffffff', emissive: '#edc53f', intensity: 0, rim: '#fffde8' }, // Burnished Crown Gold
  2048:  { bg: '#edc22e', text: '#ffffff', emissive: '#edc22e', intensity: 0, rim: '#fffde8' }, // Classic 2048 Crown Gold
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
  createCanvasTexture(value, isBomb = false, bombCountdown = 0) {
    const isLight = this.currentTheme === 'gentle_light' || this.currentTheme === 'zen_clay';
    const isDark = this.currentTheme === 'gentle_dark' || this.currentTheme === 'modern_slate';
    const isMinimalist = isLight || isDark;

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
  createSpriteTexture(value, isBomb = false, bombCountdown = 0) {
    const isLight = this.currentTheme === 'gentle_light' || this.currentTheme === 'zen_clay';
    const cacheKey = `sprite_${this.currentTheme}_${value}_${isBomb}_${bombCountdown}`;
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

  getTileMaterials(value, isBomb = false, bombCountdown = 0) {
    const matKey = `mat_${this.currentTheme}_${value}_${isBomb}_${bombCountdown}_${this.isHyperNeon}`;
    if (this.materialCache.has(matKey)) {
      return this.materialCache.get(matKey);
    }

    const isLight = this.currentTheme === 'gentle_light' || this.currentTheme === 'zen_clay';
    const isDark = this.currentTheme === 'gentle_dark' || this.currentTheme === 'modern_slate';
    const isMinimalist = isLight || isDark;

    const style = this.getStyle(value);
    const texture = this.createCanvasTexture(value, isBomb, bombCountdown);

    const emissiveColor = new THREE.Color(isBomb ? 0xff2222 : (isMinimalist ? 0x000000 : style.emissive));
    const multiplier = this.isHyperNeon ? 1.5 : 1.0;
    const emissiveIntensity = isMinimalist ? 0 : ((isBomb ? 0.7 : style.intensity) * multiplier);

    const roughness = isLight ? 0.55 : (isDark ? 0.48 : 0.18);
    const metalness = isLight ? 0.02 : (isDark ? 0.08 : 0.22);

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
      emissiveIntensity: isBomb ? 0.75 : (isLight ? 0 : (this.isHyperNeon ? 0.9 : 0.45))
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
      emissiveIntensity: isBomb ? 0.8 : (isLight ? 0 : 1.2),
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

  getBillboardMaterial(value, isBomb = false, bombCountdown = 0) {
    const key = `billboard_${this.currentTheme}_${value}_${isBomb}_${bombCountdown}_${this.isHyperNeon}`;
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
