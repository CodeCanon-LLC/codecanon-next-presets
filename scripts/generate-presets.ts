import { existsSync, readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"

const PRESETS_DIR = join(import.meta.dirname, "../src/presets")
const INDEX_TS = join(PRESETS_DIR, "index.ts")
const INDEX_CSS = join(PRESETS_DIR, "index.css")

// Parse the PRESETS array from index.ts
function parsePresets(): [string, string][] {
  const content = readFileSync(INDEX_TS, "utf-8")
  const match = content.match(
    /export const PRESETS\s*=\s*\[([\s\S]*?)\]\s*as const/
  )
  if (!match) throw new Error("Could not find PRESETS array in index.ts")

  const entries: [string, string][] = []
  const entryRegex = /\[\s*"([^"]+)"\s*,\s*"([^"]+)"\s*\]/g
  let m: RegExpExecArray | null
  while ((m = entryRegex.exec(match[1])) !== null) {
    entries.push([m[1], m[2]])
  }
  return entries
}

function parseDefaultPreset(): string {
  const content = readFileSync(INDEX_TS, "utf-8")
  const match = content.match(/export const DEFAULT_PRESET[^=]*=\s*"([^"]+)"/)
  if (!match) throw new Error("Could not find DEFAULT_PRESET in index.ts")
  return match[1]
}

function generateDefaultCss(defaultId: string): string {
  const sourcePath = join(PRESETS_DIR, `${defaultId}.css`)
  if (!existsSync(sourcePath))
    throw new Error(`Preset file not found: ${defaultId}.css`)

  const source = readFileSync(sourcePath, "utf-8")
  const replaced = source.replace(`[data-preset="${defaultId}"]`, ":root")
  return (
    `/* Generated Default Theme */\n` +
    `/* Selected theme "${defaultId}" set by \`DEFAULT_PRESET\` in src/presets/index.ts */\n` +
    `/* This is the base theme that's used when no data-preset is set */\n` +
    `\n${replaced}`
  )
}

function skeletonCss(id: string, name: string): string {
  return `/* Theme: ${name} */
[data-preset="${id}"] {
  @variant preset-light {
    /* TODO: Add light theme variables */
  }

  @variant preset-dark {
    /* TODO: Add dark theme variables */
  }
}
`
}

function generateIndexCss(presets: [string, string][]): string {
  const imports = presets.map(([id]) => `@import "./${id}.css";`).join("\n")
  return `/* Default theme (used when no data-preset is set) */
@import "./default.css";

/* Theme presets */
${imports}
`
}

const presets = parsePresets()
let created = 0
let skipped = 0

for (const [id, name] of presets) {
  const cssPath = join(PRESETS_DIR, `${id}.css`)
  if (!existsSync(cssPath)) {
    writeFileSync(cssPath, skeletonCss(id, name))
    console.log(`  created  ${id}.css`)
    created++
  } else {
    skipped++
  }
}

const defaultId = parseDefaultPreset()
writeFileSync(join(PRESETS_DIR, "default.css"), generateDefaultCss(defaultId))
console.log(`  updated  default.css (from ${defaultId}.css)`)

writeFileSync(INDEX_CSS, generateIndexCss(presets))
console.log(`  updated  index.css`)

console.log(`\nDone — ${created} created, ${skipped} already existed.`)
