import type { Bi } from '@/lib/types'

/**
 * Textos del sitio nuevo (cabecera, portada, pie). Bilingüe.
 * El contenido del CV sigue en src/data/profile.ts.
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
  },
  hero: {
    headline: {
      es: 'Automatizo el trabajo que tu equipo hace a mano.',
      en: 'I automate the work your team does by hand.',
    } satisfies Bi,
    sub: {
      es: 'Soy Elkin Moreno, Full Stack Developer y Automation Engineer en Madrid. Construyo herramientas internas y automatizaciones con n8n, Symfony, React e IA para equipos de operaciones.',
      en: "I'm Elkin Moreno, a Full Stack Developer and Automation Engineer based in Madrid. I build internal tools and automations with n8n, Symfony, React and AI for operations teams.",
    } satisfies Bi,
    ctaPrimary: { es: 'Escríbeme', en: 'Get in touch' } satisfies Bi,
    ctaCv: { es: 'Descargar CV', en: 'Download CV' } satisfies Bi,
    availability: { es: 'Abierto a empleo y proyectos freelance', en: 'Open to full-time roles and freelance work' } satisfies Bi,
    location: { es: 'Madrid, España', en: 'Madrid, Spain' } satisfies Bi,
    now: { es: 'Ahora en Closer Logistics', en: 'Now at Closer Logistics' } satisfies Bi,
    workMode: {
      es: 'Permiso de trabajo en España · Presencial, híbrido o remoto',
      en: 'Authorised to work in Spain · On-site, hybrid or remote',
    } satisfies Bi,
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
