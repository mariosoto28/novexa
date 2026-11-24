// Autor: MMSZ (Mario Soto Zea)
import { mmszPython } from './python';
import { mmszJavascript } from './javascript';
import { mmszCpp } from './cpp';
import { mmszConVideos } from './mmszVideos';
import type { MmszCourse, MmszLesson, MmszRecuerdo } from '../types';

/** Agrega al inicio de la lección una "lección animada" (offline) hecha con sus lecturas. */
function mmszConAnimada(mmszLeccion: MmszLesson, mmszRecuerdo?: MmszRecuerdo): MmszLesson {
  const mmszLecturas = mmszLeccion.items.flatMap((it) => (it.tipo === 'lectura' ? [it.contenido] : []));
  if (!mmszLecturas.length) return mmszLeccion;
  return {
    ...mmszLeccion,
    items: [
      {
        tipo: 'animada',
        id: `${mmszLeccion.id}-a1`,
        titulo: `Lección animada: ${mmszLeccion.title}`,
        lecturas: mmszLecturas,
        recuerdo: mmszRecuerdo,
      },
      ...mmszLeccion.items,
    ],
  };
}

/** Antes del programa guiado, agrega una "guía paso a paso" (video interactivo) del mismo programa. */
function mmszConGuia(mmszLeccion: MmszLesson, mmszRecuerdo?: MmszRecuerdo): MmszLesson {
  const i = mmszLeccion.items.findIndex((it) => it.tipo === 'guiado');
  if (i === -1) return mmszLeccion;
  const g = mmszLeccion.items[i];
  if (g.tipo !== 'guiado') return mmszLeccion;
  const mmszItems = [...mmszLeccion.items];
  mmszItems.splice(i, 0, {
    tipo: 'guia',
    id: `${mmszLeccion.id}-p1`,
    titulo: `Guía paso a paso: ${g.titulo.replace(/^Programa guiado: /, '')}`,
    objetivo: g.objetivo,
    codigo: g.codigo,
    salida: g.salida,
    recuerdo: mmszRecuerdo,
  });
  return { ...mmszLeccion, items: mmszItems };
}

/** Antes del primer desafío de la lección, agrega un "programa guiado" que lo construye paso a paso. */
function mmszConGuiado(mmszLeccion: MmszLesson): MmszLesson {
  const i = mmszLeccion.items.findIndex((it) => it.tipo === 'desafio');
  if (i === -1) return mmszLeccion;
  const d = mmszLeccion.items[i];
  if (d.tipo !== 'desafio') return mmszLeccion;
  const mmszUltimo = d.pasos[d.pasos.length - 1];
  const mmszGuiado = {
    tipo: 'guiado' as const,
    id: `${mmszLeccion.id}-g1`,
    titulo: `Programa guiado: ${d.titulo.replace(/^Desafío: /, '')}`,
    objetivo: d.pasos.map((p) => p.instrucciones).join('\n\n'),
    codigo: mmszUltimo.solucion,
    salida: mmszUltimo.salida,
  };
  const mmszItems = [...mmszLeccion.items];
  mmszItems.splice(i, 0, mmszGuiado);
  return { ...mmszLeccion, items: mmszItems };
}

/**
 * Agrega a cada lección: videos de YouTube, lección animada, guía paso a paso y programa guiado.
 * Cada lección "recuerda" la anterior del curso para decir "¿Recuerdas…?".
 */
const mmszConTodo = (mmszCurso: MmszCourse): MmszCourse => {
  const mmszOrden = mmszCurso.units.flatMap((u) => u.lessons);
  const mmszRecuerdoDe = (l: MmszLesson): MmszRecuerdo | undefined => {
    const p = mmszOrden[mmszOrden.findIndex((x) => x.id === l.id) - 1];
    return p ? { leccion: p.title, resumen: p.intro } : undefined;
  };
  return {
    ...mmszCurso,
    units: mmszCurso.units.map((u) => ({
      ...u,
      lessons: u.lessons.map((l) => {
        const r = mmszRecuerdoDe(l);
        return mmszConGuia(mmszConGuiado(mmszConAnimada(mmszConVideos(l), r)), r);
      }),
    })),
  };
};

export const mmszCourses: MmszCourse[] = [mmszPython, mmszJavascript, mmszCpp].map(mmszConTodo);

/** Copia del curso sin los videos de YouTube (para el modo Sin conexión). */
const mmszCacheSinVideos = new Map<string, MmszCourse>();
export function mmszSinVideos(mmszCurso: MmszCourse): MmszCourse {
  const mmszGuardado = mmszCacheSinVideos.get(mmszCurso.id);
  if (mmszGuardado) return mmszGuardado;
  const mmszNuevo: MmszCourse = {
    ...mmszCurso,
    units: mmszCurso.units.map((u) => ({
      ...u,
      lessons: u.lessons.map((l) => ({ ...l, items: l.items.filter((it) => it.tipo !== 'video') })),
    })),
  };
  mmszCacheSinVideos.set(mmszCurso.id, mmszNuevo);
  return mmszNuevo;
}

/** El curso tal como se debe mostrar según el modo elegido (con o sin videos de YouTube). */
export function mmszCursoSegunModo(mmszCurso: MmszCourse, mmszOffline: boolean): MmszCourse {
  return mmszOffline ? mmszSinVideos(mmszCurso) : mmszCurso;
}

export function mmszGetCourse(id: string): MmszCourse {
  const c = mmszCourses.find((x) => x.id === id);
  if (!c) throw new Error(`Curso no encontrado: ${id}`);
  return c;
}

/** Todas las lecciones del curso en orden, para saber cuál se desbloquea. */
export function mmszAllLessons(mmszCourse: MmszCourse): MmszLesson[] {
  return mmszCourse.units.flatMap((u) => u.lessons);
}
