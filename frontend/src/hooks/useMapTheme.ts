import { useEffect, useState } from 'react'
import { useThemeStore } from '../providers/ThemeProvider'

export type MapTheme = 'dark' | 'light'

export function useMapTheme(): MapTheme {
  const theme = useThemeStore((state) => state.theme)
  const [resolvedTheme, setResolvedTheme] = useState<MapTheme>('dark')

  useEffect(() => {
    const isDark =
      theme === 'dark' ||
      (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    setResolvedTheme(isDark ? 'dark' : 'light')
    
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = (e: MediaQueryListEvent) => setResolvedTheme(e.matches ? 'dark' : 'light')
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [theme])

  return resolvedTheme
}
