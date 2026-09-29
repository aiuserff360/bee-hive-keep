import type { ReactNode } from 'react'
import { Link, NavLink, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, CalendarDays, ChevronRight, Crown, FileText, MapPin, Pencil, Share2, ShieldCheck, Target, User } from 'lucide-react'
import { ComingSoon } from '../../components/blocks'
import { Ring } from '../../components/charts'
import { BeeIcon, CombIcon, JarIcon } from '../../components/icons'
import { Button, LinkButton, Meter, Select, StatusBadge, Tag, cx } from '../../components/ui'
import { TABS, detailOf } from '../../data/detail'
import type { HiveDetail as Detail, TabSlug } from '../../data/detail'
import { hiveById, pct, statusOf } from '../../data/hives'
import type { Hive } from '../../data/hives'
import { useStore } from '../../store'
import Activity from './Activity'
import Brood from './Brood'
import Honey from './Honey'
import Overview from './Overview'

export interface TabProps {
  hive: Hive
  detail: Detail
}

/* ---------- Header statistics, one set per tab ---------- */

function HeadStat({ icon, label, children, className }: { icon?: ReactNode; label: string; children: ReactNode; className?: string }) {
  return (
    <div className={cx('flex min-w-0 items-center gap-2.5 rounded-lg border border-line px-2.5 py-2.5', className)}>
      {icon && <span className="shrink-0 self-start pt-1">{icon}</span>}
      <div className="min-w-0">
        <div className="text-[11px] leading-tight text-ink-2">{label}</div>
        {children}
      </div>
    </div>
  )
}

const big = 'mt-0.5 text-[17px] leading-tight font-bold whitespace-nowrap text-ink'
const small = 'text-[11px] text-muted'

function OverviewMeta({ hive, detail }: TabProps) {
  const items: Array<[string, ReactNode]> = [
    ['Location', detail.coords],
    ['Apiary', hive.apiary],
    ['Last Inspection', detail.lastInspection],
    ['Next Inspection', detail.nextInspection],
    ['Field Owner', hive.owner],
    [
      'Hive Notes',
      <span key="notes" className="flex items-start gap-1.5">
        <FileText size={14} className="mt-0.5 shrink-0" />
        {detail.notes}
      </span>,
    ],
  ]
  return (
    <dl className="grid flex-1 grid-cols-2 gap-x-6 gap-y-3 border-line sm:grid-cols-3 xl:border-l xl:pl-5">
      {items.map(([label, value]) => (
        <div key={label} className="min-w-0">
          <dt className="text-[11px] text-ink-2">{label}</dt>
          <dd className="mt-1 text-xs font-medium text-ink">{value}</dd>
        </div>
      ))}
    </dl>
  )
}

function BroodStats({ detail }: TabProps) {
  const up = detail.scoreDelta >= 0
  const riskTone = detail.diseaseRisk === 'Low' ? 'text-ok' : detail.diseaseRisk === 'Medium' ? 'text-warn' : 'text-crit'
  return (
    <div className="grid flex-1 grid-cols-2 gap-2 md:grid-cols-3 2xl:grid-cols-5">
      <HeadStat label="Colony Health Score" className="col-span-2 md:col-span-1">
        <div className="mt-1 flex items-center gap-3">
          <Ring value={detail.healthScore} size={60} color={detail.healthScore >= 75 ? '#16a34a' : detail.healthScore >= 55 ? '#e3a008' : '#e5484d'} />
          <span className={cx('text-xs font-semibold whitespace-nowrap', up ? 'text-ok-text' : 'text-crit-text')}>
            {up ? '↑ +' : '↓ '}
            {detail.scoreDelta}
            <span className="block text-[11px] font-normal text-ink-2">vs last week</span>
          </span>
        </div>
      </HeadStat>
      <HeadStat icon={<CombIcon size={26} className="text-honey" />} label="Brood Area">
        <div className={big}>{detail.broodArea}%</div>
        <div className="text-xs text-ink-2">of frames</div>
        <div className={small}>Optimal: 50–80%</div>
      </HeadStat>
      <HeadStat icon={<Crown size={26} className="text-honey" fill="currentColor" />} label="Queen Status">
        <div className={big}>{detail.queenStatus}</div>
        <div className="text-xs font-medium text-ok-text">{detail.queenNote}</div>
      </HeadStat>
      <HeadStat icon={<BeeIcon size={26} className="text-ink" />} label="Population Estimate">
        <div className={big}>~ {detail.population.toLocaleString()}</div>
        <div className="text-xs text-ink-2">bees</div>
        <div className="text-xs font-medium text-ok-text">{detail.populationTrend}</div>
      </HeadStat>
      <HeadStat icon={<ShieldCheck size={26} className={riskTone} />} label="Disease Risk">
        <div className={big}>{detail.diseaseRisk}</div>
        <div className="text-xs text-ink-2">{detail.diseaseNote}</div>
      </HeadStat>
    </div>
  )
}

function HoneyStats({ detail }: TabProps) {
  const reached = pct(detail.honeyTotal, detail.seasonTarget)
  const up = detail.honeyDelta >= 0
  return (
    <div className="grid flex-1 grid-cols-2 gap-2 2xl:grid-cols-4">
      <HeadStat icon={<JarIcon size={28} className="text-honey" />} label="Total Honey Collected (this season)">
        <div className={big}>{detail.honeyTotal.toFixed(1)} kg</div>
        <div className={cx('text-xs font-semibold', up ? 'text-ok-text' : 'text-crit-text')}>
          {up ? '▲ +' : '▼ '}
          {detail.honeyDelta}% <span className="block text-[11px] font-normal text-ink-2">vs last season</span>
        </div>
      </HeadStat>
      <HeadStat icon={<CombIcon size={28} className="text-honey" />} label="Avg. per Hive">
        <div className={big}>6.0 kg</div>
        <div className="text-xs text-ink-2">Network Avg: 4.8 kg</div>
      </HeadStat>
      <HeadStat icon={<Target size={28} className="text-ink" />} label="Season Target">
        <div className={big}>{detail.seasonTarget} kg</div>
        <div className="mt-1.5 flex items-center gap-2">
          <Meter value={reached} color="#e3a008" className="w-20" />
          <b className="text-xs text-ink">{reached}%</b>
        </div>
      </HeadStat>
      <HeadStat icon={<CalendarDays size={28} className="text-ink" />} label="Last Harvest">
        <div className={big}>{detail.lastHarvest}</div>
        <div className="text-xs text-ink-2">{detail.lastHarvestAgo}</div>
      </HeadStat>
    </div>
  )
}

function ActivityStats({ hive, detail }: TabProps) {
  return (
    <div className="grid flex-1 grid-cols-2 gap-2 md:grid-cols-3 2xl:grid-cols-5">
      <HeadStat icon={<BeeIcon size={26} className="text-ink" />} label="Activity">
        <div className={big}>{hive.online ? hive.activity : 'Offline'}</div>
        <div className="text-xs text-ink-2">{hive.activity === 'High' ? 'Foraging actively' : hive.activity === 'Medium' ? 'Foraging steadily' : 'Little foraging'}</div>
      </HeadStat>
      <HeadStat icon={<CombIcon size={26} className="text-honey" />} label="Colony Health">
        <div className={big}>{detail.healthWord}</div>
        <div className="text-xs text-ink-2">{detail.healthWord === 'Good' ? 'Stable brood pattern' : 'Needs follow-up'}</div>
      </HeadStat>
      <HeadStat icon={<JarIcon size={26} className="text-honey" />} label="Next Task">
        <div className={big}>Inspect Hive</div>
        <div className="text-xs text-ink-2">{detail.nextInspection}</div>
      </HeadStat>
      <HeadStat icon={<CalendarDays size={26} className="text-ink" />} label="Last Activity">
        <div className={big}>{detail.lastInspection}</div>
        <div className="text-xs text-ink-2">Hive inspection</div>
      </HeadStat>
      <HeadStat icon={<User size={26} className="text-info" fill="currentColor" />} label="Field Owner">
        <div className={big}>{hive.owner}</div>
      </HeadStat>
    </div>
  )
}

/* ---------- Page ---------- */

export default function HiveDetail() {
  const { id = '', tab = 'overview' } = useParams()
  const navigate = useNavigate()
  const { notify } = useStore()
  const hive = hiveById(id)
  const current = TABS.find((t) => t.slug === tab)

  if (!hive || !current) {
    return <ComingSoon title={hive ? 'Page not found' : `Hive ${id} not found`} note="Check the address, or go back to the list of hives." />
  }

  const detail = detailOf(hive)
  const status = statusOf(hive)
  const slug: TabSlug = current.slug
  const props: TabProps = { hive, detail }

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      notify('Link copied to clipboard')
    } catch {
      notify('Copy the address from the browser bar to share this page')
    }
  }

  return (
    <div className="space-y-3 p-3.5">
      <div className="flex flex-wrap items-center gap-2.5">
        <button onClick={() => navigate('/hives')} aria-label="Back to hives" className="rounded-md p-1 text-ink hover:bg-card">
          <ArrowLeft size={20} />
        </button>
        <nav aria-label="Breadcrumb" className="mr-auto flex flex-wrap items-center gap-2 text-[17px]">
          <Link to="/hives" className="font-medium text-link hover:underline">
            Hives
          </Link>
          <ChevronRight size={16} className="text-muted" />
          {slug === 'overview' ? (
            <h1 className="font-semibold text-ink">Hive {hive.id}</h1>
          ) : (
            <>
              <Link to={`/hives/${hive.id}`} className="font-medium text-link hover:underline">
                Hive {hive.id}
              </Link>
              <ChevronRight size={16} className="text-muted" />
              <h1 className="font-semibold text-ink">{current.label}</h1>
            </>
          )}
        </nav>
        <Button variant="outline" onClick={share}>
          <Share2 size={14} /> Share
        </Button>
        <LinkButton to={`/hives/${hive.id}/activity`}>More Actions</LinkButton>
      </div>

      <section className="flex flex-col gap-4 rounded-xl border border-line bg-card p-2.5 xl:flex-row xl:items-stretch">
        <div className="flex min-w-0 shrink-0 gap-4">
          <div className="relative shrink-0">
            <img src={hive.image} alt={`Hive ${hive.id}`} className="h-[118px] w-[140px] rounded-lg object-cover sm:w-[200px]" />
            <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 rounded bg-black/55 px-2 text-lg font-bold text-white">{hive.number}</span>
          </div>
          <div className="min-w-0 py-1 xl:w-[250px]">
            <StatusBadge status={status} />
            <div className="mt-1 flex items-center gap-2">
              <span className="text-2xl leading-tight font-bold whitespace-nowrap text-ink">Hive {hive.id}</span>
              <button onClick={() => notify('Demo only: hive names cannot be edited in this prototype')} aria-label="Rename hive" className="rounded p-1 text-ink-2 hover:bg-card-2">
                <Pencil size={15} />
              </button>
            </div>
            <p className="mt-0.5 flex items-center gap-1.5 text-[13px] text-ink">
              <MapPin size={15} fill="currentColor" />
              {hive.place}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Tag>{detail.type}</Tag>
              <Tag>{detail.species}</Tag>
              <Tag>Established: {detail.established}</Tag>
              {slug === 'overview' && <Tag>Queen Marked</Tag>}
            </div>
          </div>
        </div>
        {slug === 'brood' ? <BroodStats {...props} /> : slug === 'honey' ? <HoneyStats {...props} /> : slug === 'activity' ? <ActivityStats {...props} /> : <OverviewMeta {...props} />}
      </section>

      <div className="flex items-center gap-3">
        <nav aria-label="Hive sections" className="scroll-thin flex min-w-0 flex-1 gap-1.5 overflow-x-auto pb-1">
          {TABS.map((t) => (
            <NavLink
              key={t.slug}
              to={t.slug === 'overview' ? `/hives/${hive.id}` : `/hives/${hive.id}/${t.slug}`}
              end
              className={({ isActive }) =>
                cx('shrink-0 rounded-lg px-5 py-2 text-xs font-medium whitespace-nowrap', isActive ? 'bg-tab-active text-tab-active-ink' : 'bg-tab text-ink hover:bg-card')
              }
            >
              {t.label}
            </NavLink>
          ))}
        </nav>
        {(slug === 'brood' || slug === 'honey') && (
          <Select aria-label="Period" defaultValue="a" className="hidden shrink-0 md:inline-flex">
            {slug === 'brood' ? (
              <>
                <option value="a">Last 7 Days</option>
                <option value="b">Last 30 Days</option>
              </>
            ) : (
              <option value="a">This Season (Apr – Sep 2026)</option>
            )}
          </Select>
        )}
      </div>

      {slug === 'overview' && <Overview {...props} />}
      {slug === 'brood' && <Brood {...props} />}
      {slug === 'honey' && <Honey {...props} />}
      {slug === 'activity' && <Activity {...props} />}
      {!['overview', 'brood', 'honey', 'activity'].includes(slug) && <ComingSoon embedded title={current.label} />}
    </div>
  )
}
