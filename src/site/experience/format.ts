import type { Lang } from '@/lib/types'

/**
 * Utilidades de presentación para la línea de tiempo. No inventan nada:
 * sólo leen las fechas y los textos de src/data/profile.ts y los dan forma.
 */

const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** "Jul 2025 — Present" → { start: "Jul 2025", end: "Present" } */
export function splitPeriod(period: string) {
  const [start = '', end = ''] = period.split(/\s+[—–-]\s+/)
  return { start: start.trim(), end: end.trim() }
}

/** "Jul 2025" → índice absoluto de mes (año × 12 + mes). */
function monthIndex(label: string): number | null {
  const m = label.match(/^([A-Za-z]{3})\s+(\d{4})$/)
  if (!m) return null
  const i = MONTHS_EN.indexOf(m[1])
  return i < 0 ? null : Number(m[2]) * 12 + i
}

/** "Jul 2025" → "2025-07", para <time dateTime>. */
export function isoMonth(labelEn: string): string | undefined {
  const i = monthIndex(labelEn)
  if (i == null) return undefined
  return `${Math.floor(i / 12)}-${String((i % 12) + 1).padStart(2, '0')}`
}

/**
 * Meses trabajados, contando el mes de inicio y el de fin (como LinkedIn).
 * Se calcula sobre el periodo en inglés, que usa abreviaturas estables.
 */
export function durationMonths(periodEn: string, now = new Date()): number | null {
  const { start, end } = splitPeriod(periodEn)
  const s = monthIndex(start)
  const e = monthIndex(end) ?? (/present/i.test(end) ? now.getFullYear() * 12 + now.getMonth() : null)
  if (s == null || e == null || e < s) return null
  return e - s + 1
}

export function formatDuration(months: number, lang: Lang) {
  const y = Math.floor(months / 12)
  const m = months % 12
  const parts: string[] = []
  if (lang === 'es') {
    if (y) parts.push(`${y} ${y === 1 ? 'año' : 'años'}`)
    if (m) parts.push(`${m} ${m === 1 ? 'mes' : 'meses'}`)
  } else {
    if (y) parts.push(`${y} ${y === 1 ? 'yr' : 'yrs'}`)
    if (m) parts.push(`${m} ${m === 1 ? 'mo' : 'mos'}`)
  }
  return parts.join(' ')
}

/**
 * Las rayas (—) no entran en el sitio. Un inciso entre rayas pasa a
 * paréntesis y una raya suelta, a coma. El texto de origen no se toca.
 */
export function plain(text: string) {
  return text
    .replace(/\s*—\s*([^—]+?)\s*—\s*/g, ' ($1) ')
    .replace(/\s+—\s+/g, ', ')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

/** Las fechas de formación sólo existen en español: "Dic 2025" → "Dec 2025". */
const ES_TO_EN: Record<string, string> = { Ene: 'Jan', Abr: 'Apr', Ago: 'Aug', Dic: 'Dec' }
export function localMonths(text: string, lang: Lang) {
  if (lang === 'es') return text
  return text.replace(/\b(Ene|Abr|Ago|Dic)\b/g, (m) => ES_TO_EN[m] ?? m)
}

/** Etiquetas de tecnología que cambian con el idioma (experiencia y proyectos). */
const TECH_LABELS: Record<string, { es: string; en: string }> = {
  IA: { es: 'IA', en: 'AI' },
  'SEO técnico': { es: 'SEO técnico', en: 'Technical SEO' },
}
export function techLabel(tech: string, lang: Lang) {
  return TECH_LABELS[tech]?.[lang] ?? tech
}

/**
 * Parte un texto en tramos normales y cifras ("30%", "20+", "99,9%", "20"),
 * para que las cifras que ya escribió Elkin se lean de un vistazo.
 */
const FIGURE = /(?<![\w.,])\d+(?:[.,]\d+)?(?:\s?%|\+)?(?![\w])/g
export function splitFigures(text: string): { text: string; figure: boolean }[] {
  const out: { text: string; figure: boolean }[] = []
  let last = 0
  for (const m of text.matchAll(FIGURE)) {
    const at = m.index ?? 0
    if (at > last) out.push({ text: text.slice(last, at), figure: false })
    out.push({ text: m[0], figure: true })
    last = at + m[0].length
  }
  if (last < text.length) out.push({ text: text.slice(last), figure: false })
  return out
}
