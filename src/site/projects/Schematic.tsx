import { useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { useLang } from '@/i18n'
import { cn } from '@/lib/utils'
import { gsap, ScrollTrigger, useGSAP, EASE_OUT, prefersReducedMotion, whenIdle, alreadyPast } from '../motion'
import { projectsCopy as c } from './copy'
import type { FlowSchema, Label, SchemaEdge } from './schemas'

const ACCENT = '#ff6b2c'
const ACCENT_LINE = 'rgba(255, 107, 44, 0.45)'

type Box = { x: number; y: number; w: number; h: number }
type Drawn = { key: string; d: string; kind: SchemaEdge['kind']; step: number }

/**
 * Esquema de un flujo, en el mismo lenguaje que la app de la portada:
 * nodos sobre lienzo punteado y aristas de trazo fino. Los nodos los coloca
 * una rejilla CSS (etapas en columnas); las aristas se miden después, así
 * el dibujo se adapta a cualquier ancho. Si el contenedor es estrecho, el
 * flujo pasa a leerse de arriba abajo.
 *
 * Movimiento: al entrar, los nodos aparecen y la ruta principal se dibuja
 * etapa a etapa en acento (el dato recorriendo el flujo) hasta quedarse en
 * su tono "automatizado". Sin JS o con movimiento reducido, se ve directamente
 * el estado final.
 */
export function Schematic({
  schema,
  play = 'scroll',
  size = 'row',
  label,
  className,
  style,
}: {
  schema: FlowSchema
  play?: 'scroll' | 'mount' | 'none'
  size?: 'row' | 'page'
  label?: string
  className?: string
  style?: CSSProperties
}) {
  const { pick, lang } = useLang()
  const wrap = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLDivElement>(null)
  const played = useRef(false)
  const [vertical, setVertical] = useState(false)
  const [drawn, setDrawn] = useState<Drawn[]>([])
  const [box, setBox] = useState({ w: 0, h: 0 })

  const t = (l: Label) => (typeof l === 'string' ? l : pick(l))
  const rows = Math.max(...schema.nodes.map((n) => n.row))
  const stageOf = useMemo(() => Object.fromEntries(schema.nodes.map((n) => [n.id, n.stage])), [schema])

  // Orden de dibujo de la ruta principal: por etapa de origen.
  const steps = useMemo(() => {
    const s = [...new Set(schema.edges.filter((e) => e.kind === 'main').map((e) => stageOf[e.from]))].sort((a, b) => a - b)
    return (id: string) => s.indexOf(stageOf[id])
  }, [schema, stageOf])

  // Orientación según el ancho del propio contenedor, no de la ventana.
  useLayoutEffect(() => {
    const el = wrap.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setVertical(e.contentRect.width < 540))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Aristas: se miden con offset* (inmunes a los transforms de Flip o del 3D).
  // En el índice (play="scroll", bajo la portada) sólo desde el
  // ResizeObserver: su primera llamada llega justo después del layout del
  // fotograma, así que leer es gratis; medir durante el commit forzaba un
  // layout de la página antes de la primera pintura. En el detalle el esquema
  // se ve al cargar: se mide ya, para que la primera pintura lo traiga entero.
  useLayoutEffect(() => {
    const el = canvas.current
    if (!el) return
    const measure = () => {
      const pos: Record<string, Box> = {}
      el.querySelectorAll<HTMLElement>('[data-sn]').forEach((n) => {
        pos[n.dataset.sn!] = { x: n.offsetLeft, y: n.offsetTop, w: n.offsetWidth, h: n.offsetHeight }
      })
      setBox({ w: el.offsetWidth, h: el.offsetHeight })
      setDrawn(
        schema.edges
          .filter((e) => pos[e.from] && pos[e.to])
          .map((e) => ({
            key: `${e.from}-${e.to}`,
            kind: e.kind,
            step: e.kind === 'main' ? steps(e.from) : -1,
            d: route(pos[e.from], pos[e.to], stageOf[e.from] === stageOf[e.to], vertical),
          })),
      )
    }
    if (play !== 'scroll') measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    el.querySelectorAll('[data-sn]').forEach((n) => ro.observe(n))
    return () => ro.disconnect()
  }, [schema, vertical, lang, stageOf, steps, play])

  const ready = drawn.length > 0

  useGSAP(
    (_, contextSafe) => {
      if (play === 'none' || !ready || played.current || prefersReducedMotion()) return
      // En el índice (play="scroll") queda por debajo de la portada: se monta
      // con el hilo principal libre. En el detalle se ve al cargar: ya.
      if (play === 'scroll') return whenIdle(contextSafe!(build))
      build()
    },
    { scope: wrap, dependencies: [ready, play, lang], revertOnUpdate: true },
  )

  function build() {
    if (play === 'scroll' && alreadyPast(wrap.current)) return
    const q = gsap.utils.selector(wrap)
    const maxStep = Math.max(0, ...drawn.map((d) => d.step))

    // El disparador se crea antes que los tweens: mide el esquema con el
    // layout aún limpio. Creado después, su medida llegaba tras las escrituras
    // de los from() y forzaba otro layout de la página.
    let tl: gsap.core.Timeline | undefined
    let entered = false
    if (play === 'scroll') {
      ScrollTrigger.create({
        trigger: wrap.current,
        start: 'top 82%',
        once: true,
        onEnter: () => {
          entered = true
          tl?.play()
        },
      })
    }

    tl = gsap.timeline({
      paused: play === 'scroll' && !entered,
      delay: play === 'mount' ? 0.35 : 0,
      onComplete: () => {
        played.current = true
      },
    })
    tl.from(q('[data-stage-label]'), { opacity: 0, duration: 0.4, ease: EASE_OUT, stagger: 0.05 }, 0)
    tl.from(q('[data-sn]'), { opacity: 0, y: 8, duration: 0.5, ease: EASE_OUT, stagger: 0.045 }, 0)
    tl.from(q('.sch-edge'), { opacity: 0, duration: 0.5, ease: EASE_OUT, stagger: 0.03 }, 0.15)
    tl.set(q('.sch-trail'), { stroke: ACCENT }, 0)
    for (let s = 0; s <= maxStep; s++) {
      tl.fromTo(
        q(`.sch-trail[data-step="${s}"]`),
        { strokeDashoffset: 1 },
        { strokeDashoffset: 0, duration: 0.34, ease: 'none' },
        0.5 + s * 0.3,
      )
    }
    tl.to(q('.sch-trail'), { stroke: ACCENT_LINE, duration: 0.5, ease: EASE_OUT }, '>+0.1')
  }

  const legend = (
    <ul className="sch-legend">
      <li>
        <svg width="20" height="8" viewBox="0 0 20 8" aria-hidden="true">
          <path d="M1 4h18" className="sch-swatch-main" />
        </svg>
        {pick(c.mainPath)}
      </li>
      {schema.altLabel && (
        <li>
          <svg width="20" height="8" viewBox="0 0 20 8" aria-hidden="true">
            <path d="M1 4h18" className="sch-swatch-alt" />
          </svg>
          {pick(schema.altLabel)}
        </li>
      )}
    </ul>
  )

  return (
    <div ref={wrap} className={cn('sch', size === 'page' && 'sch-page', vertical && 'sch-vertical', className)} style={style}>
      <div className="sch-bar">
        <span>{label ?? pick(c.flowSchematic)}</span>
        {!vertical && legend}
      </div>

      <div className="sch-body">
        <div
          ref={canvas}
          className="sch-canvas"
          style={
            vertical
              ? { gridTemplateColumns: `repeat(${rows}, minmax(0, 1fr))` }
              : { gridTemplateColumns: `repeat(${schema.stages.length}, minmax(0, 1fr))`, gridTemplateRows: `auto repeat(${rows}, auto)` }
          }
        >
          <svg className="sch-svg" width={box.w} height={box.h} viewBox={`0 0 ${box.w || 1} ${box.h || 1}`} aria-hidden="true">
            {drawn.map((e) => (
              <path key={`e-${e.key}`} d={e.d} className={cn('sch-edge', e.kind === 'alt' && 'sch-edge-alt')} />
            ))}
            {drawn
              .filter((e) => e.kind === 'main')
              .map((e) => (
                <path key={`t-${e.key}`} d={e.d} className="sch-trail" pathLength={1} data-step={e.step} />
              ))}
          </svg>

          {!vertical &&
            schema.stages.map((s, i) => (
              <span key={i} data-stage-label className="sch-stage" style={{ gridColumn: i + 1, gridRow: 1 }}>
                {pick(s)}
              </span>
            ))}

          {schema.nodes.map((n) => (
            <div
              key={n.id}
              data-sn={n.id}
              className="sch-node"
              style={vertical ? { gridColumn: n.row, gridRow: n.stage + 1 } : { gridColumn: n.stage + 1, gridRow: n.row + 1 }}
            >
              <span className="sch-node-label">{t(n.label)}</span>
              {n.sub && <span className="sch-node-sub">{t(n.sub)}</span>}
            </div>
          ))}
        </div>
      </div>

      {vertical && <div className="sch-foot">{legend}</div>}
    </div>
  )
}

/** Resumen en texto del esquema, para lectores de pantalla. */
export function schemaSummary(schema: FlowSchema, pick: (b: { es: string; en: string }) => string) {
  const t = (l: Label) => (typeof l === 'string' ? l : pick(l))
  return schema.stages
    .map((s, i) => {
      const nodes = schema.nodes.filter((n) => n.stage === i).map((n) => (n.sub ? `${t(n.label)} (${t(n.sub)})` : t(n.label)))
      return `${pick(s)}: ${nodes.join(', ')}`
    })
    .join('. ')
}

/**
 * Arista estilo editor de flujos. Entre etapas: sale por un lado y entra por
 * el opuesto con tangentes rectas. Dentro de una etapa: recta corta entre
 * los dos nodos.
 */
function route(a: Box, b: Box, sameStage: boolean, vertical: boolean) {
  const cx = (n: Box) => n.x + n.w / 2
  const cy = (n: Box) => n.y + n.h / 2

  if (!vertical) {
    if (sameStage) {
      const down = b.y > a.y
      const x = cx(a)
      return `M${x},${down ? a.y + a.h : a.y} L${x},${down ? b.y : b.y + b.h}`
    }
    const x0 = a.x + a.w
    const x1 = b.x
    const k = Math.max(14, (x1 - x0) * 0.5)
    return `M${x0},${cy(a)} C${x0 + k},${cy(a)} ${x1 - k},${cy(b)} ${x1},${cy(b)}`
  }

  if (sameStage) {
    const right = b.x > a.x
    const y = cy(a)
    return `M${right ? a.x + a.w : a.x},${y} L${right ? b.x : b.x + b.w},${y}`
  }
  const y0 = a.y + a.h
  const y1 = b.y
  const k = Math.max(10, (y1 - y0) * 0.5)
  return `M${cx(a)},${y0} C${cx(a)},${y0 + k} ${cx(b)},${y1 - k} ${cx(b)},${y1}`
}
