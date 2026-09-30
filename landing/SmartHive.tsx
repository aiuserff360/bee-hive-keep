import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { ArrowRight, BrainCircuit, Camera, Cpu, Droplets, Layers, Map, Microscope, Radio, RefreshCw, ShieldCheck, Sprout, Syringe, TrendingUp, Wind } from 'lucide-react'
import { BeeIcon, HiveIcon } from '../src/components/icons'
import schematic from './assets/smart-hive-schematic.jpg'

const cx = (...parts: Array<string | false | undefined>) => parts.filter(Boolean).join(' ')

/* ---------- Content, taken from the HarvestWare Digital Hive Ecosystem deck ---------- */

interface Product {
  name: string
  kind: string
  body: string
  icon: ReactNode
}

interface Layer {
  id: string
  number: number
  name: string
  subtitle: string
  tagline: string
  colors: { top: string; left: string; right: string; ink: string; glow: string; chip: string }
  products: Product[]
}

const LAYERS: Layer[] = [
  {
    id: 'foundation',
    number: 1,
    name: 'Foundation',
    subtitle: 'The tangible base',
    tagline: 'The physical assets, hardware and biological foundation that everything else is built on.',
    colors: { top: '#f7b928', left: '#c98a0c', right: '#e5a416', ink: '#0b1a2c', glow: 'rgb(247 185 40 / 0.45)', chip: 'bg-honey text-shell' },
    products: [
      { name: 'FoundWare', kind: 'Standardised hardware', body: 'BIS-standard hive equipment, built so that sensing and value-adding technology fit in from day one.', icon: <HiveIcon size={22} /> },
      { name: 'FoundWare', kind: 'Human-centred innovation', body: 'Every piece of beekeeping equipment redesigned to raise safety and quality of life for Madhu Sakhis and the colony.', icon: <ShieldCheck size={22} /> },
      { name: 'LiveWare', kind: 'Optimised biology', body: 'Bee colonies and species, Apis cerana and Apis mellifera, proven to thrive on Indian terrain.', icon: <BeeIcon size={22} /> },
      { name: 'LiveWare', kind: 'Verified sources', body: 'Colonies come only from tested, trusted beekeepers, so every hive starts with a healthy baseline.', icon: <Sprout size={22} /> },
    ],
  },
  {
    id: 'telemetry',
    number: 2,
    name: 'Telemetry',
    subtitle: 'The sensory network',
    tagline: 'Sensing and vision, in the hive and above it, that connect nature to the cloud in real time.',
    colors: { top: '#5b9cf6', left: '#1f5fc4', right: '#3b82f6', ink: '#ffffff', glow: 'rgb(59 130 246 / 0.5)', chip: 'bg-info text-white' },
    products: [
      { name: 'SmartWare', kind: 'IoT telemetry', body: 'Embedded sensors continuously monitor internal temperature, humidity, hive weight and bee activity.', icon: <Cpu size={22} /> },
      { name: 'SmartWare', kind: 'Surveillance', body: 'CCTV integration keeps continuous watch, protecting the colony as a physical asset.', icon: <Camera size={22} /> },
      { name: 'DroneWare', kind: 'Geospatial intelligence', body: 'Drone-guided aerial mapping at 0.1 m resolution chooses the best site and position for every hive.', icon: <Map size={22} /> },
      { name: 'ApiSTIM', kind: 'Safe extraction', body: 'An in-house device that collects venom with the utmost safety for both the worker and the bees.', icon: <Syringe size={22} /> },
    ],
  },
  {
    id: 'intelligence',
    number: 3,
    name: 'Intelligence',
    subtitle: 'The cognitive brain',
    tagline: 'DiGiBeeWare cloud analytics: the predictive engine, and the destination of all colony data.',
    colors: { top: '#f4f7fb', left: '#aab8c9', right: '#d3dce7', ink: '#0b1a2c', glow: 'rgb(244 247 251 / 0.35)', chip: 'bg-white text-shell' },
    products: [
      { name: 'DiGiBeeWare', kind: 'The digital twin', body: 'A virtual replica of the colony and its queen, updated continuously from real-time inputs.', icon: <BrainCircuit size={22} /> },
      { name: 'DiGiBeeWare', kind: 'Disease prediction', body: 'Algorithmic early warning isolates and treats threats before they reach colony collapse.', icon: <Microscope size={22} /> },
      { name: 'DiGiBeeWare', kind: 'Swarm prevention', body: 'Behavioural analytics predict swarming in time to prevent it, preserving colony mass.', icon: <Wind size={22} /> },
      { name: 'DiGiBeeWare', kind: 'Yield optimisation', body: 'Data-driven harvesting models maximise the output of honey, royal jelly and venom.', icon: <TrendingUp size={22} /> },
    ],
  },
]

const CYCLE = [
  { step: 1, name: 'Map and position', who: 'DroneWare', body: 'Drones analyse the terrain to place the hive and colony perfectly.', icon: <Map size={20} /> },
  { step: 2, name: 'Sense and protect', who: 'SmartWare', body: 'IoT sensors and CCTV capture fine-grained environmental and behavioural data.', icon: <Radio size={20} /> },
  { step: 3, name: 'Predict and prevent', who: 'DiGiBeeWare', body: 'The digital twin reads the patterns to pre-empt disease and swarming.', icon: <BrainCircuit size={20} /> },
  { step: 4, name: 'Harvest and refine', who: 'ApiSTIM', body: 'Safe extraction and optimised yields feed back into the analytics engine.', icon: <Droplets size={20} /> },
]

const SCHEMATIC_PARTS = [
  { name: 'Sensor array', body: 'Temperature, humidity, weight and acoustics, embedded in the frames and the box.' },
  { name: 'Camera housing', body: 'Continuous surveillance of the entrance and the colony.' },
  { name: 'Climate module', body: 'Fans and a 12 V DC supply keep conditions stable inside the hive.' },
  { name: 'ApiSTIM tray', body: 'The extraction surface that collects venom safely.' },
  { name: 'DroneWare scanning grid', body: 'Aerial mapping above the apiary at 0.1 m resolution.' },
]

/* ---------- Stacked hexagon drawing ---------- */

const R = 150
const SQUASH = 0.5
const THICK = 34
const GAP = 92

/** Vertices of the top face of one layer, as a flattened hexagon. */
function hexPoints(cy: number) {
  return Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i
    return [200 + R * Math.cos(a), cy + SQUASH * R * Math.sin(a)] as const
  })
}

const toPath = (pts: ReadonlyArray<readonly [number, number]>) => pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')

function LayerSlab({ layer, active, dim, y, onSelect }: { layer: Layer; active: boolean; dim: boolean; y: number; onSelect: () => void }) {
  const top = hexPoints(y)
  const drop = (p: readonly [number, number]) => [p[0], p[1] + THICK] as const
  // Three front faces: right (v0-v1), middle (v1-v2) and left (v2-v3).
  const face = (a: number, b: number, fill: string) => <polygon points={toPath([top[a], top[b], drop(top[b]), drop(top[a])])} fill={fill} />
  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={`Layer ${layer.number}: ${layer.name}`}
      aria-pressed={active}
      onClick={onSelect}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onSelect())}
      className="cursor-pointer outline-none transition-all duration-500 focus-visible:[filter:drop-shadow(0_0_6px_#f7b928)]"
      style={{ transform: `translateY(${active ? -14 : 0}px)`, opacity: dim ? 0.6 : 1, filter: active ? `drop-shadow(0 18px 30px ${layer.colors.glow})` : 'none' }}
    >
      {face(0, 1, layer.colors.right)}
      {face(1, 2, layer.colors.right)}
      {face(2, 3, layer.colors.left)}
      <polygon points={toPath(top)} fill={layer.colors.top} />
      <polygon points={toPath(hexPoints(y).map(([x, py]) => [200 + (x - 200) * 0.82, y + (py - y) * 0.82] as const))} fill="none" stroke={layer.colors.ink} strokeOpacity="0.18" strokeWidth="1.5" />
      <text x="200" y={y + 5} textAnchor="middle" fill={layer.colors.ink} fontSize="15" fontWeight="700" fontFamily="inherit" className="pointer-events-none select-none">
        {layer.number}. {layer.name}
      </text>
    </g>
  )
}

function Stack({ activeId, onSelect }: { activeId: string; onSelect: (id: string) => void }) {
  // Draw from the bottom layer up so that upper layers overlap lower ones.
  const ordered = [...LAYERS].reverse()
  const baseY = 340
  return (
    <svg viewBox="0 0 400 460" className="mx-auto w-full max-w-[400px]" role="group" aria-label="The three layers of the Smart Hive">
      <ellipse cx="200" cy="440" rx="150" ry="24" fill="#f7b928" opacity="0.08" />
      {ordered.map((layer) => {
        const index = LAYERS.indexOf(layer)
        const y = baseY - index * (THICK + GAP)
        return <LayerSlab key={layer.id} layer={layer} y={y} active={layer.id === activeId} dim={layer.id !== activeId} onSelect={() => onSelect(layer.id)} />
      })}
    </svg>
  )
}

/* ---------- Section ---------- */

export default function SmartHive() {
  const [activeId, setActiveId] = useState(LAYERS[0].id)
  const [manual, setManual] = useState(false)
  const active = LAYERS.find((l) => l.id === activeId)!

  // Cycle through the layers until the visitor picks one.
  useEffect(() => {
    if (manual) return
    const id = window.setInterval(() => setActiveId((current) => LAYERS[(LAYERS.findIndex((l) => l.id === current) + 1) % LAYERS.length].id), 4200)
    return () => window.clearInterval(id)
  }, [manual])

  const select = (id: string) => {
    setManual(true)
    setActiveId(id)
  }

  return (
    <section id="smart-hive" className="relative overflow-hidden border-t border-white/10 bg-[#0d1e33] py-20 sm:py-28">
      <div className="comb pointer-events-none absolute inset-0 opacity-70" aria-hidden="true" />
      <div className="relative mx-auto max-w-6xl px-5">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold tracking-[0.2em] text-honey uppercase">The Smart Hive</p>
          <h2 className="mt-3 text-3xl leading-tight font-bold tracking-tight text-balance sm:text-[44px]">Three layers of intelligence, in one box</h2>
          <p className="mt-4 text-lg leading-relaxed text-pretty text-slate-300">
            The HarvestWare Digital Hive Ecosystem turns beekeeping from reactive observation into predictive architecture. A standard hive box carries a sensory network, and everything it senses feeds one cognitive brain.
          </p>
        </div>

        {/* Layer explorer */}
        <div className="mt-14 grid items-center gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div>
            <Stack activeId={activeId} onSelect={select} />
            <div role="tablist" aria-label="Choose a layer" className="mx-auto mt-2 flex max-w-[400px] rounded-xl border border-white/10 bg-white/5 p-1">
              {LAYERS.map((l) => (
                <button
                  key={l.id}
                  role="tab"
                  aria-selected={l.id === activeId}
                  onClick={() => select(l.id)}
                  className={cx('flex-1 rounded-lg px-2 py-2 text-xs font-semibold transition sm:text-sm', l.id === activeId ? l.colors.chip : 'text-slate-300 hover:bg-white/10')}
                >
                  {l.number}. {l.name}
                </button>
              ))}
            </div>
            <p className="mt-3 text-center text-xs text-slate-500">Tap a layer to explore it.</p>
          </div>

          <div key={active.id} className="fade-in">
            <div className="flex items-center gap-3">
              <span className={cx('grid h-10 w-10 place-items-center rounded-xl text-base font-extrabold', active.colors.chip)}>{active.number}</span>
              <div>
                <h3 className="text-2xl font-bold tracking-tight">{active.name}</h3>
                <p className="text-sm text-slate-400">{active.subtitle}</p>
              </div>
            </div>
            <p className="mt-4 text-lg leading-relaxed text-slate-200">{active.tagline}</p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {active.products.map((p) => (
                <li key={p.name + p.kind} className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 transition hover:border-white/25 hover:bg-white/[0.08]">
                  <div className="flex items-center gap-2.5">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-honey/15 text-honey">{p.icon}</span>
                    <span>
                      <span className="block text-[11px] font-semibold tracking-[0.14em] text-honey uppercase">{p.name}</span>
                      <span className="block text-[15px] font-semibold">{p.kind}</span>
                    </span>
                  </div>
                  <p className="mt-2.5 text-sm leading-relaxed text-slate-300">{p.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Blueprint */}
        <div className="mt-24 grid items-center gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-14">
          <div className="blueprint rounded-3xl p-4 sm:p-6">
            <div className="mb-3 flex items-center justify-between text-[11px] font-semibold tracking-[0.18em] text-[#4a5a70] uppercase">
              <span>The Smart Hive schematic</span>
              <span>Sensor array · Rev 1.2</span>
            </div>
            <img src={schematic} alt="Exploded drawing of the Smart Hive box: sensor array, frames with embedded sensors, climate module, camera housing, extraction tray and a mapping drone above" width={1200} height={1196} loading="lazy" className="block w-full rounded-xl" />
          </div>
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-honey uppercase">Inside the box</p>
            <h3 className="mt-3 text-2xl leading-tight font-bold tracking-tight text-balance sm:text-[34px]">A standard hive, with the sensory network built in</h3>
            <p className="mt-3 text-lg leading-relaxed text-slate-300">FoundWare hardware is designed for value addition, so each SmartWare module has its place in the box rather than being bolted on.</p>
            <ul className="mt-6 space-y-3">
              {SCHEMATIC_PARTS.map((part, i) => (
                <li key={part.name} className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-info/20 text-xs font-bold text-[#9cc4ff]">{i + 1}</span>
                  <span>
                    <b className="block text-[15px]">{part.name}</b>
                    <span className="text-sm text-slate-300">{part.body}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Cycle */}
        <div className="mt-24">
          <div className="mx-auto max-w-3xl text-center">
            <p className="flex items-center justify-center gap-2 text-xs font-semibold tracking-[0.2em] text-honey uppercase">
              <RefreshCw size={14} /> A continuous cycle
            </p>
            <h3 className="mt-3 text-2xl leading-tight font-bold tracking-tight text-balance sm:text-[34px]">Every harvest makes the next one smarter</h3>
          </div>
          <ol className="mt-10 grid gap-3 md:grid-cols-4">
            {CYCLE.map((c, i) => (
              <li key={c.step} className="relative rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <div className="flex items-center justify-between">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-honey text-shell">{c.icon}</span>
                  <span className="text-4xl leading-none font-extrabold text-white/10">{c.step}</span>
                </div>
                <p className="mt-4 text-[11px] font-semibold tracking-[0.14em] text-honey uppercase">{c.who}</p>
                <h4 className="mt-1 text-lg font-semibold">{c.name}</h4>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-300">{c.body}</p>
                {i < CYCLE.length - 1 ? (
                  <ArrowRight size={18} className="absolute top-1/2 -right-3 hidden -translate-y-1/2 text-honey md:block" aria-hidden="true" />
                ) : (
                  <span className="absolute -top-3 right-4 inline-flex items-center gap-1 rounded-full border border-honey/40 bg-[#1a2a3f] px-2.5 py-1 text-[10px] font-semibold text-honey">
                    <RefreshCw size={10} /> back to step 1
                  </span>
                )}
              </li>
            ))}
          </ol>
          <p className="mx-auto mt-8 max-w-3xl rounded-2xl border border-honey/30 bg-honey/10 px-5 py-4 text-center text-[15px] leading-relaxed text-slate-100">
            <Layers size={16} className="mr-2 inline text-honey" aria-hidden="true" />
            HarvestWare transforms apiculture from an unpredictable agricultural pursuit into a scalable, data-driven capability.
          </p>
        </div>
      </div>
    </section>
  )
}
