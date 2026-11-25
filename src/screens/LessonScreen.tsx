import { useEffect, useState } from 'react';
import type { MmszCourse, MmszExercise, MmszLesson } from '../types';
import type { MmszProgress } from '../progress';
import { mmszOnPythonLoading, mmszPreloadPython, mmszRunCode, type MmszRunnableLang, type MmszRunResult } from '../runner';
import MmszExerciseView, { type MmszAnswer } from '../components/ExerciseView';
import { MMSZ_AVISO_MAYUSCULAS, mmszMismaSalida, mmszMismoCodigo, mmszSoloMayusculas } from '../mmszComparar';

interface MmszProps {
  mmszCourse: MmszCourse;
  mmszLesson: MmszLesson;
  mmszProgress: MmszProgress;
  mmszOnMistake: () => void;
  mmszOnComplete: (mmszXp: number) => void;
  mmszOnExit: () => void;
}

type MmszPhase = 'intro' | 'answering' | 'correct' | 'wrong' | 'finished' | 'failed';

function mmszIsReady(mmszEx: MmszExercise, mmszA: MmszAnswer): boolean {
  if (mmszA == null) return false;
  if (mmszEx.mmszType === 'choice') return typeof mmszA === 'number';
  if (mmszEx.mmszType === 'order') return Array.isArray(mmszA) && mmszA.length === mmszEx.mmszLines.length;
  return typeof mmszA === 'string' && mmszA.trim().length > 0;
}

export default function MmszLessonScreen({ mmszCourse, mmszLesson, mmszProgress, mmszOnMistake, mmszOnComplete, mmszOnExit }: MmszProps) {
  const [mmszQueue, mmszSetQueue] = useState<number[]>(() => mmszLesson.mmszExercises.map((mmszSinUso, mmszI) => mmszI));
  const [mmszPos, mmszSetPos] = useState(0);
  const [mmszPhase, mmszSetPhase] = useState<MmszPhase>('intro');
  const [mmszAnswer, mmszSetAnswer] = useState<MmszAnswer>(null);
  const [mmszRun, mmszSetRun] = useState<MmszRunResult | null>(null);
  const [mmszChecking, mmszSetChecking] = useState(false);
  const [mmszMistakes, mmszSetMistakes] = useState(0);
  const [mmszXpGained, mmszSetXpGained] = useState(0);
  const [mmszCasi, mmszSetCasi] = useState<string | null>(null);

  const [mmszCorrectCount, mmszSetCorrectCount] = useState(0);
  const mmszTotal = mmszLesson.mmszExercises.length;
  const mmszPct = mmszPhase === 'finished' ? 100 : Math.round((mmszCorrectCount / mmszTotal) * 100);
  const mmszExercise = mmszLesson.mmszExercises[mmszQueue[mmszPos]];
  const mmszLang = mmszCourse.mmszId as MmszRunnableLang;
  const [mmszPyLoading, mmszSetPyLoading] = useState(false);

  useEffect(() => {
    if (mmszLang !== 'python') return;
    if (mmszLesson.mmszExercises.some((mmszE) => mmszE.mmszType === 'code')) mmszPreloadPython();
    return mmszOnPythonLoading(mmszSetPyLoading);
  }, [mmszLang, mmszLesson]);

  async function mmszTryRun() {
    mmszSetChecking(true);
    mmszSetRun(await mmszRunCode(mmszLang, String(mmszAnswer ?? '')));
    mmszSetChecking(false);
  }

  async function mmszCheck() {
    let mmszOk = false;
    mmszSetCasi(null);
    if (mmszExercise.mmszType === 'choice') mmszOk = mmszAnswer === mmszExercise.mmszAnswer;
    if (mmszExercise.mmszType === 'fill') {
      const mmszEscrito = String(mmszAnswer);
      mmszOk = mmszExercise.mmszAnswers.some((mmszR) => mmszMismoCodigo(mmszR, mmszEscrito));
      if (!mmszOk && mmszExercise.mmszAnswers.some((mmszR) => mmszSoloMayusculas(mmszR, mmszEscrito))) {
        mmszSetCasi(MMSZ_AVISO_MAYUSCULAS);
        return;
      }
    }
    if (mmszExercise.mmszType === 'order') mmszOk = (mmszAnswer as number[]).every((mmszV, mmszI) => mmszV === mmszI);
    if (mmszExercise.mmszType === 'code') {
      mmszSetChecking(true);
      const mmszR = await mmszRunCode(mmszLang, String(mmszAnswer));
      mmszSetChecking(false);
      mmszSetRun(mmszR);
      mmszOk = !mmszR.mmszError && mmszMismaSalida(mmszR.mmszOutput, mmszExercise.mmszExpectedOutput);
    }

    if (mmszOk) {
      mmszSetPhase('correct');
      mmszSetCorrectCount((mmszC) => mmszC + 1);
    } else {
      mmszSetPhase('wrong');
      mmszSetMistakes((mmszM) => mmszM + 1);
      mmszSetQueue((mmszQ) => [...mmszQ, mmszQ[mmszPos]]);
      mmszOnMistake();
    }
  }

  function mmszNext() {
    if (mmszPhase === 'wrong' && mmszProgress.mmszHearts <= 0) {
      mmszSetPhase('failed');
      return;
    }
    if (mmszPos + 1 >= mmszQueue.length) {
      const mmszXp = 10 + (mmszMistakes === 0 ? 5 : 0);
      mmszSetXpGained(mmszXp);
      mmszOnComplete(mmszXp);
      mmszSetPhase('finished');
      return;
    }
    mmszSetPos(mmszPos + 1);
    mmszSetAnswer(null);
    mmszSetRun(null);
    mmszSetPhase('answering');
  }

  return (
    <div className="page lesson" style={{ ['--accent' as string]: mmszCourse.mmszColor }}>
      <header className="lesson-top">
        <button className="close" onClick={mmszOnExit} title="Salir de la lección">
          ✕
        </button>
        <div className="bar big">
          <span className="bar-fill" style={{ width: `${mmszPct}%` }} />
        </div>
        <span className="stat">
          ❤️ <b>{mmszProgress.mmszHearts}</b>
        </span>
      </header>

      <main className="lesson-body">
        {mmszPhase === 'intro' && (
          <div className="intro">
            <span className="tag">{mmszCourse.mmszName}</span>
            <h1>{mmszLesson.mmszTitle}</h1>
            <p>{mmszLesson.mmszIntro}</p>
          </div>
        )}

        {(mmszPhase === 'answering' || mmszPhase === 'correct' || mmszPhase === 'wrong') && (
          <MmszExerciseView
            key={mmszPos}
            mmszExercise={mmszExercise}
            mmszAnswer={mmszAnswer}
            mmszOnAnswer={(mmszA) => {
              mmszSetAnswer(mmszA);
              mmszSetCasi(null);
            }}
            mmszLocked={mmszPhase !== 'answering'}
            mmszRun={mmszRun}
            mmszLang={mmszCourse.mmszId}
            mmszOnRun={mmszTryRun}
            mmszRunning={mmszChecking}
            mmszPyLoading={mmszPyLoading}
          />
        )}

        {mmszPhase === 'finished' && (
          <div className="intro result">
            <div className="big-emoji">🎉</div>
            <h1>¡Lección completada!</h1>
            <p>
              Ganaste <b>{mmszXpGained} XP</b>
              {mmszMistakes === 0 ? ' (incluye bonus por no fallar)' : ''}.
            </p>
          </div>
        )}

        {mmszPhase === 'failed' && (
          <div className="intro result">
            <div className="big-emoji">💔</div>
            <h1>Te quedaste sin vidas</h1>
            <p>Recuperas una vida cada 20 minutos. ¡No te rindas, equivocarse es parte de aprender!</p>
          </div>
        )}
      </main>

      <footer className={`lesson-foot ${mmszPhase}`}>
        <div className="feedback">
          {mmszPhase === 'answering' && mmszCasi && <span className="mmsz-casi">⚠ {mmszCasi}</span>}
          {mmszPhase === 'correct' && (
            <>
              <b>¡Correcto! ✓</b>
              <span>{mmszExercise.mmszExplain}</span>
            </>
          )}
          {mmszPhase === 'wrong' && (
            <>
              <b>Incorrecto</b>
              <span>{mmszExercise.mmszExplain}</span>
            </>
          )}
        </div>
        {mmszPhase === 'intro' && (
          <button className="primary" onClick={() => mmszSetPhase('answering')}>
            Empezar
          </button>
        )}
        {mmszPhase === 'answering' && (
          <button className="primary" disabled={!mmszIsReady(mmszExercise, mmszAnswer) || mmszChecking} onClick={mmszCheck}>
            {mmszChecking ? (mmszPyLoading ? 'Preparando Python…' : 'Ejecutando…') : 'Comprobar'}
          </button>
        )}
        {(mmszPhase === 'correct' || mmszPhase === 'wrong') && (
          <button className="primary" onClick={mmszNext}>
            Continuar
          </button>
        )}
        {(mmszPhase === 'finished' || mmszPhase === 'failed') && (
          <button className="primary" onClick={mmszOnExit}>
            Volver al mapa
          </button>
        )}
      </footer>
    </div>
  );
}
