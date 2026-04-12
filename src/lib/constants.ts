const THEME_DARK = "dark"

const THEME_LIGHT = "light"

const THEME_SYSTEM = "system"

type ColorScheme = typeof THEME_DARK | typeof THEME_LIGHT

type Theme = ColorScheme | typeof THEME_SYSTEM

const DEFAULT_THEME: Theme = THEME_SYSTEM

const DEFAULT_COLOR_SCHEME: ColorScheme = THEME_LIGHT

const DEFAULT_PRESET_KEY = "preset"

const DEFAULT_PRESET_ATTR = "data-preset"

const DEFAULT_THEME_KEY = "theme"

const DEFAULT_THEME_ATTR = "data-theme"

/** Applied by next-themes to signal dark mode — used by preset CSS variables. */
const NEXT_THEME_PRESET_ATTR = "data-preset-theme"

export type { ColorScheme, Theme }

export {
  THEME_DARK,
  THEME_LIGHT,
  THEME_SYSTEM,
  DEFAULT_THEME,
  DEFAULT_COLOR_SCHEME,
  DEFAULT_PRESET_KEY,
  DEFAULT_PRESET_ATTR,
  DEFAULT_THEME_KEY,
  DEFAULT_THEME_ATTR,
  NEXT_THEME_PRESET_ATTR,
}
