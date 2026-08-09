# TactileFab Studio

**Braille translation is only the first step. This tool creates the actual
fabrication files.**

TactileFab Studio runs **entirely in your browser**: type the sign text →
correct braille via liblouis → true-to-scale geometry in millimeters → export
as SVG and DXF, ready for CNC routing, rotary engraving, laser work and raster
braille. No server, no account, no upload — nothing leaves your machine.

*Svensk version: [README.sv.md](README.sv.md).*

**Status:** preview. The braille geometry and text outlines are exact and the
correctness gates work; shop validation (drill calibration, produced test signs)
is still ahead. Don't treat output as standards-certified until then.

## Features

- **Translation:** Swedish uncontracted (`sv-g0` — the official table by the
  Swedish Braille Authority with number and letter signs built in), English UEB
  grade 2 (contracted — what ADA requires), UEB grade 1, or **paste verified
  braille** from your own translator (any language, no table dependency).
- **Dimensional standards as presets:** Swedish (MTM / SS-ISO 17049) and
  ADA 703.3, with sourced ranges and warnings when a value falls outside the
  selected standard.
- **Tactile text as vector outlines** at exact cap height (measured from font
  metrics, not approximated), set in Atkinson Hyperlegible (Braille Institute
  of America, OFL) in regular or bold.
- **Plate size the way orders work:** auto (grow with content) or fixed
  (e.g. 100 × 50 mm) — if the content doesn't fit, export is blocked with a
  message stating what it needs. Corner radius and mounting holes (2 or 4,
  custom diameter/edge distance) are included in both formats.
- **Export:** millimeter-true SVG (whole sign incl. text outlines) and minimal
  DXF R12 (layer BRAILLE = drill circles, PLATE = contour incl. corner arcs,
  MOUNT = mounting holes; text in DXF is planned).
- **Export gate:** known errors (8-dot cells, non-braille characters,
  missing/mismatched lines, failed translation) block export until fixed — or
  until the user explicitly checks "export despite errors".
- Lowercase conversion for braille (avoids capital indicators), cell count and
  width per line, UI in English and Swedish.

## Quick start

```bash
python3 -m http.server 8641 --directory .
```

Then open <http://localhost:8641>. HTTP is required (not `file://`) because
table files are fetched at startup.

## Files

| Path | What |
|---|---|
| `index.html`, `app.js`, `i18n.js`, `style.css` | the app, no build step |
| `ll.js` | minimal wrapper around the liblouis C API (replaces the GPL easy-api) |
| `vendor/liblouis/` | liblouis 3.38.0 compiled to WebAssembly by us + all tables + LGPL license files |
| `vendor/opentype/` | opentype.js 1.3.4 (MIT) for text outlines |
| `vendor/fonts/` | Atkinson Hyperlegible Regular + Bold (OFL) |

## Known limitations

- No text in the DXF yet (the SVG carries complete outlines; the DXF carries
  braille, plate contour and mounting holes).
- Dot height is standardized (SS-ISO 17049: 0.3–0.7 mm; ADA 703.3:
  0.64–0.94 mm) but is a Z dimension that 2D files cannot express — the shop
  achieves it via drill/milling depth and verifies by measurement. The app
  shows the standard's values in the note under the geometry fields.
- Character spacing in tactile text follows the font's metrics; ADA's specific
  minimum-spacing rules are not checked yet.

## Standards sources

Swedish braille cell dimensions per
[MTM/the Swedish Braille Authority](https://www.mtm.se/punktskriftsnamnden/punktskrift/punktskriftcellens-matt-i-sverige/)
and [MTM: Signs and maps in public environments](https://www.mtm.se/punktskriftsnamnden/skrivregler-och-riktlinjer/skyltar-och-kartor-i-offentlig-miljo/)
(sign dot diameter and height: SS-ISO 17049:2017; tactile character height:
ISO 21542). US dimensions per
[ADA chapter 7: signs](https://www.access-board.gov/ada/guides/chapter-7-signs/).

## About

TactileFab is developed and used in production by
[Lindströms Skylt](https://www.skyltar.org/), a Swedish sign manufacturer that
makes [tactile signs](https://www.skyltar.org/taktila-skyltar/) in Linköping.
The tool exists because we needed it ourselves — every feature maps to a real
production step in a real sign shop.

## License

MIT for the TactileFab code — see [LICENSE](LICENSE). Bundled third-party
components (liblouis LGPL-2.1+, opentype.js MIT, Atkinson Hyperlegible OFL-1.1)
are listed in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
