import { mmszCompletarProgreso, mmszDayKey, mmszMigrarClaves, type MmszProgress } from './progress';

const MMSZ_VERSION_ARCHIVO = 1;

interface MmszArchivoProgreso {
  mmszApp: 'Novexa';
  mmszVersion: number;
  mmszExportado: string;
  mmszProgreso: MmszProgress;
}

export function mmszResumen(mmszP: MmszProgress) {
  return {
    mmszNombre: mmszP.mmszNombre,
    mmszXp: mmszP.mmszXp,
    mmszRacha: mmszP.mmszStreak,
    mmszLecciones: Object.keys(mmszP.mmszCompleted).filter((mmszId) => /^(py|js|cpp)-\d+-\d+$/.test(mmszId)).length,
  };
}

export function mmszCrearArchivo(mmszP: MmszProgress): string {
  const mmszArchivo: MmszArchivoProgreso = {
    mmszApp: 'Novexa',
    mmszVersion: MMSZ_VERSION_ARCHIVO,
    mmszExportado: new Date().toISOString(),
    mmszProgreso: mmszP,
  };
  return JSON.stringify(mmszArchivo, null, 2);
}

export function mmszLeerArchivo(mmszTexto: string): { mmszProgreso: MmszProgress; mmszExportado: string | null } {
  let mmszDatos: unknown;
  try {
    mmszDatos = JSON.parse(mmszTexto);
  } catch {
    throw new Error('El archivo no es válido: no tiene formato JSON.');
  }
  const mmszObj = mmszMigrarClaves(mmszDatos) as Partial<MmszArchivoProgreso> & Partial<MmszProgress>;
  const mmszProgreso = mmszMigrarClaves(mmszObj.mmszApp === 'Novexa' ? mmszObj.mmszProgreso : mmszObj) as Partial<MmszProgress> | undefined;
  if (!mmszProgreso || typeof mmszProgreso.mmszXp !== 'number' || typeof mmszProgreso.mmszCompleted !== 'object') {
    throw new Error('Este archivo no es un progreso de Novexa.');
  }
  if ((mmszObj.mmszVersion ?? 1) > MMSZ_VERSION_ARCHIVO) {
    throw new Error('El archivo es de una versión más nueva de Novexa. Actualiza la app para importarlo.');
  }
  return { mmszProgreso: mmszCompletarProgreso(mmszProgreso), mmszExportado: mmszObj.mmszExportado ?? null };
}

export async function mmszExportar(mmszP: MmszProgress): Promise<string | null> {
  const mmszContenido = mmszCrearArchivo(mmszP);
  if (window.mmszApi) {
    const mmszR = await window.mmszApi.mmszExportarProgreso(mmszContenido);
    return mmszR.mmszOk ? (mmszR.mmszRuta ?? '') : null;
  }
  const mmszUrl = URL.createObjectURL(new Blob([mmszContenido], { type: 'application/json' }));
  const mmszA = document.createElement('a');
  mmszA.href = mmszUrl;
  mmszA.download = `novexa-progreso-${mmszDayKey()}.json`;
  mmszA.click();
  URL.revokeObjectURL(mmszUrl);
  return mmszA.download;
}

export async function mmszElegirArchivo(): Promise<string | null> {
  if (window.mmszApi) {
    const mmszR = await window.mmszApi.mmszImportarProgreso();
    if (mmszR.mmszError) throw new Error(mmszR.mmszError);
    return mmszR.mmszOk ? (mmszR.mmszContenido ?? null) : null;
  }
  return new Promise((mmszResolver) => {
    const mmszInput = document.createElement('input');
    mmszInput.type = 'file';
    mmszInput.accept = '.json,application/json';
    mmszInput.onchange = async () => {
      const mmszF = mmszInput.files?.[0];
      mmszResolver(mmszF ? await mmszF.text() : null);
    };
    mmszInput.click();
  });
}
