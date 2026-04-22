import { PRESET_BY_ID } from "~/config"
import { titleCase } from "~/lib/format"

function getPresetName(preset?: string, defaultValue = "Preset") {
  return (
    (preset ? PRESET_BY_ID[preset] : defaultValue) ||
    titleCase(preset || "") ||
    defaultValue
  )
}

export { getPresetName }
