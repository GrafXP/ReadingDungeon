import { expect, test, type Page } from '@playwright/test'
import { activeWorld } from '../../src/content/world'
import { createNewGame } from '../../src/domain/game'

async function startAdventure(page: Page, name = 'Mira') {
  await page.goto('/')
  await page.getByLabel('Wie heisst du?').fill(name)
  await page.getByRole('button', { name: 'Abenteuer starten' }).click()
  await expect(page).toHaveURL(/\/einfuehrung$/)
  await expect(page.getByRole('heading', { name: 'Die Rückkehr des Schattens' })).toBeVisible()
  await expect(page.getByText(`${name}, Kuno hat deinen Namen nicht vergessen.`)).toBeVisible()
  await page.getByRole('link', { name: 'Weiter nach Sonnenwacht' }).click()
  await expect(page.getByRole('heading', { name: 'Sonnenwacht', exact: true })).toBeVisible()
}

test('startet Talora II in Sonnenwacht und speichert Ausrüstung und Kampagnenkennung', async ({ page }) => {
  await startAdventure(page)

  await expect(page.locator('.quick-status')).toContainText('Reiseschwert')
  await expect(page.locator('.action-grid button')).toHaveCount(1)
  await expect(page.locator('[data-action-id="inspect:sm_sonnenwacht"]')).toBeVisible()
  await expect(page.locator('.carried-items')).toContainText('Apfelbrot × 3')

  await page.locator('[data-action-id="inspect:sm_sonnenwacht"]').click()
  await expect(page.locator('[data-action-id="interaction:int_sm_tessa_sprechen"]')).toBeVisible()
  await expect(page.locator('.save-state')).toHaveText('Gespeichert')

  await page.reload()
  await expect(page.getByRole('button', { name: /^Untersuche den Ort erneut/ })).toBeVisible()
  await page.getByRole('link', { name: 'Einführung noch einmal lesen' }).click()
  await expect(page.getByRole('heading', { name: 'Was geschehen ist' })).toBeVisible()
  await page.getByRole('link', { name: 'Weiter nach Sonnenwacht' }).click()

  const save = await page.evaluate(async () => {
    const database = await new Promise<IDBDatabase>((resolve) => { const request = indexedDB.open('readingdungeon'); request.onsuccess = () => resolve(request.result) })
    const stored = await new Promise<{ value: Record<string, unknown> }>((resolve) => { const request = database.transaction('adventures').objectStore('adventures').get('current'); request.onsuccess = () => resolve(request.result) })
    database.close()
    return stored.value
  })
  expect(save).toMatchObject({ campaignId: 'talora2', currentAreaId: 'sm_sonnenwacht', activeCombat: null })
  expect(save.player).toMatchObject({
    equippedWeaponId: 'item_weapon_reiseschwert',
    equippedArmorId: 'item_armor_reisewams',
    equippedTalismanId: null,
    weaponElementModes: {}
  })
})

test('zeigt zu Beginn nur entdeckte Talora-Orte und klare erste Aufgaben', async ({ page }) => {
  await startAdventure(page)

  await page.getByRole('link', { name: 'Karte', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Karte von Talora' })).toBeVisible()
  await expect(page.locator('.map-node')).toHaveCount(1)
  await expect(page.getByText('Sonnenwacht', { exact: true }).last()).toBeVisible()

  await page.getByRole('link', { name: 'Aufgaben', exact: true }).click()
  await expect(page.locator('#main-goal-title')).toHaveText('Folge Kunos Schatten')
  await expect(page.locator('.quest-item')).toHaveCount(3)
  await expect(page.getByRole('heading', { name: 'Prüfe deine Ausrüstung' })).toBeVisible()

  await page.getByRole('link', { name: 'Merkliste', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Nichts mehr offen' })).toBeVisible()
})

test('kann dieselbe Talora-II-Importdatei nach Abbrechen erneut auswählen', async ({ page }) => {
  await page.goto('/einstellungen')
  const file = { name: 'abenteuer.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(createNewGame('Importkind', activeWorld))) }
  const input = page.getByLabel('Spielstand importieren', { exact: true })

  await input.setInputFiles(file)
  await expect(page.getByRole('alertdialog')).toContainText('Importkind')
  await page.getByRole('button', { name: 'Abbrechen', exact: true }).click()
  await expect(input).toHaveValue('')
  await input.setInputFiles(file)
  await page.getByRole('button', { name: 'Import bestätigen' }).click()

  await expect(page.getByRole('heading', { name: 'Sonnenwacht', exact: true })).toBeVisible()
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Sonnenwacht', exact: true })).toBeVisible()
})

test('bleibt bei 320 Pixeln und sehr grosser Schrift bedienbar', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 })
  await page.goto('/einstellungen')
  await page.getByText('Sehr gross', { exact: true }).click()
  await page.getByRole('link', { name: 'ReadingDungeon – Startseite' }).click()
  await page.getByLabel('Wie heisst du?').fill('Nia')
  await page.getByRole('button', { name: 'Abenteuer starten' }).click()

  await expect(page.getByRole('heading', { name: 'Die Rückkehr des Schattens' })).toBeInViewport()
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320)
  await page.getByRole('link', { name: 'Weiter nach Sonnenwacht' }).click()
  await expect(page.getByRole('heading', { name: 'Sonnenwacht', exact: true })).toBeInViewport()
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320)
  await page.locator('[data-action-id="inspect:sm_sonnenwacht"]').click()
  await page.getByRole('button', { name: 'Inventar', exact: true }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByRole('button', { name: /Reisewams/ }).click()
  await expect(page.getByRole('heading', { name: 'Reisewams' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('button', { name: 'Inventar', exact: true })).toBeFocused()
})

test('enthält keine Vorlesefunktion', async ({ page }) => {
  await page.goto('/einstellungen')
  await expect(page.getByRole('heading', { name: 'Einstellungen' })).toBeVisible()
  await expect(page.getByText(/vorlesen/i)).toHaveCount(0)
})

test('öffnet den vollständigen Inhalts-Debug ohne Spielstand', async ({ page }) => {
  await page.goto('/debug')
  await expect(page.getByRole('heading', { name: 'Inhalts-Debug' })).toBeVisible()
  await expect(page.getByRole('button', { name: `Orte (${activeWorld.areas.length})` })).toBeVisible()
  await expect(page.getByRole('button', { name: `Rätsel (${activeWorld.puzzles?.length ?? 0})` })).toBeVisible()
  await expect(page.getByRole('button', { name: `Gegner (${activeWorld.enemies.length})` })).toBeVisible()

  await page.getByRole('button', { name: `Gegner (${activeWorld.enemies.length})` }).click()
  await page.getByRole('searchbox', { name: 'In Gegner suchen' }).fill('enemy_sm_schattenzipfel')
  await expect(page.getByText('Schattenzipfel', { exact: true })).toBeVisible()
  await expect(page.getByText(`1 von ${activeWorld.enemies.length} Einträgen sichtbar`)).toBeVisible()
  await expect(page.getByText('Laternenknabberer', { exact: true })).toHaveCount(0)
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(await page.evaluate(() => window.innerWidth))
})
