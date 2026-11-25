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

function mmszEsAutomatica(mmszL: string): boolean {
  const mmszS = mmszL.trim();
  return (
    !mmszS ||
    /^(#include|using namespace|int main\(\)\s*{|return 0;|}\s*;?$|\);?$|\]\s*;?$|#\s|\/\/)/.test(mmszS) ||
    /^[}\])],?$/.test(mmszS)
  );
}

const mmszSinEspacios = (mmszS: string) => mmszS.replace(/\s+/g, '');

function mmszMismosNumeros(mmszA: string, mmszB: string): boolean {
  const mmszNums = (mmszS: string) => (mmszS.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number);
  const mmszX = mmszNums(mmszA);
  const mmszY = mmszNums(mmszB);
  return mmszX.length > 0 && mmszX.length === mmszY.length && mmszX.every((mmszV, mmszI) => Math.abs(mmszV - mmszY[mmszI]) < 1e-9);
}

function mmszExperimento(mmszCodigo: string): string {
  const mmszM = mmszCodigo.match(/^\s*(?:const |let |int |double )?(\w+)\s*=\s*(-?\d+(?:\.\d+)?)\s*;?\s*$/m);
  if (mmszM) return `Cambia el valor de «${mmszM[1]}» (ahora es ${mmszM[2]}) por otro número y vuelve a ejecutar. ¿Cómo cambia el resultado?`;
  const mmszT = mmszCodigo.match(/["']([^"']{3,})["']/);
  if (mmszT) return `Cambia el texto "${mmszT[1]}" por otro y vuelve a ejecutar.`;
  return 'Cambia algo del programa (un número, un texto o una condición) y vuelve a ejecutar para ver qué pasa.';
}

export default function MmszProgramaGuiado({ mmszGuiado, mmszLang, mmszAlTerminar, mmszIrAlDesafio }: MmszProps) {
  const mmszLineas = useMemo(() => mmszGuiado.mmszCodigo.split('\n'), [mmszGuiado.mmszCodigo]);
  const mmszRequeridas = mmszLineas.map((mmszL, mmszI) => ({ mmszL, mmszI })).filter((mmszX) => !mmszEsAutomatica(mmszX.mmszL));
  const mmszSeEjecuta = mmszGuiado.mmszSalida !== undefined;

  const [mmszFase, mmszSetFase] = useState<MmszFase>('construir');
  const [mmszPaso, mmszSetPaso] = useState(0);
  const [mmszEscrito, mmszSetEscrito] = useState('');
  const [mmszPista, mmszSetPista] = useState(0);
  const [mmszAviso, mmszSetAviso] = useState<{ mmszOk: boolean; mmszTexto: string } | null>(null);
  const [mmszAciertosSinAyuda, mmszSetAciertosSinAyuda] = useState(0);
  const [mmszPrediccion, mmszSetPrediccion] = useState('');
  const [mmszResultado, mmszSetResultado] = useState<MmszRunResult | null>(null);
  const [mmszCorriendo, mmszSetCorriendo] = useState(false);
  const [mmszJuego, mmszSetJuego] = useState(mmszGuiado.mmszCodigo);
  const [mmszJuegoSalida, mmszSetJuegoSalida] = useState<MmszRunResult | null>(null);
  const mmszEntrada = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (mmszLang === 'python' && mmszSeEjecuta) mmszPreloadPython();
  }, [mmszLang, mmszSeEjecuta]);
  useEffect(() => mmszEntrada.current?.focus(), [mmszPaso, mmszFase]);

  const mmszActual = mmszRequeridas[mmszPaso];
  const mmszHasta = mmszFase === 'construir' && mmszActual ? mmszActual.mmszI : mmszLineas.length;

  function mmszComprobar() {
    if (!mmszActual) return;
    const mmszEsperada = mmszActual.mmszL;
    if (mmszSinEspacios(mmszEscrito) === mmszSinEspacios(mmszEsperada)) {
      if (mmszPista === 0) mmszSetAciertosSinAyuda((mmszN) => mmszN + 1);
      mmszAvanzar('¡Correcto! ✓');
    } else if (mmszSinEspacios(mmszEscrito).toLowerCase() === mmszSinEspacios(mmszEsperada).toLowerCase()) {
      mmszSetAviso({ mmszOk: false, mmszTexto: 'Casi: solo cambian las mayúsculas. En el código sí importan.' });
    } else if (!mmszEscrito.trim()) {
      mmszSetAviso({ mmszOk: false, mmszTexto: 'Escribe la línea en el cuadro. Si no sabes cómo, usa 💡 Pista.' });
    } else {
      mmszSetAviso({ mmszOk: false, mmszTexto: 'Todavía no. Compara con la explicación o usa 💡 Pista para ver la forma de la línea.' });
    }
  }

  function mmszAvanzar(mmszTexto: string) {
    mmszSetAviso({ mmszOk: true, mmszTexto });
    mmszSetEscrito('');
    mmszSetPista(0);
    if (mmszPaso + 1 >= mmszRequeridas.length) {
      mmszSetPaso(mmszRequeridas.length);
      mmszSetFase(mmszSeEjecuta ? 'predecir' : 'experimentar');
    } else {
      mmszSetPaso(mmszPaso + 1);
    }
  }

  async function mmszEjecutarYComparar() {
    mmszSetCorriendo(true);
    const mmszR = await mmszRunCode(mmszLang, mmszGuiado.mmszCodigo);
    mmszSetResultado(mmszR);
    mmszSetCorriendo(false);
  }

  async function mmszEjecutarJuego() {
    mmszSetCorriendo(true);
    mmszSetJuegoSalida(await mmszRunCode(mmszLang, mmszJuego));
    mmszSetCorriendo(false);
  }

  function mmszTerminar() {
    mmszSetFase('listo');
    mmszAlTerminar();
  }

  const mmszFases: { mmszId: MmszFase; mmszTexto: string }[] = [
    { mmszId: 'construir', mmszTexto: '1. Construir' },
    ...(mmszSeEjecuta ? [{ mmszId: 'predecir' as const, mmszTexto: '2. Predecir' }] : []),
    { mmszId: 'experimentar', mmszTexto: `${mmszSeEjecuta ? 3 : 2}. Experimentar` },
    { mmszId: 'listo', mmszTexto: '✓ Listo' },
  ];
  const mmszFaseIdx = mmszFases.findIndex((mmszF) => mmszF.mmszId === mmszFase);

  return (
    <div className="mmsz-guiado">
      <div className="mmsz-guiado-fases">
        {mmszFases.map((mmszF, mmszI) => (
          <span key={mmszF.mmszId} className={mmszI < mmszFaseIdx ? 'hecha' : mmszI === mmszFaseIdx ? 'actual' : ''}>
            {mmszF.mmszTexto}
          </span>
        ))}
      </div>

      <details className="mmsz-guiado-objetivo" open={mmszFase === 'construir' && mmszPaso === 0}>
        <summary>🎯 Qué vamos a programar</summary>
        <MmszMarkdown mmszTexto={mmszGuiado.mmszObjetivo} mmszLang={mmszLang} />
      </details>

      <div className="mmsz-guiado-cuerpo">
        <section className="mmsz-guiado-actividad">
          {mmszFase === 'construir' && mmszActual && (
            <div key={mmszPaso} className="mmsz-aparecer">
              <small className="muted">
                Línea {mmszPaso + 1} de {mmszRequeridas.length}
              </small>
              <h3>{mmszExplicarLinea(mmszActual.mmszL, mmszLang)}</h3>
              {mmszLang === 'python' && /^\s+/.test(mmszActual.mmszL) && (
                <p className="muted small">La sangría (espacios al inicio) la ponemos por ti.</p>
              )}
              <label className="mmsz-guiado-entrada">
                <span>Escribe esta línea:</span>
                <input
                  ref={mmszEntrada}
                  value={mmszEscrito}
                  spellCheck={false}
                  placeholder={mmszPista >= 1 ? mmszHuecoLinea(mmszActual.mmszL, mmszLang).trim() : 'Escribe aquí tu línea de código…'}
                  onChange={(mmszE) => {
                    mmszSetEscrito(mmszE.target.value);
                    mmszSetAviso(null);
                  }}
                  onKeyDown={(mmszE) => mmszE.key === 'Enter' && mmszComprobar()}
                />
              </label>
              {mmszPista >= 1 && (
                <div className="mmsz-guiado-pista">
                  <small>💡 La línea tiene esta forma (completa los ___):</small>
                  <code>{mmszHuecoLinea(mmszActual.mmszL, mmszLang).trim()}</code>
                </div>
              )}
              {mmszPista >= 2 && (
                <div className="mmsz-guiado-pista respuesta">
                  <small>Respuesta: escríbela tú para practicar</small>
                  <code>{mmszActual.mmszL.trim()}</code>
                </div>
              )}
              <div className="mmsz-acciones">
                <button className="mmsz-din-boton chico" onClick={mmszComprobar}>
                  Comprobar ↵
                </button>
                {mmszPista < 2 && (
                  <button className="mmsz-btn" onClick={() => mmszSetPista(mmszPista + 1)}>
                    {mmszPista === 0 ? '💡 Pista' : '👀 Ver respuesta'}
                  </button>
                )}
              </div>
              {mmszAviso && <div className={`mmsz-mensaje ${mmszAviso.mmszOk ? 'ok' : 'error'}`}>{mmszAviso.mmszTexto}</div>}
            </div>
          )}

          {mmszFase === 'predecir' && (
            <div className="mmsz-aparecer">
              <h3>🔮 Antes de ejecutar: ¿qué crees que mostrará tu programa?</h3>
              <p className="muted">Piensa qué hace cada línea. Escribe lo que aparecerá en pantalla (o déjalo vacío si no sabes).</p>
              <textarea
                className="mmsz-guiado-prediccion"
                value={mmszPrediccion}
                onChange={(mmszE) => mmszSetPrediccion(mmszE.target.value)}
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
                      <pre>{mmszResultado.mmszOutput || mmszResultado.mmszError}</pre>
                    </div>
                  </div>
                  <div className={`mmsz-mensaje ${mmszMismaSalida(mmszPrediccion, mmszResultado.mmszOutput) ? 'ok' : 'info'}`}>
                    {mmszMismaSalida(mmszPrediccion, mmszResultado.mmszOutput)
                      ? '🎯 ¡Acertaste! Entiendes lo que hace tu programa.'
                      : mmszMismosNumeros(mmszPrediccion, mmszResultado.mmszOutput)
                        ? `🎯 ¡Casi perfecto! Los valores son correctos; solo cambia el formato.${mmszLang === 'python' ? ' En Python, la división con / siempre da un número con decimales (por ejemplo 14.0).' : ''}`
                        : 'No pasa nada: compara tu predicción con la salida real y revisa qué línea produce cada resultado.'}
                  </div>
                  <button className="mmsz-din-boton chico" onClick={() => mmszSetFase('experimentar')}>
                    Siguiente: experimentar →
                  </button>
                </>
              )}
            </div>
          )}

          {mmszFase === 'experimentar' && (
            <div className="mmsz-aparecer">
              <h3>🧪 Ahora experimenta</h3>
              <p>{mmszExperimento(mmszGuiado.mmszCodigo)}</p>
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
                    mmszSetJuego(mmszGuiado.mmszCodigo);
                    mmszSetJuegoSalida(null);
                  }}
                >
                  ↺ Restaurar
                </button>
                <button className="mmsz-btn mmsz-btn-fuerte" onClick={mmszTerminar}>
                  Terminé de experimentar ✓
                </button>
              </div>
              {mmszJuegoSalida && (
                <pre className={`out ${mmszJuegoSalida.mmszError ? 'err' : ''}`}>
                  {mmszJuegoSalida.mmszOutput}
                  {mmszJuegoSalida.mmszError ? `${mmszJuegoSalida.mmszOutput ? '\n' : ''}${mmszJuegoSalida.mmszError}` : ''}
                  {!mmszJuegoSalida.mmszOutput && !mmszJuegoSalida.mmszError ? '(no se mostró nada)' : ''}
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
                    mmszSetFase('construir');
                    mmszSetPaso(0);
                    mmszSetAviso(null);
                    mmszSetAciertosSinAyuda(0);
                    mmszSetResultado(null);
                    mmszSetPrediccion('');
                  }}
                >
                  ↺ Volver a construirlo
                </button>
              </div>
            </div>
          )}
        </section>

        <section className="mmsz-guiado-programa">
          <div className="mmsz-ventana-puntos">
            <i /> <i /> <i />
            <small>{mmszLang === 'cpp' ? 'main.cpp' : mmszLang === 'python' ? 'programa.py' : 'programa.js'}</small>
          </div>
          {mmszFase === 'experimentar' ? (
            <MmszEditor mmszValor={mmszJuego} mmszCambiar={mmszSetJuego} mmszLang={mmszLang} mmszEjecutar={mmszEjecutarJuego} />
          ) : (
            <ol className="mmsz-guiado-lineas">
              {mmszLineas.map((mmszL, mmszI) => {
                const mmszVisible = mmszI < mmszHasta;
                const mmszEsActual = mmszFase === 'construir' && mmszActual?.mmszI === mmszI;
                return (
                  <li key={mmszI} className={`${mmszVisible ? 'visible' : ''} ${mmszEsActual ? 'actual' : ''} ${mmszEsAutomatica(mmszL) ? 'auto' : ''}`}>
                    <span className="mmsz-guiado-num">{mmszI + 1}</span>
                    <code>{mmszVisible ? mmszL || ' ' : mmszEsActual ? '▍ tu línea va aquí' : mmszL.trim() ? '…' : ' '}</code>
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
