import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type FontSize = 'small' | 'medium' | 'large'
export type ButtonSize = 'compact' | 'normal' | 'large'
export type Language = 'en' | 'hi'

type SettingsState = {
  fontSize: FontSize
  buttonSize: ButtonSize
  language: Language
  setFontSize: (size: FontSize) => void
  setButtonSize: (size: ButtonSize) => void
  setLanguage: (lang: Language) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      fontSize: 'medium',
      buttonSize: 'normal',
      language: 'en',
      setFontSize: (size) => set({ fontSize: size }),
      setButtonSize: (size) => set({ buttonSize: size }),
      setLanguage: (lang) => set({ language: lang }),
    }),
    { name: 'rw-settings-preference' }
  )
)
