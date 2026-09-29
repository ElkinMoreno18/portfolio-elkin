import type { SVGProps } from 'react'

/**
 * Iconos propios: rejilla de 16, trazo 1.5, extremos redondeados.
 * Un único sistema en todo el sitio público (lucide queda sólo en /admin).
 */
type P = SVGProps<SVGSVGElement> & { size?: number }

function Svg({ size = 16, children, ...rest }: P) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  )
}

export const IconArrowRight = (p: P) => <Svg {...p}><path d="M3 8h10M9 4l4 4-4 4" /></Svg>
export const IconArrowUpRight = (p: P) => <Svg {...p}><path d="M5 11l6-6M6 5h5v5" /></Svg>
export const IconArrowLeft = (p: P) => <Svg {...p}><path d="M13 8H3M7 4L3 8l4 4" /></Svg>
export const IconArrowUp = (p: P) => <Svg {...p}><path d="M8 13V3M4 7l4-4 4 4" /></Svg>
export const IconDownload = (p: P) => <Svg {...p}><path d="M8 2.5v8M4.5 7L8 10.5 11.5 7M3 13.5h10" /></Svg>
export const IconCopy = (p: P) => <Svg {...p}><rect x="5.5" y="5.5" width="8" height="8" rx="1.5" /><path d="M10.5 5.5V3.5A1 1 0 0 0 9.5 2.5h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2" /></Svg>
export const IconCheck = (p: P) => <Svg {...p}><path d="M3 8.5l3.2 3L13 4.5" /></Svg>
export const IconMail = (p: P) => <Svg {...p}><rect x="2" y="3.5" width="12" height="9" rx="1.5" /><path d="M2.5 4.5L8 8.8l5.5-4.3" /></Svg>
export const IconPin = (p: P) => <Svg {...p}><path d="M8 14s4.5-4.1 4.5-7.5a4.5 4.5 0 0 0-9 0C3.5 9.9 8 14 8 14z" /><circle cx="8" cy="6.5" r="1.5" /></Svg>
export const IconMenu = (p: P) => <Svg {...p}><path d="M2.5 5h11M2.5 11h11" /></Svg>
export const IconClose = (p: P) => <Svg {...p}><path d="M4 4l8 8M12 4l-8 8" /></Svg>
export const IconPause = (p: P) => <Svg {...p}><path d="M5.5 3.5v9M10.5 3.5v9" /></Svg>
export const IconPlay = (p: P) => <Svg {...p}><path d="M5 3.5l7.5 4.5L5 12.5z" /></Svg>
export const IconReplay = (p: P) => <Svg {...p}><path d="M3 8a5 5 0 1 0 1.5-3.5M3 2.5v2.5h2.5" /></Svg>
export const IconGlobe = (p: P) => <Svg {...p}><circle cx="8" cy="8" r="5.5" /><path d="M2.5 8h11M8 2.5c1.8 1.6 2.6 3.4 2.6 5.5S9.8 11.9 8 13.5M8 2.5C6.2 4.1 5.4 5.9 5.4 8s.8 3.9 2.6 5.5" /></Svg>

/* Marcas: relleno, no trazo, siguiendo la forma oficial simplificada. */
export function IconLinkedIn({ size = 16, ...rest }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" focusable="false" {...rest}>
      <path d="M3.6 5.9h-2v7.6h2V5.9zM2.6 2.5a1.15 1.15 0 1 0 0 2.3 1.15 1.15 0 0 0 0-2.3zM14.4 9.3c0-2-1.1-3.6-3.2-3.6-1 0-1.8.5-2.2 1.1v-.9H7v7.6h2V9.6c0-1.1.6-1.9 1.6-1.9s1.5.8 1.5 1.9v3.9h2.3V9.3z" />
    </svg>
  )
}
export function IconGitHub({ size = 16, ...rest }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" focusable="false" {...rest}>
      <path d="M8 1.3a6.7 6.7 0 0 0-2.1 13c.3.1.5-.1.5-.3v-1.2c-1.9.4-2.3-.8-2.3-.8-.3-.8-.7-1-.7-1-.6-.4 0-.4 0-.4.7 0 1 .7 1 .7.6 1 1.6.7 2 .5.1-.4.2-.7.4-.9-1.5-.2-3.1-.8-3.1-3.3 0-.7.3-1.3.7-1.8-.1-.2-.3-.9.1-1.8 0 0 .6-.2 1.8.7a6.2 6.2 0 0 1 3.3 0c1.3-.9 1.8-.7 1.8-.7.4.9.1 1.6.1 1.8.4.5.7 1.1.7 1.8 0 2.6-1.6 3.1-3.1 3.3.2.2.5.6.5 1.2v1.8c0 .2.1.4.5.3A6.7 6.7 0 0 0 8 1.3z" />
    </svg>
  )
}
