/**
 * Shared utility functions for ⓒエディタ
 * Phase 2 refactoring: Consolidate common functions
 */
(function() {
  'use strict';

  // ===================================
  // HTML Escaping
  // ===================================

  /**
   * Escape HTML special characters to prevent XSS
   * @param {*} s - Input value (will be converted to string)
   * @returns {string} HTML-escaped string
   */
  function escapeHtml(s) {
    s = (s === null || s === undefined) ? '' : String(s);
    return s.replace(/[&<>"']/g, m => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[m]));
  }

  /**
   * Escape HTML for view display (alias for escapeHtml)
   */
  function escapeHtmlView(s) {
    return escapeHtml(s);
  }

  // ===================================
  // Number Utilities
  // ===================================

  /**
   * Clamp a number between min and max
   * @param {number} n - The number to clamp
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @returns {number} Clamped value
   */
  function clamp(n, min, max) {
    return Math.min(Math.max(n, min), max);
  }

  // ===================================
  // Color Utilities
  // ===================================

  // Cache for parsed colors
  const __cssColorCache = new Map();

  /**
   * Convert hex color to RGB object
   * @param {string} hex - Hex color string (#RGB or #RRGGBB)
   * @returns {object|null} {r, g, b} or null if invalid
   */
  function hexToRgb(hex) {
    if (!hex || typeof hex !== 'string') return null;
    const s = hex.trim();
    let m = s.match(/^#?([0-9a-fA-F]{3})$/);
    if (m) {
      const h = m[1];
      return {
        r: parseInt(h[0] + h[0], 16),
        g: parseInt(h[1] + h[1], 16),
        b: parseInt(h[2] + h[2], 16)
      };
    }
    m = s.match(/^#?([0-9a-fA-F]{6})$/);
    if (!m) return null;
    const n = parseInt(m[1], 16);
    return {
      r: (n >> 16) & 255,
      g: (n >> 8) & 255,
      b: n & 255
    };
  }

  /**
   * Parse CSS color string to RGB object (with caching)
   * Supports: hex (#RGB, #RRGGBB), rgb(), rgba(), and CSS color names
   * @param {string} colorStr - CSS color string
   * @returns {object|null} {r, g, b} or null if invalid
   */
  function cssColorToRgb(colorStr) {
    const key = (colorStr || '').trim();
    if (!key) return null;
    if (__cssColorCache.has(key)) return __cssColorCache.get(key);

    // Fast paths for common formats
    let m;
    const clampInt = n => Math.max(0, Math.min(255, Math.round(n)));

    // Hex format
    if ((m = key.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i))) {
      const rgb = hexToRgb(key);
      __cssColorCache.set(key, rgb);
      return rgb;
    }

    // rgb() / rgba() format
    if ((m = key.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i))) {
      const rgb = {
        r: clampInt(parseFloat(m[1])),
        g: clampInt(parseFloat(m[2])),
        b: clampInt(parseFloat(m[3]))
      };
      __cssColorCache.set(key, rgb);
      return rgb;
    }

    // CSS color name - use canvas context for parsing
    try {
      const ctx = document.createElement('canvas').getContext('2d');
      ctx.fillStyle = key;
      const computed = ctx.fillStyle;
      if (computed && computed !== key) {
        // Recursively parse the computed value (usually hex)
        const result = cssColorToRgb(computed);
        __cssColorCache.set(key, result);
        return result;
      }
    } catch (e) {
      // Canvas not available (e.g., SSR)
    }

    __cssColorCache.set(key, null);
    return null;
  }

  /**
   * Convert RGB to hex string
   * @param {number} r - Red (0-255)
   * @param {number} g - Green (0-255)
   * @param {number} b - Blue (0-255)
   * @returns {string} Hex color string (#RRGGBB)
   */
  function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
      const hex = Math.max(0, Math.min(255, Math.round(x))).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  }

  /**
   * Shade a hex color by percentage
   * @param {string} hex - Hex color string
   * @param {number} percent - -1 to 1 (negative = darker, positive = lighter)
   * @returns {string} Shaded hex color
   */
  function shadeHex(hex, percent) {
    if (!hex) return '#fff59d';
    const m = hex.trim().match(/^#?([0-9a-fA-F]{6})$/);
    if (!m) return hex;
    const n = parseInt(m[1], 16);
    let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    const t = percent < 0 ? 0 : 255;
    const p = Math.abs(percent);
    r = Math.round((t - r) * p + r);
    g = Math.round((t - g) * p + g);
    b = Math.round((t - b) * p + b);
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  // ===================================
  // Export to window
  // ===================================

  // Primary exports (used across the app)
  window.escapeHtml = escapeHtml;
  window.escapeHtmlView = escapeHtmlView;
  window.cssColorToRgb = cssColorToRgb;

  // Secondary exports (less frequently used externally)
  window.ccUtils = {
    escapeHtml: escapeHtml,
    escapeHtmlView: escapeHtmlView,
    clamp: clamp,
    hexToRgb: hexToRgb,
    cssColorToRgb: cssColorToRgb,
    rgbToHex: rgbToHex,
    shadeHex: shadeHex
  };

})();
