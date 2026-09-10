import { expect, test, type Page } from '@playwright/test'
import { activeWorld } from '../../src/content/world'
import { createNewGame } from '../../src/domain/game'

async function startAdventure(page: Page, name = 'Mira') {
  await page.goto('/')
  await page.getByLabel('Wie heisst du?').fill(name)
  await page.getByRole('button', { name: 'Abenteuer starten' }).click()
  await expect(page.getByRole('heading', { name: 'Kurierhof', exact: true })).toBeVisible()
}

test('startet die Kantara-Kampagne im Kurierhof und speichert den neuen Kernzustand', async ({ page }) => {
  await startAdventure(page)

  await expect(page.locator('.quick-status')).toContainText('Kurierklinge')
  await expect(page.locator('.action-grid button')).toHaveCount(1)
  await expect(page.locator('[data-action-id="inspect:kb_kurierhof"]')).toBeVisible()
  await expect(page.locator('.carried-items')).toContainText('Kurierwams')
  await expect(page.locator('.carried-items')).toContainText('Übungsstempel')

  await page.locator('[data-action-id="inspect:kb_kurierhof"]').click()
  await expect(page.getByRole('heading', { name: 'Was möchtest du tun?' })).toBeVisible()
  await expect(page.locator('[data-action-id="rest:kb_kurierhof"]')).toHaveAttribute('aria-disabled', 'true')
  await expect(page.locator('.save-state')).toHaveText('Gespeichert')

  await page.reload()
  await expect(page.getByRole('heading', { name: 'Kurierhof', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: /^Untersuche den Ort erneut/ })).toBeVisible()

  const save = await page.evaluate(async () => {
    const database = await new Promise<IDBDatabase>((resolve) => { const request = indexedDB.open('readingdungeon'); request.onsuccess = () => resolve(request.result) })
    const stored = await new Promise<{ value: Record<string, unknown> }>((resolve) => { const request = database.transaction('adventures').objectStore('adventures').get('current'); request.onsuccess = () => resolve(request.result) })
    database.close()
    return stored.value
  })
  expect(save).toMatchObject({ campaignId: 'kantara', currentAreaId: 'kb_kurierhof', activeCombat: null })
  expect(save.player).toMatchObject({
    equippedWeaponId: 'item_weapon_kurierklinge',
    equippedArmorId: 'item_armor_kurierwams',
    equippedTalismanId: null,
    weaponElementModes: {}
  })
  expect(save).toMatchObject({ studiedEnemyIds: [], metEnemyIds: [] })
})

test('zeigt das Übungsrätsel erst nach dem Untersuchen und lässt es ohne Ziehgeste lösen', async ({ page }) => {
  await startAdventure(page)
  await page.locator('[data-action-id="inspect:kb_kurierhof"]').click()
  await page.getByRole('button', { name: /Gehe zu Merals Übungsauftrag/ }).click()

  await expect(page.getByRole('heading', { name: 'Sortierhalle', exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Die drei Übungsetiketten' })).toHaveCount(0)
  await expect(page.locator('.action-grid button')).toHaveCount(1)
  await page.locator('[data-action-id="inspect:kb_sortierhalle"]').click()

  await expect(page.getByRole('heading', { name: 'Die drei Übungsetiketten' })).toBeVisible()
  await page.getByRole('combobox', { name: /Beerenpaket/ }).selectOption('kuehlfach')
  await page.getByRole('combobox', { name: /Ersatzspule/ }).selectOption('werftkiste')
  await page.getByRole('combobox', { name: /Medizinkiste/ }).selectOption('wassertor')
  const complete = page.locator('[data-action-id="puzzle-complete:puz_kb_uebungsetiketten"]')
  await expect(complete).toHaveAttribute('aria-disabled', 'false')
  await complete.click()
  await expect(page.locator('.event-result')).toContainText('erst prüfen, dann handeln')
})

test('zeigt nur Kantara-Daten in Karte, Aufgaben und Merkliste', async ({ page }) => {
  await startAdventure(page)

  await page.getByRole('link', { name: 'Karte', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Karte von Kantara' })).toBeVisible()
  await expect(page.locator('.map-node')).toHaveCount(1)
  await expect(page.getByText('Kurierhof', { exact: true }).last()).toBeVisible()
  await expect(page.getByText(/Talora|Morgenklinge|Raugrim/)).toHaveCount(0)

  await page.getByRole('link', { name: 'Aufgaben', exact: true }).click()
  await expect(page.locator('#main-goal-title')).toHaveText('Prüfe die Übungspakete')
  await expect(page.locator('.quest-item')).toHaveCount(0)

  await page.getByRole('link', { name: 'Merkliste', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Nichts mehr offen' })).toBeVisible()
})

test('kann dieselbe Kantara-Importdatei nach Abbrechen erneut auswählen und bestätigen', async ({ page }) => {
  await page.goto('/einstellungen')
  const file = { name: 'abenteuer.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(createNewGame('Importkind', activeWorld))) }
  const input = page.getByLabel('Spielstand importieren', { exact: true })

  await input.setInputFiles(file)
  await expect(page.getByRole('alertdialog')).toContainText('Importkind')
  await page.getByRole('button', { name: 'Abbrechen', exact: true }).click()
  await expect(input).toHaveValue('')
  await input.setInputFiles(file)
  await page.getByRole('button', { name: 'Import bestätigen' }).click()

  await expect(page.getByRole('heading', { name: 'Kurierhof', exact: true })).toBeVisible()
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Kurierhof', exact: true })).toBeVisible()
})

test('hält Kantara bei 320 Pixeln und sehr grosser Schrift bedienbar', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 })
  await page.goto('/einstellungen')
  await page.getByText('Sehr gross', { exact: true }).click()
  await page.getByRole('link', { name: 'ReadingDungeon – Startseite' }).click()
  await page.getByLabel('Wie heisst du?').fill('Nia')
  await page.getByRole('button', { name: 'Abenteuer starten' }).click()

  await expect(page.getByRole('heading', { name: 'Kurierhof', exact: true })).toBeInViewport()
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320)
  await page.getByRole('button', { name: 'Inventar', exact: true }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByRole('button', { name: /Kurierwams/ }).click()
  await expect(page.getByRole('heading', { name: 'Kurierwams' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('button', { name: 'Inventar', exact: true })).toBeFocused()
})

test('enthält keine Vorlesefunktion mehr', async ({ page }) => {
  await page.goto('/einstellungen')
  await expect(page.getByRole('heading', { name: 'Einstellungen' })).toBeVisible()
  await expect(page.getByText(/vorlesen/i)).toHaveCount(0)
})
