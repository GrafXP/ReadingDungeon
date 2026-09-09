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

Der Quellstand enthält noch den vollständig spielbaren technischen Prototyp,
dessen bisherige Erzählung durch Kantara ersetzt wird. Diese Inhalte sind
Umsetzungs- und Regressionstest, aber kein Kanon der neuen Kampagne.

Bereits vorhanden sind:

- responsive App-Hülle und Routing für Start, Spiel, Karte, Aufgaben, Merkliste, Tagebuch und Einstellungen;
- PWA-Manifest, Service Worker, Offline- und Updatezustände sowie Installationshinweis;
- getrennte, versionierte IndexedDB-Speicherung für Abenteuer und Einstellungen;
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
- gespeicherte Waffenausrüstung und vor versehentlichem Verbrauch geschützte wichtige Gegenstände;
- rundenbasierte Kämpfe mit Angriff, Verteidigung, Heilmitteln, Flucht und angekündigten Gegnerzügen;
- gespeicherter Kampf- und Zufallszustand, reproduzierbare Züge und verlustfreie Rettung zur letzten Raststelle;
- gespeicherte Erkundung, wobei an einem neuen Ort zuerst **Untersuche den Ort**
  gewählt werden muss, bevor Richtungen und Aktionen erscheinen;
- Weltvalidator, automatische Balance-Simulationen sowie Logik-, Komponenten-
  und Browserprüfungen.

## Nächste Iteration

Phase 0 ist abgeschlossen: Die Weltbibel enthält die vollständigen Inhalts- und
Abhängigkeitstabellen sowie den geprüften abstrakten Weltgraphen. Als Nächstes
folgt Phase 1 mit Kampagnentrennung, datengetriebenem Kern und dem typisierten,
speicherbaren Kantara-Gerüst.
