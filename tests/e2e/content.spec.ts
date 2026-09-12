import { expect, test } from '@playwright/test'
import { talora2World as world } from '../../src/content/world/talora2World'
import { createNewGame } from '../../src/domain/game'

for (const puzzle of world.puzzles!.filter((entry) => entry.kind === 'ordering')) {
  test(`${puzzle.title}: Aufgabenstellung, ungelöster Start, Speichern und Reset`, async ({ page }) => {
    const save = createNewGame('Lesekind', world)
    save.currentAreaId = puzzle.areaId
    save.visitedAreaIds.push(puzzle.areaId)
    await page.goto('/einstellungen')
    await page.getByLabel('Spielstand importieren', { exact: true }).setInputFiles({
      name: 'inhaltstest.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(save))
    })
    await page.getByRole('button', { name: 'Import bestätigen' }).click()
    await page.locator(`[data-action-id="inspect:${puzzle.areaId}"]`).click()
    const panel = page.locator('.puzzle-panel')
    await expect(panel.getByText(puzzle.hint, { exact: true })).toBeVisible()
    await expect(panel.getByText(/Richtige Lösung/)).toHaveCount(0)
    const completion = page.locator(`[data-action-id="interaction:${puzzle.interactionId}"]`)
    await expect(completion).toHaveAttribute('aria-disabled', 'true')
    for (const [target, id] of puzzle.ordering!.solution.entries()) {
      const label = puzzle.ordering!.items.find((item) => item.id === id)!.label
      while ((await panel.locator('.puzzle-ordering > li > span:first-child').allTextContents()).indexOf(label) > target) {
        await panel.getByRole('button', { name: `${label} nach oben`, exact: true }).click()
      }
    }
    await expect(completion).toHaveAttribute('aria-disabled', 'false')
    await expect(page.locator('.save-state')).toHaveText('Gespeichert')
    await page.reload()
    await expect(panel.getByText(/Richtige Lösung/)).toBeVisible()
    await panel.getByRole('button', { name: 'Rätsel zurücksetzen' }).click()
    await expect(panel.getByText(/Richtige Lösung/)).toHaveCount(0)
    await expect(completion).toHaveAttribute('aria-disabled', 'true')
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(await page.evaluate(() => window.innerWidth))
  })
}
