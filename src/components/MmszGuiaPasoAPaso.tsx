// Autor: MMSZ (Mario Soto Zea)
// Guía paso a paso (PRUEBA): un "video" interactivo hecho en la app (funciona sin internet).
// Recuerda la lección anterior, explica los conceptos y escribe el programa línea por línea
// mientras la voz lo explica. Se puede pausar, adelantar y retroceder; en pausa el código
// se puede editar y ejecutar, y al final el estudiante hace su propia versión (derivado).
import { useEffect, useMemo, useRef, useState } from 'react';
import type { MmszGuia } from '../types';
import { mmszPreloadPython, mmszRunCode, type MmszRunnableLang, type MmszRunResult } from '../runner';
import { mmszConceptos, mmszExplicarLinea } from '../mmszExplicador';
import { mmszTextoHablado, mmszVozEspanol } from './MmszLectorVoz';
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
  tipo: MmszTipoSegmento;
  inicio: number; // ms
  dur: number; // ms
  capitulo: string;
  subtitulo: string; // lo que se muestra abajo (con «código»)
  voz: string[]; // frases que se dicen
  linea?: number; // índice de la línea que se escribe
}

const MMSZ_VELOCIDADES = [0.75, 1, 1.25, 1.5, 2];
const MMSZ_PORCION_ESCRITURA = 0.55; // parte del segmento en la que se escribe la línea

/** Tiempo que tarda la voz en decir un texto (aprox. 13 letras por segundo). */
const mmszDuracion = (mmszTexto: string, mmszMinimo = 2200) => Math.max(mmszMinimo, (mmszTexto.length / 13) * 1000 + 900);

const mmszReloj = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

function mmszCrearGuion(g: MmszGuia, mmszLang: MmszRunnableLang, mmszLineas: string[]): MmszSegmento[] {
  const mmszLista: Omit<MmszSegmento, 'inicio'>[] = [];
  const mmszAgregar = (tipo: MmszTipoSegmento, capitulo: string, subtitulo: string, mmszVozTexto = subtitulo, linea?: number) => {
    const voz = mmszTextoHablado(mmszVozTexto);
    mmszLista.push({ tipo, capitulo, subtitulo, voz, linea, dur: mmszDuracion(voz.join(' ')) });
  };

  const mmszNombre = g.titulo.replace(/^Guía paso a paso: /, '');
  mmszAgregar('intro', 'Introducción', `Hoy vamos a programar: ${mmszNombre}. Te voy a enseñar a hacerlo paso a paso.`);
  if (g.recuerdo) {
    mmszAgregar(
      'recuerdo',
      '¿Recuerdas?',
      `¿Recuerdas lo que hiciste en la lección **${g.recuerdo.leccion}**? ${g.recuerdo.resumen} Hoy lo vamos a usar.`,
      `¿Recuerdas lo que hiciste en la lección ${g.recuerdo.leccion}? ${g.recuerdo.resumen} Hoy lo vamos a usar.`,
    );
  }
  const mmszLosConceptos = mmszConceptos(g.codigo, mmszLang);
  if (mmszLosConceptos.length) {
    mmszAgregar(
      'conceptos',
      'Conceptos básicos',
      `Para este programa vamos a necesitar: ${mmszLosConceptos.join('; ').toLowerCase()}.`,
    );
  }
  let mmszNumero = 0;
  mmszLineas.forEach((l, i) => {
    if (!l.trim()) return;
    mmszNumero++;
    const mmszExplicacion = mmszExplicarLinea(l, mmszLang) ?? 'Escribimos esta línea.';
    mmszAgregar('linea', `Línea ${mmszNumero}`, mmszExplicacion, mmszExplicacion, i);
  });
  if (g.salida !== undefined) {
    mmszAgregar('ejecutar', 'Ejecutar', 'Ahora ejecutamos el programa. Mira la salida: es lo que el programa muestra en pantalla.');
  }
  mmszAgregar(
    'cierre',
    'Tu turno',
    '¡Listo! Ya sabes cómo se hace. Pausa cuando quieras para cambiar el código y ejecutarlo, o haz tu propia versión abajo.',
  );

  let t = 0;
  return mmszLista.map((s) => {
    const r = { ...s, inicio: t };
    t += s.dur;
    return r;
  });
}

export default function MmszGuiaPasoAPaso({ mmszGuia, mmszLang, mmszAlTerminar, mmszIrAlGuiado }: MmszProps) {
  const mmszLineas = useMemo(() => mmszGuia.codigo.split('\n'), [mmszGuia.codigo]);
  const mmszGuion = useMemo(() => mmszCrearGuion(mmszGuia, mmszLang, mmszLineas), [mmszGuia, mmszLang, mmszLineas]);
  const mmszTotal = mmszGuion[mmszGuion.length - 1].inicio + mmszGuion[mmszGuion.length - 1].dur;
  const mmszHayVoz = typeof window !== 'undefined' && 'speechSynthesis' in window;

  const [mmszT, setMmszT] = useState(0);
  const [mmszReproduciendo, setMmszReproduciendo] = useState(false);
  const [mmszVelocidad, setMmszVelocidad] = useState(1);
  const [mmszConVoz, setMmszConVoz] = useState(mmszHayVoz);
  const [mmszSubtitulos, setMmszSubtitulos] = useState(true);
  const [mmszSalida, setMmszSalida] = useState<MmszRunResult | null>(null);
  // Edición en pausa
  const [mmszEditando, setMmszEditando] = useState(false);
  const [mmszCodigoPausa, setMmszCodigoPausa] = useState('');
  const [mmszSalidaPausa, setMmszSalidaPausa] = useState<MmszRunResult | null>(null);
  // Mi versión (derivado)
  const [mmszMiVersion, setMmszMiVersion] = useState<string | null>(null);
  const [mmszSalidaMia, setMmszSalidaMia] = useState<MmszRunResult | null>(null);
  const [mmszCorriendo, setMmszCorriendo] = useState(false);

  const mmszHablando = useRef(false);
  const mmszTurno = useRef(0); // para ignorar el fin de frases canceladas
  const mmszTerminado = useRef(false);
  const mmszRaiz = useRef<HTMLDivElement>(null);

  const mmszIndice = Math.max(0, mmszGuion.findIndex((s) => mmszT < s.inicio + s.dur));
  const mmszSeg = mmszT >= mmszTotal ? mmszGuion[mmszGuion.length - 1] : mmszGuion[mmszIndice];

  // Salida real del programa (se calcula una vez).
  useEffect(() => {
    if (mmszGuia.salida === undefined) return;
    if (mmszLang === 'python') mmszPreloadPython();
    let mmszVivo = true;
    mmszRunCode(mmszLang, mmszGuia.codigo).then((r) => mmszVivo && setMmszSalida(r));
    return () => {
      mmszVivo = false;
    };
  }, [mmszGuia, mmszLang]);

  // Reloj del "video".
  useEffect(() => {
    if (!mmszReproduciendo) return;
    let mmszAntes = performance.now();
    let mmszId = 0;
    const mmszPaso = (ahora: number) => {
      const dt = (ahora - mmszAntes) * mmszVelocidad;
      mmszAntes = ahora;
      setMmszT((t) => {
        const s = mmszGuion.find((x) => t < x.inicio + x.dur);
        let n = t + dt;
        // Si la voz todavía está hablando, se espera un poco antes de pasar al siguiente paso.
        if (s && mmszConVoz && mmszHablando.current && n >= s.inicio + s.dur - 1) {
          n = s.inicio + s.dur - 1;
        }
        return Math.min(n, mmszTotal);
      });
      mmszId = requestAnimationFrame(mmszPaso);
    };
    mmszId = requestAnimationFrame(mmszPaso);
    return () => cancelAnimationFrame(mmszId);
  }, [mmszReproduciendo, mmszVelocidad, mmszConVoz, mmszGuion, mmszTotal]);

  // Al llegar al final.
  useEffect(() => {
    if (mmszT >= mmszTotal && mmszReproduciendo) {
      setMmszReproduciendo(false);
      if (!mmszTerminado.current) {
        mmszTerminado.current = true;
        mmszAlTerminar();
      }
    }
  }, [mmszT, mmszTotal, mmszReproduciendo, mmszAlTerminar]);

  // Voz: dice el paso actual cuando cambia (y se calla al pausar).
  useEffect(() => {
    if (!mmszHayVoz) return;
    speechSynthesis.cancel();
    mmszHablando.current = false;
    const mmszMiTurno = ++mmszTurno.current;
    if (!mmszReproduciendo || !mmszConVoz || mmszT >= mmszTotal) return;
    const mmszVoz = mmszVozEspanol();
    const mmszFrases = mmszSeg.voz;
    if (!mmszFrases.length) return;
    mmszHablando.current = true;
    mmszFrases.forEach((f, i) => {
      const u = new SpeechSynthesisUtterance(f);
      u.lang = mmszVoz?.lang ?? 'es-ES';
      if (mmszVoz) u.voice = mmszVoz;
      u.rate = mmszVelocidad;
      if (i === mmszFrases.length - 1) {
        const mmszFin = () => {
          if (mmszTurno.current === mmszMiTurno) mmszHablando.current = false;
        };
        u.onend = mmszFin;
        u.onerror = mmszFin;
      }
      speechSynthesis.speak(u);
    });
    // Por si la voz nunca avisa que terminó.
    const mmszSeguro = setTimeout(() => {
      if (mmszTurno.current === mmszMiTurno) mmszHablando.current = false;
    }, (mmszSeg.dur / mmszVelocidad) + 5000);
    return () => clearTimeout(mmszSeguro);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mmszIndice, mmszReproduciendo, mmszConVoz, mmszVelocidad]);

  useEffect(() => () => {
    if (mmszHayVoz) speechSynthesis.cancel();
  }, [mmszHayVoz]);

  /* ---------- Código visible en el momento t ---------- */
  const mmszVisible = useMemo(() => {
    const mmszFilas: { texto: string; i: number }[] = [];
    let mmszCursor = -1;
    for (let i = 0; i < mmszLineas.length; i++) {
      const s = mmszGuion.find((x) => x.linea === i);
      if (!s) {
        // Línea vacía: aparece junto con la siguiente línea escrita.
        const mmszSig = mmszGuion.find((x) => x.linea !== undefined && x.linea > i);
        if (!mmszSig || mmszT >= mmszSig.inicio) mmszFilas.push({ texto: '', i });
        continue;
      }
      if (mmszT < s.inicio) break;
      const p = Math.min(1, (mmszT - s.inicio) / (s.dur * MMSZ_PORCION_ESCRITURA));
      const l = mmszLineas[i];
      mmszFilas.push({ texto: p >= 1 ? l : l.slice(0, Math.ceil(l.length * p)), i });
      if (mmszT < s.inicio + s.dur) mmszCursor = i;
    }
    return { mmszFilas, mmszCursor };
  }, [mmszT, mmszGuion, mmszLineas]);

  const mmszCodigoVisible = mmszVisible.mmszFilas.map((f) => f.texto).join('\n');
  const mmszEjecutarSeg = mmszGuion.find((s) => s.tipo === 'ejecutar');
  const mmszMostrarSalida = mmszEjecutarSeg && mmszT >= mmszEjecutarSeg.inicio;

  /* ---------- Controles ---------- */
  function mmszIr(ms: number) {
    setMmszEditando(false); // al moverse en el video, vuelve el código de la guía
    setMmszT(Math.max(0, Math.min(mmszTotal, ms)));
  }
  function mmszAlternar() {
    if (mmszReproduciendo) {
      setMmszReproduciendo(false);
      return;
    }
    setMmszEditando(false); // al seguir, vuelve el código de la guía
    setMmszSalidaPausa(null);
    if (mmszT >= mmszTotal) setMmszT(0);
    setMmszReproduciendo(true);
  }
  function mmszEditarAqui() {
    setMmszReproduciendo(false);
    setMmszCodigoPausa(mmszCodigoVisible);
    setMmszSalidaPausa(null);
    setMmszEditando(true);
  }
  async function mmszEjecutarPausa() {
    setMmszCorriendo(true);
    setMmszSalidaPausa(await mmszRunCode(mmszLang, mmszCodigoPausa));
    setMmszCorriendo(false);
  }
  async function mmszEjecutarMia() {
    if (mmszMiVersion === null) return;
    setMmszCorriendo(true);
    setMmszSalidaMia(await mmszRunCode(mmszLang, mmszMiVersion));
    setMmszCorriendo(false);
  }

  function mmszTeclas(e: React.KeyboardEvent<HTMLDivElement>) {
    if ((e.target as HTMLElement).closest('textarea, input, select')) return;
    if (e.key === ' ' || e.key === 'k') {
      e.preventDefault();
      mmszAlternar();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      mmszIr(mmszT + 5000);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      mmszIr(mmszT - 5000);
    }
  }

  const mmszTarjeta =
    mmszSeg.tipo === 'intro' || mmszSeg.tipo === 'recuerdo' || mmszSeg.tipo === 'conceptos' ? mmszSeg.tipo : null;
  const mmszEnPausaConAvance = !mmszReproduciendo && mmszT > 0 && mmszT < mmszTotal;

  return (
    <div className="mmsz-guia" ref={mmszRaiz} tabIndex={0} onKeyDown={mmszTeclas}>
      {/* ---------- Pantalla ---------- */}
      <div className="mmsz-guia-pantalla">
        {mmszEditando ? (
          <div className="mmsz-guia-editar">
            <div className="mmsz-guia-aviso">
              ✏️ <b>Tu versión:</b> cambia el código y ejecútalo. Al darle ▶ la guía sigue con su código.
            </div>
            <MmszEditor mmszValor={mmszCodigoPausa} mmszCambiar={setMmszCodigoPausa} mmszLang={mmszLang} mmszEjecutar={mmszEjecutarPausa} />
            <div className="mmsz-guia-fila">
              <button className="mmsz-btn mmsz-btn-principal" onClick={mmszEjecutarPausa} disabled={mmszCorriendo}>
                {mmszCorriendo ? 'Ejecutando…' : '▶ Ejecutar'}
              </button>
              <button className="mmsz-btn" onClick={() => setMmszCodigoPausa(mmszCodigoVisible)}>
                ↺ Volver al código de la guía
              </button>
            </div>
            {mmszSalidaPausa && <MmszConsola r={mmszSalidaPausa} />}
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
                  mmszVisible.mmszFilas.map((f) => (
                    <div key={f.i} className={`mmsz-guia-linea ${f.i === mmszVisible.mmszCursor ? 'actual' : ''}`}>
                      <span className="mmsz-guia-num">{f.i + 1}</span>
                      <code>
                        {f.texto}
                        {f.i === mmszVisible.mmszCursor && mmszReproduciendo && <span className="mmsz-guia-cursor">▍</span>}
                      </code>
                    </div>
                  ))
                )}
              </pre>
              {mmszMostrarSalida && (
                <div className="mmsz-guia-salida">
                  <small>Salida</small>
                  <pre>{mmszSalida ? mmszSalida.error ?? mmszSalida.output : mmszGuia.salida}</pre>
                </div>
              )}
            </div>

            {mmszTarjeta && (
              <div className={`mmsz-guia-tarjeta ${mmszTarjeta}`} key={mmszSeg.tipo}>
                {mmszTarjeta === 'intro' && (
                  <>
                    <span className="mmsz-guia-etiqueta">⏯ Guía paso a paso</span>
                    <h2>{mmszGuia.titulo.replace(/^Guía paso a paso: /, '')}</h2>
                    <div className="mmsz-guia-objetivo">
                      <MmszMarkdown texto={mmszGuia.objetivo} lang={mmszLang} />
                    </div>
                  </>
                )}
                {mmszTarjeta === 'recuerdo' && mmszGuia.recuerdo && (
                  <>
                    <span className="mmsz-guia-etiqueta">🧠 ¿Recuerdas?</span>
                    <h2>Lección: {mmszGuia.recuerdo.leccion}</h2>
                    <p>{mmszGuia.recuerdo.resumen}</p>
                    <p className="muted">Hoy lo vamos a usar.</p>
                  </>
                )}
                {mmszTarjeta === 'conceptos' && (
                  <>
                    <span className="mmsz-guia-etiqueta">📚 Conceptos básicos</span>
                    <ul>
                      {mmszConceptos(mmszGuia.codigo, mmszLang).map((c) => (
                        <li key={c}>{c}</li>
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
            <MmszEnLinea texto={mmszSeg.subtitulo} />
          </div>
        )}
      </div>

      {/* ---------- Barra de control ---------- */}
      <div className="mmsz-guia-controles">
        <button
          onClick={() =>
            // Si recién empezó el paso, va al anterior; si no, al inicio del paso actual.
            mmszIr(mmszT - mmszSeg.inicio < 800 ? mmszGuion[Math.max(0, mmszIndice - 1)].inicio : mmszSeg.inicio)
          }
          title="Paso anterior"
        >
          ⏮
        </button>
        <button className="mmsz-guia-play" onClick={mmszAlternar} title="Reproducir / pausar (espacio)">
          {mmszReproduciendo ? '⏸' : '▶'}
        </button>
        <button
          onClick={() => mmszIr(mmszGuion[mmszIndice + 1]?.inicio ?? mmszTotal)}
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
            onChange={(e) => mmszIr(Number(e.target.value))}
            aria-label="Adelantar o retroceder"
            style={{ ['--mmsz-pct' as string]: `${(mmszT / mmszTotal) * 100}%` }}
          />
          <div className="mmsz-guia-marcas">
            {mmszGuion.map((s, i) => (
              <span key={i} style={{ left: `${(s.inicio / mmszTotal) * 100}%` }} className={s.tipo} />
            ))}
          </div>
        </div>
        <select value={mmszVelocidad} onChange={(e) => setMmszVelocidad(Number(e.target.value))} title="Velocidad">
          {MMSZ_VELOCIDADES.map((v) => (
            <option key={v} value={v}>
              {v}x
            </option>
          ))}
        </select>
        {mmszHayVoz && (
          <button onClick={() => setMmszConVoz((v) => !v)} title={mmszConVoz ? 'Silenciar voz' : 'Activar voz'}>
            {mmszConVoz ? '🔊' : '🔇'}
          </button>
        )}
        <button className={mmszSubtitulos ? 'activo' : ''} onClick={() => setMmszSubtitulos((v) => !v)} title="Subtítulos">
          CC
        </button>
      </div>

      {mmszEnPausaConAvance && !mmszEditando && (
        <div className="mmsz-guia-pausa">
          ⏸ En pausa. <button className="mmsz-btn" onClick={mmszEditarAqui}>✏️ Editar y ejecutar este código</button>
        </div>
      )}

      {/* ---------- Capítulos ---------- */}
      <div className="mmsz-guia-capitulos">
        {mmszGuion.map((s, i) => (
          <button
            key={i}
            className={`${s === mmszSeg ? 'activo' : ''} ${mmszT >= s.inicio + s.dur ? 'visto' : ''} ${s.tipo}`}
            onClick={() => mmszIr(s.inicio)}
            title={s.subtitulo.replace(/[«»]/g, '')}
          >
            <small>{mmszReloj(s.inicio)}</small> {s.capitulo}
          </button>
        ))}
      </div>

      {/* ---------- Mi versión (derivado) ---------- */}
      <section className="mmsz-guia-derivado">
        <h3>📋 Hazlo a tu manera</h3>
        <p className="muted">
          Copia el programa de la guía y cámbialo: otros números, otros textos, otra condición. Así aprendes de verdad.
        </p>
        {mmszMiVersion === null ? (
          <button className="mmsz-btn mmsz-btn-principal" onClick={() => setMmszMiVersion(mmszGuia.codigo)}>
            Hacer mi versión
          </button>
        ) : (
          <>
            <MmszEditor mmszValor={mmszMiVersion} mmszCambiar={setMmszMiVersion} mmszLang={mmszLang} mmszEjecutar={mmszEjecutarMia} />
            <div className="mmsz-guia-fila">
              <button className="mmsz-btn mmsz-btn-principal" onClick={mmszEjecutarMia} disabled={mmszCorriendo}>
                {mmszCorriendo ? 'Ejecutando…' : '▶ Ejecutar mi versión'}
              </button>
              <button className="mmsz-btn" onClick={() => setMmszMiVersion(mmszGuia.codigo)}>
                ↺ Empezar de nuevo
              </button>
            </div>
            {mmszSalidaMia && <MmszConsola r={mmszSalidaMia} />}
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

function MmszConsola({ r }: { r: MmszRunResult }) {
  return (
    <div className={`mmsz-guia-consola ${r.error ? 'error' : ''}`}>
      <small>{r.error ? 'Error' : 'Salida'}</small>
      <pre>{r.error ? `${r.output ? r.output + '\n' : ''}${r.error}` : r.output || '(el programa no mostró nada)'}</pre>
    </div>
  );
}
