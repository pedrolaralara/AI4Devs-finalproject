import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'
import { App } from './app'

const profile = { id: '42', fullName: 'Ana Ejemplo', role: 'supervisor' }

function unauthorized() {
  return new Response(null, { status: 401 })
}

function csrf() {
  vi.spyOn(document, 'cookie', 'get').mockReturnValue('XSRF-TOKEN=e%3Aexample')
  return new Response(null, { status: 204 })
}

async function submitLogin() {
  const form = await screen.findByRole('region', { name: 'Iniciar sesión' })
  fireEvent.change(within(form).getByLabelText('Correo electrónico'), {
    target: { value: 'persona@example.test' },
  })
  fireEvent.change(within(form).getByLabelText('Contraseña'), {
    target: { value: 'test-password' },
  })
  fireEvent.click(within(form).getByRole('button', { name: 'Iniciar sesión' }))
}

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

test('logs in with credentials and the CSRF token', async () => {
  const fetchSession = vi
    .fn()
    .mockResolvedValueOnce(unauthorized())
    .mockImplementationOnce(async () => csrf())
    .mockResolvedValueOnce(Response.json(profile))
  vi.stubGlobal('fetch', fetchSession)
  render(<App />)

  await submitLogin()

  expect(await screen.findByRole('heading', { name: profile.fullName })).toBeTruthy()
  expect(screen.getByText('Supervisor')).toBeTruthy()
  expect(fetchSession).toHaveBeenNthCalledWith(3, '/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-XSRF-TOKEN': 'e:example' },
    body: JSON.stringify({ email: 'persona@example.test', password: 'test-password' }),
  })
})

test('restores an existing session and returns to the form after logout', async () => {
  const fetchSession = vi
    .fn()
    .mockResolvedValueOnce(Response.json(profile))
    .mockImplementationOnce(async () => csrf())
    .mockResolvedValueOnce(new Response(null, { status: 204 }))
  vi.stubGlobal('fetch', fetchSession)
  render(<App />)

  fireEvent.click(await screen.findByRole('button', { name: 'Cerrar sesión' }))

  expect(await screen.findByRole('heading', { name: 'Iniciar sesión' })).toBeTruthy()
  expect(fetchSession).toHaveBeenNthCalledWith(1, '/api/auth/me', {
    signal: expect.any(AbortSignal),
    cache: 'no-store',
  })
  expect(fetchSession).toHaveBeenNthCalledWith(3, '/api/auth/logout', {
    method: 'POST',
    headers: { 'X-XSRF-TOKEN': 'e:example' },
  })
})

test('shows the credential error and keeps the sign-in form available', async () => {
  vi.stubGlobal(
    'fetch',
    vi
      .fn()
      .mockResolvedValueOnce(unauthorized())
      .mockImplementationOnce(async () => csrf())
      .mockResolvedValueOnce(Response.json({ code: 'INVALID_CREDENTIALS' }, { status: 400 })),
  )
  render(<App />)

  await submitLogin()

  expect((await screen.findByRole('alert')).textContent).toBe(
    'El email o la contraseña son incorrectos.',
  )
  expect(screen.getByRole('button', { name: 'Iniciar sesión' })).toHaveProperty('disabled', false)
})

test('allows retrying session recovery after an API outage', async () => {
  vi.stubGlobal(
    'fetch',
    vi
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 503 }))
      .mockResolvedValueOnce(unauthorized()),
  )
  render(<App />)

  expect((await screen.findByRole('alert')).textContent).toBe('No se pudo consultar la sesión.')
  fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }))

  expect(await screen.findByRole('heading', { name: 'Iniciar sesión' })).toBeTruthy()
})

test('keeps the active profile if the server rejects logout', async () => {
  vi.stubGlobal(
    'fetch',
    vi
      .fn()
      .mockResolvedValueOnce(Response.json(profile))
      .mockImplementationOnce(async () => csrf())
      .mockResolvedValueOnce(new Response(null, { status: 403 })),
  )
  render(<App />)

  fireEvent.click(await screen.findByRole('button', { name: 'Cerrar sesión' }))

  expect((await screen.findByRole('alert')).textContent).toBe(
    'No se pudo cerrar sesión. Inténtalo de nuevo.',
  )
  expect(screen.getByRole('heading', { name: profile.fullName })).toBeTruthy()
})
