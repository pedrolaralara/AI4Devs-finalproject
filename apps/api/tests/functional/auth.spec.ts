import hash from '@adonisjs/core/services/hash'
import { test } from '@japa/runner'
import User from '#models/user'

test('logs in an active account and returns its profile', async ({ client }) => {
  const password = 'requesto-functional-test'
  const user = await User.create({
    email: 'login-fixture@requesto.test',
    fullName: 'Cuenta de prueba',
    password: await hash.make(password),
    role: 'requester',
    isActive: true,
  })

  try {
    const response = await client.post('/api/auth/login').json({ email: user.email, password })

    response.assertStatus(200)
    response.assertBody({ id: user.id, fullName: user.fullName, role: user.role })
  } finally {
    await user.delete()
  }
})
