// Autor: MMSZ (Mario Soto Zea)
import { mmszPython } from './python';
import { mmszJavascript } from './javascript';
import { mmszCpp } from './cpp';
import { mmszConVideos } from './mmszVideos';
import type { MmszCourse, MmszLesson } from '../types';

/** Agrega los videos de YouTube a las lecciones de un curso. */
const mmszConTodo = (mmszCurso: MmszCourse): MmszCourse => ({
  ...mmszCurso,
  units: mmszCurso.units.map((u) => ({ ...u, lessons: u.lessons.map(mmszConVideos) })),
});

export const mmszCourses: MmszCourse[] = [mmszPython, mmszJavascript, mmszCpp].map(mmszConTodo);

export function mmszGetCourse(id: string): MmszCourse {
  const c = mmszCourses.find((x) => x.id === id);
  if (!c) throw new Error(`Curso no encontrado: ${id}`);
  return c;
}

/** Todas las lecciones del curso en orden, para saber cuál se desbloquea. */
export function mmszAllLessons(mmszCourse: MmszCourse): MmszLesson[] {
  return mmszCourse.units.flatMap((u) => u.lessons);
}
