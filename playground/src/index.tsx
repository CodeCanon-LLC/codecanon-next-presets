import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { App } from "./App.tsx"
import { PresetProvider } from "@codecanon/next-presets"
import "./style.css"

createRoot(document.querySelector("#app")!).render(
  <StrictMode>
    <PresetProvider defaultTheme="dark">
      <App />
    </PresetProvider>
  </StrictMode>
)
