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
const MMSZ_LETRAS_POR_SEGUNDO = 14;

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
  let mmszM: RegExpExecArray | null;
  let mmszK = 0;
  while ((mmszM = mmszRegex.exec(mmszCodigo))) {
    if (mmszM.index > mmszUltimo) mmszPartes.push(<Fragment key={mmszK++}>{mmszCodigo.slice(mmszUltimo, mmszM.index)}</Fragment>);
    const mmszClase = mmszM[1] ? 'c-com' : mmszM[2] ? 'c-txt' : mmszM[3] ? 'c-num' : mmszClaves.has(mmszM[4]) ? 'c-key' : null;
    mmszPartes.push(mmszClase ? <span key={mmszK++} className={mmszClase}>{mmszM[0]}</span> : <Fragment key={mmszK++}>{mmszM[0]}</Fragment>);
    mmszUltimo = mmszM.index + mmszM[0].length;
  }
  if (mmszUltimo < mmszCodigo.length) mmszPartes.push(<Fragment key={mmszK++}>{mmszCodigo.slice(mmszUltimo)}</Fragment>);
  return mmszPartes;
}

export default function MmszLeccionAnimada({ mmszTitulo, mmszIntro, mmszRecuerdo, mmszLecturas, mmszLang, mmszAlTerminar }: MmszProps) {
  const mmszEscenas = useMemo(() => mmszCrearEscenas(mmszTitulo, mmszIntro, mmszLecturas, mmszRecuerdo), [mmszTitulo, mmszIntro, mmszLecturas, mmszRecuerdo]);
  const mmszHayVoz = typeof window !== 'undefined' && 'speechSynthesis' in window;

  const [mmszIndice, mmszSetIndice] = useState(0);
  const [mmszReproduciendo, mmszSetReproduciendo] = useState(false);
  const [mmszEmpezado, mmszSetEmpezado] = useState(false);
  const [mmszTerminado, mmszSetTerminado] = useState(false);
  const [mmszVelocidad, mmszSetVelocidad] = useState(1);
  const [mmszSilencio, mmszSetSilencio] = useState(!mmszHayVoz);
  const [mmszSubtitulos, mmszSetSubtitulos] = useState(true);
  const [mmszTipeados, mmszSetTipeados] = useState(0);
  const [mmszFrase, mmszSetFrase] = useState(0);
  const [mmszSalida, mmszSetSalida] = useState<MmszRunResult | null>(null);

  const mmszTipeadosRef = useRef(0);
  const mmszFraseRef = useRef(0);
  const mmszSalidaRef = useRef<MmszRunResult | null>(null);

  const mmszEscena = mmszEscenas[mmszIndice];
  const mmszAlTerminarRef = useRef(mmszAlTerminar);
  mmszAlTerminarRef.current = mmszAlTerminar;

  useEffect(() => {
    if (mmszLang === 'python' && mmszEscenas.some((mmszE) => mmszE.mmszEjecutable)) mmszPreloadPython();
  }, [mmszLang, mmszEscenas]);

  function mmszIrAEscena(mmszI: number, mmszSeguir = true) {
    mmszTipeadosRef.current = 0;
    mmszFraseRef.current = 0;
    mmszSalidaRef.current = null;
    mmszSetTipeados(0);
    mmszSetFrase(0);
    mmszSetSalida(null);
    mmszSetTerminado(false);
    mmszSetIndice(Math.max(0, Math.min(mmszEscenas.length - 1, mmszI)));
    if (mmszSeguir) {
      mmszSetEmpezado(true);
      mmszSetReproduciendo(true);
    }
  }

  useEffect(() => {
    if (!mmszReproduciendo) return;
    let mmszCancelado = false;
    const mmszTimers: number[] = [];
    const mmszE = mmszEscena;
    const mmszTotal = mmszE.mmszCodigo?.length ?? 0;
    const mmszDuracionVoz = (mmszE.mmszNarracion.join(' ').length / MMSZ_LETRAS_POR_SEGUNDO) * 1000 / mmszVelocidad;

    let mmszTipeoListo = mmszTipeadosRef.current >= mmszTotal;
    let mmszVozLista = mmszFraseRef.current >= mmszE.mmszNarracion.length;
    let mmszEjecucionLista = !mmszE.mmszEjecutable || mmszSalidaRef.current !== null;

    const mmszRevisar = () => {
      if (mmszCancelado || !mmszTipeoListo || !mmszVozLista || !mmszEjecucionLista) return;
      mmszTimers.push(
        window.setTimeout(() => {
          if (mmszCancelado) return;
          if (mmszIndice >= mmszEscenas.length - 1) {
            mmszSetReproduciendo(false);
            mmszSetTerminado(true);
            mmszAlTerminarRef.current();
          } else {
            mmszIrAEscena(mmszIndice + 1);
          }
        }, 900 / mmszVelocidad),
      );
    };

    const mmszEjecutar = () => {
      if (!mmszE.mmszEjecutable || mmszSalidaRef.current) return;
      mmszRunCode(mmszLang, mmszE.mmszCodigo!).then((mmszR) => {
        if (mmszCancelado) return;
        mmszSalidaRef.current = mmszR;
        mmszSetSalida(mmszR);
        mmszEjecucionLista = true;
        mmszRevisar();
      });
    };

    if (!mmszTipeoListo) {
      const mmszPaso = Math.max(10, Math.min(45, (mmszDuracionVoz * 0.75) / Math.max(1, mmszTotal)));
      const mmszT = window.setInterval(() => {
        mmszTipeadosRef.current = Math.min(mmszTotal, mmszTipeadosRef.current + 1);
        mmszSetTipeados(mmszTipeadosRef.current);
        if (mmszTipeadosRef.current >= mmszTotal) {
          window.clearInterval(mmszT);
          mmszTipeoListo = true;
          mmszEjecutar();
          mmszRevisar();
        }
      }, mmszPaso);
      mmszTimers.push(mmszT);
    } else {
      mmszEjecutar();
    }

    const mmszVoz = mmszHayVoz ? mmszVozEspanol() : undefined;
    const mmszHablar = (mmszI: number) => {
      if (mmszCancelado) return;
      if (mmszI >= mmszE.mmszNarracion.length) {
        mmszVozLista = true;
        mmszRevisar();
        return;
      }
      mmszFraseRef.current = mmszI;
      mmszSetFrase(mmszI);
      const mmszTexto = mmszE.mmszNarracion[mmszI];
      const mmszSiguiente = () => {
        if (mmszCancelado) return;
        mmszFraseRef.current = mmszI + 1;
        mmszHablar(mmszI + 1);
      };
      if (mmszSilencio || !mmszHayVoz) {
        mmszTimers.push(window.setTimeout(mmszSiguiente, (mmszTexto.length / MMSZ_LETRAS_POR_SEGUNDO) * 1000 / mmszVelocidad + 250));
        return;
      }
      const mmszU = new SpeechSynthesisUtterance(mmszTexto);
      mmszU.lang = mmszVoz?.lang ?? 'es-ES';
      if (mmszVoz) mmszU.voice = mmszVoz;
      mmszU.rate = mmszVelocidad;
      mmszU.onend = mmszSiguiente;
      mmszU.onerror = mmszSiguiente;
      speechSynthesis.speak(mmszU);
    };
    if (!mmszVozLista) mmszHablar(mmszFraseRef.current);
    mmszRevisar();

    return () => {
      mmszCancelado = true;
      mmszTimers.forEach((mmszT) => {
        window.clearTimeout(mmszT);
        window.clearInterval(mmszT);
      });
      if (mmszHayVoz) speechSynthesis.cancel();
    };
  }, [mmszReproduciendo, mmszIndice, mmszVelocidad, mmszSilencio]);

  useEffect(() => () => void (mmszHayVoz && speechSynthesis.cancel()), [mmszHayVoz]);

  const mmszCodigoVisible = mmszEscena.mmszCodigo?.slice(0, mmszTipeados) ?? '';
  const mmszEscribiendo = Boolean(mmszEscena.mmszCodigo) && mmszTipeados < (mmszEscena.mmszCodigo?.length ?? 0);

  return (
    <div className="mmsz-animada">
      <div className={`mmsz-animada-escenario ${mmszEscena.mmszCodigo ? 'con-codigo' : 'solo-texto'}`}>
        <div className="mmsz-animada-escena" key={mmszIndice}>
          <div className="mmsz-animada-texto">
            {mmszEscena.mmszTitular && <h2>{mmszEscena.mmszTitular}</h2>}
            {mmszEscena.mmszTexto && (
              <p>
                {mmszEscena.mmszTexto.split('\n').map((mmszLinea, mmszI) => (
                  <span key={mmszI} className="mmsz-animada-linea" style={{ animationDelay: `${mmszI * 0.35}s` }}>
                    <MmszEnLinea mmszTexto={mmszLinea} />
                  </span>
                ))}
              </p>
            )}
          </div>

          {mmszEscena.mmszCodigo && (
            <div className="mmsz-animada-codigo">
              <div className="mmsz-ventana-puntos">
                <i /> <i /> <i />
                <small>{mmszLang === 'cpp' ? 'main.cpp' : mmszLang === 'python' ? 'programa.py' : 'programa.js'}</small>
              </div>
              <pre>
                {mmszColorear(mmszCodigoVisible, mmszLang)}
                <span className={`mmsz-animada-cursor ${mmszEscribiendo ? 'activo' : ''}`}>▍</span>
              </pre>
              {mmszEscena.mmszEjecutable && (
                <div className={`mmsz-animada-salida ${mmszSalida ? 'lista' : ''}`}>
                  <small>▶ Salida</small>
                  <pre className={mmszSalida?.mmszError ? 'err' : ''}>
                    {mmszSalida ? mmszSalida.mmszOutput || mmszSalida.mmszError || '(sin salida)' : mmszEscribiendo ? '' : 'Ejecutando…'}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>

        {mmszSubtitulos && mmszEmpezado && !mmszTerminado && mmszEscena.mmszNarracion[mmszFrase] && (
          <div className="mmsz-animada-subtitulo">{mmszEscena.mmszNarracion[mmszFrase]}</div>
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

      <div className="mmsz-animada-controles">
        <button onClick={() => mmszIrAEscena(mmszIndice - 1)} disabled={mmszIndice === 0} title="Escena anterior">
          ⏮
        </button>
        <button
          className="principal"
          onClick={() => {
            if (!mmszEmpezado || mmszTerminado) mmszIrAEscena(mmszTerminado ? 0 : mmszIndice);
            else mmszSetReproduciendo(!mmszReproduciendo);
          }}
          title={mmszReproduciendo ? 'Pausar' : 'Reproducir'}
        >
          {mmszReproduciendo ? '⏸' : '▶'}
        </button>
        <button onClick={() => mmszIrAEscena(mmszIndice + 1)} disabled={mmszIndice === mmszEscenas.length - 1} title="Escena siguiente">
          ⏭
        </button>

        <div className="mmsz-animada-progreso">
          {mmszEscenas.map((mmszSinUso, mmszI) => (
            <button
              key={mmszI}
              className={mmszI < mmszIndice || mmszTerminado ? 'vista' : mmszI === mmszIndice ? 'actual' : ''}
              onClick={() => mmszIrAEscena(mmszI)}
              title={`Escena ${mmszI + 1}`}
            />
          ))}
        </div>
        <small className="mmsz-animada-contador">
          {mmszIndice + 1}/{mmszEscenas.length}
        </small>

        <select value={mmszVelocidad} onChange={(mmszE) => mmszSetVelocidad(Number(mmszE.target.value))} title="Velocidad">
          {MMSZ_VELOCIDADES.map((mmszV) => (
            <option key={mmszV} value={mmszV}>
              {mmszV}x
            </option>
          ))}
        </select>
        {mmszHayVoz && (
          <button onClick={() => mmszSetSilencio(!mmszSilencio)} title={mmszSilencio ? 'Activar voz' : 'Silenciar voz'}>
            {mmszSilencio ? '🔇' : '🔊'}
          </button>
        )}
        <button className={mmszSubtitulos ? 'activo' : ''} onClick={() => mmszSetSubtitulos(!mmszSubtitulos)} title="Subtítulos">
          CC
        </button>
      </div>
    </div>
  );
}
