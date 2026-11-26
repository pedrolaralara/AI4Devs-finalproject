import { Bouncer } from '@adonisjs/bouncer'
import type { HttpContext } from '@adonisjs/core/http'
import { createTicketAbility } from '#abilities/create_ticket'
import { createTicket } from '#services/create_ticket'
import { listTickets } from '#services/list_tickets'
import { viewTicket } from '#services/view_ticket'
import { createTicketValidator, unknownTicketFields } from '#validators/create_ticket'
import { ticketListValidator } from '#validators/ticket_list'
import type { CreatedTicket } from '../interfaces/created_ticket.js'
import type { TicketPage } from '../interfaces/ticket_page.js'
import {
  activeUser,
  serializeTicketDetail,
  serializeTicketSummary,
  ticketFields,
  ticketNotFound,
  unauthenticated,
  userSummary,
  validTicketId,
} from './ticket_http.js'

export default class TicketsController {
  /**
   * @index
   * @summary Listar los tickets visibles
   * @description Devuelve una página de los tickets visibles que cumplen los filtros.
   * @paramQuery status - Estados separados por comas - @type(string)
   * @paramQuery priority - Prioridades del 1 al 5 separadas por comas - @type(string)
   * @paramQuery assigneeId - ID, me o none - @type(string)
   * @paramQuery reporterId - ID o me - @type(string)
   * @paramQuery q - Texto en título o descripción - @type(string)
   * @paramQuery sort - Campo de orden, con prefijo negativo para descendente - @type(string)
   * @paramQuery page - Página desde 1 - @type(number)
   * @paramQuery perPage - Tamaño de página del 1 al 100 - @type(number)
   * @responseBody 200 - <TicketPage> - Página de tickets
   * @responseBody 401 - <SessionError> - UNAUTHENTICATED
   * @responseBody 422 - <ValidationErrors> - Parámetros inválidos
   */
  async index({ auth, request, response }: HttpContext) {
    const viewer = await activeUser(auth)
    if (!viewer) return unauthenticated(response)

    const input = await ticketListValidator.validate(request.qs())
    const page = await listTickets(viewer, input)
    const result: TicketPage = {
      meta: {
        total: page.total,
        perPage: page.perPage,
        currentPage: page.currentPage,
        lastPage: page.lastPage,
      },
      data: page.all().map(serializeTicketSummary),
    }
    return result
  }

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
    const ticket = validTicketId(id) ? await viewTicket(id, viewer) : null
    if (!ticket) return ticketNotFound(response)

    return serializeTicketDetail(ticket)
  }
}
