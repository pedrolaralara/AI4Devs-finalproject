import { type SubmitEvent, useEffect, useRef, useState } from 'react'
import { type CreatedTicket, createTicket, type TicketInput } from './ticket-api'

const urgencyLevels = ['Puede esperar', 'Baja', 'Media', 'Alta', 'Inmediata']
const impactLevels = ['Muy limitado', 'Limitado', 'Moderado', 'Amplio', 'Crítico']

export function CreateTicketForm({
  onCreated,
  onExpired,
}: {
  onCreated: (ticket: CreatedTicket) => void
  onExpired: () => void
}) {
  const [urgency, setUrgency] = useState('')
  const [impact, setImpact] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof TicketInput, string>>>({})
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const request = useRef<AbortController | null>(null)
  const priority = urgency && impact ? Math.ceil((Number(urgency) * Number(impact)) / 5) : null

  useEffect(() => () => request.current?.abort(), [])

  function errorAttributes(field: keyof TicketInput) {
    return {
      'aria-invalid': fieldErrors[field] ? true : undefined,
      'aria-describedby': fieldErrors[field] ? `ticket-${field}-error` : undefined,
    }
  }

  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    if (request.current) return
    const controller = new AbortController()
    request.current = controller
    const data = new FormData(event.currentTarget)
    setFieldErrors({})
    setError('')
    setPending(true)
    try {
      const result = await createTicket(
        {
          title: String(data.get('title')),
          description: String(data.get('description')),
          urgency: Number(urgency),
          impact: Number(impact),
        },
        controller.signal,
      )
      if (controller.signal.aborted) return
      if (result.kind === 'created') onCreated(result.ticket)
      if (result.kind === 'expired') onExpired()
      if (result.kind === 'invalid') {
        setFieldErrors(result.fields)
        setError('Revisa los datos del ticket.')
      }
      if (result.kind === 'failed') setError(result.message)
    } catch {
      if (!controller.signal.aborted) setError('No se pudo confirmar la creación del ticket.')
    } finally {
      request.current = null
      if (!controller.signal.aborted) setPending(false)
    }
  }

  return (
    <section aria-labelledby="create-ticket-title">
      <h2 id="create-ticket-title">Crear ticket</h2>
      <form onSubmit={submit}>
        <label htmlFor="ticket-title">Título</label>
        <input
          id="ticket-title"
          name="title"
          required
          maxLength={200}
          {...errorAttributes('title')}
        />
        {fieldErrors.title && <p id="ticket-title-error">{fieldErrors.title}</p>}

        <label htmlFor="ticket-description">Descripción</label>
        <textarea
          id="ticket-description"
          name="description"
          rows={5}
          required
          {...errorAttributes('description')}
        />
        {fieldErrors.description && <p id="ticket-description-error">{fieldErrors.description}</p>}

        <label htmlFor="ticket-urgency">Urgencia</label>
        <select
          id="ticket-urgency"
          value={urgency}
          onChange={(event) => setUrgency(event.target.value)}
          required
          {...errorAttributes('urgency')}
        >
          <option value="">Selecciona la urgencia</option>
          {urgencyLevels.map((label, index) => (
            <option key={label} value={index + 1}>
              {index + 1} · {label}
            </option>
          ))}
        </select>
        {fieldErrors.urgency && <p id="ticket-urgency-error">{fieldErrors.urgency}</p>}

        <label htmlFor="ticket-impact">Impacto</label>
        <select
          id="ticket-impact"
          value={impact}
          onChange={(event) => setImpact(event.target.value)}
          required
          {...errorAttributes('impact')}
        >
          <option value="">Selecciona el impacto</option>
          {impactLevels.map((label, index) => (
            <option key={label} value={index + 1}>
              {index + 1} · {label}
            </option>
          ))}
        </select>
        {fieldErrors.impact && <p id="ticket-impact-error">{fieldErrors.impact}</p>}

        <output htmlFor="ticket-urgency ticket-impact">
          {priority === null
            ? 'Selecciona urgencia e impacto para ver la prioridad.'
            : `Prioridad estimada: ${priority} de 5`}
        </output>
        {error && <p role="alert">{error}</p>}
        <button type="submit" disabled={pending}>
          {pending ? 'Guardando…' : 'Crear ticket'}
        </button>
      </form>
    </section>
  )
}
