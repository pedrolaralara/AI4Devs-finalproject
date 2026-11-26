import db from '@adonisjs/lucid/services/db'
import Ticket from '#models/ticket'
import TicketEvent from '#models/ticket_event'
import type { createTicketValidator } from '#validators/create_ticket'

type TicketInput = Awaited<ReturnType<typeof createTicketValidator.validate>>

/**
 * Creates a Request and its initial history entry within the same transaction.
 * @throws If either record cannot be persisted.
 */
export function createTicket(input: TicketInput, reporterId: string) {
  return db.transaction(async (client) => {
    const ticket = await Ticket.create({ ...input, reporterId }, { client })
    await TicketEvent.create(
      { ticketId: ticket.id, actorId: reporterId, eventType: 'created' },
      { client },
    )
    return ticket
  })
}
