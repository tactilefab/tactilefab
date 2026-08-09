# TactileFab Studio

**Punktskriftsöversättning är bara första steget. Det här verktyget skapar de
faktiska produktionsfilerna.**

TactileFab Studio körs **helt i webbläsaren**: skriv skylttexten → korrekt
punktskrift via liblouis → skalriktig geometri i millimeter → export som SVG
och DXF, redo för CNC-fräs, rotationsgravyr, laser och raster braille. Ingen
server, inget konto, ingen uppladdning — inget lämnar din dator.

*English version: [README.md](README.md).*

**Status:** beta. Punktskriftsgeometrin och textkonturerna är exakta och
korrekthetsspärrarna fungerar; verkstadsvalidering (borrkalibrering, producerade
provskyltar) återstår. Betrakta inte utdata som standardcertifierad före det.

## Funktioner

- **Översättning:** svensk oavkortad (`sv-g0` — Punktskriftsnämndens officiella
  tabell med siffertecken och bokstavstecken inbyggt), engelsk UEB grade 2
  (kontrakterad — det ADA kräver), UEB grade 1, eller **klistra in färdig
  punktskrift** från er egen verifierade översättning (alla språk).
- **Måttstandarder som förval:** Svensk (MTM / SS-ISO 17049) och ADA 703.3, med
  källhänvisade intervall och varningar utanför vald standard.
- **Taktil text som vektorkonturer** med exakt versalhöjd (ur typsnittets
  metrik), satt i Atkinson Hyperlegible (Braille Institute of America, OFL).
- **Skyltstorlek som beställningen:** auto eller fast mått (t.ex. 100 × 50 mm) —
  ryms inte innehållet blockeras exporten med besked om vad som krävs.
  Hörnradie och monteringshål ingår i båda filformaten.
- **Export:** mm-äkta SVG och minimal DXF R12 (lager BRAILLE, PLATE, MOUNT;
  text i DXF kommer senare).
- **Exportspärr:** kända fel blockerar export tills de åtgärdas, eller tills
  användaren uttryckligen bockar i "exportera trots fel".
- Gränssnitt på svenska och engelska.

## Köra

```bash
python3 -m http.server 8641 --directory .
```

Öppna sedan <http://localhost:8641>. Kräver HTTP (inte `file://`) eftersom
tabellfilerna hämtas vid start.

## Kända begränsningar

- Text i DXF:en saknas än så länge (SVG:n har kompletta konturer).
- Punkthöjden är standardiserad (SS-ISO 17049: 0,3–0,7 mm; ADA: 0,64–0,94 mm)
  men är ett Z-mått som 2D-filer inte kan uttrycka — verkstaden uppnår den via
  borr-/fräsdjup och verifierar med mätning.
- ADA:s detaljregler för minsta teckenmellanrum kontrolleras inte ännu.

## Om

TactileFab utvecklas och används i produktion av
[Lindströms Skylt](https://www.skyltar.org/), som tillverkar
[taktila skyltar](https://www.skyltar.org/taktila-skyltar/) i Linköping.
Verktyget finns för att vi själva behövde det — varje funktion motsvarar ett
verkligt produktionssteg i en verklig skyltverkstad.

## Licens

MIT för TactileFab-koden — se [LICENSE](LICENSE). Bundlade tredjepartsdelar
(liblouis LGPL-2.1+, opentype.js MIT, Atkinson Hyperlegible OFL-1.1) listas i
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
