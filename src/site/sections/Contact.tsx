import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent, FormEvent, KeyboardEvent, ReactNode, SVGProps } from 'react'
import { useLang } from '@/i18n'
import { profile } from '@/data/profile'
import { sendContactMessage } from '@/lib/projectsApi'
import type { Lang } from '@/lib/types'
import { cn } from '@/lib/utils'
import { gsap, useGSAP, reveal, revealOnFocus, alreadyPast, whenIdle, EASE_OUT } from '../motion'
import { siteCopy } from '../copy'
import { Button, ButtonLink, Container, SectionHeader } from '../ui'
import { IconArrowRight, IconArrowUpRight, IconCheck, IconCopy, IconDownload, IconMail } from '../icons'
import './contact.css'

/* ─────────────────────────── Textos ─────────────────────────── */
const c = {
  title: {
    es: 'Cuéntame qué sigue haciendo tu equipo a mano.',
    en: 'Tell me what your team still does by hand.',
  },
  next: {
    es: 'Te respondo yo mismo por email y, si encaja, lo hablamos en una llamada.',
    en: 'I reply personally by email, and if it’s a fit we take it to a call.',
  },
  directTitle: { es: 'Contacto directo', en: 'Direct contact' },
  emailLabel: { es: 'Email', en: 'Email' },
  copy: { es: 'Copiar', en: 'Copy' },
  copied: { es: 'Copiado', en: 'Copied' },
  copyAria: { es: 'Copiar email', en: 'Copy email' },
  copiedLive: { es: 'Email copiado al portapapeles.', en: 'Email copied to clipboard.' },
  copyFailedLive: {
    es: 'No se pudo copiar. El email ha quedado seleccionado para copiarlo a mano.',
    en: 'Couldn’t copy. The email is selected so you can copy it yourself.',
  },
  newTab: { es: '(se abre en una pestaña nueva)', en: '(opens in a new tab)' },
  cvLabel: { es: 'CV', en: 'CV' },
  cvAction: { es: 'Descargar CV', en: 'Download CV' },

  formTitle: { es: 'Nuevo mensaje', en: 'New message' },
  chip: {
    draft: { es: 'Borrador', en: 'Draft' },
    sending: { es: 'Enviando', en: 'Sending' },
    sent: { es: 'Enviado', en: 'Sent' },
    error: { es: 'Sin enviar', en: 'Not sent' },
    handoff: { es: 'En tu correo', en: 'In your email' },
  },
  name: { es: 'Nombre', en: 'Name' },
  email: { es: 'Email', en: 'Email' },
  emailPh: { es: 'nombre@empresa.com', en: 'name@company.com' },
  subject: { es: 'Asunto', en: 'Subject' },
  optional: { es: 'opcional', en: 'optional' },
  message: { es: 'Mensaje', en: 'Message' },
  messagePh: {
    es: 'El proceso que queréis automatizar o el puesto que buscáis cubrir.',
    en: 'The process you want to automate, or the role you’re hiring for.',
  },
  limit: { es: 'Máximo 5000 caracteres.', en: 'Up to 5,000 characters.' },
  send: { es: 'Enviar mensaje', en: 'Send message' },
  sending: { es: 'Enviando…', en: 'Sending…' },

  err: {
    name: { es: 'Escribe tu nombre.', en: 'Enter your name.' },
    emailEmpty: { es: 'Escribe tu email para que pueda responderte.', en: 'Enter your email so I can reply.' },
    emailInvalid: {
      es: 'Este email no parece completo. Debe tener la forma nombre@empresa.com.',
      en: 'This email looks incomplete. It should look like name@company.com.',
    },
    message: { es: 'Escribe el mensaje antes de enviarlo.', en: 'Write your message before sending it.' },
  },

  sentTitle: { es: 'Mensaje enviado', en: 'Message sent' },
  sentBody: {
    es: (name: string) => `Gracias, ${name}. Te respondo a`,
    en: (name: string) => `Thanks, ${name}. I’ll reply to`,
  },
  sentAt: { es: 'Enviado a las', en: 'Sent at' },
  another: { es: 'Escribir otro mensaje', en: 'Write another message' },

  errorTitle: { es: 'El mensaje no se ha podido enviar.', en: 'Your message couldn’t be sent.' },
  errorBody: {
    es: 'Lo que has escrito sigue aquí. Vuelve a intentarlo o envíalo desde tu correo a',
    en: 'What you wrote is still here. Try again, or send it from your email to',
  },
  openMail: { es: 'Abrir en mi correo', en: 'Open in my email' },
  handoffTitle: {
    es: 'Tu aplicación de correo debería abrirse con el mensaje ya escrito.',
    en: 'Your email app should open with the message ready to send.',
  },
  handoffBody: { es: 'Si no aparece, escríbeme a', en: 'If it doesn’t, write to me at' },
  mailSubject: {
    es: (name: string) => `Contacto desde el portafolio: ${name}`,
    en: (name: string) => `Contact from the portfolio: ${name}`,
  },
} as const

/* Mismos límites que los CHECK de contact_messages (supabase/schema.sql). */
const LIMIT = { name: 120, email: 200, subject: 200, message: 5000 } as const
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const LINKEDIN = profile.socials.find((s) => s.icon === 'linkedin')!
const LINKEDIN_HANDLE = LINKEDIN.href.replace(/^https?:\/\/(www\.)?linkedin\.com\//, '').replace(/\/$/, '')

/* Icono local (misma rejilla 16 y trazo 1.5 que icons.tsx). */
function IconAlert({ size = 16, ...rest }: SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      <circle cx="8" cy="8" r="5.75" />
      <path d="M8 5.25v3.25M8 10.9v.1" />
    </svg>
  )
}

function Spinner() {
  return (
    <svg width={16} height={16} viewBox="0 0 16 16" fill="none" aria-hidden="true" className="ct-spinner">
      <circle cx="8" cy="8" r="5.75" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1.5" />
      <path d="M13.75 8A5.75 5.75 0 0 0 8 2.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

/* ─────────────────────────── Utilidades ─────────────────────────── */
type Payload = { name: string; email: string; subject: string; body: string }

function mailtoFor(p: Payload | null, lang: Lang) {
  if (!p) return `mailto:${profile.email}`
  const subject = p.subject || c.mailSubject[lang](p.name)
  const body = `${p.body}\n\n${p.name}\n${p.email}`
  return `mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    /* sin permiso o sin contexto seguro: se intenta a la antigua */
  }
  try {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.setAttribute('readonly', '')
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    ta.remove()
    return ok
  } catch {
    return false
  }
}

/** Tamaño real del CV, leído de la cabecera del servidor (nada escrito a mano). */
function useFileSize(url: string) {
  const [bytes, setBytes] = useState<number | null>(null)
  useEffect(() => {
    let alive = true
    fetch(url, { method: 'HEAD' })
      .then((r) => {
        const n = Number(r.headers.get('content-length'))
        const isPdf = (r.headers.get('content-type') ?? '').includes('pdf')
        if (alive && r.ok && isPdf && n > 0) setBytes(n)
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [url])
  return bytes
}

function formatBytes(n: number, lang: Lang) {
  const loc = lang === 'es' ? 'es-ES' : 'en-GB'
  if (n < 1024 * 1024) return `${Math.max(1, Math.round(n / 1024))} KB`
  return `${new Intl.NumberFormat(loc, { maximumFractionDigits: 1 }).format(n / (1024 * 1024))} MB`
}

/* ─────────────────────────── Sección ─────────────────────────── */

/**
 * Contacto: el cierre de la página. A la izquierda, el camino directo
 * (email con copiar, LinkedIn, CV); a la derecha, el formulario dentro de
 * una ventana del mismo producto que la app de la portada.
 *
 * Movimiento propio: la ventana aparece plana (el giro 3D con scroll es del
 * portátil y de las capturas de proyectos; aquí se repetiría) y después se
 * rellena como una app que arranca: sus campos entran en cascada y el chip
 * de estado llega el último. Las filas directas entran desde la izquierda.
 * Con movimiento reducido todo está ya en su sitio.
 */
export function Contact() {
  const { pick } = useLang()
  const root = useRef<HTMLElement>(null)

  // El cierre de la página: se monta con el hilo principal libre, en dos
  // tandas independientes (cabecera y camino directo; después la ventana).
  // En cada una se lee todo (posiciones) antes de escribir nada.
  useGSAP((_, contextSafe) => {
    const cancels = [buildDirect, buildPanel].map((fn) =>
      whenIdle(contextSafe!(() => gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', fn))),
    )
    return () => cancels.forEach((cancel) => cancel())
  }, { scope: root })

  function buildDirect() {
    const q = gsap.utils.selector(root)
    const head = q('[data-ct-head]')[0]
    const direct = q('[data-ct-direct]')[0]
    const headPast = alreadyPast(head, 'top 85%')
    const directPast = alreadyPast(direct, 'top 85%')
    if (!headPast)
      reveal(head.querySelectorAll('h2, p'), { trigger: head, from: { y: 18, duration: 0.8 }, stagger: 0.08, start: 'top 85%', past: false })
    if (!directPast)
      reveal(q('[data-ct-row]'), {
        trigger: direct,
        from: { x: -12, y: 0, duration: 0.6 },
        stagger: 0.06,
        start: 'top 85%',
        past: false,
      })
  }

  function buildPanel() {
    const q = gsap.utils.selector(root)
    const panel = q('[data-ct-panel]')[0]
    const stage = q('[data-ct-stage]')[0]
    if (!panel || alreadyPast(stage, 'top 80%')) return
    const fields = panel.querySelectorAll('form > *:not(.ct-hp)')
    const chips = panel.querySelectorAll('.ct-chip')
    const tl = gsap.timeline({
      defaults: { ease: EASE_OUT },
      scrollTrigger: { trigger: stage, start: 'top 80%', once: true },
    })
    // Tab hasta el formulario antes de que aparezca: se completa ya.
    revealOnFocus(tl, stage)
    tl.from(panel, { opacity: 0, y: 24, duration: 0.7, clearProps: 'opacity,transform' })
    if (fields.length) tl.from(fields, { opacity: 0, y: 8, duration: 0.45, stagger: 0.05, clearProps: 'opacity,transform' }, 0.2)
    if (chips.length) tl.from(chips, { opacity: 0, x: 6, duration: 0.35, clearProps: 'opacity,transform' }, '-=0.15')
  }

  return (
    <section
      ref={root}
      id="contacto"
      aria-labelledby="contacto-title"
      className="border-t border-line pt-24 pb-28 md:pt-32 md:pb-40"
    >
      <Container size="wide">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-x-12 xl:gap-x-16">
          <div className="lg:col-span-5">
            <div data-ct-head>
              <SectionHeader id="contacto-title" title={pick(c.title)} lead={pick(c.next)} className="mb-0! md:mb-0!" />
            </div>
            <Direct />
          </div>

          <div data-ct-stage className="lg:col-span-7">
            <div data-ct-panel className="ct-panel">
              <MessageForm />
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}

/* ─────────────────────────── Camino directo ─────────────────────────── */
function Direct() {
  const { pick, lang } = useLang()
  const size = useFileSize(profile.cvUrl)

  return (
    <div data-ct-direct className="mt-10 md:mt-12">
      <h3 className="sr-only">{pick(c.directTitle)}</h3>

      <p data-ct-row className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[14px] text-text-2">
        <span aria-hidden="true" className="size-1.5 rounded-full bg-accent" />
        <span className="text-text">{pick(siteCopy.hero.availability)}</span>
        <span aria-hidden="true" className="hidden text-text-3 sm:inline">·</span>
        <span className="basis-full pl-4 sm:basis-auto sm:pl-0">{pick(siteCopy.hero.location)}</span>
        <span className="basis-full pl-4 text-text-3">{pick(siteCopy.hero.workMode)}</span>
      </p>

      <div data-ct-row className="mt-6 border-t border-line pt-6 pb-7">
        <p className="text-[14px] text-text-3">{pick(c.emailLabel)}</p>
        <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-3">
          <a
            id="ct-address"
            href={`mailto:${profile.email}`}
            className="text-[clamp(1.25rem,0.62rem+1.25vw,1.75rem)] leading-tight font-semibold tracking-[-0.025em] text-text underline decoration-transparent underline-offset-[0.2em] transition-[text-decoration-color] duration-200 hover:decoration-text-3"
          >
            {profile.email}
          </a>
          <CopyEmail targetId="ct-address" />
        </div>
      </div>

      <ul className="border-b border-line">
        <li data-ct-row>
          <a
            href={LINKEDIN.href}
            target="_blank"
            rel="noreferrer noopener"
            className="ct-row grid grid-cols-[5.5rem_minmax(0,1fr)_auto] items-center gap-4 border-t border-line py-4"
          >
            <span className="text-[14px] text-text-3">{LINKEDIN.label}</span>
            <span className="ct-row-value truncate text-[15px] text-text-2">
              {LINKEDIN_HANDLE}
              <span className="sr-only"> {pick(c.newTab)}</span>
            </span>
            <IconArrowUpRight className="ct-row-go text-text-3" />
          </a>
        </li>
        <li data-ct-row>
          <a
            href={profile.cvUrl}
            download
            type="application/pdf"
            data-kind="cv"
            className="ct-row grid grid-cols-[5.5rem_minmax(0,1fr)_auto] items-center gap-4 border-t border-line py-4"
          >
            <span className="text-[14px] text-text-3">{pick(c.cvLabel)}</span>
            <span className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-0.5">
              <span className="ct-row-value text-[15px] text-text-2">{pick(c.cvAction)}</span>
              <span className="tnum font-mono text-[12px] text-text-3">
                PDF{size ? ` · ${formatBytes(size, lang)}` : ''}
              </span>
            </span>
            <IconDownload className="ct-row-go text-text-3" />
          </a>
        </li>
      </ul>
    </div>
  )
}

/** Copiar el email. El texto y el icono se cruzan sin que el botón cambie de ancho. */
function CopyEmail({ targetId }: { targetId?: string }) {
  const { pick } = useLang()
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle')
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  async function copy() {
    const ok = await copyText(profile.email)
    if (!ok && targetId) {
      const el = document.getElementById(targetId)
      if (el) window.getSelection()?.selectAllChildren(el)
    }
    setState(ok ? 'copied' : 'failed')
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setState('idle'), ok ? 1800 : 4000)
  }

  const done = state === 'copied'
  return (
    <>
      <Button type="button" variant="secondary" size="sm" onClick={copy} aria-label={pick(c.copyAria)}>
        <span aria-hidden="true" className="ct-swap-stack">
          <IconCopy data-off={done || undefined} />
          <IconCheck data-off={!done || undefined} />
        </span>
        <span aria-hidden="true" className="ct-swap-stack is-text">
          <span data-off={done || undefined}>{pick(c.copy)}</span>
          <span data-off={!done || undefined}>{pick(c.copied)}</span>
        </span>
      </Button>
      <span role="status" className="sr-only">
        {state === 'copied' ? pick(c.copiedLive) : state === 'failed' ? pick(c.copyFailedLive) : ''}
      </span>
    </>
  )
}

/* ─────────────────────────── Formulario ─────────────────────────── */
type Status = 'draft' | 'sending' | 'sent' | 'error' | 'handoff'
type Values = Record<'name' | 'email' | 'subject' | 'message', string>
type Required = 'name' | 'email' | 'message'
type ErrKey = keyof typeof c.err

const EMPTY: Values = { name: '', email: '', subject: '', message: '' }
const STATUSES: Status[] = ['draft', 'sending', 'sent', 'error', 'handoff']

function validate(v: Values): Partial<Record<Required, ErrKey>> {
  const e: Partial<Record<Required, ErrKey>> = {}
  if (!v.name.trim()) e.name = 'name'
  const email = v.email.trim()
  if (!email) e.email = 'emailEmpty'
  else if (!EMAIL_RE.test(email)) e.email = 'emailInvalid'
  if (!v.message.trim()) e.message = 'message'
  return e
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

function MessageForm() {
  const { pick, lang } = useLang()
  const [values, setValues] = useState<Values>(EMPTY)
  const [status, setStatus] = useState<Status>('draft')
  const [tried, setTried] = useState(false)
  const [touched, setTouched] = useState<Partial<Record<Required, boolean>>>({})
  const [last, setLast] = useState<Payload | null>(null)
  const [sent, setSent] = useState<{ name: string; email: string; at: Date; h: number } | null>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const sentHeading = useRef<HTMLHeadingElement>(null)

  const errors = validate(values)
  const shown = (k: Required) => ((tried || touched[k]) && errors[k] ? pick(c.err[errors[k]!]) : undefined)

  useEffect(() => {
    if (status === 'sent') sentHeading.current?.focus()
  }, [status])

  const onChange = (k: keyof Values) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setValues((v) => ({ ...v, [k]: e.target.value }))

  // Al salir de un campo con algo escrito se valida el formato; los
  // obligatorios vacíos sólo se señalan al intentar enviar.
  const onBlur = (k: Required) => () => {
    if (values[k].trim()) setTouched((t) => ({ ...t, [k]: true }))
  }

  async function submit(e?: FormEvent) {
    e?.preventDefault()
    if (status === 'sending') return
    setTried(true)
    const errs = validate(values)
    const first = (['name', 'email', 'message'] as const).find((k) => errs[k])
    if (first) {
      document.getElementById(`ct-${first}`)?.focus()
      return
    }

    const payload: Payload = {
      name: values.name.trim(),
      email: values.email.trim(),
      subject: values.subject.trim(),
      body: values.message.trim(),
    }
    setLast(payload)
    const h = formRef.current?.offsetHeight ?? 0
    const trap = (formRef.current?.elements.namedItem('website') as HTMLInputElement | null)?.value
    const finish = () => {
      setSent({ name: payload.name, email: payload.email, at: new Date(), h })
      setStatus('sent')
      setValues(EMPTY)
      setTried(false)
      setTouched({})
    }
    if (trap) return finish() // un bot rellenó el campo oculto: no se envía nada

    setStatus('sending')
    try {
      // Un mínimo breve para que "Enviando" se lea en vez de parpadear.
      await Promise.all([sendContactMessage(payload), wait(450)])
      finish()
    } catch (err) {
      if (err instanceof Error && err.message === 'NO_BACKEND') {
        // Sin backend el mensaje no se pierde: pasa al correo del visitante ya escrito.
        window.location.href = mailtoFor(payload, lang)
        setStatus('handoff')
        return
      }
      setStatus('error')
    }
  }

  function again() {
    setSent(null)
    setStatus('draft')
    requestAnimationFrame(() => document.getElementById('ct-name')?.focus())
  }

  function onMessageKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) void submit()
  }

  const sending = status === 'sending'
  const count = values.message.length
  const fmt = (n: number) => new Intl.NumberFormat(lang === 'es' ? 'es-ES' : 'en-GB').format(n)
  const describe = (...ids: (string | false | undefined)[]) => ids.filter(Boolean).join(' ') || undefined

  return (
    <>
      <div className="ct-bar">
        <h3 id="ct-form-title" className="text-[15px] leading-none tracking-[-0.01em]">
          {pick(c.formTitle)}
        </h3>
        <span className="ct-chip" aria-hidden="true">
          {STATUSES.map((s) => (
            <span key={s} className={`ct-chip-${s}`} data-on={status === s || undefined}>
              {s === 'sending' && status === 'sending' && <span className="ct-pulse" />}
              {pick(c.chip[s])}
            </span>
          ))}
        </span>
      </div>

      {status === 'sent' && sent ? (
        <div className="ct-enter flex flex-col justify-center p-5 sm:p-8" style={{ minHeight: sent.h || undefined }}>
          <span className="grid size-10 place-items-center rounded-full border border-line-strong text-text">
            <IconCheck size={18} />
          </span>
          <h4 ref={sentHeading} tabIndex={-1} className="mt-5 text-[22px] tracking-[-0.02em] outline-none">
            {pick(c.sentTitle)}
          </h4>
          <p className="mt-2 max-w-[44ch] text-[16px] leading-relaxed text-text-2">
            {c.sentBody[lang](sent.name)} <span className="text-text">{sent.email}</span>.
          </p>
          <p className="tnum mt-4 font-mono text-[12px] text-text-3">
            {pick(c.sentAt)}{' '}
            {new Intl.DateTimeFormat(lang === 'es' ? 'es-ES' : 'en-GB', { hour: '2-digit', minute: '2-digit' }).format(sent.at)}
          </p>
          <div className="mt-8">
            <Button type="button" variant="secondary" onClick={again}>
              {pick(c.another)}
            </Button>
          </div>
        </div>
      ) : (
        <form ref={formRef} onSubmit={submit} noValidate aria-labelledby="ct-form-title" className="p-5 sm:p-7">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="ct-name" label={pick(c.name)} error={shown('name')}>
              <input
                id="ct-name"
                name="name"
                className="ct-input"
                autoComplete="name"
                required
                maxLength={LIMIT.name}
                value={values.name}
                onChange={onChange('name')}
                onBlur={onBlur('name')}
                aria-invalid={shown('name') ? true : undefined}
                aria-describedby={describe(shown('name') && 'ct-name-error')}
              />
            </Field>
            <Field id="ct-email" label={pick(c.email)} error={shown('email')}>
              <input
                id="ct-email"
                name="email"
                type="email"
                inputMode="email"
                className="ct-input"
                autoComplete="email"
                spellCheck={false}
                placeholder={pick(c.emailPh)}
                required
                maxLength={LIMIT.email}
                value={values.email}
                onChange={onChange('email')}
                onBlur={onBlur('email')}
                aria-invalid={shown('email') ? true : undefined}
                aria-describedby={describe(shown('email') && 'ct-email-error')}
              />
            </Field>
          </div>

          <div className="mt-5">
            <Field id="ct-subject" label={pick(c.subject)} optional={pick(c.optional)}>
              <input
                id="ct-subject"
                name="subject"
                className="ct-input"
                maxLength={LIMIT.subject}
                value={values.subject}
                onChange={onChange('subject')}
              />
            </Field>
          </div>

          <div className="mt-5">
            <Field
              id="ct-message"
              label={pick(c.message)}
              error={shown('message')}
              aside={
                <span
                  aria-hidden="true"
                  className={cn(
                    'tnum font-mono text-[12px] transition-colors duration-150',
                    count >= LIMIT.message ? 'ct-err' : count >= LIMIT.message * 0.9 ? 'text-text' : 'text-text-3',
                  )}
                >
                  {fmt(count)} / {fmt(LIMIT.message)}
                </span>
              }
            >
              <textarea
                id="ct-message"
                name="message"
                className="ct-input"
                rows={6}
                required
                maxLength={LIMIT.message}
                placeholder={pick(c.messagePh)}
                value={values.message}
                onChange={onChange('message')}
                onBlur={onBlur('message')}
                onKeyDown={onMessageKey}
                aria-invalid={shown('message') ? true : undefined}
                aria-describedby={describe(shown('message') && 'ct-message-error', 'ct-message-limit')}
              />
              <span id="ct-message-limit" className="sr-only">
                {pick(c.limit)}
              </span>
            </Field>
          </div>

          {/* Trampa para bots: invisible, fuera del orden de tabulación. */}
          <div className="ct-hp" aria-hidden="true">
            <label htmlFor="ct-website">Website</label>
            <input id="ct-website" name="website" tabIndex={-1} autoComplete="off" />
          </div>

          <div aria-live="polite">
            {status === 'error' && (
              <Notice icon={<IconAlert className="ct-err" />} title={pick(c.errorTitle)}>
                {pick(c.errorBody)}{' '}
                <a href={mailtoFor(last, lang)} className="text-text underline decoration-line-strong hover:decoration-text-3">
                  {profile.email}
                </a>
                .
                <div className="mt-3">
                  <ButtonLink href={mailtoFor(last, lang)} variant="secondary" size="sm">
                    <IconMail />
                    {pick(c.openMail)}
                  </ButtonLink>
                </div>
              </Notice>
            )}
            {status === 'handoff' && (
              <Notice icon={<IconMail className="text-text-2" />} title={pick(c.handoffTitle)}>
                {pick(c.handoffBody)}{' '}
                <a href={mailtoFor(last, lang)} className="text-text underline decoration-line-strong hover:decoration-text-3">
                  {profile.email}
                </a>
                .
              </Notice>
            )}
          </div>

          <div className="mt-6">
            <Button
              type="submit"
              size="lg"
              aria-disabled={sending || undefined}
              className={cn('w-full min-w-[12.5rem] sm:w-auto', sending && 'cursor-progress')}
            >
              {sending ? <Spinner /> : null}
              {pick(sending ? c.sending : c.send)}
              {!sending && (
                <IconArrowRight className="transition-transform duration-200 ease-[var(--ease-out)] group-hover:translate-x-0.5" />
              )}
            </Button>
          </div>
        </form>
      )}
    </>
  )
}

function Field({
  id,
  label,
  optional,
  error,
  aside,
  children,
}: {
  id: string
  label: string
  optional?: string
  error?: string
  aside?: ReactNode
  children: ReactNode
}) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-[14px] font-medium text-text">
          {label}
          {optional && <span className="font-normal text-text-3"> ({optional})</span>}
        </label>
        {aside}
      </div>
      {children}
      {error && (
        <p id={`${id}-error`} className="ct-err ct-enter mt-2 flex items-start gap-1.5 text-[14px] leading-snug">
          <IconAlert className="mt-[1px] shrink-0" />
          {error}
        </p>
      )}
    </div>
  )
}

function Notice({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className="ct-enter mt-6 flex gap-3 rounded-[var(--radius-md)] border border-line-strong bg-surface p-4">
      <span className="mt-[3px] shrink-0">{icon}</span>
      <div className="min-w-0 text-[14px] leading-relaxed">
        <p className="font-medium text-text">{title}</p>
        <div className="mt-1 text-text-2">{children}</div>
      </div>
    </div>
  )
}
