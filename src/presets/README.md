# Preset System

This directory contains CSS files for all presets defined in `src/config.ts`, plus the default base preset.

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

Each preset has its own CSS file with two sections:

1. **Light mode** - `@variant preset-light`
2. **Dark mode** - `@variant preset-dark`

Example from `violet-bloom.css`:

```css
/* Theme: Violet Bloom */
[data-preset="violet-bloom"] {
  @variant preset-light {
    --background: #fdfdfd;
    --foreground: #000000;
    --primary: #7033ff;
    /* ... more variables */
  }

  @variant preset-dark {
    --background: #1a1b1e;
    --foreground: #f0f0f0;
    --primary: #8c5cff;
    /* ... more variables */
  }
}
```

## Default Preset

The `default.css` file contains the base theme that's used when no `data-preset` attribute is set. This file is **manually maintained** and should be updated if you want to change the default appearance.

## Regenerating Preset Files

If you modify `src/config.ts`, you need to regenerate the CSS files:

```bash
bun run generate:presets
```

This will:

1. Read all presets from `src/config.ts`
2. Generate individual CSS files for each theme
3. Update `src/config.css` with imports for all themes (preserving default.css import)

**Note:** The script will NOT regenerate `default.css` - that file must be manually maintained.

## Files

- **default.css** - The base/fallback theme (manually maintained)
- **Individual theme files** (`anew.css`, `violet-bloom.css`, etc.) - CSS variables for each theme preset
- **index.css** - Auto-generated file that imports all theme CSS files (including default.css)
- **README.md** - This documentation file
- **index.ts** - List of preset tuples

## Adding a New Theme

1. Add your theme to `src/config.ts`
2. Run `npm run generate:themes`
3. The new theme CSS file will be automatically created and imported
