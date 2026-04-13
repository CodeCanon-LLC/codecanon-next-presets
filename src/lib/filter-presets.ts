import { PRESETS, type PresetTuple } from "~/config"

/**
 * Returns a filtered subset of the PRESETS array containing only the
 * preset IDs listed in `ids`, preserving the original order.
 *
 * Use this with the `presets` prop on `PresetPicker` when importing
 * preset CSS selectively instead of the full `styles.css`.
 *
 * @example
 * <PresetPicker presets={filterPresets(['claude', 'anew', 'rose'])} />
 */
export function filterPresets(ids: string[]): PresetTuple[] {
  const set = new Set(ids)
  return PRESETS.filter(([id]) => set.has(id))
}
