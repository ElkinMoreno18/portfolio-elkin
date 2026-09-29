/**
 * Textos de interfaz de la sección de proyectos y del detalle. Bilingüe.
 * El contenido de cada proyecto viene de los datos (seed o Supabase).
 * Reglas: sin rayas (—), sin tricolones, sin palabras de humo.
 */
export const projectsCopy = {
  title: {
    es: 'Lo que he construido y el problema de fondo.',
    en: "What I've built, and the problem behind it.",
  },
  lead: {
    es: 'Primero, automatización y herramientas internas. Después, webs hechas en agencia con capturas reales y, al final, un índice del resto.',
    en: 'Automation and internal tools first. Then agency-built websites in real screenshots, and an index of the rest.',
  },
  filterLabel: { es: 'Filtrar por tipo', en: 'Filter by type' },
  all: { es: 'Todos', en: 'All' },
  count: {
    es: (n: number) => `${n} ${n === 1 ? 'proyecto' : 'proyectos'}`,
    en: (n: number) => `${n} ${n === 1 ? 'project' : 'projects'}`,
  },
  role: { es: 'Mi rol', en: 'My role' },
  view: { es: 'Ver proyecto', en: 'View project' },
  flowSchematic: { es: 'Esquema del flujo', en: 'Flow schematic' },
  stackSchematic: { es: 'Stack por capas', en: 'Stack by layer' },
  schematicNote: {
    es: 'Esquema a partir de la descripción del proyecto',
    en: 'Drawn from the project description',
  },
  errorPath: { es: 'Ruta de error', en: 'Error path' },
  mainPath: { es: 'Ruta principal', en: 'Main path' },
  screenshotAlt: {
    es: (t: string) => `Captura de la portada de ${t}`,
    en: (t: string) => `Screenshot of the ${t} home page`,
  },
  table: {
    year: { es: 'Año', en: 'Year' },
    project: { es: 'Proyecto', en: 'Project' },
    outcome: { es: 'Resultado', en: 'Outcome' },
    stack: { es: 'Stack', en: 'Stack' },
  },
  more: {
    es: (n: number) => `+${n}`,
    en: (n: number) => `+${n}`,
  },
  devDemo: {
    es: 'Solo en desarrollo: se muestran los proyectos de ejemplo (seedProjects), Supabase no devolvió datos.',
    en: 'Dev only: showing the seed projects, Supabase returned no rows.',
  },
  loading: { es: 'Cargando proyectos', en: 'Loading projects' },

  /* ── Detalle ── */
  back: { es: 'Proyectos', en: 'Projects' },
  type: { es: 'Tipo', en: 'Type' },
  year: { es: 'Año', en: 'Year' },
  tech: { es: 'Tecnologías', en: 'Stack' },
  links: { es: 'Enlaces', en: 'Links' },
  repo: { es: 'Código fuente', en: 'Source code' },
  demo: { es: 'Ver en vivo', en: 'Live site' },
  gallery: { es: 'Galería', en: 'Gallery' },
  galleryAlt: {
    es: (t: string, i: number) => `${t}, imagen ${i} de la galería`,
    en: (t: string, i: number) => `${t}, gallery image ${i}`,
  },
  next: { es: 'Siguiente proyecto', en: 'Next project' },
  loadingProject: { es: 'Cargando proyecto', en: 'Loading project' },
  notFoundTitle: { es: 'No encuentro ese proyecto.', en: "I can't find that project." },
  notFoundLead: {
    es: 'Puede que el enlace esté mal escrito o que el proyecto ya no esté publicado.',
    en: 'The link may be mistyped, or the project is no longer published.',
  },
  notFoundCta: { es: 'Ver todos los proyectos', en: 'See all projects' },
  docTitle: { es: 'Proyecto no encontrado', en: 'Project not found' },
} as const
