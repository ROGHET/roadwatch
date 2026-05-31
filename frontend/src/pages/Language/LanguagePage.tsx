import { motion, useReducedMotion } from 'framer-motion'
import { Check, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { StitchSectionHeader } from '../../components/stitch'
import { useI18n } from '../../lib/i18n'
import { fadeInUp } from '../../lib/motion'
import { useSettingsStore, type Language } from '../../stores/settingsStore'

const languages: { id: Language; label: string; native: string }[] = [
  { id: 'en', label: 'English', native: 'English' },
  { id: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { id: 'mr', label: 'Marathi', native: 'मराठी' },
  { id: 'ta', label: 'Tamil', native: 'தமிழ்' },
]

export default function LanguagePage() {
  const prefersReducedMotion = useReducedMotion()
  const language = useSettingsStore((state) => state.language)
  const setLanguage = useSettingsStore((state) => state.setLanguage)
  const { t } = useI18n()
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return languages
    return languages.filter(
      (lang) =>
        lang.label.toLowerCase().includes(needle) ||
        lang.native.toLowerCase().includes(needle) ||
        lang.id.includes(needle),
    )
  }, [query])

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-[var(--st-stack-lg)] pb-28 pt-2 md:pb-8">
      <motion.section
        className="flex flex-col gap-[var(--st-stack-md)]"
        variants={prefersReducedMotion ? undefined : fadeInUp}
        initial={prefersReducedMotion ? false : 'hidden'}
        animate={prefersReducedMotion ? undefined : 'visible'}
      >
        <StitchSectionHeader
          eyebrow={t('preferences')}
          title={t('language')}
          description={t('languageDescription')}
        />

        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--rw-text-tertiary)]" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search languages"
            className="w-full rounded-xl border border-[var(--rw-border)] bg-[var(--rw-surface)] py-2.5 pl-10 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--rw-ring)]"
          />
        </label>

        <div className="rw-glass-panel rw-glass-edge flex flex-col overflow-hidden rounded-2xl shadow-[var(--st-shadow-glass)]">
          {filtered.map((lang) => (
            <button
              key={lang.id}
              type="button"
              onClick={() => setLanguage(lang.id)}
              className="flex items-center justify-between border-b border-[var(--st-outline-white)] p-4 text-left transition-colors last:border-b-0 hover:bg-[var(--rw-surface-muted)]"
            >
              <div className="flex flex-col">
                <span className="font-medium text-[var(--st-on-surface)]">{lang.native}</span>
                <span className="text-sm text-[var(--st-on-surface-variant)]">{lang.label}</span>
              </div>
              {language === lang.id ? (
                <Check className="size-5 text-[var(--st-primary)]" aria-hidden="true" />
              ) : null}
            </button>
          ))}
          {filtered.length === 0 ? (
            <p className="p-4 text-sm text-[var(--rw-text-secondary)]">No matching languages.</p>
          ) : null}
        </div>
      </motion.section>
    </div>
  )
}
