import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { Flip } from 'gsap/Flip'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'
import { CustomEase } from 'gsap/CustomEase'
import { useGSAP } from '@gsap/react'
import { useEffect, useState } from 'react'

/**
 * Único punto de registro de GSAP para todo el sitio.
 * Curvas de Emil Kowalski: ease-out fuerte para entradas, ease-in-out para
 * movimiento en pantalla, nunca ease-in. Todo lo demás importa desde aquí.
 */
gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText, Flip, MotionPathPlugin, CustomEase)

// Una lista vacía (un grupo sin elementos, una fila sin "usado en") no es un
// error: sin esto GSAP llena la consola de "target not found".
gsap.config({ nullTargetWarn: false })

CustomEase.create('out', '0.23, 1, 0.32, 1')
CustomEase.create('inOut', '0.77, 0, 0.175, 1')

export const EASE_OUT = 'out'
export const EASE_IN_OUT = 'inOut'

/** Duraciones de referencia. La UI se queda por debajo de 300 ms. */
export const DUR = { ui: 0.2, enter: 0.7, move: 0.6 } as const

export function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** Versión reactiva: re-renderiza si el usuario cambia la preferencia. */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(prefersReducedMotion)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const on = () => setReduced(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return reduced
}

/* ─────────────────────────── Refresco de ScrollTrigger ───────────────────────────
   Cada refresh recalcula todos los disparadores de la página (y fuerza layout).
   Fuentes, imágenes, datos y cambios de tamaño llegan casi a la vez: se piden
   aquí y se atienden con un solo refresh. Si entretanto ocurre uno por otra
   vía (el "load" de la ventana, un resize), la petición ya queda cubierta. */
let refreshTimer: number | undefined
export function scheduleRefresh(delay = 150) {
  window.clearTimeout(refreshTimer)
  refreshTimer = window.setTimeout(() => {
    refreshTimer = undefined
    ScrollTrigger.refresh()
  }, delay)
}
if (typeof window !== 'undefined') {
  ScrollTrigger.addEventListener('refreshInit', () => {
    window.clearTimeout(refreshTimer)
    refreshTimer = undefined
  })
}

/**
 * Después de la primera pintura: dos fotogramas y una tarea nueva. Para el
 * trabajo que la portada necesita pronto (su secuencia) pero que no debe
 * retrasar el primer fotograma. Devuelve la función que lo cancela.
 */
export function afterPaint(fn: () => void) {
  let r2 = 0
  let timer: number | undefined
  const r1 = requestAnimationFrame(() => {
    r2 = requestAnimationFrame(() => {
      timer = window.setTimeout(fn, 0)
    })
  })
  return () => {
    cancelAnimationFrame(r1)
    cancelAnimationFrame(r2)
    window.clearTimeout(timer)
  }
}

/* ─────────────────────────── Cola de trabajo en reposo ───────────────────────────
   Las secciones de debajo de la portada montan sus apariciones cuando el hilo
   principal queda libre. Una sola cola para todas: cada tarea (una sección, un
   esquema) corre en su propio periodo de reposo, así ninguna se suma a otra en
   una tarea larga. La cola arranca tras la primera pintura, y por tanto
   después de la secuencia de la portada (afterPaint se pide antes), de modo
   que los disparadores se crean en el orden de la página. */
type IdleJob = { fn: () => void; timeout: number }
const idleQueue: IdleJob[] = []
let idleBusy = false
let painted = false

function idle(cb: () => void, timeout: number) {
  if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(cb, { timeout })
  else window.setTimeout(cb, 60)
}

function pumpIdle() {
  const job = idleQueue[0]
  if (!job) {
    idleBusy = false
    return
  }
  idle(() => {
    const next = idleQueue.shift()
    next?.fn()
    pumpIdle()
  }, job.timeout)
}

/**
 * Trabajo que no hace falta para la primera pintura (las apariciones de las
 * secciones de debajo de la portada): se hace cuando el hilo principal queda
 * libre, una tarea por periodo de reposo. Devuelve la función que lo cancela.
 */
export function whenIdle(fn: () => void, timeout = 1000) {
  const job: IdleJob = { fn, timeout }
  idleQueue.push(job)
  if (!idleBusy) {
    idleBusy = true
    if (painted) pumpIdle()
    else
      afterPaint(() => {
        painted = true
        pumpIdle()
      })
  }
  return () => {
    const i = idleQueue.indexOf(job)
    if (i >= 0) idleQueue.splice(i, 1)
  }
}

/**
 * ¿El disparador ya ha cruzado su línea de inicio ("top 82%")? Entonces el
 * contenido ya está a la vista (llegada con /#ancla, recarga a media página):
 * se deja como está en vez de ocultarlo para volver a mostrarlo.
 */
export function alreadyPast(trigger: Element | null | undefined, start = 'top 82%') {
  if (!trigger) return false
  const m = /(\d+(?:\.\d+)?)%/.exec(start.split(/\s+/)[1] ?? '')
  const line = m ? (parseFloat(m[1]) / 100) * window.innerHeight : window.innerHeight
  return trigger.getBoundingClientRect().top < line
}

/**
 * Si el foco del teclado entra en contenido que aún espera su aparición
 * (el navegador lo desplaza sólo hasta el borde inferior, antes de la línea
 * de disparo), la aparición se completa al instante: nunca hay foco sobre
 * algo invisible.
 */
export function revealOnFocus(anim: gsap.core.Animation | null | undefined, ...els: (Element | null | undefined)[]) {
  if (!anim) return
  const st = anim.scrollTrigger
  const finish = () => {
    // Ya disparada (o revertida con la sección): no hay nada que adelantar.
    if (!st || !ScrollTrigger.getAll().includes(st)) return
    st.kill()
    anim.progress(1)
  }
  new Set(els).forEach((el) => el?.addEventListener('focusin', finish, { once: true }))
}

/**
 * Aparición al entrar en pantalla, compartida por las secciones.
 * El estado por defecto (sin JS, o con movimiento reducido) es VISIBLE:
 * sólo animamos desde un estado oculto cuando sabemos que vamos a animar.
 * Cada sección pasa sus propios `from` para que no todas entren igual.
 */
export function reveal(
  targets: gsap.TweenTarget,
  // past: la posición ya leída por quien llama (lecturas antes de escrituras).
  opts: { trigger?: Element | null; from?: gsap.TweenVars; stagger?: number; start?: string; past?: boolean } = {},
) {
  if (prefersReducedMotion()) return null
  const trigger = (opts.trigger ?? (targets as Element)) as Element
  const start = opts.start ?? 'top 82%'
  if (opts.past ?? alreadyPast(trigger, start)) return null
  const tween = gsap.from(targets, {
    opacity: 0,
    y: 14,
    duration: DUR.enter,
    ease: EASE_OUT,
    stagger: opts.stagger ?? 0.06,
    ...opts.from,
    scrollTrigger: { trigger, start, once: true },
  })
  revealOnFocus(tween, trigger, ...gsap.utils.toArray<Element>(targets))
  return tween
}

export { gsap, ScrollTrigger, SplitText, Flip, useGSAP }
