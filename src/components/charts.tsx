import {
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  DoughnutController,
  Filler,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js'
import type { ChartData, ChartOptions } from 'chart.js'
import type { ReactNode } from 'react'
import { Chart, Doughnut } from 'react-chartjs-2'
import { useTheme } from '../store'
import type { Theme } from '../store'
import { Legend } from './ui'
import type { LegendItem } from './ui'

ChartJS.register(
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  DoughnutController,
  Filler,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
)

/** Series colours, stepped per theme so they hold up on each surface. */
export const PALETTE: Record<Theme, { honey: string; blue: string; green: string; purple: string; red: string; gray: string; cyan: string }> = {
  light: { honey: '#e3a008', blue: '#2f7de1', green: '#16a34a', purple: '#9a4be8', red: '#e5484d', gray: '#a3adba', cyan: '#0e9fb8' },
  dark: { honey: '#f0b429', blue: '#4a8df8', green: '#22b357', purple: '#a860f5', red: '#f0565b', gray: '#7f8ea3', cyan: '#22b8cf' },
}

const SURFACE: Record<Theme, { card: string; grid: string; tick: string; tooltipBg: string; tooltipInk: string }> = {
  light: { card: '#ffffff', grid: '#e8ecf1', tick: '#617085', tooltipBg: '#0f2137', tooltipInk: '#ffffff' },
  dark: { card: '#0f2136', grid: '#1e3552', tick: '#8fa3bb', tooltipBg: '#f1f5f9', tooltipInk: '#0f2137' },
}

export const usePalette = () => PALETTE[useTheme()]

export interface Series {
  label: string
  data: number[]
  color: string
  type?: 'line' | 'bar'
  axis?: 'y' | 'y1'
  /** 'origin' shades down to the axis, '+1' shades to the next series (used for ranges). */
  fill?: 'origin' | '+1'
  dashed?: boolean
  points?: boolean
  unit?: string
  legend?: boolean
  legendLabel?: string
  legendKind?: LegendItem['kind']
}

interface AxisSpec {
  min?: number
  max?: number
  step?: number
  title?: string
  suffix?: string
}

interface ComboChartProps {
  labels: string[]
  series: Series[]
  height?: number
  y?: AxisSpec
  y1?: AxisSpec
  stacked?: boolean
  legend?: boolean
  /** Text for an x-axis tick; return '' to leave that tick blank. */
  xTick?: (label: string, index: number) => string
  ariaLabel: string
}

/** Line, bar, mixed and stacked charts with one shared look. */
export function ComboChart({ labels, series, height = 200, y, y1, stacked, legend = true, xTick, ariaLabel }: ComboChartProps) {
  const theme = useTheme()
  const surface = SURFACE[theme]

  const data: ChartData = {
    labels,
    datasets: series.map((s) => {
      const type = s.type ?? 'line'
      if (type === 'bar') {
        return {
          type: 'bar' as const,
          label: s.label,
          data: s.data,
          backgroundColor: s.color,
          borderRadius: stacked ? 0 : 4,
          borderColor: surface.card,
          borderWidth: stacked ? { top: 2, right: 0, bottom: 0, left: 0 } : 0,
          maxBarThickness: 24,
          categoryPercentage: 0.7,
          barPercentage: 0.85,
          yAxisID: s.axis ?? 'y',
          order: 2,
          unit: s.unit,
        }
      }
      return {
        type: 'line' as const,
        label: s.label,
        data: s.data,
        borderColor: s.color,
        backgroundColor: s.fill ? `${s.color}26` : s.color,
        borderWidth: s.dashed ? 1.5 : 2,
        borderDash: s.dashed ? [5, 4] : undefined,
        tension: 0.4,
        fill: s.fill ?? false,
        pointRadius: s.points ? 4 : 0,
        pointHoverRadius: 5,
        pointBackgroundColor: s.color,
        pointBorderColor: surface.card,
        pointBorderWidth: 2,
        yAxisID: s.axis ?? 'y',
        order: 1,
        unit: s.unit,
      }
    }),
  } as ChartData

  const tickFont = { size: 11, family: "'Inter Variable', sans-serif" }
  const axis = (spec: AxisSpec | undefined, position: 'left' | 'right', drawGrid: boolean) => ({
    position,
    stacked: stacked && position === 'left',
    min: spec?.min,
    max: spec?.max,
    border: { display: false },
    grid: { color: surface.grid, drawOnChartArea: drawGrid, drawTicks: false },
    ticks: {
      color: surface.tick,
      font: tickFont,
      padding: 8,
      stepSize: spec?.step,
      maxTicksLimit: 6,
      callback: (value: string | number) => `${value}${spec?.suffix ?? ''}`,
    },
    title: spec?.title ? { display: true, text: spec.title, color: surface.tick, font: tickFont } : { display: false },
  })

  const options: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 400 },
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: surface.tooltipBg,
        titleColor: surface.tooltipInk,
        bodyColor: surface.tooltipInk,
        padding: 10,
        cornerRadius: 8,
        boxPadding: 4,
        usePointStyle: true,
        callbacks: {
          label: (ctx) => {
            const unit = (ctx.dataset as { unit?: string }).unit ?? ''
            return ` ${ctx.dataset.label}: ${ctx.formattedValue}${unit}`
          },
        },
      },
    },
    scales: {
      x: {
        stacked,
        border: { color: surface.grid },
        grid: { display: false },
        ticks: {
          color: surface.tick,
          font: tickFont,
          maxRotation: 0,
          autoSkip: !xTick,
          autoSkipPadding: 12,
          callback: (_value, index) => (xTick ? xTick(labels[index], index) : labels[index]),
        },
      },
      y: axis(y, 'left', true),
      ...(y1 ? { y1: axis(y1, 'right', false) } : {}),
    },
  }

  const legendItems: LegendItem[] = series
    .filter((s) => s.legend !== false)
    .map((s) => ({ label: s.legendLabel ?? s.label, color: s.color, kind: s.legendKind ?? (s.type === 'bar' ? 'bar' : s.dashed ? 'dashed' : 'line') }))

  return (
    <div>
      <div style={{ height }} role="img" aria-label={ariaLabel}>
        <Chart type="bar" data={data} options={options} />
      </div>
      {legend && legendItems.length > 1 && <Legend items={legendItems} className="mt-3" />}
    </div>
  )
}

interface DonutProps {
  segments: Array<{ label: string; value: number; color: string }>
  size?: number
  cutout?: string
  children?: ReactNode
  ariaLabel: string
  unit?: string
}

export function Donut({ segments, size = 150, cutout = '68%', children, ariaLabel, unit = '' }: DonutProps) {
  const theme = useTheme()
  const surface = SURFACE[theme]
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} role="img" aria-label={ariaLabel}>
      <Doughnut
        data={{
          labels: segments.map((s) => s.label),
          datasets: [
            {
              data: segments.map((s) => s.value),
              backgroundColor: segments.map((s) => s.color),
              borderColor: surface.card,
              borderWidth: 2,
              hoverOffset: 3,
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          cutout,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: surface.tooltipBg,
              titleColor: surface.tooltipInk,
              bodyColor: surface.tooltipInk,
              padding: 10,
              cornerRadius: 8,
              callbacks: { label: (ctx) => ` ${ctx.label}: ${ctx.formattedValue}${unit}` },
            },
          },
        }}
      />
      {children && <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">{children}</div>}
    </div>
  )
}

/** Small trend line without axes, for indicator tiles. */
export function Sparkline({ data, color, height = 38 }: { data: number[]; color: string; height?: number }) {
  const width = 120
  const min = Math.min(...data)
  const max = Math.max(...data)
  const span = max - min || 1
  const points = data.map((v, i) => [(i / (data.length - 1)) * width, height - 4 - ((v - min) / span) * (height - 10)] as const)
  const line = points.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  return (
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="w-full" style={{ height }} aria-hidden="true">
      <path d={`${line} L${width},${height} L0,${height} Z`} fill={color} opacity="0.14" />
      <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

/** Circular score gauge. */
export function Ring({ value, size = 76, color = '#16a34a', children }: { value: number; size?: number; color?: string; children?: ReactNode }) {
  const stroke = 7
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} role="img" aria-label={`${value} out of 100`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--card-2)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-2xl font-bold text-ink">{children ?? value}</div>
    </div>
  )
}

/** Four rising bars showing an activity level, as in the mockup. */
export function LevelBars({ level }: { level: 'High' | 'Medium' | 'Low' }) {
  const filled = level === 'High' ? 4 : level === 'Medium' ? 3 : 1
  const color = level === 'High' ? '#16a34a' : level === 'Medium' ? '#e3a008' : '#e5484d'
  return (
    <span className="inline-flex items-end gap-[3px]" aria-hidden="true">
      {[6, 10, 14, 18].map((h, i) => (
        <span key={h} className="w-[5px] rounded-[1px]" style={{ height: h, background: i < filled ? color : 'var(--line)' }} />
      ))}
    </span>
  )
}
