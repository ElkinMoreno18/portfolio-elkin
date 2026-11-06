/**
 * Textos de interfaz de "Sobre mí". La historia, la frase, los principios y
 * la lista de "ahora" son contenido editable (useContent().about).
 */
export const aboutCopy = {
  title: { es: 'Sobre mí', en: 'About me' },
  portraitAlt: { es: 'Retrato de', en: 'Portrait of' },
  principlesLabel: { es: 'Principios de trabajo', en: 'Working principles' },
} as const

/** Ruta opcional del retrato. Si no carga, no se pinta nada en su lugar. */
export const PORTRAIT_SRC = '/portrait.jpg'

/**
 * Las rayas (—) no entran en el sitio. Un inciso entre rayas pasa a
 * paréntesis y una raya suelta, a coma. El texto de origen no se toca.
 */
export function plain(text: string) {
  return text
    .replace(/\s*—\s*([^—]+?)\s*—\s*/g, ' ($1) ')
    .replace(/\s+—\s+/g, ', ')
    .replace(/\s{2,}/g, ' ')
    .trim()
}
