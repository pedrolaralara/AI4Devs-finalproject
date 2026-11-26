import type { TicketStatus, UserRole } from '#models/ticket_types'

export type WorkflowTicket = {
  status: TicketStatus
  reporterId: string
  assigneeId: string | null
}

export type WorkflowActor = { id: string; role: UserRole }

export type AvailableTransition = { to: TicketStatus; requiresAssignee: boolean }

/** Returns the transitions the actor can execute for this ticket. */
export function availableTransitions(
  _ticket: WorkflowTicket,
  _actor: WorkflowActor,
): AvailableTransition[] {
  return []
}
