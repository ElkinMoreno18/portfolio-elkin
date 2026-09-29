import type { Bi } from '@/lib/types'

/**
 * Todo el contenido "fijo" del portafolio vive aquí, en los dos idiomas.
 * Los proyectos NO: esos se gestionan desde /admin (Supabase).
 *
 * Regla de redacción aplicada en todo el archivo: primero el resultado,
 * después la tecnología. "Reduje X un 40% con n8n", nunca "usé n8n".
 */

export const profile = {
  name: 'Elkin Moreno',
  fullName: 'Elkin Leonardo Moreno Mojica',
  initials: 'EM',
  location: { es: 'Madrid, España', en: 'Madrid, Spain' } satisfies Bi,
  email: 'elkinmoreno18@gmail.com',
  phone: '+34 614 560 817',
  phoneHref: '+34614560817',
  cvUrl: '/CV_Elkin_Moreno.pdf',
  available: true,

  availability: {
    es: 'Abierto a empleo y proyectos freelance',
    en: 'Open to full-time roles and freelance work',
  } satisfies Bi,

  socials: [
    { label: 'LinkedIn', href: 'https://linkedin.com/in/elkin-moreno18', icon: 'linkedin' },
    { label: 'GitHub', href: 'https://github.com/ElkinMoreno18', icon: 'github' },
    { label: 'Email', href: 'mailto:elkinmoreno18@gmail.com', icon: 'mail' },
  ],
} as const

/* ─────────────────────────── Sobre mí ─────────────────────────── */

export const about = {
  paragraphs: {
    es: [
      'Empecé montando sitios corporativos desde cero (dominio, hosting, servidor y código) y acabé descubriendo que lo que más me engancha está una capa más abajo: los procesos que nadie ve y que hacen que una empresa funcione o se atasque.',
      'Hoy, en el equipo de Data & Automation de Closer Logistics, mi trabajo es entender por qué un proceso operativo se atasca y devolverlo convertido en algo que funciona solo. A veces es una automatización en n8n o un chatbot con IA que agiliza las consultas frecuentes de RRHH y Operaciones. Otras, un backend en Symfony que reúne en un solo sitio datos que antes estaban dispersos.',
      'Vengo del análisis funcional, así que hago preguntas antes de escribir código. Modelo el proceso con quien lo vive cada día y solo entonces decido la arquitectura. Esa mezcla de análisis y desarrollo es lo que más aporto a un equipo.',
    ],
    en: [
      "I started out building corporate websites from scratch (domain, hosting, server and code), and found that what really hooks me sits one layer down: the processes nobody sees, which decide whether a company runs smoothly or grinds to a halt.",
      "Today, on Closer Logistics' Data & Automation team, my job is to understand why an operational process gets stuck and hand it back as something that runs on its own. Sometimes that's an n8n automation or an AI chatbot that speeds up answers to frequent HR and Operations questions. Other times it's a Symfony backend that brings scattered data into one place.",
      "I come from functional analysis, so I ask questions before I write code. I model the process with the people who live with it, and only then pick the architecture. That mix of analysis and engineering is what I bring to a team.",
    ],
  },

  now: {
    title: { es: 'En qué ando ahora', en: "What I'm working on" } satisfies Bi,
    items: {
      es: [
        'Automatizando informes de flota y finanzas en logística de última milla.',
        'Desarrollando chatbots internos con IA para RRHH y Operaciones.',
        'Abierto a un puesto en plantilla y a proyectos freelance.',
      ],
      en: [
        'Automating fleet and finance reporting in last-mile logistics.',
        'Building internal AI chatbots for HR and Operations.',
        'Open to a full-time role and to freelance projects.',
      ],
    },
  },

  principles: [
    {
      title: { es: 'El proceso antes que el framework', en: 'Process before framework' } satisfies Bi,
      body: {
        es: 'Un stack bonito sobre un proceso mal entendido sigue siendo un problema, solo que más caro.',
        en: 'A pretty stack on top of a misunderstood process is still a problem, just a more expensive one.',
      } satisfies Bi,
    },
    {
      title: { es: 'Si se hace dos veces, se automatiza', en: 'Done twice? Automate it' } satisfies Bi,
      body: {
        es: 'Cada tarea manual recurrente es deuda operativa. Mi trabajo es saldarla antes de que crezca.',
        en: 'Every recurring manual task is operational debt. My job is to pay it down before it compounds.',
      } satisfies Bi,
    },
    {
      title: { es: 'Medible o no cuenta', en: "If it can't be measured, it doesn't count" } satisfies Bi,
      body: {
        es: 'Tiempo ahorrado y errores evitados. Si no lo puedo medir, no sé si funcionó.',
        en: "Time saved and errors avoided. If I can't measure it, I can't tell whether it worked.",
      } satisfies Bi,
    },
  ],
}

/* ─────────────────────────── Stack ─────────────────────────── */

export interface StackGroup {
  key: string
  icon: string
  title: Bi
  note: Bi
  items: string[]
}

export const stack: StackGroup[] = [
  {
    key: 'frontend',
    icon: 'layout-dashboard',
    title: { es: 'Frontend', en: 'Frontend' },
    note: {
      es: 'Interfaces que aguantan datos reales, no solo el happy path.',
      en: 'Interfaces that survive real data, not just the happy path.',
    },
    items: ['React', 'Angular', 'Vue', 'TypeScript', 'JavaScript', 'HTML5', 'CSS3'],
  },
  {
    key: 'backend',
    icon: 'server',
    title: { es: 'Backend', en: 'Backend' },
    note: {
      es: 'APIs y dominio con Symfony; lo que tiene que durar, se escribe bien.',
      en: 'APIs and domain logic with Symfony; what has to last gets written properly.',
    },
    items: ['PHP', 'Symfony', 'Node.js', 'APIs RESTful'],
  },
  {
    key: 'automation',
    icon: 'workflow',
    title: { es: 'Automatización & IA', en: 'Automation & AI' },
    note: {
      es: 'Donde más impacto genero: quitar pasos manuales del día a día.',
      en: 'Where I create the most impact: removing manual steps from the daily grind.',
    },
    items: ['n8n', 'Chatbots con IA', 'Integración de modelos de IA', 'RPA'],
  },
  {
    key: 'messaging',
    icon: 'radio-tower',
    title: { es: 'Mensajería & Caché', en: 'Messaging & Cache' },
    note: {
      es: 'Sistemas que se hablan sin acoplarse y sin caerse a la vez.',
      en: 'Systems that talk without coupling, and without falling over together.',
    },
    items: ['RabbitMQ', 'Google Pub/Sub', 'Redis'],
  },
  {
    key: 'data',
    icon: 'database',
    title: { es: 'Bases de datos', en: 'Databases' },
    note: {
      es: 'Modelado pensando en cómo se va a consultar, no solo en cómo se guarda.',
      en: "Modelled around how it'll be queried, not just how it's stored.",
    },
    items: ['MySQL', 'PostgreSQL', 'MongoDB'],
  },
  {
    key: 'devops',
    icon: 'container',
    title: { es: 'Herramientas & DevOps', en: 'Tooling & DevOps' },
    note: {
      es: 'Entornos reproducibles y un historial de git que se puede leer.',
      en: 'Reproducible environments and a git history you can actually read.',
    },
    items: ['Git', 'GitHub', 'Docker'],
  },
  {
    key: 'cms',
    icon: 'shopping-bag',
    title: { es: 'CMS & E-commerce', en: 'CMS & E-commerce' },
    note: {
      es: '+20 sitios entregados; sé cuándo un CMS es la respuesta correcta.',
      en: '20+ sites delivered; I know when a CMS is the right answer.',
    },
    items: ['WordPress', 'Shopify', 'Elementor', 'Divi'],
  },
  {
    key: 'analysis',
    icon: 'git-branch',
    title: { es: 'Análisis & Documentación', en: 'Analysis & Documentation' },
    note: {
      es: 'El puente entre negocio y técnica: requisitos claros y procesos modelados en UML y BPMN.',
      en: 'The bridge between business and engineering: clear requirements, and processes modelled in UML and BPMN.',
    },
    items: ['UML', 'BPMN', 'Análisis de requisitos', 'Power BI', 'Scrum'],
  },
]

/* ─────────────────────────── Experiencia ─────────────────────────── */

export interface Job {
  company: string
  location: Bi
  role: Bi
  period: Bi
  current?: boolean
  summary: Bi
  achievements: { es: string[]; en: string[] }
  tech: string[]
}

export const experience: Job[] = [
  {
    company: 'Closer Logistics SL',
    location: { es: 'Madrid, España', en: 'Madrid, Spain' },
    role: {
      es: 'Full Stack Developer & Automation Engineer',
      en: 'Full Stack Developer & Automation Engineer',
    },
    period: { es: 'Jul 2025 – Actualidad', en: 'Jul 2025 – Present' },
    current: true,
    summary: {
      es: 'Equipo de Data & Automation: digitalizo procesos de logística de última milla y desarrollo sus herramientas internas.',
      en: "Data & Automation team: I digitalise last-mile logistics processes and develop the company's internal tools.",
    },
    achievements: {
      es: [
        'Diseñé e implementé automatizaciones con n8n que redujeron significativamente las tareas manuales en procesos operativos y de flota.',
        'Desarrollé chatbots internos con IA para RRHH y Operaciones, agilizando la resolución de consultas frecuentes.',
        'Automaticé informes financieros, operativos y de flota, y desarrollé con Symfony (PHP) el backend de herramientas internas tipo ERP para consultar y analizar datos.',
        'Integré sistemas internos y externos con mensajería asíncrona (RabbitMQ, Google Pub/Sub) y caché en Redis, consolidando fuentes dispersas en una base fiable para decidir.',
        'Supervisé procesos de flota eléctrica y coordiné proveedores, identificando oportunidades de automatización de punta a punta.',
      ],
      en: [
        'Designed and shipped n8n automations that significantly cut manual work across operations and fleet processes.',
        'Built internal AI chatbots for HR and Operations, speeding up the resolution of frequent queries.',
        'Automated financial, operational and fleet reporting, and developed the Symfony (PHP) backend of internal ERP-style tools for querying and analysing data.',
        'Integrated internal and external systems via async messaging (RabbitMQ, Google Pub/Sub) and Redis caching, consolidating scattered sources into one reliable basis for decisions.',
        'Oversaw electric fleet processes and coordinated suppliers, identifying opportunities for end-to-end automation.',
      ],
    },
    tech: ['Symfony', 'PHP', 'n8n', 'RabbitMQ', 'Google Pub/Sub', 'Redis', 'IA', 'Docker'],
  },
  {
    company: 'Si Señor SAS',
    location: { es: 'Bogotá, Colombia', en: 'Bogotá, Colombia' },
    role: { es: 'Full Stack Developer', en: 'Full Stack Developer' },
    period: { es: 'Nov 2022 – Jul 2025', en: 'Nov 2022 – Jul 2025' },
    summary: {
      es: 'Soluciones web escalables y responsive para clientes de sectores muy distintos, del CMS al desarrollo a medida con React.',
      en: 'Scalable, responsive web solutions for clients across very different sectors, from CMS builds to custom React development.',
    },
    achievements: {
      es: [
        'Entregué más de 20 sitios web responsive con WordPress y Shopify, mejorando la presencia digital de los clientes en un 80%.',
        'Participé en proyectos con React que subieron hasta un 40% la velocidad de carga y la interacción.',
        'Adapté soluciones para múltiples sectores garantizando experiencia responsive en el 100% de los proyectos.',
        'Recorté un 30% los tiempos de entrega mejorando flujos de desarrollo y automatizando tareas recurrentes.',
        'Sostuve los estándares de calidad web: SEO técnico, rendimiento y buenas prácticas de código.',
      ],
      en: [
        'Delivered 20+ responsive websites with WordPress and Shopify, lifting client digital presence by 80%.',
        'Contributed to React projects that improved load speed and interaction by up to 40%.',
        'Adapted solutions across sectors, guaranteeing a responsive experience in 100% of projects.',
        'Cut delivery times by 30% by improving development flows and automating recurring tasks.',
        'Held the line on web quality standards: technical SEO, performance and code best practices.',
      ],
    },
    tech: ['React', 'JavaScript', 'WordPress', 'Shopify', 'PHP', 'SEO'],
  },
  {
    company: 'Infinivirt Technologies S.A.S',
    location: { es: 'Medellín, Colombia', en: 'Medellín, Colombia' },
    role: { es: 'Líder de Desarrollo Frontend', en: 'Frontend Development Lead' },
    period: { es: 'Feb 2022 – Oct 2022', en: 'Feb 2022 – Oct 2022' },
    summary: {
      es: 'Lideré un equipo de desarrollo entregando soluciones web completas para clientes internos y externos, con enfoque full stack.',
      en: 'Led a development team delivering complete web solutions for internal and external clients, with a full stack focus.',
    },
    achievements: {
      es: [
        'Coordiné y entregué más de 10 proyectos frontend, mejorando la eficiencia del equipo un 90% con gestión por sprints.',
        'Diseñé herramientas internas (cotizadores, sistemas de comisiones e informes de rentabilidad) que recortaron un 50% los tiempos operativos.',
        'Implementé dashboards interactivos en Power BI para dar visibilidad en tiempo real a las métricas clave.',
        'Impulsé buenas prácticas centradas en mantenibilidad, rendimiento y reutilización de componentes.',
      ],
      en: [
        'Coordinated and delivered 10+ frontend projects, improving team efficiency by 90% through sprint management.',
        'Designed internal tools (quoting engines, commission systems and profitability reports), cutting operational time by 50%.',
        'Built interactive Power BI dashboards giving real-time visibility into key metrics.',
        'Drove best practices around maintainability, performance and component reuse.',
      ],
    },
    tech: ['React', 'Power BI', 'JavaScript', 'Scrum'],
  },
  {
    company: 'Carvajal Laboratorios IPS',
    location: { es: 'Tunja, Colombia', en: 'Tunja, Colombia' },
    role: { es: 'Analista Funcional y de Requerimientos', en: 'Functional & Requirements Analyst' },
    period: { es: 'Abr 2021 – Feb 2022', en: 'Apr 2021 – Feb 2022' },
    summary: {
      es: 'En el área de I+D+i, traducía las necesidades del negocio en requisitos funcionales y no funcionales, y proponía la solución técnica.',
      en: 'In the R&D unit, I turned business needs into functional and non-functional requirements and proposed the technical solution.',
    },
    achievements: {
      es: [
        'Definí y documenté más de 20 requisitos funcionales, elevando la calidad de entrega técnica.',
        'Implementé soluciones que optimizaron procesos internos y redujeron tiempos operativos un 30%.',
        'Desarrollé diagramas UML y BPMN que facilitaron la comunicación entre áreas técnicas y no técnicas.',
        'Integré sistemas vía API con XML y JSON, asegurando la interoperabilidad y la eficiencia de los datos entre plataformas.',
      ],
      en: [
        'Defined and documented 20+ functional requirements, raising technical delivery quality.',
        'Implemented solutions that optimised internal processes and cut operational time by 30%.',
        'Produced UML and BPMN diagrams that eased communication between technical and non-technical teams.',
        'Integrated systems via API with XML and JSON, ensuring interoperability and efficient data exchange between platforms.',
      ],
    },
    tech: ['UML', 'BPMN', 'APIs', 'XML', 'JSON'],
  },
  {
    company: 'TVO Seguridad Electrónica',
    location: { es: 'San José, Costa Rica', en: 'San José, Costa Rica' },
    role: { es: 'Administrador y Desarrollador Web', en: 'Web Administrator & Developer' },
    period: { es: 'Mar 2019 – Jul 2019', en: 'Mar 2019 – Jul 2019' },
    summary: {
      es: 'Sitio corporativo responsive y todo el entorno web detrás, de dominio a servidor.',
      en: 'Responsive corporate site plus the entire web environment behind it, from domain to server.',
    },
    achievements: {
      es: [
        'Desarrollé el sitio corporativo adaptado a móvil y configuré dominio, hosting y servidor, manteniendo un uptime superior al 99,9%.',
      ],
      en: [
        'Built the mobile-ready corporate site and set up domain, hosting and server, holding uptime above 99.9%.',
      ],
    },
    tech: ['HTML5', 'CSS3', 'JavaScript', 'Hosting'],
  },
  {
    company: 'Tecnovision CCTV',
    location: { es: 'San José, Costa Rica', en: 'San José, Costa Rica' },
    role: { es: 'Administrador y Desarrollador Web', en: 'Web Administrator & Developer' },
    period: { es: 'Ene 2019 – Dic 2019', en: 'Jan 2019 – Dec 2019' },
    summary: {
      es: 'Presencia digital creada desde cero, incluyendo el análisis de infraestructura.',
      en: 'Digital presence built from zero, infrastructure analysis included.',
    },
    achievements: {
      es: [
        'Desarrollé e implementé el sitio corporativo responsive, estableciendo la presencia digital de la empresa desde cero tras analizar dominio, hosting y servidor.',
      ],
      en: [
        'Developed and shipped the responsive corporate site, establishing the company’s digital presence from scratch after analysing domain, hosting and server.',
      ],
    },
    tech: ['HTML5', 'CSS3', 'WordPress'],
  },
]

/* ─────────────────────────── Formación ─────────────────────────── */

export const education = [
  {
    title: {
      es: 'Máster en Data Science y Estrategias para E-commerce',
      en: "Master's in Data Science & E-commerce Strategy",
    } satisfies Bi,
    org: 'IUNIT, Centro de Educación Superior de Negocios, Innovación y Tecnología',
    place: { es: 'Madrid, España', en: 'Madrid, Spain' } satisfies Bi,
    period: '2025',
  },
  {
    title: {
      es: 'Bootcamp Backend Java y Microservicios',
      en: 'Java Backend & Microservices Bootcamp',
    } satisfies Bi,
    org: 'Universidad El Bosque',
    place: { es: 'Bogotá, Colombia', en: 'Bogotá, Colombia' } satisfies Bi,
    period: '2023',
  },
  {
    title: {
      es: 'Grado en Ingeniería de Sistemas',
      en: "Bachelor's in Systems Engineering",
    } satisfies Bi,
    org: 'Fundación Universitaria Juan de Castellanos',
    place: { es: 'Tunja, Colombia', en: 'Tunja, Colombia' } satisfies Bi,
    period: '2017 – 2021',
  },
]

export const languages = [
  { name: { es: 'Español', en: 'Spanish' } satisfies Bi, level: { es: 'Nativo', en: 'Native' } satisfies Bi },
  { name: { es: 'Inglés', en: 'English' } satisfies Bi, level: { es: 'Básico', en: 'Basic' } satisfies Bi },
]
