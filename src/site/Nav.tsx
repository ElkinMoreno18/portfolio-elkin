import { useEffect, useRef, useState, type ComponentPropsWithoutRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useLang } from '@/i18n'
import { useContent } from '@/content/store'
import { cvHref } from '@/content/derive'
import { cn } from '@/lib/utils'
import { siteCopy } from './copy'
import { Container, ButtonLink } from './ui'
import { IconClose, IconDownload, IconMenu } from './icons'
import { focusHeading } from './focus'
import { ThemeToggle } from './ThemeToggle'

const LINKS = [
  { id: 'proyectos', key: 'work' },
  { id: 'experiencia', key: 'experience' },
  { id: 'stack', key: 'stack' },
  { id: 'sobre-mi', key: 'about' },
  { id: 'contacto', key: 'contact' },
] as const

/** Marca: dos nodos unidos, el gesto de su trabajo. */
export function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn('size-6', className)} aria-hidden="true">
      <rect width="24" height="24" rx="6" fill="var(--text)" />
      <rect x="5" y="9.5" width="5" height="5" rx="1.2" fill="var(--bg)" />
      <rect x="14" y="9.5" width="5" height="5" rx="1.2" fill="var(--accent)" />
      <path d="M10 12h4" stroke="var(--bg)" strokeWidth="1.6" />
    </svg>
  )
}

const LANG_NAMES = { es: 'Español', en: 'English' } as const

/** Controles que reciben Tab dentro de `root`, en orden, sólo los que se ven. */
function focusables(root: HTMLElement) {
  return Array.from(
    root.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'),
  ).filter((el) => el.getClientRects().length > 0 && !el.closest('[inert]'))
}

function LangSwitch({ className }: { className?: string }) {
  const { lang, setLang, pick } = useLang()
  return (
    <div
      role="group"
      aria-label={pick(siteCopy.nav.langGroup)}
      className={cn('flex h-8 items-center rounded-[var(--radius-sm)] border border-line p-0.5 font-mono text-[12px]', className)}
    >
      {(['es', 'en'] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          aria-label={LANG_NAMES[l]}
          lang={l}
          className={cn(
            'h-full rounded-[4px] px-2 uppercase transition-colors duration-200',
            lang === l ? 'bg-surface-2 text-text' : 'text-text-3 hover:text-text-2',
          )}
        >
          {l}
        </button>
      ))}
    </div>
  )
}

/**
 * Enlace a una sección de la portada, siempre por el router (desde cualquier
 * página, sin recargar). Home coloca la sección y lleva el foco a su título.
 * Un ancla nativa no sirve: al saltar, el navegador devuelve el foco a
 * <body> después de que lo hayamos puesto en el título.
 */
function SectionLink({ id, ...rest }: { id: string } & Omit<ComponentPropsWithoutRef<'a'>, 'href'>) {
  return <Link to={`/#${id}`} {...rest} />
}

export function Nav() {
  const { pick } = useLang()
  const { profile } = useContent()
  const { pathname } = useLocation()
  const isHome = pathname === '/'
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState('')
  const [open, setOpen] = useState(false)
  const menuBtn = useRef<HTMLButtonElement>(null)
  const menu = useRef<HTMLDivElement>(null)
  /** Barra + menú: lo que forma el diálogo mientras está abierto. */
  const dialog = useRef<HTMLDivElement>(null)
  const wasOpen = useRef(false)
  /** Sección elegida en el menú: recibe el foco cuando el menú se cierra. */
  const pendingFocus = useRef<string | null>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Sección visible: franja de detección en el tercio superior, sin parpadeos.
  // Se lleva la cuenta de las que cruzan la franja; en la portada (ninguna)
  // no queda marcado el último enlace por el que se pasó.
  useEffect(() => {
    if (!isHome) return
    const inBand = new Set<string>()
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => (e.isIntersecting ? inBand.add(e.target.id) : inBand.delete(e.target.id)))
        setActive(LINKS.find(({ id }) => inBand.has(id))?.id ?? '')
      },
      { rootMargin: '-20% 0px -70% 0px' },
    )
    LINKS.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) io.observe(el)
    })
    return () => io.disconnect()
  }, [isHome])

  // Menú abierto = diálogo modal. Lo que se ve (la barra y el menú) es el
  // diálogo; lo de detrás queda inerte (ni foco ni lectura). El foco entra en
  // el primer enlace y Tab / Mayús+Tab dan la vuelta dentro sin salir.
  useEffect(() => {
    if (!open) {
      if (!wasOpen.current) return
      wasOpen.current = false
      document.body.style.overflow = ''
      const id = pendingFocus.current
      pendingFocus.current = null
      if (id) focusHeading(document.getElementById(id))
      // El control que tenía el foco desapareció con el menú (el CV, por
      // ejemplo): vuelve al botón que lo abrió en vez de caer en <body>.
      else if (!document.activeElement || document.activeElement === document.body) menuBtn.current?.focus()
      return
    }
    wasOpen.current = true
    document.body.style.overflow = 'hidden'
    const behind = [
      document.getElementById('main'),
      document.querySelector<HTMLElement>('[data-site-footer]'),
      document.querySelector<HTMLElement>('[data-skip-link]'),
    ]
    behind.forEach((el) => el && (el.inert = true))
    const raf = requestAnimationFrame(() => menu.current?.querySelector<HTMLElement>('a, button')?.focus())
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        setOpen(false)
        menuBtn.current?.focus()
        return
      }
      if (e.key !== 'Tab' || !dialog.current) return
      const items = focusables(dialog.current)
      if (!items.length) return
      const first = items[0]
      const last = items[items.length - 1]
      const at = document.activeElement
      const inside = at instanceof Node && dialog.current.contains(at)
      if (e.shiftKey && (at === first || !inside)) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && (at === last || !inside)) {
        e.preventDefault()
        first.focus()
      }
    }
    // Red de seguridad: si el foco acaba fuera por otra vía, el menú se cierra
    // en vez de quedarse abierto sobre una página que ya no se ve.
    const onFocusIn = (e: FocusEvent) => {
      const t = e.target as Node | null
      if (t && dialog.current?.contains(t)) return
      setOpen(false)
    }
    // Al pasar a escritorio el menú no existe (lg:hidden): se cierra.
    const wide = window.matchMedia('(min-width: 1024px)')
    const onWide = () => wide.matches && setOpen(false)
    window.addEventListener('keydown', onKey)
    document.addEventListener('focusin', onFocusIn)
    wide.addEventListener('change', onWide)
    return () => {
      cancelAnimationFrame(raf)
      behind.forEach((el) => el && (el.inert = false))
      window.removeEventListener('keydown', onKey)
      document.removeEventListener('focusin', onFocusIn)
      wide.removeEventListener('change', onWide)
    }
  }, [open])

  // Al desmontar (no pasa en el sitio, pero por si acaso) no queda la página bloqueada.
  useEffect(() => () => void (document.body.style.overflow = ''), [])

  useEffect(() => setOpen(false), [pathname])

  /** Elegir una sección con el menú abierto: se cierra y el foco va a su título
   *  (si la sección aún no existe, porque se viene de otra página, lo pone Home). */
  const pickSection = (id: string) => () => {
    if (!open) return
    pendingFocus.current = id
    setOpen(false)
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-40 border-b bg-bg transition-colors duration-300 no-print',
        scrolled ? 'border-line' : 'border-transparent',
      )}
    >
      {/* Con el menú abierto, la barra y el menú son un diálogo modal: es todo
          lo que se ve y lo único que se puede usar. */}
      <div
        ref={dialog}
        role={open ? 'dialog' : undefined}
        aria-modal={open ? true : undefined}
        aria-label={open ? pick(siteCopy.nav.menu) : undefined}
      >
        <Container size="wide" as="nav" className="flex h-15 items-center justify-between gap-6">
          <Link
            to="/"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 text-[15px] font-semibold tracking-[-0.01em]"
          >
            <Mark />
            <span>{profile.name}</span>
          </Link>

          <ul className="hidden items-center gap-1 lg:flex">
            {LINKS.map(({ id, key }) => (
              <li key={id}>
                <SectionLink
                  id={id}
                  aria-current={active === id && isHome ? 'true' : undefined}
                  className={cn(
                    'rounded-[var(--radius-sm)] px-3 py-1.5 text-[14px] transition-colors duration-200',
                    active === id && isHome ? 'text-text' : 'text-text-2 hover:text-text',
                  )}
                >
                  {pick(siteCopy.nav[key])}
                </SectionLink>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            {/* max-sm:hidden y no "hidden sm:flex": cn() no fusiona clases, y la
                base "flex" podía ganar a "hidden". La variante siempre va después. */}
            <LangSwitch className="max-sm:hidden" />
            <ThemeToggle />
            {/* En el móvil la portada ya enseña "Escríbeme" justo debajo: dos
                botones iguales en la primera pantalla sobran. Va dentro del menú. */}
            <ButtonLink to="/#contacto" size="sm" onClick={pickSection('contacto')} className="max-sm:hidden">
              {pick(siteCopy.nav.cta)}
            </ButtonLink>
            <button
              ref={menuBtn}
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={pick(open ? siteCopy.nav.close : siteCopy.nav.menu)}
              className="grid size-9 place-items-center rounded-[var(--radius-sm)] text-text-2 hover:bg-surface hover:text-text lg:hidden"
            >
              {open ? <IconClose size={18} /> : <IconMenu size={18} />}
            </button>
          </div>
        </Container>

        {open && (
          <div
            id="mobile-menu"
            ref={menu}
            className="fixed inset-x-0 top-15 bottom-0 z-40 overflow-y-auto border-t border-line bg-bg lg:hidden"
          >
            <Container className="py-6">
              <ul className="flex flex-col gap-1">
                {LINKS.map(({ id, key }) => (
                  <li key={id}>
                    <SectionLink
                      id={id}
                          onClick={pickSection(id)}
                      className="block border-b border-line py-4 text-[22px] font-medium tracking-[-0.02em]"
                    >
                      {pick(siteCopy.nav[key])}
                    </SectionLink>
                  </li>
                ))}
              </ul>
              {/* Desde sm, "Escríbeme" está en la cabecera, visible sobre el menú. */}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <ButtonLink to="/#contacto" onClick={pickSection('contacto')} className="sm:hidden">
                  {pick(siteCopy.nav.cta)}
                </ButtonLink>
                <ButtonLink href={cvHref(profile)} download variant="secondary" onClick={() => setOpen(false)}>
                  <IconDownload />
                  {pick(siteCopy.hero.ctaCv)}
                </ButtonLink>
                <LangSwitch />
              </div>
            </Container>
          </div>
        )}
      </div>
    </header>
  )
}
