import { useEffect, useRef, useState } from 'react'
import type { TicketDetail } from './ticket-api'
import {
  getEligibleOperators,
  getTransitions,
  type Operator,
  submitTransition,
  type Transition,
} from './workflow-api'

const labels: Record<TicketDetail['status'], string> = {
  open: 'Abrir',
  assigned: 'Asignarme',
  in_progress: 'Iniciar trabajo',
  pending_user: 'Poner en espera',
  solved: 'Resolver',
  closed: 'Cerrar ticket',
  canceled: 'Cancelar ticket',
}

function transitionLabel(action: Transition, status: TicketDetail['status']) {
  if (action.requiresAssignee) return status === 'assigned' ? 'Reasignar' : 'Asignar'
  if (action.to === 'in_progress' && status === 'pending_user') return 'Retomar trabajo'
  return labels[action.to]
}

type Props = {
  ticket: TicketDetail
  onExpired: () => void
  onMissing: () => void
  onConflict: () => void
  onUpdated: (ticket: TicketDetail) => void
}

export function TicketWorkflow({ ticket, onExpired, onMissing, onConflict, onUpdated }: Props) {
  const [actions, setActions] = useState<Transition[] | null>()
  const [operators, setOperators] = useState<Operator[] | null>()
  const [operatorId, setOperatorId] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const pending = useRef<AbortController | null>(null)
  const loading = actions === undefined

  useEffect(() => {
    if (!loading) return
    const controller = new AbortController()
    const { signal } = controller

    async function load() {
      let result: Awaited<ReturnType<typeof getTransitions>>
      try {
        result = await getTransitions(ticket.id, signal)
      } catch {
        if (!signal.aborted) setActions(null)
        return
      }
      if (signal.aborted) return
      if (result.kind === 'expired') return onExpired()
      if (result.kind === 'missing') return onMissing()
      if (result.data.some((action) => action.requiresAssignee)) {
        try {
          const candidates = await getEligibleOperators(ticket.id, signal)
          if (signal.aborted) return
          if (candidates.kind === 'expired') return onExpired()
          if (candidates.kind === 'missing') return onMissing()
          setOperators(candidates.data)
        } catch {
          if (signal.aborted) return
          setOperators(null)
        }
      }
      setActions(result.data)
    }

    void load()
    return () => controller.abort()
  }, [loading, onExpired, onMissing, ticket.id])

  useEffect(() => () => pending.current?.abort(), [])

  async function execute(action: Transition) {
    if (pending.current || (action.requiresAssignee && !operatorId)) return
    const controller = new AbortController()
    pending.current = controller
    setError('')
    setBusy(true)
    try {
      const result = await submitTransition(
        ticket.id,
        {
          to: action.to,
          expectedRevision: ticket.workflowRevision,
          ...(action.requiresAssignee ? { assigneeId: operatorId } : {}),
        },
        controller.signal,
      )
      if (controller.signal.aborted) return
      switch (result.kind) {
        case 'updated':
          onUpdated(result.ticket)
          break
        case 'expired':
          onExpired()
          break
        case 'missing':
          onMissing()
          break
        case 'conflict':
          onConflict()
          break
        case 'rejected':
          setError(result.message)
          break
      }
    } catch {
      if (!controller.signal.aborted) setError('No se pudo confirmar el cambio del ticket.')
    } finally {
      pending.current = null
      if (!controller.signal.aborted) setBusy(false)
    }
  }

  if (!actions?.length && actions !== null && !loading) return null

  return (
    <section aria-labelledby="ticket-actions-title">
      <h3 id="ticket-actions-title">Acciones del ticket</h3>
      {loading && <p role="status">Cargando las acciones…</p>}
      {actions === null && (
        <>
          <p>No se pudieron consultar las acciones del ticket.</p>
          <button type="button" onClick={() => setActions(undefined)}>
            Reintentar acciones
          </button>
        </>
      )}
      {error && <p role="alert">{error}</p>}
      {actions?.map((action) => {
        const label = transitionLabel(action, ticket.status)
        return (
          <div key={action.to}>
            {action.requiresAssignee && (
              <>
                {operators?.length ? (
                  <>
                    <label htmlFor="eligible-operator">Operador</label>
                    <select
                      id="eligible-operator"
                      disabled={busy}
                      value={operatorId}
                      onChange={(event) => setOperatorId(event.target.value)}
                    >
                      <option value="">Selecciona un operador</option>
                      {operators.map((operator) => (
                        <option key={operator.id} value={operator.id}>
                          {operator.fullName}
                        </option>
                      ))}
                    </select>
                  </>
                ) : (
                  <p>
                    {operators === null
                      ? 'No se pudieron consultar los operadores.'
                      : 'No hay operadores disponibles.'}
                  </p>
                )}
                {operators === null && (
                  <button type="button" onClick={() => setActions(undefined)}>
                    Reintentar operadores
                  </button>
                )}
              </>
            )}
            <button
              type="button"
              disabled={busy || (action.requiresAssignee && !operatorId)}
              onClick={() => void execute(action)}
            >
              {label}
            </button>
          </div>
        )
      })}
      {busy && <p role="status">Guardando el cambio…</p>}
    </section>
  )
}
