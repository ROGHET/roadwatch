import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type FontSize = 'small' | 'medium' | 'large'
export type Language = 'en' | 'hi'

type SettingsState = {
  fontSize: FontSize
  language: Language
  setFontSize: (size: FontSize) => void
  setLanguage: (lang: Language) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      fontSize: 'medium',
      language: 'en',
      setFontSize: (size) => set({ fontSize: size }),
      setLanguage: (lang) => set({ language: lang }),
    }),
    { name: 'rw-settings-preference' }
  )
)
