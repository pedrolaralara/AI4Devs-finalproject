import { test } from '@japa/runner'
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
  })
})
