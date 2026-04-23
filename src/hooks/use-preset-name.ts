import { getPresetName } from "~/helpers/get-preset-name"
import { usePreset } from "~/providers"

function usePresetName(preset?: string) {
  const { preset: activePreset, presets } = usePreset("usePresetName")

  return getPresetName(preset || activePreset, { presets })
}

export { usePresetName }
