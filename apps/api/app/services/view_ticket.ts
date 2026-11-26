import db from '@adonisjs/lucid/services/db'
import type User from '#models/user'
import { visibleTickets } from '#policies/ticket_visibility'

/** Loads a visible ticket and its relations from the same database snapshot. */
export function viewTicket(id: string, viewer: User) {
  return db.transaction(
    (client) =>
      visibleTickets(viewer, client)
        .where('id', id)
        .preload('reporter')
        .preload('assignee')
        .preload('comments', (comments) => {
          comments.preload('author').orderBy('createdAt').orderBy('id')
        })
        .preload('events', (events) => {
          events.preload('actor').orderBy('createdAt').orderBy('id')
        })
        .first(),
    { isolationLevel: 'repeatable read' },
  )
}
