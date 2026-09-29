export type Lang = 'es' | 'en'

/** Texto que existe en los dos idiomas del sitio. */
export type Bi = Record<Lang, string>

export type ProjectCategory =
  | 'automation'
  | 'erp'
  | 'ai'
  | 'web'
  | 'ecommerce'
  | 'data'

export interface ProjectMetric {
  value: string
  label_es: string
  label_en: string
}

export interface Project {
  id: string
  slug: string
  title_es: string
  title_en: string
  tagline_es: string
  tagline_en: string
  description_es: string
  description_en: string
  role_es: string
  role_en: string
  tech: string[]
  category: ProjectCategory
  cover_url: string | null
  gallery: string[]
  repo_url: string | null
  demo_url: string | null
  metrics: ProjectMetric[]
  year: number
  /**
   * Opcionales, sólo de presentación (aún no son columnas de Supabase):
   * año de inicio cuando el trabajo abarca varios ("2022 – 2025"), y si sigue
   * en curso ("2025 – hoy").
   */
  year_start?: number | null
  ongoing?: boolean
  featured: boolean
  published: boolean
  sort_order: number
  created_at?: string
  updated_at?: string
}

/** Lo que el formulario de admin maneja antes de tocar la base de datos. */
export type ProjectDraft = Omit<Project, 'id' | 'created_at' | 'updated_at'>

export interface ContactMessage {
  id: string
  name: string
  email: string
  subject: string | null
  body: string
  read: boolean
  created_at: string
}

export const CATEGORIES: { value: ProjectCategory; es: string; en: string }[] = [
  { value: 'automation', es: 'Automatización', en: 'Automation' },
  { value: 'ai', es: 'IA aplicada', en: 'Applied AI' },
  { value: 'erp', es: 'Herramientas internas', en: 'Internal tools' },
  { value: 'web', es: 'Web & producto', en: 'Web & product' },
  { value: 'ecommerce', es: 'E-commerce', en: 'E-commerce' },
  { value: 'data', es: 'Datos & BI', en: 'Data & BI' },
]

export function emptyDraft(): ProjectDraft {
  return {
    slug: '',
    title_es: '', title_en: '',
    tagline_es: '', tagline_en: '',
    description_es: '', description_en: '',
    role_es: '', role_en: '',
    tech: [],
    category: 'web',
    cover_url: null,
    gallery: [],
    repo_url: null,
    demo_url: null,
    metrics: [],
    year: new Date().getFullYear(),
    featured: false,
    published: true,
    sort_order: 0,
  }
}
