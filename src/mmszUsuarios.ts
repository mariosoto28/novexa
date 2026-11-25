import { useCallback, useEffect, useState } from 'react';
import { mmszCompletarProgreso, mmszCopiaManual, type MmszProgress } from './progress';

export interface MmszUsuario {
  mmszId: string;
  mmszNombre: string;
  mmszXp: number;
  mmszLecciones: number;
  mmszUltimoUso: string;
  mmszProgreso: MmszProgress | null;
}

export interface MmszRegistroUsuarios {
  mmszActual: string | null;
  mmszUsuarios: MmszUsuario[];
}

export interface MmszFichaUsuario {
  mmszId: string;
  mmszNombre: string;
  mmszXp: number;
  mmszLecciones: number;
  mmszUltimoUso: string;
  mmszEsActual: boolean;
}

const MMSZ_CLAVE_USUARIOS = 'novexa-usuarios';

const mmszRegistroVacio = (): MmszRegistroUsuarios => ({ mmszActual: null, mmszUsuarios: [] });

const mmszNuevoId = () => `u${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

const mmszContarLecciones = (mmszP: MmszProgress) => Object.keys(mmszP.mmszCompleted).length;

function mmszEsRegistro(mmszD: unknown): mmszD is MmszRegistroUsuarios {
  return Boolean(mmszD) && typeof mmszD === 'object' && Array.isArray((mmszD as MmszRegistroUsuarios).mmszUsuarios);
}

async function mmszLeerRegistro(): Promise<MmszRegistroUsuarios> {
  try {
    const mmszDatos = window.mmszApi?.mmszCargarUsuarios
      ? await window.mmszApi.mmszCargarUsuarios()
      : JSON.parse(localStorage.getItem(MMSZ_CLAVE_USUARIOS) || 'null');
    return mmszEsRegistro(mmszDatos) ? mmszDatos : mmszRegistroVacio();
  } catch {
    return mmszRegistroVacio();
  }
}

function mmszGuardarRegistro(mmszR: MmszRegistroUsuarios) {
  try {
    if (window.mmszApi?.mmszGuardarUsuarios) void window.mmszApi.mmszGuardarUsuarios(mmszR);
    else localStorage.setItem(MMSZ_CLAVE_USUARIOS, JSON.stringify(mmszR));
  } catch {}
}

export function mmszUseUsuarios(mmszProgreso: MmszProgress | null, mmszReemplazar: (mmszP: MmszProgress) => void) {
  const [mmszRegistro, mmszSetRegistro] = useState<MmszRegistroUsuarios | null>(null);

  useEffect(() => {
    void mmszLeerRegistro().then(mmszSetRegistro);
  }, []);

  const mmszCambiar = useCallback((mmszNuevo: MmszRegistroUsuarios) => {
    mmszSetRegistro(mmszNuevo);
    mmszGuardarRegistro(mmszNuevo);
  }, []);

  useEffect(() => {
    if (!mmszRegistro || !mmszProgreso || !mmszProgreso.mmszBienvenidaCompleta) return;
    const mmszLecciones = mmszContarLecciones(mmszProgreso);
    const mmszActual = mmszRegistro.mmszUsuarios.find((mmszU) => mmszU.mmszId === mmszRegistro.mmszActual);
    if (!mmszActual) {
      const mmszId = mmszNuevoId();
      mmszCambiar({
        mmszActual: mmszId,
        mmszUsuarios: [
          ...mmszRegistro.mmszUsuarios,
          {
            mmszId,
            mmszNombre: mmszProgreso.mmszNombre,
            mmszXp: mmszProgreso.mmszXp,
            mmszLecciones,
            mmszUltimoUso: new Date().toISOString(),
            mmszProgreso: null,
          },
        ],
      });
      return;
    }
    if (mmszActual.mmszNombre === mmszProgreso.mmszNombre && mmszActual.mmszXp === mmszProgreso.mmszXp && mmszActual.mmszLecciones === mmszLecciones) return;
    mmszCambiar({
      ...mmszRegistro,
      mmszUsuarios: mmszRegistro.mmszUsuarios.map((mmszU) =>
        mmszU.mmszId === mmszActual.mmszId
          ? { ...mmszU, mmszNombre: mmszProgreso.mmszNombre, mmszXp: mmszProgreso.mmszXp, mmszLecciones }
          : mmszU,
      ),
    });
  }, [mmszRegistro, mmszProgreso, mmszCambiar]);

  const mmszGuardarActual = (mmszR: MmszRegistroUsuarios): MmszUsuario[] =>
    mmszR.mmszUsuarios.map((mmszU) =>
      mmszU.mmszId === mmszR.mmszActual && mmszProgreso && mmszProgreso.mmszBienvenidaCompleta
        ? { ...mmszU, mmszProgreso: { ...mmszProgreso, mmszSesionActiva: false } }
        : mmszU,
    );

  const mmszElegir = (mmszId: string) => {
    if (!mmszRegistro) return;
    const mmszAhora = new Date().toISOString();
    if (mmszId === mmszRegistro.mmszActual) {
      mmszCambiar({
        ...mmszRegistro,
        mmszUsuarios: mmszRegistro.mmszUsuarios.map((mmszU) => (mmszU.mmszId === mmszId ? { ...mmszU, mmszUltimoUso: mmszAhora } : mmszU)),
      });
      return;
    }
    const mmszDestino = mmszRegistro.mmszUsuarios.find((mmszU) => mmszU.mmszId === mmszId);
    if (!mmszDestino) return;
    if (mmszProgreso?.mmszBienvenidaCompleta) void mmszCopiaManual(mmszProgreso, 'antes-de-cambiar-usuario');
    const mmszUsuarios = mmszGuardarActual(mmszRegistro).map((mmszU) =>
      mmszU.mmszId === mmszId ? { ...mmszU, mmszProgreso: null, mmszUltimoUso: mmszAhora } : mmszU,
    );
    mmszCambiar({ mmszActual: mmszId, mmszUsuarios });
    mmszReemplazar(
      mmszCompletarProgreso({
        ...(mmszDestino.mmszProgreso ?? { mmszNombre: mmszDestino.mmszNombre, mmszBienvenidaCompleta: true }),
        mmszSesionActiva: true,
      }),
    );
  };

  const mmszAgregar = () => {
    if (!mmszRegistro) return;
    if (mmszProgreso?.mmszBienvenidaCompleta) void mmszCopiaManual(mmszProgreso, 'antes-de-cambiar-usuario');
    mmszCambiar({ mmszActual: null, mmszUsuarios: mmszGuardarActual(mmszRegistro) });
    mmszReemplazar(mmszCompletarProgreso({ mmszBienvenidaCompleta: false, mmszTema: mmszProgreso?.mmszTema ?? 'clasico' }));
  };

  const mmszQuitar = (mmszId: string) => {
    if (!mmszRegistro || mmszId === mmszRegistro.mmszActual) return;
    mmszCambiar({ ...mmszRegistro, mmszUsuarios: mmszRegistro.mmszUsuarios.filter((mmszU) => mmszU.mmszId !== mmszId) });
  };

  const mmszFichas: MmszFichaUsuario[] = (mmszRegistro?.mmszUsuarios ?? []).map((mmszU) => ({
    mmszId: mmszU.mmszId,
    mmszNombre: mmszU.mmszNombre,
    mmszXp: mmszU.mmszXp,
    mmszLecciones: mmszU.mmszLecciones,
    mmszUltimoUso: mmszU.mmszUltimoUso,
    mmszEsActual: mmszU.mmszId === mmszRegistro?.mmszActual,
  }));

  const mmszListo = Boolean(mmszRegistro) && (!mmszProgreso?.mmszBienvenidaCompleta || mmszFichas.some((mmszF) => mmszF.mmszEsActual));

  return { mmszListo, mmszFichas, mmszElegir, mmszAgregar, mmszQuitar };
}
