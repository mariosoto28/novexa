import { loadPyodide as mmszLoadPyodide } from './pyodide/pyodide.mjs';

const mmszReady = mmszLoadPyodide({ indexURL: new URL('./pyodide/', import.meta.url).href }).then((mmszPy) => {
  self.postMessage({ mmszType: 'ready' });
  return mmszPy;
});

function mmszCleanError(mmszMessage) {
  const mmszLines = String(mmszMessage).trim().split('\n');
  const mmszLast = mmszLines[mmszLines.length - 1];
  const mmszWhere = [...mmszLines].reverse().find((mmszL) => mmszL.includes('File "<exec>"'));
  const mmszLineNo = mmszWhere && mmszWhere.match(/line (\d+)/);
  return mmszLineNo ? `Línea ${mmszLineNo[1]}: ${mmszLast}` : mmszLast;
}

self.onmessage = async (mmszE) => {
  const { mmszId, mmszCode } = mmszE.data;
  const mmszPy = await mmszReady;
  const mmszOut = [];
  mmszPy.setStdout({ batched: (mmszS) => mmszOut.push(mmszS) });
  mmszPy.setStderr({ batched: (mmszS) => mmszOut.push(mmszS) });
  const mmszGlobals = mmszPy.globals.get('dict')();
  try {
    await mmszPy.runPythonAsync(mmszCode, { globals: mmszGlobals });
    self.postMessage({ mmszType: 'result', mmszId, mmszOutput: mmszOut.join('\n') });
  } catch (mmszErr) {
    self.postMessage({ mmszType: 'result', mmszId, mmszOutput: mmszOut.join('\n'), mmszError: mmszCleanError(mmszErr.message) });
  } finally {
    mmszGlobals.destroy();
  }
};
