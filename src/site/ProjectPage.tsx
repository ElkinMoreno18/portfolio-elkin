import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { Link, useNavigationType, useParams } from 'react-router-dom'
import { useLang } from '@/i18n'
import { cn } from '@/lib/utils'
import type { Project } from '@/lib/types'
import { gsap, useGSAP, EASE_OUT, reveal, prefersReducedMotion } from './motion'
import { useContent } from '@/content/store'
import { cvHref } from '@/content/derive'
import { siteCopy } from './copy'
import { ButtonLink, Container, Tag, TextLink } from './ui'
import { IconArrowLeft, IconArrowRight, IconArrowUpRight, IconDownload, IconGitHub } from './icons'
import { projectsCopy as c } from './projects/copy'
import { categoryLabel, paragraphs, projectPath, useProjectList, yearLabel } from './projects/data'
import { clearMorph, peekMorph, VT_NAME } from './projects/morph'
import { schemaFor, stackLayers } from './projects/schemas'
import { Schematic, schemaSummary } from './projects/Schematic'
import { BrowserFrame } from './projects/BrowserFrame'
import { StackPanel } from './projects/StackLayers'
import { SpecList } from './projects/parts'
import { techLabel } from './experience/format'
import { focusHeading } from './focus'
import './sections/projects.css'

const SITE = 'Elkin Moreno'

/** Detalle de un proyecto: /proyecto/:slug y /project/:slug. */
export default function ProjectPage() {
  const { slug } = useParams<{ slug: string }>()
  const { pick, lang, field } = useLang()
  const { projects, loading } = useProjectList()
  const root = useRef<HTMLElement>(null)
  // ¿Llegamos con la transición desde el índice? Entonces la cabecera ya viene animada.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const morphed = useMemo(() => peekMorph(), [slug])
  useEffect(() => clearMorph(), [slug])

  const index = projects.findIndex((p) => p.slug === slug)
  const project = index >= 0 ? projects[index] : null
  const next = project && projects.length > 1 ? projects[(index + 1) % projects.length] : null

  // Siempre arriba al abrir (o al pasar al siguiente proyecto).
  useLayoutEffect(() => {
    window.scrollTo(0, 0)
  }, [slug])

  // Llegada desde otro enlace del sitio: el foco pasa al título de la página
  // (el lector lo anuncia y el siguiente Tab sigue desde aquí). En una carga
  // directa ('POP') no se toca: el primer Tab sigue llevando al salto al contenido.
  const navType = useNavigationType()
  useEffect(() => {
    if (loading || navType === 'POP') return
    focusHeading(document.querySelector('main h1'))
  }, [slug, loading, navType])

  useEffect(() => {
    if (loading) return
    const prev = document.title
    document.title = project ? `${field(project, 'title')} · ${SITE}` : `${pick(c.docTitle)} · ${SITE}`
    return () => {
      document.title = prev
    }
  }, [project, loading, field, pick])

  useGSAP(
    () => {
      if (!project || prefersReducedMotion()) return
      const q = gsap.utils.selector(root)

      if (!morphed) {
        gsap.from(q('[data-pd-head] > *'), { opacity: 0, y: 14, duration: 0.7, ease: EASE_OUT, stagger: 0.06 })
        const frame = q('[data-pd-visual] .pj-frame')[0]
        if (frame) {
          // La ventana se endereza al entrar, como en el índice, pero en tiempo y no con scroll.
          gsap.from(frame, {
            rotationX: 10,
            y: 40,
            scale: 0.96,
            transformPerspective: 1500,
            transformOrigin: '50% 100%',
            duration: 1.1,
            ease: EASE_OUT,
            delay: 0.15,
          })
        } else if (q('[data-pd-visual]').length) {
          gsap.from(q('[data-pd-visual]'), { opacity: 0, y: 16, duration: 0.7, ease: EASE_OUT, delay: 0.15 })
          const layers = q('[data-pd-visual] [data-layer]')
          if (layers.length) gsap.from(layers, { opacity: 0, x: -8, duration: 0.5, ease: EASE_OUT, stagger: 0.05, delay: 0.3 })
        }
      }

      if (q('.pj-spec-lg').length) reveal(q('.pj-spec-lg > li'), { trigger: q('.pj-spec-lg')[0], from: { y: 10 }, stagger: 0.05, start: 'top 88%' })
      if (q('[data-pd-body] > *').length) reveal(q('[data-pd-body] > *'), { trigger: q('[data-pd-body]')[0], from: { y: 14 }, stagger: 0.05, start: 'top 85%' })
      q('[data-pd-gallery] > *').forEach((el) => reveal(el, { from: { y: 20 }, start: 'top 88%' }))
    },
    { scope: root, dependencies: [project?.id], revertOnUpdate: true },
  )

  if (loading) return <Loading />
  if (!project) return <NotFound />

  const title = field(project, 'title')
  const body = paragraphs(field(project, 'description'))
  const schema = project.cover_url ? null : schemaFor(project.slug)
  // Sin captura ni esquema, el visual es el stack por capas; pero con una sola
  // capa sería un panel a todo el ancho con una fila. Entonces no hay visual y
  // el stack va a la columna lateral, como en los proyectos con captura.
  const layerCount = project.cover_url || schema ? 0 : stackLayers(project.tech).length
  const stackVisual = layerCount >= 2
  const hasVisual = Boolean(project.cover_url || schema || stackVisual)
  const hasLinks = Boolean(project.repo_url || project.demo_url)

  return (
    <article ref={root} key={project.id} aria-labelledby="project-title" data-project-ready="">
      <Container size="wide" className="pt-8 md:pt-12">
        <div data-pd-head className="grid gap-x-10 gap-y-8 lg:grid-cols-12 lg:items-end">
          <Link
            to="/#proyectos"
            className="inline-flex items-center gap-2 justify-self-start text-[14px] text-text-2 transition-colors duration-200 hover:text-text lg:col-span-12"
          >
            <IconArrowLeft />
            {pick(c.back)}
          </Link>

          <div className="mt-2 lg:col-span-8 lg:mt-6">
            <h1 id="project-title" className="max-w-[18ch] text-[clamp(2.25rem,1.2rem+3.4vw,4rem)] leading-[1.04] tracking-[-0.04em]">
              {title}
            </h1>
            <p className="mt-5 max-w-[42rem] text-[clamp(1.05rem,1rem+0.35vw,1.25rem)] leading-relaxed text-text-2">
              {field(project, 'tagline')}
            </p>
          </div>

          <dl className="grid grid-cols-2 gap-x-8 gap-y-1 border-t border-line pt-4 text-[14px] lg:col-span-4 lg:col-start-9">
            <div>
              <dt className="text-[13px] text-text-3">{pick(c.type)}</dt>
              <dd className="mt-1 text-text">{categoryLabel(project.category, lang)}</dd>
            </div>
            <div>
              <dt className="text-[13px] text-text-3">{pick(c.year)}</dt>
              <dd className="tnum mt-1 font-mono text-text">{yearLabel(project, lang)}</dd>
            </div>
          </dl>
        </div>

        {hasVisual && (
        <div data-pd-visual className="mt-12 md:mt-16">
          {project.cover_url ? (
            <div className="pj-stage">
              <BrowserFrame
                src={project.cover_url}
                alt={c.screenshotAlt[lang](title)}
                title={title}
                eager
                className="pj-visual"
                style={{ viewTransitionName: VT_NAME }}
              />
            </div>
          ) : schema ? (
            <figure className="m-0">
              <div aria-hidden="true">
                <Schematic
                  schema={schema}
                  size="page"
                  play={morphed ? 'none' : 'mount'}
                  className="pj-visual"
                  style={{ viewTransitionName: VT_NAME }}
                />
              </div>
              <figcaption className="mt-3 max-w-[68ch] text-[13px] text-text-3">
                {pick(c.schematicNote)}
                <span className="sr-only">. {schemaSummary(schema, pick)}</span>
              </figcaption>
            </figure>
          ) : (
            // Pocas capas: el panel ocupa lo que la columna del título, no todo el ancho.
            <StackPanel tech={project.tech} className={cn('pj-visual', layerCount <= 3 && 'lg:max-w-[calc(66.667%-0.833rem)]')} />
          )}
        </div>
        )}

        {project.metrics.length > 0 && (
          <div className="mt-12 md:mt-16">
            <SpecList metrics={project.metrics} size="lg" className="border-t border-line" />
          </div>
        )}
      </Container>

      <Container size="wide" className="mt-16 md:mt-24">
        <div className="grid gap-x-10 gap-y-14 lg:grid-cols-12">
          <div data-pd-body className="flex max-w-[68ch] flex-col gap-6 text-[17px] leading-[1.7] text-text-2 lg:col-span-7">
            {body.map((para, i) => (
              <p key={i} className={cn(i === 0 && 'text-text')}>
                {para}
              </p>
            ))}
          </div>

          <aside className="flex flex-col gap-10 self-start lg:sticky lg:top-24 lg:col-span-4 lg:col-start-9">
            <section aria-labelledby="pd-role">
              <h2 id="pd-role" className="text-[13px] font-medium tracking-normal text-text-3">
                {pick(c.role)}
              </h2>
              <p className="mt-2 text-[16px] leading-relaxed text-text">{field(project, 'role')}</p>
            </section>

            {/* Si el visual ya es el stack por capas, no se repite aquí. */}
            {project.tech.length > 0 && !stackVisual && (
              <section aria-labelledby="pd-tech">
                <h2 id="pd-tech" className="text-[13px] font-medium tracking-normal text-text-3">
                  {pick(c.tech)}
                </h2>
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {project.tech.map((t) => (
                    <li key={t}>
                      <Tag>{techLabel(t, lang)}</Tag>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {hasLinks && (
              <section aria-labelledby="pd-links">
                <h2 id="pd-links" className="text-[13px] font-medium tracking-normal text-text-3">
                  {pick(c.links)}
                </h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {project.demo_url && (
                    <ButtonLink href={project.demo_url} target="_blank" rel="noreferrer noopener" variant="secondary">
                      {pick(c.demo)}
                      <IconArrowUpRight />
                    </ButtonLink>
                  )}
                  {project.repo_url && (
                    <ButtonLink href={project.repo_url} target="_blank" rel="noreferrer noopener" variant="secondary">
                      <IconGitHub />
                      {pick(c.repo)}
                    </ButtonLink>
                  )}
                </div>
              </section>
            )}
          </aside>
        </div>
      </Container>

      {project.gallery.length > 0 && (
        <Container size="wide" className="mt-20 md:mt-28">
          <section aria-labelledby="pd-gallery">
            <h2 id="pd-gallery" className="text-[13px] font-medium tracking-normal text-text-3">
              {pick(c.gallery)}
            </h2>
            <ul data-pd-gallery className="mt-4 grid gap-6 md:grid-cols-2">
              {project.gallery.map((src, i) => (
                <li key={src} className={cn(project.gallery.length % 2 === 1 && i === 0 && 'md:col-span-2')}>
                  <a href={src} target="_blank" rel="noreferrer noopener" className="block">
                    <img
                      src={src}
                      alt={c.galleryAlt[lang](title, i + 1)}
                      loading="lazy"
                      decoding="async"
                      className="w-full rounded-[var(--radius-lg)] border border-line bg-surface"
                    />
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </Container>
      )}

      <Closing />
      {next && <NextProject p={next} />}
    </article>
  )
}

function NextProject({ p }: { p: Project }) {
  const { pick, field } = useLang()
  return (
    <nav aria-label={pick(c.next)} className="border-t border-line">
      <Container size="wide">
        <Link to={projectPath(p)} className="group grid gap-6 py-14 md:grid-cols-12 md:items-end md:py-20">
          <span className="min-w-0 md:col-span-9">
            <span className="block text-[clamp(1.6rem,1.1rem+1.8vw,2.6rem)] leading-[1.08] font-semibold tracking-[-0.035em] text-text">
              {field(p, 'title')}
            </span>
            <span className="mt-3 block max-w-[42rem] text-[16px] leading-relaxed text-text-2">{field(p, 'tagline')}</span>
          </span>
          <span className="inline-flex items-center gap-2 text-[14px] font-medium text-text-2 transition-colors duration-200 group-hover:text-text md:col-span-3 md:justify-self-end">
            {pick(c.next)}
            <IconArrowRight className="transition-transform duration-200 ease-[var(--ease-out)] group-hover:translate-x-1" />
          </span>
        </Link>
      </Container>
    </nav>
  )
}

/**
 * Cierre del caso: quien llega desde un enlace compartido tiene aquí el
 * contacto y el CV sin volver a la portada. Mismo par de acciones que la
 * portada (botón + enlace de texto) y el punto de disponibilidad.
 */
function Closing() {
  const { pick } = useLang()
  const { profile } = useContent()
  return (
    <section aria-labelledby="pd-closing" className="mt-24 border-t border-line md:mt-32">
      <Container size="wide" className="flex flex-col gap-6 py-10 md:flex-row md:items-center md:justify-between md:gap-10 md:py-12">
        <div className="min-w-0">
          <h2 id="pd-closing" className="sr-only">
            {pick(siteCopy.closing.label)}
          </h2>
          {profile.available ? (
            <>
              <p className="flex items-center gap-2.5 text-[clamp(1.05rem,1rem+0.35vw,1.25rem)] leading-snug font-medium tracking-[-0.015em] text-text">
                <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-accent" />
                {pick(profile.availability)}
              </p>
              <p className="mt-1.5 pl-4 text-[14px] text-text-3">{pick(profile.location)}</p>
            </>
          ) : (
            <p className="text-[clamp(1.05rem,1rem+0.35vw,1.25rem)] leading-snug font-medium tracking-[-0.015em] text-text">
              {profile.name}
              <span className="mt-1.5 block text-[14px] font-normal tracking-normal text-text-3">{pick(profile.location)}</span>
            </p>
          )}
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-x-6 gap-y-4">
          <ButtonLink to="/#contacto" size="lg">
            {pick(siteCopy.hero.ctaPrimary)}
            <IconArrowRight className="transition-transform duration-200 ease-[var(--ease-out)] group-hover:translate-x-0.5" />
          </ButtonLink>
          <TextLink href={cvHref(profile)} download>
            <IconDownload />
            {pick(siteCopy.hero.ctaCv)}
          </TextLink>
        </div>
      </Container>
    </section>
  )
}

function Loading() {
  const { pick } = useLang()
  return (
    <Container size="wide" className="pt-8 pb-24 md:pt-12">
      <div aria-busy="true" className="min-h-[70svh]">
        <p className="sr-only" role="status">
          {pick(c.loadingProject)}
        </p>
        <div aria-hidden="true">
          <div className="h-4 w-24 rounded-[6px] bg-surface" />
          <div className="mt-12 h-12 w-2/3 max-w-[40rem] rounded-[8px] bg-surface" />
          <div className="mt-5 h-5 w-1/2 max-w-[32rem] rounded-[6px] bg-surface" />
          <div className="mt-14 aspect-[2000/1033] w-full rounded-[var(--radius-lg)] border border-line bg-bg-raised" />
        </div>
      </div>
    </Container>
  )
}

function NotFound() {
  const { pick } = useLang()

  // Un slug inexistente no debe acabar indexado (igual que la 404).
  useEffect(() => {
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex'
    document.head.appendChild(meta)
    return () => meta.remove()
  }, [])

  return (
    <div className="flex min-h-[72svh] items-center py-20 md:py-28">
      <Container size="base">
        <div className="max-w-[40rem]">
          <h1 className="text-[clamp(2rem,1.3rem+2.4vw,3.25rem)] leading-[1.06] tracking-[-0.035em]">{pick(c.notFoundTitle)}</h1>
          <p className="mt-5 text-[17px] leading-relaxed text-text-2">{pick(c.notFoundLead)}</p>
          <ButtonLink to="/#proyectos" size="lg" className="mt-8">
            <IconArrowLeft className="transition-transform duration-200 ease-[var(--ease-out)] group-hover:-translate-x-0.5" />
            {pick(c.notFoundCta)}
          </ButtonLink>
        </div>
      </Container>
    </div>
  )
}
