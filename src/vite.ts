import { join } from "node:path"
import { fileURLToPath } from "node:url"
import {
  existsSync,
  readdirSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from "node:fs"
import type { Plugin, UserConfig } from "vite"
import { PRESET_BY_ID, PRESETS, type PresetTuple } from "./config.js"
import { createHash } from "node:crypto"

const PRESET_IDS = Object.keys(PRESET_BY_ID)

/**
 * Preset IDs to include. Unlisted presets will be excluded from the
 * compiled CSS and from the `PRESETS` export (so `PresetPicker` only
 * shows the presets you list here).
 *
 * @example
 * nextPresetsPlugin({
 *  include: ['claude', 'anew', 'rose']
 *  exclude: ['rose']
 *  add: [['my-brand', 'My Brand']]
 * })
 */
export interface NextPresetsPluginOptions {
  include?: string[]
  exclude?: string[]
  add?: PresetTuple[]
}

function hashConfig(config: NextPresetsPluginOptions) {
  return createHash("sha256")
    .update(JSON.stringify(config))
    .digest("hex")
    .slice(0, 8) // short hash is enough
}

function patchBundledPresetsModule(
  code: string,
  NEXT_PRESETS: PresetTuple[]
): string {
  const replacement = `const PRESETS = ${JSON.stringify(NEXT_PRESETS)};`
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

function validatePresets(
  requested: string[],
  fallback: PresetTuple[]
): PresetTuple[] {
  const valid: PresetTuple[] = []

  for (const id of requested) {
    const name = PRESET_BY_ID[id]

    if (name) {
      valid.push([id, name])
    } else {
      console.warn(
        `[codecanon-presets] Unknown preset ID "${id}" — skipping. ` +
          `Valid IDs: ${[...PRESET_IDS].join(", ")}`
      )
    }
  }
  if (!valid.length) {
    if (fallback.length) {
      console.error(
        `[codecanon-presets] No valid preset IDs provided — falling back to all ${fallback.length} presets.`
      )
    }

    return fallback
  }

  return valid
}

function toUrl(p: string) {
  return p.replace(/\\/g, "/")
}

export function nextPresetsPlugin(options: NextPresetsPluginOptions): Plugin {
  const hasInclude = !!options.include?.length
  const hasExclude = !!options.exclude?.length
  const hasAdd = !!options.add?.length

  if (!hasInclude && !hasExclude && !hasAdd) {
    return { name: "codecanon-presets" }
  }

  const excludePresets = Object.fromEntries(
    validatePresets(options.exclude || [], [])
  )
  const includePresets = validatePresets(
    options.include || [],
    !options.include?.length ? [] : PRESETS
  ).filter(([id]) => !excludePresets[id])
  const addPresets = (options.add || []).filter(([id]) => !excludePresets[id])

  const hash = hashConfig(options)

  // Derive the dist/ directory from the location of this compiled file at runtime.
  // When published, this file lives at dist/vite.mjs, so import.meta.url points there.
  const distDir = resolveRuntimeDistDir()

  // Hash is embedded in the filenames so that a config change produces a
  // different alias replacement path. Vite includes the resolved alias in its
  // optimizer cache key, so a path change triggers automatic cache invalidation
  // — no manual cache-clearing or --force flag needed.
  const filteredCssPath = join(distDir, `_filtered.${hash}.css`)
  const distIndexPath = toUrl(join(distDir, "index.js"))

  const filteredJsPath = join(distDir, `_filtered.${hash}.js`)

  const presetPaths = includePresets.map(([id]) =>
    toUrl(join(distDir, "presets", `${id}.css`))
  )

  // Remove stale filtered files from previous configs so dist doesn't fill up.
  try {
    for (const file of readdirSync(distDir)) {
      if (
        /^_filtered\.[0-9a-f]+\.(js|css)$/.test(file) &&
        !file.includes(hash)
      ) {
        unlinkSync(join(distDir, file))
      }
    }
  } catch {
    // Non-fatal: stale files are harmless if cleanup fails.
  }

  // Write filtered CSS to a real file on disk. Tailwind CSS v4's bundler
  // resolves @import paths via Vite's alias system and then reads the result
  // from disk — it does not go through Vite's virtual-module load hooks.
  // The alias in config() below points styles.css here.
  writeFileSync(
    filteredCssPath,
    presetPaths
      .filter(existsSync)
      .map((p) => readFileSync(p, "utf8"))
      .join("\n"),
    "utf8"
  )

  // Patched dist/index.js with PRESETS filtered to the selected subset.
  writeFileSync(
    filteredJsPath,
    patchBundledPresetsModule(readFileSync(distIndexPath, "utf8"), [
      ...addPresets,
      ...includePresets,
    ]),
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
