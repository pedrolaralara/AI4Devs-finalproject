export const userRoles = ['requester', 'agent', 'supervisor'] as const
export type UserRole = (typeof userRoles)[number]

export const ticketStatuses = [
  'open',
  'assigned',
  'in_progress',
  'pending_user',
  'solved',
  'closed',
  'canceled',
] as const
export type TicketStatus = (typeof ticketStatuses)[number]

export function validTicketId(id: string) {
  const maxId = '9223372036854775807'
  return /^[1-9][0-9]{0,18}$/.test(id) && (id.length < maxId.length || id <= maxId)
}

export const ticketEventTypes = [
  'created',
  'status_changed',
  'assigned',
  'unassigned',
  'field_updated',
] as const
export type TicketEventType = (typeof ticketEventTypes)[number]
