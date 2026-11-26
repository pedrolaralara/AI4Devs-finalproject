import { expect, test } from '@playwright/test'

test('keeps one filter form when the ticket search changes', async ({ page }) => {
  await page.goto('/tickets')
  await page.getByLabel('Correo electrónico').fill('usuario1@requesto.test')
  await page.getByLabel('Contraseña').fill('RequestoDemo24!')
  await page.getByRole('button', { name: 'Iniciar sesión' }).click()

  const search = page.getByRole('textbox', { name: 'Buscar por título o descripción' })
  const apply = page.getByRole('button', { name: 'Aplicar filtros' })
  const result = page.getByRole('link', { name: /Demo Requesto · open · 1$/ })
  await expect(result).toBeVisible()
  await search.fill('Demo Requesto · open')
  await apply.click()
  await expect(page.getByText('Página 1 de 1 · 1 tickets')).toBeVisible()
  await expect(search).toHaveCount(1)
  await expect(apply).toHaveCount(1)
  await expect(search).toHaveValue('Demo Requesto · open')

  await page.getByRole('link', { name: 'Limpiar filtros' }).click()
  await expect(search).toHaveCount(1)
  await expect(search).toHaveValue('')
})
