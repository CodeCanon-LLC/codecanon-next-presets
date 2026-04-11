// someValue -> Some Value
// some value -> Some Value
// some_value -> Some Value
// SomeValue -> Some Value
function titleCase(str: string) {
  if (!str) return ""

  // Replace underscores and hyphens with space
  let s = str.replace(/[_-]/g, " ")

  // Split camelCase/PascalCase to space
  s = s.replace(/([a-z])([A-Z])/g, "$1 $2")

  // Replace multiple spaces with single space
  s = s.replace(/\s+/g, " ").trim()

  // Capitalize each word
  return s
    .split(" ")
    .map((word) =>
      word.length > 0
        ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        : ""
    )
    .join(" ")
}

export { titleCase }
