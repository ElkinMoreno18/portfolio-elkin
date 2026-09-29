import type { Project } from '@/lib/types'

/**
 * Proyectos de ejemplo, derivados de la experiencia real del CV.
 *
 * Sirven para dos cosas:
 *  1. Que el portafolio se vea completo desde el primer `npm run dev`,
 *     aunque todavía no hayas configurado Supabase.
 *  2. Que tengas una plantilla de cómo redactar los tuyos en /admin.
 *
 * VERDAD: cada hecho y cada cifra de los seis primeros sale de su CV
 * (src/data/profile.ts y public/CV_Elkin_Moreno.pdf), redactado de nuevo pero
 * sin añadir nada. Sin minutos, horas ni detalles técnicos que el CV no diga.
 * Revísalos igualmente: son un punto de partida redactado.
 * Cuando Supabase esté conectado y tenga proyectos, estos dejan de mostrarse.
 *
 * AÑOS: `year` es un número (ordena y se muestra). Con `ongoing` se pinta
 * "2025 – hoy"; con `year_start`, un periodo como "2022 – 2025".
 */
export const seedProjects: Project[] = [
  {
    id: 'seed-1',
    slug: 'automatizacion-flota-n8n',
    title_es: 'Automatización de procesos operativos y de flota',
    title_en: 'Operations and fleet process automation',
    tagline_es: 'Menos tareas manuales en los procesos operativos y de flota, con n8n.',
    tagline_en: 'Fewer manual tasks in operations and fleet processes, with n8n.',
    description_es:
      'En el equipo de Data & Automation de Closer Logistics, una empresa de logística de última milla, diseño e implemento automatizaciones con n8n para los procesos operativos y de flota. Con ellas, las tareas manuales de esos procesos se han reducido de forma significativa.\n\nTambién he automatizado los informes financieros, operativos y de flota, así que el equipo ya no tiene que montarlos a mano.\n\nEmpiezo siempre por entender dónde se pierde el tiempo. La automatización llega después, cuando el proceso ya está modelado.',
    description_en:
      "On the Data & Automation team at Closer Logistics, a last-mile logistics company, I design and implement n8n automations for operations and fleet processes. They've significantly cut the manual work in those processes.\n\nI've also automated the financial, operational and fleet reports, so the team no longer has to put them together by hand.\n\nI always start by finding where the time goes. The automation comes later, once the process has been modelled.",
    role_es: 'Diseño e implementación de los flujos en n8n y automatización de los informes.',
    role_en: 'Design and implementation of the n8n flows, and automation of the reports.',
    tech: ['n8n', 'Symfony', 'PHP'],
    category: 'automation',
    cover_url: null,
    gallery: [],
    repo_url: null,
    demo_url: null,
    metrics: [],
    // Puesto actual (Jul 2025 – hoy): se muestra "2025 – hoy".
    year: 2025,
    ongoing: true,
    featured: true,
    published: true,
    sort_order: 1,
  },
  {
    id: 'seed-2',
    slug: 'erp-interno-symfony',
    title_es: 'Herramientas internas tipo ERP',
    title_en: 'Internal ERP-style tools',
    tagline_es: 'Backend en Symfony para consultar y analizar datos que llegan de sistemas internos y externos.',
    tagline_en: 'A Symfony backend to query and analyse data from internal and external systems.',
    description_es:
      'Desarrollo con Symfony (PHP) el backend de las herramientas internas tipo ERP de Closer Logistics, pensadas para consultar y analizar datos.\n\nLa información les llega desde sistemas internos y externos, que integro mediante mensajería asíncrona con RabbitMQ y Google Pub/Sub, con Redis como caché. El objetivo es consolidar fuentes que estaban dispersas en una base fiable para tomar decisiones operativas.',
    description_en:
      "I develop the Symfony (PHP) backend of Closer Logistics' internal ERP-style tools, which the team uses to query and analyse data.\n\nThe data reaches them from internal and external systems. I integrate those systems through async messaging on RabbitMQ and Google Pub/Sub, with Redis as a cache. The goal is to consolidate scattered sources into a reliable basis for operational decisions.",
    role_es: 'Desarrollo backend en Symfony, integración asíncrona entre sistemas y caché.',
    role_en: 'Symfony backend development, async integration between systems and caching.',
    tech: ['Symfony', 'PHP', 'RabbitMQ', 'Google Pub/Sub', 'Redis'],
    category: 'erp',
    cover_url: null,
    gallery: [],
    repo_url: null,
    demo_url: null,
    metrics: [],
    year: 2025,
    ongoing: true,
    featured: true,
    published: true,
    sort_order: 2,
  },
  {
    id: 'seed-3',
    slug: 'chatbots-internos-ia',
    title_es: 'Chatbots internos con IA para RRHH y Operaciones',
    title_en: 'Internal AI chatbots for HR and Operations',
    tagline_es: 'Respuestas más rápidas a las consultas frecuentes de RRHH y Operaciones.',
    tagline_en: 'Faster answers to the questions HR and Operations get asked most.',
    description_es:
      'He desarrollado chatbots internos con IA para los equipos de RRHH y Operaciones de Closer Logistics.\n\nSu función es agilizar la resolución de las consultas frecuentes que reciben esos equipos.',
    description_en:
      "I've built internal AI chatbots for the HR and Operations teams at Closer Logistics.\n\nTheir job is to speed up answers to the questions those teams get asked most often.",
    role_es: 'Desarrollo de los chatbots e integración del modelo de IA.',
    role_en: 'Chatbot development and AI model integration.',
    tech: ['IA'],
    category: 'ai',
    cover_url: null,
    gallery: [],
    repo_url: null,
    demo_url: null,
    metrics: [],
    year: 2025,
    ongoing: true,
    featured: true,
    published: true,
    sort_order: 3,
  },
  {
    id: 'seed-4',
    slug: 'cotizador-y-comisiones',
    title_es: 'Cotizadores, comisiones e informes de rentabilidad',
    title_en: 'Quoting, commissions and profitability reports',
    tagline_es: 'Herramientas internas que redujeron un 50% los tiempos operativos.',
    tagline_en: 'Internal tools that cut operational time by 50%.',
    description_es:
      'Como líder de desarrollo frontend en Infinivirt Technologies diseñé y desarrollé herramientas internas: cotizadores en línea, sistemas de comisiones e informes de rentabilidad. Redujeron los tiempos operativos un 50%.\n\nEn ese mismo puesto coordiné la entrega de más de 10 proyectos frontend con gestión por sprints.',
    description_en:
      "As frontend development lead at Infinivirt Technologies I designed and developed internal tools: online quoting tools, commission systems and profitability reports. They cut operational time by 50%.\n\nIn the same role I coordinated the delivery of more than 10 frontend projects, managed in sprints.",
    role_es: 'Líder de desarrollo frontend: diseño y desarrollo de las herramientas.',
    role_en: 'Frontend development lead: design and development of the tools.',
    tech: ['React', 'JavaScript'],
    category: 'erp',
    cover_url: null,
    gallery: [],
    repo_url: null,
    demo_url: null,
    metrics: [
      { value: '−50%', label_es: 'de tiempo operativo', label_en: 'operational time' },
    ],
    year: 2022,
    featured: false,
    published: true,
    sort_order: 8,
  },
  {
    id: 'seed-5',
    slug: 'dashboards-power-bi',
    title_es: 'Dashboards interactivos en Power BI',
    title_en: 'Interactive Power BI dashboards',
    tagline_es: 'Visibilidad en tiempo real de las métricas clave.',
    tagline_en: 'Real-time visibility into key metrics.',
    description_es:
      'En Infinivirt Technologies implementé dashboards interactivos con Power BI para mejorar la visibilidad de las métricas clave y la toma de decisiones en tiempo real.',
    description_en:
      'At Infinivirt Technologies I built interactive Power BI dashboards to improve visibility into key metrics and support real-time decision-making.',
    role_es: 'Implementación de los dashboards.',
    role_en: 'Dashboard implementation.',
    tech: ['Power BI'],
    category: 'data',
    cover_url: null,
    gallery: [],
    repo_url: null,
    demo_url: null,
    metrics: [],
    year: 2022,
    featured: false,
    published: true,
    sort_order: 9,
  },
  {
    id: 'seed-6',
    slug: 'plataformas-web-cms',
    title_es: 'Más de 20 sitios web para clientes',
    title_en: '20+ client websites',
    tagline_es: 'Sitios responsive con WordPress y Shopify, y proyectos en React hasta un 40% más rápidos.',
    tagline_en: 'Responsive sites on WordPress and Shopify, and React projects up to 40% faster.',
    description_es:
      'En Si Señor SAS desarrollé más de 20 sitios web responsive con WordPress y Shopify para clientes de sectores distintos, y mejoré su presencia digital en un 80%.\n\nParticipé en proyectos con React que aumentaron hasta un 40% la velocidad de carga y la interacción. Mejoré el flujo de desarrollo y automaticé tareas recurrentes, lo que redujo los tiempos de entrega un 30%.\n\nEn todos cuidé el SEO técnico, el rendimiento y las buenas prácticas de código.',
    description_en:
      "At Si Señor SAS I built more than 20 responsive websites on WordPress and Shopify for clients in different sectors, and improved their digital presence by 80%.\n\nI worked on React projects that improved load speed and interaction by up to 40%. I also improved the development flow and automated recurring tasks, which cut delivery times by 30%.\n\nOn every one of them I looked after technical SEO, performance and code quality.",
    role_es: 'Desarrollo full stack, rendimiento y SEO técnico.',
    role_en: 'Full stack development, performance and technical SEO.',
    tech: ['WordPress', 'Shopify', 'React', 'JavaScript', 'Elementor', 'Divi'],
    category: 'web',
    cover_url: null,
    gallery: [],
    repo_url: null,
    demo_url: null,
    metrics: [
      { value: '20+', label_es: 'sitios entregados', label_en: 'sites delivered' },
      { value: '+80%', label_es: 'presencia digital de clientes', label_en: 'client digital presence' },
      { value: '−30%', label_es: 'tiempo de entrega', label_en: 'delivery time' },
    ],
    // Todo su paso por Si Señor SAS (Nov 2022 – Jul 2025): "2022 – 2025".
    year: 2025,
    year_start: 2022,
    featured: false,
    published: true,
    sort_order: 7,
  },
  /*
   * Webs de clientes hechas en Si Señor SAS. Capturas reales que pasó Elkin.
   *
   * OJO, PRIMERA VERSIÓN PARA REVISAR: el texto solo dice lo que se ve en
   * cada captura, qué tipo de organización es y su papel general en Si Señor
   * según el CV (maquetación responsive, SEO técnico y rendimiento). Falta que
   * Elkin confirme en /admin:
   *  - el año real de cada web (ahora "2022 – 2025", su periodo en la agencia,
   *    porque un año concreto sería inventado);
   *  - el CMS o la tecnología de cada una (se quitó WordPress hasta confirmarlo);
   *  - qué hizo él en cada una;
   *  - si Yes Sir es la marca de la propia Si Señor SAS.
   */
  {
    id: 'seed-7',
    slug: 'aviatur-colombia-dmc',
    title_es: 'Aviatur Colombia DMC',
    title_en: 'Aviatur Colombia DMC',
    tagline_es: 'Web de una empresa de gestión de destino en Colombia, que abre con una toma aérea de la costa.',
    tagline_en: 'Website for a destination management company in Colombia, opening on an aerial shot of the coast.',
    description_es:
      'Sitio web de Aviatur Colombia DMC, una empresa de gestión de destino (DMC) centrada en los viajes a Colombia. En su versión en inglés, la portada abre con una toma aérea de la costa a todo el ancho, bajo un menú corto con selector de idioma.\n\nTrabajé en él en Si Señor SAS. Como en el resto de proyectos de la agencia, me ocupé de que fuera responsive y cuidé el SEO técnico y el rendimiento.',
    description_en:
      'Website for Aviatur Colombia DMC, a destination management company focused on travel to Colombia. In its English version, the home page opens on a full-width aerial shot of the coast, under a short menu with a language switcher.\n\nI worked on it at Si Señor SAS. As with every project there, I made sure it was responsive and looked after technical SEO and performance.',
    role_es: 'Desarrollo web en Si Señor SAS: maquetación responsive, rendimiento y SEO técnico.',
    role_en: 'Web development at Si Señor SAS: responsive build, performance and technical SEO.',
    tech: ['SEO técnico'],
    category: 'web',
    cover_url: '/projects/aviatur-colombia.webp',
    gallery: [],
    repo_url: null,
    demo_url: null,
    metrics: [],
    year: 2025,
    year_start: 2022,
    featured: false,
    published: true,
    sort_order: 4,
  },
  {
    id: 'seed-8',
    slug: 'mindhack',
    title_es: 'MindHack',
    title_en: 'MindHack',
    tagline_es: 'Web de una consultora de innovación corporativa que ofrece workshops y entrenamientos para equipos.',
    tagline_en: 'Website for a corporate innovation consultancy offering workshops and team training.',
    description_es:
      'MindHack se presenta como «el lado creativo de la innovación corporativa» y ofrece workshops y entrenamientos para equipos. El menú reúne esa oferta junto a sus propios contenidos (insights, una playlist y un centro de recursos) y termina en un botón para agendar cita. La portada abre con la foto de una sesión de trabajo en grupo.\n\nLa trabajé en Si Señor SAS con la misma base que el resto de proyectos de la agencia: diseño responsive, con cuidado del SEO técnico y del rendimiento.',
    description_en:
      'MindHack describes itself as "the creative side of corporate innovation" and offers workshops and training for teams. The menu sets that offer next to its own content (insights, a playlist and a resource centre) and ends in a button to book a meeting. The home page opens on a photo of a group working session.\n\nI worked on it at Si Señor SAS, on the same base as every other project there: a responsive build, with care for technical SEO and performance.',
    role_es: 'Desarrollo web en Si Señor SAS: maquetación responsive, rendimiento y SEO técnico.',
    role_en: 'Web development at Si Señor SAS: responsive build, performance and technical SEO.',
    tech: ['SEO técnico'],
    category: 'web',
    cover_url: '/projects/mindhack.webp',
    gallery: [],
    repo_url: null,
    demo_url: null,
    metrics: [],
    year: 2025,
    year_start: 2022,
    featured: false,
    published: true,
    sort_order: 5,
  },
  {
    id: 'seed-9',
    slug: 'yes-sir-agency',
    title_es: 'Yes Sir Agency',
    title_en: 'Yes Sir Agency',
    tagline_es: 'Web de una agencia de growth marketing, sobre fondo morado y con una ilustración de estilo 3D.',
    tagline_en: 'Website for a growth marketing agency, set on deep purple with a 3D-style illustration.',
    description_es:
      'Yes Sir Agency se presenta como una agencia de growth marketing y publicidad científica, con un método basado en Lean Startup y en la experimentación. La portada combina un fondo morado oscuro con una ilustración de estilo 3D.\n\nParticipé en su desarrollo en Si Señor SAS. Mi parte fue la de todos mis proyectos allí: que funcionara bien en cualquier pantalla, con el SEO técnico y el rendimiento cuidados.',
    description_en:
      'Yes Sir Agency presents itself as a growth marketing and scientific advertising agency, with a method built on Lean Startup and experimentation. The home page pairs a deep purple background with a 3D-style illustration.\n\nI worked on it at Si Señor SAS. My part was the same as on all my projects there: making it work well on any screen, with technical SEO and performance taken care of.',
    role_es: 'Desarrollo web en Si Señor SAS: maquetación responsive, rendimiento y SEO técnico.',
    role_en: 'Web development at Si Señor SAS: responsive build, performance and technical SEO.',
    tech: ['SEO técnico'],
    category: 'web',
    cover_url: '/projects/yes-sir-agency.webp',
    gallery: [],
    repo_url: null,
    demo_url: null,
    metrics: [],
    year: 2025,
    year_start: 2022,
    featured: false,
    published: true,
    sort_order: 6,
  },
]
