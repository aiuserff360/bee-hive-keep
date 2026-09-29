import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BrainCircuit, Gauge, Lightbulb, ScanEye, ShieldAlert, Sparkles, ThumbsDown, ThumbsUp } from 'lucide-react'
import { InsightIcon } from '../components/blocks'
import { ComboChart, usePalette } from '../components/charts'
import { BarList, Bubble, Card, Chip, Meter, PageHeader, Pills, StatTile } from '../components/ui'
import type { Insight, Tone } from '../data/content'
import { HIVES, LOCATIONS } from '../data/hives'
import { useStore } from '../store'

type Category = 'Risk' | 'Health' | 'Opportunity' | 'Forecast'
type Filter = 'all' | Category

interface NetworkInsight {
  id: string
  category: Category
  priority: 'High' | 'Medium' | 'Low'
  title: string
  body: string
  action: string
  scope: string
  confidence: number
  ago: string
  icon: Insight['icon']
  tone: Tone
  to: string
  cta: string
}

const swarmRisk = LOCATIONS.map((l) => {
  const hives = HIVES.filter((h) => h.locationId === l.id)
  const hot = hives.filter((h) => h.online && h.temp > 35.5).length
  return { label: l.name, value: Math.round((hot / hives.length) * 100) }
}).sort((a, b) => b.value - a.value)

const [first, second] = swarmRisk
const firstId = LOCATIONS.find((l) => l.name === first.label)!.id
const hotInMandya = HIVES.filter((h) => h.locationId === 'mandya' && h.online && h.temp > 36).length

const INSIGHTS: NetworkInsight[] = [
  { id: 'i1', category: 'Risk', priority: 'High', title: 'Swarming risk detected in 5 hives', body: `Unusual activity pattern and rising brood temperature in ${first.label} and ${second.label} over the last 48 hours.`, action: 'Inspect for queen cells and add space within 2 days.', scope: `5 hives • ${first.label}, ${second.label}`, confidence: 87, ago: '1 hour ago', icon: 'trend', tone: 'crit', to: `/hives?location=${firstId}`, cta: 'View Hives' },
  { id: 'i2', category: 'Risk', priority: 'High', title: 'Heat stress likely in Mandya this week', body: `Forecast highs of 36–38°C. ${hotInMandya} hives in Mandya already run above the 36°C brood limit.`, action: 'Add shade and open ventilation before Thursday.', scope: `${hotInMandya} hives • Mandya`, confidence: 82, ago: '3 hours ago', icon: 'alert', tone: 'crit', to: '/hives?location=mandya', cta: 'View Hives' },
  { id: 'i3', category: 'Health', priority: 'Medium', title: 'Weight loss trend in 4 colonies', body: 'These hives lost more than 1 kg in 7 days while nearby hives gained. Robbing or a failing queen are the likely causes.', action: 'Check food stores and queen status at the next visit.', scope: '4 hives • Chamarajanagar, Shivamogga', confidence: 78, ago: '5 hours ago', icon: 'shield', tone: 'warn', to: '/health-sensors', cta: 'Open Sensors' },
  { id: 'i4', category: 'Opportunity', priority: 'Medium', title: 'Good foraging conditions', body: 'Floral sources are abundant in your locations this week. Eucalyptus and neem are in flower around Bengaluru and Hassan.', action: 'Add supers to strong colonies to capture the flow.', scope: '68 hives • Bengaluru, Hassan', confidence: 91, ago: 'Today', icon: 'leaf', tone: 'ok', to: '/hives/BGL-042/honey', cta: 'View Details' },
  { id: 'i5', category: 'Forecast', priority: 'Medium', title: 'Honey yield could be 15–20% higher next month', body: 'Based on current weight gain, floral index and last year’s October flow.', action: 'Plan harvest teams and jars for the second week of October.', scope: 'Whole network', confidence: 74, ago: 'Today', icon: 'chart', tone: 'info', to: '/honey-production', cta: 'See Forecast' },
  { id: 'i6', category: 'Health', priority: 'Low', title: 'No disease risk indicators network-wide', body: 'Brood patterns, sound signatures and flight activity are within normal limits for 93% of colonies.', action: 'Continue routine inspections.', scope: `${HIVES.filter((h) => h.health !== 'critical').length} hives`, confidence: 89, ago: '1 day ago', icon: 'shield', tone: 'purple', to: '/hives', cta: 'View Hives' },
  { id: 'i7', category: 'Opportunity', priority: 'Low', title: 'Three locations ready for expansion', body: 'Hosur, Hindupur and Shivamogga show high forage and low hive density.', action: 'Consider placing 8–10 new hives at each location.', scope: '3 locations', confidence: 69, ago: '2 days ago', icon: 'flower', tone: 'ok', to: '/map', cta: 'View on Map' },
  { id: 'i8', category: 'Forecast', priority: 'Low', title: 'Humidity expected to rise this weekend', body: 'Rain is forecast for south Karnataka. Hives with poor ventilation may exceed 66% humidity.', action: 'Check entrance reducers and bottom boards.', scope: '42 hives • Mysuru, Chamarajanagar', confidence: 72, ago: '2 days ago', icon: 'info', tone: 'info', to: '/health-sensors', cta: 'Open Sensors' },
]

const PRIORITY_TONE: Record<NetworkInsight['priority'], Tone> = { High: 'crit', Medium: 'warn', Low: 'ok' }

const MODELS = [
  { name: 'Swarm prediction', value: 87 },
  { name: 'Brood pattern analysis', value: 93 },
  { name: 'Pest and disease detection', value: 90 },
  { name: 'Yield forecast', value: 84 },
  { name: 'Queen status detection', value: 88 },
]

export default function AiInsights() {
  const c = usePalette()
  const { notify } = useStore()
  const [filter, setFilter] = useState<Filter>('all')
  const [feedback, setFeedback] = useState<Record<string, 'up' | 'down'>>({})
  const shown = INSIGHTS.filter((i) => filter === 'all' || i.category === filter)
  const count = (cat: Category) => INSIGHTS.filter((i) => i.category === cat).length

  const rate = (id: string, value: 'up' | 'down') => {
    setFeedback((f) => ({ ...f, [id]: value }))
    notify(value === 'up' ? 'Thanks, marked as helpful' : 'Thanks, marked as not helpful')
  }

  const weeks = ['Sep', 'Wk 2', 'Wk 3', 'Wk 4', 'Oct', 'Wk 6', 'Wk 7', 'Wk 8', 'Nov', 'Wk 10', 'Wk 11', 'Wk 12', 'Dec']
  const expected = [78, 86, 96, 108, 118, 114, 102, 92, 84, 78, 74, 72, 70]

  return (
    <div className="space-y-3 p-3.5">
      <PageHeader title="AI Insights" subtitle="What the models see across the network, and what to do about it" />

      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
        <StatTile icon={<Sparkles size={26} />} tone="info" label="Active Insights" value={INSIGHTS.length} footer="updated 10:12 AM" />
        <StatTile icon={<ShieldAlert size={26} />} tone="crit" label="High Priority" value={INSIGHTS.filter((i) => i.priority === 'High').length} footer="act within 2 days" />
        <StatTile icon={<ScanEye size={26} />} label="Hives Analysed" value={HIVES.filter((h) => h.online).length} footer={`of ${HIVES.length} in the network`} />
        <StatTile icon={<Gauge size={26} />} tone="ok" label="Prediction Accuracy" value="88%" footer="last 90 days" />
      </div>

      <div className="grid gap-3 2xl:grid-cols-[1.6fr_1fr]">
        <Card title="Insights and Recommendations" icon={<Lightbulb size={18} className="text-honey-dark" />}>
          <div className="mb-3">
            <Pills
              label="Filter insights"
              value={filter}
              onChange={setFilter}
              options={[
                { id: 'all', label: 'All', count: INSIGHTS.length },
                { id: 'Risk', label: 'Risk', count: count('Risk') },
                { id: 'Health', label: 'Health', count: count('Health') },
                { id: 'Opportunity', label: 'Opportunity', count: count('Opportunity') },
                { id: 'Forecast', label: 'Forecast', count: count('Forecast') },
              ]}
            />
          </div>
          <ul className="space-y-2">
            {shown.map((i) => (
              <li key={i.id} className="rounded-lg border border-line p-3">
                <div className="flex items-start gap-3">
                  <Bubble tone={i.tone} size={36}>
                    <InsightIcon name={i.icon} size={18} />
                  </Bubble>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <h3 className="text-sm font-semibold text-ink">{i.title}</h3>
                      <Chip tone={PRIORITY_TONE[i.priority]}>{i.priority} priority</Chip>
                      <span className="rounded-md bg-card-2 px-1.5 py-0.5 text-[10.5px] font-medium text-ink-2">{i.category}</span>
                      <span className="ml-auto text-[11px] whitespace-nowrap text-muted">{i.ago}</span>
                    </div>
                    <p className="mt-1 text-xs text-ink-2">{i.body}</p>
                    <p className="mt-1.5 text-xs text-ink">
                      <b>Recommended:</b> {i.action}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-ink-2">
                      <span>{i.scope}</span>
                      <span className="flex items-center gap-2">
                        Confidence
                        <Meter value={i.confidence} color={c.blue} className="w-20" />
                        <b className="text-ink tabular-nums">{i.confidence}%</b>
                      </span>
                      <span className="ml-auto flex items-center gap-1">
                        <button onClick={() => rate(i.id, 'up')} aria-label="Helpful" aria-pressed={feedback[i.id] === 'up'} className={`rounded p-1 hover:bg-card-2 ${feedback[i.id] === 'up' ? 'text-ok' : 'text-muted'}`}>
                          <ThumbsUp size={15} />
                        </button>
                        <button onClick={() => rate(i.id, 'down')} aria-label="Not helpful" aria-pressed={feedback[i.id] === 'down'} className={`rounded p-1 hover:bg-card-2 ${feedback[i.id] === 'down' ? 'text-crit' : 'text-muted'}`}>
                          <ThumbsDown size={15} />
                        </button>
                        <Link to={i.to} className="ml-2 inline-flex items-center gap-1 text-xs font-semibold text-link hover:underline">
                          {i.cta} <ArrowRight size={13} />
                        </Link>
                      </span>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <div className="grid content-start gap-3 md:grid-cols-2 2xl:grid-cols-1">
          <Card title="Swarming Risk by Location" info="Share of hives with brood temperature above 35.5°C">
            <BarList items={swarmRisk.slice(0, 8)} color={c.honey} unit="%" max={100} />
          </Card>
          <Card title="Network Yield Forecast" info="Expected weekly honey, with low and high range">
            <ComboChart
              ariaLabel="Expected weekly honey for the network over the next three months"
              labels={weeks}
              height={190}
              y={{ min: 0, max: 160, step: 40, title: 'Honey (kg/week)' }}
              series={[
                { label: 'Expected', data: expected, color: c.green, points: true, unit: ' kg' },
                { label: 'High estimate', legendLabel: 'Range (Low–High)', data: expected.map((v, i) => v + 10 + Math.min(i, 6) * 3), color: c.green, dashed: true, fill: '+1', unit: ' kg' },
                { label: 'Low estimate', data: expected.map((v, i) => v - 8 - Math.min(i, 6) * 2.5), color: c.green, dashed: true, legend: false, unit: ' kg' },
              ]}
            />
          </Card>
          <Card title="Model Performance" icon={<BrainCircuit size={18} className="text-info" />} info="Share of predictions confirmed by field inspections" className="md:col-span-2 2xl:col-span-1">
            <ul className="space-y-3.5">
              {MODELS.map((m) => (
                <li key={m.name} className="grid grid-cols-[minmax(0,1.2fr)_40px_minmax(0,1.4fr)] items-center gap-2 text-xs">
                  <span className="text-ink">{m.name}</span>
                  <b className="text-ink tabular-nums">{m.value}%</b>
                  <Meter value={m.value} color={c.blue} />
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  )
}
