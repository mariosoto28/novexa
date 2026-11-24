// Autor: MMSZ (Mario Soto Zea)
// Desafío o proyecto por pasos: instrucciones + pista, editor y salida.
// Cada paso continúa el código del anterior (como en un proyecto real).
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

/**
 * Si el error es por un nombre que no existe (por ejemplo "Print") y en la solución aparece
 * el mismo nombre con otras mayúsculas ("print"), lo dice claramente.
 */
function mmszPistaDeError(mmszError: string, mmszSolucion: string): string {
  const mmszGenerico = 'Tu programa tiene un error. Revisa el mensaje en la salida.';
  const m =
    mmszError.match(/name '(\w+)' is not defined/) ||
    mmszError.match(/(\w+) is not defined/) ||
    mmszError.match(/variable (\w+) does not exist/);
  if (!m) return mmszGenerico;
  const mmszEscrito = m[1];
  const mmszCorrecto = mmszSolucion.match(new RegExp(`\\b${mmszEscrito}\\b`, 'i'))?.[0];
  if (mmszCorrecto && mmszCorrecto !== mmszEscrito) {
    return `Revisa las mayúsculas: escribiste \`${mmszEscrito}\`, pero debe ser \`${mmszCorrecto}\`. En el código las mayúsculas sí importan.`;
  }
  return mmszGenerico;
}

/** Explica por qué la salida no coincide, según el caso más común. */
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
  const mmszPasos = mmszDesafio.pasos;
  const [mmszIndice, setMmszIndice] = useState(0);
  const [mmszCodigo, setMmszCodigo] = useState(mmszPasos[0].inicio ?? '');
  const [mmszResultado, setMmszResultado] = useState<MmszRunResult | null>(null);
  const [mmszCorriendo, setMmszCorriendo] = useState(false);
  const [mmszMensaje, setMmszMensaje] = useState<{ ok: boolean; texto: string; info?: boolean } | null>(null);
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
    // Lo que el código debe usar (print, for, if...) se revisa exacto: en el código las mayúsculas importan.
    const mmszFaltan = (mmszPaso.requiere ?? []).filter((t) => !mmszCodigo.includes(t));
    if (mmszFaltan.length) {
      const mmszMinus = mmszCodigo.toLowerCase();
      const mmszPorMayusculas = mmszFaltan.filter((t) => mmszMinus.includes(t.toLowerCase()));
      setMmszFallos((f) => f + 1);
      setMmszMensaje({
        ok: false,
        texto: mmszPorMayusculas.length
          ? `Revisa las mayúsculas: en el código deben escribirse así: ${mmszPorMayusculas.map((t) => `\`${t}\``).join(', ')}. (En lo que muestra tu programa no importan, pero en las instrucciones sí.)`
          : `Tu código todavía no usa: ${mmszFaltan.map((t) => `\`${t}\``).join(', ')}.`,
      });
      return;
    }
    if (mmszSeEjecuta) {
      const r = await mmszEjecutar();
      if (r.error) {
        setMmszFallos((f) => f + 1);
        setMmszMensaje({ ok: false, texto: mmszPistaDeError(r.error, mmszPaso.solucion) });
        return;
      }
      // En la salida no importan mayúsculas ni espacios extra.
      if (!mmszMismaSalida(r.output, mmszPaso.salida!)) {
        setMmszFallos((f) => f + 1);
        setMmszMensaje({ ok: false, texto: mmszPistaDeSalida(r.output, mmszPaso.salida!, mmszLang) });
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
                <small className="muted">No importan mayúsculas ni minúsculas</small>
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
              setMmszMensaje({
                ok: false,
                info: true,
                texto: 'Te mostramos una solución. Léela (usa 🧭 Paso a paso para entender cada línea), ejecútala y luego presiona “Comprobar paso”.',
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
          mmszSolucion={mmszPaso.solucion}
          mmszLang={mmszLang}
          mmszCodigo={mmszCodigo}
          mmszCambiarCodigo={(c) => {
            setMmszCodigo(c);
            setMmszMensaje(null);
          }}
        />
      )}

      {mmszMensaje && (
        <div className={`mmsz-mensaje ${mmszMensaje.ok ? 'ok' : mmszMensaje.info ? 'info' : 'error'}`}>
          <MmszMarkdown texto={mmszMensaje.texto} lang={mmszLang} />
        </div>
      )}
    </div>
  );
}
