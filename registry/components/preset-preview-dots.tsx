import { cn } from "@/lib/utils"

const BG_COLORS = ["bg-primary", "bg-secondary", "bg-accent", "bg-muted"]

function PresetPreviewDots({ preset }: { preset: string }) {
  return (
    <div className="flex items-center gap-0.5" data-preset={preset}>
      {BG_COLORS.map((bgColor, i) => (
        <div
          key={i}
          className={cn(
            "border-border/50 h-3 w-3 rounded-full border",
            bgColor
          )}
        />
      ))}
    </div>
  )
}

export { PresetPreviewDots }
