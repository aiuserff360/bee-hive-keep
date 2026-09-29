import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { BatteryFull, ChevronLeft, ChevronRight, Droplet, EllipsisVertical, Heart, LayoutGrid, MapPin, OctagonAlert, Plus, Search, Table2, Thermometer, TriangleAlert, Weight, Wifi, WifiOff } from 'lucide-react'
import { ActivityIcon, LiveImage } from '../components/blocks'
import { ComboChart, LevelBars, usePalette } from '../components/charts'
import { BeeIcon, HiveIcon, JarIcon } from '../components/icons'
import { AddHiveModal } from '../components/TaskForm'
import { Bubble, Button, Card, Chip, LinkButton, Select, StatTile, StatusBadge, StatusLabel, ViewAll, cx } from '../components/ui'
import { HIVES_RECENT_ACTIVITY } from '../data/content'
import { HIVES, LAST_7_DAYS, LOCATIONS, NETWORK, RANGE_LABEL, dayMonth, fromIso, img, monthName, pct, rangeLabels, seedOf, series, statusOf } from '../data/hives'
import type { Hive, Range, Status } from '../data/hives'
import { useHiveTasks } from '../store'

type Filter = 'all' | Status
type Sort = 'default' | 'health' | 'id' | 'weight'
type PanelTab = 'Overview' | 'Live Data' | 'History' | 'Tasks' | 'Notes'

const PAGE_SIZE = 8
const HEALTH_RANK: Record<Status, number> = { critical: 0, attention: 1, offline: 2, healthy: 3 }
const FEATURED_FOR_CHARTS = HIVES.slice(0, 8)

const matchesFilter = (hive: Hive, filter: Filter) =>
  filter === 'all' ? true : filter === 'offline' ? !hive.online : hive.health === filter

/* ---------- Hive card ---------- */

function Metric({ icon, children, tone }: { icon: ReactNode; children: ReactNode; tone?: string }) {
  return (
    <span className="flex items-center gap-2 text-[13px] text-ink">
      <span className={tone ?? 'text-ink-2'}>{icon}</span>
      {children}
    </span>
  )
}

function HiveCard({ hive, selected, onSelect }: { hive: Hive; selected: boolean; onSelect: () => void }) {
  const status = statusOf(hive)
  const hot = hive.online && hive.temp >= 34
  return (
    <article
      className={cx(
        'relative rounded-xl border bg-card p-3 transition-shadow hover:shadow-md',
        selected ? 'border-ok ring-1 ring-ok' : 'border-line',
      )}
    >
      <button onClick={onSelect} aria-pressed={selected} aria-label={`Select hive ${hive.id}`} className="absolute inset-0 z-10 rounded-xl" />
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold text-ink">Hive {hive.id}</h3>
          <StatusLabel status={status} />
        </div>
        <Link to={`/hives/${hive.id}`} aria-label={`Open hive ${hive.id}`} title="Open hive details" className="relative z-20 -mr-1 rounded-md p-1 text-ink-2 hover:bg-card-2">
          <EllipsisVertical size={16} />
        </Link>
      </div>
      <div className="relative mt-2 overflow-hidden rounded-md">
        <img src={hive.image} alt="" loading="lazy" className={cx('h-[84px] w-full object-cover', !hive.online && 'grayscale')} />
        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 rounded bg-black/55 px-1.5 text-sm font-bold text-white">{hive.number}</span>
      </div>
      <div className="mt-2.5 grid grid-cols-2 gap-y-1.5">
        <Metric icon={<Thermometer size={15} />} tone={hot ? 'text-crit' : 'text-ink-2'}>
          {hive.online ? `${hive.temp.toFixed(1)}°C` : '—'}
        </Metric>
        <Metric icon={<Droplet size={15} fill="currentColor" />}>{hive.online ? `${hive.humidity}%` : '—'}</Metric>
        <Metric icon={<Weight size={15} />}>{hive.online ? `${hive.weight.toFixed(1)} kg` : '—'}</Metric>
        <Metric icon={hive.online ? <LevelBars level={hive.activity} /> : <LevelBars level="Low" />}>{hive.online ? hive.activity : '—'}</Metric>
      </div>
      <div className="mt-2.5 flex items-center gap-2 text-xs text-ink-2">
        <MapPin size={14} fill="currentColor" className="text-ink" />
        {hive.place}
      </div>
    </article>
  )
}

/* ---------- Selected hive side panel ---------- */

function HivePanel({ hive }: { hive: Hive }) {
  const [tab, setTab] = useState<PanelTab>('Overview')
  const tasks = useHiveTasks(hive.id)
  const status = statusOf(hive)
  const tabs: PanelTab[] = ['Overview', 'Live Data', 'History', 'Tasks', 'Notes']
  const hiveTasks = tasks.filter((t) => t.state !== 'Done')
  const dash = '—'

  return (
    <Card className="h-full" bodyClassName="flex flex-col">
      <div className="flex gap-3.5">
        <img src={hive.id === 'BGL-042' ? img('apiary.jpg') : hive.image} alt={`Hive ${hive.id}`} className="h-[104px] w-[132px] shrink-0 rounded-lg object-cover" />
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-bold text-ink">Hive {hive.id}</h2>
          <StatusBadge status={status} className="mt-1.5" />
          <p className="mt-2.5 flex items-center gap-1.5 text-[13px] text-ink-2">
            <MapPin size={15} fill="currentColor" className="text-ink" />
            {hive.place}
          </p>
        </div>
      </div>

      <div role="tablist" aria-label="Hive summary" className="mt-3.5 grid grid-cols-5 gap-1 rounded-lg bg-tab p-0.5">
        {tabs.map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={cx('rounded-md px-1 py-1.5 text-[11px] font-medium', tab === t ? 'bg-tab-active text-tab-active-ink' : 'text-ink-2 hover:bg-card')}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-3 flex-1">
        {tab === 'Overview' && (
          <>
            <div className="grid grid-cols-2 gap-x-3 gap-y-4 rounded-lg border border-line p-3 sm:grid-cols-4">
              <div>
                <div className="text-[11px] text-ink-2">Temperature</div>
                <div className="my-1 text-lg font-bold text-ink">{hive.online ? `${hive.temp.toFixed(1)}°C` : dash}</div>
                {hive.online && <Chip tone={hive.temp > 36.5 ? 'crit' : hive.temp > 35.5 ? 'warn' : 'ok'}>{hive.temp > 36.5 ? 'High' : hive.temp > 35.5 ? 'Watch' : 'Optimal'}</Chip>}
              </div>
              <div>
                <div className="text-[11px] text-ink-2">Humidity</div>
                <div className="my-1 text-lg font-bold text-ink">{hive.online ? `${hive.humidity}%` : dash}</div>
                {hive.online && <Chip tone={hive.humidity > 66 ? 'crit' : hive.humidity > 62 ? 'warn' : 'ok'}>{hive.humidity > 66 ? 'High' : hive.humidity > 62 ? 'Watch' : 'Optimal'}</Chip>}
              </div>
              <div>
                <div className="text-[11px] text-ink-2">Hive Weight</div>
                <div className="my-1 text-lg font-bold text-ink">{hive.online ? `${hive.weight.toFixed(1)} kg` : dash}</div>
                {hive.online && (
                  <span className={cx('text-[11px] font-semibold', hive.weightDelta >= 0 ? 'text-ok-text' : 'text-crit-text')}>
                    {hive.weightDelta >= 0 ? '▲ +' : '▼ '}
                    {hive.weightDelta.toFixed(1)} kg (7d)
                  </span>
                )}
              </div>
              <div>
                <div className="text-[11px] text-ink-2">Bee Activity</div>
                <div className="my-1 text-lg font-bold text-ink">{hive.online ? hive.activity : dash}</div>
                {hive.online && <LevelBars level={hive.activity} />}
              </div>
            </div>
            <div className="mt-2.5 grid grid-cols-3 gap-3 rounded-lg bg-card-2 p-3 text-xs">
              <div>
                <div className="text-[11px] text-ink-2">Last Update</div>
                <div className="mt-1 font-medium text-ink">{hive.lastUpdate}</div>
              </div>
              <div>
                <div className="text-[11px] text-ink-2">Battery</div>
                <div className="mt-1 flex items-center gap-1.5 font-semibold text-ink">
                  <BatteryFull size={18} className={hive.battery < 30 ? 'text-crit' : 'text-ok'} />
                  {hive.battery}%
                </div>
              </div>
              <div className="flex items-center gap-2">
                {hive.online ? <Wifi size={22} className="text-ok" /> : <WifiOff size={22} className="text-muted" />}
                <div>
                  <div className="text-[11px] text-ink-2">Connectivity</div>
                  <div className="mt-0.5 font-semibold text-ink">{hive.online ? 'Online' : 'Offline'}</div>
                </div>
              </div>
            </div>
          </>
        )}
        {tab === 'Live Data' &&
          (hive.online ? (
            <LiveImage src={img('live-camera.jpg')} alt={`Camera view inside hive ${hive.id}`} caption={`Hive ${hive.id}`} sub={hive.place} className="h-[190px]" />
          ) : (
            <p className="rounded-lg bg-card-2 p-4 text-sm text-muted">This hive is offline. Live data will return when the sensor unit reconnects.</p>
          ))}
        {tab === 'History' && (
          <ul className="divide-y divide-line text-xs">
            {HIVES_RECENT_ACTIVITY.slice(0, 4).map((a) => (
              <li key={a.title} className="flex items-center gap-2.5 py-2">
                <Bubble tone={a.tone} size={26}>
                  <ActivityIcon name={a.icon} size={13} />
                </Bubble>
                <span className="flex-1 font-medium text-ink">{a.title}</span>
                <span className="text-muted">{a.ago}</span>
              </li>
            ))}
          </ul>
        )}
        {tab === 'Tasks' &&
          (hiveTasks.length ? (
            <ul className="divide-y divide-line text-xs">
              {hiveTasks.slice(0, 5).map((t) => (
                <li key={t.id} className="flex items-center gap-2 py-2">
                  <span className="flex-1 font-medium text-ink">{t.title}</span>
                  <span className="text-muted">{dayMonth(fromIso(t.due))}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-lg bg-card-2 p-4 text-sm text-muted">No open tasks for this hive.</p>
          ))}
        {tab === 'Notes' && (
          <p className="rounded-lg bg-card-2 p-4 text-sm text-ink-2">
            {hive.health === 'healthy'
              ? 'Strong colony. Good brood pattern.'
              : hive.health === 'attention'
                ? 'Colony needs a follow-up inspection. Watch temperature and activity.'
                : 'Colony under stress. Urgent inspection recommended.'}
            <span className="mt-1 block text-xs text-muted">Field owner: {hive.owner}</span>
          </p>
        )}
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <LinkButton to="/map">View on Map</LinkButton>
        <LinkButton to={`/hives/${hive.id}`} variant="navy">
          View Details
        </LinkButton>
        <LinkButton to={`/hives/${hive.id}/activity`}>More Actions</LinkButton>
      </div>
    </Card>
  )
}

/* ---------- Table view ---------- */

function HiveTable({ hives, selectedId, onSelect }: { hives: Hive[]; selectedId: string; onSelect: (id: string) => void }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-card">
      <table className="w-full min-w-[620px] text-left text-xs">
        <thead className="bg-card-2 text-ink-2">
          <tr>
            {['Hive', 'Status', 'Location', 'Temp', 'Humidity', 'Weight', 'Activity', 'Battery'].map((h) => (
              <th key={h} className="px-3 py-2.5 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line tabular-nums">
          {hives.map((h) => (
            <tr key={h.id} onClick={() => onSelect(h.id)} className={cx('cursor-pointer hover:bg-card-2', h.id === selectedId && 'bg-ok-soft')}>
              <td className="px-3 py-2.5">
                <Link to={`/hives/${h.id}`} className="font-semibold text-link hover:underline" onClick={(e) => e.stopPropagation()}>
                  {h.id}
                </Link>
              </td>
              <td className="px-3 py-2.5">
                <StatusLabel status={statusOf(h)} />
              </td>
              <td className="px-3 py-2.5 text-ink-2">{h.place}</td>
              <td className="px-3 py-2.5 text-ink">{h.online ? `${h.temp.toFixed(1)}°C` : '—'}</td>
              <td className="px-3 py-2.5 text-ink">{h.online ? `${h.humidity}%` : '—'}</td>
              <td className="px-3 py-2.5 text-ink">{h.online ? `${h.weight.toFixed(1)} kg` : '—'}</td>
              <td className="px-3 py-2.5 text-ink">{h.online ? h.activity : '—'}</td>
              <td className="px-3 py-2.5 text-ink">{h.battery}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ---------- Trend charts ---------- */

function HivePicker({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const options = FEATURED_FOR_CHARTS.some((h) => h.id === value) ? FEATURED_FOR_CHARTS : [HIVES.find((h) => h.id === value)!, ...FEATURED_FOR_CHARTS]
  return (
    <Select aria-label="Hive" value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map((h) => (
        <option key={h.id} value={h.id}>
          Hive {h.id}
        </option>
      ))}
    </Select>
  )
}

function HealthTrend({ hiveId, onHive }: { hiveId: string; onHive: (id: string) => void }) {
  const [range, setRange] = useState<Range>('7d')
  const c = usePalette()
  const hive = HIVES.find((h) => h.id === hiveId)!
  const labels = range === '7d' ? LAST_7_DAYS : rangeLabels(range)
  const n = labels.length
  const seed = seedOf(hiveId)
  return (
    <Card
      title="Hive Health Trend"
      action={
        <>
          <HivePicker value={hiveId} onChange={onHive} />
          <Select aria-label="Time range" value={range} onChange={(e) => setRange(e.target.value as Range)}>
            {(Object.keys(RANGE_LABEL) as Range[]).map((r) => (
              <option key={r} value={r}>
                {RANGE_LABEL[r]}
              </option>
            ))}
          </Select>
        </>
      }
    >
      <ComboChart
        ariaLabel={`Temperature, humidity and weight of hive ${hiveId}`}
        labels={labels}
        height={150}
        y={{ min: 0, max: 80, step: 20 }}
        series={[
          { label: 'Temperature (°C)', data: series(seed + n, n, hive.temp, 1.4), color: c.honey, unit: ' °C' },
          { label: 'Humidity (%)', data: series(seed + 5 + n, n, hive.humidity, 4), color: c.blue, unit: '%' },
          { label: 'Hive Weight (kg)', data: series(seed + 9 + n, n, hive.weight - 1, 0.8, 1.2), color: c.green, unit: ' kg' },
        ]}
      />
    </Card>
  )
}

function WeightTrend({ hiveId, onHive }: { hiveId: string; onHive: (id: string) => void }) {
  const c = usePalette()
  const hive = HIVES.find((h) => h.id === hiveId)!
  const gain = hive.health === 'critical' ? 3.1 : hive.health === 'attention' ? 8.6 : 12.4
  const weeks = 26
  const dates = Array.from({ length: weeks }, (_, i) => new Date(2026, 3, 1 + i * 7))
  const labels = dates.map(dayMonth)
  // Label only the first reading of each month, as in the design.
  const monthTick = (_: string, i: number) => (i === 0 || dates[i].getMonth() !== dates[i - 1].getMonth() ? monthName(dates[i]) : '')
  const data = series(seedOf(hiveId) + 3, weeks, hive.weight - gain, 0.9, gain).map((v, i) => (i === weeks - 1 ? hive.weight : v))
  return (
    <Card
      title="Hive Weight Trend"
      action={
        <>
          <HivePicker value={hiveId} onChange={onHive} />
          <Select aria-label="Season" defaultValue="this">
            <option value="this">This Season</option>
          </Select>
        </>
      }
    >
      <div className="relative">
        <ComboChart
          ariaLabel={`Weight of hive ${hiveId} this season`}
          labels={labels}
          height={124}
          legend={false}
          xTick={monthTick}
          y={{ min: 0, max: 50, step: 10 }}
          series={[{ label: 'Hive weight', data, color: c.green, fill: 'origin', unit: ' kg' }]}
        />
        <div className="pointer-events-none absolute top-0 right-1 rounded-md border border-line bg-card px-2 py-1 text-center shadow-sm">
          <div className="text-sm font-bold text-ink">{hive.weight.toFixed(1)} kg</div>
          <div className="text-[10px] text-muted">{labels[weeks - 1]}</div>
        </div>
      </div>
      <dl className="mt-3 grid grid-cols-3 gap-2">
        {[
          ['Total Gain', `+${gain.toFixed(1)} kg`],
          ['Avg. per Week', `+${(gain / 11).toFixed(1)} kg`],
          ['Projected Yield', `${Math.round(hive.weight + 6)}–${Math.round(hive.weight + 10)} kg`],
        ].map(([label, value]) => (
          <div key={label}>
            <dt className="text-[11px] text-ink-2">{label}</dt>
            <dd className="text-[15px] font-bold text-ok-text">{value}</dd>
          </div>
        ))}
      </dl>
    </Card>
  )
}

/* ---------- Page ---------- */

export default function HivesList() {
  const [params, setParams] = useSearchParams()
  const [filter, setFilterState] = useState<Filter>('all')
  const [sort, setSortState] = useState<Sort>('default')
  const [query, setQueryState] = useState('')
  const [view, setViewState] = useState<'grid' | 'table'>('grid')
  const [page, setPage] = useState(0)
  // Any change to what is listed returns the list to its first page.
  const resetting =
    <T,>(set: (value: T) => void) =>
    (value: T) => {
      set(value)
      setPage(0)
    }
  const setFilter = resetting(setFilterState)
  const setSort = resetting(setSortState)
  const setQuery = resetting(setQueryState)
  const setView = resetting(setViewState)
  const [selectedId, setSelectedId] = useState('BGL-042')
  const [chartHive, setChartHive] = useState('BGL-042')
  const [adding, setAdding] = useState(false)
  const location = params.get('location') ?? 'all'

  const inLocation = useMemo(() => HIVES.filter((h) => location === 'all' || h.locationId === location), [location])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = inLocation.filter((h) => matchesFilter(h, filter) && (!q || h.id.toLowerCase().includes(q) || h.place.toLowerCase().includes(q) || h.owner.toLowerCase().includes(q)))
    if (sort === 'health') list.sort((a, b) => HEALTH_RANK[statusOf(a)] - HEALTH_RANK[statusOf(b)] || a.id.localeCompare(b.id))
    if (sort === 'id') list.sort((a, b) => a.id.localeCompare(b.id))
    if (sort === 'weight') list.sort((a, b) => b.weight - a.weight)
    return list
  }, [inLocation, filter, query, sort])

  const pageSize = view === 'grid' ? PAGE_SIZE : 12
  const pages = Math.max(1, Math.ceil(visible.length / pageSize))
  const shown = visible.slice(page * pageSize, page * pageSize + pageSize)
  const selected = HIVES.find((h) => h.id === selectedId) ?? HIVES[0]

  const select = (id: string) => {
    setSelectedId(id)
    setChartHive(id)
  }

  const counts: Array<{ id: Filter; label: string; count: number }> = [
    { id: 'all', label: 'All Hives', count: inLocation.length },
    { id: 'healthy', label: 'Healthy', count: inLocation.filter((h) => h.health === 'healthy').length },
    { id: 'attention', label: 'Attention', count: inLocation.filter((h) => h.health === 'attention').length },
    { id: 'critical', label: 'Critical', count: inLocation.filter((h) => h.health === 'critical').length },
    { id: 'offline', label: 'Offline', count: inLocation.filter((h) => !h.online).length },
  ]

  return (
    <div className="space-y-3 p-3.5">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <h1 className="text-[32px] leading-none font-bold text-ink">Hives</h1>
        <p className="mr-auto text-sm text-ink-2">Manage, monitor and care for every hive in your network</p>
        <Select
          aria-label="Location"
          value={location}
          onChange={(e) => {
            setParams(e.target.value === 'all' ? {} : { location: e.target.value }, { replace: true })
            setPage(0)
          }}
        >
          <option value="all">All Locations</option>
          {LOCATIONS.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </Select>
        <Select aria-label="Status" value={filter} onChange={(e) => setFilter(e.target.value as Filter)}>
          <option value="all">All Status</option>
          <option value="healthy">Healthy</option>
          <option value="attention">Attention</option>
          <option value="critical">Critical</option>
          <option value="offline">Offline</option>
        </Select>
        <Select aria-label="Sort" value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
          <option value="default">Default order</option>
          <option value="health">Sort by Health</option>
          <option value="id">Sort by Hive ID</option>
          <option value="weight">Sort by Weight</option>
        </Select>
        <Button onClick={() => setAdding(true)} className="px-4 py-2 text-[13px]">
          <Plus size={16} /> Add Hive
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 2xl:grid-cols-6">
        <StatTile icon={<HiveIcon size={26} />} label="Total Hives" value={NETWORK.total} delta="+12%" deltaNote="vs last month" />
        <StatTile icon={<Heart size={26} />} tone="ok" label="Healthy" value={NETWORK.healthy} footer={`${pct(NETWORK.healthy, NETWORK.total)}%`} />
        <StatTile icon={<TriangleAlert size={26} />} tone="warn" label="Attention" value={NETWORK.attention} footer={`${pct(NETWORK.attention, NETWORK.total)}%`} />
        <StatTile icon={<OctagonAlert size={26} />} tone="crit" label="Critical" value={NETWORK.critical} footer={`${pct(NETWORK.critical, NETWORK.total)}%`} />
        <StatTile icon={<JarIcon size={26} />} label="Avg. Honey Yield" sub="(this season)" value={`${NETWORK.avgPerHiveKg.toFixed(1)} kg`} delta="+18%" />
        <StatTile icon={<BeeIcon size={28} />} tone="info" label="Active Colonies" value={`${pct(NETWORK.activeColonies, NETWORK.total)}%`} footer={`${NETWORK.activeColonies} / ${NETWORK.total}`} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div role="group" aria-label="Filter by status" className="flex flex-wrap gap-2">
          {counts.map((c) => (
            <button
              key={c.id}
              onClick={() => setFilter(c.id)}
              aria-pressed={filter === c.id}
              className={cx('rounded-lg px-4 py-2 text-xs font-medium', filter === c.id ? 'bg-tab-active text-tab-active-ink' : 'bg-card text-ink-2 ring-1 ring-line hover:ring-muted')}
            >
              {c.label} ({c.count})
            </button>
          ))}
        </div>
        <div className="relative min-w-[200px] flex-1">
          <Search size={15} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by hive ID, location, or tag..."
            aria-label="Search hives"
            className="w-full rounded-lg border border-line bg-card py-2 pr-3 pl-9 text-xs text-ink placeholder:text-muted"
          />
        </div>
        <div role="group" aria-label="View" className="flex overflow-hidden rounded-lg ring-1 ring-line">
          <button onClick={() => setView('grid')} aria-pressed={view === 'grid'} className={cx('flex items-center gap-2 px-3.5 py-2 text-xs font-medium', view === 'grid' ? 'bg-tab-active text-tab-active-ink' : 'bg-card text-ink-2')}>
            <LayoutGrid size={15} /> Grid View
          </button>
          <button onClick={() => setView('table')} aria-pressed={view === 'table'} className={cx('flex items-center gap-2 px-3.5 py-2 text-xs font-medium', view === 'table' ? 'bg-tab-active text-tab-active-ink' : 'bg-card text-ink-2')}>
            <Table2 size={15} /> Table View
          </button>
        </div>
      </div>

      <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_400px] 2xl:grid-cols-[minmax(0,1fr)_460px]">
        <div>
          {shown.length === 0 ? (
            <div className="grid h-full min-h-[200px] place-items-center rounded-xl border border-dashed border-line bg-card p-6 text-center text-sm text-muted">
              No hives match these filters.
            </div>
          ) : view === 'grid' ? (
            <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 lg:grid-cols-4">
              {shown.map((h) => (
                <HiveCard key={h.id} hive={h} selected={h.id === selectedId} onSelect={() => select(h.id)} />
              ))}
            </div>
          ) : (
            <HiveTable hives={shown} selectedId={selectedId} onSelect={select} />
          )}
          {visible.length > 0 && (
            <div className="mt-2.5 flex items-center justify-between text-xs text-ink-2">
              <span>
                Showing {page * pageSize + 1}–{Math.min(visible.length, (page + 1) * pageSize)} of {visible.length} hives
              </span>
              <span className="flex items-center gap-2">
                <button disabled={page === 0} onClick={() => setPage((p) => p - 1)} aria-label="Previous page" className="grid h-7 w-7 place-items-center rounded-md bg-card ring-1 ring-line disabled:opacity-40">
                  <ChevronLeft size={15} />
                </button>
                Page {page + 1} of {pages}
                <button disabled={page >= pages - 1} onClick={() => setPage((p) => p + 1)} aria-label="Next page" className="grid h-7 w-7 place-items-center rounded-md bg-card ring-1 ring-line disabled:opacity-40">
                  <ChevronRight size={15} />
                </button>
              </span>
            </div>
          )}
        </div>
        <HivePanel key={selected.id} hive={selected} />
      </div>

      <div className="grid gap-3 lg:grid-cols-2 2xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <HealthTrend hiveId={chartHive} onHive={setChartHive} />
        <WeightTrend hiveId={chartHive} onHive={setChartHive} />
        <Card title="Recent Activity" action={<ViewAll to={`/hives/${selected.id}/activity`} />} className="lg:col-span-2 2xl:col-span-1">
          <ul className="divide-y divide-line">
            {HIVES_RECENT_ACTIVITY.map((a) => (
              <li key={a.title} className="flex items-center gap-3 py-1.5">
                <Bubble tone={a.tone} size={28}>
                  <ActivityIcon name={a.icon} size={14} />
                </Bubble>
                <span className="min-w-0 flex-1 leading-tight">
                  <span className="block text-xs font-medium text-ink">{a.title}</span>
                  <span className="text-[11px] text-muted">{a.by}</span>
                </span>
                <span className="text-[11px] text-muted">{a.ago}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {adding && <AddHiveModal onClose={() => setAdding(false)} />}
    </div>
  )
}
