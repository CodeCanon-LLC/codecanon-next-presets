import { defineConfig } from "tsdown"

export default defineConfig([
  {
    platform: "browser",
    entry: ["src/index.ts"],
    deps: {
      neverBundle: ["react", "react-dom"],
    },
  },
  {
    platform: "node",
    entry: ["src/vite.ts"],
    deps: {
      neverBundle: ["vite", "path", "url"],
    },
  },
])
