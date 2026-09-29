import { useLang } from '@/i18n'
import { Container, SectionHeader } from '../ui'
import { Timeline } from '../experience/Timeline'
import { Background } from '../experience/Background'
import { expCopy as c } from '../experience/copy'
import './experience.css'

/**
 * Experiencia: seis puestos en una línea de tiempo tipo changelog, con
 * formación, idiomas y el CV debajo. Todo el contenido sale de profile.ts.
 */
export function Experience() {
  const { pick } = useLang()

  return (
    <section id="experiencia" aria-labelledby="experiencia-title" className="border-t border-line py-24 md:py-32">
      <Container size="base">
        <SectionHeader id="experiencia-title" title={pick(c.title)} lead={pick(c.lead)} />
        <Timeline />
        <Background />
      </Container>
    </section>
  )
}
