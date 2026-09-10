import { expect, test, type Page } from '@playwright/test'

async function action(page: Page, id: string) {
  const button = page.locator(`[data-action-id="${id}"]`)
  await expect(button).toHaveAttribute('aria-disabled', 'false')
  await button.click()
}

async function inspect(page: Page, areaId: string) {
  await action(page, `inspect:${areaId}`)
}

async function fight(page: Page, encounterId: string, enemyName: string) {
  await action(page, `combat:${encounterId}`)
  await expect(page.getByRole('heading', { name: enemyName, exact: true })).toBeVisible()

  for (let turn = 0; turn < 80 && await page.locator('.combat-panel').count(); turn += 1) {
    const intent = await page.locator('.enemy-intent h3').textContent()
    if (!intent) break
    if (/Anrollen|Rammstoss|Ansturm/.test(intent)) {
      await page.getByRole('button', { name: /Verteidigen/ }).click()
    } else if (intent === 'Aufladen') {
      const skill = page.getByRole('button', { name: /Kapphieb/ })
      if (await skill.getAttribute('aria-disabled') === 'false') await skill.click()
      else await page.getByRole('button', { name: /Verteidigen/ }).click()
    } else {
      const life = Number(await page.locator('progress.player-health').getAttribute('value'))
      if (life <= 6) {
        await page.getByRole('button', { name: /Gegenstand/ }).click()
        const provisions = page.getByRole('button', { name: /Grundproviant untersuchen/ })
        if (await provisions.count()) {
          await provisions.click()
          await page.getByRole('button', { name: 'Benutzen', exact: true }).click()
        } else {
          await page.getByRole('button', { name: 'Inventar schliessen' }).click()
          await page.getByRole('button', { name: /Angreifen/ }).click()
        }
      } else {
        await page.getByRole('button', { name: /Angreifen/ }).click()
      }
    }
  }

  await expect(page.locator('.combat-panel')).toHaveCount(0)
  await expect(page.locator('.event-result')).toContainText(/frei|gebremst|Hebebetrieb/)
}

test('spielt Phase 3 vom neuen Kurierauftrag bis zum Blätterstempel', async ({ page }) => {
  await page.goto('/')
  await page.getByLabel('Wie heisst du?').fill('Mira')
  await page.getByRole('button', { name: 'Abenteuer starten' }).click()
  await page.getByRole('link', { name: 'Weiter zum Kurierhof' }).click()

  await inspect(page, 'kb_kurierhof')
  await action(page, 'interaction:int_kb_klick_aufklappen')
  await action(page, 'interaction:int_kb_grundausruestung')
  await expect(page.locator('.quick-status')).toContainText('Kurierklinge')

  await action(page, 'move:v001')
  await inspect(page, 'kb_sortierhalle')
  await page.getByRole('combobox', { name: /Frostbeeren/ }).selectOption('kuehlfach')
  await page.getByRole('combobox', { name: /Ersatzspule/ }).selectOption('werftkiste')
  await page.getByRole('combobox', { name: /Medikamentenkiste/ }).selectOption('wassertor')
  await action(page, 'puzzle-complete:puz_kb_uebungsetiketten')
  await action(page, 'move:v001')
  await action(page, 'interaction:int_kb_auftrag_annehmen')
  await action(page, 'move:v006')
  await inspect(page, 'kb_wassertor')
  await fight(page, 'enc_kb_rollkiste', 'Rollende Frachtkiste')
  await action(page, 'interaction:int_kb_medizin_abgeben')
  await action(page, 'move:v006')

  await action(page, 'move:v003')
  await inspect(page, 'kb_tauschmarkt')
  await action(page, 'move:v096')
  await inspect(page, 'bd_kronengarten')
  await page.getByRole('combobox', { name: /Jungtrieb/ }).selectOption('schattenbeet')
  await page.getByRole('combobox', { name: /Tragwurzel/ }).selectOption('quellrinne')
  await page.getByRole('combobox', { name: /Fruchtranke/ }).selectOption('sonnenseil')
  await action(page, 'interaction:int_bd_fenn_fragen')

  await action(page, 'move:v010')
  await inspect(page, 'bd_quellast')
  await page.getByRole('combobox', { name: 'Erst welche Klemme?' }).selectOption('1')
  await page.getByRole('combobox', { name: 'Dann welche Rinne?' }).selectOption('2')
  await page.getByRole('combobox', { name: 'Zuletzt welcher Ast?' }).selectOption('1')
  await action(page, 'interaction:int_bd_quellventil_oeffnen')
  await action(page, 'move:v010')
  await action(page, 'interaction:int_bd_rankenseil_ernten')

  await action(page, 'move:v009')
  await inspect(page, 'bd_seilmarkt')
  await action(page, 'interaction:int_bd_ina_helfen')
  await action(page, 'move:v013')
  await inspect(page, 'bd_obstterrasse')
  await page.getByRole('combobox', { name: 'Grosse Apfelkiste' }).selectOption('left')
  await page.getByRole('combobox', { name: 'Kleine Birnenkiste A' }).selectOption('right')
  await page.getByRole('combobox', { name: 'Kleine Birnenkiste B' }).selectOption('right')
  await action(page, 'puzzle-complete:puz_bd_obstwaage')
  await action(page, 'move:v013')
  await action(page, 'move:v012')
  await inspect(page, 'bd_brueckenwerk')
  await action(page, 'interaction:int_bd_astholz_nehmen')

  await action(page, 'move:v012')
  await action(page, 'move:v009')
  await action(page, 'move:v096')
  await action(page, 'move:v003')
  await action(page, 'move:v002')
  await inspect(page, 'kb_werkhof')
  await action(page, 'interaction:int_kb_astbeil_bauen')
  await page.getByRole('button', { name: 'Inventar', exact: true }).click()
  await page.getByRole('button', { name: /Astbeil untersuchen/ }).click()
  await page.getByRole('button', { name: 'Ausrüsten', exact: true }).click()
  await page.getByRole('button', { name: 'Inventar schliessen' }).click()
  await expect(page.locator('.quick-status')).toContainText('Astbeil')

  await action(page, 'move:v002')
  await action(page, 'move:v003')
  await action(page, 'move:v096')
  await action(page, 'move:v011')
  await inspect(page, 'bd_rankentor')
  await action(page, 'interaction:int_bd_rammwarnung_lesen')
  await fight(page, 'enc_bd_aststampfer', 'Aststampfer')
  await action(page, 'move:v011')
  await action(page, 'rest:bd_kronengarten')

  await action(page, 'move:v011')
  await action(page, 'move:v016')
  await inspect(page, 'bd_wipfelsteg')
  await action(page, 'move:v017')
  await action(page, 'interaction:int_bd_bruecke_reparieren')
  await action(page, 'move:v018')
  await inspect(page, 'bd_kranplatz')
  await fight(page, 'enc_bd_kronenheber', 'Kronenheber')
  await expect(page.locator('.travel-log')).toContainText('Kapphieb')

  await action(page, 'move:v020')
  await inspect(page, 'bd_kronenstation')
  await action(page, 'interaction:int_bd_stempel_praegen')
  await expect(page.locator('.carried-items')).toContainText('Blätterstempel')

  await page.getByRole('link', { name: 'Register', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Waffenkunst und Abklingzeit' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Aufladung unterbrechen' })).toBeVisible()
  await page.getByRole('link', { name: 'Sammlung', exact: true }).click()
  await expect(page.getByText('1 von 7')).toBeVisible()
  await expect(page.getByText('1 von 8')).toBeVisible()
})
