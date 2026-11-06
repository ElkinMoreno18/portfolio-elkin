import { isSupabaseConfigured } from '@/lib/supabase'
import { preloadProjects } from '@/site/projects/data'
import { fallbackToCache, loadContent } from './store'

/**
 * Antes de la primera pintura se espera un momento por el contenido y los
 * proyectos de Supabase (en paralelo), para que la página salga ya con los
 * datos definitivos y no cambie de golpe al llegar. Si tardan más de
 * MAX_WAIT, se pinta con la última copia conocida (o la del código) y lo
 * que llegue después se aplica sin recargar.
 */
const MAX_WAIT = 1500

export function boot(): Promise<void> {
  if (!isSupabaseConfigured) return Promise.resolve()
  const all = Promise.allSettled([loadContent(), preloadProjects()]).then(() => undefined)
  const timeout = new Promise<void>((resolve) =>
    setTimeout(() => {
      fallbackToCache()
      resolve()
    }, MAX_WAIT),
  )
  return Promise.race([all, timeout])
}
