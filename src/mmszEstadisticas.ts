// Autor: MMSZ (Mario Soto Zea)
// Cálculos de avance para el diseño dinámico: cuánto llevas de cada curso, unidad y lección,
// y cuál es el siguiente paso recomendado.
import type { MmszCourse, MmszItem, MmszLesson, MmszNivel, MmszUnit } from './types';
import type { MmszProgress } from './progress';

export interface MmszAvance {
  hechos: number;
  total: number;
  pct: number; // 0 a 100
}

const mmszAvance = (hechos: number, total: number): MmszAvance => ({
  hechos,
  total,
  pct: total ? Math.round((hechos / total) * 100) : 0,
});

/** Avance de una lección: sus recursos de "Aprende" más la práctica. */
export function mmszAvanceLeccion(l: MmszLesson, p: MmszProgress): MmszAvance {
  const mmszHechos = l.items.filter((it) => p.completed[it.id]).length + (p.completed[l.id] ? 1 : 0);
  return mmszAvance(mmszHechos, l.items.length + 1);
}

export function mmszAvanceUnidad(u: MmszUnit, p: MmszProgress): MmszAvance {
  const a = u.lessons.map((l) => mmszAvanceLeccion(l, p));
  return mmszAvance(
    a.reduce((s, x) => s + x.hechos, 0),
    a.reduce((s, x) => s + x.total, 0),
  );
}

export function mmszAvanceCurso(c: MmszCourse, p: MmszProgress): MmszAvance {
  const a = c.units.map((u) => mmszAvanceUnidad(u, p));
  return mmszAvance(
    a.reduce((s, x) => s + x.hechos, 0),
    a.reduce((s, x) => s + x.total, 0),
  );
}

export interface MmszSiguiente {
  unidad: number;
  leccion: MmszLesson;
  item: MmszItem | null; // null = toca la práctica
}

/** Primer recurso sin completar, en orden. Si todo está hecho, null. */
export function mmszSiguientePaso(c: MmszCourse, p: MmszProgress, mmszDesdeUnidad = 0): MmszSiguiente | null {
  for (let ui = mmszDesdeUnidad; ui < c.units.length; ui++) {
    for (const l of c.units[ui].lessons) {
      const mmszItem = l.items.find((it) => !p.completed[it.id]);
      if (mmszItem) return { unidad: ui, leccion: l, item: mmszItem };
      if (!p.completed[l.id]) return { unidad: ui, leccion: l, item: null };
    }
  }
  return null;
}

/** Nivel en el que va el estudiante dentro del curso. */
export function mmszNivelActual(c: MmszCourse, p: MmszProgress): MmszNivel {
  const s = mmszSiguientePaso(c, p);
  return s ? c.units[s.unidad].nivel : 'Avanzado';
}

/** Avance agrupado por nivel (Básico / Intermedio / Avanzado). */
export function mmszAvancePorNivel(c: MmszCourse, p: MmszProgress): { nivel: MmszNivel; avance: MmszAvance }[] {
  const mmszNiveles: MmszNivel[] = ['Básico', 'Intermedio', 'Avanzado'];
  return mmszNiveles.map((nivel) => {
    const a = c.units.filter((u) => u.nivel === nivel).map((u) => mmszAvanceUnidad(u, p));
    return {
      nivel,
      avance: mmszAvance(
        a.reduce((s, x) => s + x.hechos, 0),
        a.reduce((s, x) => s + x.total, 0),
      ),
    };
  });
}

export const MMSZ_COLOR_TIPO: Record<MmszItem['tipo'] | 'practica', string> = {
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
