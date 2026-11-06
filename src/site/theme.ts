import { useSyncExternalStore } from 'react'

/**
 * Tema claro / oscuro.
 *
 * El primer valor lo pone el script de index.html antes de pintar (clase
 * .dark en <html>): sin parpadeo. Aquí se lee esa clase como fuente de verdad
 * y se cambia desde el botón. Mientras el visitante no elija, se sigue al
 * sistema (y a sus cambios, p. ej. el modo automático del móvil al anochecer).
 */
export type Theme = 'light' | 'dark'

const KEY = 'em-theme'
/** Color de la barra del navegador en el móvil: el --bg de cada tema. */
const BAR: Record<Theme, string> = { light: '#ffffff', dark: '#0a0a0b' }

const listeners = new Set<() => void>()

function stored(): Theme | null {
  try {
    const v = localStorage.getItem(KEY)
    return v === 'light' || v === 'dark' ? v : null
  } catch {
    return null
  }
}

export function currentTheme(): Theme {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

function apply(theme: Theme) {
  const root = document.documentElement
  // Sin transiciones durante el cambio: si no, cada borde y cada fondo con
  // transition-colors llegaría a su color a un ritmo distinto.
  root.classList.add('theme-switching')
  root.classList.toggle('dark', theme === 'dark')
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', BAR[theme])
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove('theme-switching')))
  listeners.forEach((l) => l())
}

type DocVT = Document & { startViewTransition?: (cb: () => void) => unknown }

export function setTheme(theme: Theme) {
  try {
    localStorage.setItem(KEY, theme)
  } catch {
    /* modo privado: se cambia igual, sólo no se recuerda */
  }
  const doc = document as DocVT
  // Fundido de toda la página donde el navegador lo permite; con movimiento
  // reducido, cambio directo.
  if (doc.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    doc.startViewTransition(() => apply(theme))
  } else {
    apply(theme)
  }
}

if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!stored()) apply(e.matches ? 'dark' : 'light')
  })
}

function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => {
    listeners.delete(cb)
  }
}

export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, currentTheme, () => 'dark')
}
