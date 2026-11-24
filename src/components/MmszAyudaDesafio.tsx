// Autor: MMSZ (Mario Soto Zea)
// Ayuda en 3 niveles para los desafíos (para quienes aprenden de distintas formas):
// 💡 qué conceptos necesitas, 🧩 la estructura con huecos y 🧭 la solución explicada línea por línea.
import { useMemo, useState } from 'react';
import type { MmszRunnableLang } from '../runner';
import { mmszConceptos, mmszEstructura, mmszExplicarLinea, mmszTieneLinea } from '../mmszExplicador';

interface MmszProps {
  mmszSolucion: string;
  mmszLang: MmszRunnableLang;
  mmszCodigo: string;
  mmszCambiarCodigo: (c: string) => void;
}

type MmszVista = 'conceptos' | 'estructura' | 'pasos' | null;

/** Inserta una línea de la solución en el código del estudiante, después de la línea anterior que ya tenga. */
function mmszInsertar(mmszCodigo: string, mmszLineas: string[], mmszIndice: number): string {
  const n = (s: string) => s.replace(/\s+/g, '');
  const mmszFilas = mmszCodigo.replace(/\n+$/, '').split('\n');
  let mmszPos = mmszFilas.length; // por defecto, al final
  for (let k = mmszIndice - 1; k >= 0; k--) {
    const i = mmszFilas.findIndex((f) => n(f) === n(mmszLineas[k]) && n(f) !== '');
    if (i !== -1) {
      mmszPos = i + 1;
      break;
    }
  }
  // Código vacío: la línea pasa a ser la primera.
  if (mmszFilas.length === 1 && !mmszFilas[0].trim()) return mmszLineas[mmszIndice];
  mmszFilas.splice(mmszPos, 0, mmszLineas[mmszIndice]);
  return mmszFilas.join('\n');
}

export default function MmszAyudaDesafio({ mmszSolucion, mmszLang, mmszCodigo, mmszCambiarCodigo }: MmszProps) {
  const [mmszVista, setMmszVista] = useState<MmszVista>(null);
  const mmszLineas = useMemo(() => mmszSolucion.split('\n'), [mmszSolucion]);
  const mmszUtiles = mmszLineas.map((l, i) => ({ l, i })).filter((x) => x.l.trim());
  const mmszPrimeraFaltante = mmszUtiles.find((x) => !mmszTieneLinea(mmszCodigo, x.l))?.i ?? mmszUtiles[0]?.i ?? 0;
  const [mmszActual, setMmszActual] = useState<number | null>(null);
  const mmszIndice = mmszActual ?? mmszPrimeraFaltante;
  const mmszPosEnUtiles = mmszUtiles.findIndex((x) => x.i === mmszIndice);
  const mmszFaltan = mmszUtiles.filter((x) => !mmszTieneLinea(mmszCodigo, x.l)).length;

  const mmszCambiarVista = (v: MmszVista) => {
    setMmszVista(mmszVista === v ? null : v);
    setMmszActual(null);
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
            {mmszConceptos(mmszSolucion, mmszLang).map((c) => (
              <li key={c}>{c}</li>
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
              {mmszUtiles.map(({ l, i }) => {
                const mmszTiene = mmszTieneLinea(mmszCodigo, l);
                return (
                  <li key={i} className={`${i === mmszIndice ? 'actual' : ''} ${mmszTiene ? 'tiene' : ''}`}>
                    <button onClick={() => setMmszActual(i)}>
                      <span>{mmszTiene ? '✓' : '○'}</span>
                      <code>{l}</code>
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
                  onClick={() => setMmszActual(mmszUtiles[mmszPosEnUtiles - 1].i)}
                >
                  ◀
                </button>
                <button
                  className="mmsz-btn mmsz-btn-fuerte"
                  disabled={mmszTieneLinea(mmszCodigo, mmszLineas[mmszIndice])}
                  onClick={() => {
                    mmszCambiarCodigo(mmszInsertar(mmszCodigo, mmszLineas, mmszIndice));
                    const mmszSig = mmszUtiles[mmszPosEnUtiles + 1];
                    setMmszActual(mmszSig ? mmszSig.i : mmszIndice);
                  }}
                >
                  {mmszTieneLinea(mmszCodigo, mmszLineas[mmszIndice]) ? '✓ Ya la tienes' : '➕ Agregar esta línea a mi código'}
                </button>
                <button
                  className="mmsz-btn"
                  disabled={mmszPosEnUtiles >= mmszUtiles.length - 1}
                  onClick={() => setMmszActual(mmszUtiles[mmszPosEnUtiles + 1].i)}
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
