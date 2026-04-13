import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { PRESETS } from "../src/config.ts"

const PRESETS_DIR = join(import.meta.dirname, "../src/presets")
const OUTPUT_DIR = join(import.meta.dirname, "../.presets")
const SCOPED_OUTPUT_DIR = join(import.meta.dirname, "../.presets-scoped")

mkdirSync(OUTPUT_DIR, { recursive: true })
mkdirSync(SCOPED_OUTPUT_DIR, { recursive: true })

for (const [id, name] of PRESETS) {
  const source = readFileSync(join(PRESETS_DIR, `${id}.css`), "utf-8")

  // :root scoped version → .presets/ → compiled to dist/default/
  writeFileSync(
    join(OUTPUT_DIR, `${id}.css`),
    `@import "../src/custom-variants.css";\n\n/* Theme: ${name} — applied to :root */\n${source.replace(`[data-preset="${id}"]`, ":root")}`,
  )

  // [data-preset] scoped version → .presets-scoped/ → compiled to dist/presets/
  writeFileSync(
    join(SCOPED_OUTPUT_DIR, `${id}.css`),
    `@import "../src/custom-variants.css";\n\n/* Theme: ${name} */\n${source}`,
  )
}

console.log(
  `  generated  ${PRESETS.length} preset files → .presets/ (default) + .presets-scoped/ (scoped)`,
)
