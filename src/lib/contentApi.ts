import { getSupabase, isSupabaseConfigured, MEDIA_BUCKET } from './supabase'
import { applySection, contentFromRows, type ContentRow } from '@/content/store'
import type { SectionKey, SiteContent } from '@/content/types'
import { seedProjects } from '@/data/seedProjects'
import type { ProjectDraft } from './types'

/*
 * Escrituras del panel: secciones de contenido (tabla site_content), archivos
 * del perfil (CV y retrato, en el bucket de imágenes) y la importación de los
 * proyectos de ejemplo. Todo autenticado: RLS sólo deja escribir a tu usuario.
 */

const TABLE = 'site_content'

async function client() {
  const supabase = await getSupabase()
  if (!supabase) throw new Error('Supabase no está configurado.')
  return supabase
}

export interface AdminContent {
  /** Contenido efectivo de cada sección, tal cual está guardado (sin rellenar idiomas). */
  content: SiteContent
  /** Cuándo se guardó cada sección; si falta, el sitio usa el contenido inicial. */
  savedAt: Partial<Record<SectionKey, string>>
}

export async function fetchAdminContent(): Promise<AdminContent> {
  if (!isSupabaseConfigured) return { content: contentFromRows([], false), savedAt: {} }
  const supabase = await client()
  const { data, error } = await supabase.from(TABLE).select('key,data,updated_at')
  if (error) throw new Error(error.message)
  const rows = (data ?? []) as ContentRow[]
  return {
    content: contentFromRows(rows, false),
    savedAt: Object.fromEntries(rows.map((r) => [r.key, r.updated_at])) as AdminContent['savedAt'],
  }
}

/** Guarda una sección entera y la aplica ya al sitio de este navegador. Devuelve la hora de guardado. */
export async function saveSection<K extends SectionKey>(key: K, data: SiteContent[K]): Promise<string> {
  const supabase = await client()
  const { data: row, error } = await supabase
    .from(TABLE)
    .upsert({ key, data }, { onConflict: 'key' })
    .select('updated_at')
    .single()
  if (error) throw new Error(error.message)
  applySection(key, data)
  return (row as { updated_at: string }).updated_at
}

/** Sube el CV (PDF) o el retrato y devuelve su URL pública definitiva. */
export async function uploadSiteFile(file: File, kind: 'cv' | 'portrait'): Promise<string> {
  const supabase = await client()
  const ext = (file.name.split('.').pop() ?? '').toLowerCase() || (kind === 'cv' ? 'pdf' : 'jpg')
  // Nombre nuevo en cada subida: ninguna caché (ni la del CDN) sirve el anterior.
  const path = `site/${kind}-${Date.now().toString(36)}.${ext}`
  const { error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(path, file, { cacheControl: '31536000', upsert: false, contentType: file.type || undefined })
  if (error) throw new Error(error.message)
  return supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl
}

/** Proyectos de ejemplo que aún no están en la base de datos (por slug). */
export function missingSeeds(existingSlugs: string[]) {
  const have = new Set(existingSlugs)
  return seedProjects.filter((p) => !have.has(p.slug))
}

/**
 * Copia a Supabase los proyectos de ejemplo que falten, con sus textos,
 * capturas (rutas del propio sitio) y orden. Los que ya existen no se tocan.
 */
export async function importSeedProjects(existingSlugs: string[]): Promise<number> {
  const rows: ProjectDraft[] = missingSeeds(existingSlugs).map(({ id: _id, created_at: _c, updated_at: _u, ...p }) => ({
    ...p,
    year_start: p.year_start ?? null,
    ongoing: p.ongoing ?? false,
  }))
  if (!rows.length) return 0
  const supabase = await client()
  const { error } = await supabase.from('projects').upsert(rows, { onConflict: 'slug', ignoreDuplicates: true })
  if (error) throw new Error(error.message)
  return rows.length
}
