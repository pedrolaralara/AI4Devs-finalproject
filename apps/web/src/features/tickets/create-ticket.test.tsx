import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'
import { App } from '../../app'
import type { SessionProfile } from '../auth/session-api'

const input = {
  title: 'Alta de acceso',
  description: 'Acceso a la herramienta interna.',
  urgency: 4,
  impact: 5,
}

function mockApi(result: Response, role: SessionProfile['role'] = 'requester') {
  const profile = { id: '7', fullName: 'Cuenta de prueba', role }
  vi.spyOn(document, 'cookie', 'get').mockReturnValue('XSRF-TOKEN=e%3Atest')
  const fetchApi = vi
    .fn()
    .mockResolvedValueOnce(Response.json(profile))
    .mockResolvedValueOnce(new Response(null, { status: 204 }))
    .mockResolvedValueOnce(result)
  vi.stubGlobal('fetch', fetchApi)
  return fetchApi
}

async function fillTicketForm() {
  fireEvent.click(await screen.findByRole('link', { name: 'Crear ticket' }))
  fireEvent.change(screen.getByLabelText('Título'), { target: { value: input.title } })
  fireEvent.change(screen.getByLabelText('Descripción'), { target: { value: input.description } })
  fireEvent.change(screen.getByLabelText('Urgencia'), { target: { value: String(input.urgency) } })
  fireEvent.change(screen.getByLabelText('Impacto'), { target: { value: String(input.impact) } })
}

afterEach(() => {
  cleanup()
  window.history.replaceState(null, '', '/')
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

test('shows a priority preview and opens the saved ticket using the API result', async () => {
  const fetchApi = mockApi(
    Response.json(
      { ...input, id: '42', key: 'REQ-42', priority: 3, status: 'open' },
      { status: 201 },
    ),
    'supervisor',
  )
  fetchApi.mockResolvedValueOnce(
    Response.json({
      ...input,
      id: '42',
      key: 'REQ-42',
      priority: 3,
      status: 'open',
      reporter: { id: '7', fullName: 'Cuenta de prueba' },
      assignee: null,
      createdAt: '2026-11-26T08:00:00Z',
      updatedAt: '2026-11-26T08:00:00Z',
      comments: [],
      history: [],
    }),
  )
  render(<App />)
  await fillTicketForm()

  expect(screen.getByText('Prioridad estimada: 4 de 5')).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Crear ticket' }))

  expect(await screen.findByRole('heading', { name: 'REQ-42 · Alta de acceso' })).toBeTruthy()
  expect(screen.getByText('3 de 5')).toBeTruthy()
  expect(window.location.pathname).toBe('/tickets/42')
  expect(fetchApi).toHaveBeenNthCalledWith(3, '/api/tickets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-XSRF-TOKEN': 'e:test' },
    body: JSON.stringify(input),
    signal: expect.any(AbortSignal),
  })
})

test('shows API validation errors next to the field and preserves the entered values', async () => {
  mockApi(
    Response.json(
      { errors: [{ field: 'title', rule: 'maxLength', message: 'Revisa la longitud.' }] },
      { status: 422 },
    ),
  )
  render(<App />)
  await fillTicketForm()
  fireEvent.click(screen.getByRole('button', { name: 'Crear ticket' }))

  expect(await screen.findByText('Revisa la longitud.')).toBeTruthy()
  expect(screen.getByLabelText('Título')).toHaveProperty('value', input.title)
  expect(screen.getByLabelText('Título').getAttribute('aria-describedby')).toBe(
    'ticket-title-error',
  )
})

test('keeps the create route unavailable for operators', async () => {
  window.history.replaceState(null, '', '/tickets/new')
  const fetchApi = mockApi(new Response(null, { status: 403 }), 'agent')
  render(<App />)

  expect(await screen.findByText('Operador')).toBeTruthy()
  expect(screen.queryByLabelText('Título')).toBeNull()
  expect(window.location.pathname).toBe('/')
  expect(fetchApi).toHaveBeenCalledTimes(1)
})

test('asks the user to sign in again if the session expires during creation', async () => {
  mockApi(new Response(null, { status: 401 }))
  render(<App />)
  await fillTicketForm()
  fireEvent.click(screen.getByRole('button', { name: 'Crear ticket' }))

  expect(await screen.findByRole('heading', { name: 'Iniciar sesión' })).toBeTruthy()
  expect(screen.getByRole('alert').textContent).toBe(
    'La sesión ha caducado. Vuelve a iniciar sesión.',
  )
})
