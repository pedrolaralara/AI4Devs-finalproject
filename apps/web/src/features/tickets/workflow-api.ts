import { getCsrfToken } from '../auth/session-api'
import type { TicketDetail } from './ticket-api'

export type Transition = { to: TicketDetail['status']; requiresAssignee: boolean }
export type Operator = { id: string; fullName: string }

async function getWorkflowData<T>(
  path: string,
  signal: AbortSignal,
): Promise<{ kind: 'found'; data: T } | { kind: 'expired' } | { kind: 'missing' }> {
  const response = await fetch(path, { signal, cache: 'no-store' })
  if (response.status === 401) return { kind: 'expired' }
  if (response.status === 404) return { kind: 'missing' }
  if (!response.ok) throw new Error('No se pudo consultar el flujo.')
  return { kind: 'found', data: await response.json() }
}

export function getTransitions(id: string, signal: AbortSignal) {
  return getWorkflowData<Transition[]>(`/api/tickets/${encodeURIComponent(id)}/transitions`, signal)
}

export function getEligibleOperators(id: string, signal: AbortSignal) {
  return getWorkflowData<Operator[]>(
    `/api/tickets/${encodeURIComponent(id)}/eligible-assignees`,
    signal,
  )
}

type Result =
  | { kind: 'updated'; ticket: TicketDetail }
  | { kind: 'expired' }
  | { kind: 'missing' }
  | { kind: 'conflict' }
  | { kind: 'rejected'; message: string }

export async function submitTransition(
  id: string,
  input: { to: TicketDetail['status']; expectedRevision: number; assigneeId?: string },
  signal: AbortSignal,
): Promise<Result> {
  const token = await getCsrfToken()
  const response = await fetch(`/api/tickets/${encodeURIComponent(id)}/transitions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-XSRF-TOKEN': token },
    body: JSON.stringify(input),
    signal,
  })

  switch (response.status) {
    case 200:
      return { kind: 'updated', ticket: await response.json() }
    case 401:
      return { kind: 'expired' }
    case 404:
      return { kind: 'missing' }
    case 409:
      return { kind: 'conflict' }
    case 403:
    case 422: {
      const error = await response.json()
      return {
        kind: 'rejected',
        message: error.errors?.[0]?.message ?? error.message ?? 'La acción no está disponible.',
      }
    }
    default:
      throw new Error('No se pudo confirmar el cambio del ticket.')
  }
}
