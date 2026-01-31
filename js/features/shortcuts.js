/**
 * Keyboard Shortcuts Management for ⓒエディタ
 * Phase 3 refactoring: Extract shortcut utilities
 */
(function() {
  'use strict';

  // ===================================
  // Configuration
  // ===================================

  const SHORTCUTS_KEY = 'cc_editor_shortcuts';

  const DEFAULT_SHORTCUTS = {
    searchPanel: 'Ctrl+Alt+F',
    rubyDialog: 'Ctrl+Alt+R',
    saveDialog: 'Ctrl+Alt+S',
    jumpLine: 'Ctrl+Alt+G',
    newTab: 'Ctrl+Alt+N',
    newMemoTab: 'Ctrl+Alt+M',
    syncPreview: 'Ctrl+Alt+Enter',
    focusToggle: 'Ctrl+Alt+L',
    readerView: 'Ctrl+Alt+V',
    analysis: 'Ctrl+Alt+A',
    helpPanel: 'Ctrl+Alt+H'
  };

  // ===================================
  // Key Normalization
  // ===================================

  /**
   * Normalize a key name to a consistent format
   * @param {string} k - Key name
   * @returns {string} Normalized key name
   */
  function normalizeKeyName(k) {
    if (!k) return '';
    if (k === ' ') return 'Space';
    if (k.length === 1) return k.toUpperCase();
    // Normalize common names
    if (k === 'Esc') return 'Escape';
    return k[0].toUpperCase() + k.slice(1);
  }

  /**
   * Normalize a shortcut string (e.g., "ctrl+alt+f" -> "Ctrl+Alt+F")
   * @param {string} str - Shortcut string
   * @returns {string} Normalized shortcut string
   */
  function normalizeShortcutString(str) {
    if (!str) return '';
    const parts = String(str).split('+').map(s => s.trim()).filter(Boolean);
    const mods = [];
    let key = '';
    for (const p of parts) {
      const up = p.toLowerCase();
      if (up === 'ctrl' || up === 'control') mods.push('Ctrl');
      else if (up === 'alt' || up === 'option') mods.push('Alt');
      else if (up === 'shift') mods.push('Shift');
      else if (up === 'meta' || up === 'cmd' || up === 'command' || up === 'win') mods.push('Meta');
      else key = p;
    }
    const order = ['Ctrl', 'Alt', 'Shift', 'Meta'];
    const modsOrdered = order.filter(m => mods.includes(m));
    const keyNorm = normalizeKeyName(key);
    return (modsOrdered.concat(keyNorm ? [keyNorm] : [])).join('+');
  }

  /**
   * Convert a keyboard event to a shortcut string
   * @param {KeyboardEvent} e - Keyboard event
   * @returns {string} Shortcut string
   */
  function eventToShortcutString(e) {
    // Ignore pure modifier presses
    if (e.key === 'Control' || e.key === 'Shift' || e.key === 'Alt' || e.key === 'Meta') return '';
    const parts = [];
    if (e.ctrlKey) parts.push('Ctrl');
    if (e.altKey) parts.push('Alt');
    if (e.shiftKey) parts.push('Shift');
    if (e.metaKey) parts.push('Meta');
    parts.push(normalizeKeyName(e.key));
    return parts.join('+');
  }

  /**
   * Check if a keyboard event matches a shortcut string
   * @param {KeyboardEvent} e - Keyboard event
   * @param {string} comboStr - Shortcut string to match
   * @returns {boolean} True if matches
   */
  function matches(e, comboStr) {
    const a = eventToShortcutString(e);
    if (!a) return false;
    return a === normalizeShortcutString(comboStr);
  }

  // ===================================
  // Storage
  // ===================================

  /**
   * Get current shortcuts from localStorage (with defaults)
   * @returns {object} Shortcuts configuration
   */
  function getShortcuts() {
    try {
      const raw = localStorage.getItem(SHORTCUTS_KEY);
      const obj = raw ? JSON.parse(raw) : {};

      // Auto-fix browser-reserved shortcuts
      try {
        let changed = false;
        const nt = normalizeShortcutString(obj.newTab || '');
        const nmt = normalizeShortcutString(obj.newMemoTab || '');
        if (nt === 'Ctrl+N' || nt === 'Ctrl+Shift+N') {
          obj.newTab = DEFAULT_SHORTCUTS.newTab;
          changed = true;
        }
        if (nmt === 'Ctrl+Shift+N' || nmt === 'Ctrl+N') {
          obj.newMemoTab = DEFAULT_SHORTCUTS.newMemoTab;
          changed = true;
        }
        if (changed) localStorage.setItem(SHORTCUTS_KEY, JSON.stringify(obj));
      } catch (e) {}

      return {
        searchPanel: normalizeShortcutString(obj.searchPanel || DEFAULT_SHORTCUTS.searchPanel),
        rubyDialog: normalizeShortcutString(obj.rubyDialog || DEFAULT_SHORTCUTS.rubyDialog),
        saveDialog: normalizeShortcutString(obj.saveDialog || DEFAULT_SHORTCUTS.saveDialog),
        jumpLine: normalizeShortcutString(obj.jumpLine || DEFAULT_SHORTCUTS.jumpLine),
        newTab: normalizeShortcutString(obj.newTab || DEFAULT_SHORTCUTS.newTab),
        newMemoTab: normalizeShortcutString(obj.newMemoTab || DEFAULT_SHORTCUTS.newMemoTab),
        syncPreview: normalizeShortcutString(obj.syncPreview || DEFAULT_SHORTCUTS.syncPreview),
        focusToggle: normalizeShortcutString(obj.focusToggle || DEFAULT_SHORTCUTS.focusToggle),
        readerView: normalizeShortcutString(obj.readerView || DEFAULT_SHORTCUTS.readerView),
        analysis: normalizeShortcutString(obj.analysis || DEFAULT_SHORTCUTS.analysis),
        helpPanel: normalizeShortcutString(obj.helpPanel || DEFAULT_SHORTCUTS.helpPanel)
      };
    } catch (e) {
      // Return defaults if localStorage is unavailable
      return { ...DEFAULT_SHORTCUTS };
    }
  }

  /**
   * Save shortcuts to localStorage
   * @param {object} next - Shortcuts to save
   */
  function setShortcuts(next) {
    try {
      const payload = {
        searchPanel: normalizeShortcutString(next.searchPanel || DEFAULT_SHORTCUTS.searchPanel),
        rubyDialog: normalizeShortcutString(next.rubyDialog || DEFAULT_SHORTCUTS.rubyDialog),
        saveDialog: normalizeShortcutString(next.saveDialog || DEFAULT_SHORTCUTS.saveDialog),
        jumpLine: normalizeShortcutString(next.jumpLine || DEFAULT_SHORTCUTS.jumpLine),
        newTab: normalizeShortcutString(next.newTab || DEFAULT_SHORTCUTS.newTab),
        newMemoTab: normalizeShortcutString(next.newMemoTab || DEFAULT_SHORTCUTS.newMemoTab),
        syncPreview: normalizeShortcutString(next.syncPreview || DEFAULT_SHORTCUTS.syncPreview),
        focusToggle: normalizeShortcutString(next.focusToggle || DEFAULT_SHORTCUTS.focusToggle),
        readerView: normalizeShortcutString(next.readerView || DEFAULT_SHORTCUTS.readerView),
        analysis: normalizeShortcutString(next.analysis || DEFAULT_SHORTCUTS.analysis),
        helpPanel: normalizeShortcutString(next.helpPanel || DEFAULT_SHORTCUTS.helpPanel)
      };
      localStorage.setItem(SHORTCUTS_KEY, JSON.stringify(payload));

      // Update data-shortcut display if present
      try {
        const btnRuby = document.querySelector('.qip-ruby-dialog');
        if (btnRuby) btnRuby.dataset.shortcut = payload.rubyDialog;
      } catch (_) {}
    } catch (e) {
      // Silently fail if localStorage is unavailable
    }
  }

  // ===================================
  // Export to window
  // ===================================

  window.ccShortcuts = {
    // Configuration
    SHORTCUTS_KEY: SHORTCUTS_KEY,
    DEFAULT_SHORTCUTS: DEFAULT_SHORTCUTS,

    // Normalization functions
    normalizeKeyName: normalizeKeyName,
    normalizeShortcutString: normalizeShortcutString,
    eventToShortcutString: eventToShortcutString,
    matches: matches,

    // Storage functions
    getShortcuts: getShortcuts,
    setShortcuts: setShortcuts
  };

})();
