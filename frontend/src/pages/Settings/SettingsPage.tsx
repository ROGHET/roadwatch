import { motion, useReducedMotion } from 'framer-motion'
import { Check } from 'lucide-react'
import { StitchSectionHeader } from '../../components/stitch'
import { fadeInUp } from '../../lib/motion'
import { useSettingsStore, type FontSize, type ButtonSize } from '../../stores/settingsStore'
import { useThemeStore, type ThemePreference } from '../../providers/ThemeProvider'
import { useI18n } from '../../lib/i18n'

type Option<T> = { value: T; label: string }

function getFontOptions(t: (key: any) => string): Option<FontSize>[] {
  return [
    { value: 'small', label: t('smallFont') },
    { value: 'medium', label: t('mediumFont') },
    { value: 'large', label: t('largeFont') },
  ]
}

function getButtonOptions(t: (key: any) => string): Option<ButtonSize>[] {
  return [
    { value: 'compact', label: t('compactButtons') },
    { value: 'normal', label: t('normalButtons') },
    { value: 'large', label: t('largeButtons') },
  ]
}

function getThemeOptions(t: (key: any) => string): Option<ThemePreference>[] {
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
      <h3 className="text-sm font-semibold text-[var(--st-on-surface-variant)] uppercase tracking-wider">{title}</h3>
      <div className="rw-glass-panel rw-glass-edge rounded-2xl overflow-hidden shadow-[var(--st-shadow-glass)] flex flex-col">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className="flex items-center justify-between border-b border-[var(--st-outline-white)] p-4 text-left transition-colors last:border-b-0 hover:bg-[var(--rw-surface-muted)]"
          >
            <span className="text-[var(--st-on-surface)] font-medium">{opt.label}</span>
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
  
  const buttonSize = useSettingsStore((state) => state.buttonSize)
  const setButtonSize = useSettingsStore((state) => state.setButtonSize)
  
  const theme = useThemeStore((state) => state.theme)
  const setTheme = useThemeStore((state) => state.setTheme)
  const { t } = useI18n()

  return (
    <div className="flex flex-col gap-[var(--st-stack-lg)] pb-28 pt-2 md:pb-8 max-w-2xl mx-auto">
      <motion.section
        className="flex flex-col gap-[var(--st-stack-md)]"
        variants={prefersReducedMotion ? undefined : fadeInUp}
        initial={prefersReducedMotion ? false : 'hidden'}
        animate={prefersReducedMotion ? undefined : 'visible'}
      >
        <StitchSectionHeader
          eyebrow={t('preferences')}
          title={t('settings')}
          description={t('settingsDescription')}
        />
        
        <div className="flex flex-col gap-8 mt-4">
          <SettingsGroup
            title={t('theme')}
            options={getThemeOptions(t)}
            currentValue={theme}
            onChange={setTheme}
          />

          <SettingsGroup
            title={t('accessibility')}
            options={getFontOptions(t)}
            currentValue={fontSize}
            onChange={setFontSize}
          />

          <SettingsGroup
            title={t('interface')}
            options={getButtonOptions(t)}
            currentValue={buttonSize}
            onChange={setButtonSize}
          />
        </div>
      </motion.section>
    </div>
  )
}
