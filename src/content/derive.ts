import type { Bi, Lang } from '@/lib/types'
import type {
  EducationContent,
  JobContent,
  LanguageContent,
  PrincipleContent,
  ProfileContent,
  SiteContent,
  StackGroupContent,
} from './types'

/* ───────────────────────── Plantillas vacías ─────────────────────────
   Las usa el panel al añadir un elemento, y la carga para completar lo que
   falte en una fila guardada (un campo nuevo que la fila aún no tiene). */
const bi = (): Bi => ({ es: '', en: '' })

export const BLANK = {
  job: (): JobContent => ({
    company: '',
    location: bi(),
    role: bi(),
    start: '',
    end: null,
    summary: bi(),
    achievements: { es: [], en: [] },
    tech: [],
  }),
  education: (): EducationContent => ({ title: bi(), org: '', place: bi(), period: '' }),
  language: (): LanguageContent => ({ name: bi(), level: bi() }),
  stackGroup: (): StackGroupContent => ({ key: '', title: bi(), note: bi(), items: [] }),
  principle: (): PrincipleContent => ({ title: bi(), body: bi() }),
}

/* ───────────────────────── Idiomas ─────────────────────────
   Si un texto falta en un idioma, se muestra el del otro: mejor el español en
   la versión inglesa que un hueco. Se aplica a todo el contenido al cargarlo. */
const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)

function isBi(v: Record<string, unknown>) {
  const keys = Object.keys(v)
  return keys.length === 2 && 'es' in v && 'en' in v
}

export function fillLangs<T>(value: T): T {
  if (Array.isArray(value)) return value.map(fillLangs) as T
  if (!isObj(value)) return value
  if (isBi(value)) {
    const { es, en } = value
    if (typeof es === 'string' && typeof en === 'string') return { es: es || en, en: en || es } as T
    if (Array.isArray(es) && Array.isArray(en)) return { es: es.length ? es : en, en: en.length ? en : es } as T
  }
  return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, fillLangs(v)])) as T
}

/* ───────────────────────── Experiencia ───────────────────────── */
const MONTHS: Record<Lang, string[]> = {
  es: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
}

/** "2025-07" → "Jul 2025". Lo que no sea AAAA-MM se devuelve tal cual. */
export function monthLabel(ym: string, lang: Lang) {
  const m = /^(\d{4})-(\d{2})$/.exec(ym.trim())
  if (!m) return ym.trim()
  const i = Number(m[2]) - 1
  return i >= 0 && i < 12 ? `${MONTHS[lang][i]} ${m[1]}` : ym.trim()
}

export function jobPeriod(job: Pick<JobContent, 'start' | 'end'>): Bi {
  return {
    es: `${monthLabel(job.start, 'es')} – ${job.end ? monthLabel(job.end, 'es') : 'Actualidad'}`,
    en: `${monthLabel(job.start, 'en')} – ${job.end ? monthLabel(job.end, 'en') : 'Present'}`,
  }
}

/** Un puesto listo para pintar: con su periodo en texto y si es el actual. */
export interface Job extends JobContent {
  period: Bi
  current: boolean
}

/** Del más reciente al más antiguo: el actual primero, después por fecha de fin y de inicio. */
export function sortJobs<T extends Pick<JobContent, 'start' | 'end'>>(jobs: T[]): T[] {
  const end = (j: T) => j.end ?? '9999-99'
  return [...jobs].sort((a, b) => end(b).localeCompare(end(a)) || b.start.localeCompare(a.start))
}

export function jobsOf(content: SiteContent): Job[] {
  return sortJobs(content.experience).map((j) => ({ ...j, period: jobPeriod(j), current: !j.end }))
}

/** "Closer Logistics SL" → "Closer Logistics". Sólo quita la forma jurídica. */
export function shortCompany(name: string) {
  return name.replace(/\s+(S\.?A\.?S\.?|S\.?L\.?|S\.?A\.?|IPS)$/i, '').trim()
}

/** "Ahora en Closer Logistics", del puesto actual. Sin puesto actual, nada. */
export function nowLine(content: SiteContent): Bi | null {
  const job = content.experience.find((j) => !j.end && j.company.trim())
  if (!job) return null
  const at = shortCompany(job.company)
  return { es: `Ahora en ${at}`, en: `Now at ${at}` }
}

/* ───────────────────────── Perfil ───────────────────────── */
export type SocialIcon = 'linkedin' | 'github' | 'mail'

export function socialsOf(p: ProfileContent): { label: string; href: string; icon: SocialIcon }[] {
  const out: { label: string; href: string; icon: SocialIcon }[] = []
  if (p.linkedin.trim()) out.push({ label: 'LinkedIn', href: p.linkedin.trim(), icon: 'linkedin' })
  if (p.github.trim()) out.push({ label: 'GitHub', href: p.github.trim(), icon: 'github' })
  if (p.email.trim()) out.push({ label: 'Email', href: `mailto:${p.email.trim()}`, icon: 'mail' })
  return out
}

/** "linkedin.com/in/elkin-moreno18" → "in/elkin-moreno18". */
export function linkedinHandle(url: string) {
  return url.replace(/^https?:\/\/(www\.)?linkedin\.com\//, '').replace(/\/$/, '')
}

/**
 * Enlace de descarga del CV. Un archivo de Supabase Storage está en otro
 * dominio y el navegador ignora ahí el atributo download: se le pide al
 * propio Storage que lo sirva como descarga, con un nombre legible.
 */
export function cvHref(p: ProfileContent) {
  const url = p.cvUrl.trim()
  if (!/\/storage\/v1\/object\/public\//.test(url)) return url
  const name = `CV_${p.name.trim().replace(/\s+/g, '_') || 'CV'}.pdf`
  return `${url}${url.includes('?') ? '&' : '?'}download=${encodeURIComponent(name)}`
}
