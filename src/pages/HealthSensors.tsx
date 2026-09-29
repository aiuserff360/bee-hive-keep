import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BatteryLow, Clock, Droplet, Thermometer, Wifi, WifiOff } from 'lucide-react'
import { ComboChart, usePalette } from '../components/charts'
import { Card, Chip, PageHeader, Pills, Select, StatTile, StatusLabel, Td, Th } from '../components/ui'
import type { Tone } from '../data/content'
import { HIVES, LOCATIONS, RANGE_LABEL, rangeLabels, series, statusOf } from '../data/hives'
import type { Hive, Range } from '../data/hives'

const LIMITS = { tempHigh: 36, humidityHigh: 62, batteryLow: 30 }
type Issue = 'all' | 'temp' | 'humidity' | 'battery' | 'offline'

const online = HIVES.filter((h) => h.online)
const average = (values: number[]) => values.reduce((a, b) => a + b, 0) / values.length

function issuesOf(hive: Hive): Array<{ id: Exclude<Issue, 'all'>; text: string; tone: Tone }> {
  if (!hive.online) return [{ id: 'offline', text: 'Offline', tone: 'crit' }]
  const found: Array<{ id: Exclude<Issue, 'all'>; text: string; tone: Tone }> = []
  if (hive.temp > LIMITS.tempHigh) found.push({ id: 'temp', text: `Temp ${hive.temp.toFixed(1)}°C`, tone: hive.temp > 37 ? 'crit' : 'warn' })
  if (hive.humidity > LIMITS.humidityHigh) found.push({ id: 'humidity', text: `Humidity ${hive.humidity}%`, tone: hive.humidity > 66 ? 'crit' : 'warn' })
  if (hive.battery < LIMITS.batteryLow) found.push({ id: 'battery', text: `Battery ${hive.battery}%`, tone: 'warn' })
  return found
}

const FLAGGED = HIVES.map((hive) => ({ hive, issues: issuesOf(hive) }))
  .filter((row) => row.issues.length > 0)
  .sort((a, b) => b.issues.length - a.issues.length || b.hive.temp - a.hive.temp)

/** Counts hives per band, e.g. how many sit between 34 and 35 °C. */
function histogram(values: number[], from: number, step: number, bands: number) {
  const counts = Array(bands).fill(0) as number[]
  for (const v of values) counts[Math.min(bands - 1, Math.max(0, Math.floor((v - from) / step)))] += 1
  return counts
}

function NetworkTrend() {
  const [range, setRange] = useState<Range>('7d')
  const c = usePalette()
  const labels = rangeLabels(range)
  const n = labels.length
  return (
    <Card
      title="Network Sensor Trend"
      info="Average of all online hives"
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
        ariaLabel="Average brood temperature and humidity across the network"
        labels={labels}
        height={210}
        y={{ min: 20, max: 80, step: 10 }}
        series={[
          { label: 'Brood Temperature (°C)', data: series(301 + n, n, 34.6, 0.9), color: c.honey, points: n <= 7, unit: ' °C' },
          { label: 'Humidity (%)', data: series(302 + n, n, 59, 3.5), color: c.blue, points: n <= 7, unit: '%' },
        ]}
      />
    </Card>
  )
}

export default function HealthSensors() {
  const c = usePalette()
  const [issue, setIssue] = useState<Issue>('all')
  const [shown, setShown] = useState(10)

  const rows = useMemo(() => FLAGGED.filter((r) => issue === 'all' || r.issues.some((i) => i.id === issue)), [issue])
  const count = (id: Exclude<Issue, 'all'>) => FLAGGED.filter((r) => r.issues.some((i) => i.id === id)).length
  const tempBands = histogram(online.map((h) => h.temp), 32, 1, 7)
  const batteryBands = histogram(HIVES.map((h) => h.battery), 0, 20, 5)

  return (
    <div className="space-y-3 p-3.5">
      <PageHeader title="Health & Sensors" subtitle="Live sensor readings and device health across every hive" />

      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 2xl:grid-cols-6">
        <StatTile icon={<Wifi size={26} />} tone="ok" label="Sensors Online" value={`${online.length} / ${HIVES.length}`} footer={`${Math.round((online.length / HIVES.length) * 100)}% uptime today`} />
        <StatTile icon={<Thermometer size={26} />} label="Avg. Brood Temperature" value={`${average(online.map((h) => h.temp)).toFixed(1)}°C`} footer="Target 32–36°C" />
        <StatTile icon={<Droplet size={26} fill="currentColor" />} tone="info" label="Avg. Humidity" value={`${Math.round(average(online.map((h) => h.humidity)))}%`} footer="Target 50–62%" />
        <StatTile icon={<BatteryLow size={26} />} tone="warn" label="Low Battery" value={count('battery')} footer={`below ${LIMITS.batteryLow}%`} />
        <StatTile icon={<WifiOff size={26} />} tone="crit" label="Offline Units" value={count('offline')} footer="no data for 24 h+" />
        <StatTile icon={<Clock size={26} />} tone="plain" label="Data Freshness" value="2 min" footer="median reading age" />
      </div>

      <div className="grid gap-3 lg:grid-cols-2 2xl:grid-cols-[1.3fr_1fr_1fr]">
        <div className="lg:col-span-2 2xl:col-span-1">
          <NetworkTrend />
        </div>
        <Card title="Brood Temperature Spread" info="Number of online hives in each temperature band">
          <ComboChart
            ariaLabel="Number of hives in each brood temperature band"
            labels={['32–33', '33–34', '34–35', '35–36', '36–37', '37–38', '38+']}
            height={228}
            legend={false}
            y={{ min: 0, title: 'Hives' }}
            series={[{ label: 'Hives', data: tempBands, color: c.honey, type: 'bar' }]}
          />
          <p className="mt-1 text-center text-[11px] text-muted">Temperature band (°C)</p>
        </Card>
        <Card title="Sensor Battery Levels" info="Number of sensor units in each battery band">
          <ComboChart
            ariaLabel="Number of sensor units in each battery band"
            labels={['0–20%', '20–40%', '40–60%', '60–80%', '80–100%']}
            height={228}
            legend={false}
            y={{ min: 0, title: 'Sensor units' }}
            series={[{ label: 'Sensor units', data: batteryBands, color: c.green, type: 'bar' }]}
          />
          <p className="mt-1 text-center text-[11px] text-muted">Battery charge</p>
        </Card>
      </div>

      <div className="grid gap-3 2xl:grid-cols-[1.5fr_1fr]">
        <Card title="Hives Outside Normal Range" info="Temperature above 36°C, humidity above 62%, battery below 30%, or offline">
          <div className="mb-3">
            <Pills
              label="Filter by issue"
              value={issue}
              onChange={(id) => {
                setIssue(id)
                setShown(10)
              }}
              options={[
                { id: 'all', label: 'All', count: FLAGGED.length },
                { id: 'temp', label: 'Temperature', count: count('temp') },
                { id: 'humidity', label: 'Humidity', count: count('humidity') },
                { id: 'battery', label: 'Battery', count: count('battery') },
                { id: 'offline', label: 'Offline', count: count('offline') },
              ]}
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-xs">
              <thead className="bg-card-2 text-ink-2">
                <tr>
                  <Th>Hive</Th>
                  <Th>Status</Th>
                  <Th>Location</Th>
                  <Th>Temp</Th>
                  <Th>Humidity</Th>
                  <Th>Battery</Th>
                  <Th>Issue</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line tabular-nums">
                {rows.slice(0, shown).map(({ hive, issues }) => (
                  <tr key={hive.id} className="hover:bg-card-2">
                    <Td>
                      <Link to={`/hives/${hive.id}`} className="font-semibold whitespace-nowrap text-link hover:underline">
                        {hive.id}
                      </Link>
                    </Td>
                    <Td>
                      <StatusLabel status={statusOf(hive)} />
                    </Td>
                    <Td className="text-ink-2">{hive.place}</Td>
                    <Td>{hive.online ? `${hive.temp.toFixed(1)}°C` : '—'}</Td>
                    <Td>{hive.online ? `${hive.humidity}%` : '—'}</Td>
                    <Td>{hive.battery}%</Td>
                    <Td>
                      <span className="flex flex-wrap gap-1">
                        {issues.map((i) => (
                          <Chip key={i.id} tone={i.tone}>
                            {i.text}
                          </Chip>
                        ))}
                      </span>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-ink-2">
            <span>
              Showing {Math.min(shown, rows.length)} of {rows.length} hives
            </span>
            {shown < rows.length && (
              <button onClick={() => setShown((s) => s + 10)} className="font-semibold text-link hover:underline">
                Show 10 more
              </button>
            )}
          </div>
        </Card>

        <Card title="Sensor Status by Location">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] text-xs">
              <thead className="bg-card-2 text-ink-2">
                <tr>
                  <Th>Location</Th>
                  <Th>Online</Th>
                  <Th>Avg. Temp</Th>
                  <Th>Avg. Humidity</Th>
                  <Th>Flagged</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line tabular-nums">
                {LOCATIONS.map((loc) => {
                  const hives = HIVES.filter((h) => h.locationId === loc.id)
                  const live = hives.filter((h) => h.online)
                  const flagged = FLAGGED.filter((r) => r.hive.locationId === loc.id).length
                  return (
                    <tr key={loc.id} className="hover:bg-card-2">
                      <Td>
                        <Link to={`/hives?location=${loc.id}`} className="font-medium text-link hover:underline">
                          {loc.name}
                        </Link>
                      </Td>
                      <Td>
                        {live.length} / {hives.length}
                      </Td>
                      <Td>{average(live.map((h) => h.temp)).toFixed(1)}°C</Td>
                      <Td>{Math.round(average(live.map((h) => h.humidity)))}%</Td>
                      <Td>{flagged ? <Chip tone={flagged > 5 ? 'crit' : 'warn'}>{flagged} hives</Chip> : <Chip tone="ok">None</Chip>}</Td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}
