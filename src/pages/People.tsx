import { useState } from 'react'
import { Link } from 'react-router-dom'
import { GraduationCap, HandCoins, Home, MapPin, Quote, Search, Users } from 'lucide-react'
import { ComboChart, Donut, usePalette } from '../components/charts'
import { HiveIcon } from '../components/icons'
import { Avatar, BarList, Button, Card, Chip, PageHeader, Pills, Select, StatTile, Td, Th } from '../components/ui'
import type { Tone } from '../data/content'
import { LOCATIONS, NETWORK, SEASON_MONTHS } from '../data/hives'
import { KEEPERS, STORIES, TRAININGS } from '../data/network'
import type { Keeper } from '../data/network'
import { useStore } from '../store'

type Group = 'all' | 'women' | 'lead' | 'trainee'

const LEVEL_TONE: Record<Keeper['level'], Tone> = { Advanced: 'purple', Certified: 'ok', Trainee: 'warn' }
const PAGE = 12
const women = KEEPERS.filter((k) => k.gender === 'F').length
const leads = KEEPERS.filter((k) => k.role === 'Lead Keeper')
const averageUplift = Math.round(KEEPERS.reduce((sum, k) => sum + k.incomeUplift, 0) / KEEPERS.length / 50) * 50

export default function People() {
  const c = usePalette()
  const { notify } = useStore()
  const [group, setGroup] = useState<Group>('all')
  const [location, setLocation] = useState('all')
  const [query, setQuery] = useState('')
  const [shown, setShown] = useState(PAGE)

  const q = query.trim().toLowerCase()
  const visible = KEEPERS.filter((k) => {
    const byGroup = group === 'all' ? true : group === 'women' ? k.gender === 'F' : group === 'lead' ? k.role === 'Lead Keeper' : k.level === 'Trainee'
    return byGroup && (location === 'all' || k.locationId === location) && (!q || k.name.toLowerCase().includes(q) || k.place.toLowerCase().includes(q))
  })
  const reset = <T,>(set: (v: T) => void) => (v: T) => {
    set(v)
    setShown(PAGE)
  }

  const hivesByLocation = [...LOCATIONS].sort((a, b) => b.hives - a.hives).map((l) => ({ label: l.name, value: l.hives, note: '/ 3 keepers' }))

  return (
    <div className="space-y-3 p-3.5">
      <PageHeader title="People & Communities" subtitle="The keepers and villages behind every hive">
        <Button onClick={() => notify('Demo only: new keepers are not saved in this prototype')} className="px-4 py-2 text-[13px]">
          Add Keeper
        </Button>
      </PageHeader>

      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 2xl:grid-cols-5">
        <StatTile icon={<Users size={26} fill="currentColor" />} tone="info" label="Hive Keepers" value={KEEPERS.length} footer={`incl. ${women} women`} />
        <StatTile icon={<MapPin size={26} fill="currentColor" />} label="Communities" value={NETWORK.locations} footer={`across ${NETWORK.states} states`} />
        <StatTile icon={<Home size={26} />} tone="plain" label="Households Supported" value="142" footer="keepers, helpers and packers" />
        <StatTile icon={<HandCoins size={26} />} tone="ok" label="Avg. Income Uplift" value={`₹${averageUplift.toLocaleString('en-IN')}`} footer="per keeper, per month" />
        <StatTile icon={<GraduationCap size={26} />} tone="purple" label="Training Sessions" value="8" footer="held this season" />
      </div>

      <div className="grid gap-3 2xl:grid-cols-[1.7fr_1fr]">
        <Card title="Keeper Directory">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Pills
              label="Filter keepers"
              value={group}
              onChange={reset(setGroup)}
              options={[
                { id: 'all', label: 'All', count: KEEPERS.length },
                { id: 'women', label: 'Women', count: women },
                { id: 'lead', label: 'Lead Keepers', count: leads.length },
                { id: 'trainee', label: 'Trainees', count: KEEPERS.filter((k) => k.level === 'Trainee').length },
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
                placeholder="Search by name or location..."
                aria-label="Search keepers"
                className="w-full rounded-lg border border-line bg-card py-2 pr-3 pl-9 text-xs text-ink placeholder:text-muted"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-xs">
              <thead className="bg-card-2 text-ink-2">
                <tr>
                  <Th>Keeper</Th>
                  <Th>Location</Th>
                  <Th>Hives</Th>
                  <Th>Season Honey</Th>
                  <Th>Keeper Since</Th>
                  <Th>Training</Th>
                  <Th>Income Uplift</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line tabular-nums">
                {visible.slice(0, shown).map((k) => (
                  <tr key={k.id} className="hover:bg-card-2">
                    <Td>
                      <span className="flex items-center gap-2.5">
                        <Avatar name={k.name} tone={k.role === 'Lead Keeper' ? 'honey' : 'plain'} size={30} />
                        <span className="leading-tight">
                          <b className="block text-ink">{k.name}</b>
                          <span className="text-[11px] text-muted">{k.role}</span>
                        </span>
                      </span>
                    </Td>
                    <Td>
                      <Link to={`/hives?location=${k.locationId}`} className="font-medium text-link hover:underline">
                        {k.place}
                      </Link>
                      <span className="block text-[11px] text-muted">{k.state}</span>
                    </Td>
                    <Td>
                      <span className="flex items-center gap-1.5">
                        <HiveIcon size={14} className="text-honey-dark" /> {k.hives}
                      </span>
                    </Td>
                    <Td>{k.honeyKg} kg</Td>
                    <Td>{k.since}</Td>
                    <Td>
                      <Chip tone={LEVEL_TONE[k.level]}>{k.level}</Chip>
                    </Td>
                    <Td className="font-semibold text-ok-text">+₹{k.incomeUplift.toLocaleString('en-IN')}</Td>
                  </tr>
                ))}
                {visible.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-3 py-6 text-center text-muted">
                      No keepers match these filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-ink-2">
            <span>
              Showing {Math.min(shown, visible.length)} of {visible.length} keepers
            </span>
            {shown < visible.length && (
              <button onClick={() => setShown((s) => s + PAGE)} className="font-semibold text-link hover:underline">
                Show {PAGE} more
              </button>
            )}
          </div>
        </Card>

        <div className="grid content-start gap-3 md:grid-cols-2 2xl:grid-cols-1">
          <Card title="Who Keeps the Hives">
            <div className="flex flex-wrap items-center justify-around gap-4">
              <Donut
                segments={[
                  { label: 'Women', value: women, color: c.purple },
                  { label: 'Men', value: KEEPERS.length - women, color: c.blue },
                ]}
                size={128}
                unit=" keepers"
                ariaLabel="Keepers by gender"
              >
                <div>
                  <div className="text-2xl leading-none font-bold text-ink">{Math.round((women / KEEPERS.length) * 100)}%</div>
                  <div className="text-xs text-ink-2">women</div>
                </div>
              </Donut>
              <ul className="space-y-2.5 text-xs text-ink">
                <li className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full" style={{ background: c.purple }} /> <b>{women}</b> Women
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full" style={{ background: c.blue }} /> <b>{KEEPERS.length - women}</b> Men
                </li>
                <li className="text-[11px] text-muted">
                  {leads.length} lead keepers, {leads.filter((k) => k.gender === 'F').length} of them women
                </li>
              </ul>
            </div>
          </Card>
          <Card title="Hives per Community" info="Each community has three keepers">
            <BarList items={hivesByLocation.slice(0, 8)} color={c.honey} />
          </Card>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-2 2xl:grid-cols-[1fr_1.1fr_1fr]">
        <Card title="Keeper Income from Honey" info="Average monthly honey income per keeper, in rupees">
          <ComboChart
            ariaLabel="Average monthly honey income per keeper, this season and last season"
            labels={SEASON_MONTHS}
            height={210}
            y={{ min: 0, max: 8000, step: 2000, title: '₹ per month' }}
            series={[
              { label: 'This Season (2026)', data: [3100, 3900, 4600, 5200, 6400, 7100], color: c.green, points: true },
              { label: 'Last Season (2025)', data: [2600, 3100, 3700, 4100, 5000, 5600], color: c.gray, points: true },
            ]}
          />
        </Card>
        <Card title="Upcoming Training">
          <ul className="divide-y divide-line">
            {TRAININGS.map((t) => (
              <li key={t.title} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5 first:pt-0">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-info-soft text-link">
                  <GraduationCap size={20} />
                </span>
                <span className="min-w-[150px] flex-1 leading-tight">
                  <b className="block text-[13px] text-ink">{t.title}</b>
                  <span className="text-xs text-ink-2">
                    {t.date} • {t.place} • Led by {t.lead}
                  </span>
                </span>
                <span className="text-[11px] whitespace-nowrap text-muted">{t.seats} seats</span>
                <Button variant="outline" className="px-2.5 py-1.5" onClick={() => notify(`Demo only: registration for “${t.title}” is not saved`)}>
                  Register
                </Button>
              </li>
            ))}
          </ul>
        </Card>
        <Card title="Voices from the Field" className="lg:col-span-2 2xl:col-span-1">
          <ul className="space-y-3">
            {STORIES.map((s) => (
              <li key={s.name} className="flex gap-3 rounded-lg bg-card-2 p-3">
                <Quote size={18} className="mt-0.5 shrink-0 text-honey-dark" />
                <p className="text-xs leading-relaxed text-ink-2">
                  {s.quote}
                  <span className="mt-1 block font-semibold text-ink">
                    {s.name}, {s.place}
                  </span>
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[11px] text-muted">Sample quotes written for this prototype.</p>
        </Card>
      </div>
    </div>
  )
}
