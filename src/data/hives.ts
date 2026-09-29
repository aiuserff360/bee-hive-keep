// Mock data for the prototype. Replace this module with API calls when a backend exists.

export type Health = 'healthy' | 'attention' | 'critical'
export type Status = Health | 'offline'
export type ActivityLevel = 'High' | 'Medium' | 'Low'

export interface Location {
  id: string
  code: string
  name: string
  state: string
  lat: number
  lng: number
  hives: number
  firstNumber: number
  status: Health
  avgTemp: number
  yieldKg: number
}

export interface Hive {
  id: string
  number: number
  locationId: string
  place: string
  health: Health
  online: boolean
  temp: number
  humidity: number
  weight: number
  weightDelta: number
  activity: ActivityLevel
  battery: number
  image: string
  lastUpdate: string
  owner: string
  apiary: string
  lat: number
  lng: number
}

/** The demo is pinned to this moment so that all mock timestamps stay consistent. */
export const NOW = new Date(2026, 8, 23, 10, 24)

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/** "23 Sep" */
export const dayMonth = (d: Date) => `${d.getDate()} ${MONTHS[d.getMonth()]}`
/** "23 Sep 2026" */
export const dayMonthYear = (d: Date, pad = false) => `${pad ? String(d.getDate()).padStart(2, '0') : d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
/** "Wed, 23 Sep 2026" */
export const weekdayDate = (d: Date) => `${WEEKDAYS[d.getDay()]}, ${dayMonthYear(d)}`
export const monthName = (d: Date) => MONTHS[d.getMonth()]
/** Reads "20 Sep 2026" without relying on browser-specific date parsing. */
export const parseDay = (text: string) => {
  const [d, m, y] = text.trim().split(' ')
  return new Date(Number(y), MONTHS.indexOf(m), Number(d))
}
export const fromIso = (iso: string) => new Date(`${iso}T00:00:00`)

export const img = (name: string) => `${import.meta.env.BASE_URL}images/${name}`

export const LOCATIONS: Location[] = [
  { id: 'bengaluru', code: 'BGL', name: 'Bengaluru', state: 'Karnataka', lat: 12.9716, lng: 77.5946, hives: 42, firstNumber: 1, status: 'healthy', avgTemp: 34.1, yieldKg: 268 },
  { id: 'chikkaballapur', code: 'CKB', name: 'Chikkaballapur', state: 'Karnataka', lat: 13.4355, lng: 77.7315, hives: 36, firstNumber: 1, status: 'attention', avgTemp: 35.2, yieldKg: 214 },
  { id: 'tumkur', code: 'TMR', name: 'Tumkur', state: 'Karnataka', lat: 13.3409, lng: 77.101, hives: 24, firstNumber: 1, status: 'healthy', avgTemp: 34.6, yieldKg: 146 },
  { id: 'kolar', code: 'KLR', name: 'Kolar', state: 'Karnataka', lat: 13.1363, lng: 78.1292, hives: 18, firstNumber: 1, status: 'attention', avgTemp: 35.8, yieldKg: 98 },
  { id: 'hassan', code: 'HSN', name: 'Hassan', state: 'Karnataka', lat: 13.0072, lng: 76.096, hives: 26, firstNumber: 1, status: 'healthy', avgTemp: 32.9, yieldKg: 171 },
  { id: 'mandya', code: 'MND', name: 'Mandya', state: 'Karnataka', lat: 12.5218, lng: 76.8951, hives: 28, firstNumber: 1, status: 'critical', avgTemp: 36.4, yieldKg: 132 },
  { id: 'ramanagara', code: 'RMN', name: 'Ramanagara', state: 'Karnataka', lat: 12.7209, lng: 77.2799, hives: 14, firstNumber: 1, status: 'attention', avgTemp: 35.1, yieldKg: 79 },
  { id: 'mysuru', code: 'MYR', name: 'Mysuru', state: 'Karnataka', lat: 12.2958, lng: 76.6394, hives: 20, firstNumber: 1, status: 'attention', avgTemp: 34.8, yieldKg: 121 },
  { id: 'chamarajanagar', code: 'CJB', name: 'Chamarajanagar', state: 'Karnataka', lat: 11.9261, lng: 76.9437, hives: 16, firstNumber: 1, status: 'critical', avgTemp: 36.9, yieldKg: 84 },
  { id: 'shivamogga', code: 'SHR', name: 'Shivamogga', state: 'Karnataka', lat: 13.9299, lng: 75.5681, hives: 10, firstNumber: 21, status: 'healthy', avgTemp: 32.4, yieldKg: 72 },
  { id: 'hosur', code: 'HSR', name: 'Hosur', state: 'Tamil Nadu', lat: 12.7409, lng: 77.8253, hives: 8, firstNumber: 1, status: 'healthy', avgTemp: 33.6, yieldKg: 54 },
  { id: 'hindupur', code: 'HDP', name: 'Hindupur', state: 'Andhra Pradesh', lat: 13.8291, lng: 77.4911, hives: 6, firstNumber: 1, status: 'healthy', avgTemp: 34.9, yieldKg: 43 },
]

export const locationById = (id: string) => LOCATIONS.find((l) => l.id === id)!

// Small deterministic random generator, so the mock network is the same on every load.
export function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const round1 = (n: number) => Math.round(n * 10) / 10
const pad3 = (n: number) => String(n).padStart(3, '0')

/** Hives that appear in the design mockups, with their exact values. */
const FEATURED: Array<Partial<Hive> & { id: string; health: Health }> = [
  { id: 'BGL-042', place: 'Bengaluru Rural', health: 'healthy', temp: 34.1, humidity: 58, weight: 42.3, activity: 'High', battery: 92, weightDelta: 1.2, apiary: 'Hessarghatta Cluster', owner: 'Ravi Kumar', lat: 12.9321, lng: 77.551 },
  { id: 'TMR-007', health: 'attention', temp: 35.8, humidity: 62, weight: 38.1, activity: 'Medium' },
  { id: 'MND-011', health: 'critical', temp: 37.5, humidity: 71, weight: 28.4, activity: 'Low' },
  { id: 'HSN-021', health: 'healthy', temp: 32.9, humidity: 55, weight: 41.2, activity: 'High' },
  { id: 'KLR-018', health: 'attention', temp: 34.7, humidity: 60, weight: 36.0, activity: 'Medium' },
  { id: 'CJB-005', health: 'healthy', temp: 33.1, humidity: 56, weight: 39.8, activity: 'High' },
  { id: 'MYR-013', health: 'attention', online: false },
  { id: 'SHR-026', health: 'critical', temp: 38.2, humidity: 69, weight: 21.4, activity: 'Low' },
]

/** Three keepers per location: the first listed is the lead keeper. */
export const KEEPER_NAMES: Record<string, Array<[name: string, gender: 'F' | 'M']>> = {
  bengaluru: [['Ravi Kumar', 'M'], ['Lakshmi Devi', 'F'], ['Anita Gowda', 'F']],
  chikkaballapur: [['Meena Rao', 'F'], ['Suresh Naik', 'M'], ['Kavitha Reddy', 'F']],
  tumkur: [['Shobha Patil', 'F'], ['Manjunath Hegde', 'M'], ['Roopa Shetty', 'F']],
  kolar: [['Padma Naidu', 'F'], ['Venkatesh Murthy', 'M'], ['Geetha Rani', 'F']],
  hassan: [['Prakash Gowda', 'M'], ['Sunitha Bai', 'F'], ['Nandini Swamy', 'F']],
  mandya: [['Savitha Kumari', 'F'], ['Girish Shetty', 'M'], ['Asha Lingaiah', 'F']],
  ramanagara: [['Rekha Devi', 'F'], ['Naveen Raj', 'M'], ['Pushpa Latha', 'F']],
  mysuru: [['Deepa Prasad', 'F'], ['Mahesh Urs', 'M'], ['Vani Shankar', 'F']],
  chamarajanagar: [['Jayamma K', 'F'], ['Basavaraj M', 'M'], ['Mangala S', 'F']],
  shivamogga: [['Sharada Hegde', 'F'], ['Kiran Bhat', 'M'], ['Uma Nayak', 'F']],
  hosur: [['Lakshmi Priya', 'F'], ['Senthil Kumar', 'M'], ['Revathi M', 'F']],
  hindupur: [['Sujatha Reddy', 'F'], ['Ramesh Babu', 'M'], ['Bhavani Devi', 'F']],
}
const TOTAL_ATTENTION = 32
const TOTAL_CRITICAL = 18
const TOTAL_OFFLINE = 5

function buildHives(): Hive[] {
  const rand = mulberry32(248)
  const featuredIds = new Set(FEATURED.map((f) => f.id))

  const blank: Array<{ id: string; number: number; loc: Location }> = []
  for (const loc of LOCATIONS) {
    for (let i = 0; i < loc.hives; i++) {
      const number = loc.firstNumber + i
      blank.push({ id: `${loc.code}-${pad3(number)}`, number, loc })
    }
  }

  // Decide health for the generated hives so that network totals match the dashboard.
  const others = blank.filter((b) => !featuredIds.has(b.id))
  const weight = (loc: Location) => (loc.status === 'critical' ? 3 : loc.status === 'attention' ? 1.6 : 1)
  const ranked = others
    .map((b) => ({ id: b.id, score: rand() * weight(b.loc) }))
    .sort((a, b) => b.score - a.score)
  const featuredCritical = FEATURED.filter((f) => f.health === 'critical').length
  const featuredAttention = FEATURED.filter((f) => f.health === 'attention').length
  const criticalIds = new Set(ranked.slice(0, TOTAL_CRITICAL - featuredCritical).map((r) => r.id))
  const attentionIds = new Set(
    ranked
      .slice(TOTAL_CRITICAL - featuredCritical, TOTAL_CRITICAL - featuredCritical + TOTAL_ATTENTION - featuredAttention)
      .map((r) => r.id),
  )
  const featuredOffline = FEATURED.filter((f) => f.online === false).length
  const offlineIds = new Set(
    others
      .map((b) => ({ id: b.id, score: rand() }))
      .sort((a, b) => b.score - a.score)
      .slice(0, TOTAL_OFFLINE - featuredOffline)
      .map((r) => r.id),
  )

  const between = (min: number, max: number) => min + rand() * (max - min)

  const all = blank.map((b, index): Hive => {
    const f = FEATURED.find((x) => x.id === b.id)
    const health: Health = f?.health ?? (criticalIds.has(b.id) ? 'critical' : attentionIds.has(b.id) ? 'attention' : 'healthy')
    const online = f ? f.online !== false : !offlineIds.has(b.id)
    const ranges = {
      healthy: { t: [32, 35.4], h: [52, 62], w: [36, 44], a: ['High', 'High', 'Medium'] },
      attention: { t: [34.5, 36.6], h: [58, 66], w: [31, 40], a: ['Medium', 'Medium', 'Low'] },
      critical: { t: [37, 38.8], h: [66, 74], w: [20, 30], a: ['Low'] },
    }[health]
    const minute = Math.floor(between(0, 22))
    return {
      id: b.id,
      number: b.number,
      locationId: b.loc.id,
      place: f?.place ?? b.loc.name,
      health,
      online,
      temp: f?.temp ?? round1(between(ranges.t[0], ranges.t[1])),
      humidity: f?.humidity ?? Math.round(between(ranges.h[0], ranges.h[1])),
      weight: f?.weight ?? round1(between(ranges.w[0], ranges.w[1])),
      weightDelta: f?.weightDelta ?? round1(between(health === 'critical' ? -1.4 : 0.2, health === 'critical' ? -0.2 : 1.6)),
      activity: f?.activity ?? (ranges.a[Math.floor(rand() * ranges.a.length)] as ActivityLevel),
      battery: f?.battery ?? Math.round(between(health === 'critical' ? 18 : 55, 98)),
      image: img(`hive-${(index % 8) + 1}.jpg`),
      lastUpdate: online ? `10:${String(minute).padStart(2, '0')} AM, 23 Sep 2026` : '06:41 PM, 21 Sep 2026',
      owner: f?.owner ?? KEEPER_NAMES[b.loc.id][Math.floor(rand() * 3)][0],
      apiary: f?.apiary ?? `${b.loc.name} Cluster`,
      lat: f?.lat ?? round4(b.loc.lat + between(-0.08, 0.08)),
      lng: f?.lng ?? round4(b.loc.lng + between(-0.08, 0.08)),
    }
  })

  // Mockup hives first (each with its own photo), then the rest of the network.
  const featured = FEATURED.map((f, i) => ({ ...all.find((h) => h.id === f.id)!, image: img(`hive-${i + 1}.jpg`) }))
  return [...featured, ...all.filter((h) => !featuredIds.has(h.id))]
}

function round4(n: number) {
  return Math.round(n * 10000) / 10000
}

export const HIVES: Hive[] = buildHives()

export const hiveById = (id: string) => HIVES.find((h) => h.id === id)

export const statusOf = (hive: Hive): Status => (hive.online ? hive.health : 'offline')

export const STATUS_LABEL: Record<Status, string> = {
  healthy: 'Healthy',
  attention: 'Attention',
  critical: 'Critical',
  offline: 'Offline',
}

export const STATUS_COLOR: Record<Status, string> = {
  healthy: '#22c55e',
  attention: '#f5b91f',
  critical: '#ef4444',
  offline: '#9ca3af',
}

const count = (pred: (h: Hive) => boolean) => HIVES.filter(pred).length

export const NETWORK = {
  total: HIVES.length,
  healthy: count((h) => h.health === 'healthy'),
  attention: count((h) => h.health === 'attention'),
  critical: count((h) => h.health === 'critical'),
  offline: count((h) => !h.online),
  activeColonies: 238,
  locations: LOCATIONS.length,
  states: new Set(LOCATIONS.map((l) => l.state)).size,
  keepers: 36,
  womenKeepers: 24,
  honeyKg: 1482,
  honeyTargetKg: 2000,
  avgPerHiveKg: 6.0,
}

export const pct = (part: number, whole: number) => Math.round((part / whole) * 100)

/** Deterministic wavy series, used for every trend chart in the prototype. */
export function series(seed: number, points: number, base: number, swing: number, drift = 0): number[] {
  const rand = mulberry32(seed)
  const phase = rand() * Math.PI * 2
  return Array.from({ length: points }, (_, i) => {
    const wave = Math.sin(phase + (i / Math.max(points - 1, 1)) * Math.PI * 2.4) * swing
    const noise = (rand() - 0.5) * swing * 0.6
    return round1(base + wave + noise + drift * (i / Math.max(points - 1, 1)))
  })
}

/** Stable numeric seed from a hive id, so each hive has its own but repeatable charts. */
export function seedOf(id: string): number {
  let h = 7
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) % 100000
  return h
}

export const LAST_7_DAYS = ['17 Sep', '18 Sep', '19 Sep', '20 Sep', '21 Sep', '22 Sep', '23 Sep']
export const SEASON_MONTHS = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep']

export type Range = '24h' | '7d' | '30d'

export const RANGE_LABEL: Record<Range, string> = {
  '24h': 'Last 24 Hours',
  '7d': 'Last 7 Days',
  '30d': 'Last 30 Days',
}

/** Axis labels for a time range that ends at the demo's "now". */
export function rangeLabels(range: Range): string[] {
  if (range === '24h') {
    return Array.from({ length: 13 }, (_, i) => {
      const d = new Date(NOW.getTime() - (12 - i) * 2 * 3600 * 1000)
      return d.toLocaleTimeString('en-US', { hour: 'numeric' })
    })
  }
  const days = range === '7d' ? 7 : 30
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(NOW.getFullYear(), NOW.getMonth(), NOW.getDate() - (days - 1 - i))
    return dayMonth(d)
  })
}
