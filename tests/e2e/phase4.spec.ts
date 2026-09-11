import { expect, test, type Page } from '@playwright/test'

const stampIds = {
  B: 'item_quest_blaetterstempel',
  K: 'item_quest_deltastempel',
  S: 'item_quest_werftstempel'
} as const

type Region = keyof typeof stampIds

async function seedReadyWorkshop(page: Page, order: Region[]) {
  const inventory = Object.fromEntries([
    ['item_weapon_kurierklinge', 1],
    ['item_armor_kurierwams', 1],
    ['item_tool_werkhofbuch', 1],
    ...order.map((region) => [stampIds[region], 1] as const)
  ])
  const save = {
    schemaVersion: 6,
    contentVersion: 7,
    campaignId: 'kantara',
    runId: `e2e-phase4-${order.join('')}`,
    playerName: 'Mira',
    currentAreaId: 'kb_werkhof',
    previousAreaId: 'wg_prismenknoten',
    player: {
      life: 20,
      maxLife: 20,
      equippedWeaponId: 'item_weapon_kurierklinge',
      equippedArmorId: 'item_armor_kurierwams',
      equippedTalismanId: null,
      weaponElementModes: {},
      inventory
    },
    visitedAreaIds: ['kb_kurierhof', 'wg_prismenknoten', 'kb_werkhof'],
    openedChestIds: [],
    defeatedEncounterIds: [
      'enc_bd_aststampfer', 'enc_bd_kronenheber',
      'enc_kd_schottknacker', 'enc_kd_deltarad',
      'enc_sw_spulenlaeufer', 'enc_sw_wolkenspule'
    ],
    unlockedPassageIds: [],
    completedQuestSteps: [],
    discoveredClueIds: ['ort:kb_werkhof', 'ort:wg_prismenknoten'],
    deliveredDialogueIds: ['merals_regionsauftrag', 'erster_freigabestempel', 'zweiter_freigabestempel', 'dritter_freigabestempel'],
    studiedEnemyIds: [],
    metEnemyIds: [],
    puzzleStates: {},
    flags: [
      'medizin_geliefert',
      'blaetterdaecher_befreit',
      'kanaldelta_befreit',
      'sturmwerft_befreit',
      'stempelfassungen_geprueft',
      'area_untersucht:wg_prismenknoten',
      'area_untersucht:kb_werkhof'
    ],
    lastSanctuaryId: 'kb_werkhof',
    activeCombat: null,
    recentEvents: [],
    journal: [],
    rngState: 1,
    turn: 0
  }

  await page.addInitScript(async ({ seededSave }) => {
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.open('readingdungeon', 1)
      request.onupgradeneeded = () => {
        const database = request.result
        if (!database.objectStoreNames.contains('adventures')) database.createObjectStore('adventures', { keyPath: 'key' })
        if (!database.objectStoreNames.contains('settings')) database.createObjectStore('settings', { keyPath: 'key' })
      }
      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        const database = request.result
        const transaction = database.transaction('adventures', 'readwrite')
        transaction.objectStore('adventures').put({ key: 'current', value: seededSave, updatedAt: new Date().toISOString() })
        transaction.oncomplete = () => {
          database.close()
          resolve()
        }
        transaction.onerror = () => reject(transaction.error)
      }
    })
  }, { seededSave: save })
}

const orders: Region[][] = [
  ['B', 'K', 'S'], ['B', 'S', 'K'], ['K', 'B', 'S'],
  ['K', 'S', 'B'], ['S', 'B', 'K'], ['S', 'K', 'B']
]

for (const order of orders) {
  test(`öffnet Feuer, Eis und Licht nach der Reihenfolge ${order.join(' → ')}`, async ({ page }) => {
    await seedReadyWorkshop(page, order)
    await page.goto('/spiel')

    const build = page.locator('[data-action-id="interaction:int_kb_prismenoeffner_bauen"]')
    await expect(build).toHaveAttribute('aria-disabled', 'false')
    await build.click()

    await expect(page.locator('.carried-items')).toContainText('Prismenöffner')
    await expect(page.locator('.carried-items')).toContainText('Dreifacher Kernhalter')
    await expect(page.locator('.event-result')).toContainText('Feuer-, Eis- und Lichtleitung öffnen gleichzeitig')

    await page.getByRole('link', { name: 'Aufgaben', exact: true }).click()
    await expect(page.getByRole('heading', { name: 'Die Aussenregionen sind offen' })).toBeVisible()
  })
}
