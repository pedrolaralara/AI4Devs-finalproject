import { expect, test } from '@playwright/test'

test('signs in, restores the session on reload and signs out', async ({ page }) => {
  await page.goto('/')

  await page.getByLabel('Correo electrónico').fill('supervisor@requesto.test')
  await page.getByLabel('Contraseña').fill('RequestoDemo24!')
  await page.getByRole('button', { name: 'Iniciar sesión' }).click()

  await expect(page.getByRole('heading', { name: 'supervisor', exact: true })).toBeVisible()
  await expect(page.getByText('Supervisor', { exact: true })).toBeVisible()

  await page.reload()
  await expect(page.getByRole('button', { name: 'Cerrar sesión' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'supervisor', exact: true })).toBeVisible()

  await page.getByRole('button', { name: 'Cerrar sesión' }).click()
  await expect(page.getByRole('heading', { name: 'Iniciar sesión' })).toBeVisible()

  await page.reload()
  await expect(page.getByRole('heading', { name: 'Iniciar sesión' })).toBeVisible()
})
