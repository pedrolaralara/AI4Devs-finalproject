import type { TicketStatus, UserRole } from '#models/ticket_types'

export type WorkflowTicket = {
  status: TicketStatus
  reporterId: string
  assigneeId: string | null
}

export type WorkflowActor = { id: string; role: UserRole }

export type AvailableTransition = { to: TicketStatus; requiresAssignee: boolean }

type Rule = (ticket: WorkflowTicket, actor: WorkflowActor) => boolean

type TransitionDecision =
  | { kind: 'allowed'; transition: AvailableTransition }
  | { kind: 'forbidden' }
  | { kind: 'invalid' }

const isSupervisor: Rule = (_ticket, actor) => actor.role === 'supervisor'
const isReporter: Rule = (ticket, actor) => actor.id === ticket.reporterId
const canWork: Rule = (ticket, actor) =>
  isSupervisor(ticket, actor) || (actor.role === 'agent' && actor.id === ticket.assigneeId)
const canCancel: Rule = (ticket, actor) => isReporter(ticket, actor) || canWork(ticket, actor)

const rules: Record<TicketStatus, Partial<Record<TicketStatus, Rule>>> = {
  open: {
    assigned: (ticket, actor) =>
      isSupervisor(ticket, actor) || (actor.role === 'agent' && ticket.assigneeId === null),
    canceled: canCancel,
  },
  assigned: {
    assigned: isSupervisor,
    in_progress: canWork,
    canceled: canCancel,
  },
  in_progress: {
    pending_user: canWork,
    solved: canWork,
    canceled: canCancel,
  },
  pending_user: {
    in_progress: canWork,
    canceled: canCancel,
  },
  solved: {
    closed: (ticket, actor) =>
      (actor.role === 'requester' || actor.role === 'supervisor') && isReporter(ticket, actor),
  },
  closed: {},
  canceled: {},
}

/** Distinguishes transitions outside the workflow from actions forbidden to the actor. */
export function evaluateTransition(
  ticket: WorkflowTicket,
  actor: WorkflowActor,
  to: TicketStatus,
): TransitionDecision {
  const rule = rules[ticket.status][to]
  if (!rule) return { kind: 'invalid' }
  if (!rule(ticket, actor)) return { kind: 'forbidden' }

  return {
    kind: 'allowed',
    transition: { to, requiresAssignee: to === 'assigned' && actor.role === 'supervisor' },
  }
}

/** Returns the transitions the actor can execute for this ticket. */
export function availableTransitions(
  ticket: WorkflowTicket,
  actor: WorkflowActor,
): AvailableTransition[] {
  return (Object.keys(rules[ticket.status]) as TicketStatus[]).flatMap((to) => {
    const decision = evaluateTransition(ticket, actor, to)
    return decision.kind === 'allowed' ? [decision.transition] : []
  })
}
