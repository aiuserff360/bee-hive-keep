// Network-wide mock data for the pages reached from the sidebar.

import { ALERTS } from './content'
import type { Severity } from './content'
import { detailOf } from './detail'
import { HIVES, KEEPER_NAMES, LOCATIONS, locationById, mulberry32 } from './hives'
import type { Hive } from './hives'

/* ---------- Alerts ---------- */

export type AlertType = 'High Temperature' | 'Low Weight' | 'Hive Offline' | 'Unusual Activity (Possible Swarming)' | 'High Humidity' | 'Low Battery' | 'Routine Check Due'

export interface NetworkAlert {
  id: string
  type: string
  hiveId: string
  place: string
  locationId: string
  severity: Severity
  minutesAgo: number
  detail: string
  resolved: boolean
}

export function agoText(minutes: number): string {
  if (minutes < 60) return `${minutes} min ago`
  if (minutes < 60 * 24) {
    const hours = Math.round(minutes / 60)
    return `${hours} hour${hours === 1 ? '' : 's'} ago`
  }
  const days = Math.round(minutes / (60 * 24))
  return `${days} day${days === 1 ? '' : 's'} ago`
}

function buildAlerts(): NetworkAlert[] {
  const rand = mulberry32(911)
  const headline = new Set(ALERTS.map((a) => a.hiveId))
  const minutes = [23, 60, 120, 180, 300]

  // The five alerts shown on the dashboard always lead the list.
  const list: NetworkAlert[] = ALERTS.map((a, i) => {
    const hive = HIVES.find((h) => h.id === a.hiveId)!
    return {
      id: a.id,
      type: a.title,
      hiveId: a.hiveId,
      place: a.place,
      locationId: hive.locationId,
      severity: a.severity,
      minutesAgo: minutes[i],
      detail: describe(a.title, hive),
      resolved: false,
    }
  })

  let n = 0
  const add = (hive: Hive, type: AlertType, severity: Severity) => {
    n += 1
    const minutesAgo = Math.round(320 + rand() * 60 * 24 * 6)
    list.push({
      id: `n${n}`,
      type,
      hiveId: hive.id,
      place: locationById(hive.locationId).name,
      locationId: hive.locationId,
      severity,
      minutesAgo,
      detail: describe(type, hive),
      resolved: minutesAgo > 60 * 24 * 3 && rand() < 0.75,
    })
  }

  for (const hive of HIVES) {
    if (hive.online && hive.battery < 30) add(hive, 'Low Battery', 'warning')
    if (headline.has(hive.id)) continue
    if (!hive.online) add(hive, 'Hive Offline', 'critical')
    else if (hive.health === 'critical') add(hive, hive.temp >= 37.8 ? 'High Temperature' : 'Low Weight', 'critical')
    else if (hive.health === 'attention' && rand() < 0.6) add(hive, hive.humidity >= 63 ? 'High Humidity' : 'Unusual Activity (Possible Swarming)', 'warning')
    else if (rand() < 0.04) add(hive, 'Routine Check Due', 'info')
  }
  return list.sort((a, b) => a.minutesAgo - b.minutesAgo)
}

function describe(type: string, hive: Hive): string {
  switch (type) {
    case 'High Temperature':
      return hive.temp > 36 ? `Brood area at ${hive.temp.toFixed(1)}°C, above the 36°C limit.` : `Brood area peaked at 36.8°C this morning. Now ${hive.temp.toFixed(1)}°C.`
    case 'Low Weight':
      return hive.weightDelta < 0 ? `Hive weight ${hive.weight.toFixed(1)} kg, down ${Math.abs(hive.weightDelta).toFixed(1)} kg in 7 days.` : `Hive weight ${hive.weight.toFixed(1)} kg, below the 30 kg minimum.`
    case 'Hive Offline':
      return hive.online ? 'Connection was lost for 40 minutes. The hive is back online.' : `No data received since ${hive.lastUpdate}.`
    case 'High Humidity':
      return `Humidity at ${hive.humidity}%, above the 62% watch level.`
    case 'Low Battery':
      return `Sensor battery at ${hive.battery}%.`
    case 'Routine Check Due':
      return 'Scheduled inspection is due this week.'
    default:
      return 'Activity pattern differs from the colony’s normal rhythm.'
  }
}

export const NETWORK_ALERTS: NetworkAlert[] = buildAlerts()

/* ---------- Keepers ---------- */

export interface Keeper {
  id: string
  name: string
  gender: 'F' | 'M'
  locationId: string
  place: string
  state: string
  role: 'Lead Keeper' | 'Keeper'
  hives: number
  since: number
  level: 'Certified' | 'Advanced' | 'Trainee'
  incomeUplift: number
  honeyKg: number
}

function buildKeepers(): Keeper[] {
  const rand = mulberry32(36)
  return LOCATIONS.flatMap((loc) =>
    KEEPER_NAMES[loc.id].map(([name, gender], i): Keeper => {
      const hives = HIVES.filter((h) => h.locationId === loc.id && h.owner === name)
      const honey = hives.reduce((sum, h) => sum + detailOf(h).honeyTotal, 0)
      const since = 2019 + Math.floor(rand() * 7)
      return {
        id: `${loc.code}-K${i + 1}`,
        name,
        gender,
        locationId: loc.id,
        place: loc.name,
        state: loc.state,
        role: i === 0 ? 'Lead Keeper' : 'Keeper',
        hives: hives.length,
        since,
        level: i === 0 ? 'Advanced' : since >= 2025 ? 'Trainee' : 'Certified',
        incomeUplift: Math.round((2400 + hives.length * 210 + rand() * 900) / 50) * 50,
        honeyKg: Math.round(honey),
      }
    }),
  )
}

export const KEEPERS: Keeper[] = buildKeepers()

export const TRAININGS = [
  { title: 'New beekeepers induction', place: 'Bengaluru', date: '25 Sep 2026', seats: '18 / 20', lead: 'Ravi Kumar' },
  { title: 'Varroa monitoring and treatment', place: 'Mandya', date: '02 Oct 2026', seats: '12 / 15', lead: 'Savitha Kumari' },
  { title: 'Honey harvesting and hygiene', place: 'Hassan', date: '09 Oct 2026', seats: '14 / 20', lead: 'Prakash Gowda' },
  { title: 'Using the hive sensor app', place: 'Online', date: '15 Oct 2026', seats: '31 / 40', lead: 'Field Team' },
]

export const STORIES = [
  { name: 'Lakshmi Devi', place: 'Bengaluru', quote: 'The alerts tell me which hive needs me first. I lose far fewer colonies than before.' },
  { name: 'Savitha Kumari', place: 'Mandya', quote: 'Our self-help group now sells honey under its own label at the weekly market.' },
  { name: 'Sharada Hegde', place: 'Shivamogga', quote: 'Beekeeping income paid for my daughter’s college admission this year.' },
]

/* ---------- Field teams ---------- */

export const TEAMS = [
  { name: 'Field Team A', lead: 'Ravi Kumar', today: 'Kolar cluster', open: 6, status: 'On site' },
  { name: 'Field Team B', lead: 'Savitha Kumari', today: 'Mandya cluster', open: 8, status: 'On site' },
  { name: 'Field Team C', lead: 'Prakash Gowda', today: 'Hassan cluster', open: 4, status: 'Travelling' },
  { name: 'Sensor Support', lead: 'Naveen Raj', today: 'Mysuru, Chamarajanagar', open: 5, status: 'On site' },
  { name: 'Training Team', lead: 'Meena Rao', today: 'Bengaluru', open: 2, status: 'Preparing' },
]

/* ---------- Honey ---------- */

export const NETWORK_MONTHLY_HONEY = [160, 185, 215, 232, 320, 370]
export const LAST_SEASON_MONTHLY_HONEY = [138, 160, 181, 196, 268, 313]

export const TOP_HIVES = [...HIVES]
  .filter((h) => h.online)
  .map((h) => ({ hive: h, honey: detailOf(h).honeyTotal }))
  .sort((a, b) => b.honey - a.honey)
  .slice(0, 8)

export const RECENT_HARVESTS = [
  { date: '21 Sep 2026', place: 'Hassan', hives: 9, kg: 38.4, grade: 'A', moisture: 17.1 },
  { date: '19 Sep 2026', place: 'Chamarajanagar', hives: 5, kg: 17.9, grade: 'A', moisture: 17.6 },
  { date: '17 Sep 2026', place: 'Bengaluru', hives: 14, kg: 61.2, grade: 'A', moisture: 17.2 },
  { date: '14 Sep 2026', place: 'Chikkaballapur', hives: 11, kg: 44.0, grade: 'B', moisture: 18.3 },
  { date: '12 Sep 2026', place: 'Tumkur', hives: 8, kg: 30.5, grade: 'A', moisture: 17.4 },
  { date: '09 Sep 2026', place: 'Mysuru', hives: 7, kg: 25.8, grade: 'A', moisture: 17.8 },
]

/* ---------- Sustainability ---------- */

export const CROPS = [
  { label: 'Sunflower', value: 310 },
  { label: 'Mango', value: 240 },
  { label: 'Coconut', value: 205 },
  { label: 'Ragi and millets', value: 170 },
  { label: 'Vegetables', value: 165 },
  { label: 'Coffee', value: 150 },
]

export const INITIATIVES = [
  { title: 'Native forage planting', body: '3,600 of 5,000 saplings planted around apiaries.', value: 72 },
  { title: 'Pesticide-free buffer zones', body: '9 of 12 locations have an agreed 500 m buffer.', value: 75 },
  { title: 'Solar-powered sensor units', body: '228 of 248 hives run fully on solar power.', value: 92 },
  { title: 'Women-led apiaries', body: '24 of 36 keepers are women.', value: 67 },
  { title: 'Plastic-free honey packaging', body: 'Glass jars used for 58% of retail volume.', value: 58 },
]

export const SDGS = [
  { number: 1, title: 'No Poverty', body: 'Extra household income for 36 keeper families.', color: '#e5243b' },
  { number: 5, title: 'Gender Equality', body: 'Two thirds of keepers are women.', color: '#ff3a21' },
  { number: 8, title: 'Decent Work', body: 'Skilled rural jobs in 12 communities.', color: '#a21942' },
  { number: 13, title: 'Climate Action', body: 'Solar sensors and tree planting.', color: '#3f7e44' },
  { number: 15, title: 'Life on Land', body: 'Pollination for 1,240 ha of crops and forest edge.', color: '#56c02b' },
]

/* ---------- Reports ---------- */

export type ReportId = 'hives' | 'honey' | 'alerts' | 'keepers' | 'summary' | 'sustainability'

export const REPORTS: Array<{ id: ReportId; title: string; body: string; period: string; updated: string; format: 'CSV' | 'PDF' }> = [
  { id: 'hives', title: 'Hive Inventory and Health', body: 'Every hive with status, latest sensor readings and keeper.', period: 'As of 23 Sep 2026', updated: 'Today, 10:24 AM', format: 'CSV' },
  { id: 'honey', title: 'Honey Yield by Location', body: 'Season yield, hives and average per hive for each location.', period: 'Apr – Sep 2026', updated: 'Today, 06:00 AM', format: 'CSV' },
  { id: 'alerts', title: 'Alerts Log', body: 'All alerts from the last 7 days with severity and status.', period: '17 – 23 Sep 2026', updated: 'Today, 10:24 AM', format: 'CSV' },
  { id: 'keepers', title: 'Keepers and Communities', body: 'Keeper directory with hives managed and honey collected.', period: 'Season 2026', updated: '21 Sep 2026', format: 'CSV' },
  { id: 'summary', title: 'Monthly Network Summary', body: 'One-page summary for management and funders.', period: 'August 2026', updated: '01 Sep 2026', format: 'PDF' },
  { id: 'sustainability', title: 'Sustainability and Impact', body: 'Pollination, biodiversity and community impact indicators.', period: 'Q2 FY 2026–27', updated: '05 Sep 2026', format: 'PDF' },
]

const csvCell = (value: string | number) => {
  const text = String(value)
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}
const toCsv = (rows: Array<Array<string | number>>) => rows.map((r) => r.map(csvCell).join(',')).join('\n')

/** Header row plus data rows for a report, optionally limited to one location. */
export function buildRows(id: ReportId, locationId = 'all'): Array<Array<string | number>> {
  const inScope = (loc: string) => locationId === 'all' || loc === locationId
  switch (id) {
    case 'hives':
      return [
        ['Hive', 'Location', 'State', 'Health', 'Online', 'Temperature (C)', 'Humidity (%)', 'Weight (kg)', 'Bee activity', 'Battery (%)', 'Keeper', 'Last update'],
        ...HIVES.filter((h) => inScope(h.locationId)).map((h) => [h.id, locationById(h.locationId).name, locationById(h.locationId).state, h.health, h.online ? 'yes' : 'no', h.temp, h.humidity, h.weight, h.activity, h.battery, h.owner, h.lastUpdate]),
      ]
    case 'honey':
      return [
        ['Location', 'State', 'Hives', 'Season yield (kg)', 'Average per hive (kg)'],
        ...LOCATIONS.filter((l) => inScope(l.id)).map((l) => [l.name, l.state, l.hives, l.yieldKg, (l.yieldKg / l.hives).toFixed(1)]),
      ]
    case 'alerts':
      return [
        ['Alert', 'Severity', 'Hive', 'Location', 'Raised', 'Status', 'Detail'],
        ...NETWORK_ALERTS.filter((a) => inScope(a.locationId)).map((a) => [a.type, a.severity, a.hiveId, a.place, agoText(a.minutesAgo), a.resolved ? 'Resolved' : 'Open', a.detail]),
      ]
    default:
      return [
        ['Keeper', 'Role', 'Location', 'State', 'Hives', 'Keeper since', 'Training level', 'Season honey (kg)'],
        ...KEEPERS.filter((k) => inScope(k.locationId)).map((k) => [k.name, k.role, k.place, k.state, k.hives, k.since, k.level, k.honeyKg]),
      ]
  }
}

export const buildCsv = (id: ReportId, locationId = 'all') => toCsv(buildRows(id, locationId))

/** Hands a text file to the browser as a download. */
export function downloadText(filename: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
