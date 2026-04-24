# @codecanon/next-presets

50+ shadcn design-system presets with light/dark mode support for React apps.

<p>
  <a href="https://codecanon.dev/next-presets/demo">
    <img src="https://img.shields.io/badge/%F0%9F%9A%80%20%20Checkout%20Live%20Demo%20%20%E2%86%92-0d9488?style=for-the-badge&labelColor=0d9488&color=0d9488" alt="Checkout Demo" height="50" />
  </a>
</p>

## Table of Contents

- [Installation](#installation)
- [Setup](#setup)
- [Basic Usage](#basic-usage)
- [Controlled Preset (Database-backed)](#controlled-preset-database-backed)
- [API Reference](#api-reference)
- [Reducing Bundle Size](#reducing-bundle-size)
- [Extending with Custom Presets](#extending-with-custom-presets)
- [Forcing Light or Dark in a Sub-tree](#forcing-light-or-dark-in-a-sub-tree)
- [Development](#development)

---

## Installation

```bash
bun add @codecanon/next-presets
pnpm add @codecanon/next-presets
npm install @codecanon/next-presets
yarn add @codecanon/next-presets
```

### Picker Components (shadcn registry)

The visual picker components are not bundled with the npm package — they live in a shadcn registry and get copied directly into your project, just like any other shadcn component.

```bash
# Slide-out sheet picker (includes preset-preview-card as a dependency)
pnpm shadcn@latest add https://registry.codecanon.dev/r/preset-picker

# Compact dropdown picker (includes preset-preview-dots as a dependency)
pnpm shadcn@latest add https://registry.codecanon.dev/r/preset-dropdown-picker

# Application preview card with sidebar
pnpm shadcn@latest add https://registry.codecanon.dev/r/preset-preview-card

# Application preview card with dock
pnpm shadcn@latest add https://registry.codecanon.dev/r/preset-dock-preview-card

# Tweakcn like preset preview color dots
pnpm shadcn@latest add https://registry.codecanon.dev/r/preset-preview-dots
```

This copies the component files into your project (e.g. `components/ui/preset-picker.tsx`) along with any shadcn dependencies (button, sheet, input-group, etc.).

---

## Setup

### 1. Import the styles

Add this to your global CSS file **before** your own theme variables so preset styles are available **(import in order)**:

```css
/* app/globals.css */
@import "@codecanon/next-presets/default/nuteral.css";
@import "@codecanon/next-presets/styles.css";
```

The `default/` import sets the chosen preset as the `:root` fallback — the initial look before JavaScript applies the `data-preset` attribute. `styles.css` includes all preset definitions alongside Tailwind and shadcn base styles.

> **Tailwind CSS v4 users:** place the `@import` before your `@import "tailwindcss"` line, or at the top of your entry CSS, so the preset tokens are in scope when Tailwind processes your file.

### 2. Wrap your app with providers

Both `ThemeProvider` (light/dark mode) and `PresetProvider` (preset selection) must wrap your entire application. In Next.js, add them to `app/layout.tsx`:

```tsx
// app/layout.tsx
import { ThemeProvider, PresetProvider } from "@codecanon/next-presets"
import "./globals.css"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <PresetProvider>{children}</PresetProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
```

`ThemeProvider` wraps [next-themes](https://github.com/pacocoursey/next-themes) and always adds `data-preset-theme` to the attributes managed on `<html>`, on top of whichever `attribute` you configure. This keeps preset CSS variables in sync with the active theme regardless of whether next-themes uses classes or data attributes.

`PresetProvider` persists the selected preset to `localStorage` and sets `data-preset` on `<html>`.

---

## Basic Usage

Wrap a section of your app with `PresetPicker`, then place `PresetPickerContent` (the slide-out panel) anywhere inside it:

```tsx
"use client"

import {
  PresetPicker,
  PresetPickerContent,
  PresetPickerTrigger,
  PresetPickerThemeToggleGroup,
  PresetPickerSearch,
  PresetPickerList,
} from "@/components/ui/preset-picker"

export default function Page() {
  return (
    <PresetPicker>
      <main>
        <PresetPickerTrigger>Open Preset Picker</PresetPickerTrigger>
        {/* your page content */}
      </main>

      <PresetPickerContent>
        {/* optional: light / dark / system toggle */}
        <PresetPickerThemeToggleGroup />
        {/* search input to filter presets */}
        <PresetPickerSearch />
        {/* scrollable list of presets */}
        <PresetPickerList />
      </PresetPickerContent>
    </PresetPicker>
  )
}
```

`PresetPickerContent` is a non-modal slide-out panel. Open/close state is managed by `PresetPicker` context and exposed via `usePresetPicker()`.

---

## Controlled Preset (Database-backed)

`PresetProvider` supports a **controlled mode** for cases where the active preset is stored in a database. Pass `preset` and `onPresetChange` to take control of the value:

```tsx
// app/providers.tsx
"use client"

import { useState, useEffect } from "react"
import { PresetProvider } from "@codecanon/next-presets"

export function Providers({ children }: { children: React.ReactNode }) {
  const [dbPreset, setDbPreset] = useState<string | undefined>(undefined)

  useEffect(() => {
    fetchUserPreset().then(setDbPreset)
  }, [])

  async function handlePresetChange(preset: string | undefined) {
    setDbPreset(preset) // optimistic update — no visual delay
    await saveUserPreset(preset) // persist to DB in the background
  }

  return (
    <PresetProvider preset={dbPreset} onPresetChange={handlePresetChange}>
      {children}
    </PresetProvider>
  )
}
```

**How it works:**

1. **Fast initial render** — on first load, `preset` is `undefined` (DB not yet fetched). `PresetProvider` falls back to the localStorage value so the page renders with the correct preset immediately, with no flash.
2. **DB value takes over** — once `preset` resolves to a string, it becomes the authoritative value and overrides localStorage.
3. **User picks a preset** — `onPresetChange` fires immediately. Update your state optimistically (as shown above) so the UI switches with no delay while the DB write happens in the background.
4. **localStorage stays in sync** — every preset change (user-initiated or controlled) is written to localStorage, so the next page load is fast regardless of DB latency.

| Prop             | Type                                    | Description                                                                                                       |
| ---------------- | --------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `preset`         | `string \| undefined`                   | Controlled preset ID. Omit (or pass `undefined`) to use localStorage only — useful while the DB value is loading. |
| `onPresetChange` | `(preset: string \| undefined) => void` | Fires when the user selects a new preset. Use this to persist the value to your database.                         |

---

## Dropdown Picker

```tsx
import {
  PresetDropdownPicker,
  PresetDropdownPickerTrigger,
  PresetDropdownPickerContent,
  PresetDropdownPickerSearch,
  PresetDropdownPickerToolbar,
  PresetDropdownPickerList,
} from "@/components/ui/preset-dropdown-picker"

export function Page() {
  return (
    <div>
      <nav>
        <MyAppLogo />

        {/* Usage */}
        <PresetDropdownPicker>
          <PresetDropdownPickerTrigger />
          <PresetDropdownPickerContent>
            <PresetDropdownPickerSearch />
            <PresetDropdownPickerToolbar />
            <PresetDropdownPickerList />
          </PresetDropdownPickerContent>
        </PresetDropdownPicker>
      </nav>
      <main>{/* My app content... */}</main>
    <div>
  )
}
```

## API Reference

### Providers

| Component        | Props                                                               | Description                                                  |
| ---------------- | ------------------------------------------------------------------- | ------------------------------------------------------------ |
| `ThemeProvider`  | `defaultTheme`, `storageKey`, `attribute`, …(all next-themes props) | Wraps next-themes; always adds `data-preset-theme` attribute |
| `PresetProvider` | `storageKey`, `attribute`, `preset`, `onPresetChange`, `presets`    | Persists selected preset; sets `data-preset` on `<html>`     |

### Picker Components

> Installed via the shadcn registry — not exported from the npm package.
> Run `pnpm shadcn@latest add https://registry.codecanon.dev/r/preset-picker` first.

**`@/components/ui/preset-picker`**

| Component                      | Key Props                  | Description                          |
| ------------------------------ | -------------------------- | ------------------------------------ |
| `PresetPicker`                 | shadcn sheet props         | Picker sheet and context             |
| `PresetPickerTrigger`          | shadcn sheet trigger props | Picker trigger                       |
| `PresetPickerContent`          | shadcn sheet content props | Picker content                       |
| `PresetPickerSearch`           | —                          | Picker search to filter preset list  |
| `PresetPickerList`             | `card`                     | Picker preset list                   |
| `PresetPickerThemeToggleGroup` | —                          | Light / Dark / System toggle buttons |

**`@/components/ui/preset-dropdown-picker`**

| Component                     | Key Props                          | Description                                  |
| ----------------------------- | ---------------------------------- | -------------------------------------------- |
| `PresetDropdownPicker`        | shadcn dropdown menu props         | Dropdown picker menu and context             |
| `PresetDropdownPickerTrigger` | shadcn dropdown menu trigger props | Dropdown picker Trigger                      |
| `PresetDropdownPickerContent` | shadcn dropdown menu content props | Dropdown picker content                      |
| `PresetDropdownPickerSearch`  | shadcn input group input props     | Dropdown picker search to filter preset list |
| `PresetDropdownPickerToolbar` | button props                       | Dropdown picker toolbar button               |
| `PresetDropdownPickerList`    | div props                          | Dropdown picker preset list                  |

**`@/components/ui/preset-preview-card`** · **`@/components/ui/preset-preview-dots`**

| Component               | Key Props               | Description                                      |
| ----------------------- | ----------------------- | ------------------------------------------------ |
| `PresetPreviewCard`     | `preset`, `highlighted` | Miniature app preview shown per preset (sidebar) |
| `PresetDockPreviewCard` | `preset`, `highlighted` | Miniature app preview shown per preset (dock)    |
| `PresetPreviewDots`     | `preset`                | Four color-swatch dots for a preset              |

### Hooks

**From `@codecanon/next-presets` (npm package)**

| Hook                            | Returns                                                                     | Description         |
| ------------------------------- | --------------------------------------------------------------------------- | ------------------- |
| `useTheme()`                    | `{ theme, setTheme, colorScheme, isDarkTheme, resolvedTheme, systemTheme }` | Active theme state  |
| `usePreset()`                   | `{ preset, presetName, presets, setPreset, resetPreset }`                   | Active preset state |
| `usePresetName(preset: string)` | `string`                                                                    | Preset display name |

**From installed registry components**

| Hook                        | Source file                              | Returns                                                                                                       | Description                                                             |
| --------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `usePresetPicker()`         | `@/components/ui/preset-picker`          | `{open, query, highlightedIndex, filteredPresets, modal, setOpen, toggleOpen, setQuery, setHighlightedIndex}` | Picker context state (must be inside `<PresetPicker>`)                  |
| `usePresetDropdownPicker()` | `@/components/ui/preset-dropdown-picker` | `{open, query, setOpen, toggleOpen, setQuery}`                                                                | Dropdown Picker context state (must be inside `<PresetDropdownPicker>`) |

### Exports

| Export          | Type                                                                                   | Description                                              |
| --------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `PRESETS`       | `readonly [string, string][]`                                                          | All 50+ built-in preset tuples `[id, label]`             |
| `PRESET_BY_ID`  | `Readonly<{ [preset: string]: string }>`                                               | Preset id to label key:value pair                        |
| `filterPresets` | `(ids: string[]) => PresetTuple[]`                                                     | Returns a subset of `PRESETS` in canonical order         |
| `getPresetName` | `(preset?: string, {presets?: PresetTuple[]; defaultValue?: string}) => PresetTuple[]` | Returns preset label/name                                |
| `PresetKeys`    | `type`                                                                                 | Union of all built-in preset IDs                         |
| `PresetTuple`   | `type`                                                                                 | `readonly [string, string]` — describes one preset entry |

---

## Setting a Default Preset

Change the `default/` import to whichever preset you want as the initial `:root` fallback:

```diff
-@import "@codecanon/next-presets/default/nuteral.css";
+@import "@codecanon/next-presets/default/codecanon.css";
 @import "@codecanon/next-presets/styles.css";
```

This applies your preset's light/dark variables to `:root` so the page renders correctly before JavaScript runs:

```css
:root {
  @variant preset-light {
    /* preset variables */
  }

  @variant preset-dark {
    /* preset variables */
  }
}
```

---

## Reducing Bundle Size

By default `styles.css` includes all 50+ preset definitions. If your app only uses a handful of presets you can strip the rest from the compiled CSS and from the `PresetPicker` UI.

### Option A — Vite plugin (recommended)

Install the plugin in your `vite.config.ts`. It intercepts the `styles.css` import and the main package import automatically — no changes to your existing code needed.

```typescript
// vite.config.ts
import { nextPresetsPlugin } from "@codecanon/next-presets/vite"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [
    nextPresetsPlugin({
      include: ["claude", "anew", "rose"],
    }),
  ],
})
```

| Option    | Type            | Description                                                                        |
| --------- | --------------- | ---------------------------------------------------------------------------------- |
| `include` | `string[]`      | Preset IDs to include. All unlisted built-in presets are excluded.                 |
| `exclude` | `string[]`      | Preset IDs to exclude from the built-in list. Ignored when `include` is also set.  |
| `add`     | `PresetTuple[]` | Custom preset tuples `[id, label]` to add alongside the filtered built-in presets. |

The plugin:

- Replaces `styles.css` with a virtual bundle containing only `components.css` + the selected preset files
- Overrides the `PRESETS` export so `PresetPicker` only shows the selected presets
- Warns at startup if an unknown preset ID is passed; falls back to all presets if none are valid

Your existing CSS and JS imports stay unchanged:

```css
/* app/globals.css — no changes needed */
@import "@codecanon/next-presets/default/nuteral.css";
@import "@codecanon/next-presets/styles.css";
```

### Option B — Manual selective imports (any bundler)

Skip `styles.css` entirely and import only what you need. `components.css` is pre-compiled and does not require Tailwind to be installed on the consumer side.

```css
/* app/globals.css */
@import "@codecanon/next-presets/default/nuteral.css";
@import "@codecanon/next-presets/components.css";

/* only the presets you want in the picker */
@import "@codecanon/next-presets/presets/nuteral.css";
@import "@codecanon/next-presets/presets/claude.css";
@import "@codecanon/next-presets/presets/anew.css";
```

Then filter the `PRESETS` array so `PresetPicker` shows only those presets:

```tsx
import { filterPresets, PresetProvider } from "@codecanon/next-presets"

const MY_PRESETS = filterPresets(["nuteral", "claude", "anew"])

<PresetProvider presets={MY_PRESETS} />
```

`filterPresets` returns the matching entries in their original canonical order.

### CSS export reference

| Import path                                   | Contents                                                         |
| --------------------------------------------- | ---------------------------------------------------------------- |
| `@codecanon/next-presets/styles.css`          | All-in-one: components + all 50+ presets                         |
| `@codecanon/next-presets/components.css`      | Pre-compiled Tailwind/shadcn/custom-variants only                |
| `@codecanon/next-presets/presets.css`         | All 50+ presets combined - `[data-preset]` scoped (for switcher) |
| `@codecanon/next-presets/default/{id}.css`    | Single preset — `:root` scoped (initial default)                 |
| `@codecanon/next-presets/presets/{id}.css`    | Single preset — `[data-preset]` scoped (for switcher)            |
| `@codecanon/next-presets/custom-variants.css` | `@custom-variant` definitions for preset authoring               |

---

## Extending with Custom Presets

You can add your own presets alongside the built-in ones. There are two approaches depending on your build setup.

### Approach A — Tailwind CSS v4 (recommended)

If your project uses Tailwind CSS v4 with PostCSS, you can write preset variables using the `@variant preset-light` / `@variant preset-dark` directives for a cleaner authoring experience.

**1. Import `custom-variants.css` in your global CSS**

Add the import **before** your custom preset files so the variant definitions are available:

```css
/* app/globals.css */
@import "./my-brand-preset.css"; /* your custom preset file */
@import "@codecanon/next-presets/styles.css";
```

**2. Create your preset CSS file**

```css
/* my-brand-preset.css */
@import "@codecanon/next-presets/custom-variants.css";

[data-preset="my-brand"] {
  @variant preset-light {
    --background: oklch(0.98 0.01 240);
    --foreground: oklch(0.15 0.02 240);
    --primary: oklch(0.55 0.2 240);
    --primary-foreground: oklch(0.98 0 0);
    --secondary: oklch(0.92 0.02 240);
    --secondary-foreground: oklch(0.15 0.02 240);
    --muted: oklch(0.94 0.01 240);
    --muted-foreground: oklch(0.5 0.05 240);
    --accent: oklch(0.9 0.04 240);
    --accent-foreground: oklch(0.15 0.02 240);
    --border: oklch(0.88 0.02 240);
    --input: oklch(0.88 0.02 240);
    --ring: oklch(0.55 0.2 240);
    --radius: 0.5rem;
  }

  @variant preset-dark {
    --background: oklch(0.13 0.02 240);
    --foreground: oklch(0.95 0.01 240);
    --primary: oklch(0.65 0.18 240);
    --primary-foreground: oklch(0.1 0 0);
    --secondary: oklch(0.22 0.03 240);
    --secondary-foreground: oklch(0.95 0.01 240);
    --muted: oklch(0.22 0.03 240);
    --muted-foreground: oklch(0.6 0.05 240);
    --accent: oklch(0.28 0.04 240);
    --accent-foreground: oklch(0.95 0.01 240);
    --border: oklch(0.25 0.03 240);
    --input: oklch(0.28 0.03 240);
    --ring: oklch(0.5 0.15 240);
    --radius: 0.5rem;
  }
}
```

The `@variant preset-light` / `@variant preset-dark` directives expand to cover all common next-themes configurations: `.dark` / `.light` classes, `data-theme="dark"` / `data-theme="light"` attributes, and `data-preset-theme="dark"` / `data-preset-theme="light"` (set by the library's `ThemeProvider`). You do not need to manage selectors yourself.

If you want your brand preset to be the default, add `:root` to the selector and import `custom-variants.css` at the top of your file:

```css
/* my-brand-preset.css */
@import "@codecanon/next-presets/custom-variants.css";

:root, /* applies your preset as the default fallback when no preset is selected */
[data-preset="my-brand"] {
  @variant preset-light {
  }

  @variant preset-dark {
  }
}
```

```css
/* app/globals.css */
@import "./my-brand-preset.css";
@import "@codecanon/next-presets/styles.css";
```

**3. Pass your preset to `PresetProvider`**

```tsx
import { PRESETS, PresetProvider } from "@codecanon/next-presets"

const MY_PRESETS = [
  ["my-brand", "My Brand"] as const,
  ...PRESETS,
]

<PresetProvider presets={MY_PRESETS} />
```

Clicking "My Brand" in the picker sets `data-preset="my-brand"` on `<html>`, which activates your CSS variables.

**TypeScript tip:** use `PresetTuple` to type your preset entries:

```ts
import { PRESETS, type PresetTuple } from "@codecanon/next-presets"

const CUSTOM_PRESETS: readonly PresetTuple[] = [
  ["my-brand", "My Brand"],
  ...PRESETS,
]
```

---

### Approach B — Plain CSS (no Tailwind v4 required)

If you are not using Tailwind CSS v4, write the selectors directly. The library sets these attributes on `<html>` when dark mode is active:

| Source                    | Dark attribute / class     |
| ------------------------- | -------------------------- |
| next-themes (class mode)  | `class="dark"`             |
| next-themes (data mode)   | `data-theme="dark"`        |
| Library's `ThemeProvider` | `data-preset-theme="dark"` |

Target any combination you need:

```css
/* my-brand-preset.css — no @variant needed */
:root,
[data-preset="my-brand"] {
  /* light mode (default) */
  --background: oklch(0.98 0.01 240);
  --foreground: oklch(0.15 0.02 240);
  --primary: oklch(0.55 0.2 240);
  --primary-foreground: oklch(0.98 0 0);
  /* … other variables … */
}

/* dark mode — target whichever attribute next-themes sets in your setup */
[data-preset="my-brand"].dark,
[data-preset="my-brand"][data-theme="dark"],
[data-preset="my-brand"][data-preset-theme="dark"] {
  --background: oklch(0.13 0.02 240);
  --foreground: oklch(0.95 0.01 240);
  --primary: oklch(0.65 0.18 240);
  --primary-foreground: oklch(0.1 0 0);
  /* … other variables … */
}
```

Import your file in your global CSS (no `custom-variants.css` import needed):

```css
@import "./my-brand-preset.css";
@import "@codecanon/next-presets/styles.css";
```

Then pass the preset to `PresetPickerContent` the same way as shown in Approach A.

---

## Forcing Light or Dark in a Sub-tree

Add `scheme-light` or `scheme-dark` to any element to pin it to a specific color scheme regardless of the global theme:

```tsx
<>
  {/* Always renders in light mode, even when the app is in dark mode */}
  <div className="scheme-light">
    <MyComponent />
  </div>

  {/* Always renders in dark mode */}
  <div className="scheme-dark">
    <MyComponent />
  </div>
</>
```

This is useful for marketing sections, embedded previews, or UI components that must always appear in a fixed scheme.

---

## Development

```bash
bun install
bun run build        # compile library (JS + CSS)
bun run dev          # watch mode
bun test             # run tests
bun run typecheck    # type-check
bun run format       # format with prettier
bun run play         # start the React playground
```
