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

import {
  usePreset,
  useTheme,
  usePresetName,
  getNextTheme,
  getThemeName,
} from "@codecanon/next-presets"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { PresetPreviewDots } from "@/components/preset-preview-dots"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"

const DEFAULT_THEME = "system"

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface PresetDropdownPickerContextValue {
  open: boolean
  query: string
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  toggleOpen: () => void
  setQuery: React.Dispatch<React.SetStateAction<string>>
}

const PresetDropdownPickerContext =
  React.createContext<PresetDropdownPickerContextValue | null>(null)

function usePresetDropdownPicker(caller = "usePresetDropdownPicker") {
  const context = React.useContext(PresetDropdownPickerContext)

  if (!context) {
    throw new Error(`${caller} must be used within <PresetDropdownPicker>`)
  }

  return context
}

// ---------------------------------------------------------------------------
// PresetDropdownPicker (root / context provider)
// ---------------------------------------------------------------------------

type PresetDropdownPickerProps = React.ComponentProps<typeof DropdownMenu> & {
  defaultOpen?: boolean
}

function PresetDropdownPicker({
  defaultOpen = false,
  children,
  onOpenChange,
  ...props
}: PresetDropdownPickerProps) {
  const [open, setOpen] = React.useState(defaultOpen)
  const [query, setQuery] = React.useState("")

  const toggleOpen = React.useCallback(() => setOpen((v) => !v), [])

  const context = React.useMemo(
    () => ({
      open,
      query,
      setOpen,
      toggleOpen,
      setQuery,
    }),
    [open, query]
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
  const { presetName } = usePreset("PresetDropdownPickerTrigger")

  return (
    <DropdownMenuTrigger asChild>
      <Button className={cn("gap-2", className)} {...props}>
        {children ?? (
          <>
            <Palette className="size-4" />
            {presetName}
          </>
        )}
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
  typeof InputGroupInput
> {
  containerClassName?: string
}

function PresetDropdownPickerSearch({
  containerClassName,
  ...props
}: PresetDropdownPickerSearchProps) {
  const { query, setQuery } = usePresetDropdownPicker(
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
          value={query}
          onChange={(e) => setQuery(e.target.value)}
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
  const {
    presets,
    preset: activePreset,
    setPreset: setActivePreset,
  } = usePreset("PresetDropdownPickerToolbar")
  const { theme: activeTheme = DEFAULT_THEME, setTheme: setActiveTheme } =
    useTheme()

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
}

function PresetDropdownPickerItem({
  preset,
  className,
  ...props
}: PresetDropdownPickerItemProps) {
  const label = usePresetName(preset)
  const { preset: activePreset, setPreset: setActivePreset } = usePreset(
    "PresetDropdownPickerItem"
  )

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

type PresetDropdownPickerListProps = React.ComponentProps<"div">

function PresetDropdownPickerList({
  className,
  ...props
}: PresetDropdownPickerListProps) {
  const { presets } = usePreset("PresetDropdownPickerList")
  const { query } = usePresetDropdownPicker("PresetDropdownPickerList")
  const queryLower = query.toLowerCase()

  const filteredPresets = React.useMemo(
    () => presets.filter(([, name]) => name.toLowerCase().includes(queryLower)),
    [presets, queryLower]
  )

  return (
    <div className={cn("max-h-75 overflow-y-auto pb-1", className)} {...props}>
      {filteredPresets.map(([preset]) => (
        <PresetDropdownPickerItem key={preset} preset={preset} />
      ))}
    </div>
  )
}

export {
  PresetDropdownPicker,
  PresetDropdownPickerContent,
  PresetDropdownPickerItem,
  PresetDropdownPickerList,
  PresetDropdownPickerSearch,
  PresetDropdownPickerToolbar,
  PresetDropdownPickerToolbarButton,
  PresetDropdownPickerTrigger,
  usePresetDropdownPicker,
}
