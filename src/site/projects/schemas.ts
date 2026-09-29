import type { Bi } from '@/lib/types'

/**
 * Esquemas de los proyectos que no tienen captura (herramientas internas,
 * automatizaciones). NUNCA una captura falsa: un diagrama que se declara
 * como diagrama.
 *
 * VERDAD: cada nodo sale de lo que dice su CV sobre ese trabajo (y de la
 * descripción del proyecto en seedProjects.ts, que a su vez sale del CV).
 * Nada de rutas de error, reintentos ni pasos que el CV no mencione. Si un
 * proyecto nuevo (Supabase) no tiene esquema escrito aquí, se muestra su
 * stack por capas, generado sólo a partir de su lista `tech`.
 */

export type Label = Bi | string

export interface SchemaNode {
  id: string
  label: Label
  sub?: Label
  /** Columna (etapa) 0..n-1 y fila 1..m dentro de la rejilla. */
  stage: number
  row: number
}

export interface SchemaEdge {
  from: string
  to: string
  /** main: el recorrido del dato · aux: apoyo (caché, contexto) · alt: ruta alternativa. */
  kind: 'main' | 'aux' | 'alt'
}

export interface FlowSchema {
  stages: Bi[]
  nodes: SchemaNode[]
  edges: SchemaEdge[]
  /** Qué significa la línea discontinua en este flujo. */
  altLabel?: Bi
}

const fleet: FlowSchema = {
  stages: [
    { es: 'Origen', en: 'Source' },
    { es: 'Automatización', en: 'Automation' },
    { es: 'Salida', en: 'Output' },
  ],
  nodes: [
    { id: 'ops', label: { es: 'Operación', en: 'Operations' }, sub: { es: 'procesos diarios', en: 'daily processes' }, stage: 0, row: 1 },
    { id: 'fleet', label: { es: 'Flota', en: 'Fleet' }, sub: { es: 'procesos y datos', en: 'processes and data' }, stage: 0, row: 2 },
    { id: 'n8n', label: 'n8n', sub: { es: 'flujos', en: 'workflows' }, stage: 1, row: 1 },
    { id: 'report', label: { es: 'Informes', en: 'Reports' }, sub: { es: 'finanzas, operación y flota', en: 'finance, ops, fleet' }, stage: 2, row: 1 },
  ],
  edges: [
    { from: 'ops', to: 'n8n', kind: 'main' },
    { from: 'fleet', to: 'n8n', kind: 'main' },
    { from: 'n8n', to: 'report', kind: 'main' },
  ],
}

const erp: FlowSchema = {
  stages: [
    { es: 'Origen', en: 'Sources' },
    { es: 'Integración', en: 'Integration' },
    { es: 'Backend', en: 'Backend' },
    { es: 'Salida', en: 'Output' },
  ],
  nodes: [
    { id: 'int', label: { es: 'Sistemas', en: 'Systems' }, sub: { es: 'internos', en: 'internal' }, stage: 0, row: 1 },
    { id: 'ext', label: { es: 'Sistemas', en: 'Systems' }, sub: { es: 'externos', en: 'external' }, stage: 0, row: 2 },
    { id: 'bus', label: 'RabbitMQ', sub: { es: 'y Pub/Sub', en: 'and Pub/Sub' }, stage: 1, row: 1 },
    { id: 'api', label: 'Symfony', sub: { es: 'backend', en: 'backend' }, stage: 2, row: 1 },
    { id: 'redis', label: 'Redis', sub: { es: 'caché', en: 'cache' }, stage: 2, row: 2 },
    { id: 'tool', label: { es: 'Herramienta', en: 'Internal tool' }, sub: { es: 'consulta y análisis', en: 'query and analysis' }, stage: 3, row: 1 },
  ],
  edges: [
    { from: 'int', to: 'bus', kind: 'main' },
    { from: 'ext', to: 'bus', kind: 'main' },
    { from: 'bus', to: 'api', kind: 'main' },
    { from: 'api', to: 'tool', kind: 'main' },
    { from: 'api', to: 'redis', kind: 'aux' },
  ],
}

const chatbots: FlowSchema = {
  stages: [
    { es: 'Entrada', en: 'Input' },
    { es: 'Orquestación', en: 'Orchestration' },
    { es: 'Modelo', en: 'Model' },
    { es: 'Salida', en: 'Output' },
  ],
  nodes: [
    { id: 'q', label: { es: 'Consulta', en: 'Question' }, sub: { es: 'RRHH · Operaciones', en: 'HR · Operations' }, stage: 0, row: 1 },
    { id: 'n8n', label: 'n8n', sub: { es: 'orquestación', en: 'orchestration' }, stage: 1, row: 1 },
    { id: 'model', label: { es: 'Modelo IA', en: 'AI model' }, sub: { es: 'chatbot interno', en: 'internal chatbot' }, stage: 2, row: 1 },
    { id: 'answer', label: { es: 'Respuesta', en: 'Answer' }, sub: { es: 'consulta frecuente', en: 'frequent question' }, stage: 3, row: 1 },
  ],
  edges: [
    { from: 'q', to: 'n8n', kind: 'main' },
    { from: 'n8n', to: 'model', kind: 'main' },
    { from: 'model', to: 'answer', kind: 'main' },
  ],
}

const BY_SLUG: Record<string, FlowSchema> = {
  'automatizacion-flota-n8n': fleet,
  'erp-interno-symfony': erp,
  'chatbots-internos-ia': chatbots,
}

export function schemaFor(slug: string): FlowSchema | null {
  return BY_SLUG[slug] ?? null
}

/* ─────────────── Stack por capas (genérico, sólo a partir de `tech`) ─────────────── */

interface Layer {
  key: string
  label: Bi
  match: string[]
}

const LAYERS: Layer[] = [
  { key: 'analysis', label: { es: 'Análisis', en: 'Analysis' }, match: ['análisis de requisitos', 'análisis de requerimientos', 'uml', 'bpmn', 'análisis funcional'] },
  { key: 'ui', label: { es: 'Interfaz', en: 'Interface' }, match: ['react', 'javascript', 'typescript', 'vue', 'next.js', 'html', 'css', 'tailwind', 'elementor', 'divi', 'responsive', 'gsap'] },
  { key: 'cms', label: { es: 'CMS y tienda', en: 'CMS & store' }, match: ['wordpress', 'shopify', 'woocommerce'] },
  { key: 'bi', label: { es: 'Visualización', en: 'Reporting' }, match: ['power bi', 'looker', 'metabase'] },
  { key: 'automation', label: { es: 'Automatización', en: 'Automation' }, match: ['n8n', 'make', 'zapier'] },
  { key: 'ai', label: { es: 'IA', en: 'AI' }, match: ['ia', 'ai', 'openai', 'llm'] },
  { key: 'backend', label: { es: 'Backend y API', en: 'Backend & API' }, match: ['symfony', 'php', 'node.js', 'laravel', 'java', 'spring', 'apis restful', 'express'] },
  { key: 'messaging', label: { es: 'Mensajería', en: 'Messaging' }, match: ['rabbitmq', 'google pub/sub', 'pub/sub', 'kafka'] },
  { key: 'data', label: { es: 'Datos', en: 'Data' }, match: ['mysql', 'postgresql', 'sql', 'redis', 'supabase', 'mongodb'] },
  { key: 'infra', label: { es: 'Infraestructura', en: 'Infrastructure' }, match: ['docker', 'kubernetes', 'vercel', 'aws', 'gcp'] },
  { key: 'quality', label: { es: 'Calidad web', en: 'Web quality' }, match: ['seo técnico', 'seo', 'accesibilidad', 'rendimiento'] },
]

const OTHER: Bi = { es: 'Otros', en: 'Other' }

export function stackLayers(tech: string[]): { key: string; label: Bi; items: string[] }[] {
  const out = LAYERS.map((l) => ({ key: l.key, label: l.label, items: [] as string[] }))
  const other: string[] = []
  for (const t of tech) {
    const i = LAYERS.findIndex((l) => l.match.includes(t.trim().toLowerCase()))
    if (i >= 0) out[i].items.push(t)
    else other.push(t)
  }
  const layers = out.filter((l) => l.items.length)
  if (other.length) layers.push({ key: 'other', label: OTHER, items: other })
  return layers
}
