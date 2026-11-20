// Autor: MMSZ (Mario Soto Zea)
// Worker que ejecuta C++ con el intérprete JSCPP (soporta lo básico: cout, variables,
// if, bucles, funciones, recursión y arreglos).
import MMSZ_JSCPP from 'JSCPP';

function mmszLimpiarError(mmszMensaje: string): string {
  // Error de sintaxis: "Parsing Failure: line 4 (column 20): ..."
  const mmszSintaxis = mmszMensaje.match(/line (\d+) \(column (\d+)\)/i);
  if (/Parsing Failure/i.test(mmszMensaje) && mmszSintaxis) {
    return `Línea ${mmszSintaxis[1]}, columna ${mmszSintaxis[2]}: error de sintaxis. Revisa que no falte un «;», una llave { } o un paréntesis.`;
  }
  // Error al ejecutar: "3:49 variable x does not exist"
  const mmszEjecucion = mmszMensaje.match(/^(\d+):\d+\s+(.+)$/m);
  if (mmszEjecucion) return `Línea ${mmszEjecucion[1]}: ${mmszEjecucion[2]}`;
  return mmszMensaje.trim().split('\n')[0].replace(/^ERROR:\s*/, '');
}

self.onmessage = (e: MessageEvent<string>) => {
  let mmszSalida = '';
  try {
    MMSZ_JSCPP.run(e.data, '', { stdio: { write: (s: string) => { mmszSalida += s; } } });
    self.postMessage({ output: mmszSalida });
  } catch (mmszErr) {
    const mmszMsg = String((mmszErr as Error)?.message ?? mmszErr);
    self.postMessage({ output: mmszSalida, error: mmszLimpiarError(mmszMsg) });
  }
};
