import { useLang } from '@/i18n'
import { saveSection } from '@/lib/contentApi'
import { BLANK } from '@/content/derive'
import type { EducationContent, LanguageContent } from '@/content/types'
import { BiText, EditorShell, ListEditor, Section, TextField, useSectionEditor } from './kit'

const copy = {
  title: { es: 'Formación e idiomas', en: 'Education and languages' },
  lead: {
    es: 'Debajo de la experiencia, junto al enlace al CV. En el orden en que los pongas aquí.',
    en: 'Below the experience, next to the CV link. In the order you set here.',
  },
  education: { es: 'Formación', en: 'Education' },
  addEducation: { es: 'Añadir formación', en: 'Add education' },
  emptyEducation: { es: 'Sin formación.', en: 'No education.' },
  degree: { es: 'Título', en: 'Title' },
  org: { es: 'Centro', en: 'Institution' },
  place: { es: 'Lugar', en: 'Place' },
  period: { es: 'Año o periodo', en: 'Year or period' },
  languages: { es: 'Idiomas', en: 'Languages' },
  languagesLead: {
    es: 'Dilo tal cual (nativo, B2, básico): sin barras que finjan una precisión que no existe.',
    en: 'Say it as it is (native, B2, basic): no bars faking a precision that does not exist.',
  },
  addLanguage: { es: 'Añadir idioma', en: 'Add language' },
  emptyLanguages: { es: 'Sin idiomas.', en: 'No languages.' },
  language: { es: 'Idioma', en: 'Language' },
  level: { es: 'Nivel', en: 'Level' },
  errTitle: { es: 'Hay una formación sin título en español.', en: 'An education entry has no Spanish title.' },
  errLanguage: { es: 'Hay un idioma sin nombre en español.', en: 'A language has no Spanish name.' },
}

type Value = { education: EducationContent[]; languages: LanguageContent[] }

export function EducationEditor({
  initial,
  savedAt,
  onSaved,
  onDirtyChange,
}: {
  initial: Value
  savedAt?: string
  onSaved: (data: Value, savedAt: string) => void
  onDirtyChange: (dirty: boolean) => void
}) {
  const { lang, pick } = useLang()
  const editor = useSectionEditor<Value>({
    initial,
    onDirtyChange,
    persist: async (clean) => {
      if (clean.education.some((e) => !e.title.es)) throw new Error(pick(copy.errTitle))
      if (clean.languages.some((l) => !l.name.es)) throw new Error(pick(copy.errLanguage))
      await saveSection('education', clean.education)
      onSaved(clean, await saveSection('languages', clean.languages))
    },
  })
  const { draft, setDraft } = editor

  return (
    <EditorShell title={pick(copy.title)} lead={pick(copy.lead)} savedAt={savedAt} editor={editor} viewHref="/#experiencia">
      <Section title={pick(copy.education)}>
        <ListEditor
          items={draft.education}
          onChange={(education) => setDraft((d) => ({ ...d, education }))}
          blank={BLANK.education}
          addLabel={pick(copy.addEducation)}
          emptyLabel={pick(copy.emptyEducation)}
          itemTitle={(e) => e.title[lang] || e.title.es}
          itemMeta={(e) => [e.org, e.period].filter(Boolean).join(' · ')}
        >
          {(e, update) => (
            <>
              <BiText label={pick(copy.degree)} value={e.title} onChange={(v) => update({ title: v })} />
              <TextField label={pick(copy.org)} value={e.org} onChange={(v) => update({ org: v })} />
              <div className="grid gap-5 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] sm:gap-4">
                <BiText label={pick(copy.place)} value={e.place} onChange={(v) => update({ place: v })} />
                <TextField label={pick(copy.period)} value={e.period} onChange={(v) => update({ period: v })} placeholder="2017 – 2021" mono />
              </div>
            </>
          )}
        </ListEditor>
      </Section>

      <Section title={pick(copy.languages)} lead={pick(copy.languagesLead)}>
        <ListEditor
          items={draft.languages}
          onChange={(languages) => setDraft((d) => ({ ...d, languages }))}
          blank={BLANK.language}
          addLabel={pick(copy.addLanguage)}
          emptyLabel={pick(copy.emptyLanguages)}
          itemTitle={(l) => l.name[lang] || l.name.es}
          itemMeta={(l) => l.level[lang] || l.level.es}
        >
          {(l, update) => (
            <>
              <BiText label={pick(copy.language)} value={l.name} onChange={(v) => update({ name: v })} />
              <BiText label={pick(copy.level)} value={l.level} onChange={(v) => update({ level: v })} />
            </>
          )}
        </ListEditor>
      </Section>
    </EditorShell>
  )
}
