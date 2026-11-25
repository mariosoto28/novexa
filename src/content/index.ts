import { mmszPython } from './python';
import { mmszJavascript } from './javascript';
import { mmszCpp } from './cpp';
import { mmszConVideos } from './mmszVideos';
import type { MmszCourse, MmszLesson, MmszRecuerdo } from '../types';

function mmszConAnimada(mmszLeccion: MmszLesson, mmszRecuerdo?: MmszRecuerdo): MmszLesson {
  const mmszLecturas = mmszLeccion.mmszItems.flatMap((mmszIt) => (mmszIt.mmszTipo === 'lectura' ? [mmszIt.mmszContenido] : []));
  if (!mmszLecturas.length) return mmszLeccion;
  return {
    ...mmszLeccion,
    mmszItems: [
      {
        mmszTipo: 'animada',
        mmszId: `${mmszLeccion.mmszId}-a1`,
        mmszTitulo: `Lección animada: ${mmszLeccion.mmszTitle}`,
        mmszLecturas,
        mmszRecuerdo,
      },
      ...mmszLeccion.mmszItems,
    ],
  };
}

function mmszConGuia(mmszLeccion: MmszLesson, mmszRecuerdo?: MmszRecuerdo): MmszLesson {
  const mmszI = mmszLeccion.mmszItems.findIndex((mmszIt) => mmszIt.mmszTipo === 'guiado');
  if (mmszI === -1) return mmszLeccion;
  const mmszG = mmszLeccion.mmszItems[mmszI];
  if (mmszG.mmszTipo !== 'guiado') return mmszLeccion;
  const mmszItems = [...mmszLeccion.mmszItems];
  mmszItems.splice(mmszI, 0, {
    mmszTipo: 'guia',
    mmszId: `${mmszLeccion.mmszId}-p1`,
    mmszTitulo: `Guía paso a paso: ${mmszG.mmszTitulo.replace(/^Programa guiado: /, '')}`,
    mmszObjetivo: mmszG.mmszObjetivo,
    mmszCodigo: mmszG.mmszCodigo,
    mmszSalida: mmszG.mmszSalida,
    mmszRecuerdo,
  });
  return { ...mmszLeccion, mmszItems };
}

function mmszConGuiado(mmszLeccion: MmszLesson): MmszLesson {
  const mmszI = mmszLeccion.mmszItems.findIndex((mmszIt) => mmszIt.mmszTipo === 'desafio');
  if (mmszI === -1) return mmszLeccion;
  const mmszD = mmszLeccion.mmszItems[mmszI];
  if (mmszD.mmszTipo !== 'desafio') return mmszLeccion;
  const mmszUltimo = mmszD.mmszPasos[mmszD.mmszPasos.length - 1];
  const mmszGuiado = {
    mmszTipo: 'guiado' as const,
    mmszId: `${mmszLeccion.mmszId}-g1`,
    mmszTitulo: `Programa guiado: ${mmszD.mmszTitulo.replace(/^Desafío: /, '')}`,
    mmszObjetivo: mmszD.mmszPasos.map((mmszP) => mmszP.mmszInstrucciones).join('\n\n'),
    mmszCodigo: mmszUltimo.mmszSolucion,
    mmszSalida: mmszUltimo.mmszSalida,
  };
  const mmszItems = [...mmszLeccion.mmszItems];
  mmszItems.splice(mmszI, 0, mmszGuiado);
  return { ...mmszLeccion, mmszItems };
}

const mmszConTodo = (mmszCurso: MmszCourse): MmszCourse => {
  const mmszOrden = mmszCurso.mmszUnits.flatMap((mmszU) => mmszU.mmszLessons);
  const mmszRecuerdoDe = (mmszL: MmszLesson): MmszRecuerdo | undefined => {
    const mmszP = mmszOrden[mmszOrden.findIndex((mmszX) => mmszX.mmszId === mmszL.mmszId) - 1];
    return mmszP ? { mmszLeccion: mmszP.mmszTitle, mmszResumen: mmszP.mmszIntro } : undefined;
  };
  return {
    ...mmszCurso,
    mmszUnits: mmszCurso.mmszUnits.map((mmszU) => ({
      ...mmszU,
      mmszLessons: mmszU.mmszLessons.map((mmszL) => {
        const mmszR = mmszRecuerdoDe(mmszL);
        return mmszConGuia(mmszConGuiado(mmszConAnimada(mmszConVideos(mmszL), mmszR)), mmszR);
      }),
    })),
  };
};

export const mmszCourses: MmszCourse[] = [mmszPython, mmszJavascript, mmszCpp].map(mmszConTodo);

const mmszCacheSinVideos = new Map<string, MmszCourse>();
export function mmszSinVideos(mmszCurso: MmszCourse): MmszCourse {
  const mmszGuardado = mmszCacheSinVideos.get(mmszCurso.mmszId);
  if (mmszGuardado) return mmszGuardado;
  const mmszNuevo: MmszCourse = {
    ...mmszCurso,
    mmszUnits: mmszCurso.mmszUnits.map((mmszU) => ({
      ...mmszU,
      mmszLessons: mmszU.mmszLessons.map((mmszL) => ({ ...mmszL, mmszItems: mmszL.mmszItems.filter((mmszIt) => mmszIt.mmszTipo !== 'video') })),
    })),
  };
  mmszCacheSinVideos.set(mmszCurso.mmszId, mmszNuevo);
  return mmszNuevo;
}

export function mmszCursoSegunModo(mmszCurso: MmszCourse, mmszOffline: boolean): MmszCourse {
  return mmszOffline ? mmszSinVideos(mmszCurso) : mmszCurso;
}

export function mmszGetCourse(mmszId: string): MmszCourse {
  const mmszC = mmszCourses.find((mmszX) => mmszX.mmszId === mmszId);
  if (!mmszC) throw new Error(`Curso no encontrado: ${mmszId}`);
  return mmszC;
}

export function mmszAllLessons(mmszCourse: MmszCourse): MmszLesson[] {
  return mmszCourse.mmszUnits.flatMap((mmszU) => mmszU.mmszLessons);
}
