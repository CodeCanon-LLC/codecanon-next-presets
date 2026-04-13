# @codecanon/next-presets

50+ shadcn design-system presets with light/dark mode support for React apps.

## Table of Contents

- [Installation](#installation)
- [Setup](#setup)
- [Basic Usage](#basic-usage)
- [API Reference](#api-reference)
- [Extending with Custom Presets](#extending-with-custom-presets)
- [Forcing Light or Dark in a Sub-tree](#forcing-light-or-dark-in-a-sub-tree)
- [Development](#development)

---

## Installation

```bash
npm install @codecanon/next-presets
# pnpm add @codecanon/next-presets
# yarn add @codecanon/next-presets
# bun add @codecanon/next-presets
```

---

## Setup

### 1. Import the styles

Add this to your global CSS file **before** your own theme variables so preset styles are available:

```css
/* app/globals.css */
@import "@codecanon/next-presets/styles.css";
```

> **Tailwind CSS v4 users:** place the `@import` before your `@import "tailwindcss"` line, or at the top of your entry CSS, so the preset tokens are in scope when Tailwind processes your file.

### 2. Wrap your app with providers

Both `ThemeProvider` (light/dark mode) and `PresetProvider` (preset selection) must wrap your entire application. In Next.js, add them to `app/layout.tsx`:

```tsx
// app/layout.tsx
import {
  ThemeProvider,
  PresetProvider,
} from "@codecanon/next-presets"
import "./globals.css"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider defaultTheme="system">
          <PresetProvider>
            {children}
          </PresetProvider>
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

Wrap a section of your app with `PresetPicker`, then place `PresetPickerSheet` (the slide-out panel) anywhere inside it:

```tsx
"use client"

import {
  PresetPicker,
  PresetPickerSheet,
  PresetPickerContent,
  PresetPickerThemeToggleGroup,
  usePresetPicker,
} from "@codecanon/next-presets"

function OpenPickerButton() {
  const { toggleOpen } = usePresetPicker()
  return <button onClick={toggleOpen}>Open Themes</button>
}

export default function Page() {
  return (
    <PresetPicker>
      <main>
        <OpenPickerButton />
        {/* your page content */}
      </main>

      <PresetPickerSheet>
        {/* optional: light / dark / system toggle */}
        <PresetPickerThemeToggleGroup />
        {/* scrollable list of presets */}
        <PresetPickerContent />
      </PresetPickerSheet>
    </PresetPicker>
  )
}
```

`PresetPickerSheet` is a non-modal slide-out panel. Open/close state is managed by `PresetPicker` context and exposed via `usePresetPicker()`.

---

## API Reference

### Providers

| Component | Props | Description |
|-----------|-------|-------------|
| `ThemeProvider` | `defaultTheme`, `themeKey`, `attribute`, …(all next-themes props) | Wraps next-themes; always adds `data-preset-theme` attribute |
| `PresetProvider` | `defaultPreset`, `presetKey`, `presetAttr` | Persists selected preset; sets `data-preset` on `<html>` |

### Picker Components

| Component | Key Props | Description |
|-----------|-----------|-------------|
| `PresetPicker` | — | Context provider for open/close state |
| `PresetPickerSheet` | — | Slide-out panel (wraps Radix Dialog) |
| `PresetPickerContent` | `presets`, `previewCard`, `showDock` | Searchable, keyboard-navigable preset list |
| `PresetPickerThemeToggleGroup` | — | Light / Dark / System toggle buttons |
| `DefaultAppPreviewCard` | `presetKey`, `label`, `active`, `highlighted`, `showDock` | Miniature app preview shown per preset |

### Hooks

| Hook | Returns | Description |
|------|---------|-------------|
| `useTheme()` | `{ theme, setTheme, colorScheme, isDarkTheme, resolvedTheme, systemTheme }` | Active theme state |
| `usePreset()` | `{ preset, setPreset, resetPreset }` | Active preset state |
| `usePresetPicker()` | `{ open, setOpen, toggleOpen }` | Picker open/close state (must be inside `<PresetPicker>`) |

### Exports

| Export | Type | Description |
|--------|------|-------------|
| `PRESETS` | `readonly [string, string][]` | All 50+ built-in preset tuples `[id, label]` |
| `PresetKeys` | `type` | Union of all built-in preset IDs |
| `PresetTuple` | `type` | `readonly [string, string]` — describes one preset entry |
| `DEFAULT_PRESET` | `PresetKeys` | `"nuteral"` |

---

## Extending with Custom Presets

You can add your own presets alongside the built-in ones. There are two approaches depending on your build setup.

### Approach A — Tailwind CSS v4 (recommended)

If your project uses Tailwind CSS v4 with PostCSS, you can write preset variables using the `@variant preset-light` / `@variant preset-dark` directives for a cleaner authoring experience.

**1. Import `custom-variants.css` in your global CSS**

Add the import **before** your custom preset files so the variant definitions are available:

```css
/* app/globals.css */
@import "@codecanon/next-presets/styles.css";
@import "@codecanon/next-presets/custom-variants.css";

/* your custom preset file */
@import "./my-brand-preset.css";
```

**2. Create your preset CSS file**

```css
/* my-brand-preset.css */
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

**3. Pass your preset to `PresetPickerContent`**

```tsx
import { PRESETS, PresetPickerContent } from "@codecanon/next-presets"

const MY_PRESETS = [
  ...PRESETS,
  ["my-brand", "My Brand"] as const,
]

// Inside your picker:
<PresetPickerContent presets={MY_PRESETS} />
```

Clicking "My Brand" in the picker sets `data-preset="my-brand"` on `<html>`, which activates your CSS variables.

**TypeScript tip:** use `PresetTuple` to type your preset entries:

```ts
import { PRESETS, type PresetTuple } from "@codecanon/next-presets"

const CUSTOM_PRESETS: readonly PresetTuple[] = [
  ...PRESETS,
  ["my-brand", "My Brand"],
]
```

---

### Approach B — Plain CSS (no Tailwind v4 required)

If you are not using Tailwind CSS v4, write the selectors directly. The library sets these attributes on `<html>` when dark mode is active:

| Source | Dark attribute / class |
|--------|----------------------|
| next-themes (class mode) | `class="dark"` |
| next-themes (data mode) | `data-theme="dark"` |
| Library's `ThemeProvider` | `data-preset-theme="dark"` |

Target any combination you need:

```css
/* my-brand-preset.css — no @variant needed */
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
@import "@codecanon/next-presets/styles.css";
@import "./my-brand-preset.css";
```

Then pass the preset to `PresetPickerContent` the same way as shown in Approach A.

---

## Forcing Light or Dark in a Sub-tree

Add `scheme-light` or `scheme-dark` to any element to pin it to a specific color scheme regardless of the global theme:

```tsx
{/* Always renders in light mode, even when the app is in dark mode */}
<div className="scheme-light">
  <MyComponent />
</div>

{/* Always renders in dark mode */}
<div className="scheme-dark">
  <MyComponent />
</div>
```

This is useful for marketing sections, embedded previews, or UI components that must always appear in a fixed scheme.

---

## Development

```bash
pnpm install
pnpm run build        # compile library (JS + CSS)
pnpm run dev          # watch mode
pnpm test             # run tests
pnpm run typecheck    # type-check
pnpm run format       # format with prettier
pnpm run play         # start the React playground
```
