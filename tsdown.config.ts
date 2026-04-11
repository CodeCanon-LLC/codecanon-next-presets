import { defineConfig } from "tsdown"

export default defineConfig({
  platform: "browser",
  entry: ["src/index.ts"],
  external: ["react", "react-dom"],
})
