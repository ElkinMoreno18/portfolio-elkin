import { useSyncExternalStore } from 'react'
import { isSupabaseConfigured, restGet } from '@/lib/supabase'
import { defaultContent } from '@/data/profile'
import { BLANK, fillLangs } from './derive'
import { SECTION_KEYS, type SectionKey, type SiteContent } from './types'

/**
 * Contenido del sitio: el de src/data/profile.ts, con encima lo que se haya
 * guardado desde /admin (tabla site_content, una fila por sección).
 *
 * Se pide una vez al arrancar (main.tsx espera un momento por él, para que la
 * primera pintura ya sea la definitiva) y se guarda una copia en el
 * navegador: si Supabase tarda o está en pausa, se usa la última conocida.
 */
export type ContentRow = { key: string; data: unknown; updated_at?: string }
type Row = ContentRow

const CACHE_KEY = 'em-content'
const listeners = new Set<() => void>()
let content: SiteContent = fillLangs(defaultContent)
let loaded = false
let inflight: Promise<void> | null = null

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)

/** Una fila guardada encima de su valor inicial, completando lo que le falte. */
function section<K extends SectionKey>(key: K, data: unknown): SiteContent[K] {
  const base = defaultContent[key]
  switch (key) {
    case 'profile':
    case 'about':
      return (isObj(data) ? { ...base, ...data } : base) as SiteContent[K]
    case 'experience':
      return (Array.isArray(data) ? data.filter(isObj).map((x) => ({ ...BLANK.job(), ...x })) : base) as SiteContent[K]
    case 'education':
      return (Array.isArray(data) ? data.filter(isObj).map((x) => ({ ...BLANK.education(), ...x })) : base) as SiteContent[K]
    case 'languages':
      return (Array.isArray(data) ? data.filter(isObj).map((x) => ({ ...BLANK.language(), ...x })) : base) as SiteContent[K]
    case 'stack':
      return (Array.isArray(data) ? data.filter(isObj).map((x) => ({ ...BLANK.stackGroup(), ...x })) : base) as SiteContent[K]
    default:
      return base
  }
}

/**
 * Las filas guardadas encima del contenido inicial. Con fill, cada texto que
 * falte en un idioma toma el del otro (lo que ve el visitante); sin él, tal
 * cual está guardado (lo que edita el panel).
 */
export function contentFromRows(rows: Row[], fill = true): SiteContent {
  const next = { ...defaultContent } as Record<SectionKey, unknown>
  for (const r of rows) {
    if ((SECTION_KEYS as string[]).includes(r.key)) next[r.key as SectionKey] = section(r.key as SectionKey, r.data)
  }
  const merged = next as unknown as SiteContent
  return fill ? fillLangs(merged) : merged
}

const fromRows = (rows: Row[]) => contentFromRows(rows)

function emit(next: SiteContent) {
  content = next
  listeners.forEach((l) => l())
}

function readCache(): Row[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    const rows = raw ? (JSON.parse(raw) as unknown) : null
    return Array.isArray(rows) ? (rows as Row[]) : null
  } catch {
    return null
  }
}

function writeCache(rows: Row[]) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(rows))
  } catch {
    /* sin almacenamiento: no pasa nada, se pide en cada visita */
  }
}

/** Pide el contenido a Supabase (una vez). Sin Supabase, el de profile.ts. */
export function loadContent(): Promise<void> {
  if (!isSupabaseConfigured) return Promise.resolve()
  inflight ??= restGet<Row[]>('site_content?select=key,data')
    .then((rows) => {
      loaded = true
      writeCache(rows)
      emit(fromRows(rows))
    })
    .catch((error) => {
      console.warn('[portfolio] No se pudo cargar el contenido; se usa el último conocido.', error)
      fallbackToCache()
    })
  return inflight
}

/** Si el contenido aún no ha llegado, se pinta con la última copia conocida. */
export function fallbackToCache() {
  if (loaded) return
  const rows = readCache()
  if (rows) emit(fromRows(rows))
}

/** Tras guardar en /admin: el sitio de este navegador lo refleja ya. */
export function applySection<K extends SectionKey>(key: K, data: SiteContent[K]) {
  const rows = (readCache() ?? []).filter((r) => r.key !== key)
  rows.push({ key, data })
  writeCache(rows)
  emit(fromRows(rows))
}

/** Contenido que se está usando ahora (para valores iniciales del panel). */
export function getContent() {
  return content
}

function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => {
    listeners.delete(cb)
  }
}

export function useContent(): SiteContent {
  return useSyncExternalStore(subscribe, getContent, getContent)
}
