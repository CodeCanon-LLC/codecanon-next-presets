import {
  type Attribute,
  ThemeProvider as NextThemeProvider,
  type ThemeProviderProps as NextThemeProviderProps,
  useTheme as useNextTheme,
} from "next-themes"
import {
  createContext,
  useContext,
  useLayoutEffect,
  type ReactNode,
} from "react"
import { useLocalStorage } from "~/hooks/use-local-storage"
import { DEFAULT_PRESET } from "~/presets"
import { PresetScript } from "./script"
import {
  THEME_DARK,
  DEFAULT_THEME,
  DEFAULT_PRESET_ATTR,
  NEXT_THEME_PRESET_ATTR,
  DEFAULT_PRESET_KEY,
  DEFAULT_THEME_KEY,
  type ColorScheme,
  type Theme,
  DEFAULT_COLOR_SCHEME,
} from "./lib/constants"

type PresetProviderProps = {
  children: ReactNode
  /** Initial preset when no stored value exists. Accepts built-in `PresetKeys` or any custom preset ID. */
  defaultPreset?: string
  presetKey?: string
  presetAttr?: string
}

type PresetState = {
  /** The currently active preset ID. */
  preset?: string
  resetPreset: () => void
  /** Switch to any preset by ID — built-in or custom. */
  setPreset: (preset: string) => void
}

const initialState: PresetState = {
  setPreset: () => null,
  resetPreset: () => null,
}

const PresetContext = createContext<PresetState>(initialState)

function PresetProvider({
  children,
  defaultPreset = DEFAULT_PRESET,
  presetKey = DEFAULT_PRESET_KEY,
  presetAttr = DEFAULT_PRESET_ATTR,
}: PresetProviderProps) {
  const [preset, setPreset, resetPreset] = useLocalStorage<string>(
    presetKey,
    defaultPreset
  )

  // Apply theme preset via data-preset attribute
  useLayoutEffect(() => {
    const root = document.documentElement
    if (!root) return

    // Set the data-preset attribute based on the current preset
    if (preset) {
      root.setAttribute(presetAttr, preset)
    } else {
      root.removeAttribute(presetAttr)
    }
  }, [preset, presetAttr])

  const presetContext: PresetState = {
    preset,
    resetPreset,
    setPreset,
  }

  return (
    <PresetContext.Provider value={presetContext}>
      <PresetScript presetKey={presetKey} presetAttr={presetAttr} />
      {children}
    </PresetContext.Provider>
  )
}

function usePreset() {
  const context = useContext(PresetContext)

  if (context === undefined)
    throw new Error("usePreset must be used within a PresetProvider")

  return context
}

type ThemeProviderProps = NextThemeProviderProps & {
  defaultTheme?: Theme
  themeKey?: string
}

function ThemeProvider({
  children,
  defaultTheme = DEFAULT_THEME,
  themeKey = DEFAULT_THEME_KEY,
  attribute = "class",
  ...nextThemeProps
}: ThemeProviderProps) {
  // Always include data-preset-theme so preset CSS variables work correctly
  // regardless of what dark mode attribute/class the consumer configures.
  // next-themes manages this attribute (and its FOUC script) automatically.
  const attrsArray: Attribute[] =
    typeof attribute === "string" ? [attribute] : attribute || []
  const attrs: Attribute[] = attrsArray.includes(NEXT_THEME_PRESET_ATTR)
    ? attrsArray
    : [NEXT_THEME_PRESET_ATTR, ...attrsArray]

  return (
    <NextThemeProvider
      storageKey={themeKey}
      defaultTheme={defaultTheme}
      attribute={attrs}
      {...nextThemeProps}
    >
      {children}
    </NextThemeProvider>
  )
}

interface UseTheme {
  /** List of all available theme names */
  themes: Theme[]
  /** Forced theme name for the current page */
  forcedTheme?: Theme | undefined
  /** Update the theme */
  setTheme: React.Dispatch<React.SetStateAction<Theme>>
  /** Active theme name */
  theme?: Theme | undefined
  /** If `enableSystem` is true and the active theme is "system", this returns whether the system preference resolved to "dark" or "light". Otherwise, identical to `theme` */
  resolvedTheme?: ColorScheme | undefined
  /** If enableSystem is true, returns the System theme preference ("dark" or "light"), regardless what the active theme is */
  systemTheme?: ColorScheme | undefined
}

function useTheme() {
  const themeContext = useNextTheme() as UseTheme
  const colorScheme =
    (themeContext.resolvedTheme as ColorScheme) || DEFAULT_COLOR_SCHEME
  const isDarkTheme = colorScheme === THEME_DARK

  return {
    ...themeContext,
    colorScheme,
    isDarkTheme,
  }
}

export type { ColorScheme, Theme, ThemeProviderProps, PresetProviderProps }
export { PresetProvider, usePreset, ThemeProvider, useTheme }
