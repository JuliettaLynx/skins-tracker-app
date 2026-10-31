import { useCallback, useMemo } from 'react'
import useLocalStorage from './useLocalStorage.js'

export default function useWishlist(storageKey) {
  const [wishlist, setWishlist] = useLocalStorage(storageKey, [])

  const wishlistSet = useMemo(() => new Set(wishlist), [wishlist])

  const toggle = useCallback(
    (id) => {
      setWishlist((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      )
    },
    [setWishlist]
  )

  const has = useCallback((id) => wishlistSet.has(id), [wishlistSet])

  return { wishlist, toggle, has }
}