import { useEffect, useMemo, useRef, useState } from 'react';
import type { MmszGuia } from '../types';
import { mmszPreloadPython, mmszRunCode, type MmszRunnableLang, type MmszRunResult } from '../runner';
import { mmszConceptos, mmszExplicarLinea } from '../mmszExplicador';
import { mmszTextoHablado } from './MmszLectorVoz';
import { mmszCallar, mmszDecirFrases, mmszHayVoz as mmszHayVozDisponible, mmszPrecargar } from '../mmszVoz';
import MmszMarkdown, { MmszEnLinea } from './MmszMarkdown';
import MmszEditor from './MmszEditor';
import '../mmszDinamico.css';

interface MmszProps {
  mmszGuia: MmszGuia;
  mmszLang: MmszRunnableLang;
  mmszAlTerminar: () => void;
  mmszIrAlGuiado?: () => void;
}

type MmszTipoSegmento = 'intro' | 'recuerdo' | 'conceptos' | 'linea' | 'ejecutar' | 'cierre';

interface MmszSegmento {
  mmszTipo: MmszTipoSegmento;
  mmszInicio: number;
  mmszDur: number;
  mmszCapitulo: string;
  mmszSubtitulo: string;
  mmszVoz: string[];
  mmszLinea?: number;
}

const MMSZ_VELOCIDADES = [0.75, 1, 1.25, 1.5, 2];
const MMSZ_PORCION_ESCRITURA = 0.55;

const mmszDuracion = (mmszTexto: string, mmszMinimo = 2200) => Math.max(mmszMinimo, (mmszTexto.length / 13) * 1000 + 900);

const mmszReloj = (mmszMs: number) => {
  const mmszS = Math.max(0, Math.floor(mmszMs / 1000));
  return `${Math.floor(mmszS / 60)}:${String(mmszS % 60).padStart(2, '0')}`;
};

function mmszCrearGuion(mmszG: MmszGuia, mmszLang: MmszRunnableLang, mmszLineas: string[]): MmszSegmento[] {
  const mmszLista: Omit<MmszSegmento, 'mmszInicio'>[] = [];
  const mmszAgregar = (mmszTipo: MmszTipoSegmento, mmszCapitulo: string, mmszSubtitulo: string, mmszVozTexto = mmszSubtitulo, mmszLinea?: number) => {
    const mmszVoz = mmszTextoHablado(mmszVozTexto);
    mmszLista.push({ mmszTipo, mmszCapitulo, mmszSubtitulo, mmszVoz, mmszLinea, mmszDur: mmszDuracion(mmszVoz.join(' ')) });
  };

  const mmszNombre = mmszG.mmszTitulo.replace(/^Guía paso a paso: /, '');
  mmszAgregar('intro', 'Introducción', `Hoy vamos a programar: ${mmszNombre}. Te voy a enseñar a hacerlo paso a paso.`);
  if (mmszG.mmszRecuerdo) {
    mmszAgregar(
      'recuerdo',
      '¿Recuerdas?',
      `¿Recuerdas lo que hiciste en la lección **${mmszG.mmszRecuerdo.mmszLeccion}**? ${mmszG.mmszRecuerdo.mmszResumen} Hoy lo vamos a usar.`,
      `¿Recuerdas lo que hiciste en la lección ${mmszG.mmszRecuerdo.mmszLeccion}? ${mmszG.mmszRecuerdo.mmszResumen} Hoy lo vamos a usar.`,
    );
  }
  const mmszLosConceptos = mmszConceptos(mmszG.mmszCodigo, mmszLang);
  if (mmszLosConceptos.length) {
    mmszAgregar(
      'conceptos',
      'Conceptos básicos',
      `Para este programa vamos a necesitar: ${mmszLosConceptos.join('; ').toLowerCase()}.`,
    );
  }
  let mmszNumero = 0;
  mmszLineas.forEach((mmszL, mmszI) => {
    if (!mmszL.trim()) return;
    mmszNumero++;
    const mmszExplicacion = mmszExplicarLinea(mmszL, mmszLang) ?? 'Escribimos esta línea.';
    mmszAgregar('linea', `Línea ${mmszNumero}`, mmszExplicacion, mmszExplicacion, mmszI);
  });
  if (mmszG.mmszSalida !== undefined) {
    mmszAgregar('ejecutar', 'Ejecutar', 'Ahora ejecutamos el programa. Mira la salida: es lo que el programa muestra en pantalla.');
  }
  mmszAgregar(
    'cierre',
    'Tu turno',
    '¡Listo! Ya sabes cómo se hace. Pausa cuando quieras para cambiar el código y ejecutarlo, o haz tu propia versión abajo.',
  );

  let mmszT = 0;
  return mmszLista.map((mmszS) => {
    const mmszR = { ...mmszS, mmszInicio: mmszT };
    mmszT += mmszS.mmszDur;
    return mmszR;
  });
}

export default function MmszGuiaPasoAPaso({ mmszGuia, mmszLang, mmszAlTerminar, mmszIrAlGuiado }: MmszProps) {
  const mmszLineas = useMemo(() => mmszGuia.mmszCodigo.split('\n'), [mmszGuia.mmszCodigo]);
  const mmszGuion = useMemo(() => mmszCrearGuion(mmszGuia, mmszLang, mmszLineas), [mmszGuia, mmszLang, mmszLineas]);
  const mmszTotal = mmszGuion[mmszGuion.length - 1].mmszInicio + mmszGuion[mmszGuion.length - 1].mmszDur;
  const mmszHayVoz = mmszHayVozDisponible();

  const [mmszT, mmszSetT] = useState(0);
  const [mmszReproduciendo, mmszSetReproduciendo] = useState(false);
  const [mmszVelocidad, mmszSetVelocidad] = useState(1);
  const [mmszConVoz, mmszSetConVoz] = useState(mmszHayVoz);
  const [mmszSubtitulos, mmszSetSubtitulos] = useState(true);
  const [mmszSalida, mmszSetSalida] = useState<MmszRunResult | null>(null);
  const [mmszEditando, mmszSetEditando] = useState(false);
  const [mmszCodigoPausa, mmszSetCodigoPausa] = useState('');
  const [mmszSalidaPausa, mmszSetSalidaPausa] = useState<MmszRunResult | null>(null);
  const [mmszMiVersion, mmszSetMiVersion] = useState<string | null>(null);
  const [mmszSalidaMia, mmszSetSalidaMia] = useState<MmszRunResult | null>(null);
  const [mmszCorriendo, mmszSetCorriendo] = useState(false);

  const mmszHablando = useRef(false);
  const mmszTurno = useRef(0);
  const mmszTerminado = useRef(false);
  const mmszRaiz = useRef<HTMLDivElement>(null);

  const mmszIndice = Math.max(0, mmszGuion.findIndex((mmszS) => mmszT < mmszS.mmszInicio + mmszS.mmszDur));
  const mmszSeg = mmszT >= mmszTotal ? mmszGuion[mmszGuion.length - 1] : mmszGuion[mmszIndice];

  useEffect(() => {
    if (mmszGuia.mmszSalida === undefined) return;
    if (mmszLang === 'python') mmszPreloadPython();
    let mmszVivo = true;
    mmszRunCode(mmszLang, mmszGuia.mmszCodigo).then((mmszR) => mmszVivo && mmszSetSalida(mmszR));
    return () => {
      mmszVivo = false;
    };
  }, [mmszGuia, mmszLang]);

  useEffect(() => {
    if (!mmszReproduciendo) return;
    let mmszAntes = performance.now();
    let mmszId = 0;
    const mmszPaso = (mmszAhora: number) => {
      const mmszDt = (mmszAhora - mmszAntes) * mmszVelocidad;
      mmszAntes = mmszAhora;
      mmszSetT((mmszT) => {
        const mmszS = mmszGuion.find((mmszX) => mmszT < mmszX.mmszInicio + mmszX.mmszDur);
        let mmszN = mmszT + mmszDt;
        if (mmszS && mmszConVoz && mmszHablando.current && mmszN >= mmszS.mmszInicio + mmszS.mmszDur - 1) {
          mmszN = mmszS.mmszInicio + mmszS.mmszDur - 1;
        }
        return Math.min(mmszN, mmszTotal);
      });
      mmszId = requestAnimationFrame(mmszPaso);
    };
    mmszId = requestAnimationFrame(mmszPaso);
    return () => cancelAnimationFrame(mmszId);
  }, [mmszReproduciendo, mmszVelocidad, mmszConVoz, mmszGuion, mmszTotal]);

  useEffect(() => {
    if (mmszT >= mmszTotal && mmszReproduciendo) {
      mmszSetReproduciendo(false);
      if (!mmszTerminado.current) {
        mmszTerminado.current = true;
        mmszAlTerminar();
      }
    }
  }, [mmszT, mmszTotal, mmszReproduciendo, mmszAlTerminar]);

  useEffect(() => {
    if (mmszHayVoz && mmszConVoz) mmszPrecargar(mmszGuion[0]?.mmszVoz);
  }, [mmszGuion, mmszHayVoz, mmszConVoz]);

  useEffect(() => {
    if (!mmszHayVoz) return;
    mmszHablando.current = false;
    const mmszMiTurno = ++mmszTurno.current;
    if (!mmszReproduciendo || !mmszConVoz || mmszT >= mmszTotal) return;
    const mmszFrases = mmszSeg.mmszVoz;
    if (!mmszFrases.length) return;
    mmszHablando.current = true;
    mmszPrecargar(mmszGuion[mmszIndice + 1]?.mmszVoz);
    const mmszDicho = mmszDecirFrases(mmszFrases, mmszVelocidad);
    mmszDicho.mmszFin.then(() => {
      if (mmszTurno.current === mmszMiTurno) mmszHablando.current = false;
    });
    const mmszSeguro = setTimeout(() => {
      if (mmszTurno.current === mmszMiTurno) mmszHablando.current = false;
    }, (mmszSeg.mmszDur / mmszVelocidad) + 8000);
    return () => {
      clearTimeout(mmszSeguro);
      mmszDicho.mmszCancelar();
    };
  }, [mmszIndice, mmszReproduciendo, mmszConVoz, mmszVelocidad]);

  useEffect(() => () => mmszCallar(), []);

  const mmszVisible = useMemo(() => {
    const mmszFilas: { mmszTexto: string; mmszI: number }[] = [];
    let mmszCursor = -1;
    for (let mmszI = 0; mmszI < mmszLineas.length; mmszI++) {
      const mmszS = mmszGuion.find((mmszX) => mmszX.mmszLinea === mmszI);
      if (!mmszS) {
        const mmszSig = mmszGuion.find((mmszX) => mmszX.mmszLinea !== undefined && mmszX.mmszLinea > mmszI);
        if (!mmszSig || mmszT >= mmszSig.mmszInicio) mmszFilas.push({ mmszTexto: '', mmszI });
        continue;
      }
      if (mmszT < mmszS.mmszInicio) break;
      const mmszP = Math.min(1, (mmszT - mmszS.mmszInicio) / (mmszS.mmszDur * MMSZ_PORCION_ESCRITURA));
      const mmszL = mmszLineas[mmszI];
      mmszFilas.push({ mmszTexto: mmszP >= 1 ? mmszL : mmszL.slice(0, Math.ceil(mmszL.length * mmszP)), mmszI });
      if (mmszT < mmszS.mmszInicio + mmszS.mmszDur) mmszCursor = mmszI;
    }
    return { mmszFilas, mmszCursor };
  }, [mmszT, mmszGuion, mmszLineas]);

  const mmszCodigoVisible = mmszVisible.mmszFilas.map((mmszF) => mmszF.mmszTexto).join('\n');
  const mmszEjecutarSeg = mmszGuion.find((mmszS) => mmszS.mmszTipo === 'ejecutar');
  const mmszMostrarSalida = mmszEjecutarSeg && mmszT >= mmszEjecutarSeg.mmszInicio;

  function mmszIr(mmszMs: number) {
    mmszSetEditando(false);
    mmszSetT(Math.max(0, Math.min(mmszTotal, mmszMs)));
  }
  function mmszAlternar() {
    if (mmszReproduciendo) {
      mmszSetReproduciendo(false);
      return;
    }
    mmszSetEditando(false);
    mmszSetSalidaPausa(null);
    if (mmszT >= mmszTotal) mmszSetT(0);
    mmszSetReproduciendo(true);
  }
  function mmszEditarAqui() {
    mmszSetReproduciendo(false);
    mmszSetCodigoPausa(mmszCodigoVisible);
    mmszSetSalidaPausa(null);
    mmszSetEditando(true);
  }
  async function mmszEjecutarPausa() {
    mmszSetCorriendo(true);
    mmszSetSalidaPausa(await mmszRunCode(mmszLang, mmszCodigoPausa));
    mmszSetCorriendo(false);
  }
  async function mmszEjecutarMia() {
    if (mmszMiVersion === null) return;
    mmszSetCorriendo(true);
    mmszSetSalidaMia(await mmszRunCode(mmszLang, mmszMiVersion));
    mmszSetCorriendo(false);
  }

  function mmszTeclas(mmszE: React.KeyboardEvent<HTMLDivElement>) {
    if ((mmszE.target as HTMLElement).closest('textarea, input, select')) return;
    if (mmszE.key === ' ' || mmszE.key === 'k') {
      mmszE.preventDefault();
      mmszAlternar();
    } else if (mmszE.key === 'ArrowRight') {
      mmszE.preventDefault();
      mmszIr(mmszT + 5000);
    } else if (mmszE.key === 'ArrowLeft') {
      mmszE.preventDefault();
      mmszIr(mmszT - 5000);
    }
  }

  const mmszTarjeta =
    mmszSeg.mmszTipo === 'intro' || mmszSeg.mmszTipo === 'recuerdo' || mmszSeg.mmszTipo === 'conceptos' ? mmszSeg.mmszTipo : null;
  const mmszEnPausaConAvance = !mmszReproduciendo && mmszT > 0 && mmszT < mmszTotal;

  return (
    <div className="mmsz-guia" ref={mmszRaiz} tabIndex={0} onKeyDown={mmszTeclas}>
      <div className="mmsz-guia-pantalla">
        {mmszEditando ? (
          <div className="mmsz-guia-editar">
            <div className="mmsz-guia-aviso">
              ✏️ <b>Tu versión:</b> cambia el código y ejecútalo. Al darle ▶ la guía sigue con su código.
            </div>
            <MmszEditor mmszValor={mmszCodigoPausa} mmszCambiar={mmszSetCodigoPausa} mmszLang={mmszLang} mmszEjecutar={mmszEjecutarPausa} />
            <div className="mmsz-guia-fila">
              <button className="mmsz-btn mmsz-btn-principal" onClick={mmszEjecutarPausa} disabled={mmszCorriendo}>
                {mmszCorriendo ? 'Ejecutando…' : '▶ Ejecutar'}
              </button>
              <button className="mmsz-btn" onClick={() => mmszSetCodigoPausa(mmszCodigoVisible)}>
                ↺ Volver al código de la guía
              </button>
            </div>
            {mmszSalidaPausa && <MmszConsola mmszR={mmszSalidaPausa} />}
          </div>
        ) : (
          <>
            <div className="mmsz-guia-codigo" onClick={mmszAlternar} title="Clic para pausar o seguir">
              <div className="mmsz-guia-archivo">
                {mmszLang === 'python' ? 'programa.py' : mmszLang === 'javascript' ? 'programa.js' : 'programa.cpp'}
              </div>
              <pre>
                {mmszVisible.mmszFilas.length === 0 ? (
                  <span className="mmsz-guia-vacio">El código aparecerá aquí…</span>
                ) : (
                  mmszVisible.mmszFilas.map((mmszF) => (
                    <div key={mmszF.mmszI} className={`mmsz-guia-linea ${mmszF.mmszI === mmszVisible.mmszCursor ? 'actual' : ''}`}>
                      <span className="mmsz-guia-num">{mmszF.mmszI + 1}</span>
                      <code>
                        {mmszF.mmszTexto}
                        {mmszF.mmszI === mmszVisible.mmszCursor && mmszReproduciendo && <span className="mmsz-guia-cursor">▍</span>}
                      </code>
                    </div>
                  ))
                )}
              </pre>
              {mmszMostrarSalida && (
                <div className="mmsz-guia-salida">
                  <small>Salida</small>
                  <pre>{mmszSalida ? mmszSalida.mmszError ?? mmszSalida.mmszOutput : mmszGuia.mmszSalida}</pre>
                </div>
              )}
            </div>

            {mmszTarjeta && (
              <div className={`mmsz-guia-tarjeta ${mmszTarjeta}`} key={mmszSeg.mmszTipo}>
                {mmszTarjeta === 'intro' && (
                  <>
                    <span className="mmsz-guia-etiqueta">⏯ Guía paso a paso</span>
                    <h2>{mmszGuia.mmszTitulo.replace(/^Guía paso a paso: /, '')}</h2>
                    <div className="mmsz-guia-objetivo">
                      <MmszMarkdown mmszTexto={mmszGuia.mmszObjetivo} mmszLang={mmszLang} />
                    </div>
                  </>
                )}
                {mmszTarjeta === 'recuerdo' && mmszGuia.mmszRecuerdo && (
                  <>
                    <span className="mmsz-guia-etiqueta">🧠 ¿Recuerdas?</span>
                    <h2>Lección: {mmszGuia.mmszRecuerdo.mmszLeccion}</h2>
                    <p>{mmszGuia.mmszRecuerdo.mmszResumen}</p>
                    <p className="muted">Hoy lo vamos a usar.</p>
                  </>
                )}
                {mmszTarjeta === 'conceptos' && (
                  <>
                    <span className="mmsz-guia-etiqueta">📚 Conceptos básicos</span>
                    <ul>
                      {mmszConceptos(mmszGuia.mmszCodigo, mmszLang).map((mmszC) => (
                        <li key={mmszC}>{mmszC}</li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            )}

            {!mmszReproduciendo && (mmszT === 0 || mmszT >= mmszTotal) && (
              <button className="mmsz-guia-play-grande" onClick={mmszAlternar} aria-label="Reproducir">
                {mmszT >= mmszTotal ? '↺' : '▶'}
              </button>
            )}
          </>
        )}

        {mmszSubtitulos && !mmszEditando && (mmszReproduciendo || mmszT > 0) && (
          <div className="mmsz-guia-subtitulo">
            <MmszEnLinea mmszTexto={mmszSeg.mmszSubtitulo} />
          </div>
        )}
      </div>

      <div className="mmsz-guia-controles">
        <button
          onClick={() =>
            mmszIr(mmszT - mmszSeg.mmszInicio < 800 ? mmszGuion[Math.max(0, mmszIndice - 1)].mmszInicio : mmszSeg.mmszInicio)
          }
          title="Paso anterior"
        >
          ⏮
        </button>
        <button className="mmsz-guia-play" onClick={mmszAlternar} title="Reproducir / pausar (espacio)">
          {mmszReproduciendo ? '⏸' : '▶'}
        </button>
        <button
          onClick={() => mmszIr(mmszGuion[mmszIndice + 1]?.mmszInicio ?? mmszTotal)}
          title="Paso siguiente"
        >
          ⏭
        </button>
        <span className="mmsz-guia-tiempo">
          {mmszReloj(mmszT)} / {mmszReloj(mmszTotal)}
        </span>
        <div className="mmsz-guia-barra">
          <input
            type="range"
            min={0}
            max={mmszTotal}
            step={100}
            value={mmszT}
            onChange={(mmszE) => mmszIr(Number(mmszE.target.value))}
            aria-label="Adelantar o retroceder"
            style={{ ['--mmsz-pct' as string]: `${(mmszT / mmszTotal) * 100}%` }}
          />
          <div className="mmsz-guia-marcas">
            {mmszGuion.map((mmszS, mmszI) => (
              <span key={mmszI} style={{ left: `${(mmszS.mmszInicio / mmszTotal) * 100}%` }} className={mmszS.mmszTipo} />
            ))}
          </div>
        </div>
        <select value={mmszVelocidad} onChange={(mmszE) => mmszSetVelocidad(Number(mmszE.target.value))} title="Velocidad">
          {MMSZ_VELOCIDADES.map((mmszV) => (
            <option key={mmszV} value={mmszV}>
              {mmszV}x
            </option>
          ))}
        </select>
        {mmszHayVoz && (
          <button onClick={() => mmszSetConVoz((mmszV) => !mmszV)} title={mmszConVoz ? 'Silenciar voz' : 'Activar voz'}>
            {mmszConVoz ? '🔊' : '🔇'}
          </button>
        )}
        <button className={mmszSubtitulos ? 'activo' : ''} onClick={() => mmszSetSubtitulos((mmszV) => !mmszV)} title="Subtítulos">
          CC
        </button>
      </div>

      {mmszEnPausaConAvance && !mmszEditando && (
        <div className="mmsz-guia-pausa">
          ⏸ En pausa. <button className="mmsz-btn" onClick={mmszEditarAqui}>✏️ Editar y ejecutar este código</button>
        </div>
      )}

      <div className="mmsz-guia-capitulos">
        {mmszGuion.map((mmszS, mmszI) => (
          <button
            key={mmszI}
            className={`${mmszS === mmszSeg ? 'activo' : ''} ${mmszT >= mmszS.mmszInicio + mmszS.mmszDur ? 'visto' : ''} ${mmszS.mmszTipo}`}
            onClick={() => mmszIr(mmszS.mmszInicio)}
            title={mmszS.mmszSubtitulo.replace(/[«»]/g, '')}
          >
            <small>{mmszReloj(mmszS.mmszInicio)}</small> {mmszS.mmszCapitulo}
          </button>
        ))}
      </div>

      <section className="mmsz-guia-derivado">
        <h3>📋 Hazlo a tu manera</h3>
        <p className="muted">
          Copia el programa de la guía y cámbialo: otros números, otros textos, otra condición. Así aprendes de verdad.
        </p>
        {mmszMiVersion === null ? (
          <button className="mmsz-btn mmsz-btn-principal" onClick={() => mmszSetMiVersion(mmszGuia.mmszCodigo)}>
            Hacer mi versión
          </button>
        ) : (
          <>
            <MmszEditor mmszValor={mmszMiVersion} mmszCambiar={mmszSetMiVersion} mmszLang={mmszLang} mmszEjecutar={mmszEjecutarMia} />
            <div className="mmsz-guia-fila">
              <button className="mmsz-btn mmsz-btn-principal" onClick={mmszEjecutarMia} disabled={mmszCorriendo}>
                {mmszCorriendo ? 'Ejecutando…' : '▶ Ejecutar mi versión'}
              </button>
              <button className="mmsz-btn" onClick={() => mmszSetMiVersion(mmszGuia.mmszCodigo)}>
                ↺ Empezar de nuevo
              </button>
            </div>
            {mmszSalidaMia && <MmszConsola mmszR={mmszSalidaMia} />}
          </>
        )}
        {mmszIrAlGuiado && mmszT >= mmszTotal && (
          <div className="mmsz-guia-fila">
            <button className="mmsz-btn mmsz-btn-fuerte" onClick={mmszIrAlGuiado}>
              Ahora constrúyelo tú (programa guiado) →
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

function MmszConsola({ mmszR }: { mmszR: MmszRunResult }) {
  return (
    <div className={`mmsz-guia-consola ${mmszR.mmszError ? 'error' : ''}`}>
      <small>{mmszR.mmszError ? 'Error' : 'Salida'}</small>
      <pre>{mmszR.mmszError ? `${mmszR.mmszOutput ? mmszR.mmszOutput + '\n' : ''}${mmszR.mmszError}` : mmszR.mmszOutput || '(el programa no mostró nada)'}</pre>
    </div>
  );
}
