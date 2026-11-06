import { useRef } from 'react'
import { useLang } from '@/i18n'
import { useContent } from '@/content/store'
import { cvHref } from '@/content/derive'
import { gsap, useGSAP, EASE_OUT, alreadyPast, revealOnFocus, whenIdle } from '../motion'
import { TextLink } from '../ui'
import { IconDownload } from '../icons'
import { expCopy as c } from './copy'
import { localMonths, plain, splitPeriod } from './format'

function range(period: string) {
  const { start, end } = splitPeriod(period)
  return end ? `${start} – ${end}` : start
}

/**
 * Formación e idiomas, en un bloque compacto de dos columnas, y el CV.
 * Los idiomas se dicen tal cual (nativo, básico): sin barras que finjan
 * una precisión que no existe.
 *
 * Movimiento propio: las líneas de cada fila se trazan de izquierda a
 * derecha y el texto aparece detrás. Nada se mueve con movimiento reducido.
 */
export function Background() {
  const { lang, pick } = useLang()
  const { education, languages, profile } = useContent()
  const root = useRef<HTMLDivElement>(null)

  useGSAP(
    (_, contextSafe) => whenIdle(contextSafe!(build)),
    { scope: root },
  )

  function build() {
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const q = gsap.utils.selector(root)
      // Lecturas antes que escrituras: un solo layout para las dos columnas.
      const cols = q('[data-bg-col]').filter((col) => !alreadyPast(col, 'top 84%'))
      cols.forEach((col) => {
        const tl = gsap.timeline({ scrollTrigger: { trigger: col, start: 'top 84%', once: true } })
        // El enlace al CV vive aquí: con el foco, la columna aparece ya.
        revealOnFocus(tl, col)
        tl.from(col.querySelectorAll('[data-rule]'), {
          scaleX: 0,
          transformOrigin: '0% 50%',
          duration: 0.9,
          ease: EASE_OUT,
          stagger: 0.07,
          clearProps: 'transform',
        }).from(
          col.querySelectorAll('[data-bg-text]'),
          { opacity: 0, duration: 0.5, ease: EASE_OUT, stagger: 0.07, clearProps: 'opacity' },
          0.12,
        )
      })
    })
  }

  return (
    <div ref={root} className="mt-20 grid gap-14 md:mt-28 md:grid-cols-12 md:gap-8">
      <div data-bg-col className="md:col-span-7">
        <h3 data-bg-text className="text-[18px] tracking-[-0.02em]">
          {pick(c.education)}
        </h3>
        <ul className="mt-5">
          {education.map((e, i) => (
            <li key={i} className="exp-row grid gap-x-6 gap-y-1 py-4 sm:grid-cols-[8.5rem_minmax(0,1fr)]">
              <span className="exp-rule" data-rule aria-hidden="true" />
              <p data-bg-text className="pt-0.5 font-mono text-[12px] leading-5 text-text-3 tnum">
                {range(localMonths(e.period, lang))}
              </p>
              <div data-bg-text>
                <p className="text-[16px] font-medium leading-snug text-text">{pick(e.title)}</p>
                <p className="mt-1 text-[14px] leading-normal text-text-2">
                  {plain(e.org)}
                  <span className="text-text-3"> · {pick(e.place)}</span>
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div data-bg-col className="md:col-span-4 md:col-start-9">
        <h3 data-bg-text className="text-[18px] tracking-[-0.02em]">
          {pick(c.languages)}
        </h3>
        <ul className="mt-5">
          {languages.map((l, i) => (
            <li key={i} className="exp-row flex items-baseline justify-between gap-6 py-4">
              <span className="exp-rule" data-rule aria-hidden="true" />
              <span data-bg-text className="text-[16px] font-medium text-text">
                {pick(l.name)}
              </span>
              <span data-bg-text className="text-[14px] text-text-2">
                {pick(l.level)}
              </span>
            </li>
          ))}
        </ul>

        <div data-bg-text className="mt-8 flex items-center gap-2">
          <TextLink href={cvHref(profile)} download type="application/pdf">
            <IconDownload />
            {pick(c.cv)}
          </TextLink>
          <span aria-hidden="true" className="font-mono text-[12px] text-text-3">
            {pick(c.cvMeta)}
          </span>
        </div>
      </div>
    </div>
  )
}
