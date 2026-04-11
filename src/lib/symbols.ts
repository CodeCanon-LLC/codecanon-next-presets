import { isMac } from "~/lib/os"

const MOD = isMac ? "⌘" : "Ctrl"
const SLASH = "/"
const SHIFT = "⇧"
const ARROW_UP = "↑"
const ARROW_DOWN = "↓"
const DELETE = "⌫"
const EM_DASH = "—"
const X_SYMBOL = "×"
const MIDDLE_DOT = "·"

export {
  ARROW_DOWN,
  ARROW_UP,
  DELETE,
  EM_DASH,
  MIDDLE_DOT,
  MOD,
  SHIFT,
  SLASH,
  X_SYMBOL,
}
