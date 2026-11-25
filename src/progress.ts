import { useCallback, useEffect, useState } from 'react';

export const MMSZ_MAX_HEARTS = 5;
const MMSZ_HEART_REGEN_MS = 20 * 60 * 1000;

export interface MmszProgress {
  mmszXp: number;
  mmszStreak: number;
  mmszLastActiveDay: string | null;
  mmszHearts: number;
  mmszHeartsUpdatedAt: number;
  mmszCompleted: Record<string, number>;
  mmszNombre: string;
  mmszSesionActiva: boolean;
  mmszCursosOcultos: string[];
  mmszTema: string;
  mmszBienvenidaCompleta: boolean;
  mmszDisenoDinamico: boolean;
  mmszModoOffline: boolean;
}

export const MMSZ_NOMBRE_PREDETERMINADO = 'Estudiante';

export interface MmszCopia {
  mmszNombre: string;
  mmszFecha: string;
  mmszDatos: MmszProgress;
}

declare global {
  interface Window {
    mmszApi?: {
      mmszLoadProgress: () => Promise<{ mmszDatos: MmszProgress | null; mmszAviso: string | null } | MmszProgress | null>;
      mmszSaveProgress: (mmszP: MmszProgress) => Promise<boolean>;
      mmszListarCopias: () => Promise<MmszCopia[]>;
      mmszCopiaManual: (mmszP: MmszProgress, mmszEtiqueta: string) => Promise<boolean>;
      mmszExportarProgreso: (mmszContenido: string) => Promise<{ mmszOk: boolean; mmszRuta?: string }>;
      mmszImportarProgreso: () => Promise<{ mmszOk: boolean; mmszContenido?: string; mmszError?: string }>;
      mmszSintetizarVoz?: (mmszTexto: string) => Promise<Uint8Array | null>;
      mmszCargarUsuarios?: () => Promise<unknown>;
      mmszGuardarUsuarios?: (mmszDatos: unknown) => Promise<boolean>;
    };
  }
}

const MMSZ_STORAGE_KEY = 'novexa-progress';
const MMSZ_STORAGE_KEY_ANTERIOR = 'coderuta-progress';

const mmszFresh = (): MmszProgress => ({
  mmszXp: 0,
  mmszStreak: 0,
  mmszLastActiveDay: null,
  mmszHearts: MMSZ_MAX_HEARTS,
  mmszHeartsUpdatedAt: Date.now(),
  mmszCompleted: {},
  mmszNombre: MMSZ_NOMBRE_PREDETERMINADO,
  mmszSesionActiva: true,
  mmszCursosOcultos: [],
  mmszTema: 'clasico',
  mmszBienvenidaCompleta: false,
  mmszDisenoDinamico: true,
  mmszModoOffline: true,
});

export function mmszDayKey(mmszD = new Date()): string {
  const mmszM = String(mmszD.getMonth() + 1).padStart(2, '0');
  const mmszDay = String(mmszD.getDate()).padStart(2, '0');
  return `${mmszD.getFullYear()}-${mmszM}-${mmszDay}`;
}

function mmszYesterdayKey(): string {
  const mmszD = new Date();
  mmszD.setDate(mmszD.getDate() - 1);
  return mmszDayKey(mmszD);
}

function mmszNormalize(mmszP: MmszProgress): MmszProgress {
  const mmszNow = Date.now();
  let { mmszHearts, mmszHeartsUpdatedAt, mmszStreak } = mmszP;
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
  if (mmszP.mmszLastActiveDay && mmszP.mmszLastActiveDay !== mmszDayKey() && mmszP.mmszLastActiveDay !== mmszYesterdayKey()) {
    mmszStreak = 0;
  }
  return { ...mmszP, mmszHearts, mmszHeartsUpdatedAt, mmszStreak };
}

export function mmszMigrarClaves<MmszT>(mmszObj: MmszT): MmszT {
  if (!mmszObj || typeof mmszObj !== 'object' || Array.isArray(mmszObj)) return mmszObj;
  return Object.fromEntries(
    Object.entries(mmszObj).map(([mmszClave, mmszValor]) => [
      /^mmsz/.test(mmszClave) ? mmszClave : 'mmsz' + mmszClave[0].toUpperCase() + mmszClave.slice(1),
      mmszValor,
    ]),
  ) as MmszT;
}

export function mmszCompletarProgreso(mmszEntrada: Partial<MmszProgress> | null | undefined): MmszProgress {
  const mmszDatos = mmszMigrarClaves(mmszEntrada);
  const mmszYaUsaba = mmszDatos && mmszDatos.mmszBienvenidaCompleta === undefined;
  return mmszNormalize({
    ...mmszFresh(),
    ...(mmszDatos || {}),
    ...(mmszYaUsaba ? { mmszBienvenidaCompleta: true } : {}),
  });
}

const MMSZ_PREFIJO_COPIA_WEB = 'novexa-copia-';
const MMSZ_COPIAS_WEB = 7;

function mmszCopiaWeb(mmszP: MmszProgress, mmszNombre = `progreso-${mmszDayKey()}.json`) {
  localStorage.setItem(MMSZ_PREFIJO_COPIA_WEB + mmszNombre, JSON.stringify({ mmszFecha: new Date().toISOString(), mmszDatos: mmszP }));
  const mmszDiarias = Object.keys(localStorage)
    .filter((mmszK) => /^novexa-copia-progreso-\d{4}-\d{2}-\d{2}\.json$/.test(mmszK))
    .sort()
    .reverse();
  mmszDiarias.slice(MMSZ_COPIAS_WEB).forEach((mmszK) => localStorage.removeItem(mmszK));
}

export async function mmszListarCopias(): Promise<MmszCopia[]> {
  if (window.mmszApi) return window.mmszApi.mmszListarCopias();
  return Object.keys(localStorage)
    .filter((mmszK) => mmszK.startsWith(MMSZ_PREFIJO_COPIA_WEB))
    .map((mmszK) => {
      try {
        const { mmszFecha, mmszDatos } = mmszMigrarClaves(JSON.parse(localStorage.getItem(mmszK)!));
        return { mmszNombre: mmszK.slice(MMSZ_PREFIJO_COPIA_WEB.length), mmszFecha, mmszDatos } as MmszCopia;
      } catch {
        return null;
      }
    })
    .filter((mmszC): mmszC is MmszCopia => mmszC !== null)
    .sort((mmszA, mmszB) => mmszB.mmszFecha.localeCompare(mmszA.mmszFecha));
}

export async function mmszCopiaManual(mmszP: MmszProgress, mmszEtiqueta: string) {
  if (window.mmszApi) return window.mmszApi.mmszCopiaManual(mmszP, mmszEtiqueta);
  const mmszMarca = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  mmszCopiaWeb(mmszP, `progreso-${mmszEtiqueta}-${mmszMarca}.json`);
  return true;
}

async function mmszLoad(): Promise<{ mmszProgreso: MmszProgress; mmszAviso: string | null }> {
  try {
    if (window.mmszApi) {
      const mmszRespuesta = mmszMigrarClaves(await window.mmszApi.mmszLoadProgress());
      const mmszEnvuelto = mmszRespuesta && 'mmszDatos' in mmszRespuesta && 'mmszAviso' in mmszRespuesta;
      const mmszDatos = mmszEnvuelto ? mmszRespuesta.mmszDatos : (mmszRespuesta as MmszProgress | null);
      return { mmszProgreso: mmszCompletarProgreso(mmszDatos), mmszAviso: mmszEnvuelto ? mmszRespuesta.mmszAviso : null };
    }
    const mmszTexto = localStorage.getItem(MMSZ_STORAGE_KEY) || localStorage.getItem(MMSZ_STORAGE_KEY_ANTERIOR);
    try {
      return { mmszProgreso: mmszCompletarProgreso(JSON.parse(mmszTexto || 'null')), mmszAviso: null };
    } catch {
      const mmszCopia = (await mmszListarCopias())[0];
      if (mmszCopia) return { mmszProgreso: mmszCompletarProgreso(mmszCopia.mmszDatos), mmszAviso: 'Tu progreso estaba dañado. Se recuperó la última copia de seguridad.' };
      return { mmszProgreso: mmszFresh(), mmszAviso: 'Tu progreso estaba dañado y no había copias. Se empezó de nuevo.' };
    }
  } catch {
    return { mmszProgreso: mmszFresh(), mmszAviso: null };
  }
}

function mmszSave(mmszP: MmszProgress) {
  try {
    if (window.mmszApi) {
      void window.mmszApi.mmszSaveProgress(mmszP);
    } else {
      localStorage.setItem(MMSZ_STORAGE_KEY, JSON.stringify(mmszP));
      mmszCopiaWeb(mmszP);
    }
  } catch {}
}

export function mmszMinutesToNextHeart(mmszP: MmszProgress): number {
  if (mmszP.mmszHearts >= MMSZ_MAX_HEARTS) return 0;
  return Math.max(1, Math.ceil((mmszP.mmszHeartsUpdatedAt + MMSZ_HEART_REGEN_MS - Date.now()) / 60000));
}

export function mmszUseProgress() {
  const [mmszProgress, mmszSetProgress] = useState<MmszProgress | null>(null);
  const [mmszAviso, mmszSetAviso] = useState<string | null>(null);

  useEffect(() => {
    mmszLoad().then(({ mmszProgreso, mmszAviso }) => {
      mmszSetProgress(mmszProgreso);
      mmszSetAviso(mmszAviso);
    });
    const mmszT = setInterval(() => mmszSetProgress((mmszP) => (mmszP ? mmszNormalize(mmszP) : mmszP)), 60000);
    return () => clearInterval(mmszT);
  }, []);

  const mmszUpdate = useCallback((mmszFn: (mmszP: MmszProgress) => MmszProgress) => {
    mmszSetProgress((mmszPrev) => {
      if (!mmszPrev) return mmszPrev;
      const mmszNext = mmszFn(mmszNormalize(mmszPrev));
      mmszSave(mmszNext);
      return mmszNext;
    });
  }, []);

  const mmszLoseHeart = useCallback(
    () =>
      mmszUpdate((mmszP) => ({
        ...mmszP,
        mmszHearts: Math.max(0, mmszP.mmszHearts - 1),
        mmszHeartsUpdatedAt: mmszP.mmszHearts >= MMSZ_MAX_HEARTS ? Date.now() : mmszP.mmszHeartsUpdatedAt,
      })),
    [mmszUpdate],
  );

  const mmszCompleteLesson = useCallback(
    (mmszLessonId: string, mmszXpGained: number) =>
      mmszUpdate((mmszP) => {
        const mmszToday = mmszDayKey();
        let mmszStreak = mmszP.mmszStreak;
        if (mmszP.mmszLastActiveDay !== mmszToday) mmszStreak = mmszP.mmszLastActiveDay === mmszYesterdayKey() ? mmszStreak + 1 : 1;
        return {
          ...mmszP,
          mmszXp: mmszP.mmszXp + mmszXpGained,
          mmszStreak,
          mmszLastActiveDay: mmszToday,
          mmszCompleted: { ...mmszP.mmszCompleted, [mmszLessonId]: (mmszP.mmszCompleted[mmszLessonId] || 0) + 1 },
        };
      }),
    [mmszUpdate],
  );

  const mmszReset = useCallback(
    () =>
      mmszUpdate((mmszP) => ({
        ...mmszFresh(),
        mmszNombre: mmszP.mmszNombre,
        mmszTema: mmszP.mmszTema,
        mmszDisenoDinamico: mmszP.mmszDisenoDinamico,
        mmszModoOffline: mmszP.mmszModoOffline,
        mmszBienvenidaCompleta: true,
      })),
    [mmszUpdate],
  );

  const mmszReemplazar = useCallback(
    (mmszNuevo: MmszProgress) => mmszUpdate(() => mmszCompletarProgreso({ ...mmszNuevo, mmszSesionActiva: true })),
    [mmszUpdate],
  );

  const mmszCambiarTema = useCallback(
    (mmszTema: string) => mmszUpdate((mmszP) => ({ ...mmszP, mmszTema })),
    [mmszUpdate],
  );

  const mmszCambiarNombre = useCallback(
    (mmszNombre: string) => mmszUpdate((mmszP) => ({ ...mmszP, mmszNombre: mmszNombre.trim() || MMSZ_NOMBRE_PREDETERMINADO })),
    [mmszUpdate],
  );
  const mmszCambiarModo = useCallback(
    (mmszOffline: boolean) => mmszUpdate((mmszP) => ({ ...mmszP, mmszModoOffline: mmszOffline })),
    [mmszUpdate],
  );

  const mmszCambiarDiseno = useCallback(
    (mmszDinamico: boolean) => mmszUpdate((mmszP) => ({ ...mmszP, mmszDisenoDinamico: mmszDinamico })),
    [mmszUpdate],
  );

  const mmszCompletarBienvenida = useCallback(
    (mmszNombre: string, mmszCursosOcultos: string[]) =>
      mmszUpdate((mmszP) => ({
        ...mmszP,
        mmszNombre: mmszNombre.trim() || MMSZ_NOMBRE_PREDETERMINADO,
        mmszCursosOcultos,
        mmszBienvenidaCompleta: true,
        mmszSesionActiva: true,
      })),
    [mmszUpdate],
  );

  const mmszCambiarSesion = useCallback(
    (mmszActiva: boolean) => mmszUpdate((mmszP) => ({ ...mmszP, mmszSesionActiva: mmszActiva })),
    [mmszUpdate],
  );
  const mmszCambiarCursosOcultos = useCallback(
    (mmszIds: string[]) => mmszUpdate((mmszP) => ({ ...mmszP, mmszCursosOcultos: mmszIds })),
    [mmszUpdate],
  );

  return {
    mmszProgress,
    mmszLoseHeart,
    mmszCompleteLesson,
    mmszReset,
    mmszCambiarNombre,
    mmszCambiarSesion,
    mmszCambiarCursosOcultos,
    mmszCambiarTema,
    mmszReemplazar,
    mmszCompletarBienvenida,
    mmszCambiarDiseno,
    mmszCambiarModo,
    mmszAviso,
    mmszCerrarAviso: () => mmszSetAviso(null),
  };
}
