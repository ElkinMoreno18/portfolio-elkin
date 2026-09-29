import type { MouseEvent } from 'react'
import { flushSync } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { prefersReducedMotion } from '../motion'
import { preloadProjectPage } from './data'

/**
 * Continuidad índice → detalle con la View Transitions API: la captura (o el
 * esquema) del proyecto pulsado viaja hasta la cabecera del detalle.
 *
 * App.tsx usa <BrowserRouter> (modo declarativo), donde la prop
 * `viewTransition` de <Link> no tiene efecto; por eso se envuelve aquí la
 * navegación a mano. Si el navegador no la soporta, o hay movimiento
 * reducido, el enlace navega normal.
 */
export const VT_NAME = 'pj-visual'

type VTDocument = Document & {
  startViewTransition?: (cb: () => Promise<void> | void) => { finished: Promise<void> }
}

let arrivedByMorph = false

/** El detalle pregunta al montar si llegó con la transición, para no animar dos veces. */
export function peekMorph() {
  return arrivedByMorph
}
export function clearMorph() {
  arrivedByMorph = false
}

/** Espera a que el detalle esté pintado (sin rAF: el renderizado está congelado durante la transición). */
function waitFor(selector: string, timeout: number) {
  return new Promise<void>((resolve) => {
    if (document.querySelector(selector)) return resolve()
    const mo = new MutationObserver(() => {
      if (document.querySelector(selector)) done()
    })
    const timer = setTimeout(done, timeout)
    function done() {
      mo.disconnect()
      clearTimeout(timer)
      resolve()
    }
    mo.observe(document.body, { childList: true, subtree: true })
  })
}

export function useMorphLink() {
  const navigate = useNavigate()

  return (e: MouseEvent<HTMLAnchorElement>, to: string, visual: Element | null) => {
    const doc = document as VTDocument
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    if (!doc.startViewTransition || prefersReducedMotion()) return

    e.preventDefault()
    const el = visual as HTMLElement | null
    el?.style.setProperty('view-transition-name', VT_NAME)
    arrivedByMorph = Boolean(el)

    doc.startViewTransition(async () => {
      await preloadProjectPage()
      flushSync(() => navigate(to))
      await waitFor('[data-project-ready]', 900)
    })
  }
}
