import { getPresetName } from "~/helpers/get-preset-name"
import { usePreset } from "~/providers"

function usePresetName(preset: string) {
  const { presets } = usePreset("usePresetName")

  return getPresetName(preset, { presets })
}

export { usePresetName }
