import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useLang } from '@/i18n'
import { cn } from '@/lib/utils'
import { CATEGORIES } from '@/lib/types'
import { gsap, Flip, useGSAP, EASE_OUT, EASE_IN_OUT, reveal, revealOnFocus, prefersReducedMotion, scheduleRefresh, whenIdle, alreadyPast } from '../motion'
import { Container, SectionHeader } from '../ui'
import { projectsCopy as c } from '../projects/copy'
import { kindOf, useProjectList } from '../projects/data'
import { CoverItem, FeaturedRow, FilterBar, INDEX_COLS, IndexRow, type Filter } from '../projects/parts'
import './projects.css'

/**
 * Índice de proyectos. No es una rejilla de tarjetas iguales: cada proyecto
 * se presenta según lo que de verdad tiene.
 *  1. Destacados sin captura → filas densas con el esquema de su flujo.
 *  2. Webs con captura real  → ventanas grandes que se enderezan con el scroll.
 *  3. El resto               → tabla índice.
 * El filtro reordena con Flip; los grupos nunca se mezclan.
 */
export function Projects() {
  const { pick, lang } = useLang()
  const { projects, demo, loading } = useProjectList()
  const [filter, setFilter] = useState<Filter>('all')
  const root = useRef<HTMLElement>(null)
  const flipState = useRef<Flip.FlipState | null>(null)
  const list = useRef<HTMLDivElement>(null)
  const listHeight = useRef(0)
  /** El montaje no pide refresh (lo pide el efecto de datos); un cambio de filtro, sí. */
  const mounted = useRef(false)

  const groups = useMemo(
    () => ({
      featured: projects.filter((p) => kindOf(p) === 'featured'),
      cover: projects.filter((p) => kindOf(p) === 'cover'),
      index: projects.filter((p) => kindOf(p) === 'index'),
    }),
    [projects],
  )

  const shows = (p: { category: string }) => filter === 'all' || p.category === filter
  const visibleCount = projects.filter(shows).length
  const visibleCovers = groups.cover.filter(shows)
  const indexVisible = groups.index.some(shows)
  const featuredVisible = groups.featured.some(shows)

  const options = useMemo(
    () => [
      { value: 'all' as Filter, label: pick(c.all), n: projects.length },
      ...CATEGORIES.filter((cat) => projects.some((p) => p.category === cat.value)).map((cat) => ({
        value: cat.value as Filter,
        label: cat[lang],
        n: projects.filter((p) => p.category === cat.value).length,
      })),
    ],
    [projects, lang, pick],
  )

  const choose = (v: Filter) => {
    if (v === filter) return
    if (!prefersReducedMotion() && root.current) {
      flipState.current = Flip.getState(root.current.querySelectorAll('[data-flip]'))
      listHeight.current = list.current?.offsetHeight ?? 0
    }
    setFilter(v)
  }

  // Tras el cambio de filtro: cada pieza viaja a su nuevo sitio.
  useLayoutEffect(() => {
    const state = flipState.current
    flipState.current = null
    if (!state || !root.current) {
      // Sin Flip (montaje o movimiento reducido): ninguna pieza se queda a medio
      // fundido. En el montaje no se refresca nada: lo hace el efecto de abajo,
      // una sola vez, cuando la lista tiene su alto definitivo.
      const pieces = root.current?.querySelectorAll('[data-flip]')
      // Mientras cargan los datos no hay piezas: nada que limpiar (ni aviso de GSAP).
      if (pieces?.length) gsap.set(pieces, { clearProps: 'opacity,transform' })
      if (mounted.current) scheduleRefresh()
      mounted.current = true
      return
    }
    // Durante el Flip las piezas van en absoluto: la lista conserva su alto y
    // lo lleva al nuevo, para que lo que hay debajo no salte.
    const el = list.current
    const to = el?.offsetHeight ?? 0
    const height = el ? gsap.fromTo(el, { height: listHeight.current }, { height: to, duration: 0.5, ease: EASE_IN_OUT, clearProps: 'height' }) : null
    const tween = Flip.from(state, {
      targets: root.current.querySelectorAll('[data-flip]'),
      duration: 0.5,
      ease: EASE_IN_OUT,
      stagger: 0.03,
      absolute: true,
      onEnter: (els) =>
        gsap.fromTo(
          els,
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.45, ease: EASE_OUT, stagger: 0.04, delay: 0.12, overwrite: 'auto' },
        ),
      onLeave: (els) => gsap.to(els, { opacity: 0, duration: 0.2, ease: EASE_OUT, overwrite: 'auto' }),
      onComplete: () => scheduleRefresh(0),
    })
    return () => {
      tween.progress(1)
      height?.progress(1)
    }
  }, [filter])

  // Los proyectos llegan asíncronos y las fuentes cambian el alto del texto de
  // toda la página: lo que queda por debajo recalcula posiciones UNA vez,
  // cuando ya están las dos cosas. Cada captura que carga pide otro, que se
  // agrupa con los demás (scheduleRefresh).
  useEffect(() => {
    if (loading || !root.current) return
    let alive = true
    const fonts = document.fonts?.ready ?? Promise.resolve()
    fonts.then(() => alive && scheduleRefresh())
    const imgs = Array.from(root.current.querySelectorAll<HTMLImageElement>('[data-frame-img]')).filter((img) => !img.complete)
    const onLoad = () => alive && scheduleRefresh()
    imgs.forEach((img) => img.addEventListener('load', onLoad, { once: true }))
    return () => {
      alive = false
      imgs.forEach((img) => img.removeEventListener('load', onLoad))
    }
  }, [loading])

  // Todo esto queda por debajo de la portada: se monta cuando el hilo
  // principal queda libre, no antes de la primera pintura.
  useGSAP(
    (_, contextSafe) => {
      if (!projects.length) return
      return whenIdle(contextSafe!(build))
    },
    { scope: root, dependencies: [projects.length], revertOnUpdate: true },
  )

  function build() {
    const q = gsap.utils.selector(root)
    const mm = gsap.matchMedia()

    mm.add(
      { motion: '(prefers-reduced-motion: no-preference)', wide: '(min-width: 768px)' },
      (ctx) => {
        const { motion, wide } = ctx.conditions as Record<string, boolean>
        if (!motion) return

        /* Cabecera: aparición corta, sin desplazamiento largo. */
        reveal(q('[data-pj-head]'), { trigger: q('[data-pj-head]')[0], from: { y: 10, clearProps: 'transform' }, stagger: 0.06, start: 'top 85%' })

        /* Filas destacadas: el texto sube en bloque; el esquema se dibuja solo.
           clearProps: un transform residual en el h3 lo convertiría en el
           bloque contenedor del enlace extendido y sólo el título sería clicable. */
        q('.pj-row').forEach((row) => {
          reveal(row.querySelectorAll('[data-pj-text] > *'), { trigger: row, from: { y: 16, clearProps: 'transform' }, stagger: 0.05, start: 'top 78%' })
        })

        /* Ventanas con captura: empiezan inclinadas en perspectiva y se
           enderezan mientras entran; la captura se desplaza dentro. */
        q('.pj-stage > .pj-frame').forEach((frame) => {
          const item = frame.closest('[data-flip]')!
          const settle = { trigger: item, start: 'top bottom', end: wide ? 'top 28%' : 'top 40%', scrub: 0.6 }
          gsap.fromTo(
            frame,
            { rotationX: wide ? 13 : 8, scale: wide ? 0.9 : 0.94, transformPerspective: 1500, transformOrigin: '50% 100%' },
            { rotationX: 0, scale: 1, ease: 'none', scrollTrigger: settle },
          )
          const img = frame.querySelector<HTMLImageElement>('[data-frame-img]')
          const view = img?.parentElement
          if (img && view) {
            // La captura llega desde un poco más abajo y termina mostrando su
            // cabecera completa justo cuando la ventana queda plana.
            gsap.fromTo(
              img,
              { y: () => -Math.max(0, img.offsetHeight - view.offsetHeight) },
              { y: 0, ease: 'none', scrollTrigger: { ...settle, invalidateOnRefresh: true } },
            )
          }
        })

        /* Tabla índice: cada fila se descubre de arriba abajo. */
        const rows = q('.pj-irow:not(.hidden)')
        const index = q('[data-pj-index]')[0]
        if (rows.length && !alreadyPast(index)) {
          const tween = gsap.from(rows, {
            clipPath: 'inset(0 0 100% 0)',
            opacity: 0.4,
            duration: 0.6,
            ease: EASE_OUT,
            stagger: 0.06,
            clearProps: 'clipPath,opacity',
            scrollTrigger: { trigger: index, start: 'top 82%', once: true },
          })
          revealOnFocus(tween, index)
        }
      },
    )
  }

  return (
    <section ref={root} id="proyectos" aria-labelledby="proyectos-title" className="border-t border-line py-24 md:py-32">
      <Container size="wide">
        <div data-pj-head>
          <SectionHeader id="proyectos-title" title={pick(c.title)} lead={pick(c.lead)} className="mb-10 md:mb-12" />
        </div>

        <div data-pj-head className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {options.length > 2 ? <FilterBar options={options} value={filter} onChange={choose} /> : <span />}
          <p aria-live="polite" className="tnum shrink-0 font-mono text-[13px] text-text-3">
            {loading ? pick(c.loading) : c.count[lang](visibleCount)}
          </p>
        </div>

        {loading ? (
          <Skeleton />
        ) : (
          <div ref={list} className="mt-6">
            {/* 1 · Destacados */}
            <ol className={cn(featuredVisible && 'border-b border-line')}>
              {groups.featured.map((p) => (
                <FeaturedRow key={p.id} p={p} hidden={!shows(p)} />
              ))}
            </ol>

            {/* 2 · Webs con captura */}
            <ol className={cn('grid gap-x-8 gap-y-16 md:grid-cols-12 md:gap-y-20', visibleCovers.length > 0 && (featuredVisible ? 'pt-16 md:pt-20' : 'pt-6 md:pt-10'))}>
              {groups.cover.map((p) => (
                <CoverItem key={p.id} p={p} hidden={!shows(p)} large={visibleCovers[0]?.id === p.id} />
              ))}
            </ol>

            {/* 3 · Índice */}
            <div data-pj-index className={cn(indexVisible && (featuredVisible || visibleCovers.length > 0 ? 'pt-20 md:pt-28' : 'pt-6 md:pt-8'))}>
              <div
                data-flip
                data-flip-id="pj-thead"
                aria-hidden="true"
                className={cn(
                  'hidden gap-x-6 border-b border-line pb-3 text-[13px] text-text-3',
                  indexVisible && 'md:grid',
                  INDEX_COLS,
                )}
              >
                <span>{pick(c.table.year)}</span>
                <span>{pick(c.table.project)}</span>
                <span>{pick(c.table.outcome)}</span>
                <span>{pick(c.table.stack)}</span>
                <span />
              </div>
              <ol className="pj-index">
                {groups.index.map((p) => (
                  <IndexRow key={p.id} p={p} hidden={!shows(p)} />
                ))}
              </ol>
            </div>
          </div>
        )}

        {import.meta.env.DEV && demo && !loading && (
          <p className="mt-12 max-w-[68ch] font-mono text-[12px] text-text-3">{pick(c.devDemo)}</p>
        )}
      </Container>
    </section>
  )
}

/** Mientras llegan los datos: la forma de las filas destacadas, sin brillo animado. */
function Skeleton() {
  return (
    <div aria-hidden="true" className="mt-6">
      {[0, 1].map((i) => (
        <div key={i} className="grid gap-8 border-t border-line py-12 xl:grid-cols-12 xl:gap-x-10">
          <div className="flex flex-col gap-3 xl:col-span-5">
            <div className="h-7 w-3/4 rounded-[6px] bg-surface" />
            <div className="h-4 w-full rounded-[6px] bg-surface" />
            <div className="h-4 w-2/3 rounded-[6px] bg-surface" />
          </div>
          <div className="h-64 rounded-[var(--radius-lg)] border border-line bg-bg-raised xl:col-span-7" />
        </div>
      ))}
    </div>
  )
}
