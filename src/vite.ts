import { join } from "node:path"
import { fileURLToPath } from "node:url"
import type { Plugin } from "vite"
import { PRESETS } from "./config.js"

const ALL_PRESET_IDS = new Set<string>(PRESETS.map(([id]) => id))

export interface NextPresetsPluginOptions {
  /**
   * Preset IDs to include. Unlisted presets will be excluded from the
   * compiled CSS and from the `PRESETS` export (so `PresetPicker` only
   * shows the presets you list here).
   *
   * @example
   * nextPresetsPlugin({ presets: ['claude', 'anew', 'rose'] })
   */
  presets: string[]
}

const VIRTUAL_CSS_ID = "\0virtual:@codecanon/next-presets/filtered.css"
const VIRTUAL_JS_ID = "\0virtual:@codecanon/next-presets/filtered.js"

function validatePresets(requested: string[]): string[] {
  const valid: string[] = []
  for (const id of requested) {
    if (ALL_PRESET_IDS.has(id)) {
      valid.push(id)
    } else {
      console.warn(
        `[codecanon-presets] Unknown preset ID "${id}" — skipping. ` +
          `Valid IDs: ${[...ALL_PRESET_IDS].join(", ")}`
      )
    }
  }
  if (valid.length === 0) {
    console.error(
      `[codecanon-presets] No valid preset IDs provided — falling back to all ${PRESETS.length} presets.`
    )
    return PRESETS.map(([id]) => id)
  }
  return valid
}

export function nextPresetsPlugin(options: NextPresetsPluginOptions): Plugin {
  const selectedIds = validatePresets(options.presets)

  // Filtered PRESETS in original canonical order
  const filteredPresets = PRESETS.filter(([id]) => selectedIds.includes(id))

  // Derive the dist/ directory from the location of this compiled file at runtime.
  // When published, this file lives at dist/vite.js, so import.meta.url points there.
  const distDir = fileURLToPath(new URL(".", import.meta.url))

  // Use forward slashes in CSS @import paths (required on Windows too)
  const toUrl = (p: string) => p.replace(/\\/g, "/")

  const componentsPath = toUrl(join(distDir, "components.css"))
  const presetPaths = filteredPresets.map(([id]) =>
    toUrl(join(distDir, "presets", `${id}.css`))
  )

  const virtualCssContent = [
    `@import "${componentsPath}";`,
    ...presetPaths.map((p) => `@import "${p}";`),
  ].join("\n")

  // Absolute path to dist/index.js — avoids re-triggering resolveId (loop guard)
  const distIndexPath = toUrl(join(distDir, "index.js"))
  const virtualJsContent = [
    `export * from "${distIndexPath}";`,
    `export const PRESETS = ${JSON.stringify(filteredPresets)};`,
  ].join("\n")

  return {
    name: "codecanon-presets",
    enforce: "pre",

    resolveId(id, importer) {
      if (id === "@codecanon/next-presets/styles.css") {
        return VIRTUAL_CSS_ID
      }
      // Guard: don't intercept when the importer is the virtual JS module itself
      if (id === "@codecanon/next-presets" && importer !== VIRTUAL_JS_ID) {
        return VIRTUAL_JS_ID
      }
      return undefined
    },

    load(id) {
      if (id === VIRTUAL_CSS_ID) {
        return virtualCssContent
      }
      if (id === VIRTUAL_JS_ID) {
        return virtualJsContent
      }
      return undefined
    },
  }
}
