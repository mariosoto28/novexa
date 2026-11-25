import { useMemo, useState } from 'react';
import type { MmszRunnableLang } from '../runner';
import { mmszConceptos, mmszEstructura, mmszExplicarLinea, mmszTieneLinea } from '../mmszExplicador';

interface MmszProps {
  mmszSolucion: string;
  mmszLang: MmszRunnableLang;
  mmszCodigo: string;
  mmszCambiarCodigo: (mmszC: string) => void;
}

type MmszVista = 'conceptos' | 'estructura' | 'pasos' | null;

function mmszInsertar(mmszCodigo: string, mmszLineas: string[], mmszIndice: number): string {
  const mmszN = (mmszS: string) => mmszS.replace(/\s+/g, '');
  const mmszFilas = mmszCodigo.replace(/\n+$/, '').split('\n');
  let mmszPos = mmszFilas.length;
  for (let mmszK = mmszIndice - 1; mmszK >= 0; mmszK--) {
    const mmszI = mmszFilas.findIndex((mmszF) => mmszN(mmszF) === mmszN(mmszLineas[mmszK]) && mmszN(mmszF) !== '');
    if (mmszI !== -1) {
      mmszPos = mmszI + 1;
      break;
    }
  }
  if (mmszFilas.length === 1 && !mmszFilas[0].trim()) return mmszLineas[mmszIndice];
  mmszFilas.splice(mmszPos, 0, mmszLineas[mmszIndice]);
  return mmszFilas.join('\n');
}

export default function MmszAyudaDesafio({ mmszSolucion, mmszLang, mmszCodigo, mmszCambiarCodigo }: MmszProps) {
  const [mmszVista, mmszSetVista] = useState<MmszVista>(null);
  const mmszLineas = useMemo(() => mmszSolucion.split('\n'), [mmszSolucion]);
  const mmszUtiles = mmszLineas.map((mmszL, mmszI) => ({ mmszL, mmszI })).filter((mmszX) => mmszX.mmszL.trim());
  const mmszPrimeraFaltante = mmszUtiles.find((mmszX) => !mmszTieneLinea(mmszCodigo, mmszX.mmszL))?.mmszI ?? mmszUtiles[0]?.mmszI ?? 0;
  const [mmszActual, mmszSetActual] = useState<number | null>(null);
  const mmszIndice = mmszActual ?? mmszPrimeraFaltante;
  const mmszPosEnUtiles = mmszUtiles.findIndex((mmszX) => mmszX.mmszI === mmszIndice);
  const mmszFaltan = mmszUtiles.filter((mmszX) => !mmszTieneLinea(mmszCodigo, mmszX.mmszL)).length;

  const mmszCambiarVista = (mmszV: MmszVista) => {
    mmszSetVista(mmszVista === mmszV ? null : mmszV);
    mmszSetActual(null);
  };

  return (
    <div className="mmsz-ayuda">
      <div className="mmsz-ayuda-botones">
        <span className="small muted">¿Necesitas ayuda?</span>
        <button className={mmszVista === 'conceptos' ? 'activo' : ''} onClick={() => mmszCambiarVista('conceptos')}>
          💡 Qué necesito
        </button>
        <button className={mmszVista === 'estructura' ? 'activo' : ''} onClick={() => mmszCambiarVista('estructura')}>
          🧩 Estructura
        </button>
        <button className={mmszVista === 'pasos' ? 'activo' : ''} onClick={() => mmszCambiarVista('pasos')}>
          🧭 Paso a paso
        </button>
      </div>

      {mmszVista === 'conceptos' && (
        <div className="mmsz-ayuda-panel mmsz-aparecer">
          <b>Para resolver este paso vas a necesitar:</b>
          <ul>
            {mmszConceptos(mmszSolucion, mmszLang).map((mmszC) => (
              <li key={mmszC}>{mmszC}</li>
            ))}
          </ul>
          <small className="muted">¿Todavía no sabes cómo? Mira la 🧩 Estructura.</small>
        </div>
      )}

      {mmszVista === 'estructura' && (
        <div className="mmsz-ayuda-panel mmsz-aparecer">
          <b>La solución tiene esta forma. Completa cada ___ :</b>
          <pre className="mmsz-ayuda-codigo">{mmszEstructura(mmszSolucion, mmszLang)}</pre>
          <small className="muted">¿Sigues con dudas? Usa 🧭 Paso a paso: te explico cada línea.</small>
        </div>
      )}

      {mmszVista === 'pasos' && (
        <div className="mmsz-ayuda-panel mmsz-aparecer">
          <div className="mmsz-ayuda-pasos">
            <ol className="mmsz-ayuda-lineas">
              {mmszUtiles.map(({ mmszL, mmszI }) => {
                const mmszTiene = mmszTieneLinea(mmszCodigo, mmszL);
                return (
                  <li key={mmszI} className={`${mmszI === mmszIndice ? 'actual' : ''} ${mmszTiene ? 'tiene' : ''}`}>
                    <button onClick={() => mmszSetActual(mmszI)}>
                      <span>{mmszTiene ? '✓' : '○'}</span>
                      <code>{mmszL}</code>
                    </button>
                  </li>
                );
              })}
            </ol>
            <div className="mmsz-ayuda-explicacion" key={mmszIndice}>
              <small className="muted">
                Línea {mmszPosEnUtiles + 1} de {mmszUtiles.length}
                {mmszFaltan ? ` · te faltan ${mmszFaltan}` : ' · ¡ya tienes todas!'}
              </small>
              <pre className="mmsz-ayuda-codigo">{mmszLineas[mmszIndice]}</pre>
              <p>{mmszExplicarLinea(mmszLineas[mmszIndice], mmszLang)}</p>
              <div className="mmsz-acciones">
                <button
                  className="mmsz-btn"
                  disabled={mmszPosEnUtiles <= 0}
                  onClick={() => mmszSetActual(mmszUtiles[mmszPosEnUtiles - 1].mmszI)}
                >
                  ◀
                </button>
                <button
                  className="mmsz-btn mmsz-btn-fuerte"
                  disabled={mmszTieneLinea(mmszCodigo, mmszLineas[mmszIndice])}
                  onClick={() => {
                    mmszCambiarCodigo(mmszInsertar(mmszCodigo, mmszLineas, mmszIndice));
                    const mmszSig = mmszUtiles[mmszPosEnUtiles + 1];
                    mmszSetActual(mmszSig ? mmszSig.mmszI : mmszIndice);
                  }}
                >
                  {mmszTieneLinea(mmszCodigo, mmszLineas[mmszIndice]) ? '✓ Ya la tienes' : '➕ Agregar esta línea a mi código'}
                </button>
                <button
                  className="mmsz-btn"
                  disabled={mmszPosEnUtiles >= mmszUtiles.length - 1}
                  onClick={() => mmszSetActual(mmszUtiles[mmszPosEnUtiles + 1].mmszI)}
                >
                  ▶
                </button>
              </div>
              <small className="muted">Intenta escribirla tú primero; el botón es por si te trabas.</small>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
