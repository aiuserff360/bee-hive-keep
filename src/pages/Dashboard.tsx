import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Check, Heart, Info, MapPin, OctagonAlert, Plus, Sparkles, TriangleAlert, Users } from 'lucide-react'
import { InsightIcon, LiveImage } from '../components/blocks'
import { ComboChart, Donut, usePalette } from '../components/charts'
import HiveMap from '../components/HiveMap'
import { HiveIcon, JarIcon } from '../components/icons'
import { AddTaskModal } from '../components/TaskForm'
import { Button, Card, Meter, Select, StatTile, ViewAll, cx } from '../components/ui'
import { ALERTS, DASHBOARD_INSIGHTS } from '../data/content'
import { NETWORK, RANGE_LABEL, SEASON_MONTHS, img, pct, rangeLabels, series } from '../data/hives'
import type { Range } from '../data/hives'
import { useStore } from '../store'

const MONTHLY_HONEY = [160, 185, 215, 232, 320, 370]
const LAST_SEASON_HONEY = [138, 160, 181, 196, 268, 313]

function KpiRow() {
  return (
    <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4 2xl:grid-cols-[1fr_1fr_1fr_0.95fr_1.2fr_1fr_1fr]">
      <StatTile icon={<HiveIcon size={26} />} label="Total Hives" value={NETWORK.total} delta="+12%" deltaNote="vs last month" />
      <StatTile icon={<Heart size={26} fill="currentColor" />} tone="ok" label="Healthy Hives" value={NETWORK.healthy} footer={`${pct(NETWORK.healthy, NETWORK.total)}%`} />
      <StatTile icon={<TriangleAlert size={26} />} tone="warn" label="Attention Needed" value={NETWORK.attention} footer={`${pct(NETWORK.attention, NETWORK.total)}%`} />
      <StatTile icon={<OctagonAlert size={26} />} tone="crit" label="Critical" value={NETWORK.critical} footer={`${pct(NETWORK.critical, NETWORK.total)}%`} />
      <StatTile icon={<JarIcon size={26} />} label="Total Honey Yield" sub="(this season)" value={`${NETWORK.honeyKg.toLocaleString()} kg`} delta="+18%" deltaNote="vs last season" />
      <StatTile icon={<MapPin size={26} fill="currentColor" />} tone="info" label="Active Locations" value={NETWORK.locations} footer={`across ${NETWORK.states} states`} />
      <StatTile icon={<Users size={26} fill="currentColor" />} tone="info" label="Hive Keepers" value={NETWORK.keepers} footer={`(incl. ${NETWORK.womenKeepers} women)`} />
    </div>
  )
}

function RecentAlerts() {
  return (
    <Card title="Recent Alerts" action={<ViewAll to="/alerts" />} bodyClassName="pt-2">
      <ul className="space-y-1.5">
        {ALERTS.map((a) => (
          <li key={a.id}>
            <Link to={`/hives/${a.hiveId}`} className="flex items-center gap-3 rounded-lg border border-line px-3 py-2 hover:bg-card-2">
              {a.severity === 'info' ? (
                <Info size={24} className="shrink-0 text-info" />
              ) : (
                <TriangleAlert size={24} className={cx('shrink-0', a.severity === 'critical' ? 'text-crit' : 'text-warn')} />
              )}
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-semibold text-ink">{a.title}</span>
                <span className="text-[11px] text-muted">
                  Hive {a.hiveId} • {a.place}
                </span>
              </span>
              <span className="shrink-0 text-[11px] text-muted">{a.ago}</span>
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  )
}

function EnvironmentalTrends() {
  const [range, setRange] = useState<Range>('7d')
  const c = usePalette()
  const labels = rangeLabels(range)
  const n = labels.length
  return (
    <Card
      title="Environmental Trends"
      info="Network averages from all online hive sensors"
      action={
        <Select aria-label="Time range" value={range} onChange={(e) => setRange(e.target.value as Range)}>
          {(Object.keys(RANGE_LABEL) as Range[]).map((r) => (
            <option key={r} value={r}>
              {RANGE_LABEL[r]}
            </option>
          ))}
        </Select>
      }
    >
      <ComboChart
        ariaLabel="Temperature, humidity and bee activity over time"
        labels={labels}
        height={130}
        y={{ min: 0, max: 80, step: 20 }}
        series={[
          { label: 'Temperature (°C)', data: series(11 + n, n, 34, 3), color: c.honey, unit: ' °C' },
          { label: 'Humidity (%)', data: series(23 + n, n, 58, 9), color: c.blue, unit: '%' },
          { label: 'Bee Activity (Index)', data: series(37 + n, n, 46, 7), color: c.green },
        ]}
      />
    </Card>
  )
}

function HoneyProduction() {
  const [season, setSeason] = useState<'this' | 'last'>('this')
  const c = usePalette()
  const data = season === 'this' ? MONTHLY_HONEY : LAST_SEASON_HONEY
  const total = data.reduce((a, b) => a + b, 0)
  const share = pct(total, NETWORK.honeyTargetKg)
  return (
    <Card
      title="Honey Production"
      info="Honey collected across the network, by month"
      action={
        <Select aria-label="Season" value={season} onChange={(e) => setSeason(e.target.value as 'this' | 'last')}>
          <option value="this">This Season</option>
          <option value="last">Last Season</option>
        </Select>
      }
    >
      <div className="flex items-start gap-4">
        <div className="min-w-0 flex-1">
          <ComboChart
            ariaLabel="Honey collected per month in kilograms"
            labels={SEASON_MONTHS}
            height={118}
            y={{ min: 0, max: 400, step: 100 }}
            series={[{ label: 'Honey (kg)', data, color: c.honey, type: 'bar', unit: ' kg' }]}
          />
        </div>
        <div className="shrink-0 pt-1">
          <div className="text-xl font-bold text-ink">{total.toLocaleString()} kg</div>
          {season === 'this' && (
            <>
              <div className="text-sm font-semibold text-ok-text">▲ +18%</div>
              <div className="text-[11px] text-muted">vs last season</div>
            </>
          )}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-ink-2">
        <span>
          Avg. per hive: <b className="text-ink">{(total / NETWORK.total).toFixed(1)} kg</b>
        </span>
        <span>Target: {NETWORK.honeyTargetKg.toLocaleString()} kg</span>
        <Meter value={share} color={c.honey} className="min-w-[80px] flex-1" />
        <b className="text-ink">{share}%</b>
      </div>
    </Card>
  )
}

function HealthDistribution() {
  const segments = [
    { label: 'Healthy', value: NETWORK.healthy, color: '#22c55e' },
    { label: 'Attention Needed', value: NETWORK.attention, color: '#f5b91f' },
    { label: 'Critical', value: NETWORK.critical, color: '#ef4444' },
  ]
  return (
    <Card title="Hive Health Distribution" info="Share of hives by current health status" className="lg:col-span-2 2xl:col-span-1" bodyClassName="grid content-center">
      <div className="flex flex-wrap items-center justify-around gap-4">
        <Donut segments={segments} size={132} ariaLabel="Hive health distribution" unit=" hives">
          <div>
            <div className="text-2xl leading-none font-bold text-ink">{NETWORK.total}</div>
            <div className="text-xs text-ink-2">Hives</div>
          </div>
        </Donut>
        <ul className="space-y-3">
          {segments.map((s) => (
            <li key={s.label} className="flex items-start gap-3">
              <span className="mt-1 h-3.5 w-3.5 rounded-full" style={{ background: s.color }} />
              <span className="leading-tight">
                <span className="block text-sm text-ink">
                  <b>{s.value}</b> ({pct(s.value, NETWORK.total)}%)
                </span>
                <span className="text-xs text-ink-2">{s.label}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  )
}

function AiInsights() {
  return (
    <Card title="AI Insights" icon={<Sparkles size={18} className="text-info" />}>
      <div className="grid gap-2.5 md:grid-cols-3">
        {DASHBOARD_INSIGHTS.map((insight) => (
          <article key={insight.title} className="theme-light flex gap-3 rounded-lg bg-[#e3ecf7] p-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-navy">
              <InsightIcon name={insight.icon} size={20} />
            </span>
            <div className="min-w-0">
              <h3 className="text-xs font-semibold text-link">{insight.title}</h3>
              <p className="mt-0.5 text-xs text-ink-2">{insight.body}</p>
              {insight.cta && insight.to && (
                <Link to={insight.to} className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-link hover:underline">
                  {insight.cta} <ArrowRight size={13} />
                </Link>
              )}
            </div>
          </article>
        ))}
      </div>
    </Card>
  )
}

function FieldOperations() {
  const { fieldOps, toggleFieldOp } = useStore()
  const [adding, setAdding] = useState(false)
  return (
    <Card title="Field Operations" action={<ViewAll to="/tasks" />}>
      <div className="flex flex-wrap items-center gap-4">
        <ul className="min-w-[220px] flex-1 divide-y divide-line rounded-lg border border-line">
          {fieldOps.map((op) => (
            <li key={op.id}>
              <label className="flex cursor-pointer items-center gap-3 px-3 py-1.5 text-xs hover:bg-card-2">
                <input type="checkbox" checked={op.done} onChange={() => toggleFieldOp(op.id)} className="peer sr-only" />
                <span className={cx('grid h-4 w-4 shrink-0 place-items-center rounded-full border peer-focus-visible:ring-2 peer-focus-visible:ring-honey', op.done ? 'border-ok bg-ok text-white' : 'border-muted')}>
                  {op.done && <Check size={11} strokeWidth={3} />}
                </span>
                <span className={cx('flex-1 text-ink', op.done && 'text-muted line-through')}>{op.title}</span>
                <span className="text-[11px] text-muted">{op.when}</span>
              </label>
            </li>
          ))}
        </ul>
        <Button onClick={() => setAdding(true)} className="px-5 py-2.5 text-sm">
          <Plus size={16} /> Add Task
        </Button>
      </div>
      {adding && <AddTaskModal onClose={() => setAdding(false)} />}
    </Card>
  )
}

export default function Dashboard() {
  return (
    <div className="space-y-2.5 p-2.5">
      <h1 className="sr-only">Dashboard</h1>
      <KpiRow />

      <div className="grid gap-2.5 xl:grid-cols-[minmax(0,1fr)_340px] 2xl:grid-cols-[minmax(0,1fr)_400px]">
        <HiveMap />
        <div className="grid content-start gap-2.5 md:grid-cols-2 xl:grid-cols-1">
          <Card title="Live Hive Feed" action={<ViewAll to="/hives/BGL-042/live-data" />} bodyClassName="pt-2">
            <LiveImage src={img('live-feed.jpg')} alt="Bees at the entrance of hive BGL-042" caption="Hive BGL-042" sub="Bengaluru Rural" className="h-[170px]" />
          </Card>
          <RecentAlerts />
        </div>
      </div>

      <div className="grid gap-2.5 lg:grid-cols-2 2xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)_400px]">
        <EnvironmentalTrends />
        <HoneyProduction />
        <HealthDistribution />
      </div>

      <div className="grid gap-2.5 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <AiInsights />
        <FieldOperations />
      </div>
    </div>
  )
}
