import { expect, test, type Page } from '@playwright/test'
import { campaignWorld as world } from '../../src/content/world/campaignWorld'
import type { GameSave } from '../../src/domain/game'
import { otherEnd } from '../../src/engine/actions'
import { getCombatView } from '../../src/engine/combat'
import { evaluateRequirement } from '../../src/engine/requirements'

async function readSave(page: Page): Promise<GameSave> {
  return page.evaluate(async () => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('readingdungeon')
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
    try {
      return await new Promise<GameSave>((resolve, reject) => {
        const request = database.transaction('adventures').objectStore('adventures').get('current')
        request.onsuccess = () => resolve(request.result.value)
        request.onerror = () => reject(request.error)
      })
    } finally { database.close() }
  })
}

test('spielt alle Gaben, Wächter und das Finale über die Oberfläche und setzt offline fort', async ({ page, context }, testInfo) => {
  test.setTimeout(180_000)
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/')
  await page.getByLabel('Wie heisst du?').fill('Mira')
  await page.getByRole('button', { name: 'Abenteuer starten' }).click()
  await expect(page.getByRole('heading', { name: 'Sonnenwacht', exact: true })).toBeVisible()
  let save = await readSave(page)

  async function input(operation: () => Promise<unknown>) {
    const turn = save.turn
    await operation()
    await expect.poll(async () => (await readSave(page)).turn).toBeGreaterThan(turn)
    save = await readSave(page)
  }
  async function action(id: string) {
    const requested = page.locator(`[data-action-id="${id}"]`)
    if (!id.startsWith('inspect:')) {
      const firstInspection = page.locator(`[data-action-id="inspect:${save.currentAreaId}"]`)
      await requested.or(firstInspection).first().waitFor({ state: 'visible' })
      if (!await requested.isVisible()) await input(() => firstInspection.click())
    }
    await input(() => page.locator(`[data-action-id="${id}"]`).click())
  }

  async function travel(destination: string) {
    const queue = [{ id: save.currentAreaId, path: [] as string[] }]
    const seen = new Set<string>()
    for (const entry of queue) {
      if (entry.id === destination) {
        for (const passage of entry.path) await action(`move:${passage}`)
        await expect(page.getByRole('heading', { level: 1 })).toHaveText(world.areas.find((area) => area.id === destination)!.name)
        return
      }
      if (seen.has(entry.id)) continue
      seen.add(entry.id)
      for (const passage of world.passages) {
        const to = otherEnd(passage, entry.id)
        if (to && !seen.has(to) && (evaluateRequirement(passage.requirement, save).met || save.unlockedPassageIds.includes(passage.id))) {
          queue.push({ id: to, path: [...entry.path, passage.id] })
        }
      }
    }
    throw new Error(`Kein offener Weg nach ${destination}`)
  }

  async function interact(id: string) {
    const interaction = world.interactions.find((entry) => entry.id === id)!
    await travel(interaction.areaId)
    await action(`inspect:${interaction.areaId}`)
    const puzzle = world.puzzles?.find((entry) => entry.interactionId === id)
    if (puzzle) {
      for (const control of [...puzzle.controls].sort((a, b) => a.solution - b.solution)) {
        const current = save.puzzleStates[puzzle.id]?.values[control.id] ?? control.initial
        if (current !== control.solution) await input(() => page.getByLabel(control.label, { exact: true }).selectOption(String(control.solution)))
      }
      for (const value of puzzle.sequence?.solution ?? []) {
        await input(() => page.getByRole('button', { name: puzzle.sequence!.options[value], exact: true }).click())
      }
    }
    await action(`interaction:${id}`)
  }

  async function fight(id: string) {
    const encounter = world.encounters.find((entry) => entry.id === id)!
    await travel(id === 'boss_raugrim' ? 'rand_der_nacht' : 'sonnenwacht')
    if (save.player.life < save.player.maxLife || (save.player.inventory.apfelbrot ?? 0) < 3) await action(`rest:${save.currentAreaId}`)
    await travel(encounter.areaId)
    if (id.startsWith('boss_') && save.player.equippedWeaponId !== 'morgenklinge') await action('equip:morgenklinge')
    await action(`combat:${id}`)
    await expect(page.locator('#combat-title')).toBeFocused()
    for (let turn = 0; save.activeCombat && turn < 100; turn++) {
      expect(save.player.life).toBeGreaterThan(0)
      const combat = save.activeCombat
      const view = getCombatView(save, world)!
      if (combat.pendingSealItemId) {
        if (combat.phase === 1) {
          const beforeReload = save.activeCombat
          await page.reload()
          await expect(page.getByRole('button', { name: 'Setze das Wurzelsiegel', exact: true })).toBeVisible()
          save = await readSave(page)
          expect(save.activeCombat).toEqual(beforeReload)
        }
        await input(() => page.getByRole('button', { name: /^Setze das .*siegel$/ }).click())
      } else if (combat.awaitingFinalPromise) {
        await input(() => page.getByRole('button', { name: 'Sprich Alvas Versprechen' }).click())
      } else if (view.move.kind === 'heavy' || combat.enemyStance === 'guarded' || (view.enemy.airborne && combat.enemyStance !== 'vulnerable')) {
        await expect(page.getByRole('heading', { name: view.move.name, exact: true })).toBeVisible()
        await input(() => page.getByRole('button', { name: /^Verteidigen/ }).click())
      } else if (save.player.life <= 8 && (save.player.inventory.apfelbrot ?? 0) > 0) {
        await page.getByRole('button', { name: /^Gegenstand Heilmittel/ }).click()
        await page.getByRole('button', { name: /Apfelbrot untersuchen/ }).click()
        await input(() => page.getByRole('button', { name: 'Benutzen', exact: true }).click())
      } else {
        await input(() => page.getByRole('button', { name: /^Angreifen/ }).click())
      }
    }
    expect(save.defeatedEncounterIds).toContain(id)
    await expect(page.locator('.event-result')).toBeFocused()
  }

  await travel('morgen_tempel')
  await interact('hebelstange_fund')
  await interact('marktstand_anheben')
  await interact('mondmoos_sammeln')
  await interact('schleuse_reparieren')
  await interact('quelltraene_schoepfen')
  await expect(page.locator('.event-result')).toContainText('Alva!')

  await interact('symbolsteine_ordnen')
  await interact('archiv_oeffnen')
  await interact('goldbeeren_pfluecken')
  await fight('begegnung_schattenmotten')
  await interact('leuchtoel_pressen')
  await interact('sonnenfunke_entfachen')
  await expect(page.locator('.event-result')).toContainText('Die Wächter halfen Alva')

  await interact('werkzeugkammer_oeffnen')
  await fight('begegnung_netzkrabbler')
  await interact('kletterseil_bergen')
  await interact('sturmfeder_bergen')
  await interact('windlied_spielen')
  await expect(page.locator('.event-result')).toContainText('Ich war ihr Begleiter')
  await interact('morgenklinge_ziehen')

  await page.evaluate(async () => {
    await navigator.serviceWorker.ready
    if (!navigator.serviceWorker.controller) await new Promise<void>((resolve) => navigator.serviceWorker.addEventListener('controllerchange', () => resolve(), { once: true }))
  })
  await context.setOffline(true)
  for (const id of ['boss_voltaro', 'boss_arbor', 'boss_marea']) await fight(id)
  await page.getByRole('link', { name: 'Aufgaben', exact: true }).click()
  await expect(page.locator('#main-goal-title')).toHaveText('Öffne das Tor der sechs Zeichen')
  await page.getByRole('link', { name: 'Abenteuer', exact: true }).click()
  await interact('endtor_oeffnen')
  await fight('boss_raugrim')
  expect(save.player.inventory.morgenklinge).toBeUndefined()
  expect(save.player.equippedWeaponId).toBe('reiseschwert')
  await expect(page.locator('.event-result')).toContainText('die drei echten Siegel gleiten ins innere Bannschloss')
  await page.screenshot({ path: testInfo.outputPath('finale.png'), fullPage: true })
  await interact('karte_rueckgabe_finden')
  await travel('sonnenwacht')
  await expect(page.locator('.story-lead')).toContainText('gemeinsam seinen Morgen zurückgegeben')
  await page.reload()
  await expect(page.locator('.story-lead')).toContainText('gemeinsam seinen Morgen zurückgegeben')
  expect(errors).toEqual([])
})
