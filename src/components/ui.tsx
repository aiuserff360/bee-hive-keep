import { useEffect } from 'react'
import type { ReactNode, SelectHTMLAttributes } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, Info, X } from 'lucide-react'
import { STATUS_COLOR, STATUS_LABEL } from '../data/hives'
import type { Status } from '../data/hives'
import type { Tone } from '../data/content'

export const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ')

/* ---------- Card ---------- */

interface CardProps {
  title?: ReactNode
  info?: string
  icon?: ReactNode
  action?: ReactNode
  className?: string
  bodyClassName?: string
  children: ReactNode
}

export function Card({ title, info, icon, action, className, bodyClassName, children }: CardProps) {
  return (
    <section className={cx('flex min-w-0 flex-col rounded-xl border border-line bg-card', className)}>
      {(title || action) && (
        <header className="flex flex-wrap items-center justify-between gap-2 px-4 pt-3.5">
          <h2 className="flex items-center gap-2 text-[15px] font-semibold text-ink">
            {icon}
            {title}
            {info && (
              <span title={info} className="text-muted">
                <Info size={14} aria-label={info} />
              </span>
            )}
          </h2>
          {action && <div className="flex items-center gap-2">{action}</div>}
        </header>
      )}
      <div className={cx('min-w-0 flex-1 p-4', title || action ? 'pt-3' : '', bodyClassName)}>{children}</div>
    </section>
  )
}

export function ViewAll({ to, label = 'View All' }: { to: string; label?: string }) {
  return (
    <Link to={to} className="text-xs font-semibold text-link hover:underline">
      {label}
    </Link>
  )
}

/* ---------- Stat tile ---------- */

interface StatTileProps {
  icon: ReactNode
  tone?: Tone | 'honey' | 'plain'
  label: string
  sub?: string
  value: ReactNode
  delta?: string
  deltaNote?: string
  footer?: ReactNode
}

const TILE_TONE: Record<NonNullable<StatTileProps['tone']>, string> = {
  honey: 'bg-honey/20 text-honey-dark',
  ok: 'bg-ok/20 text-ok',
  warn: 'bg-warn/20 text-warn-text',
  crit: 'bg-crit/20 text-crit',
  info: 'bg-info/20 text-info',
  purple: 'bg-purple-500/20 text-purple-500',
  plain: 'bg-card-2 text-ink',
}

export function StatTile({ icon, tone = 'honey', label, sub, value, delta, deltaNote, footer }: StatTileProps) {
  return (
    <div className="flex min-w-0 items-center gap-2.5 rounded-xl border border-line bg-card px-3 py-2.5">
      <div className={cx('grid h-11 w-11 shrink-0 place-items-center rounded-lg', TILE_TONE[tone])}>{icon}</div>
      <div className="min-w-0">
        <div className="text-xs leading-tight text-ink-2">
          {label}
          {sub && <span className="block text-[11px] text-muted">{sub}</span>}
        </div>
        <div className="mt-0.5 text-[22px] leading-tight font-bold whitespace-nowrap text-ink">{value}</div>
        {delta && (
          <div className="text-xs leading-tight font-semibold text-ok-text">
            ▲ {delta}
            {deltaNote && <span className="block text-[11px] font-normal text-muted">{deltaNote}</span>}
          </div>
        )}
        {footer && <div className="text-xs text-muted">{footer}</div>}
      </div>
    </div>
  )
}

/* ---------- Status ---------- */

export function StatusDot({ status, size = 10 }: { status: Status; size?: number }) {
  return <span className="inline-block shrink-0 rounded-full" style={{ width: size, height: size, background: STATUS_COLOR[status] }} />
}

export function StatusLabel({ status }: { status: Status }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-ink-2">
      <StatusDot status={status} />
      {STATUS_LABEL[status]}
    </span>
  )
}

const BADGE: Record<Status, string> = {
  healthy: 'bg-ok text-white',
  attention: 'bg-warn text-shell',
  critical: 'bg-crit text-white',
  offline: 'bg-off text-white',
}

export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  return (
    <span className={cx('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold', BADGE[status], className)}>
      {STATUS_LABEL[status]}
    </span>
  )
}

const CHIP: Record<Tone, string> = {
  ok: 'bg-ok-soft text-ok-text',
  warn: 'bg-warn-soft text-warn-text',
  crit: 'bg-crit-soft text-crit-text',
  info: 'bg-info-soft text-link',
  purple: 'bg-purple-100 text-purple-700',
}

export function Chip({ tone = 'ok', children }: { tone?: Tone; children: ReactNode }) {
  return <span className={cx('inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10.5px] font-semibold whitespace-nowrap', CHIP[tone])}>{children}</span>
}

export function Tag({ children }: { children: ReactNode }) {
  return <span className="rounded-md bg-card-2 px-2 py-1 text-[11px] whitespace-nowrap text-ink-2">{children}</span>
}

const BUBBLE: Record<Tone, string> = {
  ok: 'bg-ok-soft text-ok-text',
  warn: 'bg-warn-soft text-warn-text',
  crit: 'bg-crit-soft text-crit-text',
  info: 'bg-info-soft text-link',
  purple: 'bg-purple-100 text-purple-700',
}

/** Round tinted icon holder used in lists. */
export function Bubble({ tone, children, size = 32 }: { tone: Tone; children: ReactNode; size?: number }) {
  return (
    <span className={cx('grid shrink-0 place-items-center rounded-full', BUBBLE[tone])} style={{ width: size, height: size }}>
      {children}
    </span>
  )
}

/* ---------- Controls ---------- */

export function Select({ className, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <span className={cx('relative inline-flex', className)}>
      <select
        {...rest}
        className="w-full appearance-none rounded-lg border border-line bg-card py-1.5 pr-8 pl-3 text-xs font-medium text-ink hover:border-muted"
      >
        {children}
      </select>
      <ChevronDown size={14} className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-muted" />
    </span>
  )
}

interface ButtonProps {
  variant?: 'honey' | 'navy' | 'outline'
  onClick?: () => void
  children: ReactNode
  className?: string
  type?: 'button' | 'submit'
}

const BUTTON: Record<NonNullable<ButtonProps['variant']>, string> = {
  honey: 'bg-honey text-shell hover:bg-honey-dark',
  navy: 'bg-tab-active text-tab-active-ink hover:opacity-90',
  outline: 'border border-line bg-card text-ink hover:border-muted',
}

export function Button({ variant = 'honey', onClick, children, className, type = 'button' }: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={cx('inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors', BUTTON[variant], className)}
    >
      {children}
    </button>
  )
}

export function LinkButton({ to, variant = 'outline', children, className }: { to: string; variant?: ButtonProps['variant']; children: ReactNode; className?: string }) {
  return (
    <Link
      to={to}
      className={cx('inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors', BUTTON[variant ?? 'outline'], className)}
    >
      {children}
    </Link>
  )
}

/* ---------- Legend ---------- */

export interface LegendItem {
  label: string
  color: string
  kind?: 'line' | 'bar' | 'dot' | 'dashed'
}

export function Legend({ items, className }: { items: LegendItem[]; className?: string }) {
  return (
    <ul className={cx('flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-xs text-ink-2', className)}>
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-1.5">
          {item.kind === 'dot' ? (
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} />
          ) : item.kind === 'bar' ? (
            <span className="h-2.5 w-4 rounded-sm" style={{ background: item.color }} />
          ) : item.kind === 'dashed' ? (
            <span className="w-5 border-t-2 border-dashed" style={{ borderColor: item.color }} />
          ) : (
            <span className="h-[3px] w-5 rounded-full" style={{ background: item.color }} />
          )}
          {item.label}
        </li>
      ))}
    </ul>
  )
}

/* ---------- Meter ---------- */

export function Meter({ value, color, className }: { value: number; color: string; className?: string }) {
  return (
    <div className={cx('h-2 overflow-hidden rounded-full bg-card-2', className)} role="img" aria-label={`${value}%`}>
      <div className="h-full rounded-full" style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: color }} />
    </div>
  )
}

/* ---------- Modal + toast ---------- */

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="theme-light fixed inset-0 z-[1000] grid place-items-center bg-shell/70 p-4" onMouseDown={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-md rounded-xl bg-card p-5 text-ink shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="rounded-md p-1 text-muted hover:bg-card-2">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="mb-3 block text-xs font-medium text-ink-2">
      {label}
      <div className="mt-1">{children}</div>
    </label>
  )
}

export const inputClass = 'w-full rounded-lg border border-line bg-card px-3 py-2 text-sm text-ink placeholder:text-muted'

export function Toast({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <div role="status" className="fixed bottom-14 left-1/2 z-[1100] -translate-x-1/2 rounded-lg bg-shell px-4 py-2.5 text-sm font-medium text-white shadow-xl ring-1 ring-honey/60">
      {message}
    </div>
  )
}

/* ---------- Page building blocks ---------- */

export function PageHeader({ title, subtitle, children }: { title: string; subtitle: string; children?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <h1 className="text-[28px] leading-none font-bold text-ink">{title}</h1>
      <p className="mr-auto text-sm text-ink-2">{subtitle}</p>
      {children}
    </div>
  )
}

export function Pills<T extends string>({ options, value, onChange, label }: { options: Array<{ id: T; label: string; count?: number }>; value: T; onChange: (id: T) => void; label: string }) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          aria-pressed={value === o.id}
          className={cx('rounded-lg px-3.5 py-2 text-xs font-medium', value === o.id ? 'bg-tab-active text-tab-active-ink' : 'bg-card text-ink-2 ring-1 ring-line hover:ring-muted')}
        >
          {o.label}
          {o.count !== undefined && ` (${o.count})`}
        </button>
      ))}
    </div>
  )
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (value: boolean) => void; label: string }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cx('relative h-6 w-11 shrink-0 rounded-full transition-colors', checked ? 'bg-ok' : 'bg-off')}
    >
      <span className={cx('absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform', checked && 'translate-x-5')} />
    </button>
  )
}

export function Avatar({ name, tone = 'plain', size = 36 }: { name: string; tone?: 'plain' | 'honey'; size?: number }) {
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
  return (
    <span className={cx('grid shrink-0 place-items-center rounded-full font-bold', tone === 'honey' ? 'bg-honey/25 text-honey-dark' : 'bg-card-2 text-ink')} style={{ width: size, height: size, fontSize: size * 0.34 }}>
      {initials}
    </span>
  )
}

/** Ranked horizontal bars: one row per item, value at the end. */
export function BarList({ items, color, unit = '', max }: { items: Array<{ label: string; value: number; note?: string; color?: string }>; color: string; unit?: string; max?: number }) {
  const top = max ?? Math.max(...items.map((i) => i.value), 1)
  return (
    <ul className="space-y-2.5">
      {items.map((item) => (
        <li key={item.label} className="grid grid-cols-[minmax(0,118px)_minmax(0,1fr)_auto] items-center gap-2.5 text-xs" title={`${item.label}: ${item.value}${unit}`}>
          <span className="truncate text-ink">{item.label}</span>
          <span className="h-3 overflow-hidden rounded-r-[4px] bg-card-2">
            <span className="block h-full rounded-r-[4px]" style={{ width: `${Math.max(2, (item.value / top) * 100)}%`, background: item.color ?? color }} />
          </span>
          <span className="min-w-[52px] text-right font-semibold text-ink tabular-nums">
            {item.value.toLocaleString()}
            {unit}
            {item.note && <span className="ml-1 font-normal text-muted">{item.note}</span>}
          </span>
        </li>
      ))}
    </ul>
  )
}

/** Plain data table with the prototype's standard look. */
export function Th({ children, className }: { children?: ReactNode; className?: string }) {
  return <th className={cx('px-3 py-2.5 text-left font-medium whitespace-nowrap', className)}>{children}</th>
}

export function Td({ children, className }: { children?: ReactNode; className?: string }) {
  return <td className={cx('px-3 py-2.5 text-ink', className)}>{children}</td>
}
