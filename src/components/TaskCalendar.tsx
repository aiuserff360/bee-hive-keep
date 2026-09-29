import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { ActivityEntry, Task } from '../data/content'
import { NOW, dayMonthYear, fromIso, parseDay } from '../data/hives'
import { Card, Legend, cx } from './ui'

interface TaskCalendarProps {
  tasks: Task[]
  /** ISO dates on which work was completed. */
  completedDays?: Set<string>
  /** Logged activity, shown when its day is picked. */
  log?: ActivityEntry[]
}

const NO_DAYS = new Set<string>()
const NO_LOG: ActivityEntry[] = []
const fmtDate = (iso: string) => dayMonthYear(fromIso(iso), true)
const isoOf = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const TODAY = isoOf(NOW)

export default function TaskCalendar({ tasks, completedDays = NO_DAYS, log = NO_LOG }: TaskCalendarProps) {
  const [month, setMonth] = useState(() => new Date(NOW.getFullYear(), NOW.getMonth(), 1))
  const [picked, setPicked] = useState<string | null>(null)

  const weeks = useMemo(() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1)
    const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
    const cells: Array<Date | null> = [...Array(first.getDay()).fill(null), ...Array.from({ length: days }, (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1))]
    while (cells.length % 7) cells.push(null)
    return Array.from({ length: cells.length / 7 }, (_, i) => cells.slice(i * 7, i * 7 + 7))
  }, [month])

  const markOf = (iso: string): { color: string; label: string } | null => {
    const task = tasks.find((t) => t.due === iso)
    if (task && task.state !== 'Done') return iso < TODAY ? { color: '#ef4444', label: 'Overdue' } : { color: '#f5b91f', label: 'Upcoming' }
    if (completedDays.has(iso) || task) return { color: '#22c55e', label: 'Completed' }
    return null
  }
  const shift = (by: number) => setMonth((m) => new Date(m.getFullYear(), m.getMonth() + by, 1))
  const pickedTasks = picked ? tasks.filter((t) => t.due === picked) : []
  const pickedLog = picked ? log.filter((a) => isoOf(parseDay(a.date.split(',')[0])) === picked) : []

  return (
    <Card
      title="Task Calendar"
      action={
        <span className="flex items-center gap-1 text-xs font-medium text-ink">
          <button onClick={() => shift(-1)} aria-label="Previous month" className="rounded p-1 hover:bg-card-2">
            <ChevronLeft size={15} />
          </button>
          <span className="w-[112px] text-center whitespace-nowrap">{month.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</span>
          <button onClick={() => shift(1)} aria-label="Next month" className="rounded p-1 hover:bg-card-2">
            <ChevronRight size={15} />
          </button>
        </span>
      }
    >
      <table className="w-full table-fixed border-collapse text-center text-xs">
        <thead>
          <tr className="bg-card-2 text-ink-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <th key={d} className="py-1.5 font-medium">
                {d}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, i) => (
            <tr key={i}>
              {week.map((day, j) => {
                if (!day) return <td key={j} className="border border-line" />
                const iso = isoOf(day)
                const mark = markOf(iso)
                const today = iso === TODAY
                return (
                  <td key={j} className="border border-line p-0">
                    <button
                      onClick={() => setPicked(picked === iso ? null : iso)}
                      aria-label={`${day.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}${mark ? `, ${mark.label}` : ''}${today ? ', today' : ''}`}
                      aria-pressed={picked === iso}
                      className={cx('flex h-[31px] w-full flex-col items-center justify-center text-ink hover:bg-card-2', picked === iso && 'bg-info-soft')}
                    >
                      <span className={cx('grid h-5 min-w-5 place-items-center rounded-full px-1 tabular-nums', today && 'font-bold ring-2 ring-info')}>{day.getDate()}</span>
                      <span className="mt-px h-1.5 w-1.5 rounded-full" style={{ background: mark?.color ?? 'transparent' }} />
                    </button>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {picked && (
        <div className="mt-2 rounded-lg bg-card-2 px-3 py-2 text-xs text-ink-2">
          <b className="text-ink">{fmtDate(picked)}</b>
          {pickedTasks.length === 0 && pickedLog.length === 0 && <span className="block">Nothing scheduled.</span>}
          {pickedTasks.map((t) => (
            <span key={t.id} className="block">
              Task: {t.title} ({t.state})
            </span>
          ))}
          {pickedLog.map((a) => (
            <span key={a.date} className="block">
              Done: {a.title}
            </span>
          ))}
        </div>
      )}
      <Legend
        className="mt-3 gap-x-3 whitespace-nowrap"
        items={[
          { label: 'Completed', color: '#22c55e', kind: 'dot' },
          { label: 'Today', color: '#3b82f6', kind: 'dot' },
          { label: 'Upcoming', color: '#f5b91f', kind: 'dot' },
          { label: 'Overdue', color: '#ef4444', kind: 'dot' },
        ]}
      />
    </Card>
  )
}
