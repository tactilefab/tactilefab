# Third-party notices

TactileFab Studio bundles the following third-party components. Their licenses
apply to the respective files and are included in this repository.

## liblouis 3.38.0 — `vendor/liblouis/`

The braille translation engine, compiled to WebAssembly from the official
source (see `vendor/liblouis/BUILDING.md` for the exact build recipe).
Copyright the liblouis maintainers and contributors.

License: **GNU Lesser General Public License v2.1 or later** —
see `vendor/liblouis/COPYING.LESSER` (and `vendor/liblouis/COPYING`).
The braille tables in `vendor/liblouis/tables/` carry their own license headers
(predominantly LGPL); the Swedish tables are authored by the Swedish Braille
Authority (Punktskriftsnämnden) together with Insyn Scandinavia AB.

The wrapper `ll.js` is our own code (MIT) and talks to the LGPL library through
its public C API. Replacing `vendor/liblouis/` with your own build of liblouis
is supported and encouraged.

## opentype.js 1.3.4 — `vendor/opentype/`

Font parsing and glyph outline extraction. Copyright Frederik De Bleser and
contributors.

License: **MIT** — see `vendor/opentype/LICENSE`.

## Atkinson Hyperlegible — `vendor/fonts/`

Typeface (Regular and Bold) designed by the Braille Institute of America for
maximum legibility. Copyright 2020 Braille Institute of America, Inc.

License: **SIL Open Font License 1.1** — see `vendor/fonts/OFL.txt`.
