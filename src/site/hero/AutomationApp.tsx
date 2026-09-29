import { useLang } from '@/i18n'
import {
  APP_H,
  APP_W,
  NODE_H,
  NODE_W,
  automationCopy as c,
  columns,
  edges,
  nodes,
  tasks,
} from '@/data/automation'
import { Mark } from '../Nav'
import { IconArrowUp } from '../icons'

/* En data/automation.ts la etiqueta del nodo es una sola cadena (en español).
   Los nombres propios (n8n, Symfony, Redis…) no cambian; éstos sí. */
const LABEL_EN: Record<string, string> = {
  query: 'Query',
  ext: 'External API',
  ai: 'AI chatbot',
  report: 'Report',
  erp: 'Internal ERP',
}

/**
 * La app que vive dentro de la pantalla del portátil: un editor de flujos
 * (estilo n8n, pulido) a la izquierda y el registro de tareas retiradas a la
 * derecha. Tamaño fijo 1200×750; el contenedor la escala a la pantalla.
 *
 * Todo lo que anima GSAP se localiza por atributos data-* para que la línea
 * de tiempo (useHeroTimeline) no dependa de refs sueltas:
 *   [data-trail=edgeId] · [data-packet=taskId] · [data-node=id]
 *   [data-row=taskId] con [data-task] [data-st-manual] [data-st-auto] [data-now]
 *   [data-count]
 *
 * Es decorativa para lectores de pantalla (aria-hidden): la misma información
 * existe como lista semántica en <TaskList/>.
 */
export function AutomationApp({ done = false }: { done?: boolean }) {
  const { pick, lang } = useLang()
  const LEDGER_X = 760

  return (
    <div
      aria-hidden="true"
      className="auto-app"
      style={{ width: APP_W, height: APP_H }}
      data-done={done || undefined}
    >
      {/* ── Barra superior ── */}
      <div className="auto-bar">
        <div className="flex items-center gap-2.5">
          <Mark className="size-[18px]" />
          <span className="text-text">{pick(c.appTitle)}</span>
          <span className="text-text-3">/</span>
          <span className="text-text-2">{pick(c.appSection)}</span>
        </div>
        <div className="flex items-center gap-5">
          {/* Indicación de scroll: se ve al encenderse la pantalla, en lo alto
              del escenario fijado, y se retira durante el primer paso. */}
          <span data-hint className="auto-hint">
            <IconArrowUp size={14} className="rotate-180" />
            {pick(c.hint)}
          </span>
          <span className="auto-demo">{pick(c.demoLabel)}</span>
        </div>
      </div>

      {/* ── Lienzo del flujo ── */}
      <div className="auto-canvas" style={{ width: LEDGER_X }}>
        <svg className="absolute inset-0" width={LEDGER_X} height={APP_H} viewBox={`0 0 ${LEDGER_X} ${APP_H}`}>
          <defs>
            <pattern id="auto-dots" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="#1d1d21" />
            </pattern>
          </defs>
          <rect x="0" y="52" width={LEDGER_X} height={APP_H - 52} fill="url(#auto-dots)" />

          {edges.map((e) => (
            <path key={`b-${e.id}`} d={e.d} className="auto-edge" />
          ))}
          {edges.map((e) => (
            <path key={`t-${e.id}`} d={e.d} className="auto-trail" pathLength={1} data-trail={e.id} />
          ))}
          {tasks.map((t) => (
            <g key={t.id} data-packet={t.id} className="auto-packet">
              <circle r="7" className="auto-packet-halo" />
              <circle r="4" className="auto-packet-core" />
            </g>
          ))}
        </svg>

        {columns.map((col) => (
          <span key={col.x} className="auto-col" style={{ left: col.x, top: 96 }}>
            {pick(col.label)}
          </span>
        ))}

        {nodes.map((n) => (
          <div
            key={n.id}
            data-node={n.id}
            className="auto-node"
            style={{ left: n.x, top: n.cy - NODE_H / 2, width: NODE_W, height: NODE_H }}
          >
            <span className="auto-node-label">{lang === 'en' ? (LABEL_EN[n.id] ?? n.label) : n.label}</span>
            <span className="auto-node-sub">{pick(n.sub)}</span>
          </div>
        ))}
      </div>

      {/* ── Registro de tareas ── */}
      <div className="auto-ledger" style={{ left: LEDGER_X, width: APP_W - LEDGER_X }}>
        <div className="px-7 pt-7 pb-5">
          <p className="text-[19px] font-semibold tracking-[-0.02em] text-text">{pick(c.ledgerTitle)}</p>
          <p className="mt-1 text-[14px] text-text-3">{pick(c.ledgerSub)}</p>
        </div>

        <ol className="border-t border-[#1f1f23]">
          {tasks.map((t) => (
            <li key={t.id} data-row={t.id} className="auto-row">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[13px] text-text-3">{t.id}</span>
                <span className="auto-status">
                  <span data-st-manual className="auto-status-manual">{pick(c.manual)}</span>
                  <span data-st-auto className="auto-status-auto">{pick(c.automated)}</span>
                </span>
              </div>
              <p data-task className="auto-task">{pick(t.task)}</p>
              <p data-now className="auto-now">
                <span className="text-text-3">{pick(c.now)}</span>
                <span className="auto-now-chip">{pick(t.replacedBy)}</span>
              </p>
            </li>
          ))}
        </ol>

        <div className="auto-counter">
          <span className="text-[14px] text-text-3">{pick(c.counter)}</span>
          <span className="tnum font-mono text-[15px] text-text">
            <span data-count>{done ? tasks.length : 0}</span>
            <span className="text-text-3">/{tasks.length}</span>
          </span>
        </div>
      </div>
    </div>
  )
}

/** Lista semántica equivalente: visible en móvil, sólo lectores en escritorio. */
export function TaskList({ className, done = false }: { className?: string; done?: boolean }) {
  const { pick } = useLang()
  return (
    <div className={className}>
      <p className="sr-only">{pick(c.srSummary)}</p>
      <ol className="task-list" data-done={done || undefined}>
        {tasks.map((t) => (
          <li key={t.id} data-mrow={t.id} className="task-card">
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-[12px] text-text-3">{t.id}</span>
              <span className="auto-status">
                <span data-st-manual aria-hidden="true" className="auto-status-manual">{pick(c.manual)}</span>
                <span data-st-auto className="auto-status-auto">{pick(c.automated)}</span>
              </span>
            </div>
            <p data-task className="auto-task mt-2 text-[15px]">{pick(t.task)}</p>
            <p data-now className="auto-now mt-2">
              <span className="text-text-3">{pick(c.now)}</span>
              <span className="auto-now-chip">{pick(t.replacedBy)}</span>
            </p>
          </li>
        ))}
      </ol>
    </div>
  )
}
