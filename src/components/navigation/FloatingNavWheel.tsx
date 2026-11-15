import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  Bell, BrainCircuit, BriefcaseBusiness, CircleAlert, CircleHelp, Compass, Home, LayoutDashboard,
  MessageCircle, PackageCheck, Search, UserRound, X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

const links = [
  { label: 'Home', to: '/', icon: Home, color: 'var(--logo-cyan)' },
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard, color: 'var(--amber)' },
  { label: 'Browse items', to: '/browse', icon: Search, color: 'var(--logo-blue)' },
  { label: 'Report lost', to: '/report/lost', icon: CircleAlert, color: 'var(--amber)' },
  { label: 'Report found', to: '/report/found', icon: PackageCheck, color: 'var(--logo-green)' },
  { label: 'AI matching', to: '/matching', icon: BrainCircuit, color: 'var(--logo-cyan)' },
  { label: 'My items', to: '/my-items', icon: BriefcaseBusiness, color: 'var(--logo-blue)' },
  { label: 'Messages', to: '/messages', icon: MessageCircle, color: 'var(--logo-green)' },
  { label: 'Notifications', to: '/notifications', icon: Bell, color: 'var(--amber)' },
  { label: 'My profile', to: '/profile', icon: UserRound, color: 'var(--logo-cyan)' },
  { label: 'Help center', to: '/help', icon: CircleHelp, color: 'var(--logo-blue)' },
]

export function FloatingNavWheel() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!open) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [open])

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.button
            aria-label="Close navigation"
            className="nav-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.2 }}
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>
      <div className={`nav-wheel ${open ? 'is-open' : ''}`} aria-label="Site navigation">
        <AnimatePresence>
          {open && links.map((item, index) => {
            const Icon = item.icon
            const compactPositions = [
              [-172, -398], [-78, -398], [-172, -328], [-78, -328], [-172, -258],
              [-78, -258], [-172, -188], [-78, -188], [-172, -118], [-78, -118],
              [-172, -48],
            ]
            const compact = window.innerWidth < 600
            const angle = (180 + index * 180 / (links.length - 1)) * Math.PI / 180
            const x = compact ? compactPositions[index][0] : -205 + Math.cos(angle) * 190
            const y = compact ? compactPositions[index][1] : -160 + Math.sin(angle) * 190
            return (
              <motion.div
                key={item.to}
                className="nav-wheel-item"
                style={{ '--nav-x': `${x}px`, '--nav-y': `${y}px`, '--nav-accent': item.color } as React.CSSProperties}
                initial={{ opacity: 0, scale: 0.55, x: 0, y: 0 }}
                animate={{ opacity: 1, scale: 1, x, y }}
                exit={{ opacity: 0, scale: 0.55, x: 0, y: 0 }}
                transition={{ type: reducedMotion ? 'tween' : 'spring', stiffness: 330, damping: 23, delay: reducedMotion ? 0 : index * 0.025 }}
              >
                <Link
                  to={item.to}
                  className={`nav-link ${location.pathname === item.to ? 'active' : ''}`}
                  aria-label={item.label}
                  aria-current={location.pathname === item.to ? 'page' : undefined}
                >
                  <span className="nav-icon"><Icon size={19} strokeWidth={1.8} /></span>
                  <span className="nav-label">{item.label}</span>
                </Link>
              </motion.div>
            )
          })}
        </AnimatePresence>
        <button
          className="nav-trigger"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? 'Close navigation' : 'Open navigation'}
          aria-expanded={open}
          aria-haspopup="menu"
          title={open ? 'Close navigation' : 'Open navigation'}
        >
          {open ? <X size={23} /> : <span className="bulb-mark"><Compass size={23} strokeWidth={1.7} /></span>}
        </button>
        {open && <span className="wheel-orbit" aria-hidden="true" />}
      </div>
    </>
  )
}
