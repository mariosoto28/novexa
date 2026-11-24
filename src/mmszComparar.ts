// Autor: MMSZ (Mario Soto Zea)
// Reglas para comparar respuestas de los estudiantes.

/** Quita espacios extra y saltos de línea de Windows. */
const mmszEspacios = (s: string) => s.replace(/\r/g, '').trim().replace(/\s+/g, ' ');

/**
 * Compara la salida de un programa con la esperada sin importar mayúsculas ni espacios extra:
 * "hola, soy estudiante" cuenta igual que "Hola, soy estudiante".
 */
export function mmszMismaSalida(mmszObtenida: string, mmszEsperada: string): boolean {
  return mmszEspacios(mmszObtenida).toLowerCase() === mmszEspacios(mmszEsperada).toLowerCase();
}

/** Compara código exacto (en programación las mayúsculas importan: print ≠ Print). */
export function mmszMismoCodigo(a: string, b: string): boolean {
  return mmszEspacios(a) === mmszEspacios(b);
}

/** true si dos textos solo se diferencian en mayúsculas/minúsculas. */
export function mmszSoloMayusculas(a: string, b: string): boolean {
  return !mmszMismoCodigo(a, b) && mmszEspacios(a).toLowerCase() === mmszEspacios(b).toLowerCase();
}

export const MMSZ_AVISO_MAYUSCULAS =
  'Casi: solo cambian las mayúsculas. En el código sí importan (por ejemplo, print no es lo mismo que Print).';
