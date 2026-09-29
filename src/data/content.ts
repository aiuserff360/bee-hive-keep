// Static mock content shown across the dashboard and hive pages.

export type Severity = 'critical' | 'warning' | 'info'
export type Tone = 'ok' | 'warn' | 'crit' | 'info' | 'purple'

export interface Alert {
  id: string
  title: string
  hiveId: string
  place: string
  ago: string
  severity: Severity
}

export const ALERTS: Alert[] = [
  { id: 'a1', title: 'High Temperature', hiveId: 'KLR-018', place: 'Kolar', ago: '23 min ago', severity: 'critical' },
  { id: 'a2', title: 'Unusual Activity (Possible Swarming)', hiveId: 'TMR-007', place: 'Tumkur', ago: '1 hour ago', severity: 'warning' },
  { id: 'a3', title: 'Low Weight', hiveId: 'MND-011', place: 'Mandya', ago: '2 hours ago', severity: 'warning' },
  { id: 'a4', title: 'Hive Offline', hiveId: 'CJB-005', place: 'Chamarajanagar', ago: '3 hours ago', severity: 'critical' },
  { id: 'a5', title: 'Routine Check Due', hiveId: 'HSN-021', place: 'Hassan', ago: '5 hours ago', severity: 'info' },
]

export interface Insight {
  title: string
  body: string
  ago?: string
  tone: Tone
  icon: 'leaf' | 'alert' | 'info' | 'shield' | 'trend' | 'flower' | 'chart'
  cta?: string
  to?: string
}

export const DASHBOARD_INSIGHTS: Insight[] = [
  { title: 'Swarming Risk Detected', body: 'Unusual activity pattern in 5 hives due to rising temperatures.', tone: 'info', icon: 'trend', cta: 'View Hives', to: '/hives' },
  { title: 'Good Foraging Conditions', body: 'Floral sources are abundant in your locations this week.', tone: 'ok', icon: 'leaf', cta: 'View Details', to: '/hives/BGL-042/honey' },
  { title: 'Opportunity', body: 'Based on current trends, honey yield could be 15–20% higher next month.', tone: 'info', icon: 'chart', cta: 'See Forecast', to: '/hives/BGL-042/honey' },
]

export const HIVE_INSIGHTS: Insight[] = [
  { title: 'Colony is healthy', body: 'Strong brood activity and consistent foraging.', ago: '2 hours ago', tone: 'ok', icon: 'leaf' },
  { title: 'Honey flow increasing', body: 'Floral sources are abundant in your area.', ago: '1 day ago', tone: 'warn', icon: 'alert' },
  { title: 'Watch humidity', body: 'Humidity expected to rise this weekend.', ago: '1 day ago', tone: 'info', icon: 'info' },
  { title: 'No disease risks detected', body: 'Brood pattern and sound levels are normal.', ago: '2 days ago', tone: 'purple', icon: 'shield' },
]

export const ACTIVITY_INSIGHTS: Insight[] = [
  { title: 'Foraging activity is 22% higher than last week', body: 'Good floral availability. Consider adding a super soon.', ago: '2 hours ago', tone: 'ok', icon: 'leaf' },
  { title: 'Colony temperature stable', body: 'No signs of stress. Keep monitoring.', ago: '5 hours ago', tone: 'info', icon: 'info' },
  { title: 'Honey flow likely to peak in next 2 weeks', body: 'Based on regional floral data and hive activity.', ago: '1 day ago', tone: 'warn', icon: 'flower' },
  { title: 'No disease risk indicators', body: 'Current patterns look healthy.', ago: '1 day ago', tone: 'purple', icon: 'chart' },
]

export type Priority = 'High' | 'Medium' | 'Low'
export type TaskState = 'Pending' | 'Not Started' | 'Done'

export interface Task {
  id: string
  title: string
  due: string // ISO date
  dueLabel?: string
  priority: Priority
  assignee: string
  state: TaskState
  hiveId?: string
}

export const INITIAL_TASKS: Task[] = [
  { id: 't1', title: 'Inspect hive (full check)', due: '2026-09-27', priority: 'High', assignee: 'Ravi Kumar', state: 'Pending', hiveId: 'BGL-042' },
  { id: 't2', title: 'Check for super (honey flow)', due: '2026-09-30', priority: 'Medium', assignee: 'Field Team', state: 'Pending', hiveId: 'BGL-042' },
  { id: 't3', title: 'Varroa mite inspection', due: '2026-10-05', priority: 'High', assignee: 'Ravi Kumar', state: 'Pending', hiveId: 'BGL-042' },
  { id: 't4', title: 'Add super (if needed)', due: '2026-10-12', priority: 'Medium', assignee: 'Field Team', state: 'Not Started', hiveId: 'BGL-042' },
  { id: 't5', title: 'Queen health check', due: '2026-10-20', priority: 'Medium', assignee: 'Ravi Kumar', state: 'Not Started', hiveId: 'BGL-042' },
  { id: 't6', title: 'Prepare for winter (ventilation)', due: '2026-11-01', priority: 'Low', assignee: 'Field Team', state: 'Not Started', hiveId: 'BGL-042' },
]

export interface FieldOp {
  id: string
  title: string
  when: string
  done: boolean
}

export const INITIAL_FIELD_OPS: FieldOp[] = [
  { id: 'f1', title: 'Hive inspection – Kolar cluster', when: 'Today', done: true },
  { id: 'f2', title: 'Replace battery – Hive MND-011', when: 'Today', done: false },
  { id: 'f3', title: 'Add supers – Hassan cluster', when: 'Tomorrow', done: false },
  { id: 'f4', title: 'Training session – New beekeepers', when: '25 Sep', done: false },
]

export interface ActivityEntry {
  date: string
  title: string
  detail: string
  by: string
  team?: string
  tone: Tone
  icon: 'check' | 'drop' | 'temp' | 'box' | 'scan' | 'bee'
  image?: string
}

export const ACTIVITY_LOG: ActivityEntry[] = [
  { date: '20 Sep 2026, 09:10', title: 'Hive inspection completed', detail: 'Colony healthy. Queen seen. Good brood pattern.', by: 'Ravi Kumar', team: 'Field Team', tone: 'ok', icon: 'check', image: 'activity-inspection.jpg' },
  { date: '18 Sep 2026, 16:30', title: 'High foraging activity', detail: 'Increased bee traffic at entrance.', by: 'Auto (AI)', tone: 'info', icon: 'drop', image: 'activity-foraging.jpg' },
  { date: '17 Sep 2026, 11:20', title: 'Temperature spike detected', detail: '34.8°C (above normal). Resolved in 2 hrs.', by: 'Auto (Sensor)', tone: 'crit', icon: 'temp' },
  { date: '15 Sep 2026, 08:45', title: 'Super added', detail: 'Added 1 super (medium).', by: 'Field Team', tone: 'info', icon: 'box', image: 'activity-super.jpg' },
  { date: '12 Sep 2026, 14:20', title: 'Varroa check', detail: 'No mites detected.', by: 'Ravi Kumar', tone: 'ok', icon: 'scan', image: 'activity-varroa.jpg' },
  { date: '10 Sep 2026, 09:15', title: 'Queen activity observed', detail: 'Egg laying pattern consistent.', by: 'Auto (AI)', tone: 'purple', icon: 'bee', image: 'note-1.jpg' },
]

export const RECENT_ACTIVITY_TABLE = [
  { date: '20 Sep 2026, 09:10', activity: 'Hive inspection', by: 'Ravi Kumar', notes: 'Healthy colony, queen seen' },
  { date: '18 Sep 2026, 16:30', activity: 'Super added', by: 'Field Team', notes: 'Added 1 super' },
  { date: '15 Sep 2026, 10:05', activity: 'Sensor check', by: 'Auto', notes: 'All sensors normal' },
  { date: '12 Sep 2026, 14:20', activity: 'Varroa check', by: 'Ravi Kumar', notes: 'No signs detected' },
]

export const HIVES_RECENT_ACTIVITY: Array<{ title: string; by: string; ago: string; tone: Tone; icon: ActivityEntry['icon'] | 'alert' }> = [
  { title: 'Hive inspection completed', by: 'Field Team (Ravi)', ago: '2 hours ago', tone: 'ok', icon: 'check' },
  { title: 'Super added', by: 'Field Team (Ravi)', ago: '1 day ago', tone: 'ok', icon: 'box' },
  { title: 'Unusual temperature spike', by: 'Auto Alert (Resolved)', ago: '2 days ago', tone: 'warn', icon: 'alert' },
  { title: 'Queen activity strong', by: 'AI Insight', ago: '3 days ago', tone: 'ok', icon: 'bee' },
  { title: 'Honey flow increasing', by: 'AI Insight', ago: '4 days ago', tone: 'info', icon: 'drop' },
]

export const HARVESTS = [
  { date: '12 Sep 2026', kg: 2.4, method: 'Frame Harvest', notes: 'Good quality, low moisture' },
  { date: '14 Aug 2026', kg: 4.3, method: 'Frame Harvest', notes: 'Clean honey, good flow' },
  { date: '18 Jul 2026', kg: 4.1, method: 'Frame Harvest', notes: 'High nectar availability' },
  { date: '20 Jun 2026', kg: 3.6, method: 'Frame Harvest', notes: 'Moderate flow' },
  { date: '22 May 2026', kg: 2.8, method: 'Partial Harvest', notes: 'Early season' },
  { date: '18 Apr 2026', kg: 1.2, method: 'Sample Harvest', notes: 'Initial flow' },
]

export const PESTS = [
  { name: 'Varroa Mites', level: 'Low', note: '~ 1–2%', sub: 'Below threshold' },
  { name: 'Small Hive Beetle', level: 'Not Detected', note: 'No signs observed' },
  { name: 'Wax Moth', level: 'Not Detected', note: 'No signs observed' },
  { name: 'Foulbrood (AFB/EFB)', level: 'Not Detected', note: 'No abnormal patterns' },
  { name: 'Nosema (risk)', level: 'Low', note: 'Normal flight and foraging' },
]

export interface Recommendation {
  title: string
  body: string
  tone: Tone
}

export const BROOD_RECOMMENDATIONS: Recommendation[] = [
  { title: 'Maintain current hive management practices', body: 'Colony is healthy and developing well.', tone: 'ok' },
  { title: 'Check food stores in 5–7 days', body: 'Ensure adequate nectar/pollen availability.', tone: 'info' },
  { title: 'Re-inspect for Varroa in 2 weeks', body: 'Continue monitoring to stay below threshold.', tone: 'warn' },
  { title: 'Consider adding a super', body: 'Foraging activity is high and honey flow is increasing.', tone: 'info' },
]

export const HONEY_RECOMMENDATIONS: Recommendation[] = [
  { title: 'Plan next harvest in 2–3 weeks', body: 'Based on current honey flow trend.', tone: 'warn' },
  { title: 'Maintain floral habitat', body: 'Good flower availability. Consider native planting.', tone: 'ok' },
  { title: 'Monitor moisture content', body: 'Currently 17.2%. Harvest if < 18%.', tone: 'info' },
  { title: 'Check for super addition', body: 'Colony is strong. Consider adding a super frame.', tone: 'warn' },
  { title: 'Continue routine hive inspection', body: 'Brood and colony health are stable.', tone: 'warn' },
]

export const YIELD_FACTORS = [
  { name: 'Floral Availability', value: 85 },
  { name: 'Colony Strength', value: 78 },
  { name: 'Weather Conditions', value: 70 },
  { name: 'Disease Pressure', value: 12, lowerIsBetter: true },
  { name: 'Foraging Distance', value: 65 },
  { name: 'Queen Performance', value: 80 },
]

export const FLORAL_SOURCES = [
  { name: 'Eucalyptus', value: 42, color: '#22c55e' },
  { name: 'Neem', value: 28, color: '#eab308' },
  { name: 'Acacia', value: 15, color: '#a855f7' },
  { name: 'Sunflower', value: 8, color: '#06b6d4' },
  { name: 'Other', value: 7, color: '#9ca3af' },
]
