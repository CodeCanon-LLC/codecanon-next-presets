import { MonitorCog, Moon, Palette, Sun } from "lucide-react"
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from "react"
import { useBoolean } from "~/hooks/use-boolean"

import { usePreset, useTheme, type Theme } from "~/providers"
import { Input } from "~/components/ui/input"
import { Scroller } from "~/components/ui/scroller"
import {
  Sheet,
  SheetContent,
  SheetContentClose,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet"
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group"
import { PRESETS, type PresetTuple } from "~/presets"
import { cn } from "~/lib/utils"
import { DefaultAppPreviewCard } from "./default-app-preview-card"

type PresetPickerState = {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  toggleOpen: () => void
}

const PresetsPickerContext = createContext<PresetPickerState>({
  open: false,
  setOpen: () => {},
  toggleOpen: () => {},
})

function PresetPicker({ children }: PropsWithChildren) {
  const [open, setOpen] = useState(false)

  const toggleOpen = () => setOpen((open) => !open)

  const context: PresetPickerState = useMemo(
    () => ({
      open,
      setOpen,
      toggleOpen,
    }),
    [open]
  )

  return (
    <PresetsPickerContext.Provider value={context}>
      {children}
    </PresetsPickerContext.Provider>
  )
}

function usePresetPicker(caller = "usePresetPicker") {
  const context = useContext(PresetsPickerContext)

  if (!context) {
    throw new Error(`${caller} must be used within a PresetPicker`)
  }

  return context
}

function PresetPickerThemeToggleGroup({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { theme, setTheme } = useTheme()

  return (
    <ToggleGroup
      {...(props as any)}
      className={cn("w-full border", className)}
      type="single"
      value={theme ?? ""}
      onValueChange={(value) => value && setTheme(value as Theme)}
    >
      <ToggleGroupItem className="flex-1" value="light">
        <Sun />
        Light
      </ToggleGroupItem>
      <ToggleGroupItem className="flex-1" value="dark">
        <Moon />
        Dark
      </ToggleGroupItem>
      <ToggleGroupItem className="flex-1" value="system">
        <MonitorCog />
        System
      </ToggleGroupItem>
    </ToggleGroup>
  )
}

function PresetPickerContent({
  showDock,
  previewCard: AppPreviewCard = DefaultAppPreviewCard,
  presets = PRESETS,
  className,
  ...props
}: {
  showDock?: boolean
  previewCard?: typeof DefaultAppPreviewCard
  /**
   * The list of presets to display. Defaults to the built-in `PRESETS`.
   * Extend with custom presets by spreading: `[...PRESETS, ["my-brand", "My Brand"]]`
   */
  presets?: readonly PresetTuple[]
} & React.ComponentProps<"div">) {
  const { open } = usePresetPicker("PresetPickerContent")
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

  // Reset when sheet closes
  useEffect(() => {
    if (!open) {
      setQuery("")
    }
  }, [open])

  // Scroll highlighted item into view
  useEffect(() => {
    const highlightedElement = itemRefs.current.get(highlightedIndex)
    if (highlightedElement && scrollerRef.current) {
      const parent = scrollerRef.current
      const parentRect = parent.getBoundingClientRect()
      const elementRect = highlightedElement.getBoundingClientRect()

      // Scroll if above the top
      if (elementRect.top < parentRect.top + 20) {
        parent.scrollTop -= parentRect.top + 20 - elementRect.top
      }
      // Scroll if below the bottom
      else if (elementRect.bottom > parentRect.bottom - 20) {
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

  return (
    <>
      <Input
        type="text"
        placeholder="Search themes..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        autoFocus
      />
      <Scroller className="min-h-0 flex-1" ref={scrollerRef}>
        <div
          className={cn("flex flex-col gap-1 overflow-y-auto", className)}
          {...props}
        >
          {filteredPresets.length > 0 ? (
            filteredPresets.map(([id, label], index) => (
              <AppPreviewCard
                key={id}
                showDock={showDock ?? false}
                ref={(el) => {
                  if (!mounted && preset === id) {
                    setMounted(true)
                    el?.scrollIntoView({
                      block: "center",
                      behavior: "instant",
                    })
                  }

                  if (el) {
                    itemRefs.current.set(index, el)
                  } else {
                    itemRefs.current.delete(index)
                  }
                }}
                active={preset === id}
                highlighted={index === highlightedIndex}
                label={label}
                presetKey={id}
                onClick={() => {
                  setPreset(id)
                  setHighlightedIndex(index)
                }}
              />
            ))
          ) : (
            <div className="text-muted-foreground py-8 text-center text-sm">
              No themes found
            </div>
          )}
        </div>
      </Scroller>
    </>
  )
}

function PresetPickerSheet({
  children,
  ...props
}: React.ComponentProps<typeof Sheet>) {
  const { open, setOpen } = usePresetPicker("PresetPickerSheet")

  return (
    <Sheet open={open} onOpenChange={setOpen} modal={false} {...props}>
      <SheetContent
        side="left"
        className={cn(
          "pointer-events-auto max-w-screen data-[side=left]:w-80 data-[side=right]:w-80 sm:max-w-md",
          "data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left"
        )}
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <SheetContentClose />
        <SheetHeader>
          <SheetTitle className="flex gap-2">
            <Palette />
            Preset Picker
          </SheetTitle>
        </SheetHeader>
        <div className="flex min-h-0 flex-1 flex-col gap-4 px-4">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  )
}

export {
  PresetPicker,
  usePresetPicker,
  PresetPickerSheet,
  PresetPickerContent,
  PresetPickerThemeToggleGroup,
}
