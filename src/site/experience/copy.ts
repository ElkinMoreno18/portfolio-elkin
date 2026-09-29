/**
 * Textos de interfaz de la sección de experiencia. El contenido (puestos,
 * logros, formación) sigue en src/data/profile.ts.
 */
export const expCopy = {
  title: { es: 'Experiencia', en: 'Experience' },
  lead: {
    es: 'De webs corporativas en Costa Rica a automatizar la logística de última milla en Madrid.',
    en: 'From corporate websites in Costa Rica to automating last-mile logistics in Madrid.',
  },
  jobsLabel: { es: 'Puestos, del más reciente al más antiguo', en: 'Roles, most recent first' },
  achievements: { es: 'Logros', en: 'Highlights' },
  tech: { es: 'Tecnologías', en: 'Technologies' },
  duration: { es: 'Duración', en: 'Duration' },
  more: {
    es: (n: number) => `Ver ${n} logros más`,
    en: (n: number) => `Show ${n} more`,
  },
  less: { es: 'Ver menos', en: 'Show less' },
  education: { es: 'Formación', en: 'Education' },
  languages: { es: 'Idiomas', en: 'Languages' },
  cv: { es: 'Descargar CV', en: 'Download CV' },
  cvMeta: { es: 'PDF', en: 'PDF' },
} as const
