import { useLang } from '@/i18n'
import { cn } from '@/lib/utils'
import { Tag } from '../ui'
import { stackLayers } from './schemas'
import { projectsCopy as c } from './copy'
import { techLabel } from '../experience/format'

/**
 * Tratamiento tipográfico para proyectos sin captura ni esquema escrito:
 * su stack ordenado por capas, generado sólo a partir de `tech`. No sugiere
 * una arquitectura que no conocemos; sólo agrupa lo que el proyecto declara.
 */
export function StackLayers({ tech, className }: { tech: string[]; className?: string }) {
  const { pick, lang } = useLang()
  const layers = stackLayers(tech)
  if (!layers.length) return null

  return (
    <ol className={cn('pj-layers', className)}>
      {layers.map((l) => (
        <li key={l.key} className="pj-layer" data-layer>
          <span className="pj-layer-name">{pick(l.label)}</span>
          <span className="flex flex-wrap gap-1.5">
            {l.items.map((t) => (
              <Tag key={t} className="bg-surface-2">
                {techLabel(t, lang)}
              </Tag>
            ))}
          </span>
        </li>
      ))}
    </ol>
  )
}

/** El mismo tratamiento dentro de un panel, para ocupar el sitio de un esquema. */
export function StackPanel({ tech, className }: { tech: string[]; className?: string }) {
  const { pick } = useLang()
  return (
    <div className={cn('sch pj-stack-panel', className)}>
      <div className="sch-bar">
        <span>{pick(c.stackSchematic)}</span>
      </div>
      <div className="px-5 pb-3 sm:px-6">
        <StackLayers tech={tech} />
      </div>
    </div>
  )
}
