import { useEffect, useId, useRef, useState } from 'react'
import type { FormEvent, KeyboardEvent as ReactKeyboardEvent, ReactNode } from 'react'
import { ArrowDown, ArrowUp, ArrowUpRight, Check, ChevronDown, CircleAlert, LoaderCircle, Plus, Trash2 } from 'lucide-react'
import { useLang } from '@/i18n'
import type { Bi } from '@/lib/types'
import type { BiList } from '@/content/types'
import { cn } from '@/lib/utils'
import { Button } from '@/site/ui'
import {
  AdminField,
  BiField,
  LangInputFrame,
  LangTextareaFrame,
  adminInput,
  bareInput,
} from '@/components/admin/Field'

/*
 * Piezas comunes de los editores de contenido del panel: el marco con la
 * barra de guardar, las secciones, los campos bilingües y las listas
 * (puestos, formación, principios…). Mismo lenguaje que el formulario de
 * proyectos: denso, tranquilo, el acento sólo en lo activo.
 */

export const copy = {
  saved: { es: 'Guardado', en: 'Saved' },
  savedAt: { es: 'Guardado el', en: 'Saved on' },
  initial: {
    es: 'Contenido inicial: aún no lo has guardado aquí. El sitio usa esta versión.',
    en: 'Initial content: not saved here yet. The site uses this version.',
  },
  dirty: { es: 'Cambios sin guardar', en: 'Unsaved changes' },
  clean: { es: 'Sin cambios', en: 'No changes' },
  save: { es: 'Guardar', en: 'Save' },
  saving: { es: 'Guardando…', en: 'Saving…' },
  discard: { es: 'Descartar', en: 'Discard' },
  saveFailed: { es: 'No se pudo guardar', en: 'Could not save' },
  savedLive: { es: 'Guardado. Ya se ve en el sitio.', en: 'Saved. It is live on the site.' },
  moveUp: { es: 'Subir', en: 'Move up' },
  moveDown: { es: 'Bajar', en: 'Move down' },
  remove: { es: 'Eliminar', en: 'Delete' },
  confirmRemove: { es: '¿Eliminar «{t}»? Se quita al guardar.', en: 'Delete "{t}"? It goes when you save.' },
  untitled: { es: 'Sin título', en: 'Untitled' },
  expand: { es: 'Editar', en: 'Edit' },
  collapse: { es: 'Plegar', en: 'Collapse' },
  oneLine: { es: 'Uno por línea.', en: 'One per line.' },
  viewOnSite: { es: 'Ver en el sitio', en: 'View on site' },
  paragraphs: { es: 'Deja una línea en blanco entre párrafos.', en: 'Leave a blank line between paragraphs.' },
  enFallback: {
    es: 'Si dejas vacío el inglés, la versión en inglés del sitio muestra el español.',
    en: 'If English is left empty, the English site shows the Spanish text.',
  },
}

const ic = { size: 16, strokeWidth: 1.5, 'aria-hidden': true } as const

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)

function formatDateTime(iso: string, lang: 'es' | 'en') {
  return new Intl.DateTimeFormat(lang === 'es' ? 'es-ES' : 'en-GB', { dateStyle: 'long', timeStyle: 'short' }).format(
    new Date(iso),
  )
}

/* ───────────────────────── Estado de una sección ───────────────────────── */

/** Borrador de una sección: lo editado, si difiere de lo guardado y cómo volver atrás. */
export function useDraft<T>(initial: T) {
  const [draft, setDraft] = useState<T>(initial)
  const [base, setBase] = useState(() => JSON.stringify(initial))
  const dirty = JSON.stringify(draft) !== base
  return {
    draft,
    setDraft,
    dirty,
    markSaved: (value: T) => {
      setDraft(value)
      setBase(JSON.stringify(value))
    },
    discard: () => setDraft(JSON.parse(base) as T),
  }
}

/**
 * Todo lo que necesita un editor de sección: el borrador, guardar (con su
 * estado y su error) y avisar al panel de si hay cambios sin guardar, para
 * que pregunte antes de cambiar de pestaña.
 */
export function useSectionEditor<T>({
  initial,
  onDirtyChange,
  persist,
  prepare = tidy,
}: {
  initial: T
  onDirtyChange: (dirty: boolean) => void
  persist: (clean: T) => Promise<void>
  prepare?: (draft: T) => T
}) {
  const d = useDraft(initial)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedOnce, setSavedOnce] = useState(false)

  const notify = useRef(onDirtyChange)
  useEffect(() => {
    notify.current = onDirtyChange
  })
  useEffect(() => notify.current(d.dirty), [d.dirty])
  // Al salir de la pestaña, el panel deja de considerar estos cambios.
  useEffect(() => () => notify.current(false), [])

  async function save() {
    if (saving) return
    setSaving(true)
    setError(null)
    setSavedOnce(false)
    try {
      const clean = prepare(d.draft)
      await persist(clean)
      d.markSaved(clean)
      setSavedOnce(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setSaving(false)
    }
  }

  return {
    draft: d.draft,
    setDraft: d.setDraft,
    dirty: d.dirty,
    discard: () => {
      setError(null)
      d.discard()
    },
    saving,
    error,
    justSaved: savedOnce && !d.dirty,
    save: () => void save(),
  }
}

export type SectionEditor = Pick<
  ReturnType<typeof useSectionEditor<unknown>>,
  'dirty' | 'saving' | 'error' | 'justSaved' | 'save' | 'discard'
>

/** Quita espacios sobrantes de todos los textos (y líneas vacías de las listas). */
export function tidy<T>(value: T): T {
  if (typeof value === 'string') return value.trim() as T
  if (Array.isArray(value)) {
    const out = value.map(tidy)
    return (out.every((v) => typeof v === 'string') ? out.filter(Boolean) : out) as T
  }
  if (typeof value === 'object' && value !== null) {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, tidy(v)])) as T
  }
  return value
}

/* ───────────────────────── Marco del editor ───────────────────────── */

export function EditorShell({
  title,
  lead,
  savedAt,
  editor,
  viewHref,
  children,
}: {
  title: string
  lead: string
  savedAt?: string
  editor: SectionEditor
  /** Dónde se ve esta sección en el sitio. */
  viewHref?: string
  children: ReactNode
}) {
  const { lang, pick } = useLang()
  const uid = useId()
  const { dirty, saving, error, justSaved, save: onSave, discard: onDiscard } = editor

  // Salir de la página con cambios sin guardar: el navegador avisa.
  useEffect(() => {
    if (!dirty) return
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [dirty])

  function submit(e: FormEvent) {
    e.preventDefault()
    if (dirty && !saving) onSave()
  }

  // Cmd/Ctrl + S o Cmd/Ctrl + Enter guardan desde cualquier campo; Enter solo
  // en un campo de una línea no envía nada (guardar a medias no ayuda).
  function onKeyDown(e: ReactKeyboardEvent<HTMLFormElement>) {
    const mod = e.metaKey || e.ctrlKey
    if (mod && (e.key === 's' || e.key === 'Enter')) {
      e.preventDefault()
      const form = e.currentTarget
      setTimeout(() => form.requestSubmit(), 0)
      return
    }
    if (e.key === 'Enter' && e.target instanceof HTMLInputElement) e.preventDefault()
  }

  return (
    <form id={`${uid}-form`} noValidate onSubmit={submit} onKeyDown={onKeyDown}>
      <div className="flex flex-col gap-3 pt-10 pb-6 md:pt-12">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
          <h1 className="text-[28px] leading-[1.1] tracking-[-0.03em]">{title}</h1>
          {viewHref && (
            <a
              href={viewHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-[4px] text-[13px] font-medium text-text-2 underline decoration-line-strong underline-offset-[3px] transition-colors hover:text-text hover:decoration-text-3"
            >
              {pick(copy.viewOnSite)}
              <ArrowUpRight {...ic} size={14} />
            </a>
          )}
        </div>
        <p className="max-w-[40rem] text-[15px] leading-relaxed text-text-2">{lead}</p>
        <p className="flex items-center gap-1.5 text-[13px] text-text-3">
          {savedAt ? (
            <>
              <Check {...ic} size={14} />
              {pick(copy.savedAt)} {formatDateTime(savedAt, lang)}
            </>
          ) : (
            <>
              <span aria-hidden className="size-1.5 shrink-0 rounded-full border border-text-3" />
              {pick(copy.initial)}
            </>
          )}
        </p>
      </div>

      <div className="max-w-[52rem] divide-y divide-line border-t border-line">{children}</div>

      {/* Barra de guardar: pegada abajo mientras se edita. */}
      <div className="sticky bottom-0 z-10 mt-8 border-t border-line bg-bg">
        {error && (
          <div role="alert" className="flex items-start gap-2 border-b border-line py-3 text-[13px] leading-snug text-text-2">
            <CircleAlert {...ic} className="mt-px shrink-0 text-danger" />
            <p className="min-w-0 break-words">
              <span className="font-medium text-danger">{pick(copy.saveFailed)}.</span> {error}
            </p>
          </div>
        )}
        <div className="flex items-center justify-between gap-4 py-3.5">
          <p aria-live="polite" className="flex min-w-0 items-center gap-2 text-[13px] text-text-3">
            {dirty ? (
              <>
                <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-text-2" />
                <span className="truncate text-text-2">{pick(copy.dirty)}</span>
              </>
            ) : justSaved ? (
              <>
                <Check {...ic} size={14} className="shrink-0 text-text-2" />
                <span className="truncate text-text-2">{pick(copy.savedLive)}</span>
              </>
            ) : (
              pick(copy.clean)
            )}
          </p>
          <div className="flex shrink-0 items-center gap-2">
            <span className="mr-2 hidden items-center gap-1.5 text-[12px] text-text-3 md:inline-flex">
              <kbd className="inline-flex h-6 items-center rounded-[5px] border border-line px-1.5 font-mono text-[12px]">
                {isMac ? 'Cmd' : 'Ctrl'} S
              </kbd>
            </span>
            {dirty && (
              <Button type="button" variant="ghost" onClick={onDiscard} disabled={saving}>
                {pick(copy.discard)}
              </Button>
            )}
            <Button type="submit" disabled={!dirty || saving} aria-busy={saving}>
              {saving && <LoaderCircle {...ic} className="animate-spin" />}
              {pick(saving ? copy.saving : copy.save)}
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}

/** Una sección del editor: título, explicación breve y sus campos. */
export function Section({ title, lead, children, action }: { title: string; lead?: string; children: ReactNode; action?: ReactNode }) {
  const id = useId()
  return (
    <section aria-labelledby={id} className="py-8">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 id={id} className="text-[16px] tracking-[-0.015em]">
            {title}
          </h2>
          {lead && <p className="mt-1 max-w-[60ch] text-[13px] leading-snug text-text-3">{lead}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  )
}

/* ───────────────────────── Campos ───────────────────────── */

export function TextField({
  label,
  value,
  onChange,
  hint,
  placeholder,
  type = 'text',
  mono = false,
  className,
  inputMode,
  disabled,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  hint?: string
  placeholder?: string
  type?: 'text' | 'email' | 'url' | 'month'
  mono?: boolean
  className?: string
  inputMode?: 'text' | 'email' | 'url' | 'numeric'
  disabled?: boolean
}) {
  const id = useId()
  return (
    <AdminField label={label} htmlFor={id} hint={hint} className={className}>
      <input
        id={id}
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        spellCheck={type === 'text' && !mono}
        aria-describedby={hint ? `${id}-hint` : undefined}
        className={cn(adminInput, mono && 'font-mono text-[13px]', 'disabled:cursor-not-allowed disabled:opacity-50')}
      />
    </AdminField>
  )
}

/** Texto corto en los dos idiomas, lado a lado. */
export function BiText({
  label,
  value,
  onChange,
  hint,
  aside,
  placeholder,
}: {
  label: string
  value: Bi
  onChange: (v: Bi) => void
  hint?: string
  aside?: string
  placeholder?: Partial<Bi>
}) {
  const uid = useId()
  return (
    <BiField label={label} hint={hint} aside={aside}>
      {(['es', 'en'] as const).map((l) => (
        <LangInputFrame key={l} code={l === 'es' ? 'ES' : 'EN'} htmlFor={`${uid}-${l}`} srLabel={label}>
          <input
            id={`${uid}-${l}`}
            lang={l}
            value={value[l]}
            onChange={(e) => onChange({ ...value, [l]: e.target.value })}
            placeholder={placeholder?.[l] ?? (l === 'en' ? value.es : undefined)}
            className={bareInput}
          />
        </LangInputFrame>
      ))}
    </BiField>
  )
}

/** Texto largo en los dos idiomas. */
export function BiArea({
  label,
  value,
  onChange,
  hint,
  rows = 3,
}: {
  label: string
  value: Bi
  onChange: (v: Bi) => void
  hint?: string
  rows?: number
}) {
  const uid = useId()
  return (
    <BiField label={label} hint={hint}>
      {(['es', 'en'] as const).map((l) => (
        <LangTextareaFrame key={l} code={l === 'es' ? 'ES' : 'EN'} htmlFor={`${uid}-${l}`} srLabel={label} count={value[l].length}>
          <textarea
            id={`${uid}-${l}`}
            lang={l}
            value={value[l]}
            onChange={(e) => onChange({ ...value, [l]: e.target.value })}
            rows={rows}
            className="block w-full resize-y bg-transparent px-3 py-2.5 text-[14px] leading-relaxed text-text placeholder:text-placeholder focus:outline-none focus-visible:outline-none"
          />
        </LangTextareaFrame>
      ))}
    </BiField>
  )
}

const LINE_SEP = { lines: '\n', paragraphs: '\n\n' } as const

function parseLines(text: string, mode: keyof typeof LINE_SEP) {
  const parts = mode === 'lines' ? text.split('\n') : text.split(/\n\s*\n/)
  return parts.map((s) => s.replace(/\s*\n\s*/g, ' ').trim()).filter(Boolean)
}

/**
 * Lista de textos en los dos idiomas, escrita como texto normal: un elemento
 * por línea (logros, puntos) o por párrafo (historia). El texto se guarda
 * tal cual se escribe mientras tiene el foco, así una línea nueva vacía no
 * desaparece al pulsar Enter.
 */
export function BiLines({
  label,
  value,
  onChange,
  hint,
  rows = 5,
  mode = 'lines',
}: {
  label: string
  value: BiList
  onChange: (v: BiList) => void
  hint?: string
  rows?: number
  mode?: keyof typeof LINE_SEP
}) {
  const uid = useId()
  return (
    <BiField label={label} hint={hint}>
      {(['es', 'en'] as const).map((l) => (
        <LinesArea
          key={l}
          id={`${uid}-${l}`}
          lang={l}
          label={label}
          value={value[l]}
          mode={mode}
          rows={rows}
          onChange={(items) => onChange({ ...value, [l]: items })}
        />
      ))}
    </BiField>
  )
}

function LinesArea({
  id,
  lang,
  label,
  value,
  mode,
  rows,
  onChange,
}: {
  id: string
  lang: 'es' | 'en'
  label: string
  value: string[]
  mode: keyof typeof LINE_SEP
  rows: number
  onChange: (items: string[]) => void
}) {
  const [text, setText] = useState(() => value.join(LINE_SEP[mode]))
  // Si la lista cambia desde fuera (Descartar), el texto la sigue.
  useEffect(() => {
    if (JSON.stringify(parseLines(text, mode)) !== JSON.stringify(value)) setText(value.join(LINE_SEP[mode]))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])
  const count = parseLines(text, mode).length
  return (
    <LangTextareaFrame code={lang === 'es' ? 'ES' : 'EN'} htmlFor={id} srLabel={label} count={count}>
      <textarea
        id={id}
        lang={lang}
        value={text}
        onChange={(e) => {
          setText(e.target.value)
          onChange(parseLines(e.target.value, mode))
        }}
        rows={rows}
        className="block w-full resize-y bg-transparent px-3 py-2.5 text-[14px] leading-relaxed text-text placeholder:text-placeholder focus:outline-none focus-visible:outline-none"
      />
    </LangTextareaFrame>
  )
}

/* ───────────────────────── Listas ───────────────────────── */

const iconBtn =
  'grid size-8 place-items-center rounded-[var(--radius-sm)] text-text-3 transition-colors duration-150 ' +
  'hover:bg-surface-2 hover:text-text disabled:pointer-events-none disabled:opacity-35'

/**
 * Lista editable: cada elemento es una tarjeta con su título, botones para
 * ordenar y eliminar, y sus campos. Con `collapsible`, las tarjetas se
 * pliegan (para listas largas como los puestos) y la nueva llega abierta.
 */
export function ListEditor<T>({
  items,
  onChange,
  blank,
  itemTitle,
  itemMeta,
  addLabel,
  emptyLabel,
  orderable = true,
  collapsible = false,
  addAtStart = false,
  children,
}: {
  items: T[]
  onChange: (items: T[]) => void
  blank: () => T
  itemTitle: (item: T, i: number) => string
  itemMeta?: (item: T, i: number) => string
  addLabel: string
  emptyLabel: string
  orderable?: boolean
  collapsible?: boolean
  addAtStart?: boolean
  children: (item: T, update: (patch: Partial<T>) => void, i: number) => ReactNode
}) {
  const { pick } = useLang()
  const uid = useId()
  // Claves estables mientras se reordena: un id por elemento, no su índice.
  const keys = useRef<string[]>([])
  const seq = useRef(0)
  while (keys.current.length < items.length) keys.current.push(`${uid}-${seq.current++}`)
  if (keys.current.length > items.length) keys.current.length = items.length
  const [open, setOpen] = useState<Set<string>>(() => new Set())

  function move(i: number, d: -1 | 1) {
    const j = i + d
    if (j < 0 || j >= items.length) return
    const next = [...items]
    ;[next[i], next[j]] = [next[j], next[i]]
    const k = keys.current
    ;[k[i], k[j]] = [k[j], k[i]]
    onChange(next)
  }

  function remove(i: number) {
    const name = itemTitle(items[i], i) || pick(copy.untitled)
    if (!window.confirm(pick(copy.confirmRemove).replace('{t}', name))) return
    keys.current.splice(i, 1)
    onChange(items.filter((_, j) => j !== i))
  }

  function add() {
    const key = `${uid}-${seq.current++}`
    if (addAtStart) {
      keys.current.unshift(key)
      onChange([blank(), ...items])
    } else {
      keys.current.push(key)
      onChange([...items, blank()])
    }
    setOpen((s) => new Set(s).add(key))
    // El primer campo del elemento nuevo recibe el foco.
    requestAnimationFrame(() => document.querySelector<HTMLElement>(`[data-item="${key}"] input, [data-item="${key}"] textarea`)?.focus())
  }

  const addButton = (
    <Button type="button" variant="secondary" size="sm" onClick={add}>
      <Plus {...ic} size={14} />
      {addLabel}
    </Button>
  )

  return (
    <div className="space-y-3">
      {addAtStart && addButton}
      {items.length === 0 ? (
        <p className="rounded-[var(--radius-md)] border border-dashed border-line-strong px-4 py-6 text-center text-[13px] text-text-3">
          {emptyLabel}
        </p>
      ) : (
        <ol className="space-y-3">
          {items.map((item, i) => {
            const key = keys.current[i]
            const isOpen = !collapsible || open.has(key)
            const title = itemTitle(item, i) || pick(copy.untitled)
            const meta = itemMeta?.(item, i)
            const update = (patch: Partial<T>) => {
              const next = [...items]
              next[i] = { ...item, ...patch }
              onChange(next)
            }
            return (
              <li key={key} data-item={key} className="rounded-[var(--radius-md)] border border-line bg-bg-raised">
                <div className="flex items-center gap-2 py-2 pr-2 pl-4">
                  <span className="font-mono text-[12px] text-text-3 tnum">{String(i + 1).padStart(2, '0')}</span>
                  {collapsible ? (
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={`${key}-body`}
                      onClick={() =>
                        setOpen((s) => {
                          const n = new Set(s)
                          if (n.has(key)) n.delete(key)
                          else n.add(key)
                          return n
                        })
                      }
                      className="flex min-w-0 flex-1 items-center gap-2 rounded-[4px] py-1 text-left"
                    >
                      <ChevronDown
                        {...ic}
                        size={15}
                        className={cn('shrink-0 text-text-3 transition-transform duration-200 ease-[var(--ease-out)]', !isOpen && '-rotate-90')}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[14px] font-medium text-text">{title}</span>
                        {meta && <span className="block truncate text-[12px] text-text-3">{meta}</span>}
                      </span>
                    </button>
                  ) : (
                    <span className="min-w-0 flex-1 py-1">
                      <span className="block truncate text-[14px] font-medium text-text">{title}</span>
                      {meta && <span className="block truncate text-[12px] text-text-3">{meta}</span>}
                    </span>
                  )}
                  <div className="flex shrink-0 items-center">
                    {orderable && (
                      <>
                        <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`${pick(copy.moveUp)}: ${title}`} title={pick(copy.moveUp)} className={iconBtn}>
                          <ArrowUp {...ic} size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => move(i, 1)}
                          disabled={i === items.length - 1}
                          aria-label={`${pick(copy.moveDown)}: ${title}`}
                          title={pick(copy.moveDown)}
                          className={iconBtn}
                        >
                          <ArrowDown {...ic} size={15} />
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={() => remove(i)}
                      aria-label={`${pick(copy.remove)}: ${title}`}
                      title={pick(copy.remove)}
                      className={cn(iconBtn, 'hover:bg-danger/10 hover:text-danger')}
                    >
                      <Trash2 {...ic} size={15} />
                    </button>
                  </div>
                </div>
                {isOpen && (
                  <div id={`${key}-body`} className="space-y-5 border-t border-line px-4 pt-4 pb-5">
                    {children(item, update, i)}
                  </div>
                )}
              </li>
            )
          })}
        </ol>
      )}
      {!addAtStart && addButton}
    </div>
  )
}
