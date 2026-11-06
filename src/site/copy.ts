import type { Bi } from '@/lib/types'

/**
 * Textos de interfaz del sitio (cabecera, botones, pie). Bilingüe.
 * El contenido (perfil, experiencia, stack…) es editable desde /admin; sus
 * valores iniciales están en src/data/profile.ts.
 * Reglas: sin fórmula "construyo X que Y", sin tricolones, sin rayas (—).
 */
export const siteCopy = {
  nav: {
    work: { es: 'Proyectos', en: 'Work' },
    experience: { es: 'Experiencia', en: 'Experience' },
    stack: { es: 'Stack', en: 'Stack' },
    about: { es: 'Sobre mí', en: 'About' },
    contact: { es: 'Contacto', en: 'Contact' },
    cta: { es: 'Escríbeme', en: 'Get in touch' },
    langGroup: { es: 'Idioma', en: 'Language' },
    menu: { es: 'Menú', en: 'Menu' },
    close: { es: 'Cerrar', en: 'Close' },
    skip: { es: 'Saltar al contenido', en: 'Skip to content' },
    toLight: { es: 'Cambiar a modo claro', en: 'Switch to light mode' },
    toDark: { es: 'Cambiar a modo oscuro', en: 'Switch to dark mode' },
  },
  /** Botones de la portada. El titular, la entradilla, la disponibilidad y
   *  el resto de datos personales son contenido editable (useContent().profile). */
  hero: {
    ctaPrimary: { es: 'Escríbeme', en: 'Get in touch' } satisfies Bi,
    ctaCv: { es: 'Descargar CV', en: 'Download CV' } satisfies Bi,
  },
  /** meta description por idioma (la de index.html es la española). Sin
   *  cifras que el CV no respalde. */
  meta: {
    description: {
      es: 'Elkin Moreno, Full Stack Developer y Automation Engineer en Madrid. Automatización de operaciones con n8n, Symfony, React e IA. Abierto a empleo y proyectos freelance.',
      en: 'Elkin Moreno, Full Stack Developer and Automation Engineer based in Madrid. Operations automation with n8n, Symfony, React and AI. Open to full-time roles and freelance work.',
    } satisfies Bi,
  },
  /** Cierre de las páginas de proyecto. */
  closing: {
    label: { es: 'Contacto', en: 'Contact' } satisfies Bi,
  },
  footer: {
    rights: { es: 'Todos los derechos reservados.', en: 'All rights reserved.' },
    localTime: { es: 'Hora en Madrid', en: 'Madrid time' },
    toTop: { es: 'Volver arriba', en: 'Back to top' },
  },
}
