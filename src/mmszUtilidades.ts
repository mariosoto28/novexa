// Autor: MMSZ (Mario Soto Zea)
// Funciones de apoyo para el panel del estudiante: nivel, notificaciones, logros y búsqueda.
import { mmszCourses, mmszAllLessons } from './content';
import { mmszDayKey, MMSZ_MAX_HEARTS, mmszMinutesToNextHeart, type MmszProgress } from './progress';
import type { MmszCourse, MmszLesson } from './types';

/** Secciones del panel del estudiante. */
export type MmszSeccion = 'cursos' | 'avance' | 'perfil' | 'configuracion' | 'ayuda';

/** Acciones de navegación que usan la barra superior y las pantallas. */
export interface MmszNav {
  atras: () => void;
  puedeAtras: boolean;
  irInicio: (mmszSeccion?: MmszSeccion) => void;
  abrirCurso: (mmszCursoId: string, mmszUnidad?: number) => void;
  abrirItem: (mmszCursoId: string, mmszLeccionId: string, mmszItemId: string) => void;
  practicar: (mmszCursoId: string, mmszLeccionId: string) => void;
  cerrarSesion: () => void;
}

export const MMSZ_XP_POR_NIVEL = 50;

export function mmszCalcularNivel(mmszXp: number) {
  return {
    nivel: Math.floor(mmszXp / MMSZ_XP_POR_NIVEL) + 1,
    xpEnNivel: mmszXp % MMSZ_XP_POR_NIVEL,
    xpMeta: MMSZ_XP_POR_NIVEL,
  };
}

/** "Mario Soto Zea" -> "MS" */
export function mmszIniciales(mmszNombre: string): string {
  const mmszPartes = mmszNombre.trim().split(/\s+/).filter(Boolean);
  return mmszPartes
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');
}

/** Cuántas prácticas de lección completaste en todos los cursos. */
export function mmszLeccionesCompletadas(mmszProgreso: MmszProgress): number {
  return mmszCourses.flatMap((c) => mmszAllLessons(c)).filter((l) => mmszProgreso.completed[l.id]).length;
}

export function mmszLeccionesHechas(mmszCurso: MmszCourse, mmszProgreso: MmszProgress): number {
  return mmszAllLessons(mmszCurso).filter((l) => mmszProgreso.completed[l.id]).length;
}

/** Primera lección que falta completar del curso (o null si ya terminó). */
export function mmszSiguienteLeccion(mmszCurso: MmszCourse, mmszProgreso: MmszProgress): MmszLesson | null {
  return mmszAllLessons(mmszCurso).find((l) => !mmszProgreso.completed[l.id]) ?? null;
}

export interface MmszNotificacion {
  id: string;
  icono: string;
  texto: string;
  cursoId?: string; // si existe, al hacer clic se abre ese curso
}

/** Avisos calculados a partir del progreso actual. */
export function mmszNotificaciones(mmszProgreso: MmszProgress): MmszNotificacion[] {
  const mmszLista: MmszNotificacion[] = [];
  const mmszHoy = mmszDayKey();

  if (mmszProgreso.lastActiveDay !== mmszHoy && mmszProgreso.lastActiveDay !== null) {
    mmszLista.push({
      id: 'racha',
      icono: '🔥',
      texto:
        mmszProgreso.streak > 0
          ? `Completa una lección hoy para mantener tu racha de ${mmszProgreso.streak} días.`
          : 'Completa una lección hoy para empezar una nueva racha.',
    });
  }
  if (mmszProgreso.lastActiveDay === null) {
    mmszLista.push({ id: 'bienvenida', icono: '👋', texto: '¡Bienvenido a Novexa! Empieza tu primera lección de Python.', cursoId: 'python' });
  }
  if (mmszProgreso.hearts < MMSZ_MAX_HEARTS) {
    mmszLista.push({
      id: 'vidas',
      icono: '❤️',
      texto: `Tienes ${mmszProgreso.hearts} de ${MMSZ_MAX_HEARTS} vidas. La próxima se recupera en ${mmszMinutesToNextHeart(mmszProgreso)} min.`,
    });
  }
  for (const mmszCurso of mmszCourses) {
    const mmszHechas = mmszLeccionesHechas(mmszCurso, mmszProgreso);
    const mmszSiguiente = mmszSiguienteLeccion(mmszCurso, mmszProgreso);
    if (mmszHechas > 0 && mmszSiguiente) {
      mmszLista.push({
        id: `sig-${mmszCurso.id}`,
        icono: mmszCurso.icon,
        texto: `Te espera “${mmszSiguiente.title}” en ${mmszCurso.name}.`,
        cursoId: mmszCurso.id,
      });
    }
    if (!mmszSiguiente) {
      mmszLista.push({ id: `fin-${mmszCurso.id}`, icono: '🏆', texto: `¡Terminaste todas las lecciones de ${mmszCurso.name}!` });
    }
  }
  return mmszLista;
}

export interface MmszLogro {
  id: string;
  icono: string;
  titulo: string;
  descripcion: string;
  logrado: boolean;
}

export function mmszLogros(mmszProgreso: MmszProgress): MmszLogro[] {
  const mmszTotalHechas = mmszLeccionesCompletadas(mmszProgreso);
  const mmszCursosEmpezados = mmszCourses.filter((c) => mmszLeccionesHechas(c, mmszProgreso) > 0).length;
  const mmszCursoTerminado = mmszCourses.some((c) => !mmszSiguienteLeccion(c, mmszProgreso));
  return [
    { id: 'primer-paso', icono: '👣', titulo: 'Primer paso', descripcion: 'Completa tu primera lección', logrado: mmszTotalHechas >= 1 },
    { id: 'constante', icono: '🔥', titulo: 'Constante', descripcion: 'Llega a una racha de 3 días', logrado: mmszProgreso.streak >= 3 },
    { id: 'cien-xp', icono: '⭐', titulo: '100 XP', descripcion: 'Junta 100 puntos de experiencia', logrado: mmszProgreso.xp >= 100 },
    { id: 'poliglota', icono: '🌐', titulo: 'Políglota', descripcion: 'Practica los 3 lenguajes', logrado: mmszCursosEmpezados === mmszCourses.length },
    { id: 'graduado', icono: '🎓', titulo: 'Graduado', descripcion: 'Termina un curso completo', logrado: mmszCursoTerminado },
  ];
}

export interface MmszResultado {
  cursoId: string;
  cursoNombre: string;
  icono: string;
  titulo: string;
  detalle: string;
}

const mmszSinTildes = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Busca cursos, unidades y lecciones por texto (sin importar tildes ni mayúsculas). */
export function mmszBuscar(mmszTexto: string): MmszResultado[] {
  const mmszQ = mmszSinTildes(mmszTexto.trim());
  if (!mmszQ) return [];
  const mmszResultados: MmszResultado[] = [];
  for (const c of mmszCourses) {
    if (mmszSinTildes(c.name).includes(mmszQ)) {
      mmszResultados.push({ cursoId: c.id, cursoNombre: c.name, icono: c.icon, titulo: c.name, detalle: 'Curso' });
    }
    for (const u of c.units) {
      for (const l of u.lessons) {
        if (mmszSinTildes(`${l.title} ${l.intro}`).includes(mmszQ)) {
          mmszResultados.push({ cursoId: c.id, cursoNombre: c.name, icono: c.icon, titulo: l.title, detalle: `${c.name} · ${u.title}` });
        }
      }
    }
  }
  return mmszResultados.slice(0, 8);
}
