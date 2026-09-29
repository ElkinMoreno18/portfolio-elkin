/**
 * Foco tras una navegación dentro de la SPA (cambio de página, ancla desde el
 * menú, "volver arriba"). Sin esto el foco se queda en <body> o detrás de lo
 * que se cerró, y un lector de pantalla no anuncia nada.
 *
 * Recibe una sección (usa el título que la nombra, aria-labelledby) o el
 * propio título. El título se hace enfocable sólo por script (tabindex=-1)
 * y no se desplaza: quien llama ya ha colocado la página.
 */
export function focusHeading(target: Element | null | undefined) {
  if (!target) return
  const labelled = target.getAttribute('aria-labelledby')
  const el = (labelled ? document.getElementById(labelled) : null) ?? (target as HTMLElement)
  if (!(el instanceof HTMLElement)) return
  if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1')
  el.focus({ preventScroll: true })
}
