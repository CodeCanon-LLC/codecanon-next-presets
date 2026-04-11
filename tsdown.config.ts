import { defineConfig } from "tsdown"

export default defineConfig({
  platform: "browser",
  dts: true,
  exports: true,
  external: ["react", "react-dom", "lucide-react", "next-themes"],
})
