import { shortCompany, type Job } from '@/content/derive'
import type { StackGroupContent } from '@/content/types'

/**
 * Cruce entre el stack y la experiencia. No infiere nada: una tecnología
 * "se usó en" una empresa sólo si su nombre aparece tal cual (sin
 * distinguir mayúsculas) en las tecnologías de ese puesto. Si no hay
 * coincidencia exacta, no se muestra nada.
 */

export interface Company {
  /** Nombre completo, tal y como está en la experiencia. Sirve de clave. */
  name: string
  /** Nombre corto para la tabla (sin la forma jurídica). */
  short: string
  current: boolean
}

export interface StackItem {
  name: string
  /** Empresas (por nombre completo) cuyo puesto lista esta tecnología. */
  at: string[]
  /** Aparece en el puesto actual. */
  inUse: boolean
}

export interface StackRow extends Omit<StackGroupContent, 'items'> {
  items: StackItem[]
  /** Empresas donde se usó al menos una tecnología del grupo, de la más reciente a la más antigua. */
  used: Company[]
}

const norm = (s: string) => s.trim().toLowerCase()

/** Empresas sin repetir, en el orden de la experiencia (la más reciente primero). */
export function companiesOf(jobs: Job[]): Company[] {
  return jobs
    .filter((job, i, all) => job.company.trim() && all.findIndex((j) => j.company === job.company) === i)
    .map((job) => ({
      name: job.company,
      short: shortCompany(job.company),
      current: jobs.some((j) => j.company === job.company && j.current),
    }))
}

export function buildRows(jobs: Job[], stack: StackGroupContent[]): StackRow[] {
  const companies = companiesOf(jobs)
  const tech = new Map<string, Set<string>>()
  for (const job of jobs) {
    const set = tech.get(job.company) ?? new Set<string>()
    job.tech.forEach((t) => set.add(norm(t)))
    tech.set(job.company, set)
  }
  return stack
    .filter((group) => group.items.length > 0)
    .map((group, i) => {
      const items = group.items.map((name) => {
        const at = companies.filter((c) => tech.get(c.name)?.has(norm(name))).map((c) => c.name)
        return { name, at, inUse: companies.some((c) => c.current && at.includes(c.name)) }
      })
      const used = companies.filter((c) => items.some((it) => it.at.includes(c.name)))
      return { ...group, key: group.key || `group-${i}`, items, used }
    })
}
