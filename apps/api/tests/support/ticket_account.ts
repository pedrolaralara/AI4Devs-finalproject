import hash from '@adonisjs/core/services/hash'
import type { ApiClient } from '@japa/api-client'
import Ticket from '#models/ticket'
import type { UserRole } from '#models/ticket_types'
import User from '#models/user'
import { cookiePair, csrfHeaders, sessionCookie, setCookie } from '#tests/support/session'

const password = 'requesto-functional-test'

export async function withTicketAccount(
  client: ApiClient,
  role: UserRole,
  check: (reporter: User, headers: ReturnType<typeof csrfHeaders>) => Promise<void>,
) {
  const reporter = await User.create({
    email: `ticket-fixture-${role}@requesto.test`,
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
