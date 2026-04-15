import { memo } from "react"
import { DEFAULT_PRESET_ATTR, DEFAULT_PRESET_KEY } from "./lib/constants"

interface PresetScriptProps {
  storageKey?: string
  attribute?: string
}

function presetScript({
  storageKey = DEFAULT_PRESET_KEY,
  attribute = DEFAULT_PRESET_ATTR,
}: PresetScriptProps) {
  try {
    const p = localStorage.getItem(storageKey)
    if (p) document.documentElement.setAttribute(attribute, JSON.parse(p))
  } catch {}
}

const PresetScript = memo(
  ({
    storageKey = DEFAULT_PRESET_KEY,
    attribute = DEFAULT_PRESET_ATTR,
  }: PresetScriptProps) => {
    const args = {
      storageKey,
      attribute,
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
