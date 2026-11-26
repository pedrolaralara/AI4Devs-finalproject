import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'
import { App } from '../../app'
import type { TicketDetail } from './ticket-api'

const person = { id: '7', fullName: 'Ana Ejemplo' }
const timestamp = '2026-11-26T08:00:00Z'
const ticket: TicketDetail = {
  id: '42',
  key: 'REQ-42',
  type: 'request',
  workflowRevision: 0,
  title: 'Acceso a la aplicación',
  description: 'Necesito acceso.',
  status: 'open',
  urgency: 4,
  impact: 5,
  priority: 4,
  reporter: person,
  assignee: null,
  createdAt: timestamp,
  updatedAt: timestamp,
  solvedAt: null,
  closedAt: null,
  comments: [{ id: '1', body: 'Comentario de prueba', author: person, createdAt: timestamp }],
  history: [
    {
      id: '2',
      eventType: 'created',
      actor: person,
      field: null,
      oldValue: null,
      newValue: null,
      createdAt: timestamp,
    },
  ],
}

function openDetail(...responses: Response[]) {
  window.history.replaceState(null, '', '/tickets/42')
  const fetchApi = vi.fn().mockResolvedValueOnce(Response.json({ ...person, role: 'requester' }))
  for (const response of responses) fetchApi.mockResolvedValueOnce(response)
  fetchApi.mockImplementation(async () => Response.json([]))
  vi.stubGlobal('fetch', fetchApi)
  return { fetchApi, ...render(<App />) }
}

afterEach(() => {
  cleanup()
  window.history.replaceState(null, '', '/')
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

test('loads the detail with comments and history on a direct URL', async () => {
  const { fetchApi } = openDetail(Response.json(ticket))

  expect(
    await screen.findByRole('heading', { name: 'REQ-42 · Acceso a la aplicación' }),
  ).toBeTruthy()
  const comments = screen.getByRole('region', { name: 'Comentarios' })
  const history = screen.getByRole('region', { name: 'Historial' })
  expect(within(comments).getByText('Comentario de prueba')).toBeTruthy()
  expect(within(comments).getByText(/Ana Ejemplo/)).toBeTruthy()
  expect(within(history).getByText('Ticket creado')).toBeTruthy()
  expect(fetchApi).toHaveBeenNthCalledWith(2, '/api/tickets/42', {
    signal: expect.any(AbortSignal),
    cache: 'no-store',
  })
})

test('handles an empty comment collection', async () => {
  openDetail(Response.json({ ...ticket, comments: [] }))
  expect(await screen.findByText('Todavía no hay comentarios.')).toBeTruthy()
  expect(screen.getByText('Ticket creado')).toBeTruthy()
})

test('handles an unavailable ticket', async () => {
  openDetail(new Response(null, { status: 404 }))
  expect((await screen.findByRole('alert')).textContent).toBe('El ticket no está disponible.')
  expect(screen.queryByRole('region', { name: 'Historial' })).toBeNull()
})

test('retries a failed detail request', async () => {
  openDetail(new Response(null, { status: 503 }), Response.json(ticket))
  expect((await screen.findByRole('alert')).textContent).toBe('No se pudo consultar el ticket.')
  fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }))
  expect(await screen.findByText('Comentario de prueba')).toBeTruthy()
})

test('asks the user to sign in when the API reports an expired session', async () => {
  openDetail(new Response(null, { status: 401 }))
  expect(await screen.findByRole('heading', { name: 'Iniciar sesión' })).toBeTruthy()
  expect(screen.getByRole('alert').textContent).toBe(
    'La sesión ha caducado. Vuelve a iniciar sesión.',
  )
})

test('sends the current workflow revision and displays the updated ticket', async () => {
  vi.spyOn(document, 'cookie', 'get').mockReturnValue('XSRF-TOKEN=e%3Aworkflow')
  const { fetchApi } = openDetail(
    Response.json(ticket),
    Response.json([{ to: 'canceled', requiresAssignee: false }]),
    new Response(null, { status: 204 }),
    Response.json({ ...ticket, status: 'canceled', workflowRevision: 1 }),
  )

  fireEvent.click(await screen.findByRole('button', { name: 'Cancelar ticket' }))
  expect(await screen.findByText('Cancelado', { exact: true })).toBeTruthy()
  expect(fetchApi).toHaveBeenCalledWith('/api/tickets/42/transitions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-XSRF-TOKEN': 'e:workflow' },
    body: JSON.stringify({ to: 'canceled', expectedRevision: 0 }),
    signal: expect.any(AbortSignal),
  })
})
