import { useEffect, useState } from 'react'

export type MapTheme = 'dark' | 'light'

function readMapTheme(): MapTheme {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

export function useMapTheme(): MapTheme {
  const [theme, setTheme] = useState<MapTheme>(readMapTheme)

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setTheme(readMapTheme())
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    return () => observer.disconnect()
  }, [])

  return theme
}
