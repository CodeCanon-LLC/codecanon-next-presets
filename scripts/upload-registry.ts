import { readdirSync } from "node:fs"
import { join } from "node:path"
import { execSync } from "node:child_process"

const dir = join(import.meta.dir, "../public/r")
const config = join(import.meta.dir, "../wrangler.toml")

for (const file of readdirSync(dir)) {
  if (!file.endsWith(".json")) continue
  const key = file.replace(".json", "")
  execSync(
    `bunx wrangler kv key put --config="${config}" --binding=REGISTRY --remote "${key}" --path="${join(dir, file)}"`,
    { stdio: "inherit" }
  )
}
