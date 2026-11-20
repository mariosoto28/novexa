// Autor: MMSZ (Mario Soto Zea)
// Lee en voz alta el texto de una lectura usando las voces del sistema (Windows trae voces en español).
// No necesita internet ni archivos de audio.
import { useEffect, useRef, useState } from 'react';

/** Convierte el texto con formato en frases para leer en voz alta. */
function mmszTextoHablado(mmszMarkdown: string): string[] {
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
  // Frases cortas: algunas voces se cortan con textos muy largos.
  return mmszLimpio
    .split(/\n+|(?<=[.!?:])\s+/)
    .map((f) => f.trim())
    .filter(Boolean);
}

function mmszVozEspanol(): SpeechSynthesisVoice | undefined {
  const mmszVoces = speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith('es'));
  return (
    mmszVoces.find((v) => /es-(MX|US|PE|419)/i.test(v.lang)) ??
    mmszVoces.find((v) => /es-ES/i.test(v.lang)) ??
    mmszVoces[0]
  );
}

const MMSZ_VELOCIDADES = [0.8, 1, 1.25, 1.5];

export default function MmszLectorVoz({ mmszTexto }: { mmszTexto: string }) {
  const mmszDisponible = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const [mmszEstado, setMmszEstado] = useState<'parado' | 'hablando' | 'pausado'>('parado');
  const [mmszVelocidad, setMmszVelocidad] = useState(1);
  const [mmszSinVoz, setMmszSinVoz] = useState(false);
  const mmszCancelado = useRef(false);

  // Detiene la lectura al salir de la página o cambiar de texto.
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
    if (!mmszVoz && speechSynthesis.getVoices().length > 0) setMmszSinVoz(true);
    const mmszFrases = mmszTextoHablado(mmszTexto);
    mmszFrases.forEach((f, i) => {
      const u = new SpeechSynthesisUtterance(f);
      u.lang = mmszVoz?.lang ?? 'es-ES';
      if (mmszVoz) u.voice = mmszVoz;
      u.rate = mmszVelocidad;
      if (i === mmszFrases.length - 1) u.onend = () => !mmszCancelado.current && setMmszEstado('parado');
      speechSynthesis.speak(u);
    });
    setMmszEstado('hablando');
  }

  function mmszDetener() {
    mmszCancelado.current = true;
    speechSynthesis.cancel();
    setMmszEstado('parado');
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
            setMmszEstado('pausado');
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
            setMmszEstado('hablando');
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
          onChange={(e) => {
            setMmszVelocidad(Number(e.target.value));
            if (mmszEstado !== 'parado') mmszDetener();
          }}
        >
          {MMSZ_VELOCIDADES.map((v) => (
            <option key={v} value={v}>
              {v}x
            </option>
          ))}
        </select>
      </label>
      {mmszSinVoz && <small className="muted">No encontré una voz en español; se usará la voz del sistema.</small>}
    </div>
  );
}
