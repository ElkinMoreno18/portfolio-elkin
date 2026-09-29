import type { SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL?.trim().replace(/\/$/, '')
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()

/**
 * Supabase es opcional a propósito: sin credenciales el portafolio arranca
 * igual en "modo demo" con los proyectos de src/data/seedProjects.ts.
 * Así el sitio nunca se ve roto mientras configuras el backend.
 */
export const isSupabaseConfigured = Boolean(url && anonKey)

export const MEDIA_BUCKET = 'project-media'

/* ───────────────────────── Lectura pública (sin SDK) ─────────────────────────
 * Lo que ve un visitante son lecturas anónimas contra PostgREST, que no es
 * más que HTTP con una cabecera. Hacerlas con fetch evita descargar los
 * ~110 kB del SDK en el sitio público: sólo el panel lo necesita.
 * --------------------------------------------------------------------------- */

export function restHeaders(): HeadersInit {
  return {
    apikey: anonKey!,
    Authorization: `Bearer ${anonKey}`,
    'Content-Type': 'application/json',
  }
}

export async function restGet<T>(path: string): Promise<T> {
  const res = await fetch(`${url}/rest/v1/${path}`, { headers: restHeaders() })
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${await res.text()}`)
  return (await res.json()) as T
}

export async function restPost(path: string, body: unknown): Promise<void> {
  const res = await fetch(`${url}/rest/v1/${path}`, {
    method: 'POST',
    headers: { ...restHeaders(), Prefer: 'return=minimal' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${await res.text()}`)
}

/* ───────────────────── SDK completo (sólo /admin) ───────────────────── */

let clientPromise: Promise<SupabaseClient> | null = null

/** Carga el SDK bajo demanda: auth, storage y escrituras autenticadas. */
export function getSupabase(): Promise<SupabaseClient> | null {
  if (!isSupabaseConfigured) return null
  clientPromise ??= import('@supabase/supabase-js').then(({ createClient }) =>
    createClient(url!, anonKey!, {
      auth: { persistSession: true, autoRefreshToken: true },
    }),
  )
  return clientPromise
}
