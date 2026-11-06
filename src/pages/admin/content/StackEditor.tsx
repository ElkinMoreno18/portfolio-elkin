import { useId } from 'react'
import { useLang } from '@/i18n'
import { saveSection } from '@/lib/contentApi'
import { BLANK } from '@/content/derive'
import type { StackGroupContent } from '@/content/types'
import { slugify } from '@/lib/utils'
import { AdminField } from '@/components/admin/Field'
import { TagInput } from '@/components/admin/TagInput'
import { BiText, EditorShell, ListEditor, Section, tidy, useSectionEditor } from './kit'

const copy = {
  title: { es: 'Stack', en: 'Stack' },
  lead: {
    es: 'Tus tecnologías por área. Al lado de cada área, el sitio enseña en qué empresas las usaste, cruzándolas con las tecnologías de cada puesto.',
    en: 'Your technologies by area. Next to each area, the site shows where you used them, matched against the technologies of each role.',
  },
  areas: { es: 'Áreas', en: 'Areas' },
  areasLead: {
    es: 'Una tecnología se marca «en uso» (punto naranja) si aparece escrita igual en tu puesto actual. Las áreas sin tecnologías no se muestran.',
    en: 'A technology is marked "in use" (orange dot) when it is spelled the same in your current role. Areas without technologies are hidden.',
  },
  add: { es: 'Añadir área', en: 'Add area' },
  empty: { es: 'Sin áreas.', en: 'No areas.' },
  area: { es: 'Área', en: 'Area' },
  note: { es: 'Para qué la usas', en: 'What you use it for' },
  noteHint: { es: 'Una frase corta, en primera persona.', en: 'One short sentence, first person.' },
  items: { es: 'Tecnologías', en: 'Technologies' },
  itemsHint: { es: 'Enter o coma para añadir. Retroceso borra la última.', en: 'Enter or comma to add. Backspace removes the last one.' },
  addItem: { es: 'Añadir tecnología', en: 'Add a technology' },
  errTitle: { es: 'Hay un área sin nombre en español.', en: 'An area has no Spanish name.' },
}

export function StackEditor({
  initial,
  savedAt,
  onSaved,
  onDirtyChange,
}: {
  initial: StackGroupContent[]
  savedAt?: string
  onSaved: (data: StackGroupContent[], savedAt: string) => void
  onDirtyChange: (dirty: boolean) => void
}) {
  const { lang, pick } = useLang()
  const uid = useId()
  const editor = useSectionEditor({
    initial,
    onDirtyChange,
    prepare: (groups) => {
      const clean = tidy(groups)
      if (clean.some((g) => !g.title.es)) throw new Error(pick(copy.errTitle))
      // Clave estable por área (la usa la tabla); única aunque dos áreas se llamen igual.
      const seen = new Set<string>()
      return clean.map((g, i) => {
        let key = g.key || slugify(g.title.es) || `area-${i + 1}`
        while (seen.has(key)) key = `${key}-${i + 1}`
        seen.add(key)
        return { ...g, key }
      })
    },
    persist: async (clean) => onSaved(clean, await saveSection('stack', clean)),
  })

  return (
    <EditorShell title={pick(copy.title)} lead={pick(copy.lead)} savedAt={savedAt} editor={editor} viewHref="/#stack">
      <Section title={pick(copy.areas)} lead={pick(copy.areasLead)}>
        <ListEditor
          items={editor.draft}
          onChange={editor.setDraft}
          blank={BLANK.stackGroup}
          collapsible
          addLabel={pick(copy.add)}
          emptyLabel={pick(copy.empty)}
          itemTitle={(g) => g.title[lang] || g.title.es}
          itemMeta={(g) => g.items.join(', ')}
        >
          {(g, update, i) => (
            <>
              <BiText label={pick(copy.area)} value={g.title} onChange={(v) => update({ title: v })} />
              <BiText label={pick(copy.note)} value={g.note} onChange={(v) => update({ note: v })} hint={pick(copy.noteHint)} />
              <AdminField label={pick(copy.items)} htmlFor={`${uid}-items-${i}`} hint={pick(copy.itemsHint)}>
                <TagInput
                  id={`${uid}-items-${i}`}
                  value={g.items}
                  onChange={(v) => update({ items: v })}
                  placeholder={pick(copy.addItem)}
                  describedBy={`${uid}-items-${i}-hint`}
                />
              </AdminField>
            </>
          )}
        </ListEditor>
      </Section>
    </EditorShell>
  )
}
