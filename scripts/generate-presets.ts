import { existsSync, readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"

const PRESETS_DIR = join(import.meta.dirname, "../src/presets")
const INDEX_TS = join(PRESETS_DIR, "index.ts")
const INDEX_CSS = join(PRESETS_DIR, "index.css")

// Parse the PRESETS array from index.ts
function parsePresets(): [string, string][] {
  const content = readFileSync(INDEX_TS, "utf-8")
  const match = content.match(/export const PRESETS\s*=\s*\[([\s\S]*?)\]\s*as const/)
  if (!match) throw new Error("Could not find PRESETS array in index.ts")

  const entries: [string, string][] = []
  const entryRegex = /\[\s*"([^"]+)"\s*,\s*"([^"]+)"\s*\]/g
  let m: RegExpExecArray | null
  while ((m = entryRegex.exec(match[1])) !== null) {
    entries.push([m[1], m[2]])
  }
  return entries
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

writeFileSync(INDEX_CSS, generateIndexCss(presets))
console.log(`  updated  index.css`)

console.log(`\nDone — ${created} created, ${skipped} already existed.`)
