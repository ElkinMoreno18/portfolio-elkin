import { useEffect, useState } from 'react'
import { fetchPublishedProjects, type ProjectsResult } from '@/lib/projectsApi'
import { experience } from '@/data/profile'
import { CATEGORIES, type Project, type ProjectMetric } from '@/lib/types'

/**
 * Misma fuente que useProjects() (fetchPublishedProjects), con una caché de
 * módulo: la lista se pide una vez por visita. Así el detalle pinta al
 * instante al llegar desde el índice, y al volver a /#proyectos la sección
 * ya tiene su altura real cuando la portada calcula el scroll.
 */
let cache: ProjectsResult | null = null
let inflight: Promise<ProjectsResult> | null = null

function load() {
  if (!inflight) {
    inflight = fetchPublishedProjects().then((res) => (cache = withTruthfulMetrics(res)))
  }
  return inflight
}

/* ─────────────────────────── Cifras verdaderas ───────────────────────────
   Una métrica sólo se publica si es una cifra: "Redis" o "Tiempo real" no
   son métricas. Y mientras se muestran los proyectos de ejemplo (seed), sólo
   si el CV la respalda: algún logro de profile.ts dice la misma cifra sobre
   lo mismo (comparten una palabra de la etiqueta). Las cifras de los
   proyectos que Elkin publica desde /admin se muestran tal cual: salen de él. */

const CV_LINES = experience.flatMap((job) => [...job.achievements.es, ...job.achievements.en])
const norm = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
const stems = (s: string) => (norm(s).match(/\p{L}{5,}/gu) ?? []).map((w) => w.slice(0, 5))

function figureOf(value: string) {
  return value.match(/\d+(?:[.,]\d+)?/)?.[0] ?? null
}

function backedByCv(m: ProjectMetric) {
  const figure = figureOf(m.value)
  if (!figure) return false
  const percent = m.value.includes('%')
  const number = figure.replace(/[.,]/g, '[.,]')
  const re = new RegExp(`(?<![\\d.,])${number}(?![\\d.,])${percent ? '\\s?%' : '(?!\\s?%)'}`)
  const label = new Set([...stems(m.label_es), ...stems(m.label_en)])
  return CV_LINES.some((line) => re.test(line) && stems(line).some((w) => label.has(w)))
}

function withTruthfulMetrics(res: ProjectsResult): ProjectsResult {
  const keep = (m: ProjectMetric) => figureOf(m.value) !== null && (!res.demo || backedByCv(m))
  return { ...res, projects: res.projects.map((p) => ({ ...p, metrics: p.metrics.filter(keep) })) }
}

export function useProjectList() {
  const [state, setState] = useState<ProjectsResult | null>(cache)

  useEffect(() => {
    if (cache) return
    let alive = true
    load().then((res) => alive && setState(res))
    return () => {
      alive = false
    }
  }, [])

  return {
    projects: state?.projects ?? [],
    demo: state?.demo ?? false,
    loading: state === null,
  }
}

/** Precarga la página de detalle (chunk perezoso de App.tsx) al apuntar a un enlace. */
let pagePreload: Promise<unknown> | null = null
export function preloadProjectPage() {
  pagePreload ??= import('@/site/ProjectPage')
  return pagePreload
}

export function projectPath(p: Pick<Project, 'slug'>) {
  return `/proyecto/${p.slug}`
}

/**
 * Año o periodo de un proyecto: "2024", "2022 – 2025" o, si sigue en curso,
 * "2025 – hoy". Sólo lee los datos; sin year_start ni ongoing, es el año.
 */
export function yearLabel(p: Pick<Project, 'year' | 'year_start' | 'ongoing'>, lang: 'es' | 'en') {
  const from = p.year_start && p.year_start < p.year ? p.year_start : p.year
  if (p.ongoing) return `${from} – ${lang === 'es' ? 'hoy' : 'now'}`
  return from === p.year ? String(p.year) : `${from} – ${p.year}`
}

export function categoryLabel(value: Project['category'], lang: 'es' | 'en') {
  const c = CATEGORIES.find((x) => x.value === value)
  return c ? c[lang] : value
}

/**
 * Tres formas de presentar un proyecto, según lo que de verdad tiene:
 *  - cover:    captura real → ventana grande con la captura.
 *  - featured: destacado sin captura → fila densa con su esquema.
 *  - index:    el resto → fila de la tabla índice.
 */
export type ProjectKind = 'featured' | 'cover' | 'index'

export function kindOf(p: Project): ProjectKind {
  if (p.cover_url) return 'cover'
  if (p.featured) return 'featured'
  return 'index'
}

/** Párrafos de la descripción, sin líneas vacías. */
export function paragraphs(text: string) {
  return text
    .split(/\n+/)
    .map((s) => s.trim())
    .filter(Boolean)
}
