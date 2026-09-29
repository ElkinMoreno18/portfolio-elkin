import { experience, stack, type StackGroup } from '@/data/profile'

/**
 * Cruce entre el stack y la experiencia. No infiere nada: una tecnología
 * "se usó en" una empresa sólo si su nombre aparece tal cual (sin
 * distinguir mayúsculas) en experience[].tech de ese puesto. Si no hay
 * coincidencia exacta, no se muestra nada.
 */

export interface Company {
  /** Nombre completo, tal y como está en profile.ts. Sirve de clave. */
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

export interface StackRow extends Omit<StackGroup, 'items'> {
  items: StackItem[]
  /** Empresas donde se usó al menos una tecnología del grupo, de la más reciente a la más antigua. */
  used: Company[]
}

const norm = (s: string) => s.trim().toLowerCase()

/** "Closer Logistics SL" → "Closer Logistics". Sólo quita la forma jurídica. */
export function shortCompany(name: string) {
  return name.replace(/\s+(S\.?A\.?S\.?|S\.?L\.?|S\.?A\.?|IPS)$/i, '').trim()
}

export const companies: Company[] = experience
  .filter((job, i, all) => all.findIndex((j) => j.company === job.company) === i)
  .map((job) => ({ name: job.company, short: shortCompany(job.company), current: Boolean(job.current) }))

export const currentCompany = companies.find((c) => c.current) ?? null

function techByCompany() {
  const map = new Map<string, Set<string>>()
  for (const job of experience) {
    const set = map.get(job.company) ?? new Set<string>()
    job.tech.forEach((t) => set.add(norm(t)))
    map.set(job.company, set)
  }
  return map
}

export function buildRows(): StackRow[] {
  const tech = techByCompany()
  return stack.map((group) => {
    const items = group.items.map((name) => {
      const at = companies.filter((c) => tech.get(c.name)?.has(norm(name))).map((c) => c.name)
      return { name, at, inUse: companies.some((c) => c.current && at.includes(c.name)) }
    })
    const used = companies.filter((c) => items.some((it) => it.at.includes(c.name)))
    return { ...group, items, used }
  })
}
