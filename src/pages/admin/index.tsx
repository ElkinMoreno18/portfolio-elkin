import { useId, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { ArrowLeft, Check, CircleAlert, LoaderCircle } from 'lucide-react'
import { useLang } from '@/i18n'
import { useAuth } from '@/hooks/useAuth'
import { isSupabaseConfigured } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { AdminField, adminInput } from '@/components/admin/Field'
import { Button, ButtonLink } from '@/site/ui'
import { AdminTopBar, Dashboard } from './Dashboard'

const copy = {
  backToSite: { es: 'Volver al sitio', en: 'Back to site' },
  loading: { es: 'Cargando…', en: 'Loading…' },
  loginTitle: { es: 'Acceso al panel', en: 'Dashboard access' },
  loginLead: {
    es: 'Sólo para Elkin. Entra con el email y la contraseña de tu usuario de Supabase.',
    en: 'Elkin only. Sign in with the email and password of your Supabase user.',
  },
  email: { es: 'Email', en: 'Email' },
  password: { es: 'Contraseña', en: 'Password' },
  login: { es: 'Entrar', en: 'Sign in' },
  loggingIn: { es: 'Entrando…', en: 'Signing in…' },
  loginError: {
    es: 'Email o contraseña incorrectos. Revísalos e inténtalo de nuevo.',
    en: 'Wrong email or password. Check them and try again.',
  },
  session: {
    es: 'La sesión se guarda en este navegador. Si el equipo es compartido, pulsa Salir al terminar.',
    en: 'The session is kept in this browser. On a shared computer, sign out when you finish.',
  },
  notConfigured: { es: 'Supabase no está configurado.', en: 'Supabase is not configured.' },
  notConfiguredLead: {
    es: 'El panel necesita tu proyecto de Supabase para editar proyectos y leer los mensajes del formulario. Mientras tanto, el sitio público funciona con los proyectos de ejemplo.',
    en: 'The dashboard needs your Supabase project to edit projects and read contact form messages. Until then, the public site runs on the sample projects.',
  },
  set: { es: 'Definida', en: 'Set' },
  missing: { es: 'Falta', en: 'Missing' },
  steps: { es: 'Cómo conectarlo', en: 'How to connect it' },
  readme: {
    es: 'El paso a paso completo, con el esquema SQL de las tablas, está en README.md.',
    en: 'The full walkthrough, including the SQL schema for the tables, is in README.md.',
  },
}

const ic = { size: 16, strokeWidth: 1.5, 'aria-hidden': true } as const

function Code({ children }: { children: ReactNode }) {
  return (
    <code className="rounded-[4px] border border-line bg-surface px-1.5 py-px font-mono text-[12.5px] whitespace-nowrap text-text">
      {children}
    </code>
  )
}

function BackToSite() {
  const { pick } = useLang()
  return (
    <ButtonLink to="/" variant="ghost" size="sm" className="px-2 sm:px-3">
      <ArrowLeft {...ic} size={14} />
      <span className="sr-only sm:not-sr-only">{pick(copy.backToSite)}</span>
    </ButtonLink>
  )
}

/** Pantallas sin sesión: la misma barra del panel y una columna estrecha centrada. */
function Shell({ children, width = 'max-w-[26rem]' }: { children: ReactNode; width?: string }) {
  return (
    <div className="flex min-h-svh flex-col bg-bg">
      <AdminTopBar actions={<BackToSite />} />
      <div className="flex flex-1 items-start justify-center px-5 pt-[clamp(3rem,14vh,8rem)] pb-16 sm:px-8">
        <div className={cn('w-full', width)}>{children}</div>
      </div>
    </div>
  )
}

function Login() {
  const { pick } = useLang()
  const { signIn } = useAuth()
  const uid = useId()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    setBusy(true)
    setError(null)
    try {
      await signIn(String(data.get('email')), String(data.get('password')))
    } catch {
      setError(pick(copy.loginError))
    } finally {
      setBusy(false)
    }
  }

  const errId = `${uid}-error`

  return (
    <Shell>
      <h1 className="text-[28px] leading-[1.1] tracking-[-0.03em]">{pick(copy.loginTitle)}</h1>
      <p className="mt-2.5 text-[15px] leading-relaxed text-text-2">{pick(copy.loginLead)}</p>

      <form onSubmit={submit} className="mt-8 space-y-4" aria-describedby={error ? errId : undefined}>
        <AdminField label={pick(copy.email)} htmlFor={`${uid}-email`}>
          <input
            id={`${uid}-email`}
            name="email"
            type="email"
            required
            autoComplete="username"
            spellCheck={false}
            aria-invalid={error ? true : undefined}
            className={adminInput}
          />
        </AdminField>
        <AdminField label={pick(copy.password)} htmlFor={`${uid}-password`}>
          <input
            id={`${uid}-password`}
            name="password"
            type="password"
            required
            autoComplete="current-password"
            aria-invalid={error ? true : undefined}
            className={adminInput}
          />
        </AdminField>

        {error && (
          <p id={errId} role="alert" className="flex items-start gap-2 text-[13px] leading-snug text-danger">
            <CircleAlert {...ic} className="mt-px shrink-0" />
            {error}
          </p>
        )}

        <Button type="submit" disabled={busy} aria-busy={busy} className="mt-2 w-full">
          {busy && <LoaderCircle {...ic} className="animate-spin" />}
          {pick(busy ? copy.loggingIn : copy.login)}
        </Button>
        <p className="text-[12px] leading-snug text-text-3">{pick(copy.session)}</p>
      </form>
    </Shell>
  )
}

function NotConfigured() {
  const { lang, pick } = useLang()
  // Sólo se dice si cada variable existe; su valor nunca se muestra.
  const vars = [
    { name: 'VITE_SUPABASE_URL', ok: Boolean(import.meta.env.VITE_SUPABASE_URL?.trim()) },
    { name: 'VITE_SUPABASE_ANON_KEY', ok: Boolean(import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()) },
  ]

  const steps: Record<'es' | 'en', ReactNode[]> = {
    es: [
      <>
        Copia <Code>.env.example</Code> a <Code>.env</Code> en la raíz del proyecto.
      </>,
      <>Rellena las dos variables con la URL y la clave anon de tu proyecto de Supabase.</>,
      <>
        Reinicia el servidor de desarrollo (<Code>npm run dev</Code>) para que Vite lea el archivo.
      </>,
    ],
    en: [
      <>
        Copy <Code>.env.example</Code> to <Code>.env</Code> at the project root.
      </>,
      <>Fill in both variables with the URL and the anon key of your Supabase project.</>,
      <>
        Restart the dev server (<Code>npm run dev</Code>) so Vite reads the file.
      </>,
    ],
  }

  return (
    <Shell width="max-w-[36rem]">
      <h1 className="text-[28px] leading-[1.1] tracking-[-0.03em]">{pick(copy.notConfigured)}</h1>
      <p className="mt-3 text-[15px] leading-relaxed text-text-2">{pick(copy.notConfiguredLead)}</p>

      {/* Lectura real del entorno: qué variable falta. */}
      <div className="mt-8 overflow-hidden rounded-[var(--radius-md)] border border-line bg-bg-raised">
        <div className="flex h-9 items-center border-b border-line px-4 font-mono text-[12px] text-text-3">.env</div>
        <ul className="divide-y divide-line">
          {vars.map((v) => (
            <li key={v.name} className="flex items-center justify-between gap-4 px-4 py-3">
              <span className="min-w-0 truncate font-mono text-[13px] text-text">
                {v.name}
                <span className="text-text-3">=</span>
              </span>
              {v.ok ? (
                <span className="inline-flex shrink-0 items-center gap-1.5 text-[13px] text-text-2">
                  <Check {...ic} size={14} />
                  {pick(copy.set)}
                </span>
              ) : (
                <span className="inline-flex shrink-0 items-center gap-2 text-[13px] text-text-3">
                  <span aria-hidden className="size-1.5 rounded-full border border-text-3" />
                  {pick(copy.missing)}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>

      <h2 className="mt-10 text-[15px] tracking-[-0.015em]">{pick(copy.steps)}</h2>
      <ol className="mt-4 space-y-3.5">
        {steps[lang].map((step, i) => (
          <li key={i} className="grid grid-cols-[1.5rem_minmax(0,1fr)] gap-3 text-[14px] leading-relaxed text-text-2">
            <span className="grid size-6 place-items-center rounded-full border border-line font-mono text-[12px] leading-none text-text-3 tnum">
              {i + 1}
            </span>
            <span className="pt-px">{step}</span>
          </li>
        ))}
      </ol>
      <p className="mt-6 border-t border-line pt-5 text-[13px] leading-relaxed text-text-3">{pick(copy.readme)}</p>
    </Shell>
  )
}

export default function Admin() {
  const { session, loading } = useAuth()
  const { pick } = useLang()

  if (!isSupabaseConfigured) return <NotConfigured />

  if (loading) {
    return (
      <Shell>
        <p role="status" className="flex items-center justify-center gap-2 text-[14px] text-text-3">
          <LoaderCircle {...ic} className="animate-spin" />
          {pick(copy.loading)}
        </p>
      </Shell>
    )
  }

  return session ? <Dashboard /> : <Login />
}
