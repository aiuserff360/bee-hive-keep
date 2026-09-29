import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarClock, Check, CircleCheck, ClipboardList, Plus, TriangleAlert, Users } from 'lucide-react'
import TaskCalendar from '../components/TaskCalendar'
import { AddTaskModal } from '../components/TaskForm'
import { Avatar, Button, Card, Chip, PageHeader, Pills, Select, StatTile, Td, Th, cx } from '../components/ui'
import type { Priority, Task, Tone } from '../data/content'
import { NOW, dayMonth, fromIso } from '../data/hives'
import { TEAMS } from '../data/network'
import { useStore } from '../store'

type Scope = 'all' | 'week' | 'overdue' | 'High'

const PRIORITY_TONE: Record<Priority, Tone> = { High: 'crit', Medium: 'warn', Low: 'ok' }
const COLUMNS: Array<{ state: Task['state']; title: string; hint: string }> = [
  { state: 'Not Started', title: 'To Do', hint: 'Planned, not yet started' },
  { state: 'Pending', title: 'In Progress', hint: 'Assigned and under way' },
  { state: 'Done', title: 'Done', hint: 'Completed' },
]
const NEXT_STATE: Record<Task['state'], Task['state']> = { 'Not Started': 'Pending', Pending: 'Done', Done: 'Not Started' }
const NEXT_LABEL: Record<Task['state'], string> = { 'Not Started': 'Start', Pending: 'Mark done', Done: 'Reopen' }

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const TODAY = iso(NOW)
const WEEK_END = iso(new Date(NOW.getFullYear(), NOW.getMonth(), NOW.getDate() + 7))
const COMPLETED_DAYS = new Set(['2026-09-05', '2026-09-10', '2026-09-12', '2026-09-15', '2026-09-16', '2026-09-17', '2026-09-18', '2026-09-19', '2026-09-20'])

const isOverdue = (t: Task) => t.state !== 'Done' && t.due < TODAY

function TaskCard({ task, onMove }: { task: Task; onMove: () => void }) {
  const overdue = isOverdue(task)
  return (
    <li className={cx('rounded-lg border bg-card p-2.5', overdue ? 'border-crit/50' : 'border-line')}>
      <div className="flex items-start justify-between gap-2">
        <h4 className={cx('text-[13px] leading-snug font-semibold text-ink', task.state === 'Done' && 'text-muted line-through')}>{task.title}</h4>
        <Chip tone={PRIORITY_TONE[task.priority]}>{task.priority}</Chip>
      </div>
      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-ink-2">
        {task.hiveId && (
          <Link to={`/hives/${task.hiveId}/activity`} className="font-medium text-link hover:underline">
            Hive {task.hiveId}
          </Link>
        )}
        <span className={cx('flex items-center gap-1', overdue && 'font-semibold text-crit-text')}>
          <CalendarClock size={12} /> {overdue ? 'Overdue: ' : ''}
          {dayMonth(fromIso(task.due))}
        </span>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <Avatar name={task.assignee} size={22} />
        <span className="flex-1 truncate text-[11px] text-ink-2">{task.assignee}</span>
        <button onClick={onMove} className="rounded-md border border-line px-2 py-1 text-[11px] font-semibold text-ink hover:border-muted hover:bg-card-2">
          {NEXT_LABEL[task.state]}
        </button>
      </div>
    </li>
  )
}

export default function Tasks() {
  const { tasks, setTaskState, fieldOps, toggleFieldOp } = useStore()
  const [scope, setScope] = useState<Scope>('all')
  const [assignee, setAssignee] = useState('all')
  const [adding, setAdding] = useState(false)

  const people = [...new Set(tasks.map((t) => t.assignee))].sort()
  const open = tasks.filter((t) => t.state !== 'Done')
  const inScope = (t: Task) => (scope === 'all' ? true : scope === 'week' ? t.due >= TODAY && t.due <= WEEK_END : scope === 'overdue' ? isOverdue(t) : t.priority === 'High')
  const shown = tasks.filter((t) => inScope(t) && (assignee === 'all' || t.assignee === assignee))

  return (
    <div className="space-y-3 p-3.5">
      <PageHeader title="Tasks & Field Ops" subtitle="Plan, assign and follow field work across all locations">
        <Button onClick={() => setAdding(true)} className="px-4 py-2 text-[13px]">
          <Plus size={16} /> Add Task
        </Button>
      </PageHeader>

      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 2xl:grid-cols-5">
        <StatTile icon={<ClipboardList size={26} />} label="Open Tasks" value={open.length} footer={`${tasks.length} in total`} />
        <StatTile icon={<CalendarClock size={26} />} tone="info" label="Due in 7 Days" value={open.filter((t) => t.due >= TODAY && t.due <= WEEK_END).length} footer="23 – 30 Sep" />
        <StatTile icon={<TriangleAlert size={26} />} tone="crit" label="Overdue" value={open.filter(isOverdue).length} footer="past the due date" />
        <StatTile icon={<CircleCheck size={26} />} tone="ok" label="Completed" value={tasks.length - open.length} footer="this month" />
        <StatTile icon={<Users size={26} />} tone="plain" label="Field Teams Active" value={`${TEAMS.filter((t) => t.status === 'On site').length} / ${TEAMS.length}`} footer="on site today" />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Pills
          label="Filter tasks"
          value={scope}
          onChange={setScope}
          options={[
            { id: 'all', label: 'All Tasks', count: tasks.length },
            { id: 'week', label: 'Due in 7 Days' },
            { id: 'overdue', label: 'Overdue' },
            { id: 'High', label: 'High Priority' },
          ]}
        />
        <Select aria-label="Assigned to" value={assignee} onChange={(e) => setAssignee(e.target.value)}>
          <option value="all">All Assignees</option>
          {people.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </Select>
      </div>

      <div className="grid gap-3 2xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="grid items-start gap-3 md:grid-cols-3">
          {COLUMNS.map((col) => {
            const list = shown.filter((t) => t.state === col.state)
            return (
              <section key={col.state} className="rounded-xl border border-line bg-card-2 p-2.5">
                <header className="mb-2 flex items-baseline justify-between px-1">
                  <h3 className="text-sm font-semibold text-ink">
                    {col.title} <span className="font-normal text-muted">({list.length})</span>
                  </h3>
                  <span className="text-[11px] text-muted">{col.hint}</span>
                </header>
                {list.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-line px-3 py-6 text-center text-xs text-muted">No tasks here.</p>
                ) : (
                  <ul className="space-y-2">
                    {list.map((t) => (
                      <TaskCard key={t.id} task={t} onMove={() => setTaskState(t.id, NEXT_STATE[t.state])} />
                    ))}
                  </ul>
                )}
              </section>
            )
          })}
        </div>

        <div className="grid content-start gap-3 md:grid-cols-2 2xl:grid-cols-1">
          <TaskCalendar tasks={tasks} completedDays={COMPLETED_DAYS} />
          <Card title="Field Operations" info="Work planned for whole clusters or teams">
            <ul className="divide-y divide-line rounded-lg border border-line">
              {fieldOps.map((op) => (
                <li key={op.id}>
                  <label className="flex cursor-pointer items-center gap-3 px-3 py-2 text-xs hover:bg-card-2">
                    <input type="checkbox" checked={op.done} onChange={() => toggleFieldOp(op.id)} className="peer sr-only" />
                    <span className={cx('grid h-4 w-4 shrink-0 place-items-center rounded-full border peer-focus-visible:ring-2 peer-focus-visible:ring-honey', op.done ? 'border-ok bg-ok text-white' : 'border-muted')}>
                      {op.done && <Check size={11} strokeWidth={3} />}
                    </span>
                    <span className={cx('flex-1 text-ink', op.done && 'text-muted line-through')}>{op.title}</span>
                    <span className="text-[11px] whitespace-nowrap text-muted">{op.when}</span>
                  </label>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      <Card title="Field Teams Today">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-xs">
            <thead className="bg-card-2 text-ink-2">
              <tr>
                <Th>Team</Th>
                <Th>Team Lead</Th>
                <Th>Working At</Th>
                <Th>Open Tasks</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {TEAMS.map((team) => (
                <tr key={team.name} className="hover:bg-card-2">
                  <Td className="font-semibold">{team.name}</Td>
                  <Td>
                    <span className="flex items-center gap-2">
                      <Avatar name={team.lead} size={24} /> {team.lead}
                    </span>
                  </Td>
                  <Td className="text-ink-2">{team.today}</Td>
                  <Td className="tabular-nums">{team.open}</Td>
                  <Td>
                    <Chip tone={team.status === 'On site' ? 'ok' : team.status === 'Travelling' ? 'info' : 'warn'}>{team.status}</Chip>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {adding && <AddTaskModal onClose={() => setAdding(false)} />}
    </div>
  )
}
