import { DEFAULT_THEME } from "~/lib/constants"
import { titleCase } from "~/lib/format"
import type { Theme } from "~/providers"

function getThemeName(theme?: Theme, defaultTheme = DEFAULT_THEME) {
  return titleCase(theme || defaultTheme)
}

export { getThemeName }
