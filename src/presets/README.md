# Preset System

This directory contains CSS files for all presets defined in `src/presets/index.ts`, plus the default base preset.

## How It Works

The preset system uses CSS custom properties (CSS variables) and applies themes via a `data-preset` attribute on the root HTML element. This is more performant than applying styles via JavaScript.

### Theme Selection

When a user selects a preset, the `data-preset` attribute is set on the `<html>` element:

```html
<html data-preset="violet-bloom" class="dark">
  <!-- Your app -->
</html>
```

### CSS Structure

Each preset has its own CSS file with three sections:

1. **Light mode** - `[data-preset="theme-name"]`
2. **Dark mode** - `[data-preset="theme-name"].dark`
3. **Scheme light** - `[data-preset="theme-name"] .scheme-light`

Example from `violet-bloom.css`:

```css
[data-preset="violet-bloom"] {
  --background: #fdfdfd;
  --foreground: #000000;
  --primary: #7033ff;
  /* ... more variables */
}

[data-preset="violet-bloom"].dark {
  --background: #1a1b1e;
  --foreground: #f0f0f0;
  --primary: #8c5cff;
  /* ... more variables */
}

[data-preset="violet-bloom"] .scheme-light {
  --background: #fdfdfd;
  --foreground: #000000;
  /* ... forces light theme colors even in dark mode */
}
```

## Default Preset

The `default.css` file contains the base theme that's used when no `data-preset` attribute is set. This file is **manually maintained** and should be updated if you want to change the default appearance.

## Regenerating Preset Files

If you modify `src/presets/index.ts`, you need to regenerate the CSS files:

```bash
npm run generate:themes
```

This will:

1. Read all theme presets from `theme-presets.ts`
2. Generate individual CSS files for each theme
3. Update `index.css` with imports for all themes (preserving default.css import)

**Note:** The script will NOT regenerate `default.css` - that file must be manually maintained.

## Files

- **default.css** - The base/fallback theme (manually maintained)
- **Individual theme files** (`anew.css`, `violet-bloom.css`, etc.) - CSS variables for each theme preset
- **index.css** - Auto-generated file that imports all theme CSS files (including default.css)
- **README.md** - This documentation file
- **SCHEME_LIGHT_EXAMPLE.md** - Usage examples for `.scheme-light` override

## Adding a New Theme

1. Add your theme to `src/config/theme-presets.ts`
2. Run `npm run generate:themes`
3. The new theme CSS file will be automatically created and imported

## Migration Notes

This system replaces the previous JavaScript-based theme application (`applyThemeToElement` from `theme-utils.ts`). Benefits include:

- **Better Performance** - CSS does the work instead of JavaScript
- **Simpler Code** - No need to programmatically set inline styles
- **Better Developer Experience** - Easier to debug with DevTools
- **Standard Web Platform** - Uses native CSS features

## Dark Mode

Dark mode is controlled by the `.dark` class on the root element, managed by `next-themes`. Each theme provides both light and dark variants that automatically activate based on this class.

## Scheme Light Override

Each theme also includes a `.scheme-light` selector that forces elements to use the light theme colors regardless of the global dark mode setting. This is useful for components that should always appear in light mode.

Example structure:

```css
[data-preset="violet-bloom"] .scheme-light {
  --background: #fdfdfd;
  --foreground: #000000;
  /* ... all light theme variables */
}
```

Usage:

```html
<!-- This element will use light theme colors even in dark mode -->
<div class="scheme-light">Always light themed content</div>
```

See `SCHEME_LIGHT_EXAMPLE.md` for more detailed usage examples.
