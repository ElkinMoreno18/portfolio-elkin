import { useMemo, useRef, useState, type PointerEvent } from 'react'
import { useLang } from '@/i18n'
import { cn } from '@/lib/utils'
import { gsap, ScrollTrigger, useGSAP, EASE_OUT, alreadyPast, whenIdle } from '../motion'
import { Container, SectionHeader, Tag } from '../ui'
import { stackCopy as c, itemLabel } from '../stack/copy'
import { useContent } from '@/content/store'
import { jobsOf } from '@/content/derive'
import { buildRows, companiesOf } from '../stack/matrix'
import './stack.css'

/** Qué está señalando el ratón: una tecnología de un área, o una empresa. */
type Highlight = { row: string; item: string } | { company: string } | null

const isMouse = (e: PointerEvent) => e.pointerType === 'mouse'

/**
 * Stack: una tabla de capacidades, no tarjetas. Por área: para qué la uso,
 * sus tecnologías y en qué empresas de la experiencia aparecen. El punto de
 * acento marca lo que está en uso en el puesto actual.
 *
 * Cruce (sólo ratón, es un extra: la información ya está escrita en cada
 * fila): al señalar una tecnología se iluminan las empresas donde se usó;
 * al señalar una empresa, todo lo que se usó allí en toda la tabla.
 *
 * Entrada: las filas llegan por tandas; dentro de cada una las etiquetas
 * se colocan en cascada y la columna "usado en" se resuelve al final.
 */
export function Stack() {
  const { pick, lang } = useLang()
  const content = useContent()
  const jobs = useMemo(() => jobsOf(content), [content])
  const rows = useMemo(() => buildRows(jobs, content.stack), [jobs, content.stack])
  const currentCompany = companiesOf(jobs).find((co) => co.current) ?? null
  const [hl, setHl] = useState<Highlight>(null)
  const root = useRef<HTMLElement>(null)

  // Queda por debajo de la portada: se monta con el hilo principal libre.
  useGSAP((_, contextSafe) => whenIdle(contextSafe!(build)), { scope: root })

  function build() {
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      // Las filas que ya están a la vista (llegada con /#stack) no se ocultan.
      const rowEls = gsap.utils.toArray<HTMLElement>('[data-srow]', root.current).filter((r) => !alreadyPast(r, 'top 90%'))
      if (!rowEls.length) return
      const tagsOf = (row: Element) => row.querySelectorAll('[data-stag]')
      const usedOf = (row: Element) => row.querySelectorAll('[data-sused]')

      // Sólo se animan listas con elementos: una selección vacía no es un error,
      // pero GSAP la avisa en consola.
      rowEls.forEach((row) => {
        gsap.set(row, { opacity: 0, y: 10 })
        if (tagsOf(row).length) gsap.set(tagsOf(row), { opacity: 0, x: -6 })
        if (usedOf(row).length) gsap.set(usedOf(row), { opacity: 0, filter: 'blur(4px)' })
      })

      ScrollTrigger.batch(rowEls, {
        start: 'top 90%',
        end: 'max',
        once: true,
        interval: 0.08,
        onEnter: (batch) => {
          const tl = gsap.timeline()
          batch.forEach((row, i) => {
            const at = i * 0.06
            tl.to(row, { opacity: 1, y: 0, duration: 0.5, ease: EASE_OUT, clearProps: 'opacity,transform' }, at)
            if (tagsOf(row).length)
              tl.to(
                tagsOf(row),
                { opacity: 1, x: 0, duration: 0.35, ease: EASE_OUT, stagger: 0.018, clearProps: 'opacity,transform' },
                at + 0.08,
              )
            if (usedOf(row).length)
              tl.to(
                usedOf(row),
                { opacity: 1, filter: 'blur(0px)', duration: 0.4, ease: EASE_OUT, stagger: 0.04, clearProps: 'opacity,filter' },
                at + 0.22,
              )
          })
        },
      })
    })
  }

  const clear = () => setHl(null)
  const companyHl = hl && 'company' in hl ? hl.company : null
  const itemHl = hl && 'item' in hl ? hl : null

  return (
    <section ref={root} id="stack" aria-labelledby="stack-title" className="border-t border-line py-24 md:py-32">
      <Container size="wide">
        <SectionHeader
          id="stack-title"
          title={pick(c.title)}
          lead={pick(c.lead)}
          aside={
            currentCompany && (
              <p className="flex shrink-0 items-center gap-2.5 text-[14px] whitespace-nowrap text-text-2 md:pb-1">
                <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-accent" />
                {pick(c.inUseAt)} {currentCompany.short}
              </p>
            )
          }
        />

        <div aria-hidden="true" className="stack-grid hidden pb-3 text-[13px] text-text-3 lg:grid">
          <span>{pick(c.colArea)}</span>
          <span>{pick(c.colTech)}</span>
          <span>{pick(c.colUsed)}</span>
        </div>

        <ul aria-label={pick(c.listLabel)} className="border-t border-line" data-hl={companyHl ? '' : undefined}>
          {rows.map((row) => {
            const rowItemHl = itemHl?.row === row.key ? itemHl : null
            const hovered = rowItemHl ? row.items.find((it) => it.name === rowItemHl.item) : undefined
            return (
              <li
                key={row.key}
                data-srow
                data-hl={rowItemHl ? '' : undefined}
                className="stack-grid border-b border-line py-5 md:grid lg:py-6"
              >
                <div className="stack-area">
                  <h3 className="text-[16px] leading-snug font-semibold tracking-[-0.01em]">{pick(row.title)}</h3>
                  <p className="mt-1.5 max-w-[36ch] text-[14px] leading-normal text-text-2">{pick(row.note)}</p>
                </div>

                <ul
                  aria-label={`${pick(c.colTech)}, ${pick(row.title)}`}
                  className="mt-4 flex flex-wrap content-start gap-1.5 md:mt-0"
                  onPointerLeave={clear}
                >
                  {row.items.map((it) => {
                    const on = companyHl ? it.at.includes(companyHl) : rowItemHl?.item === it.name
                    return (
                      <li
                        key={it.name}
                        data-stag
                        data-on={on ? '' : undefined}
                        className="stack-item"
                        onPointerEnter={(e) => {
                          if (isMouse(e) && it.at.length > 0) setHl({ row: row.key, item: it.name })
                        }}
                      >
                        <Tag className={cn('stack-tag', it.inUse && 'gap-1.5')}>
                          {it.inUse && <span aria-hidden="true" className="stack-dot size-1.5 rounded-full bg-accent" />}
                          {itemLabel(it.name, lang)}
                          {it.inUse && <span className="sr-only">, {pick(c.inUseSr)}</span>}
                        </Tag>
                      </li>
                    )
                  })}
                </ul>

                {row.used.length === 0 ? (
                  // En la tabla de escritorio la columna existe y quedaba en blanco;
                  // apilado (móvil, tableta) simplemente no hay línea "usado en".
                  <p data-sused className="stack-used hidden text-[13px] leading-6 text-text-3 lg:block">
                    {pick(c.noRole)}
                  </p>
                ) : (
                  <div className="stack-used mt-4 text-[14px] leading-6 md:mt-3 lg:mt-0">
                    <span className="mr-2 text-[13px] text-text-3 lg:sr-only">{pick(c.colUsed)}</span>
                    <ul className="inline lg:flex lg:flex-col lg:gap-0.5" onPointerLeave={clear}>
                      {row.used.map((co, i) => {
                        const on = companyHl ? co.name === companyHl : Boolean(hovered?.at.includes(co.name))
                        return (
                          <li
                            key={co.name}
                            data-sused
                            data-on={on ? '' : undefined}
                            className={cn(
                              'stack-co mr-1.5 inline-block whitespace-nowrap lg:mr-0 lg:flex lg:items-center lg:gap-2',
                              co.current ? 'text-text' : 'text-text-2',
                            )}
                            onPointerEnter={(e) => {
                              if (isMouse(e)) setHl({ company: co.name })
                            }}
                          >
                            {co.current && (
                              <span
                                aria-hidden="true"
                                className="stack-dot mr-2 inline-block size-1.5 shrink-0 rounded-full bg-accent align-middle lg:mr-0"
                              />
                            )}
                            {co.short}
                            {co.current && <span className="sr-only"> ({pick(c.currentSr)})</span>}
                            {i < row.used.length - 1 && <span className="lg:hidden">,</span>}
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      </Container>
    </section>
  )
}
