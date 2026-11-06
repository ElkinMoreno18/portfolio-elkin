import { useEffect, useState } from 'react'
import { useLang } from '@/i18n'
import { useContent } from '@/content/store'
import { socialsOf } from '@/content/derive'
import { madridTime } from '@/lib/utils'
import { siteCopy } from './copy'
import { Container } from './ui'
import { Mark } from './Nav'
import { IconArrowUp, IconGitHub, IconLinkedIn, IconMail } from './icons'

const SOCIAL_ICON = { linkedin: IconLinkedIn, github: IconGitHub, mail: IconMail } as const

export function Footer() {
  const { pick } = useLang()
  const { profile } = useContent()
  const [time, setTime] = useState(() => madridTime())

  useEffect(() => {
    const id = setInterval(() => setTime(madridTime()), 30_000)
    return () => clearInterval(id)
  }, [])

  return (
    <footer data-site-footer className="border-t border-line no-print">
      <Container size="wide" className="flex flex-col gap-8 py-10 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Mark />
          <div>
            <p className="text-[14px] font-semibold">{profile.name}</p>
            <p className="text-[13px] text-text-3">{pick(profile.title)}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-[13px] text-text-3">
          <span>
            {pick(siteCopy.footer.localTime)} · <span className="tnum font-mono text-text-2">{time}</span>
          </span>
          <span>© {new Date().getFullYear()} {profile.fullName}</span>
          <div className="flex items-center gap-1">
            {socialsOf(profile).map((s) => {
              const Icon = SOCIAL_ICON[s.icon]
              return (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  target={s.href.startsWith('http') ? '_blank' : undefined}
                  rel="noreferrer noopener"
                  className="grid size-9 place-items-center rounded-[var(--radius-sm)] text-text-2 transition-colors hover:bg-surface hover:text-text"
                >
                  <Icon size={16} />
                </a>
              )
            })}
            <button
              onClick={() => {
                window.scrollTo({ top: 0 })
                // El foco sube con la página: el siguiente Tab empieza arriba, no en el pie.
                document.getElementById('main')?.focus({ preventScroll: true })
              }}
              aria-label={pick(siteCopy.footer.toTop)}
              className="grid size-9 place-items-center rounded-[var(--radius-sm)] text-text-2 transition-colors hover:bg-surface hover:text-text"
            >
              <IconArrowUp size={16} />
            </button>
          </div>
        </div>
      </Container>
    </footer>
  )
}
