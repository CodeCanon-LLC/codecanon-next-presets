import {
  ThemeProvider as NextThemeProvider,
  useTheme as useNextTheme,
} from "next-themes"
import { createContext, useContext, useEffect, type ReactNode } from "react"
import { useLocalStorage } from "~/hooks/use-local-storage"
import { DEFAULT_PRESET, type PresetKeys } from "~/presets"

type ColorScheme = "dark" | "light"
type Theme = ColorScheme | "system"

const DEFAULT_COLOR_SCHEME: ColorScheme = "dark"

type PresetProviderProps = {
  children: ReactNode
  defaultPreset?: PresetKeys
  presetKey?: string
}

type PresetState = {
  preset?: PresetKeys
  resetPreset: () => void
  setPreset: (preset: PresetKeys) => void
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
  const [preset, setPreset, resetPreset] = useLocalStorage<PresetKeys>(
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

type ThemePresetProviderProps = PresetProviderProps & {
  children: ReactNode
  defaultTheme?: Theme
  themeKey?: string
}

function ThemePresetProvider({
  children,
  defaultTheme = DEFAULT_COLOR_SCHEME,
  themeKey = "theme",
  ...presetProps
}: ThemePresetProviderProps) {
  const [theme = defaultTheme] = useLocalStorage<Theme>(themeKey, defaultTheme)

  return (
    <NextThemeProvider
      enableSystem
      enableColorScheme
      attribute="class"
      defaultTheme={theme}
    >
      <PresetProvider {...presetProps}>{children}</PresetProvider>
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

function useThemePreset() {
  const presetContext = usePreset()
  const themeContext = useTheme()

  return {
    ...themeContext,
    ...presetContext,
  }
}

export type { ColorScheme, Theme }
export {
  DEFAULT_COLOR_SCHEME,
  usePreset,
  ThemePresetProvider,
  PresetProvider,
  useTheme,
  useThemePreset,
}
