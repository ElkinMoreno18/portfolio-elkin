import type { Bi } from '@/lib/types'

/**
 * La demostración de la portada: un flujo de automatización ilustrativo.
 *
 * VERDAD: cada TAREA es un logro real de su CV en Closer Logistics, reescrito
 * como "tarea manual → lo que la hace ahora". El GRAFO (nodos y rutas) es una
 * ilustración plausible de cómo encajan esas piezas, no el diagrama real de
 * los sistemas de su empresa, y así se etiqueta en pantalla.
 * No hay minutos ni horas: esas cifras no están en el CV.
 */

export interface Task {
  id: string
  task: Bi
  replacedBy: Bi
  /** Ids de nodos que recorre el paquete, en orden. */
  route: string[]
}

export const tasks: Task[] = [
  {
    id: '01',
    task: {
      es: 'Responder a mano las mismas consultas de RRHH y Operaciones',
      en: 'Answering the same HR and Operations questions by hand',
    },
    replacedBy: { es: 'Chatbot interno con IA', en: 'Internal AI chatbot' },
    route: ['query', 'n8n', 'ai'],
  },
  {
    id: '02',
    task: {
      es: 'Montar a mano los informes financieros, operativos y de flota',
      en: 'Building financial, operational and fleet reports by hand',
    },
    replacedBy: { es: 'n8n + Symfony', en: 'n8n + Symfony' },
    route: ['cron', 'n8n', 'symfony', 'report'],
  },
  {
    id: '03',
    task: {
      es: 'Copiar datos entre sistemas internos y externos',
      en: 'Copying data between internal and external systems',
    },
    replacedBy: { es: 'RabbitMQ · Pub/Sub · Redis', en: 'RabbitMQ · Pub/Sub · Redis' },
    route: ['ext', 'queue', 'redis', 'erp'],
  },
  {
    id: '04',
    task: {
      es: 'Encadenar pasos manuales en los procesos de flota',
      en: 'Chaining manual steps across fleet processes',
    },
    replacedBy: { es: 'Flujos en n8n', en: 'n8n flows' },
    route: ['webhook', 'n8n', 'erp'],
  },
]

/* ─────────────── Grafo, en coordenadas fijas de la app (1200 × 750) ─────────────── */

export const APP_W = 1200
export const APP_H = 750
export const NODE_W = 148
export const NODE_H = 48

export interface FlowNode {
  id: string
  label: string
  sub: Bi
  /** Esquina superior izquierda en coordenadas de la app. */
  x: number
  /** Centro vertical. */
  cy: number
}

const COL = { in: 36, orch: 228, int: 420, out: 596 } as const

export const nodes: FlowNode[] = [
  { id: 'webhook', label: 'Webhook', sub: { es: 'evento', en: 'event' }, x: COL.in, cy: 196 },
  { id: 'cron', label: 'Cron', sub: { es: 'programado', en: 'scheduled' }, x: COL.in, cy: 326 },
  { id: 'query', label: 'Consulta', sub: { es: 'RRHH · Ops', en: 'HR · Ops' }, x: COL.in, cy: 456 },
  { id: 'ext', label: 'API externa', sub: { es: 'proveedor', en: 'supplier' }, x: COL.in, cy: 616 },
  { id: 'n8n', label: 'n8n', sub: { es: 'orquestación', en: 'orchestration' }, x: COL.orch, cy: 326 },
  { id: 'symfony', label: 'Symfony', sub: { es: 'API interna', en: 'internal API' }, x: COL.orch, cy: 476 },
  { id: 'queue', label: 'RabbitMQ', sub: { es: 'cola de mensajes', en: 'message queue' }, x: COL.int, cy: 566 },
  { id: 'redis', label: 'Redis', sub: { es: 'caché', en: 'cache' }, x: COL.int, cy: 676 },
  { id: 'ai', label: 'Chatbot IA', sub: { es: 'respuesta', en: 'answer' }, x: COL.out, cy: 196 },
  { id: 'report', label: 'Informe', sub: { es: 'finanzas y flota', en: 'finance, fleet' }, x: COL.out, cy: 386 },
  { id: 'erp', label: 'ERP interno', sub: { es: 'datos unificados', en: 'single source' }, x: COL.out, cy: 566 },
]

export const columns: { label: Bi; x: number }[] = [
  { label: { es: 'Entrada', en: 'Trigger' }, x: COL.in },
  { label: { es: 'Orquestación', en: 'Orchestration' }, x: COL.orch },
  { label: { es: 'Integración', en: 'Integration' }, x: COL.int },
  { label: { es: 'Salida', en: 'Output' }, x: COL.out },
]

const byId = Object.fromEntries(nodes.map((n) => [n.id, n]))

/**
 * Arista estilo n8n: sale por la derecha y entra por la izquierda con
 * tangentes horizontales; si dos nodos comparten columna, va de abajo a
 * arriba con tangentes verticales.
 */
export function edgePath(fromId: string, toId: string) {
  const a = byId[fromId]
  const b = byId[toId]
  if (a.x === b.x) {
    const x = a.x + NODE_W / 2
    const down = b.cy > a.cy
    const y0 = a.cy + (down ? NODE_H / 2 : -NODE_H / 2)
    const y1 = b.cy + (down ? -NODE_H / 2 : NODE_H / 2)
    const k = Math.abs(y1 - y0) * 0.5
    return `M${x},${y0} C${x},${y0 + (down ? k : -k)} ${x},${y1 - (down ? k : -k)} ${x},${y1}`
  }
  const x0 = a.x + NODE_W
  const x1 = b.x
  const k = Math.max(40, (x1 - x0) * 0.5)
  return `M${x0},${a.cy} C${x0 + k},${a.cy} ${x1 - k},${b.cy} ${x1},${b.cy}`
}

/** Todas las aristas únicas que usan las rutas. */
export const edges = (() => {
  const seen = new Set<string>()
  const out: { id: string; from: string; to: string; d: string }[] = []
  for (const t of tasks) {
    for (let i = 0; i < t.route.length - 1; i++) {
      const id = `${t.route[i]}-${t.route[i + 1]}`
      if (seen.has(id)) continue
      seen.add(id)
      out.push({ id, from: t.route[i], to: t.route[i + 1], d: edgePath(t.route[i], t.route[i + 1]) })
    }
  }
  return out
})()

export const automationCopy = {
  appTitle: { es: 'Automatizaciones', en: 'Automations' } satisfies Bi,
  appSection: { es: 'Operaciones', en: 'Operations' } satisfies Bi,
  demoLabel: { es: 'Demostración ilustrativa', en: 'Illustrative demo' } satisfies Bi,
  hint: { es: 'Desplázate para ver el cambio', en: 'Scroll to see the change' } satisfies Bi,
  ledgerTitle: { es: 'Trabajo manual retirado', en: 'Manual work, automated' } satisfies Bi,
  ledgerSub: { es: 'Lo que antes se hacía a mano', en: 'What used to be done by hand' } satisfies Bi,
  now: { es: 'Ahora', en: 'Now' } satisfies Bi,
  manual: { es: 'Manual', en: 'Manual' } satisfies Bi,
  automated: { es: 'Automatizado', en: 'Automated' } satisfies Bi,
  counter: { es: 'Procesos automatizados', en: 'Processes automated' } satisfies Bi,
  srSummary: {
    es: 'Demostración: cuatro tareas manuales que ahora resuelve un sistema.',
    en: 'Demo: four manual tasks now handled by a system.',
  } satisfies Bi,
}
