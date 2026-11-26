import db from '@adonisjs/lucid/services/db'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import type User from '#models/user'
import { visibleTickets } from '#policies/ticket_visibility'

/** Builds the same scoped detail query for reads and transitions. */
export function ticketDetailQuery(id: string, viewer: User, client: TransactionClientContract) {
  return visibleTickets(viewer, client)
    .where('id', id)
    .preload('reporter')
    .preload('assignee')
    .preload('comments', (comments) => {
      comments.preload('author').orderBy('createdAt').orderBy('id')
    })
    .preload('events', (events) => {
      events.preload('actor').orderBy('createdAt').orderBy('id')
    })
}

/** Loads a visible ticket and its relations from the same database snapshot. */
export function viewTicket(id: string, viewer: User) {
  return db.transaction((client) => ticketDetailQuery(id, viewer, client).first(), {
    isolationLevel: 'repeatable read',
  })
}
