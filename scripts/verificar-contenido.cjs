const mmszPath = require('path');
const mmszFs = require('fs');
const mmszOs = require('os');
const mmszEsbuild = require('esbuild');

const mmszRaiz = mmszPath.join(__dirname, '..');
const mmszSalidaJs = mmszPath.join(mmszOs.tmpdir(), `novexa-contenido-${process.pid}.cjs`);
mmszEsbuild.buildSync({
  entryPoints: [mmszPath.join(mmszRaiz, 'src', 'content', 'index.ts')],
  bundle: true,
  platform: 'node',
  format: 'cjs',
  outfile: mmszSalidaJs,
  logLevel: 'error',
});
const { mmszCourses } = require(mmszSalidaJs);
mmszFs.unlinkSync(mmszSalidaJs);

const mmszNormalizar = (mmszS) => String(mmszS).replace(/\r/g, '').trim().replace(/\s+/g, ' ');

function mmszCorrerJs(mmszCodigo) {
  const mmszLogs = [];
  const mmszFmt = (mmszV) => (typeof mmszV === 'string' ? mmszV : JSON.stringify(mmszV));
  const mmszLog = (...mmszA) => mmszLogs.push(mmszA.map(mmszFmt).join(' '));
  try {
    new Function('console', mmszCodigo)({ log: mmszLog, mmszInfo: mmszLog, warn: mmszLog, mmszError: mmszLog });
    return { mmszOutput: mmszLogs.join('\n') };
  } catch (mmszE) {
    return { mmszOutput: mmszLogs.join('\n'), mmszError: String(mmszE) };
  }
}

function mmszCorrerCpp(mmszCodigo) {
  const MMSZ_JSCPP = require('JSCPP');
  let mmszOut = '';
  try {
    MMSZ_JSCPP.run(mmszCodigo, '', { stdio: { write: (mmszS) => { mmszOut += mmszS; } } });
    return { mmszOutput: mmszOut };
  } catch (mmszE) {
    return { mmszOutput: mmszOut, mmszError: String(mmszE.message || mmszE).split('\n')[0] };
  }
}

let mmszPy = null;
async function mmszCorrerPython(mmszCodigo) {
  if (!mmszPy) {
    const { loadPyodide: mmszLoadPyodide } = require('pyodide');
    mmszPy = await mmszLoadPyodide();
  }
  const mmszOut = [];
  mmszPy.setStdout({ batched: (mmszS) => mmszOut.push(mmszS) });
  mmszPy.setStderr({ batched: (mmszS) => mmszOut.push(mmszS) });
  const mmszGlobals = mmszPy.globals.get('dict')();
  try {
    await mmszPy.runPythonAsync(mmszCodigo, { globals: mmszGlobals });
    return { mmszOutput: mmszOut.join('\n') };
  } catch (mmszE) {
    return { mmszOutput: mmszOut.join('\n'), mmszError: String(mmszE.message).trim().split('\n').pop() };
  } finally {
    mmszGlobals.destroy();
  }
}

async function mmszCorrer(mmszLang, mmszCodigo) {
  if (mmszLang === 'python') return mmszCorrerPython(mmszCodigo);
  if (mmszLang === 'cpp') return mmszCorrerCpp(mmszCodigo);
  return mmszCorrerJs(mmszCodigo);
}

(async () => {
  const mmszFiltro = process.argv[2];
  let mmszOk = 0;
  const mmszFallas = [];
  const mmszIds = new Set();

  for (const mmszCurso of mmszCourses) {
    if (mmszFiltro && mmszCurso.mmszId !== mmszFiltro) continue;
    let mmszLecciones = 0;
    for (const mmszUnidad of mmszCurso.mmszUnits) {
      for (const mmszLeccion of mmszUnidad.mmszLessons) {
        mmszLecciones++;
        if (mmszIds.has(mmszLeccion.mmszId)) mmszFallas.push(`[${mmszLeccion.mmszId}] id de lección repetido`);
        mmszIds.add(mmszLeccion.mmszId);
        for (const mmszItem of mmszLeccion.mmszItems) {
          if (mmszItem.mmszTipo !== 'desafio' && mmszItem.mmszTipo !== 'proyecto') continue;
          for (const [mmszI, mmszPaso] of mmszItem.mmszPasos.entries()) {
            const mmszDonde = `[${mmszLeccion.mmszId}] ${mmszItem.mmszTitulo} · paso ${mmszI + 1}`;
            for (const mmszReq of mmszPaso.mmszRequiere ?? []) {
              if (!mmszPaso.mmszSolucion.includes(mmszReq)) mmszFallas.push(`${mmszDonde}: la solución no contiene "${mmszReq}"`);
            }
            if (mmszPaso.mmszSalida === undefined) { mmszOk++; continue; }
            const mmszR = await mmszCorrer(mmszCurso.mmszId, mmszPaso.mmszSolucion);
            if (mmszR.mmszError) mmszFallas.push(`${mmszDonde}: error ${mmszR.mmszError}`);
            else if (mmszNormalizar(mmszR.mmszOutput) !== mmszNormalizar(mmszPaso.mmszSalida))
              mmszFallas.push(`${mmszDonde}: salida ${JSON.stringify(mmszR.mmszOutput)} ≠ esperada ${JSON.stringify(mmszPaso.mmszSalida)}`);
            else mmszOk++;
          }
        }
        for (const [mmszI, mmszEj] of mmszLeccion.mmszExercises.entries()) {
          if (mmszEj.mmszType !== 'code' || !mmszEj.mmszSolucion) continue;
          const mmszDonde = `[${mmszLeccion.mmszId}] práctica ${mmszI + 1}`;
          const mmszR = await mmszCorrer(mmszCurso.mmszId, mmszEj.mmszSolucion);
          if (mmszR.mmszError) mmszFallas.push(`${mmszDonde}: error ${mmszR.mmszError}`);
          else if (mmszNormalizar(mmszR.mmszOutput) !== mmszNormalizar(mmszEj.mmszExpectedOutput))
            mmszFallas.push(`${mmszDonde}: salida ${JSON.stringify(mmszR.mmszOutput)} ≠ esperada ${JSON.stringify(mmszEj.mmszExpectedOutput)}`);
          else mmszOk++;
        }
      }
    }
    console.log(`${mmszCurso.mmszName}: ${mmszCurso.mmszUnits.length} unidades, ${mmszLecciones} lecciones`);
  }

  console.log(`\n✓ ${mmszOk} comprobaciones correctas`);
  if (mmszFallas.length) {
    console.log(`✗ ${mmszFallas.length} con problemas:`);
    for (const mmszF of mmszFallas) console.log('  - ' + mmszF);
    process.exit(1);
  }
})();
