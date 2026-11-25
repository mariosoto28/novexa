const mmszEspacios = (mmszS: string) => mmszS.replace(/\r/g, '').trim().replace(/\s+/g, ' ');

export function mmszMismaSalida(mmszObtenida: string, mmszEsperada: string): boolean {
  return mmszEspacios(mmszObtenida).toLowerCase() === mmszEspacios(mmszEsperada).toLowerCase();
}

export function mmszMismoCodigo(mmszA: string, mmszB: string): boolean {
  return mmszEspacios(mmszA) === mmszEspacios(mmszB);
}

export function mmszSoloMayusculas(mmszA: string, mmszB: string): boolean {
  return !mmszMismoCodigo(mmszA, mmszB) && mmszEspacios(mmszA).toLowerCase() === mmszEspacios(mmszB).toLowerCase();
}

export const MMSZ_AVISO_MAYUSCULAS =
  'Casi: solo cambian las mayúsculas. En el código sí importan (por ejemplo, print no es lo mismo que Print).';
