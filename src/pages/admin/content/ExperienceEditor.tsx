import { useId } from 'react'
import { useLang } from '@/i18n'
import { saveSection } from '@/lib/contentApi'
import { BLANK, jobPeriod, sortJobs } from '@/content/derive'
import type { JobContent } from '@/content/types'
import { AdminField, Toggle } from '@/components/admin/Field'
import { TagInput } from '@/components/admin/TagInput'
import { BiArea, BiLines, BiText, EditorShell, ListEditor, Section, TextField, tidy, useSectionEditor } from './kit'

const copy = {
  title: { es: 'Experiencia', en: 'Experience' },
  lead: {
    es: 'Tus puestos, del más reciente al más antiguo. Se ordenan solos por fecha al guardar.',
    en: 'Your roles, newest first. They sort themselves by date when you save.',
  },
  jobs: { es: 'Puestos', en: 'Roles' },
  jobsLead: {
    es: 'El puesto actual (sin fecha de fin) da la línea «Ahora en…» de la portada y marca en el stack lo que usas hoy.',
    en: 'The current role (no end date) drives the "Now at…" line on the homepage and marks what you use today in the stack.',
  },
  add: { es: 'Añadir puesto', en: 'Add role' },
  empty: { es: 'Sin puestos todavía.', en: 'No roles yet.' },
  company: { es: 'Empresa', en: 'Company' },
  role: { es: 'Puesto', en: 'Role' },
  location: { es: 'Ubicación', en: 'Location' },
  start: { es: 'Desde', en: 'From' },
  end: { es: 'Hasta', en: 'To' },
  monthHint: { es: 'Año y mes: 2025-07', en: 'Year and month: 2025-07' },
  current: { es: 'Trabajo aquí ahora', en: 'I work here now' },
  currentDesc: { es: 'Sin fecha de fin: se muestra «Actualidad».', en: 'No end date: shown as "Present".' },
  summary: { es: 'Resumen', en: 'Summary' },
  summaryHint: { es: 'Una o dos frases: el equipo y qué hacías.', en: 'One or two sentences: the team and what you did.' },
  achievements: { es: 'Logros', en: 'Achievements' },
  achievementsHint: {
    es: 'Uno por línea. Empieza por el resultado y pon la cifra si la tienes: las cifras se resaltan solas.',
    en: 'One per line. Lead with the result and include the number if you have it: numbers are highlighted automatically.',
  },
  tech: { es: 'Tecnologías', en: 'Technologies' },
  techHint: {
    es: 'Enter o coma para añadir. Escríbelas igual que en el stack para que se crucen.',
    en: 'Enter or comma to add. Spell them as in the stack so they match.',
  },
  addTech: { es: 'Añadir tecnología', en: 'Add a technology' },
  errCompany: { es: 'Hay un puesto sin empresa.', en: 'A role has no company.' },
  errRole: { es: 'falta el puesto en español.', en: 'the Spanish role title is missing.' },
  errStart: { es: 'la fecha de inicio debe ser AAAA-MM (p. ej. 2025-07).', en: 'the start date must be YYYY-MM (e.g. 2025-07).' },
  errEnd: {
    es: 'pon la fecha de fin (AAAA-MM) o marca «Trabajo aquí ahora».',
    en: 'add the end date (YYYY-MM) or turn on "I work here now".',
  },
  errOrder: { es: 'la fecha de fin es anterior a la de inicio.', en: 'the end date is before the start date.' },
}

const YM = /^\d{4}-(0[1-9]|1[0-2])$/

export function ExperienceEditor({
  initial,
  savedAt,
  onSaved,
  onDirtyChange,
}: {
  initial: JobContent[]
  savedAt?: string
  onSaved: (data: JobContent[], savedAt: string) => void
  onDirtyChange: (dirty: boolean) => void
}) {
  const { lang, pick } = useLang()
  const uid = useId()

  function prepare(jobs: JobContent[]) {
    const clean = tidy(jobs).map((j) => ({ ...j, end: j.end === null ? null : j.end }))
    for (const j of clean) {
      const name = j.company || pick(copy.role)
      if (!j.company) throw new Error(pick(copy.errCompany))
      if (!j.role.es) throw new Error(`${name}: ${pick(copy.errRole)}`)
      if (!YM.test(j.start)) throw new Error(`${name}: ${pick(copy.errStart)}`)
      if (j.end !== null && !YM.test(j.end)) throw new Error(`${name}: ${pick(copy.errEnd)}`)
      if (j.end !== null && j.end < j.start) throw new Error(`${name}: ${pick(copy.errOrder)}`)
    }
    return sortJobs(clean)
  }

  const editor = useSectionEditor({
    initial: sortJobs(initial),
    onDirtyChange,
    prepare,
    persist: async (clean) => onSaved(clean, await saveSection('experience', clean)),
  })

  return (
    <EditorShell title={pick(copy.title)} lead={pick(copy.lead)} savedAt={savedAt} editor={editor} viewHref="/#experiencia">
      <Section title={pick(copy.jobs)} lead={pick(copy.jobsLead)}>
        <ListEditor
          items={editor.draft}
          onChange={editor.setDraft}
          blank={BLANK.job}
          collapsible
          addAtStart
          orderable={false}
          addLabel={pick(copy.add)}
          emptyLabel={pick(copy.empty)}
          itemTitle={(j) => [j.role[lang] || j.role.es, j.company].filter(Boolean).join(' · ')}
          itemMeta={(j) => (YM.test(j.start) ? jobPeriod(j)[lang] : '')}
        >
          {(job, update, i) => (
            <>
              <TextField label={pick(copy.company)} value={job.company} onChange={(v) => update({ company: v })} />
              <BiText label={pick(copy.role)} value={job.role} onChange={(v) => update({ role: v })} />
              <BiText label={pick(copy.location)} value={job.location} onChange={(v) => update({ location: v })} />
              <div className="grid gap-5 sm:grid-cols-2 sm:gap-4">
                <TextField
                  label={pick(copy.start)}
                  type="month"
                  value={job.start}
                  onChange={(v) => update({ start: v })}
                  placeholder="2025-07"
                  hint={pick(copy.monthHint)}
                  mono
                />
                <TextField
                  label={pick(copy.end)}
                  type="month"
                  value={job.end ?? ''}
                  onChange={(v) => update({ end: v })}
                  placeholder="2025-07"
                  disabled={job.end === null}
                  mono
                />
              </div>
              <Toggle
                checked={job.end === null}
                onChange={(on) => update({ end: on ? null : '' })}
                label={pick(copy.current)}
                description={pick(copy.currentDesc)}
              />
              <BiArea label={pick(copy.summary)} value={job.summary} onChange={(v) => update({ summary: v })} hint={pick(copy.summaryHint)} />
              <BiLines
                label={pick(copy.achievements)}
                value={job.achievements}
                onChange={(v) => update({ achievements: v })}
                hint={pick(copy.achievementsHint)}
                rows={7}
              />
              <AdminField label={pick(copy.tech)} htmlFor={`${uid}-tech-${i}`} hint={pick(copy.techHint)}>
                <TagInput
                  id={`${uid}-tech-${i}`}
                  value={job.tech}
                  onChange={(v) => update({ tech: v })}
                  placeholder={pick(copy.addTech)}
                  describedBy={`${uid}-tech-${i}-hint`}
                />
              </AdminField>
            </>
          )}
        </ListEditor>
      </Section>
    </EditorShell>
  )
}
