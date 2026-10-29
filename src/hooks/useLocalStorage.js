import { useEffect, useState } from 'react'

// Persist a piece of state in localStorage under `key`.
export default function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = window.localStorage.getItem(key)
      return raw === null ? initialValue : JSON.parse(raw)
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Private mode or a full quota: the app keeps working in memory.
    }
  }, [key, value])

  return [value, setValue]
}
