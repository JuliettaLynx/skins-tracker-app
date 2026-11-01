import { useEffect, useRef, useState } from 'react'

export default function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = window.localStorage.getItem(key)
      return raw === null ? initialValue : JSON.parse(raw)
    } catch {
      return initialValue
    }
  })

  const first = useRef(true)
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    const t = setTimeout(() => {
      try {
        window.localStorage.setItem(key, JSON.stringify(value))
      } catch {
        // localStorage может быть переполнен или недоступен (приватный режим) —
        // состояние просто остаётся в памяти до следующей записи
      }
    }, 300)
    return () => clearTimeout(t)
  }, [key, value])

  return [value, setValue]
}
