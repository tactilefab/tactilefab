# Building liblouis for TactileFab

`liblouis.js` + `liblouis.wasm` in this directory are compiled with
**Emscripten 6.0.6** from the official, unmodified liblouis 3.38.0 release.
The exact source archive is included in this repository:
`third_party_sources/liblouis-3.38.0.tar.gz`
(SHA-256 `afb26096b18b17f43e6055e6a79ce0058eb9dbdcdcc4597522dcd7f11915ec16`,
identical to the
[upstream release](https://github.com/liblouis/liblouis/releases/tag/v3.38.0)).

To reproduce or upgrade the build (macOS recipe; Linux works the same with
your package manager):

```bash
brew install emscripten     # we used 6.0.6; needs python >= 3.10 on PATH

tar xzf third_party_sources/liblouis-3.38.0.tar.gz && cd liblouis-3.38.0

emconfigure ./configure --host=wasm32-unknown-emscripten \
  --disable-shared --disable-dependency-tracking
emmake make -C gnulib -j8
emmake make -C liblouis -j8

emcc liblouis/.libs/liblouis.a gnulib/.libs/libgnu.a -o liblouis.js \
  -O2 -sMODULARIZE=1 -sEXPORT_NAME=createLiblouis -sENVIRONMENT=web,node \
  -sALLOW_MEMORY_GROWTH=1 -sFORCE_FILESYSTEM=1 -sALLOW_TABLE_GROWTH=1 \
  -sSTACK_SIZE=5242880 \
  "-sEXPORTED_FUNCTIONS=_lou_translateString,_lou_backTranslateString,_lou_version,_lou_charSize,_lou_free,_lou_registerLogCallback,_lou_setLogLevel,_lou_checkTable,_lou_compileString,_malloc,_free" \
  "-sEXPORTED_RUNTIME_METHODS=ccall,cwrap,FS,setValue,getValue,UTF8ToString,stringToUTF8,UTF16ToString,stringToUTF16,lengthBytesUTF16,addFunction,HEAPU16,HEAPU8"
```

Then copy into this directory: `liblouis.js`, `liblouis.wasm`, the `tables/`
folder, and the license files `COPYING` and `COPYING.LESSER`.

Notes learned the hard way:

- `--host=wasm32-unknown-emscripten` is required — without it, macOS `-arch`
  flags leak into the compile and fail.
- `gnulib` must be built before `liblouis`.
- `-sSTACK_SIZE=5242880` is mandatory: emscripten's default 64 kB stack
  overflows in the recursive table compiler ("memory access out of bounds"
  on first translation).
- The configure default widechar is UTF-16 (2 bytes) — the wrapper `ll.js`
  assumes this (`lou_charSize() == 2`).
- If Homebrew's emscripten complains about LLVM versions, its config should
  point at the bundled toolchain
  (`.../opt/emscripten/libexec/llvm/bin` and `.../libexec/binaryen`) —
  do not run `emcc --generate-config`, which guesses the system LLVM.
