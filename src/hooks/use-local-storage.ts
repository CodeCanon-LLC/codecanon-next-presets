import { useState, useEffect, useCallback } from "react"

function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, React.Dispatch<React.SetStateAction<T>>, () => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      if (item) return JSON.parse(item) as T
      return initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        setStoredValue((prev) => {
          const next = value instanceof Function ? value(prev) : value
          window.localStorage.setItem(key, JSON.stringify(next))
          return next
        })
      } catch (error) {
        console.error(`useLocalStorage: failed to set "${key}"`, error)
      }
    },
    [key]
  )

  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key)
      setStoredValue(initialValue)
    } catch (error) {
      console.error(`useLocalStorage: failed to remove "${key}"`, error)
    }
  }, [key]) // eslint-disable-line react-hooks/exhaustive-deps

  // Sync across tabs
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key !== key) return
      try {
        setStoredValue(e.newValue ? JSON.parse(e.newValue) : initialValue)
      } catch {
        // ignore parse errors
      }
    }
    window.addEventListener("storage", handler)
    return () => window.removeEventListener("storage", handler)
  }, [key]) // eslint-disable-line react-hooks/exhaustive-deps

  return [storedValue, setValue, removeValue]
}

export { useLocalStorage }
