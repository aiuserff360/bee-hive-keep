import { CloudOff, Flower2, Leaf, ShieldCheck, Sprout, Sun, Trees } from 'lucide-react'
import { ComboChart, usePalette } from '../components/charts'
import { BarList, Card, Meter, PageHeader, StatTile } from '../components/ui'
import { img } from '../data/hives'
import { CROPS, INITIATIVES, SDGS } from '../data/network'

const YEAR_MONTHS = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep']

export default function Sustainability() {
  const c = usePalette()
  return (
    <div className="space-y-3 p-3.5">
      <PageHeader title="Sustainability" subtitle="What the hives give back to the land and the people around them" />

      <section className="relative overflow-hidden rounded-xl">
        <img src={img('landscape-flowers.jpg')} alt="A field in flower near one of the apiaries" className="h-[170px] w-full object-cover" />
        <div className="absolute inset-0 flex flex-col justify-center bg-gradient-to-r from-shell/90 via-shell/60 to-transparent px-6 text-white">
          <p className="flex items-center gap-2 text-xs font-semibold tracking-widest text-honey">
            <Leaf size={16} fill="currentColor" className="text-ok" /> BEES MAKE A BETTER TOMORROW
          </p>
          <p className="mt-2 max-w-xl text-xl leading-snug font-semibold sm:text-2xl">248 hives pollinate an estimated 1,240 hectares of crops and forest edge.</p>
          <p className="mt-1 max-w-xl text-xs text-slate-200">Estimates use a 1.2 km foraging radius per apiary and overlap between neighbouring apiaries.</p>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 2xl:grid-cols-6">
        <StatTile icon={<Flower2 size={26} />} label="Pollination Area" value="1,240 ha" delta="+14%" deltaNote="vs last year" />
        <StatTile icon={<Sprout size={26} />} tone="ok" label="Crops Benefitted" value="18" footer="on 640 farms" />
        <StatTile icon={<ShieldCheck size={26} />} tone="info" label="Pesticide-free Zones" value="9 / 12" footer="locations with a buffer" />
        <StatTile icon={<Trees size={26} />} tone="ok" label="Trees Planted" value="3,600" footer="target 5,000" />
        <StatTile icon={<Sun size={26} />} tone="warn" label="Solar-powered Sensors" value="92%" footer="228 of 248 hives" />
        <StatTile icon={<CloudOff size={26} />} tone="plain" label="CO₂ Avoided" value="4.1 t" footer="estimated, this year" />
      </div>

      <div className="grid gap-3 lg:grid-cols-2 2xl:grid-cols-[1.2fr_1fr_1fr]">
        <Card title="Biodiversity and Forage" info="Index from 0 to 100, based on floral diversity and forage surveys near each apiary">
          <ComboChart
            ariaLabel="Biodiversity index and forage availability over the last twelve months"
            labels={YEAR_MONTHS}
            height={220}
            y={{ min: 0, max: 100, step: 20, title: 'Index (0–100)' }}
            series={[
              { label: 'Biodiversity Index', data: [64, 65, 66, 66, 68, 70, 72, 73, 75, 76, 77, 78], color: c.green, points: true },
              { label: 'Forage Availability', data: [58, 52, 46, 50, 62, 74, 80, 78, 70, 72, 79, 84], color: c.honey, points: true },
            ]}
          />
        </Card>
        <Card title="Pollination by Crop" info="Estimated hectares within foraging range of an apiary">
          <BarList items={CROPS} color={c.green} unit=" ha" />
          <p className="mt-3 text-[11px] text-muted">The six largest of 18 crops. Together they cover 1,240 ha.</p>
        </Card>
        <Card title="Colony Survival" info="Share of colonies alive at the end of each season" className="lg:col-span-2 2xl:col-span-1">
          <ComboChart
            ariaLabel="Colony survival rate by season, compared with the regional average"
            labels={['2022', '2023', '2024', '2025', '2026']}
            height={220}
            y={{ min: 50, max: 100, step: 10, suffix: '%' }}
            series={[
              { label: 'Bee Hive Keep', data: [78, 82, 86, 90, 93], color: c.green, type: 'bar', unit: '%' },
              { label: 'Regional Average', data: [72, 73, 71, 74, 75], color: c.gray, type: 'bar', unit: '%' },
            ]}
          />
        </Card>
      </div>

      <div className="grid gap-3 2xl:grid-cols-[1fr_1.3fr]">
        <Card title="Initiatives">
          <ul className="space-y-4">
            {INITIATIVES.map((i) => (
              <li key={i.title}>
                <div className="flex items-baseline justify-between gap-3">
                  <b className="text-[13px] text-ink">{i.title}</b>
                  <b className="text-xs text-ink tabular-nums">{i.value}%</b>
                </div>
                <Meter value={i.value} color={i.value >= 70 ? '#16a34a' : '#e3a008'} className="my-1.5" />
                <p className="text-xs text-ink-2">{i.body}</p>
              </li>
            ))}
          </ul>
        </Card>
        <Card title="UN Sustainable Development Goals" info="Goals this programme contributes to">
          <ul className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-3">
            {SDGS.map((g) => (
              <li key={g.number} className="flex gap-3 rounded-lg border border-line p-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg text-lg font-extrabold text-white" style={{ background: g.color }}>
                  {g.number}
                </span>
                <span className="leading-tight">
                  <b className="block text-[13px] text-ink">{g.title}</b>
                  <span className="text-xs text-ink-2">{g.body}</span>
                </span>
              </li>
            ))}
            <li className="flex items-center gap-3 rounded-lg bg-ok-soft p-3">
              <Leaf size={26} className="shrink-0 text-ok" fill="currentColor" />
              <span className="text-xs text-ink-2">
                <b className="block text-[13px] text-ok-text">Healthy Bees. Thriving Communities.</b>A more sustainable future.
              </span>
            </li>
          </ul>
          <div className="mt-3 grid grid-cols-[1.4fr_1fr] gap-2.5">
            <img src={img('forage.jpg')} alt="Trees in blossom, good forage for bees" className="h-[120px] w-full rounded-lg object-cover" />
            <img src={img('wildflowers.jpg')} alt="Wildflowers near an apiary" className="h-[120px] w-full rounded-lg object-cover" />
          </div>
        </Card>
      </div>
      <p className="px-1 text-[11px] text-muted">All figures on this page are illustrative values for the prototype.</p>
    </div>
  )
}
