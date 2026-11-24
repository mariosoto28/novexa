// Autor: MMSZ (Mario Soto Zea)
// Lección animada 100 % offline: funciona como un video, pero se genera con el contenido de la lección.
// El código se escribe solo, una voz (de Windows) lo explica con subtítulos y al final se ejecuta.
import { Fragment, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { mmszCrearEscenas } from '../mmszEscenas';
import type { MmszRecuerdo } from '../types';
import { mmszPreloadPython, mmszRunCode, type MmszRunnableLang, type MmszRunResult } from '../runner';
import { mmszVozEspanol } from './MmszLectorVoz';
import { MmszEnLinea } from './MmszMarkdown';
import '../mmszDinamico.css';

interface MmszProps {
  mmszTitulo: string;
  mmszIntro: string;
  mmszRecuerdo?: MmszRecuerdo;
  mmszLecturas: string[];
  mmszLang: MmszRunnableLang;
  mmszAlTerminar: () => void;
}

const MMSZ_VELOCIDADES = [0.75, 1, 1.25, 1.5];
const MMSZ_LETRAS_POR_SEGUNDO = 14; // ritmo aproximado de la voz (para calcular tiempos)

/* ---------- Colores de sintaxis sencillos ---------- */
const MMSZ_PALABRAS: Record<MmszRunnableLang, string[]> = {
  python: ['def', 'return', 'if', 'elif', 'else', 'for', 'while', 'in', 'import', 'class', 'try', 'except', 'finally', 'and', 'or', 'not', 'True', 'False', 'None', 'break', 'continue', 'pass', 'lambda', 'self', 'print', 'range', 'len'],
  javascript: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'of', 'in', 'class', 'new', 'try', 'catch', 'finally', 'throw', 'true', 'false', 'null', 'undefined', 'switch', 'case', 'break', 'default', 'extends', 'this', 'console'],
  cpp: ['int', 'double', 'char', 'bool', 'void', 'return', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'using', 'namespace', 'std', 'cout', 'cin', 'endl', 'true', 'false', 'const', 'class', 'struct', 'public', 'private', 'string', 'vector'],
};

function mmszColorear(mmszCodigo: string, mmszLang: MmszRunnableLang): ReactNode[] {
  const mmszClaves = new Set(MMSZ_PALABRAS[mmszLang]);
  const mmszRegex = /(#.*$|\/\/.*$)|("(?:[^"\\\n]|\\.)*"?|'(?:[^'\\\n]|\\.)*'?|`[^`]*`?)|(\b\d+(?:\.\d+)?\b)|(\b[A-Za-z_]\w*\b)/gm;
  const mmszPartes: ReactNode[] = [];
  let mmszUltimo = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = mmszRegex.exec(mmszCodigo))) {
    if (m.index > mmszUltimo) mmszPartes.push(<Fragment key={k++}>{mmszCodigo.slice(mmszUltimo, m.index)}</Fragment>);
    const mmszClase = m[1] ? 'c-com' : m[2] ? 'c-txt' : m[3] ? 'c-num' : mmszClaves.has(m[4]) ? 'c-key' : null;
    mmszPartes.push(mmszClase ? <span key={k++} className={mmszClase}>{m[0]}</span> : <Fragment key={k++}>{m[0]}</Fragment>);
    mmszUltimo = m.index + m[0].length;
  }
  if (mmszUltimo < mmszCodigo.length) mmszPartes.push(<Fragment key={k++}>{mmszCodigo.slice(mmszUltimo)}</Fragment>);
  return mmszPartes;
}

export default function MmszLeccionAnimada({ mmszTitulo, mmszIntro, mmszRecuerdo, mmszLecturas, mmszLang, mmszAlTerminar }: MmszProps) {
  const mmszEscenas = useMemo(() => mmszCrearEscenas(mmszTitulo, mmszIntro, mmszLecturas, mmszRecuerdo), [mmszTitulo, mmszIntro, mmszLecturas, mmszRecuerdo]);
  const mmszHayVoz = typeof window !== 'undefined' && 'speechSynthesis' in window;

  const [mmszIndice, setMmszIndice] = useState(0);
  const [mmszReproduciendo, setMmszReproduciendo] = useState(false);
  const [mmszEmpezado, setMmszEmpezado] = useState(false);
  const [mmszTerminado, setMmszTerminado] = useState(false);
  const [mmszVelocidad, setMmszVelocidad] = useState(1);
  const [mmszSilencio, setMmszSilencio] = useState(!mmszHayVoz);
  const [mmszSubtitulos, setMmszSubtitulos] = useState(true);
  const [mmszTipeados, setMmszTipeados] = useState(0);
  const [mmszFrase, setMmszFrase] = useState(0);
  const [mmszSalida, setMmszSalida] = useState<MmszRunResult | null>(null);

  // Lo que ya se avanzó dentro de la escena (para pausar y continuar donde iba).
  const mmszTipeadosRef = useRef(0);
  const mmszFraseRef = useRef(0);
  const mmszSalidaRef = useRef<MmszRunResult | null>(null);

  const mmszEscena = mmszEscenas[mmszIndice];
  const mmszAlTerminarRef = useRef(mmszAlTerminar);
  mmszAlTerminarRef.current = mmszAlTerminar;

  useEffect(() => {
    if (mmszLang === 'python' && mmszEscenas.some((e) => e.ejecutable)) mmszPreloadPython();
  }, [mmszLang, mmszEscenas]);

  function mmszIrAEscena(i: number, mmszSeguir = true) {
    mmszTipeadosRef.current = 0;
    mmszFraseRef.current = 0;
    mmszSalidaRef.current = null;
    setMmszTipeados(0);
    setMmszFrase(0);
    setMmszSalida(null);
    setMmszTerminado(false);
    setMmszIndice(Math.max(0, Math.min(mmszEscenas.length - 1, i)));
    if (mmszSeguir) {
      setMmszEmpezado(true);
      setMmszReproduciendo(true);
    }
  }

  // Motor de reproducción: escribe el código, narra las frases y ejecuta; cuando todo termina, pasa de escena.
  useEffect(() => {
    if (!mmszReproduciendo) return;
    let mmszCancelado = false;
    const mmszTimers: number[] = [];
    const e = mmszEscena;
    const mmszTotal = e.codigo?.length ?? 0;
    const mmszDuracionVoz = (e.narracion.join(' ').length / MMSZ_LETRAS_POR_SEGUNDO) * 1000 / mmszVelocidad;

    let mmszTipeoListo = mmszTipeadosRef.current >= mmszTotal;
    let mmszVozLista = mmszFraseRef.current >= e.narracion.length;
    let mmszEjecucionLista = !e.ejecutable || mmszSalidaRef.current !== null;

    const mmszRevisar = () => {
      if (mmszCancelado || !mmszTipeoListo || !mmszVozLista || !mmszEjecucionLista) return;
      mmszTimers.push(
        window.setTimeout(() => {
          if (mmszCancelado) return;
          if (mmszIndice >= mmszEscenas.length - 1) {
            setMmszReproduciendo(false);
            setMmszTerminado(true);
            mmszAlTerminarRef.current();
          } else {
            mmszIrAEscena(mmszIndice + 1);
          }
        }, 900 / mmszVelocidad),
      );
    };

    const mmszEjecutar = () => {
      if (!e.ejecutable || mmszSalidaRef.current) return;
      mmszRunCode(mmszLang, e.codigo!).then((r) => {
        if (mmszCancelado) return;
        mmszSalidaRef.current = r;
        setMmszSalida(r);
        mmszEjecucionLista = true;
        mmszRevisar();
      });
    };

    // 1) Código que se escribe solo, a un ritmo que acompaña a la voz.
    if (!mmszTipeoListo) {
      const mmszPaso = Math.max(10, Math.min(45, (mmszDuracionVoz * 0.75) / Math.max(1, mmszTotal)));
      const t = window.setInterval(() => {
        mmszTipeadosRef.current = Math.min(mmszTotal, mmszTipeadosRef.current + 1);
        setMmszTipeados(mmszTipeadosRef.current);
        if (mmszTipeadosRef.current >= mmszTotal) {
          window.clearInterval(t);
          mmszTipeoListo = true;
          mmszEjecutar();
          mmszRevisar();
        }
      }, mmszPaso);
      mmszTimers.push(t);
    } else {
      mmszEjecutar();
    }

    // 2) Narración frase por frase (o solo subtítulos si está en silencio).
    const mmszVoz = mmszHayVoz ? mmszVozEspanol() : undefined;
    const mmszHablar = (i: number) => {
      if (mmszCancelado) return;
      if (i >= e.narracion.length) {
        mmszVozLista = true;
        mmszRevisar();
        return;
      }
      mmszFraseRef.current = i;
      setMmszFrase(i);
      const mmszTexto = e.narracion[i];
      const mmszSiguiente = () => {
        if (mmszCancelado) return;
        mmszFraseRef.current = i + 1;
        mmszHablar(i + 1);
      };
      if (mmszSilencio || !mmszHayVoz) {
        mmszTimers.push(window.setTimeout(mmszSiguiente, (mmszTexto.length / MMSZ_LETRAS_POR_SEGUNDO) * 1000 / mmszVelocidad + 250));
        return;
      }
      const u = new SpeechSynthesisUtterance(mmszTexto);
      u.lang = mmszVoz?.lang ?? 'es-ES';
      if (mmszVoz) u.voice = mmszVoz;
      u.rate = mmszVelocidad;
      u.onend = mmszSiguiente;
      u.onerror = mmszSiguiente;
      speechSynthesis.speak(u);
    };
    if (!mmszVozLista) mmszHablar(mmszFraseRef.current);
    mmszRevisar();

    return () => {
      mmszCancelado = true;
      mmszTimers.forEach((t) => {
        window.clearTimeout(t);
        window.clearInterval(t);
      });
      if (mmszHayVoz) speechSynthesis.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mmszReproduciendo, mmszIndice, mmszVelocidad, mmszSilencio]);

  // Al salir de la página, se detiene la voz.
  useEffect(() => () => void (mmszHayVoz && speechSynthesis.cancel()), [mmszHayVoz]);

  const mmszCodigoVisible = mmszEscena.codigo?.slice(0, mmszTipeados) ?? '';
  const mmszEscribiendo = Boolean(mmszEscena.codigo) && mmszTipeados < (mmszEscena.codigo?.length ?? 0);

  return (
    <div className="mmsz-animada">
      <div className={`mmsz-animada-escenario ${mmszEscena.codigo ? 'con-codigo' : 'solo-texto'}`}>
        <div className="mmsz-animada-escena" key={mmszIndice}>
          <div className="mmsz-animada-texto">
            {mmszEscena.titular && <h2>{mmszEscena.titular}</h2>}
            {mmszEscena.texto && (
              <p>
                {mmszEscena.texto.split('\n').map((linea, i) => (
                  <span key={i} className="mmsz-animada-linea" style={{ animationDelay: `${i * 0.35}s` }}>
                    <MmszEnLinea texto={linea} />
                  </span>
                ))}
              </p>
            )}
          </div>

          {mmszEscena.codigo && (
            <div className="mmsz-animada-codigo">
              <div className="mmsz-arte-puntos">
                <i /> <i /> <i />
                <small>{mmszLang === 'cpp' ? 'main.cpp' : mmszLang === 'python' ? 'programa.py' : 'programa.js'}</small>
              </div>
              <pre>
                {mmszColorear(mmszCodigoVisible, mmszLang)}
                <span className={`mmsz-animada-cursor ${mmszEscribiendo ? 'activo' : ''}`}>▍</span>
              </pre>
              {mmszEscena.ejecutable && (
                <div className={`mmsz-animada-salida ${mmszSalida ? 'lista' : ''}`}>
                  <small>▶ Salida</small>
                  <pre className={mmszSalida?.error ? 'err' : ''}>
                    {mmszSalida ? mmszSalida.output || mmszSalida.error || '(sin salida)' : mmszEscribiendo ? '' : 'Ejecutando…'}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>

        {mmszSubtitulos && mmszEmpezado && !mmszTerminado && mmszEscena.narracion[mmszFrase] && (
          <div className="mmsz-animada-subtitulo">{mmszEscena.narracion[mmszFrase]}</div>
        )}

        {!mmszEmpezado && (
          <button className="mmsz-animada-portada" onClick={() => mmszIrAEscena(0)}>
            <span className="mmsz-animada-play">▶</span>
            <b>Reproducir lección animada</b>
            <small>
              {mmszEscenas.length} escenas · funciona sin internet{mmszHayVoz ? ' · con voz' : ''}
            </small>
          </button>
        )}
        {mmszTerminado && (
          <div className="mmsz-animada-portada fin">
            <span className="mmsz-animada-play">✓</span>
            <b>¡Lección terminada!</b>
            <button className="mmsz-din-boton" onClick={() => mmszIrAEscena(0)}>
              ↺ Ver de nuevo
            </button>
          </div>
        )}
      </div>

      {/* ---------- Controles ---------- */}
      <div className="mmsz-animada-controles">
        <button onClick={() => mmszIrAEscena(mmszIndice - 1)} disabled={mmszIndice === 0} title="Escena anterior">
          ⏮
        </button>
        <button
          className="principal"
          onClick={() => {
            if (!mmszEmpezado || mmszTerminado) mmszIrAEscena(mmszTerminado ? 0 : mmszIndice);
            else setMmszReproduciendo(!mmszReproduciendo);
          }}
          title={mmszReproduciendo ? 'Pausar' : 'Reproducir'}
        >
          {mmszReproduciendo ? '⏸' : '▶'}
        </button>
        <button onClick={() => mmszIrAEscena(mmszIndice + 1)} disabled={mmszIndice === mmszEscenas.length - 1} title="Escena siguiente">
          ⏭
        </button>

        <div className="mmsz-animada-progreso">
          {mmszEscenas.map((_, i) => (
            <button
              key={i}
              className={i < mmszIndice || mmszTerminado ? 'vista' : i === mmszIndice ? 'actual' : ''}
              onClick={() => mmszIrAEscena(i)}
              title={`Escena ${i + 1}`}
            />
          ))}
        </div>
        <small className="mmsz-animada-contador">
          {mmszIndice + 1}/{mmszEscenas.length}
        </small>

        <select value={mmszVelocidad} onChange={(e) => setMmszVelocidad(Number(e.target.value))} title="Velocidad">
          {MMSZ_VELOCIDADES.map((v) => (
            <option key={v} value={v}>
              {v}x
            </option>
          ))}
        </select>
        {mmszHayVoz && (
          <button onClick={() => setMmszSilencio(!mmszSilencio)} title={mmszSilencio ? 'Activar voz' : 'Silenciar voz'}>
            {mmszSilencio ? '🔇' : '🔊'}
          </button>
        )}
        <button className={mmszSubtitulos ? 'activo' : ''} onClick={() => setMmszSubtitulos(!mmszSubtitulos)} title="Subtítulos">
          CC
        </button>
      </div>
    </div>
  );
}
