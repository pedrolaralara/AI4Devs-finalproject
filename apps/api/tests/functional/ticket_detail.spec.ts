import { test } from '@japa/runner'
import { DateTime } from 'luxon'
import Comment from '#models/comment'
import Ticket from '#models/ticket'
import TicketEvent from '#models/ticket_event'
import type { UserRole } from '#models/ticket_types'
import User from '#models/user'
import { withTicketAccount } from '#tests/support/ticket_account'

test('returns the detail and creation history of a ticket visible to its requester', async ({
  assert,
  client,
}) => {
  await withTicketAccount(client, 'requester', async (reporter, headers) => {
    const created = await client.post('/api/tickets').headers(headers).json({
      title: 'Consultar mi petición',
      description: 'Detalle de prueba.',
      urgency: 4,
      impact: 5,
    })
    created.assertStatus(201)

    const { id, key } = created.body()
    const detail = await client.get(`/api/tickets/${id}`).header('Cookie', headers.Cookie)
    detail.assertStatus(200)
    detail.assertBodyContains({ id, key })
    assert.deepEqual(detail.body().comments, [])
    const entry = detail.body().history[0]
    assert.equal(entry.eventType, 'created')
    assert.equal(entry.actor.id, reporter.id)

    const timestamp = DateTime.utc().plus({ days: 1 })
    const first = await Comment.create({
      ticketId: id,
      authorId: reporter.id,
      body: 'Primero',
      createdAt: timestamp,
    })
    const second = await Comment.create({
      ticketId: id,
      authorId: reporter.id,
      body: 'Segundo',
      createdAt: timestamp,
    })
    const laterEvent = await TicketEvent.create({
      ticketId: id,
      actorId: reporter.id,
      eventType: 'field_updated',
      field: 'title',
      oldValue: 'Antes',
      newValue: 'Después',
      createdAt: timestamp,
    })
    const populated = await client.get(`/api/tickets/${id}`).header('Cookie', headers.Cookie)
    populated.assertStatus(200)
    const { comments, history } = populated.body()
    assert.deepEqual(
      comments.map((comment: { id: string }) => comment.id),
      [first.id, second.id],
    )
    assert.deepEqual(comments[0].author, { id: reporter.id, fullName: reporter.fullName })
    assert.deepEqual(
      history.map((item: { id: string }) => item.id),
      [entry.id, laterEvent.id],
    )
  })
})

const viewers: UserRole[] = ['requester', 'agent', 'supervisor']

test('scopes the ticket and both collections to the visibility of each role')
  .with(viewers)
  .run(async ({ assert, client }, role) => {
    await withTicketAccount(client, role, async (viewer, headers) => {
      const outsider = await User.create({
        fullName: 'Otra cuenta',
        email: 'ticket-outsider@requesto.test',
        password: viewer.password,
        role: 'agent',
      })
      const base = {
        title: 'Visibilidad de prueba',
        description: 'Datos para la matriz de permisos.',
        urgency: 4,
        impact: 5,
      }
      try {
        const own = await Ticket.create({ ...base, reporterId: viewer.id })
        const unassigned = await Ticket.create({ ...base, reporterId: outsider.id })
        const selfAssigned = await Ticket.create({
          ...base,
          reporterId: outsider.id,
          assigneeId: viewer.id,
          status: 'assigned',
        })
        const otherAssigned = await Ticket.create({
          ...base,
          reporterId: outsider.id,
          assigneeId: outsider.id,
          status: 'assigned',
        })
        const canceled = await Ticket.create({
          ...base,
          reporterId: outsider.id,
          status: 'canceled',
        })

        const missing = await client
          .get('/api/tickets/9223372036854775807')
          .header('Cookie', headers.Cookie)
        missing.assertStatus(404)
        const overflow = await client
          .get('/api/tickets/9223372036854775808')
          .header('Cookie', headers.Cookie)
        overflow.assertStatus(404)
        assert.deepEqual(overflow.body(), missing.body())

        for (const [ticket, allowed] of [
          [own, true],
          [unassigned, role !== 'requester'],
          [selfAssigned, role !== 'requester'],
          [otherAssigned, role === 'supervisor'],
          [canceled, role === 'supervisor'],
        ] as const) {
          const detail = await client
            .get(`/api/tickets/${ticket.id}`)
            .header('Cookie', headers.Cookie)
          detail.assertStatus(allowed ? 200 : 404)
          if (allowed) detail.assertBodyContains({ id: ticket.id })
          else assert.deepEqual(detail.body(), missing.body())
        }

        const anonymous = await client.get(`/api/tickets/${own.id}`)
        anonymous.assertStatus(401)
      } finally {
        await Ticket.query().where('reporterId', outsider.id).delete()
        await outsider.delete()
      }
    })
  })
