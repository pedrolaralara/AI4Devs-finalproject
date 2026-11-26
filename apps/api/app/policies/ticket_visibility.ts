import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import Ticket from '#models/ticket'
import type User from '#models/user'

/** Returns a ticket query scoped to the account's visibility in the PRD. */
export function visibleTickets(user: User, client: TransactionClientContract) {
  const query = Ticket.query({ client })

  switch (user.role) {
    case 'requester':
      return query.where('reporterId', user.id)
    case 'agent':
      return query.where((visible) => {
        visible.where('assigneeId', user.id).orWhere((unassigned) => {
          unassigned.where('status', 'open').whereNull('assigneeId')
        })
      })
    case 'supervisor':
      return query
  }
}
