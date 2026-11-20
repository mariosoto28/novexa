// Autor: MMSZ (Mario Soto Zea)
import { useEffect, useState } from 'react';
import type { MmszCourse, MmszExercise, MmszLesson } from '../types';
import type { MmszProgress } from '../progress';
import { mmszOnPythonLoading, mmszPreloadPython, mmszRunCode, type MmszRunnableLang, type MmszRunResult } from '../runner';
import MmszExerciseView, { type MmszAnswer } from '../components/ExerciseView';

interface MmszProps {
  mmszCourse: MmszCourse;
  mmszLesson: MmszLesson;
  mmszProgress: MmszProgress;
  mmszOnMistake: () => void;
  mmszOnComplete: (xp: number) => void;
  mmszOnExit: () => void;
}

type MmszPhase = 'intro' | 'answering' | 'correct' | 'wrong' | 'finished' | 'failed';

const mmszNormalize = (s: string) => s.trim().replace(/\s+/g, ' ');

function mmszIsReady(ex: MmszExercise, a: MmszAnswer): boolean {
  if (a == null) return false;
  if (ex.type === 'choice') return typeof a === 'number';
  if (ex.type === 'order') return Array.isArray(a) && a.length === ex.lines.length;
  return typeof a === 'string' && a.trim().length > 0;
}

export default function MmszLessonScreen({ mmszCourse, mmszLesson, mmszProgress, mmszOnMistake, mmszOnComplete, mmszOnExit }: MmszProps) {
  const [mmszQueue, mmszSetQueue] = useState<number[]>(() => mmszLesson.exercises.map((_, i) => i));
  const [mmszPos, mmszSetPos] = useState(0);
  const [mmszPhase, mmszSetPhase] = useState<MmszPhase>('intro');
  const [mmszAnswer, mmszSetAnswer] = useState<MmszAnswer>(null);
  const [mmszRun, mmszSetRun] = useState<MmszRunResult | null>(null);
  const [mmszChecking, mmszSetChecking] = useState(false);
  const [mmszMistakes, mmszSetMistakes] = useState(0);
  const [mmszXpGained, mmszSetXpGained] = useState(0);

  const [mmszCorrectCount, mmszSetCorrectCount] = useState(0);
  const mmszTotal = mmszLesson.exercises.length;
  const mmszPct = mmszPhase === 'finished' ? 100 : Math.round((mmszCorrectCount / mmszTotal) * 100);
  const mmszExercise = mmszLesson.exercises[mmszQueue[mmszPos]];
  const mmszLang = mmszCourse.id as MmszRunnableLang;
  const [mmszPyLoading, mmszSetPyLoading] = useState(false);

  // Si la lección tiene ejercicios de Python, empieza a cargar Python desde ya.
  useEffect(() => {
    if (mmszLang !== 'python') return;
    if (mmszLesson.exercises.some((e) => e.type === 'code')) mmszPreloadPython();
    return mmszOnPythonLoading(mmszSetPyLoading);
  }, [mmszLang, mmszLesson]);

  /** Ejecuta sin calificar, para que el estudiante pruebe su código. */
  async function mmszTryRun() {
    mmszSetChecking(true);
    mmszSetRun(await mmszRunCode(mmszLang, String(mmszAnswer ?? '')));
    mmszSetChecking(false);
  }

  async function mmszCheck() {
    let ok = false;
    if (mmszExercise.type === 'choice') ok = mmszAnswer === mmszExercise.answer;
    if (mmszExercise.type === 'fill') ok = mmszExercise.answers.some((r) => mmszNormalize(r) === mmszNormalize(String(mmszAnswer)));
    if (mmszExercise.type === 'order') ok = (mmszAnswer as number[]).every((v, i) => v === i);
    if (mmszExercise.type === 'code') {
      mmszSetChecking(true);
      const r = await mmszRunCode(mmszLang, String(mmszAnswer));
      mmszSetChecking(false);
      mmszSetRun(r);
      ok = !r.error && mmszNormalize(r.output) === mmszNormalize(mmszExercise.expectedOutput);
    }

    if (ok) {
      mmszSetPhase('correct');
      mmszSetCorrectCount((c) => c + 1);
    } else {
      mmszSetPhase('wrong');
      mmszSetMistakes((m) => m + 1);
      mmszSetQueue((q) => [...q, q[mmszPos]]); // se repite al final, como en las apps de idiomas
      mmszOnMistake();
    }
  }

  function mmszNext() {
    if (mmszPhase === 'wrong' && mmszProgress.hearts <= 0) {
      mmszSetPhase('failed');
      return;
    }
    if (mmszPos + 1 >= mmszQueue.length) {
      const xp = 10 + (mmszMistakes === 0 ? 5 : 0);
      mmszSetXpGained(xp);
      mmszOnComplete(xp);
      mmszSetPhase('finished');
      return;
    }
    mmszSetPos(mmszPos + 1);
    mmszSetAnswer(null);
    mmszSetRun(null);
    mmszSetPhase('answering');
  }

  return (
    <div className="page lesson" style={{ ['--accent' as string]: mmszCourse.color }}>
      <header className="lesson-top">
        <button className="close" onClick={mmszOnExit} title="Salir de la lección">
          ✕
        </button>
        <div className="bar big">
          <span className="bar-fill" style={{ width: `${mmszPct}%` }} />
        </div>
        <span className="stat">
          ❤️ <b>{mmszProgress.hearts}</b>
        </span>
      </header>

      <main className="lesson-body">
        {mmszPhase === 'intro' && (
          <div className="intro">
            <span className="tag">{mmszCourse.name}</span>
            <h1>{mmszLesson.title}</h1>
            <p>{mmszLesson.intro}</p>
          </div>
        )}

        {(mmszPhase === 'answering' || mmszPhase === 'correct' || mmszPhase === 'wrong') && (
          <MmszExerciseView
            key={mmszPos}
            mmszExercise={mmszExercise}
            mmszAnswer={mmszAnswer}
            mmszOnAnswer={mmszSetAnswer}
            mmszLocked={mmszPhase !== 'answering'}
            mmszRun={mmszRun}
            mmszLang={mmszCourse.id}
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
          {mmszPhase === 'correct' && (
            <>
              <b>¡Correcto! ✓</b>
              <span>{mmszExercise.explain}</span>
            </>
          )}
          {mmszPhase === 'wrong' && (
            <>
              <b>Incorrecto</b>
              <span>{mmszExercise.explain}</span>
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
