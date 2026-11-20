// Autor: MMSZ (Mario Soto Zea)
// Worker que ejecuta Python con Pyodide, separado de la interfaz.
import { loadPyodide } from './pyodide/pyodide.mjs';

const mmszReady = loadPyodide({ indexURL: new URL('./pyodide/', import.meta.url).href }).then((py) => {
  self.postMessage({ type: 'ready' });
  return py;
});

/** Deja solo la última línea del error (la que el estudiante entiende) y la línea del código. */
function mmszCleanError(mmszMessage) {
  const mmszLines = String(mmszMessage).trim().split('\n');
  const mmszLast = mmszLines[mmszLines.length - 1];
  const mmszWhere = [...mmszLines].reverse().find((l) => l.includes('File "<exec>"'));
  const mmszLineNo = mmszWhere && mmszWhere.match(/line (\d+)/);
  return mmszLineNo ? `Línea ${mmszLineNo[1]}: ${mmszLast}` : mmszLast;
}

self.onmessage = async (e) => {
  const { id, code: mmszCode } = e.data;
  const py = await mmszReady;
  const mmszOut = [];
  py.setStdout({ batched: (s) => mmszOut.push(s) });
  py.setStderr({ batched: (s) => mmszOut.push(s) });
  const mmszGlobals = py.globals.get('dict')(); // variables limpias en cada ejecución
  try {
    await py.runPythonAsync(mmszCode, { globals: mmszGlobals });
    self.postMessage({ type: 'result', id, output: mmszOut.join('\n') });
  } catch (mmszErr) {
    self.postMessage({ type: 'result', id, output: mmszOut.join('\n'), error: mmszCleanError(mmszErr.message) });
  } finally {
    mmszGlobals.destroy();
  }
};
