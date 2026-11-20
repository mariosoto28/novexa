// Autor: MMSZ (Mario Soto Zea)
// Desafío o proyecto por pasos: instrucciones + pista, editor y salida.
// Cada paso continúa el código del anterior (como en un proyecto real).
import { useState } from 'react';
import type { MmszDesafio } from '../types';
import { mmszRunCode, type MmszRunnableLang, type MmszRunResult } from '../runner';
import MmszEditor from './MmszEditor';
import MmszMarkdown from './MmszMarkdown';

interface MmszProps {
  mmszDesafio: MmszDesafio;
  mmszLang: MmszRunnableLang;
  mmszYaCompletado: boolean;
  mmszAlCompletar: () => void;
}

const mmszNormalizar = (s: string) => s.replace(/\r/g, '').trim().replace(/\s+/g, ' ');

export default function MmszDesafioVista({ mmszDesafio, mmszLang, mmszYaCompletado, mmszAlCompletar }: MmszProps) {
  const mmszPasos = mmszDesafio.pasos;
  const [mmszIndice, setMmszIndice] = useState(0);
  const [mmszCodigo, setMmszCodigo] = useState(mmszPasos[0].inicio ?? '');
  const [mmszResultado, setMmszResultado] = useState<MmszRunResult | null>(null);
  const [mmszCorriendo, setMmszCorriendo] = useState(false);
  const [mmszMensaje, setMmszMensaje] = useState<{ ok: boolean; texto: string } | null>(null);
  const [mmszFallos, setMmszFallos] = useState(0);
  const [mmszTerminado, setMmszTerminado] = useState(false);

  const mmszPaso = mmszPasos[mmszIndice];
  const mmszSeEjecuta = mmszPaso.salida !== undefined;
  const mmszPasoListo = mmszMensaje?.ok === true;

  async function mmszEjecutar() {
    setMmszCorriendo(true);
    const r = await mmszRunCode(mmszLang, mmszCodigo);
    setMmszResultado(r);
    setMmszCorriendo(false);
    return r;
  }

  async function mmszComprobar() {
    const mmszFaltan = (mmszPaso.requiere ?? []).filter((t) => !mmszCodigo.includes(t));
    if (mmszFaltan.length) {
      setMmszFallos((f) => f + 1);
      setMmszMensaje({ ok: false, texto: `Tu código todavía no usa: ${mmszFaltan.map((t) => `\`${t}\``).join(', ')}.` });
      return;
    }
    if (mmszSeEjecuta) {
      const r = await mmszEjecutar();
      if (r.error) {
        setMmszFallos((f) => f + 1);
        setMmszMensaje({ ok: false, texto: 'Tu programa tiene un error. Revisa el mensaje en la salida.' });
        return;
      }
      if (mmszNormalizar(r.output) !== mmszNormalizar(mmszPaso.salida!)) {
        setMmszFallos((f) => f + 1);
        setMmszMensaje({ ok: false, texto: 'Casi. Tu salida no coincide con la salida esperada; compáralas.' });
        return;
      }
    }
    setMmszFallos(0);
    if (mmszIndice === mmszPasos.length - 1) {
      setMmszTerminado(true);
      setMmszMensaje({ ok: true, texto: mmszDesafio.tipo === 'proyecto' ? '¡Proyecto terminado! 🎉' : '¡Desafío completado! 🎉' });
      mmszAlCompletar();
    } else {
      setMmszMensaje({ ok: true, texto: `¡Muy bien! Paso ${mmszIndice + 1} completado.` });
    }
  }

  function mmszSiguientePaso() {
    setMmszIndice(mmszIndice + 1);
    setMmszMensaje(null);
    setMmszResultado(null);
  }

  return (
    <div className="mmsz-desafio">
      <div className="mmsz-pasos-barra">
        {mmszPasos.map((_, i) => (
          <span key={i} className={i < mmszIndice || mmszTerminado ? 'hecho' : i === mmszIndice ? 'actual' : ''} />
        ))}
        <small className="muted">
          Paso {mmszIndice + 1} de {mmszPasos.length}
          {mmszYaCompletado && ' · ya lo completaste antes'}
        </small>
      </div>

      <div className="mmsz-desafio-cabecera">
        <div className="mmsz-desafio-instrucciones">
          <h3>
            Paso {mmszIndice + 1}: {mmszPaso.titulo}
          </h3>
          <MmszMarkdown texto={mmszPaso.instrucciones} lang={mmszLang} />
          {!mmszSeEjecuta && (
            <div className="mmsz-nota">
              Este tema usa partes del lenguaje que el simulador de Novexa todavía no ejecuta. Se revisa que tu código use lo
              que se pide; pruébalo después en un compilador real.
            </div>
          )}
        </div>
        {(mmszPaso.pista || mmszPaso.salida) && (
          <aside className="mmsz-pista">
            {mmszPaso.pista && (
              <>
                <b>Pista</b>
                <pre>{mmszPaso.pista}</pre>
              </>
            )}
            {mmszPaso.salida !== undefined && (
              <>
                <b>Salida esperada</b>
                <pre className="mmsz-pista-salida">{mmszPaso.salida}</pre>
              </>
            )}
          </aside>
        )}
      </div>

      <div className="mmsz-desafio-trabajo">
        <MmszEditor
          mmszValor={mmszCodigo}
          mmszCambiar={(v) => {
            setMmszCodigo(v);
            if (mmszMensaje && !mmszMensaje.ok) setMmszMensaje(null);
          }}
          mmszLang={mmszLang}
          mmszEjecutar={mmszSeEjecuta ? mmszEjecutar : undefined}
          mmszBloqueado={mmszTerminado}
        />
        <div className="mmsz-salida">
          <span className="small muted">Salida de tu programa</span>
          <pre className={mmszResultado?.error ? 'out err' : 'out'}>
            {!mmszResultado && <span className="muted">{mmszSeEjecuta ? 'Presiona ▶ Ejecutar para ver el resultado' : 'Este paso no se ejecuta'}</span>}
            {mmszResultado?.output}
            {mmszResultado?.error ? `${mmszResultado.output ? '\n' : ''}${mmszResultado.error}` : ''}
            {mmszResultado && !mmszResultado.output && !mmszResultado.error ? '(no se mostró nada)' : ''}
          </pre>
        </div>
      </div>

      <div className="mmsz-desafio-acciones">
        {mmszSeEjecuta && (
          <button className="run-btn" onClick={mmszEjecutar} disabled={mmszCorriendo || mmszTerminado}>
            {mmszCorriendo ? 'Ejecutando…' : '▶ Ejecutar'}
          </button>
        )}
        {!mmszPasoListo && !mmszTerminado && (
          <button className="mmsz-btn mmsz-btn-fuerte" onClick={mmszComprobar} disabled={mmszCorriendo}>
            Comprobar paso
          </button>
        )}
        {mmszPasoListo && !mmszTerminado && (
          <button className="mmsz-btn mmsz-btn-fuerte" onClick={mmszSiguientePaso}>
            Siguiente paso →
          </button>
        )}
        {mmszFallos >= 2 && !mmszPasoListo && (
          <button
            className="mmsz-enlace"
            onClick={() => {
              setMmszCodigo(mmszPaso.solucion);
              setMmszMensaje({ ok: false, texto: 'Te mostramos una solución. Léela, ejecútala y luego presiona “Comprobar paso”.' });
            }}
          >
            Ver una solución
          </button>
        )}
        <span className="small muted">Ctrl + Enter para ejecutar</span>
      </div>

      {mmszMensaje && (
        <div className={`mmsz-mensaje ${mmszMensaje.ok ? 'ok' : 'error'}`}>
          <MmszMarkdown texto={mmszMensaje.texto} lang={mmszLang} />
        </div>
      )}
    </div>
  );
}
