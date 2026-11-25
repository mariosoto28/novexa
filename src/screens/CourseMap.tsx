import { useState } from 'react';
import type { MmszCourse } from '../types';
import type { MmszProgress } from '../progress';
import MmszStatsBar from '../components/StatsBar';
import MmszBarraSuperior from '../components/MmszBarraSuperior';
import type { MmszNav } from '../mmszUtilidades';
import { MMSZ_ICONOS } from './MmszVisor';

interface MmszProps {
  mmszCourse: MmszCourse;
  mmszProgress: MmszProgress;
  mmszNav: MmszNav;
  mmszUnidadElegida?: number;
}

function mmszUnidadInicial(mmszCourse: MmszCourse, mmszProgress: MmszProgress): number {
  const mmszI = mmszCourse.mmszUnits.findIndex((mmszU) => mmszU.mmszLessons.some((mmszL) => !mmszProgress.mmszCompleted[mmszL.mmszId]));
  return mmszI === -1 ? 0 : mmszI;
}

export default function MmszCourseMap({ mmszCourse, mmszProgress, mmszNav, mmszUnidadElegida }: MmszProps) {
  const [mmszUnidad] = useState(() => mmszUnidadElegida ?? mmszUnidadInicial(mmszCourse, mmszProgress));
  const mmszUnit = mmszCourse.mmszUnits[mmszUnidad];
  const mmszHechasUnidad = mmszUnit.mmszLessons.filter((mmszL) => mmszProgress.mmszCompleted[mmszL.mmszId]).length;
  const mmszNoHearts = mmszProgress.mmszHearts <= 0;

  function mmszElegirUnidad(mmszI: number) {
    if (mmszI !== mmszUnidad) mmszNav.mmszAbrirCurso(mmszCourse.mmszId, mmszI);
  }

  return (
    <div className="page" style={{ ['--accent' as string]: mmszCourse.mmszColor }}>
      <MmszBarraSuperior mmszProgreso={mmszProgress} mmszNav={mmszNav} />

      <div className="mmsz-curso-layout">
        <aside className="mmsz-curso-lateral">
          <div className="mmsz-curso-encabezado">
            <span className="mmsz-curso-icono">{mmszCourse.mmszIcon}</span>
            <div>
              <b>{mmszCourse.mmszName}</b>
              <small>{mmszCourse.mmszUnits.length} UNIDADES</small>
            </div>
          </div>
          {mmszCourse.mmszUnits.map((mmszU, mmszI) => {
            const mmszHechas = mmszU.mmszLessons.filter((mmszL) => mmszProgress.mmszCompleted[mmszL.mmszId]).length;
            const mmszNuevoNivel = mmszI === 0 || mmszCourse.mmszUnits[mmszI - 1].mmszNivel !== mmszU.mmszNivel;
            return (
              <div key={mmszU.mmszTitle}>
                {mmszNuevoNivel && <p className={`mmsz-nivel-titulo nivel-${mmszU.mmszNivel}`}>{mmszU.mmszNivel.toUpperCase()}</p>}
                <button
                  className={`mmsz-unidad-item ${mmszI === mmszUnidad ? 'activo' : ''}`}
                  onClick={() => mmszElegirUnidad(mmszI)}
                >
                  <small>
                    UNIDAD {mmszI + 1}
                    {mmszHechas === mmszU.mmszLessons.length && <span className="mmsz-ok"> · ✓ COMPLETA</span>}
                  </small>
                  <span>{mmszU.mmszTitle}</span>
                </button>
              </div>
            );
          })}
          <div className="mmsz-curso-stats">
            <MmszStatsBar mmszProgress={mmszProgress} />
          </div>
        </aside>

        <main className="mmsz-curso-main">
          <nav className="mmsz-migas">
            <button onClick={() => mmszNav.mmszIrInicio('cursos')} title="Página de inicio">
              ⌂
            </button>
            <span>•</span>
            <button onClick={() => mmszNav.mmszIrInicio('cursos')}>Mis cursos</button>
            <span>•</span>
            <button onClick={() => mmszElegirUnidad(0)}>{mmszCourse.mmszName}</button>
          </nav>

          {mmszNoHearts && (
            <div className="notice">
              Te quedaste sin vidas ❤️ para las prácticas. Se recupera una cada 20 minutos. Mientras tanto puedes leer y hacer
              desafíos.
            </div>
          )}

          <h1 className="mmsz-unidad-titulo">
            Unidad {mmszUnidad + 1}: {mmszUnit.mmszTitle}
          </h1>

          <section className="mmsz-tarjeta mmsz-acerca">
            <h2>
              Acerca de esta unidad <span className={`mmsz-nivel-chip nivel-${mmszUnit.mmszNivel}`}>{mmszUnit.mmszNivel}</span>
            </h2>
            <p>{mmszUnit.mmszDescription}</p>
            <span className="bar">
              <span className="bar-fill" style={{ width: `${(mmszHechasUnidad / mmszUnit.mmszLessons.length) * 100}%` }} />
            </span>
            <small className="muted">
              {mmszHechasUnidad} de {mmszUnit.mmszLessons.length} prácticas completadas
            </small>
          </section>

          {mmszUnit.mmszLessons.map((mmszLesson, mmszLi) => {
            const mmszDone = Boolean(mmszProgress.mmszCompleted[mmszLesson.mmszId]);
            return (
              <section key={mmszLesson.mmszId} className="mmsz-tarjeta mmsz-leccion">
                <h2>
                  <span className="muted mmsz-leccion-num">Lección {mmszLi + 1}:</span> {mmszLesson.mmszTitle}
                  {mmszDone && <span className="mmsz-insignia-ok">✓ Practicada</span>}
                </h2>
                <p>{mmszLesson.mmszIntro}</p>

                <div className="mmsz-leccion-grid">
                  <div>
                    <h4>Aprende</h4>
                    {mmszLesson.mmszItems.map((mmszIt) => (
                      <button
                        key={mmszIt.mmszId}
                        className="mmsz-recurso"
                        onClick={() => mmszNav.mmszAbrirItem(mmszCourse.mmszId, mmszLesson.mmszId, mmszIt.mmszId)}
                      >
                        <span className={`mmsz-recurso-icono ${mmszProgress.mmszCompleted[mmszIt.mmszId] ? 'hecho' : ''}`}>
                          {MMSZ_ICONOS[mmszIt.mmszTipo]}
                        </span>
                        {mmszIt.mmszTitulo}
                      </button>
                    ))}
                  </div>

                  <div>
                    <h4>Practica</h4>
                    <div className="mmsz-practica">
                      <span className={`mmsz-recurso-icono ${mmszDone ? 'hecho' : ''}`}>{MMSZ_ICONOS.practica}</span>
                      <div>
                        <b>{mmszLesson.mmszTitle}</b>
                        <small>{mmszLesson.mmszExercises.length} preguntas</small>
                      </div>
                      <button
                        className="mmsz-btn mmsz-btn-fuerte"
                        disabled={mmszNoHearts}
                        onClick={() => mmszNav.mmszPracticar(mmszCourse.mmszId, mmszLesson.mmszId)}
                      >
                        {mmszDone ? 'Repasar' : 'Practica'}
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            );
          })}

          <div className="mmsz-navegacion-unidades">
            {mmszUnidad > 0 ? (
              <button className="mmsz-btn" onClick={() => mmszElegirUnidad(mmszUnidad - 1)}>
                ← Unidad {mmszUnidad}
              </button>
            ) : (
              <span />
            )}
            {mmszUnidad < mmszCourse.mmszUnits.length - 1 && (
              <button className="mmsz-btn" onClick={() => mmszElegirUnidad(mmszUnidad + 1)}>
                Unidad {mmszUnidad + 2} →
              </button>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
