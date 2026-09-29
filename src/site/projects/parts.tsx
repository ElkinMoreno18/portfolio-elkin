import { useLayoutEffect, useRef, useState, type MouseEvent } from 'react'
import { Link } from 'react-router-dom'
import { flushSync } from 'react-dom'
import { useLang } from '@/i18n'
import { cn } from '@/lib/utils'
import type { Project, ProjectCategory, ProjectMetric } from '@/lib/types'
import { Tag } from '../ui'
import { IconArrowRight } from '../icons'
import { projectsCopy as c } from './copy'
import { categoryLabel, preloadProjectPage, projectPath, yearLabel } from './data'
import { techLabel } from '../experience/format'
import { useMorphLink } from './morph'
import { schemaFor } from './schemas'
import { Schematic } from './Schematic'
import { BrowserFrame } from './BrowserFrame'
import { StackPanel } from './StackLayers'

/* ─────────────────────────── Métricas como especificación ───────────────────────────
   Cifra en mono + etiqueta que continúa la frase ("20+ sitios entregados").
   Lista compacta con filetes, no la plantilla de "número gigante". */
export function SpecList({ metrics, className, size = 'row' }: { metrics: ProjectMetric[]; className?: string; size?: 'row' | 'lg' }) {
  const { field } = useLang()
  if (!metrics.length) return null
  return (
    <ul className={cn('pj-spec', size === 'lg' ? 'pj-spec-lg' : 'pj-spec-row', className)}>
      {metrics.map((m, i) => (
        <li key={i}>
          <span className="pj-spec-value tnum">{m.value}</span>
          <span className="pj-spec-label">{field(m, 'label')}</span>
        </li>
      ))}
    </ul>
  )
}

/* ─────────────────────────── Enlace que cubre toda la pieza ───────────────────────────
   El título es el enlace (nombre accesible corto) y su ::after cubre la pieza. */
function useProjectLink(p: Project) {
  const morph = useMorphLink()
  const to = projectPath(p)
  return {
    to,
    onClick: (e: MouseEvent<HTMLAnchorElement>) => morph(e, to, e.currentTarget.closest('[data-flip]')?.querySelector('.pj-visual') ?? null),
    onPointerEnter: () => void preloadProjectPage(),
    onFocus: () => void preloadProjectPage(),
    className: 'pj-link',
  }
}

function ViewCue({ className }: { className?: string }) {
  const { pick } = useLang()
  return (
    <span aria-hidden="true" className={cn('pj-cue', className)}>
      {pick(c.view)}
      <IconArrowRight className="pj-cue-arrow" />
    </span>
  )
}

/* ─────────────────────────── Destacado sin captura: fila densa con su esquema ─────────────────────────── */
export function FeaturedRow({ p, hidden }: { p: Project; hidden: boolean }) {
  const { pick, lang, field } = useLang()
  const props = useProjectLink(p)
  const schema = schemaFor(p.slug)

  return (
    <li data-flip data-flip-id={p.id} className={cn('pj-row group relative', hidden && 'hidden')}>
      {/* Orden en móvil: titular, esquema + cifras, detalle. En escritorio, texto a la izquierda. */}
      <div className="grid gap-8 py-10 md:py-12 xl:grid-cols-12 xl:grid-rows-[auto_1fr] xl:gap-x-10 xl:gap-y-7">
        <div className="min-w-0 xl:col-span-5 xl:row-start-1" data-pj-text>
          <h3 className="text-[clamp(1.45rem,1.1rem+1vw,1.9rem)] leading-[1.12] tracking-[-0.03em]">
            <Link {...props}>{field(p, 'title')}</Link>
          </h3>
          <p className="mt-3 max-w-[34rem] text-[17px] leading-relaxed text-text-2">{field(p, 'tagline')}</p>
        </div>

        <div className="flex min-w-0 flex-col gap-5 xl:col-span-7 xl:col-start-6 xl:row-span-2 xl:row-start-1">
          <div aria-hidden="true">
            {schema ? <Schematic schema={schema} className="pj-visual" /> : <StackPanel tech={p.tech} className="pj-visual" />}
          </div>
          <SpecList metrics={p.metrics} size="row" />
        </div>

        <div className="flex min-w-0 flex-col xl:col-span-5 xl:row-start-2" data-pj-text>
          <div>
            <p className="text-[13px] text-text-3">{pick(c.role)}</p>
            <p className="mt-1 max-w-[34rem] text-[15px] leading-relaxed text-text-2">{field(p, 'role')}</p>
          </div>

          <ul className="mt-5 flex flex-wrap gap-1.5" aria-label={pick(c.tech)}>
            {p.tech.map((t) => (
              <li key={t}>
                <Tag>{techLabel(t, lang)}</Tag>
              </li>
            ))}
          </ul>

          <div className="mt-auto flex items-center justify-between gap-4 pt-8 text-[13px] text-text-3">
            <span>
              {categoryLabel(p.category, lang)} · <span className="tnum font-mono">{yearLabel(p, lang)}</span>
            </span>
            <ViewCue />
          </div>
        </div>
      </div>
    </li>
  )
}

/* ─────────────────────────── Web con captura real: ventana grande ─────────────────────────── */
export function CoverItem({ p, hidden, large }: { p: Project; hidden: boolean; large: boolean }) {
  const { pick, lang, field } = useLang()
  const props = useProjectLink(p)
  const title = field(p, 'title')

  return (
    <li
      data-flip
      data-flip-id={p.id}
      className={cn('pj-cover group relative min-w-0', large ? 'md:col-span-12' : 'md:col-span-6', hidden && 'hidden')}
    >
      <div className="pj-stage" aria-hidden="true">
        <BrowserFrame src={p.cover_url!} alt="" title={title} crop className="pj-visual" />
      </div>

      <div className={cn('mt-6 grid gap-x-10 gap-y-4', large && 'lg:grid-cols-12')}>
        <div className={cn('min-w-0', large && 'lg:col-span-7')}>
          <h3 className={cn('leading-[1.12] tracking-[-0.03em]', large ? 'text-[clamp(1.45rem,1.1rem+1vw,1.9rem)]' : 'text-[1.4rem]')}>
            <Link {...props}>{title}</Link>
          </h3>
          <p className={cn('mt-2.5 text-text-2', large ? 'max-w-[40rem] text-[17px] leading-relaxed' : 'max-w-[36rem] text-[16px] leading-relaxed')}>
            {field(p, 'tagline')}
          </p>
        </div>
        <div className={cn('flex min-w-0 flex-col gap-4', large && 'lg:col-span-4 lg:col-start-9 lg:items-end lg:text-right')}>
          <ul className={cn('flex flex-wrap gap-1.5', large && 'lg:justify-end')} aria-label={pick(c.tech)}>
            {p.tech.map((t) => (
              <li key={t}>
                <Tag>{techLabel(t, lang)}</Tag>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-4 text-[13px] text-text-3">
            <span>
              {categoryLabel(p.category, lang)} · <span className="tnum font-mono">{yearLabel(p, lang)}</span>
            </span>
            <ViewCue />
          </div>
        </div>
      </div>
    </li>
  )
}

/* ─────────────────────────── El resto: fila de la tabla índice ─────────────────────────── */
export const INDEX_COLS = 'md:grid-cols-[5.75rem_minmax(0,1.7fr)_minmax(0,1.1fr)_minmax(0,1fr)_1.25rem]'

export function IndexRow({ p, hidden }: { p: Project; hidden: boolean }) {
  const { lang, field, pick } = useLang()
  const props = useProjectLink(p)
  const m = p.metrics[0]
  const shown = p.tech.slice(0, 2)
  const rest = p.tech.length - shown.length

  return (
    <li data-flip data-flip-id={p.id} className={cn('pj-irow group relative', hidden && 'hidden')}>
      <div className={cn('grid gap-x-6 gap-y-2 py-5 md:items-center md:py-6', INDEX_COLS)}>
        <span className="order-3 text-[13px] text-text-3 md:order-none">
          <span className="tnum font-mono">{yearLabel(p, lang)}</span>
          <span className="md:hidden"> · {categoryLabel(p.category, lang)}</span>
        </span>
        <div className="order-1 min-w-0 md:order-none">
          <h3 className="text-[17px] leading-snug font-semibold tracking-[-0.015em]">
            <Link {...props}>{field(p, 'title')}</Link>
          </h3>
          <p className="mt-1 text-[14px] leading-snug text-text-3 md:line-clamp-1">{field(p, 'tagline')}</p>
        </div>
        {/* Sin cifra, la celda repite el tipo: en móvil ya va en la línea del año. */}
        <p className={cn('order-2 min-w-0 text-[14px] leading-snug md:order-none', !m && 'hidden md:block')}>
          {m ? (
            <>
              <span className="tnum font-mono text-text">{m.value}</span> <span className="text-text-2">{field(m, 'label')}</span>
            </>
          ) : (
            <span className="text-text-3">{categoryLabel(p.category, lang)}</span>
          )}
        </p>
        <ul className="order-4 hidden flex-wrap gap-1.5 md:order-none md:flex" aria-label={pick(c.tech)}>
          {shown.map((t) => (
            <li key={t}>
              <Tag>{techLabel(t, lang)}</Tag>
            </li>
          ))}
          {rest > 0 && (
            <li>
              <Tag>{c.more[lang](rest)}</Tag>
            </li>
          )}
        </ul>
        <IconArrowRight aria-hidden="true" className="pj-irow-arrow hidden text-text-3 md:block" />
      </div>
    </li>
  )
}

/* ─────────────────────────── Filtro segmentado ─────────────────────────── */
export type Filter = 'all' | ProjectCategory

export function FilterBar({
  options,
  value,
  onChange,
}: {
  options: { value: Filter; label: string; n: number }[]
  value: Filter
  onChange: (v: Filter) => void
}) {
  const { pick, lang } = useLang()
  const group = useRef<HTMLDivElement>(null)
  const scroller = useRef<HTMLDivElement>(null)
  const [pill, setPill] = useState<{ x: number; w: number; total: number } | null>(null)
  const [animate, setAnimate] = useState(false)

  // Se mide en los avisos del ResizeObserver (llegan tras el layout del
  // navegador y antes de pintar, también el primero al observar), no durante
  // el commit: el primer montaje no fuerza un layout de toda la página.
  // flushSync mantiene la píldora en el mismo fotograma que la pestaña.
  useLayoutEffect(() => {
    const el = group.current?.querySelector<HTMLElement>('[aria-pressed="true"]')
    if (!el) return
    const place = () =>
      flushSync(() => setPill({ x: el.offsetLeft, w: el.offsetWidth, total: group.current?.clientWidth ?? 0 }))
    const ro = new ResizeObserver(place)
    ro.observe(el)
    if (group.current) ro.observe(group.current)
    return () => ro.disconnect()
  }, [value, lang, options.length])

  // Si el filtro no cabe (móvil, tableta), el borde por el que sigue se
  // desvanece: se ve que hay más pestañas en vez de un corte seco.
  useLayoutEffect(() => {
    const el = scroller.current
    if (!el) return
    const update = () => {
      const left = el.scrollLeft
      const max = el.scrollWidth - el.clientWidth
      el.toggleAttribute('data-more-start', left > 1)
      el.toggleAttribute('data-more-end', max - left > 1)
    }
    // La primera lectura la hace el aviso inicial del ResizeObserver.
    el.addEventListener('scroll', update, { passive: true })
    const ro = new ResizeObserver(update)
    ro.observe(el)
    if (group.current) ro.observe(group.current)
    return () => {
      el.removeEventListener('scroll', update)
      ro.disconnect()
    }
  }, [])

  // Sin transición en la primera colocación: la píldora no "llega" desde la izquierda.
  useLayoutEffect(() => {
    if (pill && !animate) requestAnimationFrame(() => setAnimate(true))
  }, [pill, animate])

  return (
    <div ref={scroller} className="pj-tabs-scroll">
      <div ref={group} role="group" aria-label={pick(c.filterLabel)} className="pj-tabs">
        {pill && (
          <span
            aria-hidden="true"
            className={cn('pj-tab-pill', animate && 'pj-tab-pill-anim')}
            // Recorte en vez de width/left: la píldora se desliza sin recalcular el layout.
            style={{ clipPath: `inset(0 ${Math.max(0, pill.total - pill.x - pill.w)}px 0 ${pill.x}px round 7px)` }}
          />
        )}
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            aria-pressed={value === o.value}
            onClick={(e) => {
              onChange(o.value)
              e.currentTarget.scrollIntoView({ block: 'nearest', inline: 'nearest' })
            }}
            className="pj-tab"
          >
            {o.label}
            <span className="pj-tab-n">{o.n}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
