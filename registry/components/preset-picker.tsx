import {
  Laptop,
  Moon,
  Palette,
  Search,
  Shuffle,
  Sun,
  X,
  XIcon,
} from "lucide-react"
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"

import {
  usePreset,
  useTheme,
  type Theme,
  type PresetTuple,
} from "@codecanon/next-presets"
import { Scroller } from "@/components/ui/scroller"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"
import { PresetPreviewCard } from "@/components/preset-preview-card"
import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const DEFAULT_THEME = "system"

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

type PresetPickerContextValue = {
  open: boolean
  modal: boolean
  query: string
  highlightedIndex: number
  filteredPresets: PresetTuple[]
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  toggleOpen: () => void
  setQuery: React.Dispatch<React.SetStateAction<string>>
  setHighlightedIndex: React.Dispatch<React.SetStateAction<number>>
}

const PresetPickerContext = createContext<PresetPickerContextValue | null>(null)

function usePresetPicker(caller = "usePresetPicker") {
  const context = useContext(PresetPickerContext)

  if (!context) {
    throw new Error(`${caller} must be used within a <PresetPicker>`)
  }

  return context
}

// ---------------------------------------------------------------------------
// PresetPickerClose
// ---------------------------------------------------------------------------

function PresetPickerClose() {
  return (
    <SheetClose className="ring-offset-background focus:ring-ring data-[state=open]:bg-secondary absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none">
      <XIcon className="size-4" />
      <span className="sr-only">Close</span>
    </SheetClose>
  )
}

// ---------------------------------------------------------------------------
// PresetPicker (context provider)
// ---------------------------------------------------------------------------

function PresetPicker({
  children,
  onOpenChange,
  modal = false,
  ...props
}: {
  children: React.ReactNode
} & Omit<React.ComponentProps<typeof Sheet>, "open">) {
  const { presets } = usePreset("PresetPicker")
  const [query, setQuery] = useState("")
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [open, setOpen] = useState(false)

  const toggleOpen = () => setOpen((v) => !v)

  const queryLower = query.toLowerCase()
  const filteredPresets = useMemo(
    () => presets.filter(([, t]) => t?.toLowerCase().includes(queryLower)),
    [queryLower, presets]
  )

  const context = useMemo<PresetPickerContextValue>(
    () => ({
      open,
      modal,
      query,
      highlightedIndex,
      filteredPresets,
      setOpen,
      toggleOpen,
      setQuery,
      setHighlightedIndex,
    }),
    [open, query, highlightedIndex, filteredPresets, modal]
  )

  return (
    <PresetPickerContext.Provider value={context}>
      <TooltipProvider>
        <Sheet
          modal={modal}
          {...props}
          open={open}
          onOpenChange={(open) => {
            setOpen(open)
            onOpenChange?.(open)
          }}
        >
          {children}
        </Sheet>
      </TooltipProvider>
    </PresetPickerContext.Provider>
  )
}

// ---------------------------------------------------------------------------
// PresetPickerContent
// ---------------------------------------------------------------------------

function PresetPickerContent({
  children,
  className,
  ...props
}: React.ComponentProps<typeof SheetContent>) {
  const { modal } = usePresetPicker("PresetPickerContent")

  return (
    <SheetContent
      side="left"
      className={cn(
        "bg-background pointer-events-auto",
        "max-w-screen data-[side=left]:w-80 data-[side=right]:w-80 sm:max-w-md",
        "data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left",
        className
      )}
      {...(modal
        ? {}
        : {
            onPointerDownOutside: (e) => e.preventDefault(),
            onInteractOutside: (e) => e.preventDefault(),
          })}
      {...props}
    >
      <PresetPickerClose />
      <SheetHeader>
        <SheetTitle className="flex gap-2">
          <Palette />
          Preset Picker
        </SheetTitle>
      </SheetHeader>
      <div className="flex min-h-0 flex-1 flex-col gap-4 px-4">{children}</div>
    </SheetContent>
  )
}

// ---------------------------------------------------------------------------
// PresetPickerThemeToggleGroup
// ---------------------------------------------------------------------------

function PresetPickerThemeToggleGroup({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { theme = DEFAULT_THEME, setTheme } = useTheme()

  return (
    <ToggleGroup
      {...(props as any)}
      className={cn("w-full border", className)}
      type="single"
      value={theme}
      onValueChange={(value) => value && setTheme(value as Theme)}
    >
      <ToggleGroupItem
        className={cn("flex-1", theme === "system" && "bg-accent")}
        value="system"
      >
        <Laptop />
        System
      </ToggleGroupItem>
      <ToggleGroupItem
        className={cn("flex-1", theme === "light" && "bg-accent")}
        value="light"
      >
        <Sun />
        Light
      </ToggleGroupItem>
      <ToggleGroupItem
        className={cn("flex-1", theme === "dark" && "bg-accent")}
        value="dark"
      >
        <Moon />
        Dark
      </ToggleGroupItem>
    </ToggleGroup>
  )
}

// ---------------------------------------------------------------------------
// PresetPickerSearch
// ---------------------------------------------------------------------------

type PresetPickerSearchProps = React.ComponentProps<typeof InputGroupInput>

function PresetPickerSearch({
  onChange,
  onKeyDown,
  ...props
}: PresetPickerSearchProps) {
  const {
    open,
    query,
    highlightedIndex,
    filteredPresets,
    setHighlightedIndex,
    setQuery,
  } = usePresetPicker("PresetPickerList")
  const { presets, preset, setPreset } = usePreset("PresetPickerList")
  const queryLower = query.trim().toLowerCase()

  useEffect(() => {
    if (queryLower.trim()) {
      setHighlightedIndex(-1)
    } else {
      setHighlightedIndex(filteredPresets.findIndex(([id]) => id === preset))
    }
  }, [queryLower])

  useEffect(() => {
    if (!open) setQuery("")
  }, [open])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(e)

    if (filteredPresets.length === 0) return

    if (e.key === "ArrowDown") {
      e.preventDefault()
      setHighlightedIndex((prev) =>
        prev < filteredPresets.length - 1 ? prev + 1 : prev
      )
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev))
    } else if (e.key === "Enter") {
      e.preventDefault()
      const id = filteredPresets[highlightedIndex]?.[0]
      if (id) setPreset(id)
    }
  }

  const handleClear = () => {
    setPreset(undefined)
  }
  const handleRandom = () => {
    const i = Math.floor(Math.random() * presets.length)
    setPreset(presets[i]?.[0])
  }

  return (
    <InputGroup>
      <InputGroupAddon align="inline-start">
        <Search />
      </InputGroupAddon>
      <InputGroupInput
        autoFocus
        type="text"
        placeholder="Search presets..."
        {...props}
        value={query}
        onKeyDown={handleKeyDown}
        onChange={(e) => {
          setQuery(e.target.value)
          onChange?.(e)
        }}
      />
      <InputGroupAddon align="inline-end">
        {preset && handleClear && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleClear}
                title="Clear preset"
                aria-label="Clear current preset"
              >
                <X />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Clear preset</TooltipContent>
          </Tooltip>
        )}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleRandom}
              title="Random preset"
              aria-label="Randomize preset"
            >
              <Shuffle />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Random preset</TooltipContent>
        </Tooltip>
      </InputGroupAddon>
    </InputGroup>
  )
}

// ---------------------------------------------------------------------------
// PresetPickerList
// ---------------------------------------------------------------------------

interface PresetPickerListProps extends React.ComponentProps<"div"> {
  card?: typeof PresetPreviewCard
}

function PresetPickerList({
  card: Card = PresetPreviewCard,
  className,
  ...props
}: PresetPickerListProps) {
  const { filteredPresets, highlightedIndex, setHighlightedIndex } =
    usePresetPicker("PresetPickerList")
  const { preset, setPreset } = usePreset("PresetPickerList")

  const [mounted, setMounted] = useState(false)
  const scrollerRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<Map<number, HTMLDivElement>>(new Map())

  useEffect(() => {
    const highlightedElement = itemRefs.current.get(highlightedIndex)
    if (highlightedElement && scrollerRef.current) {
      const parent = scrollerRef.current
      const parentRect = parent.getBoundingClientRect()
      const elementRect = highlightedElement.getBoundingClientRect()

      if (elementRect.top < parentRect.top + 20) {
        parent.scrollTop -= parentRect.top + 20 - elementRect.top
      } else if (elementRect.bottom > parentRect.bottom - 20) {
        parent.scrollTop += elementRect.bottom - (parentRect.bottom - 20)
      }
    }
  }, [highlightedIndex])

  return (
    <Scroller className="min-h-0 flex-1" ref={scrollerRef}>
      <div
        className={cn("flex flex-col gap-1 overflow-y-auto", className)}
        {...props}
      >
        {filteredPresets.length > 0 ? (
          filteredPresets.map(([id], index) => (
            <Card
              key={id}
              highlighted={index === highlightedIndex}
              preset={id}
              onClick={() => {
                setPreset(id)
                setHighlightedIndex(index)
              }}
              ref={(el) => {
                if (!mounted && preset === id) {
                  setMounted(true)
                  el?.scrollIntoView({ block: "center", behavior: "instant" })
                }
                if (el) {
                  itemRefs.current.set(index, el)
                } else {
                  itemRefs.current.delete(index)
                }
              }}
            />
          ))
        ) : (
          <div className="text-muted-foreground py-8 text-center text-sm">
            No presets found
          </div>
        )}
      </div>
    </Scroller>
  )
}

// ---------------------------------------------------------------------------
// PresetPickerTrigger
// ---------------------------------------------------------------------------

type PresetPickerTriggerProps = React.ComponentProps<typeof Button>

function PresetPickerTrigger({
  className,
  children,
  ...props
}: PresetPickerTriggerProps) {
  const { presetName } = usePreset("PresetPickerTrigger")

  return (
    <SheetTrigger asChild>
      <Button className={cn("gap-2", className)} {...props}>
        {children ?? (
          <>
            <Palette className="size-4" />
            {presetName}
          </>
        )}
      </Button>
    </SheetTrigger>
  )
}

export {
  PresetPicker,
  PresetPickerTrigger,
  PresetPickerContent,
  PresetPickerThemeToggleGroup,
  PresetPickerSearch,
  PresetPickerList,
  usePresetPicker,
}
