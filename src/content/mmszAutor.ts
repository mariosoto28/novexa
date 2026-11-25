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

type MmszSinId<MmszT> = MmszT extends unknown ? Omit<MmszT, 'mmszId'> : never;

export function mmszLimpio(mmszTexto: string): string {
  const mmszLineas = mmszTexto.replace(/^\n/, '').replace(/\n\s*$/, '').split('\n');
  const mmszMin = Math.min(
    ...mmszLineas.filter((mmszL) => mmszL.trim()).map((mmszL) => mmszL.match(/^ */)![0].length),
  );
  return mmszLineas.map((mmszL) => mmszL.slice(Number.isFinite(mmszMin) ? mmszMin : 0)).join('\n');
}

export const mmszLectura = (mmszTitulo: string, mmszContenido: string): MmszSinId<MmszLectura> => ({
  mmszTipo: 'lectura',
  mmszTitulo,
  mmszContenido: mmszLimpio(mmszContenido),
});
export const mmszConsejo = (mmszTitulo: string, mmszContenido: string): MmszSinId<MmszLectura> => ({
  mmszTipo: 'consejo',
  mmszTitulo: `Consejo rápido: ${mmszTitulo}`,
  mmszContenido: mmszLimpio(mmszContenido),
});
export const mmszRepaso = (mmszTitulo: string, mmszContenido: string): MmszSinId<MmszLectura> => ({
  mmszTipo: 'repaso',
  mmszTitulo: `Repaso: ${mmszTitulo}`,
  mmszContenido: mmszLimpio(mmszContenido),
});

export function mmszPaso(
  mmszTitulo: string,
  mmszInstrucciones: string,
  mmszOpciones: Omit<MmszPaso, 'mmszTitulo' | 'mmszInstrucciones'>,
): MmszPaso {
  const mmszL = (mmszS?: string) => (mmszS === undefined ? undefined : mmszLimpio(mmszS));
  return {
    mmszTitulo,
    mmszInstrucciones: mmszLimpio(mmszInstrucciones),
    ...mmszOpciones,
    mmszInicio: mmszL(mmszOpciones.mmszInicio),
    mmszPista: mmszL(mmszOpciones.mmszPista),
    mmszSalida: mmszL(mmszOpciones.mmszSalida),
    mmszSolucion: mmszLimpio(mmszOpciones.mmszSolucion),
  };
}

export const mmszDesafio = (mmszTitulo: string, mmszPasos: MmszPaso[]): MmszSinId<MmszDesafio> => ({
  mmszTipo: 'desafio',
  mmszTitulo: `Desafío: ${mmszTitulo}`,
  mmszPasos,
});
export const mmszProyecto = (mmszTitulo: string, mmszPasos: MmszPaso[]): MmszSinId<MmszDesafio> => ({
  mmszTipo: 'proyecto',
  mmszTitulo: `Proyecto: ${mmszTitulo}`,
  mmszPasos,
});

export function mmszElige(mmszPrompt: string, mmszOpciones: string[], mmszExplain: string, mmszCode?: string): MmszExercise {
  const mmszAnswer = mmszOpciones.findIndex((mmszO) => mmszO.startsWith('*'));
  if (mmszAnswer < 0) throw new Error(`Falta la opción correcta en: ${mmszPrompt}`);
  return {
    mmszType: 'choice',
    mmszPrompt,
    mmszCode: mmszCode === undefined ? undefined : mmszLimpio(mmszCode),
    mmszOptions: mmszOpciones.map((mmszO) => mmszO.replace(/^\*/, '')),
    mmszAnswer,
    mmszExplain,
  };
}

export const mmszCompleta = (mmszPrompt: string, mmszCode: string, mmszAnswers: string[], mmszExplain: string): MmszExercise => ({
  mmszType: 'fill',
  mmszPrompt,
  mmszCode: mmszLimpio(mmszCode),
  mmszAnswers,
  mmszExplain,
});

export const mmszOrdena = (mmszPrompt: string, mmszLines: string[], mmszExplain: string): MmszExercise => ({
  mmszType: 'order',
  mmszPrompt,
  mmszLines,
  mmszExplain,
});

export const mmszEscribe = (
  mmszPrompt: string,
  mmszStarter: string,
  mmszExpectedOutput: string,
  mmszSolucion: string,
): MmszExercise => ({
  mmszType: 'code',
  mmszPrompt,
  mmszStarter: mmszStarter ? mmszLimpio(mmszStarter) + '\n' : '',
  mmszExpectedOutput: mmszLimpio(mmszExpectedOutput),
  mmszSolucion: mmszLimpio(mmszSolucion),
  mmszExplain: `Una solución:\n${mmszLimpio(mmszSolucion)}`,
});

export function mmszLeccion(
  mmszId: string,
  mmszTitle: string,
  mmszIntro: string,
  mmszItems: MmszSinId<MmszItem>[],
  mmszExercises: MmszExercise[],
): MmszLesson {
  return {
    mmszId,
    mmszTitle,
    mmszIntro,
    mmszItems: mmszItems.map((mmszIt, mmszI) => ({ ...mmszIt, mmszId: `${mmszId}-${mmszI + 1}` }) as MmszItem),
    mmszExercises,
  };
}

export const mmszUnidad = (
  mmszNivel: MmszNivel,
  mmszTitle: string,
  mmszDescription: string,
  mmszLessons: MmszLesson[],
): MmszUnit => ({ mmszNivel, mmszTitle, mmszDescription, mmszLessons });
