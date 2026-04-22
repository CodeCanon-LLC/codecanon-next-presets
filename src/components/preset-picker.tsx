import { Laptop, Moon, Palette, Search, Shuffle, Sun, X } from "lucide-react"
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { useBoolean } from "~/hooks/use-boolean"

import { usePreset, useTheme, type Theme } from "~/providers"
import { Scroller } from "~/components/ui/scroller"
import {
  Sheet,
  SheetContent,
  SheetContentClose,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet"
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group"
import { PRESETS, type PresetTuple } from "~/config"
import { cn } from "~/lib/utils"
import { PresetPreviewCard } from "./preset-preview-card"
import { Button } from "./ui/button"
import { DEFAULT_THEME } from "~/lib/constants"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "~/components/ui/input-group"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip"

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

type PresetPickerContextValue = {
  open: boolean
  modal: boolean
  presets: readonly PresetTuple[]
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  toggleOpen: () => void
}

const PresetPickerContext = createContext<PresetPickerContextValue | null>(null)

function usePresetPicker(caller = "usePresetPicker") {
  const context = useContext(PresetPickerContext)
  if (!context)
    throw new Error(`${caller} must be used within a <PresetPickerSheet>`)
  return context
}

// ---------------------------------------------------------------------------
// PresetPickerSheet (context provider)
// ---------------------------------------------------------------------------

function PresetPickerSheet({
  children,
  presets = PRESETS,
  onOpenChange,
  modal = false,
  ...props
}: {
  children: React.ReactNode
  presets?: readonly PresetTuple[]
} & Omit<React.ComponentProps<typeof Sheet>, "open">) {
  const [open, setOpen] = useState(false)
  const toggleOpen = () => setOpen((v) => !v)

  const context = useMemo<PresetPickerContextValue>(
    () => ({ open, modal, presets, setOpen, toggleOpen }),
    [open, modal, presets]
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
      <SheetContentClose />
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
  const { open, presets } = usePresetPicker("PresetPickerList")
  const { preset, setPreset } = usePreset()
  const [mounted, setMounted] = useBoolean(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [query, setQuery] = useState("")
  const queryLower = query.trim().toLowerCase()
  const scrollerRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<Map<number, HTMLDivElement>>(new Map())

  const filteredPresets = useMemo(
    () => presets.filter(([, t]) => t?.toLowerCase().includes(queryLower)),
    [queryLower, presets]
  )

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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
    <>
      <InputGroup>
        <InputGroupAddon align="inline-start">
          <Search />
        </InputGroupAddon>
        <InputGroupInput
          type="text"
          placeholder="Search presets..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
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
      <Scroller className="min-h-0 flex-1" ref={scrollerRef}>
        <div
          className={cn("flex flex-col gap-1 overflow-y-auto", className)}
          {...props}
        >
          {filteredPresets.length > 0 ? (
            filteredPresets.map(([id, label], index) => (
              <Card
                key={id}
                highlighted={index === highlightedIndex}
                preset={id}
                label={label}
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
    </>
  )
}

// ---------------------------------------------------------------------------
// PresetPickerToggleButton
// ---------------------------------------------------------------------------

type PresetPickerToggleButtonProps = React.ComponentProps<typeof Button>

function PresetPickerToggleButton(props: PresetPickerToggleButtonProps) {
  const { toggleOpen } = usePresetPicker("PresetPickerToggleButton")
  return <Button {...props} onClick={toggleOpen} />
}

// ---------------------------------------------------------------------------
// PresetPicker (recipe)
// ---------------------------------------------------------------------------

interface PresetPickerProps {
  presets?: readonly PresetTuple[]
  card?: typeof PresetPreviewCard
}

function PresetPicker({
  presets,
  card,
  ...props
}: PresetPickerProps & PresetPickerToggleButtonProps) {
  return (
    <PresetPickerSheet presets={presets}>
      <PresetPickerToggleButton {...props} />
      <PresetPickerContent>
        <PresetPickerThemeToggleGroup />
        <PresetPickerList card={card} />
      </PresetPickerContent>
    </PresetPickerSheet>
  )
}

export {
  PresetPicker,
  PresetPickerSheet,
  PresetPickerContent,
  PresetPickerThemeToggleGroup,
  PresetPickerList,
  PresetPickerToggleButton,
  usePresetPicker,
}
