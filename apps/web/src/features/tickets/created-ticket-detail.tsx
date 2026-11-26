import { Link, useParams } from 'react-router'
import type { CreatedTicket } from './ticket-api'

export function CreatedTicketDetail({ ticket }: { ticket?: CreatedTicket }) {
  const { id } = useParams()

  if (!ticket || ticket.id !== id) {
    return (
      <section>
        <p>El detalle de este ticket todavía no está disponible.</p>
        <Link to="/">Volver al inicio</Link>
      </section>
    )
  }

  return (
    <section aria-labelledby="created-ticket-title">
      <p role="status">Ticket creado</p>
      <h2 id="created-ticket-title">
        {ticket.key} · {ticket.title}
      </h2>
      <p>{ticket.description}</p>
      <dl>
        <dt>Estado</dt>
        <dd>{ticket.status === 'open' ? 'Abierto' : ticket.status}</dd>
        <dt>Prioridad</dt>
        <dd>{ticket.priority} de 5</dd>
      </dl>
      <Link to="/">Volver al inicio</Link>
    </section>
  )
}
