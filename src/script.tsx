import { memo } from "react"
import { DEFAULT_PRESET_ATTR, DEFAULT_PRESET_KEY } from "./lib/constants"
import { DEFAULT_PRESET } from "./presets"

function presetScript({
  defaultPreset = DEFAULT_PRESET,
  presetKey = DEFAULT_PRESET_KEY,
  presetAttr = DEFAULT_PRESET_ATTR,
}) {
  try {
    const p = localStorage.getItem(presetKey) ?? defaultPreset
    if (p) document.documentElement.setAttribute(presetAttr, JSON.parse(p))
  } catch {}
}

const PresetScript = memo(
  ({
    defaultPreset = DEFAULT_PRESET,
    presetKey = DEFAULT_PRESET_KEY,
    presetAttr = DEFAULT_PRESET_ATTR,
  }: {
    defaultPreset?: string
    presetKey?: string
    presetAttr?: string
  }) => {
    const args = {
      defaultPreset,
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
