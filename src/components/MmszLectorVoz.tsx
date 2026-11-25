import { useEffect, useRef, useState } from 'react';
import { mmszDecirFrases, mmszHayVoz, type MmszDicho } from '../mmszVoz';

export function mmszTextoHablado(mmszMarkdown: string): string[] {
  const mmszSinCodigo = mmszMarkdown.replace(/(```|~~~)[\s\S]*?\1/g, '\nA continuación hay un ejemplo de código.\n');
  const mmszLimpio = mmszSinCodigo
    .replace(/[«»`*]/g, '')
    .replace(/^### /gm, '')
    .replace(/^> /gm, 'Nota: ')
    .replace(/^- /gm, '')
    .replace(/==/g, ' doble igual ')
    .replace(/!=/g, ' distinto de ')
    .replace(/>=/g, ' mayor o igual que ')
    .replace(/<=/g, ' menor o igual que ');
  return mmszLimpio
    .split(/\n+|(?<=[.!?:])\s+/)
    .map((mmszF) => mmszF.trim())
    .filter(Boolean);
}

const MMSZ_VELOCIDADES = [0.8, 1, 1.25, 1.5];

export default function MmszLectorVoz({ mmszTexto }: { mmszTexto: string }) {
  const mmszDisponible = mmszHayVoz();
  const [mmszEstado, mmszSetEstado] = useState<'parado' | 'hablando' | 'pausado'>('parado');
  const [mmszVelocidad, mmszSetVelocidad] = useState(1);
  const mmszDicho = useRef<MmszDicho | null>(null);

  useEffect(() => {
    return () => {
      mmszDicho.current?.mmszCancelar();
      mmszDicho.current = null;
    };
  }, [mmszTexto]);

  if (!mmszDisponible) return null;

  function mmszEmpezar() {
    mmszDicho.current?.mmszCancelar();
    const mmszEste = mmszDecirFrases(mmszTextoHablado(mmszTexto), mmszVelocidad);
    mmszDicho.current = mmszEste;
    mmszEste.mmszFin.then(() => {
      if (mmszDicho.current === mmszEste) mmszSetEstado('parado');
    });
    mmszSetEstado('hablando');
  }

  function mmszDetener() {
    mmszDicho.current?.mmszCancelar();
    mmszDicho.current = null;
    mmszSetEstado('parado');
  }

  return (
    <div className="mmsz-lector">
      {mmszEstado === 'parado' && (
        <button className="mmsz-btn" onClick={mmszEmpezar} title="Escuchar esta lectura en voz alta">
          🔊 Escuchar
        </button>
      )}
      {mmszEstado === 'hablando' && (
        <button
          className="mmsz-btn"
          onClick={() => {
            mmszDicho.current?.mmszPausar();
            mmszSetEstado('pausado');
          }}
        >
          ⏸ Pausar
        </button>
      )}
      {mmszEstado === 'pausado' && (
        <button
          className="mmsz-btn"
          onClick={() => {
            mmszDicho.current?.mmszReanudar();
            mmszSetEstado('hablando');
          }}
        >
          ▶ Continuar
        </button>
      )}
      {mmszEstado !== 'parado' && (
        <button className="mmsz-btn" onClick={mmszDetener}>
          ⏹ Detener
        </button>
      )}
      <label className="mmsz-velocidad">
        Velocidad
        <select
          value={mmszVelocidad}
          onChange={(mmszE) => {
            mmszSetVelocidad(Number(mmszE.target.value));
            if (mmszEstado !== 'parado') mmszDetener();
          }}
        >
          {MMSZ_VELOCIDADES.map((mmszV) => (
            <option key={mmszV} value={mmszV}>
              {mmszV}x
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
