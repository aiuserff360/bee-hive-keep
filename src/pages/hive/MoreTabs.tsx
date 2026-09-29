import { useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { AudioLines, Cloud, CloudRain, CloudSun, Droplet, Flower2, Lightbulb, Pin, Sun, Thermometer, Weight, Wind } from 'lucide-react'
import { ActivityIcon, InsightList, LiveImage, RecommendationList } from '../../components/blocks'
import { ComboChart, LevelBars, Ring, Sparkline, usePalette } from '../../components/charts'
import { BeeIcon } from '../../components/icons'
import { Avatar, Bubble, Button, Card, Chip, Meter, Pills, Td, Th, cx, inputClass } from '../../components/ui'
import { ACTIVITY_INSIGHTS, ACTIVITY_LOG, BROOD_RECOMMENDATIONS, HIVE_INSIGHTS } from '../../data/content'
import type { ActivityEntry, Tone } from '../../data/content'
import { LAST_7_DAYS, NOW, SEASON_MONTHS, img, seedOf, series } from '../../data/hives'
import { useStore } from '../../store'
import type { TabProps } from './HiveDetail'

const clock = (d: Date) => d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

function Offline({ what }: { what: string }) {
  return <p className="rounded-xl border border-dashed border-line bg-card p-10 text-center text-sm text-muted">This hive is offline. {what} will return when the sensor unit reconnects.</p>
}

/* ---------- Live Data ---------- */

export function LiveData({ hive, detail }: TabProps) {
  const c = usePalette()
  if (!hive.online) return <Offline what="Live data" />

  const seed = seedOf(hive.id)
  const minutes = Array.from({ length: 13 }, (_, i) => clock(new Date(NOW.getTime() - (12 - i) * 5 * 60000)))
  const temp = series(seed + 201, 13, hive.temp, 0.25)
  const humidity = series(seed + 202, 13, hive.humidity, 1).map(Math.round)
  const weight = series(seed + 203, 13, hive.weight - 0.05, 0.04, 0.05)
  const base = hive.activity === 'High' ? 120 : hive.activity === 'Medium' ? 80 : 35
  const out = series(seed + 204, 13, base, base * 0.15).map(Math.round)
  const back = series(seed + 205, 13, base * 0.94, base * 0.15).map(Math.round)

  const gauges: Array<{ label: string; value: string; icon: ReactNode; data: number[]; color: string; note: string }> = [
    { label: 'Temperature', value: `${hive.temp.toFixed(1)}°C`, icon: <Thermometer size={22} className="text-honey-dark" />, data: temp, color: c.honey, note: 'Range 32–36°C' },
    { label: 'Humidity', value: `${hive.humidity}%`, icon: <Droplet size={22} className="text-info" fill="currentColor" />, data: humidity, color: c.blue, note: 'Range 50–70%' },
    { label: 'Hive Weight', value: `${hive.weight.toFixed(1)} kg`, icon: <Weight size={22} className="text-ink" />, data: weight, color: c.green, note: 'Last 60 minutes' },
    { label: 'Sound / Vibration', value: detail.sound, icon: <AudioLines size={22} className="text-info" />, data: series(seed + 206, 13, 42, 3), color: c.purple, note: detail.soundNote },
  ]

  return (
    <div className="space-y-3">
      <div className="grid gap-3 lg:grid-cols-[1.2fr_1fr]">
        <Card title="Live Hive Camera" action={<span className="text-[11px] text-ink-2">{hive.place} | 23 Sep 2026 10:24 AM</span>}>
          <LiveImage src={img('live-camera.jpg')} alt={`Bees on the comb inside hive ${hive.id}`} caption="Brood box camera" sub="Still image in this prototype" className="h-[300px]" />
        </Card>
        <div className="grid grid-cols-2 gap-3">
          {gauges.map((g) => (
            <div key={g.label} className="flex flex-col rounded-xl border border-line bg-card p-3.5">
              <div className="flex items-center gap-2 text-xs text-ink-2">
                {g.icon} {g.label}
              </div>
              <div className="mt-1.5 text-2xl font-bold text-ink">{g.value}</div>
              <div className="text-[11px] text-muted">{g.note}</div>
              <div className="mt-auto pt-2">
                <Sparkline data={g.data} color={g.color} height={44} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-[1.2fr_1fr]">
        <Card title="Entrance Traffic" info="Bees counted at the entrance in each 5-minute window">
          <ComboChart
            ariaLabel="Bees leaving and returning in the last hour"
            labels={minutes}
            height={220}
            y={{ min: 0, title: 'Bees per 5 min' }}
            series={[
              { label: 'Leaving', data: out, color: c.honey, type: 'bar' },
              { label: 'Returning', data: back, color: c.blue, type: 'bar' },
            ]}
          />
        </Card>
        <Card title="Latest Readings" action={<Chip tone="ok">Updating every 5 min</Chip>}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[360px] text-xs">
              <thead className="bg-card-2 text-ink-2">
                <tr>
                  <Th>Time</Th>
                  <Th>Temp</Th>
                  <Th>Humidity</Th>
                  <Th>Weight</Th>
                  <Th>Bees out</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line tabular-nums">
                {minutes
                  .map((m, i) => ({ m, i }))
                  .reverse()
                  .slice(0, 7)
                  .map(({ m, i }) => (
                    <tr key={m}>
                      <Td className="py-2 whitespace-nowrap">{m}</Td>
                      <Td className="py-2">{temp[i].toFixed(1)}°C</Td>
                      <Td className="py-2">{humidity[i]}%</Td>
                      <Td className="py-2">{weight[i].toFixed(1)} kg</Td>
                      <Td className="py-2">{out[i]}</Td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}

/* ---------- Environment ---------- */

const FORECAST: Array<{ day: string; icon: ReactNode; text: string; high: number; low: number; rain: number }> = [
  { day: 'Today', icon: <CloudSun size={26} className="text-honey-dark" />, text: 'Partly cloudy', high: 28, low: 20, rain: 10 },
  { day: 'Thu', icon: <Sun size={26} className="text-honey-dark" />, text: 'Sunny', high: 30, low: 20, rain: 5 },
  { day: 'Fri', icon: <Sun size={26} className="text-honey-dark" />, text: 'Sunny', high: 31, low: 21, rain: 5 },
  { day: 'Sat', icon: <Cloud size={26} className="text-muted" />, text: 'Cloudy', high: 28, low: 21, rain: 40 },
  { day: 'Sun', icon: <CloudRain size={26} className="text-info" />, text: 'Rain', high: 26, low: 20, rain: 80 },
  { day: 'Mon', icon: <CloudRain size={26} className="text-info" />, text: 'Showers', high: 26, low: 19, rain: 60 },
  { day: 'Tue', icon: <CloudSun size={26} className="text-honey-dark" />, text: 'Partly cloudy', high: 28, low: 20, rain: 20 },
]

const BLOOM: Array<{ plant: string; months: number[] }> = [
  { plant: 'Eucalyptus', months: [8, 9, 10, 11, 0] },
  { plant: 'Neem', months: [2, 3, 4] },
  { plant: 'Acacia', months: [6, 7, 8, 9] },
  { plant: 'Sunflower', months: [7, 8, 9] },
  { plant: 'Mango', months: [0, 1, 2] },
  { plant: 'Coconut', months: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] },
]
const MONTH_LETTERS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D']

export function Environment({ hive }: TabProps) {
  const c = usePalette()
  const seed = seedOf(hive.id)
  const now = [
    { icon: <Thermometer size={24} className="text-crit" />, value: '28°C', label: 'Air Temperature' },
    { icon: <Droplet size={24} className="text-info" fill="currentColor" />, value: '62%', label: 'Air Humidity' },
    { icon: <Wind size={24} className="text-info" />, value: '6 km/h', label: 'Wind Speed' },
    { icon: <CloudRain size={24} className="text-info" />, value: '2 mm', label: 'Rain (24 h)' },
    { icon: <Sun size={24} className="text-honey-dark" />, value: '7 of 11', label: 'UV Index' },
    { icon: <Flower2 size={24} className="text-honey-dark" />, value: 'High', label: 'Floral Activity' },
  ]
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 2xl:grid-cols-6">
        {now.map((s) => (
          <div key={s.label} className="flex items-center gap-3 rounded-xl border border-line bg-card px-3.5 py-3">
            {s.icon}
            <span className="leading-tight">
              <b className="block text-lg text-ink">{s.value}</b>
              <span className="text-[11px] text-ink-2">{s.label}</span>
            </span>
          </div>
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-[1.2fr_1fr]">
        <Card title="Hive and Outside Temperature" info="Bees hold the brood area near 34°C whatever the weather">
          <ComboChart
            ariaLabel="Brood temperature compared with outside air temperature over seven days"
            labels={LAST_7_DAYS}
            height={230}
            y={{ min: 15, max: 40, step: 5, suffix: '°' }}
            series={[
              { label: 'Inside Hive (°C)', data: series(seed + 301, 7, hive.temp, 0.6), color: c.honey, points: true, unit: ' °C' },
              { label: 'Outside Air (°C)', data: series(seed + 302, 7, 27, 2.5), color: c.blue, points: true, unit: ' °C' },
            ]}
          />
        </Card>
        <Card title="7-Day Forecast" info={`Weather for ${hive.place}`}>
          <ul className="divide-y divide-line">
            {FORECAST.map((f) => (
              <li key={f.day} className="grid grid-cols-[48px_30px_minmax(0,1fr)_70px_64px] items-center gap-2 py-1.5 text-xs">
                <b className="text-ink">{f.day}</b>
                {f.icon}
                <span className="text-ink-2">{f.text}</span>
                <span className="text-ink tabular-nums">
                  <b>{f.high}°</b> / {f.low}°
                </span>
                <span className={cx('flex items-center justify-end gap-1 tabular-nums', f.rain >= 60 ? 'font-semibold text-link' : 'text-muted')}>
                  <Droplet size={12} /> {f.rain}%
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-2 rounded-lg bg-warn-soft px-3 py-2 text-xs text-ink-2">
            <b className="text-ink">Rain from Sunday.</b> Foraging will drop. Check ventilation and food stores before the weekend.
          </p>
        </Card>
      </div>

      <div className="grid gap-3 lg:grid-cols-[1.2fr_1fr]">
        <Card title="Forage Calendar" info="Months in which each plant flowers near this apiary">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] border-separate border-spacing-y-1.5 text-xs">
              <thead>
                <tr className="text-muted">
                  <th className="w-[110px] text-left font-medium">Plant</th>
                  {MONTH_LETTERS.map((m, i) => (
                    <th key={i} className={cx('font-medium', i === NOW.getMonth() && 'font-bold text-ink')}>
                      {m}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {BLOOM.map((b) => (
                  <tr key={b.plant}>
                    <td className="text-ink">{b.plant}</td>
                    {MONTH_LETTERS.map((_, i) => (
                      <td key={i} className="px-px">
                        <span
                          className={cx('block h-4 rounded-sm', b.months.includes(i) ? 'bg-honey' : 'bg-card-2', i === NOW.getMonth() && 'ring-1 ring-ink')}
                          title={`${b.plant}: ${b.months.includes(i) ? 'in flower' : 'not in flower'}`}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-[11px] text-muted">The outlined column is the current month.</p>
        </Card>
        <Card title="Around the Apiary">
          <div className="grid grid-cols-2 gap-2.5">
            <img src={img('landscape-flowers.jpg')} alt="Flowering fields near the hive" className="h-[150px] w-full rounded-lg object-cover" />
            <img src={img('forage.jpg')} alt="Trees in blossom near the hive" className="h-[150px] w-full rounded-lg object-cover" />
          </div>
          <dl className="mt-3 grid grid-cols-3 gap-2 text-xs">
            {[
              ['Nearest water', '350 m'],
              ['Forage within 1 km', 'Good'],
              ['Pesticide risk', 'Low'],
            ].map(([k, v]) => (
              <div key={k} className="rounded-lg bg-card-2 p-2.5">
                <dt className="text-[11px] text-ink-2">{k}</dt>
                <dd className="font-semibold text-ink">{v}</dd>
              </div>
            ))}
          </dl>
        </Card>
      </div>
    </div>
  )
}

/* ---------- History ---------- */

type Kind = 'all' | 'inspection' | 'harvest' | 'alert' | 'change'

interface Event {
  date: string
  kind: Exclude<Kind, 'all'>
  title: string
  detail: string
  by: string
  tone: Tone
  icon: ActivityEntry['icon'] | 'alert'
}

export function History({ hive, detail }: TabProps) {
  const c = usePalette()
  const [kind, setKind] = useState<Kind>('all')

  const kindOf = (a: ActivityEntry): Event['kind'] => (a.icon === 'temp' ? 'alert' : a.icon === 'box' ? 'change' : 'inspection')
  const events: Event[] = [
    ...ACTIVITY_LOG.map((a) => ({ date: a.date, kind: kindOf(a), title: a.title, detail: a.detail, by: a.by, tone: a.tone, icon: a.icon })),
    ...detail.harvests.map((h) => ({ date: `${h.date}, 08:30`, kind: 'harvest' as const, title: `Honey harvest: ${h.kg.toFixed(1)} kg`, detail: `${h.method}. ${h.notes}.`, by: hive.owner, tone: 'warn' as Tone, icon: 'drop' as const })),
    { date: '02 Jun 2026, 10:00', kind: 'change', title: 'Sensor unit replaced', detail: 'New solar sensor unit fitted and calibrated.', by: 'Sensor Support', tone: 'info', icon: 'scan' },
    { date: `01 ${detail.established}, 09:00`, kind: 'change', title: 'Hive established', detail: `${detail.type} hive set up with a ${detail.species} colony.`, by: hive.owner, tone: 'ok', icon: 'bee' },
  ]
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const stamp = (text: string) => {
    const [d, m, y] = text.split(',')[0].split(' ')
    return Number(y) * 10000 + months.indexOf(m) * 100 + Number(d)
  }
  events.sort((a, b) => stamp(b.date) - stamp(a.date))
  const shown = events.filter((e) => kind === 'all' || e.kind === kind)
  const count = (k: Event['kind']) => events.filter((e) => e.kind === k).length
  const running = detail.monthlyHoney.map((_, i) => Math.round(detail.monthlyHoney.slice(0, i + 1).reduce((a, b) => a + b, 0) * 10) / 10)

  return (
    <div className="grid items-start gap-3 lg:grid-cols-[1.4fr_1fr]">
      <Card title="Hive Timeline">
        <div className="mb-4">
          <Pills
            label="Filter history"
            value={kind}
            onChange={setKind}
            options={[
              { id: 'all', label: 'All', count: events.length },
              { id: 'inspection', label: 'Inspections', count: count('inspection') },
              { id: 'harvest', label: 'Harvests', count: count('harvest') },
              { id: 'alert', label: 'Alerts', count: count('alert') },
              { id: 'change', label: 'Changes', count: count('change') },
            ]}
          />
        </div>
        <ol className="relative">
          <span className="absolute top-4 bottom-6 left-4 w-px bg-line" aria-hidden="true" />
          {shown.map((e) => (
            <li key={e.date + e.title} className="relative flex gap-3.5 pb-4 last:pb-0">
              <Bubble tone={e.tone} size={33}>
                <ActivityIcon name={e.icon} size={16} />
              </Bubble>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap justify-between gap-x-3 text-[11px] text-ink-2">
                  <span className="tabular-nums">{e.date}</span>
                  <span>{e.by}</span>
                </div>
                <div className="text-[13px] font-semibold text-ink">{e.title}</div>
                <div className="text-xs text-ink-2">{e.detail}</div>
              </div>
            </li>
          ))}
        </ol>
      </Card>

      <div className="space-y-3">
        <Card title="Season at a Glance">
          <dl className="grid grid-cols-2 gap-2 text-xs">
            {[
              ['Established', detail.established],
              ['Inspections this season', '14'],
              ['Harvests this season', String(detail.harvests.length)],
              ['Honey collected', `${detail.honeyTotal.toFixed(1)} kg`],
              ['Alerts raised', hive.health === 'healthy' ? '3' : '11'],
              ['Queen', 'Introduced Jan 2026'],
            ].map(([k, v]) => (
              <div key={k} className="rounded-lg bg-card-2 p-2.5">
                <dt className="text-[11px] text-ink-2">{k}</dt>
                <dd className="text-sm font-semibold text-ink">{v}</dd>
              </div>
            ))}
          </dl>
        </Card>
        <Card title="Honey Collected This Season" info="Running total after each month">
          <ComboChart
            ariaLabel="Running total of honey collected from this hive"
            labels={SEASON_MONTHS}
            height={200}
            legend={false}
            y={{ min: 0, title: 'Honey (kg)' }}
            series={[{ label: 'Collected so far', data: running, color: c.honey, fill: 'origin', points: true, unit: ' kg' }]}
          />
        </Card>
      </div>
    </div>
  )
}

/* ---------- AI Insights ---------- */

export function HiveInsights({ hive, detail }: TabProps) {
  const c = usePalette()
  const seed = seedOf(hive.id)
  const weeks = Array.from({ length: 12 }, (_, i) => `Wk ${i + 1}`)
  const scores = series(seed + 401, 12, detail.healthScore - detail.scoreDelta, 2, detail.scoreDelta).map((v, i) => (i === 11 ? detail.healthScore : Math.round(Math.min(99, Math.max(10, v)))))
  const level = hive.health === 'healthy' ? 0 : hive.health === 'attention' ? 1 : 2
  const risks = [
    { name: 'Swarming', value: [18, 56, 34][level] },
    { name: 'Disease and pests', value: [12, 30, 62][level] },
    { name: 'Food shortage', value: [15, 38, 78][level] },
    { name: 'Queen failure', value: [8, 26, 66][level] },
    { name: 'Heat stress', value: [22, 61, 84][level] },
  ]
  const riskColor = (v: number) => (v >= 60 ? '#e5484d' : v >= 35 ? '#e3a008' : '#16a34a')
  const scoreColor = detail.healthScore >= 75 ? '#16a34a' : detail.healthScore >= 55 ? '#e3a008' : '#e5484d'

  return (
    <div className="space-y-3">
      <div className="grid gap-3 lg:grid-cols-[0.8fr_1.3fr_1fr]">
        <Card title="Colony Health Score" bodyClassName="grid content-center justify-items-center gap-2 text-center">
          <Ring value={detail.healthScore} size={128} color={scoreColor} />
          <p className={cx('text-sm font-semibold', detail.scoreDelta >= 0 ? 'text-ok-text' : 'text-crit-text')}>
            {detail.scoreDelta >= 0 ? '↑ +' : '↓ '}
            {detail.scoreDelta} <span className="font-normal text-ink-2">vs last week</span>
          </p>
          <p className="max-w-[220px] text-xs text-ink-2">Built from brood pattern, weight trend, sound, temperature stability and foraging activity.</p>
        </Card>
        <Card title="Health Score Trend" info="Weekly score over the last 12 weeks">
          <ComboChart
            ariaLabel="Colony health score over the last twelve weeks"
            labels={weeks}
            height={210}
            legend={false}
            y={{ min: 0, max: 100, step: 20 }}
            series={[{ label: 'Health score', data: scores, color: c.green, fill: 'origin', points: true }]}
          />
        </Card>
        <Card title="Risk Outlook (Next 14 Days)" info="Likelihood estimated by the models, from 0 to 100">
          <ul className="space-y-4 pt-1">
            {risks.map((r) => (
              <li key={r.name} className="grid grid-cols-[minmax(0,1.1fr)_36px_minmax(0,1.4fr)] items-center gap-2 text-xs">
                <span className="text-ink">{r.name}</span>
                <b className="text-ink tabular-nums">{r.value}%</b>
                <Meter value={r.value} color={riskColor(r.value)} />
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Card title="What the Models See" icon={<Lightbulb size={18} className="text-honey-dark" />}>
          <InsightList items={[...HIVE_INSIGHTS, ...ACTIVITY_INSIGHTS.slice(0, 3)]} />
        </Card>
        <Card title="Recommended Actions">
          <RecommendationList items={BROOD_RECOMMENDATIONS} />
          <p className="mt-3 rounded-lg bg-info-soft px-3 py-2 text-xs text-ink-2">
            <b className="text-ink">How to read this.</b> Insights come from sensor and camera data. They support the keeper’s judgement and do not replace an inspection.
          </p>
        </Card>
      </div>
    </div>
  )
}

/* ---------- Notes ---------- */

interface Note {
  id: number
  author: string
  when: string
  text: string
  photos?: string[]
  pinned?: boolean
}

export function Notes({ hive, detail }: TabProps) {
  const { notify } = useStore()
  const [text, setText] = useState('')
  const [notes, setNotes] = useState<Note[]>([
    { id: 1, author: hive.owner, when: '20 Sep 2026, 09:10', text: `${detail.notes} Queen seen. Added one super. Good nectar flow in the area.`, photos: ['note-1.jpg', 'note-2.jpg', 'note-3.jpg'], pinned: true },
    { id: 2, author: 'Field Team', when: '15 Sep 2026, 08:45', text: 'Added one medium super. Frames 3 to 7 fully drawn. Entrance clear.' },
    { id: 3, author: hive.owner, when: '12 Sep 2026, 14:20', text: 'Varroa check by sugar roll: 1 mite per 100 bees. Below threshold, no treatment needed.', photos: ['activity-varroa.jpg'] },
    { id: 4, author: 'Sensor Support', when: '02 Jun 2026, 10:00', text: 'Replaced the sensor unit. Weight scale re-zeroed with an empty super.' },
  ])

  const add = (e: FormEvent) => {
    e.preventDefault()
    const body = text.trim()
    if (!body) return
    setNotes((list) => [{ id: Date.now(), author: 'Karan Kamal', when: '23 Sep 2026, 10:24', text: body }, ...list])
    setText('')
    notify('Note added (kept until you leave this page)')
  }
  const togglePin = (id: number) => setNotes((list) => list.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n)))
  const ordered = [...notes].sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)))

  return (
    <div className="grid items-start gap-3 lg:grid-cols-[1.5fr_1fr]">
      <Card title={`Field Notes (${notes.length})`}>
        <ul className="space-y-3">
          {ordered.map((n) => (
            <li key={n.id} className={cx('flex gap-3 rounded-lg border p-3', n.pinned ? 'border-honey bg-warn-soft' : 'border-line')}>
              <Avatar name={n.author} size={36} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 text-xs text-ink-2">
                  <b className="text-ink">{n.author}</b> {n.when}
                  {n.pinned && <Chip tone="warn">Pinned</Chip>}
                  <button onClick={() => togglePin(n.id)} aria-label={n.pinned ? 'Unpin note' : 'Pin note'} aria-pressed={Boolean(n.pinned)} className={cx('ml-auto rounded p-1 hover:bg-card-2', n.pinned ? 'text-honey-dark' : 'text-muted')}>
                    <Pin size={15} />
                  </button>
                </div>
                <p className="mt-1 text-[13px] leading-relaxed text-ink-2">{n.text}</p>
                {n.photos && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {n.photos.map((p) => (
                      <img key={p} src={img(p)} alt="Photo attached to the note" loading="lazy" className="h-[84px] w-[120px] rounded-md object-cover" />
                    ))}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <div className="space-y-3">
        <Card title="Add a Note">
          <form onSubmit={add}>
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={5} required placeholder="What did you see at the hive?" aria-label="Note text" className={inputClass} />
            <div className="mt-3 flex items-center justify-between gap-2">
              <span className="text-[11px] text-muted">Posting as Karan Kamal</span>
              <Button type="submit">Add Note</Button>
            </div>
          </form>
        </Card>
        <Card title="Hive Facts">
          <dl className="divide-y divide-line text-xs">
            {[
              ['Hive type', detail.type],
              ['Bee species', detail.species],
              ['Established', detail.established],
              ['Apiary', hive.apiary],
              ['Field owner', hive.owner],
              ['Coordinates', detail.coords],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3 py-2">
                <dt className="text-ink-2">{k}</dt>
                <dd className="text-right font-semibold text-ink">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-2 flex items-center gap-2 text-xs text-ink-2">
            <BeeIcon size={16} className="text-ink" /> Bee activity now: <b className="text-ink">{hive.online ? hive.activity : 'Offline'}</b>
            {hive.online && <LevelBars level={hive.activity} />}
          </div>
        </Card>
      </div>
    </div>
  )
}
