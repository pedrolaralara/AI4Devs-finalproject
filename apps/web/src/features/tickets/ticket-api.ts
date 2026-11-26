import { getCsrfToken } from '../auth/session-api'

export type TicketInput = {
  title: string
  description: string
  urgency: number
  impact: number
}

export type CreatedTicket = TicketInput & {
  id: string
  key: string
  status: 'open'
  priority: number
}

type FieldErrors = Partial<Record<keyof TicketInput, string>>
type CreateResult =
  | { kind: 'created'; ticket: CreatedTicket }
  | { kind: 'invalid'; fields: FieldErrors }
  | { kind: 'expired' }
  | { kind: 'failed'; message: string }

const defaultError = 'No se pudo crear el ticket.'

export async function createTicket(input: TicketInput, signal: AbortSignal): Promise<CreateResult> {
  const token = await getCsrfToken()
  const response = await fetch('/api/tickets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-XSRF-TOKEN': token },
    body: JSON.stringify(input),
    signal,
  })

  if (response.status === 201) return { kind: 'created', ticket: await response.json() }
  if (response.status === 401) return { kind: 'expired' }
  if (response.status === 422) {
    const { errors } = (await response.json()) as {
      errors: { field: string; message: string }[]
    }
    const fields: FieldErrors = {}
    for (const { field, message } of errors) {
      if (Object.hasOwn(input, field)) fields[field as keyof TicketInput] ??= message
    }
    return { kind: 'invalid', fields }
  }
  if (response.status === 403) {
    const { code } = await response.json()
    if (code === 'FORBIDDEN') {
      return { kind: 'failed', message: 'Tu rol no permite crear tickets.' }
    }
  }
  return { kind: 'failed', message: defaultError }
}
