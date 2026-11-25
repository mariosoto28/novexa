import { useEffect, useMemo, useRef } from 'react';
import type { MmszExercise } from '../types';
import type { MmszRunResult } from '../runner';

export type MmszAnswer = number | string | number[] | null;

interface MmszProps {
  mmszExercise: MmszExercise;
  mmszAnswer: MmszAnswer;
  mmszOnAnswer: (mmszA: MmszAnswer) => void;
  mmszLocked: boolean;
  mmszRun: MmszRunResult | null;
  mmszLang: string;
  mmszOnRun: () => void;
  mmszRunning: boolean;
  mmszPyLoading: boolean;
}

function mmszShuffle(mmszN: number): number[] {
  const mmszA = Array.from({ length: mmszN }, (mmszSinUso, mmszI) => mmszI);
  do {
    for (let mmszI = mmszA.length - 1; mmszI > 0; mmszI--) {
      const mmszJ = Math.floor(Math.random() * (mmszI + 1));
      [mmszA[mmszI], mmszA[mmszJ]] = [mmszA[mmszJ], mmszA[mmszI]];
    }
  } while (mmszN > 1 && mmszA.every((mmszV, mmszI) => mmszV === mmszI));
  return mmszA;
}

const mmszLabel: Record<MmszExercise['mmszType'], string> = {
  choice: 'Elige la respuesta correcta',
  fill: 'Completa el espacio',
  order: 'Ordena el código',
  code: 'Escribe código',
};

export default function MmszExerciseView(mmszProps: MmszProps) {
  const { mmszExercise, mmszAnswer, mmszOnAnswer, mmszLocked } = mmszProps;
  return (
    <div className="exercise">
      <span className="tag">{mmszLabel[mmszExercise.mmszType]}</span>
      <h2>{mmszExercise.mmszPrompt}</h2>
      {mmszExercise.mmszType === 'choice' && <MmszChoice mmszEx={mmszExercise} mmszAnswer={mmszAnswer} mmszOnAnswer={mmszOnAnswer} mmszLocked={mmszLocked} />}
      {mmszExercise.mmszType === 'fill' && <MmszFill mmszEx={mmszExercise} mmszAnswer={mmszAnswer} mmszOnAnswer={mmszOnAnswer} mmszLocked={mmszLocked} />}
      {mmszExercise.mmszType === 'order' && <MmszOrder mmszEx={mmszExercise} mmszAnswer={mmszAnswer} mmszOnAnswer={mmszOnAnswer} mmszLocked={mmszLocked} />}
      {mmszExercise.mmszType === 'code' && (
        <MmszCodeEditor
          mmszEx={mmszExercise}
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

type MmszSub<MmszT extends MmszExercise['mmszType']> = {
  mmszEx: Extract<MmszExercise, { mmszType: MmszT }>;
  mmszAnswer: MmszAnswer;
  mmszOnAnswer: (mmszA: MmszAnswer) => void;
  mmszLocked: boolean;
};

function MmszChoice({ mmszEx, mmszAnswer, mmszOnAnswer, mmszLocked }: MmszSub<'choice'>) {
  return (
    <>
      {mmszEx.mmszCode && <pre className="code">{mmszEx.mmszCode}</pre>}
      <div className="options">
        {mmszEx.mmszOptions.map((mmszOpt, mmszI) => {
          let mmszCls = 'option';
          if (mmszAnswer === mmszI) mmszCls += ' selected';
          if (mmszLocked && mmszI === mmszEx.mmszAnswer) mmszCls += ' right';
          if (mmszLocked && mmszAnswer === mmszI && mmszI !== mmszEx.mmszAnswer) mmszCls += ' bad';
          return (
            <button key={mmszI} className={mmszCls} disabled={mmszLocked} onClick={() => mmszOnAnswer(mmszI)}>
              <span className="key">{mmszI + 1}</span>
              <code>{mmszOpt}</code>
            </button>
          );
        })}
      </div>
    </>
  );
}

function MmszFill({ mmszEx, mmszAnswer, mmszOnAnswer, mmszLocked }: MmszSub<'fill'>) {
  const [mmszBefore, mmszAfter] = mmszEx.mmszCode.split('___');
  return (
    <pre className="code fill">
      {mmszBefore}
      <input
        autoFocus
        className="blank"
        value={typeof mmszAnswer === 'string' ? mmszAnswer : ''}
        onChange={(mmszE) => mmszOnAnswer(mmszE.target.value)}
        disabled={mmszLocked}
        size={Math.max(4, String(mmszAnswer ?? '').length + 1)}
        spellCheck={false}
      />
      {mmszAfter}
    </pre>
  );
}

function MmszOrder({ mmszEx, mmszAnswer, mmszOnAnswer, mmszLocked }: MmszSub<'order'>) {
  const mmszPool = useMemo(() => mmszShuffle(mmszEx.mmszLines.length), [mmszEx]);
  const mmszChosen = Array.isArray(mmszAnswer) ? mmszAnswer : [];
  return (
    <>
      <div className="order-target">
        {mmszChosen.length === 0 && <span className="muted small">Toca las líneas de abajo en el orden correcto</span>}
        {mmszChosen.map((mmszLineIdx, mmszI) => (
          <button
            key={mmszI}
            className="line placed"
            disabled={mmszLocked}
            onClick={() => mmszOnAnswer(mmszChosen.filter((mmszSinUso, mmszJ) => mmszJ !== mmszI))}
          >
            <code>{mmszEx.mmszLines[mmszLineIdx]}</code>
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
            <code>{mmszEx.mmszLines[mmszLineIdx]}</code>
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

function MmszCodeEditor({ mmszEx, mmszAnswer, mmszOnAnswer, mmszLocked, mmszRun, mmszLang, mmszOnRun, mmszRunning, mmszPyLoading }: MmszEditorProps) {
  const mmszValue = typeof mmszAnswer === 'string' ? mmszAnswer : mmszEx.mmszStarter;
  const mmszRef = useRef<HTMLTextAreaElement>(null);
  const mmszIndentUnit = mmszLang === 'javascript' ? '  ' : '    ';

  function mmszInsert(mmszT: HTMLTextAreaElement, mmszText: string) {
    const mmszS = mmszT.selectionStart;
    mmszOnAnswer(mmszValue.slice(0, mmszS) + mmszText + mmszValue.slice(mmszT.selectionEnd));
    requestAnimationFrame(() => mmszT.setSelectionRange(mmszS + mmszText.length, mmszS + mmszText.length));
  }

  function mmszOnKeyDown(mmszE: React.KeyboardEvent<HTMLTextAreaElement>) {
    const mmszT = mmszE.currentTarget;
    if (mmszE.key === 'Enter' && (mmszE.ctrlKey || mmszE.metaKey)) {
      mmszE.preventDefault();
      if (!mmszRunning) mmszOnRun();
    } else if (mmszE.key === 'Tab') {
      mmszE.preventDefault();
      mmszInsert(mmszT, mmszIndentUnit);
    } else if (mmszE.key === 'Enter') {
      mmszE.preventDefault();
      const mmszBefore = mmszValue.slice(0, mmszT.selectionStart);
      const mmszLine = mmszBefore.slice(mmszBefore.lastIndexOf('\n') + 1);
      const mmszIndent = mmszLine.match(/^\s*/)![0];
      const mmszOpens = /[:{]\s*$/.test(mmszLine);
      mmszInsert(mmszT, '\n' + mmszIndent + (mmszOpens ? mmszIndentUnit : ''));
    }
  }

  useEffect(() => {
    if (mmszAnswer == null) mmszOnAnswer(mmszEx.mmszStarter);
    const mmszT = mmszRef.current;
    if (mmszT) {
      mmszT.focus();
      mmszT.setSelectionRange(mmszEx.mmszStarter.length, mmszEx.mmszStarter.length);
    }
  }, []);

  return (
    <>
      <textarea
        ref={mmszRef}
        className="editor"
        value={mmszValue}
        onChange={(mmszE) => mmszOnAnswer(mmszE.target.value)}
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
          <span className="small muted">Salida esperada · no importan mayúsculas</span>
          <pre className="out expected">{mmszEx.mmszExpectedOutput}</pre>
        </div>
        <div className="console-col">
          <span className="small muted">Tu salida</span>
          <pre className={mmszRun?.mmszError ? 'out err' : 'out'}>
            {!mmszRun && <span className="muted">Ejecuta tu código para ver el resultado</span>}
            {mmszRun?.mmszOutput}
            {mmszRun?.mmszError ? `${mmszRun.mmszOutput ? '\n' : ''}${mmszRun.mmszError}` : ''}
            {mmszRun && !mmszRun.mmszOutput && !mmszRun.mmszError ? '(no se mostró nada)' : ''}
          </pre>
        </div>
      </div>
    </>
  );
}
