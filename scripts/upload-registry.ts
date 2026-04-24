import { readdirSync } from "node:fs"
import { join } from "node:path"
import { execSync } from "node:child_process"

const dir = join(import.meta.dir, "../public/r")

for (const file of readdirSync(dir)) {
  if (!file.endsWith(".json")) continue
  const key = file.replace(".json", "")
  execSync(
    `bunx wrangler kv key put --remote --namespace-id=7fb2a9b08826496d876fc9dd3336e383 "${key}" --path="${join(dir, file)}"`,
    { stdio: "inherit" }
  )
}
