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

export const ticketEventTypes = [
  'created',
  'status_changed',
  'assigned',
  'unassigned',
  'field_updated',
] as const
export type TicketEventType = (typeof ticketEventTypes)[number]
