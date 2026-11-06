import { useLang } from '@/i18n'
import { cn } from '@/lib/utils'
import { siteCopy } from './copy'
import { IconMoon, IconSun } from './icons'
import { setTheme, useTheme } from './theme'

/**
 * Botón de tema. Enseña el tema al que lleva (sol en oscuro, luna en claro),
 * como hacen la mayoría de productos: el icono es la acción, no el estado.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { pick } = useLang()
  const theme = useTheme()
  const next = theme === 'dark' ? 'light' : 'dark'
  const label = pick(next === 'light' ? siteCopy.nav.toLight : siteCopy.nav.toDark)
  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={label}
      title={label}
      className={cn(
        'grid size-8 shrink-0 place-items-center rounded-[var(--radius-sm)] border border-line text-text-2',
        'transition-colors duration-200 hover:border-line-strong hover:bg-surface hover:text-text',
        className,
      )}
    >
      {theme === 'dark' ? <IconSun /> : <IconMoon />}
    </button>
  )
}
