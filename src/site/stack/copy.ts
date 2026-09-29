import type { Lang } from '@/lib/types'

/** Textos de interfaz de la sección Stack. El contenido sale de profile.ts. */
export const stackCopy = {
  title: { es: 'Con qué trabajo', en: 'What I work with' },
  lead: {
    es: 'Agrupado por área, junto a las empresas donde lo he usado.',
    en: "Grouped by area, alongside the companies where I've used it.",
  },
  listLabel: { es: 'Tecnologías por área', en: 'Technologies by area' },
  /** Celda "usado en" sin empresas: ninguna tecnología del área figura en la
   *  lista `tech` de un puesto. Se dice tal cual, sin inventar dónde se usó. */
  noRole: { es: 'Sin puesto vinculado', en: 'No linked role' },
  colArea: { es: 'Área', en: 'Area' },
  colTech: { es: 'Tecnologías', en: 'Technologies' },
  colUsed: { es: 'Usado en', en: 'Used at' },
  inUseAt: { es: 'En uso ahora en', en: 'In use now at' },
  inUseSr: { es: 'en uso ahora', en: 'in use now' },
  currentSr: { es: 'puesto actual', en: 'current role' },
} as const

/**
 * Algunas tecnologías están escritas en español en profile.ts. Aquí sólo
 * se traduce la etiqueta visible; el cruce con la experiencia usa siempre
 * el nombre original.
 */
const ITEM_LABELS: Record<string, { es: string; en: string }> = {
  'APIs RESTful': { es: 'APIs RESTful', en: 'RESTful APIs' },
  'Chatbots con IA': { es: 'Chatbots con IA', en: 'AI chatbots' },
  'Integración de modelos de IA': { es: 'Integración de modelos de IA', en: 'AI model integration' },
  'Análisis de requisitos': { es: 'Análisis de requisitos', en: 'Requirements analysis' },
}

export function itemLabel(name: string, lang: Lang) {
  return ITEM_LABELS[name]?.[lang] ?? name
}
