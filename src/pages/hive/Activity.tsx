import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, ChevronLeft, ChevronRight, CircleCheck, FilePenLine, Info, Lightbulb, MapPin, Plus } from 'lucide-react'
import { ActivityIcon, InsightList } from '../../components/blocks'
import { ComboChart, usePalette } from '../../components/charts'
import { CombIcon, HiveIcon } from '../../components/icons'
import { AddTaskModal } from '../../components/TaskForm'
import { Bubble, Button, Card, Chip, Field, Legend, Modal, Select, ViewAll, cx, inputClass } from '../../components/ui'
import { ACTIVITY_INSIGHTS, ACTIVITY_LOG } from '../../data/content'
import type { Priority, TaskState, Tone } from '../../data/content'
import { LAST_7_DAYS, NOW, dayMonthYear, fromIso, img, parseDay, seedOf, series } from '../../data/hives'
import { useHiveTasks, useStore } from '../../store'
import type { TabProps } from './HiveDetail'

const PRIORITY_TONE: Record<Priority, Tone> = { High: 'crit', Medium: 'warn', Low: 'ok' }
const STATE_TONE: Record<TaskState, string> = {
  Pending: 'bg-info-soft text-link',
  'Not Started': 'bg-card-2 text-ink-2',
  Done: 'bg-ok-soft text-ok-text',
}

const fmtDate = (iso: string) => dayMonthYear(fromIso(iso), true)
const isoOf = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const TODAY = isoOf(NOW)
/** Days on which work was logged for this hive (see the activity log). */
const COMPLETED_DAYS = new Set(['2026-09-05', '2026-09-10', '2026-09-12', '2026-09-15', '2026-09-17', '2026-09-18', '2026-09-20'])

/* ---------- Left column ---------- */

function Timeline({ hive }: TabProps) {
  return (
    <Card title="Recent Activity" action={<ViewAll to={`/hives/${hive.id}/history`} />}>
      <ol className="relative">
        <span className="absolute top-4 bottom-8 left-4 w-px bg-line" aria-hidden="true" />
        {ACTIVITY_LOG.map((a) => (
          <li key={a.date} className="relative flex gap-3.5 pb-4 last:pb-0">
            <Bubble tone={a.tone} size={33}>
              <ActivityIcon name={a.icon} size={16} />
            </Bubble>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap justify-between gap-x-3 text-[11px] text-ink-2">
                <span className="tabular-nums">{a.date}</span>
                <span className="text-right">
                  {a.by}
                  {a.team && <span className="block">{a.team}</span>}
                </span>
              </div>
              <div className="text-[13px] font-semibold text-ink">{a.title}</div>
              <div className="text-xs text-ink-2">{a.detail}</div>
            </div>
            {a.image ? <img src={img(a.image)} alt="" loading="lazy" className="h-[50px] w-[50px] shrink-0 rounded-md object-cover" /> : <span className="w-[50px] shrink-0" />}
          </li>
        ))}
      </ol>
    </Card>
  )
}

function FieldNotes({ hive }: TabProps) {
  return (
    <Card title="Field Notes" action={<ViewAll to={`/hives/${hive.id}/notes`} />}>
      <div className="flex gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-card-2 text-xs font-bold text-ink">RK</span>
        <div className="min-w-0">
          <div className="text-xs text-ink-2">
            <b className="text-ink">Ravi Kumar</b> &nbsp; 20 Sep 2026, 09:10
          </div>
          <p className="mt-1 text-xs leading-relaxed text-ink-2">Colony strong and healthy. Queen seen. Brood pattern uniform. Added one super. Good nectar flow in the area.</p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {['note-1.jpg', 'note-2.jpg', 'note-3.jpg'].map((n) => (
              <img key={n} src={img(n)} alt="Photo from the inspection" loading="lazy" className="h-[66px] w-full rounded-md object-cover" />
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}

/* ---------- Middle column ---------- */

function DailyPattern({ hive }: TabProps) {
  const c = usePalette()
  const seed = seedOf(hive.id)
  const base = hive.activity === 'High' ? 68 : hive.activity === 'Medium' ? 50 : 30
  return (
    <Card
      title="Daily Activity Pattern"
      action={
        <Select aria-label="Time range" defaultValue="7d">
          <option value="7d">Last 7 Days</option>
        </Select>
      }
    >
      <ComboChart
        ariaLabel="Foraging trips, hive activity and temperature for the last seven days"
        labels={LAST_7_DAYS}
        height={158}
        y={{ min: 0, max: 100, step: 20, title: 'Bee Activity (Index)' }}
        y1={{ min: 20, max: 40, step: 5, title: 'Temperature (°C)' }}
        series={[
          { label: 'Foraging Trips', data: series(seed + 71, 7, base, 9).map(Math.round), color: '#f6cf6b', type: 'bar' },
          { label: 'Hive Activity', data: series(seed + 72, 7, base + 10, 8, 8).map(Math.round), color: c.green, points: true },
          { label: 'Temperature (°C)', data: series(seed + 73, 7, 31, 1.4), color: c.blue, axis: 'y1', points: true, unit: ' °C' },
        ]}
      />
    </Card>
  )
}

function UpcomingTasks({ hive }: TabProps) {
  const { toggleTask } = useStore()
  const tasks = useHiveTasks(hive.id)
  const [filter, setFilter] = useState<'all' | 'open' | 'High'>('all')
  const [adding, setAdding] = useState(false)
  const shown = tasks.filter((t) => (filter === 'all' ? true : filter === 'open' ? t.state !== 'Done' : t.priority === 'High'))
  return (
    <Card
      title="Upcoming Tasks"
      action={
        <>
          <Select aria-label="Filter tasks" value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)}>
            <option value="all">All Tasks</option>
            <option value="open">Open Tasks</option>
            <option value="High">High Priority</option>
          </Select>
          <Button onClick={() => setAdding(true)} className="px-3 py-1.5">
            <Plus size={14} /> Add Task
          </Button>
        </>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-left text-xs">
          <thead className="bg-card-2 text-ink-2">
            <tr>
              {['Due Date', 'Task', 'Priority', 'Assigned To', 'Status'].map((h) => (
                <th key={h} className="px-2 py-2 font-medium whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line text-ink">
            {shown.map((t) => (
              <tr key={t.id}>
                <td className="px-2 py-1.5 whitespace-nowrap tabular-nums">{fmtDate(t.due)}</td>
                <td className={cx('px-2 py-1.5', t.state === 'Done' && 'text-muted line-through')}>{t.title}</td>
                <td className="px-2 py-1.5">
                  <Chip tone={PRIORITY_TONE[t.priority]}>◆ {t.priority}</Chip>
                </td>
                <td className="px-2 py-1.5 whitespace-nowrap">{t.assignee}</td>
                <td className="px-2 py-1.5">
                  <button
                    onClick={() => toggleTask(t.id)}
                    title={t.state === 'Done' ? 'Reopen task' : 'Mark as done'}
                    className={cx('rounded-md px-2 py-0.5 text-[11px] font-medium whitespace-nowrap hover:ring-1 hover:ring-muted', STATE_TONE[t.state])}
                  >
                    {t.state}
                  </button>
                </td>
              </tr>
            ))}
            {shown.length === 0 && (
              <tr>
                <td colSpan={5} className="px-2 py-4 text-center text-muted">
                  No tasks match this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {adding && <AddTaskModal hiveId={hive.id} onClose={() => setAdding(false)} />}
    </Card>
  )
}

/* ---------- Right column ---------- */

function TodayStatus({ hive, detail }: TabProps) {
  const ok = <CircleCheck size={22} className="text-ok" fill="currentColor" stroke="var(--card)" />
  const healthy = hive.health === 'healthy'
  const rows: Array<{ icon: ReactNode; label: string; value: string }> = [
    { icon: ok, label: 'Hive activity', value: hive.online ? hive.activity : 'Offline' },
    { icon: healthy ? ok : <Info size={22} className="text-warn" />, label: healthy ? 'No alerts' : 'Open alerts', value: healthy ? 'All normal' : 'Needs review' },
    { icon: ok, label: 'Tasks due today', value: 'None' },
    { icon: <Info size={22} className="text-info" />, label: 'Next inspection', value: `${detail.nextInspection} (4 days)` },
    { icon: <HiveIcon size={20} className="text-ink" />, label: 'Supers', value: '1 (60% filled)' },
    { icon: <CombIcon size={20} className="text-honey" />, label: 'Forage availability', value: 'Good (wildflowers)' },
  ]
  return (
    <Card title="Today's Status">
      <ul className="divide-y divide-line">
        {rows.map((r) => (
          <li key={r.label} className="grid grid-cols-[26px_minmax(0,1fr)_minmax(0,1.05fr)] items-center gap-2 py-1.5 text-xs text-ink">
            <span className="grid place-items-center">{r.icon}</span>
            <span>{r.label}</span>
            <span>{r.value}</span>
          </li>
        ))}
      </ul>
    </Card>
  )
}

function TaskCalendar({ hive }: TabProps) {
  const tasks = useHiveTasks(hive.id)
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
    if (COMPLETED_DAYS.has(iso) || task) return { color: '#22c55e', label: 'Completed' }
    return null
  }
  const shift = (by: number) => setMonth((m) => new Date(m.getFullYear(), m.getMonth() + by, 1))
  const pickedTasks = picked ? tasks.filter((t) => t.due === picked) : []
  const pickedLog = picked ? ACTIVITY_LOG.filter((a) => isoOf(parseDay(a.date.split(',')[0])) === picked) : []

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

function QuickActions({ hive }: TabProps) {
  const navigate = useNavigate()
  const { notify } = useStore()
  const [dialog, setDialog] = useState<'log' | 'task' | 'photo' | null>(null)
  const tile = 'flex flex-col items-center justify-center gap-2 rounded-lg border border-line py-3.5 text-[13px] font-medium text-ink hover:border-muted hover:bg-card-2'

  const close = () => setDialog(null)
  const demoSubmit = (message: string) => (e: React.FormEvent) => {
    e.preventDefault()
    notify(message)
    close()
  }

  return (
    <Card title="Quick Actions">
      <div className="grid grid-cols-2 gap-2.5">
        <button className={tile} onClick={() => setDialog('log')}>
          <FilePenLine size={22} /> Log Activity
        </button>
        <button className={tile} onClick={() => setDialog('task')}>
          <Plus size={22} /> Add Task
        </button>
        <button className={tile} onClick={() => setDialog('photo')}>
          <Camera size={22} /> Upload Photos
        </button>
        <button className={tile} onClick={() => navigate('/map')}>
          <MapPin size={22} fill="currentColor" /> View on Map
        </button>
      </div>
      {dialog === 'task' && <AddTaskModal hiveId={hive.id} onClose={close} />}
      {dialog === 'log' && (
        <Modal title={`Log activity for Hive ${hive.id}`} onClose={close}>
          <form onSubmit={demoSubmit('Demo only: activity entries are not saved in this prototype')}>
            <Field label="Activity">
              <select className={inputClass}>
                <option>Hive inspection</option>
                <option>Super added</option>
                <option>Varroa check</option>
                <option>Honey harvest</option>
                <option>Feeding</option>
              </select>
            </Field>
            <Field label="Notes">
              <textarea rows={3} placeholder="What did you observe?" className={inputClass} />
            </Field>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={close}>
                Cancel
              </Button>
              <Button type="submit">Save Entry</Button>
            </div>
          </form>
        </Modal>
      )}
      {dialog === 'photo' && (
        <Modal title={`Upload photos for Hive ${hive.id}`} onClose={close}>
          <form onSubmit={demoSubmit('Demo only: photos are not uploaded in this prototype')}>
            <Field label="Photos">
              <input type="file" accept="image/*" multiple className={inputClass} />
            </Field>
            <p className="text-xs text-muted">Files stay on your device. This prototype has no storage.</p>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={close}>
                Cancel
              </Button>
              <Button type="submit">Upload</Button>
            </div>
          </form>
        </Modal>
      )}
    </Card>
  )
}

export default function Activity(props: TabProps) {
  const { hive } = props
  return (
    <div className="grid items-start gap-3 lg:grid-cols-2 2xl:grid-cols-[1.05fr_1.2fr_0.8fr]">
      <div className="space-y-3">
        <Timeline {...props} />
        <FieldNotes {...props} />
      </div>
      <div className="space-y-3">
        <DailyPattern {...props} />
        <UpcomingTasks {...props} />
        <Card title="AI Insights & Recommendations" icon={<Lightbulb size={18} className="text-honey-dark" />} action={<ViewAll to={`/hives/${hive.id}/ai-insights`} />}>
          <InsightList items={ACTIVITY_INSIGHTS} />
        </Card>
      </div>
      <div className="grid gap-3 md:grid-cols-2 lg:col-span-2 lg:grid-cols-3 2xl:col-span-1 2xl:grid-cols-1">
        <TodayStatus {...props} />
        <TaskCalendar {...props} />
        <QuickActions {...props} />
      </div>
    </div>
  )
}
