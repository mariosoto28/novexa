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
}

export const MMSZ_NOMBRE_PREDETERMINADO = 'Mario Soto Zea';

declare global {
  interface Window {
    api?: {
      loadProgress: () => Promise<MmszProgress | null>;
      saveProgress: (p: MmszProgress) => Promise<boolean>;
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

async function mmszLoad(): Promise<MmszProgress> {
  try {
    const mmszRaw = window.api
      ? await window.api.loadProgress()
      : JSON.parse(localStorage.getItem(MMSZ_STORAGE_KEY) || localStorage.getItem(MMSZ_STORAGE_KEY_ANTERIOR) || 'null');
    return mmszNormalize({ ...mmszFresh(), ...(mmszRaw || {}) });
  } catch {
    return mmszFresh();
  }
}

function mmszSave(p: MmszProgress) {
  try {
    if (window.api) void window.api.saveProgress(p);
    else localStorage.setItem(MMSZ_STORAGE_KEY, JSON.stringify(p));
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

  useEffect(() => {
    mmszLoad().then(mmszSetProgress);
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
    () => mmszUpdate((p) => ({ ...mmszFresh(), nombre: p.nombre, tema: p.tema })),
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
  };
}
