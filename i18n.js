/* i18n.js – ui strings for TactileFab Studio (sv/en).
 * Static labels use data-i18n attributes in index.html; dynamic messages are
 * produced via t(). Language defaults to the browser locale, is user-switchable
 * and persisted in localStorage.
 */
"use strict";

const STRINGS = {
  sv: {
    tag: "BETA",
    tagline: "Öppen källkod för taktila skyltar — från text till CNC-färdig SVG och DXF.",
    signtextLabel: "Text på skylten (en rad per skyltrad)",
    tableLabel: "Översättning",
    tableOptSv: "Svensk – oavkortad (sv-g0, Punktskriftsnämnden)",
    tableOptEnG2: "Engelsk – UEB grade 2, kontrakterad (ADA)",
    tableOptEnG1: "Engelsk – UEB grade 1, okontrakterad",
    tableOptPaste: "Klistra in färdig punktskrift (unicode)",
    brltextLabel: "Punktskrift (en rad per skyltrad, från er verifierade översättning)",
    lowercaseLabel: "Gemener i punktskriften (undviker versaltecken)",
    showtextLabel: "Visa taktil text (versaler)",
    boldLabel: "Fet stil (taktil text)",
    plateHeader: "Skylt",
    sizemodeLabel: "Storlek",
    sizeAuto: "Auto – efter innehåll",
    sizeFixed: "Fast (beställningsmått)",
    plateWHLabel: "Bredd × höjd (mm)",
    cornerRLabel: "Hörnradie (mm)",
    holesLabel: "Monteringshål",
    holesNone: "Inga",
    holes2: "2 st – vänster/höger",
    holes4: "4 st – hörnen",
    holeDiaLabel: "Håldiameter (mm)",
    holeEdgeLabel: "Hålens kantavstånd, c/c (mm)",
    geoHeader: "Geometri (mm)",
    standardLabel: "Måttstandard",
    stdOptSv: "Svensk – MTM / SS-ISO 17049",
    stdOptAda: "ADA 703.3 (USA)",
    applyStd: "Använd standardens typvärden",
    dotDiaLabel: "Punktdiameter",
    dotCCLabel: "Punktavstånd i cell, c/c",
    cellCCLabel: "Cellavstånd, c/c",
    lineCCLabel: "Radavstånd punktskrift, c/c",
    drillDiaLabel: "Borrdiameter i DXF",
    drillHint: "kalibreras i verkstad",
    capHeightLabel: "Versalhöjd, taktil text",
    letterSpacingLabel: "Teckenmellanrum, tillägg",
    gapLabel: "Avstånd text → punktskrift",
    padLabel: "Marginal (plattkant)",
    alignLabel: "Justering",
    alignLeft: "Vänster",
    alignCenter: "Centrerad",
    overrideLabel: "Exportera trots fel (jag tar ansvar för resultatet)",
    dlSvg: "Ladda ner SVG",
    dlDxf: "Ladda ner DXF",
    emptyPrompt: "Skriv text ovan.",
    thText: "Text",
    thBraille: "Punktskrift",
    statusLoading: "Laddar punktskriftsmotorn …",
    statusReady: () => "Allt körs lokalt i webbläsaren — din text lämnar aldrig datorn.",
    initError: (m) => "Fel vid initiering: " + m,
    renderError: (m) => "Renderingsfel: " + m,
    errNotBraille: (ch, hex) => `Tecknet "${ch}" (U+${hex}) är inte punktskrift`,
    err8dot: (n) => `Cell ${n} använder 8-punktsskrift (punkt 7/8) – hör inte hemma på skylt`,
    errLineCount: (a, b) => `Antal rader skiljer: ${a} textrader men ${b} punktskriftsrader`,
    errMissingBraille: (raw) => `Rad "${raw}": punktskrift saknas`,
    errRow: (raw, msg) => `Rad "${raw}": ${msg}`,
    errTranslateFail: (raw, m) => `Rad "${raw}": översättningen misslyckades – ${m}`,
    errNoFit: (nw, nh, W, H) => `Innehållet ryms inte på skylten: kräver ca ${nw} × ${nh} mm inkl. marginaler, skylten är ${W} × ${H} mm — minska versalhöjd/marginaler eller öka skylten`,
    warnRange: (k, v, min, max, std) => `${k}: ${v} mm ligger utanför intervallet ${min}–${max} mm (${std})`,
    warnHoleOverlap: "Monteringshål överlappar text/punktskrift – flytta hålen eller ändra layouten",
    warnCharGap: (gap) => `Minsta lucka mellan taktila tecken är ca ${gap} mm – ADA 703.2.7 kräver minst 3,2 mm; öka teckenmellanrummet`,
    signSummary: (W, H, n) => `Skylt: ${W} × ${H} mm · ${n} punkter (borrhål)`,
    cellsWidth: (n, mm) => `${n} celler, ${mm} mm`,
    stdLabelSv: "svensk standard",
    stdLabelAda: "ADA 703.3",
    stdNoteSv: "Punkthöjd på skylt enligt SS-ISO 17049: 0,3–0,7 mm (styr fräsdjup/kulhöjd). Enstaka tecken som våningsnummer får vara 40–70 mm höga (ISO 21542).",
    stdNoteAda: "Punkthöjd enligt ADA 703.3: 0,64–0,94 mm. ADA kräver kontrakterad punktskrift (grade 2) – välj engelsk UEB grade 2 ovan.",
    hintsSv: { dotDia: "1,0–1,7 (SS-ISO 17049)", dotCC: "ca 2,5 (MTM)", cellCC: "ca 6 (MTM)", lineCC: "ca 10 (MTM)", capHeight: "15–40 (ISO 21542)", gap: "–", letterSpacing: "–" },
    hintsAda: { dotDia: "1,5–1,6", dotCC: "2,29–2,54", cellCC: "6,12–7,62", lineCC: "10,03–10,16", capHeight: "15,9–50,8", gap: "min 9,5", letterSpacing: "lucka ≥ 3,2 (703.2.7)" },
    noteHtml: `Punktskriftsgeometrin är exakt i mm (SVG/DXF). Den taktila texten
      exporteras som vektorkonturer i SVG:n med exakt versalhöjd, satt i Atkinson
      Hyperlegible (Braille Institute of America, OFL-licens). Text i DXF kommer
      senare — DXF:en innehåller punktskrift, plattkontur och monteringshål.<br>
      Källor: svenska cellmått enligt
      <a href="https://www.mtm.se/punktskriftsnamnden/punktskrift/punktskriftcellens-matt-i-sverige/" target="_blank" rel="noopener">MTM/Punktskriftsnämnden</a> och
      <a href="https://www.mtm.se/punktskriftsnamnden/skrivregler-och-riktlinjer/skyltar-och-kartor-i-offentlig-miljo/" target="_blank" rel="noopener">MTM: Skyltar och kartor i offentlig miljö</a>
      (punktdiameter och punkthöjd för skylt: SS-ISO 17049:2017; relieftextens
      versalhöjd: ISO 21542). Amerikanska mått enligt
      <a href="https://www.access-board.gov/ada/guides/chapter-7-signs/" target="_blank" rel="noopener">ADA 703.2/703.3</a>.<br>
      Punktskriftsmotor: liblouis 3.38.0 under LGPL-2.1+ —
      <a href="vendor/liblouis/COPYING.LESSER" target="_blank" rel="noopener">licens</a> och
      <a href="third_party_sources/liblouis-3.38.0.tar.gz" rel="noopener">fullständig källkod</a>.<br>
      TactileFab utvecklas och används i produktion av
      <a href="https://www.skyltar.org/" target="_blank" rel="noopener">Lindströms Skylt</a>,
      som tillverkar <a href="https://www.skyltar.org/taktila-skyltar/" target="_blank" rel="noopener">taktila skyltar</a>
      i Linköping. Öppen källkod (MIT) — kod och felrapporter på
      <a href="https://github.com/tactilefab/tactilefab" target="_blank" rel="noopener">GitHub</a>.`,
  },
  en: {
    tag: "BETA",
    tagline: "Open-source production tool for tactile and braille signage — from text to CNC-ready SVG and DXF.",
    signtextLabel: "Sign text (one line per sign row)",
    tableLabel: "Translation",
    tableOptSv: "Swedish – uncontracted (sv-g0, Swedish Braille Authority)",
    tableOptEnG2: "English – UEB grade 2, contracted (ADA)",
    tableOptEnG1: "English – UEB grade 1, uncontracted",
    tableOptPaste: "Paste verified braille (unicode)",
    brltextLabel: "Braille (one line per sign row, from your verified translation)",
    lowercaseLabel: "Lowercase for braille (avoids capital indicators)",
    showtextLabel: "Show tactile text (uppercase)",
    boldLabel: "Bold tactile text",
    plateHeader: "Plate",
    sizemodeLabel: "Size",
    sizeAuto: "Auto – fit to content",
    sizeFixed: "Fixed (as ordered)",
    plateWHLabel: "Width × height (mm)",
    cornerRLabel: "Corner radius (mm)",
    holesLabel: "Mounting holes",
    holesNone: "None",
    holes2: "2 – left/right",
    holes4: "4 – corners",
    holeDiaLabel: "Hole diameter (mm)",
    holeEdgeLabel: "Hole edge distance, c/c (mm)",
    geoHeader: "Geometry (mm)",
    standardLabel: "Dimensional standard",
    stdOptSv: "Swedish – MTM / SS-ISO 17049",
    stdOptAda: "ADA 703.3 (USA)",
    applyStd: "Apply standard's typical values",
    dotDiaLabel: "Dot diameter",
    dotCCLabel: "Dot spacing within cell, c/c",
    cellCCLabel: "Cell spacing, c/c",
    lineCCLabel: "Braille line spacing, c/c",
    drillDiaLabel: "Drill diameter in DXF",
    drillHint: "calibrate in the shop",
    capHeightLabel: "Cap height, tactile text",
    letterSpacingLabel: "Extra letter spacing",
    gapLabel: "Text → braille separation",
    padLabel: "Margin (plate edge)",
    alignLabel: "Alignment",
    alignLeft: "Left",
    alignCenter: "Centered",
    overrideLabel: "Export despite errors (I take responsibility)",
    dlSvg: "Download SVG",
    dlDxf: "Download DXF",
    emptyPrompt: "Type sign text above.",
    thText: "Text",
    thBraille: "Braille",
    statusLoading: "Loading the braille engine …",
    statusReady: () => "Everything runs locally in your browser — your text never leaves your device.",
    initError: (m) => "Initialization error: " + m,
    renderError: (m) => "Render error: " + m,
    errNotBraille: (ch, hex) => `Character "${ch}" (U+${hex}) is not braille`,
    err8dot: (n) => `Cell ${n} uses 8-dot braille (dot 7/8) – does not belong on signage`,
    errLineCount: (a, b) => `Line count mismatch: ${a} text lines but ${b} braille lines`,
    errMissingBraille: (raw) => `Line "${raw}": braille missing`,
    errRow: (raw, msg) => `Line "${raw}": ${msg}`,
    errTranslateFail: (raw, m) => `Line "${raw}": translation failed – ${m}`,
    errNoFit: (nw, nh, W, H) => `Content does not fit the plate: needs approx. ${nw} × ${nh} mm incl. margins, plate is ${W} × ${H} mm — reduce cap height/margins or enlarge the plate`,
    warnRange: (k, v, min, max, std) => `${k}: ${v} mm is outside the ${min}–${max} mm range (${std})`,
    warnHoleOverlap: "Mounting hole overlaps text/braille – move the holes or adjust the layout",
    warnCharGap: (gap) => `Smallest gap between tactile characters is approx. ${gap} mm – ADA 703.2.7 requires at least 3.2 mm; increase letter spacing`,
    signSummary: (W, H, n) => `Plate: ${W} × ${H} mm · ${n} dots (drill holes)`,
    cellsWidth: (n, mm) => `${n} cells, ${mm} mm`,
    stdLabelSv: "Swedish standard",
    stdLabelAda: "ADA 703.3",
    stdNoteSv: "Dot height on signage per SS-ISO 17049: 0.3–0.7 mm (governs milling depth/sphere height). Single characters such as floor numbers may be 40–70 mm tall (ISO 21542).",
    stdNoteAda: "Dot height per ADA 703.3: 0.64–0.94 mm. ADA requires contracted braille (grade 2) – choose English UEB grade 2 above.",
    hintsSv: { dotDia: "1.0–1.7 (SS-ISO 17049)", dotCC: "approx. 2.5 (MTM)", cellCC: "approx. 6 (MTM)", lineCC: "approx. 10 (MTM)", capHeight: "15–40 (ISO 21542)", gap: "–", letterSpacing: "–" },
    hintsAda: { dotDia: "1.5–1.6", dotCC: "2.29–2.54", cellCC: "6.12–7.62", lineCC: "10.03–10.16", capHeight: "15.9–50.8", gap: "min 9.5", letterSpacing: "gap ≥ 3.2 (703.2.7)" },
    noteHtml: `Braille geometry is exact in mm (SVG/DXF). Tactile text is exported
      as vector outlines in the SVG at exact cap height, set in Atkinson
      Hyperlegible (Braille Institute of America, OFL license). Text in DXF is
      planned — the DXF carries braille, plate contour and mounting holes.<br>
      Sources: Swedish cell dimensions per
      <a href="https://www.mtm.se/punktskriftsnamnden/punktskrift/punktskriftcellens-matt-i-sverige/" target="_blank" rel="noopener">MTM/the Swedish Braille Authority</a> and
      <a href="https://www.mtm.se/punktskriftsnamnden/skrivregler-och-riktlinjer/skyltar-och-kartor-i-offentlig-miljo/" target="_blank" rel="noopener">MTM: Signs and maps in public environments</a>
      (sign dot diameter and height: SS-ISO 17049:2017; tactile character height:
      ISO 21542). US dimensions per
      <a href="https://www.access-board.gov/ada/guides/chapter-7-signs/" target="_blank" rel="noopener">ADA 703.2/703.3</a>.<br>
      Braille engine: liblouis 3.38.0 under LGPL-2.1-or-later —
      <a href="vendor/liblouis/COPYING.LESSER" target="_blank" rel="noopener">license</a> and
      <a href="third_party_sources/liblouis-3.38.0.tar.gz" rel="noopener">corresponding source</a>.<br>
      TactileFab is developed and used in production by
      <a href="https://www.skyltar.org/" target="_blank" rel="noopener">Lindströms Skylt</a>,
      a Swedish manufacturer of <a href="https://www.skyltar.org/taktila-skyltar/" target="_blank" rel="noopener">tactile signs</a>.
      Open source (MIT) — code and issue tracker on
      <a href="https://github.com/tactilefab/tactilefab" target="_blank" rel="noopener">GitHub</a>.`,
  },
};

let LANG = (() => {
  const saved = localStorage.getItem("tactilefab-lang");
  if (saved === "sv" || saved === "en") return saved;
  return (navigator.language || "en").toLowerCase().startsWith("sv") ? "sv" : "en";
})();

function t(key, ...args) {
  const v = STRINGS[LANG][key];
  return typeof v === "function" ? v(...args) : v;
}

function setLang(lang) {
  LANG = lang;
  localStorage.setItem("tactilefab-lang", lang);
  document.documentElement.lang = lang;
  applyStaticStrings();
}

function applyStaticStrings() {
  for (const el of document.querySelectorAll("[data-i18n]")) {
    el.textContent = t(el.getAttribute("data-i18n"));
  }
  const note = document.getElementById("note");
  if (note) note.innerHTML = t("noteHtml");
  const langSel = document.getElementById("lang");
  if (langSel) langSel.value = LANG;
}
