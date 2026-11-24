// Autor: MMSZ (Mario Soto Zea)
// Muestra el texto de las lecturas: párrafos, títulos "### ", listas "- ", notas "> ",
// **negrita**, `código` o «código», y bloques ``` o ~~~ (los bloques ~~~run se pueden ejecutar).
import { Fragment, useState, type ReactNode } from 'react';
import { mmszRunCode, type MmszRunnableLang, type MmszRunResult } from '../runner';
import { mmszExplicarLinea } from '../mmszExplicador';

type MmszBloque =
  | { tipo: 'p' | 'h' | 'nota'; texto: string }
  | { tipo: 'lista'; items: string[] }
  | { tipo: 'codigo'; codigo: string; ejecutable: boolean };

function mmszParsear(mmszTexto: string): MmszBloque[] {
  const mmszLineas = mmszTexto.split('\n');
  const mmszBloques: MmszBloque[] = [];
  let mmszParrafo: string[] = [];
  const mmszCerrarParrafo = () => {
    if (mmszParrafo.length) mmszBloques.push({ tipo: 'p', texto: mmszParrafo.join(' ') });
    mmszParrafo = [];
  };
  for (let i = 0; i < mmszLineas.length; i++) {
    const mmszLinea = mmszLineas[i];
    if (mmszLinea.startsWith('```') || mmszLinea.startsWith('~~~')) {
      mmszCerrarParrafo();
      const mmszCerca = mmszLinea.slice(0, 3);
      const mmszEjecutable = mmszLinea.slice(3).trim() === 'run';
      const mmszCodigo: string[] = [];
      for (i++; i < mmszLineas.length && !mmszLineas[i].startsWith(mmszCerca); i++) mmszCodigo.push(mmszLineas[i]);
      mmszBloques.push({ tipo: 'codigo', codigo: mmszCodigo.join('\n'), ejecutable: mmszEjecutable });
    } else if (mmszLinea.startsWith('- ')) {
      mmszCerrarParrafo();
      const mmszUltimo = mmszBloques[mmszBloques.length - 1];
      if (mmszUltimo?.tipo === 'lista') mmszUltimo.items.push(mmszLinea.slice(2));
      else mmszBloques.push({ tipo: 'lista', items: [mmszLinea.slice(2)] });
    } else if (mmszLinea.startsWith('### ')) {
      mmszCerrarParrafo();
      mmszBloques.push({ tipo: 'h', texto: mmszLinea.slice(4) });
    } else if (mmszLinea.startsWith('> ')) {
      mmszCerrarParrafo();
      mmszBloques.push({ tipo: 'nota', texto: mmszLinea.slice(2) });
    } else if (!mmszLinea.trim()) {
      mmszCerrarParrafo();
    } else {
      mmszParrafo.push(mmszLinea.trim());
    }
  }
  mmszCerrarParrafo();
  return mmszBloques;
}

/** Convierte **negrita** y `código` en elementos (sin usar HTML, así es seguro). */
export function MmszEnLinea({ texto }: { texto: string }) {
  const mmszPartes = texto.split(/(\*\*[^*]+\*\*|`[^`]+`|«[^»]+»)/g);
  return (
    <>
      {mmszPartes.map((p, i) =>
        p.startsWith('**') && p.endsWith('**') ? (
          <strong key={i}>{p.slice(2, -2)}</strong>
        ) : (p.startsWith('`') && p.endsWith('`')) || (p.startsWith('«') && p.endsWith('»')) ? (
          <code key={i} className="mmsz-codigo-linea">
            {p.slice(1, -1)}
          </code>
        ) : (
          <Fragment key={i}>{p}</Fragment>
        ),
      )}
    </>
  );
}

function MmszEjemplo({ codigo, ejecutable, lang }: { codigo: string; ejecutable: boolean; lang: MmszRunnableLang }) {
  const [mmszResultado, setMmszResultado] = useState<MmszRunResult | null>(null);
  const [mmszCorriendo, setMmszCorriendo] = useState(false);
  const [mmszExplicar, setMmszExplicar] = useState(false);
  const mmszLineas = codigo.split('\n');
  return (
    <div className="mmsz-ejemplo">
      {mmszExplicar ? (
        <div className="mmsz-explicado">
          {mmszLineas.map((l, i) => {
            const mmszTexto = mmszExplicarLinea(l, lang);
            return (
              <div key={i} className={`mmsz-explicado-fila ${mmszTexto ? '' : 'vacia'}`}>
                <pre>{l || ' '}</pre>
                {mmszTexto && <span>{mmszTexto}</span>}
              </div>
            );
          })}
        </div>
      ) : (
        <pre className="code">{codigo}</pre>
      )}
      <div className="mmsz-ejemplo-acciones">
        <button className="run-btn" onClick={() => setMmszExplicar(!mmszExplicar)}>
          {mmszExplicar ? '✕ Ocultar explicación' : '🔍 Explicar línea por línea'}
        </button>
      </div>
      {ejecutable && (
        <div className="mmsz-ejemplo-acciones">
          <button
            className="run-btn"
            disabled={mmszCorriendo}
            onClick={async () => {
              setMmszCorriendo(true);
              setMmszResultado(await mmszRunCode(lang, codigo));
              setMmszCorriendo(false);
            }}
          >
            {mmszCorriendo ? 'Ejecutando…' : '▶ Probar este ejemplo'}
          </button>
          {mmszResultado && (
            <pre className={mmszResultado.error ? 'out err' : 'out'}>
              {mmszResultado.output}
              {mmszResultado.error ? `${mmszResultado.output ? '\n' : ''}${mmszResultado.error}` : ''}
              {!mmszResultado.output && !mmszResultado.error ? '(no se mostró nada)' : ''}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}

export default function MmszMarkdown({ texto, lang }: { texto: string; lang: MmszRunnableLang }) {
  const mmszBloques = mmszParsear(texto);
  const mmszHtml: ReactNode[] = mmszBloques.map((b, i) => {
    if (b.tipo === 'p') return <p key={i}><MmszEnLinea texto={b.texto} /></p>;
    if (b.tipo === 'h') return <h3 key={i}><MmszEnLinea texto={b.texto} /></h3>;
    if (b.tipo === 'nota') return <div key={i} className="mmsz-nota"><MmszEnLinea texto={b.texto} /></div>;
    if (b.tipo === 'lista')
      return (
        <ul key={i}>
          {b.items.map((t, j) => (
            <li key={j}><MmszEnLinea texto={t} /></li>
          ))}
        </ul>
      );
    if (b.tipo === 'codigo') return <MmszEjemplo key={i} codigo={b.codigo} ejecutable={b.ejecutable} lang={lang} />;
    return null;
  });
  return <div className="mmsz-markdown">{mmszHtml}</div>;
}
