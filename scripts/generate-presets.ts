import { existsSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { PRESETS } from "../src/config.ts"

const PRESETS_DIR = join(import.meta.dirname, "../src/presets")
const INDEX_CSS = join(PRESETS_DIR, "index.css")

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
  return `/* Theme presets */\n${imports}`
}

let created = 0
let skipped = 0

for (const [id, name] of PRESETS) {
  const cssPath = join(PRESETS_DIR, `${id}.css`)
  if (!existsSync(cssPath)) {
    writeFileSync(cssPath, skeletonCss(id, name))
    console.log(`  created  ${id}.css`)
    created++
  } else {
    skipped++
  }
}

writeFileSync(INDEX_CSS, generateIndexCss([...PRESETS]))
console.log(`  updated  index.css`)

console.log(`\nDone — ${created} created, ${skipped} already existed.`)
