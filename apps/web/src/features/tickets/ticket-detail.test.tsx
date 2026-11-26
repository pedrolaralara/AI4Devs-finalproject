import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
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

function openDetailAs(role: 'requester' | 'agent' | 'supervisor', ...responses: Response[]) {
  window.history.replaceState(null, '', '/tickets/42')
  const fetchApi = vi.fn().mockResolvedValueOnce(Response.json({ ...person, role }))
  for (const response of responses) fetchApi.mockResolvedValueOnce(response)
  fetchApi.mockImplementation(async () => Response.json([]))
  vi.stubGlobal('fetch', fetchApi)
  return { fetchApi, ...render(<App />) }
}

function openDetail(...responses: Response[]) {
  return openDetailAs('requester', ...responses)
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

test('requires an eligible operator for supervisor assignment and shows the new history', async () => {
  vi.spyOn(document, 'cookie', 'get').mockReturnValue('XSRF-TOKEN=e%3Aworkflow')
  const operator = { id: '10', fullName: 'Operador de prueba' }
  const { fetchApi } = openDetailAs(
    'supervisor',
    Response.json(ticket),
    Response.json([{ to: 'assigned', requiresAssignee: true }]),
    Response.json([operator]),
    new Response(null, { status: 204 }),
    Response.json({
      ...ticket,
      status: 'assigned',
      assignee: operator,
      workflowRevision: 1,
      history: [
        ...ticket.history,
        {
          id: '3',
          eventType: 'assigned',
          actor: person,
          createdAt: timestamp,
          field: 'assignee_id',
          oldValue: null,
          newValue: operator.id,
        },
      ],
    }),
    Response.json([{ to: 'in_progress', requiresAssignee: false }]),
  )

  const assign = await screen.findByRole('button', { name: 'Asignar' })
  expect(assign).toHaveProperty('disabled', true)
  const selector = screen.getByLabelText('Operador')
  expect(within(selector).getByRole('option', { name: operator.fullName })).toBeTruthy()
  fireEvent.change(selector, { target: { value: operator.id } })
  fireEvent.click(assign)

  expect(await screen.findByRole('button', { name: 'Iniciar trabajo' })).toBeTruthy()
  expect(screen.queryByRole('button', { name: 'Asignar' })).toBeNull()
  expect(screen.queryByRole('button', { name: 'Resolver' })).toBeNull()
  expect(
    within(screen.getByRole('region', { name: 'Historial' })).getByText('Asignación'),
  ).toBeTruthy()
  expect(fetchApi).toHaveBeenCalledWith(
    '/api/tickets/42/transitions',
    expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ to: 'assigned', expectedRevision: 0, assigneeId: operator.id }),
    }),
  )
})

test('does not show action controls or fetch operator data when no actions are offered', async () => {
  const { fetchApi } = openDetailAs('agent', Response.json(ticket), Response.json([]))

  await screen.findByRole('heading', { name: 'REQ-42 · Acceso a la aplicación' })
  await waitFor(() => {
    expect(fetchApi).toHaveBeenCalledTimes(3)
    expect(screen.queryByRole('region', { name: 'Acciones del ticket' })).toBeNull()
  })
  expect(screen.queryByLabelText('Operador')).toBeNull()
  expect(screen.queryByRole('button', { name: 'Asignarme' })).toBeNull()
})

test('reloads the ticket and actions after a 409 without repeating the write', async () => {
  vi.spyOn(document, 'cookie', 'get').mockReturnValue('XSRF-TOKEN=e%3Aworkflow')
  const { fetchApi } = openDetailAs(
    'agent',
    Response.json(ticket),
    Response.json([{ to: 'assigned', requiresAssignee: false }]),
    new Response(null, { status: 204 }),
    new Response(null, { status: 409 }),
    Response.json({ ...ticket, status: 'assigned', workflowRevision: 1, assignee: person }),
    Response.json([{ to: 'in_progress', requiresAssignee: false }]),
  )

  fireEvent.click(await screen.findByRole('button', { name: 'Asignarme' }))
  expect(await screen.findByRole('button', { name: 'Iniciar trabajo' })).toBeTruthy()
  expect(screen.getByRole('alert').textContent).toMatch(/El ticket cambió/)
  expect(fetchApi.mock.calls.filter(([, options]) => options?.method === 'POST')).toHaveLength(1)
  expect(fetchApi.mock.calls.filter(([url]) => url === '/api/tickets/42')).toHaveLength(2)
  expect(fetchApi.mock.calls.filter(([url]) => url === '/api/tickets/42/transitions')).toHaveLength(
    3,
  )
})
