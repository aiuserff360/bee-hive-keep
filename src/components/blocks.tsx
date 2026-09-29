import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BarChart3,
  Check,
  ChevronRight,
  Droplet,
  Flower2,
  Info,
  Leaf,
  Maximize2,
  Package,
  ScanSearch,
  ShieldCheck,
  Thermometer,
  TrendingUp,
  TriangleAlert,
  X,
} from 'lucide-react'
import type { ActivityEntry, Insight, Recommendation, Tone } from '../data/content'
import { useStore } from '../store'
import { BeeIcon } from './icons'
import { Bubble, cx } from './ui'

/* ---------- Icons by name ---------- */

export function InsightIcon({ name, size = 16 }: { name: Insight['icon']; size?: number }) {
  switch (name) {
    case 'leaf':
      return <Leaf size={size} />
    case 'alert':
      return <TriangleAlert size={size} />
    case 'info':
      return <Info size={size} />
    case 'shield':
      return <ShieldCheck size={size} />
    case 'trend':
      return <TrendingUp size={size} />
    case 'flower':
      return <Flower2 size={size} />
    case 'chart':
      return <BarChart3 size={size} />
  }
}

export function ActivityIcon({ name, size = 16 }: { name: ActivityEntry['icon'] | 'alert'; size?: number }) {
  switch (name) {
    case 'check':
      return <Check size={size} />
    case 'drop':
      return <Droplet size={size} />
    case 'temp':
      return <Thermometer size={size} />
    case 'box':
      return <Package size={size} />
    case 'scan':
      return <ScanSearch size={size} />
    case 'bee':
      return <BeeIcon size={size} />
    case 'alert':
      return <TriangleAlert size={size} />
  }
}

const TONE_ICON: Record<Tone, Insight['icon']> = { ok: 'leaf', info: 'info', warn: 'alert', crit: 'alert', purple: 'shield' }

/* ---------- Lists ---------- */

export function InsightList({ items }: { items: Insight[] }) {
  return (
    <ul className="divide-y divide-line">
      {items.map((item) => (
        <li key={item.title} className="flex items-start gap-3 py-2 first:pt-0 last:pb-0">
          <Bubble tone={item.tone} size={30}>
            <InsightIcon name={item.icon} size={15} />
          </Bubble>
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-semibold text-ink">{item.title}</div>
            <div className="text-xs text-muted">{item.body}</div>
          </div>
          {item.ago && <span className="shrink-0 text-[11px] whitespace-nowrap text-muted">{item.ago}</span>}
        </li>
      ))}
    </ul>
  )
}

export function RecommendationList({ items }: { items: Recommendation[] }) {
  const { notify } = useStore()
  return (
    <ul className="divide-y divide-line">
      {items.map((item) => (
        <li key={item.title}>
          <button onClick={() => notify(`Noted: ${item.title}`)} className="flex w-full items-center gap-3 py-2 text-left hover:bg-card-2">
            <Bubble tone={item.tone} size={28}>
              {item.tone === 'ok' ? <Check size={15} /> : <InsightIcon name={TONE_ICON[item.tone]} size={14} />}
            </Bubble>
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] font-semibold text-ink">{item.title}</span>
              <span className="text-xs text-muted">{item.body}</span>
            </span>
            <ChevronRight size={16} className="shrink-0 text-muted" />
          </button>
        </li>
      ))}
    </ul>
  )
}

/* ---------- Camera image with LIVE badge and full-screen view ---------- */

interface LiveImageProps {
  src: string
  alt: string
  caption?: string
  sub?: string
  className?: string
}

export function LiveImage({ src, alt, caption, sub, className }: LiveImageProps) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <div className={cx('relative overflow-hidden rounded-lg bg-shell', className)}>
        <img src={src} alt={alt} className="h-full w-full object-cover" />
        <span className="absolute top-3 left-3 flex items-center gap-1.5 rounded-md bg-ok px-2 py-1 text-[11px] font-bold tracking-wide text-white">
          <span className="live-dot h-2 w-2 rounded-full bg-white" />
          LIVE
        </span>
        {(caption || sub) && (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-3 pt-8 pb-2.5 text-white">
            {caption && <div className="text-xs font-semibold">{caption}</div>}
            {sub && <div className="text-[11px] text-slate-200">{sub}</div>}
          </div>
        )}
        <button onClick={() => setOpen(true)} aria-label="View full screen" className="absolute right-2.5 bottom-2.5 grid h-8 w-8 place-items-center rounded-md bg-black/55 text-white hover:bg-black/75">
          <Maximize2 size={15} />
        </button>
      </div>
      {open && (
        <div className="fixed inset-0 z-[1000] grid place-items-center bg-black/85 p-4" onClick={() => setOpen(false)}>
          <img src={src} alt={alt} className="max-h-full max-w-full rounded-lg object-contain" />
          <button aria-label="Close" className="absolute top-4 right-4 rounded-full bg-white/15 p-2 text-white hover:bg-white/30">
            <X size={20} />
          </button>
        </div>
      )}
    </>
  )
}

/* ---------- Placeholder for screens without a design yet ---------- */

export function ComingSoon({ title, note, embedded }: { title: string; note?: string; embedded?: boolean }) {
  return (
    <div className={cx('grid place-items-center text-center', embedded ? 'rounded-xl border border-dashed border-line bg-card px-6 py-16' : 'min-h-full p-8')}>
      <div className="max-w-sm">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-honey/20 text-honey-dark">
          <BeeIcon size={30} />
        </div>
        <h1 className="text-xl font-bold text-ink">{title}</h1>
        <p className="mt-2 text-sm text-muted">{note ?? 'This screen has not been designed yet. It will be added in a later version of the prototype.'}</p>
        {!embedded && (
          <Link to="/" className="mt-5 inline-flex rounded-lg bg-honey px-4 py-2 text-xs font-semibold text-shell hover:bg-honey-dark">
            Back to Dashboard
          </Link>
        )}
      </div>
    </div>
  )
}
