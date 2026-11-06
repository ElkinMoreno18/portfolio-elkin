import { useLang } from '@/i18n'
import { useContent } from '@/content/store'
import { Container, SectionHeader } from '../ui'
import { Timeline } from '../experience/Timeline'
import { Background } from '../experience/Background'
import { expCopy as c } from '../experience/copy'
import './experience.css'

/**
 * Experiencia: los puestos en una línea de tiempo tipo changelog, con
 * formación, idiomas y el CV debajo. El contenido es editable desde /admin.
 */
export function Experience() {
  const { pick } = useLang()
  const { experience, education, languages, profile } = useContent()
  // Si el contenido cambia ya montado (se guardó en /admin), cada bloque se
  // vuelve a montar: sus animaciones miden filas que ya no son las mismas.
  const jobsKey = JSON.stringify(experience)
  const bgKey = JSON.stringify([education, languages, profile.cvUrl])

  return (
    <section id="experiencia" aria-labelledby="experiencia-title" className="border-t border-line py-24 md:py-32">
      <Container size="base">
        <SectionHeader id="experiencia-title" title={pick(c.title)} lead={pick(c.lead)} />
        <Timeline key={jobsKey} />
        <Background key={bgKey} />
      </Container>
    </section>
  )
}
