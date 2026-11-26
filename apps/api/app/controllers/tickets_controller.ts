import { Bouncer } from '@adonisjs/bouncer'
import type { HttpContext } from '@adonisjs/core/http'
import { createTicketAbility } from '#abilities/create_ticket'
import type Ticket from '#models/ticket'
import type User from '#models/user'
import { createTicket } from '#services/create_ticket'
import { viewTicket } from '#services/view_ticket'
import { createTicketValidator, unknownTicketFields } from '#validators/create_ticket'
import type { CreatedTicket } from '../interfaces/created_ticket.js'

import type { TicketDetail } from '../interfaces/ticket_detail.js'

function ticketFields(ticket: Ticket) {
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

function userSummary(user: User) {
  return { id: user.id, fullName: user.fullName }
}

async function activeUser(auth: HttpContext['auth']) {
  const guard = auth.use('web')
  return (await guard.check()) && guard.user?.isActive ? guard.user : null
}

function unauthenticated(response: HttpContext['response']) {
  return response.unauthorized({
    code: 'UNAUTHENTICATED',
    message: 'Inicia sesión para continuar.',
  })
}

export default class TicketsController {
  /**
   * @store
   * @summary Crear un ticket
   * @description Crea un Request y su evento de historial. Admite peticionarios y supervisores.
   * @paramHeader X-XSRF-TOKEN - Valor de la cookie XSRF-TOKEN - @type(string) @required
   * @requestBody <createTicketValidator>
   * @responseBody 201 - <CreatedTicket> - Ticket creado
   * @responseHeader 201 - Location - URL del ticket creado
   * @responseBody 401 - <SessionError> - UNAUTHENTICATED
   * @responseBody 403 - <SessionError> - FORBIDDEN o INVALID_CSRF_TOKEN
   * @responseBody 422 - <ValidationErrors> - Cuerpo inválido según VineJS
   * @throws When validation or persistence fails.
   */
  async store({ auth, request, response }: HttpContext) {
    const reporter = await activeUser(auth)
    if (!reporter) return unauthenticated(response)

    if (await new Bouncer(reporter).denies(createTicketAbility)) {
      return response.forbidden({
        code: 'FORBIDDEN',
        message: 'Solo los peticionarios y supervisores pueden abrir tickets.',
      })
    }

    const body = request.body()
    const input = await createTicketValidator.validate(body)
    const errors = unknownTicketFields(body)
    if (errors.length) return response.unprocessableEntity({ errors })

    const ticket = await createTicket(input, reporter.id)
    const result: CreatedTicket = {
      ...ticketFields(ticket),
      reporter: userSummary(reporter),
      assignee: null,
      solvedAt: null,
      closedAt: null,
    }

    return response.header('Location', `/api/tickets/${ticket.id}`).created(result)
  }

  /**
   * @show
   * @summary Consultar el detalle de un ticket
   * @description Devuelve los campos, comentarios e historial si el ticket es visible.
   * @paramPath id - Identificador decimal del ticket - @type(string) @required
   * @responseBody 200 - <TicketDetail> - Detalle del ticket
   * @responseBody 401 - <SessionError> - UNAUTHENTICATED
   * @responseBody 404 - <SessionError> - TICKET_NOT_FOUND
   */
  async show({ auth, params, response }: HttpContext) {
    const viewer = await activeUser(auth)
    if (!viewer) return unauthenticated(response)

    const id: string = params.id
    const maxId = '9223372036854775807'
    const validId = /^[1-9][0-9]{0,18}$/.test(id) && (id.length < maxId.length || id <= maxId)
    const ticket = validId ? await viewTicket(id, viewer) : null
    if (!ticket) {
      return response.notFound({
        code: 'TICKET_NOT_FOUND',
        message: 'El ticket no está disponible.',
      })
    }

    const detail: TicketDetail = {
      ...ticketFields(ticket),
      reporter: userSummary(ticket.reporter),
      assignee: ticket.assignee ? userSummary(ticket.assignee) : null,
      solvedAt: ticket.solvedAt?.toJSDate().toISOString() ?? null,
      closedAt: ticket.closedAt?.toJSDate().toISOString() ?? null,
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
    return detail
  }
}
