import { useState } from 'react'
import type { ReactNode } from 'react'
import { Bell, ExternalLink, Info, Plug, Ruler, SlidersHorizontal, User, Users } from 'lucide-react'
import { Avatar, Button, Card, Chip, Field, PageHeader, Td, Th, Toggle, cx, inputClass } from '../components/ui'
import { useStore } from '../store'

type Section = 'profile' | 'notifications' | 'thresholds' | 'display' | 'team' | 'integrations' | 'about'

const SECTIONS: Array<{ id: Section; label: string; icon: ReactNode }> = [
  { id: 'profile', label: 'Profile', icon: <User size={16} /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell size={16} /> },
  { id: 'thresholds', label: 'Alert Thresholds', icon: <SlidersHorizontal size={16} /> },
  { id: 'display', label: 'Units & Display', icon: <Ruler size={16} /> },
  { id: 'team', label: 'Team & Roles', icon: <Users size={16} /> },
  { id: 'integrations', label: 'Integrations', icon: <Plug size={16} /> },
  { id: 'about', label: 'About', icon: <Info size={16} /> },
]

const DEFAULTS = {
  name: 'Karan Kamal',
  email: 'karan.kamal@example.org',
  phone: '+91 90000 00000',
  language: 'English',
  notify: { critical: true, warning: true, info: false, daily: true, weekly: true, sms: true, email: true, push: false },
  limits: { tempHigh: 36, humidityHigh: 62, weightDrop: 1, batteryLow: 30, offlineHours: 24 },
  units: { temperature: '°C', weight: 'kg', time: '12-hour', density: 'Comfortable' },
}

const TEAM = [
  { name: 'Karan Kamal', role: 'Admin', scope: 'All locations', active: 'Now' },
  { name: 'Meena Rao', role: 'Programme Manager', scope: 'All locations', active: '2 hours ago' },
  { name: 'Ravi Kumar', role: 'Field Lead', scope: 'Bengaluru, Kolar', active: '35 min ago' },
  { name: 'Savitha Kumari', role: 'Field Lead', scope: 'Mandya, Mysuru', active: '1 hour ago' },
  { name: 'Naveen Raj', role: 'Sensor Technician', scope: 'All locations', active: 'Yesterday' },
  { name: 'Anita Gowda', role: 'Viewer', scope: 'Bengaluru', active: '3 days ago' },
]

const INTEGRATIONS = [
  { name: 'Weather service', body: 'Forecasts for every apiary location.', on: true },
  { name: 'SMS gateway', body: 'Text alerts to keepers without smartphones.', on: true },
  { name: 'WhatsApp alerts', body: 'Alerts and photos sent to field team groups.', on: false },
  { name: 'Accounting export', body: 'Honey sales sent to the accounts system each month.', on: false },
]

const NOTIFY_ROWS: Array<{ key: keyof typeof DEFAULTS.notify; title: string; body: string; group: string }> = [
  { key: 'critical', title: 'Critical alerts', body: 'Colony or sensor at risk. Sent at once.', group: 'What to send' },
  { key: 'warning', title: 'Warnings', body: 'Readings drifting out of range.', group: 'What to send' },
  { key: 'info', title: 'Reminders', body: 'Routine checks and scheduled tasks.', group: 'What to send' },
  { key: 'daily', title: 'Daily summary', body: 'Every morning at 07:00.', group: 'What to send' },
  { key: 'weekly', title: 'Weekly report', body: 'Every Monday at 07:00.', group: 'What to send' },
  { key: 'email', title: 'Email', body: 'karan.kamal@example.org', group: 'How to send' },
  { key: 'sms', title: 'SMS', body: '+91 90000 00000', group: 'How to send' },
  { key: 'push', title: 'Browser notifications', body: 'Shown while the dashboard is open.', group: 'How to send' },
]

const LIMIT_ROWS: Array<{ key: keyof typeof DEFAULTS.limits; title: string; body: string; min: number; max: number; step: number; unit: string }> = [
  { key: 'tempHigh', title: 'High brood temperature', body: 'Alert when the brood area is hotter than this.', min: 34, max: 40, step: 0.5, unit: '°C' },
  { key: 'humidityHigh', title: 'High humidity', body: 'Alert when hive humidity is above this.', min: 55, max: 80, step: 1, unit: '%' },
  { key: 'weightDrop', title: 'Weight loss in 7 days', body: 'Alert when a hive loses more than this.', min: 0.5, max: 5, step: 0.5, unit: ' kg' },
  { key: 'batteryLow', title: 'Low battery', body: 'Alert when the sensor battery falls below this.', min: 10, max: 50, step: 5, unit: '%' },
  { key: 'offlineHours', title: 'Hive offline', body: 'Alert when no data has arrived for this long.', min: 1, max: 72, step: 1, unit: ' h' },
]

function Row({ title, body, children }: { title: string; body?: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-3">
      <div className="min-w-[180px] flex-1">
        <div className="text-[13px] font-semibold text-ink">{title}</div>
        {body && <div className="text-xs text-ink-2">{body}</div>}
      </div>
      {children}
    </div>
  )
}

function Choice<T extends string>({ label, options, value, onChange }: { label: string; options: T[]; value: T; onChange: (v: T) => void }) {
  return (
    <div role="group" aria-label={label} className="flex overflow-hidden rounded-lg ring-1 ring-line">
      {options.map((o) => (
        <button key={o} onClick={() => onChange(o)} aria-pressed={value === o} className={cx('px-3.5 py-1.5 text-xs font-medium', value === o ? 'bg-tab-active text-tab-active-ink' : 'bg-card text-ink-2 hover:bg-card-2')}>
          {o}
        </button>
      ))}
    </div>
  )
}

export default function Settings() {
  const { notify } = useStore()
  const [section, setSection] = useState<Section>('profile')
  const [saved, setSaved] = useState(DEFAULTS)
  const [draft, setDraft] = useState(DEFAULTS)
  const [integrations, setIntegrations] = useState(INTEGRATIONS)
  const dirty = JSON.stringify(saved) !== JSON.stringify(draft)

  const save = () => {
    setSaved(draft)
    notify('Settings saved (kept until you reload the page)')
  }

  return (
    <div className="space-y-3 p-3.5">
      <PageHeader title="Settings" subtitle="Your profile, alerts and how the dashboard behaves">
        {dirty && <span className="text-xs font-medium text-warn-text">Unsaved changes</span>}
        <Button variant="outline" onClick={() => setDraft(saved)}>
          Discard
        </Button>
        <Button onClick={save} className="px-4">
          Save Changes
        </Button>
      </PageHeader>

      <div className="grid items-start gap-3 lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav aria-label="Settings sections" className="scroll-thin flex gap-1 overflow-x-auto rounded-xl border border-line bg-card p-1.5 lg:flex-col">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              aria-current={section === s.id}
              className={cx('flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] font-medium whitespace-nowrap', section === s.id ? 'bg-tab-active text-tab-active-ink' : 'text-ink hover:bg-card-2')}
            >
              {s.icon}
              {s.label}
            </button>
          ))}
        </nav>

        {section === 'profile' && (
          <Card title="Profile">
            <div className="mb-4 flex items-center gap-4">
              <Avatar name={draft.name || 'K K'} tone="honey" size={64} />
              <div>
                <div className="text-lg font-bold text-ink">{draft.name}</div>
                <Chip tone="info">Admin</Chip>
              </div>
            </div>
            <div className="grid gap-x-4 sm:grid-cols-2">
              <Field label="Full name">
                <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className={inputClass} />
              </Field>
              <Field label="Email">
                <input type="email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} className={inputClass} />
              </Field>
              <Field label="Phone">
                <input type="tel" value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} className={inputClass} />
              </Field>
              <Field label="Language">
                <select value={draft.language} onChange={(e) => setDraft({ ...draft, language: e.target.value })} className={inputClass}>
                  <option>English</option>
                  <option>ಕನ್ನಡ (Kannada)</option>
                  <option>தமிழ் (Tamil)</option>
                  <option>తెలుగు (Telugu)</option>
                  <option>हिन्दी (Hindi)</option>
                </select>
              </Field>
            </div>
            <p className="text-xs text-muted">The email address and phone number shown here are placeholders.</p>
          </Card>
        )}

        {section === 'notifications' && (
          <Card title="Notifications">
            {['What to send', 'How to send'].map((group) => (
              <section key={group} className="mb-2 last:mb-0">
                <h3 className="text-xs font-semibold tracking-wide text-muted uppercase">{group}</h3>
                <div className="divide-y divide-line">
                  {NOTIFY_ROWS.filter((r) => r.group === group).map((r) => (
                    <Row key={r.key} title={r.title} body={r.body}>
                      <Toggle label={r.title} checked={draft.notify[r.key]} onChange={(v) => setDraft({ ...draft, notify: { ...draft.notify, [r.key]: v } })} />
                    </Row>
                  ))}
                </div>
              </section>
            ))}
          </Card>
        )}

        {section === 'thresholds' && (
          <Card title="Alert Thresholds" info="These limits decide when an alert is raised">
            <div className="divide-y divide-line">
              {LIMIT_ROWS.map((r) => (
                <Row key={r.key} title={r.title} body={r.body}>
                  <div className="flex w-full max-w-[340px] items-center gap-3">
                    <input
                      type="range"
                      min={r.min}
                      max={r.max}
                      step={r.step}
                      value={draft.limits[r.key]}
                      aria-label={r.title}
                      onChange={(e) => setDraft({ ...draft, limits: { ...draft.limits, [r.key]: Number(e.target.value) } })}
                      className="h-2 flex-1 accent-[#e0a20d]"
                    />
                    <b className="w-16 text-right text-sm text-ink tabular-nums">
                      {draft.limits[r.key]}
                      {r.unit}
                    </b>
                  </div>
                </Row>
              ))}
            </div>
            <div className="mt-2 flex justify-end">
              <Button variant="outline" onClick={() => setDraft({ ...draft, limits: DEFAULTS.limits })}>
                Restore Recommended Values
              </Button>
            </div>
          </Card>
        )}

        {section === 'display' && (
          <Card title="Units & Display">
            <div className="divide-y divide-line">
              <Row title="Temperature" body="Used on every hive page and chart.">
                <Choice label="Temperature unit" options={['°C', '°F']} value={draft.units.temperature} onChange={(v) => setDraft({ ...draft, units: { ...draft.units, temperature: v } })} />
              </Row>
              <Row title="Weight" body="Used for hive weight and honey yield.">
                <Choice label="Weight unit" options={['kg', 'lb']} value={draft.units.weight} onChange={(v) => setDraft({ ...draft, units: { ...draft.units, weight: v } })} />
              </Row>
              <Row title="Time format">
                <Choice label="Time format" options={['12-hour', '24-hour']} value={draft.units.time} onChange={(v) => setDraft({ ...draft, units: { ...draft.units, time: v } })} />
              </Row>
              <Row title="Layout density" body="Compact fits more on screen.">
                <Choice label="Layout density" options={['Comfortable', 'Compact']} value={draft.units.density} onChange={(v) => setDraft({ ...draft, units: { ...draft.units, density: v } })} />
              </Row>
            </div>
            <p className="mt-2 text-xs text-muted">In this prototype these choices are stored but do not change the other pages.</p>
          </Card>
        )}

        {section === 'team' && (
          <Card
            title="Team & Roles"
            action={
              <Button onClick={() => notify('Demo only: invitations are not sent in this prototype')} className="px-3 py-1.5">
                Invite Member
              </Button>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-xs">
                <thead className="bg-card-2 text-ink-2">
                  <tr>
                    <Th>Member</Th>
                    <Th>Role</Th>
                    <Th>Access</Th>
                    <Th>Last Active</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {TEAM.map((m) => (
                    <tr key={m.name} className="hover:bg-card-2">
                      <Td>
                        <span className="flex items-center gap-2.5">
                          <Avatar name={m.name} size={28} /> <b>{m.name}</b>
                        </span>
                      </Td>
                      <Td>
                        <Chip tone={m.role === 'Admin' ? 'info' : m.role === 'Viewer' ? 'warn' : 'ok'}>{m.role}</Chip>
                      </Td>
                      <Td className="text-ink-2">{m.scope}</Td>
                      <Td className="text-ink-2">{m.active}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {section === 'integrations' && (
          <Card title="Integrations" info="Connections are for illustration. Nothing is sent from this prototype.">
            <div className="divide-y divide-line">
              {integrations.map((i) => (
                <Row key={i.name} title={i.name} body={i.body}>
                  <Chip tone={i.on ? 'ok' : 'warn'}>{i.on ? 'Connected' : 'Not connected'}</Chip>
                  <Toggle label={i.name} checked={i.on} onChange={(on) => setIntegrations((list) => list.map((x) => (x.name === i.name ? { ...x, on } : x)))} />
                </Row>
              ))}
            </div>
          </Card>
        )}

        {section === 'about' && (
          <Card title="About This Prototype">
            <dl className="divide-y divide-line text-[13px]">
              {[
                ['Product', 'Bee Hive Keep – Control Command Center'],
                ['Version', 'Prototype 0.2'],
                ['Data', 'Mock data for 248 hives in 12 locations. No live sensors are connected.'],
                ['Date shown', 'Fixed at 23 Sep 2026, 10:24 AM so that all timestamps agree.'],
                ['Map imagery', 'Esri World Imagery and OpenStreetMap'],
              ].map(([label, value]) => (
                <div key={label} className="grid gap-1 py-2.5 sm:grid-cols-[160px_1fr]">
                  <dt className="text-ink-2">{label}</dt>
                  <dd className="font-medium text-ink">{value}</dd>
                </div>
              ))}
              <div className="grid gap-1 py-2.5 sm:grid-cols-[160px_1fr]">
                <dt className="text-ink-2">Photos</dt>
                <dd className="font-medium text-ink">
                  From Wikimedia Commons under free licences.{' '}
                  <a href="https://github.com/aiuserff360/bee-hive-keep/blob/main/CREDITS.md" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-link hover:underline">
                    Photo credits <ExternalLink size={13} />
                  </a>
                </dd>
              </div>
            </dl>
          </Card>
        )}
      </div>
    </div>
  )
}
