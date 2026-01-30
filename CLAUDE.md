# CLAUDE.md - AI Assistant Guide for C-エディタ

## Project Overview

**C-エディタ** (C-Editor) is a Japanese text editor Progressive Web App (PWA) designed for creative writing. It's a single-page application built entirely in a single HTML file with embedded CSS and JavaScript.

- **Current Version**: 1.192 (as shown in `index.html` title)
- **Language**: Japanese UI
- **Type**: Offline-capable PWA with service worker caching

## Repository Structure

```
/
├── index.html              # Main application (28k+ lines, contains all HTML/CSS/JS)
├── sw.js                   # Service worker for offline caching
├── manifest.webmanifest    # PWA manifest configuration
├── README.md               # Brief project description (Japanese)
├── icons/                  # Application icons
│   ├── favicon-16.png
│   ├── favicon-32.png
│   ├── iconsicon-192.png   # PWA icon 192x192
│   └── iconsicon-512.png   # PWA icon 512x512
└── CLAUDE.md               # This file
```

## Technology Stack

- **Frontend**: Vanilla JavaScript (no frameworks)
- **Styling**: CSS with CSS custom properties (variables) for theming
- **Fonts**: Google Fonts (Shippori Mincho, Noto Sans JP, Zen Old Mincho, M PLUS Rounded 1c, Yuji Syuku)
- **Storage**: localStorage for persistence
- **PWA**: Service worker with cache-first strategy

## Key Features

1. **Multi-tab editing** - Multiple document tabs with character count tracking
2. **Theme support** - Light, dark, sepia, blue, and green themes
3. **Focus mode** - Distraction-free writing mode
4. **Preview pane** - Real-time preview with vertical/horizontal writing support
5. **Panels** - Structure, character, world, terms, memo, outline, and search panels
6. **Reader view** - Reading mode with bookmark support
7. **Ruby text support** - Japanese furigana annotations

## Architecture Patterns

### Single-File Architecture
The entire application lives in `index.html`. This includes:
- CSS styles in `<style>` tags
- JavaScript in `<script>` tags
- HTML markup

### CSS Custom Properties
Theme colors are managed via CSS variables in `:root` and body class selectors:
```css
:root {
    --bg-color: #f3f4f6;
    --panel-bg: #ffffff;
    --border-color: #e5e7eb;
    /* ... */
}
body.theme-dark {
    --bg-color: #1f2937;
    /* ... */
}
```

### Panel System
Panels follow a consistent pattern with:
- `.panel-header` - Header with title and controls
- `.panel-controls` - Action buttons
- Panel state managed via CSS classes (`.open`, `.docked`)
- Resizable via dynamic dock resizers

### Event Handling
- Heavy use of event delegation for dynamic elements
- Keyboard shortcuts throughout (Ctrl+Shift+P/M/O in focus mode)
- Pointer events for drag/resize operations

## Development Guidelines

### Code Style
- Functions use camelCase naming
- DOM elements accessed via `document.getElementById()`
- State stored in global variables and localStorage
- Inline event handlers avoided; use `addEventListener`

### Making Changes
1. **CSS changes**: Locate the appropriate `<style>` section in `index.html`
2. **JavaScript changes**: Find the relevant function in the `<script>` sections
3. **HTML changes**: Modify the markup in the body section

### Version Updates
- Update the version number in the `<title>` tag: `ⓒエディタ v1.xxx`
- Consider updating `CACHE_NAME` in `sw.js` if assets change

### Testing Considerations
- Test in both normal and focus modes
- Verify theme switching works
- Check PWA offline functionality
- Test panel resize/dock operations
- Verify localStorage persistence

## Important Functions

| Function | Purpose |
|----------|---------|
| `initHotfix()` | Main initialization entry point |
| `updatePreview()` | Refreshes the preview pane |
| `renderInputTabs()` | Renders tab UI |
| `updateTabMetaLabels()` | Updates character counts on tabs |
| `openFocusOverlay(kind)` | Opens focus mode overlays |
| `applyDockedPanelWidths()` | Applies panel width settings |
| `__ccUpdateDockResizers()` | Updates resize handles between panels |

## Commit Message Conventions

Based on recent commit history, use descriptive messages like:
- "Update index.html to version X.XX"
- "Adjust [component] [property]"
- "Fix [issue description]"
- "Reduce/Increase [element] [dimension]"

## Common Tasks

### Adding a new theme
1. Add new `body.theme-{name}` CSS rules with color variables
2. Add theme option to the settings UI
3. Handle theme switching in JavaScript

### Adding a new panel
1. Create panel HTML with `.panel-header` and body structure
2. Add panel key to `PANEL_KEYS` array
3. Implement open/close/dock functionality
4. Add toggle button to ribbon UI

### Modifying keyboard shortcuts
Search for `addEventListener('keydown'` to find existing handlers and add new shortcuts following the same pattern.

## Service Worker (sw.js)

The service worker implements:
- **Cache-first strategy** for assets
- **Network fallback** for uncached requests
- **Offline fallback** to `index.html`
- Cache versioning via `CACHE_NAME`

Update `CACHE_NAME` when deploying changes to force cache refresh.

## PWA Configuration (manifest.webmanifest)

```json
{
  "name": "C-エディタ",
  "short_name": "C-エディタ",
  "display": "standalone",
  "background_color": "#f3f4f6",
  "theme_color": "#f3f4f6"
}
```

## Notes for AI Assistants

1. **Large single file**: The `index.html` is 28k+ lines. Read specific sections rather than the entire file when making targeted changes.

2. **Japanese UI**: All user-facing text is in Japanese. Maintain consistency.

3. **No build process**: Changes take effect immediately without compilation.

4. **localStorage keys**: The app uses various localStorage keys for persistence. Search for `localStorage.` to find them.

5. **CSS specificity**: Dark theme overrides require `body.theme-dark` prefix for proper specificity.

6. **Panel system complexity**: The panel dock/undock/resize system has interdependent functions. Changes may require updates in multiple places.
