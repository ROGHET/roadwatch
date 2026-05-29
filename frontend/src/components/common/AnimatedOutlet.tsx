import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Outlet, useLocation } from 'react-router-dom'
import { pageTransition } from '../../lib/motion'

export function AnimatedOutlet() {
  const location = useLocation()
  const prefersReducedMotion = useReducedMotion()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        variants={prefersReducedMotion ? undefined : pageTransition}
        initial={prefersReducedMotion ? false : 'initial'}
        animate={prefersReducedMotion ? undefined : 'animate'}
        exit={prefersReducedMotion ? undefined : 'exit'}
        className="min-w-0 flex flex-col flex-1 h-full w-full relative"
      >
        <Outlet />
      </motion.div>
    </AnimatePresence>
  )
}
