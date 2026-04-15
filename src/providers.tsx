import {
  type Attribute,
  ThemeProvider as NextThemeProvider,
  type ThemeProviderProps as NextThemeProviderProps,
  useTheme as useNextTheme,
} from "next-themes"
import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  type ReactNode,
} from "react"
import { useLocalStorage } from "~/hooks/use-local-storage"
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
  presetKey?: string
  presetAttr?: string
  /**
   * Externally controlled preset value. When provided, this takes precedence
   * over the localStorage value. Useful when the preset is persisted in a
   * database — pass `undefined` (or omit the prop) while the database value
   * is loading so localStorage can provide a fast initial value with no flash.
   *
   * localStorage is always updated on user interactions so the next page load
   * renders the correct preset instantly, without waiting for the database.
   */
  preset?: string
  /**
   * Called whenever the user selects a new preset. Use this to persist the
   * new value to your database. localStorage is always updated immediately,
   * independently of this callback.
   */
  onPresetChange?: (preset: string | undefined) => void
}

type PresetState = {
  /** The currently active preset ID. */
  preset?: string | undefined
  resetPreset: () => void
  /** Switch to any preset by ID — built-in or custom. */
  setPreset: React.Dispatch<React.SetStateAction<string | undefined>>
}

const initialState: PresetState = {
  setPreset: () => null,
  resetPreset: () => null,
}

const PresetContext = createContext<PresetState>(initialState)

function PresetProvider({
  children,
  presetKey = DEFAULT_PRESET_KEY,
  presetAttr = DEFAULT_PRESET_ATTR,
  preset: controlledPreset,
  onPresetChange,
}: PresetProviderProps) {
  const [localPreset, setLocalPreset, resetLocalPreset] = useLocalStorage<string | undefined>(
    presetKey,
    undefined
  )

  // Controlled preset takes precedence; fall back to localStorage while
  // the controlled value is unavailable (e.g. DB not yet loaded).
  const activePreset = controlledPreset !== undefined ? controlledPreset : localPreset

  // Keep localStorage in sync with the controlled value so that subsequent
  // page loads render the correct preset immediately (without DB round-trip).
  useEffect(() => {
    if (controlledPreset === undefined) return
    try {
      window.localStorage.setItem(presetKey, JSON.stringify(controlledPreset))
    } catch {}
  }, [controlledPreset, presetKey])

  // Apply theme preset via data-preset attribute
  useLayoutEffect(() => {
    const root = document.documentElement
    if (!root) return

    if (activePreset) {
      root.setAttribute(presetAttr, activePreset)
    } else {
      root.removeAttribute(presetAttr)
    }
  }, [activePreset, presetAttr])

  const presetContext: PresetState = {
    preset: activePreset,
    resetPreset: () => {
      resetLocalPreset()
      onPresetChange?.(undefined)
    },
    setPreset: (value) => {
      const next = value instanceof Function ? value(activePreset) : value
      setLocalPreset(next)   // always update localStorage immediately
      onPresetChange?.(next) // notify parent (e.g., to persist to DB)
    },
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
