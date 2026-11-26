import db from '@adonisjs/lucid/services/db'
import { test } from '@japa/runner'
import Ticket from '#models/ticket'
import User from '#models/user'
import { csrfHeaders } from '#tests/support/session'
import { withTicketAccount } from '#tests/support/ticket_account'

const ticketData = {
  title: 'Cambiar estado',
  description: 'Petición para la prueba del flujo.',
  urgency: 4,
  impact: 5,
}

test('updates state, timestamps, revision and history through the full workflow', async ({
  assert,
  client,
}) => {
  await withTicketAccount(client, 'supervisor', async (reporter, headers) => {
    const operator = await User.create({
      fullName: 'Operador de prueba',
      email: 'workflow-operator@requesto.test',
      password: reporter.password,
      role: 'agent',
    })

    try {
      const created = await client.post('/api/tickets').headers(headers).json(ticketData)
      created.assertStatus(201)
      const { id } = created.body()
      const url = `/api/tickets/${id}/transitions`
      const detail = await client.get(`/api/tickets/${id}`).header('Cookie', headers.Cookie)
      detail.assertStatus(200)
      detail.assertBodyContains({ workflowRevision: 0 })
      const actions = await client.get(url).header('Cookie', headers.Cookie)
      actions.assertStatus(200)
      assert.sameDeepMembers(actions.body(), [
        { to: 'assigned', requiresAssignee: true },
        { to: 'canceled', requiresAssignee: false },
      ])

      let revision = 0
      for (const to of [
        'assigned',
        'in_progress',
        'pending_user',
        'in_progress',
        'solved',
        'closed',
      ]) {
        const changed = await client
          .post(url)
          .headers(headers)
          .json({
            to,
            expectedRevision: revision,
            ...(to === 'assigned' ? { assigneeId: operator.id } : {}),
          })
        changed.assertStatus(200)
        revision += 1
        changed.assertBodyContains({
          status: to,
          workflowRevision: revision,
          assignee: { id: operator.id },
        })
        if (to === 'solved') assert.isString(changed.body().solvedAt)
        if (to === 'closed') assert.isString(changed.body().closedAt)
      }

      const final = await client.get(url).header('Cookie', headers.Cookie)
      final.assertStatus(200)
      final.assertBody([])
      const invalid = await client
        .post(url)
        .headers(headers)
        .json({ to: 'open', expectedRevision: revision })
      invalid.assertStatus(422)
      invalid.assertBodyContains({ code: 'INVALID_TRANSITION' })

      const stored = await client.get(`/api/tickets/${id}`).header('Cookie', headers.Cookie)
      stored.assertBodyContains({ status: 'closed', workflowRevision: 6 })
      const history = stored.body().history
      assert.deepEqual(
        history.map((event: { eventType: string }) => event.eventType),
        [
          'created',
          'status_changed',
          'assigned',
          'status_changed',
          'status_changed',
          'status_changed',
          'status_changed',
          'status_changed',
        ],
      )
      assert.deepInclude(history.at(-1), {
        field: 'status',
        oldValue: 'solved',
        newValue: 'closed',
      })
    } finally {
      await Ticket.query().where('reporterId', reporter.id).delete()
      await operator.delete()
    }
  })
})

test('requires an authorized session and rejects invalid or forbidden requests', async ({
  client,
}) => {
  await withTicketAccount(client, 'requester', async (reporter, reporterHeaders) => {
    await withTicketAccount(client, 'agent', async (agent, agentHeaders) => {
      try {
        const ticket = await Ticket.create({ ...ticketData, reporterId: reporter.id })
        const url = `/api/tickets/${ticket.id}/transitions`
        const eligibleUrl = `/api/tickets/${ticket.id}/eligible-assignees`
        const unauthenticatedOptions = await client.get(eligibleUrl)
        unauthenticatedOptions.assertStatus(401)
        const forbiddenOptions = await client
          .get(eligibleUrl)
          .header('Cookie', reporterHeaders.Cookie)
        forbiddenOptions.assertStatus(403)

        const input = { to: 'assigned', expectedRevision: 0 }
        const csrf = await client.get('/api/auth/csrf')
        const anonymous = await client.post(url).headers(csrfHeaders(csrf)).json(input)
        anonymous.assertStatus(401)

        const noCsrf = await client.post(url).header('Cookie', agentHeaders.Cookie).json(input)
        noCsrf.assertStatus(403)
        noCsrf.assertBodyContains({ code: 'INVALID_CSRF_TOKEN' })

        const forbidden = await client.post(url).headers(reporterHeaders).json(input)
        forbidden.assertStatus(403)
        forbidden.assertBodyContains({ code: 'FORBIDDEN_TRANSITION' })

        const assignOther = await client
          .post(url)
          .headers(agentHeaders)
          .json({ ...input, assigneeId: reporter.id })
        assignOther.assertStatus(403)
        const invalid = await client
          .post(url)
          .headers(agentHeaders)
          .json({ ...input, expectedRevision: '0' })
        invalid.assertStatus(422)

        const assigned = await client.post(url).headers(agentHeaders).json(input)
        assigned.assertStatus(200)
        assigned.assertBodyContains({
          status: 'assigned',
          workflowRevision: 1,
          assignee: { id: agent.id },
        })

        const ownOnly = await Ticket.create({
          ...ticketData,
          reporterId: agent.id,
          status: 'canceled',
        })
        const invisible = await client
          .post(`/api/tickets/${ownOnly.id}/transitions`)
          .headers(reporterHeaders)
          .json({ to: 'closed', expectedRevision: 0 })
        invisible.assertStatus(404)
      } finally {
        await Ticket.query().where('reporterId', reporter.id).delete()
      }
    })
  })
})

test('allows exactly one concurrent reassignment and records only the changed assignee', async ({
  assert,
  client,
}) => {
  await withTicketAccount(client, 'supervisor', async (supervisor, headers) => {
    const operators = await User.createMany(
      [1, 2, 3].map((number) => ({
        fullName: `Operador ${number}`,
        email: `workflow-race-${number}@requesto.test`,
        password: supervisor.password,
        role: 'agent' as const,
      })),
    )

    try {
      const [original, first, second] = operators
      const ticket = await Ticket.create({
        ...ticketData,
        reporterId: supervisor.id,
        assigneeId: original.id,
        status: 'assigned',
      })
      const url = `/api/tickets/${ticket.id}/transitions`
      const denied = await client.post(url).headers(headers).json({
        to: 'assigned',
        expectedRevision: 0,
        assigneeId: supervisor.id,
      })
      denied.assertStatus(422)

      const both = await Promise.all(
        [first, second].map((operator) =>
          client
            .post(url)
            .headers(headers)
            .json({ to: 'assigned', expectedRevision: 0, assigneeId: operator.id }),
        ),
      )
      assert.sameMembers(
        both.map((response) => response.status()),
        [200, 409],
      )
      const winner = both.find((response) => response.status() === 200)?.body()
      assert.oneOf(winner.assignee.id, [first.id, second.id])
      assert.equal(winner.status, 'assigned')
      assert.equal(winner.workflowRevision, 1)
      assert.lengthOf(winner.history, 1)
      assert.deepInclude(winner.history[0], {
        eventType: 'assigned',
        oldValue: original.id,
        newValue: winner.assignee.id,
      })
    } finally {
      await Ticket.query().where('reporterId', supervisor.id).delete()
      await User.query()
        .whereIn(
          'id',
          operators.map((operator) => operator.id),
        )
        .delete()
    }
  })
})

test('rolls back the state and revision if the history write fails', async ({ assert, client }) => {
  await withTicketAccount(client, 'requester', async (reporter, headers) => {
    const ticket = await Ticket.create({ ...ticketData, reporterId: reporter.id })
    const url = `/api/tickets/${ticket.id}/transitions`
    const cancellation = { to: 'canceled', expectedRevision: 0 }
    await db.rawQuery(
      "ALTER TABLE ticket_events ADD CONSTRAINT test_reject_status CHECK (event_type <> 'status_changed') NOT VALID",
    )
    try {
      const failed = await client.post(url).headers(headers).json(cancellation)
      failed.assertStatus(500)
      const detail = await client.get(`/api/tickets/${ticket.id}`).header('Cookie', headers.Cookie)
      detail.assertBodyContains({
        status: 'open',
        workflowRevision: 0,
        closedAt: null,
        history: [],
      })
    } finally {
      await db.rawQuery('ALTER TABLE ticket_events DROP CONSTRAINT test_reject_status')
    }

    const canceled = await client.post(url).headers(headers).json(cancellation)
    canceled.assertStatus(200)
    canceled.assertBodyContains({ status: 'canceled', workflowRevision: 1 })
    assert.isString(canceled.body().closedAt)
  })
})

test('lists only active operators eligible for a supervisor to reassign', async ({ client }) => {
  await withTicketAccount(client, 'supervisor', async (supervisor, headers) => {
    const [current, inactive, candidate] = await User.createMany(
      ['Actual', 'Inactivo', 'Candidato'].map((name) => ({
        fullName: name,
        email: `${name.toLowerCase()}@eligible.requesto.test`,
        password: supervisor.password,
        role: 'agent' as const,
        isActive: name !== 'Inactivo',
      })),
    )

    try {
      const ticket = await Ticket.create({
        ...ticketData,
        reporterId: supervisor.id,
        assigneeId: current.id,
        status: 'assigned',
      })
      const candidatesUrl = `/api/tickets/${ticket.id}/eligible-assignees`
      const candidates = await client.get(candidatesUrl).header('Cookie', headers.Cookie)
      candidates.assertStatus(200)
      candidates.assertBody([{ id: candidate.id, fullName: candidate.fullName }])

      ticket.status = 'in_progress'
      await ticket.save()
      const unavailable = await client.get(candidatesUrl).header('Cookie', headers.Cookie)
      unavailable.assertStatus(200)
      unavailable.assertBody([])
    } finally {
      await Ticket.query().where('reporterId', supervisor.id).delete()
      await User.query().whereIn('id', [current.id, inactive.id, candidate.id]).delete()
    }
  })
})
