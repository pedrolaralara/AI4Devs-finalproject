import hash from '@adonisjs/core/services/hash'
import { test } from '@japa/runner'
import type { UserRole } from '#models/ticket_types'
import User from '#models/user'

const password = 'requesto-functional-test'
const sessionCookie = 'adonis-session'
const xsrfCookie = 'XSRF-TOKEN'

function setCookie(response: { header(name: string): unknown }, name: string): string {
  const cookies = response.header('set-cookie')
  const cookie = (Array.isArray(cookies) ? cookies : [cookies]).find(
    (entry): entry is string => typeof entry === 'string' && entry.startsWith(`${name}=`),
  )
  if (!cookie) {
    throw new Error(`Missing ${name} cookie`)
  }
  return cookie
}

function cookiePair(cookie: string) {
  return cookie.split(';', 1)[0]
}

function csrfHeaders(response: { header(name: string): unknown }) {
  const xsrf = cookiePair(setCookie(response, xsrfCookie))
  return {
    Cookie: cookiePair(setCookie(response, sessionCookie)),
    'X-XSRF-TOKEN': decodeURIComponent(xsrf.slice(xsrfCookie.length + 1)),
  }
}

async function createAccount(role: UserRole = 'requester', isActive = true) {
  return User.create({
    email: `login-${role}@requesto.test`,
    fullName: 'Cuenta de prueba',
    password: await hash.make(password),
    role,
    isActive,
  })
}

const roles: UserRole[] = ['requester', 'agent', 'supervisor']

test('logs in an active account and returns its profile')
  .with(roles)
  .run(async ({ assert, client }, role) => {
    const user = await createAccount(role)
    try {
      const csrf = await client.get('/api/auth/csrf')
      csrf.assertStatus(204)
      const response = await client
        .post('/api/auth/login')
        .headers(csrfHeaders(csrf))
        .json({ email: user.email.toUpperCase(), password })

      response.assertStatus(200)
      response.assertBody({ id: user.id, fullName: user.fullName, role: user.role })
      const session = setCookie(response, sessionCookie)
      assert.match(session, /; HttpOnly/i)
      assert.match(session, /; SameSite=Lax/i)
      assert.notEqual(cookiePair(session), csrfHeaders(csrf).Cookie)

      const current = await client.get('/api/auth/me').header('Cookie', cookiePair(session))
      current.assertStatus(200)
      current.assertBody({ id: user.id, fullName: user.fullName, role: user.role })

      user.role = role === 'requester' ? 'agent' : 'requester'
      await user.save()
      const updated = await client.get('/api/auth/me').header('Cookie', cookiePair(session))
      updated.assertStatus(200)
      updated.assertBody({ id: user.id, fullName: user.fullName, role: user.role })

      user.isActive = false
      await user.save()
      const inactive = await client.get('/api/auth/me').header('Cookie', cookiePair(session))
      inactive.assertStatus(401)
    } finally {
      await user.delete()
    }
  })

test('rejects invalid credentials with the same response and validates the request body', async ({
  client,
}) => {
  const active = await createAccount()
  const inactive = await createAccount('agent', false)
  try {
    const csrf = await client.get('/api/auth/csrf')
    for (const credentials of [
      { email: active.email, password: 'wrong' },
      { email: 'unknown@requesto.test', password },
      { email: inactive.email, password },
    ]) {
      const response = await client
        .post('/api/auth/login')
        .headers(csrfHeaders(csrf))
        .json(credentials)
      response.assertStatus(400)
      response.assertBody({
        code: 'INVALID_CREDENTIALS',
        message: 'El email o la contraseña son incorrectos.',
      })
    }

    const invalid = await client
      .post('/api/auth/login')
      .headers(csrfHeaders(csrf))
      .json({ email: 'invalid' })
    invalid.assertStatus(422)
  } finally {
    await active.delete()
    await inactive.delete()
  }
})

test('protects login and logout against CSRF and revokes the previous session', async ({
  client,
}) => {
  const user = await createAccount()
  try {
    const credentials = { email: user.email, password }
    const anonymous = await client.get('/api/auth/me')
    anonymous.assertStatus(401)

    const csrf = await client.get('/api/auth/csrf')
    const initial = csrfHeaders(csrf)
    const blocked = await client
      .post('/api/auth/login')
      .header('Cookie', initial.Cookie)
      .json(credentials)
    blocked.assertStatus(403)
    blocked.assertBodyContains({ code: 'INVALID_CSRF_TOKEN' })

    const login = await client.post('/api/auth/login').headers(initial).json(credentials)
    login.assertStatus(200)
    const original = cookiePair(setCookie(login, sessionCookie))
    const forged = await client
      .post('/api/auth/logout')
      .headers({ Cookie: original, 'X-XSRF-TOKEN': 'invalid' })
    forged.assertStatus(403)

    const stillLoggedIn = await client.get('/api/auth/me').header('Cookie', original)
    stillLoggedIn.assertStatus(200)

    const logout = await client
      .post('/api/auth/logout')
      .headers({ Cookie: original, 'X-XSRF-TOKEN': initial['X-XSRF-TOKEN'] })
    logout.assertStatus(204)

    const replay = await client.get('/api/auth/me').header('Cookie', original)
    replay.assertStatus(401)
  } finally {
    await user.delete()
  }
})
