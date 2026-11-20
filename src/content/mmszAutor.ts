// Autor: MMSZ (Mario Soto Zea)
// Funciones cortas para escribir el contenido de los cursos sin repetir tanto código.
import type {
  MmszDesafio,
  MmszExercise,
  MmszItem,
  MmszLectura,
  MmszLesson,
  MmszNivel,
  MmszPaso,
  MmszUnit,
} from '../types';

type MmszSinId<T> = T extends unknown ? Omit<T, 'id'> : never;

/** Quita la sangría común de un texto escrito con `...` para que el código quede limpio. */
export function mmszLimpio(mmszTexto: string): string {
  const mmszLineas = mmszTexto.replace(/^\n/, '').replace(/\n\s*$/, '').split('\n');
  const mmszMin = Math.min(
    ...mmszLineas.filter((l) => l.trim()).map((l) => l.match(/^ */)![0].length),
  );
  return mmszLineas.map((l) => l.slice(Number.isFinite(mmszMin) ? mmszMin : 0)).join('\n');
}

export const mmszLectura = (titulo: string, contenido: string): MmszSinId<MmszLectura> => ({
  tipo: 'lectura',
  titulo,
  contenido: mmszLimpio(contenido),
});
export const mmszConsejo = (titulo: string, contenido: string): MmszSinId<MmszLectura> => ({
  tipo: 'consejo',
  titulo: `Consejo rápido: ${titulo}`,
  contenido: mmszLimpio(contenido),
});
export const mmszRepaso = (titulo: string, contenido: string): MmszSinId<MmszLectura> => ({
  tipo: 'repaso',
  titulo: `Repaso: ${titulo}`,
  contenido: mmszLimpio(contenido),
});

export function mmszPaso(
  titulo: string,
  instrucciones: string,
  mmszOpciones: Omit<MmszPaso, 'titulo' | 'instrucciones'>,
): MmszPaso {
  const mmszL = (s?: string) => (s === undefined ? undefined : mmszLimpio(s));
  return {
    titulo,
    instrucciones: mmszLimpio(instrucciones),
    ...mmszOpciones,
    inicio: mmszL(mmszOpciones.inicio),
    pista: mmszL(mmszOpciones.pista),
    salida: mmszL(mmszOpciones.salida),
    solucion: mmszLimpio(mmszOpciones.solucion),
  };
}

export const mmszDesafio = (titulo: string, pasos: MmszPaso[]): MmszSinId<MmszDesafio> => ({
  tipo: 'desafio',
  titulo: `Desafío: ${titulo}`,
  pasos,
});
export const mmszProyecto = (titulo: string, pasos: MmszPaso[]): MmszSinId<MmszDesafio> => ({
  tipo: 'proyecto',
  titulo: `Proyecto: ${titulo}`,
  pasos,
});

/* ---------- Preguntas de "Practica" ---------- */

/** Opción múltiple: la opción correcta empieza con "*". */
export function mmszElige(prompt: string, opciones: string[], explain: string, code?: string): MmszExercise {
  const answer = opciones.findIndex((o) => o.startsWith('*'));
  if (answer < 0) throw new Error(`Falta la opción correcta en: ${prompt}`);
  return {
    type: 'choice',
    prompt,
    code: code === undefined ? undefined : mmszLimpio(code),
    options: opciones.map((o) => o.replace(/^\*/, '')),
    answer,
    explain,
  };
}

export const mmszCompleta = (prompt: string, code: string, answers: string[], explain: string): MmszExercise => ({
  type: 'fill',
  prompt,
  code: mmszLimpio(code),
  answers,
  explain,
});

export const mmszOrdena = (prompt: string, lines: string[], explain: string): MmszExercise => ({
  type: 'order',
  prompt,
  lines,
  explain,
});

export const mmszEscribe = (
  prompt: string,
  starter: string,
  expectedOutput: string,
  solucion: string,
): MmszExercise => ({
  type: 'code',
  prompt,
  starter: starter ? mmszLimpio(starter) + '\n' : '',
  expectedOutput: mmszLimpio(expectedOutput),
  solucion: mmszLimpio(solucion),
  explain: `Una solución:\n${mmszLimpio(solucion)}`,
});

/* ---------- Lecciones y unidades ---------- */

export function mmszLeccion(
  id: string,
  title: string,
  intro: string,
  items: MmszSinId<MmszItem>[],
  exercises: MmszExercise[],
): MmszLesson {
  return {
    id,
    title,
    intro,
    items: items.map((it, i) => ({ ...it, id: `${id}-${i + 1}` }) as MmszItem),
    exercises,
  };
}

export const mmszUnidad = (
  nivel: MmszNivel,
  title: string,
  description: string,
  lessons: MmszLesson[],
): MmszUnit => ({ nivel, title, description, lessons });
