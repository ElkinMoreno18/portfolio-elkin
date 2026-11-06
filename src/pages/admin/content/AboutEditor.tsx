import { useLang } from '@/i18n'
import { saveSection } from '@/lib/contentApi'
import { BLANK } from '@/content/derive'
import type { AboutContent } from '@/content/types'
import { BiArea, BiLines, BiText, EditorShell, ListEditor, Section, copy as kit, useSectionEditor } from './kit'

const copy = {
  title: { es: 'Sobre mí', en: 'About' },
  lead: {
    es: 'Tu historia, tu frase, tus principios de trabajo y en qué andas ahora.',
    en: 'Your story, your motto, your working principles and what you are working on now.',
  },
  story: { es: 'Historia', en: 'Story' },
  storyLead: {
    es: 'El primer párrafo se lee más grande, como entradilla. De dos a cuatro párrafos.',
    en: 'The first paragraph reads larger, as an intro. Two to four paragraphs.',
  },
  paragraphs: { es: 'Párrafos', en: 'Paragraphs' },
  motto: { es: 'Tu frase', en: 'Your motto' },
  mottoLead: {
    es: 'Se muestra en grande y se ilumina palabra a palabra con el scroll. Corta: una línea.',
    en: 'Shown large, lighting up word by word as you scroll. Keep it to one line.',
  },
  mottoText: { es: 'Frase', en: 'Motto' },
  mottoBody: { es: 'Explicación', en: 'Explanation' },
  principles: { es: 'Principios', en: 'Principles' },
  principlesLead: { es: 'Cómo trabajas, en pocas palabras. Dos o tres funcionan mejor.', en: 'How you work, briefly. Two or three work best.' },
  addPrinciple: { es: 'Añadir principio', en: 'Add principle' },
  emptyPrinciples: { es: 'Sin principios.', en: 'No principles.' },
  principleTitle: { es: 'Título', en: 'Title' },
  principleBody: { es: 'Texto', en: 'Text' },
  now: { es: 'En qué ando ahora', en: 'What I’m working on' },
  nowLead: { es: 'Cada punto lleva el punto naranja de "en curso".', en: 'Each item gets the orange "in progress" dot.' },
  nowTitle: { es: 'Título del bloque', en: 'Block title' },
  nowItems: { es: 'Puntos', en: 'Items' },
}

export function AboutEditor({
  initial,
  savedAt,
  onSaved,
  onDirtyChange,
}: {
  initial: AboutContent
  savedAt?: string
  onSaved: (data: AboutContent, savedAt: string) => void
  onDirtyChange: (dirty: boolean) => void
}) {
  const { lang, pick } = useLang()
  const editor = useSectionEditor({
    initial,
    onDirtyChange,
    persist: async (clean) => onSaved(clean, await saveSection('about', clean)),
  })
  const { draft, setDraft } = editor
  const set = <K extends keyof AboutContent>(key: K, value: AboutContent[K]) => setDraft((d) => ({ ...d, [key]: value }))

  return (
    <EditorShell title={pick(copy.title)} lead={pick(copy.lead)} savedAt={savedAt} editor={editor} viewHref="/#sobre-mi">
      <Section title={pick(copy.story)} lead={pick(copy.storyLead)}>
        <BiLines
          label={pick(copy.paragraphs)}
          value={draft.paragraphs}
          onChange={(v) => set('paragraphs', v)}
          mode="paragraphs"
          rows={12}
          hint={pick(kit.paragraphs)}
        />
      </Section>

      <Section title={pick(copy.motto)} lead={pick(copy.mottoLead)}>
        <BiText label={pick(copy.mottoText)} value={draft.motto} onChange={(v) => set('motto', v)} />
        <BiArea label={pick(copy.mottoBody)} value={draft.mottoBody} onChange={(v) => set('mottoBody', v)} rows={2} />
      </Section>

      <Section title={pick(copy.principles)} lead={pick(copy.principlesLead)}>
        <ListEditor
          items={draft.principles}
          onChange={(v) => set('principles', v)}
          blank={BLANK.principle}
          addLabel={pick(copy.addPrinciple)}
          emptyLabel={pick(copy.emptyPrinciples)}
          itemTitle={(p) => p.title[lang] || p.title.es}
        >
          {(p, update) => (
            <>
              <BiText label={pick(copy.principleTitle)} value={p.title} onChange={(v) => update({ title: v })} />
              <BiArea label={pick(copy.principleBody)} value={p.body} onChange={(v) => update({ body: v })} rows={2} />
            </>
          )}
        </ListEditor>
      </Section>

      <Section title={pick(copy.now)} lead={pick(copy.nowLead)}>
        <BiText label={pick(copy.nowTitle)} value={draft.now.title} onChange={(v) => set('now', { ...draft.now, title: v })} />
        <BiLines
          label={pick(copy.nowItems)}
          value={draft.now.items}
          onChange={(v) => set('now', { ...draft.now, items: v })}
          rows={4}
          hint={pick(kit.oneLine)}
        />
      </Section>
    </EditorShell>
  )
}
