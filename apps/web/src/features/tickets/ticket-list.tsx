import { type SubmitEvent, useEffect, useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router'
import { getTickets, type TicketPage } from './ticket-api'
import { statuses } from './ticket-status'

const sortOptions = [
  ['-priority', 'Mayor prioridad'],
  ['priority', 'Menor prioridad'],
  ['-createdAt', 'Creación más reciente'],
  ['createdAt', 'Creación más antigua'],
  ['-updatedAt', 'Actualización más reciente'],
  ['updatedAt', 'Actualización más antigua'],
]

function TicketFilters() {
  const [params, setParams] = useSearchParams()

  function applyFilters(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const next = new URLSearchParams()
    for (const field of [
      'status',
      'priority',
      'assigneeId',
      'reporterId',
      'q',
      'sort',
      'perPage',
    ]) {
      const value = form.getAll(field).map(String).join(',').trim()
      if (value) next.set(field, value)
    }
    setParams(next)
  }

  return (
    <form className="ticket-filters" onSubmit={applyFilters}>
      <label>
        Buscar por título o descripción
        <input name="q" maxLength={100} defaultValue={params.get('q') ?? ''} />
      </label>
      <label>
        Estados
        <select name="status" multiple defaultValue={params.get('status')?.split(',') ?? []}>
          {Object.entries(statuses).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label>
        Prioridades
        <select name="priority" multiple defaultValue={params.get('priority')?.split(',') ?? []}>
          {[1, 2, 3, 4, 5].map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
      </label>
      <label>
        Asignado a
        <input
          name="assigneeId"
          list="ticket-assignee-options"
          placeholder="ID del operador"
          defaultValue={params.get('assigneeId') ?? ''}
        />
        <datalist id="ticket-assignee-options">
          <option value="me" label="Asignados a mí" />
          <option value="none" label="Sin asignar" />
        </datalist>
      </label>
      <label>
        Abierto por
        <input
          name="reporterId"
          list="ticket-reporter-options"
          placeholder="ID del peticionario"
          defaultValue={params.get('reporterId') ?? ''}
        />
        <datalist id="ticket-reporter-options">
          <option value="me" label="Abiertos por mí" />
        </datalist>
      </label>
      <label>
        Orden
        <select name="sort" defaultValue={params.get('sort') ?? '-priority'}>
          {sortOptions.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label>
        Tickets por página
        <input
          name="perPage"
          type="number"
          min={1}
          max={100}
          defaultValue={params.get('perPage') ?? '25'}
        />
      </label>
      <button type="submit">Aplicar filtros</button>
      <Link to="/tickets">Limpiar filtros</Link>
    </form>
  )
}

function TicketResults({ search, onExpired }: { search: string; onExpired: () => void }) {
  const [page, setPage] = useState<TicketPage>()
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    void getTickets(search, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return
        if (result.kind === 'expired') onExpired()
        else setPage(result.page)
      })
      .catch(() => {
        if (!controller.signal.aborted) setFailed(true)
      })
    return () => controller.abort()
  }, [onExpired, search])

  if (failed)
    return <p role="alert">No se pudo consultar la lista de tickets. Revisa los filtros.</p>
  if (!page) return <p role="status">Cargando tickets…</p>

  const { currentPage, lastPage, total } = page.meta
  const pageLink = (number: number) => {
    const params = new URLSearchParams(search)
    params.set('page', String(number))
    return `?${params}`
  }

  return (
    <>
      {page.data.length ? (
        <ul>
          {page.data.map((ticket) => (
            <li key={ticket.id}>
              <Link to={`/tickets/${ticket.id}${search}`}>
                {ticket.key} · {ticket.title}
              </Link>
              <span>{` · ${statuses[ticket.status]} · Prioridad ${ticket.priority} de 5`}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p>No hay tickets disponibles.</p>
      )}
      {total > 0 && (
        <nav aria-label="Páginas del listado">
          <p>
            Página {currentPage} de {lastPage} · {total} tickets
          </p>
          {currentPage > 1 && (
            <Link to={pageLink(Math.min(currentPage - 1, lastPage))}>Anterior</Link>
          )}
          {currentPage < lastPage && <Link to={pageLink(currentPage + 1)}>Siguiente</Link>}
        </nav>
      )}
    </>
  )
}

export function TicketListScreen({ onExpired }: { onExpired: () => void }) {
  const { search } = useLocation()
  return (
    <section aria-labelledby="ticket-list-title">
      <h2 id="ticket-list-title">Tickets</h2>
      <TicketFilters key={`filters:${search}`} />
      <TicketResults key={`results:${search}`} search={search} onExpired={onExpired} />
    </section>
  )
}
