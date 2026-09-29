import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { ArrowRight, BarChart3, Bug, Check, ChevronRight, CircleCheck, Clock, Crown, Egg, Plus, Search, Smile, TrendingUp } from 'lucide-react'
import { RecommendationList } from '../../components/blocks'
import { ComboChart, Sparkline, usePalette } from '../../components/charts'
import { BeeIcon, CombIcon, JarIcon } from '../../components/icons'
import { AddTaskModal } from '../../components/TaskForm'
import { Button, Card, Chip, Legend, Select, ViewAll } from '../../components/ui'
import { BROOD_RECOMMENDATIONS, PESTS } from '../../data/content'
import { LAST_7_DAYS, img, mulberry32, seedOf, series } from '../../data/hives'
import { useStore } from '../../store'
import type { TabProps } from './HiveDetail'

const BROOD_CLASSES = [
  { key: 'open', label: 'Healthy Brood (Open)', value: 42, color: '#22c55e' },
  { key: 'capped', label: 'Capped Brood', value: 26, color: '#f5b91f' },
  { key: 'eggs', label: 'Eggs (New)', value: 6, color: '#3b82f6' },
  { key: 'dead', label: 'Unusual / Dead Brood', value: 2, color: '#ef4444' },
  { key: 'empty', label: 'Empty Cells', value: 24, color: '#b08d57' },
]

/** Coloured cell overlay drawn over the brood photo, standing in for the AI detection mask. */
function CellOverlay({ seed }: { seed: number }) {
  const cells = useMemo(() => {
    const cols = 24
    const rows = 12
    const r = 8
    const w = Math.sqrt(3) * r
    const out: Array<{ points: string; fill: string; stroke?: string }> = []
    const rand = mulberry32(seed)
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const cx = col * w + (row % 2 ? w / 2 : 0) + 4
        const cy = row * r * 1.5 + 8
        const dx = (cx - 170) / 170
        const dy = (cy - 80) / 90
        const d = Math.sqrt(dx * dx + dy * dy) + (rand() - 0.5) * 0.28
        let fill = ''
        let stroke: string | undefined
        if (d < 0.34) fill = '#22c55e'
        else if (d < 0.5) fill = rand() < 0.55 ? '#3b82f6' : '#22c55e'
        else if (d < 0.82 && rand() < 0.35) fill = '#f5b91f'
        if (d > 0.42 && d < 0.6 && rand() < 0.05) {
          fill = '#ef4444'
          stroke = '#ef4444'
        }
        if (!fill) continue
        const points = Array.from({ length: 6 }, (_, i) => {
          const a = (Math.PI / 3) * i + Math.PI / 6
          return `${(cx + (r - 1.2) * Math.cos(a)).toFixed(1)},${(cy + (r - 1.2) * Math.sin(a)).toFixed(1)}`
        }).join(' ')
        out.push({ points, fill, stroke })
      }
    }
    return out
  }, [seed])
  return (
    <svg viewBox="0 0 340 170" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden="true">
      {cells.map((c, i) => (
        <polygon key={i} points={c.points} fill={c.fill} fillOpacity={c.stroke ? 0.25 : 0.45} stroke={c.stroke ?? c.fill} strokeWidth={c.stroke ? 2 : 0.8} strokeOpacity="0.9" />
      ))}
    </svg>
  )
}

function FrameAnalysis({ hive }: TabProps) {
  const [overlay, setOverlay] = useState(true)
  const [zoom, setZoom] = useState(false)
  return (
    <Card title="Brood Frame Analysis (AI)" info="Cell types detected in the latest frame photo" className="lg:col-span-2 2xl:col-span-1" action={<span className="text-[11px] text-ink-2">23 Sep 2026 &nbsp;10:12 AM</span>}>
      <div className="grid gap-4 sm:grid-cols-[1.35fr_1fr]">
        <div className="relative h-[210px] overflow-hidden rounded-lg">
          <img src={img('brood-comb.jpg')} alt={`Brood frame of hive ${hive.id} with detected cells highlighted`} className={`h-full w-full object-cover transition-transform duration-300 ${zoom ? 'scale-[1.8]' : ''}`} />
          {overlay && !zoom && <CellOverlay seed={seedOf(hive.id)} />}
        </div>
        <div>
          <ul className="space-y-2.5 text-xs">
            {BROOD_CLASSES.map((c) => (
              <li key={c.key} className="flex items-center gap-2.5 text-ink">
                <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: c.color }} />
                <span className="flex-1">{c.label}</span>
                <b className="tabular-nums">{c.value}%</b>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex items-center gap-2.5 rounded-lg bg-warn-soft px-2.5 py-2">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-ok text-white">
              <Check size={14} strokeWidth={3} />
            </span>
            <p className="text-[11px] leading-snug text-ink-2">
              <b className="block text-xs text-ink">Brood pattern is healthy</b>
              Good density, uniform pattern and normal development.
            </p>
          </div>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2.5">
        <Button variant="outline" onClick={() => setZoom((z) => !z)}>
          <Search size={14} /> {zoom ? 'Back to Full Frame' : 'View High Resolution'}
        </Button>
        <Button variant="outline" onClick={() => setOverlay((o) => !o)}>
          <BarChart3 size={14} /> {overlay ? 'Hide AI Overlay' : 'Show AI Overlay'}
        </Button>
      </div>
    </Card>
  )
}

function FrameDistribution({ hive }: TabProps) {
  const [scope, setScope] = useState<'all' | 'brood'>('all')
  const frames = Array.from({ length: 10 }, (_, i) => `F${i + 1}`)
  const seed = seedOf(hive.id)
  const capped = series(seed + 1, 10, 38, 5).map(Math.round)
  const open = series(seed + 2, 10, 34, 5).map(Math.round)
  const eggs = series(seed + 3, 10, 9, 3).map((v) => Math.max(3, Math.round(v)))
  const empty = capped.map((v, i) => Math.max(0, 100 - v - open[i] - eggs[i]))
  const all = [
    { label: 'Capped Brood', data: capped, color: '#f5b91f' },
    { label: 'Open Brood', data: open, color: '#4fbf5f' },
    { label: 'Eggs', data: eggs, color: '#3b82f6' },
    { label: 'Empty Cells', data: empty, color: '#c3cad3' },
  ]
  const shown = scope === 'all' ? all : all.slice(0, 3)
  return (
    <Card
      title="Frame-wise Brood Distribution"
      action={
        <Select aria-label="Cells shown" value={scope} onChange={(e) => setScope(e.target.value as 'all' | 'brood')}>
          <option value="all">All Frames</option>
          <option value="brood">Brood Only</option>
        </Select>
      }
    >
      <ComboChart
        ariaLabel="Share of cell types on each of the ten frames"
        labels={frames}
        height={200}
        stacked
        y={{ min: 0, max: 100, step: 20, suffix: '%' }}
        series={shown.map((s) => ({ ...s, type: 'bar' as const, unit: '%' }))}
      />
    </Card>
  )
}

function QueenHealth({ detail }: TabProps) {
  const { notify } = useStore()
  const present = detail.queenStatus === 'Present'
  const facts: Array<{ icon: ReactNode; text: string }> = [
    { icon: <CircleCheck size={15} className={present ? 'text-ok' : 'text-crit'} />, text: present ? 'Queen Present' : 'Queen not seen' },
    { icon: <Egg size={15} />, text: `Laying Pattern: ${present ? 'Good' : 'Unknown'}` },
    { icon: <CombIcon size={15} />, text: `Egg Pattern: ${present ? 'Uniform' : 'Patchy'}` },
    { icon: <Crown size={15} />, text: 'Queen Age (est.): 8 months' },
    { icon: <Clock size={15} />, text: 'Replacement Due: ~ 4 months' },
  ]
  return (
    <Card title="Queen Health">
      <div className="flex gap-4">
        <img src={img('queen.jpg')} alt="The queen on the comb, surrounded by workers" className="h-[150px] w-[36%] rounded-lg object-cover" />
        <ul className="min-w-0 flex-1 space-y-2.5 text-[11.5px] text-ink">
          {facts.map((f, i) => (
            <li key={f.text} className="flex items-center gap-2">
              <span className="text-ink-2">{f.icon}</span>
              <span className="flex-1">{f.text}</span>
              {i === 0 && (
                <button onClick={() => notify('Queen last seen during inspection on 20 Sep 2026')} aria-label="Queen sighting details" className="rounded p-0.5 hover:bg-card-2">
                  <ChevronRight size={16} />
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-3 flex items-center gap-3 rounded-lg bg-warn-soft px-3 py-2.5">
        <Crown size={24} className="shrink-0 text-honey-dark" fill="currentColor" />
        <p className="text-xs text-ink-2">
          <b className="block text-[13px] text-ink">{present ? 'Queen is healthy and actively laying.' : 'Queen could not be confirmed.'}</b>
          {present ? 'Continue monitoring for consistent pattern.' : 'Inspect brood boxes for eggs within 3 days.'}
        </p>
      </div>
    </Card>
  )
}

function StrengthIndicators({ hive, detail }: TabProps) {
  const c = usePalette()
  const seed = seedOf(hive.id)
  const good = hive.health === 'healthy'
  const tiles = [
    { label: 'Adult Bee Population', icon: <BeeIcon size={22} className="text-ink" />, value: `~ ${detail.population.toLocaleString()}`, note: detail.populationTrend, color: c.green },
    { label: 'Brood-to-Bee Ratio', icon: <CombIcon size={22} className="text-honey" />, value: good ? '0.94' : '0.71', note: good ? 'Optimal' : 'Low', sub: '(0.7 – 1.2)', color: c.green },
    { label: 'Food Stores (Honey + Pollen)', icon: <JarIcon size={22} className="text-ink" />, value: good ? 'Adequate' : 'Low', sub: good ? '~ 6–8 days' : '~ 2–3 days', color: c.honey },
    { label: 'Colony Temperament', icon: <Smile size={22} className="text-honey-dark" />, value: good ? 'Calm' : 'Restless', sub: good ? 'Normal behavior' : 'Defensive at times', color: c.green },
    { label: 'Foraging Activity', icon: <CombIcon size={22} className="text-honey" />, value: hive.activity, sub: hive.activity === 'High' ? 'Consistent' : 'Below normal', color: c.honey },
    { label: 'Overall Health Trend', icon: <TrendingUp size={22} className="text-ok" />, value: detail.scoreDelta >= 0 ? 'Improving' : 'Declining', note: `${detail.scoreDelta >= 0 ? '↑ +' : '↓ '}${Math.abs(detail.scoreDelta) + 2}%`, sub: '(30 days)', color: c.green },
  ]
  return (
    <Card title="Colony Strength Indicators" bodyClassName="flex">
      <div className="grid flex-1 grid-cols-2 gap-2 md:grid-cols-3 2xl:grid-cols-6">
        {tiles.map((t, i) => (
          <div key={t.label} className="flex flex-col rounded-lg border border-line p-2.5">
            <div className="text-[10.5px] leading-tight text-ink-2">{t.label}</div>
            <div className="mt-2 flex items-start gap-2">
              <span className="shrink-0">{t.icon}</span>
              <div className="min-w-0 leading-tight">
                <div className="text-[15px] font-bold whitespace-nowrap text-ink">{t.value}</div>
                {t.note && <div className="text-xs font-medium text-ok-text">{t.note}</div>}
                {t.sub && <div className="text-[10.5px] text-ink-2">{t.sub}</div>}
              </div>
            </div>
            <div className="mt-auto pt-2">
              <Sparkline data={series(seed + 40 + i, 24, 10, 1.6, detail.scoreDelta >= 0 ? 3 : -3)} color={t.color} height={46} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

function PestTable({ hive }: TabProps) {
  const { notify } = useStore()
  return (
    <Card title="Pest & Disease Detection (AI)" info="Based on camera, sound and brood pattern analysis" action={<ViewAll to={`/hives/${hive.id}/ai-insights`} label="View Details" />}>
      <ul className="divide-y divide-line">
        {PESTS.map((p) => (
          <li key={p.name}>
            <button onClick={() => notify(`${p.name}: ${p.level} – ${p.note}`)} className="grid w-full grid-cols-[20px_minmax(0,1.25fr)_auto_minmax(0,1.2fr)_16px] items-center gap-2 py-2 text-left text-xs hover:bg-card-2">
              <Bug size={16} className="text-ink-2" />
              <span className="text-ink">{p.name}</span>
              <span className="w-[104px]">
                <Chip tone="ok">
                  <CircleCheck size={12} /> {p.level}
                </Chip>
              </span>
              <span className="text-[11px] leading-tight text-ink-2">
                {p.note}
                {p.sub && <span className="block">{p.sub}</span>}
              </span>
              <ChevronRight size={15} className="text-ink" />
            </button>
          </li>
        ))}
      </ul>
    </Card>
  )
}

function BroodClimate({ hive }: TabProps) {
  const c = usePalette()
  const seed = seedOf(hive.id)
  return (
    <Card
      title="Brood Temperature & Humidity"
      action={
        <Select aria-label="Time range" defaultValue="7d">
          <option value="7d">Last 7 Days</option>
        </Select>
      }
    >
      <Legend
        className="mb-2"
        items={[
          { label: 'Brood Temperature (°C)', color: c.red },
          { label: 'Brood Humidity (%)', color: c.blue },
        ]}
      />
      <ComboChart
        ariaLabel="Brood nest temperature and humidity over the last seven days"
        labels={LAST_7_DAYS}
        height={140}
        legend={false}
        y={{ min: 30, max: 38, step: 2 }}
        y1={{ min: 30, max: 90, step: 20 }}
        series={[
          { label: 'Brood Temperature', data: series(seed + 61, 7, Math.min(36.6, hive.temp + 0.6), 0.5), color: c.red, points: true, unit: ' °C' },
          { label: 'Brood Humidity', data: series(seed + 62, 7, hive.humidity - 2, 3), color: c.blue, points: true, axis: 'y1', unit: '%' },
        ]}
      />
    </Card>
  )
}

function Timeline() {
  const stages = [
    { image: 'stage-egg.jpg', days: 'Day 1–3', name: 'Eggs' },
    { image: 'stage-larva.jpg', days: 'Day 4–9', name: 'Larva' },
    { image: 'stage-pupa.jpg', days: 'Day 10–20', name: 'Pupa' },
    { image: 'stage-adult.jpg', days: 'Day 21', name: 'Adult Emerges' },
  ]
  return (
    <Card title="Brood Development Timeline">
      <Legend
        className="mb-3 justify-start"
        items={[
          { label: 'Egg', color: '#3b82f6', kind: 'dot' },
          { label: 'Larva', color: '#f5b91f', kind: 'dot' },
          { label: 'Pupa', color: '#22c55e', kind: 'dot' },
          { label: 'Adult', color: '#9ca3af', kind: 'dot' },
        ]}
      />
      <ol className="flex items-start justify-between gap-1">
        {stages.map((s, i) => (
          <li key={s.name} className="flex min-w-0 flex-1 items-start gap-1">
            <div className="min-w-0 flex-1 text-center">
              <img src={img(s.image)} alt="" className="h-[72px] w-full rounded-md object-cover" />
              <div className="mt-1.5 text-[11px] text-ink">{s.days}</div>
              <div className="text-[11px] text-ink-2">{s.name}</div>
            </div>
            {i < stages.length - 1 && <ArrowRight size={16} className="mt-6 shrink-0 text-ink" />}
          </li>
        ))}
      </ol>
      <p className="mt-3 flex items-center gap-2 rounded-lg bg-warn-soft px-3 py-2 text-xs text-ink-2">
        <CircleCheck size={16} className="shrink-0 text-ink" />
        Development timeline is normal for Apis mellifera (21 days).
      </p>
    </Card>
  )
}

export default function Brood(props: TabProps) {
  const [adding, setAdding] = useState(false)
  return (
    <div className="space-y-3">
      <div className="grid gap-3 lg:grid-cols-2 2xl:grid-cols-[1.5fr_0.95fr_1fr]">
        <FrameAnalysis {...props} />
        <FrameDistribution {...props} />
        <QueenHealth {...props} />
      </div>

      <div className="grid gap-3 2xl:grid-cols-[1.85fr_1fr]">
        <StrengthIndicators {...props} />
        <PestTable {...props} />
      </div>

      <div className="grid gap-3 lg:grid-cols-2 2xl:grid-cols-[1.05fr_1fr_0.95fr]">
        <BroodClimate {...props} />
        <Timeline />
        <Card
          title="Recommendations"
          className="lg:col-span-2 2xl:col-span-1"
          action={
            <Button onClick={() => setAdding(true)} className="px-3 py-1.5">
              <Plus size={14} /> Generate Task
            </Button>
          }
        >
          <RecommendationList items={BROOD_RECOMMENDATIONS} />
        </Card>
      </div>
      {adding && <AddTaskModal hiveId={props.hive.id} onClose={() => setAdding(false)} />}
    </div>
  )
}
