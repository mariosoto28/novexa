import { useEffect, useRef, useState } from 'react';

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

export function mmszVozEspanol(): SpeechSynthesisVoice | undefined {
  const mmszVoces = speechSynthesis.getVoices().filter((mmszV) => mmszV.lang.toLowerCase().startsWith('es'));
  return (
    mmszVoces.find((mmszV) => /es-(MX|US|PE|419)/i.test(mmszV.lang)) ??
    mmszVoces.find((mmszV) => /es-ES/i.test(mmszV.lang)) ??
    mmszVoces[0]
  );
}

const MMSZ_VELOCIDADES = [0.8, 1, 1.25, 1.5];

export default function MmszLectorVoz({ mmszTexto }: { mmszTexto: string }) {
  const mmszDisponible = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const [mmszEstado, mmszSetEstado] = useState<'parado' | 'hablando' | 'pausado'>('parado');
  const [mmszVelocidad, mmszSetVelocidad] = useState(1);
  const [mmszSinVoz, mmszSetSinVoz] = useState(false);
  const mmszCancelado = useRef(false);

  useEffect(() => {
    return () => {
      mmszCancelado.current = true;
      if (mmszDisponible) speechSynthesis.cancel();
    };
  }, [mmszTexto, mmszDisponible]);

  if (!mmszDisponible) return null;

  function mmszEmpezar() {
    speechSynthesis.cancel();
    mmszCancelado.current = false;
    const mmszVoz = mmszVozEspanol();
    if (!mmszVoz && speechSynthesis.getVoices().length > 0) mmszSetSinVoz(true);
    const mmszFrases = mmszTextoHablado(mmszTexto);
    mmszFrases.forEach((mmszF, mmszI) => {
      const mmszU = new SpeechSynthesisUtterance(mmszF);
      mmszU.lang = mmszVoz?.lang ?? 'es-ES';
      if (mmszVoz) mmszU.voice = mmszVoz;
      mmszU.rate = mmszVelocidad;
      if (mmszI === mmszFrases.length - 1) mmszU.onend = () => !mmszCancelado.current && mmszSetEstado('parado');
      speechSynthesis.speak(mmszU);
    });
    mmszSetEstado('hablando');
  }

  function mmszDetener() {
    mmszCancelado.current = true;
    speechSynthesis.cancel();
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
            speechSynthesis.pause();
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
            speechSynthesis.resume();
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
      {mmszSinVoz && <small className="muted">No encontré una voz en español; se usará la voz del sistema.</small>}
    </div>
  );
}
