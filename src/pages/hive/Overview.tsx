import { useState } from 'react'
import type { ReactNode } from 'react'
import { AudioLines, BatteryFull, Check, ChevronRight, CircleCheck, Droplet, Flower2, Lightbulb, Plus, Thermometer, Weight, Wifi, WifiOff, Wind } from 'lucide-react'
import { InsightList, LiveImage } from '../../components/blocks'
import { ComboChart, LevelBars, usePalette } from '../../components/charts'
import { BeeIcon, CombIcon } from '../../components/icons'
import { AddTaskModal } from '../../components/TaskForm'
import { Button, Card, Chip, Select, ViewAll, cx } from '../../components/ui'
import { HIVE_INSIGHTS, RECENT_ACTIVITY_TABLE } from '../../data/content'
import type { Tone } from '../../data/content'
import { RANGE_LABEL, SEASON_MONTHS, dayMonthYear, fromIso, img, rangeLabels, seedOf, series } from '../../data/hives'
import type { Range } from '../../data/hives'
import { useHiveTasks, useStore } from '../../store'
import type { TabProps } from './HiveDetail'

/* ---------- Sensor tiles ---------- */

function SensorTile({ icon, label, value, chip, note, extra }: { icon: ReactNode; label: string; value: string; chip?: { tone: Tone; text: string }; note?: ReactNode; extra?: ReactNode }) {
  return (
    <div className="flex min-w-0 gap-2.5 rounded-xl border border-line bg-card px-3 py-3">
      <span className="mt-0.5 shrink-0">{icon}</span>
      <div className="min-w-0">
        <div className="text-xs whitespace-nowrap text-ink-2">{label}</div>
        <div className="mt-1 flex flex-wrap items-center gap-x-1.5">
          <span className="text-lg font-bold whitespace-nowrap text-ink">{value}</span>
          {chip && <Chip tone={chip.tone}>{chip.text}</Chip>}
          {extra}
        </div>
        {note && <div className="mt-1 text-[11px] text-ink-2">{note}</div>}
      </div>
    </div>
  )
}

function SensorRow({ hive, detail }: TabProps) {
  const off = !hive.online
  const tempChip: { tone: Tone; text: string } = hive.temp > 36.5 ? { tone: 'crit', text: 'High' } : hive.temp > 35.5 ? { tone: 'warn', text: 'Watch' } : { tone: 'ok', text: 'Optimal' }
  const humChip: { tone: Tone; text: string } = hive.humidity > 66 ? { tone: 'crit', text: 'High' } : hive.humidity > 62 ? { tone: 'warn', text: 'Watch' } : { tone: 'ok', text: 'Optimal' }
  return (
    <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4 2xl:grid-cols-7">
      <SensorTile icon={<Thermometer size={26} className="text-honey-dark" />} label="Temperature" value={off ? '—' : `${hive.temp.toFixed(1)}°C`} chip={off ? undefined : tempChip} note="Range: 32–36°C" />
      <SensorTile icon={<Droplet size={26} className="text-info" fill="currentColor" />} label="Humidity" value={off ? '—' : `${hive.humidity}%`} chip={off ? undefined : humChip} note="Range: 50–70%" />
      <SensorTile
        icon={<Weight size={28} className="text-ink" />}
        label="Hive Weight"
        value={off ? '—' : `${hive.weight.toFixed(1)} kg`}
        note={
          !off && (
            <b className={hive.weightDelta >= 0 ? 'text-ok-text' : 'text-crit-text'}>
              {hive.weightDelta >= 0 ? '▲ +' : '▼ '}
              {hive.weightDelta.toFixed(1)} kg (7d)
            </b>
          )
        }
      />
      <SensorTile icon={<BeeIcon size={28} className="text-ink" />} label="Bee Activity" value={off ? '—' : hive.activity} extra={!off && <LevelBars level={hive.activity} />} note={off ? 'No data' : hive.activity === 'High' ? 'Foraging normally' : hive.activity === 'Medium' ? 'Foraging steadily' : 'Little foraging'} />
      <SensorTile icon={<AudioLines size={28} className="text-info" />} label="Sound / Vibration" value={off ? '—' : detail.sound} note={detail.soundNote} />
      <SensorTile icon={<BatteryFull size={28} className={hive.battery < 30 ? 'text-crit' : 'text-ok'} />} label="Battery" value={`${hive.battery}%`} note={`~ ${detail.batteryDays} days`} />
      <SensorTile icon={off ? <WifiOff size={28} className="text-muted" /> : <Wifi size={28} className="text-ok" />} label="Connectivity" value={off ? 'Offline' : 'Online'} note={off ? `Last seen ${hive.lastUpdate}` : 'Strong signal'} />
    </div>
  )
}

/* ---------- Internal hive schematic ---------- */

const LAYERS: Array<{ name: string; status: string; tone: Tone; link?: boolean }> = [
  { name: 'Roof', status: 'Clean & Dry', tone: 'ok' },
  { name: 'Super (Honey)', status: '60% Filled', tone: 'warn', link: true },
  { name: 'Brood Box 2', status: 'Active Brood', tone: 'ok' },
  { name: 'Brood Box 1', status: 'Queen Present', tone: 'ok' },
  { name: 'Bottom Board', status: 'Normal', tone: 'ok' },
]

function HiveDrawing() {
  // Five stacked layers, each 38 units tall, so the drawing lines up with the rows beside it.
  return (
    <svg viewBox="0 0 150 190" className="h-[190px] w-[150px] shrink-0" role="img" aria-label="Cut-away drawing of the hive layers">
      <defs>
        <pattern id="comb-honey" width="12" height="10.4" patternUnits="userSpaceOnUse">
          <rect width="12" height="10.4" fill="#f5b829" />
          <path d="M3 0l3 0 3 5.2-3 5.2-3 0-3-5.2z M9 5.2l3 0 M0 5.2l0 0" fill="#fcd463" stroke="#b97b0a" strokeWidth="0.9" />
        </pattern>
        <pattern id="comb-brood" width="12" height="10.4" patternUnits="userSpaceOnUse">
          <rect width="12" height="10.4" fill="#b7701c" />
          <path d="M3 0l3 0 3 5.2-3 5.2-3 0-3-5.2z" fill="#d99a3c" stroke="#6f3f0c" strokeWidth="0.9" />
        </pattern>
        <linearGradient id="wood" x1="0" x2="1">
          <stop offset="0" stopColor="#c98a3e" />
          <stop offset="1" stopColor="#a96a25" />
        </linearGradient>
      </defs>
      {/* roof */}
      <path d="M6 30 L20 6 H130 L144 30 Z" fill="#9aa5b1" />
      <path d="M20 6 H130 L126 14 H24 Z" fill="#c5ccd4" />
      <rect x="4" y="28" width="142" height="8" rx="1.5" fill="#6d7a88" />
      {/* boxes */}
      {[
        { y: 38, fill: 'url(#comb-honey)' },
        { y: 76, fill: 'url(#comb-brood)' },
        { y: 114, fill: 'url(#comb-brood)' },
      ].map((box) => (
        <g key={box.y}>
          <rect x="12" y={box.y} width="126" height="36" rx="2" fill="url(#wood)" stroke="#7a4a16" />
          <rect x="22" y={box.y + 5} width="106" height="26" rx="1.5" fill={box.fill} stroke="#5d380f" />
        </g>
      ))}
      {/* bottom board */}
      <rect x="8" y="152" width="134" height="12" rx="2" fill="#a96a25" stroke="#7a4a16" />
      <rect x="54" y="155" width="42" height="5" rx="1" fill="#2b1a08" />
      <path d="M18 164 h16 l-3 22 h-10z M116 164 h16 l-3 22 h-10z" fill="#8a5620" />
    </svg>
  )
}

function Schematic() {
  const { notify } = useStore()
  return (
    <Card title="Internal Hive View (Schematic)">
      <div className="flex items-stretch justify-between gap-2">
        <ul className="flex h-[190px] flex-col text-xs text-ink">
          {LAYERS.map((l) => (
            <li key={l.name} className="flex flex-1 items-center border-b border-line last:border-0">
              {l.name}
            </li>
          ))}
        </ul>
        <HiveDrawing />
        <ul className="flex h-[190px] min-w-[112px] flex-col">
          {LAYERS.map((l) => (
            <li key={l.name} className="flex flex-1 items-center justify-between gap-1 border-b border-line last:border-0">
              <Chip tone={l.tone}>
                <CircleCheck size={12} /> {l.status}
              </Chip>
              {l.link && (
                <button onClick={() => notify('Super is 60% filled – consider adding a second super soon')} aria-label="Super details" className="rounded p-0.5 text-ink hover:bg-card-2">
                  <ChevronRight size={16} />
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </Card>
  )
}

/* ---------- Cards ---------- */

function BroodPattern() {
  const parts = [
    { label: 'Brood (sealed)', value: 68, color: '#f97316' },
    { label: 'Brood (open)', value: 12, color: '#f5b91f' },
    { label: 'Honey', value: 15, color: '#fcd34d' },
    { label: 'Pollen', value: 5, color: '#a855f7' },
  ]
  return (
    <Card title="Brood Pattern (AI Analysis)" icon={<CombIcon size={18} className="text-honey" />}>
      <div className="flex gap-4">
        <img src={img('brood-comb.jpg')} alt="Brood frame photographed for analysis" className="h-[118px] w-1/2 rounded-lg object-cover" />
        <ul className="flex flex-1 flex-col justify-between py-1 text-xs">
          {parts.map((p) => (
            <li key={p.label} className="flex items-center gap-2.5 text-ink">
              <span className="h-3 w-3 rounded-full" style={{ background: p.color }} />
              <span className="flex-1">{p.label}</span>
              <b>{p.value}%</b>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-3 flex items-center gap-3 rounded-lg bg-ok-soft px-3 py-2">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-ok text-white">
          <Check size={16} strokeWidth={3} />
        </span>
        <p className="text-xs text-ink-2">
          <b className="block text-[13px] text-ok-text">Healthy brood pattern</b>
          Good coverage and density. No visible anomalies.
        </p>
      </div>
    </Card>
  )
}

function SensorTrends({ hive }: TabProps) {
  const [range, setRange] = useState<Range>('7d')
  const c = usePalette()
  const labels = rangeLabels(range)
  const n = labels.length
  const seed = seedOf(hive.id)
  const activityIndex = hive.activity === 'High' ? 24 : hive.activity === 'Medium' ? 18 : 12
  return (
    <Card
      title={`Sensor Trends (${RANGE_LABEL[range]})`}
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
        ariaLabel="Hive sensor readings over time"
        labels={labels}
        height={150}
        y={{ min: 10, max: 70, step: 10 }}
        series={[
          { label: 'Temperature (°C)', data: series(seed + n, n, hive.temp, 1.2), color: c.honey, points: n <= 7, unit: ' °C' },
          { label: 'Humidity (%)', data: series(seed + 3 + n, n, hive.humidity, 2.5), color: c.blue, points: n <= 7, unit: '%' },
          { label: 'Weight (kg)', data: series(seed + 5 + n, n, hive.weight - 1, 0.7, 1.2), color: c.green, points: n <= 7, unit: ' kg' },
          { label: 'Bee Activity (index)', data: series(seed + 7 + n, n, activityIndex, 2.2), color: c.purple, points: n <= 7 },
        ]}
      />
    </Card>
  )
}

function HoneyCard({ detail }: TabProps) {
  const c = usePalette()
  const up = detail.honeyDelta >= 0
  return (
    <Card
      title="Honey Production"
      action={
        <Select aria-label="Season" defaultValue="this">
          <option value="this">This Season</option>
        </Select>
      }
    >
      <div className="flex items-baseline gap-3">
        <span className="text-2xl font-bold text-ink">{detail.honeyTotal.toFixed(1)} kg</span>
        <span className="text-[11px] leading-tight text-ink-2">
          Total Collected
          <b className={cx('block text-xs', up ? 'text-ok-text' : 'text-crit-text')}>
            {up ? '▲ +' : '▼ '}
            {detail.honeyDelta}% <span className="font-normal text-ink-2">vs last season</span>
          </b>
        </span>
      </div>
      <ComboChart
        ariaLabel="Honey collected from this hive per month"
        labels={SEASON_MONTHS}
        height={126}
        y={{ min: 0, max: 6, step: 2 }}
        series={[{ label: 'Honey (kg)', data: detail.monthlyHoney, color: c.honey, type: 'bar', unit: ' kg' }]}
      />
    </Card>
  )
}

function TasksCard({ hive }: TabProps) {
  const { toggleTask } = useStore()
  const [adding, setAdding] = useState(false)
  const mine = useHiveTasks(hive.id).slice(0, 5)
  return (
    <Card
      title="Tasks & Next Steps"
      action={
        <Button onClick={() => setAdding(true)} className="px-3 py-1.5">
          <Plus size={14} /> Add Task
        </Button>
      }
    >
      <ul className="divide-y divide-line">
        {mine.map((t) => {
          const done = t.state === 'Done'
          return (
            <li key={t.id}>
              <label className="flex cursor-pointer items-center gap-3 py-2 text-xs hover:bg-card-2">
                <input type="checkbox" checked={done} onChange={() => toggleTask(t.id)} className="h-4 w-4 shrink-0 rounded accent-[#16a34a]" />
                <span className={cx('min-w-0 flex-1 truncate text-ink', done && 'text-muted line-through')}>{t.title}</span>
                <span className="shrink-0 text-crit-text">{dayMonthYear(fromIso(t.due))}</span>
                <span className="hidden w-[76px] shrink-0 text-ink-2 sm:block">{t.assignee}</span>
              </label>
            </li>
          )
        })}
      </ul>
      {adding && <AddTaskModal hiveId={hive.id} onClose={() => setAdding(false)} />}
    </Card>
  )
}

function EnvironmentCard() {
  const stats = [
    { icon: <Thermometer size={22} className="text-crit" />, value: '28°C', label: 'Air Temperature' },
    { icon: <Droplet size={22} className="text-info" fill="currentColor" />, value: '62%', label: 'Air Humidity' },
    { icon: <Flower2 size={22} className="text-honey-dark" />, value: 'High', label: 'Floral Activity' },
    { icon: <Wind size={22} className="text-info" />, value: '6 km/h', label: 'Wind Speed' },
  ]
  return (
    <Card title="Environment at Hive Location" className="lg:col-span-2 2xl:col-span-1">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="flex items-center gap-1.5">
            <span className="shrink-0">{s.icon}</span>
            <span className="leading-tight whitespace-nowrap">
              <b className="block text-sm text-ink">{s.value}</b>
              <span className="text-[10px] text-ink-2">{s.label}</span>
            </span>
          </div>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-[1.6fr_1fr] gap-2">
        <img src={img('landscape-flowers.jpg')} alt="Flowering fields near the hive" className="h-[92px] w-full rounded-lg object-cover" />
        <div className="relative overflow-hidden rounded-lg">
          <img src={img('forage.jpg')} alt="Forage plants near the hive" className="h-[92px] w-full object-cover" />
          <div className="absolute inset-x-0 bottom-0 flex items-center gap-1.5 bg-white/92 px-2 py-1">
            <CircleCheck size={18} className="shrink-0 text-ok" />
            <span className="text-[10px] leading-tight text-[#33445a]">
              <b className="block text-[#0f2137]">Good forage conditions</b>
              Diverse floral sources in the area.
            </span>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default function Overview(props: TabProps) {
  const { hive } = props
  return (
    <div className="space-y-3">
      <SensorRow {...props} />

      <div className="grid gap-3 lg:grid-cols-2 2xl:grid-cols-[1.25fr_1fr_1fr]">
        <Card title="Live Hive Camera" action={<span className="text-[11px] text-ink-2">{hive.place} | 23 Sep 2026 10:24 AM</span>} className="lg:col-span-2 2xl:col-span-1">
          {hive.online ? (
            <LiveImage src={img('live-camera.jpg')} alt={`Bees on the comb inside hive ${hive.id}`} className="h-[190px]" />
          ) : (
            <div className="grid h-[190px] place-items-center rounded-lg bg-card-2 text-sm text-muted">Camera offline</div>
          )}
        </Card>
        <Schematic />
        <BroodPattern />
      </div>

      <div className="grid gap-3 lg:grid-cols-2 2xl:grid-cols-[1.25fr_0.85fr_1.05fr]">
        <SensorTrends {...props} />
        <HoneyCard {...props} />
        <Card title="AI Insights" icon={<Lightbulb size={18} className="text-honey-dark" />} action={<ViewAll to={`/hives/${hive.id}/ai-insights`} />} className="lg:col-span-2 2xl:col-span-1">
          <InsightList items={HIVE_INSIGHTS} />
        </Card>
      </div>

      <div className="grid gap-3 lg:grid-cols-2 2xl:grid-cols-[1.15fr_0.95fr_1.05fr]">
        <Card title="Recent Activity" action={<ViewAll to={`/hives/${hive.id}/activity`} />}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-xs">
              <thead className="bg-card-2 text-ink-2">
                <tr>
                  {['Date & Time', 'Activity', 'By', 'Notes'].map((h) => (
                    <th key={h} className="px-2 py-1.5 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-ink">
                {RECENT_ACTIVITY_TABLE.map((r) => (
                  <tr key={r.date}>
                    <td className="px-2 py-1.5 whitespace-nowrap tabular-nums">{r.date}</td>
                    <td className="px-2 py-1.5">{r.activity}</td>
                    <td className="px-2 py-1.5 whitespace-nowrap">{r.by}</td>
                    <td className="px-2 py-1.5">{r.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <TasksCard {...props} />
        <EnvironmentCard />
      </div>
    </div>
  )
}
