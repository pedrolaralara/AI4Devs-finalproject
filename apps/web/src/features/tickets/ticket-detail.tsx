import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { getTicket, type TicketDetail } from './ticket-api'
import { TicketWorkflow } from './ticket-workflow'

const statuses: Record<TicketDetail['status'], string> = {
  open: 'Abierto',
  assigned: 'Asignado',
  in_progress: 'En curso',
  pending_user: 'Pendiente del usuario',
  solved: 'Resuelto',
  closed: 'Cerrado',
  canceled: 'Cancelado',
}

const eventLabels: Record<TicketDetail['history'][number]['eventType'], string> = {
  created: 'Ticket creado',
  status_changed: 'Cambio de estado',
  assigned: 'Asignación',
  unassigned: 'Asignación retirada',
  field_updated: 'Campo actualizado',
}

const dateFormat = new Intl.DateTimeFormat('es', { dateStyle: 'medium', timeStyle: 'short' })

function TicketTime({ value }: { value: string }) {
  return <time dateTime={value}>{dateFormat.format(new Date(value))}</time>
}

function TicketContent({ ticket }: { ticket: TicketDetail }) {
  return (
    <section aria-labelledby="ticket-detail-title">
      <h2 id="ticket-detail-title">
        {ticket.key} · {ticket.title}
      </h2>
      <p>{ticket.description}</p>
      <dl>
        <dt>Estado</dt>
        <dd>{statuses[ticket.status]}</dd>
        <dt>Prioridad</dt>
        <dd>{ticket.priority} de 5</dd>
        <dt>Urgencia</dt>
        <dd>{ticket.urgency}</dd>
        <dt>Impacto</dt>
        <dd>{ticket.impact}</dd>
        <dt>Reportero</dt>
        <dd>{ticket.reporter.fullName}</dd>
        <dt>Asignado a</dt>
        <dd>{ticket.assignee?.fullName ?? 'Sin asignar'}</dd>
        <dt>Creado</dt>
        <dd>
          <TicketTime value={ticket.createdAt} />
        </dd>
        <dt>Actualizado</dt>
        <dd>
          <TicketTime value={ticket.updatedAt} />
        </dd>
        {ticket.solvedAt && (
          <>
            <dt>Resuelto</dt>
            <dd>
              <TicketTime value={ticket.solvedAt} />
            </dd>
          </>
        )}
        {ticket.closedAt && (
          <>
            <dt>Finalizado</dt>
            <dd>
              <TicketTime value={ticket.closedAt} />
            </dd>
          </>
        )}
      </dl>
      <section aria-labelledby="ticket-comments-title">
        <h3 id="ticket-comments-title">Comentarios</h3>
        {ticket.comments.length ? (
          <ol>
            {ticket.comments.map((comment) => (
              <li key={comment.id}>
                <p>{comment.body}</p>
                <p>
                  {comment.author.fullName} · <TicketTime value={comment.createdAt} />
                </p>
              </li>
            ))}
          </ol>
        ) : (
          <p>Todavía no hay comentarios.</p>
        )}
      </section>
      <section aria-labelledby="ticket-history-title">
        <h3 id="ticket-history-title">Historial</h3>
        {ticket.history.length ? (
          <ol>
            {ticket.history.map((entry) => (
              <li key={entry.id}>
                <p>{eventLabels[entry.eventType]}</p>
                <p>
                  {entry.actor.fullName} · <TicketTime value={entry.createdAt} />
                </p>
                {entry.field && (
                  <p>
                    {entry.field}: {entry.oldValue ?? 'Sin valor'} → {entry.newValue ?? 'Sin valor'}
                  </p>
                )}
              </li>
            ))}
          </ol>
        ) : (
          <p>Todavía no hay cambios registrados.</p>
        )}
      </section>
    </section>
  )
}

type LoadState =
  | { kind: 'loading' }
  | { kind: 'found'; ticket: TicketDetail }
  | { kind: 'missing' }
  | { kind: 'failed' }

function TicketQuery({ id, onExpired }: { id: string; onExpired: () => void }) {
  const [state, setState] = useState<LoadState>({ kind: 'loading' })
  const [conflict, setConflict] = useState(false)
  const loading = state.kind === 'loading'
  const markMissing = useCallback(() => setState({ kind: 'missing' }), [])

  useEffect(() => {
    if (!loading) return
    const controller = new AbortController()
    void getTicket(id, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return
        if (result.kind === 'expired') onExpired()
        else setState(result)
      })
      .catch(() => {
        if (!controller.signal.aborted) setState({ kind: 'failed' })
      })
    return () => controller.abort()
  }, [id, loading, onExpired])

  return (
    <>
      {state.kind === 'loading' && <p role="status">Cargando el ticket…</p>}
      {state.kind === 'missing' && <p role="alert">El ticket no está disponible.</p>}
      {state.kind === 'failed' && (
        <>
          <p role="alert">No se pudo consultar el ticket.</p>
          <button type="button" onClick={() => setState({ kind: 'loading' })}>
            Reintentar
          </button>
        </>
      )}
      {state.kind === 'found' && (
        <>
          <TicketContent ticket={state.ticket} />
          {conflict && (
            <p role="alert">El ticket cambió. Se han actualizado el detalle y las acciones.</p>
          )}
          <TicketWorkflow
            key={state.ticket.workflowRevision}
            ticket={state.ticket}
            onExpired={onExpired}
            onMissing={markMissing}
            onConflict={() => {
              setConflict(true)
              setState({ kind: 'loading' })
            }}
            onUpdated={(ticket) => {
              setConflict(false)
              setState({ kind: 'found', ticket })
            }}
          />
        </>
      )}
      <p>
        <Link to="/">Volver al inicio</Link>
      </p>
    </>
  )
}

export function TicketDetailScreen({ onExpired }: { onExpired: () => void }) {
  const { id = '' } = useParams()
  return <TicketQuery key={id} id={id} onExpired={onExpired} />
}
