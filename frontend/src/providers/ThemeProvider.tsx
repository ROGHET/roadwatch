import { useEffect } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  darkThemeCssVariables,
  lightStitchCssVariables,
  lightThemeCssVariables,
  stitchCssVariables,
} from '../styles/theme'
import { useSettingsStore } from '../stores/settingsStore'

export type ThemePreference = 'dark' | 'light' | 'system'

type ThemeState = {
  theme: ThemePreference
  setTheme: (theme: ThemePreference) => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'system',
      setTheme: (theme) => set({ theme }),
    }),
    { name: 'rw-theme-preference' }
  )
)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useThemeStore((state) => state.theme)
  const fontSize = useSettingsStore((state) => state.fontSize)
  const language = useSettingsStore((state) => state.language)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const applyTheme = () => {
      const isDark =
        theme === 'dark' || (theme === 'system' && mediaQuery.matches)

      const root = document.documentElement
      if (isDark) {
        root.classList.remove('light')
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
        root.classList.add('light')
      }

      const vars = isDark ? darkThemeCssVariables : lightThemeCssVariables
      
      const stitchVars = isDark ? stitchCssVariables : lightStitchCssVariables

      Object.entries({ ...vars, ...stitchVars }).forEach(([name, value]) => {
        root.style.setProperty(name, value)
      })
    }

    applyTheme()

    if (theme === 'system') {
      mediaQuery.addEventListener('change', applyTheme)
      return () => mediaQuery.removeEventListener('change', applyTheme)
    }
  }, [theme])

  useEffect(() => {
    const root = document.documentElement
    root.dataset.fontSize = fontSize
    root.lang = language
    document.title = language === 'hi' ? 'क्रैशज़ीरो' : 'CrashZero'
  }, [fontSize, language])

  return <>{children}</>
}
