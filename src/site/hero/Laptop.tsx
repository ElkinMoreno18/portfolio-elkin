import { forwardRef, useEffect, useRef, type ReactNode } from 'react'
import { APP_W } from '@/data/automation'
import { Mark } from '../Nav'
// En línea (data URI, ~2 KB comprimido dentro del JS): el teclado se pinta en
// el mismo fotograma que el portátil, sin otra petición ni un preload que las
// demás rutas no usan.
import deckUrl from './deck.svg?inline'

/**
 * Portátil en 3D con CSS puro (preserve-3d). La tapa gira sobre la
 * bisagra; la pantalla es HTML real, así que su contenido es nítido,
 * traducible y accesible. GSAP anima desde fuera la tapa, el cuerpo, la
 * cámara (perspective-origin de la escena) y la luz.
 *
 * Luz, ligada al ángulo de la tapa:
 *  - [data-deck-shade]: la sombra que la tapa proyecta sobre la base; se
 *    retira a medida que la tapa sube.
 *  - [data-deck-spill]: la luz de la pantalla sobre el teclado; aparece
 *    cuando la pantalla se enciende.
 *  - [data-lid-sheen]: el brillo del aluminio de la tapa cerrada, que se
 *    apaga al girar hacia el espectador.
 *
 * Ojo: nada con opacity < 1 ni filter en .lap / .lap-lid / .lap-base, o el
 * navegador aplana el 3D. La opacidad sólo se toca en hojas.
 */
export const Laptop = forwardRef<HTMLDivElement, { children: ReactNode }>(function Laptop({ children }, ref) {
  const screen = useRef<HTMLDivElement>(null)

  // La app mide 1200 px de ancho; se escala al ancho interior de la pantalla.
  useEffect(() => {
    const el = screen.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      el.style.setProperty('--k', String(entry.contentRect.width / APP_W))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div className="lap-scene" data-lap-scene>
      <div className="lap" ref={ref} data-lap>
        <div className="lap-lid" data-lid>
          <div className="lap-face lap-front">
            <div className="lap-screen" ref={screen}>
              <div className="lap-app">{children}</div>
              <div className="lap-off" data-screen-off />
              <div className="lap-glare" />
            </div>
            <span className="lap-cam" />
          </div>
          <div className="lap-face lap-back">
            <Mark className="lap-logo" />
            <div className="lap-sheen" data-lid-sheen />
          </div>
          {/* Canto superior de la tapa: con la tapa abierta es el filo de la
              pantalla; cerrada, el frente de la tapa sobre la base. */}
          <div className="lap-rim" />
        </div>

        <div className="lap-base">
          {/* Teclado ANSI de Mac y trackpad, dibujados a escala (deck.svg). */}
          <img className="lap-kbd" src={deckUrl} alt="" draggable={false} decoding="async" />
          <div className="lap-shade" data-deck-shade />
          <div className="lap-spill" data-deck-spill />
          <div className="lap-edge">
            <span className="lap-notch" />
          </div>
        </div>
      </div>
    </div>
  )
})
