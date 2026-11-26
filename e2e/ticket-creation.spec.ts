import { expect, test } from '@playwright/test'

test('resolves a request as an operator and closes it as its reporter', async ({
  baseURL,
  browser,
  page,
}) => {
  await page.goto('/')
  await page.getByLabel('Correo electrónico').fill('usuario1@requesto.test')
  await page.getByLabel('Contraseña').fill('RequestoDemo24!')
  await page.getByRole('button', { name: 'Iniciar sesión' }).click()
  await page.getByRole('link', { name: 'Crear ticket' }).click()
  await page.getByLabel('Título').fill('Acceso E2E')
  await page.getByLabel('Descripción').fill('Petición sintética de Playwright.')
  await page.getByLabel('Urgencia').selectOption('4')
  await page.getByLabel('Impacto').selectOption('5')
  await expect(page.getByText('Prioridad estimada: 4 de 5')).toBeVisible()

  const creation = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname === '/api/tickets' && response.request().method() === 'POST',
  )
  await page.getByRole('button', { name: 'Crear ticket' }).click()
  const response = await creation
  expect(response.status()).toBe(201)
  const { id, key } = await response.json()
  expect(response.headers().location).toBe(`/api/tickets/${id}`)
  await expect(page).toHaveURL(new RegExp(`/tickets/${id}$`))
  await expect(page.getByRole('heading', { name: `${key} · Acceso E2E` })).toBeVisible()
  await expect(page.getByText('4 de 5', { exact: true })).toBeVisible()

  await page.reload()
  await expect(page.getByRole('heading', { name: `${key} · Acceso E2E` })).toBeVisible()
  await expect(page.getByText('4 de 5', { exact: true })).toBeVisible()
  await expect(page.getByRole('region', { name: 'Comentarios' })).toContainText(
    'Todavía no hay comentarios.',
  )
  await expect(page.getByRole('region', { name: 'Historial' })).toContainText('Ticket creado')

  const direct = await page.context().newPage()
  await direct.goto(`/tickets/${id}`)
  await expect(direct.getByRole('heading', { name: `${key} · Acceso E2E` })).toBeVisible()
  await expect(direct.getByRole('region', { name: 'Historial' })).toContainText('Ticket creado')

  const operatorContext = await browser.newContext({ baseURL })
  try {
    const operator = await operatorContext.newPage()
    await operator.goto(`/tickets/${id}`)
    await operator.getByLabel('Correo electrónico').fill('operador1@requesto.test')
    await operator.getByLabel('Contraseña').fill('RequestoDemo24!')
    await operator.getByRole('button', { name: 'Iniciar sesión' }).click()

    await operator.getByRole('button', { name: 'Asignarme', exact: true }).click()
    await expect(operator.getByText('Asignado', { exact: true })).toBeVisible()
    await operator.getByRole('button', { name: 'Iniciar trabajo' }).click()
    await expect(operator.getByText('En curso', { exact: true })).toBeVisible()
    await operator.getByRole('button', { name: 'Resolver', exact: true }).click()
    const detail = operator.getByRole('region', { name: `${key} · Acceso E2E`, exact: true })
    await expect(detail.getByRole('definition').filter({ hasText: /^Resuelto$/ })).toBeVisible()

    await operator.reload()
    await expect(detail.getByRole('definition').filter({ hasText: /^Resuelto$/ })).toBeVisible()
    await expect(detail.getByRole('definition').filter({ hasText: /^operador1$/ })).toBeVisible()
    const history = detail.getByRole('region', { name: 'Historial' })
    await expect(history.getByText('Asignación', { exact: true })).toBeVisible()
    await expect(history.getByText('status: in_progress → solved')).toBeVisible()
    await expect(history.getByText(/operador1/).last()).toBeVisible()
    await expect(operator.getByRole('region', { name: 'Acciones del ticket' })).toHaveCount(0)
    await expect(operator.getByRole('button', { name: 'Cerrar ticket' })).toHaveCount(0)

    await page.reload()
    await expect(page.getByRole('definition').filter({ hasText: /^Resuelto$/ })).toBeVisible()
    await page.getByRole('button', { name: 'Cerrar ticket' }).click()
    await expect(page.getByRole('definition').filter({ hasText: /^Cerrado$/ })).toBeVisible()

    await page.reload()
    await expect(page.getByRole('definition').filter({ hasText: /^Cerrado$/ })).toBeVisible()
    await expect(
      page
        .locator('dt')
        .filter({ hasText: /^Finalizado$/ })
        .locator('+ dd time'),
    ).toBeVisible()
    const reporterHistory = page.getByRole('region', { name: 'Historial' })
    const closeEvent = reporterHistory.getByRole('listitem').filter({
      hasText: 'status: solved → closed',
    })
    await expect(closeEvent).toContainText('usuario1')
    await expect(page.getByRole('region', { name: 'Acciones del ticket' })).toHaveCount(0)
  } finally {
    await operatorContext.close()
  }
})
