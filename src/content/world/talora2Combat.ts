import type { DamageType, EnemyDefinition, EnemyMoveDefinition, EncounterDefinition, InteractionEffect, Requirement } from '../../domain/content'

type MoveKind = EnemyMoveDefinition['kind']

function move(id: string, name: string, damage: number, damageType: DamageType = 'physical', kind: MoveKind = 'normal', effect?: { id: string; duration: number }): EnemyMoveDefinition {
  const warning = kind === 'heavy' ? `${name} holt weit aus. Verteidige jetzt.`
    : kind === 'charge' ? `${name} lädt sich auf. Eine unterbrechende Waffenkunst stoppt den Zug.`
      : kind === 'shield' || kind === 'guard' ? `${name} schützt den Gegner. Warte oder öffne die Deckung.`
        : kind === 'heal' ? `${name} sammelt Kraft zum Heilen.`
          : `${name} ist der nächste Zug.`
  return {
    id, name, damage, damageType, kind, telegraph: warning,
    icon: kind === 'heavy' ? '◆' : kind === 'charge' ? 'ϟ' : kind === 'heal' ? '✦' : kind === 'shield' || kind === 'guard' ? '◇' : '•',
    defendNegates: kind === 'heavy',
    vulnerableAfterDefend: kind === 'heavy',
    inflictedEffect: effect ? { id: effect.id, duration: effect.duration } : undefined
  }
}

const n = (id: string, name: string, damage: number, type: DamageType = 'physical', effect?: { id: string; duration: number }) => move(id, name, damage, type, 'normal', effect)
const h = (id: string, name: string, damage: number, type: DamageType = 'physical') => move(id, name, damage, type, 'heavy')
const a = (id: string, name: string, damage: number, type: DamageType = 'physical') => move(id, name, damage, type, 'charge')
const s = (id: string, name: string) => move(id, name, 0, 'physical', 'shield')
const heal = (id: string, name: string, amount: number) => ({ ...move(id, name, 0, 'physical', 'heal'), healAmount: amount })

export const talora2Enemies: EnemyDefinition[] = [
  { id: 'enemy_sm_schattenzipfel', name: 'Schattenzipfel', kind: 'normal', maxLife: 8, defense: 0, tags: ['schatten'], weakTo: ['light'], resistantTo: ['shadow'], movesByPhase: { 1: [n('sz_klaps', 'Schattenklaps', 2, 'shadow'), s('sz_verbergen', 'Verbergen')] } },
  { id: 'enemy_sm_laternenknabberer', name: 'Laternenknabberer', kind: 'normal', maxLife: 9, defense: 0, tags: ['klein'], weakTo: ['physical'], resistantTo: ['light'], movesByPhase: { 1: [n('lk_biss', 'Knabberbiss', 2), s('lk_schluck', 'Lichtschluck'), h('lk_sprung', 'Lampensprung', 4)] } },
  { id: 'enemy_ww_moosmuemmler', name: 'Moosmümmler', kind: 'normal', maxLife: 9, defense: 0, tags: ['ranken'], weakTo: ['fire'], movesByPhase: { 1: [n('mm_wurf', 'Mooswurf', 2), h('mm_sprung', 'Rankensprung', 4)] } },
  { id: 'enemy_ww_netzkrabbler', name: 'Netzkrabbler', kind: 'normal', maxLife: 10, defense: 1, tags: ['ranken'], weakTo: ['light'], resistantTo: ['physical'], movesByPhase: { 1: [n('nk_faden', 'Fadenwurf', 2), n('nk_seil', 'Seilzug', 3), s('nk_verstecken', 'Verstecken')] } },
  { id: 'enemy_ww_nachtkauz', name: 'Nachtkauz', kind: 'normal', maxLife: 11, defense: 0, tags: ['fliegend'], weakTo: ['lightning'], airborne: true, movesByPhase: { 1: [n('nk_fluegel', 'Flügelschlag', 3), h('nk_sturz', 'Sturzflug', 5)] } },
  { id: 'enemy_ww_dornenstampfer', name: 'Dornenstampfer', kind: 'boss', maxLife: 18, defense: 1, tags: ['ranken'], weakTo: ['fire'], resistantTo: ['physical'], phaseTwoAtLife: 9, movesByPhase: { 1: [n('ds_rinde', 'Rindenstoss', 3), h('ds_ramm', 'Rammstoss', 6)], 2: [n('ds_dorn', 'Dornenhieb', 4), h('ds_kurz', 'Kurzer Rammstoss', 7)] } },
  { id: 'enemy_ww_arbors_schatten', name: 'Arbors Schatten', kind: 'boss', maxLife: 28, defense: 2, tags: ['ranken', 'schatten'], weakTo: ['light', 'fire'], immuneTo: ['shadow'], phaseTwoAtLife: 14, movesByPhase: { 1: [n('as_geweih', 'Geweihhieb', 4), h('as_ansturm', 'Schattenansturm', 7, 'shadow')], 2: [n('as_wurzel', 'Wurzelgriff', 4, 'shadow'), a('as_ladung', 'Dornenladung', 8, 'shadow'), s('as_haut', 'Rankenhaut')] } },

  { id: 'enemy_sk_pfuetzenhopser', name: 'Pfützenhopser', kind: 'normal', maxLife: 9, defense: 0, tags: ['nass'], weakTo: ['ice', 'lightning'], movesByPhase: { 1: [n('ph_spritzer', 'Spritzer', 2), h('ph_sprung', 'Weiter Sprung', 4)] } },
  { id: 'enemy_sk_spiegelkrabbe', name: 'Spiegelkrabbe', kind: 'normal', maxLife: 10, defense: 2, tags: ['panzer'], weakTo: ['lightning'], resistantTo: ['physical'], movesByPhase: { 1: [n('sk_zange', 'Zangenschlag', 3), s('sk_panzer', 'Spiegelpanzer'), h('sk_heben', 'Hebezug', 4)] } },
  { id: 'enemy_sk_flossbiber', name: 'Flossbiber', kind: 'normal', maxLife: 12, defense: 1, tags: ['nass'], weakTo: ['ice'], movesByPhase: { 1: [n('fb_schub', 'Paketschub', 3), h('fb_paddel', 'Doppelpaddel', 5)] } },
  { id: 'enemy_sk_muschelbrecher', name: 'Muschelbrecher', kind: 'boss', maxLife: 20, defense: 3, tags: ['panzer'], weakTo: ['lightning'], resistantTo: ['physical'], phaseTwoAtLife: 10, movesByPhase: { 1: [n('mb_hieb', 'Muschelhieb', 4), s('mb_deckung', 'Deckung')], 2: [h('mb_heben', 'Hebezug', 6), n('mb_schale', 'Schalenstoss', 4)] } },
  { id: 'enemy_sk_mareas_schatten', name: 'Mareas Schatten', kind: 'boss', maxLife: 30, defense: 2, tags: ['panzer', 'schatten'], weakTo: ['light', 'lightning'], resistantTo: ['physical'], immuneTo: ['shadow'], phaseTwoAtLife: 15, movesByPhase: { 1: [n('ms_welle', 'Wellenhieb', 4), h('ms_rolle', 'Wellenrolle', 7), s('ms_spiegel', 'Spiegelpanzer')], 2: [n('ms_flut', 'Dunkle Flut', 5, 'shadow'), h('ms_kreis', 'Kreisrolle', 8), s('ms_panzer', 'Panzer')] } },

  { id: 'enemy_dh_funkenmotte', name: 'Funkenmotte', kind: 'normal', maxLife: 9, defense: 0, tags: ['fliegend'], weakTo: ['ice'], resistantTo: ['lightning'], movesByPhase: { 1: [n('fm_staub', 'Funkenstaub', 2, 'lightning', { id: 'versengt', duration: 3 }), n('fm_flug', 'Lampenflug', 3)] } },
  { id: 'enemy_dh_windklammer', name: 'Windklammer', kind: 'normal', maxLife: 11, defense: 1, tags: ['fliegend'], weakTo: ['physical'], resistantTo: ['lightning'], airborne: true, movesByPhase: { 1: [n('wk_boe', 'Böenstoss', 3), s('wk_haken', 'Verhaken'), h('wk_fall', 'Klammerfall', 5)] } },
  { id: 'enemy_dh_wolkenkauz', name: 'Wolkenkauz', kind: 'normal', maxLife: 12, defense: 0, tags: ['fliegend'], weakTo: ['ice'], airborne: true, movesByPhase: { 1: [n('wk_fluegel', 'Wolkenflügel', 3, 'lightning'), h('wk_sturz', 'Sturzflug', 6)] } },
  { id: 'enemy_dh_kupferlaeufer', name: 'Kupferläufer', kind: 'boss', maxLife: 22, defense: 2, tags: ['panzer'], weakTo: ['ice'], resistantTo: ['lightning'], phaseTwoAtLife: 11, movesByPhase: { 1: [n('kl_spule', 'Spulenstoss', 3), a('kl_entladung', 'Entladung', 7, 'lightning')], 2: [n('kl_panzer', 'Panzerlauf', 4), a('kl_hell', 'Helle Entladung', 8, 'lightning')] } },
  { id: 'enemy_dh_voltaros_schatten', name: 'Voltaros Schatten', kind: 'boss', maxLife: 26, defense: 2, tags: ['fliegend', 'schatten'], weakTo: ['light', 'ice'], resistantTo: ['lightning'], immuneTo: ['shadow'], airborne: true, phaseTwoAtLife: 13, movesByPhase: { 1: [n('vs_fluegel', 'Flügelhieb', 4), h('vs_sturz', 'Sturzflug', 8, 'lightning')], 2: [a('vs_ladung', 'Schwarze Ladung', 9, 'lightning'), s('vs_federn', 'Federpanzer'), n('vs_boden', 'Bodenschlag', 5)] } },

  { id: 'enemy_vp_weglaus', name: 'Weglaus', kind: 'normal', maxLife: 12, defense: 1, tags: ['klein'], weakTo: ['physical'], movesByPhase: { 1: [n('wl_knips', 'Schienenknipsen', 3), h('wl_lauf', 'Geradeauslauf', 5)] } },
  { id: 'enemy_vp_echohueter', name: 'Echohüter', kind: 'normal', maxLife: 14, defense: 1, tags: ['schatten'], weakTo: ['light'], resistantTo: ['shadow'], movesByPhase: { 1: [n('eh_hieb', 'Echohieb', 3, 'shadow'), h('eh_doppel', 'Doppelklang', 5, 'shadow'), s('eh_still', 'Stillwerden')] } },

  { id: 'enemy_fi_aschescharrer', name: 'Aschescharrer', kind: 'normal', maxLife: 13, defense: 1, tags: ['feuer'], weakTo: ['ice'], resistantTo: ['fire'], movesByPhase: { 1: [n('as_wurf', 'Aschewurf', 3, 'physical', { id: 'benebelt', duration: 3 }), h('as_lauf', 'Scharrlauf', 5)] } },
  { id: 'enemy_fi_glasfluegler', name: 'Glasflügler', kind: 'normal', maxLife: 14, defense: 1, tags: ['fliegend'], weakTo: ['physical'], resistantTo: ['light'], airborne: true, movesByPhase: { 1: [n('gf_blend', 'Blendflug', 3, 'light'), s('gf_landen', 'Landen'), h('gf_spitze', 'Glasspitze', 5)] } },
  { id: 'enemy_fi_ofenzange', name: 'Wilde Ofenzange', kind: 'normal', maxLife: 15, defense: 2, tags: ['feuer', 'panzer'], weakTo: ['ice'], immuneTo: ['fire'], movesByPhase: { 1: [n('oz_griff', 'Zangengriff', 4), n('oz_glut', 'Glutklopfen', 4, 'fire'), s('oz_klemmen', 'Klemmen')] } },
  { id: 'enemy_fi_glutwalze', name: 'Glutwalze', kind: 'boss', maxLife: 26, defense: 2, tags: ['feuer', 'panzer'], weakTo: ['ice'], resistantTo: ['physical'], immuneTo: ['fire'], phaseTwoAtLife: 13, movesByPhase: { 1: [n('gw_glut', 'Glutstoss', 5, 'fire'), h('gw_lauf', 'Walzenlauf', 7)], 2: [a('gw_feuer', 'Feuerwalze', 8, 'fire'), s('gw_kuehl', 'Abkühlen')] } },
  { id: 'enemy_fi_aschenbrueter', name: 'Aschenbrüter', kind: 'boss', maxLife: 38, defense: 3, tags: ['feuer', 'panzer'], weakTo: ['ice'], resistantTo: ['physical'], immuneTo: ['fire'], phaseThresholds: { 2: 25, 3: 12 }, movesByPhase: { 1: [n('ab_arm', 'Glutarm', 5, 'fire'), a('ab_brand', 'Nestbrand', 7, 'fire')], 2: [h('ab_stoss', 'Kühlstoss', 6), s('ab_haut', 'Aschehaut')], 3: [n('ab_sog', 'Schattensog', 6, 'shadow'), a('ab_feuer', 'Brutfeuer', 9, 'fire')] } },

  { id: 'enemy_fs_reiffuchs', name: 'Reiffuchs', kind: 'normal', maxLife: 13, defense: 0, tags: ['eis'], weakTo: ['fire'], resistantTo: ['ice'], movesByPhase: { 1: [n('rf_sprung', 'Reifsprung', 3, 'ice'), s('rf_spur', 'Spurenwechsel'), h('rf_satz', 'Schneesatz', 5)] } },
  { id: 'enemy_fs_spiegelmotte', name: 'Spiegelmotte', kind: 'normal', maxLife: 14, defense: 0, tags: ['fliegend'], weakTo: ['shadow'], resistantTo: ['light'], airborne: true, movesByPhase: { 1: [n('sm_flatter', 'Lichtflattern', 3, 'light'), s('sm_wechsel', 'Spiegelwechsel'), h('sm_blend', 'Blendstoss', 5, 'light')] } },
  { id: 'enemy_fs_frostgreifer', name: 'Frostgreifer', kind: 'normal', maxLife: 16, defense: 2, tags: ['eis', 'panzer'], weakTo: ['fire'], resistantTo: ['physical'], immuneTo: ['ice'], movesByPhase: { 1: [n('fg_haken', 'Eishaken', 4), s('fg_sperren', 'Gelenk sperren'), n('fg_griff', 'Frostgriff', 5, 'ice')] } },
  { id: 'enemy_fs_reifjaeger', name: 'Reifjäger', kind: 'boss', maxLife: 28, defense: 2, tags: ['eis', 'panzer'], weakTo: ['fire'], resistantTo: ['physical'], immuneTo: ['ice'], phaseTwoAtLife: 14, movesByPhase: { 1: [n('rj_klaue', 'Reifklaue', 4, 'ice'), h('rj_jagd', 'Jagdsprung', 7)], 2: [s('rj_panzer', 'Eispanzer'), h('rj_frost', 'Frostsprung', 8, 'ice')] } },
  { id: 'enemy_fs_sternenfresser', name: 'Sternenfresser', kind: 'boss', maxLife: 40, defense: 3, tags: ['eis', 'panzer'], weakTo: ['fire'], resistantTo: ['physical'], immuneTo: ['ice'], phaseThresholds: { 2: 27, 3: 13 }, movesByPhase: { 1: [n('sf_arm', 'Frostarm', 5, 'ice'), s('sf_spiegel', 'Spiegelpanzer')], 2: [a('sf_sog', 'Kältesog', 7, 'ice'), n('sf_biss', 'Sternenbiss', 5)], 3: [heal('sf_neu', 'Neuverspiegeln', 6), h('sf_stern', 'Fallender Stern', 9, 'ice')] } },

  { id: 'enemy_lm_dunstmolch', name: 'Dunstmolch', kind: 'normal', maxLife: 14, defense: 0, tags: ['schatten'], weakTo: ['light'], resistantTo: ['shadow'], stealth: true, movesByPhase: { 1: [n('dm_schlag', 'Dunstschlag', 3, 'shadow'), s('dm_verbergen', 'Verbergen'), h('dm_sprung', 'Nebelsprung', 5)] } },
  { id: 'enemy_lm_schilfgreifer', name: 'Schilfgreifer', kind: 'normal', maxLife: 16, defense: 1, tags: ['ranken'], weakTo: ['fire'], resistantTo: ['physical'], movesByPhase: { 1: [n('sg_griff', 'Halmgriff', 4), s('sg_tauchen', 'Untertauchen'), n('sg_trocken', 'Trockener Schlag', 5)] } },
  { id: 'enemy_lm_blendenvogel', name: 'Blendenvogel', kind: 'normal', maxLife: 15, defense: 0, tags: ['fliegend'], weakTo: ['shadow'], resistantTo: ['light'], airborne: true, movesByPhase: { 1: [n('bv_ruf', 'Blendruf', 4, 'light'), n('bv_fluegel', 'Flügelschlag', 3), h('bv_kreis', 'Lichtkreis', 6, 'light')] } },
  { id: 'enemy_lm_dunstschwinge', name: 'Dunstschwinge', kind: 'boss', maxLife: 28, defense: 1, tags: ['fliegend', 'schatten'], weakTo: ['light'], resistantTo: ['shadow'], stealth: true, airborne: true, phaseTwoAtLife: 14, movesByPhase: { 1: [n('ds_flug', 'Schattenflug', 4, 'shadow'), n('ds_kreis', 'Nebelflug', 3, 'shadow'), s('ds_verbergen', 'Verbergen')], 2: [h('ds_stoss', 'Nebelstoss', 7, 'shadow'), n('ds_dunkel', 'Dunkelflug', 5, 'shadow')] } },
  { id: 'enemy_lm_nachtlaterne', name: 'Nachtlaterne', kind: 'boss', maxLife: 42, defense: 2, tags: ['schatten', 'panzer'], weakTo: ['light'], resistantTo: ['physical'], immuneTo: ['shadow'], stealth: true, phaseThresholds: { 2: 28, 3: 14 }, movesByPhase: { 1: [n('nl_arm', 'Dunstarm', 5, 'shadow'), s('nl_verbergen', 'Verbergen')], 2: [a('nl_zug', 'Schattenzug', 7, 'shadow'), n('nl_licht', 'Falsches Licht', 4, 'light')], 3: [heal('nl_nahren', 'Nebel nähren', 4), h('nl_fall', 'Laternenfall', 9, 'shadow')] } },

  { id: 'enemy_rn_schattenhand', name: 'Schattenhand', kind: 'boss', maxLife: 24, defense: 1, tags: ['schatten'], weakTo: ['light'], resistantTo: ['shadow'], movesByPhase: { 1: [n('sh_links', 'Linker Griff', 4, 'shadow'), n('sh_rechts', 'Rechter Griff', 4, 'shadow'), h('sh_beide', 'Beide Hände', 8)] } },
  { id: 'enemy_rn_wandelpanzer', name: 'Wandelpanzer', kind: 'boss', maxLife: 30, defense: 3, tags: ['panzer', 'schatten'], weakTo: ['light'], resistantTo: ['physical'], immuneTo: ['shadow'], movesByPhase: { 1: [n('wp_feuer', 'Feuerhaut', 6, 'fire'), n('wp_eis', 'Eishaut', 6, 'ice'), n('wp_blitz', 'Blitzhaut', 6, 'lightning'), s('wp_wechsel', 'Häutenwechsel')] } },
  { id: 'enemy_rn_echo_links', name: 'Linkes Echo', kind: 'boss', maxLife: 22, defense: 2, tags: ['schatten'], weakTo: ['light'], resistantTo: ['physical', 'shadow'], phaseTwoAtLife: 11, movesByPhase: { 1: [n('el_hieb', 'Echohieb', 4, 'shadow'), h('el_antwort', 'Antwortschlag', 6)], 2: [n('el_raub', 'Stimmenraub', 5, 'shadow', { id: 'benebelt', duration: 3 }), a('el_ruf', 'Doppelruf', 8, 'shadow')] } },
  { id: 'enemy_rn_echo_rechts', name: 'Rechtes Echo', kind: 'normal', maxLife: 14, defense: 1, tags: ['schatten'], weakTo: ['light'], resistantTo: ['shadow'], movesByPhase: { 1: [n('er_antwort', 'Leise Antwort', 3, 'shadow'), h('er_ruf', 'Rechter Ruf', 5, 'shadow')] } },
  { id: 'enemy_rn_raugrim', name: 'Raugrim', kind: 'boss', maxLife: 48, defense: 2, tags: ['schatten'], weakTo: ['light'], resistantTo: ['physical'], immuneTo: ['shadow'], phaseThresholds: { 2: 36, 3: 24, 4: 12 }, movesByPhase: { 1: [n('rg_bild', 'Falsches Bild', 3, 'shadow'), h('rg_faden', 'Schattenfaden', 6, 'shadow')], 2: [h('rg_welle', 'Welle des Vergessens', 8, 'shadow'), s('rg_schild', 'Dunkler Schild')], 3: [n('rg_ruf', 'Namenloser Ruf', 6, 'shadow', { id: 'benebelt', duration: 3 }), a('rg_abend', 'Endloser Abend', 9, 'shadow')], 4: [h('rg_fluegel', 'Geliehene Flügel', 7), s('rg_letzter', 'Letzter Faden')] } }
]

const equipped = (slot: 'weapon' | 'body', itemId: string): Requirement => ({ kind: 'equipped', slot, itemId })
const all = (...requirements: Requirement[]): Requirement => ({ kind: 'all', requirements })
const reward = (...effects: InteractionEffect[]): InteractionEffect[] => effects
const setFlag = (flag: string): InteractionEffect => ({ kind: 'setFlag', flag })
const addItem = (itemId: string): InteractionEffect => ({ kind: 'addItem', itemId, quantity: 1 })
const discover = (clueId: string): InteractionEffect => ({ kind: 'discoverClue', clueId })

type EncounterSeed = [id: string, areaId: string, enemyIds: string[], flee: string, rewardEffects?: InteractionEffect[], requiredGear?: Requirement, warning?: string, victoryText?: string]
const encounterSeeds: EncounterSeed[] = [
  ['enc_sm_schattenzipfel', 'sm_festplatz', ['enemy_sm_schattenzipfel'], 'sm_sonnenwacht', reward(setFlag('schattenzipfel_beruhigt')), undefined, undefined, 'Der kleine Schatten klappt sich wie ein Tuch zusammen. Kuno kniet sich hin. «Du gehörst zu jemandem. Wir finden ihn.»'],
  ['enc_sm_laternenknabberer', 'sm_tempelgarten', ['enemy_sm_laternenknabberer'], 'sm_sonnenwacht', reward(addItem('item_quest_kartenrand_wald'), discover('item_quest_kartenrand_wald'))],
  ['enc_ww_moosmuemmler', 'ww_mooslichtung', ['enemy_ww_moosmuemmler'], 'ww_foersterhaus'],
  ['enc_ww_netzkrabbler', 'ww_gluehgarten', ['enemy_ww_netzkrabbler'], 'ww_foersterhaus'],
  ['enc_ww_nachtkauz', 'ww_alte_baumschule', ['enemy_ww_nachtkauz'], 'ww_foersterhaus', reward(addItem('item_armor_rindenpanzer'))],
  ['enc_ww_dornenstampfer', 'ww_rankentor', ['enemy_ww_dornenstampfer'], 'ww_foersterhaus', [], equipped('weapon', 'item_weapon_astbeil'), 'Rüste das Astbeil aus. Verteidige den Rammstoss.'],
  ['enc_ww_wipfelkauz', 'ww_wipfelsteg', ['enemy_ww_nachtkauz'], 'ww_foersterhaus', reward(addItem('item_quest_kartenrand_wald'), discover('item_quest_kartenrand_wald'))],
  ['enc_ww_wurzelkrabbler', 'ww_wurzelbruecke', ['enemy_ww_netzkrabbler'], 'ww_foersterhaus', reward(addItem('item_talisman_waechterzeichen'))],
  ['enc_ww_arbors_schatten', 'ww_wurzelheiligtum', ['enemy_ww_arbors_schatten'], 'ww_foersterhaus', reward(setFlag('arbors_schatten_zurueck')), equipped('weapon', 'item_weapon_astbeil'), 'Rüste das Astbeil aus. Kapphieb stoppt die Dornenladung.', 'Arbors Schatten bleibt vor ihm stehen. Arbor senkt sein Geweih. Der Schatten legt den Kopf daneben. Erst dann werden beide wieder eins.'],

  ['enc_sk_pfuetzenhopser', 'sk_quellinsel', ['enemy_sk_pfuetzenhopser'], 'sk_muschelhafen'],
  ['enc_sk_spiegelkrabbe', 'sk_schleusensteg', ['enemy_sk_spiegelkrabbe'], 'sk_muschelhafen'],
  ['enc_sk_flossbiber', 'sk_schilfkanal', ['enemy_sk_flossbiber'], 'sk_muschelhafen'],
  ['enc_sk_muschelbrecher', 'sk_muscheltor', ['enemy_sk_muschelbrecher'], 'sk_muschelhafen', [], equipped('weapon', 'item_weapon_wellenspeer'), 'Rüste den Wellenspeer aus. Der Hebezug öffnet den Panzer.'],
  ['enc_sk_leuchtturmkrabbe', 'sk_alter_leuchtturm', ['enemy_sk_spiegelkrabbe'], 'sk_muschelhafen', reward(addItem('item_talisman_sonnenscherbe'))],
  ['enc_sk_tempelhopser', 'sk_gezeitentempel', ['enemy_sk_pfuetzenhopser'], 'sk_muschelhafen', reward(addItem('item_quest_kartenrand_kueste'), discover('item_quest_kartenrand_kueste'))],
  ['enc_sk_mareas_schatten', 'sk_gezeitentempel', ['enemy_sk_mareas_schatten'], 'sk_muschelhafen', reward(setFlag('mareas_schatten_zurueck')), equipped('weapon', 'item_weapon_wellenspeer'), 'Rüste den Wellenspeer aus. Schwallstoss und Blitz treffen den offenen Panzer.', 'Der schwarze Panzer wird klar. Mareas Schatten schwimmt einmal um ihr Boot und legt sich ruhig unter sie. Nela flüstert: «Da bist du ja.»'],

  ['enc_dh_funkenmotte', 'dh_windhof', ['enemy_dh_funkenmotte'], 'dh_kupferhof'],
  ['enc_dh_windklammer', 'dh_warnmast', ['enemy_dh_windklammer'], 'dh_kupferhof'],
  ['enc_dh_wolkenkauz', 'dh_wolkenbruecke', ['enemy_dh_wolkenkauz'], 'dh_kupferhof', reward(addItem('item_quest_kartenrand_hoehe'), discover('item_quest_kartenrand_hoehe'))],
  ['enc_dh_kupferlaeufer', 'dh_kristallmine', ['enemy_dh_kupferlaeufer'], 'dh_kupferhof', [], equipped('weapon', 'item_weapon_donnerhammer'), 'Rüste den Donnerhammer aus. Kurzschluss stoppt die Entladung.'],
  ['enc_dh_spulengassenmotten', 'dh_spulengasse', ['enemy_dh_funkenmotte'], 'dh_kupferhof'],
  ['enc_dh_erdungsklammer', 'dh_erdungsfeld', ['enemy_dh_windklammer'], 'dh_kupferhof', reward(addItem('item_talisman_erdungsring'))],
  ['enc_dh_voltaros_schatten', 'dh_gewitterturm', ['enemy_dh_voltaros_schatten'], 'dh_kupferhof', reward(setFlag('voltaros_schatten_zurueck')), equipped('weapon', 'item_weapon_donnerhammer'), 'Rüste den Donnerhammer aus. Verteidige den Sturzflug und stoppe die Ladung.', 'Voltaros Schatten landet neben ihm. Der Adler öffnet einen Flügel, dann den anderen. Beide steigen durch dieselbe Wolke. Kein Donner folgt.'],

  ['enc_vp_weglaus', 'vp_wegkreuz', ['enemy_vp_weglaus'], 'vp_weglager'],
  ['enc_vp_echohueter', 'vp_wurzeltunnel', ['enemy_vp_echohueter'], 'vp_weglager', reward(addItem('item_weapon_mondstab'))],
  ['enc_vp_wegeduo', 'vp_aquaedukt', ['enemy_vp_echohueter'], 'vp_weglager'],

  ['enc_fi_aschescharrer', 'fi_ascheterrasse', ['enemy_fi_aschescharrer'], 'fi_gluthafen', reward(addItem('item_quest_kartenrand_funken'), discover('item_quest_kartenrand_funken'))],
  ['enc_fi_glasfluegler', 'fi_rotglasgrotte', ['enemy_fi_glasfluegler'], 'fi_gluthafen'],
  ['enc_fi_ofenzange', 'fi_glutschalenfeld', ['enemy_fi_ofenzange'], 'fi_gluthafen'],
  ['enc_fi_glutwalze', 'fi_ofenring', ['enemy_fi_glutwalze'], 'fi_gluthafen', [], all(equipped('body', 'item_armor_feuermantel'), equipped('weapon', 'item_weapon_alvas_klinge')), 'Trage den Feuermantel. Stelle Alvas Klinge am Rastplatz auf Eis.'],
  ['enc_fi_ascheflug', 'fi_ascheterrasse', ['enemy_fi_glasfluegler'], 'fi_gluthafen', reward(addItem('item_weapon_sternenhammer'))],
  ['enc_fi_aschenbrueter', 'fi_aschennest_vorraum', ['enemy_fi_aschenbrueter'], 'fi_gluthafen', reward(setFlag('feuervogel_gerettet')), all(equipped('body', 'item_armor_feuermantel'), equipped('weapon', 'item_weapon_alvas_klinge')), 'Trage den Feuermantel. Eis kühlt die Aschehaut.', 'Die Schale des Eis bekommt einen goldenen Riss. Als Asche fällt, spannt Kunos Schatten sich wie ein Schirm über das junge Tier.'],

  ['enc_fs_reiffuchs', 'fs_firnufer', ['enemy_fs_reiffuchs'], 'fs_uferhaus'],
  ['enc_fs_spiegelmotte', 'fs_klarglassteg', ['enemy_fs_spiegelmotte'], 'fs_uferhaus', reward(addItem('item_quest_kartenrand_frost'), discover('item_quest_kartenrand_frost'))],
  ['enc_fs_frostgreifer', 'fs_spiegelhof', ['enemy_fs_frostgreifer'], 'fs_uferhaus'],
  ['enc_fs_reifjaeger', 'fs_spiegelhof', ['enemy_fs_reifjaeger'], 'fs_uferhaus', [], equipped('weapon', 'item_weapon_alvas_klinge'), 'Stelle Alvas Klinge am Uferhaus auf Feuer.'],
  ['enc_fs_grottengreifer', 'fs_kaltperlengrotte', ['enemy_fs_frostgreifer'], 'fs_uferhaus', reward(addItem('item_talisman_kaltperle'))],
  ['enc_fs_sternenfresser', 'fs_sternennest_vorraum', ['enemy_fs_sternenfresser'], 'fs_uferhaus', reward(setFlag('sternenschatten_gerettet')), all(equipped('body', 'item_armor_waermewams'), equipped('weapon', 'item_weapon_alvas_klinge')), 'Trage das Wärmewams. Stelle Alvas Klinge auf Feuer.', 'Die Schatten steigen wie dunkle Fische aus dem klaren Eis. Kuno zeigt Elis Zeichnung allen: «Eli hat den Weg gefunden.»'],

  ['enc_lm_dunstmolch', 'lm_schilfpfad', ['enemy_lm_dunstmolch'], 'lm_stelzendorf', reward(setFlag('fuchsspur_gelesen'))],
  ['enc_lm_schilfgreifer', 'lm_torfgarten', ['enemy_lm_schilfgreifer'], 'lm_stelzendorf'],
  ['enc_lm_blendenvogel', 'lm_blendengang', ['enemy_lm_blendenvogel'], 'lm_stelzendorf', reward(addItem('item_talisman_laternenstein'))],
  ['enc_lm_dunstschwinge', 'lm_lichtinsel', ['enemy_lm_dunstschwinge'], 'lm_stelzendorf', [], equipped('weapon', 'item_weapon_laternenstab'), 'Rüste den Laternenstab aus. Lichtnetz hält die Dunstschwinge fest.'],
  ['enc_lm_nebelmolch', 'lm_nebelsteg', ['enemy_lm_dunstmolch'], 'lm_stelzendorf', reward(addItem('item_quest_kartenrand_moor'), discover('item_quest_kartenrand_moor'))],
  ['enc_lm_nachtlaterne', 'lm_nachtpfad', ['enemy_lm_nachtlaterne'], 'lm_stelzendorf', reward(setFlag('laternenfuchs_gerettet')), all(equipped('body', 'item_armor_schattenumhang'), equipped('weapon', 'item_weapon_laternenstab')), 'Trage den Schattenumhang und rüste den Laternenstab aus.', 'Der echte Laternenfuchs kriecht unter Pavos Mantel. Kunos Schatten wartet am letzten Pfahl. Diesmal läuft er nicht fort.'],

  ['enc_rn_schattenhand', 'rn_rand_der_nacht', ['enemy_rn_schattenhand'], 'rn_rand_der_nacht', [], equipped('weapon', 'item_weapon_alvas_klinge'), 'Rüste Alvas Klinge aus. Lies linken, rechten und doppelten Griff.'],
  ['enc_rn_wandelpanzer', 'rn_sternentreppe', ['enemy_rn_wandelpanzer'], 'rn_rand_der_nacht', [], equipped('weapon', 'item_weapon_alvas_klinge'), 'Rüste Alvas Klinge auf Licht. Verteidige Feuer, Eis und Blitz.'],
  ['enc_rn_echozwilling', 'rn_halle_der_echos', ['enemy_rn_echo_links'], 'rn_rand_der_nacht', [], equipped('weapon', 'item_weapon_alvas_klinge'), 'Kuno spricht zuerst. Höre beide Stimmen und greife dann an.'],
  ['enc_rn_raugrim', 'rn_weltenkammer', ['enemy_rn_raugrim'], 'rn_rand_der_nacht', reward(setFlag('raugrim_faeden_getrennt')), equipped('weapon', 'item_weapon_alvas_klinge'), 'Rüste Alvas Klinge auf Licht. Verteidige schwere Züge und unterbrich Aufladungen.', 'Raugrims geliehene Gestalt fällt auseinander. Sieben Schatten warten auf die Erinnerungen, die sie nach Hause führen.']
]

const enemyName = new Map(talora2Enemies.map((enemy) => [enemy.id, enemy.name]))
export const talora2Encounters: EncounterDefinition[] = encounterSeeds.map(([id, areaId, enemyIds, fleeAreaId, rewardEffects = [], requiredGear, gearWarning, victoryText]) => ({
  id, areaId, enemyIds, fleeAreaId, requiredGear, gearWarning,
  label: enemyIds.length > 1 ? `Stelle dich ${enemyIds.map((enemyId) => enemyName.get(enemyId)).join(' und ')}` : `Stelle dich ${enemyName.get(enemyIds[0])}`,
  description: 'Beobachte den nächsten Zug. Du kannst vor dem ersten Treffer sicher zurückkehren.',
  victoryText: victoryText ?? `${enemyName.get(enemyIds[0])} gibt den Weg frei. Du kannst jederzeit zum Rastplatz zurückkehren.`,
  rewardEffects
}))
