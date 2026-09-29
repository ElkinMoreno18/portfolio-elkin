import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

/* ─────────────────────────── Contenedor ───────────────────────────
   Las secciones NO comparten un único ancho: el índice de proyectos va
   más ancho, la prosa más estrecha. `size` elige el ancho de cada una. */
const WIDTHS = { prose: 'max-w-[44rem]', base: 'max-w-[74rem]', wide: 'max-w-[84rem]' } as const

export function Container({
  size = 'base',
  className,
  children,
  as: Tag = 'div',
}: {
  size?: keyof typeof WIDTHS
  className?: string
  children: ReactNode
  as?: 'div' | 'section' | 'header' | 'footer' | 'nav'
}) {
  return <Tag className={cn('mx-auto w-full px-5 sm:px-8 lg:px-10', WIDTHS[size], className)}>{children}</Tag>
}

/* ─────────────────────────── Botones ───────────────────────────
   Primario: tinta clara sobre fondo oscuro (el acento se reserva para
   estados "vivo/automatizado", no para llamar la atención). */
type Variant = 'primary' | 'secondary' | 'ghost'
const base =
  'group inline-flex items-center justify-center gap-2 rounded-[var(--radius-sm)] font-medium whitespace-nowrap ' +
  'transition-[background-color,border-color,color,transform] duration-200 ease-[var(--ease-out)] ' +
  'active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 select-none'
const variants: Record<Variant, string> = {
  primary: 'bg-text text-bg hover:bg-white',
  secondary: 'border border-line-strong bg-surface text-text hover:border-text-3 hover:bg-surface-2',
  ghost: 'text-text-2 hover:text-text hover:bg-surface',
}
const sizes = { sm: 'h-8 px-3 text-[13px]', md: 'h-10 px-4 text-[14px]', lg: 'h-11 px-5 text-[15px]' } as const

type Common = { variant?: Variant; size?: keyof typeof sizes; className?: string; children: ReactNode }

export function Button({ variant = 'primary', size = 'md', className, children, ...rest }: Common & ComponentPropsWithoutRef<'button'>) {
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...rest}>
      {children}
    </button>
  )
}

export function ButtonLink({
  variant = 'primary',
  size = 'md',
  className,
  children,
  to,
  href,
  ...rest
}: Common & { to?: string; href?: string } & Omit<ComponentPropsWithoutRef<'a'>, 'href'>) {
  const cls = cn(base, variants[variant], sizes[size], className)
  // Los demás atributos (onClick, aria-*) llegan también al enlace del router.
  if (to) return <Link to={to} className={cls} {...rest}>{children}</Link>
  return <a href={href} className={cls} {...rest}>{children}</a>
}

/** Enlace de texto con subrayado fino que se ilumina al pasar. */
export function TextLink({ className, children, ...rest }: ComponentPropsWithoutRef<'a'>) {
  return (
    <a
      className={cn(
        'inline-flex items-center gap-1.5 text-[14px] font-medium text-text-2 underline decoration-line-strong',
        'transition-colors duration-200 hover:text-text hover:decoration-text-3',
        className,
      )}
      {...rest}
    >
      {children}
    </a>
  )
}

/* ─────────────────────────── Cabecera de sección ───────────────────────────
   Sin etiqueta encima del título (prohibido por Impeccable): el título
   habla solo. El `lead` es opcional y va debajo, más estrecho. */
export function SectionHeader({
  id,
  title,
  lead,
  aside,
  className,
}: {
  id?: string
  title: ReactNode
  lead?: ReactNode
  aside?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('mb-10 flex flex-col gap-6 md:mb-14 md:flex-row md:items-end md:justify-between', className)}>
      <div className="max-w-[40rem]">
        <h2 id={id} className="text-[clamp(1.9rem,1.2rem+2.2vw,2.75rem)] tracking-[-0.035em]">
          {title}
        </h2>
        {lead && <p className="mt-4 text-[17px] leading-relaxed text-text-2">{lead}</p>}
      </div>
      {aside}
    </div>
  )
}

/**
 * Etiqueta de tecnología. Siempre en sans: una fila de chips no cambia de
 * familia entre "WordPress" y "SEO técnico". El mono queda para los datos
 * (fechas, cifras, contadores).
 */
export function Tag({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex h-6 items-center rounded-[5px] border border-line bg-surface px-2 text-[12.5px] leading-none font-medium tracking-[-0.005em] text-text-2',
        className,
      )}
    >
      {children}
    </span>
  )
}
