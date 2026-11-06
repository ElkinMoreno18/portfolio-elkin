import { useRef, useState } from 'react'
import { ArrowUpRight, FileText, ImagePlus, LoaderCircle } from 'lucide-react'
import { useLang } from '@/i18n'
import { saveSection, uploadSiteFile } from '@/lib/contentApi'
import type { ProfileContent } from '@/content/types'
import { Button } from '@/site/ui'
import { AdminField, FieldError, Toggle } from '@/components/admin/Field'
import { BiArea, BiText, EditorShell, Section, TextField, tidy, useSectionEditor } from './kit'

const copy = {
  title: { es: 'Perfil', en: 'Profile' },
  lead: {
    es: 'Quién eres, el titular de la portada, tu disponibilidad, tus enlaces y tu CV. Lo que guardes aquí cambia en todo el sitio.',
    en: 'Who you are, the homepage headline, your availability, your links and your CV. What you save here changes across the whole site.',
  },
  identity: { es: 'Identidad', en: 'Identity' },
  name: { es: 'Nombre visible', en: 'Display name' },
  nameHint: { es: 'Cabecera, pie y portada.', en: 'Header, footer and homepage.' },
  fullName: { es: 'Nombre completo', en: 'Full name' },
  fullNameHint: { es: 'Aparece en el aviso de derechos del pie.', en: 'Shown in the footer copyright line.' },
  role: { es: 'Título profesional', en: 'Professional title' },
  hero: { es: 'Portada', en: 'Homepage' },
  heroLead: {
    es: 'Lo primero que lee un reclutador. El titular, corto y concreto; la entradilla, quién eres y qué haces.',
    en: 'The first thing a recruiter reads. A short, concrete headline; the intro says who you are and what you do.',
  },
  headline: { es: 'Titular', en: 'Headline' },
  sub: { es: 'Entradilla', en: 'Intro' },
  availability: { es: 'Disponibilidad', en: 'Availability' },
  available: { es: 'Abierto a ofertas', en: 'Open to offers' },
  availableDesc: {
    es: 'Encendido, la portada, el contacto y cada proyecto muestran tu disponibilidad con el punto naranja.',
    en: 'When on, the homepage, contact and every project show your availability with the orange dot.',
  },
  availabilityText: { es: 'Texto de disponibilidad', en: 'Availability text' },
  workMode: { es: 'Permiso y modalidad', en: 'Work authorisation and mode' },
  workModeHint: {
    es: 'Separa las partes con « · » (punto medio con espacios): en la portada cada parte va en su línea.',
    en: 'Separate the parts with " · " (middle dot with spaces): each part gets its own line on the homepage.',
  },
  location: { es: 'Ubicación', en: 'Location' },
  links: { es: 'Contacto y enlaces', en: 'Contact and links' },
  email: { es: 'Email', en: 'Email' },
  emailHint: { es: 'Recibe las respuestas del formulario y aparece en Contacto.', en: 'Shown in Contact and used for replies.' },
  linkedin: { es: 'LinkedIn', en: 'LinkedIn' },
  github: { es: 'GitHub', en: 'GitHub' },
  linkHint: { es: 'Vacío: no se muestra.', en: 'Empty: hidden.' },
  files: { es: 'CV y foto', en: 'CV and photo' },
  filesLead: {
    es: 'El CV se descarga desde la portada, la experiencia, el contacto y cada proyecto. La foto es opcional.',
    en: 'The CV downloads from the homepage, experience, contact and every project. The photo is optional.',
  },
  cv: { es: 'CV en PDF', en: 'CV as PDF' },
  cvCurrent: { es: 'Actual', en: 'Current' },
  cvUpload: { es: 'Subir otro PDF', en: 'Upload another PDF' },
  cvView: { es: 'Abrir', en: 'Open' },
  cvOnlyPdf: { es: 'Sube un archivo PDF.', en: 'Upload a PDF file.' },
  portrait: { es: 'Foto', en: 'Photo' },
  portraitHint: {
    es: 'Vertical (4:5), al menos 800 px de alto. Sin foto, "Sobre mí" ocupa todo el ancho.',
    en: 'Portrait (4:5), at least 800 px tall. Without a photo, "About" uses the full width.',
  },
  portraitUpload: { es: 'Subir foto', en: 'Upload photo' },
  portraitReplace: { es: 'Cambiar', en: 'Replace' },
  portraitRemove: { es: 'Quitar', en: 'Remove' },
  uploading: { es: 'Subiendo…', en: 'Uploading…' },
  uploadFailed: { es: 'No se pudo subir', en: 'Upload failed' },
  errName: { es: 'Escribe tu nombre.', en: 'Enter your name.' },
  errHeadline: { es: 'Escribe el titular de la portada en español.', en: 'Enter the Spanish homepage headline.' },
  errEmail: { es: 'El email no parece válido.', en: 'The email does not look valid.' },
  fileNote: {
    es: 'El archivo se sube ya; el perfil lo usa cuando guardes.',
    en: 'The file uploads now; the profile uses it once you save.',
  },
}

const ic = { size: 16, strokeWidth: 1.5, 'aria-hidden': true } as const

export function ProfileEditor({
  initial,
  savedAt,
  onSaved,
  onDirtyChange,
}: {
  initial: ProfileContent
  savedAt?: string
  onSaved: (data: ProfileContent, savedAt: string) => void
  onDirtyChange: (dirty: boolean) => void
}) {
  const { pick } = useLang()
  const editor = useSectionEditor({
    initial,
    onDirtyChange,
    prepare: (p) => {
      const clean = tidy(p)
      if (!clean.name) throw new Error(pick(copy.errName))
      if (!clean.headline.es) throw new Error(pick(copy.errHeadline))
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(clean.email)) throw new Error(pick(copy.errEmail))
      return clean
    },
    persist: async (clean) => onSaved(clean, await saveSection('profile', clean)),
  })
  const { draft, setDraft } = editor
  const set = <K extends keyof ProfileContent>(key: K, value: ProfileContent[K]) => setDraft((d) => ({ ...d, [key]: value }))

  return (
    <EditorShell title={pick(copy.title)} lead={pick(copy.lead)} savedAt={savedAt} editor={editor} viewHref="/">
      <Section title={pick(copy.hero)} lead={pick(copy.heroLead)}>
        <BiText label={pick(copy.headline)} value={draft.headline} onChange={(v) => set('headline', v)} />
        <BiArea label={pick(copy.sub)} value={draft.sub} onChange={(v) => set('sub', v)} rows={4} />
      </Section>

      <Section title={pick(copy.availability)}>
        <Toggle
          checked={draft.available}
          onChange={(v) => set('available', v)}
          label={pick(copy.available)}
          description={pick(copy.availableDesc)}
        />
        <BiText label={pick(copy.availabilityText)} value={draft.availability} onChange={(v) => set('availability', v)} />
        <BiText label={pick(copy.workMode)} value={draft.workMode} onChange={(v) => set('workMode', v)} hint={pick(copy.workModeHint)} />
        <BiText label={pick(copy.location)} value={draft.location} onChange={(v) => set('location', v)} />
      </Section>

      <Section title={pick(copy.identity)}>
        <div className="grid gap-5 sm:grid-cols-2 sm:gap-4">
          <TextField label={pick(copy.name)} value={draft.name} onChange={(v) => set('name', v)} hint={pick(copy.nameHint)} />
          <TextField label={pick(copy.fullName)} value={draft.fullName} onChange={(v) => set('fullName', v)} hint={pick(copy.fullNameHint)} />
        </div>
        <BiText label={pick(copy.role)} value={draft.title} onChange={(v) => set('title', v)} />
      </Section>

      <Section title={pick(copy.links)}>
        <TextField
          label={pick(copy.email)}
          type="email"
          inputMode="email"
          value={draft.email}
          onChange={(v) => set('email', v)}
          hint={pick(copy.emailHint)}
          mono
        />
        <div className="grid gap-5 sm:grid-cols-2 sm:gap-4">
          <TextField
            label={pick(copy.linkedin)}
            type="url"
            inputMode="url"
            value={draft.linkedin}
            onChange={(v) => set('linkedin', v)}
            placeholder="https://linkedin.com/in/…"
            hint={pick(copy.linkHint)}
            mono
          />
          <TextField
            label={pick(copy.github)}
            type="url"
            inputMode="url"
            value={draft.github}
            onChange={(v) => set('github', v)}
            placeholder="https://github.com/…"
            hint={pick(copy.linkHint)}
            mono
          />
        </div>
      </Section>

      <Section title={pick(copy.files)} lead={pick(copy.filesLead)}>
        <CvField url={draft.cvUrl} onChange={(v) => set('cvUrl', v)} />
        <PortraitField url={draft.portraitUrl} onChange={(v) => set('portraitUrl', v)} />
        <p className="text-[12px] text-text-3">{pick(copy.fileNote)}</p>
      </Section>
    </EditorShell>
  )
}

/** Nombre legible del archivo de una URL ("/CV_Elkin_Moreno.pdf" → "CV_Elkin_Moreno.pdf"). */
function fileName(url: string) {
  return decodeURIComponent(url.split('?')[0].split('/').pop() || url)
}

function useUpload(kind: 'cv' | 'portrait', onDone: (url: string) => void) {
  const { pick } = useLang()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  async function upload(file: File | undefined, check?: (f: File) => string | null) {
    if (!file) return
    const problem = check?.(file)
    if (problem) {
      setError(problem)
      return
    }
    setBusy(true)
    setError(null)
    try {
      onDone(await uploadSiteFile(file, kind))
    } catch (err) {
      setError(`${pick(copy.uploadFailed)}: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setBusy(false)
    }
  }
  return { busy, error, upload }
}

function CvField({ url, onChange }: { url: string; onChange: (url: string) => void }) {
  const { pick } = useLang()
  const input = useRef<HTMLInputElement>(null)
  const { busy, error, upload } = useUpload('cv', onChange)
  return (
    <AdminField label={pick(copy.cv)}>
      <div className="flex flex-wrap items-center gap-3 rounded-[var(--radius-md)] border border-line bg-bg px-3 py-2.5">
        <FileText {...ic} className="shrink-0 text-text-3" />
        <div className="min-w-0 flex-1">
          <p className="text-[12px] text-text-3">{pick(copy.cvCurrent)}</p>
          <p className="truncate font-mono text-[13px] text-text" title={url}>
            {fileName(url)}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-8 items-center gap-1.5 rounded-[var(--radius-sm)] px-3 text-[13px] font-medium text-text-2 transition-colors hover:bg-surface hover:text-text"
          >
            {pick(copy.cvView)}
            <ArrowUpRight {...ic} size={14} />
          </a>
          <Button type="button" variant="secondary" size="sm" onClick={() => input.current?.click()} disabled={busy} aria-busy={busy}>
            {busy && <LoaderCircle {...ic} size={14} className="animate-spin" />}
            {pick(busy ? copy.uploading : copy.cvUpload)}
          </Button>
        </div>
      </div>
      {error && <FieldError>{error}</FieldError>}
      <input
        ref={input}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        tabIndex={-1}
        aria-hidden
        onChange={(e) => {
          void upload(e.target.files?.[0], (f) => (/pdf$/i.test(f.type) || /\.pdf$/i.test(f.name) ? null : pick(copy.cvOnlyPdf)))
          e.target.value = ''
        }}
      />
    </AdminField>
  )
}

function PortraitField({ url, onChange }: { url: string; onChange: (url: string) => void }) {
  const { pick } = useLang()
  const input = useRef<HTMLInputElement>(null)
  const { busy, error, upload } = useUpload('portrait', onChange)
  const [broken, setBroken] = useState<string | null>(null)
  const pickFile = () => input.current?.click()
  return (
    <AdminField label={pick(copy.portrait)} hint={pick(copy.portraitHint)}>
      <div className="flex items-start gap-4">
        {url && broken !== url ? (
          <img
            src={url}
            alt=""
            onError={() => setBroken(url)}
            className="aspect-[4/5] w-24 shrink-0 rounded-[var(--radius-sm)] border border-line bg-surface object-cover"
          />
        ) : (
          <button
            type="button"
            onClick={pickFile}
            disabled={busy}
            className="grid aspect-[4/5] w-24 shrink-0 place-items-center rounded-[var(--radius-sm)] border border-dashed border-line-strong bg-bg text-text-3 transition-colors hover:border-text-3 hover:text-text"
          >
            <ImagePlus {...ic} size={18} />
            <span className="sr-only">{pick(copy.portraitUpload)}</span>
          </button>
        )}
        <div className="flex flex-wrap items-center gap-1 pt-1">
          <Button type="button" variant="secondary" size="sm" onClick={pickFile} disabled={busy} aria-busy={busy}>
            {busy && <LoaderCircle {...ic} size={14} className="animate-spin" />}
            {pick(busy ? copy.uploading : url ? copy.portraitReplace : copy.portraitUpload)}
          </Button>
          {url && (
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange('')} disabled={busy}>
              {pick(copy.portraitRemove)}
            </Button>
          )}
        </div>
      </div>
      {error && <FieldError>{error}</FieldError>}
      <input
        ref={input}
        type="file"
        accept="image/*"
        className="hidden"
        tabIndex={-1}
        aria-hidden
        onChange={(e) => {
          void upload(e.target.files?.[0])
          e.target.value = ''
        }}
      />
    </AdminField>
  )
}
