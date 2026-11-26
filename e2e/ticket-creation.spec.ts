import { expect, test } from '@playwright/test'

test('creates a request and shows the saved priority', async ({ page }) => {
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
})
