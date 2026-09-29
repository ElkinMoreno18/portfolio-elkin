import type { ReactNode } from 'react'
import { useId } from 'react'
import { CircleAlert } from 'lucide-react'
import { cn } from '@/lib/utils'

/*
 * Piezas de formulario del panel. Herramienta interna: densas y tranquilas.
 * El acento sólo aparece cuando algo está activo (foco, interruptor encendido);
 * el rojo sólo cuando hay un error que corregir.
 */

/** Marco compartido por inputs, selects, textareas y el campo de etiquetas. */
const frameBase =
  'rounded-[var(--radius-sm)] border border-line bg-bg text-[14px] text-text ' +
  'transition-[border-color] duration-150 ease-[var(--ease-out)]'

/** Para un control que recibe el foco él mismo. */
export const adminFrame = `${frameBase} hover:not-focus:border-line-strong`

/** Para un contenedor cuyo foco está dentro (input con prefijo, etiquetas). */
export const adminFrameWithin = `${frameBase} hover:not-focus-within:border-line-strong focus-within:border-accent`

/** Estado de foco: borde de acento y un contorno de 1 px pegado, sin halo. */
export const adminFocus =
  'focus:border-accent focus-visible:outline-1 focus-visible:outline-offset-0 focus-visible:outline-[var(--accent-line)]'

export const adminInput = cn(
  adminFrame,
  adminFocus,
  'block h-9 w-full px-3 placeholder:text-placeholder',
  'aria-[invalid=true]:border-danger/70',
)

/** Sin flechas del navegador en los numéricos: se siguen pudiendo usar ↑ ↓. */
export const noSpin =
  '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'

export function FieldError({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <p id={id} className="mt-1.5 flex items-start gap-1.5 text-[12px] leading-snug text-danger">
      <CircleAlert size={14} strokeWidth={1.5} className="mt-px shrink-0" aria-hidden />
      {children}
    </p>
  )
}

export function FieldHint({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <p id={id} className="mt-1.5 text-[12px] leading-snug text-text-3">
      {children}
    </p>
  )
}

/** Un campo: etiqueta encima, control, y debajo la pista o el error. */
export function AdminField({
  label,
  hint,
  error,
  aside,
  children,
  className,
  htmlFor,
}: {
  label: ReactNode
  hint?: ReactNode
  error?: ReactNode
  /** Texto pequeño a la derecha de la etiqueta (p. ej. "Obligatorio"). */
  aside?: ReactNode
  children: ReactNode
  className?: string
  htmlFor?: string
}) {
  return (
    <div className={className}>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        {htmlFor ? (
          <label htmlFor={htmlFor} className="text-[13px] font-medium text-text-2">
            {label}
          </label>
        ) : (
          <p className="text-[13px] font-medium text-text-2">{label}</p>
        )}
        {aside && <span className="text-[12px] text-text-3">{aside}</span>}
      </div>
      {children}
      {error ? (
        <FieldError id={htmlFor ? `${htmlFor}-error` : undefined}>{error}</FieldError>
      ) : (
        hint && <FieldHint id={htmlFor ? `${htmlFor}-hint` : undefined}>{hint}</FieldHint>
      )}
    </div>
  )
}

/**
 * Pareja ES / EN de un mismo campo, lado a lado desde `sm`.
 * La etiqueta del grupo se escribe una vez; cada control lleva su código de
 * idioma como etiqueta propia (mono: es un identificador, no decoración).
 */
export function BiField({
  label,
  hint,
  aside,
  children,
}: {
  label: ReactNode
  hint?: ReactNode
  aside?: ReactNode
  children: ReactNode
}) {
  const id = useId()
  return (
    <div role="group" aria-labelledby={`${id}-label`}>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <p id={`${id}-label`} className="text-[13px] font-medium text-text-2">
          {label}
        </p>
        {aside && <span className="text-[12px] text-text-3">{aside}</span>}
      </div>
      <div className="grid gap-2.5 sm:grid-cols-2">{children}</div>
      {hint && <FieldHint>{hint}</FieldHint>}
    </div>
  )
}

/** Código de idioma dentro del marco de un input de una línea. */
export function LangInputFrame({
  code,
  htmlFor,
  srLabel,
  invalid,
  children,
}: {
  code: 'ES' | 'EN'
  htmlFor: string
  srLabel: string
  invalid?: boolean
  children: ReactNode
}) {
  return (
    <div
      data-invalid={invalid || undefined}
      className={cn(
        adminFrameWithin,
        'flex h-9 items-stretch overflow-hidden',
        'data-invalid:border-danger/70 data-invalid:hover:border-danger/70',
      )}
    >
      <label
        htmlFor={htmlFor}
        className="grid w-10 shrink-0 cursor-text place-items-center border-r border-line font-mono text-[12px] text-text-3"
      >
        <span className="sr-only">{srLabel} </span>
        {code}
      </label>
      {children}
    </div>
  )
}

/** Input "desnudo" para usar dentro de LangInputFrame. */
export const bareInput =
  'min-w-0 flex-1 bg-transparent px-3 text-[14px] text-text placeholder:text-placeholder focus:outline-none focus-visible:outline-none'

/** Textarea bilingüe: el código de idioma y el recuento de caracteres arriba. */
export function LangTextareaFrame({
  code,
  htmlFor,
  srLabel,
  count,
  children,
}: {
  code: 'ES' | 'EN'
  htmlFor: string
  srLabel: string
  count: number
  children: ReactNode
}) {
  return (
    <div className={cn(adminFrameWithin, 'overflow-hidden')}>
      <div className="flex h-8 items-center justify-between border-b border-line px-3">
        <label htmlFor={htmlFor} className="font-mono text-[12px] text-text-3">
          <span className="sr-only">{srLabel} </span>
          {code}
        </label>
        <span className="font-mono text-[12px] text-text-3 tnum" aria-hidden>
          {count}
        </span>
      </div>
      {children}
    </div>
  )
}

/** Interruptor con etiqueta y descripción. Encendido = acento (estado activo). */
export function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  description?: string
}) {
  const id = useId()
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <label htmlFor={id} className="block cursor-pointer text-[14px] font-medium text-text">
          {label}
        </label>
        {description && (
          <p id={`${id}-desc`} className="mt-0.5 text-[13px] leading-snug text-text-3">
            {description}
          </p>
        )}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-describedby={description ? `${id}-desc` : undefined}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative mt-0.5 h-5 w-9 shrink-0 rounded-full border transition-[background-color,border-color] duration-200 ease-[var(--ease-out)]',
          checked ? 'border-accent bg-accent' : 'border-line-strong bg-surface-2 hover:border-text-3',
        )}
      >
        <span
          aria-hidden
          className={cn(
            'absolute top-[1px] left-[1px] size-4 rounded-full transition-[transform,background-color] duration-200 ease-[var(--ease-out)]',
            checked ? 'translate-x-4 bg-text' : 'translate-x-0 bg-text-3',
          )}
        />
      </button>
    </div>
  )
}
