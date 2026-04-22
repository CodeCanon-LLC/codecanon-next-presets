import { PRESET_BY_ID } from "~/config"

function getPresetName(preset?: string, defaultValue = "Preset") {
  return (preset ? PRESET_BY_ID[preset] : defaultValue) || defaultValue
}

export { getPresetName }
