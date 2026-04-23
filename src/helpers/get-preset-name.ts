import { PRESET_BY_ID, PRESETS, type PresetTuple } from "~/config"
import { titleCase } from "~/lib/format"

let STORAGE_PRESETS: PresetTuple[] = PRESETS
let STORAGE_PRESET_BY_ID: Record<string, string> = PRESET_BY_ID

function getPresetName(
  preset?: string,
  {
    presets = PRESETS,
    defaultValue = preset ? titleCase(preset) : "Preset",
  }: {
    presets?: PresetTuple[]
    defaultValue?: string
  } = {}
) {
  if (!preset) return defaultValue

  if (STORAGE_PRESETS !== presets) {
    STORAGE_PRESETS = presets
    STORAGE_PRESET_BY_ID = Object.fromEntries(presets)
  }

  return STORAGE_PRESET_BY_ID[preset] || defaultValue
}

export { getPresetName }
