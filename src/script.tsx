import { memo } from "react"
import { DEFAULT_PRESET_ATTR, DEFAULT_PRESET_KEY } from "./lib/constants"

function presetScript({
  presetKey = DEFAULT_PRESET_KEY,
  presetAttr = DEFAULT_PRESET_ATTR,
}) {
  try {
    const p = localStorage.getItem(presetKey)
    if (p) document.documentElement.setAttribute(presetAttr, JSON.parse(p))
  } catch {}
}

const PresetScript = memo(
  ({
    presetKey = DEFAULT_PRESET_KEY,
    presetAttr = DEFAULT_PRESET_ATTR,
  }: {
    presetKey?: string
    presetAttr?: string
  }) => {
    const args = {
      presetKey,
      presetAttr,
    }

    return (
      <script
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: `(${presetScript.toString()})(${JSON.stringify(args)})`,
        }}
      />
    )
  }
)

export { PresetScript, presetScript }
