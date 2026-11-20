// Autor: MMSZ (Mario Soto Zea)
// Ejecuta el código del estudiante de forma aislada (en Web Workers), captura
// lo que imprime y corta si tarda demasiado (por ejemplo, un bucle infinito).

export interface MmszRunResult {
  output: string;
  error?: string;
}

export type MmszRunnableLang = 'javascript' | 'python' | 'cpp';

export function mmszCanRun(mmszLang: string): mmszLang is MmszRunnableLang {
  return mmszLang === 'javascript' || mmszLang === 'python' || mmszLang === 'cpp';
}

export function mmszRunCode(mmszLang: MmszRunnableLang, mmszCode: string): Promise<MmszRunResult> {
  if (mmszLang === 'python') return mmszRunPython(mmszCode);
  if (mmszLang === 'cpp') return mmszRunCpp(mmszCode);
  return mmszRunJS(mmszCode);
}

/* ---------------- C++ (intérprete JSCPP) ---------------- */

export function mmszRunCpp(mmszCode: string, mmszTimeoutMs = 4000): Promise<MmszRunResult> {
  return new Promise((mmszResolve) => {
    const mmszWorker = new Worker(new URL('./mmszCppWorker.ts', import.meta.url), { type: 'module' });
    const mmszFinish = (r: MmszRunResult) => {
      clearTimeout(mmszTimer);
      mmszWorker.terminate();
      mmszResolve(r);
    };
    const mmszTimer = setTimeout(
      () => mmszFinish({ output: '', error: 'El programa tardó demasiado (¿un bucle infinito?)' }),
      mmszTimeoutMs,
    );
    mmszWorker.onmessage = (e) => mmszFinish(e.data as MmszRunResult);
    mmszWorker.onerror = (e) => mmszFinish({ output: '', error: e.message || 'No se pudo ejecutar C++' });
    mmszWorker.postMessage(mmszCode);
  });
}

/* ---------------- JavaScript ---------------- */

const mmszJsWorkerSource = `
const fmt = (v) => {
  if (typeof v === 'string') return v;
  try { return JSON.stringify(v); } catch { return String(v); }
};
self.onmessage = (e) => {
  const logs = [];
  const log = (...a) => logs.push(a.map(fmt).join(' '));
  const fakeConsole = { log, info: log, warn: log, error: log };
  try {
    new Function('console', e.data)(fakeConsole);
    self.postMessage({ output: logs.join('\\n') });
  } catch (err) {
    self.postMessage({ output: logs.join('\\n'), error: String(err) });
  }
};
`;

export function mmszRunJS(mmszCode: string, mmszTimeoutMs = 2000): Promise<MmszRunResult> {
  return new Promise((mmszResolve) => {
    const mmszUrl = URL.createObjectURL(new Blob([mmszJsWorkerSource], { type: 'text/javascript' }));
    const mmszWorker = new Worker(mmszUrl);
    const mmszFinish = (r: MmszRunResult) => {
      clearTimeout(mmszTimer);
      mmszWorker.terminate();
      URL.revokeObjectURL(mmszUrl);
      mmszResolve(r);
    };
    const mmszTimer = setTimeout(
      () => mmszFinish({ output: '', error: 'El programa tardó demasiado (¿un bucle infinito?)' }),
      mmszTimeoutMs,
    );
    mmszWorker.onmessage = (e) => mmszFinish(e.data as MmszRunResult);
    mmszWorker.onerror = (e) => mmszFinish({ output: '', error: e.message });
    mmszWorker.postMessage(mmszCode);
  });
}

/* ---------------- Python (Pyodide) ---------------- */
// Python tarda unos segundos en cargar la primera vez, así que el worker se
// mantiene vivo entre ejecuciones. Si un programa se cuelga, se reinicia.

interface MmszPyWorker {
  worker: Worker;
  ready: Promise<void>;
}

let py: MmszPyWorker | null = null;
let mmszNextId = 0;
type MmszListener = (mmszLoading: boolean) => void;
const mmszListeners = new Set<MmszListener>();
let mmszPyLoading = false;

function mmszSetLoading(v: boolean) {
  mmszPyLoading = v;
  mmszListeners.forEach((l) => l(v));
}

/** Para mostrar “Preparando Python…” en la interfaz. */
export function mmszOnPythonLoading(l: MmszListener): () => void {
  mmszListeners.add(l);
  l(mmszPyLoading);
  return () => mmszListeners.delete(l);
}

function mmszStartPython(): MmszPyWorker {
  if (py) return py;
  mmszSetLoading(true);
  const mmszWorker = new Worker(new URL('py-worker.mjs', document.baseURI), { type: 'module' });
  const mmszReady = new Promise<void>((mmszResolve, mmszReject) => {
    const mmszOnMsg = (e: MessageEvent) => {
      if (e.data?.type === 'ready') {
        mmszWorker.removeEventListener('message', mmszOnMsg);
        mmszSetLoading(false);
        mmszResolve();
      }
    };
    mmszWorker.addEventListener('message', mmszOnMsg);
    mmszWorker.addEventListener('error', (e) => {
      mmszSetLoading(false);
      py = null;
      mmszReject(new Error(e.message || 'No se pudo cargar Python'));
    });
  });
  mmszReady.catch(() => {}); // el error se informa al ejecutar
  py = { worker: mmszWorker, ready: mmszReady };
  return py;
}

/** Empieza a cargar Python en segundo plano (al abrir una lección de Python). */
export function mmszPreloadPython() {
  mmszStartPython();
}

export async function mmszRunPython(mmszCode: string, mmszTimeoutMs = 4000): Promise<MmszRunResult> {
  const p = mmszStartPython();
  try {
    await p.ready;
  } catch (mmszErr) {
    return { output: '', error: `No se pudo cargar Python: ${(mmszErr as Error).message}` };
  }
  const id = ++mmszNextId;
  return new Promise((mmszResolve) => {
    const mmszOnMsg = (e: MessageEvent) => {
      if (e.data?.type === 'result' && e.data.id === id) {
        clearTimeout(mmszTimer);
        p.worker.removeEventListener('message', mmszOnMsg);
        mmszResolve({ output: e.data.output, error: e.data.error });
      }
    };
    const mmszTimer = setTimeout(() => {
      p.worker.removeEventListener('message', mmszOnMsg);
      p.worker.terminate();
      py = null; // la próxima ejecución carga Python de nuevo
      mmszResolve({ output: '', error: 'El programa tardó demasiado (¿un bucle infinito?)' });
    }, mmszTimeoutMs);
    p.worker.addEventListener('message', mmszOnMsg);
    p.worker.postMessage({ id, code: mmszCode });
  });
}
