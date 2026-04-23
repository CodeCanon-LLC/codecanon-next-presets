/// <reference types="vitest/config" />
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { playwright } from "@vitest/browser-playwright"
import path from "path"
import { defineConfig } from "vite"
import { nextPresetsPlugin } from "./dist/vite.mjs"

export default defineConfig({
  root: "./playground",
  plugins: [
    react(),
    tailwindcss(),
    nextPresetsPlugin({
      add: [["brown", "Brown"]],
    }),
  ],
  test: {
    root: ".",
    browser: {
      enabled: true,
      provider: playwright(),
      instances: [{ browser: "chromium" }],
      headless: true,
    },
  },
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "./src"),
      "@codecanon/next-presets": path.resolve(__dirname, "./dist"),
    },
  },
})
