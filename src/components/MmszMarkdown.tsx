import { Fragment, useState, type ReactNode } from 'react';
import { mmszRunCode, type MmszRunnableLang, type MmszRunResult } from '../runner';
import { mmszExplicarLinea } from '../mmszExplicador';

type MmszBloque =
  | { mmszTipo: 'p' | 'h' | 'nota'; mmszTexto: string }
  | { mmszTipo: 'lista'; mmszItems: string[] }
  | { mmszTipo: 'codigo'; mmszCodigo: string; mmszEjecutable: boolean };

function mmszParsear(mmszTexto: string): MmszBloque[] {
  const mmszLineas = mmszTexto.split('\n');
  const mmszBloques: MmszBloque[] = [];
  let mmszParrafo: string[] = [];
  const mmszCerrarParrafo = () => {
    if (mmszParrafo.length) mmszBloques.push({ mmszTipo: 'p', mmszTexto: mmszParrafo.join(' ') });
    mmszParrafo = [];
  };
  for (let mmszI = 0; mmszI < mmszLineas.length; mmszI++) {
    const mmszLinea = mmszLineas[mmszI];
    if (mmszLinea.startsWith('```') || mmszLinea.startsWith('~~~')) {
      mmszCerrarParrafo();
      const mmszCerca = mmszLinea.slice(0, 3);
      const mmszEjecutable = mmszLinea.slice(3).trim() === 'run';
      const mmszCodigo: string[] = [];
      for (mmszI++; mmszI < mmszLineas.length && !mmszLineas[mmszI].startsWith(mmszCerca); mmszI++) mmszCodigo.push(mmszLineas[mmszI]);
      mmszBloques.push({ mmszTipo: 'codigo', mmszCodigo: mmszCodigo.join('\n'), mmszEjecutable });
    } else if (mmszLinea.startsWith('- ')) {
      mmszCerrarParrafo();
      const mmszUltimo = mmszBloques[mmszBloques.length - 1];
      if (mmszUltimo?.mmszTipo === 'lista') mmszUltimo.mmszItems.push(mmszLinea.slice(2));
      else mmszBloques.push({ mmszTipo: 'lista', mmszItems: [mmszLinea.slice(2)] });
    } else if (mmszLinea.startsWith('### ')) {
      mmszCerrarParrafo();
      mmszBloques.push({ mmszTipo: 'h', mmszTexto: mmszLinea.slice(4) });
    } else if (mmszLinea.startsWith('> ')) {
      mmszCerrarParrafo();
      mmszBloques.push({ mmszTipo: 'nota', mmszTexto: mmszLinea.slice(2) });
    } else if (!mmszLinea.trim()) {
      mmszCerrarParrafo();
    } else {
      mmszParrafo.push(mmszLinea.trim());
    }
  }
  mmszCerrarParrafo();
  return mmszBloques;
}

export function MmszEnLinea({ mmszTexto }: { mmszTexto: string }) {
  const mmszPartes = mmszTexto.split(/(\*\*[^*]+\*\*|`[^`]+`|«[^»]+»)/g);
  return (
    <>
      {mmszPartes.map((mmszP, mmszI) =>
        mmszP.startsWith('**') && mmszP.endsWith('**') ? (
          <strong key={mmszI}>{mmszP.slice(2, -2)}</strong>
        ) : (mmszP.startsWith('`') && mmszP.endsWith('`')) || (mmszP.startsWith('«') && mmszP.endsWith('»')) ? (
          <code key={mmszI} className="mmsz-codigo-linea">
            {mmszP.slice(1, -1)}
          </code>
        ) : (
          <Fragment key={mmszI}>{mmszP}</Fragment>
        ),
      )}
    </>
  );
}

function MmszEjemplo({ mmszCodigo, mmszEjecutable, mmszLang }: { mmszCodigo: string; mmszEjecutable: boolean; mmszLang: MmszRunnableLang }) {
  const [mmszResultado, mmszSetResultado] = useState<MmszRunResult | null>(null);
  const [mmszCorriendo, mmszSetCorriendo] = useState(false);
  const [mmszExplicar, mmszSetExplicar] = useState(false);
  const mmszLineas = mmszCodigo.split('\n');
  return (
    <div className="mmsz-ejemplo">
      {mmszExplicar ? (
        <div className="mmsz-explicado">
          {mmszLineas.map((mmszL, mmszI) => {
            const mmszTexto = mmszExplicarLinea(mmszL, mmszLang);
            return (
              <div key={mmszI} className={`mmsz-explicado-fila ${mmszTexto ? '' : 'vacia'}`}>
                <pre>{mmszL || ' '}</pre>
                {mmszTexto && <span>{mmszTexto}</span>}
              </div>
            );
          })}
        </div>
      ) : (
        <pre className="code">{mmszCodigo}</pre>
      )}
      <div className="mmsz-ejemplo-acciones">
        <button className="run-btn" onClick={() => mmszSetExplicar(!mmszExplicar)}>
          {mmszExplicar ? '✕ Ocultar explicación' : '🔍 Explicar línea por línea'}
        </button>
      </div>
      {mmszEjecutable && (
        <div className="mmsz-ejemplo-acciones">
          <button
            className="run-btn"
            disabled={mmszCorriendo}
            onClick={async () => {
              mmszSetCorriendo(true);
              mmszSetResultado(await mmszRunCode(mmszLang, mmszCodigo));
              mmszSetCorriendo(false);
            }}
          >
            {mmszCorriendo ? 'Ejecutando…' : '▶ Probar este ejemplo'}
          </button>
          {mmszResultado && (
            <pre className={mmszResultado.mmszError ? 'out err' : 'out'}>
              {mmszResultado.mmszOutput}
              {mmszResultado.mmszError ? `${mmszResultado.mmszOutput ? '\n' : ''}${mmszResultado.mmszError}` : ''}
              {!mmszResultado.mmszOutput && !mmszResultado.mmszError ? '(no se mostró nada)' : ''}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}

export default function MmszMarkdown({ mmszTexto, mmszLang }: { mmszTexto: string; mmszLang: MmszRunnableLang }) {
  const mmszBloques = mmszParsear(mmszTexto);
  const mmszHtml: ReactNode[] = mmszBloques.map((mmszB, mmszI) => {
    if (mmszB.mmszTipo === 'p') return <p key={mmszI}><MmszEnLinea mmszTexto={mmszB.mmszTexto} /></p>;
    if (mmszB.mmszTipo === 'h') return <h3 key={mmszI}><MmszEnLinea mmszTexto={mmszB.mmszTexto} /></h3>;
    if (mmszB.mmszTipo === 'nota') return <div key={mmszI} className="mmsz-nota"><MmszEnLinea mmszTexto={mmszB.mmszTexto} /></div>;
    if (mmszB.mmszTipo === 'lista')
      return (
        <ul key={mmszI}>
          {mmszB.mmszItems.map((mmszT, mmszJ) => (
            <li key={mmszJ}><MmszEnLinea mmszTexto={mmszT} /></li>
          ))}
        </ul>
      );
    if (mmszB.mmszTipo === 'codigo') return <MmszEjemplo key={mmszI} mmszCodigo={mmszB.mmszCodigo} mmszEjecutable={mmszB.mmszEjecutable} mmszLang={mmszLang} />;
    return null;
  });
  return <div className="mmsz-markdown">{mmszHtml}</div>;
}
