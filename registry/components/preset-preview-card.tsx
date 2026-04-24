import { usePreset, useTheme, usePresetName } from "@codecanon/next-presets"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const EM_DASH = "—"

function ActiveBadge() {
  return (
    <>
      <span className="text-sm font-bold">{EM_DASH}</span>{" "}
      <span className="text-sm font-bold">active</span>
    </>
  )
}

type PresetCardBaseProps = {
  preset: string
  highlighted?: boolean
  ref?: React.Ref<HTMLDivElement>
} & Omit<React.ComponentProps<typeof Card>, "ref">

function PresetPreviewCard({
  preset,
  highlighted,
  ref,
  className,
  ...props
}: PresetCardBaseProps) {
  const { preset: activePreset } = usePreset("PresetPreviewCard")
  const { colorScheme = "light" } = useTheme()
  const label = usePresetName(preset)

  const active = preset === activePreset

  return (
    <div
      ref={ref}
      {...props}
      className={cn(
        "hover:bg-accent hover:text-accent-foreground group/theme-preset-card m-2 cursor-pointer overflow-hidden rounded-md border transition-all hover:shadow-xl",
        highlighted && "bg-accent text-accent-foreground shadow-xl",
        active && "ring-primary ring-3",
        highlighted && !active && "ring-accent ring-3",
        "h-49 w-67 max-w-11/12",
        "flex flex-col",
        className
      )}
    >
      <div className="flex justify-center gap-2 border-b p-3 text-center">
        <span className="text-sm font-medium">{label}</span>
        {active && <ActiveBadge />}
      </div>

      <div
        data-preset={preset}
        className={cn(
          "bg-background text-foreground flex-1 p-3",
          colorScheme === "dark" && "dark"
        )}
      >
        <div className="flex h-full gap-2">
          {/* Sidebar */}
          <div className="bg-sidebar text-sidebar-foreground border-sidebar-border flex w-16 flex-col gap-1 rounded p-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={cn(
                  "h-2 rounded",
                  i === 1 ? "bg-primary" : "bg-sidebar-accent opacity-50"
                )}
              />
            ))}
          </div>

          {/* Content */}
          <div className="flex flex-1 flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <div className="bg-muted h-2 flex-1 rounded" />
              <div className="bg-primary h-2 w-8 rounded" />
            </div>
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

export { PresetPreviewCard }
