import { rejects } from 'node:assert/strict'
import db from '@adonisjs/lucid/services/db'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import { test } from '@japa/runner'
import Ticket from '#models/ticket'
import User from '#models/user'

const timestamp = '2026-01-01T00:00:00Z'
const sampleUser = {
  full_name: 'Usuario de prueba',
  email: 'usuario@requesto.test',
  password: 'hash-fixture',
  role: 'requester',
}

async function withFixture(
  check: (
    client: TransactionClientContract,
    reporterId: string,
    operatorId: string,
  ) => Promise<void>,
) {
  const client = await db.transaction()
  try {
    const [reporter, operator] = await client
      .table('users')
      .insert([sampleUser, { ...sampleUser, email: 'operador@requesto.test', role: 'agent' }])
      .returning('id')
    await check(client, reporter.id, operator.id)
  } finally {
    await client.rollback()
  }
}

function ticketData(reporterId: string) {
  return {
    title: 'Petición',
    description: 'Detalle',
    reporter_id: reporterId,
    urgency: 4,
    impact: 5,
  }
}

const priorityCases = [
  [1, 1, 1],
  [1, 5, 1],
  [2, 3, 2],
  [3, 5, 3],
  [4, 5, 4],
  [5, 5, 5],
]

test('computes and refreshes the generated priority inside the transaction', async ({ assert }) => {
  await withFixture(async (client, reporterId) => {
    for (const [urgency, impact, expected] of priorityCases) {
      const [row] = await client
        .table('tickets')
        .insert({
          ...ticketData(reporterId),
          urgency,
          impact,
        })
        .returning('priority')
      assert.equal(row.priority, expected)
    }

    const ticket = await Ticket.create(
      {
        title: 'Petición mediante Lucid',
        description: 'Detalle',
        reporterId,
        urgency: 4,
        impact: 5,
      },
      { client },
    )
    assert.equal(ticket.priority, 4)
    ticket.urgency = 5
    await ticket.save()
    assert.equal(ticket.priority, 5)

    const user = await User.findOrFail(reporterId, { client })
    assert.notProperty(user.serialize(), 'password')
    assert.equal((await user.related('reportedTickets').query()).length, 7)
  })
})

const invalidTicketCases = [
  { input: { title: null }, code: '23502' },
  { input: { type: 'incident' }, code: '23514', constraint: 'tickets_type_request' },
  { input: { urgency: 0 }, code: '23514', constraint: 'tickets_urgency_range' },
  { input: { impact: 6 }, code: '23514', constraint: 'tickets_impact_range' },
  { input: { status: 'in_progress' }, code: '23514', constraint: 'tickets_assignee_required' },
  { input: { status: 'unknown' }, code: '22P02' },
  { input: { reporter_id: '0' }, code: '23503', constraint: 'tickets_reporter_id_fkey' },
  { input: { assignee_id: '0' }, code: '23503', constraint: 'tickets_assignee_id_fkey' },
]

test('rejects invalid ticket data')
  .with(invalidTicketCases)
  .run(async (_, { input, ...expected }) => {
    await withFixture(async (client, reporterId) => {
      await rejects(
        async () => client.table('tickets').insert({ ...ticketData(reporterId), ...input }),
        expected,
      )
    })
  })

test('checks the uniqueness and casing of user email')
  .with([
    { email: sampleUser.email, code: '23505', constraint: 'users_email_key' },
    { email: 'MAYUSCULAS@requesto.test', code: '23514', constraint: 'users_email_lowercase' },
  ])
  .run(async (_, { email, ...expected }) => {
    await withFixture(async (client) => {
      await rejects(async () => client.table('users').insert({ ...sampleUser, email }), expected)
    })
  })

test('enforces the foreign keys of comments and history events')
  .with([
    {
      table: 'comments',
      input: { author_id: '0', body: 'Comentario' },
      constraint: 'comments_author_id_fkey',
    },
    {
      table: 'ticket_events',
      input: { actor_id: '0', event_type: 'created' },
      constraint: 'ticket_events_actor_id_fkey',
    },
    {
      table: 'comments',
      input: { ticket_id: '0', body: 'Comentario' },
      constraint: 'comments_ticket_id_fkey',
    },
    {
      table: 'ticket_events',
      input: { ticket_id: '0', event_type: 'created' },
      constraint: 'ticket_events_ticket_id_fkey',
    },
  ])
  .run(async (_, { table, input, constraint }) => {
    await withFixture(async (client, reporterId) => {
      const [ticket] = await client.table('tickets').insert(ticketData(reporterId)).returning('id')
      const authorColumn = table === 'comments' ? 'author_id' : 'actor_id'
      await rejects(
        async () =>
          client.table(table).insert({
            ticket_id: ticket.id,
            [authorColumn]: reporterId,
            ...input,
          }),
        {
          code: '23503',
          constraint,
        },
      )
    })
  })

test('restricts deleting referenced users', async () => {
  await withFixture(async (client, reporterId) => {
    await client.table('tickets').insert(ticketData(reporterId))
    await rejects(async () => client.from('users').where('id', reporterId).delete(), {
      code: '23503',
      constraint: 'tickets_reporter_id_fkey',
    })
  })
})

test('cascades maintenance deletion of a ticket to comments and events', async ({ assert }) => {
  await withFixture(async (client, reporterId) => {
    const [ticket] = await client.table('tickets').insert(ticketData(reporterId)).returning('id')
    await client.table('comments').insert({
      ticket_id: ticket.id,
      author_id: reporterId,
      body: 'Comentario',
    })
    await client.table('ticket_events').insert({
      ticket_id: ticket.id,
      actor_id: reporterId,
      event_type: 'created',
      created_at: timestamp,
    })
    await client.from('tickets').where('id', ticket.id).delete()

    assert.lengthOf(await client.from('comments').where('ticket_id', ticket.id), 0)
    assert.lengthOf(await client.from('ticket_events').where('ticket_id', ticket.id), 0)
  })
})
