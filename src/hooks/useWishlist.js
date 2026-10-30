import { useCallback, useMemo } from 'react'
import useLocalStorage from './useLocalStorage.js'

const KEY = 'skins-tracker:wishlist'

export function useWishlist() {
  const [wishlist, setWishlist] = useLocalStorage(KEY, [])

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