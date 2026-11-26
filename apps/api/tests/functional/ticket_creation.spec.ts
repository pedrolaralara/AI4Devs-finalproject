import hash from '@adonisjs/core/services/hash'
import db from '@adonisjs/lucid/services/db'
import type { ApiClient } from '@japa/api-client'
import { test } from '@japa/runner'
import Ticket from '#models/ticket'
import TicketEvent from '#models/ticket_event'
import type { UserRole } from '#models/ticket_types'
import User from '#models/user'
import { cookiePair, csrfHeaders, sessionCookie, setCookie } from '#tests/support/session'

const password = 'requesto-functional-test'
const ticket = {
  title: 'Alta de acceso',
  description: 'Necesito acceso a la herramienta interna.',
  urgency: 4,
  impact: 5,
}

async function withAccount(
  client: ApiClient,
  role: UserRole,
  check: (reporter: User, headers: ReturnType<typeof csrfHeaders>) => Promise<void>,
) {
  const reporter = await User.create({
    email: `ticket-creation-${role}@requesto.test`,
    fullName: 'Cuenta de prueba',
    password: await hash.make(password),
    role,
    isActive: true,
  })

  try {
    const csrf = await client.get('/api/auth/csrf')
    csrf.assertStatus(204)
    const headers = csrfHeaders(csrf)
    const login = await client
      .post('/api/auth/login')
      .headers(headers)
      .json({ email: reporter.email, password })
    login.assertStatus(200)

    await check(reporter, { ...headers, Cookie: cookiePair(setCookie(login, sessionCookie)) })
  } finally {
    await Ticket.query().where('reporterId', reporter.id).delete()
    await reporter.delete()
  }
}

const creators: UserRole[] = ['requester', 'supervisor']

test('creates a ticket and its event from an authenticated requester or supervisor session')
  .with(creators)
  .run(async ({ assert, client }, role) => {
    await withAccount(client, role, async (reporter, headers) => {
      const response = await client.post('/api/tickets').headers(headers).json(ticket)
      response.assertStatus(201)

      const body = response.body()
      assert.match(body.id, /^\d+$/)
      response.assertHeader('location', `/api/tickets/${body.id}`)
      response.assertBodyContains({
        ...ticket,
        key: `REQ-${body.id}`,
        type: 'request',
        status: 'open',
        priority: 4,
        reporter: { id: reporter.id, fullName: reporter.fullName },
        assignee: null,
        solvedAt: null,
        closedAt: null,
      })
      assert.match(body.createdAt, /^\d{4}-\d{2}-\d{2}T/)
      assert.match(body.updatedAt, /^\d{4}-\d{2}-\d{2}T/)

      const saved = await Ticket.findOrFail(body.id)
      assert.equal(saved.reporterId, reporter.id)
      assert.equal(saved.priority, 4)
      const events = await TicketEvent.query().where('ticketId', saved.id)
      assert.lengthOf(events, 1)
      assert.equal(events[0].eventType, 'created')
      assert.equal(events[0].actorId, reporter.id)
    })
  })

test('requires an active session and rejects operators and missing CSRF', async ({
  assert,
  client,
}) => {
  const csrf = await client.get('/api/auth/csrf')
  const anonymous = await client.post('/api/tickets').headers(csrfHeaders(csrf)).json(ticket)
  anonymous.assertStatus(401)
  anonymous.assertBodyContains({ code: 'UNAUTHENTICATED' })

  await withAccount(client, 'agent', async (agent, headers) => {
    const denied = await client.post('/api/tickets').headers(headers).json(ticket)
    denied.assertStatus(403)
    denied.assertBodyContains({ code: 'FORBIDDEN' })
    assert.isNull(await Ticket.findBy('reporterId', agent.id))
  })

  await withAccount(client, 'requester', async (reporter, headers) => {
    const blocked = await client.post('/api/tickets').header('Cookie', headers.Cookie).json(ticket)
    blocked.assertStatus(403)
    blocked.assertBodyContains({ code: 'INVALID_CSRF_TOKEN' })

    reporter.isActive = false
    await reporter.save()
    const inactive = await client.post('/api/tickets').headers(headers).json(ticket)
    inactive.assertStatus(401)
    assert.isNull(await Ticket.findBy('reporterId', reporter.id))
  })
})

test('validates the input without accepting server-owned fields', async ({ assert, client }) => {
  await withAccount(client, 'requester', async (reporter, headers) => {
    for (const [field, input] of [
      ['title', { ...ticket, title: undefined }],
      ['title', { ...ticket, title: 't'.repeat(201) }],
      ['description', { ...ticket, description: '  ' }],
      ['urgency', { ...ticket, urgency: '4' }],
      ['urgency', { ...ticket, urgency: 1.5 }],
      ['impact', { ...ticket, impact: 6 }],
      ['reporterId', { ...ticket, reporterId: '999' }],
    ] as const) {
      const invalid = await client.post('/api/tickets').headers(headers).json(input)
      invalid.assertStatus(422)
      assert.equal(invalid.body().errors[0].field, field)
    }

    assert.isNull(await Ticket.findBy('reporterId', reporter.id))
  })
})

test('rolls back the ticket if PostgreSQL refuses its initial event', async ({
  assert,
  client,
}) => {
  await withAccount(client, 'requester', async (reporter, headers) => {
    await db.rawQuery(
      "ALTER TABLE ticket_events ADD CONSTRAINT test_reject_created CHECK (event_type <> 'created') NOT VALID",
    )
    try {
      const failed = await client.post('/api/tickets').headers(headers).json(ticket)
      failed.assertStatus(500)
      assert.isNull(await Ticket.findBy('reporterId', reporter.id))
    } finally {
      await db.rawQuery('ALTER TABLE ticket_events DROP CONSTRAINT test_reject_created')
    }
  })
})
