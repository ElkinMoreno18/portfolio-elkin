import { useEffect, useId, useMemo, useRef, useState } from 'react'
import type { FormEvent, KeyboardEvent as ReactKeyboardEvent, ReactNode } from 'react'
import { ChevronDown, CircleAlert, LoaderCircle, Plus, Trash2, X } from 'lucide-react'
import { useLang } from '@/i18n'
import { saveProject } from '@/lib/projectsApi'
import { CATEGORIES, emptyDraft, type Project, type ProjectDraft } from '@/lib/types'
import { cn, slugify } from '@/lib/utils'
import { Button } from '@/site/ui'
import { gsap, useGSAP, EASE_OUT, prefersReducedMotion } from '@/site/motion'
import {
  AdminField,
  BiField,
  FieldError,
  LangInputFrame,
  LangTextareaFrame,
  Toggle,
  adminFrameWithin,
  adminInput,
  bareInput,
  noSpin,
} from '@/components/admin/Field'
import { TagInput } from '@/components/admin/TagInput'
import { ImageUpload } from '@/components/admin/ImageUpload'

const copy = {
  newProject: { es: 'Nuevo proyecto', en: 'New project' },
  editProject: { es: 'Editar proyecto', en: 'Edit project' },
  close: { es: 'Cerrar', en: 'Close' },
  sections: {
    visibility: { es: 'Visibilidad', en: 'Visibility' },
    content: { es: 'Contenido', en: 'Content' },
    details: { es: 'Ficha', en: 'Details' },
    media: { es: 'Imágenes', en: 'Images' },
    links: { es: 'Enlaces', en: 'Links' },
    metrics: { es: 'Métricas de impacto', en: 'Impact metrics' },
  },
  contentLead: {
    es: 'Cada texto en los dos idiomas. Si falta el inglés, la versión en inglés del sitio muestra el español.',
    en: 'Every text in both languages. If English is missing, the English site shows the Spanish text.',
  },
  published: { es: 'Publicado', en: 'Published' },
  publishedDesc: { es: 'Visible en el portafolio. Si lo apagas queda como borrador.', en: 'Shown on the portfolio. Off keeps it as a draft.' },
  featured: { es: 'Destacado', en: 'Featured' },
  featuredDesc: { es: 'Se ordena antes que el resto de proyectos.', en: 'Sorted ahead of the other projects.' },
  title: { es: 'Título', en: 'Title' },
  tagline: { es: 'Frase corta', en: 'One-liner' },
  description: { es: 'Descripción', en: 'Description' },
  role: { es: 'Mi rol', en: 'My role' },
  slug: { es: 'Slug', en: 'Slug' },
  category: { es: 'Categoría', en: 'Category' },
  year: { es: 'Año', en: 'Year' },
  yearStart: { es: 'Desde (opcional)', en: 'From (optional)' },
  ongoing: { es: 'En curso', en: 'Ongoing' },
  ongoingDesc: { es: 'Se muestra «2025 – hoy».', en: 'Shown as "2025 – now".' },
  order: { es: 'Orden', en: 'Order' },
  tech: { es: 'Tecnologías', en: 'Technologies' },
  cover: { es: 'Portada', en: 'Cover' },
  gallery: { es: 'Galería', en: 'Gallery' },
  repo: { es: 'Repositorio', en: 'Repository' },
  demo: { es: 'Demo en vivo', en: 'Live demo' },
  required: { es: 'Obligatorio en ES', en: 'Required in ES' },
  hint: {
    tagline: { es: 'Una línea. Es lo primero que se lee del proyecto.', en: 'One line. The first thing people read about the project.' },
    description: { es: 'El problema, qué hiciste y qué cambió. De 2 a 4 párrafos.', en: 'The problem, what you did and what changed. 2 to 4 paragraphs.' },
    slug: { es: 'Se genera desde el título mientras no lo edites a mano.', en: 'Generated from the title until you edit it by hand.' },
    order: { es: 'Menor número, antes.', en: 'Lower comes first.' },
    yearStart: {
      es: 'Si el trabajo abarcó varios años: «2022 – 2025». Vacío, sólo el año.',
      en: 'If the work spanned several years: "2022 – 2025". Empty, just the year.',
    },
    tech: { es: 'Enter o coma para añadir. Retroceso borra la última.', en: 'Enter or comma to add. Backspace removes the last one.' },
    metrics: {
      es: 'Sólo cifras reales que puedas defender. Un valor corto y una etiqueta por idioma.',
      en: 'Only real numbers you can back up. A short value and one label per language.',
    },
  },
  addTech: { es: 'Añadir tecnología', en: 'Add a technology' },
  metricValue: { es: 'Valor', en: 'Value' },
  metricLabel: { es: 'Etiqueta', en: 'Label' },
  metricPlaceholderEn: { es: 'Delivery time', en: 'Delivery time' },
  metricPlaceholderEs: { es: 'Tiempo de entrega', en: 'Tiempo de entrega' },
  addMetric: { es: 'Añadir métrica', en: 'Add metric' },
  removeMetric: { es: 'Quitar métrica', en: 'Remove metric' },
  metric: { es: 'Métrica', en: 'Metric' },
  noMetrics: { es: 'Sin métricas. Añade una sólo si tienes el dato.', en: 'No metrics. Add one only if you have the number.' },
  errTitle: { es: 'Escribe el título en español para poder guardar.', en: 'Write the Spanish title to be able to save.' },
  errSave: { es: 'No se pudo guardar', en: 'Could not save' },
  cancel: { es: 'Cancelar', en: 'Cancel' },
  create: { es: 'Crear proyecto', en: 'Create project' },
  save: { es: 'Guardar cambios', en: 'Save changes' },
  saving: { es: 'Guardando…', en: 'Saving…' },
  dirty: { es: 'Cambios sin guardar', en: 'Unsaved changes' },
  clean: { es: 'Sin cambios', en: 'No changes' },
  toSave: { es: 'para guardar', en: 'to save' },
}

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)

/** Sección del formulario: título propio y sus campos, separada por una línea. */
function Group({ id, title, lead, children }: { id: string; title: string; lead?: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="py-7 first:pt-6">
      <h3 id={id} className="text-[15px] tracking-[-0.015em]">
        {title}
      </h3>
      {lead && <p className="mt-1 max-w-[60ch] text-[13px] leading-snug text-text-3">{lead}</p>}
      <div className="mt-4 space-y-5">{children}</div>
    </section>
  )
}

export function ProjectForm({
  project,
  onClose,
  onSaved,
}: {
  project: Project | null
  onClose: () => void
  onSaved: () => void
}) {
  const { lang, pick } = useLang()
  const uid = useId()
  const [draft, setDraft] = useState<ProjectDraft>(() => {
    if (!project) return emptyDraft()
    const { id: _id, created_at: _c, updated_at: _u, ...rest } = project
    return { ...rest, year_start: rest.year_start ?? null, ongoing: rest.ongoing ?? false }
  })
  const [initial] = useState(() => JSON.stringify(draft))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [titleError, setTitleError] = useState(false)
  const [slugTouched, setSlugTouched] = useState(Boolean(project))

  const root = useRef<HTMLDivElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  const scrim = useRef<HTMLDivElement>(null)
  const titleEs = useRef<HTMLInputElement>(null)
  const leaving = useRef(false)

  const dirty = useMemo(() => JSON.stringify(draft) !== initial, [draft, initial])

  function set<K extends keyof ProjectDraft>(key: K, value: ProjectDraft[K]) {
    setDraft((d) => ({ ...d, [key]: value }))
  }

  // El slug se deriva del título mientras nadie lo edite a mano.
  useEffect(() => {
    if (!slugTouched) setDraft((d) => ({ ...d, slug: slugify(d.title_es || d.title_en) }))
  }, [draft.title_es, draft.title_en, slugTouched])

  /* ── Entrada: el panel llega desde el borde derecho, donde vive.
        Con movimiento reducido sólo cambia la opacidad. ── */
  const { contextSafe } = useGSAP(
    () => {
      if (prefersReducedMotion()) {
        gsap.from([scrim.current, panel.current], { opacity: 0, duration: 0.15, ease: 'none' })
        return
      }
      gsap.from(scrim.current, { opacity: 0, duration: 0.24, ease: EASE_OUT })
      gsap.from(panel.current, { xPercent: 100, duration: 0.38, ease: EASE_OUT })
    },
    { scope: root },
  )

  /* ── Salida: más rápida que la entrada; al terminar se desmonta. ── */
  const leave = contextSafe((after: () => void) => {
    if (leaving.current) return
    leaving.current = true
    if (root.current) root.current.style.pointerEvents = 'none'
    const tl = gsap.timeline({ onComplete: after })
    if (prefersReducedMotion()) {
      tl.to([scrim.current, panel.current], { opacity: 0, duration: 0.12, ease: 'none', overwrite: true })
    } else {
      tl.to(scrim.current, { opacity: 0, duration: 0.2, ease: EASE_OUT, overwrite: true }, 0)
      tl.to(panel.current, { xPercent: 100, duration: 0.22, ease: EASE_OUT, overwrite: true }, 0)
    }
  })

  const requestClose = () => leave(onClose)
  const closeRef = useRef(requestClose)
  useEffect(() => {
    closeRef.current = requestClose
  })

  // Escape cierra, el fondo no se desplaza y el foco entra en el primer campo.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeRef.current()
    }
    window.addEventListener('keydown', onKey)
    const gap = window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflow = 'hidden'
    if (gap > 0) document.body.style.paddingRight = `${gap}px`
    titleEs.current?.focus({ preventScroll: true })
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    }
  }, [])

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (saving) return
    if (!draft.title_es.trim()) {
      setTitleError(true)
      titleEs.current?.focus()
      return
    }
    setSaving(true)
    setError(null)
    try {
      await saveProject({ ...draft, slug: draft.slug || slugify(draft.title_es) }, project?.id)
      // Si ya se cerró mientras guardaba, basta con avisar para recargar la lista.
      if (leaving.current) onSaved()
      else leave(onSaved)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error')
    } finally {
      setSaving(false)
    }
  }

  // Enter en un campo de una línea no envía (un proyecto a medias se publicaría);
  // Cmd/Ctrl + Enter sí guarda, desde cualquier campo.
  function onFormKeyDown(e: ReactKeyboardEvent<HTMLFormElement>) {
    if (e.key !== 'Enter') return
    const form = e.currentTarget
    if (e.metaKey || e.ctrlKey) {
      e.preventDefault()
      setTimeout(() => form.requestSubmit(), 0)
      return
    }
    const t = e.target as HTMLElement
    if (t instanceof HTMLInputElement) e.preventDefault()
  }

  const heading = pick(project ? copy.editProject : copy.newProject)
  const ids = {
    title: `${uid}-title`,
    visibility: `${uid}-g-vis`,
    content: `${uid}-g-content`,
    details: `${uid}-g-details`,
    media: `${uid}-g-media`,
    links: `${uid}-g-links`,
    metrics: `${uid}-g-metrics`,
  }

  /* Pareja ES/EN de una línea */
  const line = (key: 'title' | 'tagline' | 'role', opts: { placeholder?: string } = {}) =>
    (['es', 'en'] as const).map((l) => {
      const k = `${key}_${l}` as const
      const id = `${uid}-${k}`
      const invalid = key === 'title' && l === 'es' && titleError
      return (
        <div key={l}>
          <LangInputFrame code={l === 'es' ? 'ES' : 'EN'} htmlFor={id} srLabel={pick(copy[key])} invalid={invalid}>
            <input
              id={id}
              ref={key === 'title' && l === 'es' ? titleEs : undefined}
              value={draft[k]}
              onChange={(e) => {
                set(k, e.target.value)
                if (invalid && e.target.value.trim()) setTitleError(false)
              }}
              aria-required={key === 'title' && l === 'es' ? true : undefined}
              aria-invalid={invalid || undefined}
              aria-describedby={invalid ? `${id}-error` : undefined}
              placeholder={opts.placeholder}
              className={bareInput}
            />
          </LangInputFrame>
          {invalid && <FieldError id={`${id}-error`}>{pick(copy.errTitle)}</FieldError>}
        </div>
      )
    })

  return (
    <div ref={root} className="fixed inset-0 z-50 flex justify-end overflow-hidden">
      <div ref={scrim} className="absolute inset-0 bg-[var(--scrim)]" onClick={requestClose} aria-hidden />

      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={ids.title}
        className="relative flex h-full w-full max-w-[48rem] flex-col border-l border-line bg-bg-raised shadow-[var(--shadow-window)]"
      >
        {/* ── Cabecera ── */}
        <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-4 sm:px-7">
          <div className="min-w-0">
            <h2 id={ids.title} className="text-[18px] tracking-[-0.02em]">
              {heading}
            </h2>
            <p className="mt-1 truncate font-mono text-[12px] text-text-3">
              /proyecto/{draft.slug ? <span className="text-text-2">{draft.slug}</span> : 'slug'}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <kbd className="hidden h-6 items-center rounded-[5px] border border-line px-1.5 font-mono text-[12px] text-text-3 sm:inline-flex">
              Esc
            </kbd>
            <button
              type="button"
              onClick={requestClose}
              aria-label={pick(copy.close)}
              className="grid size-8 place-items-center rounded-[var(--radius-sm)] text-text-2 transition-colors duration-150 hover:bg-surface-2 hover:text-text"
            >
              <X size={16} strokeWidth={1.5} aria-hidden />
            </button>
          </div>
        </header>

        {/* ── Campos ── */}
        <form
          id={`${uid}-form`}
          noValidate
          onSubmit={submit}
          onKeyDown={onFormKeyDown}
          className="flex-1 overflow-y-auto overscroll-contain"
        >
          <div className="divide-y divide-line px-5 sm:px-7">
            <Group id={ids.visibility} title={pick(copy.sections.visibility)}>
              <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
                <Toggle
                  checked={draft.published}
                  onChange={(v) => set('published', v)}
                  label={pick(copy.published)}
                  description={pick(copy.publishedDesc)}
                />
                <Toggle
                  checked={draft.featured}
                  onChange={(v) => set('featured', v)}
                  label={pick(copy.featured)}
                  description={pick(copy.featuredDesc)}
                />
              </div>
            </Group>

            <Group id={ids.content} title={pick(copy.sections.content)} lead={pick(copy.contentLead)}>
              <BiField label={pick(copy.title)} aside={pick(copy.required)}>
                {line('title')}
              </BiField>

              <BiField label={pick(copy.tagline)} hint={pick(copy.hint.tagline)}>
                {line('tagline')}
              </BiField>

              <BiField label={pick(copy.description)} hint={pick(copy.hint.description)}>
                {(['es', 'en'] as const).map((l) => {
                  const k = `description_${l}` as const
                  const id = `${uid}-${k}`
                  return (
                    <LangTextareaFrame
                      key={l}
                      code={l === 'es' ? 'ES' : 'EN'}
                      htmlFor={id}
                      srLabel={pick(copy.description)}
                      count={draft[k].length}
                    >
                      <textarea
                        id={id}
                        value={draft[k]}
                        onChange={(e) => set(k, e.target.value)}
                        rows={9}
                        className="block w-full resize-y bg-transparent px-3 py-2.5 text-[14px] leading-relaxed text-text placeholder:text-placeholder focus:outline-none focus-visible:outline-none"
                      />
                    </LangTextareaFrame>
                  )
                })}
              </BiField>

              <BiField label={pick(copy.role)}>{line('role')}</BiField>
            </Group>

            <Group id={ids.details} title={pick(copy.sections.details)}>
              <div className="grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)_minmax(0,0.8fr)]">
                <AdminField label={pick(copy.category)} htmlFor={`${uid}-category`} className="col-span-2 sm:col-span-1">
                  <div className="relative">
                    <select
                      id={`${uid}-category`}
                      value={draft.category}
                      onChange={(e) => set('category', e.target.value as ProjectDraft['category'])}
                      className={cn(adminInput, 'appearance-none pr-9')}
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c[lang]}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={16}
                      strokeWidth={1.5}
                      aria-hidden
                      className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-text-3"
                    />
                  </div>
                </AdminField>
                <AdminField label={pick(copy.year)} htmlFor={`${uid}-year`}>
                  <input
                    id={`${uid}-year`}
                    type="number"
                    inputMode="numeric"
                    value={draft.year}
                    onChange={(e) => set('year', Number(e.target.value))}
                    className={cn(adminInput, noSpin, 'font-mono tnum')}
                  />
                </AdminField>
                <AdminField label={pick(copy.order)} htmlFor={`${uid}-order`} hint={pick(copy.hint.order)}>
                  <input
                    id={`${uid}-order`}
                    type="number"
                    inputMode="numeric"
                    value={draft.sort_order}
                    onChange={(e) => set('sort_order', Number(e.target.value))}
                    aria-describedby={`${uid}-order-hint`}
                    className={cn(adminInput, noSpin, 'font-mono tnum')}
                  />
                </AdminField>
              </div>

              <div className="grid gap-x-4 gap-y-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] sm:items-start">
                <AdminField label={pick(copy.yearStart)} htmlFor={`${uid}-year-start`} hint={pick(copy.hint.yearStart)}>
                  <input
                    id={`${uid}-year-start`}
                    type="number"
                    inputMode="numeric"
                    value={draft.year_start ?? ''}
                    onChange={(e) => set('year_start', e.target.value ? Number(e.target.value) : null)}
                    placeholder="2022"
                    aria-describedby={`${uid}-year-start-hint`}
                    className={cn(adminInput, noSpin, 'font-mono tnum')}
                  />
                </AdminField>
                <div className="sm:pt-6">
                  <Toggle
                    checked={Boolean(draft.ongoing)}
                    onChange={(v) => set('ongoing', v)}
                    label={pick(copy.ongoing)}
                    description={pick(copy.ongoingDesc)}
                  />
                </div>
              </div>

              <AdminField label={pick(copy.tech)} htmlFor={`${uid}-tech`} hint={pick(copy.hint.tech)}>
                <TagInput
                  id={`${uid}-tech`}
                  value={draft.tech}
                  onChange={(v) => set('tech', v)}
                  placeholder={pick(copy.addTech)}
                  describedBy={`${uid}-tech-hint`}
                />
              </AdminField>

              <AdminField label={pick(copy.slug)} htmlFor={`${uid}-slug`} hint={pick(copy.hint.slug)}>
                <div className={cn(adminFrameWithin, 'flex h-9 items-stretch overflow-hidden')}>
                  <span
                    aria-hidden
                    className="flex shrink-0 items-center border-r border-line bg-surface px-3 font-mono text-[12px] text-text-3"
                  >
                    /proyecto/
                  </span>
                  <input
                    id={`${uid}-slug`}
                    value={draft.slug}
                    onChange={(e) => {
                      setSlugTouched(true)
                      set('slug', slugify(e.target.value))
                    }}
                    aria-describedby={`${uid}-slug-hint`}
                    spellCheck={false}
                    className={cn(bareInput, 'font-mono text-[13px]')}
                  />
                </div>
              </AdminField>
            </Group>

            <Group id={ids.media} title={pick(copy.sections.media)}>
              <AdminField label={pick(copy.cover)}>
                <ImageUpload value={draft.cover_url} onChange={(v) => set('cover_url', (v as string) ?? null)} />
              </AdminField>
              <AdminField label={pick(copy.gallery)}>
                <ImageUpload multiple value={draft.gallery} onChange={(v) => set('gallery', (v as string[]) ?? [])} />
              </AdminField>
            </Group>

            <Group id={ids.links} title={pick(copy.sections.links)}>
              <div className="grid gap-5 sm:grid-cols-2 sm:gap-4">
                <AdminField label={pick(copy.repo)} htmlFor={`${uid}-repo`}>
                  <input
                    id={`${uid}-repo`}
                    type="url"
                    inputMode="url"
                    value={draft.repo_url ?? ''}
                    onChange={(e) => set('repo_url', e.target.value || null)}
                    placeholder="https://github.com/…"
                    spellCheck={false}
                    className={cn(adminInput, 'font-mono text-[13px]')}
                  />
                </AdminField>
                <AdminField label={pick(copy.demo)} htmlFor={`${uid}-demo`}>
                  <input
                    id={`${uid}-demo`}
                    type="url"
                    inputMode="url"
                    value={draft.demo_url ?? ''}
                    onChange={(e) => set('demo_url', e.target.value || null)}
                    placeholder="https://…"
                    spellCheck={false}
                    className={cn(adminInput, 'font-mono text-[13px]')}
                  />
                </AdminField>
              </div>
            </Group>

            <Group id={ids.metrics} title={pick(copy.sections.metrics)} lead={pick(copy.hint.metrics)}>
              {draft.metrics.length === 0 ? (
                <p className="text-[13px] text-text-3">{pick(copy.noMetrics)}</p>
              ) : (
                <div>
                  <div
                    aria-hidden
                    className="mb-1.5 hidden grid-cols-[6.5rem_minmax(0,1fr)_minmax(0,1fr)_2.25rem] gap-2 text-[12px] text-text-3 sm:grid"
                  >
                    <span>{pick(copy.metricValue)}</span>
                    <span>{pick(copy.metricLabel)} · ES</span>
                    <span>{pick(copy.metricLabel)} · EN</span>
                  </div>
                  <ul className="space-y-3 sm:space-y-2">
                    {draft.metrics.map((m, i) => {
                      const update = (patch: Partial<typeof m>) => {
                        const next = [...draft.metrics]
                        next[i] = { ...m, ...patch }
                        set('metrics', next)
                      }
                      const n = `${pick(copy.metric)} ${i + 1}`
                      return (
                        <li
                          key={i}
                          className="grid grid-cols-[6.5rem_minmax(0,1fr)_2.25rem] gap-2 sm:grid-cols-[6.5rem_minmax(0,1fr)_minmax(0,1fr)_2.25rem]"
                        >
                          <input
                            value={m.value}
                            onChange={(e) => update({ value: e.target.value })}
                            placeholder="-30%"
                            aria-label={`${n}: ${pick(copy.metricValue)}`}
                            className={cn(adminInput, 'font-mono tnum')}
                          />
                          <input
                            value={m.label_es}
                            onChange={(e) => update({ label_es: e.target.value })}
                            placeholder={pick(copy.metricPlaceholderEs)}
                            aria-label={`${n}: ${pick(copy.metricLabel)} ES`}
                            className={adminInput}
                          />
                          <input
                            value={m.label_en}
                            onChange={(e) => update({ label_en: e.target.value })}
                            placeholder={pick(copy.metricPlaceholderEn)}
                            aria-label={`${n}: ${pick(copy.metricLabel)} EN`}
                            className={cn(adminInput, 'col-start-2 sm:col-start-auto')}
                          />
                          <button
                            type="button"
                            onClick={() => set('metrics', draft.metrics.filter((_, j) => j !== i))}
                            aria-label={`${pick(copy.removeMetric)} ${i + 1}`}
                            className="col-start-3 row-start-1 grid size-9 place-items-center rounded-[var(--radius-sm)] text-text-3 transition-colors duration-150 hover:bg-surface-2 hover:text-danger sm:col-start-auto sm:row-start-auto"
                          >
                            <Trash2 size={16} strokeWidth={1.5} aria-hidden />
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => set('metrics', [...draft.metrics, { value: '', label_es: '', label_en: '' }])}
              >
                <Plus size={14} strokeWidth={1.5} aria-hidden />
                {pick(copy.addMetric)}
              </Button>
            </Group>
          </div>
        </form>

        {/* ── Pie: estado y acciones ── */}
        <footer className="border-t border-line bg-bg-raised">
          {error && (
            <div
              role="alert"
              className="flex items-start gap-2 border-b border-line bg-danger/[0.06] px-5 py-3 text-[13px] leading-snug text-text-2 sm:px-7"
            >
              <CircleAlert size={16} strokeWidth={1.5} className="mt-px shrink-0 text-danger" aria-hidden />
              <p className="min-w-0 break-words">
                <span className="font-medium text-danger">{pick(copy.errSave)}.</span> {error}
              </p>
            </div>
          )}
          <div className="flex items-center justify-between gap-4 px-5 py-3.5 sm:px-7">
            <p aria-live="polite" className="flex min-w-0 items-center gap-2 text-[13px] text-text-3">
              {dirty ? (
                <>
                  <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-text-2" />
                  <span className="truncate text-text-2">{pick(copy.dirty)}</span>
                </>
              ) : (
                project && pick(copy.clean)
              )}
            </p>
            <div className="flex shrink-0 items-center gap-2">
              <span className="mr-2 hidden items-center gap-1.5 text-[12px] text-text-3 md:inline-flex">
                <kbd className="inline-flex h-6 items-center rounded-[5px] border border-line px-1.5 font-mono text-[12px]">
                  {isMac ? 'Cmd' : 'Ctrl'} Enter
                </kbd>
                {pick(copy.toSave)}
              </span>
              <Button type="button" variant="ghost" onClick={requestClose}>
                {pick(copy.cancel)}
              </Button>
              <Button type="submit" form={`${uid}-form`} disabled={saving} aria-busy={saving}>
                {saving && <LoaderCircle size={16} strokeWidth={1.5} className="animate-spin" aria-hidden />}
                {saving ? pick(copy.saving) : pick(project ? copy.save : copy.create)}
              </Button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
