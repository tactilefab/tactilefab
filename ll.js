/* ll.js – minimal wrapper around liblouis (WASM build in vendor/liblouis/).
 *
 * Replaces the GPL-licensed easy-api with our own code against the LGPL core,
 * and avoids easy-api's known bugs: byte vs. character length in the
 * lou_translateString call, and an output buffer too small when output grows
 * (number signs, letter signs).
 *
 * Requires vendor/liblouis/liblouis.js (defines createLiblouis) to be loaded.
 */
"use strict";

async function llCreate(opts) {
  const tableUrl = opts.tableUrl; // t.ex. "vendor/liblouis/tables/"
  const entryFiles = opts.entryFiles; // tabellfiler vars include-kedjor förladdas

  const M = await createLiblouis();
  const logs = [];

  // Log callback: captures table errors etc. (level 40000 = error)
  const cb = M.addFunction((level, msgPtr) => {
    logs.push({ level, msg: M.UTF8ToString(msgPtr) });
  }, "vii");
  M.ccall("lou_registerLogCallback", null, ["number"], [cb]);

  // Preload table files (recursively via include lines) into the emscripten FS
  M.FS.mkdir("/tables");
  const loaded = new Set();
  async function load(name) {
    if (loaded.has(name)) return;
    loaded.add(name);
    const resp = await fetch(tableUrl + name);
    if (!resp.ok) throw new Error("Could not fetch table file: " + name);
    const buf = new Uint8Array(await resp.arrayBuffer());
    M.FS.writeFile("/tables/" + name, buf);
    const text = new TextDecoder("utf-8").decode(buf);
    const re = /^\s*include\s+(\S+)/gm;
    let m;
    const deps = [];
    while ((m = re.exec(text)) !== null) deps.push(m[1]);
    for (const d of deps) await load(d);
  }
  for (const f of entryFiles) await load(f);

  function translate(tableList, text) {
    if (!text) return "";
    const inChars = text.length;
    const cap = inChars * 8 + 64; // generous headroom: number/letter signs grow the output
    const inPtr = M._malloc((inChars + 1) * 2);
    M.stringToUTF16(text, inPtr, (inChars + 1) * 2);
    const outPtr = M._malloc(cap * 2);
    const inLenP = M._malloc(4);
    const outLenP = M._malloc(4);
    M.setValue(inLenP, inChars, "i32");
    M.setValue(outLenP, cap, "i32");
    const ok = M.ccall("lou_translateString", "number",
      ["string", "number", "number", "number", "number", "number", "number", "number"],
      [tableList, inPtr, inLenP, outPtr, outLenP, 0, 0, 0]);
    let out = null;
    if (ok) {
      const len = M.getValue(outLenP, "i32");
      const cu = [];
      for (let i = 0; i < len; i++) cu.push(M.HEAPU16[outPtr / 2 + i]);
      out = String.fromCharCode(...cu);
    }
    [inPtr, outPtr, inLenP, outLenP].forEach((p) => M._free(p));
    if (out === null) {
      const errs = logs.filter((l) => l.level >= 40000).map((l) => l.msg);
      throw new Error(errs.length ? errs[errs.length - 1] : "liblouis could not translate");
    }
    return out;
  }

  return {
    M,
    logs,
    tablesLoaded: loaded.size,
    version: () => M.ccall("lou_version", "string"),
    charSize: () => M.ccall("lou_charSize", "number"),
    translate,
  };
}
