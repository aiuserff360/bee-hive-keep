import { useState } from 'react'
import type { FormEvent } from 'react'
import { CalendarClock, Download, Eye, FileSpreadsheet, FileText, FolderOpen, Printer } from 'lucide-react'
import { Button, Card, Chip, Field, Modal, PageHeader, StatTile, Td, Th, Toggle, inputClass } from '../components/ui'
import { HIVES, LOCATIONS, NETWORK, pct } from '../data/hives'
import { KEEPERS, NETWORK_ALERTS, REPORTS, buildCsv, buildRows, downloadText } from '../data/network'
import type { ReportId } from '../data/network'
import { useStore } from '../store'

const SCHEDULES = [
  { id: 's1', title: 'Monthly Network Summary', when: '1st of every month, 06:00', to: 'Management team (4 people)', on: true },
  { id: 's2', title: 'Alerts Log', when: 'Every Monday, 07:00', to: 'Field team leads (5 people)', on: true },
  { id: 's3', title: 'Honey Yield by Location', when: 'Every 2 weeks, Friday 17:00', to: 'Karan Kamal', on: true },
  { id: 's4', title: 'Sustainability and Impact', when: 'Every quarter', to: 'Funding partners (3 people)', on: false },
]

const isCsv = (id: ReportId) => REPORTS.find((r) => r.id === id)!.format === 'CSV'
const fileName = (id: ReportId, location: string) => `bee-hive-keep-${id}${location === 'all' ? '' : `-${location}`}-2026-09-23.csv`

/** First rows of a CSV, shown as a table before downloading. */
function Preview({ id, location, onClose }: { id: ReportId; location: string; onClose: () => void }) {
  const report = REPORTS.find((r) => r.id === id)!
  const [head, ...body] = buildRows(id, location)
  return (
    <Modal title={report.title} onClose={onClose}>
      <p className="mb-2 text-xs text-muted">
        First {Math.min(8, body.length)} of {body.length} rows.
      </p>
      <div className="max-h-[300px] overflow-auto rounded-lg border border-line">
        <table className="w-full text-[11px]">
          <thead className="sticky top-0 bg-card-2 text-ink-2">
            <tr>
              {head.map((h) => (
                <Th key={String(h)} className="px-2 py-1.5">
                  {h}
                </Th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {body.slice(0, 8).map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <Td key={j} className="px-2 py-1.5 whitespace-nowrap">
                    {cell}
                  </Td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
        <Button
          onClick={() => {
            downloadText(fileName(id, location), buildCsv(id, location))
            onClose()
          }}
        >
          <Download size={14} /> Download CSV
        </Button>
      </div>
    </Modal>
  )
}

export default function Reports() {
  const { notify } = useStore()
  const [preview, setPreview] = useState<{ id: ReportId; location: string } | null>(null)
  const [schedules, setSchedules] = useState(SCHEDULES)
  const [type, setType] = useState<ReportId>('hives')
  const [location, setLocation] = useState('all')

  const download = (id: ReportId, loc = 'all') => {
    if (!isCsv(id)) {
      notify('Demo only: PDF reports are not generated in this prototype')
      return
    }
    downloadText(fileName(id, loc), buildCsv(id, loc))
    notify('Report downloaded')
  }

  const generate = (e: FormEvent) => {
    e.preventDefault()
    if (isCsv(type)) setPreview({ id: type, location })
    else notify('Demo only: PDF reports are not generated in this prototype')
  }

  const snapshot: Array<[string, string]> = [
    ['Hives in network', String(NETWORK.total)],
    ['Healthy hives', `${NETWORK.healthy} (${pct(NETWORK.healthy, NETWORK.total)}%)`],
    ['Hives needing attention', String(NETWORK.attention)],
    ['Critical hives', String(NETWORK.critical)],
    ['Sensors online', `${HIVES.filter((h) => h.online).length} of ${NETWORK.total}`],
    ['Open alerts', String(NETWORK_ALERTS.filter((a) => !a.resolved).length)],
    ['Honey this season', `${NETWORK.honeyKg.toLocaleString()} kg`],
    ['Progress to target', `${pct(NETWORK.honeyKg, NETWORK.honeyTargetKg)}%`],
    ['Keepers', `${KEEPERS.length} (${KEEPERS.filter((k) => k.gender === 'F').length} women)`],
    ['Locations', `${NETWORK.locations} in ${NETWORK.states} states`],
  ]

  return (
    <div className="space-y-3 p-3.5">
      <PageHeader title="Reports" subtitle="Download the data behind the dashboard, or schedule it to arrive by email">
        <Button variant="outline" onClick={() => window.print()}>
          <Printer size={14} /> Print This Page
        </Button>
      </PageHeader>

      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
        <StatTile icon={<FolderOpen size={26} />} label="Reports Available" value={REPORTS.length} footer="4 data files, 2 summaries" />
        <StatTile icon={<CalendarClock size={26} />} tone="info" label="Scheduled Reports" value={schedules.filter((s) => s.on).length} footer={`of ${schedules.length} set up`} />
        <StatTile icon={<Download size={26} />} tone="ok" label="Downloads" value="47" footer="in the last 30 days" />
        <StatTile icon={<FileText size={26} />} tone="plain" label="Last Generated" value="10:24 AM" footer="23 Sep 2026" />
      </div>

      <div className="grid gap-3 2xl:grid-cols-[1.7fr_1fr]">
        <Card title="Report Library">
          <ul className="grid gap-2.5 md:grid-cols-2">
            {REPORTS.map((r) => (
              <li key={r.id} className="flex flex-col rounded-lg border border-line p-3">
                <div className="flex items-start gap-3">
                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${r.format === 'CSV' ? 'bg-ok-soft text-ok-text' : 'bg-crit-soft text-crit-text'}`}>
                    {r.format === 'CSV' ? <FileSpreadsheet size={20} /> : <FileText size={20} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-[13px] font-semibold text-ink">{r.title}</h3>
                      <Chip tone={r.format === 'CSV' ? 'ok' : 'crit'}>{r.format}</Chip>
                    </div>
                    <p className="mt-0.5 text-xs text-ink-2">{r.body}</p>
                    <p className="mt-1 text-[11px] text-muted">
                      {r.period} • Updated {r.updated}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex justify-end gap-2">
                  {r.format === 'CSV' && (
                    <Button variant="outline" className="px-2.5 py-1.5" onClick={() => setPreview({ id: r.id, location: 'all' })}>
                      <Eye size={13} /> Preview
                    </Button>
                  )}
                  <Button variant="navy" className="px-2.5 py-1.5" onClick={() => download(r.id)}>
                    <Download size={13} /> Download
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <div className="grid content-start gap-3 md:grid-cols-2 2xl:grid-cols-1">
          <Card title="Build a Report">
            <form onSubmit={generate}>
              <Field label="Report type">
                <select value={type} onChange={(e) => setType(e.target.value as ReportId)} className={inputClass}>
                  {REPORTS.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title} ({r.format})
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Location">
                <select value={location} onChange={(e) => setLocation(e.target.value)} className={inputClass}>
                  <option value="all">All Locations</option>
                  {LOCATIONS.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Button type="submit" className="w-full py-2.5">
                Generate Report
              </Button>
            </form>
          </Card>
          <Card title="Network Snapshot" info="Figures as of 23 Sep 2026, 10:24 AM">
            <dl className="divide-y divide-line text-xs">
              {snapshot.map(([label, value]) => (
                <div key={label} className="flex justify-between gap-3 py-1.5">
                  <dt className="text-ink-2">{label}</dt>
                  <dd className="font-semibold text-ink tabular-nums">{value}</dd>
                </div>
              ))}
            </dl>
          </Card>
        </div>
      </div>

      <Card title="Scheduled Reports" info="Schedules are for illustration. This prototype does not send email.">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-xs">
            <thead className="bg-card-2 text-ink-2">
              <tr>
                <Th>Report</Th>
                <Th>Schedule</Th>
                <Th>Sent To</Th>
                <Th>Status</Th>
                <Th>On / Off</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {schedules.map((s) => (
                <tr key={s.id} className="hover:bg-card-2">
                  <Td className="font-semibold">{s.title}</Td>
                  <Td className="text-ink-2">{s.when}</Td>
                  <Td className="text-ink-2">{s.to}</Td>
                  <Td>
                    <Chip tone={s.on ? 'ok' : 'warn'}>{s.on ? 'Active' : 'Paused'}</Chip>
                  </Td>
                  <Td>
                    <Toggle label={`${s.title} schedule`} checked={s.on} onChange={(on) => setSchedules((list) => list.map((x) => (x.id === s.id ? { ...x, on } : x)))} />
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {preview && <Preview id={preview.id} location={preview.location} onClose={() => setPreview(null)} />}
    </div>
  )
}
