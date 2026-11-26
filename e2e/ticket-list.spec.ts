import { expect, test } from '@playwright/test'

const openTickets = [1, 2, 3].map((number) => `Demo Requesto · open · ${number}`)
const assignedTickets = [1, 2, 3].map((number) => `Demo Requesto · assigned · ${number}`)

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

for (const { account, visible } of [
  { account: 'usuario1', visible: [openTickets[0], assignedTickets[0]] },
  {
    account: 'operador1',
    visible: [...openTickets, assignedTickets[0], assignedTickets[2]],
  },
  { account: 'supervisor', visible: [...openTickets, ...assignedTickets] },
]) {
  test(`shows only the seeded tickets visible to ${account}`, async ({ page }) => {
    await page.goto('/tickets')
    await page.getByLabel('Correo electrónico').fill(`${account}@requesto.test`)
    await page.getByLabel('Contraseña').fill('RequestoDemo24!')
    await page.getByRole('button', { name: 'Iniciar sesión' }).click()

    await page
      .getByRole('textbox', { name: 'Buscar por título o descripción' })
      .fill('Demo Requesto')
    await page.getByLabel('Estados').selectOption(['open', 'assigned'])
    await page.getByRole('button', { name: 'Aplicar filtros' }).click()

    const results = page.getByRole('region', { name: 'Tickets' }).getByRole('listitem')
    await expect(results).toHaveCount(visible.length)
    for (const title of visible) {
      await expect(results.getByRole('link', { name: new RegExp(`${title}$`) })).toBeVisible()
    }

    await page.getByLabel('Tickets por página').fill('1')
    await page.getByRole('button', { name: 'Aplicar filtros' }).click()
    await page.getByRole('link', { name: 'Siguiente' }).click()
    const listUrl = page.url()
    await expect(
      page.getByText(`Página 2 de ${visible.length} · ${visible.length} tickets`),
    ).toBeVisible()
    const ticket = results.getByRole('link')
    const ticketName = await ticket.innerText()
    await ticket.click()
    await expect(page.getByRole('heading', { name: ticketName })).toBeVisible()
    await page.getByRole('link', { name: 'Volver a la lista' }).click()
    await expect(page).toHaveURL(listUrl)
    await expect(results.getByRole('link', { name: ticketName })).toBeVisible()
  })
}
