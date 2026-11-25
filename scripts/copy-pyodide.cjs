const mmszFs = require('fs');
const mmszPath = require('path');

const mmszSrc = mmszPath.join(__dirname, '..', 'node_modules', 'pyodide');
const mmszDest = mmszPath.join(__dirname, '..', 'public', 'pyodide');
const mmszFiles = ['pyodide.mjs', 'pyodide.asm.mjs', 'pyodide.asm.wasm', 'python_stdlib.zip', 'pyodide-lock.json'];

mmszFs.mkdirSync(mmszDest, { recursive: true });
for (const mmszF of mmszFiles) {
  const mmszFrom = mmszPath.join(mmszSrc, mmszF);
  const mmszTo = mmszPath.join(mmszDest, mmszF);
  if (!mmszFs.existsSync(mmszFrom)) {
    console.error(`[pyodide] Falta ${mmszF}. Ejecuta "npm install".`);
    process.exit(1);
  }
  if (!mmszFs.existsSync(mmszTo) || mmszFs.statSync(mmszTo).size !== mmszFs.statSync(mmszFrom).size) mmszFs.copyFileSync(mmszFrom, mmszTo);
}
console.log('[pyodide] Archivos listos en public/pyodide');
