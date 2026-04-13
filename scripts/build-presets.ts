import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { PRESETS } from "../src/config.ts"

const PRESETS_DIR = join(import.meta.dirname, "../src/presets")
const OUTPUT_DIR = join(import.meta.dirname, "../.presets")

mkdirSync(OUTPUT_DIR, { recursive: true })

for (const [id, name] of PRESETS) {
  const source = readFileSync(join(PRESETS_DIR, `${id}.css`), "utf-8")
  const content = `
@import "../src/custom-variants.css";

/* Theme: ${name} — applied to :root */
${source.replace(`[data-preset="${id}"]`, ":root")}
`

  writeFileSync(join(OUTPUT_DIR, `${id}.css`), content)
}

console.log(`  generated  ${PRESETS.length} preset files → .presets/`)
