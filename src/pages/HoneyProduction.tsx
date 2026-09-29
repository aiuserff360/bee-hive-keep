import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarCheck, MapPin, Target, TrendingUp } from 'lucide-react'
import { ComboChart, Donut, usePalette } from '../components/charts'
import { CombIcon, JarIcon } from '../components/icons'
import { BarList, Card, Chip, PageHeader, Select, StatTile, StatusLabel, Td, Th } from '../components/ui'
import { FLORAL_SOURCES } from '../data/content'
import { LOCATIONS, NETWORK, SEASON_MONTHS, pct, statusOf } from '../data/hives'
import { LAST_SEASON_MONTHLY_HONEY, NETWORK_MONTHLY_HONEY, RECENT_HARVESTS, TOP_HIVES } from '../data/network'

type Measure = 'total' | 'average'

const byYield = [...LOCATIONS].sort((a, b) => b.yieldKg - a.yieldKg)
const best = byYield[0]
const projected = 1860

export default function HoneyProduction() {
  const c = usePalette()
  const [measure, setMeasure] = useState<Measure>('total')
  const share = pct(NETWORK.honeyKg, NETWORK.honeyTargetKg)

  const ranked =
    measure === 'total'
      ? byYield.map((l) => ({ label: l.name, value: l.yieldKg }))
      : [...LOCATIONS].map((l) => ({ label: l.name, value: Math.round((l.yieldKg / l.hives) * 10) / 10 })).sort((a, b) => b.value - a.value)

  const cumulative = NETWORK_MONTHLY_HONEY.map((_, i) => NETWORK_MONTHLY_HONEY.slice(0, i + 1).reduce((a, b) => a + b, 0))
  const targetPath = SEASON_MONTHS.map((_, i) => Math.round((NETWORK.honeyTargetKg / 8) * (i + 1)))

  return (
    <div className="space-y-3 p-3.5">
      <PageHeader title="Honey Production" subtitle="Season yield, harvests and forecast for the whole network">
        <Select aria-label="Season" defaultValue="2026">
          <option value="2026">This Season (Apr – Sep 2026)</option>
        </Select>
      </PageHeader>

      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 2xl:grid-cols-6">
        <StatTile icon={<JarIcon size={26} />} label="Total Honey Yield" sub="(this season)" value={`${NETWORK.honeyKg.toLocaleString()} kg`} delta="+18%" deltaNote="vs last season" />
        <StatTile icon={<CombIcon size={26} />} label="Avg. per Hive" value={`${NETWORK.avgPerHiveKg.toFixed(1)} kg`} delta="+0.9 kg" deltaNote="vs last season" />
        <StatTile
          icon={<Target size={26} />}
          tone="plain"
          label="Season Target"
          value={`${share}%`}
          footer={`${NETWORK.honeyKg.toLocaleString()} of ${NETWORK.honeyTargetKg.toLocaleString()} kg`}
        />
        <StatTile icon={<MapPin size={26} fill="currentColor" />} tone="info" label="Top Location" value={best.name} footer={`${best.yieldKg} kg from ${best.hives} hives`} />
        <StatTile icon={<CalendarCheck size={26} />} tone="ok" label="Harvests Completed" value="164" footer="last on 21 Sep 2026" />
        <StatTile icon={<TrendingUp size={26} />} tone="ok" label="Projected Season Total" value={`${projected.toLocaleString()} kg`} footer="by end of November" />
      </div>

      <div className="grid gap-3 lg:grid-cols-2 2xl:grid-cols-[1.2fr_1fr_1fr]">
        <Card title="Monthly Production" info="Honey collected across the network, by month">
          <ComboChart
            ariaLabel="Honey collected per month, this season compared with last season"
            labels={SEASON_MONTHS}
            height={230}
            y={{ min: 0, max: 400, step: 100, title: 'Honey (kg)' }}
            series={[
              { label: 'This Season (2026)', data: NETWORK_MONTHLY_HONEY, color: c.honey, type: 'bar', unit: ' kg' },
              { label: 'Last Season (2025)', data: LAST_SEASON_MONTHLY_HONEY, color: c.blue, type: 'bar', unit: ' kg' },
            ]}
          />
        </Card>
        <Card title="Progress to Target" info="Running total against an even pace to the 2,000 kg target">
          <ComboChart
            ariaLabel="Running total of honey collected against the target pace"
            labels={SEASON_MONTHS}
            height={230}
            y={{ min: 0, max: 2000, step: 500, title: 'Honey (kg)' }}
            series={[
              { label: 'Collected so far', data: cumulative, color: c.honey, fill: 'origin', points: true, unit: ' kg' },
              { label: 'Target pace', data: targetPath, color: c.gray, dashed: true, unit: ' kg' },
            ]}
          />
        </Card>
        <Card
          title="Yield by Location"
          className="lg:col-span-2 2xl:col-span-1"
          action={
            <Select aria-label="Measure" value={measure} onChange={(e) => setMeasure(e.target.value as Measure)}>
              <option value="total">Total (kg)</option>
              <option value="average">Average per hive (kg)</option>
            </Select>
          }
        >
          <BarList items={ranked} color={c.honey} unit=" kg" />
        </Card>
      </div>

      <div className="grid gap-3 lg:grid-cols-2 2xl:grid-cols-[1.2fr_1.2fr_0.9fr]">
        <Card title="Top Producing Hives">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] text-xs">
              <thead className="bg-card-2 text-ink-2">
                <tr>
                  <Th>#</Th>
                  <Th>Hive</Th>
                  <Th>Location</Th>
                  <Th>Status</Th>
                  <Th className="text-right">Season Honey</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line tabular-nums">
                {TOP_HIVES.map(({ hive, honey }, i) => (
                  <tr key={hive.id} className="hover:bg-card-2">
                    <Td className="text-muted">{i + 1}</Td>
                    <Td>
                      <Link to={`/hives/${hive.id}/honey`} className="font-semibold text-link hover:underline">
                        {hive.id}
                      </Link>
                    </Td>
                    <Td className="text-ink-2">{hive.place}</Td>
                    <Td>
                      <StatusLabel status={statusOf(hive)} />
                    </Td>
                    <Td className="text-right font-semibold">{honey.toFixed(1)} kg</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <Card title="Recent Harvests">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[440px] text-xs">
              <thead className="bg-card-2 text-ink-2">
                <tr>
                  <Th>Date</Th>
                  <Th>Location</Th>
                  <Th>Hives</Th>
                  <Th>Collected</Th>
                  <Th>Moisture</Th>
                  <Th>Grade</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line tabular-nums">
                {RECENT_HARVESTS.map((h) => (
                  <tr key={h.date + h.place} className="hover:bg-card-2">
                    <Td className="whitespace-nowrap">{h.date}</Td>
                    <Td>{h.place}</Td>
                    <Td>{h.hives}</Td>
                    <Td className="font-semibold whitespace-nowrap">{h.kg.toFixed(1)} kg</Td>
                    <Td>{h.moisture.toFixed(1)}%</Td>
                    <Td>
                      <Chip tone={h.grade === 'A' ? 'ok' : 'warn'}>Grade {h.grade}</Chip>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-[11px] text-muted">Grade A honey has moisture below 18%.</p>
        </Card>
        <Card title="Floral Sources (AI)" className="lg:col-span-2 2xl:col-span-1" bodyClassName="grid content-center">
          <div className="flex flex-wrap items-center justify-around gap-4">
            <Donut segments={FLORAL_SOURCES.map((f) => ({ label: f.name, value: f.value, color: f.color }))} size={140} cutout="62%" unit="%" ariaLabel="Share of honey by floral source">
              <span className="text-xs leading-tight font-semibold text-ink">
                Wildflower
                <br />
                Mix
              </span>
            </Donut>
            <ul className="space-y-2 text-xs whitespace-nowrap">
              {FLORAL_SOURCES.map((f) => (
                <li key={f.name} className="flex items-center gap-2 text-ink">
                  <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: f.color }} />
                  <b className="w-8 text-[13px] tabular-nums">{f.value}%</b>
                  {f.name}
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </div>
    </div>
  )
}
