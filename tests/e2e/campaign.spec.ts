import { expect, test, type Page } from '@playwright/test'
import { campaignWorld } from '../../src/content/world/campaignWorld'
import { createNewGame } from '../../src/domain/game'

async function putStoredAdventure(page: Page, value: unknown) {
  await page.evaluate(async (adventure) => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('readingdungeon', 1)
      request.onupgradeneeded = () => {
        const db = request.result
        if (!db.objectStoreNames.contains('adventures')) db.createObjectStore('adventures', { keyPath: 'key' })
        if (!db.objectStoreNames.contains('settings')) db.createObjectStore('settings', { keyPath: 'key' })
      }
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
    await new Promise<void>((resolve, reject) => {
      const request = database.transaction('adventures', 'readwrite').objectStore('adventures').put({
        key: 'current', value: adventure, updatedAt: new Date().toISOString()
      })
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
    database.close()
  }, value)
}

test('lädt einen Spielstand aus dem ersten Talora-Abenteuer nie still als Talora II', async ({ page }) => {
  const legacy = createNewGame('Talora-Kind', campaignWorld)
  legacy.player.inventory.morgenklinge = 1
  legacy.flags.push('morgenklinge_erweckt')

  await page.goto('/')
  await putStoredAdventure(page, legacy)
  await page.reload()

  await expect(page.getByRole('heading', { name: 'Dein Spielstand braucht Hilfe' })).toBeVisible()
  await expect(page.getByRole('alert')).toContainText('talora')
  await expect(page.getByRole('alert')).toContainText('talora2')
  await expect(page.getByLabel('Wie heisst du?')).toHaveCount(0)

  await page.getByRole('link', { name: 'Speicherverwaltung öffnen' }).click()
  await expect(page.getByText(/anderen Kampagne/)).toBeVisible()
  await expect(page.getByRole('button', { name: 'Spielstand exportieren' })).toBeEnabled()

  const storedCampaign = await page.evaluate(async () => {
    const database = await new Promise<IDBDatabase>((resolve) => { const request = indexedDB.open('readingdungeon'); request.onsuccess = () => resolve(request.result) })
    const stored = await new Promise<{ value: { campaignId: string; flags: string[] } }>((resolve) => { const request = database.transaction('adventures').objectStore('adventures').get('current'); request.onsuccess = () => resolve(request.result) })
    database.close()
    return stored.value
  })
  expect(storedCampaign).toMatchObject({ campaignId: 'talora', flags: ['morgenklinge_erweckt'] })
})

test('weist einen Import aus dem ersten Abenteuer zurück und behält Talora II', async ({ page }) => {
  await page.goto('/')
  await page.getByLabel('Wie heisst du?').fill('Talora-II-Kind')
  await page.getByRole('button', { name: 'Abenteuer starten' }).click()
  await page.getByRole('link', { name: 'Weiter nach Sonnenwacht' }).click()
  await expect(page.getByRole('heading', { name: 'Sonnenwacht' })).toBeVisible()

  await page.getByRole('link', { name: 'Einstellungen' }).click()
  await page.getByLabel('Spielstand importieren', { exact: true }).setInputFiles({
    name: 'talora.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(createNewGame('Fremdes Kind', campaignWorld)))
  })

  await expect(page.getByRole('alert')).toContainText('talora')
  await expect(page.getByRole('alert')).toContainText('talora2')
  await expect(page.getByRole('button', { name: 'Import bestätigen' })).toHaveCount(0)
  await expect(page.locator('.save-summary')).toContainText('Talora-II-Kind')
  await expect(page.locator('.save-summary')).toContainText('Sonnenwacht')

  await page.reload()
  await expect(page.locator('.save-summary')).toContainText('Talora-II-Kind')
})
