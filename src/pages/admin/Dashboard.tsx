import { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import type { KeyboardEvent, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  CircleAlert,
  ImageOff,
  Inbox,
  LoaderCircle,
  LogOut,
  Mail,
  MailOpen,
  Pencil,
  Plus,
  Reply,
  RotateCw,
  Star,
  Trash2,
} from 'lucide-react'
import { useLang } from '@/i18n'
import { useAuth } from '@/hooks/useAuth'
import { deleteProject, fetchAllProjects, fetchMessages, setMessageRead } from '@/lib/projectsApi'
import { CATEGORIES, type ContactMessage, type Project } from '@/lib/types'
import { cn, formatDate } from '@/lib/utils'
import { Button, ButtonLink, Container } from '@/site/ui'
import { Mark } from '@/site/Nav'
import { ProjectForm } from './ProjectForm'

type Bi = { es: string; en: string }

const copy = {
  panel: { es: 'Panel', en: 'Dashboard' },
  home: { es: 'Elkin Moreno, ir al sitio', en: 'Elkin Moreno, go to site' },
  viewSite: { es: 'Ver sitio', en: 'View site' },
  signOut: { es: 'Salir', en: 'Sign out' },
  lang: { es: 'Idioma del panel', en: 'Dashboard language' },
  sections: { es: 'Secciones del panel', en: 'Dashboard sections' },
  projects: { es: 'Proyectos', en: 'Projects' },
  messages: { es: 'Mensajes', en: 'Messages' },
  projectsLead: {
    es: 'Lo que está publicado aquí es lo que enseña el portafolio. Los borradores no salen en el sitio.',
    en: 'What is published here is what the portfolio shows. Drafts stay off the site.',
  },
  messagesLead: {
    es: 'Lo que llega por el formulario de contacto, del más reciente al más antiguo.',
    en: 'What arrives through the contact form, newest first.',
  },
  newProject: { es: 'Nuevo proyecto', en: 'New project' },
  col: {
    order: { es: 'Orden', en: 'Order' },
    project: { es: 'Proyecto', en: 'Project' },
    category: { es: 'Categoría', en: 'Category' },
    year: { es: 'Año', en: 'Year' },
    status: { es: 'Estado', en: 'Status' },
  },
  published: { es: 'Publicado', en: 'Published' },
  draft: { es: 'Borrador', en: 'Draft' },
  featured: { es: 'Destacado', en: 'Featured' },
  noCover: { es: 'Sin portada', en: 'No cover' },
  edit: { es: 'Editar', en: 'Edit' },
  view: { es: 'Ver en el sitio', en: 'View on site' },
  remove: { es: 'Eliminar', en: 'Delete' },
  confirmDelete: {
    es: '¿Eliminar «{t}»? No se puede deshacer.',
    en: 'Delete "{t}"? This cannot be undone.',
  },
  saved: { es: 'Proyecto guardado', en: 'Project saved' },
  deleted: { es: 'Proyecto eliminado', en: 'Project deleted' },
  deleteFailed: { es: 'No se pudo eliminar', en: 'Could not delete' },
  readFailed: { es: 'No se pudo actualizar el mensaje', en: 'Could not update the message' },
  loadFailed: { es: 'No se pudieron cargar los datos.', en: 'The data could not be loaded.' },
  refreshFailed: { es: 'No se pudo actualizar la lista', en: 'Could not refresh the list' },
  retry: { es: 'Reintentar', en: 'Retry' },
  refreshing: { es: 'Actualizando…', en: 'Refreshing…' },
  loading: { es: 'Cargando…', en: 'Loading…' },
  noProjects: { es: 'Aún no hay proyectos.', en: 'No projects yet.' },
  noProjectsLead: {
    es: 'Crea el primero. Aparecerá en el portafolio en cuanto esté publicado.',
    en: 'Create the first one. It shows up on the portfolio once it is published.',
  },
  noMessages: { es: 'No hay mensajes todavía.', en: 'No messages yet.' },
  noMessagesLead: {
    es: 'Cuando alguien escriba desde el formulario de contacto, lo verás aquí.',
    en: 'When someone writes through the contact form, it shows up here.',
  },
  unreadSr: { es: 'sin leer', en: 'unread' },
  noSubject: { es: 'Sin asunto', en: 'No subject' },
  markRead: { es: 'Marcar como leído', en: 'Mark as read' },
  markUnread: { es: 'Marcar como no leído', en: 'Mark as unread' },
  reply: { es: 'Responder', en: 'Reply' },
  pickMessage: { es: 'Elige un mensaje para leerlo.', en: 'Pick a message to read it.' },
  allMessages: { es: 'Todos los mensajes', en: 'All messages' },
}

const count = {
  project: [{ es: 'proyecto', en: 'project' }, { es: 'proyectos', en: 'projects' }],
  published: [{ es: 'publicado', en: 'published' }, { es: 'publicados', en: 'published' }],
  draft: [{ es: 'borrador', en: 'draft' }, { es: 'borradores', en: 'drafts' }],
  featured: [{ es: 'destacado', en: 'featured' }, { es: 'destacados', en: 'featured' }],
  message: [{ es: 'mensaje', en: 'message' }, { es: 'mensajes', en: 'messages' }],
  unread: [{ es: 'sin leer', en: 'unread' }, { es: 'sin leer', en: 'unread' }],
} satisfies Record<string, [Bi, Bi]>

const ic = { size: 16, strokeWidth: 1.5, 'aria-hidden': true } as const

function errorText(err: unknown) {
  return err instanceof Error ? err.message : String(err)
}

function formatDateTime(iso: string, lang: 'es' | 'en') {
  return new Intl.DateTimeFormat(lang === 'es' ? 'es-ES' : 'en-GB', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(iso))
}

/* ───────────────────────── Cromo compartido del panel ───────────────────────── */

function Slash() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" className="shrink-0 text-line-strong">
      <path d="M10.5 2.5L5.5 13.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  )
}

export function AdminLangSwitch() {
  const { lang, setLang, pick } = useLang()
  return (
    <div
      role="group"
      aria-label={pick(copy.lang)}
      className="flex h-8 items-center rounded-[var(--radius-sm)] border border-line p-0.5 font-mono text-[12px]"
    >
      {(['es', 'en'] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          lang={l}
          className={cn(
            'h-full rounded-[4px] px-2 uppercase transition-colors duration-150',
            lang === l ? 'bg-surface-2 text-text' : 'text-text-3 hover:text-text-2',
          )}
        >
          {l}
        </button>
      ))}
    </div>
  )
}

/** Barra superior de todas las pantallas del panel. `children` = fila de pestañas. */
export function AdminTopBar({ actions, children }: { actions?: ReactNode; children?: ReactNode }) {
  const { pick } = useLang()
  return (
    <header className="border-b border-line bg-bg">
      <Container size="base" className="flex h-14 items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-1.5">
          <Link
            to="/"
            aria-label={pick(copy.home)}
            className="flex items-center gap-2.5 rounded-[var(--radius-sm)] text-[14px] font-semibold tracking-[-0.01em]"
          >
            <Mark />
            <span className="hidden sm:inline" aria-hidden>
              Elkin Moreno
            </span>
          </Link>
          <Slash />
          <span className="truncate text-[14px] font-medium text-text-2">{pick(copy.panel)}</span>
        </div>
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          {actions}
          <AdminLangSwitch />
        </div>
      </Container>
      {children}
    </header>
  )
}

/* ───────────────────────── Piezas de las vistas ───────────────────────── */

function PageHead({ title, lead, action }: { title: string; lead: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col gap-5 pt-10 pb-7 sm:flex-row sm:items-end sm:justify-between md:pt-12">
      <div className="max-w-[40rem]">
        <h1 className="text-[28px] leading-[1.1] tracking-[-0.03em]">{title}</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-text-2">{lead}</p>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

/** "9 proyectos: 9 publicados, 0 borradores, 3 destacados". Una frase: se parte bien en móvil. */
function Summary({ items }: { items: { n: number; forms: readonly [Bi, Bi] }[] }) {
  const { pick } = useLang()
  const part = ({ n, forms }: (typeof items)[number]) => (
    <>
      <span className="font-mono text-text-2 tnum">{n}</span> {pick(forms[n === 1 ? 0 : 1])}
    </>
  )
  const [head, ...rest] = items
  return (
    <p className="text-[13px] text-text-3">
      {part(head)}
      {rest.length > 0 && ': '}
      {rest.map((it, i) => (
        <Fragment key={i}>
          {i > 0 && ', '}
          {part(it)}
        </Fragment>
      ))}
    </p>
  )
}

type Notice = { tone: 'ok' | 'error'; text: string } | null

function StatusLine({ notice, busy }: { notice: Notice; busy: boolean }) {
  const { pick } = useLang()
  return (
    <p role="status" className="flex min-h-5 items-center gap-1.5 text-[13px]">
      {notice ? (
        notice.tone === 'ok' ? (
          <span className="inline-flex items-center gap-1.5 text-text-2">
            <Check {...ic} size={14} />
            {notice.text}
          </span>
        ) : (
          <span className="inline-flex items-start gap-1.5 text-danger">
            <CircleAlert {...ic} size={14} className="mt-0.5 shrink-0" />
            {notice.text}
          </span>
        )
      ) : busy ? (
        <span className="inline-flex items-center gap-1.5 text-text-3">
          <LoaderCircle {...ic} size={14} className="animate-spin" />
          {pick(copy.refreshing)}
        </span>
      ) : null}
    </p>
  )
}

function TabCount({ n }: { n: number }) {
  return <span className="inline-flex h-5 items-center font-mono text-[12px] leading-none text-text-3 tnum">{n}</span>
}

function Frame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('overflow-hidden rounded-[var(--radius-md)] border border-line bg-bg-raised', className)}>
      {children}
    </div>
  )
}

function EmptyState({
  icon,
  title,
  lead,
  action,
}: {
  icon: ReactNode
  title: string
  lead: string
  action?: ReactNode
}) {
  return (
    <Frame className="px-6 py-16 text-center">
      <div className="mx-auto grid size-10 place-items-center rounded-[var(--radius-sm)] border border-line text-text-3">
        {icon}
      </div>
      <p className="mt-4 text-[15px] font-medium text-text">{title}</p>
      <p className="mx-auto mt-1 max-w-[36ch] text-[14px] leading-relaxed text-text-3">{lead}</p>
      {action && <div className="mt-6">{action}</div>}
    </Frame>
  )
}

function LoadError({ message, onRetry }: { message: string | null; onRetry: () => void }) {
  const { pick } = useLang()
  return (
    <Frame className="px-6 py-14 text-center">
      <CircleAlert {...ic} size={20} className="mx-auto text-danger" />
      <p className="mt-3 text-[15px] font-medium text-text">{pick(copy.loadFailed)}</p>
      {message && (
        <p className="mx-auto mt-1.5 max-w-[60ch] font-mono text-[12px] break-words text-text-3">{message}</p>
      )}
      <Button variant="secondary" size="sm" className="mt-6" onClick={onRetry}>
        <RotateCw {...ic} size={14} />
        {pick(copy.retry)}
      </Button>
    </Frame>
  )
}

const iconBtn =
  'grid size-8 place-items-center rounded-[var(--radius-sm)] text-text-3 transition-colors duration-150 ' +
  'group-hover:text-text-2 hover:bg-surface-2 hover:text-text'

const COLS = 'md:grid-cols-[2.5rem_minmax(0,1fr)_9.5rem_3.5rem_7.5rem_6.5rem]'

function Thumb({ url, label }: { url: string | null; label: string }) {
  if (url)
    return (
      <img
        src={url}
        alt=""
        loading="lazy"
        className="hidden h-9 w-14 shrink-0 rounded-[4px] border border-line bg-surface object-cover object-top sm:block"
      />
    )
  return (
    <span
      title={label}
      className="hidden h-9 w-14 shrink-0 place-items-center rounded-[4px] border border-dashed border-line-strong text-text-3 sm:grid"
    >
      <ImageOff {...ic} size={14} />
      <span className="sr-only">{label}</span>
    </span>
  )
}

function PublishState({ published }: { published: boolean }) {
  const { pick } = useLang()
  return published ? (
    <span className="inline-flex items-center gap-2 text-[13px] text-text">
      <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-accent" />
      {pick(copy.published)}
    </span>
  ) : (
    <span className="inline-flex items-center gap-2 text-[13px] text-text-3">
      <span aria-hidden className="size-1.5 shrink-0 rounded-full border border-text-3" />
      {pick(copy.draft)}
    </span>
  )
}

/* ───────────────────────── Panel ───────────────────────── */

type Tab = 'projects' | 'messages'

export function Dashboard() {
  const { lang, pick, field } = useLang()
  const { signOut, user } = useAuth()
  const [tab, setTab] = useState<Tab>('projects')
  const [projects, setProjects] = useState<Project[]>([])
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [refreshing, setRefreshing] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [editing, setEditing] = useState<Project | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [notice, setNotice] = useState<Notice>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const trigger = useRef<HTMLElement | null>(null)
  const tabRefs = useRef<Record<Tab, HTMLButtonElement | null>>({ projects: null, messages: null })
  const detailHeading = useRef<HTMLHeadingElement>(null)

  const reload = useCallback(async () => {
    setRefreshing(true)
    try {
      const [p, m] = await Promise.all([fetchAllProjects(), fetchMessages()])
      setProjects(p)
      setMessages(m)
      setLoadError(null)
      setStatus('ready')
    } catch (err) {
      setLoadError(errorText(err))
      // Si ya había datos en pantalla se quedan; sólo se avisa del fallo.
      setStatus((s) => (s === 'ready' ? s : 'error'))
    } finally {
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  // Los avisos de éxito se retiran solos; los de error se quedan hasta la siguiente acción.
  useEffect(() => {
    if (notice?.tone !== 'ok') return
    const t = window.setTimeout(() => setNotice(null), 3200)
    return () => window.clearTimeout(t)
  }, [notice])

  // Al cerrar el formulario, el foco vuelve al botón que lo abrió.
  useEffect(() => {
    if (formOpen || !trigger.current) return
    trigger.current.focus({ preventScroll: true })
    trigger.current = null
  }, [formOpen])

  function openForm(project: Project | null) {
    trigger.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    setEditing(project)
    setNotice(null)
    setFormOpen(true)
  }

  async function remove(project: Project) {
    const name = field(project, 'title') || project.slug
    if (!window.confirm(pick(copy.confirmDelete).replace('{t}', name))) return
    try {
      await deleteProject(project.id)
      setNotice({ tone: 'ok', text: pick(copy.deleted) })
      void reload()
    } catch (err) {
      setNotice({ tone: 'error', text: `${pick(copy.deleteFailed)}: ${errorText(err)}` })
    }
  }

  async function toggleRead(message: ContactMessage) {
    try {
      await setMessageRead(message.id, !message.read)
      setMessages((prev) => prev.map((m) => (m.id === message.id ? { ...m, read: !m.read } : m)))
    } catch (err) {
      setNotice({ tone: 'error', text: `${pick(copy.readFailed)}: ${errorText(err)}` })
    }
  }

  function selectMessage(id: string) {
    setSelectedId(id)
    // En pantallas estrechas el detalle sustituye a la lista: el foco va a su título.
    if (window.matchMedia('(max-width: 1023.98px)').matches) {
      requestAnimationFrame(() => {
        detailHeading.current?.focus({ preventScroll: true })
        detailHeading.current?.closest('[data-inbox]')?.scrollIntoView({ block: 'start' })
      })
    }
  }

  function backToList() {
    const id = selectedId
    setSelectedId(null)
    requestAnimationFrame(() => document.getElementById(`msg-${id}`)?.focus())
  }

  const unread = messages.filter((m) => !m.read).length
  const published = projects.filter((p) => p.published).length
  const featured = projects.filter((p) => p.featured).length
  const selected = messages.find((m) => m.id === selectedId) ?? null
  const refreshNotice: Notice =
    notice ?? (status === 'ready' && loadError ? { tone: 'error', text: `${pick(copy.refreshFailed)}: ${loadError}` } : null)

  const tabs: { id: Tab; label: string; badge: ReactNode }[] = [
    {
      id: 'projects',
      label: pick(copy.projects),
      badge: status === 'ready' && <TabCount n={projects.length} />,
    },
    {
      id: 'messages',
      label: pick(copy.messages),
      badge:
        status === 'ready' &&
        (unread > 0 ? (
          <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 font-mono text-[12px] leading-none text-on-accent tnum">
            {unread}
            <span className="sr-only"> {pick(copy.unreadSr)}</span>
          </span>
        ) : (
          <TabCount n={messages.length} />
        )),
    },
  ]

  function onTabKey(e: KeyboardEvent<HTMLButtonElement>) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft' && e.key !== 'Home' && e.key !== 'End') return
    e.preventDefault()
    const order: Tab[] = ['projects', 'messages']
    const i = order.indexOf(tab)
    const next =
      e.key === 'Home' ? order[0] : e.key === 'End' ? order[order.length - 1] : order[(i + (e.key === 'ArrowRight' ? 1 : order.length - 1)) % order.length]
    setTab(next)
    tabRefs.current[next]?.focus()
  }

  const body = (() => {
    if (status === 'loading') return <SkeletonRows />
    if (status === 'error') return <LoadError message={loadError} onRetry={() => void reload()} />

    /* ── Proyectos ── */
    if (tab === 'projects') {
      if (projects.length === 0)
        return (
          <EmptyState
            icon={<Plus {...ic} />}
            title={pick(copy.noProjects)}
            lead={pick(copy.noProjectsLead)}
            action={
              <Button onClick={() => openForm(null)}>
                <Plus {...ic} />
                {pick(copy.newProject)}
              </Button>
            }
          />
        )

      return (
        <Frame>
          <div
            aria-hidden
            className={cn('hidden h-9 items-center gap-4 border-b border-line px-4 text-[12px] text-text-3 md:grid', COLS)}
          >
            <span>{pick(copy.col.order)}</span>
            <span>{pick(copy.col.project)}</span>
            <span>{pick(copy.col.category)}</span>
            <span>{pick(copy.col.year)}</span>
            <span>{pick(copy.col.status)}</span>
            <span />
          </div>
          <ul className="divide-y divide-line">
            {projects.map((p) => {
              const title = field(p, 'title') || p.slug
              const category = CATEGORIES.find((c) => c.value === p.category)?.[lang] ?? p.category
              return (
                <li
                  key={p.id}
                  className={cn(
                    'group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 px-4 py-3 transition-colors duration-150 hover:bg-surface md:gap-4',
                    COLS,
                  )}
                >
                  <span className="hidden font-mono text-[12px] text-text-3 tnum md:block">
                    {String(p.sort_order).padStart(2, '0')}
                  </span>

                  <div className="flex min-w-0 items-center gap-3">
                    <Thumb url={p.cover_url} label={pick(copy.noCover)} />
                    <div className="min-w-0">
                      <div className="flex min-w-0 items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openForm(p)}
                          className="line-clamp-2 min-w-0 rounded-[4px] text-left text-[14px] font-medium text-text decoration-text-3 underline-offset-[3px] hover:underline md:line-clamp-none md:truncate"
                        >
                          {title}
                        </button>
                        {p.featured && (
                          <span title={pick(copy.featured)} className="shrink-0 text-text-2">
                            <Star {...ic} size={13} className="fill-current" />
                            <span className="sr-only">{pick(copy.featured)}</span>
                          </span>
                        )}
                      </div>
                      <p className="truncate font-mono text-[12px] text-text-3">/{p.slug}</p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[12px] text-text-3 md:hidden">
                        <PublishState published={p.published} />
                        <span>{category}</span>
                        <span className="font-mono tnum">{p.year}</span>
                      </div>
                    </div>
                  </div>

                  <span className="hidden truncate text-[13px] text-text-2 md:block">{category}</span>
                  <span className="hidden font-mono text-[12px] text-text-2 tnum md:block">{p.year}</span>
                  <span className="hidden md:block">
                    <PublishState published={p.published} />
                  </span>

                  <div className="flex items-center justify-end gap-0.5">
                    <button type="button" onClick={() => openForm(p)} aria-label={`${pick(copy.edit)}: ${title}`} title={pick(copy.edit)} className={iconBtn}>
                      <Pencil {...ic} size={15} />
                    </button>
                    {p.published ? (
                      <a
                        href={`/proyecto/${p.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`${pick(copy.view)}: ${title}`}
                        title={pick(copy.view)}
                        className={cn(iconBtn, 'hidden sm:grid')}
                      >
                        <ArrowUpRight {...ic} />
                      </a>
                    ) : (
                      <span aria-hidden className="hidden size-8 sm:block" />
                    )}
                    <button
                      type="button"
                      onClick={() => void remove(p)}
                      aria-label={`${pick(copy.remove)}: ${title}`}
                      title={pick(copy.remove)}
                      className={cn(iconBtn, 'hover:bg-danger/10 hover:text-danger')}
                    >
                      <Trash2 {...ic} size={15} />
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        </Frame>
      )
    }

    /* ── Mensajes ── */
    if (messages.length === 0)
      return <EmptyState icon={<Inbox {...ic} />} title={pick(copy.noMessages)} lead={pick(copy.noMessagesLead)} />

    return (
      <Frame
        className={cn(
          'scroll-mt-4 lg:grid lg:grid-cols-[22rem_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)]',
          'lg:min-h-[26rem] lg:max-h-[min(44rem,calc(100svh-17rem))]',
        )}
      >
        <ul
          aria-label={pick(copy.messages)}
          className={cn('divide-y divide-line overflow-y-auto overscroll-contain lg:border-r lg:border-line', selected && 'hidden lg:block')}
        >
          {messages.map((m) => {
            const current = m.id === selectedId
            return (
              <li key={m.id}>
                <button
                  id={`msg-${m.id}`}
                  type="button"
                  onClick={() => selectMessage(m.id)}
                  aria-current={current || undefined}
                  className={cn(
                    'block w-full px-4 py-3.5 text-left transition-colors duration-150',
                    current ? 'bg-surface-2' : 'hover:bg-surface',
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span aria-hidden className={cn('size-1.5 shrink-0 rounded-full', m.read ? 'bg-transparent' : 'bg-accent')} />
                    <span className={cn('min-w-0 flex-1 truncate text-[14px]', m.read ? 'text-text-2' : 'font-medium text-text')}>
                      {m.name}
                      {!m.read && <span className="sr-only">, {pick(copy.unreadSr)}</span>}
                    </span>
                    <time dateTime={m.created_at} className="shrink-0 font-mono text-[12px] text-text-3 tnum">
                      {formatDate(m.created_at, lang)}
                    </time>
                  </span>
                  <span className={cn('mt-1 block truncate pl-3.5 text-[13px]', m.read ? 'text-text-3' : 'text-text-2')}>
                    {m.subject || pick(copy.noSubject)}
                  </span>
                  <span className="mt-0.5 block truncate pl-3.5 text-[13px] text-text-3">{m.body}</span>
                </button>
              </li>
            )
          })}
        </ul>

        <div data-inbox className={cn('min-w-0 overflow-y-auto', !selected && 'hidden lg:grid lg:place-items-center')}>
          {selected ? (
            <article aria-labelledby="msg-subject" className="px-5 py-6 sm:px-7">
              <button
                type="button"
                onClick={backToList}
                className="mb-5 inline-flex items-center gap-1.5 rounded-[4px] text-[13px] text-text-2 transition-colors hover:text-text lg:hidden"
              >
                <ArrowLeft {...ic} size={14} />
                {pick(copy.allMessages)}
              </button>
              <div className="flex flex-col gap-4 border-b border-line pb-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <h2
                    id="msg-subject"
                    ref={detailHeading}
                    tabIndex={-1}
                    className="text-[20px] leading-snug tracking-[-0.02em] focus:outline-none"
                  >
                    {selected.subject || pick(copy.noSubject)}
                  </h2>
                  <p className="mt-2 text-[14px] break-words">
                    <span className="font-medium text-text">{selected.name}</span>{' '}
                    <a
                      href={`mailto:${selected.email}`}
                      className="text-text-2 underline decoration-line-strong transition-colors hover:text-text hover:decoration-text-3"
                    >
                      {selected.email}
                    </a>
                  </p>
                  <p className="mt-1 font-mono text-[12px] text-text-3 tnum">
                    <time dateTime={selected.created_at}>{formatDateTime(selected.created_at, lang)}</time>
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => void toggleRead(selected)}>
                    {selected.read ? <Mail {...ic} size={14} /> : <MailOpen {...ic} size={14} />}
                    {pick(selected.read ? copy.markUnread : copy.markRead)}
                  </Button>
                  <ButtonLink href={`mailto:${selected.email}`} variant="secondary" size="sm">
                    <Reply {...ic} size={14} />
                    {pick(copy.reply)}
                  </ButtonLink>
                </div>
              </div>
              <p className="mt-5 max-w-[68ch] text-[15px] leading-relaxed whitespace-pre-wrap text-text-2">{selected.body}</p>
            </article>
          ) : (
            <p className="flex items-center gap-2 px-6 py-16 text-[14px] text-text-3">
              <Mail {...ic} />
              {pick(copy.pickMessage)}
            </p>
          )}
        </div>
      </Frame>
    )
  })()

  return (
    <div className="min-h-svh bg-bg">
      <div inert={formOpen}>
        <AdminTopBar
          actions={
            <>
              {user?.email && (
                <span className="mr-2 hidden max-w-[16rem] truncate font-mono text-[12px] text-text-3 md:inline">
                  {user.email}
                </span>
              )}
              <ButtonLink to="/" variant="ghost" size="sm" className="px-2 sm:px-3">
                <ArrowUpRight {...ic} size={14} />
                <span className="sr-only sm:not-sr-only">{pick(copy.viewSite)}</span>
              </ButtonLink>
              <Button variant="ghost" size="sm" onClick={() => void signOut()} className="px-2 sm:px-3">
                <LogOut {...ic} size={14} />
                <span className="sr-only sm:not-sr-only">{pick(copy.signOut)}</span>
              </Button>
            </>
          }
        >
          <Container size="base">
            <div role="tablist" aria-label={pick(copy.sections)} className="-mb-px flex gap-6">
              {tabs.map(({ id, label, badge }) => {
                const active = tab === id
                return (
                  <button
                    key={id}
                    ref={(el) => {
                      tabRefs.current[id] = el
                    }}
                    id={`admin-tab-${id}`}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    aria-controls={`admin-panel-${id}`}
                    tabIndex={active ? 0 : -1}
                    onClick={() => setTab(id)}
                    onKeyDown={onTabKey}
                    className={cn(
                      'flex h-11 items-center gap-2 border-b-2 text-[14px] transition-colors duration-150',
                      active ? 'border-text text-text' : 'border-transparent text-text-2 hover:text-text',
                    )}
                  >
                    {label}
                    {badge}
                  </button>
                )
              })}
            </div>
          </Container>
        </AdminTopBar>

        <Container size="base" className="pb-24">
          <div role="tabpanel" id={`admin-panel-${tab}`} aria-labelledby={`admin-tab-${tab}`}>
            {tab === 'projects' ? (
              <PageHead
                title={pick(copy.projects)}
                lead={pick(copy.projectsLead)}
                action={
                  status !== 'error' &&
                  !(status === 'ready' && projects.length === 0) && (
                    <Button onClick={() => openForm(null)}>
                      <Plus {...ic} />
                      {pick(copy.newProject)}
                    </Button>
                  )
                }
              />
            ) : (
              <PageHead title={pick(copy.messages)} lead={pick(copy.messagesLead)} />
            )}

            <div className="mb-3 flex min-h-6 flex-wrap items-center justify-between gap-x-6 gap-y-2">
              {status === 'ready' &&
                (tab === 'projects' ? (
                  projects.length > 0 && (
                  <Summary
                    items={[
                      { n: projects.length, forms: count.project },
                      { n: published, forms: count.published },
                      { n: projects.length - published, forms: count.draft },
                      { n: featured, forms: count.featured },
                    ]}
                  />
                  )
                ) : (
                  messages.length > 0 && (
                  <Summary
                    items={[
                      { n: messages.length, forms: count.message },
                      { n: unread, forms: count.unread },
                    ]}
                  />
                  )
                ))}
              <StatusLine notice={refreshNotice} busy={refreshing && status === 'ready'} />
            </div>

            {body}
          </div>
        </Container>
      </div>

      {formOpen && (
        <ProjectForm
          key={editing?.id ?? 'new'}
          project={editing}
          onClose={() => setFormOpen(false)}
          onSaved={() => {
            setFormOpen(false)
            setNotice({ tone: 'ok', text: pick(copy.saved) })
            void reload()
          }}
        />
      )}
    </div>
  )
}

function SkeletonRows() {
  const { pick } = useLang()
  return (
    <Frame>
      <p className="sr-only">{pick(copy.loading)}</p>
      <ul aria-hidden className="divide-y divide-line">
        {[0.62, 0.48, 0.7, 0.4, 0.55].map((w, i) => (
          <li key={i} className="flex items-center gap-3 px-4 py-3">
            <span className="h-9 w-14 shrink-0 animate-pulse rounded-[4px] bg-surface" />
            <span className="flex-1 space-y-2">
              <span className="block h-3 animate-pulse rounded-[3px] bg-surface" style={{ width: `${w * 60}%` }} />
              <span className="block h-2.5 w-24 animate-pulse rounded-[3px] bg-surface" />
            </span>
          </li>
        ))}
      </ul>
    </Frame>
  )
}
