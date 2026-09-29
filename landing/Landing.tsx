import { useEffect, useRef, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import {
  ArrowDown,
  ArrowRight,
  AudioLines,
  BatteryFull,
  BellRing,
  BrainCircuit,
  CalendarCheck,
  Check,
  ClipboardList,
  Droplet,
  Eye,
  FileSpreadsheet,
  Leaf,
  Mail,
  MapPinned,
  Menu,
  NotebookPen,
  Plus,
  Radar,
  Route,
  Smartphone,
  Sprout,
  Thermometer,
  TriangleAlert,
  Users,
  Weight,
  Wifi,
  X,
} from 'lucide-react'
import { BeeIcon, CombIcon, HiveIcon, JarIcon, Logo } from '../src/components/icons'
import cardBrood from './assets/card-brood.jpg'
import cardMap from './assets/card-map.jpg'
import screenAlerts from './assets/screen-alerts.jpg'
import screenDashboard from './assets/screen-dashboard.jpg'
import screenHoney from './assets/screen-honey.jpg'
import screenTasks from './assets/screen-tasks.jpg'

/**
 * Address that demo requests are sent to.
 * PLACEHOLDER: replace with the real sales or support mailbox before sharing this page with customers.
 */
const CONTACT_EMAIL = 'hello@beehivekeep.example'

const photo = (name: string) => `../images/${name}`

const cx = (...parts: Array<string | false | undefined>) => parts.filter(Boolean).join(' ')

/* ---------- Helpers ---------- */

/** Adds the "is-visible" class once the element scrolls into view. */
function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const node = ref.current
    if (!node) return
    if (!('IntersectionObserver' in window)) {
      node.classList.add('is-visible')
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          node.classList.add('is-visible')
          observer.disconnect()
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])
  return (
    <div ref={ref} className={cx('reveal', className)} style={{ '--delay': `${delay}ms` } as React.CSSProperties}>
      {children}
    </div>
  )
}

function Eyebrow({ children, dark }: { children: ReactNode; dark?: boolean }) {
  return <p className={cx('text-xs font-semibold tracking-[0.2em] uppercase', dark ? 'text-honey' : 'text-honey-dark')}>{children}</p>
}

function PrimaryLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <a href={href} className={cx('inline-flex items-center justify-center gap-2 rounded-xl bg-honey px-6 py-3.5 text-[15px] font-semibold text-shell shadow-[0_10px_30px_-10px_rgb(247_185_40/0.7)] transition hover:-translate-y-0.5 hover:bg-[#ffc94a]', className)}>
      {children}
    </a>
  )
}

/* ---------- Navigation ---------- */

const LINKS = [
  { href: '#how', label: 'How it works' },
  { href: '#features', label: 'Features' },
  { href: '#who', label: 'Who it is for' },
  { href: '#faq', label: 'Questions' },
]

function Nav() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={cx('fixed inset-x-0 top-0 z-50 transition-colors duration-300', scrolled || open ? 'border-b border-white/10 bg-shell/85 backdrop-blur-md' : 'border-b border-transparent')}>
      <div className="mx-auto flex h-[68px] max-w-6xl items-center gap-3 px-4 sm:gap-6 sm:px-5">
        <a href="#top" className="flex items-center gap-2.5" aria-label="Bee Hive Keep, back to top">
          <Logo size={34} />
          <span className="text-[15px] font-extrabold tracking-[0.1em] whitespace-nowrap sm:text-lg sm:tracking-[0.12em]">
            <span className="text-honey">BEE HIVE</span> KEEP
          </span>
        </a>
        <nav aria-label="Page sections" className="ml-auto hidden items-center gap-7 text-sm text-slate-200 lg:flex">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="transition hover:text-white">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1.5 sm:gap-2.5 lg:ml-0">
          <a href="#contact" className="rounded-lg bg-honey px-3 py-2 text-[13px] font-semibold whitespace-nowrap text-shell transition hover:bg-[#ffc94a] sm:px-4 sm:text-sm">
            Request a demo
          </a>
          <button onClick={() => setOpen((v) => !v)} aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} className="rounded-lg p-2 hover:bg-white/10 lg:hidden">
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
      {open && (
        <nav aria-label="Page sections" className="border-t border-white/10 px-5 py-3 lg:hidden">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2.5 text-[15px] text-slate-100 hover:bg-white/10">
              {l.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  )
}

/* ---------- Hero ---------- */

const HERO_READINGS: Array<{ icon: ReactNode; label: string; value: string }> = [
  { icon: <Thermometer size={13} />, label: 'Temperature', value: '34.1 °C' },
  { icon: <Droplet size={13} />, label: 'Humidity', value: '58%' },
  { icon: <Weight size={13} />, label: 'Weight', value: '42.3 kg' },
]

function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-[68px]">
      <div className="glow pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="comb pointer-events-none absolute inset-0" aria-hidden="true" />

      <div className="relative mx-auto max-w-6xl px-5 pt-16 text-center sm:pt-24">
        <Reveal>
          <p className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium text-slate-100">
            <span className="pulse-dot h-2 w-2 rounded-full bg-ok" /> Smart hive monitoring, from sensor to field team
          </p>
          <h1 className="mx-auto mt-6 max-w-4xl text-[42px] leading-[1.04] font-extrabold tracking-tight text-balance sm:text-6xl lg:text-7xl">
            Know every hive. <span className="honey-text block pb-1">Before it needs you.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-pretty text-slate-300">
            Bee Hive Keep connects sensors inside your hives to one command center. Your team sees the health of every colony and gets a clear alert when one needs a visit.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3.5">
            <PrimaryLink href="#contact">
              Request a demo <ArrowRight size={18} />
            </PrimaryLink>
            <a href="#how" className="inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-[15px] font-semibold text-white ring-1 ring-white/25 transition hover:bg-white/10">
              See how it works <ArrowDown size={18} />
            </a>
          </div>
        </Reveal>

        <Reveal delay={150} className="relative mx-auto mt-14 max-w-5xl pb-16 sm:mt-20 sm:pb-24">
          <div className="window">
            <div className="flex items-center gap-2 border-b border-white/10 bg-[#0e2035] px-4 py-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
              <span className="ml-3 truncate rounded-md bg-white/5 px-3 py-1 text-[11px] text-slate-400">Bee Hive Keep · Control Command Center</span>
            </div>
            <img src={screenDashboard} alt="The Bee Hive Keep dashboard: a map of hive locations with health status, live hive feed and recent alerts" width={2160} height={1350} className="block w-full" fetchPriority="high" />
          </div>

          <div className="float absolute top-[18%] -left-4 hidden w-[230px] rounded-xl border border-white/15 bg-[#0e2035]/95 p-3.5 text-left shadow-2xl backdrop-blur lg:block xl:-left-16" aria-hidden="true">
            <div className="flex items-center gap-2 text-xs font-semibold text-warn">
              <TriangleAlert size={16} /> Swarming risk
            </div>
            <p className="mt-1.5 text-sm font-semibold">Hive TMR-007 · Tumkur</p>
            <p className="mt-0.5 text-xs text-slate-300">Unusual activity and rising brood temperature.</p>
            <p className="mt-2.5 rounded-md bg-white/10 px-2.5 py-1.5 text-[11px] text-slate-100">Recommended: inspect within 2 days</p>
          </div>

          <div className="float-slow absolute -right-4 bottom-[22%] hidden w-[220px] rounded-xl border border-white/15 bg-[#0e2035]/95 p-3.5 text-left shadow-2xl backdrop-blur lg:block xl:-right-16" aria-hidden="true">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Hive BGL-042</p>
              <span className="flex items-center gap-1.5 text-[11px] font-semibold text-ok">
                <span className="h-2 w-2 rounded-full bg-ok" /> Healthy
              </span>
            </div>
            <dl className="mt-2.5 space-y-1.5 text-xs">
              {HERO_READINGS.map((r) => (
                <div key={r.label} className="flex items-center gap-2 border-t border-white/10 pt-1.5">
                  <span className="text-slate-400">{r.icon}</span>
                  <dt className="text-slate-300">{r.label}</dt>
                  <dd className="ml-auto font-semibold">{r.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <p className="mt-4 text-xs text-slate-500">Screens show sample data.</p>
        </Reveal>
      </div>
    </section>
  )
}

/* ---------- Signals strip ---------- */

const SIGNALS: Array<{ icon: ReactNode; label: string }> = [
  { icon: <Thermometer size={18} />, label: 'Brood temperature' },
  { icon: <Droplet size={18} />, label: 'Humidity' },
  { icon: <Weight size={18} />, label: 'Hive weight' },
  { icon: <BeeIcon size={18} />, label: 'Bee activity' },
  { icon: <AudioLines size={18} />, label: 'Sound and vibration' },
  { icon: <CombIcon size={18} />, label: 'Brood pattern' },
  { icon: <BatteryFull size={18} />, label: 'Battery level' },
  { icon: <Wifi size={18} />, label: 'Connectivity' },
]

function Signals() {
  return (
    <section aria-label="What every hive reports" className="border-y border-white/10 bg-[#0e2035] py-5">
      <div className="marquee-wrap overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
        <ul className="marquee flex w-max gap-3">
          {[...SIGNALS, ...SIGNALS].map((s, i) => (
            <li key={i} aria-hidden={i >= SIGNALS.length} className="flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm whitespace-nowrap text-slate-100">
              <span className="text-honey">{s.icon}</span> {s.label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/* ---------- Problem ---------- */

const PROBLEMS = [
  { icon: <Radar size={24} />, title: 'Trouble starts out of sight', body: 'Swarming, heat stress and a failing queen begin inside the box, where nobody can see them.' },
  { icon: <Route size={24} />, title: 'Rounds cost time and fuel', body: 'Opening every hive on a fixed round is slow, and it disturbs colonies that were doing well.' },
  { icon: <NotebookPen size={24} />, title: 'Records are scattered', body: 'Notes sit in notebooks and phones, so no one has a view of the whole network.' },
]

function Problem() {
  return (
    <section className="theme-light bg-page py-20 text-ink sm:py-28">
      <div className="mx-auto max-w-6xl px-5">
        <Reveal className="max-w-4xl">
          <Eyebrow>The problem</Eyebrow>
          <h2 className="mt-3 text-3xl leading-tight font-bold tracking-tight text-balance sm:text-[44px]">
            A colony can fail in days. <br className="hidden sm:block" />A visit schedule cannot keep up.
          </h2>
        </Reveal>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {PROBLEMS.map((p, i) => (
            <Reveal key={p.title} delay={i * 90}>
              <article className="h-full rounded-2xl border border-line bg-card p-7">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-crit-soft text-crit-text">{p.icon}</span>
                <h3 className="mt-5 text-xl font-semibold">{p.title}</h3>
                <p className="mt-2 leading-relaxed text-ink-2">{p.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------- How it works ---------- */

const STEPS = [
  { icon: <HiveIcon size={28} />, name: 'Sense', title: 'A sensor unit in every hive', body: 'It measures temperature, humidity, weight, sound and bee traffic through the day, and sends the readings to the command center.' },
  { icon: <BrainCircuit size={28} />, name: 'Understand', title: 'Each colony against its own normal', body: 'Bee Hive Keep compares every hive with its usual pattern and flags swarming risk, heat stress, weight loss and brood problems.' },
  { icon: <ClipboardList size={28} />, name: 'Act', title: 'The right keeper, the right hive', body: 'Alerts become tasks. Work is planned on a map and a calendar, and every visit is logged against the hive.' },
]

function HowItWorks() {
  return (
    <section id="how" className="relative overflow-hidden py-20 sm:py-28">
      <div className="comb pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
      <div className="relative mx-auto max-w-6xl px-5">
        <Reveal className="mx-auto max-w-3xl text-center">
          <Eyebrow dark>How it works</Eyebrow>
          <h2 className="mt-3 text-3xl leading-tight font-bold tracking-tight text-balance sm:text-[44px]">From a signal in the hive to a task in the field</h2>
        </Reveal>
        <ol className="mt-14 grid gap-5 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <Reveal key={s.name} delay={i * 110}>
              <li className="relative h-full rounded-2xl border border-white/10 bg-white/[0.04] p-7">
                <div className="flex items-center justify-between">
                  <span className="grid h-14 w-14 place-items-center rounded-2xl bg-honey text-shell">{s.icon}</span>
                  <span className="text-6xl leading-none font-extrabold text-white/10">{i + 1}</span>
                </div>
                <p className="mt-6 text-xs font-semibold tracking-[0.2em] text-honey uppercase">{s.name}</p>
                <h3 className="mt-1.5 text-xl font-semibold">{s.title}</h3>
                <p className="mt-2 leading-relaxed text-slate-300">{s.body}</p>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}

/* ---------- Features ---------- */

interface Feature {
  eyebrow: string
  title: string
  body: string
  points: string[]
  image: string
  alt: string
  width: number
  height: number
  /** The screenshot is cut off at the bottom, so it fades out instead of ending abruptly. */
  fade?: boolean
}

const FEATURES: Feature[] = [
  {
    eyebrow: 'Command center',
    title: 'One map for every hive you keep',
    body: 'See the state of each location at a glance, then open any hive in one click.',
    points: ['Colour-coded status: healthy, attention, critical, offline', 'Switch the map between health, honey yield and temperature', 'Live readings for the hive you select'],
    image: cardMap,
    alt: 'Map of hive locations with coloured status pins and a summary of one hive',
    width: 1311,
    height: 951,
  },
  {
    eyebrow: 'Colony health',
    title: 'See inside without lifting the lid',
    body: 'Frame photos and sensor patterns show how the colony is developing between inspections.',
    points: ['Brood frame analysis that marks open brood, capped brood and eggs', 'Queen status and laying pattern', 'Checks for varroa, hive beetle, wax moth and foulbrood'],
    image: cardBrood,
    alt: 'Brood frame analysis: a comb photo with cells highlighted by type, and the share of each cell type',
    width: 1384,
    height: 644,
  },
  {
    eyebrow: 'Alerts',
    title: 'Alerts that say what is wrong, and where',
    body: 'Each alert names the hive, the reading and how urgent it is, so the team knows where to go first.',
    points: ['Three levels: critical, warning and reminder', 'Acknowledge and resolve, with a full history', 'Your own limits for temperature, humidity, weight and battery'],
    image: screenAlerts,
    alt: 'Alert list with severity, hive, location and buttons to acknowledge or resolve',
    width: 1384,
    height: 1280,
    fade: true,
  },
  {
    eyebrow: 'Field work',
    title: 'Plan the week for every team',
    body: 'Turn alerts and routine checks into tasks, and follow them from planned to done.',
    points: ['Task board with owners, due dates and priority', 'Calendar of inspections and harvests', 'Field notes and photos kept with each hive'],
    image: screenTasks,
    alt: 'Task board with columns for to do, in progress and done, and a task calendar',
    width: 1664,
    height: 1120,
    fade: true,
  },
  {
    eyebrow: 'Honey',
    title: 'Know your harvest before you open the hive',
    body: 'Hive weight shows the honey flow as it happens, for one hive or the whole network.',
    points: ['Yield by hive, by location and by season', 'Progress against your season target', 'Harvest records with moisture and grade'],
    image: screenHoney,
    alt: 'Honey production page with monthly production, progress to target and yield by location',
    width: 1384,
    height: 648,
  },
]

function FeatureRow({ feature, flip }: { feature: Feature; flip: boolean }) {
  return (
    <div className={cx('grid items-center gap-8 lg:gap-14', flip ? 'lg:grid-cols-[1.12fr_1fr]' : 'lg:grid-cols-[1fr_1.12fr]')}>
      <Reveal className={cx(flip && 'lg:order-2')}>
        <Eyebrow>{feature.eyebrow}</Eyebrow>
        <h3 className="mt-3 text-2xl leading-tight font-bold tracking-tight text-balance sm:text-[34px]">{feature.title}</h3>
        <p className="mt-3 text-lg leading-relaxed text-ink-2">{feature.body}</p>
        <ul className="mt-6 space-y-3">
          {feature.points.map((p) => (
            <li key={p} className="flex items-start gap-3 text-ink">
              <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-ok text-white">
                <Check size={13} strokeWidth={3} />
              </span>
              {p}
            </li>
          ))}
        </ul>
      </Reveal>
      <Reveal delay={120} className={cx(flip && 'lg:order-1')}>
        <div className="rounded-3xl bg-gradient-to-br from-honey/30 via-honey/10 to-info/15 p-3 sm:p-5">
          <div className="shot relative bg-page">
            <img src={feature.image} alt={feature.alt} width={feature.width} height={feature.height} loading="lazy" className="block w-full" />
            {feature.fade && <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-page to-transparent" />}
          </div>
        </div>
      </Reveal>
    </div>
  )
}

const MORE: Array<{ icon: ReactNode; title: string; body: string }> = [
  { icon: <BrainCircuit size={22} />, title: 'AI insights', body: 'Risks and opportunities across the network, each with a recommended action.' },
  { icon: <FileSpreadsheet size={22} />, title: 'Reports and export', body: 'Download hive, honey, alert and keeper data as spreadsheet files.' },
  { icon: <Users size={22} />, title: 'People and communities', body: 'A directory of keepers, with the hives and training linked to each one.' },
  { icon: <Sprout size={22} />, title: 'Sustainability view', body: 'Follow pollination area, forage and colony survival alongside production.' },
  { icon: <Smartphone size={22} />, title: 'Works on any screen', body: 'The same command center on a phone in the field and a monitor in the office.' },
  { icon: <BellRing size={22} />, title: 'Your own thresholds', body: 'Decide when an alert is raised and who is told, by email or text message.' },
]

function Features() {
  return (
    <section id="features" className="theme-light bg-card py-20 text-ink sm:py-28">
      <div className="mx-auto max-w-6xl px-5">
        <Reveal className="mx-auto max-w-3xl text-center">
          <Eyebrow>Features</Eyebrow>
          <h2 className="mt-3 text-3xl leading-tight font-bold tracking-tight text-balance sm:text-[44px]">Everything your apiary needs, on one screen</h2>
        </Reveal>
        <div className="mt-16 space-y-20 sm:space-y-28">
          {FEATURES.map((f, i) => (
            <FeatureRow key={f.title} feature={f} flip={i % 2 === 1} />
          ))}
        </div>

        <Reveal className="mt-24">
          <h3 className="text-center text-2xl font-bold tracking-tight">And the rest of the toolkit</h3>
        </Reveal>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MORE.map((m, i) => (
            <Reveal key={m.title} delay={(i % 3) * 80}>
              <article className="h-full rounded-2xl border border-line bg-page p-6 transition hover:-translate-y-1 hover:shadow-lg">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-honey/25 text-honey-dark">{m.icon}</span>
                <h4 className="mt-4 text-lg font-semibold">{m.title}</h4>
                <p className="mt-1.5 leading-relaxed text-ink-2">{m.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------- Who it is for ---------- */

const AUDIENCES = [
  { icon: <HiveIcon size={24} />, title: 'Beekeepers and cooperatives', body: 'Run more hives with the same team, and visit the ones that need you.' },
  { icon: <Users size={24} />, title: 'Livelihood programmes', body: 'Support keepers across many villages and show funders what changed.' },
  { icon: <JarIcon size={24} />, title: 'Honey producers and brands', body: 'Follow yield, moisture and origin from the hive to the jar.' },
  { icon: <MapPinned size={24} />, title: 'Farms that rely on pollination', body: 'Know that the colonies placed on your land are present and strong.' },
]

function Audience() {
  return (
    <section id="who" className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5">
        <Reveal className="max-w-3xl">
          <Eyebrow dark>Who it is for</Eyebrow>
          <h2 className="mt-3 text-3xl leading-tight font-bold tracking-tight text-balance sm:text-[44px]">Built for the people who look after bees at scale</h2>
        </Reveal>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {AUDIENCES.map((a, i) => (
            <Reveal key={a.title} delay={i * 80}>
              <article className="h-full rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition hover:border-honey/60 hover:bg-white/[0.07]">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-honey/15 text-honey">{a.icon}</span>
                <h3 className="mt-5 text-lg font-semibold">{a.title}</h3>
                <p className="mt-2 leading-relaxed text-slate-300">{a.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------- Mission ---------- */

function Mission() {
  return (
    <section className="relative isolate overflow-hidden py-24 sm:py-32">
      <img src={photo('landscape-flowers.jpg')} alt="" loading="lazy" className="absolute inset-0 -z-20 h-full w-full object-cover" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-shell via-shell/85 to-shell/40" />
      <div className="mx-auto max-w-6xl px-5">
        <Reveal className="max-w-2xl">
          <p className="flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-honey uppercase">
            <Leaf size={16} className="text-ok" fill="currentColor" /> Our purpose
          </p>
          <h2 className="mt-3 text-3xl leading-tight font-bold tracking-tight text-balance sm:text-5xl">Technology for people, bees and the planet.</h2>
          <p className="mt-5 text-lg leading-relaxed text-slate-200">
            Healthy colonies pollinate the crops around them and support the families who keep them. Bee Hive Keep follows both: the health of the hive and the livelihood behind it.
          </p>
          <ul className="mt-7 flex flex-wrap gap-2.5 text-sm">
            {['Healthy bees', 'Thriving communities', 'A more sustainable future'].map((t) => (
              <li key={t} className="rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur">
                {t}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  )
}

/* ---------- FAQ ---------- */

const FAQ = [
  { q: 'What will I see in a demo?', a: 'We walk your team through the command center: the map, a single hive in detail, alerts, field tasks and honey production.' },
  { q: 'Are the screens on this page real?', a: 'Yes, they are taken from the product. The figures in them are sample data.' },
  { q: 'What does each hive report?', a: 'Brood temperature, humidity, hive weight, sound and vibration, and bee activity at the entrance. Each sensor unit also reports its battery level and connection.' },
  { q: 'Does it work on a phone?', a: 'Yes. The command center adapts to phones, tablets and desktop screens, so keepers can use it at the hive.' },
  { q: 'Can I take my data out?', a: 'Yes. Hive, honey, alert and keeper data can be downloaded as spreadsheet files from the Reports page.' },
  { q: 'How do I get a demo?', a: 'Send the form below. We will reply by email to agree a time with you.' },
]

function Faq() {
  return (
    <section id="faq" className="theme-light bg-page py-20 text-ink sm:py-28">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 lg:grid-cols-[1fr_1.5fr]">
        <Reveal>
          <Eyebrow>Questions</Eyebrow>
          <h2 className="mt-3 text-3xl leading-tight font-bold tracking-tight text-balance sm:text-[44px]">Good to know</h2>
          <p className="mt-4 text-lg leading-relaxed text-ink-2">
            Something else on your mind?{' '}
            <a href="#contact" className="font-semibold text-link underline-offset-4 hover:underline">
              Ask us in the form
            </a>
            .
          </p>
        </Reveal>
        <Reveal delay={100}>
          <div className="divide-y divide-line rounded-2xl border border-line bg-card">
            {FAQ.map((f) => (
              <details key={f.q} className="group px-6">
                <summary className="flex items-center justify-between gap-4 py-5 text-lg font-semibold">
                  {f.q}
                  <span className="faq-icon grid h-8 w-8 shrink-0 place-items-center rounded-full bg-page text-ink transition-transform duration-200">
                    <Plus size={18} />
                  </span>
                </summary>
                <p className="pb-5 leading-relaxed text-ink-2">{f.a}</p>
              </details>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ---------- Contact ---------- */

const field = 'w-full rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3 text-[15px] text-white placeholder:text-slate-400 focus:border-honey focus:outline-none'

function Label({ text, optional, children }: { text: string; optional?: boolean; children: ReactNode }) {
  return (
    <label className="block text-sm font-medium text-slate-200">
      {text} {optional && <span className="font-normal text-slate-400">(optional)</span>}
      <div className="mt-1.5">{children}</div>
    </label>
  )
}

const PROMISES: Array<{ icon: ReactNode; title: string; body: ReactNode }> = [
  { icon: <CalendarCheck size={20} />, title: 'A time that suits you', body: 'We reply by email to agree when to meet.' },
  { icon: <Eye size={20} />, title: 'Shaped around your apiary', body: 'Tell us about your hives and we will show what matters to you.' },
  {
    icon: <Mail size={20} />,
    title: 'Prefer email?',
    body: (
      <a href={`mailto:${CONTACT_EMAIL}`} className="underline underline-offset-4 hover:text-white">
        {CONTACT_EMAIL}
      </a>
    ),
  },
]

function Contact() {
  const [sent, setSent] = useState<string | null>(null)

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const get = (key: string) => String(data.get(key) ?? '').trim()
    const lines = [
      `Name: ${get('name')}`,
      `Organisation: ${get('organisation')}`,
      `Email: ${get('email')}`,
      `Phone: ${get('phone') || '-'}`,
      `Number of hives: ${get('hives')}`,
      `Location: ${get('location') || '-'}`,
      '',
      get('message') || 'I would like a demo of Bee Hive Keep.',
    ]
    const link = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`Demo request: ${get('organisation') || get('name')}`)}&body=${encodeURIComponent(lines.join('\n'))}`
    setSent(link)
    window.location.href = link
  }

  return (
    <section id="contact" className="relative overflow-hidden py-20 sm:py-28">
      <div className="glow pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="comb pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="relative mx-auto grid max-w-6xl gap-10 px-5 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        <Reveal>
          <Eyebrow dark>Request a demo</Eyebrow>
          <h2 className="mt-3 text-4xl leading-[1.05] font-extrabold tracking-tight text-balance sm:text-6xl">
            See it <span className="honey-text">for yourself.</span>
          </h2>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-slate-300">Tell us about your hives. We will reply to arrange a demo for your team.</p>
          <ul className="mt-8 space-y-4">
            {PROMISES.map((p) => (
              <li key={p.title} className="flex items-start gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-honey/15 text-honey">{p.icon}</span>
                <span>
                  <b className="block">{p.title}</b>
                  <span className="text-slate-300">{p.body}</span>
                </span>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={120}>
          <div className="rounded-3xl border border-white/15 bg-[#0e2035]/80 p-6 shadow-2xl backdrop-blur sm:p-8">
            {sent ? (
              <div role="status" className="py-8 text-center">
                <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-ok/20 text-ok">
                  <Mail size={30} />
                </span>
                <h3 className="mt-5 text-2xl font-bold">One more step: send the email</h3>
                <p className="mx-auto mt-3 max-w-sm leading-relaxed text-slate-300">Your email app should have opened with your request filled in. Press send there to reach us.</p>
                <p className="mx-auto mt-4 max-w-sm text-sm text-slate-400">
                  Nothing opened?{' '}
                  <a href={sent} className="font-semibold text-honey underline underline-offset-4">
                    Open the email again
                  </a>{' '}
                  or write to {CONTACT_EMAIL}.
                </p>
                <button onClick={() => setSent(null)} className="mt-6 rounded-lg px-4 py-2 text-sm font-medium ring-1 ring-white/25 hover:bg-white/10">
                  Back to the form
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-4">
                <h3 className="text-xl font-bold">Request a demo</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Label text="Your name">
                    <input name="name" required autoComplete="name" className={field} placeholder="Full name" />
                  </Label>
                  <Label text="Organisation">
                    <input name="organisation" required autoComplete="organization" className={field} placeholder="Apiary, cooperative or company" />
                  </Label>
                  <Label text="Email">
                    <input name="email" type="email" required autoComplete="email" className={field} placeholder="you@example.com" />
                  </Label>
                  <Label text="Phone" optional>
                    <input name="phone" type="tel" autoComplete="tel" className={field} placeholder="With country code" />
                  </Label>
                  <Label text="Number of hives">
                    <select name="hives" required defaultValue="" className={cx(field, '[&>option]:text-shell')}>
                      <option value="" disabled>
                        Choose a range
                      </option>
                      <option>1 to 50</option>
                      <option>51 to 250</option>
                      <option>251 to 1,000</option>
                      <option>More than 1,000</option>
                    </select>
                  </Label>
                  <Label text="Location" optional>
                    <input name="location" autoComplete="address-level1" className={field} placeholder="Region and country" />
                  </Label>
                </div>
                <Label text="What would you like to achieve?" optional>
                  <textarea name="message" rows={3} className={field} placeholder="For example: fewer colony losses, better harvest planning" />
                </Label>
                <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-honey px-6 py-4 text-base font-semibold text-shell transition hover:bg-[#ffc94a]">
                  Request a demo <ArrowRight size={18} />
                </button>
                <p className="text-center text-xs text-slate-400">This opens your email app with the request filled in. We use your details only to reply to you.</p>
              </form>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ---------- Footer ---------- */

/** Photos that appear on this page, directly or inside a product screenshot. */
const PHOTO_CREDITS = [
  { title: 'Field of sunflowers', author: 'BenAveling', licence: 'CC BY-SA 3.0', licenceUrl: 'https://creativecommons.org/licenses/by-sa/3.0/', source: 'https://commons.wikimedia.org/wiki/File:Field_of_sunflowers.JPG', where: 'Shown in "Our purpose".' },
  { title: 'Morača Kloster - Bienenstöcke 1', author: 'Wolfgang Sauber', licence: 'CC BY-SA 4.0', licenceUrl: 'https://creativecommons.org/licenses/by-sa/4.0', source: 'https://commons.wikimedia.org/wiki/File:Mora%C4%8Da_Kloster_-_Bienenst%C3%B6cke_1.jpg', where: 'Shown in the dashboard screenshots.' },
  { title: 'Bees at the hive entrance', author: 'shawn caza', licence: 'CC BY-SA 4.0', licenceUrl: 'https://creativecommons.org/licenses/by-sa/4.0', source: 'https://commons.wikimedia.org/wiki/File:Bees_at_the_hive_entrance.JPG', where: 'Shown in the dashboard screenshot.' },
  { title: 'Abeille (Apis mellifera) sur un pissenlit', author: 'Gzen92', licence: 'CC BY-SA 4.0', licenceUrl: 'https://creativecommons.org/licenses/by-sa/4.0', source: 'https://commons.wikimedia.org/wiki/File:Abeille_%28Apis_mellifera%29_sur_un_pissenlit_%28Taraxacum%29_%282_dioptries%29.jpg', where: 'Shown in the dashboard screenshot.' },
  { title: 'Capped worker brood', author: 'Einebillion', licence: 'CC BY 4.0', licenceUrl: 'https://creativecommons.org/licenses/by/4.0', source: 'https://commons.wikimedia.org/wiki/File:Capped_worker_brood.jpg', where: 'Shown in the brood analysis screenshot.' },
]

function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#081423] py-10 text-sm text-slate-400">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-8 gap-y-5 px-5">
        <a href="#top" className="flex items-center gap-2.5 text-white">
          <Logo size={30} />
          <span className="font-extrabold tracking-[0.12em]">
            <span className="text-honey">BEE HIVE</span> KEEP
          </span>
        </a>
        <p>Smart Hives. Healthier Bees. A Brighter Tomorrow.</p>
        <nav aria-label="Footer" className="ml-auto flex flex-wrap gap-x-6 gap-y-2">
          <a href="#contact" className="hover:text-white">
            Request a demo
          </a>
        </nav>
        <div className="w-full border-t border-white/10 pt-5 text-xs">
          <p>© 2026 Bee Hive Keep. Screens on this page show sample data.</p>
          <details className="mt-2">
            <summary className="inline-block underline decoration-white/20 underline-offset-4 hover:text-white">Photo credits</summary>
            <ul className="mt-2 space-y-1 leading-relaxed">
              {PHOTO_CREDITS.map((c) => (
                <li key={c.title}>
                  <a href={c.source} target="_blank" rel="noreferrer" className="underline decoration-white/20 underline-offset-2 hover:text-white">
                    {c.title}
                  </a>{' '}
                  by {c.author},{' '}
                  <a href={c.licenceUrl} target="_blank" rel="noreferrer" className="underline decoration-white/20 underline-offset-2 hover:text-white">
                    {c.licence}
                  </a>
                  . {c.where}
                </li>
              ))}
              <li>Photos from Wikimedia Commons, resized. Map imagery by Esri, Maxar and Earthstar Geographics.</li>
            </ul>
          </details>
        </div>
      </div>
    </footer>
  )
}

export default function Landing() {
  return (
    <>
      <a href="#contact" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rounded-lg focus:bg-honey focus:px-4 focus:py-2 focus:text-shell">
        Skip to the demo request form
      </a>
      <Nav />
      <main>
        <Hero />
        <Signals />
        <Problem />
        <HowItWorks />
        <Features />
        <Audience />
        <Mission />
        <Faq />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
