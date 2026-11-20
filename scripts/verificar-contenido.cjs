// Autor: MMSZ (Mario Soto Zea)
// Verifica el contenido de los cursos: ejecuta la solución de cada paso de los desafíos,
// proyectos y ejercicios de código, y comprueba que la salida sea la esperada.
// Uso: npm run verificar        (o: node scripts/verificar-contenido.cjs python)
const mmszPath = require('path');
const fs = require('fs');
const os = require('os');
const esbuild = require('esbuild');

const mmszRaiz = mmszPath.join(__dirname, '..');
const mmszSalidaJs = mmszPath.join(os.tmpdir(), `novexa-contenido-${process.pid}.cjs`);
esbuild.buildSync({
  entryPoints: [mmszPath.join(mmszRaiz, 'src', 'content', 'index.ts')],
  bundle: true,
  platform: 'node',
  format: 'cjs',
  outfile: mmszSalidaJs,
  logLevel: 'error',
});
const { mmszCourses } = require(mmszSalidaJs);
fs.unlinkSync(mmszSalidaJs);

const mmszNormalizar = (s) => String(s).replace(/\r/g, '').trim().replace(/\s+/g, ' ');

function mmszCorrerJs(codigo) {
  const logs = [];
  const fmt = (v) => (typeof v === 'string' ? v : JSON.stringify(v));
  const log = (...a) => logs.push(a.map(fmt).join(' '));
  try {
    new Function('console', codigo)({ log, info: log, warn: log, error: log });
    return { output: logs.join('\n') };
  } catch (e) {
    return { output: logs.join('\n'), error: String(e) };
  }
}

function mmszCorrerCpp(codigo) {
  const JSCPP = require('JSCPP');
  let out = '';
  try {
    JSCPP.run(codigo, '', { stdio: { write: (s) => { out += s; } } });
    return { output: out };
  } catch (e) {
    return { output: out, error: String(e.message || e).split('\n')[0] };
  }
}

let mmszPy = null;
async function mmszCorrerPython(codigo) {
  if (!mmszPy) {
    const { loadPyodide } = require('pyodide');
    mmszPy = await loadPyodide();
  }
  const out = [];
  mmszPy.setStdout({ batched: (s) => out.push(s) });
  mmszPy.setStderr({ batched: (s) => out.push(s) });
  const globals = mmszPy.globals.get('dict')();
  try {
    await mmszPy.runPythonAsync(codigo, { globals });
    return { output: out.join('\n') };
  } catch (e) {
    return { output: out.join('\n'), error: String(e.message).trim().split('\n').pop() };
  } finally {
    globals.destroy();
  }
}

async function mmszCorrer(lang, codigo) {
  if (lang === 'python') return mmszCorrerPython(codigo);
  if (lang === 'cpp') return mmszCorrerCpp(codigo);
  return mmszCorrerJs(codigo);
}

(async () => {
  const mmszFiltro = process.argv[2];
  let mmszOk = 0;
  const mmszFallas = [];
  const mmszIds = new Set();

  for (const curso of mmszCourses) {
    if (mmszFiltro && curso.id !== mmszFiltro) continue;
    let mmszLecciones = 0;
    for (const unidad of curso.units) {
      for (const leccion of unidad.lessons) {
        mmszLecciones++;
        if (mmszIds.has(leccion.id)) mmszFallas.push(`[${leccion.id}] id de lección repetido`);
        mmszIds.add(leccion.id);
        for (const item of leccion.items) {
          if (item.tipo !== 'desafio' && item.tipo !== 'proyecto') continue;
          for (const [i, paso] of item.pasos.entries()) {
            const donde = `[${leccion.id}] ${item.titulo} · paso ${i + 1}`;
            for (const req of paso.requiere ?? []) {
              if (!paso.solucion.includes(req)) mmszFallas.push(`${donde}: la solución no contiene "${req}"`);
            }
            if (paso.salida === undefined) { mmszOk++; continue; }
            const r = await mmszCorrer(curso.id, paso.solucion);
            if (r.error) mmszFallas.push(`${donde}: error ${r.error}`);
            else if (mmszNormalizar(r.output) !== mmszNormalizar(paso.salida))
              mmszFallas.push(`${donde}: salida ${JSON.stringify(r.output)} ≠ esperada ${JSON.stringify(paso.salida)}`);
            else mmszOk++;
          }
        }
        for (const [i, ej] of leccion.exercises.entries()) {
          if (ej.type !== 'code' || !ej.solucion) continue;
          const donde = `[${leccion.id}] práctica ${i + 1}`;
          const r = await mmszCorrer(curso.id, ej.solucion);
          if (r.error) mmszFallas.push(`${donde}: error ${r.error}`);
          else if (mmszNormalizar(r.output) !== mmszNormalizar(ej.expectedOutput))
            mmszFallas.push(`${donde}: salida ${JSON.stringify(r.output)} ≠ esperada ${JSON.stringify(ej.expectedOutput)}`);
          else mmszOk++;
        }
      }
    }
    console.log(`${curso.name}: ${curso.units.length} unidades, ${mmszLecciones} lecciones`);
  }

  console.log(`\n✓ ${mmszOk} comprobaciones correctas`);
  if (mmszFallas.length) {
    console.log(`✗ ${mmszFallas.length} con problemas:`);
    for (const f of mmszFallas) console.log('  - ' + f);
    process.exit(1);
  }
})();
