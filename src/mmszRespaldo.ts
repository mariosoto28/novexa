// Autor: MMSZ (Mario Soto Zea)
// Exportar e importar el progreso como archivo .json (para pasarlo a otra computadora
// o guardarlo como respaldo personal).
import { mmszCompletarProgreso, mmszDayKey, type MmszProgress } from './progress';

const MMSZ_VERSION_ARCHIVO = 1;

interface MmszArchivoProgreso {
  app: 'Novexa';
  version: number;
  exportado: string;
  progreso: MmszProgress;
}

/** Resumen corto para mostrar antes de importar o restaurar. */
export function mmszResumen(p: MmszProgress) {
  return {
    nombre: p.nombre,
    xp: p.xp,
    racha: p.streak,
    lecciones: Object.keys(p.completed).filter((id) => /^(py|js|cpp)-\d+-\d+$/.test(id)).length,
  };
}

export function mmszCrearArchivo(p: MmszProgress): string {
  const mmszArchivo: MmszArchivoProgreso = {
    app: 'Novexa',
    version: MMSZ_VERSION_ARCHIVO,
    exportado: new Date().toISOString(),
    progreso: p,
  };
  return JSON.stringify(mmszArchivo, null, 2);
}

/** Lee y valida un archivo exportado. Lanza un error con un mensaje claro si no sirve. */
export function mmszLeerArchivo(mmszTexto: string): { progreso: MmszProgress; exportado: string | null } {
  let mmszDatos: unknown;
  try {
    mmszDatos = JSON.parse(mmszTexto);
  } catch {
    throw new Error('El archivo no es válido: no tiene formato JSON.');
  }
  const mmszObj = mmszDatos as Partial<MmszArchivoProgreso> & Partial<MmszProgress>;
  // Acepta el formato de exportación y también un progress.json copiado directamente.
  const mmszProgreso = (mmszObj.app === 'Novexa' ? mmszObj.progreso : mmszObj) as Partial<MmszProgress> | undefined;
  if (!mmszProgreso || typeof mmszProgreso.xp !== 'number' || typeof mmszProgreso.completed !== 'object') {
    throw new Error('Este archivo no es un progreso de Novexa.');
  }
  if ((mmszObj.version ?? 1) > MMSZ_VERSION_ARCHIVO) {
    throw new Error('El archivo es de una versión más nueva de Novexa. Actualiza la app para importarlo.');
  }
  return { progreso: mmszCompletarProgreso(mmszProgreso), exportado: mmszObj.exportado ?? null };
}

/** Guarda el archivo: en la app de escritorio con un cuadro "Guardar como"; en la web, como descarga. */
export async function mmszExportar(p: MmszProgress): Promise<string | null> {
  const mmszContenido = mmszCrearArchivo(p);
  if (window.api) {
    const r = await window.api.exportarProgreso(mmszContenido);
    return r.ok ? (r.ruta ?? '') : null;
  }
  const mmszUrl = URL.createObjectURL(new Blob([mmszContenido], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = mmszUrl;
  a.download = `novexa-progreso-${mmszDayKey()}.json`;
  a.click();
  URL.revokeObjectURL(mmszUrl);
  return a.download;
}

/** Abre un archivo elegido por el usuario y devuelve su texto (o null si canceló). */
export async function mmszElegirArchivo(): Promise<string | null> {
  if (window.api) {
    const r = await window.api.importarProgreso();
    if (r.error) throw new Error(r.error);
    return r.ok ? (r.contenido ?? null) : null;
  }
  return new Promise((mmszResolver) => {
    const mmszInput = document.createElement('input');
    mmszInput.type = 'file';
    mmszInput.accept = '.json,application/json';
    mmszInput.onchange = async () => {
      const f = mmszInput.files?.[0];
      mmszResolver(f ? await f.text() : null);
    };
    mmszInput.click();
  });
}
