import * as React from "react"
import {
  Check,
  Laptop,
  Moon,
  Palette,
  Search,
  Shuffle,
  Sun,
  X,
} from "lucide-react"

import { usePreset, useTheme } from "~/providers"
import { Button } from "~/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { Input } from "~/components/ui/input"
import { cn } from "~/lib/utils"
import { PRESETS, type PresetTuple } from "~/config"
import { PresetPreviewDots } from "~/components/preset-preview-dots"
import { getNextTheme } from "~/helpers/get-next-theme"
import { getPresetName } from "~/helpers/get-preset-name"
import { DEFAULT_THEME } from "~/lib/constants"
import { getThemeName } from "~/helpers/get-theme-name"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "~/components/ui/input-group"

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface PresetDropdownPickerContextValue {
  open: boolean
  setOpen: (open: boolean) => void
  toggleOpen: () => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  presets: readonly PresetTuple[]
}

const PresetDropdownPickerContext =
  React.createContext<PresetDropdownPickerContextValue | null>(null)

function usePresetDropdownPicker(caller = "usePresetDropdownPicker") {
  const ctx = React.useContext(PresetDropdownPickerContext)
  if (!ctx)
    throw new Error(`${caller} must be used within <PresetDropdownPickerMenu>`)
  return ctx
}

// ---------------------------------------------------------------------------
// PresetDropdownPicker (root / context provider)
// ---------------------------------------------------------------------------

type PresetDropdownPickerMenuProps = React.ComponentProps<
  typeof DropdownMenu
> & {
  presets?: readonly PresetTuple[]
  defaultOpen?: boolean
}

function PresetDropdownPickerMenu({
  presets = PRESETS,
  defaultOpen = false,
  children,
  onOpenChange,
  ...props
}: PresetDropdownPickerMenuProps) {
  const [open, setOpen] = React.useState(defaultOpen)
  const [searchQuery, setSearchQuery] = React.useState("")

  const toggleOpen = React.useCallback(() => setOpen((v) => !v), [])

  const context = React.useMemo(
    () => ({
      open,
      searchQuery,
      presets,
      setOpen,
      toggleOpen,
      setSearchQuery,
    }),
    [open, searchQuery, presets]
  )

  return (
    <PresetDropdownPickerContext.Provider value={context}>
      <TooltipProvider>
        <DropdownMenu
          {...props}
          open={open}
          onOpenChange={(open) => {
            setOpen(open)
            onOpenChange?.(open)
          }}
        >
          {children}
        </DropdownMenu>
      </TooltipProvider>
    </PresetDropdownPickerContext.Provider>
  )
}

// ---------------------------------------------------------------------------
// PresetDropdownPickerTrigger
// ---------------------------------------------------------------------------

type PresetDropdownPickerTriggerProps = React.ComponentProps<typeof Button>

function PresetDropdownPickerTrigger({
  className,
  children,
  ...props
}: PresetDropdownPickerTriggerProps) {
  const { preset: activePreset } = usePreset()

  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <DropdownMenuTrigger asChild>
      <Button
        size="sm"
        className={cn("gap-2", className)}
        disabled={!mounted}
        {...props}
      >
        <Palette className="h-4 w-4" />
        {mounted ? (children ?? getPresetName(activePreset)) : "Loading..."}
      </Button>
    </DropdownMenuTrigger>
  )
}

// ---------------------------------------------------------------------------
// PresetDropdownPickerContent
// ---------------------------------------------------------------------------

function PresetDropdownPickerContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuContent>) {
  return (
    <DropdownMenuContent
      align="end"
      className={cn("w-70 p-0", className)}
      {...props}
    >
      {children}
    </DropdownMenuContent>
  )
}

// ---------------------------------------------------------------------------
// PresetDropdownPickerSearch
// ---------------------------------------------------------------------------

interface PresetDropdownPickerSearchProps extends React.ComponentProps<
  typeof Input
> {
  containerClassName?: string
}

function PresetDropdownPickerSearch({
  containerClassName,
  ...props
}: PresetDropdownPickerSearchProps) {
  const { searchQuery, setSearchQuery } = usePresetDropdownPicker(
    "PresetDropdownPickerSearch"
  )

  return (
    <div className={cn("p-2", containerClassName)}>
      <InputGroup>
        <InputGroupAddon align="inline-start">
          <Search />
        </InputGroupAddon>
        <InputGroupInput
          placeholder="Search presets..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          {...props}
        />
      </InputGroup>
    </div>
  )
}

// ---------------------------------------------------------------------------
// PresetDropdownPickerToolbarButton
// ---------------------------------------------------------------------------

function PresetDropdownPickerToolbarButton({
  className,
  onClick,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      className={cn(
        "hover:bg-accent text-muted-foreground hover:text-foreground rounded p-1 transition-colors",
        className
      )}
      onClick={(e) => {
        e.stopPropagation()
        onClick?.(e)
      }}
      {...props}
    />
  )
}

// ---------------------------------------------------------------------------
// PresetDropdownPickerToolbar
// ---------------------------------------------------------------------------

type PresetDropdownPickerToolbarProps = React.ComponentProps<"div">

function PresetDropdownPickerToolbar({
  className,
  ...props
}: PresetDropdownPickerToolbarProps) {
  const { preset: activePreset, setPreset: setActivePreset } = usePreset()
  const { theme: activeTheme = DEFAULT_THEME, setTheme: setActiveTheme } =
    useTheme()
  const { presets } = usePresetDropdownPicker("PresetDropdownPickerToolbar")

  const handleThemeToggle = () => {
    setActiveTheme(getNextTheme(activeTheme))
  }
  const handleClear = () => {
    setActivePreset(undefined)
  }
  const handleRandom = () => {
    const i = Math.floor(Math.random() * presets.length)
    setActivePreset(presets[i]?.[0])
  }

  return (
    <div
      className={cn(
        "border-border flex items-center justify-between border-b px-3 py-2",
        className
      )}
      {...props}
    >
      <span className="text-muted-foreground text-sm">
        {presets.length} themes
      </span>
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <PresetDropdownPickerToolbarButton
              onClick={handleThemeToggle}
              title={`Theme: ${getThemeName(activeTheme)} (click to switch)`}
              aria-label={`Theme: ${getThemeName(activeTheme)}. Click to switch.`}
            >
              {activeTheme === "dark" ? (
                <Moon className="h-4 w-4" />
              ) : activeTheme === "light" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Laptop className="h-4 w-4" />
              )}
            </PresetDropdownPickerToolbarButton>
          </TooltipTrigger>
          <TooltipContent>
            Theme: {getThemeName(activeTheme)} (click to switch)
          </TooltipContent>
        </Tooltip>

        {activePreset && handleClear && (
          <Tooltip>
            <TooltipTrigger asChild>
              <PresetDropdownPickerToolbarButton
                onClick={handleClear}
                title="Clear preset"
                aria-label="Clear current preset"
              >
                <X className="h-4 w-4" />
              </PresetDropdownPickerToolbarButton>
            </TooltipTrigger>
            <TooltipContent>Clear preset</TooltipContent>
          </Tooltip>
        )}

        <Tooltip>
          <TooltipTrigger asChild>
            <PresetDropdownPickerToolbarButton
              onClick={handleRandom}
              title="Random preset"
              aria-label="Randomize preset"
            >
              <Shuffle className="h-4 w-4" />
            </PresetDropdownPickerToolbarButton>
          </TooltipTrigger>
          <TooltipContent>Random preset</TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// PresetDropdownPickerItem
// ---------------------------------------------------------------------------

type PresetDropdownPickerItemProps = React.ComponentProps<"div"> & {
  preset: string
  label?: string
}

function PresetDropdownPickerItem({
  preset,
  label = getPresetName(preset),
  className,
  ...props
}: PresetDropdownPickerItemProps) {
  const { preset: activePreset, setPreset: setActivePreset } = usePreset()
  const isSelected = activePreset === preset

  return (
    <div
      role="option"
      aria-selected={isSelected}
      onClick={() => setActivePreset?.(preset)}
      className={cn(
        "relative mx-1 flex cursor-pointer items-center gap-2 rounded-sm px-2 py-2 text-sm",
        "hover:bg-secondary/50 transition-colors",
        isSelected && "bg-accent text-accent-foreground",
        className
      )}
      {...props}
    >
      <PresetPreviewDots preset={preset} />
      <span className="flex-1 truncate">{label}</span>
      {isSelected && <Check className="h-4 w-4 shrink-0" />}
    </div>
  )
}

// ---------------------------------------------------------------------------
// PresetDropdownPickerList
// ---------------------------------------------------------------------------

type PresetDropdownPickerListProps = React.ComponentProps<"div"> & {
  sectionLabel?: string
}

function PresetDropdownPickerList({
  sectionLabel = "Built-in Themes",
  className,
  ...props
}: PresetDropdownPickerListProps) {
  const { searchQuery, presets } = usePresetDropdownPicker(
    "PresetDropdownPickerList"
  )

  const filtered = presets.filter(([, name]) =>
    name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <>
      <div className="px-2 py-1.5">
        <p className="text-muted-foreground mb-1 px-1 text-xs font-medium">
          {sectionLabel}
        </p>
      </div>
      <div
        className={cn("max-h-75 overflow-y-auto pb-1", className)}
        {...props}
      >
        {filtered.map(([preset, presetName]) => (
          <PresetDropdownPickerItem
            key={presetName}
            preset={preset}
            label={presetName}
          />
        ))}
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// Recipe
// ---------------------------------------------------------------------------

type PresetDropdownPickerProps = PresetDropdownPickerTriggerProps & {
  presets?: readonly PresetTuple[]
}

function PresetDropdownPicker({
  presets = PRESETS,
  ...props
}: PresetDropdownPickerProps) {
  return (
    <PresetDropdownPickerMenu presets={presets}>
      <PresetDropdownPickerTrigger {...props} />
      <PresetDropdownPickerContent>
        <PresetDropdownPickerSearch />
        <PresetDropdownPickerToolbar />
        <PresetDropdownPickerList />
      </PresetDropdownPickerContent>
    </PresetDropdownPickerMenu>
  )
}

export {
  PresetDropdownPicker,
  PresetDropdownPickerMenu,
  PresetDropdownPickerContent,
  PresetDropdownPickerItem,
  PresetDropdownPickerList,
  PresetDropdownPickerSearch,
  PresetDropdownPickerToolbar,
  PresetDropdownPickerToolbarButton,
  PresetDropdownPickerTrigger,
  usePresetDropdownPicker,
}
