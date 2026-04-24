import { readdirSync, existsSync } from "node:fs"
import { join } from "node:path"
import { execSync } from "node:child_process"

const dir = join(import.meta.dir, "../public/r")
const config = join(import.meta.dir, "../wrangler.toml")

// Args after the script name, e.g.: bun run scripts/upload-registry.ts preset-picker preset-dropdown-picker
const requested = process.argv.slice(2)

function upload(key: string, filePath: string) {
  console.log(`Uploading ${key}...`)
  execSync(
    `bunx wrangler kv key put --config="${config}" --binding=REGISTRY --remote "${key}" --path="${filePath}"`,
    { stdio: "inherit" },
  )
}

if (requested.length > 0) {
  // Upload only the requested keys
  for (const key of requested) {
    const filePath = join(dir, `${key}.json`)
    if (!existsSync(filePath)) {
      console.error(`Error: ${key}.json not found in public/r/ — did you run build:registry first?`)
      process.exit(1)
    }
    upload(key, filePath)
  }
} else {
  // Upload everything
  for (const file of readdirSync(dir)) {
    if (!file.endsWith(".json")) continue
    const key = file.replace(".json", "")
    upload(key, join(dir, file))
  }
}
