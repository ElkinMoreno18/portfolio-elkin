import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { Bi, Lang } from '@/lib/types'

interface LangContextValue {
  lang: Lang
  setLang: (l: Lang) => void
  toggleLang: () => void
  /** Elige el idioma activo de un objeto { es, en }. */
  pick: (bi: Bi | { es: string; en: string }) => string
  /** Elige entre los campos gemelos `algo_es` / `algo_en` de un registro. */
  field: (row: object, base: string) => string
}

const LangContext = createContext<LangContextValue | null>(null)

const STORAGE_KEY = 'em-lang'

function detectInitial(): Lang {
  if (typeof window === 'undefined') return 'es'
  const saved = window.localStorage.getItem(STORAGE_KEY)
  if (saved === 'es' || saved === 'en') return saved
  return navigator.language?.toLowerCase().startsWith('en') ? 'en' : 'es'
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectInitial)

  useEffect(() => {
    document.documentElement.lang = lang
    try {
      window.localStorage.setItem(STORAGE_KEY, lang)
    } catch {
      /* modo incógnito: seguimos igual, sólo no recordamos la elección */
    }
  }, [lang])

  const setLang = useCallback((l: Lang) => setLangState(l), [])
  const toggleLang = useCallback(() => setLangState((l) => (l === 'es' ? 'en' : 'es')), [])

  const value = useMemo<LangContextValue>(() => {
    return {
      lang,
      setLang,
      toggleLang,
      pick: (bi) => bi[lang],
      field: (row, base) => {
        const rec = row as Record<string, unknown>
        const primary = rec[`${base}_${lang}`]
        if (typeof primary === 'string' && primary.trim()) return primary
        // Si falta la traducción, mejor mostrar el otro idioma que un hueco.
        const fallback = rec[`${base}_${lang === 'es' ? 'en' : 'es'}`]
        return typeof fallback === 'string' ? fallback : ''
      },
    }
  }, [lang, setLang, toggleLang])

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLang() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang debe usarse dentro de <LangProvider>')
  return ctx
}
