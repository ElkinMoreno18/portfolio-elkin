import {
  getSupabase,
  isSupabaseConfigured,
  MEDIA_BUCKET,
  restGet,
  restPost,
} from './supabase'
import { seedProjects } from '@/data/seedProjects'
import type { ContactMessage, Project, ProjectDraft } from './types'

const TABLE = 'projects'
const MESSAGES = 'contact_messages'

function sorted(rows: Project[]) {
  return [...rows].sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1
    if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order
    return b.year - a.year
  })
}

export interface ProjectsResult {
  projects: Project[]
  /** true cuando estamos mostrando los ejemplos de seedProjects. */
  demo: boolean
}

/* ───────────────────────── Sitio público ───────────────────────── */

/** Proyectos visibles para cualquier visitante. Lectura anónima, sin SDK. */
export async function fetchPublishedProjects(): Promise<ProjectsResult> {
  if (!isSupabaseConfigured) return { projects: sorted(seedProjects), demo: true }

  try {
    const rows = await restGet<Project[]>(
      `${TABLE}?select=*&published=eq.true&order=featured.desc,sort_order.asc`,
    )
    // Sin proyectos propios todavía, mejor enseñar los ejemplos que un vacío.
    if (!rows.length) return { projects: sorted(seedProjects), demo: true }
    return { projects: sorted(rows), demo: false }
  } catch (error) {
    // Si la tabla aún no existe o falla la red, el sitio no se rompe.
    console.warn('[portfolio] No se pudieron cargar los proyectos:', error)
    return { projects: sorted(seedProjects), demo: true }
  }
}

export async function sendContactMessage(input: {
  name: string
  email: string
  subject?: string
  body: string
}): Promise<void> {
  // Sin backend no hay dónde guardar: que falle de forma explícita permite
  // al formulario caer al cliente de correo en vez de fingir que se envió.
  if (!isSupabaseConfigured) throw new Error('NO_BACKEND')

  await restPost(MESSAGES, {
    name: input.name,
    email: input.email,
    subject: input.subject || null,
    body: input.body,
  })
}

/* ───────────────────────── Panel (autenticado) ───────────────────────── */

async function requireClient() {
  const supabase = await getSupabase()
  if (!supabase) throw new Error('Supabase no está configurado.')
  return supabase
}

/** Todos los proyectos, incluidos los borradores. */
export async function fetchAllProjects(): Promise<Project[]> {
  if (!isSupabaseConfigured) return sorted(seedProjects)
  const supabase = await requireClient()
  const { data, error } = await supabase.from(TABLE).select('*').order('sort_order', { ascending: true })
  if (error) throw new Error(error.message)
  return sorted((data ?? []) as Project[])
}

export async function saveProject(draft: ProjectDraft, id?: string): Promise<Project> {
  const supabase = await requireClient()
  const payload = { ...draft, updated_at: new Date().toISOString() }

  const query = id
    ? supabase.from(TABLE).update(payload).eq('id', id).select().single()
    : supabase.from(TABLE).insert(payload).select().single()

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data as Project
}

export async function deleteProject(id: string): Promise<void> {
  const supabase = await requireClient()
  const { error } = await supabase.from(TABLE).delete().eq('id', id)
  if (error) throw new Error(error.message)
}

/** Sube una imagen al bucket público y devuelve su URL definitiva. */
export async function uploadMedia(file: File): Promise<string> {
  const supabase = await requireClient()

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const path = `${crypto.randomUUID()}.${ext}`

  const { error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(path, file, { cacheControl: '31536000', upsert: false })
  if (error) throw new Error(error.message)

  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path)
  return data.publicUrl
}

export async function fetchMessages(): Promise<ContactMessage[]> {
  if (!isSupabaseConfigured) return []
  const supabase = await requireClient()
  const { data, error } = await supabase
    .from(MESSAGES)
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []) as ContactMessage[]
}

export async function setMessageRead(id: string, read: boolean): Promise<void> {
  const supabase = await requireClient()
  const { error } = await supabase.from(MESSAGES).update({ read }).eq('id', id)
  if (error) throw new Error(error.message)
}

export { isSupabaseConfigured }
