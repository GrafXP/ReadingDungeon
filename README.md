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

Die aktive App beginnt mit einer jederzeit im Kurierhof erneut lesbaren
Einführung. Danach startet der vollständige Kantara-Vertikalschnitt im Kurierhof
und führt durch Kesselbrück und die Blätterdächer bis zum ersten
Freigabestempel. Der vollständig spielbare Talora-Prototyp bleibt als getrenntes
Inhaltsmodul für Umsetzungsreferenz und Regressionstests erhalten, ist aber kein
Kanon der neuen Kampagne.

Bereits vorhanden sind:

- responsive App-Hülle und Routing für Start, Spiel, Karte, Aufgaben,
  Merkliste, Tagebuch, Register, Sammlung und Einstellungen;
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
- Waffen mit sichtbarer Trefferrechnung, Wucht- und Elementaranteilen,
  Schwächen, Widerständen, Immunitäten und umstellbaren Elementmodi;
- Heilmittel, erneuerbarer Grundproviant und einmalig plünderbare Truhen;
- gespeicherte Waffen-, Rüstungs- und Talismanausrüstung, Registerwissen,
  Waffenmodi und listenförmige Kampfteilnehmende;
- Ausrüstungsvergleich für Körperrüstung und Talisman sowie Wechsel ausserhalb
  des Kampfes und Waffenmoduswechsel ausschliesslich am Rastplatz;
- rundenbasierte Kämpfe mit Angriff, Verteidigung, Heilmitteln, Waffenkunst,
  Flucht, Zustandsketten und angekündigten Normal-, Auflade-, Schild- und Heilzügen;
- kostenlose Aktion **Beobachten**, vollständiges Gegnerregister und freiwillige
  Sammlungsübersicht;
- generische, tastatur- und touchbedienbare Rätsel für Zuordnung, Reihenfolge,
  Wegfeld, Leselücken und Waage zusätzlich zu Reglern und Zeichenfolgen;
- gespeicherter Kampf- und Zufallszustand, reproduzierbare Züge und verlustfreie Rettung zur letzten Raststelle;
- gespeicherte Erkundung, wobei an einem neuen Ort zuerst **Untersuche den Ort**
  gewählt werden muss, bevor Richtungen und Aktionen erscheinen;
- sieben fertige Orte in Kesselbrück und neun in den Blätterdächern mit
  Erst-, Wiederbesuchs- und sichtbaren Zustandstexten;
- der vollständige Prolog mit Meral und Klick sowie Fenns und Inas regionaler
  Auftrag, drei Rastplätze, zwei Abkürzungen und die Kartenfläche;
- vier eingebettete Leserätsel mit Zuordnung, Leselücken und Waage;
- erneuerbare Astholz-, Rankenseil-, Harz-, Obstbrot- und Proviantquellen sowie
  Briks Herstellung von Astbeil und Rindenpanzer;
- Aststampfer als Rammstoss-Wegwächter und Kronenheber als zweiphasiger
  Umleiter mit Verteidigung, Kapphieb, Flucht und verlustfreier Rettung;
- Aufgabenführung und freischaltbare Regelkarten in Klicks Register;
- Weltvalidator, automatische Balance-Simulationen sowie Logik-, Komponenten-
  und Browserprüfungen.

## Nächste Iteration

Phase 0 bis Phase 3 sind abgeschlossen: Das exakte Inhaltsinventar, die
Kampagnengrenze und der vorzeigbare Vertikalschnitt für Kesselbrück und
Blätterdächer stehen. Als Nächstes folgt Phase 4 mit Kanaldelta, Sturmwerft und
den Wechselgängen.
