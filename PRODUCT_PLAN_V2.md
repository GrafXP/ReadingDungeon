# ReadingDungeon — Produkt- und Umsetzungsplan (Iteration 2)

Dieser Plan baut auf dem kopierten Stand von TextDungeon auf. Er beschreibt
das mechanische Fundament für ein tieferes Kampfsystem, wegsperrende Gegner,
Waffen und Schutzausrüstung mit Schadensarten, eine grössere Welt, eine
Bossleiter über vier Stufen, regionale Sammelgegenstände und mehr Rätsel.

> **Verbindliche Erzählrichtung (8. September 2026):** Die bisherige Geschichte
> wird nicht erweitert, sondern vollständig ersetzt. Die
> [`STORY_BIBLE_V2.md`](./STORY_BIBLE_V2.md) beschreibt Kantara mit neuen
> Regionen, Figuren, Konflikten und Bossen. Die
> bisherige Talora-Erzählung ist weder Vorgeschichte noch Kanon von
> ReadingDungeon; ihre alten Planungsdokumente werden nicht weitergeführt.

---

## 0. Ausgangslage

Der Quellstand wurde vollständig übernommen (ohne `node_modules`, `dist`,
`test-results`, `.git`) und geprüft:

- `npm run typecheck` fehlerfrei
- `npm test` — 18 Testdateien, 157 Tests grün
- Umbenennung der Anwendungsidentität: `TextDungeon` → `ReadingDungeon`
  (Paketname, Titel, PWA-Manifest, Kopfzeile, IndexedDB-Name `readingdungeon`).
  Der eigene Datenbankname verhindert, dass sich beide Projekte auf
  `localhost` denselben Speicher teilen.

### Inhaltsbestand heute

| Element | Bestand |
| --- | --- |
| Orte | 41 |
| Verbindungen | 55 |
| Gegenstände | 33 |
| Interaktionen | 44 |
| Rätsel | 5 |
| Gegnertypen | 14 (10 normal, 4 Boss) |
| Begegnungen | 14 |
| Regionen | 6 (4 bespielbar, 1 Verbindungsnetz, 1 Endgebiet) |

### Was der bestehende Code schon richtig macht

- reine Reducer-Logik (`src/engine/`), Inhalte vollständig als Daten
  (`src/content/world/`)
- angekündigte Gegnerzüge (`telegraph`), Phasen, `defendNegates`,
  `vulnerableAfterDefend`
- deterministischer Zufall (`rngState`) und speicherbarer Kampfzustand
- Weltvalidator (`worldValidator.ts`) und Balance-Simulation
  (`balanceSimulation.ts`) als dauerhaft laufende Prüfungen
- gestufte Hinweise, Merkliste, Kartenfortschritt

### Was der bestehende Code blockiert

- Schadensarten existieren nur als Sonderfall `damageType?: 'lightning'`
- Schutzwirkung existiert nur als fest verdrahteter Effekt `blitzschutz`
- Gegnerpanzer ist an genau einen Gegenstand gebunden (`shadowArmor` →
  `morgenklinge`); dieselbe Verdrahtung steckt in `combat.ts`, `CombatPanel.tsx`
  und `validation.ts`
- Zustände sind Zeichenketten mit fest verdrahteten Anzeigetexten
- keine Ausrüstungsplätze ausser der Waffe
- kein Begegnungstyp, der einen Weg sperrt — alle Gegner sind umgehbar
- `CombatState` kennt genau einen Gegner

**Grundsatz dieser Iteration:** zuerst diese fünf Verdrahtungen in Daten
überführen, dann Inhalte produzieren. Jede Sonderregel, die heute im Code steht,
wird zu einem Feld in `src/domain/content.ts`.

---

## 1. Ziel der Iteration

| Wunsch | Umsetzung |
| --- | --- |
| komplexeres Kampfsystem | Schadensarten, Zustände, Waffenkunst mit Abklingzeit, sichtbare Trefferrechnung; Duo-Begegnungen nur nach erfolgreicher Erprobung |
| wegsperrende Gegner | `guardEncounterId` an Verbindungen, geprüft durch Validator und Balance-Simulation |
| Waffen mit Attributen (Blitz, Feuer …) | `DamageType`, Elementaranteil, Schwächen und Widerstände pro Gegner |
| Schutzausrüstung (z. B. gegen Feuer) | zwei neue Ausrüstungsplätze: Rüstung und Talisman, mit `protectsFrom` / `immuneTo` |
| neue, grössere Welt | Kantara mit 9 Regionen, 78 Orten und 108 Verbindungen statt einer Erweiterung der 41 alten Orte |
| mehrstufige Bosse | vier Stufen: Streckenwächter, Umleiter, Sammler und Zentraldisponent Z-0 |
| Sammelgegenstände aus Regionen | Resonanzsplitter, alte Liefermarken, Werkstoffe, Werkhof und Sammlungsansicht |
| mehr Rätsel | 18 neue Kantara-Rätsel mit 7 unterstützten Arten, darunter `reading`, `grid` und `weighing` |

### Nicht-Ziel

Das Spiel bleibt ein **Lesespiel für 8- bis 12-Jährige**. Mehr Mechanik darf nie
mehr Reaktionsgeschwindigkeit oder mehr Rechnen verlangen — sie darf nur mehr
**Lesen und Entscheiden** verlangen. Jede neue Regel muss aus einem Text
ableitbar sein, den das Kind im Spiel gelesen hat.

---

## 2. Leitplanken

Diese Regeln aus Iteration 1 bleiben unverändert gültig und begrenzen alle
folgenden Entwürfe:

1. **Kein Zeitdruck.** Jeder Zug wartet beliebig lange.
2. **Keine dauerhaften Verluste.** Eine Niederlage kostet nur den Weg zum
   letzten Rastplatz, nie Fortschritt oder Questgegenstände.
3. **Angekündigte Züge.** Jeder Gegnerzug wird vor der Ausführung im Klartext
   beschrieben.
4. **Kein reines Glück.** Wer den angekündigten Zug richtig liest, gewinnt.
   Zufall verändert nur die Länge des Kampfes, nie den Ausgang.
5. **Kein Kopfrechnen.** Alle Zahlen sind ganzzahlig und stehen sichtbar auf dem
   Bildschirm.
6. **Ein Bildschirm.** Kampf, Ort und Aktionen passen ohne Scrollen bei 320 px
   Breite und grosser Schrift.
7. **Rückweg garantiert.** Aus jedem Kampf führt entweder Flucht oder Rettung
   zurück; keine Sackgasse.

### Zusätzliche Leitplanken für die neue Komplexität

8. **Höchstens drei neue Regeln pro Region.** Eine Region führt maximal drei
   neue Begriffe ein (z. B. Feuer, Ofenmantel, Brennen).
9. **Jede Regel wird zweimal erklärt** — einmal in einem Ortstext vor dem ersten
   Kampf, einmal im Register.
10. **Sichtbare Trefferrechnung.** Jeder Treffer zeigt seine Rechnung als Satz
    (siehe Abschnitt 3.4). Das ist gleichzeitig Leseübung und Lehrmittel.
11. **Wissen statt Reflex.** Wer eine Schwäche kennt, gewinnt schneller. Wer sie
    nicht kennt, gewinnt trotzdem — nur langsamer.
12. **Erst umsehen, dann handeln.** Beim ersten Besuch eines Ortes ist nur
    **«Untersuche den Ort»** verfügbar. Rätsel, Interaktionen, Begegnungen und
    Richtungen erscheinen nach dem Untersuchen. Bei späteren Besuchen bleiben
    sie sofort sichtbar. Die globale Navigation zu Inventar, Aufgaben,
    Einstellungen und anderen Übersichten bleibt dabei immer erreichbar.

---

## 3. Neue Kernsysteme

### 3.1 Schadensarten

```ts
export type DamageType = 'physical' | 'fire' | 'ice' | 'lightning' | 'light' | 'shadow'
```

Anzeigenamen: Wucht, Feuer, Eis, Blitz, Licht, Dämmer. Die technische ID
`shadow` bleibt möglich, wird aber nicht als moralisch böses Element erzählt.
Jede Art hat ein festes Zeichen und eine feste Farbe, durchgängig in Kampf,
Inventar und Register:

| Art | Zeichen | Woher | Wogegen stark |
| --- | --- | --- | --- |
| Wucht | ⚔ | alle Grundwaffen | ungepanzerte Tiere |
| Feuer | ✹ | Glascaldera | Eiswesen, Pflanzen, kalte Maschinen |
| Eis | ❄ | Frostobservatorium | Feuerwesen, überhitzte Maschinen |
| Blitz | ϟ | Sturmwerft | nasse Gegner, Wasserwesen |
| Licht | ☀ | Prismenwerkzeuge, Laternenmoor | getarnte Gegner, Dämmerfelder |
| Dämmer | ☾ | Nebelfilter und Gegner | — |

Ein Lichttreffer hebt Tarnung auf, bis der Gegner einen angekündigten
Verbergen-Zug beendet. Dadurch bleibt eine volle Spielerrunde, um das erneute
Verbergen zu verhindern; es ist kein Reaktionstest.

Gegner bekommen drei neue, **lesbare** Felder statt Multiplikatoren:

```ts
weakTo?: DamageType[]      // +3 Schaden
resistantTo?: DamageType[] // -3 Schaden, mindestens 1
immuneTo?: DamageType[]    // 0 Schaden, mit erklärendem Satz
```

Bewusst ganzzahlig und ohne Faktoren: „+3 Feuerschaden" ist für ein Kind lesbar,
„×1,5" nicht.

`shadowArmor` verschwindet als alter Codesonderfall. Vergleichbare Schilde
werden in Kantara ausschliesslich durch `immuneTo`, `resistantTo`, `weakTo` und
lesbare Zugdaten beschrieben.

### 3.2 Waffen

```ts
weapon?: {
  minDamage: number
  maxDamage: number
  damageType: DamageType            // Grundschaden, Vorgabe 'physical'
  elemental?:
    | { type: DamageType; amount: number }
    | { choices: DamageType[]; amount: number }     // Wahl nur am Rastplatz
  armorPiercing?: number
  bonusAgainstTag?: { tag: string; amount: number }
  trait: string                     // bestehender Anzeigetext
  skill?: WeaponSkill               // siehe 3.6
}
```

Der Elementaranteil **ignoriert die Panzerung des Gegners**. Damit haben
Elementarwaffen eine klare, erklärbare Rolle gegen gepanzerte Gegner, ohne dass
Grundwaffen wertlos werden.

Zielbestand: 12 neue Kantara-Waffen.

| Waffe | Region | Schaden | Element | Waffenkunst |
| --- | --- | --- | --- | --- |
| Kurierklinge | Kurierhof | 2–4 Wucht | — | — |
| Astbeil | Blätterdächer | 2–6 Wucht | — | Kapphieb (unterbricht Aufladung) |
| Bootsspeer | Kanaldelta | 3–5 Wucht | Blitz +2 | Schwallstoss (setzt `nass`) |
| Spulenhammer | Sturmwerft | 1–7 Wucht, 1 Panzerbruch | — | Kurzschluss (unterbricht Aufladung) |
| Glassäbel | Werkhof | 4–6 Wucht | — | — |
| Prismenstab | drei Freigabestempel | 3–5 Wucht | Feuer, Eis oder Licht +2 | Prismenspur (entfernt Tarnung) |
| Blitzhammer | Sturmwerft | 2–5 Wucht | Blitz +3 | Entladung (verstärkt gegen `nass`) |
| Rotglassäbel | Glascaldera | 3–5 Wucht | Feuer +3 | Brandhieb (setzt `brennt`) |
| Frostspeer | Frostobservatorium | 2–6 Wucht | Eis +3 | Frostgriff (setzt `gefroren`) |
| Laternenstab | Laternenmoor | 2–4 Wucht | Licht +2 | Lichtnetz (setzt `verwurzelt`) |
| Kernbrecher | Werkhof nach erstem Rückleitkern | 4–6 Wucht | Licht +3 | Kernstoss (Lichtausbruch) |
| Wechselwerkzeug | Werkhof, 7 Resonanzsplitter | 3–6 Wucht | wählbar +3 | passend zum gewählten Element |

Der Prismenstab lässt sich am Rastplatz auf Feuer, Eis oder Licht stellen. Er
garantiert damit, dass jede Aussenregion direkt nach dem Prismenöffner lösbar
ist. Die regionalen Elementarwaffen sind stärker, aber nicht Voraussetzung für
eine bestimmte Reihenfolge. Keine Pflichtkette setzt einen Waffenwechsel im
Kampf voraus: Der Bootsspeer verbindet `nass` und Blitz selbst; beim
Schmelzsammler lenkt Verteidigen den angekündigten Kühlkanal-Zug auf die
Maschine und setzt `nass`, während der Prismenstab bereits auf Eis eingestellt
ist.

Das Wechselwerkzeug ist die Belohnung für die vollständige Splittersammlung.
Sein Element lässt sich am Rastplatz auf jede der fünf Nicht-Wucht-Arten
umstellen. Das belohnt Sammeln, ohne eine beste Waffe für alle Situationen zu
erzeugen.

### 3.3 Schutzausrüstung

Neue Gegenstandsart `armor` mit zwei Plätzen:

```ts
export type GearSlot = 'body' | 'talisman'

armor?: {
  slot: GearSlot
  defense: number                // fester Abzug auf jeden Treffer
  protectsFrom?: DamageType[]    // halbiert diese Art
  immuneTo?: DamageType[]        // hebt diese Art vollständig auf
  penalty?: { kind: 'noFlee' | 'slowSkill'; text: string }
}
```

Der Spielstand bekommt `equippedArmorId` und `equippedTalismanId`.

Zielbestand: 6 Rüstungen, 5 Talismane.

| Ausrüstung | Platz | Panzerung | Schutz | Nachteil |
| --- | --- | --- | --- | --- |
| Kurierwams | Körper | 1 | — | — |
| Rindenpanzer | Körper | 2 | Eis halb | — |
| Schottharnisch | Körper | 2 | Blitz halb | — |
| **Ofenmantel** | Körper | 1 | **Feuer immun** | — |
| **Wärmewams** | Körper | 1 | **Eis immun** | — |
| **Dämmerumhang** | Körper | 2 | Dämmer halb | Waffenkunst braucht eine Runde länger |
| Prismamulett | Talisman | 0 | Dämmer halb | — |
| Hitzescherbe | Talisman | 0 | Feuer halb | — |
| Kaltperle | Talisman | 0 | Eis halb | — |
| Erdungsring | Talisman | 0 | Blitz halb | — |
| Retourmarke | Talisman | 1 | — | — |

**Die entscheidende Entwurfsregel:** Kein einzelnes Ausrüstungsstück schützt vor
allem. Die Rüstung mit vollem Feuerschutz hat wenig Panzerung. Damit wird die
Ausrüstungswahl vor jeder Region zu einer kleinen Leseaufgabe: Der Ortstext sagt
„hier brennt es", also gehört der Ofenmantel angelegt.

Wunsch aus dem Auftrag — „Schutzausrüstung, die vor Feuer schützt" — ist damit
direkt abgedeckt: Der Ofenmantel macht Feuerschaden zu 0 und gibt den dazu
passenden Satz aus: *„Der Ofenmantel hält die Glut vollständig ab."*

### 3.4 Trefferrechnung

Die Reihenfolge ist fest und wird als Satz angezeigt. Sie ist der Kern der
Lesbarkeit des neuen Systems.

**Spieler greift an:**

1. Wurf aus `minDamage`–`maxDamage` (Wuchtanteil)
2. `+ bonusAgainstTag`, falls das Gegner-Tag passt
3. `− max(0, enemy.defense − armorPiercing)` — nur auf den Wuchtanteil
4. `+ elemental.amount` — Elementaranteil, ohne Panzerungsabzug
5. je Schadensart: `+3` bei `weakTo`, `−3` bei `resistantTo`, `0` bei `immuneTo`
6. `+2` bei offenem Riss (`offener_riss`), `−1` bei `benebelt`
7. Mindestens 1, ausser der Gegner ist gegen **alle** beteiligten Arten immun

**Gegner greift an:**

1. `damage` des angekündigten Zuges
2. bei `defendNegates` und Verteidigung → 0, fertig
3. bei Verteidigung → aufgerundet halbiert
4. bei `armor.immuneTo` → 0, fertig
5. bei `armor.protectsFrom` oder passendem Talisman → aufgerundet halbiert
6. `− armor.defense`, Mindestwert 1
7. Zustände wie `brennt` wirken danach separat

Treffen Körperrüstung und Talisman dieselbe Schadensart, wird sie trotzdem nur
einmal halbiert. Schutz stapelt sich nicht zu einem Viertel; Immunität hat
immer Vorrang.

Ausgabebeispiel im Kampftext:

> Rotglassäbel: 4 Wucht − 2 Panzerung + 3 Feuer + 3 (Reifjäger ist schwach gegen
> Feuer) = **8 Schaden**.

> Glutwalze trifft: 8 Feuer → Ofenmantel **0 Schaden**. Der Ofenmantel hält die
> Glut vollständig ab.

Diese Zeile ist bewusst ein vollständiger Satz und kein Zahlenblock.

### 3.5 Zustände

Zustände werden aus fest verdrahteten Zeichenketten in eine Tabelle überführt:

```ts
export interface StatusEffectDefinition {
  id: string
  name: string
  icon: string
  description: string        // eine Zeile, kindgerecht
  target: 'player' | 'enemy'
  perTurn?: { damage: number; damageType: DamageType }
  modifiers?: {
    playerAttackDelta?: number
    enemyDefenseDelta?: number
    skipEnemyTurn?: boolean
    addWeakness?: DamageType[]
  }
  clearedByItemIds?: ItemId[]
}
```

| Zustand | Ziel | Wirkung | Gegenmittel |
| --- | --- | --- | --- |
| `brennt` | Gegner | 2 Feuerschaden je Runde, 3 Runden | — |
| `gefroren` | Gegner | überspringt einen Zug | — |
| `betaeubt` | Gegner | Panzerung 0 für eine Runde | — |
| `nass` | Gegner | zusätzlich schwach gegen Blitz und Eis | trocknet nach 3 Runden |
| `verwurzelt` | Gegner | kann nicht fliegen oder ausweichen | — |
| `offener_riss` | Gegner | +2 Schaden (bestehend) | — |
| `benebelt` | Spieler | −1 Angriff, 3 Runden | Klarwasser |
| `versengt` | Spieler | 1 Feuerschaden je Runde, 3 Runden | Kühlkompresse, Klarwasser |
| `schutz:<art>` | Spieler | halbiert die nächste Art (verallgemeinert `blitzschutz`) | — |

**Zustandsketten** sind die zugängliche Form von Tiefe: Wasser auf den Gegner
(`nass`) und danach der Blitzhammer richten mehr an. Das steht wörtlich im
Register und ist eine Leseaufgabe, kein verstecktes System.

`CombatState.effects` wird zu `playerEffects` und pro Gegner geführten
`effects`.

### 3.6 Waffenkunst

Jede Waffe der zweiten Hälfte hat **eine** Sonderaktion mit Abklingzeit:

```ts
export interface WeaponSkill {
  id: string
  name: string
  description: string
  cooldown: number     // Runden bis erneut verfügbar
  effect:
    | { kind: 'burst'; bonusDamage: number; damageType: DamageType }
    | { kind: 'inflict'; effectId: string; duration: number }
    | { kind: 'interrupt' }        // bricht den angekündigten Zug ab
    | { kind: 'ward'; effectId: string; duration: number }
    | { kind: 'sweep' }            // trifft beide Gegner einer Duo-Begegnung
}
```

Der Kampf bekommt damit eine fünfte Schaltfläche neben Angreifen, Verteidigen,
Gegenstand und Fliehen. Sie zeigt entweder den Namen der Kunst oder
„bereit in 2 Runden". `CombatState.skillCooldown` wird gespeichert.

Das ist die grösste Einzelverbesserung der Kampftiefe: Jede Runde hat jetzt eine
echte Wahl zwischen sicherem Schaden, Abwehr und einer starken Aktion mit
Wartezeit — ohne dass eine Regel dazukommt, die man nicht in einem Satz erklären
kann.

### 3.7 Register

Neue Ansicht und neues Spielstandfeld `studiedEnemyIds`.

- Beim ersten Kampf gegen einen Gegnertyp wird ein Eintrag angelegt
  (`metEnemyIds`).
- Eine neue Aktion **„Beobachten"** im Kampf kostet **keinen** Gegnerzug (wie
  die Hinweise) und schaltet den vollständigen Eintrag frei: Schwächen,
  Widerstände, Zugliste.
- Vor dem Beobachten zeigt die Kampfansicht bei Schwächen `unbekannt`.
- **Beobachten** steht als kleine Sekundäraktion direkt an der Schwächenzeile
  und zählt nicht zu den fünf rundenbezogenen Kampfschaltflächen.

Damit ist die neue Komplexität an eine Lesehandlung gekoppelt statt an
Ausprobieren — genau das Ziel dieses Projekts. Klicks Register ist zugleich eine
freiwillige Sammlung (siehe 7).

### 3.8 Wegwächter

Bisher blockiert kein Gegner einen Weg. Neu:

```ts
// PassageDefinition
guardEncounterId?: EncounterId
```

Eine Verbindung mit `guardEncounterId` ist erst passierbar, wenn die Begegnung
besiegt ist. Die Sperre wird wie jede andere sichtbar begründet
(`blockedText`) und auf der Karte als Wächtersymbol angezeigt.

**Sicherheitsregeln, im Validator geprüft:**

1. Ein Wegwächter sperrt nie die Verbindung, über die man den Ort betreten hat.
2. Ein Wegwächter sperrt nie den letzten Weg zu einem Rastplatz.
3. Zu jedem Zeitpunkt gibt es mindestens einen offenen Weg zurück zum
   Startgebiet.
4. Die Begegnung muss mit der Ausrüstung gewinnbar sein, die **vor** ihr
   erreichbar ist — geprüft durch die Balance-Simulation, nicht nur durch
   Erreichbarkeit.

Zusätzlich für harte Ausrüstungstore:

```ts
// EncounterDefinition
requiredGear?: Requirement   // `equipped`, z. B. Ofenmantel gegen die Glutwalze
gearWarning?: string         // Text vor dem Kampf, Rückzug bleibt möglich
```

Das verallgemeinert den vorhandenen `early-boss`-Mechanismus zu einem
datengetriebenen Kantara-System. Fehlt die ausgerüstete Schutzkleidung, bleibt
die Begegnungsaktion nach dem Untersuchen sichtbar, startet den Kampf aber
nicht und zeigt `gearWarning`. Alle bereits offenen Richtungen — insbesondere
der Rückweg — bleiben benutzbar.

Zielbestand: 12 wegsperrende Begegnungen — sechs Streckenwächter, drei Umleiter
und drei Sammler. Z-0 sperrt keinen offenen Weltrückweg und zählt nicht dazu.

### 3.9 Duo-Begegnungen

`CombatState` führt statt eines Gegners eine Liste:

```ts
combatants: Array<{
  enemyId: string
  life: number
  maxLife: number
  phase: number
  announcedMoveId: string
  stance: 'normal' | 'guarded' | 'vulnerable'
  effects: Array<{ id: string; remainingEnemyTurns: number }>
}>
targetIndex: number
```

Der Einzelgegner ist der Fall mit einem Eintrag. Regeln:

- höchstens **zwei** Gegner, nie mehr (Lesbarkeit)
- beide Züge werden zusammen angekündigt, untereinander, nicht nebeneinander
- Verteidigung wirkt gegen beide
- Ziel wird per Schaltfläche gewechselt; der Wechsel kostet keinen Zug

Duo-Begegnungen erscheinen frühestens bei einem späteren Wiederbesuch der
Wechselgänge; weitere Fassungen liegen erst in der zweiten Spielhälfte. Dieses
System besitzt in Phase 8 ein Entscheidungstor und bleibt vollständig
streichbar, falls zwei Ankündigungen zu viel Text pro Runde sind. Jede geplante
Duo-Begegnung hat deshalb eine Einzelgegner-Fassung.

---

## 4. Bossleiter

Vier Stufen mit steigendem Anspruch — der Wunsch nach „mehreren Bosslevels":

### Stufe 1 — Streckenwächter (6)

Zwei Phasen, sperren einen Weg, verlangen genau **eine** gelesene Regel.

| Streckenwächter | Region | Regel |
| --- | --- | --- |
| Aststampfer | Blätterdächer | Beim angekündigten Rammstoss verteidigen |
| Schottknacker | Kanaldelta | Erst die Deckung öffnen, dann den Panzer treffen |
| Spulenläufer | Sturmwerft | Aufladung mit Waffenkunst unterbrechen |
| Glutwalze | Glascaldera | Vor dem inneren Weg Feuerschutz anlegen |
| Reifjäger | Frostobservatorium | Feuer bricht Eispanzer schneller |
| Dunstschwinge | Laternenmoor | Licht deckt Tarnung auf |

### Stufe 2 — Regionale Umleiter (3)

Kronenheber, Deltarad und Wolkenspule stehen am Ende der drei nahen Regionen.
Sie haben zwei Phasen und kombinieren je zwei bereits erklärte Regeln. Nach der
Abschaltung prägen die Menschen der Region einen Freigabestempel.

| Umleiter | Region | Gelesene Kombination |
| --- | --- | --- |
| Kronenheber | Blätterdächer | Ansturm verteidigen, Aufladung unterbrechen |
| Deltarad | Kanaldelta | Deckung öffnen, offenes Rad mit Schwallstoss blockieren |
| Wolkenspule | Sturmwerft | Aufladung unterbrechen, Panzerung mit Panzerbruch überwinden |

### Stufe 3 — Sammler (3)

Drei Phasen verlangen passende Schutzausrüstung und eine Zustandskette. Jeder
Sieg löst einen Rückleitkern aus der Maschine und verändert die Region sichtbar.

| Sammler | Region | Kern |
| --- | --- | --- |
| Schmelzsammler | Glascaldera | Ofenmantel schützt; Verteidigen lenkt Kühlkanal um, Prismenstab auf Eis nutzt `nass` |
| Nullgradsammler | Frostobservatorium | Wärmewams schützt; Prismenstab auf Feuer öffnet den Spiegelpanzer |
| Dunstsammler | Laternenmoor | Dämmerumhang schützt; Licht deckt auf, Lichtnetz hält sichtbar |

### Stufe 4 — Zentraldisponent Z-0

Z-0 hat vier Phasen in vier Räumen: Greifarme in der Annahmehalle,
Elementleitungen im Leitungsschacht, Sortierverbund im Sortierkern und
Befehlsfeld in der Leitwarte. Nach dem Öffnen des letzten Schutzfelds folgt kein
Todesstoss. Das Kind ordnet **Prüfen — Zuordnen — Senden**, setzt die drei
Rückleitkerne ein und öffnet die Rückleitung.

### Erzählerische Einbettung

Die Bossleiter gehört von Beginn an zum Unfall des Grossen Wechselwerks:

- **Prolog — Die falsche Zustellung:** Das Werk verriegelt Kantara; der offene
  Übungstunnel und Klick ermöglichen die erste Hilfslieferung.
- **Akt I — Drei offene Aufträge:** Blätterdächer, Kanaldelta und Sturmwerft
  sind frei geordnet. Streckenwächter und Umleiter liefern drei
  Freigabestempel.
- **Akt II — Die drei äusseren Stationen:** Der Prismenöffner gibt Glascaldera,
  Frostobservatorium und Laternenmoor gleichzeitig frei. Dort warten die drei
  Sammler und Rückleitkerne.
- **Akt III — Orens fehlende Zeile:** Ein verpflichtendes Protokoll belegt, dass
  Oren den Sicherheitstest übersprang; nach dem dritten Kern gesteht er.
- **Akt IV — Rückleitung:** Die Regionen arbeiten gleichzeitig, während das
  Kind Z-0 stoppt und den falschen Sammelbefehl berichtigt.

Die freie Reihenfolge wird in beiden Dreiergruppen gewahrt. Enthüllungen hängen
von der Anzahl abgeschlossener Regionen ab, nicht von einer bestimmten Region.

---

## 5. Welt

### Zielgrösse

Die heutigen Zahlen beschreiben nur den kopierten technischen Ausgangsstand.
Kantara ersetzt dessen Inhalt vollständig; die Zielzahlen werden nicht durch
Ergänzen alter und neuer Orte erreicht.

| Element | Technischer Ausgangsstand | Kantara-Ziel |
| --- | --- | --- |
| Regionen | 6 | 9 |
| Orte | 41 | 78 |
| Verbindungen | 55 | 108 |
| Gegenstände | 33 | 85 |
| Interaktionen | 44 | 110 |
| Rätsel | 5 | 18 |
| Gegnertypen | 14 | 39 |
| Begegnungen | 14 | 48 |
| davon wegsperrend | 0 | 12 |

### Die neun neuen Regionen

| Region | Orte | Funktion | Bewohnter Anker | Gefährlicher Kern |
| --- | ---: | --- | --- | --- |
| Kesselbrück | 7 | Start, Kurierhof, Werkhof, Aufträge | Kurierhof und Tauschmarkt | Vorplatz des Wechselwerks |
| Blätterdächer | 9 | nahe Garten- und Seilwegregion | Kronengarten | Kronenheber |
| Kanaldelta | 9 | nahe Fähr- und Schleusenregion | Hausboothafen | Deltarad |
| Sturmwerft | 9 | nahe Wind- und Blitzregion | Drachenwerkstatt | Wolkenspule |
| Wechselgänge | 5 | Rundwege und regionsübergreifende Abkürzungen | Bergungslager | gestörte Sortiergleise |
| Glascaldera | 12 | grosse Feuerregion | Glashöfe und Suppenküche | Schmelzsammler |
| Frostobservatorium | 12 | grosse Eis- und Spiegelregion | Ufersiedlung | Nullgradsammler |
| Laternenmoor | 11 | grosse Dämmer- und Lichtregion | Stelzendorf | Dunstsammler |
| Zentralwerk | 4 | Schlussgebiet | regionale Stimmen über Sprechrohre | Z-0 in der Leitwarte |
| **Gesamt** | **78** |  |  |  |

Jede grosse Region besitzt eine bewohnte Randzone mit Rastplatz, einen offenen
Rundweg mit Werkstoffen und Nebenaufgaben sowie eine gefährliche Kernzone. Die
Menschen reparieren nach Fortschritten selbst Wege oder Stationen; sie warten
nicht statisch auf die Spielfigur.

### Kartenanpassung

Die Karte wird für Kantara neu angelegt und übernimmt keine Talora-Positionen.
Kesselbrück liegt als Orientierungspunkt in der Mitte. Die drei nahen Regionen
bilden den ersten Ring, die Wechselgänge verbinden sie mit dem äusseren Ring aus
Glascaldera, Frostobservatorium und Laternenmoor. Das Zentralwerk erscheint als
eigener Tiefenbereich unter Kesselbrück. Die Karte zeigt angrenzende Orte erst,
nachdem der aktuelle Ort untersucht wurde.

---

## 6. Rätsel

Kantara erhält 18 neue Rätsel. Die Engine unterstützt die zwei vorhandenen
Arten (`controls`, `sequence`) sowie fünf weitere:

| Art | Beschreibung | Beispiel |
| --- | --- | --- |
| `controls` | mehrere Schalter oder Regler richtig einstellen | Schleusentore im Kanaldelta |
| `sequence` | Zeichen in einer gelesenen Reihenfolge wählen | Warnfahnen der Sturmwerft |
| `pairing` | Paare zwischen zwei Listen bilden | Fracht anhand ihrer Hinweise Empfängern zuordnen |
| `ordering` | Einträge nach einer genannten Regel sortieren | Sternprotokolle im Frostobservatorium |
| `grid` | einen Weg über ein Feld mit höchstens 4×4 Feldern legen | Laternenweg durch das Moor oder Wechselgleise |
| `reading` | Lücken mit Wörtern aus einem zuvor lesbaren Text füllen | Orens Wartungsbericht oder Lumas Stegbeschreibung |
| `weighing` | zwei Seiten nach einer Textregel ausgleichen | Brennstoffwaage in der Glascaldera |

Die Art `reading` ist der direkte Beitrag zum Projektziel: Die Lösung steht in
einem Ortstext, den das Kind vorher gelesen hat, und ist über den Ort jederzeit
erneut nachlesbar. Sie wird bewusst mindestens viermal eingesetzt.

Der Datentyp wird entsprechend erweitert; `PuzzleDefinition` erhält ein
`kind`-Feld, und `puzzles.ts` bekommt je Art eine Lösungsprüfung. Die vorhandenen
Mechaniken dürfen als Enginebasis dienen, aber Kantara verwendet neue Rätsel-IDs
und neue Lösungen.

Regeln bleiben: kein Fehlschlag kostet etwas, jeder Versuch ist beliebig oft
wiederholbar, jedes Rätsel ist ohne Ton lösbar, und die Lösung steht nach drei
Hinweisstufen vollständig da. Rätselbedienung erscheint an einem neuen Ort erst
nach **Untersuche den Ort**.

---

## 7. Sammlungen und Werkhof

Drei sichtbare Sammlungen in einer neuen Ansicht **Sammlung**:

1. **Resonanzsplitter (7):** je einer in Kesselbrück und den sechs bewohnten
   Hauptregionen; hinter optionalem Rätsel oder Gegner, nie auf dem Hauptweg.
2. **Alte Liefermarken (8):** kurze persönliche Geschichten über frühere Wege
   zwischen den Regionen.
3. **Klicks Register (39 Einträge):** durch Treffen und Beobachten aller
   Gegnertypen — Tiere, wilde Maschinen und Bosse.

### Werkstoffe und Werkhof

Die sechs Hauptregionen liefern je 2–3 Werkstoffe. Brik verarbeitet sie im
Werkhof von Kesselbrück zu Waffen und Schutzkleidung. Rezepte sind gewöhnliche
Interaktionen mit Anforderungen und Effekten. Das vorhandene optionale
`Requirement.quantity` sowie die Mengen in `addItem` und `removeItem` werden
für Rezepte wiederverwendet und durch Validator- und Interaktionstests
abgesichert.

```
Ofenmantel     = 2 × Ofenfaser + 1 × Glutschale
Rotglassäbel   = 1 × Rotglas + 1 × Glutschale + 1 × Werkzeugstahl
Wärmewams      = 2 × Firnfell + 1 × Kaltperle
Wechselwerkzeug = alle 7 Resonanzsplitter als Besitzanforderung
```

Das Wechselwerkzeug verbraucht die Resonanzsplitter nicht; die Sammlung bleibt
sichtbar vollständig. Es bleibt optional und der Endkampf ist ohne es
gewinnbar. Notwendige Materialien besitzen sichere, erneuerbare Quellen. Ein
Rezept darf weder die einzige Pflichtwaffe noch einen später verlangten
Questgegenstand verbrauchen.

---

## 8. Datenmodell

### `src/domain/content.ts`

Neu: `DamageType`, `GearSlot`, `WeaponSkill`, `StatusEffectDefinition`,
`ArmorDefinition`. Erweitert: `ItemKind` um `armor`, `ItemDefinition.armor`,
`ItemDefinition.weapon`, `Requirement` um
`{ kind: 'equipped'; slot: GearSlot; itemId: ItemId }`,
`EnemyDefinition` (`weakTo`, `resistantTo`, `immuneTo`, `stealth`),
`EnemyMoveKind` um `charge`, `shield` und `heal`,
`EnemyMoveDefinition.damageType` auf den vollen `DamageType`,
`EncounterDefinition` (`enemyIds: string[]`, `requiredGear`, `gearWarning`),
`PassageDefinition.guardEncounterId`, `PuzzleDefinition.kind`.

`Requirement.quantity` sowie die Mengenfelder von `addItem` und `removeItem`
bestehen bereits und bleiben die einzige Mengenlogik für Werkhofrezepte.

Die bisher fest auf alte Regions-IDs begrenzte `RegionId` wird durch
`RegionDefinition` und die Regionsliste der jeweils geladenen Welt ersetzt.
`WorldDefinition` erhält ausserdem `campaignId` und eine allgemeine
`completionRequirement`; sie ersetzt das prototypspezifische `sliceGoalFlag`.
Der Weltvalidator prüft, dass jede Orts-Region definiert und jede Regions-ID
innerhalb der Kampagne eindeutig ist.

Entfernt: `EnemyDefinition.shadowArmor` (ersetzt durch `immuneTo`/`weakTo`).

### `src/domain/game.ts` — Spielstand v6

```
SAVE_SCHEMA_VERSION 5 → 6
CONTENT_VERSION     5 → 6
```

Neue Felder:

```ts
campaignId: 'kantara'
player: {
  …
  equippedArmorId: ItemId | null
  equippedTalismanId: ItemId | null
  weaponElementModes: Partial<Record<ItemId, DamageType>>
}
studiedEnemyIds: string[]
metEnemyIds: string[]
activeCombat: {
  …
  combatants: Combatant[]      // ersetzt enemyLife/enemyMaxLife/phase/…
  targetIndex: number
  playerEffects: ActiveEffect[]
  skillCooldown: number
}
```

### Kampagnengrenze statt Inhaltsmigration

Ein v5-Spielstand aus dem kopierten Talora-Inhalt wird **nicht** in Kantara
umgedeutet. Seine Orts-, Inventar-, Begegnungs- und Quest-IDs besitzen in der
neuen Geschichte keine gültige Bedeutung.

- Neue Spiele und Exporte tragen `campaignId: 'kantara'`.
- `migrateAndValidateGameSave` migriert nur ältere technische Versionen, die
  bereits dieselbe `campaignId` besitzen.
- Ein Spielstand ohne `campaignId` oder mit einer anderen Kampagne wird nicht
  überschrieben. Die Oberfläche erklärt, dass für Kantara ein neues Abenteuer
  begonnen werden muss, und bietet vorher weiterhin den Export der alten Datei
  an, sofern sie aus diesem Projekt stammt.
- App-Einstellungen bleiben erhalten, weil sie getrennt vom Abenteuer
  gespeichert werden.
- Entwicklungsstände der neuen Kampagne dürfen innerhalb von Kantara migriert
  werden. Ein laufender alter Einzelgegner-Kampf wird dabei beendet und zum
  letzten sicheren Ort zurückgeführt, sobald die Kämpferliste eingeführt wird.

Die Prüfung `validation.ts` wird um `campaignId` und die neuen Felder erweitert,
einschliesslich der Manipulationsprüfungen für Waffe, Rüstung, Talisman,
Rückwegstatus und Kämpferliste.

### Engine-Dateien

| Datei | Änderung |
| --- | --- |
| `combat.ts` | Trefferrechnung 3.4, Kämpferliste, Waffenkunst, Zustandstabelle; die fest verdrahteten Namen (`morgenklinge`, `marea`, `raugrim`, `blitzschutz`, `quellwasser`) verschwinden aus dem Code |
| `damage.ts` (neu) | reine Funktionen `resolvePlayerHit` / `resolveEnemyHit`, gewählter Waffenmodus und erzeugter Erklärsatz |
| `statusEffects.ts` (neu) | Tabelle und Anwendung je Runde |
| `bestiary.ts` (neu) | Sichtbarkeit von Schwächen, Beobachten |
| `actions.ts` | neue Aktionen `EQUIP_ARMOR`, `EQUIP_TALISMAN`, `USE_SKILL`, `SET_TARGET`, `STUDY_ENEMY` |
| `worldValidator.ts` | Wegwächter, Ausrüstungstore, Schadensart-Lösbarkeit |
| `balanceSimulation.ts` | erreichbare Ausrüstungsstufen statt einer fest verdrahteten Referenzwaffe; Prüfung je Begegnung mit der zum Zeitpunkt erreichbaren Ausrüstung |
| `selectors.ts` | freie Regionsreihenfolgen, Kantara-Aufträge und Sammlungsfortschritt |

---

## 9. Oberfläche

### Kampfansicht

Die bestehende Anordnung bleibt; ergänzt werden:

- **Ausrüstungszeile** über den Aktionen: Waffe · Rüstung · Talisman, jeweils
  mit Schadensart- und Schutzzeichen
- **Schwächenzeile** beim Gegner: „Schwach gegen ✹ Feuer" oder „unbekannt —
  beobachte ihn", daneben die kostenlose Sekundäraktion **Beobachten**
- **fünfte Schaltfläche** Waffenkunst mit Abklingzeit
- **Zielwechsel** nur bei Duo-Begegnungen sichtbar
- **Trefferrechnung** als Satz im bestehenden `event-result`-Bereich

Die Zahl rundenbezogener Schaltflächen steigt von 4 auf 5 (6 bei Duos).
**Beobachten** steht ausserhalb dieses Rasters an der Schwächenzeile. Die
gesamte Anordnung bleibt bei 320 px darstellbar und wird als Abnahmekriterium
geprüft.

### Neue Ansichten

- **Ausrüstung** — Erweiterung des bestehenden `InventoryDialog` um die zwei
  neuen Plätze, den Waffenmodus am Rastplatz und einen Vergleich
  („Feuerschaden: 0 statt 6")
- **Register** — Liste aller getroffenen Gegner mit Schwächen, Zügen und
  einem Merksatz
- **Sammlung** — Resonanzsplitter, alte Liefermarken und Registerfortschritt

Beide neuen Ansichten hängen an der bestehenden Navigation in `AppLayout.tsx`.
Die Navigation wächst damit auf neun Einträge und wird auf dem Telefon zu einem
scrollbaren Streifen.

### Zugänglichkeit

Unverändert: Textgrösse, hoher Kontrast, reduzierte Bewegung, Fokusführung nach
jeder Reise. Neu zu prüfen: Schadensarten dürfen **nie** allein über Farbe
unterschieden werden — jedes Zeichen hat zusätzlich ein Symbol und ein Wort.

---

## 10. Prüfsysteme

### Weltvalidator

Neue Prüfungen zusätzlich zu den bestehenden:

1. Jede Schadensart, die ein Gegner als einzige Schwäche hat, ist über eine
   erreichbare Waffe verfügbar.
2. Jeder Gegner, der eine ausgerüstete Schutzausrüstung verlangt
   (`requiredGear` mit `equipped`), ist erst erreichbar, nachdem diese
   Ausrüstung herstellbar ist.
3. Kein Wegwächter sperrt den Rückweg, den letzten Weg zu einem Rastplatz oder
   den einzigen Weg zu einem Pflichtziel, das vor ihm liegt.
4. Jeder Werkstoff hat mindestens eine Quelle und mindestens ein Rezept.
5. Jeder Resonanzsplitter ist erreichbar, ohne einen anderen Splitter zu
   besitzen (keine Sammelketten).
6. Kein Rezept verbraucht einen Gegenstand, der später noch einmal verlangt
   wird.

### Balance-Simulation

Die bestehende Simulation prüft heute jede Begegnung mit einer festen
Ausrüstung. Neu:

- Für jede Begegnung wird die **zum Zeitpunkt erreichbare** Ausrüstung
  bestimmt (aus der Fortschrittssimulation des Validators).
- Geprüft wird mit der schwächsten sinnvollen Ausrüstung dieser Menge, nicht
  mit der besten.
- 1000 Zufallszustände je Begegnung, entsprechend der bestehenden
  Endgegner-Simulation.
- Zusätzliche Bedingung für Wegwächter: gewinnbar **ohne** Heilmittel ausser
  dem erneuerbaren Grundproviant, damit ein Kind ohne Vorrat nicht steckenbleibt.
- Die Strategie der Simulation bleibt die, die die Oberfläche lehrt:
  angekündigte schwere Angriffe verteidigen, sonst angreifen, Waffenkunst
  einsetzen sobald bereit, heilen bei ruhigen Zügen.

Fällt eine Begegnung durch, ist das ein Fehler im Inhalt, nicht im Test.

---

## 11. Umsetzungsschritte

Die Umsetzung erweitert die Talora-Kampagne nicht. Kantara entsteht in einem
eigenen Inhaltsmodul und ersetzt sie erst dann als Startkampagne, wenn der
Vertikalschnitt vollständig spielbar ist. Bis dahin bleibt der heutige Stand als
Regressionstest verfügbar; alte Namen, Flags und Sonderfälle dürfen jedoch
nicht in neue Kantara-Inhalte übernommen werden.

Für **jede Codephase** gelten als Abschluss: grüner `typecheck`, grüner
Produktionsbuild, grüne Logik- und Komponententests, ein fehlerfreier
Weltvalidator und ein über die Oberfläche spielbarer Stand. Für Inhaltsphasen
kommt eine Prüfung aller neuen Texte, Abhängigkeiten und Rückwege hinzu. Phase 0
ist eine Entwurfsphase; dort bleibt die heutige App unverändert spielbar.

### Phase 0 — Verbindliche Welt- und Produktionsbibel

**Status: abgeschlossen am 9. September 2026.** Die verbindlichen Tabellen
stehen in Abschnitt 13 der `STORY_BIBLE_V2.md`; `npm run validate:phase0`
prüft Zielzahlen, IDs, Referenzen, Graphzusammenhang, Rastziele und die
expliziten Rückwege aller zwölf Wegwächter.

- die vorhandene `STORY_BIBLE_V2.md` um die verbindlichen Inhalts- und
  Abhängigkeitstabellen dieser Phase ergänzen
- Titel, Gegenwartskonflikt, vier Akte, Schluss, Figurenentwicklungen und die
  Rollen aller neun Regionen verbindlich festlegen
- das vollständige Inhaltsinventar anlegen: 78 Orts-IDs, 108 Verbindungen,
  85 Gegenstände, 110 Interaktionen, 18 Rätsel, 39 Gegnertypen und
  48 Begegnungen; jeweils Pflichtinhalt, optionaler Inhalt und Quelle der
  Spielerinformation markieren
- den Weltgraph und die Fortschrittsmatrix für Kesselbrück, die drei nahen
  Regionen, die drei Aussenregionen, Wechselgänge und Zentralwerk festlegen
- für jede Kampfregel dokumentieren, welcher Ortstext sie vor dem ersten
  Pflichteinsatz erklärt und welcher Registereintrag sie wiederholt
- alle Rezepte, Materialquellen, Verbrauchsstellen, Wegwächter, Rastplätze,
  Fluchtziele und nachträglichen Abkürzungen in einer Abhängigkeitstabelle
  erfassen
- die sechs möglichen Reihenfolgen der nahen Regionen und die sechs möglichen
  Reihenfolgen der Aussenregionen erzählerisch prüfen; Story-Beats dürfen kein
  Wissen aus einer bestimmten Reihenfolge voraussetzen
- Save-Entscheidung festschreiben: Kantara erhält `campaignId: 'kantara'` und
  einen neuen Spielstand; Talora-Questflags und -Inventar werden nicht migriert

**Abschlusskriterium:** Die neue Bibel enthält keine erzählerischen Platzhalter
aus Talora. Der abstrakte Weltgraph ist ohne Sackgasse lösbar, alle Pflichtregeln
besitzen eine vorgelagerte Textquelle und jedes Zielelement aus dem
Inhaltsinventar hat eine eindeutige Funktion.

### Phase 1 — Kampagnengrenze und datengetriebener Kern

**Status: abgeschlossen am 9. September 2026.** Kantara ist die aktive,
eigenständig validierte Kampagne. Fremde Spielstände werden quarantänisiert
und exportierbar gehalten; das exakte Phase-0-Inventar meldet weiterhin alle
noch nicht implementierten Inhalts-IDs.

- `campaignId` in Welt, Spielstand, Export und Laufzeitvalidierung aufnehmen;
  ein Spielstand einer anderen Kampagne darf nie still in Kantara geladen werden
- `kantaraWorld` als eigenes Inhaltsmodul und einen neuen Spielstart im
  Kurierhof anlegen; die alte Welt bleibt vorübergehend nur als
  Regressionstest und Umsetzungsreferenz bestehen
- `RegionId`, `WorldDefinition.sliceGoalFlag` und den hart verdrahteten
  `createNewGame`-Start durch Regionsdaten, `completionRequirement` und eine
  kampagneneigene Startkonfiguration ersetzen
- fest verdrahtete Talora-IDs und -Texte aus Engine und generischen
  UI-Komponenten entfernen, darunter `morgenklinge`, `marea`, `raugrim`,
  `blitzschutz` und `quellwasser`
- `DamageType`, `GearSlot`, Rüstungs- und Waffenfelder, allgemeine
  Gegnerresistenzen, die Anforderung `equipped`, `guardEncounterId`,
  `requiredGear` und `gearWarning` in das Inhaltsmodell aufnehmen
- den Spielstand für Rüstung, Talisman, Registerwissen und eine von Anfang an
  listenförmige Kämpferstruktur sowie die gewählten Modi umstellbarer Waffen
  erweitern; ein Einzelgegner ist eine Liste mit einem Eintrag
- Validatoren zunächst gegen das Inhaltsinventar aus Phase 0 laufen lassen,
  damit fehlende Kantara-Inhalte sichtbar bleiben statt durch Talora-Daten
  aufgefüllt zu werden

**Ergebnis:** Beide Kampagnen können technisch nicht vermischt werden. Die
Engine kennt keine alte Erzählsonderregel mehr und das leere Kantara-Gerüst ist
typisiert, validierbar und speicherbar.

### Phase 2 — Kampf-, Ausrüstungs- und Leserätsel-Fundament

**Status: abgeschlossen am 9. September 2026.** Die Regelmodule, gespeicherten
Kampfzustände, Ausrüstungs- und Registeroberflächen sowie alle fünf generischen
Leserätselarten sind umgesetzt und durch Logik-, Komponenten- und
Browserprüfungen abgesichert. Das erste Kantara-Paarungsrätsel ist in der
Sortierhalle spielbar; die grosse Inhaltsbefüllung beginnt bewusst erst mit
Phase 3.

- `damage.ts` mit sichtbarer Trefferrechnung und Tests für Schwächen,
  Widerstände, Immunitäten, Panzerung, Elementaranteile und gespeicherte
  Waffenmodi umsetzen
- zwei Ausrüstungsplätze, Vergleichsansicht und Wechsel ausserhalb des Kampfes
  umsetzen; umstellbare Waffen dürfen nur an einem Rastplatz geändert werden
- Zustandstabelle, Zustandsketten, Gegenmittel und gegnerische Zugarten
  `charge`, `shield` und `heal` umsetzen
- Waffenkunst samt Abklingzeit und gespeicherten Zuständen umsetzen
- Registeransicht und die kostenlose Aktion **Beobachten** umsetzen
- die fünf Rätselarten `pairing`, `ordering`, `grid`, `reading` und `weighing`
  als generische, tastatur- und touchbedienbare Komponenten umsetzen
- das bereits eingeführte Prinzip **erst untersuchen, dann handeln** als
  Inhalts- und Oberflächenregel absichern: Vor der ersten Untersuchung bleiben
  Rätsel, Begegnungen, Interaktionen und Richtungen verborgen

**Ergebnis:** Alle neuen Regeln sind mit kleinen Kantara-Testinhalten spielbar,
aber noch nicht an eine grosse Menge unfertiger Raumtexte gekoppelt.

### Phase 3 — Vertikalschnitt: Kesselbrück und Blätterdächer

**Status: abgeschlossen am 10. September 2026.** Der vollständige Weg vom
Kurierhof bis zum Blätterstempel ist mit finalen Orts- und Zustandstexten,
Aufgabenführung, erneuerbaren Werkstoffen, Herstellung, Registerkarten,
Leserätseln und den beiden Wegwächtern auf Desktop und Telefon spielbar.

- alle 7 Orte von Kesselbrück und alle 9 Orte der Blätterdächer mit finalen
  Ersttexten, Wiederbesuchstexten, Figuren und sichtbaren Zustandsänderungen
  umsetzen
- Prolog, Meral, Klick, Brik, Fenn und Ina einführen
- Werkhof, erstes Rezept, erste Rüstung, erste Waffenkunst und die zugehörigen
  Registereinträge in einen vollständigen Spielablauf einbetten
- Aststampfer als ersten Wegwächter und Kronenheber als zweiphasigen Umleiter
  umsetzen; Niederlage, Flucht, Rettung und Rückweg vollständig testen
- Kartenfläche, Rastplätze, Abkürzung und mindestens je ein Rätsel mit
  `pairing`, `reading` und `weighing` umsetzen
- einen E2E-Weg vom neuen Spielstart bis zum ersten Freigabestempel auf Desktop
  und Telefon prüfen

**Ergebnis:** Ein eigenständiger, vorzeigbarer Kantara-Abschnitt beweist die
gesamte Schleife aus Lesen, Untersuchen, Ausrüsten, Rätseln, Kämpfen, Sammeln,
Herstellen und Zurückkehren. Ab hier ist Kantara der Standardstart im
Entwicklungsstand.

### Phase 4 — Die offene erste Hälfte

- Kanaldelta und Sturmwerft mit je 9 Orten sowie die 5 Wechselgänge umsetzen;
  die Welt umfasst danach 39 fertige Orte
- Suri, Bo, Rika und Jaro samt regionalen Handlungsbögen und späteren
  Zustandsvarianten umsetzen
- Schottknacker, Spulenläufer, Deltarad und Wolkenspule integrieren
- `nass` plus Blitz, Aufladung plus Unterbrechung sowie Panzerbruch in Text,
  Register und Kampf jeweils doppelt erklären
- drei Freigabestempel, Prismenöffner und alle regionsübergreifenden
  Abkürzungen umsetzen
- alle sechs Reihenfolgen der drei nahen Regionen in Logik- und E2E-Tests prüfen

**Ergebnis:** Die erste Kampagnenhälfte ist in freier Reihenfolge spielbar und
endet mit dem gleichzeitigen Öffnen der drei grossen Aussenregionen.

### Phase 5 — Die drei grossen Aussenregionen

- Glascaldera (12 Orte), Frostobservatorium (12 Orte) und Laternenmoor
  (11 Orte) vollständig umsetzen; mit den bisherigen Regionen sind damit
  74 Orte spielbar
- Nima, Cem, Eli, Vela, Pavo und Luma mit bewohnten Randzonen, Rastplätzen,
  lokalen Aufgaben und Veränderungen nach dem Regionsfortschritt umsetzen
- Ofenmantel, Wärmewams und Dämmerumhang sowie die regionalen Waffen,
  Werkstoffe, Quellen und Rezepte integrieren
- Glutwalze, Reifjäger und Dunstschwinge als Wegwächter umsetzen
- alle notwendigen Leserätsel und Abkürzungen der drei Regionen einbauen;
  ein Pflichtgegenstand darf nie hinter seiner eigenen Verwendung liegen
- die Zugänge zu Schmelzsammler, Nullgradsammler und Dunstsammler mit sichtbarer
  Ausrüstungswarnung und offenem Rückweg vorbereiten

**Ergebnis:** Die gesamte äussere Welt ist bewohnt und erkundbar. Jede
Pflichtausrüstung kann vor dem zugehörigen Sammler hergestellt werden.

### Phase 6 — Sammler, Enthüllung und Finale

- die drei Sammler mit je drei Phasen, regionaler Zustandskette und
  Rückleitkern als Belohnung umsetzen
- Orens Nachrichten, Wartungsprotokoll, Geständnis und Merals Reaktion so
  verteilen, dass alle sechs Reihenfolgen der Aussenregionen funktionieren
- Annahmehalle, Leitungsschacht, Sortierkern und Leitwarte als vier Orte des
  Zentralwerks umsetzen; die Welt erreicht 78 Orte
- Zentraldisponent Z-0 als vierphasigen Endgegner mit Elementwechsel und
  abschliessendem Leserätsel umsetzen; die Sortierkern-Phase funktioniert
  zunächst als einzelner Sortierverbund und setzt Duos nicht voraus
- Rückleitung, Epilog und veränderte Nachspieltexte in allen Regionen umsetzen
- vollständige Hauptkampagne ohne optionale Gegenstände als E2E-Weg prüfen

**Ergebnis:** Die neue Kampagne besitzt einen vollständigen Anfang, Mittelteil,
Schluss und ein dauerhaft begehbares Nachspiel.

### Phase 7 — Optionale Welt, Sammlungen und Zielbestand

- sieben Resonanzsplitter, acht alte Liefermarken und die vollständige
  Registersammlung umsetzen
- Briks optionale Rezepte und das elementwechselnde Wechselwerkzeug umsetzen
- Nebenaufträge, optionale Gegner, Truhen, Werkzeuge und Figurenbegegnungen bis
  zum vereinbarten Zielbestand ergänzen
- die Rätsel auf insgesamt 18 bringen, davon mindestens vier `reading`-Rätsel;
  für jedes Rätsel drei Hinweisstufen und eine erneut lesbare Textquelle liefern
- alle 85 Gegenstände, 110 Interaktionen, 39 Gegnertypen und 48 Begegnungen mit
  Quelle, Zweck und optionalem Status im Validator prüfen

**Ergebnis:** Erkundung und Wiederbesuche lohnen sich, ohne dass Sammlung oder
Nebenaufträge für den Kampagnenabschluss nötig sind.

### Phase 8 — Duo-Begegnungen mit Entscheidungstor

- die in Phase 1 vorgesehene Kämpferliste in Oberfläche und Kampflogik für
  höchstens zwei Gegner aktivieren
- Zielwechsel, zwei untereinander angekündigte Züge und die `sweep`-Waffenkunst
  umsetzen
- zunächst zwei repräsentative Duos in Wechselgängen und Sortierkern mit
  Kindern erproben
- bei Übernahme die einzelne Sortierverbund-Phase von Z-0 in zwei Sortierläufer
  teilen; bei Streichung bleibt das bereits geprüfte Finale unverändert
- nur bei guter Verständlichkeit auf höchstens acht Duo-Begegnungen erweitern;
  andernfalls bleiben diese Begegnungen einzelne Gegner und die Kampagne bleibt
  vollständig

**Ergebnis:** Duos werden aufgrund beobachteter Lesbarkeit übernommen oder
bewusst gestrichen, ohne Datenmigration und ohne Lücke in der Haupthandlung.

### Phase 9 — Vollabgleich, Barriereprüfung und Erprobung

- Weltvalidator, Fortschrittssimulation und Balance über alle 48 Begegnungen
  mit je 1000 Zufallszuständen ausführen
- alle freien Regionsreihenfolgen, alle Wegwächter-Niederlagen und einen Lauf
  ohne optionale Sammlung über die Oberfläche prüfen
- Desktop, Telefon, grösste Schrift, hoher Kontrast, reduzierte Bewegung,
  Tastaturbedienung sowie einen Offline-Neustart in der zweiten Hälfte prüfen
- alle Texte auf Deutschschweizer Standardsprache, Namenskonsistenz,
  Wörterhilfen, maximale Absatzlänge und verbliebene Talora-Bezüge prüfen
- `README.md` und Inhaltszahlen nachführen sowie einen neuen, ausschliesslich
  auf Kantara bezogenen `PLAYTEST_GUIDE.md` erstellen
- Erprobung mit Kindern nach dem neu erstellten Kantara-Leitfaden; dabei
  insbesondere prüfen:
  Wird ein neuer Ort vor dem Weitergehen untersucht? Wird die Trefferrechnung
  gelesen? Wird die Rüstung vor einer Gefahr gewechselt? Wird das Register
  freiwillig benutzt? Sind zwei Gegner gleichzeitig verständlich?

**Ergebnis:** Erst nach diesem Durchgang wird Kantara als veröffentlichungsreif
markiert.

---

## 12. Teststrategie

Ergänzend zu den bestehenden Tests:

**Logiktests**

- `damage.test.ts` — Tabellentest über alle Kombinationen aus 12 Waffen,
  11 Ausrüstungen und den Schwächen/Widerständen; jede Zeile prüft Zahl **und**
  Erklärsatz
- `statusEffects.test.ts` — jede Zustandsdauer, jede Kette (`nass` + Blitz),
  jedes Gegenmittel
- `weaponSkill.test.ts` — Abklingzeit, Unterbrechung eines angekündigten Zuges,
  Speicherung über Export/Import
- `weaponMode.test.ts` — nur erlaubte Elemente, Wechsel nur am Rastplatz und
  Speicherung über Export/Import
- `guards.test.ts` — jede wegsperrende Verbindung: gesperrt vorher, offen
  nachher, Rückweg jederzeit offen
- `campaignBoundary.test.ts` — fehlende oder fremde `campaignId` wird niemals
  als Kantara geladen oder über den vorhandenen Spielstand geschrieben
- `migration.test.ts` — ältere Kantara-Version mit laufendem Kampf,
  Boss-Rückwegstatus und manipulierten Feldern
- `bestiary.test.ts` — Beobachten kostet keinen Gegnerzug; Schwächen erst danach
  sichtbar
- `explorationGate.test.ts` — beim ersten Besuch nur Untersuchen; danach
  Richtungen und Aktionen; beim Wiederbesuch kein zweites Pflicht-Untersuchen

**Komponententests**

- Kampfansicht bei 320 px mit fünf Aktionen und grosser Schrift
- Ausrüstungsdialog: Vergleichswerte, Fokusführung, gesperrte Wechsel im Kampf
- Register- und Sammlungsansicht mit leerem und vollem Stand
- neuer Ort vor und nach dem Untersuchen, einschliesslich Fokusführung und
  verborgener Rätselbedienung

**End-to-End**

- vollständige Kantara-Kampagne in allen gültigen Reihenfolgen beider
  Regionsgruppen
- ein Durchlauf, der jede wegsperrende Begegnung zuerst verliert und danach
  gewinnt
- ein Durchlauf ohne jede optionale Sammlung — muss gewinnbar sein
- Neuladen in jeder Phase von Z-0 und vor dem abschliessenden Leserätsel
- Importversuch eines alten oder fremden Kampagnenstands ohne Datenverlust

---

## 13. Abnahmekriterien

1. Typprüfung, Produktionsbuild, alle Logik-, Komponenten- und Browsertests grün.
2. Weltvalidator meldet für die vollständige Welt keinen Fehler.
3. Balance-Simulation: alle 48 Begegnungen mit je 1000 Zufallszuständen
   gewinnbar mit der jeweils vorher erreichbaren Ausrüstung.
4. Jede wegsperrende Begegnung ist mit der bis dahin erreichbaren
   Pflichtausrüstung und dem erneuerbaren Grundproviant, aber ohne weitere
   Verbrauchsgegenstände, gewinnbar.
5. Die Kampagne ist ohne einen einzigen optionalen Gegenstand abschliessbar.
6. Jede Schadensart und jede Schutzwirkung wird vor ihrem ersten Pflichteinsatz
   in einem Ortstext und im Register erklärt.
7. Kein Bildschirm scrollt bei 320 px waagrecht, auch nicht mit grösster Schrift
   und einer Duo-Begegnung.
8. Ein alter oder fremder Kampagnenstand wird klar erkannt, nie als Kantara
   geladen und ohne Bestätigung weder verändert noch gelöscht.
9. Kein Text nennt eine Farbe als einzige Unterscheidung.
10. Export und Import funktionieren nach jedem Schritt der Kampagne.
11. An jedem erstmals besuchten Ort sind bis zum Untersuchen alle Richtungen,
    Rätsel, Begegnungen und Interaktionen verborgen; bei Wiederbesuchen sind sie
    sofort verfügbar.

---

## 14. Risiken

| Risiko | Gegenmassnahme |
| --- | --- |
| **Regelüberlastung** — 8-Jährige verlieren den Überblick über sechs Schadensarten | höchstens drei neue Begriffe pro Region; Register als Nachschlagewerk; Trefferrechnung als Satz; Pflichtketten nur bei den drei Sammlern und erst nach doppelter Erklärung |
| **Textmenge pro Runde** wächst durch Duos und Rechnung über das Erträgliche | Duos auf zwei Gegner und auf die zweite Hälfte begrenzt; Phase 8 besitzt ein Entscheidungstor; Rechnung als *ein* Satz, nicht als Tabelle |
| **Sackgassen** durch wegsperrende Gegner | vier Validatorregeln plus Simulation ohne Vorräte; Flucht immer möglich |
| **Ausrüstungspflicht frustriert** — Kind erreicht einen Sammler ohne passenden Schutz | `gearWarning`, Rezept und Materialquelle liegen vor dem Gefahrenweg; garantierter Rückzug; Hinweisstufe 3 nennt den vollständigen Herstellungsweg |
| **Alte Erzählreste gelangen nach Kantara** | eigene `campaignId`, eigenes Inhaltsmodul, keine Wiederverwendung narrativer IDs und ein Textaudit auf Talora-Namen in Phase 9 |
| **Der vollständige Austausch destabilisiert die App** | generische Engine zuerst entkoppeln; Talora als Regressionstest behalten, bis der Kantara-Vertikalschnitt die Kernschleife vollständig abdeckt |
| **Inhaltsmenge** — 78 neue Orte mit Erst-, Wiederbesuchs- und Zustandstexten | Phase 0 legt Inventar und Abhängigkeiten fest; Inhalte regionsweise mit finalen Texten produzieren; keine ungeprüften Kurztext-Platzhalter in spätere Phasen verschieben |
| **Alte Spielstände werden fälschlich übernommen** | Kampagnenkennung zwingend validieren; alten Stand nicht verändern; neuer Kantara-Start ist eine bewusste Benutzeraktion |
| **Speicherwachstum** durch Register und Sammlungen | nur IDs speichern, keine abgeleiteten Daten; `JOURNAL_LIMIT` bleibt |

---

## 15. Bewusst nicht in dieser Iteration

- Erfahrungspunkte, Stufenaufstiege, Fertigkeitsbäume — sie verlagern das Spiel
  von Lesen zu Verwalten
- Zufällig erzeugte Gegenstände oder Orte
- Ausdauer- oder Manaleisten
- Tageszeit, Wetter, Hunger
- Mehrspieler, Konten, Online-Ranglisten
- Ton und Sprachausgabe (der wirkungslose Schalter wurde in Iteration 1 entfernt)
- Gegnerinitiative oder Geschwindigkeitswerte — der Wechsel bleibt strikt
  abwechselnd
