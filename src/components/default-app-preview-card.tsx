import { usePreset, useTheme } from "~/providers"
import { Card } from "~/components/ui/card"
import { titleCase } from "~/lib/format"
import { EM_DASH } from "~/lib/symbols"
import { cn } from "~/lib/utils"

function DefaultAppPreviewCard({
  presetKey,
  label = titleCase(presetKey || ""),
  active,
  showDock,
  highlighted,
  className,
  ref,
  ...props
}: {
  showDock?: boolean
  label?: string
  /** Built-in preset ID or any custom preset ID. */
  presetKey?: string
  active?: boolean
  highlighted?: boolean
  ref?: React.Ref<HTMLDivElement>
} & React.ComponentProps<typeof Card>) {
  const { preset: activePresetKey } = usePreset()
  const { colorScheme = "light" } = useTheme()

  // Determine which theme to use for the preview
  const themeKey = presetKey || activePresetKey

  return (
    <div
      ref={ref}
      {...props}
      className={cn(
        "hover:bg-accent hover:text-accent-foreground group/theme-preset-card m-2 cursor-pointer overflow-hidden rounded-md border transition-all hover:shadow-xl",
        highlighted && "bg-accent text-accent-foreground shadow-xl",
        active && "ring-primary ring-3",
        highlighted &&
          !active &&
          "ring-accent-foreground ring-.5 ring-offset-1",
        "h-49 w-67 max-w-11/12",
        "flex flex-col",
        className
      )}
    >
      {/* Preset Label */}
      <div className="flex justify-center gap-2 border-b p-3 text-center">
        <span className="text-sm font-medium">{label}</span>
        {active && (
          <>
            <span className="text-sm font-bold">{EM_DASH}</span>{" "}
            <span className="text-sm font-bold">active</span>
          </>
        )}
      </div>

      {/* Mock App Preview */}
      <div
        data-preset={themeKey}
        className={cn(
          "bg-background text-foreground flex-1 p-3",
          colorScheme === "dark" && "dark"
        )}
      >
        {/* Mock Sidebar */}
        <div
          className={cn("flex h-full gap-2", showDock && "flex-col-reverse")}
        >
          <div
            className={cn(
              "bg-sidebar text-sidebar-foreground border-sidebar-border flex w-16 flex-col gap-1 rounded p-2",
              showDock && "mx-auto flex-row"
            )}
          >
            {/* Mock sidebar items */}
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={cn(
                  "h-2 rounded",
                  showDock ? "w-2" : "h-2",
                  i === 1 ? "bg-primary" : "bg-sidebar-accent opacity-50"
                )}
              />
            ))}
          </div>

          {/* Mock Content Area */}
          <div className="flex flex-1 flex-col gap-2">
            {/* Mock Header with Primary Button */}
            <div className="flex items-center justify-between gap-2">
              <div className="bg-muted h-2 flex-1 rounded" />
              <div className="bg-primary h-2 w-8 rounded" />
            </div>

            {/* Mock Cards */}
            <div className="grid flex-1 grid-cols-1 gap-2 md:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={cn(
                    "bg-card border-border rounded border p-2",
                    i > 2 && "hidden md:block"
                  )}
                >
                  <div className="bg-card-foreground mb-1 h-1.5 w-3/4 rounded opacity-70" />
                  <div className="bg-muted h-1 w-1/2 rounded" />
                </div>
              ))}
            </div>

            {/* Mock Footer with Accent */}
            <div className="flex gap-2">
              <div className="bg-secondary h-1.5 flex-1 rounded" />
              <div className="bg-accent h-1.5 w-12 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export { DefaultAppPreviewCard }
