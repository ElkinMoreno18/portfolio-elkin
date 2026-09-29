import { useRef, useState } from 'react'
import { X } from 'lucide-react'
import { useLang } from '@/i18n'
import { cn } from '@/lib/utils'
import { adminFrameWithin } from './Field'

const copy = {
  remove: { es: 'Quitar', en: 'Remove' },
}

/**
 * Chips de tecnologías: Enter o coma añade, Backspace en vacío borra la
 * última. Pegar "React, Node, Redis" crea las tres de una vez.
 */
export function TagInput({
  id,
  value,
  onChange,
  placeholder,
  describedBy,
}: {
  id?: string
  value: string[]
  onChange: (v: string[]) => void
  placeholder: string
  describedBy?: string
}) {
  const { pick } = useLang()
  const [draft, setDraft] = useState('')
  const input = useRef<HTMLInputElement>(null)

  function commit() {
    const incoming = draft
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
    if (!incoming.length) return setDraft('')
    const next = [...value]
    for (const tag of incoming) if (!next.includes(tag)) next.push(tag)
    if (next.length !== value.length) onChange(next)
    setDraft('')
  }

  return (
    <div
      // Clic en el hueco del marco: el foco va al input, como en un campo normal.
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          e.preventDefault()
          input.current?.focus()
        }
      }}
      className={cn(adminFrameWithin, 'flex min-h-9 cursor-text flex-wrap items-center gap-1.5 px-1.5 py-1.5')}
    >
      {value.map((tag) => (
        <span
          key={tag}
          className="inline-flex h-6 items-center gap-0.5 rounded-[5px] border border-line-strong bg-surface-2 pr-0.5 pl-2 font-mono text-[12px] leading-none text-text-2"
        >
          {tag}
          <button
            type="button"
            onClick={() => onChange(value.filter((x) => x !== tag))}
            aria-label={`${pick(copy.remove)} ${tag}`}
            className="grid size-5 place-items-center rounded-[4px] text-text-3 transition-colors duration-150 hover:bg-surface hover:text-text"
          >
            <X size={12} strokeWidth={1.75} aria-hidden />
          </button>
        </span>
      ))}
      <input
        ref={input}
        id={id}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' && !e.metaKey && !e.ctrlKey) || e.key === ',') {
            e.preventDefault()
            commit()
          } else if (e.key === 'Enter') {
            // Cmd/Ctrl + Enter guarda el formulario: primero se añade lo escrito.
            commit()
          } else if (e.key === 'Backspace' && !draft && value.length) {
            onChange(value.slice(0, -1))
          }
        }}
        onPaste={(e) => {
          const text = e.clipboardData.getData('text')
          if (!text.includes(',')) return
          e.preventDefault()
          const incoming = (draft + text)
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
          const next = [...value]
          for (const tag of incoming) if (!next.includes(tag)) next.push(tag)
          onChange(next)
          setDraft('')
        }}
        onBlur={commit}
        aria-describedby={describedBy}
        placeholder={value.length ? '' : placeholder}
        className="h-6 min-w-40 flex-1 bg-transparent px-1.5 text-[14px] text-text placeholder:text-placeholder focus:outline-none focus-visible:outline-none"
      />
    </div>
  )
}
