// Autor: MMSZ (Mario Soto Zea)
// Copia los archivos de Pyodide (Python dentro de la app) a public/pyodide,
// para que funcione sin internet. Se ejecuta solo antes de dev/build.
const fs = require('fs');
const mmszPath = require('path');

const mmszSrc = mmszPath.join(__dirname, '..', 'node_modules', 'pyodide');
const mmszDest = mmszPath.join(__dirname, '..', 'public', 'pyodide');
const mmszFiles = ['pyodide.mjs', 'pyodide.asm.mjs', 'pyodide.asm.wasm', 'python_stdlib.zip', 'pyodide-lock.json'];

fs.mkdirSync(mmszDest, { recursive: true });
for (const f of mmszFiles) {
  const mmszFrom = mmszPath.join(mmszSrc, f);
  const to = mmszPath.join(mmszDest, f);
  if (!fs.existsSync(mmszFrom)) {
    console.error(`[pyodide] Falta ${f}. Ejecuta "npm install".`);
    process.exit(1);
  }
  if (!fs.existsSync(to) || fs.statSync(to).size !== fs.statSync(mmszFrom).size) fs.copyFileSync(mmszFrom, to);
}
console.log('[pyodide] Archivos listos en public/pyodide');
