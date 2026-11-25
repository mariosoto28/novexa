import { useState } from 'react';
import type { MmszDesafio } from '../types';
import { mmszRunCode, type MmszRunnableLang, type MmszRunResult } from '../runner';
import MmszEditor from './MmszEditor';
import MmszMarkdown from './MmszMarkdown';
import { mmszMismaSalida } from '../mmszComparar';
import MmszAyudaDesafio from './MmszAyudaDesafio';

interface MmszProps {
  mmszDesafio: MmszDesafio;
  mmszLang: MmszRunnableLang;
  mmszYaCompletado: boolean;
  mmszAlCompletar: () => void;
}

function mmszPistaDeError(mmszError: string, mmszSolucion: string): string {
  const mmszGenerico = 'Tu programa tiene un error. Revisa el mensaje en la salida.';
  const mmszM =
    mmszError.match(/name '(\w+)' is not defined/) ||
    mmszError.match(/(\w+) is not defined/) ||
    mmszError.match(/variable (\w+) does not exist/);
  if (!mmszM) return mmszGenerico;
  const mmszEscrito = mmszM[1];
  const mmszCorrecto = mmszSolucion.match(new RegExp(`\\b${mmszEscrito}\\b`, 'i'))?.[0];
  if (mmszCorrecto && mmszCorrecto !== mmszEscrito) {
    return `Revisa las mayúsculas: escribiste \`${mmszEscrito}\`, pero debe ser \`${mmszCorrecto}\`. En el código las mayúsculas sí importan.`;
  }
  return mmszGenerico;
}

function mmszPistaDeSalida(mmszObtenida: string, mmszEsperada: string, mmszLang: MmszRunnableLang): string {
  const mmszMostrar = mmszLang === 'python' ? 'print(...)' : mmszLang === 'javascript' ? 'console.log(...)' : 'cout << ... << endl;';
  const mmszLineasObt = mmszObtenida.trim() ? mmszObtenida.trim().split('\n').length : 0;
  const mmszLineasEsp = mmszEsperada.trim().split('\n').length;
  if (mmszLineasObt === 0) {
    return `Tu programa no mostró nada. Calcular un valor no basta: para verlo en pantalla usa \`${mmszMostrar}\`.`;
  }
  if (mmszLineasObt < mmszLineasEsp) {
    return `Casi: tu programa muestra ${mmszLineasObt} de ${mmszLineasEsp} líneas. Te falta mostrar ${mmszLineasEsp - mmszLineasObt} con \`${mmszMostrar}\`.`;
  }
  if (mmszLineasObt > mmszLineasEsp) {
    return `Casi: tu programa muestra ${mmszLineasObt} líneas y se esperan ${mmszLineasEsp}. Revisa si sobra algún \`${mmszMostrar}\`.`;
  }
  return 'Casi. Tu salida no coincide con la salida esperada; compáralas línea por línea.';
}

export default function MmszDesafioVista({ mmszDesafio, mmszLang, mmszYaCompletado, mmszAlCompletar }: MmszProps) {
  const mmszPasos = mmszDesafio.mmszPasos;
  const [mmszIndice, mmszSetIndice] = useState(0);
  const [mmszCodigo, mmszSetCodigo] = useState(mmszPasos[0].mmszInicio ?? '');
  const [mmszResultado, mmszSetResultado] = useState<MmszRunResult | null>(null);
  const [mmszCorriendo, mmszSetCorriendo] = useState(false);
  const [mmszMensaje, mmszSetMensaje] = useState<{ mmszOk: boolean; mmszTexto: string; mmszInfo?: boolean } | null>(null);
  const [mmszFallos, mmszSetFallos] = useState(0);
  const [mmszTerminado, mmszSetTerminado] = useState(false);

  const mmszPaso = mmszPasos[mmszIndice];
  const mmszSeEjecuta = mmszPaso.mmszSalida !== undefined;
  const mmszPasoListo = mmszMensaje?.mmszOk === true;

  async function mmszEjecutar() {
    mmszSetCorriendo(true);
    const mmszR = await mmszRunCode(mmszLang, mmszCodigo);
    mmszSetResultado(mmszR);
    mmszSetCorriendo(false);
    return mmszR;
  }

  async function mmszComprobar() {
    const mmszFaltan = (mmszPaso.mmszRequiere ?? []).filter((mmszT) => !mmszCodigo.includes(mmszT));
    if (mmszFaltan.length) {
      const mmszMinus = mmszCodigo.toLowerCase();
      const mmszPorMayusculas = mmszFaltan.filter((mmszT) => mmszMinus.includes(mmszT.toLowerCase()));
      mmszSetFallos((mmszF) => mmszF + 1);
      mmszSetMensaje({
        mmszOk: false,
        mmszTexto: mmszPorMayusculas.length
          ? `Revisa las mayúsculas: en el código deben escribirse así: ${mmszPorMayusculas.map((mmszT) => `\`${mmszT}\``).join(', ')}. (En lo que muestra tu programa no importan, pero en las instrucciones sí.)`
          : `Tu código todavía no usa: ${mmszFaltan.map((mmszT) => `\`${mmszT}\``).join(', ')}.`,
      });
      return;
    }
    if (mmszSeEjecuta) {
      const mmszR = await mmszEjecutar();
      if (mmszR.mmszError) {
        mmszSetFallos((mmszF) => mmszF + 1);
        mmszSetMensaje({ mmszOk: false, mmszTexto: mmszPistaDeError(mmszR.mmszError, mmszPaso.mmszSolucion) });
        return;
      }
      if (!mmszMismaSalida(mmszR.mmszOutput, mmszPaso.mmszSalida!)) {
        mmszSetFallos((mmszF) => mmszF + 1);
        mmszSetMensaje({ mmszOk: false, mmszTexto: mmszPistaDeSalida(mmszR.mmszOutput, mmszPaso.mmszSalida!, mmszLang) });
        return;
      }
    }
    mmszSetFallos(0);
    if (mmszIndice === mmszPasos.length - 1) {
      mmszSetTerminado(true);
      mmszSetMensaje({ mmszOk: true, mmszTexto: mmszDesafio.mmszTipo === 'proyecto' ? '¡Proyecto terminado! 🎉' : '¡Desafío completado! 🎉' });
      mmszAlCompletar();
    } else {
      mmszSetMensaje({ mmszOk: true, mmszTexto: `¡Muy bien! Paso ${mmszIndice + 1} completado.` });
    }
  }

  function mmszSiguientePaso() {
    mmszSetIndice(mmszIndice + 1);
    mmszSetMensaje(null);
    mmszSetResultado(null);
  }

  return (
    <div className="mmsz-desafio">
      <div className="mmsz-pasos-barra">
        {mmszPasos.map((mmszSinUso, mmszI) => (
          <span key={mmszI} className={mmszI < mmszIndice || mmszTerminado ? 'hecho' : mmszI === mmszIndice ? 'actual' : ''} />
        ))}
        <small className="muted">
          Paso {mmszIndice + 1} de {mmszPasos.length}
          {mmszYaCompletado && ' · ya lo completaste antes'}
        </small>
      </div>

      <div className="mmsz-desafio-cabecera">
        <div className="mmsz-desafio-instrucciones">
          <h3>
            Paso {mmszIndice + 1}: {mmszPaso.mmszTitulo}
          </h3>
          <MmszMarkdown mmszTexto={mmszPaso.mmszInstrucciones} mmszLang={mmszLang} />
          {!mmszSeEjecuta && (
            <div className="mmsz-nota">
              Este tema usa partes del lenguaje que el simulador de Novexa todavía no ejecuta. Se revisa que tu código use lo
              que se pide; pruébalo después en un compilador real.
            </div>
          )}
        </div>
        {(mmszPaso.mmszPista || mmszPaso.mmszSalida) && (
          <aside className="mmsz-pista">
            {mmszPaso.mmszPista && (
              <>
                <b>Pista</b>
                <pre>{mmszPaso.mmszPista}</pre>
              </>
            )}
            {mmszPaso.mmszSalida !== undefined && (
              <>
                <b>Salida esperada</b>
                <small className="muted">No importan mayúsculas ni minúsculas</small>
                <pre className="mmsz-pista-salida">{mmszPaso.mmszSalida}</pre>
              </>
            )}
          </aside>
        )}
      </div>

      <div className="mmsz-desafio-trabajo">
        <MmszEditor
          mmszValor={mmszCodigo}
          mmszCambiar={(mmszV) => {
            mmszSetCodigo(mmszV);
            if (mmszMensaje && !mmszMensaje.mmszOk) mmszSetMensaje(null);
          }}
          mmszLang={mmszLang}
          mmszEjecutar={mmszSeEjecuta ? mmszEjecutar : undefined}
          mmszBloqueado={mmszTerminado}
        />
        <div className="mmsz-salida">
          <span className="small muted">Salida de tu programa</span>
          <pre className={mmszResultado?.mmszError ? 'out err' : 'out'}>
            {!mmszResultado && <span className="muted">{mmszSeEjecuta ? 'Presiona ▶ Ejecutar para ver el resultado' : 'Este paso no se ejecuta'}</span>}
            {mmszResultado?.mmszOutput}
            {mmszResultado?.mmszError ? `${mmszResultado.mmszOutput ? '\n' : ''}${mmszResultado.mmszError}` : ''}
            {mmszResultado && !mmszResultado.mmszOutput && !mmszResultado.mmszError ? '(no se mostró nada)' : ''}
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
              mmszSetCodigo(mmszPaso.mmszSolucion);
              mmszSetMensaje({
                mmszOk: false,
                mmszInfo: true,
                mmszTexto: 'Te mostramos una solución. Léela (usa 🧭 Paso a paso para entender cada línea), ejecútala y luego presiona “Comprobar paso”.',
              });
            }}
          >
            Ver una solución
          </button>
        )}
        <span className="small muted">Ctrl + Enter para ejecutar</span>
      </div>

      {!mmszTerminado && !mmszPasoListo && (
        <MmszAyudaDesafio
          key={mmszIndice}
          mmszSolucion={mmszPaso.mmszSolucion}
          mmszLang={mmszLang}
          mmszCodigo={mmszCodigo}
          mmszCambiarCodigo={(mmszC) => {
            mmszSetCodigo(mmszC);
            mmszSetMensaje(null);
          }}
        />
      )}

      {mmszMensaje && (
        <div className={`mmsz-mensaje ${mmszMensaje.mmszOk ? 'ok' : mmszMensaje.mmszInfo ? 'info' : 'error'}`}>
          <MmszMarkdown mmszTexto={mmszMensaje.mmszTexto} mmszLang={mmszLang} />
        </div>
      )}
    </div>
  );
}
