import { mmszCourses, mmszAllLessons } from './content';
import { mmszDayKey, MMSZ_MAX_HEARTS, mmszMinutesToNextHeart, type MmszProgress } from './progress';
import type { MmszCourse, MmszLesson } from './types';

export type MmszSeccion = 'cursos' | 'avance' | 'perfil' | 'configuracion' | 'ayuda';

export interface MmszNav {
  mmszAtras: () => void;
  mmszPuedeAtras: boolean;
  mmszIrInicio: (mmszSeccion?: MmszSeccion) => void;
  mmszAbrirCurso: (mmszCursoId: string, mmszUnidad?: number) => void;
  mmszAbrirItem: (mmszCursoId: string, mmszLeccionId: string, mmszItemId: string) => void;
  mmszPracticar: (mmszCursoId: string, mmszLeccionId: string) => void;
  mmszCambiarModo: (mmszOffline: boolean) => void;
  mmszCerrarSesion: () => void;
}

export const MMSZ_XP_POR_NIVEL = 50;

export function mmszCalcularNivel(mmszXp: number) {
  return {
    mmszNivel: Math.floor(mmszXp / MMSZ_XP_POR_NIVEL) + 1,
    mmszXpEnNivel: mmszXp % MMSZ_XP_POR_NIVEL,
    mmszXpMeta: MMSZ_XP_POR_NIVEL,
  };
}

export function mmszIniciales(mmszNombre: string): string {
  const mmszPartes = mmszNombre.trim().split(/\s+/).filter(Boolean);
  return mmszPartes
    .slice(0, 2)
    .map((mmszP) => mmszP[0].toUpperCase())
    .join('');
}

export function mmszUnidadDe(mmszCurso: MmszCourse, mmszLeccionId: string): number | undefined {
  const mmszI = mmszCurso.mmszUnits.findIndex((mmszU) => mmszU.mmszLessons.some((mmszL) => mmszL.mmszId === mmszLeccionId));
  return mmszI === -1 ? undefined : mmszI;
}

export function mmszLeccionesCompletadas(mmszProgreso: MmszProgress): number {
  return mmszCourses.flatMap((mmszC) => mmszAllLessons(mmszC)).filter((mmszL) => mmszProgreso.mmszCompleted[mmszL.mmszId]).length;
}

export function mmszLeccionesHechas(mmszCurso: MmszCourse, mmszProgreso: MmszProgress): number {
  return mmszAllLessons(mmszCurso).filter((mmszL) => mmszProgreso.mmszCompleted[mmszL.mmszId]).length;
}

export function mmszSiguienteLeccion(mmszCurso: MmszCourse, mmszProgreso: MmszProgress): MmszLesson | null {
  return mmszAllLessons(mmszCurso).find((mmszL) => !mmszProgreso.mmszCompleted[mmszL.mmszId]) ?? null;
}

export interface MmszNotificacion {
  mmszId: string;
  mmszIcono: string;
  mmszTexto: string;
  mmszCursoId?: string;
  mmszUnidad?: number;
}

export function mmszNotificaciones(mmszProgreso: MmszProgress): MmszNotificacion[] {
  const mmszLista: MmszNotificacion[] = [];
  const mmszHoy = mmszDayKey();

  if (mmszProgreso.mmszLastActiveDay !== mmszHoy && mmszProgreso.mmszLastActiveDay !== null) {
    mmszLista.push({
      mmszId: 'racha',
      mmszIcono: '🔥',
      mmszTexto:
        mmszProgreso.mmszStreak > 0
          ? `Completa una lección hoy para mantener tu racha de ${mmszProgreso.mmszStreak} días.`
          : 'Completa una lección hoy para empezar una nueva racha.',
    });
  }
  if (mmszProgreso.mmszLastActiveDay === null) {
    mmszLista.push({ mmszId: 'bienvenida', mmszIcono: '👋', mmszTexto: '¡Bienvenido a Novexa! Empieza tu primera lección de Python.', mmszCursoId: 'python' });
  }
  if (mmszProgreso.mmszHearts < MMSZ_MAX_HEARTS) {
    mmszLista.push({
      mmszId: 'vidas',
      mmszIcono: '❤️',
      mmszTexto: `Tienes ${mmszProgreso.mmszHearts} de ${MMSZ_MAX_HEARTS} vidas. La próxima se recupera en ${mmszMinutesToNextHeart(mmszProgreso)} min.`,
    });
  }
  for (const mmszCurso of mmszCourses) {
    const mmszHechas = mmszLeccionesHechas(mmszCurso, mmszProgreso);
    const mmszSiguiente = mmszSiguienteLeccion(mmszCurso, mmszProgreso);
    if (mmszHechas > 0 && mmszSiguiente) {
      mmszLista.push({
        mmszId: `sig-${mmszCurso.mmszId}`,
        mmszIcono: mmszCurso.mmszIcon,
        mmszTexto: `Te espera “${mmszSiguiente.mmszTitle}” en ${mmszCurso.mmszName}.`,
        mmszCursoId: mmszCurso.mmszId,
        mmszUnidad: mmszUnidadDe(mmszCurso, mmszSiguiente.mmszId),
      });
    }
    if (!mmszSiguiente) {
      mmszLista.push({ mmszId: `fin-${mmszCurso.mmszId}`, mmszIcono: '🏆', mmszTexto: `¡Terminaste todas las lecciones de ${mmszCurso.mmszName}!` });
    }
  }
  return mmszLista;
}

export interface MmszLogro {
  mmszId: string;
  mmszIcono: string;
  mmszTitulo: string;
  mmszDescripcion: string;
  mmszLogrado: boolean;
}

export function mmszLogros(mmszProgreso: MmszProgress): MmszLogro[] {
  const mmszTotalHechas = mmszLeccionesCompletadas(mmszProgreso);
  const mmszCursosEmpezados = mmszCourses.filter((mmszC) => mmszLeccionesHechas(mmszC, mmszProgreso) > 0).length;
  const mmszCursoTerminado = mmszCourses.some((mmszC) => !mmszSiguienteLeccion(mmszC, mmszProgreso));
  return [
    { mmszId: 'primer-paso', mmszIcono: '👣', mmszTitulo: 'Primer paso', mmszDescripcion: 'Completa tu primera lección', mmszLogrado: mmszTotalHechas >= 1 },
    { mmszId: 'constante', mmszIcono: '🔥', mmszTitulo: 'Constante', mmszDescripcion: 'Llega a una racha de 3 días', mmszLogrado: mmszProgreso.mmszStreak >= 3 },
    { mmszId: 'cien-xp', mmszIcono: '⭐', mmszTitulo: '100 XP', mmszDescripcion: 'Junta 100 puntos de experiencia', mmszLogrado: mmszProgreso.mmszXp >= 100 },
    { mmszId: 'poliglota', mmszIcono: '🌐', mmszTitulo: 'Políglota', mmszDescripcion: 'Practica los 3 lenguajes', mmszLogrado: mmszCursosEmpezados === mmszCourses.length },
    { mmszId: 'graduado', mmszIcono: '🎓', mmszTitulo: 'Graduado', mmszDescripcion: 'Termina un curso completo', mmszLogrado: mmszCursoTerminado },
  ];
}

export interface MmszResultado {
  mmszCursoId: string;
  mmszCursoNombre: string;
  mmszIcono: string;
  mmszTitulo: string;
  mmszDetalle: string;
  mmszUnidad?: number;
}

const mmszSinTildes = (mmszS: string) =>
  mmszS.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export function mmszBuscar(mmszTexto: string): MmszResultado[] {
  const mmszQ = mmszSinTildes(mmszTexto.trim());
  if (!mmszQ) return [];
  const mmszResultados: MmszResultado[] = [];
  for (const mmszC of mmszCourses) {
    if (mmszSinTildes(mmszC.mmszName).includes(mmszQ)) {
      mmszResultados.push({ mmszCursoId: mmszC.mmszId, mmszCursoNombre: mmszC.mmszName, mmszIcono: mmszC.mmszIcon, mmszTitulo: mmszC.mmszName, mmszDetalle: 'Curso' });
    }
    for (const [mmszUi, mmszU] of mmszC.mmszUnits.entries()) {
      for (const mmszL of mmszU.mmszLessons) {
        if (mmszSinTildes(`${mmszL.mmszTitle} ${mmszL.mmszIntro}`).includes(mmszQ)) {
          mmszResultados.push({
            mmszCursoId: mmszC.mmszId,
            mmszCursoNombre: mmszC.mmszName,
            mmszIcono: mmszC.mmszIcon,
            mmszTitulo: mmszL.mmszTitle,
            mmszDetalle: `${mmszC.mmszName} · Unidad ${mmszUi + 1}: ${mmszU.mmszTitle}`,
            mmszUnidad: mmszUi,
          });
        }
      }
    }
  }
  return mmszResultados.slice(0, 8);
}
