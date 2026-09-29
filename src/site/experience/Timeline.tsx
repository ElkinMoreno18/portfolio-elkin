import { useEffect, useId, useRef, useState, type SVGProps } from 'react'
import { useLang } from '@/i18n'
import { experience, type Job } from '@/data/profile'
import { cn } from '@/lib/utils'
import { gsap, ScrollTrigger, useGSAP, EASE_OUT, alreadyPast, revealOnFocus, scheduleRefresh, whenIdle } from '../motion'
import { Tag } from '../ui'
import { expCopy as c } from './copy'
import { durationMonths, formatDuration, isoMonth, plain, splitFigures, splitPeriod, techLabel } from './format'

/** Logros visibles de entrada en los puestos antiguos (los dos primeros traen las cifras). */
const VISIBLE = 2
/** Los dos puestos más recientes se muestran siempre completos. */
const ALWAYS_OPEN = 2
/** Línea de lectura: donde el raíl "está" mientras bajas. */
const READ_LINE = '62%'

/* Icono local, mismas reglas que icons.tsx: rejilla 16, trazo 1.5. */
function IconChevronDown(p: SVGProps<SVGSVGElement>) {
  return (
    <svg width={16} height={16} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" {...p}>
      <path d="M4.5 6.5L8 10l3.5-3.5" />
    </svg>
  )
}

/**
 * Línea de tiempo de la experiencia, estilo changelog.
 *
 * Escritorio: fecha fija (sticky) a la izquierda mientras su puesto pasa,
 * raíl en medio y contenido a la derecha. Móvil: raíl a la izquierda y la
 * fecha encima del puesto.
 *
 * Movimiento (sólo sin "reducir movimiento"): el raíl se llena en gris
 * ligado al scroll (scrub) y cada nodo se marca cuando la línea lo alcanza
 * (el acento queda sólo en el puesto actual);
 * cada puesto se despliega de arriba abajo con un recorte, en el mismo
 * sentido que el raíl. Sin JS o con movimiento reducido todo está visible
 * y el raíl queda neutro.
 */
export function Timeline() {
  const { pick } = useLang()
  const wrap = useRef<HTMLDivElement>(null)
  const fracs = useRef<number[]>([])

  /* Geometría del raíl: del primer nodo al último. Se mide, no se adivina. */
  const layout = () => {
    const el = wrap.current
    if (!el) return
    const track = el.querySelector<HTMLElement>('[data-track]')
    const nodes = Array.from(el.querySelectorAll<HTMLElement>('[data-node]'))
    if (!track || nodes.length < 2) return
    const top0 = el.getBoundingClientRect().top
    const ys = nodes.map((n) => {
      const r = n.getBoundingClientRect()
      return r.top + r.height / 2 - top0
    })
    const top = ys[0]
    const h = Math.max(1, ys[ys.length - 1] - top)
    track.style.top = `${top}px`
    track.style.height = `${h}px`
    track.style.bottom = 'auto'
    fracs.current = ys.map((y) => (y - top) / h)
  }

  // Cambios de tamaño (fuentes, idioma, desplegables, contenido de otras
  // secciones): se recoloca el raíl y se recalculan los disparadores.
  // El refresh se pide sólo si el alto de <main> cambió desde el último: el
  // propio refresh (el espaciador del pin de la portada) también lo cambia, y
  // sin esta comprobación cada refresh pedía otro.
  useEffect(() => {
    const el = wrap.current
    if (!el) return
    const main = document.getElementById('main')
    let settled = -1
    const onRefresh = () => {
      settled = main?.offsetHeight ?? -1
    }
    ScrollTrigger.addEventListener('refresh', onRefresh)
    const ro = new ResizeObserver(() => {
      layout()
      if (!main || main.offsetHeight !== settled) scheduleRefresh()
    })
    ro.observe(el)
    if (main) ro.observe(main)
    return () => {
      ro.disconnect()
      ScrollTrigger.removeEventListener('refresh', onRefresh)
    }
  }, [])

  // Queda por debajo de la portada: se monta con el hilo principal libre.
  // El raíl lo coloca el ResizeObserver de arriba (su primera lectura llega
  // con el layout ya hecho); medirlo aquí forzaba un layout de toda la página
  // antes de la primera pintura.
  useGSAP((_, contextSafe) => whenIdle(contextSafe!(build)), { scope: wrap })

  function build() {
    const el = wrap.current!
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const q = gsap.utils.selector(el)
      const fill = q('[data-fill]')[0]
      const track = q('[data-track]')[0]
      const nodes = q('[data-node]')
      // Primero todas las lecturas, luego las escrituras: cada lectura tras
      // una escritura forzaba otro layout de la página entera.
      const jobs = q('[data-job]').map((job) => ({ job, past: alreadyPast(job, 'top 86%') }))
      layout()
      el.setAttribute('data-armed', '')

      /* 1. El raíl se llena al ritmo del scroll. */
      gsap.fromTo(
        fill,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: { trigger: track, start: `top ${READ_LINE}`, end: `bottom ${READ_LINE}`, scrub: 0.4 },
          onUpdate(this: gsap.core.Tween) {
            const p = this.progress()
            nodes.forEach((n, i) => n.toggleAttribute('data-reached', p > 0 && p >= (fracs.current[i] ?? 1) - 0.002))
          },
        },
      )

      /* 2. Cada puesto se despliega hacia abajo; la fecha llega desde el raíl. */
      jobs.forEach(({ job, past }) => {
        if (past) return
        const body = job.querySelector('[data-body]')
        const when = job.querySelector('[data-when]')
        const tl = gsap.timeline({ scrollTrigger: { trigger: job, start: 'top 86%', once: true } })
        revealOnFocus(tl, job)
        tl.fromTo(
          body,
          { clipPath: 'inset(0% 0% 100% 0%)', y: 14 },
          { clipPath: 'inset(0% 0% 0% 0%)', y: 0, duration: 1, ease: EASE_OUT, clearProps: 'clipPath,transform' },
          0,
        ).from(when, { opacity: 0, x: 10, duration: 0.6, ease: EASE_OUT, clearProps: 'opacity,transform' }, 0.1)
      })

      return () => {
        el.removeAttribute('data-armed')
        nodes.forEach((n) => n.removeAttribute('data-reached'))
      }
    })
  }

  return (
    <div ref={wrap} className="exp-timeline">
      <div className="exp-track" data-track aria-hidden="true">
        <div className="exp-fill" data-fill />
      </div>
      <ol className="exp-list" aria-label={pick(c.jobsLabel)}>
        {experience.map((job, i) => (
          <JobEntry key={job.company + job.period.en} job={job} index={i} />
        ))}
      </ol>
    </div>
  )
}

function JobEntry({ job, index }: { job: Job; index: number }) {
  const { lang, pick } = useLang()
  const id = useId()
  const [open, setOpen] = useState(false)

  const items = job.achievements[lang]
  const collapsible = index >= ALWAYS_OPEN && items.length > VISIBLE
  const hidden = collapsible ? items.length - VISIBLE : 0

  const { start, end } = splitPeriod(pick(job.period))
  const en = splitPeriod(job.period.en)
  const months = durationMonths(job.period.en)

  return (
    <li className="exp-job" data-job data-current={job.current || undefined}>
      <span className="exp-node" data-node aria-hidden="true" />

      <div className="exp-when">
        <div className="exp-when-inner" data-when>
          <p className="font-mono text-[13px] leading-5 text-text-2 tnum">
            <time dateTime={isoMonth(en.start)}>{start}</time>
            <span className="text-text-3"> – </span>
            {job.current ? (
              <span className="text-accent">{end}</span>
            ) : (
              <time dateTime={isoMonth(en.end)}>{end}</time>
            )}
          </p>
          {months != null && (
            <p className="font-mono text-[12px] leading-5 text-text-3 tnum">
              <span className="sr-only">{pick(c.duration)}: </span>
              {formatDuration(months, lang)}
            </p>
          )}
        </div>
      </div>

      <div className="exp-body" data-body>
        <h3 className="text-[clamp(1.125rem,1.05rem+0.3vw,1.3rem)] leading-[1.25] tracking-[-0.022em]">
          {pick(job.role)}
        </h3>
        <p className="mt-1.5 text-[15px] leading-snug">
          <span className="font-medium text-text">{job.company}</span>
          <span className="text-text-3 max-md:hidden"> · </span>
          <span className="text-text-3 max-md:mt-0.5 max-md:block">{pick(job.location)}</span>
        </p>

        <p className="mt-4 max-w-[42rem] text-[16px] leading-relaxed text-text-2">{plain(pick(job.summary))}</p>

        <ul id={`${id}-ach`} className="exp-ach mt-4 max-w-[42rem]" aria-label={pick(c.achievements)}>
          {items.map((a, j) => {
            const extra = collapsible && j >= VISIBLE
            const content = <Figures text={plain(a)} />
            if (!extra) return <li key={j}>{content}</li>
            return (
              <li key={j} className="exp-more" data-open={open || undefined} inert={!open}>
                <div className="exp-more-inner">
                  <div className="exp-more-pad">{content}</div>
                </div>
              </li>
            )
          })}
        </ul>

        {collapsible && (
          <button
            type="button"
            aria-expanded={open}
            aria-controls={`${id}-ach`}
            onClick={() => setOpen((o) => !o)}
            className="exp-toggle group mt-3 -ml-2 inline-flex h-8 items-center gap-1.5 rounded-[var(--radius-sm)] px-2 text-[14px] font-medium text-text-2 transition-colors duration-200 hover:bg-surface hover:text-text"
          >
            <IconChevronDown className={cn('transition-transform duration-200 ease-[var(--ease-out)]', open && 'rotate-180')} />
            {open ? pick(c.less) : c.more[lang](hidden)}
          </button>
        )}

        <ul className="mt-6 flex flex-wrap gap-1.5" aria-label={pick(c.tech)}>
          {job.tech.map((t) => (
            <li key={t}>
              <Tag>{techLabel(t, lang)}</Tag>
            </li>
          ))}
        </ul>
      </div>
    </li>
  )
}

/** Texto con las cifras reales resaltadas por peso, sin cambiar de familia. */
function Figures({ text }: { text: string }) {
  return (
    <>
      {splitFigures(text).map((part, k) =>
        part.figure ? (
          <span key={k} className="font-medium text-text">
            {part.text}
          </span>
        ) : (
          part.text
        ),
      )}
    </>
  )
}
