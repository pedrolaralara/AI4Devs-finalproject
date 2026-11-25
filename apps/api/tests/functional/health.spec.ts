import db from '@adonisjs/lucid/services/db'
import { test } from '@japa/runner'

test('reports a healthy API connected to the test database', async ({ assert, client }) => {
  const result = await db.rawQuery('SELECT current_database() AS name')
  assert.equal(result.rows[0].name, 'requesto_test')

  const response = await client.get('/api/health')

  response.assertStatus(200)
  response.assertBody({ status: 'ok' })
})
