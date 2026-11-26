import { Bouncer } from '@adonisjs/bouncer'
import type { HttpContext } from '@adonisjs/core/http'
import { createTicketAbility } from '#abilities/create_ticket'
import { createTicket } from '#services/create_ticket'
import { createTicketValidator, unknownTicketFields } from '#validators/create_ticket'
import type { CreatedTicket } from '../interfaces/created_ticket.js'

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
    const guard = auth.use('web')
    if (!(await guard.check()) || !guard.user?.isActive) {
      return response.unauthorized({
        code: 'UNAUTHENTICATED',
        message: 'Inicia sesión para continuar.',
      })
    }

    const reporter = guard.user
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
      id: ticket.id,
      key: `REQ-${ticket.id}`,
      type: ticket.type,
      title: ticket.title,
      description: ticket.description,
      status: ticket.status,
      urgency: ticket.urgency,
      impact: ticket.impact,
      priority: ticket.priority,
      reporter: { id: reporter.id, fullName: reporter.fullName },
      assignee: null,
      solvedAt: null,
      closedAt: null,
      createdAt: ticket.createdAt.toJSDate().toISOString(),
      updatedAt: ticket.updatedAt.toJSDate().toISOString(),
    }

    return response.header('Location', `/api/tickets/${ticket.id}`).created(result)
  }
}
