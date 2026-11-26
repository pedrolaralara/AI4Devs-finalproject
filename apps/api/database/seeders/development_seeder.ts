import hash from '@adonisjs/core/services/hash'
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import Comment from '#models/comment'
import Ticket from '#models/ticket'
import TicketEvent from '#models/ticket_event'
import { type TicketStatus, ticketStatuses, type UserRole } from '#models/ticket_types'
import User from '#models/user'

const personas = [
  ['supervisor', 'supervisor'],
  ['operador1', 'agent'],
  ['operador2', 'agent'],
  ['usuario1', 'requester'],
  ['usuario2', 'requester'],
  ['usuario3', 'requester'],
] as const satisfies readonly (readonly [string, UserRole])[]

const paths: Record<TicketStatus, TicketStatus[]> = {
  open: [],
  assigned: ['assigned'],
  in_progress: ['assigned', 'in_progress'],
  pending_user: ['assigned', 'in_progress', 'pending_user'],
  solved: ['assigned', 'in_progress', 'solved'],
  closed: ['assigned', 'in_progress', 'solved', 'closed'],
  canceled: ['canceled'],
}

export default class extends BaseSeeder {
  static environment = ['development']

  async run() {
    const password = await hash.make('RequestoDemo24!')

    await db.transaction(async (client) => {
      const users: User[] = []
      for (const [name, role] of personas) {
        users.push(
          await User.firstOrCreate(
            { email: `${name}@requesto.test` },
            { fullName: name, role, password },
            { client },
          ),
        )
      }
      const operators = users.filter((user) => user.role === 'agent')
      const reporters = users.filter((user) => user.role === 'requester')

      for (const status of ticketStatuses) {
        for (const [index, reporter] of reporters.entries()) {
          const title = `Demo Requesto · ${status} · ${index + 1}`
          if (
            await Ticket.query({ client })
              .where('reporterId', reporter.id)
              .where('title', title)
              .first()
          ) {
            continue
          }

          const operator = operators[index % operators.length]
          const path = paths[status]
          const createdAt = DateTime.utc().minus({ days: index + 1 })
          const solvedIndex = path.indexOf('solved')
          const ticket = await Ticket.create(
            {
              title,
              description: 'Petición sintética de desarrollo de Requesto.',
              urgency: index + 2,
              impact: index + 3,
              reporterId: reporter.id,
              assigneeId: path.includes('assigned') ? operator.id : null,
              status,
              createdAt,
              solvedAt: solvedIndex < 0 ? null : createdAt.plus({ minutes: solvedIndex + 1 }),
              closedAt:
                status === 'closed' || status === 'canceled'
                  ? createdAt.plus({ minutes: path.length })
                  : null,
            },
            { client },
          )

          await TicketEvent.create(
            { ticketId: ticket.id, actorId: reporter.id, eventType: 'created', createdAt },
            { client },
          )
          for (const [step, destination] of path.entries()) {
            const actor =
              destination === 'canceled' || destination === 'closed' ? reporter : operator
            const eventTime = createdAt.plus({ minutes: step + 1 })
            await TicketEvent.create(
              {
                ticketId: ticket.id,
                actorId: actor.id,
                eventType: 'status_changed',
                field: 'status',
                oldValue: path[step - 1] ?? 'open',
                newValue: destination,
                createdAt: eventTime,
              },
              { client },
            )
            if (destination === 'assigned') {
              await TicketEvent.create(
                {
                  ticketId: ticket.id,
                  actorId: operator.id,
                  eventType: 'assigned',
                  field: 'assignee_id',
                  newValue: operator.id,
                  createdAt: eventTime,
                },
                { client },
              )
            }
          }

          await Comment.create(
            {
              ticketId: ticket.id,
              authorId: reporter.id,
              body: 'Comentario de ejemplo para la demostración.',
              createdAt,
            },
            { client },
          )
        }
      }
    })
  }
}
