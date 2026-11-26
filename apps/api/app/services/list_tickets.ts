import db from '@adonisjs/lucid/services/db'
import type User from '#models/user'
import { visibleTickets } from '#policies/ticket_visibility'

/** Lists the first page and counts only tickets visible to the active account. */
export function listTickets(viewer: User) {
  return db.transaction(
    (client) =>
      visibleTickets(viewer, client)
        .preload('reporter')
        .preload('assignee')
        .orderBy('priority', 'desc')
        .orderBy('id')
        .paginate(1, 25),
    { isolationLevel: 'repeatable read' },
  )
}
