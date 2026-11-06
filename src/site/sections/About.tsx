import { useRef, useState } from 'react'
import { useLang } from '@/i18n'
import { useContent } from '@/content/store'
import { cn } from '@/lib/utils'
import { gsap, SplitText, useGSAP, EASE_OUT, reveal, revealOnFocus, alreadyPast, whenIdle } from '../motion'
import { Container, SectionHeader } from '../ui'
import { aboutCopy as c, PORTRAIT_SRC, plain } from '../about/copy'
import { useTheme } from '../theme'

/**
 * Sobre mí. Historia en una columna de lectura (~65ch), su principio como
 * una frase grande y los otros dos principios debajo, junto a un bloque
 * compacto de "en qué ando ahora" donde el acento marca lo que está en curso.
 *
 * Movimiento propio de la sección: la frase se lee con el scroll (cada
 * palabra pasa de gris a tinta plena, en los dos sentidos). La historia
 * entra más despacio que el resto del sitio y los puntos de estado se
 * encienden en orden. Con movimiento reducido todo está ya encendido.
 */
export function About() {
  const { pick, lang } = useLang()
  const { about, profile } = useContent()
  const motto = pick(about.motto)
  const theme = useTheme()
  const root = useRef<HTMLElement>(null)
  /** Con retrato, título y foto a la izquierda y la historia al lado. Sin él
   *  (hoy no hay), la columna izquierda quedaría vacía junto a la historia:
   *  el título va encima y la historia debajo, como en el resto de secciones. */
  const portraitSrc = profile.portraitUrl.trim() || PORTRAIT_SRC
  // Por dirección: si se sube otro retrato desde el panel, se vuelve a probar.
  const [portraitState, setPortraitState] = useState<Record<string, 'ok' | 'none'>>({})
  const portrait = portraitState[portraitSrc] ?? 'loading'
  const withPortrait = portrait === 'ok'

  /* Entradas que no dependen del idioma: se montan una vez, con el hilo
     principal libre (la sección queda muy por debajo de la portada). */
  useGSAP(
    (_, contextSafe) =>
      whenIdle(
        contextSafe!(() => {
          const mm = gsap.matchMedia()
          mm.add('(prefers-reduced-motion: no-preference)', () => {
            const q = gsap.utils.selector(root)
            reveal(q('[data-apara]'), {
              trigger: q('[data-astory]')[0],
              from: { y: 16, duration: 0.9 },
              stagger: 0.1,
              start: 'top 78%',
            })
            const now = q('[data-now]')[0]
            if (alreadyPast(now, 'top 85%')) return
            const dots = gsap.from(q('[data-now-dot]'), {
              scale: 0.4,
              opacity: 0,
              duration: 0.35,
              ease: EASE_OUT,
              stagger: 0.12,
              delay: 0.15,
              clearProps: 'opacity,transform',
              scrollTrigger: { trigger: now, start: 'top 85%', once: true },
            })
            revealOnFocus(dots, now)
          })
        }),
      ),
    { scope: root },
  )

  /* La frase se parte en palabras de nuevo con cada idioma o texto nuevo (el h3
     lleva esa key), y se rehace con cada tema: los dos grises que interpola son
     los del tema. */
  useGSAP(
    (_, contextSafe) =>
      whenIdle(
        contextSafe!(() => {
          const mm = gsap.matchMedia()
          mm.add('(prefers-reduced-motion: no-preference)', () => {
            const motto = root.current?.querySelector<HTMLElement>('[data-motto]')
            if (!motto) return
            const css = getComputedStyle(document.documentElement)
            const dim = css.getPropertyValue('--text-3').trim() || '#83838a'
            const lit = css.getPropertyValue('--text').trim() || '#f1f0ed'
            const split = SplitText.create(motto, { type: 'words' })
            gsap.fromTo(
              split.words,
              { color: dim },
              {
                color: lit,
                ease: 'none',
                duration: 0.2,
                stagger: 0.1,
                scrollTrigger: { trigger: motto, start: 'top 82%', end: 'bottom 42%', scrub: 0.5 },
              },
            )
          })
        }),
      ),
    { scope: root, dependencies: [lang, motto, theme], revertOnUpdate: true },
  )

  const paragraphs = about.paragraphs[lang]

  return (
    <section ref={root} id="sobre-mi" aria-labelledby="sobre-mi-title" className="border-t border-line py-24 md:py-32">
      <Container size="base">
        {/* ── Historia ── */}
        <div data-astory className={cn('grid gap-8', withPortrait ? 'lg:grid-cols-12 lg:gap-x-8' : 'md:gap-10')}>
          <div className={cn(withPortrait && 'lg:col-span-4')}>
            <SectionHeader id="sobre-mi-title" title={pick(c.title)} className="mb-0! md:mb-0!" />
            <Portrait
              src={portraitSrc}
              alt={`${pick(c.portraitAlt)} ${profile.name}`}
              state={portrait}
              onState={(s) => setPortraitState((m) => ({ ...m, [portraitSrc]: s }))}
            />
          </div>
          <div className={cn(withPortrait && 'lg:col-span-7 lg:col-start-6')}>
            {paragraphs.map((p, i) => (
              <p
                key={i}
                data-apara
                className={
                  i === 0
                    ? 'max-w-[58ch] text-[clamp(1.125rem,1.02rem+0.4vw,1.3rem)] leading-[1.6] text-text'
                    : 'mt-5 max-w-[65ch] text-[17px] leading-[1.7] text-text-2'
                }
              >
                {plain(p)}
              </p>
            ))}
          </div>
        </div>

        {/* ── Su principio, como frase ── */}
        <div className="mt-24 md:mt-36">
          <h3
            key={`${lang}:${motto}`}
            data-motto
            className="max-w-[13em] text-[clamp(2.5rem,1.1rem+4.4vw,4.5rem)] leading-[1.02] tracking-[-0.04em]"
          >
            {motto}
          </h3>
          <p className="mt-6 max-w-[38rem] text-[clamp(1.05rem,0.98rem+0.3vw,1.2rem)] leading-relaxed text-text-2">
            {pick(about.mottoBody)}
          </p>
        </div>

        {/* ── Los otros principios y lo que está en curso ── */}
        <div className="mt-16 grid gap-14 md:mt-24 lg:grid-cols-12 lg:gap-8">
          <ul aria-label={pick(c.principlesLabel)} className="grid content-start gap-10 sm:grid-cols-2 sm:gap-8 lg:col-span-7">
            {about.principles.map((p, i) => (
              <li key={i} className="border-t border-line pt-5">
                <h3 className="text-[18px] leading-snug tracking-[-0.02em]">{pick(p.title)}</h3>
                <p className="mt-2 text-[16px] leading-relaxed text-text-2">{pick(p.body)}</p>
              </li>
            ))}
          </ul>

          <div
            data-now
            className="self-start rounded-[var(--radius-md)] border border-line bg-bg-raised lg:col-span-4 lg:col-start-9"
          >
            <h3 className="border-b border-line px-5 py-4 text-[15px] leading-snug tracking-[-0.01em]">
              {pick(about.now.title)}
            </h3>
            <ul>
              {about.now.items[lang].map((item) => (
                <li
                  key={item}
                  className="flex gap-3 border-b border-line px-5 py-4 text-[15px] leading-[1.55] text-text-2 last:border-b-0"
                >
                  <span data-now-dot aria-hidden="true" className="mt-[0.58em] size-1.5 shrink-0 rounded-full bg-accent" />
                  <span>{plain(item)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  )
}

/**
 * Retrato opcional (el que se sube en /admin, o /portrait.jpg). Sólo aparece
 * si carga de verdad; si falla (no existe, o el servidor devuelve otra cosa)
 * no se pinta nada en su lugar.
 */
function Portrait({
  src,
  alt,
  state,
  onState: setState,
}: {
  src: string
  alt: string
  state: 'loading' | 'ok' | 'none'
  onState: (s: 'ok' | 'none') => void
}) {
  if (state === 'none') return null
  return (
    <img
      key={src}
      src={src}
      alt={alt}
      width={544}
      height={680}
      decoding="async"
      onLoad={() => setState('ok')}
      onError={() => setState('none')}
      className={cn(
        'mt-8 aspect-[4/5] w-full max-w-[15rem] rounded-[var(--radius-md)] object-cover lg:mt-10 lg:max-w-[17rem]',
        'outline outline-1 -outline-offset-1 outline-[var(--img-outline)]',
        state !== 'ok' && 'hidden',
      )}
    />
  )
}
