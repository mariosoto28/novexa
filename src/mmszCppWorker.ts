import MMSZ_JSCPP from 'JSCPP';

function mmszLimpiarError(mmszMensaje: string): string {
  const mmszSintaxis = mmszMensaje.match(/line (\d+) \(column (\d+)\)/i);
  if (/Parsing Failure/i.test(mmszMensaje) && mmszSintaxis) {
    return `Línea ${mmszSintaxis[1]}, columna ${mmszSintaxis[2]}: error de sintaxis. Revisa que no falte un «;», una llave { } o un paréntesis.`;
  }
  const mmszEjecucion = mmszMensaje.match(/^(\d+):\d+\s+(.+)$/m);
  if (mmszEjecucion) return `Línea ${mmszEjecucion[1]}: ${mmszEjecucion[2]}`;
  return mmszMensaje.trim().split('\n')[0].replace(/^ERROR:\s*/, '');
}

self.onmessage = (mmszE: MessageEvent<string>) => {
  let mmszSalida = '';
  try {
    MMSZ_JSCPP.run(mmszE.data, '', { stdio: { write: (mmszS: string) => { mmszSalida += mmszS; } } });
    self.postMessage({ mmszOutput: mmszSalida });
  } catch (mmszErr) {
    const mmszMsg = String((mmszErr as Error)?.message ?? mmszErr);
    self.postMessage({ mmszOutput: mmszSalida, mmszError: mmszLimpiarError(mmszMsg) });
  }
};
