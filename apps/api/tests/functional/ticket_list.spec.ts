import { test } from '@japa/runner'
import Ticket from '#models/ticket'
import type { UserRole } from '#models/ticket_types'
import User from '#models/user'
import { withTicketAccount } from '#tests/support/ticket_account'

const roles: UserRole[] = ['requester', 'agent', 'supervisor']

test('requires an active session to list tickets', async ({ client }) => {
  const result = await client.get('/api/tickets')

  result.assertStatus(401)
  result.assertBodyContains({ code: 'UNAUTHENTICATED' })
})

test('lists only visible tickets with a total scoped to the active role')
  .with(roles)
  .run(async ({ assert, client }, role) => {
    await withTicketAccount(client, role, async (viewer, headers) => {
      const other = await User.create({
        fullName: 'Otro operador',
        email: 'ticket-list-outsider@requesto.test',
        password: viewer.password,
        role: 'agent',
      })
      const base = {
        title: 'Listado de prueba',
        description: 'Datos para comprobar la visibilidad.',
        urgency: 3,
        impact: 3,
      }

      try {
        const own = await Ticket.create({ ...base, reporterId: viewer.id })
        const open = await Ticket.create({
          ...base,
          description: 'Ejemplo con 100% de avance',
          reporterId: other.id,
        })
        const assigned = await Ticket.create({
          ...base,
          reporterId: other.id,
          status: 'assigned',
          assigneeId: role === 'agent' ? viewer.id : other.id,
        })
        const canceled = await Ticket.create({
          ...base,
          reporterId: other.id,
          status: 'canceled',
        })
        const expected = {
          requester: [own.id],
          agent: [own.id, open.id, assigned.id],
          supervisor: [own.id, open.id, assigned.id, canceled.id],
        }[role]

        const result = await client.get('/api/tickets').header('Cookie', headers.Cookie)

        result.assertStatus(200)
        const { data, meta } = result.body()
        assert.sameMembers(
          data.map((ticket: { id: string }) => ticket.id),
          expected,
        )
        assert.equal(meta.total, expected.length)

        const filtered = await client
          .get('/api/tickets')
          .header('Cookie', headers.Cookie)
          .qs({ status: 'open,assigned', q: '100%', assigneeId: 'none', perPage: 1 })
        filtered.assertStatus(200)
        assert.equal(filtered.body().meta.total, role === 'requester' ? 0 : 1)

        const page = await client
          .get('/api/tickets')
          .header('Cookie', headers.Cookie)
          .qs({ page: 2, perPage: 1 })
        page.assertStatus(200)
        assert.equal(page.body().meta.total, expected.length)
        assert.equal(page.body().meta.currentPage, 2)

        const invalid = await client
          .get('/api/tickets')
          .header('Cookie', headers.Cookie)
          .qs({ perPage: 101, reporterId: '9223372036854775808' })
        invalid.assertStatus(422)
      } finally {
        await Ticket.query().where('reporterId', other.id).delete()
        await other.delete()
      }
    })
  })
