import { motion, useReducedMotion } from 'framer-motion'
import { Check } from 'lucide-react'
import { StitchSectionHeader } from '../../components/stitch'
import { fadeInUp } from '../../lib/motion'
import { useSettingsStore, type FontSize, type Language } from '../../stores/settingsStore'
import { useThemeStore, type ThemePreference } from '../../providers/ThemeProvider'
import { useI18n, type TranslationKey } from '../../lib/i18n'

type Option<T> = { value: T; label: string }

function getFontOptions(t: (key: TranslationKey) => string): Option<FontSize>[] {
  return [
    { value: 'small', label: t('smallFont') },
    { value: 'medium', label: t('mediumFont') },
    { value: 'large', label: t('largeFont') },
  ]
}

function getLanguageOptions(t: (key: TranslationKey) => string): Option<Language>[] {
  return [
    { value: 'en', label: t('langEnglish') },
    { value: 'hi', label: t('langHindi') },
    { value: 'mr', label: t('langMarathi') },
    { value: 'ta', label: t('langTamil') },
  ]
}

function getThemeOptions(t: (key: TranslationKey) => string): Option<ThemePreference>[] {
  return [
    { value: 'light', label: t('lightTheme') },
    { value: 'dark', label: t('darkTheme') },
    { value: 'system', label: t('systemTheme') },
  ]
}

function SettingsGroup<T extends string>({
  title,
  options,
  currentValue,
  onChange,
}: {
  title: string
  options: Option<T>[]
  currentValue: T
  onChange: (val: T) => void
}) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--st-on-surface-variant)]">
        {title}
      </h3>
      <div className="rw-glass-panel rw-glass-edge flex flex-col overflow-hidden rounded-2xl shadow-[var(--st-shadow-glass)]">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className="flex items-center justify-between border-b border-[var(--st-outline-white)] p-4 text-left transition-colors last:border-b-0 hover:bg-[var(--rw-surface-muted)]"
          >
            <span className="font-medium text-[var(--st-on-surface)]">{opt.label}</span>
            {currentValue === opt.value ? (
              <Check className="size-5 text-[var(--st-primary)]" aria-hidden="true" />
            ) : null}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const prefersReducedMotion = useReducedMotion()
  const fontSize = useSettingsStore((state) => state.fontSize)
  const setFontSize = useSettingsStore((state) => state.setFontSize)
  const language = useSettingsStore((state) => state.language)
  const setLanguage = useSettingsStore((state) => state.setLanguage)
  const theme = useThemeStore((state) => state.theme)
  const setTheme = useThemeStore((state) => state.setTheme)
  const i18n = useI18n()

  const fontOptions = getFontOptions(i18n.t)
  const themeOptions = getThemeOptions(i18n.t)
  const languageOptions = getLanguageOptions(i18n.t)

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-[var(--st-stack-lg)] pb-28 pt-2 md:pb-8">
      <motion.section
        className="flex flex-col gap-[var(--st-stack-md)]"
        variants={prefersReducedMotion ? undefined : fadeInUp}
        initial={prefersReducedMotion ? false : 'hidden'}
        animate={prefersReducedMotion ? undefined : 'visible'}
      >
        <StitchSectionHeader
          eyebrow={i18n.t('preferences')}
          title={i18n.t('settings')}
          description={i18n.t('settingsDescription')}
        />

        <div className="mt-4 flex flex-col gap-8">
          <SettingsGroup
            title={i18n.t('theme')}
            options={themeOptions}
            currentValue={theme}
            onChange={setTheme}
          />

          <SettingsGroup
            title={i18n.t('accessibility')}
            options={fontOptions}
            currentValue={fontSize}
            onChange={setFontSize}
          />

          <SettingsGroup
            title={i18n.t('language')}
            options={languageOptions}
            currentValue={language}
            onChange={setLanguage}
          />
        </div>
      </motion.section>
    </div>
  )
}
