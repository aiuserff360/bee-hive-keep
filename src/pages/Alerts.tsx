import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BellRing, CircleCheck, Info, OctagonAlert, Search, Timer, TriangleAlert } from 'lucide-react'
import { ComboChart, Donut, usePalette } from '../components/charts'
import { Button, Card, Chip, PageHeader, Pills, Select, StatTile, cx } from '../components/ui'
import type { Severity, Tone } from '../data/content'
import { LAST_7_DAYS, LOCATIONS } from '../data/hives'
import { NETWORK_ALERTS, agoText } from '../data/network'
import type { NetworkAlert } from '../data/network'
import { useStore } from '../store'
import type { AlertStatus } from '../store'

type Filter = 'open' | Severity | 'resolved' | 'all'

const SEVERITY_LABEL: Record<Severity, string> = { critical: 'Critical', warning: 'Warning', info: 'Info' }
const SEVERITY_COLOR: Record<Severity, string> = { critical: '#ef4444', warning: '#f5b91f', info: '#3b82f6' }
const STATUS_TONE: Record<AlertStatus, Tone> = { Open: 'crit', Acknowledged: 'warn', Resolved: 'ok' }
const PAGE = 12

function SeverityIcon({ severity, size = 22 }: { severity: Severity; size?: number }) {
  if (severity === 'info') return <Info size={size} className="shrink-0 text-info" />
  return <TriangleAlert size={size} className={cx('shrink-0', severity === 'critical' ? 'text-crit' : 'text-warn')} />
}

export default function Alerts() {
  const c = usePalette()
  const { alertStatus, setAlertStatus, notify } = useStore()
  const [filter, setFilter] = useState<Filter>('open')
  const [location, setLocation] = useState('all')
  const [query, setQuery] = useState('')
  const [shown, setShown] = useState(PAGE)

  const statusOf = (a: NetworkAlert): AlertStatus => alertStatus[a.id] ?? (a.resolved ? 'Resolved' : 'Open')
  const alerts = NETWORK_ALERTS.map((a) => ({ ...a, status: statusOf(a) }))
  const active = alerts.filter((a) => a.status !== 'Resolved')

  const q = query.trim().toLowerCase()
  const visible = alerts.filter((a) => {
    const byFilter = filter === 'all' ? true : filter === 'open' ? a.status !== 'Resolved' : filter === 'resolved' ? a.status === 'Resolved' : a.severity === filter && a.status !== 'Resolved'
    const byLocation = location === 'all' || a.locationId === location
    const byQuery = !q || a.hiveId.toLowerCase().includes(q) || a.type.toLowerCase().includes(q) || a.place.toLowerCase().includes(q)
    return byFilter && byLocation && byQuery
  })

  const reset = <T,>(set: (v: T) => void) => (v: T) => {
    set(v)
    setShown(PAGE)
  }

  const byType = Object.entries(
    active.reduce<Record<string, number>>((acc, a) => {
      const key = a.type.replace(' (Possible Swarming)', '')
      acc[key] = (acc[key] ?? 0) + 1
      return acc
    }, {}),
  ).sort((a, b) => b[1] - a[1])
  const typeColors = [c.red, c.honey, c.blue, c.purple, c.green, c.cyan, c.gray]

  const resolveAllInfo = () => {
    const infos = active.filter((a) => a.severity === 'info')
    infos.forEach((a) => setAlertStatus(a.id, 'Resolved'))
    notify(infos.length ? `${infos.length} info alerts marked as resolved` : 'No open info alerts')
  }

  return (
    <div className="space-y-3 p-3.5">
      <PageHeader title="Alerts" subtitle="Everything that needs attention, newest first">
        <Button variant="outline" onClick={resolveAllInfo}>
          <CircleCheck size={14} /> Resolve Info Alerts
        </Button>
      </PageHeader>

      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 2xl:grid-cols-5">
        <StatTile icon={<BellRing size={26} />} label="Open Alerts" value={active.length} footer={`${alerts.length} raised in 7 days`} />
        <StatTile icon={<OctagonAlert size={26} />} tone="crit" label="Critical" value={active.filter((a) => a.severity === 'critical').length} footer="act today" />
        <StatTile icon={<TriangleAlert size={26} />} tone="warn" label="Warnings" value={active.filter((a) => a.severity === 'warning').length} footer="act this week" />
        <StatTile icon={<CircleCheck size={26} />} tone="ok" label="Resolved" value={alerts.length - active.length} footer="in the last 7 days" />
        <StatTile icon={<Timer size={26} />} tone="info" label="Avg. Response Time" value="3.4 h" footer="target under 4 h" />
      </div>

      <div className="grid gap-3 2xl:grid-cols-[1.7fr_1fr]">
        <Card title="Alert List" bodyClassName="pt-3">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Pills
              label="Filter alerts"
              value={filter}
              onChange={reset(setFilter)}
              options={[
                { id: 'open', label: 'Open', count: active.length },
                { id: 'critical', label: 'Critical', count: active.filter((a) => a.severity === 'critical').length },
                { id: 'warning', label: 'Warning', count: active.filter((a) => a.severity === 'warning').length },
                { id: 'info', label: 'Info', count: active.filter((a) => a.severity === 'info').length },
                { id: 'resolved', label: 'Resolved', count: alerts.length - active.length },
                { id: 'all', label: 'All', count: alerts.length },
              ]}
            />
            <Select aria-label="Location" value={location} onChange={(e) => reset(setLocation)(e.target.value)}>
              <option value="all">All Locations</option>
              {LOCATIONS.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </Select>
            <div className="relative min-w-[170px] flex-1">
              <Search size={15} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted" />
              <input
                type="search"
                value={query}
                onChange={(e) => reset(setQuery)(e.target.value)}
                placeholder="Search by hive, alert or location..."
                aria-label="Search alerts"
                className="w-full rounded-lg border border-line bg-card py-2 pr-3 pl-9 text-xs text-ink placeholder:text-muted"
              />
            </div>
          </div>

          {visible.length === 0 ? (
            <p className="rounded-lg border border-dashed border-line p-6 text-center text-sm text-muted">No alerts match these filters.</p>
          ) : (
            <ul className="space-y-1.5">
              {visible.slice(0, shown).map((a) => (
                <li key={a.id} className={cx('flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border border-line px-3 py-2.5', a.status === 'Resolved' && 'opacity-70')}>
                  <SeverityIcon severity={a.severity} />
                  <div className="min-w-[200px] flex-1">
                    <div className="text-[13px] font-semibold text-ink">{a.type}</div>
                    <div className="text-xs text-ink-2">
                      <Link to={`/hives/${a.hiveId}`} className="font-medium text-link hover:underline">
                        Hive {a.hiveId}
                      </Link>{' '}
                      • {a.place} • {a.detail}
                    </div>
                  </div>
                  <span className="text-[11px] whitespace-nowrap text-muted">{agoText(a.minutesAgo)}</span>
                  <Chip tone={STATUS_TONE[a.status]}>{a.status}</Chip>
                  <span className="flex gap-1.5">
                    {a.status === 'Open' && (
                      <Button variant="outline" className="px-2.5 py-1.5" onClick={() => setAlertStatus(a.id, 'Acknowledged')}>
                        Acknowledge
                      </Button>
                    )}
                    {a.status !== 'Resolved' ? (
                      <Button variant="navy" className="px-2.5 py-1.5" onClick={() => setAlertStatus(a.id, 'Resolved')}>
                        Resolve
                      </Button>
                    ) : (
                      <Button variant="outline" className="px-2.5 py-1.5" onClick={() => setAlertStatus(a.id, 'Open')}>
                        Reopen
                      </Button>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-3 flex items-center justify-between text-xs text-ink-2">
            <span>
              Showing {Math.min(shown, visible.length)} of {visible.length} alerts
            </span>
            {shown < visible.length && (
              <button onClick={() => setShown((s) => s + PAGE)} className="font-semibold text-link hover:underline">
                Show {PAGE} more
              </button>
            )}
          </div>
        </Card>

        <div className="grid content-start gap-3 md:grid-cols-2 2xl:grid-cols-1">
          <Card title="Alerts Raised (Last 7 Days)">
            <ComboChart
              ariaLabel="Alerts raised per day, by severity"
              labels={LAST_7_DAYS}
              height={190}
              stacked
              y={{ min: 0, title: 'Alerts' }}
              series={[
                { label: 'Critical', data: [3, 2, 4, 3, 5, 4, 6], color: SEVERITY_COLOR.critical, type: 'bar' },
                { label: 'Warning', data: [4, 5, 3, 6, 4, 7, 5], color: SEVERITY_COLOR.warning, type: 'bar' },
                { label: 'Info', data: [1, 2, 1, 1, 2, 1, 2], color: SEVERITY_COLOR.info, type: 'bar' },
              ]}
            />
          </Card>
          <Card title="Open Alerts by Type">
            <div className="flex flex-wrap items-center gap-4">
              <Donut segments={byType.map(([label, value], i) => ({ label, value, color: typeColors[i % typeColors.length] }))} size={132} unit=" alerts" ariaLabel="Open alerts by type">
                <div>
                  <div className="text-2xl leading-none font-bold text-ink">{active.length}</div>
                  <div className="text-xs text-ink-2">Open</div>
                </div>
              </Donut>
              <ul className="min-w-[150px] flex-1 space-y-2 text-xs">
                {byType.map(([label, value], i) => (
                  <li key={label} className="flex items-center gap-2 text-ink">
                    <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: typeColors[i % typeColors.length] }} />
                    <span className="flex-1">{label}</span>
                    <b className="tabular-nums">{value}</b>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
          <Card title="Severity Guide" className="md:col-span-2 2xl:col-span-1">
            <ul className="space-y-2.5 text-xs text-ink-2">
              {(['critical', 'warning', 'info'] as Severity[]).map((s) => (
                <li key={s} className="flex items-start gap-2.5">
                  <SeverityIcon severity={s} size={18} />
                  <span>
                    <b className="text-ink">{SEVERITY_LABEL[s]}.</b>{' '}
                    {s === 'critical' ? 'The colony or sensor unit is at risk. Visit the hive today.' : s === 'warning' ? 'A reading is drifting out of range. Plan a visit this week.' : 'A routine reminder. No risk to the colony.'}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  )
}
