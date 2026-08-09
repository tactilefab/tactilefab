/* TactileFab Studio – text → braille (liblouis 3.38, own WASM build, wrapper in
 * ll.js) → true-to-scale SVG/DXF production files for CNC, engraving and raster
 * braille. UI strings live in i18n.js.
 */
"use strict";

const TABLES = {
  "sv":    "tables/unicode.dis,tables/sv-g0.utb",
  "en-g2": "tables/unicode.dis,tables/en-ueb-g2.ctb",
  "en-g1": "tables/unicode.dis,tables/en-ueb-g1.ctb",
  // "paste" = user-supplied braille, no table involved
};
const ENTRY_FILES = ["unicode.dis", "sv-g0.utb", "en-ueb-g2.ctb", "en-ueb-g1.ctb"];
const TABLE_URL = "vendor/liblouis/tables/";

/* Dimensional standards.
 * ADA 703.3 publishes hard ranges (warn when outside). The Swedish cell values
 * are MTM's approximate figures (2.5 / 6 / 10); sign dot diameter per
 * SS-ISO 17049:2017 (1.0–1.7 mm); tactile character height per ISO 21542
 * (15–40 mm, single characters 40–70 mm). Dot height (Z) never appears in the
 * 2D output but governs milling depth/sphere choice: SS-ISO 17049 0.3–0.7 mm,
 * ADA 0.64–0.94 mm. Hint/note/label strings are in i18n.js per language.
 */
const STANDARDS = {
  sv: {
    labelKey: "stdLabelSv", hintsKey: "hintsSv", noteKey: "stdNoteSv",
    values: { dotDia: 1.0, dotCC: 2.5, cellCC: 6.0, lineCC: 10.0, capHeight: 25, gap: 10 },
    ranges: { dotDia: [1.0, 1.7], capHeight: [15, 40] },
  },
  ada: {
    labelKey: "stdLabelAda", hintsKey: "hintsAda", noteKey: "stdNoteAda",
    values: { dotDia: 1.5, dotCC: 2.34, cellCC: 6.2, lineCC: 10.1, capHeight: 25, gap: 10 },
    ranges: { dotDia: [1.5, 1.6], dotCC: [2.29, 2.54], cellCC: [6.12, 7.62],
              lineCC: [10.03, 10.16], capHeight: [15.9, 50.8], gap: [9.5, Infinity] },
  },
};

// Braille dot number -> (column, row) within the cell
const DOT_POS = {1:[0,0], 2:[0,1], 3:[0,2], 4:[1,0], 5:[1,1], 6:[1,2], 7:[0,3], 8:[1,3]};

const $ = (id) => document.getElementById(id);
const statusEl = $("status");
let LL = null;                              // liblouis api from ll.js
let FONTS = { regular: null, bold: null };  // opentype.js fonts
let lastExport = null;

/* ---------- Fonts (Atkinson Hyperlegible, OFL) ---------- */

async function loadFont(url) {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error("Could not fetch font: " + url);
  return opentype.parse(await resp.arrayBuffer());
}

// Cap height in font units (OS/2 sCapHeight, else the H glyph's bbox)
function fontCapUnits(font) {
  const os2 = font.tables.os2;
  if (os2 && os2.sCapHeight) return os2.sCapHeight;
  const g = font.charToGlyph("H");
  g.getPath(0, 0, font.unitsPerEm);
  return g.yMax || Math.round(font.unitsPerEm * 0.7);
}

/* ---------- Translation and dot geometry ---------- */

function translateLine(line, tableKey) {
  return LL.translate(TABLES[tableKey], line);
}

// Unicode braille -> cells with dot numbers. Errors (export-blocking) are kept
// apart from advisory warnings.
function brailleToDots(brl) {
  const cells = [];
  const errors = [];
  let i = 0;
  for (const ch of brl) {
    const cp = ch.codePointAt(0);
    if (cp === 0x20) { // plain space = blank cell
      cells.push({ cell: i, dots: [] });
      i++; continue;
    }
    if (cp < 0x2800 || cp > 0x28FF) {
      errors.push(t("errNotBraille", ch, cp.toString(16)));
      i++; continue;
    }
    const bits = cp - 0x2800;
    const dots = [];
    for (let d = 1; d <= 8; d++) if (bits & (1 << (d - 1))) dots.push(d);
    if (dots.some((d) => d > 6)) errors.push(t("err8dot", i + 1));
    cells.push({ cell: i, dots });
    i++;
  }
  return { cells, count: i, errors };
}

function readParams() {
  const p = {};
  for (const id of ["dotDia","dotCC","cellCC","lineCC","drillDia","capHeight","gap","pad",
                    "plateW","plateH","cornerR","holeDia","holeEdge"]) {
    p[id] = parseFloat($(id).value) || 0;
  }
  p.sizemode = $("sizemode").value;
  p.holes = $("holes").value;
  p.align = $("align").value;
  p.standard = $("standard").value;
  p.tableKey = $("table").value;
  p.lowercase = $("lowercase").checked;
  p.showText = $("showtext").checked;
  p.bold = $("bold").checked;
  return p;
}

function checkRanges(p) {
  const std = STANDARDS[p.standard];
  const warnings = [];
  for (const [key, [min, max]] of Object.entries(std.ranges)) {
    if (p[key] === undefined) continue;
    if (p[key] < min - 1e-9 || p[key] > max + 1e-9) {
      warnings.push(t("warnRange", key, p[key], min, max === Infinity ? "∞" : max, t(std.labelKey)));
    }
  }
  return warnings;
}

/* ---------- Layout & SVG ---------- */

function brailleLineWidth(nCells, p) {
  if (nCells === 0) return 0;
  return (nCells - 1) * p.cellCC + p.dotCC + p.dotDia;
}

function render() {
  const p = readParams();
  const rawLines = $("signtext").value.split("\n").map((s) => s.trim()).filter(Boolean);
  const readback = $("readback");
  const preview = $("preview");
  $("brlwrap").style.display = p.tableKey === "paste" ? "" : "none";
  $("platewrap").style.display = p.sizemode === "fixed" ? "" : "none";
  if (rawLines.length === 0) {
    preview.innerHTML = ""; readback.innerHTML = `<p class='dim'>${t("emptyPrompt")}</p>`;
    lastExport = null; setExportEnabled(false); return;
  }

  const warnings = checkRanges(p); // advisory – never blocks
  const errors = [];               // blocks export
  const lines = [];

  if (p.tableKey === "paste") {
    // Verified braille pasted by the user: one braille line per text line
    const brlLines = $("brltext").value.split("\n").map((s) => s.trim());
    while (brlLines.length && brlLines[brlLines.length - 1] === "") brlLines.pop();
    if (brlLines.length !== rawLines.length) {
      errors.push(t("errLineCount", rawLines.length, brlLines.length));
    }
    rawLines.forEach((raw, i) => {
      const brl = brlLines[i] || "";
      if (brl === "") errors.push(t("errMissingBraille", raw));
      const dots = brailleToDots(brl);
      errors.push(...dots.errors.map((w) => t("errRow", raw, w)));
      lines.push({ raw, display: raw.toUpperCase(), brl, dots, err: null });
    });
  } else {
    for (const raw of rawLines) {
      const display = raw.toUpperCase(); // tactile text is uppercase (ADA 703.2)
      const input = p.lowercase ? raw.toLowerCase() : raw;
      let brl = "", err = null, dots = { cells: [], count: 0, errors: [] };
      try {
        brl = translateLine(input, p.tableKey);
        dots = brailleToDots(brl);
      } catch (e) {
        err = String(e && e.message || e);
      }
      if (err) errors.push(t("errTranslateFail", raw, err));
      errors.push(...dots.errors.map((w) => t("errRow", raw, w)));
      lines.push({ raw, display, brl, dots, err });
    }
  }

  // --- build the SVG in mm coordinates ---
  const NS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(NS, "svg");
  const font = p.bold ? FONTS.bold : FONTS.regular;
  // Em size in mm chosen so the cap height is exactly p.capHeight
  const emMm = p.capHeight * font.unitsPerEm / fontCapUnits(font);
  const textLineGap = p.capHeight * 0.5;

  // Text widths straight from font metrics
  const textWidths = lines.map((line) =>
    p.showText ? font.getAdvanceWidth(line.display, emMm) : 0);

  const brailleWidths = lines.map((l) => brailleLineWidth(l.dots.count, p));
  const contentW = Math.max(...textWidths, ...brailleWidths, 10);
  const textBlockH = p.showText
    ? lines.length * p.capHeight + (lines.length - 1) * textLineGap
    : 0;
  const brailleCellH = 2 * p.dotCC + p.dotDia;
  const brailleBlockH = (lines.length - 1) * p.lineCC + brailleCellH;
  const contentH = textBlockH + (p.showText ? p.gap : 0) + brailleBlockH;

  // Plate size: auto (grow with content) or fixed (as ordered)
  let W, H, contentTop;
  if (p.sizemode === "fixed") {
    W = p.plateW; H = p.plateH;
    const needW = contentW + 2 * p.pad;
    const needH = contentH + 2 * p.pad;
    if (needW > W + 1e-9 || needH > H + 1e-9) {
      errors.push(t("errNoFit", Math.ceil(needW), Math.ceil(needH), W, H));
    }
    contentTop = Math.max((H - contentH) / 2, p.pad); // vertically centered
  } else {
    W = contentW + 2 * p.pad;
    H = contentH + 2 * p.pad;
    contentTop = p.pad;
  }

  svg.setAttribute("xmlns", NS);
  svg.setAttribute("width", W.toFixed(2) + "mm");
  svg.setAttribute("height", H.toFixed(2) + "mm");
  svg.setAttribute("viewBox", `0 0 ${W.toFixed(2)} ${H.toFixed(2)}`);

  const plate = document.createElementNS(NS, "rect");
  plate.setAttribute("x", 0); plate.setAttribute("y", 0);
  plate.setAttribute("width", W.toFixed(2)); plate.setAttribute("height", H.toFixed(2));
  const cornerR = Math.max(0, Math.min(p.cornerR, Math.min(W, H) / 2));
  if (cornerR > 0) { plate.setAttribute("rx", cornerR.toFixed(2)); plate.setAttribute("ry", cornerR.toFixed(2)); }
  plate.setAttribute("fill", "#f8f7f4"); plate.setAttribute("stroke", "#999");
  plate.setAttribute("stroke-width", "0.2");
  svg.appendChild(plate);

  const xFor = (w) => (p.align === "center" ? (W - w) / 2 : p.pad);

  let y = contentTop;
  if (p.showText) {
    lines.forEach((line, i) => {
      // Vector outlines via opentype.js – baseline sits p.capHeight below the row top
      const glyphPath = font.getPath(line.display, xFor(textWidths[i]), y + p.capHeight, emMm);
      const el = document.createElementNS(NS, "path");
      el.setAttribute("d", glyphPath.toPathData(3));
      el.setAttribute("fill", "#1a1a1a");
      el.setAttribute("class", "tactiletext");
      svg.appendChild(el);
      y += p.capHeight + (i < lines.length - 1 ? textLineGap : 0);
    });
    y += p.gap;
  }

  // Braille: y is now the top of the braille block
  const dotR = p.dotDia / 2;
  const dotCenters = [];
  lines.forEach((line, li) => {
    const x0 = xFor(brailleWidths[li]) + dotR;
    const rowTopCenterY = y + dotR + li * p.lineCC;
    for (const cell of line.dots.cells) {
      const cellX = x0 + cell.cell * p.cellCC;
      for (const d of cell.dots) {
        const [col, row] = DOT_POS[d];
        const cx = cellX + col * p.dotCC;
        const cy = rowTopCenterY + row * p.dotCC;
        const c = document.createElementNS(NS, "circle");
        c.setAttribute("cx", cx.toFixed(3));
        c.setAttribute("cy", cy.toFixed(3));
        c.setAttribute("r", dotR.toFixed(3));
        c.setAttribute("fill", "#1a1a1a");
        c.setAttribute("class", "brailledot");
        svg.appendChild(c);
        dotCenters.push({ x: cx, y: cy });
      }
    }
  });

  // Mounting holes (cut/drilled – drawn as outline circles, own DXF layer MOUNT)
  const holes = [];
  if (p.holes === "2") {
    holes.push({ x: p.holeEdge, y: H / 2 }, { x: W - p.holeEdge, y: H / 2 });
  } else if (p.holes === "4") {
    holes.push(
      { x: p.holeEdge, y: p.holeEdge }, { x: W - p.holeEdge, y: p.holeEdge },
      { x: p.holeEdge, y: H - p.holeEdge }, { x: W - p.holeEdge, y: H - p.holeEdge });
  }
  for (const h of holes) {
    const c = document.createElementNS(NS, "circle");
    c.setAttribute("cx", h.x.toFixed(3)); c.setAttribute("cy", h.y.toFixed(3));
    c.setAttribute("r", (p.holeDia / 2).toFixed(3));
    c.setAttribute("fill", "none"); c.setAttribute("stroke", "#1a1a1a");
    c.setAttribute("stroke-width", "0.2"); c.setAttribute("class", "mounthole");
    svg.appendChild(c);
  }
  if (holes.length && lines.length) {
    const xs = [];
    lines.forEach((l, i) => {
      xs.push(xFor(textWidths[i]), xFor(textWidths[i]) + textWidths[i],
              xFor(brailleWidths[i]), xFor(brailleWidths[i]) + brailleWidths[i]);
    });
    const bx1 = Math.min(...xs), bx2 = Math.max(...xs);
    const by1 = contentTop, by2 = contentTop + contentH;
    const hr = p.holeDia / 2;
    if (holes.some((h) => h.x + hr > bx1 && h.x - hr < bx2 && h.y + hr > by1 && h.y - hr < by2)) {
      warnings.push(t("warnHoleOverlap"));
    }
  }

  preview.innerHTML = "";
  preview.appendChild(svg);

  // --- readback ---
  const rows = lines.map((l) => `
    <tr>
      <td>${escapeHtml(l.display)}</td>
      <td class="braille">${escapeHtml(l.brl)}</td>
      <td class="dim">${t("cellsWidth", l.dots.count, brailleLineWidth(l.dots.count, p).toFixed(1))}</td>
    </tr>`).join("");
  const errHtml = errors.length
    ? `<p class="err">⛔ ${errors.map(escapeHtml).join("<br>⛔ ")}</p>` : "";
  const warnHtml = warnings.length
    ? `<p class="warn">⚠ ${warnings.map(escapeHtml).join("<br>⚠ ")}</p>` : "";
  readback.innerHTML = `
    <table>
      <tr><th>${t("thText")}</th><th>${t("thBraille")}</th><th></th></tr>${rows}
    </table>
    <p class="dim">${t("signSummary", W.toFixed(1), H.toFixed(1), dotCenters.length)}</p>
    ${errHtml}${warnHtml}`;

  // --- export gate: errors block unless the user explicitly overrides ---
  $("overriderow").style.display = errors.length ? "" : "none";
  if (!errors.length) $("override").checked = false;
  const blocked = errors.length > 0 && !$("override").checked;

  const svgText = new XMLSerializer().serializeToString(svg);
  const dxfText = makeDxf(dotCenters, W, H, p.drillDia / 2, cornerR, holes, p.holeDia / 2);
  lastExport = blocked ? null : { svgText, dxfText, W, H };
  setExportEnabled(!blocked);

  window.__taktil = { params: p, lines, dotCenters, holes, W, H, errors, warnings, blocked,
    svg: svgText, dxf: dxfText };
}

/* ---------- DXF (minimal R12) ---------- */

function makeDxf(dotCenters, W, H, drillR, cornerR, holes, holeR) {
  const L = [];
  const push = (...vals) => L.push(...vals);
  const line = (x1, y1, x2, y2) => push("0", "LINE", "8", "PLATE",
    "10", x1.toFixed(3), "20", y1.toFixed(3), "30", "0",
    "11", x2.toFixed(3), "21", y2.toFixed(3), "31", "0");
  push("0", "SECTION", "2", "ENTITIES");
  // Plate contour in DXF coordinates (y up). With corner radius: 4 lines + 4 arcs.
  const r = Math.max(0, Math.min(cornerR, Math.min(W, H) / 2));
  if (r > 0.001) {
    line(r, 0, W - r, 0); line(W, r, W, H - r);
    line(W - r, H, r, H); line(0, H - r, 0, r);
    const arcs = [[r, r, 180, 270], [W - r, r, 270, 360], [W - r, H - r, 0, 90], [r, H - r, 90, 180]];
    for (const [cx, cy, a1, a2] of arcs) {
      push("0", "ARC", "8", "PLATE",
        "10", cx.toFixed(3), "20", cy.toFixed(3), "30", "0",
        "40", r.toFixed(3), "50", String(a1), "51", String(a2));
    }
  } else {
    line(0, 0, W, 0); line(W, 0, W, H); line(W, H, 0, H); line(0, H, 0, 0);
  }
  for (const d of dotCenters) {
    push("0", "CIRCLE", "8", "BRAILLE",
      "10", d.x.toFixed(3), "20", (H - d.y).toFixed(3), "30", "0",
      "40", drillR.toFixed(3));
  }
  for (const h of holes) {
    push("0", "CIRCLE", "8", "MOUNT",
      "10", h.x.toFixed(3), "20", (H - h.y).toFixed(3), "30", "0",
      "40", holeR.toFixed(3));
  }
  push("0", "ENDSEC", "0", "EOF");
  return L.join("\n") + "\n";
}

/* ---------- Misc ---------- */

function escapeHtml(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}

function updateHints() {
  const std = STANDARDS[$("standard").value];
  const hints = STRINGS[LANG][std.hintsKey];
  for (const [k, txt] of Object.entries(hints)) {
    const el = $("r-" + k);
    if (el) el.textContent = txt;
  }
  $("stdnote").textContent = t(std.noteKey);
}

function setExportEnabled(on) {
  $("dlsvg").disabled = !on;
  $("dldxf").disabled = !on;
}

function download(name, text, mime) {
  const blob = new Blob([text], { type: mime });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}

/* ---------- Init ---------- */

async function init() {
  applyStaticStrings();
  document.documentElement.lang = LANG;
  try {
    statusEl.textContent = t("statusLoading");
    const [ll, fontReg, fontBold] = await Promise.all([
      llCreate({ tableUrl: TABLE_URL, entryFiles: ENTRY_FILES }),
      loadFont("vendor/fonts/AtkinsonHyperlegible-Regular.ttf"),
      loadFont("vendor/fonts/AtkinsonHyperlegible-Bold.ttf"),
    ]);
    LL = ll;
    FONTS = { regular: fontReg, bold: fontBold };
    statusEl.textContent = t("statusReady", LL.version(), LL.tablesLoaded);
  } catch (e) {
    statusEl.textContent = t("initError", e && e.message || e);
    statusEl.classList.add("err");
    return;
  }
  const rerender = () => { try { render(); } catch (e) {
    $("readback").innerHTML = `<p class="err">${escapeHtml(t("renderError", e && e.message || e))}</p>`;
  } };
  for (const id of ["signtext","brltext","table","lowercase","showtext","bold","override",
                    "sizemode","plateW","plateH","cornerR","holes","holeDia","holeEdge",
                    "dotDia","dotCC","cellCC","lineCC","drillDia","capHeight","gap","pad","align"]) {
    $(id).addEventListener("input", rerender);
  }
  $("standard").addEventListener("input", () => { updateHints(); rerender(); });
  $("applystd").addEventListener("click", () => {
    const std = STANDARDS[$("standard").value];
    for (const [k, v] of Object.entries(std.values)) if ($(k)) $(k).value = v;
    rerender();
  });
  $("lang").addEventListener("input", () => {
    setLang($("lang").value);
    statusEl.textContent = LL ? t("statusReady", LL.version(), LL.tablesLoaded) : t("statusLoading");
    updateHints();
    rerender();
  });
  updateHints();
  $("dlsvg").addEventListener("click", () =>
    lastExport && download("sign.svg", lastExport.svgText, "image/svg+xml"));
  $("dldxf").addEventListener("click", () =>
    lastExport && download("sign.dxf", lastExport.dxfText, "application/dxf"));
  rerender();
}

window.addEventListener("DOMContentLoaded", init);
