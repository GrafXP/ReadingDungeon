# ReadingDungeon

Installierbare, offlinefähige React-PWA für das deutschsprachige Leseabenteuer
**Talora II – Die Rückkehr des Schattens**. Die Geschichte setzt *Die
Morgenklinge* fort und verwendet kurze, konkrete Texte für Kinder.

Die verbindliche Erzähl-, Welt- und Umsetzungsgrundlage steht in
[`STORY_BIBLE_V3.md`](./STORY_BIBLE_V3.md).

## Lokale Entwicklung

```bash
npm install
npm run dev
```

Prüfungen:

```bash
npm run validate:talora2
npm run typecheck
npm test
npm run test:e2e
npm run build
npm run preview
```

Der vollständige Inhalts-Debug ist während der Entwicklung über den Eintrag
`Debug` in der Navigation oder direkt unter [`/debug`](http://localhost:5173/debug)
erreichbar. Er zeigt alle Orte, Rätsel, Gegner, Kämpfe, Gegenstände, Wege,
Interaktionen und Systemdaten. Rätsel- und Kampftester arbeiten nur im
Arbeitsspeicher und verändern keinen gespeicherten Spielstand.

## Aktueller Stand

Die vollständige Talora-II-Kampagne ist als aktive Spielwelt umgesetzt:

- 78 Orte in neun Regionen und 108 Verbindungen;
- ein Prolog, danach drei frei wählbare alte Regionen;
- ein verbindender Mittelteil, danach drei gleichzeitig offene neue Regionen;
- ein vierstufiges Finale mit anschliessendem Erinnerungsrätsel;
- 39 Gegnertypen in 48 Begegnungen;
- 12 Waffen, 11 Rüstungen und Talismane sowie wechselbare Elementmodi;
- 18 tastatur- und touchbedienbare Rätsel in sieben Rätselarten;
- klare Zugankündigungen, Verteidigung, Aufladungen, Waffenkünste,
  Zustandsketten, Schutzkleidung, sichere Flucht und verlustfreie Rettung;
- dynamische Aufgaben, drei freiwillige Hinweisstufen, Merkliste, Karte,
  Tagebuch, Gegnerregister und Sammlung;
- persistente, versionierte Spielstände mit sicherem Import und Export;
- responsive, barrierearme Oberfläche mit grosser Schrift, hohem Kontrast und
  reduzierter Bewegung;
- Offlinebetrieb als PWA sowie Logik-, Komponenten-, Balance- und Browsertests.

Der Spielstart liegt in Sonnenwacht. Nach dem Lichterfest öffnen sich
Wisperwald, Spiegelküste und Donnerhöhe in beliebiger Reihenfolge. Später kommen
Funkeninsel, Frostsee und Laternenmoor hinzu; bereits geöffnete Gebiete bleiben
bis nach dem Ende frei begehbar.
