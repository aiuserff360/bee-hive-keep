import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement> & { size?: number }

/** Honeycomb cluster used as the brand mark. */
export function Logo({ size = 44 }: { size?: number }) {
  const r = 9.2
  const w = Math.sqrt(3) * r
  const centres: Array<[number, number]> = [
    [0, 0],
    [w, 0],
    [-w, 0],
    [w / 2, -1.5 * r],
    [-w / 2, -1.5 * r],
    [w / 2, 1.5 * r],
    [-w / 2, 1.5 * r],
  ]
  const hex = (cx: number, cy: number, radius: number) =>
    Array.from({ length: 6 }, (_, i) => {
      const a = (Math.PI / 3) * i + Math.PI / 6
      return `${(cx + radius * Math.cos(a)).toFixed(2)},${(cy + radius * Math.sin(a)).toFixed(2)}`
    }).join(' ')
  return (
    <svg width={size} height={size} viewBox="-28 -28 56 56" aria-hidden="true">
      {centres.map(([x, y], i) => (
        <polygon key={i} points={hex(x, y, r - 1.3)} fill="#f7b928" stroke="#f7b928" strokeWidth="1.6" strokeLinejoin="round" />
      ))}
    </svg>
  )
}

/** Box hive (Langstroth) pictogram. */
export function HiveIcon({ size = 20, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...rest}>
      <path d="M12 2.5c-3.6 0-6.2 1.3-7.4 3.2-.4.7.1 1.5.9 1.5h13c.8 0 1.300-.8.9-1.5C18.200 3.800 15.600 2.500 12 2.500z" />
      <rect x="3" y="8.600" width="18" height="3.800" rx="1.200" />
      <rect x="4" y="13.800" width="16" height="3.600" rx="1.200" />
      <path d="M5 18.800h14v1.200a1.500 1.500 0 0 1-1.500 1.500h-3.100v-1.600a2.400 2.400 0 0 0-4.800 0v1.600H6.500A1.500 1.500 0 0 1 5 20z" />
    </svg>
  )
}

/** Honey bee pictogram, top view. */
export function BeeIcon({ size = 20, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.700" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...rest}>
      <ellipse cx="12" cy="14" rx="3.600" ry="5.500" fill="currentColor" stroke="none" />
      <circle cx="12" cy="6.800" r="2.200" fill="currentColor" stroke="none" />
      <path d="M9.200 11.200C6.500 8.800 3.200 8.600 2.500 10.400c-.7 1.900 2 4.200 6.100 3.900" />
      <path d="M14.800 11.200c2.700-2.400 6-2.600 6.700-.8.7 1.900-2 4.200-6.100 3.900" />
      <path d="M10.600 4.600 9.300 2.600M13.400 4.600l1.300-2" />
      <path d="M8.700 13.300h6.600M8.600 16h6.800" stroke="var(--bee-stripe, #fff)" strokeWidth="1.300" />
    </svg>
  )
}

/** Honey jar pictogram. */
export function JarIcon({ size = 20, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...rest}>
      <rect x="5.500" y="2.500" width="13" height="3.600" rx="1.200" />
      <path d="M6 7.400h12c1.400.9 2 2.200 2 3.800v6.300a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-6.300c0-1.600.6-2.900 2-3.800zm1.500 4.100a1 1 0 0 0-1 1V16a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-3.500a1 1 0 0 0-1-1z" />
    </svg>
  )
}

/** Honeycomb (three cells) pictogram. */
export function CombIcon({ size = 20, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...rest}>
      <path d="M12 1.800l4 2.300v4.600l-4 2.300-4-2.300V4.100z" />
      <path d="M6.800 10.800l4 2.300v4.600l-4 2.300-4-2.300v-4.600z" />
      <path d="M17.200 10.800l4 2.300v4.600l-4 2.300-4-2.300v-4.600z" />
    </svg>
  )
}
