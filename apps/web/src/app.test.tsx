import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'
import { App } from './app'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

test('shows that the API is connected when the health check succeeds', async () => {
  const fetchHealth = vi.fn().mockResolvedValue(Response.json({ status: 'ok' }))
  vi.stubGlobal('fetch', fetchHealth)

  render(<App />)

  expect(await screen.findByText('API conectada')).toBeTruthy()
  expect(fetchHealth).toHaveBeenCalledWith('/api/health', { signal: expect.any(AbortSignal) })
})

test('reports that the API is unavailable when the health check fails', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(Response.json({ status: 'unavailable' }, { status: 503 })),
  )

  render(<App />)

  expect(await screen.findByText('No se pudo conectar con la API')).toBeTruthy()
})
