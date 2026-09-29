import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import L from 'leaflet'
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet'
import { ArrowRight, CalendarClock, ChevronLeft, ChevronRight, Droplet, LocateFixed, Maximize2, Minimize2, Minus, Plus, Thermometer, Weight, X } from 'lucide-react'
import { HIVES, LOCATIONS, STATUS_COLOR, STATUS_LABEL, img, statusOf } from '../data/hives'
import type { Location, Status } from '../data/hives'
import { BeeIcon } from './icons'
import { Select, StatusDot, cx } from './ui'

type Metric = 'all' | 'health' | 'yield' | 'temp'
type Base = 'map' | 'satellite'

const METRICS: Array<{ id: Metric; label: string }> = [
  { id: 'all', label: 'All Locations' },
  { id: 'health', label: 'Hive Health' },
  { id: 'yield', label: 'Honey Yield' },
  { id: 'temp', label: 'Temperature' },
]

const TILES: Record<Base, { url: string; attribution: string }> = {
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Imagery &copy; Esri, Maxar, Earthstar Geographics',
  },
  map: {
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
  },
}

const BOUNDS = L.latLngBounds(LOCATIONS.map((l) => [l.lat, l.lng] as [number, number]))
const SMALL_SCREEN = typeof window !== 'undefined' && window.innerWidth < 640
// Leave room for the legend (left) and the hive summary (right) so they do not cover pins.
const FIT: L.FitBoundsOptions = SMALL_SCREEN ? { padding: [24, 40] } : { paddingTopLeft: [60, 50], paddingBottomRight: [225, 40] }

function healthCounts(locationId: string) {
  const hives = HIVES.filter((h) => h.locationId === locationId)
  return {
    healthy: hives.filter((h) => h.health === 'healthy').length,
    attention: hives.filter((h) => h.health === 'attention').length,
    critical: hives.filter((h) => h.health === 'critical').length,
  }
}

function pinIcon(loc: Location, metric: Metric, selected: boolean) {
  const color = STATUS_COLOR[loc.status]
  const counts = healthCounts(loc.id)
  const detail =
    metric === 'yield'
      ? `${loc.yieldKg} kg honey`
      : metric === 'temp'
        ? `${loc.avgTemp.toFixed(1)} °C avg`
        : metric === 'health'
          ? `${counts.healthy} ok · ${counts.attention + counts.critical} need care`
          : `${loc.hives} hives`
  return L.divIcon({
    className: cx('hive-pin', selected && 'is-selected'),
    iconSize: [30, 38],
    iconAnchor: [15, 36],
    html: `<div class="hive-pin-inner">
      <svg width="30" height="38" viewBox="0 0 30 38" aria-hidden="true">
        <path d="M15 1.500C7.500 1.500 2 7.200 2 14.200 2 23.500 15 36.500 15 36.500S28 23.500 28 14.200C28 7.200 22.500 1.500 15 1.500z" fill="${color}" stroke="#0b1a2c" stroke-width="2"/>
        <circle cx="15" cy="14" r="6.500" fill="#0b1a2c"/>
        <circle cx="15" cy="14" r="3.200" fill="${color}"/>
      </svg>
      <div class="hive-pin-label">${loc.name}<span>${detail}</span></div>
    </div>`,
  })
}

/** Custom zoom / recentre buttons, styled to match the dashboard. */
function MapButtons() {
  const map = useMap()
  const button = 'grid h-8 w-8 place-items-center rounded-md border border-shell-line bg-shell/90 text-white hover:bg-shell-2'
  return (
    <div className="absolute right-3 bottom-6 z-[500] flex items-end gap-2">
      <button className={button} aria-label="Show all locations" onClick={() => map.fitBounds(BOUNDS, FIT)}>
        <LocateFixed size={16} />
      </button>
      <div className="flex flex-col gap-1">
        <button className={button} aria-label="Zoom in" onClick={() => map.zoomIn()}>
          <Plus size={16} />
        </button>
        <button className={button} aria-label="Zoom out" onClick={() => map.zoomOut()}>
          <Minus size={16} />
        </button>
      </div>
    </div>
  )
}

/** Leaflet needs to be told when its container changes size (e.g. full screen). */
function ResizeWatcher({ trigger }: { trigger: unknown }) {
  const map = useMap()
  useEffect(() => {
    const id = window.setTimeout(() => map.invalidateSize(), 60)
    return () => window.clearTimeout(id)
  }, [map, trigger])
  return null
}

function HivePopup({ location, onClose }: { location: Location; onClose: () => void }) {
  const hive = HIVES.find((h) => h.locationId === location.id)!
  const status = statusOf(hive)
  const dash = '—'
  const rows = [
    { icon: <Thermometer size={13} />, label: 'Temperature', value: hive.online ? `${hive.temp.toFixed(1)} °C` : dash },
    { icon: <Droplet size={13} />, label: 'Humidity', value: hive.online ? `${hive.humidity}%` : dash },
    { icon: <Weight size={13} />, label: 'Weight', value: hive.online ? `${hive.weight.toFixed(1)} kg` : dash },
    { icon: <BeeIcon size={13} />, label: 'Bee Activity', value: hive.online ? hive.activity : dash },
    { icon: <CalendarClock size={13} />, label: 'Last Update', value: hive.lastUpdate.split(',')[0] },
  ]
  return (
    <div className="absolute top-3 right-3 z-[500] w-[196px] rounded-lg border border-shell-line bg-shell/95 p-2.5 text-white shadow-xl">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-[13px] font-semibold">Hive {hive.id}</h3>
        <button onClick={onClose} aria-label="Close hive summary" className="rounded p-0.5 text-slate-300 hover:bg-white/10">
          <X size={14} />
        </button>
      </div>
      <img src={hive.id === 'BGL-042' ? img('apiary.jpg') : hive.image} alt={`Hives at ${location.name}`} className="h-[84px] w-full rounded-md object-cover max-sm:hidden" />
      <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold" style={{ color: STATUS_COLOR[status] }}>
        <StatusDot status={status} size={9} />
        <span className="text-white">{STATUS_LABEL[status]}</span>
      </div>
      <dl className="mt-1.5 text-[11px]">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center gap-1.5 border-t border-white/10 py-1">
            <span className="text-slate-400">{r.icon}</span>
            <dt className="text-slate-200">{r.label}</dt>
            <dd className="ml-auto font-semibold">{r.value}</dd>
          </div>
        ))}
      </dl>
      <Link to={`/hives/${hive.id}`} className="mt-1.5 flex items-center justify-center gap-1.5 rounded-md border border-info/60 py-1.5 text-xs font-semibold text-[#8cc2ff] hover:bg-info/20">
        View Details <ArrowRight size={13} />
      </Link>
    </div>
  )
}

export default function HiveMap() {
  const [metric, setMetric] = useState<Metric>('all')
  const [base, setBase] = useState<Base>('satellite')
  // On phones the map starts clear; the legend and hive summary open on demand.
  const [selected, setSelected] = useState<string | null>(SMALL_SCREEN ? null : 'bengaluru')
  const [legendOpen, setLegendOpen] = useState(!SMALL_SCREEN)
  const [full, setFull] = useState(false)

  useEffect(() => {
    if (!full) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setFull(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [full])

  const icons = useMemo(
    () => Object.fromEntries(LOCATIONS.map((l) => [l.id, pinIcon(l, metric, l.id === selected)])),
    [metric, selected],
  )
  const selectedLocation = LOCATIONS.find((l) => l.id === selected)
  const legend: Status[] = ['healthy', 'attention', 'critical', 'offline']

  return (
    <section className={cx('flex flex-col border border-line bg-card', full ? 'fixed inset-0 z-[900] rounded-none' : 'h-full min-h-[460px] rounded-xl')}>
      <header className="flex flex-wrap items-center gap-2 px-4 py-2.5">
        <h2 className="mr-auto text-[17px] font-semibold text-ink">Hive Locations</h2>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Map metric">
          {METRICS.map((m) => (
            <button
              key={m.id}
              onClick={() => setMetric(m.id)}
              aria-pressed={metric === m.id}
              className={cx(
                'rounded-md border px-3 py-1.5 text-[11px] font-medium',
                metric === m.id ? 'border-info bg-tab-active text-white' : 'border-line bg-card-2 text-ink-2 hover:border-muted',
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
        <Select aria-label="Time range" defaultValue="30d" className="w-[130px]">
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="season">This Season</option>
        </Select>
        <button onClick={() => setFull((v) => !v)} aria-label={full ? 'Exit full screen' : 'Full screen map'} className="grid h-8 w-8 place-items-center rounded-md border border-line bg-card-2 text-ink hover:border-muted">
          {full ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
        </button>
      </header>

      <div className="relative min-h-[340px] flex-1 overflow-hidden rounded-b-xl">
        <MapContainer bounds={BOUNDS} boundsOptions={FIT} zoomControl={false} scrollWheelZoom={false} minZoom={6} maxZoom={15} className="h-full w-full">
          <TileLayer key={base} url={TILES[base].url} attribution={TILES[base].attribution} />
          {LOCATIONS.map((l) => (
            <Marker
              key={l.id}
              position={[l.lat, l.lng]}
              icon={icons[l.id]}
              title={`${l.name}: ${l.hives} hives, ${STATUS_LABEL[l.status]}`}
              zIndexOffset={l.id === selected ? 1000 : 0}
              eventHandlers={{ click: () => setSelected(l.id) }}
            />
          ))}
          <MapButtons />
          <ResizeWatcher trigger={full} />
        </MapContainer>

        <div className="absolute top-3 left-3 z-[500] flex items-end">
          {legendOpen && (
            <div className="rounded-lg border border-shell-line bg-shell/90 px-3 py-2.5 text-white">
              <h3 className="mb-2 text-xs font-semibold">Hive Status</h3>
              <ul className="space-y-2 text-[11px]">
                {legend.map((s) => (
                  <li key={s} className="flex items-center gap-2.5 pr-4">
                    <StatusDot status={s} size={12} />
                    {STATUS_LABEL[s]}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <button
            onClick={() => setLegendOpen((v) => !v)}
            aria-label={legendOpen ? 'Hide legend' : 'Show legend'}
            className="ml-[-2px] grid h-7 w-6 place-items-center rounded-md border border-shell-line bg-shell/90 text-white"
          >
            {legendOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
          </button>
        </div>

        <div className="absolute bottom-6 left-3 z-[500] flex overflow-hidden rounded-md border border-shell-line bg-shell/90 text-xs font-medium text-white" role="group" aria-label="Base map">
          {(['map', 'satellite'] as Base[]).map((b) => (
            <button key={b} onClick={() => setBase(b)} aria-pressed={base === b} className={cx('px-4 py-1.5 capitalize', base === b ? 'bg-info text-white' : 'hover:bg-white/10')}>
              {b}
            </button>
          ))}
        </div>

        {selectedLocation && <HivePopup location={selectedLocation} onClose={() => setSelected(null)} />}
      </div>
    </section>
  )
}
