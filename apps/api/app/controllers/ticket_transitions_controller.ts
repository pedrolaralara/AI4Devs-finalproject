import type { HttpContext } from '@adonisjs/core/http'
import {
  listEligibleAssignees,
  listTicketTransitions,
  updateTicketWorkflow,
} from '#services/update_ticket_workflow'
import { ticketTransitionValidator, unknownTransitionFields } from '#validators/ticket_transition'
import {
  activeUser,
  serializeTicketDetail,
  ticketNotFound,
  unauthenticated,
  validTicketId,
} from './ticket_http.js'

export default class TicketTransitionsController {
  /**
   * @eligibleAssignees
   * @summary Consultar los operadores elegibles
   * @description Devuelve los operadores activos disponibles para la asignación del ticket.
   * @paramPath id - Identificador decimal del ticket - @type(string) @required
   * @responseBody 200 - <TicketReporter[]> - Operadores elegibles
   * @responseBody 401 - <SessionError> - UNAUTHENTICATED
   * @responseBody 403 - <SessionError> - FORBIDDEN
   * @responseBody 404 - <SessionError> - TICKET_NOT_FOUND
   */
  async eligibleAssignees({ auth, params, response }: HttpContext) {
    const actor = await activeUser(auth)
    if (!actor) return unauthenticated(response)
    const id: string = params.id
    if (!validTicketId(id)) return ticketNotFound(response)

    const result = await listEligibleAssignees(id, actor)
    if (result.kind === 'missing') return ticketNotFound(response)
    if (result.kind === 'forbidden') {
      return response.forbidden({
        code: 'FORBIDDEN',
        message: 'Solo los supervisores pueden consultar los operadores elegibles.',
      })
    }
    return result.operators
  }

  /**
   * @index
   * @summary Consultar las acciones del flujo
   * @description Devuelve las transiciones disponibles para el usuario de la sesión.
   * @paramPath id - Identificador decimal del ticket - @type(string) @required
   * @responseBody 200 - <TicketTransitionOption[]> - Transiciones disponibles
   * @responseBody 401 - <SessionError> - UNAUTHENTICATED
   * @responseBody 404 - <SessionError> - TICKET_NOT_FOUND
   */
  async index({ auth, params, response }: HttpContext) {
    const actor = await activeUser(auth)
    if (!actor) return unauthenticated(response)
    const id: string = params.id
    const transitions = validTicketId(id) ? await listTicketTransitions(id, actor) : null
    return transitions ?? ticketNotFound(response)
  }

  /**
   * @store
   * @summary Ejecutar una transición
   * @description Cambia el estado o asignado con control de revisión y registra el historial.
   * @paramPath id - Identificador decimal del ticket - @type(string) @required
   * @paramHeader X-XSRF-TOKEN - Valor de la cookie XSRF-TOKEN - @type(string) @required
   * @requestBody <ticketTransitionValidator>
   * @responseBody 200 - <TicketDetail> - Ticket actualizado
   * @responseBody 401 - <SessionError> - UNAUTHENTICATED
   * @responseBody 403 - <SessionError> - FORBIDDEN_TRANSITION o INVALID_CSRF_TOKEN
   * @responseBody 404 - <SessionError> - TICKET_NOT_FOUND
   * @responseBody 409 - <SessionError> - STALE_TICKET
   * @responseBody 422 - <ValidationErrors> - Datos o transición inválida
   * @throws When validation or persistence fails.
   */
  async store({ auth, params, request, response }: HttpContext) {
    const actor = await activeUser(auth)
    if (!actor) return unauthenticated(response)
    const id: string = params.id
    if (!validTicketId(id)) return ticketNotFound(response)

    const body = request.body()
    const input = await ticketTransitionValidator.validate(body)
    const errors = unknownTransitionFields(body)
    if (errors.length) return response.unprocessableEntity({ errors })

    const result = await updateTicketWorkflow(id, actor, input)
    switch (result.kind) {
      case 'updated':
        return serializeTicketDetail(result.detail)
      case 'missing':
        return ticketNotFound(response)
      case 'stale':
        return response.conflict({
          code: 'STALE_TICKET',
          message: 'El ticket cambió. Recarga el detalle.',
        })
      case 'forbidden':
        return response.forbidden({
          code: 'FORBIDDEN_TRANSITION',
          message: 'No tienes permiso para ejecutar esta transición.',
        })
      case 'invalid_assignee':
        return response.unprocessableEntity({
          errors: [
            {
              field: 'assigneeId',
              rule: 'eligible',
              message:
                'Selecciona un operador activo distinto al asignado actual para asignar el ticket.',
            },
          ],
        })
      case 'invalid':
        return response.unprocessableEntity({
          code: 'INVALID_TRANSITION',
          message: 'Esta transición no existe desde el estado actual.',
        })
    }
  }
}
