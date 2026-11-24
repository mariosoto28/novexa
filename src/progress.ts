// Autor: MMSZ (Mario Soto Zea)
// Progreso del estudiante: XP, racha, vidas y lecciones completadas.
import { useCallback, useEffect, useState } from 'react';

export const MMSZ_MAX_HEARTS = 5;
const MMSZ_HEART_REGEN_MS = 20 * 60 * 1000; // 1 vida cada 20 minutos

export interface MmszProgress {
  xp: number;
  streak: number;
  lastActiveDay: string | null;
  hearts: number;
  heartsUpdatedAt: number;
  completed: Record<string, number>; // id de lección -> veces completada
  nombre: string; // nombre que se muestra en la app
  sesionActiva: boolean; // false después de "Finalizar sesión"
  cursosOcultos: string[]; // cursos quitados de "Mis cursos"
  tema: string; // tema de colores elegido en Configuración
  bienvenidaCompleta: boolean; // false hasta terminar la bienvenida del primer inicio
  disenoDinamico: boolean; // diseño de cursos: true = dinámico (predeterminado), false = clásico
  modoOffline: boolean; // true = sin conexión (oculta los videos de YouTube), false = en línea
}

// Nombre provisional: cada persona escribe el suyo en la bienvenida del primer inicio.
export const MMSZ_NOMBRE_PREDETERMINADO = 'Estudiante';

/** Copia de seguridad guardada (automática o manual). */
export interface MmszCopia {
  nombre: string;
  fecha: string; // ISO
  datos: MmszProgress;
}

declare global {
  interface Window {
    api?: {
      loadProgress: () => Promise<{ datos: MmszProgress | null; aviso: string | null } | MmszProgress | null>;
      saveProgress: (p: MmszProgress) => Promise<boolean>;
      listarCopias: () => Promise<MmszCopia[]>;
      copiaManual: (p: MmszProgress, mmszEtiqueta: string) => Promise<boolean>;
      exportarProgreso: (mmszContenido: string) => Promise<{ ok: boolean; ruta?: string }>;
      importarProgreso: () => Promise<{ ok: boolean; contenido?: string; error?: string }>;
    };
  }
}

const MMSZ_STORAGE_KEY = 'novexa-progress';
const MMSZ_STORAGE_KEY_ANTERIOR = 'coderuta-progress'; // nombre anterior de la app

const mmszFresh = (): MmszProgress => ({
  xp: 0,
  streak: 0,
  lastActiveDay: null,
  hearts: MMSZ_MAX_HEARTS,
  heartsUpdatedAt: Date.now(),
  completed: {},
  nombre: MMSZ_NOMBRE_PREDETERMINADO,
  sesionActiva: true,
  cursosOcultos: [],
  tema: 'clasico',
  bienvenidaCompleta: false,
  disenoDinamico: true,
  modoOffline: true, // Novexa es una app de escritorio: por defecto funciona sin conexión
});

export function mmszDayKey(d = new Date()): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const mmszDay = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${mmszDay}`;
}

function mmszYesterdayKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return mmszDayKey(d);
}

/** Recupera vidas con el tiempo y reinicia la racha si se perdió un día. */
function mmszNormalize(p: MmszProgress): MmszProgress {
  const mmszNow = Date.now();
  let { hearts: mmszHearts, heartsUpdatedAt: mmszHeartsUpdatedAt, streak: mmszStreak } = p;
  if (mmszHearts >= MMSZ_MAX_HEARTS) {
    mmszHearts = MMSZ_MAX_HEARTS;
    mmszHeartsUpdatedAt = mmszNow;
  } else {
    const mmszGained = Math.floor((mmszNow - mmszHeartsUpdatedAt) / MMSZ_HEART_REGEN_MS);
    if (mmszGained > 0) {
      mmszHearts = Math.min(MMSZ_MAX_HEARTS, mmszHearts + mmszGained);
      mmszHeartsUpdatedAt = mmszHearts >= MMSZ_MAX_HEARTS ? mmszNow : mmszHeartsUpdatedAt + mmszGained * MMSZ_HEART_REGEN_MS;
    }
  }
  if (p.lastActiveDay && p.lastActiveDay !== mmszDayKey() && p.lastActiveDay !== mmszYesterdayKey()) {
    mmszStreak = 0;
  }
  return { ...p, hearts: mmszHearts, heartsUpdatedAt: mmszHeartsUpdatedAt, streak: mmszStreak };
}

/** Completa los campos que falten (por ejemplo, de versiones anteriores de la app). */
export function mmszCompletarProgreso(mmszDatos: Partial<MmszProgress> | null | undefined): MmszProgress {
  // Quien ya tenía progreso guardado (de antes de existir la bienvenida) no vuelve a verla.
  const mmszYaUsaba = mmszDatos && mmszDatos.bienvenidaCompleta === undefined;
  return mmszNormalize({
    ...mmszFresh(),
    ...(mmszDatos || {}),
    ...(mmszYaUsaba ? { bienvenidaCompleta: true } : {}),
  });
}

/* --- Copias en la versión web (en la app de escritorio las hace Electron en disco) --- */
const MMSZ_PREFIJO_COPIA_WEB = 'novexa-copia-';
const MMSZ_COPIAS_WEB = 7;

function mmszCopiaWeb(p: MmszProgress, mmszNombre = `progreso-${mmszDayKey()}.json`) {
  localStorage.setItem(MMSZ_PREFIJO_COPIA_WEB + mmszNombre, JSON.stringify({ fecha: new Date().toISOString(), datos: p }));
  const mmszDiarias = Object.keys(localStorage)
    .filter((k) => /^novexa-copia-progreso-\d{4}-\d{2}-\d{2}\.json$/.test(k))
    .sort()
    .reverse();
  mmszDiarias.slice(MMSZ_COPIAS_WEB).forEach((k) => localStorage.removeItem(k));
}

export async function mmszListarCopias(): Promise<MmszCopia[]> {
  if (window.api) return window.api.listarCopias();
  return Object.keys(localStorage)
    .filter((k) => k.startsWith(MMSZ_PREFIJO_COPIA_WEB))
    .map((k) => {
      try {
        const { fecha, datos } = JSON.parse(localStorage.getItem(k)!);
        return { nombre: k.slice(MMSZ_PREFIJO_COPIA_WEB.length), fecha, datos } as MmszCopia;
      } catch {
        return null;
      }
    })
    .filter((c): c is MmszCopia => c !== null)
    .sort((a, b) => b.fecha.localeCompare(a.fecha));
}

/** Copia con nombre propio, por ejemplo antes de importar o restaurar. */
export async function mmszCopiaManual(p: MmszProgress, mmszEtiqueta: string) {
  if (window.api) return window.api.copiaManual(p, mmszEtiqueta);
  const mmszMarca = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  mmszCopiaWeb(p, `progreso-${mmszEtiqueta}-${mmszMarca}.json`);
  return true;
}

async function mmszLoad(): Promise<{ progreso: MmszProgress; aviso: string | null }> {
  try {
    if (window.api) {
      const mmszRespuesta = await window.api.loadProgress();
      // Compatible con la forma anterior (devolvía el progreso directamente).
      const mmszEnvuelto = mmszRespuesta && 'datos' in mmszRespuesta && 'aviso' in mmszRespuesta;
      const mmszDatos = mmszEnvuelto ? mmszRespuesta.datos : (mmszRespuesta as MmszProgress | null);
      return { progreso: mmszCompletarProgreso(mmszDatos), aviso: mmszEnvuelto ? mmszRespuesta.aviso : null };
    }
    const mmszTexto = localStorage.getItem(MMSZ_STORAGE_KEY) || localStorage.getItem(MMSZ_STORAGE_KEY_ANTERIOR);
    try {
      return { progreso: mmszCompletarProgreso(JSON.parse(mmszTexto || 'null')), aviso: null };
    } catch {
      const mmszCopia = (await mmszListarCopias())[0];
      if (mmszCopia) return { progreso: mmszCompletarProgreso(mmszCopia.datos), aviso: 'Tu progreso estaba dañado. Se recuperó la última copia de seguridad.' };
      return { progreso: mmszFresh(), aviso: 'Tu progreso estaba dañado y no había copias. Se empezó de nuevo.' };
    }
  } catch {
    return { progreso: mmszFresh(), aviso: null };
  }
}

function mmszSave(p: MmszProgress) {
  try {
    if (window.api) {
      void window.api.saveProgress(p);
    } else {
      localStorage.setItem(MMSZ_STORAGE_KEY, JSON.stringify(p));
      mmszCopiaWeb(p);
    }
  } catch {
    /* si no se puede guardar, la app sigue funcionando */
  }
}

/** Minutos que faltan para recuperar la próxima vida. */
export function mmszMinutesToNextHeart(p: MmszProgress): number {
  if (p.hearts >= MMSZ_MAX_HEARTS) return 0;
  return Math.max(1, Math.ceil((p.heartsUpdatedAt + MMSZ_HEART_REGEN_MS - Date.now()) / 60000));
}

export function mmszUseProgress() {
  const [mmszProgress, mmszSetProgress] = useState<MmszProgress | null>(null);
  // Mensaje para el estudiante si al abrir la app se recuperó una copia de seguridad.
  const [mmszAviso, setMmszAviso] = useState<string | null>(null);

  useEffect(() => {
    mmszLoad().then(({ progreso, aviso }) => {
      mmszSetProgress(progreso);
      setMmszAviso(aviso);
    });
    // revisa cada minuto si ya se recuperó alguna vida
    const t = setInterval(() => mmszSetProgress((p) => (p ? mmszNormalize(p) : p)), 60000);
    return () => clearInterval(t);
  }, []);

  const mmszUpdate = useCallback((fn: (p: MmszProgress) => MmszProgress) => {
    mmszSetProgress((mmszPrev) => {
      if (!mmszPrev) return mmszPrev;
      const mmszNext = fn(mmszNormalize(mmszPrev));
      mmszSave(mmszNext);
      return mmszNext;
    });
  }, []);

  const mmszLoseHeart = useCallback(
    () =>
      mmszUpdate((p) => ({
        ...p,
        hearts: Math.max(0, p.hearts - 1),
        heartsUpdatedAt: p.hearts >= MMSZ_MAX_HEARTS ? Date.now() : p.heartsUpdatedAt,
      })),
    [mmszUpdate],
  );

  const mmszCompleteLesson = useCallback(
    (mmszLessonId: string, mmszXpGained: number) =>
      mmszUpdate((p) => {
        const mmszToday = mmszDayKey();
        let mmszStreak = p.streak;
        if (p.lastActiveDay !== mmszToday) mmszStreak = p.lastActiveDay === mmszYesterdayKey() ? mmszStreak + 1 : 1;
        return {
          ...p,
          xp: p.xp + mmszXpGained,
          streak: mmszStreak,
          lastActiveDay: mmszToday,
          completed: { ...p.completed, [mmszLessonId]: (p.completed[mmszLessonId] || 0) + 1 },
        };
      }),
    [mmszUpdate],
  );

  // Reinicia XP, racha y lecciones, pero conserva el nombre y el tema del estudiante.
  const mmszReset = useCallback(
    () =>
      mmszUpdate((p) => ({
        ...mmszFresh(),
        nombre: p.nombre,
        tema: p.tema,
        disenoDinamico: p.disenoDinamico,
        modoOffline: p.modoOffline,
        bienvenidaCompleta: true,
      })),
    [mmszUpdate],
  );

  /** Reemplaza todo el progreso (al importar un archivo o restaurar una copia). */
  const mmszReemplazar = useCallback(
    (mmszNuevo: MmszProgress) => mmszUpdate(() => mmszCompletarProgreso({ ...mmszNuevo, sesionActiva: true })),
    [mmszUpdate],
  );

  const mmszCambiarTema = useCallback(
    (mmszTema: string) => mmszUpdate((p) => ({ ...p, tema: mmszTema })),
    [mmszUpdate],
  );

  const mmszCambiarNombre = useCallback(
    (mmszNombre: string) => mmszUpdate((p) => ({ ...p, nombre: mmszNombre.trim() || MMSZ_NOMBRE_PREDETERMINADO })),
    [mmszUpdate],
  );
  const mmszCambiarModo = useCallback(
    (mmszOffline: boolean) => mmszUpdate((p) => ({ ...p, modoOffline: mmszOffline })),
    [mmszUpdate],
  );

  const mmszCambiarDiseno = useCallback(
    (mmszDinamico: boolean) => mmszUpdate((p) => ({ ...p, disenoDinamico: mmszDinamico })),
    [mmszUpdate],
  );

  /** Termina la bienvenida del primer inicio: guarda el nombre y los cursos elegidos. */
  const mmszCompletarBienvenida = useCallback(
    (mmszNombre: string, mmszCursosOcultos: string[]) =>
      mmszUpdate((p) => ({
        ...p,
        nombre: mmszNombre.trim() || MMSZ_NOMBRE_PREDETERMINADO,
        cursosOcultos: mmszCursosOcultos,
        bienvenidaCompleta: true,
        sesionActiva: true,
      })),
    [mmszUpdate],
  );

  const mmszCambiarSesion = useCallback(
    (mmszActiva: boolean) => mmszUpdate((p) => ({ ...p, sesionActiva: mmszActiva })),
    [mmszUpdate],
  );
  const mmszCambiarCursosOcultos = useCallback(
    (mmszIds: string[]) => mmszUpdate((p) => ({ ...p, cursosOcultos: mmszIds })),
    [mmszUpdate],
  );

  return {
    progress: mmszProgress,
    loseHeart: mmszLoseHeart,
    completeLesson: mmszCompleteLesson,
    reset: mmszReset,
    mmszCambiarNombre,
    mmszCambiarSesion,
    mmszCambiarCursosOcultos,
    mmszCambiarTema,
    mmszReemplazar,
    mmszCompletarBienvenida,
    mmszCambiarDiseno,
    mmszCambiarModo,
    mmszAviso,
    mmszCerrarAviso: () => setMmszAviso(null),
  };
}
