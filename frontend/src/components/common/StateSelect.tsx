import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import { INDIAN_STATES, getCitiesForState } from '../../data/indianStates'

type StateSelectProps = {
  id?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
}

export function StateSelect({ id, value, onChange, placeholder = 'Select state', required }: StateSelectProps) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full appearance-none rounded-xl border border-[var(--rw-border)] bg-[var(--rw-surface)] px-3 py-2.5 pr-9 text-sm text-[var(--rw-text-primary)] transition-colors focus:border-[var(--rw-ring)] focus:outline-none focus:ring-2 focus:ring-[var(--rw-ring)]/30"
      >
        <option value="">{placeholder}</option>
        {INDIAN_STATES.map((state) => (
          <option key={state} value={state}>
            {state}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[var(--rw-text-tertiary)]" />
    </div>
  )
}

type CityInputProps = {
  id?: string
  value: string
  onChange: (value: string) => void
  selectedState?: string
  placeholder?: string
}

export function CityInput({ id, value, onChange, selectedState, placeholder = 'Enter or select city' }: CityInputProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState(value)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const cities = selectedState ? getCitiesForState(selectedState) : []
  const filtered = query.trim()
    ? cities.filter((c) => c.toLowerCase().includes(query.toLowerCase()))
    : cities

  useEffect(() => {
    setQuery(value)
  }, [value])

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative flex items-center">
        <Search className="pointer-events-none absolute left-3 size-4 text-[var(--rw-text-tertiary)]" />
        <input
          id={id}
          type="text"
          value={query}
          placeholder={placeholder}
          autoComplete="off"
          onChange={(e) => {
            setQuery(e.target.value)
            onChange(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          className="w-full rounded-xl border border-[var(--rw-border)] bg-[var(--rw-surface)] py-2.5 pl-9 pr-3 text-sm text-[var(--rw-text-primary)] transition-colors focus:border-[var(--rw-ring)] focus:outline-none focus:ring-2 focus:ring-[var(--rw-ring)]/30"
        />
      </div>
      {open && filtered.length > 0 && (
        <ul className="absolute z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-xl border border-[var(--rw-border)] bg-[var(--rw-surface)] shadow-lg">
          {filtered.map((city) => (
            <li key={city}>
              <button
                type="button"
                onClick={() => {
                  onChange(city)
                  setQuery(city)
                  setOpen(false)
                }}
                className="w-full px-3 py-2 text-left text-sm text-[var(--rw-text-primary)] hover:bg-[var(--rw-surface-muted)]"
              >
                {city}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
