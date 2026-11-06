import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useLang } from '@/i18n'
import { gsap, useGSAP, EASE_OUT, EASE_IN_OUT } from './motion'
import { ButtonLink, Container } from './ui'
import { IconArrowLeft, IconArrowRight } from './icons'
import './sections/contact.css'

const SITE = 'Elkin Moreno'

const c = {
  docTitle: { es: 'Página no encontrada', en: 'Page not found' },
  title: { es: 'Esta página no existe.', en: 'This page doesn’t exist.' },
  body: {
    es: 'Puede que el enlace esté mal escrito o que la página haya cambiado de dirección.',
    en: 'The link may be mistyped, or the page may have moved.',
  },
  home: { es: 'Volver al inicio', en: 'Back to home' },
  work: { es: 'Ver proyectos', en: 'See projects' },
  request: { es: 'Petición', en: 'Request' },
  noRoute: { es: 'sin ruta · 404', en: 'no route · 404' },
} as const

function readablePath(pathname: string) {
  try {
    return decodeURIComponent(pathname)
  } catch {
    return pathname
  }
}

/**
 * 404. Breve: qué ha pasado, y dos salidas. Encima, el lenguaje de nodos de
 * la portada en pequeño: la petición llega al router y la ruta termina en
 * un puerto sin conectar. El paquete hace el recorrido una sola vez.
 */
export default function NotFoundPage() {
  const { pick } = useLang()
  const { pathname } = useLocation()
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const prev = document.title
    document.title = `${pick(c.docTitle)} · ${SITE}`
    // Una URL inexistente no debe acabar indexada.
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex'
    document.head.appendChild(meta)
    return () => {
      document.title = prev
      meta.remove()
    }
  }, [pick])

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const q = gsap.utils.selector(root)
        const css = getComputedStyle(document.documentElement)
        const accent = css.getPropertyValue('--accent').trim() || '#ff6b2c'
        const line = css.getPropertyValue('--line-strong').trim() || '#2e2e33'
        const edge = q('[data-nf-edge]')[0] as HTMLElement
        const router = q('[data-nf-router]')[0]

        const tl = gsap.timeline({ delay: 0.1 })
        tl.from(q('[data-nf-node]'), { opacity: 0, x: -8, duration: 0.45, ease: EASE_OUT, stagger: 0.08 }, 0)
          .from(q('[data-nf-fade]'), { opacity: 0, y: 14, duration: 0.7, ease: EASE_OUT, stagger: 0.07 }, 0.1)
          // La petición viaja hasta el router...
          .fromTo(q('[data-nf-trail]'), { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: EASE_IN_OUT }, 0.35)
          .set(q('[data-nf-packet="a"]'), { opacity: 1 }, 0.35)
          .fromTo(q('[data-nf-packet="a"]'), { x: 0 }, { x: () => edge.offsetWidth, duration: 0.6, ease: EASE_IN_OUT }, 0.35)
          .set(q('[data-nf-packet="a"]'), { opacity: 0 }, 0.95)
          .to(router, { borderColor: accent, duration: 0.12, ease: EASE_OUT }, 0.92)
          // ...sale por el otro lado y se queda en el hueco.
          .set(q('[data-nf-packet="b"]'), { opacity: 1 }, 1.02)
          .fromTo(q('[data-nf-packet="b"]'), { x: 0 }, { x: 20, duration: 0.4, ease: EASE_OUT }, 1.02)
          .to(q('[data-nf-packet="b"]'), { opacity: 0, duration: 0.25, ease: EASE_OUT }, 1.3)
          // Al terminar, el borde vuelve al CSS: si luego cambia el tema, lo sigue.
          .to(router, { borderColor: line, duration: 0.5, ease: EASE_OUT, clearProps: 'borderColor' }, 1.25)
          .from(q('[data-nf-port]'), { scale: 0.6, opacity: 0, duration: 0.3, ease: EASE_OUT }, 1.3)
      })
    },
    { scope: root },
  )

  return (
    <div ref={root} className="flex min-h-[72svh] items-center py-20 md:py-28">
      <Container size="base">
        <div className="max-w-[40rem]">
          <div className="nf-flow" aria-hidden="true">
            <div data-nf-node className="nf-node">
              <span className="nf-node-label">{pick(c.request)}</span>
              <span className="nf-node-sub">GET {readablePath(pathname)}</span>
            </div>
            <div data-nf-edge className="nf-edge">
              <span data-nf-trail className="nf-trail" />
              <span data-nf-packet="a" className="nf-packet" />
            </div>
            <div data-nf-node data-nf-router className="nf-node">
              <span className="nf-node-label">Router</span>
              <span className="nf-node-sub">{pick(c.noRoute)}</span>
            </div>
            <div className="nf-broken">
              <span className="nf-stub" />
              <span className="nf-gap-stub" />
              <span data-nf-port className="nf-port" />
              <span data-nf-packet="b" className="nf-packet" />
            </div>
          </div>

          <h1
            data-nf-fade
            className="mt-12 text-[clamp(2.25rem,1.3rem+3.2vw,3.75rem)] leading-[1.04] tracking-[-0.04em] md:mt-14"
          >
            {pick(c.title)}
          </h1>
          <p data-nf-fade className="mt-5 max-w-[34rem] text-[17px] leading-relaxed text-text-2">
            {pick(c.body)}
          </p>
          <div data-nf-fade className="mt-9 flex flex-wrap items-center gap-3">
            <ButtonLink to="/" size="lg">
              <IconArrowLeft className="transition-transform duration-200 ease-[var(--ease-out)] group-hover:-translate-x-0.5" />
              {pick(c.home)}
            </ButtonLink>
            <ButtonLink to="/#proyectos" variant="secondary" size="lg">
              {pick(c.work)}
              <IconArrowRight className="transition-transform duration-200 ease-[var(--ease-out)] group-hover:translate-x-0.5" />
            </ButtonLink>
          </div>
        </div>
      </Container>
    </div>
  )
}
