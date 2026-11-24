// Autor: MMSZ (Mario Soto Zea)
// Programa guiado: el estudiante construye el programa del desafío línea por línea,
// con la explicación de cada línea, pistas, predicción de la salida y un espacio para experimentar.
import { useEffect, useMemo, useRef, useState } from 'react';
import type { MmszGuiado } from '../types';
import { mmszPreloadPython, mmszRunCode, type MmszRunnableLang, type MmszRunResult } from '../runner';
import { mmszExplicarLinea, mmszHuecoLinea } from '../mmszExplicador';
import { mmszMismaSalida } from '../mmszComparar';
import MmszMarkdown from './MmszMarkdown';
import MmszEditor from './MmszEditor';
import '../mmszDinamico.css';

interface MmszProps {
  mmszGuiado: MmszGuiado;
  mmszLang: MmszRunnableLang;
  mmszAlTerminar: () => void;
  mmszIrAlDesafio?: () => void;
}

type MmszFase = 'construir' | 'predecir' | 'experimentar' | 'listo';

/** Líneas que pone Novexa (estructura obligatoria, llaves de cierre, comentarios). */
function mmszEsAutomatica(l: string): boolean {
  const s = l.trim();
  return (
    !s ||
    /^(#include|using namespace|int main\(\)\s*{|return 0;|}\s*;?$|\);?$|\]\s*;?$|#\s|\/\/)/.test(s) ||
    /^[}\])],?$/.test(s)
  );
}

const mmszSinEspacios = (s: string) => s.replace(/\s+/g, '');

/** true si los dos textos tienen los mismos números (ej. "14" y "14.0"), aunque cambie el formato. */
function mmszMismosNumeros(a: string, b: string): boolean {
  const mmszNums = (s: string) => (s.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number);
  const x = mmszNums(a);
  const y = mmszNums(b);
  return x.length > 0 && x.length === y.length && x.every((v, i) => Math.abs(v - y[i]) < 1e-9);
}

/** Primer número asignado a una variable, para proponer un experimento. */
function mmszExperimento(mmszCodigo: string): string {
  const m = mmszCodigo.match(/^\s*(?:const |let |int |double )?(\w+)\s*=\s*(-?\d+(?:\.\d+)?)\s*;?\s*$/m);
  if (m) return `Cambia el valor de «${m[1]}» (ahora es ${m[2]}) por otro número y vuelve a ejecutar. ¿Cómo cambia el resultado?`;
  const t = mmszCodigo.match(/["']([^"']{3,})["']/);
  if (t) return `Cambia el texto "${t[1]}" por otro y vuelve a ejecutar.`;
  return 'Cambia algo del programa (un número, un texto o una condición) y vuelve a ejecutar para ver qué pasa.';
}

export default function MmszProgramaGuiado({ mmszGuiado, mmszLang, mmszAlTerminar, mmszIrAlDesafio }: MmszProps) {
  const mmszLineas = useMemo(() => mmszGuiado.codigo.split('\n'), [mmszGuiado.codigo]);
  const mmszRequeridas = mmszLineas.map((l, i) => ({ l, i })).filter((x) => !mmszEsAutomatica(x.l));
  const mmszSeEjecuta = mmszGuiado.salida !== undefined;

  const [mmszFase, setMmszFase] = useState<MmszFase>('construir');
  const [mmszPaso, setMmszPaso] = useState(0); // índice dentro de las líneas requeridas
  const [mmszEscrito, setMmszEscrito] = useState('');
  const [mmszPista, setMmszPista] = useState(0); // 0 nada, 1 estructura, 2 respuesta
  const [mmszAviso, setMmszAviso] = useState<{ ok: boolean; texto: string } | null>(null);
  const [mmszAciertosSinAyuda, setMmszAciertosSinAyuda] = useState(0);
  const [mmszPrediccion, setMmszPrediccion] = useState('');
  const [mmszResultado, setMmszResultado] = useState<MmszRunResult | null>(null);
  const [mmszCorriendo, setMmszCorriendo] = useState(false);
  const [mmszJuego, setMmszJuego] = useState(mmszGuiado.codigo);
  const [mmszJuegoSalida, setMmszJuegoSalida] = useState<MmszRunResult | null>(null);
  const mmszEntrada = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (mmszLang === 'python' && mmszSeEjecuta) mmszPreloadPython();
  }, [mmszLang, mmszSeEjecuta]);
  useEffect(() => mmszEntrada.current?.focus(), [mmszPaso, mmszFase]);

  const mmszActual = mmszRequeridas[mmszPaso];
  // Líneas visibles del programa: todas las automáticas hasta la actual y las requeridas ya escritas.
  const mmszHasta = mmszFase === 'construir' && mmszActual ? mmszActual.i : mmszLineas.length;

  function mmszComprobar() {
    if (!mmszActual) return;
    const mmszEsperada = mmszActual.l;
    if (mmszSinEspacios(mmszEscrito) === mmszSinEspacios(mmszEsperada)) {
      if (mmszPista === 0) setMmszAciertosSinAyuda((n) => n + 1);
      mmszAvanzar('¡Correcto! ✓');
    } else if (mmszSinEspacios(mmszEscrito).toLowerCase() === mmszSinEspacios(mmszEsperada).toLowerCase()) {
      setMmszAviso({ ok: false, texto: 'Casi: solo cambian las mayúsculas. En el código sí importan.' });
    } else if (!mmszEscrito.trim()) {
      setMmszAviso({ ok: false, texto: 'Escribe la línea en el cuadro. Si no sabes cómo, usa 💡 Pista.' });
    } else {
      setMmszAviso({ ok: false, texto: 'Todavía no. Compara con la explicación o usa 💡 Pista para ver la forma de la línea.' });
    }
  }

  function mmszAvanzar(mmszTexto: string) {
    setMmszAviso({ ok: true, texto: mmszTexto });
    setMmszEscrito('');
    setMmszPista(0);
    if (mmszPaso + 1 >= mmszRequeridas.length) {
      setMmszPaso(mmszRequeridas.length);
      setMmszFase(mmszSeEjecuta ? 'predecir' : 'experimentar');
    } else {
      setMmszPaso(mmszPaso + 1);
    }
  }

  async function mmszEjecutarYComparar() {
    setMmszCorriendo(true);
    const r = await mmszRunCode(mmszLang, mmszGuiado.codigo);
    setMmszResultado(r);
    setMmszCorriendo(false);
  }

  async function mmszEjecutarJuego() {
    setMmszCorriendo(true);
    setMmszJuegoSalida(await mmszRunCode(mmszLang, mmszJuego));
    setMmszCorriendo(false);
  }

  function mmszTerminar() {
    setMmszFase('listo');
    mmszAlTerminar();
  }

  const mmszFases: { id: MmszFase; texto: string }[] = [
    { id: 'construir', texto: '1. Construir' },
    ...(mmszSeEjecuta ? [{ id: 'predecir' as const, texto: '2. Predecir' }] : []),
    { id: 'experimentar', texto: `${mmszSeEjecuta ? 3 : 2}. Experimentar` },
    { id: 'listo', texto: '✓ Listo' },
  ];
  const mmszFaseIdx = mmszFases.findIndex((f) => f.id === mmszFase);

  return (
    <div className="mmsz-guiado">
      {/* ---------- Fases ---------- */}
      <div className="mmsz-guiado-fases">
        {mmszFases.map((f, i) => (
          <span key={f.id} className={i < mmszFaseIdx ? 'hecha' : i === mmszFaseIdx ? 'actual' : ''}>
            {f.texto}
          </span>
        ))}
      </div>

      <details className="mmsz-guiado-objetivo" open={mmszFase === 'construir' && mmszPaso === 0}>
        <summary>🎯 Qué vamos a programar</summary>
        <MmszMarkdown texto={mmszGuiado.objetivo} lang={mmszLang} />
      </details>

      <div className="mmsz-guiado-cuerpo">
        {/* ---------- Panel izquierdo: la actividad de cada fase ---------- */}
        <section className="mmsz-guiado-actividad">
          {mmszFase === 'construir' && mmszActual && (
            <div key={mmszPaso} className="mmsz-aparecer">
              <small className="muted">
                Línea {mmszPaso + 1} de {mmszRequeridas.length}
              </small>
              <h3>{mmszExplicarLinea(mmszActual.l, mmszLang)}</h3>
              {mmszLang === 'python' && /^\s+/.test(mmszActual.l) && (
                <p className="muted small">La sangría (espacios al inicio) la ponemos por ti.</p>
              )}
              <label className="mmsz-guiado-entrada">
                <span>Escribe esta línea:</span>
                <input
                  ref={mmszEntrada}
                  value={mmszEscrito}
                  spellCheck={false}
                  placeholder={mmszPista >= 1 ? mmszHuecoLinea(mmszActual.l, mmszLang).trim() : 'Escribe aquí tu línea de código…'}
                  onChange={(e) => {
                    setMmszEscrito(e.target.value);
                    setMmszAviso(null);
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && mmszComprobar()}
                />
              </label>
              {mmszPista >= 1 && (
                <div className="mmsz-guiado-pista">
                  <small>💡 La línea tiene esta forma (completa los ___):</small>
                  <code>{mmszHuecoLinea(mmszActual.l, mmszLang).trim()}</code>
                </div>
              )}
              {mmszPista >= 2 && (
                <div className="mmsz-guiado-pista respuesta">
                  <small>Respuesta: escríbela tú para practicar</small>
                  <code>{mmszActual.l.trim()}</code>
                </div>
              )}
              <div className="mmsz-acciones">
                <button className="mmsz-din-boton chico" onClick={mmszComprobar}>
                  Comprobar ↵
                </button>
                {mmszPista < 2 && (
                  <button className="mmsz-btn" onClick={() => setMmszPista(mmszPista + 1)}>
                    {mmszPista === 0 ? '💡 Pista' : '👀 Ver respuesta'}
                  </button>
                )}
              </div>
              {mmszAviso && <div className={`mmsz-mensaje ${mmszAviso.ok ? 'ok' : 'error'}`}>{mmszAviso.texto}</div>}
            </div>
          )}

          {mmszFase === 'predecir' && (
            <div className="mmsz-aparecer">
              <h3>🔮 Antes de ejecutar: ¿qué crees que mostrará tu programa?</h3>
              <p className="muted">Piensa qué hace cada línea. Escribe lo que aparecerá en pantalla (o déjalo vacío si no sabes).</p>
              <textarea
                className="mmsz-guiado-prediccion"
                value={mmszPrediccion}
                onChange={(e) => setMmszPrediccion(e.target.value)}
                placeholder="Por ejemplo: 14.0"
                rows={3}
              />
              {!mmszResultado ? (
                <button className="mmsz-din-boton chico" disabled={mmszCorriendo} onClick={mmszEjecutarYComparar}>
                  {mmszCorriendo ? 'Ejecutando…' : '▶ Ejecutar y comparar'}
                </button>
              ) : (
                <>
                  <div className="mmsz-guiado-comparar">
                    <div>
                      <small>Tu predicción</small>
                      <pre>{mmszPrediccion || '(no escribiste nada)'}</pre>
                    </div>
                    <div>
                      <small>Salida real</small>
                      <pre>{mmszResultado.output || mmszResultado.error}</pre>
                    </div>
                  </div>
                  <div className={`mmsz-mensaje ${mmszMismaSalida(mmszPrediccion, mmszResultado.output) ? 'ok' : 'info'}`}>
                    {mmszMismaSalida(mmszPrediccion, mmszResultado.output)
                      ? '🎯 ¡Acertaste! Entiendes lo que hace tu programa.'
                      : mmszMismosNumeros(mmszPrediccion, mmszResultado.output)
                        ? `🎯 ¡Casi perfecto! Los valores son correctos; solo cambia el formato.${mmszLang === 'python' ? ' En Python, la división con / siempre da un número con decimales (por ejemplo 14.0).' : ''}`
                        : 'No pasa nada: compara tu predicción con la salida real y revisa qué línea produce cada resultado.'}
                  </div>
                  <button className="mmsz-din-boton chico" onClick={() => setMmszFase('experimentar')}>
                    Siguiente: experimentar →
                  </button>
                </>
              )}
            </div>
          )}

          {mmszFase === 'experimentar' && (
            <div className="mmsz-aparecer">
              <h3>🧪 Ahora experimenta</h3>
              <p>{mmszExperimento(mmszGuiado.codigo)}</p>
              <p className="muted small">Aquí no hay respuestas incorrectas: es tu espacio para probar.</p>
              <div className="mmsz-acciones">
                {mmszSeEjecuta && (
                  <button className="mmsz-din-boton chico" disabled={mmszCorriendo} onClick={mmszEjecutarJuego}>
                    {mmszCorriendo ? 'Ejecutando…' : '▶ Ejecutar'}
                  </button>
                )}
                <button
                  className="mmsz-btn"
                  onClick={() => {
                    setMmszJuego(mmszGuiado.codigo);
                    setMmszJuegoSalida(null);
                  }}
                >
                  ↺ Restaurar
                </button>
                <button className="mmsz-btn mmsz-btn-fuerte" onClick={mmszTerminar}>
                  Terminé de experimentar ✓
                </button>
              </div>
              {mmszJuegoSalida && (
                <pre className={`out ${mmszJuegoSalida.error ? 'err' : ''}`}>
                  {mmszJuegoSalida.output}
                  {mmszJuegoSalida.error ? `${mmszJuegoSalida.output ? '\n' : ''}${mmszJuegoSalida.error}` : ''}
                  {!mmszJuegoSalida.output && !mmszJuegoSalida.error ? '(no se mostró nada)' : ''}
                </pre>
              )}
            </div>
          )}

          {mmszFase === 'listo' && (
            <div className="mmsz-aparecer mmsz-guiado-fin">
              <span>🏁</span>
              <h3>¡Programa construido!</h3>
              <p>
                Escribiste {mmszRequeridas.length} líneas
                {mmszAciertosSinAyuda ? `, ${mmszAciertosSinAyuda} sin ninguna ayuda` : ''}. Ahora intenta el desafío tú solo.
              </p>
              <div className="mmsz-acciones">
                {mmszIrAlDesafio && (
                  <button className="mmsz-din-boton chico" onClick={mmszIrAlDesafio}>
                    Ir al desafío →
                  </button>
                )}
                <button
                  className="mmsz-btn"
                  onClick={() => {
                    setMmszFase('construir');
                    setMmszPaso(0);
                    setMmszAviso(null);
                    setMmszAciertosSinAyuda(0);
                    setMmszResultado(null);
                    setMmszPrediccion('');
                  }}
                >
                  ↺ Volver a construirlo
                </button>
              </div>
            </div>
          )}
        </section>

        {/* ---------- Panel derecho: el programa que se va armando ---------- */}
        <section className="mmsz-guiado-programa">
          <div className="mmsz-arte-puntos">
            <i /> <i /> <i />
            <small>{mmszLang === 'cpp' ? 'main.cpp' : mmszLang === 'python' ? 'programa.py' : 'programa.js'}</small>
          </div>
          {mmszFase === 'experimentar' ? (
            <MmszEditor mmszValor={mmszJuego} mmszCambiar={setMmszJuego} mmszLang={mmszLang} mmszEjecutar={mmszEjecutarJuego} />
          ) : (
            <ol className="mmsz-guiado-lineas">
              {mmszLineas.map((l, i) => {
                const mmszVisible = i < mmszHasta;
                const mmszEsActual = mmszFase === 'construir' && mmszActual?.i === i;
                return (
                  <li key={i} className={`${mmszVisible ? 'visible' : ''} ${mmszEsActual ? 'actual' : ''} ${mmszEsAutomatica(l) ? 'auto' : ''}`}>
                    <span className="mmsz-guiado-num">{i + 1}</span>
                    <code>{mmszVisible ? l || ' ' : mmszEsActual ? '▍ tu línea va aquí' : l.trim() ? '…' : ' '}</code>
                  </li>
                );
              })}
            </ol>
          )}
          {mmszFase === 'construir' && (
            <small className="mmsz-guiado-leyenda">Las líneas en gris (estructura obligatoria y cierres) las pone Novexa.</small>
          )}
        </section>
      </div>
    </div>
  );
}
