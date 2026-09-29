import { useState } from 'react'
import type { ReactNode } from 'react'
import { Droplet, FlaskConical, Leaf, Plus, Star } from 'lucide-react'
import { RecommendationList } from '../../components/blocks'
import { ComboChart, Donut, usePalette } from '../../components/charts'
import { AddTaskModal } from '../../components/TaskForm'
import { Button, Card, Chip, Meter, Select, ViewAll } from '../../components/ui'
import { FLORAL_SOURCES, HONEY_RECOMMENDATIONS, YIELD_FACTORS } from '../../data/content'
import type { Tone } from '../../data/content'
import { SEASON_MONTHS, img } from '../../data/hives'
import type { TabProps } from './HiveDetail'

const round1 = (n: number) => Math.round(n * 10) / 10
const MONTH_TEMPS = [24.5, 26, 28.5, 32, 33.5, 36]
const NETWORK_MONTHLY = [0.6, 0.7, 0.8, 0.9, 1.0, 0.8]

function ProductionTrend({ detail }: TabProps) {
  const c = usePalette()
  const cumulative = detail.monthlyHoney.map((_, i) => round1(detail.monthlyHoney.slice(0, i + 1).reduce((a, b) => a + b, 0)))
  return (
    <Card
      title="Honey Production Trend"
      action={
        <Select aria-label="Season" defaultValue="this">
          <option value="this">This Season</option>
        </Select>
      }
    >
      <ComboChart
        ariaLabel="Cumulative honey collected this season, with average temperature"
        labels={SEASON_MONTHS}
        height={235}
        y={{ min: 0, max: 20, step: 5, title: 'Honey (kg)' }}
        y1={{ min: 20, max: 40, step: 5, title: 'Temperature (°C)' }}
        series={[
          { label: 'Honey Collected (kg)', data: cumulative, color: c.honey, type: 'bar', unit: ' kg' },
          { label: 'Temperature (°C)', data: MONTH_TEMPS, color: c.blue, axis: 'y1', points: true, unit: ' °C' },
        ]}
      />
    </Card>
  )
}

function HarvestHistory({ hive, detail }: TabProps) {
  return (
    <Card title="Harvest History" action={<ViewAll to={`/hives/${hive.id}/history`} />}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[380px] text-left text-xs">
          <thead className="bg-card-2 text-ink-2">
            <tr>
              {['Date', 'Collected', 'Method', 'Notes'].map((h) => (
                <th key={h} className="px-2 py-2 font-medium whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line text-ink">
            {detail.harvests.map((h) => (
              <tr key={h.date}>
                <td className="px-2 py-2 whitespace-nowrap tabular-nums">{h.date}</td>
                <td className="px-2 py-2 font-semibold whitespace-nowrap tabular-nums">{h.kg.toFixed(1)} kg</td>
                <td className="px-2 py-2 whitespace-nowrap">{h.method}</td>
                <td className="px-2 py-2">{h.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function HoneyQuality() {
  const rows: Array<{ icon: ReactNode; label: string; value: string; chip?: { tone: Tone; text: string }; note: string }> = [
    { icon: <Droplet size={24} className="text-honey-dark" fill="currentColor" />, label: 'Moisture Content', value: '17.2%', chip: { tone: 'ok', text: 'Good' }, note: '(Target < 18%)' },
    { icon: <FlaskConical size={24} className="text-info" />, label: 'pH Level', value: '3.8', chip: { tone: 'ok', text: 'Normal' }, note: '(3.2 – 4.5)' },
    { icon: <Star size={24} className="text-honey-dark" fill="currentColor" />, label: 'Purity (AI Estimate)', value: '98%', chip: { tone: 'ok', text: 'High' }, note: 'No adulteration detected' },
    { icon: <Leaf size={24} className="text-ok" fill="currentColor" />, label: 'Floral Source (AI)', value: 'Wildflower Mix', note: 'Primary: Eucalyptus, Neem, Acacia' },
  ]
  return (
    <Card title="Honey Quality" className="lg:col-span-2 2xl:col-span-1">
      <div className="flex gap-3.5">
        <img src={img('honey-jar.jpg')} alt="Honey from this hive" className="hidden h-[196px] w-[25%] rounded-lg object-cover sm:block" />
        <ul className="min-w-0 flex-1 space-y-3">
          {rows.map((r) => (
            <li key={r.label} className="flex items-start gap-2.5">
              <span className="mt-0.5 shrink-0">{r.icon}</span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-x-2">
                  <span className="mr-auto text-xs text-ink">{r.label}</span>
                  <b className="text-sm whitespace-nowrap text-ink">{r.value}</b>
                  {r.chip && <Chip tone={r.chip.tone}>{r.chip.text}</Chip>}
                </span>
                <span className="block text-[11px] leading-snug text-ink-2">{r.note}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  )
}

function SeasonalComparison({ detail }: TabProps) {
  const c = usePalette()
  const [view, setView] = useState<'season' | 'mine'>('season')
  const drop = 1 + detail.honeyDelta / 100
  const lastSeason = detail.monthlyHoney.map((v) => round1(v / drop))
  const all = [
    { label: 'This Season (2026)', data: detail.monthlyHoney, color: c.honey },
    { label: 'Last Season (2025)', data: lastSeason, color: c.blue },
    { label: 'Network Avg', data: NETWORK_MONTHLY, color: c.gray },
  ]
  return (
    <Card
      title="Seasonal Comparison"
      action={
        <Select aria-label="Comparison" value={view} onChange={(e) => setView(e.target.value as 'season' | 'mine')}>
          <option value="season">Season View</option>
          <option value="mine">This Hive Only</option>
        </Select>
      }
    >
      <ComboChart
        ariaLabel="Monthly honey: this season, last season and the network average"
        labels={SEASON_MONTHS}
        height={150}
        y={{ min: 0, max: 6, step: 2, title: 'Honey (kg)' }}
        series={(view === 'season' ? all : all.slice(0, 2)).map((s) => ({ ...s, type: 'bar' as const, unit: ' kg' }))}
      />
    </Card>
  )
}

function ProductionFactors({ detail }: TabProps) {
  const c = usePalette()
  return (
    <Card
      title="Production vs Environmental Factors"
      action={
        <Select aria-label="Season" defaultValue="this">
          <option value="this">This Season</option>
        </Select>
      }
    >
      <ComboChart
        ariaLabel="Honey production compared with floral index and rainfall"
        labels={SEASON_MONTHS}
        height={150}
        y={{ min: 0, max: 8, step: 2, title: 'Honey (kg)' }}
        y1={{ min: 0, max: 150, step: 50, title: 'Rainfall (mm)' }}
        series={[
          { label: 'Honey Production (kg)', data: detail.monthlyHoney, color: c.honey, points: true, unit: ' kg' },
          { label: 'Floral Index', data: [2.2, 3.4, 4.6, 5.4, 6.1, 4.8], color: c.green, points: true },
          { label: 'Rainfall (mm)', data: [18, 42, 96, 118, 132, 104], color: c.blue, type: 'bar', axis: 'y1', unit: ' mm' },
        ]}
      />
    </Card>
  )
}

function FloralSources() {
  return (
    <Card title="Floral Source Analysis (AI)" className="lg:col-span-2 2xl:col-span-1" bodyClassName="grid content-center">
      <div className="flex items-center gap-3">
        <Donut segments={FLORAL_SOURCES.map((f) => ({ label: f.name, value: f.value, color: f.color }))} size={124} cutout="62%" unit="%" ariaLabel="Share of honey by floral source">
          <span className="text-xs leading-tight font-semibold text-ink">
            Wildflower
            <br />
            Mix
          </span>
        </Donut>
        <ul className="min-w-0 flex-1 space-y-2 text-xs whitespace-nowrap">
          {FLORAL_SOURCES.map((f) => (
            <li key={f.name} className="flex items-center gap-2 text-ink">
              <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: f.color }} />
              <b className="w-8 text-[13px] tabular-nums">{f.value}%</b>
              {f.name}
            </li>
          ))}
        </ul>
        <div className="w-[108px] shrink-0 max-sm:hidden">
          <img src={img('wildflowers.jpg')} alt="Wildflowers near the hive" className="h-[78px] w-full rounded-lg object-cover" />
          <p className="mt-2 rounded-lg bg-warn-soft p-2 text-[10px] leading-snug text-ink-2">
            <Leaf size={14} className="mb-0.5 text-ok" fill="currentColor" />
            Diverse floral sources indicate a healthy foraging environment.
          </p>
        </div>
      </div>
    </Card>
  )
}

function Forecast({ detail }: TabProps) {
  const c = usePalette()
  const scale = detail.honeyTotal / 18.4
  const weeks = ['Sep', 'Wk 2', 'Wk 3', 'Wk 4', 'Oct', 'Wk 6', 'Wk 7', 'Wk 8', 'Nov', 'Wk 10', 'Wk 11', 'Wk 12', 'Dec']
  const expected = [1.6, 2.2, 3.0, 3.8, 4.4, 4.1, 3.5, 3.0, 2.8, 2.7, 2.6, 2.6, 2.6].map((v) => round1(v * scale))
  const high = expected.map((v, i) => round1(v + 0.6 + Math.min(i, 5) * 0.28))
  const low = expected.map((v, i) => round1(Math.max(0.3, v - 0.5 - Math.min(i, 5) * 0.2)))
  const peak = Math.max(...expected)
  return (
    <Card
      title="Honey Flow Forecast"
      action={
        <Select aria-label="Forecast period" defaultValue="3m">
          <option value="3m">Next 3 Months</option>
        </Select>
      }
    >
      <div className="relative">
        <ComboChart
          ariaLabel="Expected weekly honey flow for the next three months, with low and high range"
          labels={weeks}
          height={215}
          y={{ min: 0, max: 8, step: 2, title: 'Honey (kg/week)' }}
          series={[
            { label: 'Expected Production', data: expected, color: c.green, points: true, unit: ' kg' },
            { label: 'High estimate', legendLabel: 'Range (Low–High)', data: high, color: c.green, dashed: true, fill: '+1', unit: ' kg' },
            { label: 'Low estimate', data: low, color: c.green, dashed: true, legend: false, unit: ' kg' },
          ]}
        />
        <div className="pointer-events-none absolute top-0 left-[42%] rounded-md bg-ok-soft px-2.5 py-1.5 text-[11px] leading-tight font-semibold text-ink">
          Expected Peak
          <br />
          {(peak - 0.6).toFixed(0)}–{(peak + 0.6).toFixed(0)} kg/week
          <br />
          in Oct 2026
        </div>
      </div>
    </Card>
  )
}

function YieldFactors() {
  const color = (value: number, lowerIsBetter?: boolean) => (lowerIsBetter ? '#e5484d' : value >= 75 ? '#16a34a' : '#e3a008')
  return (
    <Card title="Honey Yield Factors">
      <ul className="space-y-6 pt-2">
        {YIELD_FACTORS.map((f) => (
          <li key={f.name} className="grid grid-cols-[minmax(0,1.1fr)_40px_minmax(0,1.6fr)] items-center gap-2 text-xs">
            <span className="text-ink">{f.name}</span>
            <b className="text-ink tabular-nums">{f.value}%</b>
            <Meter value={f.value} color={color(f.value, f.lowerIsBetter)} />
          </li>
        ))}
      </ul>
    </Card>
  )
}

export default function Honey(props: TabProps) {
  const [adding, setAdding] = useState(false)
  return (
    <div className="space-y-3">
      <div className="grid gap-3 lg:grid-cols-2 2xl:grid-cols-[1.15fr_1fr_1fr]">
        <ProductionTrend {...props} />
        <HarvestHistory {...props} />
        <HoneyQuality />
      </div>

      <div className="grid gap-3 lg:grid-cols-2 2xl:grid-cols-[1.1fr_1.1fr_1fr]">
        <SeasonalComparison {...props} />
        <ProductionFactors {...props} />
        <FloralSources />
      </div>

      <div className="grid gap-3 lg:grid-cols-2 2xl:grid-cols-[1.25fr_1fr_1fr]">
        <Forecast {...props} />
        <YieldFactors />
        <Card
          title="Recommendations"
          className="lg:col-span-2 2xl:col-span-1"
          action={
            <Button onClick={() => setAdding(true)} className="px-3 py-1.5">
              <Plus size={14} /> Add Task
            </Button>
          }
        >
          <RecommendationList items={HONEY_RECOMMENDATIONS} />
        </Card>
      </div>
      {adding && <AddTaskModal hiveId={props.hive.id} onClose={() => setAdding(false)} />}
    </div>
  )
}
