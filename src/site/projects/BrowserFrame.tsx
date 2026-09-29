import { forwardRef, type CSSProperties } from 'react'
import { cn } from '@/lib/utils'
import { IconGlobe } from '../icons'

/**
 * Ventana mínima para una captura real: barra fina con el nombre del
 * proyecto y nada más. Sin URL inventada ni botones de semáforo.
 *
 * `crop` recorta el pie de la captura para dejar margen a un paralaje
 * interior (la imagen se desplaza dentro de la ventana con el scroll).
 */
export const BrowserFrame = forwardRef<
  HTMLElement,
  {
    src: string
    alt: string
    title: string
    crop?: boolean
    eager?: boolean
    className?: string
    style?: CSSProperties
  }
>(function BrowserFrame({ src, alt, title, crop = false, eager = false, className, style }, ref) {
  return (
    <figure ref={ref} className={cn('pj-frame', className)} style={style} data-frame>
      <div className="pj-frame-bar" aria-hidden="true">
        <IconGlobe size={14} className="shrink-0 text-text-3" />
        <span className="truncate">{title}</span>
      </div>
      <div className={cn('pj-frame-view', crop && 'pj-frame-view-crop')}>
        <img
          src={src}
          alt={alt}
          data-frame-img
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={eager ? 'high' : undefined}
          draggable={false}
        />
      </div>
    </figure>
  )
})
