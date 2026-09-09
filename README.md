# ReadingDungeon

Installierbare, offlinefähige React-PWA für das Leseabenteuer **Kantara und das
Grosse Wechselwerk**. Die Oberfläche und alle Spieltexte verwenden deutsche
Schweizer Standardsprache.

Die verbindliche Erzähl- und Weltgrundlage steht in
[`STORY_BIBLE_V2.md`](./STORY_BIBLE_V2.md). Der technische und inhaltliche
Neuaufbau ist in [`PRODUCT_PLAN_V2.md`](./PRODUCT_PLAN_V2.md) geplant.

## Lokale Entwicklung

```bash
npm install
npm run dev
```

Weitere Prüfungen:

```bash
npm run validate:phase0
npm run typecheck
npm test
npm run test:e2e
npm run build
npm run preview
```

## Stand

Die aktive App startet mit dem eigenständigen Kantara-Gerüst im Kurierhof. Der
vollständig spielbare Talora-Prototyp bleibt als getrenntes Inhaltsmodul für
Umsetzungsreferenz und Regressionstests erhalten, ist aber kein Kanon der neuen
Kampagne.

Bereits vorhanden sind:

- responsive App-Hülle und Routing für Start, Spiel, Karte, Aufgaben, Merkliste, Tagebuch und Einstellungen;
- PWA-Manifest, Service Worker, Offline- und Updatezustände sowie Installationshinweis;
- getrennte, versionierte IndexedDB-Speicherung für Abenteuer und Einstellungen;
- eine durchgängige Kampagnenkennung in Welt, Spielstand und Export sowie eine
  sichere Quarantäne für inkompatible lokale Spielstände;
- geordnete automatische Schreibvorgänge, Laufzeitvalidierung und Migration;
- geprüfter JSON-Export/-Import, explizite Importbestätigung und sicherer Reset;
- Textgrösse, hoher Kontrast und reduzierte Bewegung;
- Starten und Fortsetzen eines lokalen Abenteuers;
- reine Reducer-Spiellogik für Reisen, Untersuchen, Truhen, Funde und Anforderungen;
- eine vollständig datengetriebene Prototypwelt mit Rundwegen und Abkürzungen;
- Aufgabenansicht mit drei gespeicherten Hinweisstufen, gezielten Kartenhinweisen und entdeckungsbasierter SVG-Karte;
- Kartenstatus für unbesuchte, offene, blockierte und erledigte Orte sowie sichtbare Wegsperren und Merklistenziele;
- dynamische Merkliste für Zutaten, Werkzeuge, Fundorte, Verwendungszwecke und verbrauchte Questgegenstände;
- Weltvalidator für IDs, Ziele, Anforderungen, Sackgassen und Lösbarkeit;
- responsives Inventar mit Gegenstandsdetails, Fokusführung und erlaubten Aktionen;
- Waffen mit unterschiedlichen Schadenswerten, Panzerungs- und Regionsboni;
- Heilmittel, erneuerbarer Grundproviant und einmalig plünderbare Truhen;
- gespeicherte Waffen-, Rüstungs- und Talismanausrüstung, Registerwissen,
  Waffenmodi und listenförmige Kampfteilnehmende;
- rundenbasierte Kämpfe mit Angriff, Verteidigung, Heilmitteln, Flucht und angekündigten Gegnerzügen;
- gespeicherter Kampf- und Zufallszustand, reproduzierbare Züge und verlustfreie Rettung zur letzten Raststelle;
- gespeicherte Erkundung, wobei an einem neuen Ort zuerst **Untersuche den Ort**
  gewählt werden muss, bevor Richtungen und Aktionen erscheinen;
- Weltvalidator, automatische Balance-Simulationen sowie Logik-, Komponenten-
  und Browserprüfungen.

## Nächste Iteration

Phase 0 und Phase 1 sind abgeschlossen: Die Weltbibel enthält das exakte
Inhaltsinventar, Kantara und Talora können technisch nicht vermischt werden und
das Kurierhof-Gerüst ist typisiert, validierbar und speicherbar. Als Nächstes
folgt Phase 2 mit Kampf-, Ausrüstungs- und Leserätsel-Fundament.
