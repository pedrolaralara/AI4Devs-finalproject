import hash from '@adonisjs/core/services/hash'
import { test } from '@japa/runner'
import Ticket from '#models/ticket'
import User from '#models/user'
import { cookiePair, csrfHeaders, sessionCookie, setCookie } from '#tests/support/session'

test('creates a ticket from an authenticated requester session', async ({ client }) => {
  const password = 'requesto-functional-test'
  const reporter = await User.create({
    email: 'ticket-creation@requesto.test',
    fullName: 'Peticionario de prueba',
    password: await hash.make(password),
    role: 'requester',
    isActive: true,
  })

  try {
    const csrf = await client.get('/api/auth/csrf')
    csrf.assertStatus(204)
    const login = await client
      .post('/api/auth/login')
      .headers(csrfHeaders(csrf))
      .json({ email: reporter.email, password })
    login.assertStatus(200)
    const session = cookiePair(setCookie(login, sessionCookie))

    const response = await client
      .post('/api/tickets')
      .headers({ ...csrfHeaders(csrf), Cookie: session })
      .json({
        title: 'Alta de acceso',
        description: 'Necesito acceso a la herramienta interna.',
        urgency: 4,
        impact: 5,
      })

    response.assertStatus(201)
  } finally {
    await Ticket.query().where('reporterId', reporter.id).delete()
    await reporter.delete()
  }
})
