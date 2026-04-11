const isMac =
  typeof navigator !== "undefined" && /Mac/i.test(navigator.platform)

export { isMac }
