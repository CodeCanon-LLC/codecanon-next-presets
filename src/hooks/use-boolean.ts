import { useState, useCallback } from "react"

type UseBooleanReturn = [
  value: boolean,
  toggle: (next?: boolean) => void,
  setTrue: () => void,
  setFalse: () => void,
]

function useBoolean(initialValue = false): UseBooleanReturn {
  const [value, setValue] = useState(initialValue)

  const setTrue = useCallback(() => setValue(true), [])
  const setFalse = useCallback(() => setValue(false), [])
  const toggle = useCallback(
    (next?: boolean) => setValue((v) => next ?? !v),
    []
  )

  return [value, toggle, setTrue, setFalse]
}

export { useBoolean }
