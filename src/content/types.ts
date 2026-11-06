import type { Bi } from '@/lib/types'

/**
 * Contenido del portafolio que se edita desde /admin (tabla site_content de
 * Supabase, una fila por sección). Los valores iniciales están en
 * src/data/profile.ts: el sitio los usa mientras una sección no se haya
 * guardado nunca desde el panel.
 */

/** Lista de textos en los dos idiomas (párrafos, logros, puntos). */
export type BiList = { es: string[]; en: string[] }

export interface ProfileContent {
  name: string
  fullName: string
  /** "Full Stack Developer & Automation Engineer": pie de página y lectores. */
  title: Bi
  email: string
  location: Bi
  /** Si está buscando trabajo o proyectos. Apagado, no se muestra la disponibilidad. */
  available: boolean
  availability: Bi
  /** "Permiso de trabajo en España · Presencial, híbrido o remoto". Partes separadas por " · ". */
  workMode: Bi
  /** Titular grande de la portada. */
  headline: Bi
  /** Entradilla bajo el titular. */
  sub: Bi
  linkedin: string
  github: string
  /** PDF del CV: ruta del propio sitio o URL pública de Supabase Storage. */
  cvUrl: string
  /** Retrato (opcional). Vacío: no se muestra foto. */
  portraitUrl: string
}

export interface JobContent {
  company: string
  location: Bi
  role: Bi
  /** Mes de inicio, "AAAA-MM". */
  start: string
  /** Mes de fin, "AAAA-MM"; null si es el puesto actual. */
  end: string | null
  summary: Bi
  achievements: BiList
  tech: string[]
}

export interface EducationContent {
  title: Bi
  org: string
  place: Bi
  /** Texto libre: "2025", "2017 – 2021". */
  period: string
}

export interface LanguageContent {
  name: Bi
  level: Bi
}

export interface StackGroupContent {
  key: string
  title: Bi
  note: Bi
  items: string[]
}

export interface PrincipleContent {
  title: Bi
  body: Bi
}

export interface AboutContent {
  /** Historia: el primer párrafo se lee como entradilla. */
  paragraphs: BiList
  /** Su frase, en grande ("Si se hace dos veces, lo automatizo."). */
  motto: Bi
  /** Lo que explica la frase, debajo de ella. */
  mottoBody: Bi
  /** Otros principios de trabajo, en lista. */
  principles: PrincipleContent[]
  /** "En qué ando ahora". */
  now: { title: Bi; items: BiList }
}

export interface SiteContent {
  profile: ProfileContent
  about: AboutContent
  experience: JobContent[]
  education: EducationContent[]
  languages: LanguageContent[]
  stack: StackGroupContent[]
}

export type SectionKey = keyof SiteContent

export const SECTION_KEYS: SectionKey[] = ['profile', 'about', 'experience', 'education', 'languages', 'stack']
