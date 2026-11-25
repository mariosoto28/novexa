import type { MmszCourse, MmszItem, MmszLesson, MmszNivel, MmszUnit } from './types';
import type { MmszProgress } from './progress';

export interface MmszAvance {
  mmszHechos: number;
  mmszTotal: number;
  mmszPct: number;
}

const mmszAvance = (mmszHechos: number, mmszTotal: number): MmszAvance => ({
  mmszHechos,
  mmszTotal,
  mmszPct: mmszTotal ? Math.round((mmszHechos / mmszTotal) * 100) : 0,
});

export function mmszAvanceLeccion(mmszL: MmszLesson, mmszP: MmszProgress): MmszAvance {
  const mmszHechos = mmszL.mmszItems.filter((mmszIt) => mmszP.mmszCompleted[mmszIt.mmszId]).length + (mmszP.mmszCompleted[mmszL.mmszId] ? 1 : 0);
  return mmszAvance(mmszHechos, mmszL.mmszItems.length + 1);
}

export function mmszAvanceUnidad(mmszU: MmszUnit, mmszP: MmszProgress): MmszAvance {
  const mmszA = mmszU.mmszLessons.map((mmszL) => mmszAvanceLeccion(mmszL, mmszP));
  return mmszAvance(
    mmszA.reduce((mmszS, mmszX) => mmszS + mmszX.mmszHechos, 0),
    mmszA.reduce((mmszS, mmszX) => mmszS + mmszX.mmszTotal, 0),
  );
}

export function mmszAvanceCurso(mmszC: MmszCourse, mmszP: MmszProgress): MmszAvance {
  const mmszA = mmszC.mmszUnits.map((mmszU) => mmszAvanceUnidad(mmszU, mmszP));
  return mmszAvance(
    mmszA.reduce((mmszS, mmszX) => mmszS + mmszX.mmszHechos, 0),
    mmszA.reduce((mmszS, mmszX) => mmszS + mmszX.mmszTotal, 0),
  );
}

export interface MmszSiguiente {
  mmszUnidad: number;
  mmszLeccion: MmszLesson;
  mmszItem: MmszItem | null;
}

export function mmszSiguientePaso(mmszC: MmszCourse, mmszP: MmszProgress, mmszDesdeUnidad = 0): MmszSiguiente | null {
  for (let mmszUi = mmszDesdeUnidad; mmszUi < mmszC.mmszUnits.length; mmszUi++) {
    for (const mmszL of mmszC.mmszUnits[mmszUi].mmszLessons) {
      const mmszItem = mmszL.mmszItems.find((mmszIt) => !mmszP.mmszCompleted[mmszIt.mmszId]);
      if (mmszItem) return { mmszUnidad: mmszUi, mmszLeccion: mmszL, mmszItem };
      if (!mmszP.mmszCompleted[mmszL.mmszId]) return { mmszUnidad: mmszUi, mmszLeccion: mmszL, mmszItem: null };
    }
  }
  return null;
}

export function mmszNivelActual(mmszC: MmszCourse, mmszP: MmszProgress): MmszNivel {
  const mmszS = mmszSiguientePaso(mmszC, mmszP);
  return mmszS ? mmszC.mmszUnits[mmszS.mmszUnidad].mmszNivel : 'Avanzado';
}

export function mmszAvancePorNivel(mmszC: MmszCourse, mmszP: MmszProgress): { mmszNivel: MmszNivel; mmszAvance: MmszAvance }[] {
  const mmszNiveles: MmszNivel[] = ['Básico', 'Intermedio', 'Avanzado'];
  return mmszNiveles.map((mmszNivel) => {
    const mmszA = mmszC.mmszUnits.filter((mmszU) => mmszU.mmszNivel === mmszNivel).map((mmszU) => mmszAvanceUnidad(mmszU, mmszP));
    return {
      mmszNivel,
      mmszAvance: mmszAvance(
        mmszA.reduce((mmszS, mmszX) => mmszS + mmszX.mmszHechos, 0),
        mmszA.reduce((mmszS, mmszX) => mmszS + mmszX.mmszTotal, 0),
      ),
    };
  });
}

export const MMSZ_COLOR_TIPO: Record<MmszItem['mmszTipo'] | 'practica', string> = {
  video: '#e5484d',
  lectura: '#7a5af8',
  consejo: '#e8b83a',
  repaso: '#1f9d74',
  desafio: '#f08c2e',
  proyecto: '#d23a6f',
  practica: '#3fb6a8',
  animada: '#13a89e',
  guiado: '#8f6ae6',
  guia: '#c2410c',
};
