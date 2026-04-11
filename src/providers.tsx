import {
  ThemeProvider as NextThemeProvider,
  type ThemeProviderProps as NextThemeProviderProps,
  useTheme as useNextTheme,
} from "next-themes"
import { createContext, useContext, useEffect, type ReactNode } from "react"
import { useLocalStorage } from "~/hooks/use-local-storage"
import { DEFAULT_PRESET } from "~/presets"

type ColorScheme = "dark" | "light"
type Theme = ColorScheme | "system"

const DEFAULT_COLOR_SCHEME: ColorScheme = "dark"

type PresetProviderProps = {
  children: ReactNode
  /** Initial preset when no stored value exists. Accepts built-in `PresetKeys` or any custom preset ID. */
  defaultPreset?: string
  presetKey?: string
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
  presetKey = "preset",
}: PresetProviderProps) {
  const [preset, setPreset, resetPreset] = useLocalStorage<string>(
    presetKey,
    DEFAULT_PRESET
  )

  // Apply theme preset via data-preset attribute
  useEffect(() => {
    const root = document.documentElement
    if (!root) return

    // Set the data-preset attribute based on the current preset
    if (preset) {
      root.setAttribute("data-preset", preset)
    } else {
      root.removeAttribute("data-preset")
    }
  }, [preset])

  const presetContext: PresetState = {
    preset,
    resetPreset,
    setPreset,
  }

  return (
    <PresetContext.Provider value={presetContext}>
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
  defaultTheme = DEFAULT_COLOR_SCHEME,
  themeKey = "theme",
  ...nextThemeProps
}: ThemeProviderProps) {
  return (
    <NextThemeProvider
      enableSystem
      enableColorScheme
      attribute="class"
      storageKey={themeKey}
      defaultTheme={defaultTheme}
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
  const isDarkTheme = colorScheme === "dark"

  return {
    ...themeContext,
    colorScheme,
    isDarkTheme,
  }
}

export type { ColorScheme, Theme, ThemeProviderProps, PresetProviderProps }
export { PresetProvider, usePreset, ThemeProvider, useTheme }
