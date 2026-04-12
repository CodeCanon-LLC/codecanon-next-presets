import { memo } from "react"
import { DEFAULT_PRESET_ATTR, DEFAULT_PRESET_KEY } from "./lib/constants"

function presetScript(presetKey = DEFAULT_PRESET_KEY) {
  try {
    const p = localStorage.getItem(presetKey)
    if (p)
      document.documentElement.setAttribute(DEFAULT_PRESET_ATTR, JSON.parse(p))
  } catch {}
}

const PresetScript = memo(
  ({ presetKey = DEFAULT_PRESET_KEY }: { presetKey?: string }) => (
    <script
      suppressHydrationWarning
      dangerouslySetInnerHTML={{
        __html: `(${presetScript.toString()})(${JSON.stringify(presetKey)})`,
      }}
    />
  )
)

export { PresetScript, presetScript }
