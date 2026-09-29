import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Bell,
  BrainCircuit,
  ChevronDown,
  ClipboardCheck,
  CloudSun,
  Cpu,
  FileText,
  House,
  Info,
  Leaf,
  MapPin,
  Menu,
  Search,
  Settings,
  TriangleAlert,
  Users,
  X,
} from 'lucide-react'
import { ALERTS } from '../data/content'
import { HIVES, LOCATIONS, NOW, img, statusOf, weekdayDate } from '../data/hives'
import { ThemeProvider, useStore } from '../store'
import { HiveIcon, JarIcon, Logo } from './icons'
import { StatusDot, Toast, cx } from './ui'

const NAV: Array<{ to: string; label: string; icon: ReactNode; badge?: number; end?: boolean }> = [
  { to: '/', label: 'Dashboard', icon: <House size={20} />, end: true },
  { to: '/hives', label: 'Hives', icon: <HiveIcon size={20} /> },
  { to: '/map', label: 'Map', icon: <MapPin size={20} /> },
  { to: '/health-sensors', label: 'Health & Sensors', icon: <Cpu size={20} /> },
  { to: '/ai-insights', label: 'AI Insights', icon: <BrainCircuit size={20} /> },
  { to: '/alerts', label: 'Alerts', icon: <Bell size={20} />, badge: 3 },
  { to: '/honey-production', label: 'Honey Production', icon: <JarIcon size={20} /> },
  { to: '/tasks', label: 'Tasks & Field Ops', icon: <ClipboardCheck size={20} /> },
  { to: '/people', label: 'People & Communities', icon: <Users size={20} /> },
  { to: '/reports', label: 'Reports', icon: <FileText size={20} /> },
  { to: '/sustainability', label: 'Sustainability', icon: <Leaf size={20} className="text-ok" /> },
  { to: '/settings', label: 'Settings', icon: <Settings size={20} /> },
]

const dateLabel = weekdayDate(NOW)
const timeLabel = NOW.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

/** Closes a popover when the user clicks elsewhere or presses Escape. */
function useDismiss(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && close()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, close])
  return ref
}

function GlobalSearch() {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const ref = useDismiss(open, () => setOpen(false))

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return { hives: [], locations: [] }
    return {
      hives: HIVES.filter((h) => h.id.toLowerCase().includes(q) || h.place.toLowerCase().includes(q)).slice(0, 6),
      locations: LOCATIONS.filter((l) => l.name.toLowerCase().includes(q)).slice(0, 3),
    }
  }, [query])

  const go = (path: string) => {
    setOpen(false)
    setQuery('')
    navigate(path)
  }
  const empty = results.hives.length === 0 && results.locations.length === 0

  return (
    <div ref={ref} className="relative hidden w-[250px] shrink md:block">
      <Search size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
      <input
        type="search"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        placeholder="Search hives, locations, alerts..."
        aria-label="Search hives and locations"
        className="w-full rounded-lg border border-shell-line bg-shell-2 py-2 pr-3 pl-9 text-xs text-white placeholder:text-slate-400"
      />
      {open && query.trim() && (
        <div className="absolute top-full right-0 left-0 z-50 mt-1 overflow-hidden rounded-lg border border-shell-line bg-shell-2 py-1 text-xs text-white shadow-xl">
          {empty && <div className="px-3 py-2 text-slate-400">No hives or locations match “{query}”.</div>}
          {results.locations.map((l) => (
            <button key={l.id} onClick={() => go(`/hives?location=${l.id}`)} className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-white/10">
              <MapPin size={14} className="text-honey" />
              {l.name}
              <span className="ml-auto text-slate-400">{l.hives} hives</span>
            </button>
          ))}
          {results.hives.map((h) => (
            <button key={h.id} onClick={() => go(`/hives/${h.id}`)} className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-white/10">
              <StatusDot status={statusOf(h)} size={8} />
              Hive {h.id}
              <span className="ml-auto text-slate-400">{h.place}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function Notifications() {
  const [open, setOpen] = useState(false)
  const ref = useDismiss(open, () => setOpen(false))
  const latest = ALERTS.slice(0, 3)
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((v) => !v)} aria-label="Notifications, 3 new" aria-expanded={open} className="relative rounded-lg p-2 text-white hover:bg-white/10">
        <Bell size={22} />
        <span className="absolute top-0.5 right-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-crit px-1 text-[10px] font-bold text-white">3</span>
      </button>
      {open && (
        <div className="absolute top-full right-0 z-50 mt-1 w-72 rounded-lg border border-shell-line bg-shell-2 p-1 text-xs text-white shadow-xl">
          {latest.map((a) => (
            <Link key={a.id} to={`/hives/${a.hiveId}`} onClick={() => setOpen(false)} className="flex items-start gap-2 rounded-md px-3 py-2 hover:bg-white/10">
              {a.severity === 'info' ? <Info size={16} className="mt-0.5 text-info" /> : <TriangleAlert size={16} className={cx('mt-0.5', a.severity === 'critical' ? 'text-crit' : 'text-warn')} />}
              <span>
                <span className="block font-semibold">{a.title}</span>
                <span className="text-slate-400">
                  Hive {a.hiveId} • {a.place} • {a.ago}
                </span>
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function TopBar({ onMenu }: { onMenu: () => void }) {
  return (
    <header className="flex h-[68px] shrink-0 items-center gap-3 bg-shell px-3 text-white sm:px-4">
      <button onClick={onMenu} aria-label="Open menu" className="rounded-lg p-2 hover:bg-white/10 lg:hidden">
        <Menu size={22} />
      </button>
      <Link to="/" className="flex shrink-0 items-center gap-2.5">
        <Logo size={46} />
        <span className="leading-none">
          <span className="block text-[22px] font-extrabold tracking-[0.12em] sm:text-[26px]">
            <span className="text-honey">BEE HIVE</span> KEEP
          </span>
          <span className="mt-1 hidden text-[11px] font-semibold tracking-[0.24em] text-slate-200 sm:block">CONTROL COMMAND CENTER</span>
        </span>
      </Link>
      <div className="mx-2 hidden h-10 w-px bg-shell-line xl:block" />
      <p className="hidden text-[15px] tracking-wide text-slate-100 xl:block">Smart Hives. Healthier Bees. A Brighter Tomorrow.</p>

      <div className="ml-auto flex min-w-0 items-center gap-2 sm:gap-4">
        <GlobalSearch />
        <Notifications />
        <div className="hidden items-center gap-2.5 sm:flex">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-slate-600 text-xs font-bold">KK</span>
          <span className="hidden leading-tight whitespace-nowrap lg:block">
            <span className="block text-xs font-semibold">Karan Kamal</span>
            <span className="text-[11px] text-slate-300">Admin</span>
          </span>
          <ChevronDown size={14} className="hidden text-slate-300 lg:block" />
        </div>
        <div className="hidden border-l border-shell-line pl-4 text-right leading-tight whitespace-nowrap md:block">
          <div className="text-[11px] text-slate-300">{dateLabel}</div>
          <div className="text-sm font-bold">{timeLabel}</div>
        </div>
        <div className="hidden items-center gap-2 leading-tight whitespace-nowrap 2xl:flex">
          <CloudSun size={26} className="text-honey" />
          <span>
            <span className="block text-[11px] text-slate-300">Bengaluru</span>
            <span className="text-sm font-bold">28°C</span>
            <span className="ml-1.5 text-[11px] text-slate-300">Partly Cloudy</span>
          </span>
        </div>
      </div>
    </header>
  )
}

function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} />}
      <aside
        className={cx(
          'scroll-thin fixed inset-y-0 left-0 z-50 flex w-[220px] shrink-0 flex-col overflow-y-auto bg-shell transition-transform lg:static lg:z-auto lg:w-[196px] lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-between px-4 pt-4 lg:hidden">
          <span className="text-xs font-semibold tracking-widest text-slate-300">MENU</span>
          <button onClick={onClose} aria-label="Close menu" className="rounded-md p-1 text-white hover:bg-white/10">
            <X size={18} />
          </button>
        </div>
        <nav aria-label="Main" className="flex flex-col gap-1 p-1.5 pt-3">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                cx(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-[12.5px] font-medium whitespace-nowrap transition-colors',
                  isActive ? 'bg-honey text-shell' : 'text-slate-100 hover:bg-white/10',
                )
              }
            >
              {item.icon}
              <span className="flex-1">{item.label}</span>
              {item.badge && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-crit px-1 text-[11px] font-bold text-white">{item.badge}</span>}
            </NavLink>
          ))}
        </nav>
        <div
          className="relative mt-auto hidden min-h-[230px] bg-cover bg-center lg:block"
          style={{ backgroundImage: `linear-gradient(to bottom, #0b1a2c 0%, rgb(11 26 44 / 0.15) 38%, rgb(11 26 44 / 0.55) 70%, #0b1a2c 100%), url(${img('bee-flower.jpg')})` }}
        >
          <p className="absolute right-4 bottom-5 left-4 flex items-end gap-2 text-[17px] leading-snug font-medium text-white">
            <span>
              Bees Make a<br />
              Better Tomorrow
            </span>
            <Leaf size={22} className="mb-0.5 text-ok" fill="currentColor" />
          </p>
        </div>
      </aside>
    </>
  )
}

function Footer() {
  return (
    <footer className="flex h-9 shrink-0 items-center gap-3 bg-shell px-4 text-[11px] text-slate-300">
      <Logo size={20} />
      <span className="text-xs font-bold tracking-widest text-white">
        <span className="text-honey">BEE HIVE</span> KEEP
      </span>
      <span className="hidden sm:inline">Technology for People, Bees and the Planet.</span>
      <span className="ml-auto hidden items-center gap-3 md:flex">
        <Leaf size={14} className="text-ok" fill="currentColor" />
        Healthy Bees <span className="text-shell-line">|</span> Thriving Communities <span className="text-shell-line">|</span> A More Sustainable Future
      </span>
    </footer>
  )
}

export default function Shell() {
  const { pathname } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const { toast } = useStore()
  const mainRef = useRef<HTMLElement>(null)
  // The Dashboard uses the dark command-centre look; every other page is light.
  const theme = pathname === '/' ? 'dark' : 'light'

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 })
  }, [pathname])

  return (
    <ThemeProvider value={theme}>
      <div className="flex h-full flex-col bg-shell">
        <TopBar onMenu={() => setMenuOpen(true)} />
        <div className="flex min-h-0 flex-1">
          <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
          <main ref={mainRef} className={cx('scroll-thin min-w-0 flex-1 overflow-y-auto bg-page text-ink lg:rounded-tl-2xl', theme === 'dark' ? 'theme-dark' : 'theme-light')}>
            <Outlet />
          </main>
        </div>
        <Footer />
        <Toast message={toast} />
      </div>
    </ThemeProvider>
  )
}

