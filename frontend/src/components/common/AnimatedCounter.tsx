import { useEffect, useState } from 'react'
import { useReducedMotion } from 'framer-motion'

export type AnimatedCounterProps = {
  value: number
  duration?: number
  suffix?: string
  className?: string
}

export function AnimatedCounter({
  value,
  duration = 1000,
  suffix = '',
  className,
}: AnimatedCounterProps) {
  const prefersReducedMotion = useReducedMotion()
  const [display, setDisplay] = useState(prefersReducedMotion ? value : 0)

  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplay(value)
      return
    }

    const start = performance.now()
    let frame = 0

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration)
      const eased = 1 - (1 - progress) ** 3
      setDisplay(Math.round(value * eased))
      if (progress < 1) {
        frame = requestAnimationFrame(tick)
      }
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [duration, prefersReducedMotion, value])

  return (
    <span className={className}>
      {display}
      {suffix}
    </span>
  )
}
