import { useRef } from 'react'
import { useLang } from '@/i18n'
import { useContent } from '@/content/store'
import { cvHref, nowLine } from '@/content/derive'
import { tasks, automationCopy } from '@/data/automation'
import { gsap, ScrollTrigger, useGSAP, afterPaint, useReducedMotion } from '../motion'
import { siteCopy } from '../copy'
import { ButtonLink, Container, TextLink } from '../ui'
import { IconArrowRight, IconDownload, IconPin } from '../icons'
import { Laptop } from './Laptop'
import { AutomationApp, TaskList } from './AutomationApp'
import './hero.css'

/** Colores que GSAP escribe en los nodos de la app del portátil. El portátil
 *  es siempre .dark (Laptop.tsx): son --accent y --node-line de ese tema. Lo
 *  que también vive en la página (filas, tarjetas del móvil) cambia por
 *  data-state y toma el color del tema desde hero.css. */
const LAPTOP = { accent: '#ff6b2c', nodeLine: '#2a2a2f' }

/** Altura de la cámara (perspective-origin) en anchos de portátil: al cargar y
 *  con la tapa abierta. CAM_END coincide con --cam-y de hero.css. */
const CAM_START = -1.35
const CAM_END = -1.03
/** Distancia de la cámara en anchos de portátil (--persp de hero.css). */
const PERSP = 5
/** Estado al cargar: tapa cerrada y portátil lejos (se ve a 0,7 de su
 *  tamaño). Los mismos valores pinta hero.css antes de que monte GSAP. */
const CLOSED = { lid: -90, scale: 0.7, cam: CAM_START, shade: 1, sheen: 1 }
/** Tableta en vertical (700 a 899 px): el portátil ya está entreabierto y más
 *  cerca al cargar; cerrado y lejos dejaba media pantalla vacía. */
const TABLET = { lid: -40, scale: 0.9, cam: -1.15, shade: 0.4, sheen: 0.25 }
/** Duración del tramo fijado en escritorio y separación entre tareas. Cuatro
 *  tareas a ~0,8 de distancia: se ve la secuencia entera sin retrasar la
 *  llegada a los proyectos. */
const PIN_LENGTH = '+=130%'
const STEP_GAP = 0.8

/**
 * Portada: texto a la izquierda, y debajo el portátil que se abre con el
 * scroll. La secuencia es scrub (la controla el usuario, hacia delante y
 * hacia atrás), así que no hay bucles automáticos que pausar.
 */
export function Hero() {
  const { pick } = useLang()
  const content = useContent()
  const { profile } = content
  const now = nowLine(content)
  const reduced = useReducedMotion()
  const root = useRef<HTMLElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const lap = useRef<HTMLDivElement>(null)

  useGSAP(
    (_, contextSafe) => {
      // El estado de partida (tapa cerrada, pantalla apagada, texto en su
      // sitio) ya lo pinta hero.css. Las líneas de tiempo y el pin se montan
      // tras la primera pintura: medir y crear ~80 tweens antes bloqueaba la
      // portada entera. Todo queda en el contexto de useGSAP y se revierte al
      // desmontar.
      return afterPaint(contextSafe!(build))
    },
    // Sin dependencias: el pin y la secuencia se montan una sola vez. Con
    // [lang] (y sin revertOnUpdate) cada cambio de idioma apilaba otro pin.
    { scope: root },
  )

  function build() {
    const q = gsap.utils.selector(root)
    const mm = gsap.matchMedia()

    mm.add(
      {
        desktop: '(min-width: 900px)',
        tablet: '(min-width: 700px) and (max-width: 899.98px)',
        motion: '(prefers-reduced-motion: no-preference)',
      },
      (ctx) => {
        const { desktop, tablet, motion } = ctx.conditions as Record<string, boolean>
        if (!motion) return // CSS ya pinta el estado final

        /* ── 1. La tapa se abre mientras bajas hasta el portátil ──
           La cámara baja a la vez: empieza mirando la tapa cerrada desde
           arriba y termina frente a la pantalla, con el teclado en escorzo.
           La luz sigue a la tapa: su sombra se retira de la base y, al
           encenderse la pantalla, su luz cae sobre el teclado. Los valores de
           partida son los mismos que hero.css pinta antes de este punto. */
        const lapEl = lap.current!
        const stageEl = stage.current!
        const scene = q('[data-lap-scene]')[0]
        const lid = q('[data-lid]')[0]
        const off = q('[data-screen-off]')[0]
        const shade = q('[data-deck-shade]')[0]
        const spill = q('[data-deck-spill]')[0]
        const sheen = q('[data-lid-sheen]')[0]

        // El ancho del portátil se lee una vez por refresh, antes de que
        // ScrollTrigger empiece a escribir: leerlo desde cada valor-función
        // forzaba un layout completo tras cada escritura.
        let lapW = lapEl.offsetWidth
        const readW = () => {
          lapW = lapEl.offsetWidth
        }
        ScrollTrigger.addEventListener('refreshInit', readW)

        const camera = (k: number) => () => `50% ${Math.round(lapW * k)}px`
        // El portátil empieza lejos de la cámara (z) en vez de escalado: la
        // perspectiva lo encoge en los tres ejes, así la tapa cerrada tiene
        // el fondo que le corresponde y queda entera sobre el pliegue.
        const start = tablet ? TABLET : CLOSED
        const far = () => -lapW * PERSP * (1 / start.scale - 1)

        gsap.set(lapEl, { transformOrigin: '50% 100%' })
        gsap.set(lid, { rotationX: start.lid, transformOrigin: '50% 100%' })
        gsap.set(off, { opacity: 1 })
        gsap.set(shade, { opacity: start.shade })
        gsap.set(spill, { opacity: 0 })
        gsap.set(sheen, { opacity: start.sheen })

        gsap
          .timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
              start: 0,
              end: () => stageEl.getBoundingClientRect().top + window.scrollY,
              scrub: 0.8,
              invalidateOnRefresh: true,
            },
          })
          .to(lid, { rotationX: 0, duration: 1 }, 0)
          .fromTo(lapEl, { z: far }, { z: 0, duration: 1 }, 0)
          .fromTo(scene, { perspectiveOrigin: camera(start.cam) }, { perspectiveOrigin: camera(CAM_END), duration: 1 }, 0)
          .to(sheen, { opacity: 0, duration: 0.5 }, 0.1)
          .to(shade, { opacity: 0, duration: 0.75 }, 0.05)
          .to(off, { opacity: 0, duration: 0.35 }, 0.62)
          .to(spill, { opacity: 1, duration: 0.38 }, 0.62)

        /* ── 2. Cada tramo de scroll automatiza una tarea ── */
        // El contador se deriva del tiempo de las líneas de tiempo, no de
        // tweens numéricos: tras un ScrollTrigger.refresh (imágenes que
        // cargan, cambio de idioma, resize) los tweens ya pasados no se
        // vuelven a pintar y el contador se quedaba en 0 con todo automatizado.
        const counter = q('[data-count]')[0]
        const marks: { tl: gsap.core.Timeline; at: number }[] = []
        const syncCount = () => {
          if (counter) counter.textContent = String(marks.filter((m) => m.tl.time() >= m.at).length)
        }

        if (desktop) {
          const tl = gsap.timeline({
            defaults: { ease: 'none' },
            // Sin invalidateOnRefresh: los valores de esta línea de tiempo son
            // fijos, y reiniciar sus ~60 tweens en cada refresh costaba más
            // que el propio refresh.
            scrollTrigger: {
              trigger: stageEl,
              start: 'top top',
              end: PIN_LENGTH,
              pin: true,
              scrub: 0.8,
              anticipatePin: 1,
            },
          })
          // La indicación de scroll se retira mientras corre el primer paso.
          const hint = q('[data-hint]')
          if (hint.length) tl.to(hint, { opacity: 0, duration: 0.3 }, 0.4)
          // Sin escala durante el pin: con la tapa vertical y el cuerpo sin
          // transformar, la pantalla se pinta 1:1 y el texto queda nítido.
          tasks.forEach((t, i) => marks.push({ tl, at: runStep(tl, q, t, 0.4 + i * STEP_GAP, `[data-row="${t.id}"]`) }))
          tl.to({}, { duration: 0.4 })
          tl.eventCallback('onUpdate', syncCount)
        } else {
          // Móvil: sin pin. El portátil queda pegado arriba y cada tarjeta
          // dispara su ruta al cruzar la mitad inferior de la pantalla.
          tasks.forEach((t) => {
            const card = q(`[data-mrow="${t.id}"]`)[0]
            if (!card) return
            const tl = gsap.timeline({
              defaults: { ease: 'none' },
              scrollTrigger: { trigger: card, start: 'top 82%', end: 'top 52%', scrub: 0.6 },
              onUpdate: syncCount,
            })
            marks.push({ tl, at: runStep(tl, q, t, 0, `[data-mrow="${t.id}"]`, `[data-row="${t.id}"]`) })
          })
        }

        // El refresh restaura el progreso sin disparar onUpdate: se sincroniza al terminar.
        ScrollTrigger.addEventListener('refresh', syncCount)
        return () => {
          ScrollTrigger.removeEventListener('refresh', syncCount)
          ScrollTrigger.removeEventListener('refreshInit', readW)
        }
      },
    )
  }

  return (
    <section ref={root} aria-labelledby="hero-title" className="relative">
      <Container size="wide" className="pt-[clamp(2.5rem,7vh,5.5rem)] pb-8 lg:pb-4">
        {/* Entrada en CSS (hero.css, [data-rise]): sólo transform, así el texto
            está visible desde la primera pintura y no espera a JavaScript. */}
        <h1
          id="hero-title"
          data-rise="0"
          className="max-w-[14.5em] text-[clamp(2.5rem,1.1rem+4.6vw,4.75rem)] leading-[1.03] tracking-[-0.04em]"
        >
          {pick(profile.headline)}
        </h1>

        <div className="mt-8 grid gap-8 lg:mt-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p data-rise="1" className="max-w-[36rem] text-[clamp(1rem,0.95rem+0.3vw,1.15rem)] leading-relaxed text-text-2">
              {pick(profile.sub)}
            </p>
            <div data-rise="2" className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-4">
              <ButtonLink to="/#contacto" size="lg">
                {pick(siteCopy.hero.ctaPrimary)}
                <IconArrowRight className="transition-transform duration-200 ease-[var(--ease-out)] group-hover:translate-x-0.5" />
              </ButtonLink>
              <TextLink href={cvHref(profile)} download>
                <IconDownload />
                {pick(siteCopy.hero.ctaCv)}
              </TextLink>
            </div>
          </div>

          <ul
            data-rise="3"
            className="flex flex-col gap-2.5 text-[14px] text-text-2 lg:col-span-4 lg:col-start-9 lg:border-l lg:border-line lg:pl-6"
          >
            {profile.available && (
              <li className="flex items-center gap-2.5 text-text">
                <span aria-hidden="true" className="size-1.5 rounded-full bg-accent" />
                {pick(profile.availability)}
              </li>
            )}
            <li className="flex items-center gap-2.5">
              <IconPin className="text-text-3" />
              {pick(profile.location)}
            </li>
            {now && (
              <li className="flex items-center gap-2.5">
                <span aria-hidden="true" className="w-4" />
                {pick(now)}
              </li>
            )}
            {pick(profile.workMode).split(' · ').filter((part) => part.trim()).map((part) => (
              <li key={part} className="flex items-center gap-2.5">
                <span aria-hidden="true" className="w-4 shrink-0" />
                {part}
              </li>
            ))}
          </ul>
        </div>
      </Container>

      {/* Escenario del portátil. En escritorio se fija mientras dura la secuencia. */}
      <div ref={stage} className="hero-stage relative">
        <div className="stage-lap sticky top-[60px] z-[2] bg-bg pt-4 pb-[calc(var(--lap-w)*0.3)] min-[900px]:static min-[900px]:flex min-[900px]:h-svh min-[900px]:flex-col min-[900px]:bg-transparent min-[900px]:pt-[84px] min-[900px]:pb-0">
          <Laptop ref={lap}>
            <AutomationApp done={reduced} />
          </Laptop>
        </div>

        <Container size="prose" className="pt-2 pb-16 min-[900px]:sr-only">
          {/* En el móvil la etiqueta de la pantalla queda a ~5 px: se repite aquí, legible. */}
          <p aria-hidden="true" className="mb-3">
            <span className="inline-flex h-6 items-center rounded-[5px] border border-line-strong px-2 text-[12px] font-medium text-text-2">
              {pick(automationCopy.demoLabel)}
            </span>
          </p>
          <TaskList done={reduced} />
        </Container>
      </div>
    </section>
  )
}

/** Offset de una estela oculta (pathLength=1, guiones "1 2"): ni el remate
 *  redondeado asoma en el origen. Igual que en hero.css. */
const TRAIL_HIDDEN = 1.01

/**
 * Un paso: el paquete recorre la ruta de la tarea (tramo a tramo, con su
 * estela), y al llegar la fila cambia a "Automatizado". Es reversible: al
 * subir con el scroll todo vuelve a "Manual". Devuelve el instante en que la
 * tarea queda automatizada (lo usa el contador).
 */
function runStep(
  tl: gsap.core.Timeline,
  q: (s: string) => Element[],
  t: (typeof tasks)[number],
  t0: number,
  ...rowSelectors: string[]
) {
  const rows = rowSelectors.flatMap((s) => q(s))
  const packet = q(`[data-packet="${t.id}"]`)[0]
  const legs = t.route.slice(0, -1).map((from, j) => ({ from, to: t.route[j + 1] }))
  const seg = 0.72 / legs.length
  const nodeEls = t.route.map((id) => q(`[data-node="${id}"]`)[0])
  const trails = legs.map((l) => q(`[data-trail="${l.from}-${l.to}"]`)[0])

  // Al menos un instante después de 0: un set() en el mismo arranque de la
  // línea de tiempo se aplicaría al montarla, con la tarjeta aún sin tocar.
  const on = Math.max(t0, 0.01)
  tl.set(rows, { attr: { 'data-state': 'running' }, immediateRender: false }, on)
  tl.to(nodeEls[0], { borderColor: LAPTOP.accent, duration: 0.05 }, t0)
  tl.set(packet, { opacity: 1 }, t0)

  legs.forEach((_, j) => {
    const at = t0 + j * seg
    // Las estelas tienen pathLength=1: se dibujan con el offset del trazo, sin
    // medir nada. El paquete comparte el SVG con su ruta, así que las
    // coordenadas del trazado valen tal cual (sin align, sin matrices).
    // immediateRender: false en los fromTo: el estado "desde" ya lo pinta el
    // CSS, y así cada tween se inicializa cuando el scroll llega a él, no al
    // montar (eran decenas de lecturas de estilo en la carga).
    tl.fromTo(trails[j], { strokeDashoffset: TRAIL_HIDDEN }, { strokeDashoffset: 0, duration: seg, immediateRender: false }, at)
    tl.to(
      packet,
      {
        motionPath: { path: trails[j] as SVGPathElement },
        duration: seg,
        immediateRender: false,
      },
      at,
    )
    tl.to(nodeEls[j + 1], { borderColor: LAPTOP.accent, duration: 0.05 }, at + seg - 0.04)
  })

  const te = t0 + 0.74
  const q2 = (sel: string) => rows.flatMap((r) => Array.from(r.querySelectorAll(sel)))
  tl.set(packet, { opacity: 0 }, te)
  tl.set(rows, { attr: { 'data-state': 'done' }, immediateRender: false }, te)
  tl.to(q2('[data-st-manual]'), { opacity: 0, y: -5, duration: 0.1 }, te)
  tl.fromTo(q2('[data-st-auto]'), { opacity: 0, y: 5 }, { opacity: 1, y: 0, duration: 0.1, immediateRender: false }, te)
  // La estela queda al 45 % (= --accent-line), por opacidad: el color lo sigue poniendo el CSS.
  tl.to(trails, { strokeOpacity: 0.45, duration: 0.2 }, te + 0.08)
  tl.to(nodeEls, { borderColor: LAPTOP.nodeLine, duration: 0.2 }, te + 0.08)
  return te
}
