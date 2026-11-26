import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import TicketEvent from '#models/ticket_event'
import type User from '#models/user'
import { visibleTickets } from '#policies/ticket_visibility'
import type { ticketTransitionValidator } from '#validators/ticket_transition'
import { availableTransitions, evaluateTransition } from './ticket_workflow.js'
import { ticketDetailQuery } from './view_ticket.js'

type TransitionInput = Awaited<ReturnType<typeof ticketTransitionValidator.validate>>

/** Lists only actions permitted on a visible ticket. */
export function listTicketTransitions(id: string, actor: User) {
  return db.transaction(async (client) => {
    const ticket = await visibleTickets(actor, client).where('id', id).first()
    return ticket ? availableTransitions(ticket, actor) : null
  })
}

/**
 * Updates a visible ticket at the expected revision and records its changes atomically.
 * @throws If persistence fails.
 */
export function updateTicketWorkflow(id: string, actor: User, input: TransitionInput) {
  return db.transaction(async (client) => {
    const ticket = await visibleTickets(actor, client).where('id', id).first()
    if (!ticket) return { kind: 'missing' } as const
    if (ticket.workflowRevision !== input.expectedRevision) return { kind: 'stale' } as const

    const decision = evaluateTransition(ticket, actor, input.to)
    if (decision.kind !== 'allowed') return decision

    let assigneeId = ticket.assigneeId
    if (input.to === 'assigned') {
      if (actor.role === 'agent' && input.assigneeId && input.assigneeId !== actor.id) {
        return { kind: 'forbidden' } as const
      }
      const selected = actor.role === 'agent' ? actor.id : input.assigneeId
      if (!selected || BigInt(selected) > 9223372036854775807n || selected === ticket.assigneeId) {
        return { kind: 'invalid_assignee' } as const
      }

      const operator = await client
        .from('users')
        .where({ id: selected, role: 'agent', is_active: true })
        .forShare()
        .first()
      if (!operator) return { kind: 'invalid_assignee' } as const
      assigneeId = selected
    } else if (input.assigneeId !== undefined) {
      return { kind: 'invalid_assignee' } as const
    }

    const now = DateTime.utc()
    const timestamp = now.toJSDate()
    const update = {
      status: input.to,
      assignee_id: assigneeId,
      workflow_revision: input.expectedRevision + 1,
      updated_at: timestamp,
      ...(input.to === 'solved' ? { solved_at: timestamp } : {}),
      ...(input.to === 'closed' || input.to === 'canceled' ? { closed_at: timestamp } : {}),
    }

    const [changed] = await client
      .from('tickets')
      .where({ id, workflow_revision: input.expectedRevision })
      .update(update)
      .returning('id')
    if (!changed) return { kind: 'stale' } as const

    if (ticket.status !== input.to) {
      await TicketEvent.create(
        {
          ticketId: id,
          actorId: actor.id,
          eventType: 'status_changed',
          field: 'status',
          oldValue: ticket.status,
          newValue: input.to,
          createdAt: now,
        },
        { client },
      )
    }
    if (assigneeId !== ticket.assigneeId) {
      await TicketEvent.create(
        {
          ticketId: id,
          actorId: actor.id,
          eventType: 'assigned',
          field: 'assignee_id',
          oldValue: ticket.assigneeId,
          newValue: assigneeId,
          createdAt: now,
        },
        { client },
      )
    }

    const detail = await ticketDetailQuery(id, actor, client).firstOrFail()
    return { kind: 'updated', detail } as const
  })
}
