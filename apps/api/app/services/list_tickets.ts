import db from '@adonisjs/lucid/services/db'
import type User from '#models/user'
import { visibleTickets } from '#policies/ticket_visibility'
import type { TicketListQuery } from '#validators/ticket_list'

/** Filters, sorts and counts the tickets visible to the active account. */
export function listTickets(viewer: User, input: TicketListQuery) {
  const {
    status,
    priority,
    assigneeId,
    reporterId,
    q,
    sort = '-priority',
    page = 1,
    perPage = 25,
  } = input
  const order = sort.startsWith('-') ? 'desc' : 'asc'
  const column = sort.replace(/^-/, '')

  return db.transaction(
    (client) => {
      const query = visibleTickets(viewer, client).preload('reporter').preload('assignee')
      if (status) query.whereIn('status', status.split(','))
      if (priority) query.whereIn('priority', priority.split(',').map(Number))
      if (assigneeId === 'none') query.whereNull('assigneeId')
      else if (assigneeId) query.where('assigneeId', assigneeId === 'me' ? viewer.id : assigneeId)
      if (reporterId) query.where('reporterId', reporterId === 'me' ? viewer.id : reporterId)
      if (q) {
        const pattern = `%${q.replace(/[\\%_]/g, '\\$&')}%`
        query.where((search) => {
          search.whereRaw('title ILIKE ?', [pattern]).orWhereRaw('description ILIKE ?', [pattern])
        })
      }
      return query.orderBy(column, order).orderBy('id').paginate(page, perPage)
    },
    { isolationLevel: 'repeatable read' },
  )
}
