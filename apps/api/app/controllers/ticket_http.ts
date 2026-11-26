import type { HttpContext } from '@adonisjs/core/http'
import type Ticket from '#models/ticket'
import type User from '#models/user'
import type { TicketDetail } from '../interfaces/ticket_detail.js'

export function ticketFields(ticket: Ticket) {
  return {
    id: ticket.id,
    key: `REQ-${ticket.id}`,
    type: ticket.type,
    title: ticket.title,
    description: ticket.description,
    status: ticket.status,
    urgency: ticket.urgency,
    impact: ticket.impact,
    priority: ticket.priority,
    createdAt: ticket.createdAt.toJSDate().toISOString(),
    updatedAt: ticket.updatedAt.toJSDate().toISOString(),
  }
}

export function userSummary(user: User) {
  return { id: user.id, fullName: user.fullName }
}

export async function activeUser(auth: HttpContext['auth']) {
  const guard = auth.use('web')
  return (await guard.check()) && guard.user?.isActive ? guard.user : null
}

export function unauthenticated(response: HttpContext['response']) {
  return response.unauthorized({
    code: 'UNAUTHENTICATED',
    message: 'Inicia sesión para continuar.',
  })
}

export function ticketNotFound(response: HttpContext['response']) {
  return response.notFound({ code: 'TICKET_NOT_FOUND', message: 'El ticket no está disponible.' })
}

export function validTicketId(id: string) {
  const maxId = '9223372036854775807'
  return /^[1-9][0-9]{0,18}$/.test(id) && (id.length < maxId.length || id <= maxId)
}

export function serializeTicketSummary(ticket: Ticket) {
  return {
    ...ticketFields(ticket),
    reporter: userSummary(ticket.reporter),
    assignee: ticket.assignee ? userSummary(ticket.assignee) : null,
    solvedAt: ticket.solvedAt?.toJSDate().toISOString() ?? null,
    closedAt: ticket.closedAt?.toJSDate().toISOString() ?? null,
  }
}

export function serializeTicketDetail(ticket: Ticket): TicketDetail {
  return {
    ...serializeTicketSummary(ticket),
    workflowRevision: ticket.workflowRevision,
    comments: ticket.comments.map((comment) => ({
      id: comment.id,
      body: comment.body,
      author: userSummary(comment.author),
      createdAt: comment.createdAt.toJSDate().toISOString(),
    })),
    history: ticket.events.map((event) => ({
      id: event.id,
      eventType: event.eventType,
      actor: userSummary(event.actor),
      field: event.field,
      oldValue: event.oldValue,
      newValue: event.newValue,
      createdAt: event.createdAt.toJSDate().toISOString(),
    })),
  }
}
