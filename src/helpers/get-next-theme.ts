import type { Theme } from "~/providers"

const THEME_LOOP: Theme[] = ["system", "light", "dark"]

const getNextTheme = (currentTheme: Theme): Theme =>
  THEME_LOOP[(THEME_LOOP.indexOf(currentTheme) + 1) % THEME_LOOP.length] ||
  "system"

export { getNextTheme, THEME_LOOP }
