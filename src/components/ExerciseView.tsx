// Autor: MMSZ (Mario Soto Zea)
import { useEffect, useMemo, useRef } from 'react';
import type { MmszExercise } from '../types';
import type { MmszRunResult } from '../runner';

export type MmszAnswer = number | string | number[] | null;

interface MmszProps {
  mmszExercise: MmszExercise;
  mmszAnswer: MmszAnswer;
  mmszOnAnswer: (a: MmszAnswer) => void;
  mmszLocked: boolean;
  mmszRun: MmszRunResult | null;
  mmszLang: string;
  mmszOnRun: () => void;
  mmszRunning: boolean;
  mmszPyLoading: boolean;
}

function mmszShuffle(n: number): number[] {
  const a = Array.from({ length: n }, (_, i) => i);
  do {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
  } while (n > 1 && a.every((v, i) => v === i)); // evita que salga ya ordenado
  return a;
}

const mmszLabel: Record<MmszExercise['type'], string> = {
  choice: 'Elige la respuesta correcta',
  fill: 'Completa el espacio',
  order: 'Ordena el código',
  code: 'Escribe código',
};

export default function MmszExerciseView(mmszProps: MmszProps) {
  const { mmszExercise, mmszAnswer, mmszOnAnswer, mmszLocked } = mmszProps;
  return (
    <div className="exercise">
      <span className="tag">{mmszLabel[mmszExercise.type]}</span>
      <h2>{mmszExercise.prompt}</h2>
      {mmszExercise.type === 'choice' && <MmszChoice ex={mmszExercise} mmszAnswer={mmszAnswer} mmszOnAnswer={mmszOnAnswer} mmszLocked={mmszLocked} />}
      {mmszExercise.type === 'fill' && <MmszFill ex={mmszExercise} mmszAnswer={mmszAnswer} mmszOnAnswer={mmszOnAnswer} mmszLocked={mmszLocked} />}
      {mmszExercise.type === 'order' && <MmszOrder ex={mmszExercise} mmszAnswer={mmszAnswer} mmszOnAnswer={mmszOnAnswer} mmszLocked={mmszLocked} />}
      {mmszExercise.type === 'code' && (
        <MmszCodeEditor
          ex={mmszExercise}
          mmszAnswer={mmszAnswer}
          mmszOnAnswer={mmszOnAnswer}
          mmszLocked={mmszLocked}
          mmszRun={mmszProps.mmszRun}
          mmszLang={mmszProps.mmszLang}
          mmszOnRun={mmszProps.mmszOnRun}
          mmszRunning={mmszProps.mmszRunning}
          mmszPyLoading={mmszProps.mmszPyLoading}
        />
      )}
    </div>
  );
}

type MmszSub<T extends MmszExercise['type']> = {
  ex: Extract<MmszExercise, { type: T }>;
  mmszAnswer: MmszAnswer;
  mmszOnAnswer: (a: MmszAnswer) => void;
  mmszLocked: boolean;
};

function MmszChoice({ ex, mmszAnswer, mmszOnAnswer, mmszLocked }: MmszSub<'choice'>) {
  return (
    <>
      {ex.code && <pre className="code">{ex.code}</pre>}
      <div className="options">
        {ex.options.map((mmszOpt, i) => {
          let mmszCls = 'option';
          if (mmszAnswer === i) mmszCls += ' selected';
          if (mmszLocked && i === ex.answer) mmszCls += ' right';
          if (mmszLocked && mmszAnswer === i && i !== ex.answer) mmszCls += ' bad';
          return (
            <button key={i} className={mmszCls} disabled={mmszLocked} onClick={() => mmszOnAnswer(i)}>
              <span className="key">{i + 1}</span>
              <code>{mmszOpt}</code>
            </button>
          );
        })}
      </div>
    </>
  );
}

function MmszFill({ ex, mmszAnswer, mmszOnAnswer, mmszLocked }: MmszSub<'fill'>) {
  const [mmszBefore, mmszAfter] = ex.code.split('___');
  return (
    <pre className="code fill">
      {mmszBefore}
      <input
        autoFocus
        className="blank"
        value={typeof mmszAnswer === 'string' ? mmszAnswer : ''}
        onChange={(e) => mmszOnAnswer(e.target.value)}
        disabled={mmszLocked}
        size={Math.max(4, String(mmszAnswer ?? '').length + 1)}
        spellCheck={false}
      />
      {mmszAfter}
    </pre>
  );
}

function MmszOrder({ ex, mmszAnswer, mmszOnAnswer, mmszLocked }: MmszSub<'order'>) {
  const mmszPool = useMemo(() => mmszShuffle(ex.lines.length), [ex]);
  const mmszChosen = Array.isArray(mmszAnswer) ? mmszAnswer : [];
  return (
    <>
      <div className="order-target">
        {mmszChosen.length === 0 && <span className="muted small">Toca las líneas de abajo en el orden correcto</span>}
        {mmszChosen.map((mmszLineIdx, i) => (
          <button
            key={i}
            className="line placed"
            disabled={mmszLocked}
            onClick={() => mmszOnAnswer(mmszChosen.filter((_, j) => j !== i))}
          >
            <code>{ex.lines[mmszLineIdx]}</code>
          </button>
        ))}
      </div>
      <div className="order-pool">
        {mmszPool.map((mmszLineIdx) => (
          <button
            key={mmszLineIdx}
            className="line"
            disabled={mmszLocked || mmszChosen.includes(mmszLineIdx)}
            onClick={() => mmszOnAnswer([...mmszChosen, mmszLineIdx])}
          >
            <code>{ex.lines[mmszLineIdx]}</code>
          </button>
        ))}
      </div>
    </>
  );
}

type MmszEditorProps = MmszSub<'code'> & {
  mmszRun: MmszRunResult | null;
  mmszLang: string;
  mmszOnRun: () => void;
  mmszRunning: boolean;
  mmszPyLoading: boolean;
};

function MmszCodeEditor({ ex, mmszAnswer, mmszOnAnswer, mmszLocked, mmszRun, mmszLang, mmszOnRun, mmszRunning, mmszPyLoading }: MmszEditorProps) {
  const mmszValue = typeof mmszAnswer === 'string' ? mmszAnswer : ex.starter;
  const mmszRef = useRef<HTMLTextAreaElement>(null);
  const mmszIndentUnit = mmszLang === 'javascript' ? '  ' : '    ';

  /** Inserta texto en la posición del cursor y lo deja justo después. */
  function mmszInsert(t: HTMLTextAreaElement, mmszText: string) {
    const s = t.selectionStart;
    mmszOnAnswer(mmszValue.slice(0, s) + mmszText + mmszValue.slice(t.selectionEnd));
    requestAnimationFrame(() => t.setSelectionRange(s + mmszText.length, s + mmszText.length));
  }

  function mmszOnKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    const t = e.currentTarget;
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (!mmszRunning) mmszOnRun();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      mmszInsert(t, mmszIndentUnit);
    } else if (e.key === 'Enter') {
      // Mantiene la sangría de la línea actual y agrega un nivel tras ":" o "{".
      e.preventDefault();
      const mmszBefore = mmszValue.slice(0, t.selectionStart);
      const mmszLine = mmszBefore.slice(mmszBefore.lastIndexOf('\n') + 1);
      const mmszIndent = mmszLine.match(/^\s*/)![0];
      const mmszOpens = /[:{]\s*$/.test(mmszLine);
      mmszInsert(t, '\n' + mmszIndent + (mmszOpens ? mmszIndentUnit : ''));
    }
  }

  // Al abrir el ejercicio: carga el código inicial y pone el cursor al final.
  useEffect(() => {
    if (mmszAnswer == null) mmszOnAnswer(ex.starter);
    const t = mmszRef.current;
    if (t) {
      t.focus();
      t.setSelectionRange(ex.starter.length, ex.starter.length);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <textarea
        ref={mmszRef}
        className="editor"
        value={mmszValue}
        onChange={(e) => mmszOnAnswer(e.target.value)}
        onKeyDown={mmszOnKeyDown}
        disabled={mmszLocked}
        spellCheck={false}
        rows={8}
      />
      <div className="editor-actions">
        <button className="run-btn" onClick={mmszOnRun} disabled={mmszLocked || mmszRunning}>
          {mmszRunning ? (mmszPyLoading ? 'Preparando Python…' : 'Ejecutando…') : '▶ Ejecutar'}
        </button>
        <span className="small muted">Ctrl + Enter para ejecutar · Prueba todo lo que quieras, solo “Comprobar” califica</span>
      </div>
      <div className="console">
        <div className="console-col">
          <span className="small muted">Salida esperada</span>
          <pre className="out expected">{ex.expectedOutput}</pre>
        </div>
        <div className="console-col">
          <span className="small muted">Tu salida</span>
          <pre className={mmszRun?.error ? 'out err' : 'out'}>
            {!mmszRun && <span className="muted">Ejecuta tu código para ver el resultado</span>}
            {mmszRun?.output}
            {mmszRun?.error ? `${mmszRun.output ? '\n' : ''}${mmszRun.error}` : ''}
            {mmszRun && !mmszRun.output && !mmszRun.error ? '(no se mostró nada)' : ''}
          </pre>
        </div>
      </div>
    </>
  );
}
