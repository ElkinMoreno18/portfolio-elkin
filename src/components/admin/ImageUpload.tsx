import { useRef, useState } from 'react'
import type { DragEvent } from 'react'
import { ImagePlus, LoaderCircle, X } from 'lucide-react'
import { uploadMedia } from '@/lib/projectsApi'
import { useLang } from '@/i18n'
import { cn } from '@/lib/utils'
import { Button } from '@/site/ui'
import { FieldError } from './Field'

const copy = {
  dropOne: { es: 'Arrastra una imagen o haz clic para elegirla', en: 'Drop an image or click to choose one' },
  dropMany: { es: 'Arrastra imágenes o haz clic para elegirlas', en: 'Drop images or click to choose them' },
  addMore: { es: 'Añadir', en: 'Add' },
  uploading: { es: 'Subiendo…', en: 'Uploading…' },
  replace: { es: 'Reemplazar', en: 'Replace' },
  remove: { es: 'Quitar', en: 'Remove' },
  removeImage: { es: 'Quitar imagen', en: 'Remove image' },
  failed: { es: 'No se pudo subir la imagen', en: 'The image could not be uploaded' },
}

/**
 * Subida al bucket de Supabase. Portada: una imagen con vista previa grande.
 * Galería: rejilla de miniaturas con la zona de subida como última casilla.
 */
export function ImageUpload({
  value,
  onChange,
  multiple = false,
}: {
  value: string | string[] | null
  onChange: (v: string | string[] | null) => void
  multiple?: boolean
}) {
  const { pick } = useLang()
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [over, setOver] = useState(false)

  const urls = multiple ? ((value as string[]) ?? []) : value ? [value as string] : []

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return
    setBusy(true)
    setError(null)
    try {
      const uploaded = await Promise.all([...files].map(uploadMedia))
      onChange(multiple ? [...urls, ...uploaded] : uploaded[0])
    } catch (e) {
      setError(e instanceof Error ? `${pick(copy.failed)}: ${e.message}` : pick(copy.failed))
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  function remove(url: string) {
    if (multiple) onChange(urls.filter((u) => u !== url))
    else onChange(null)
  }

  // Arrastrar sobre la zona: se marca como activa (acento) mientras haya algo encima.
  const drop = {
    onDragOver: (e: DragEvent) => {
      e.preventDefault()
      if (!over) setOver(true)
    },
    onDragLeave: (e: DragEvent) => {
      if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOver(false)
    },
    onDrop: (e: DragEvent) => {
      e.preventDefault()
      setOver(false)
      void handleFiles(e.dataTransfer.files)
    },
  }

  const pickFiles = () => inputRef.current?.click()

  const zoneState = cn(
    'border border-dashed transition-[border-color,background-color,color] duration-150 ease-[var(--ease-out)]',
    over
      ? 'border-accent bg-[var(--accent-soft)] text-text'
      : 'border-line-strong bg-bg text-text-2 hover:border-text-3 hover:text-text',
    'disabled:pointer-events-none disabled:opacity-60',
  )

  const busyLabel = (
    <>
      <LoaderCircle size={16} strokeWidth={1.5} className="animate-spin" aria-hidden />
      {pick(copy.uploading)}
    </>
  )

  const fileInput = (
    <input
      ref={inputRef}
      type="file"
      accept="image/*"
      multiple={multiple}
      onChange={(e) => void handleFiles(e.target.files)}
      className="hidden"
      tabIndex={-1}
      aria-hidden
    />
  )

  /* ── Portada: una sola imagen ── */
  if (!multiple) {
    const url = urls[0]
    return (
      <div>
        {url ? (
          <div
            {...drop}
            className={cn(
              'overflow-hidden rounded-[var(--radius-md)] border bg-bg transition-colors duration-150',
              over ? 'border-accent' : 'border-line',
            )}
          >
            <img src={url} alt="" className="aspect-[16/9] max-h-64 w-full object-cover object-top" />
            <div className="flex items-center justify-between gap-3 border-t border-line px-3 py-2">
              <p className="min-w-0 truncate font-mono text-[12px] text-text-3" title={url}>
                {url.split('/').pop()}
              </p>
              <div className="flex shrink-0 items-center gap-1">
                <Button type="button" variant="secondary" size="sm" onClick={pickFiles} disabled={busy}>
                  {busy ? busyLabel : pick(copy.replace)}
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => remove(url)} disabled={busy}>
                  {pick(copy.remove)}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={pickFiles}
            disabled={busy}
            aria-busy={busy}
            {...drop}
            className={cn(
              zoneState,
              'flex h-32 w-full flex-col items-center justify-center gap-2 rounded-[var(--radius-md)] px-4 text-[14px]',
            )}
          >
            {busy ? (
              <span className="flex items-center gap-2">{busyLabel}</span>
            ) : (
              <>
                <ImagePlus size={18} strokeWidth={1.5} aria-hidden />
                {pick(copy.dropOne)}
              </>
            )}
          </button>
        )}
        {error && <FieldError>{error}</FieldError>}
        {fileInput}
      </div>
    )
  }

  /* ── Galería: varias imágenes ── */
  return (
    <div>
      {urls.length === 0 ? (
        <button
          type="button"
          onClick={pickFiles}
          disabled={busy}
          aria-busy={busy}
          {...drop}
          className={cn(
            zoneState,
            'flex h-24 w-full items-center justify-center gap-2 rounded-[var(--radius-md)] px-4 text-[14px]',
          )}
        >
          {busy ? (
            busyLabel
          ) : (
            <>
              <ImagePlus size={16} strokeWidth={1.5} aria-hidden />
              {pick(copy.dropMany)}
            </>
          )}
        </button>
      ) : (
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {urls.map((url, i) => (
            <li key={url} className="group relative overflow-hidden rounded-[var(--radius-sm)] border border-line bg-bg">
              <img src={url} alt="" className="aspect-[16/10] w-full object-cover" />
              <button
                type="button"
                onClick={() => remove(url)}
                aria-label={`${pick(copy.removeImage)} ${i + 1}`}
                className={cn(
                  'absolute top-1.5 right-1.5 grid size-7 place-items-center rounded-[var(--radius-sm)] border border-line-strong bg-bg text-text-2',
                  'transition-[opacity,color] duration-150 hover:text-text',
                  'opacity-0 group-hover:opacity-100 focus-visible:opacity-100 [@media(hover:none)]:opacity-100',
                )}
              >
                <X size={14} strokeWidth={1.5} aria-hidden />
              </button>
            </li>
          ))}
          <li>
            <button
              type="button"
              onClick={pickFiles}
              disabled={busy}
              aria-busy={busy}
              aria-label={busy ? pick(copy.uploading) : pick(copy.dropMany)}
              {...drop}
              className={cn(
                zoneState,
                'flex aspect-[16/10] w-full flex-col items-center justify-center gap-1.5 rounded-[var(--radius-sm)] text-[13px]',
              )}
            >
              {busy ? (
                busyLabel
              ) : (
                <>
                  <ImagePlus size={16} strokeWidth={1.5} aria-hidden />
                  {pick(copy.addMore)}
                </>
              )}
            </button>
          </li>
        </ul>
      )}
      {error && <FieldError>{error}</FieldError>}
      {fileInput}
    </div>
  )
}
