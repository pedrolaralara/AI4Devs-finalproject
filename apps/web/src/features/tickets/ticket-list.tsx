import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { getTickets, type TicketListItem } from './ticket-api'
import { statuses } from './ticket-status'

export function TicketListScreen({ onExpired }: { onExpired: () => void }) {
  const [tickets, setTickets] = useState<TicketListItem[]>()
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    void getTickets(controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return
        if (result.kind === 'expired') onExpired()
        else setTickets(result.tickets)
      })
      .catch(() => {
        if (!controller.signal.aborted) setFailed(true)
      })
    return () => controller.abort()
  }, [onExpired])

  return (
    <section aria-labelledby="ticket-list-title">
      <h2 id="ticket-list-title">Tickets</h2>
      {failed ? (
        <p role="alert">No se pudo consultar la lista de tickets.</p>
      ) : tickets === undefined ? (
        <p role="status">Cargando tickets…</p>
      ) : tickets.length === 0 ? (
        <p>No hay tickets disponibles.</p>
      ) : (
        <ul>
          {tickets.map((ticket) => (
            <li key={ticket.id}>
              <Link to={`/tickets/${ticket.id}`}>
                {ticket.key} · {ticket.title}
              </Link>
              <span>{` · ${statuses[ticket.status]} · Prioridad ${ticket.priority} de 5`}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
