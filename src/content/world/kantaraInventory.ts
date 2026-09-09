import type { ContentInventoryDefinition } from '../../domain/content'

const sequence = (prefix: string, count: number) => Array.from(
  { length: count },
  (_, index) => `${prefix}${String(index + 1).padStart(3, '0')}`
)

/** Exact IDs from STORY_BIBLE_V2.md section 13, checked by validate:phase0. */
export const kantaraInventory: ContentInventoryDefinition = {
  areas: [
    'kb_kurierhof', 'kb_sortierhalle', 'kb_werkhof', 'kb_tauschmarkt', 'kb_dachsteg', 'kb_wassertor', 'kb_wechselwerk_vorplatz',
    'bd_kronengarten', 'bd_seilmarkt', 'bd_quellast', 'bd_rankentor', 'bd_wipfelsteg', 'bd_brueckenwerk', 'bd_obstterrasse', 'bd_kranplatz', 'bd_kronenstation',
    'kd_hausboothafen', 'kd_schleusensteg', 'kd_pegelhaus', 'kd_fischertreppe', 'kd_rohrinsel', 'kd_schieberkai', 'kd_schilfkanal', 'kd_radwehr', 'kd_deltastation',
    'sw_drachenwerkstatt', 'sw_windhof', 'sw_warnmast', 'sw_spulengasse', 'sw_erdungsfeld', 'sw_gleitersteg', 'sw_blitzspeicher', 'sw_werftkran', 'sw_wolkenstation',
    'wg_bergungslager', 'wg_kreuzweiche', 'wg_nordstollen', 'wg_suedstollen', 'wg_prismenknoten',
    'gc_glashof', 'gc_suppenkueche', 'gc_faserhang', 'gc_glutschalenfeld', 'gc_rotglasstollen', 'gc_ascheterrasse', 'gc_waagehaus', 'gc_kuehlrinne', 'gc_ofenring', 'gc_glutbruecke', 'gc_sammlervorraum', 'gc_sammelkammer',
    'fo_ufersiedlung', 'fo_waermestube', 'fo_sternarchiv', 'fo_firnufer', 'fo_kaltperlengrotte', 'fo_klarglassteg', 'fo_protokollsaal', 'fo_spiegelhof', 'fo_eistreppe', 'fo_kuppelgang', 'fo_sammlervorraum', 'fo_kuppelsaal',
    'lm_stelzendorf', 'lm_laternenhaus', 'lm_torfgarten', 'lm_schilfpfad', 'lm_schwarzteich', 'lm_blendengang', 'lm_nebelsteg', 'lm_lichtinsel', 'lm_daemmerwehr', 'lm_sammlervorraum', 'lm_moorkern',
    'zw_annahmehalle', 'zw_leitungsschacht', 'zw_sortierkern', 'zw_leitwarte'
  ],
  passages: sequence('v', 108),
  enemies: [
    'enemy_kb_etikettenkrabbler', 'enemy_kb_frachtkiste',
    'enemy_bd_rankenhuepfer', 'enemy_bd_seilspinne', 'enemy_bd_kistenkauz', 'enemy_bd_aststampfer', 'enemy_bd_kronenheber',
    'enemy_kd_schlammspringer', 'enemy_kd_schieberkrabbe', 'enemy_kd_frachtbiber', 'enemy_kd_schottknacker', 'enemy_kd_deltarad',
    'enemy_sw_funkenmotte', 'enemy_sw_windklammer', 'enemy_sw_drachenwaechter', 'enemy_sw_spulenlaeufer', 'enemy_sw_wolkenspule',
    'enemy_wg_gleislaus', 'enemy_wg_frachtschieber', 'enemy_wg_sortierlaeufer',
    'enemy_gc_aschescharrer', 'enemy_gc_glasfluegler', 'enemy_gc_ofenzange', 'enemy_gc_glutwalze', 'enemy_gc_schmelzsammler',
    'enemy_fo_reiffuchs', 'enemy_fo_spiegelmotte', 'enemy_fo_eiskran', 'enemy_fo_reifjaeger', 'enemy_fo_nullgradsammler',
    'enemy_lm_dunstmolch', 'enemy_lm_schilfgreifer', 'enemy_lm_blendenvogel', 'enemy_lm_dunstschwinge', 'enemy_lm_dunstsammler',
    'enemy_zw_annahmegreifer', 'enemy_zw_leitungsverteiler', 'enemy_zw_sortierverbund', 'enemy_zw_z0'
  ],
  encounters: [
    'enc_kb_rollkiste', 'enc_kb_etikettennest',
    'enc_bd_rankenhuepfer', 'enc_bd_seilspinne', 'enc_bd_kistenkauz', 'enc_bd_aststampfer', 'enc_bd_kranranker', 'enc_bd_kronenheber',
    'enc_kd_schlammsprung', 'enc_kd_schieberkrabbe', 'enc_kd_frachtbiber', 'enc_kd_schottknacker', 'enc_kd_rohrschwarm', 'enc_kd_deltarad',
    'enc_sw_funkenmotten', 'enc_sw_windklammer', 'enc_sw_drachenwaechter', 'enc_sw_spulenlaeufer', 'enc_sw_klammergang', 'enc_sw_wolkenspule',
    'enc_wg_gleislaus', 'enc_wg_frachtschieber', 'enc_wg_sortierlaeufer_nord', 'enc_wg_sortierlaeufer_sued',
    'enc_gc_aschescharrer', 'enc_gc_glasfluegler', 'enc_gc_ofenzange', 'enc_gc_glutwalze', 'enc_gc_aschepaar', 'enc_gc_brueckenzange', 'enc_gc_schmelzsammler',
    'enc_fo_reiffuchs', 'enc_fo_spiegelmotten', 'enc_fo_eiskran', 'enc_fo_reifjaeger', 'enc_fo_grottenkran', 'enc_fo_kuppelfuchs', 'enc_fo_nullgradsammler',
    'enc_lm_dunstmolch', 'enc_lm_schilfgreifer', 'enc_lm_blendenvogel', 'enc_lm_dunstschwinge', 'enc_lm_nebelmolch', 'enc_lm_dunstsammler',
    'enc_zw_annahmegreifer', 'enc_zw_leitungsverteiler', 'enc_zw_sortierverbund', 'enc_zw_z0'
  ],
  puzzles: [
    'puz_kb_uebungsetiketten', 'puz_bd_pflanzenschilder', 'puz_bd_quellzeile', 'puz_bd_obstwaage',
    'puz_kd_schleusentore', 'puz_kd_lieferkaehne', 'puz_kd_pegelfolge',
    'puz_sw_warnfahnen', 'puz_sw_spulenbauplan', 'puz_sw_gleiterkurs', 'puz_wg_kreuzweiche',
    'puz_gc_brennstoffwaage', 'puz_gc_kuehlbericht', 'puz_fo_sternprotokolle', 'puz_fo_spiegelstellung',
    'puz_lm_lichtweg', 'puz_lm_stegbericht', 'puz_zw_befehlsfolge'
  ],
  items: [
    'item_weapon_kurierklinge', 'item_weapon_astbeil', 'item_weapon_bootsspeer', 'item_weapon_spulenhammer', 'item_weapon_glassaebel', 'item_weapon_prismenstab', 'item_weapon_blitzhammer', 'item_weapon_rotglassaebel', 'item_weapon_frostspeer', 'item_weapon_laternenstab', 'item_weapon_kernbrecher', 'item_weapon_wechselwerkzeug',
    'item_armor_kurierwams', 'item_armor_rindenpanzer', 'item_armor_schottharnisch', 'item_armor_ofenmantel', 'item_armor_waermewams', 'item_armor_daemmerumhang', 'item_talisman_prismamulett', 'item_talisman_hitzescherbe', 'item_talisman_kaltperle', 'item_talisman_erdungsring', 'item_talisman_retourmarke',
    'item_mat_astholz', 'item_mat_rankenseil', 'item_mat_blaetterharz', 'item_mat_schwemmholz', 'item_mat_schottniete', 'item_mat_wasserfaser', 'item_mat_spulendraht', 'item_mat_segeltuch', 'item_mat_werkzeugstahl', 'item_mat_ofenfaser', 'item_mat_glutschale', 'item_mat_rotglas', 'item_mat_firnfell', 'item_mat_kaltperle', 'item_mat_klarglas', 'item_mat_moorfaser', 'item_mat_dunkelglas', 'item_mat_blendenscherbe',
    'item_quest_uebungsstempel', 'item_quest_medizinkiste', 'item_quest_blaetterstempel', 'item_quest_deltastempel', 'item_quest_werftstempel', 'item_quest_prismenoeffner', 'item_quest_glutkern', 'item_quest_frostkern', 'item_quest_dunstkern', 'item_quest_retourstempel', 'item_quest_warnfahnen', 'item_quest_wartungsprotokoll',
    'item_shard_kesselbrueck', 'item_shard_blaetterdaecher', 'item_shard_kanaldelta', 'item_shard_sturmwerft', 'item_shard_glascaldera', 'item_shard_frostobservatorium', 'item_shard_laternenmoor',
    'item_marke_01', 'item_marke_02', 'item_marke_03', 'item_marke_04', 'item_marke_05', 'item_marke_06', 'item_marke_07', 'item_marke_08',
    'item_consume_grundproviant', 'item_consume_klarwasser', 'item_consume_kuehlkompresse', 'item_consume_waermetee', 'item_consume_erdungsband', 'item_consume_nebelkraut', 'item_consume_obstbrot', 'item_consume_kraftbruehe',
    'item_tool_etikettenlupe', 'item_tool_faserzange', 'item_tool_pegelstab', 'item_tool_erdungsklemme', 'item_tool_spiegelkurbel', 'item_tool_laternenblenden', 'item_tool_werkhofbuch', 'item_tool_gleishaken', 'item_tool_kernhalter'
  ],
  interactions: [
    'int_kb_klick_aufklappen', 'int_kb_auftrag_annehmen', 'int_kb_grundausruestung', 'int_kb_medizin_abgeben', 'int_kb_sammelbefehl_lesen', 'int_kb_marktversorgung', 'int_kb_astbeil_bauen', 'int_kb_bootsspeer_bauen', 'int_kb_spulenhammer_bauen', 'int_kb_glassaebel_bauen', 'int_kb_prismenstab_bauen', 'int_kb_blitzhammer_bauen', 'int_kb_rotglassaebel_bauen', 'int_kb_frostspeer_bauen', 'int_kb_kernbrecher_bauen', 'int_kb_wechselwerkzeug_bauen', 'int_kb_rindenpanzer_bauen', 'int_kb_schottharnisch_bauen', 'int_kb_ofenmantel_bauen', 'int_kb_waermewams_bauen', 'int_kb_daemmerumhang_bauen', 'int_kb_prismamulett_bauen', 'int_kb_hitzescherbe_bauen', 'int_kb_klarwasser_mischen', 'int_kb_kuehlkompresse_bauen', 'int_kb_prismenoeffner_bauen',
    'int_bd_fenn_fragen', 'int_bd_rankenseil_ernten', 'int_bd_astholz_nehmen', 'int_bd_harz_sammeln', 'int_bd_ina_helfen', 'int_bd_bruecke_reparieren', 'int_bd_quellventil_oeffnen', 'int_bd_rammwarnung_lesen', 'int_bd_obstbrot_nehmen', 'int_bd_stempel_praegen',
    'int_kd_suri_fragen', 'int_kd_bo_zuhoeren', 'int_kd_schwemmholz_nehmen', 'int_kd_wasserfaser_ernten', 'int_kd_rohrventil_oeffnen', 'int_kd_schottniete_loesen', 'int_kd_fischertreppe_reparieren', 'int_kd_schwall_ausloesen', 'int_kd_grundproviant_nehmen', 'int_kd_stempel_praegen',
    'int_sw_rikas_warnreim', 'int_sw_jaro_fragen', 'int_sw_erdungsring_annehmen', 'int_sw_segeltuch_bergen', 'int_sw_spulendraht_wickeln', 'int_sw_stahl_bergen', 'int_sw_pfaehle_erden', 'int_sw_gleiter_sichern', 'int_sw_speicherplan_lesen', 'int_sw_stempel_praegen',
    'int_wg_teamtafel_lesen', 'int_wg_gleishaken_nehmen', 'int_wg_bergungsproviant', 'int_wg_nordstollen_reparieren', 'int_wg_suedstollen_reparieren', 'int_wg_spulenroute_markieren', 'int_wg_stempel_einsetzen',
    'int_gc_nima_fragen', 'int_gc_cems_rezept_lesen', 'int_gc_faserzange_nehmen', 'int_gc_ofenfaser_ernten', 'int_gc_glutschale_nehmen', 'int_gc_rotglas_loesen', 'int_gc_stollen_lueften', 'int_gc_kuehlregel_lesen', 'int_gc_kuehlventil_oeffnen', 'int_gc_ofenwarnung_pruefen', 'int_gc_bruecke_pruefen', 'int_gc_suppenlieferung', 'int_gc_glutkern_nehmen',
    'int_fo_eli_zuhoeren', 'int_fo_vela_fragen', 'int_fo_waermetee_nehmen', 'int_fo_firnfell_sammeln', 'int_fo_kaltperle_sammeln', 'int_fo_klarglas_sammeln', 'int_fo_nebenfach_ordnen', 'int_fo_spiegelkurbel_nehmen', 'int_fo_spiegel_drehen', 'int_fo_reiftafel_lesen', 'int_fo_waermepfad_pruefen', 'int_fo_kaltanhaenger_annehmen', 'int_fo_frostkern_nehmen',
    'int_lm_pavos_geschichten_pruefen', 'int_lm_lumas_bericht_lesen', 'int_lm_blenden_nehmen', 'int_lm_moorfaser_ernten', 'int_lm_dunkelglas_nehmen', 'int_lm_blendenscherbe_loesen', 'int_lm_alte_marke_lesen', 'int_lm_blenden_einsetzen', 'int_lm_lichtnetz_ueben', 'int_lm_daemmerwarnung_lesen', 'int_lm_nebelkraut_nehmen', 'int_lm_dunstkern_nehmen',
    'int_zw_kerne_einsetzen', 'int_zw_meral_hoeren', 'int_zw_frachtetiketten_pruefen', 'int_zw_leitungsschild_lesen', 'int_zw_rueckleitung_umlegen', 'int_zw_sortieretikett_loesen', 'int_zw_oren_konfrontieren', 'int_zw_befehle_pruefen', 'int_zw_rueckleitung_oeffnen'
  ]
}
