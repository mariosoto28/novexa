export interface MmszRunResult {
  mmszOutput: string;
  mmszError?: string;
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

export function mmszRunCpp(mmszCode: string, mmszTimeoutMs = 4000): Promise<MmszRunResult> {
  return new Promise((mmszResolve) => {
    const mmszWorker = new Worker(new URL('./mmszCppWorker.ts', import.meta.url), { type: 'module' });
    const mmszFinish = (mmszR: MmszRunResult) => {
      clearTimeout(mmszTimer);
      mmszWorker.terminate();
      mmszResolve(mmszR);
    };
    const mmszTimer = setTimeout(
      () => mmszFinish({ mmszOutput: '', mmszError: 'El programa tardó demasiado (¿un bucle infinito?)' }),
      mmszTimeoutMs,
    );
    mmszWorker.onmessage = (mmszE) => mmszFinish(mmszE.data as MmszRunResult);
    mmszWorker.onerror = (mmszE) => mmszFinish({ mmszOutput: '', mmszError: mmszE.message || 'No se pudo ejecutar C++' });
    mmszWorker.postMessage(mmszCode);
  });
}

const mmszJsWorkerSource = `
const mmszFmt = (mmszV) => {
  if (typeof mmszV === 'string') return mmszV;
  try { return JSON.stringify(mmszV); } catch { return String(mmszV); }
};
self.onmessage = (mmszE) => {
  const mmszLogs = [];
  const mmszLog = (...mmszA) => mmszLogs.push(mmszA.map(mmszFmt).join(' '));
  const mmszConsola = { log: mmszLog, info: mmszLog, warn: mmszLog, error: mmszLog };
  try {
    new Function('console', mmszE.data)(mmszConsola);
    self.postMessage({ mmszOutput: mmszLogs.join('\\n') });
  } catch (mmszErr) {
    self.postMessage({ mmszOutput: mmszLogs.join('\\n'), mmszError: String(mmszErr) });
  }
};
`;

export function mmszRunJS(mmszCode: string, mmszTimeoutMs = 2000): Promise<MmszRunResult> {
  return new Promise((mmszResolve) => {
    const mmszUrl = URL.createObjectURL(new Blob([mmszJsWorkerSource], { type: 'text/javascript' }));
    const mmszWorker = new Worker(mmszUrl);
    const mmszFinish = (mmszR: MmszRunResult) => {
      clearTimeout(mmszTimer);
      mmszWorker.terminate();
      URL.revokeObjectURL(mmszUrl);
      mmszResolve(mmszR);
    };
    const mmszTimer = setTimeout(
      () => mmszFinish({ mmszOutput: '', mmszError: 'El programa tardó demasiado (¿un bucle infinito?)' }),
      mmszTimeoutMs,
    );
    mmszWorker.onmessage = (mmszE) => mmszFinish(mmszE.data as MmszRunResult);
    mmszWorker.onerror = (mmszE) => mmszFinish({ mmszOutput: '', mmszError: mmszE.message });
    mmszWorker.postMessage(mmszCode);
  });
}

interface MmszPyWorker {
  mmszWorker: Worker;
  mmszReady: Promise<void>;
}

let mmszPy: MmszPyWorker | null = null;
let mmszNextId = 0;
type MmszListener = (mmszLoading: boolean) => void;
const mmszListeners = new Set<MmszListener>();
let mmszPyLoading = false;

function mmszSetLoading(mmszV: boolean) {
  mmszPyLoading = mmszV;
  mmszListeners.forEach((mmszL) => mmszL(mmszV));
}

export function mmszOnPythonLoading(mmszL: MmszListener): () => void {
  mmszListeners.add(mmszL);
  mmszL(mmszPyLoading);
  return () => mmszListeners.delete(mmszL);
}

function mmszStartPython(): MmszPyWorker {
  if (mmszPy) return mmszPy;
  mmszSetLoading(true);
  const mmszWorker = new Worker(new URL('py-worker.mjs', document.baseURI), { type: 'module' });
  const mmszReady = new Promise<void>((mmszResolve, mmszReject) => {
    const mmszOnMsg = (mmszE: MessageEvent) => {
      if (mmszE.data?.mmszType === 'ready') {
        mmszWorker.removeEventListener('message', mmszOnMsg);
        mmszSetLoading(false);
        mmszResolve();
      }
    };
    mmszWorker.addEventListener('message', mmszOnMsg);
    mmszWorker.addEventListener('error', (mmszE) => {
      mmszSetLoading(false);
      mmszPy = null;
      mmszReject(new Error(mmszE.message || 'No se pudo cargar Python'));
    });
  });
  mmszReady.catch(() => {});
  mmszPy = { mmszWorker, mmszReady };
  return mmszPy;
}

export function mmszPreloadPython() {
  mmszStartPython();
}

export async function mmszRunPython(mmszCode: string, mmszTimeoutMs = 4000): Promise<MmszRunResult> {
  const mmszP = mmszStartPython();
  try {
    await mmszP.mmszReady;
  } catch (mmszErr) {
    return { mmszOutput: '', mmszError: `No se pudo cargar Python: ${(mmszErr as Error).message}` };
  }
  const mmszId = ++mmszNextId;
  return new Promise((mmszResolve) => {
    const mmszOnMsg = (mmszE: MessageEvent) => {
      if (mmszE.data?.mmszType === 'result' && mmszE.data.mmszId === mmszId) {
        clearTimeout(mmszTimer);
        mmszP.mmszWorker.removeEventListener('message', mmszOnMsg);
        mmszResolve({ mmszOutput: mmszE.data.mmszOutput, mmszError: mmszE.data.mmszError });
      }
    };
    const mmszTimer = setTimeout(() => {
      mmszP.mmszWorker.removeEventListener('message', mmszOnMsg);
      mmszP.mmszWorker.terminate();
      mmszPy = null;
      mmszResolve({ mmszOutput: '', mmszError: 'El programa tardó demasiado (¿un bucle infinito?)' });
    }, mmszTimeoutMs);
    mmszP.mmszWorker.addEventListener('message', mmszOnMsg);
    mmszP.mmszWorker.postMessage({ mmszId, mmszCode });
  });
}
