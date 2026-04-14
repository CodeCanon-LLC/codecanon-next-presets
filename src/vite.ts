import { basename, join } from "node:path"
import { fileURLToPath } from "node:url"
import { existsSync, readFileSync, writeFileSync } from "node:fs"
import type { Plugin, UserConfig } from "vite"
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

function patchBundledPresetsModule(
  code: string,
  filteredPresets: readonly (readonly [string, string])[]
): string {
  const replacement = `const PRESETS = ${JSON.stringify(filteredPresets)};`
  return code.replace(/const PRESETS = \[[\s\S]*?\];/, replacement)
}

function resolveRuntimeDistDir(): string {
  const currentDir = fileURLToPath(new URL(".", import.meta.url))
  const candidates = [currentDir, join(currentDir, "..", "dist")]
  for (const dir of candidates) {
    if (existsSync(join(dir, "index.js"))) {
      return dir
    }
  }
  return currentDir
}

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
  const filteredPresets = PRESETS.filter(([id]) => selectedIds.includes(id))

  // Derive the dist/ directory from the location of this compiled file at runtime.
  // When published, this file lives at dist/vite.mjs, so import.meta.url points there.
  const distDir = resolveRuntimeDistDir()
  const toUrl = (p: string) => p.replace(/\\/g, "/")

  const componentsPath = toUrl(join(distDir, "components.css"))
  const presetPaths = filteredPresets.map(([id]) =>
    toUrl(join(distDir, "presets", `${id}.css`))
  )

  // Write filtered CSS to a real file on disk. Tailwind CSS v4's bundler
  // resolves @import paths via Vite's alias system and then reads the result
  // from disk — it does not go through Vite's virtual-module load hooks.
  // The alias in config() below points styles.css here.
  const filteredCssPath = join(distDir, "_filtered.css")
  writeFileSync(
    filteredCssPath,
    [componentsPath, ...presetPaths]
      .filter(existsSync)
      .map((p) => readFileSync(p, "utf8"))
      .join("\n"),
    "utf8"
  )

  // Patched dist/index.js with PRESETS filtered to the selected subset.
  const distIndexPath = toUrl(join(distDir, "index.js"))
  const filteredJsPath = join(distDir, "_filtered.js")
  writeFileSync(
    filteredJsPath,
    patchBundledPresetsModule(
      readFileSync(distIndexPath, "utf8"),
      filteredPresets
    ),
    "utf8"
  )

  return {
    name: "codecanon-presets",
    enforce: "pre",

    config(): UserConfig {
      return {
        resolve: {
          // Vite's alias resolver runs before plugin resolveId hooks AND before
          // @tailwindcss/vite's internal CSS bundler, so this intercepts the
          // import regardless of plugin registration order.
          alias: [
            // Redirect @codecanon/next-presets/styles.css to the filtered file.
            {
              find: /^@codecanon\/next-presets\/styles\.css(\?.*)?$/,
              replacement: filteredCssPath,
            },
            // Redirect @codecanon/next-presets to the filtered file.
            {
              find: /^@codecanon\/next-presets(\?.*)?$/,
              replacement: filteredJsPath,
            },
          ],
        },
      }
    },
  }
}
