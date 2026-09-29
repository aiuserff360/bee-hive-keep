// Per-hive detail figures. Hive BGL-042 carries the exact values from the design;
// every other hive is derived from its health so that its pages stay plausible.

import { HARVESTS } from './content'
import { HIVES, LOCATIONS, NOW, seedOf } from './hives'
import type { Hive } from './hives'

const REFERENCE_MONTHLY = [1.2, 2.8, 3.6, 4.1, 4.3, 2.4]
const REFERENCE_TOTAL = 18.4
const round1 = (n: number) => Math.round(n * 10) / 10

/**
 * Season honey per hive. Each location's published yield is shared out among its hives,
 * weighted by health, so hive pages, keeper totals and location totals all agree.
 */
const HONEY_TOTALS: Map<string, number> = (() => {
  const totals = new Map<string, number>()
  const weightOf = (h: Hive) => (h.health === 'healthy' ? 1 : h.health === 'attention' ? 0.7 : 0.4) * (0.7 + (seedOf(h.id) % 60) / 100)
  for (const loc of LOCATIONS) {
    const hives = HIVES.filter((h) => h.locationId === loc.id)
    const rest = hives.filter((h) => h.id !== 'BGL-042')
    const pool = loc.yieldKg - (hives.length - rest.length) * REFERENCE_TOTAL
    const sum = rest.reduce((a, h) => a + weightOf(h), 0)
    for (const h of rest) totals.set(h.id, (pool * weightOf(h)) / sum)
  }
  totals.set('BGL-042', REFERENCE_TOTAL)
  return totals
})()

export interface HiveDetail {
  type: string
  established: string
  species: string
  coords: string
  lastInspection: string
  nextInspection: string
  notes: string
  healthScore: number
  scoreDelta: number
  healthWord: 'Good' | 'Fair' | 'Poor'
  broodArea: number
  queenStatus: string
  queenNote: string
  population: number
  populationTrend: string
  diseaseRisk: 'Low' | 'Medium' | 'High'
  diseaseNote: string
  monthlyHoney: number[]
  honeyTotal: number
  honeyDelta: number
  seasonTarget: number
  lastHarvest: string
  lastHarvestAgo: string
  harvests: typeof HARVESTS
  sound: string
  soundNote: string
  batteryDays: number
}

export function detailOf(hive: Hive): HiveDetail {
  const reference = hive.id === 'BGL-042'
  const factor = (HONEY_TOTALS.get(hive.id) ?? 6) / REFERENCE_TOTAL
  const monthlyHoney = REFERENCE_MONTHLY.map((v) => round1(v * factor))
  const honeyTotal = round1(monthlyHoney.reduce((a, b) => a + b, 0))
  const lastHarvestDate = new Date(2026, 8, 12)
  const daysAgo = Math.round((NOW.getTime() - lastHarvestDate.getTime()) / 86400000)

  const byHealth = {
    healthy: {
      score: reference ? 86 : 80 + (seedOf(hive.id) % 12),
      scoreDelta: reference ? 6 : 3,
      healthWord: 'Good' as const,
      brood: reference ? 68 : 60 + (seedOf(hive.id) % 12),
      queenStatus: 'Present',
      queenNote: 'Laying Well',
      population: reference ? 38000 : 32000 + (seedOf(hive.id) % 8) * 1000,
      populationTrend: 'Stable',
      risk: 'Low' as const,
      riskNote: 'No major threats',
      notes: 'Strong colony. Good brood pattern.',
      sound: 'Normal',
      soundNote: 'Stable pattern',
      honeyDelta: 22,
    },
    attention: {
      score: 62 + (seedOf(hive.id) % 10),
      scoreDelta: -2,
      healthWord: 'Fair' as const,
      brood: 48 + (seedOf(hive.id) % 8),
      queenStatus: 'Present',
      queenNote: 'Laying slowed',
      population: 24000 + (seedOf(hive.id) % 6) * 1000,
      populationTrend: 'Slight decline',
      risk: 'Medium' as const,
      riskNote: 'Monitor closely',
      notes: 'Temperature running high. Follow-up inspection needed.',
      sound: 'Elevated',
      soundNote: 'Possible swarming prep',
      honeyDelta: 6,
    },
    critical: {
      score: 34 + (seedOf(hive.id) % 10),
      scoreDelta: -9,
      healthWord: 'Poor' as const,
      brood: 28 + (seedOf(hive.id) % 8),
      queenStatus: 'Not seen',
      queenNote: 'Check urgently',
      population: 12000 + (seedOf(hive.id) % 6) * 1000,
      populationTrend: 'Declining',
      risk: 'High' as const,
      riskNote: 'Inspection required',
      notes: 'Colony under stress. Low weight and high brood temperature.',
      sound: 'Irregular',
      soundNote: 'Unsettled colony',
      honeyDelta: -14,
    },
  }[hive.health]

  return {
    type: 'Langstroth',
    established: reference ? 'Mar 2025' : ['Mar 2025', 'Jun 2025', 'Nov 2024', 'Jan 2026'][seedOf(hive.id) % 4],
    species: 'Apis mellifera',
    coords: `${hive.lat.toFixed(4)}° N, ${hive.lng.toFixed(4)}° E`,
    lastInspection: '20 Sep 2026',
    nextInspection: '27 Sep 2026',
    notes: byHealth.notes,
    healthScore: byHealth.score,
    scoreDelta: byHealth.scoreDelta,
    healthWord: byHealth.healthWord,
    broodArea: byHealth.brood,
    queenStatus: byHealth.queenStatus,
    queenNote: byHealth.queenNote,
    population: byHealth.population,
    populationTrend: byHealth.populationTrend,
    diseaseRisk: byHealth.risk,
    diseaseNote: byHealth.riskNote,
    monthlyHoney,
    honeyTotal,
    honeyDelta: byHealth.honeyDelta,
    seasonTarget: reference ? 20 : Math.max(4, Math.ceil(honeyTotal / 0.85)),
    lastHarvest: '12 Sep 2026',
    lastHarvestAgo: `${daysAgo} days ago`,
    harvests: HARVESTS.map((h, i) => ({ ...h, kg: monthlyHoney[monthlyHoney.length - 1 - i] })),
    sound: byHealth.sound,
    soundNote: byHealth.soundNote,
    batteryDays: Math.round(hive.battery / 5),
  }
}

export const TABS = [
  { slug: 'overview', label: 'Overview' },
  { slug: 'live-data', label: 'Live Data' },
  { slug: 'brood', label: 'Brood & Colony Health' },
  { slug: 'honey', label: 'Honey Production' },
  { slug: 'environment', label: 'Environment' },
  { slug: 'activity', label: 'Activity & Tasks' },
  { slug: 'history', label: 'History' },
  { slug: 'ai-insights', label: 'AI Insights' },
  { slug: 'notes', label: 'Notes' },
] as const

export type TabSlug = (typeof TABS)[number]['slug']
