// Autor: MMSZ (Mario Soto Zea)
// Página de un curso: unidades a la izquierda; a la derecha, la unidad elegida con
// "Acerca de esta unidad" y una tarjeta por lección (Aprende + Practica).
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

/** Primera unidad que tiene lecciones sin practicar (para abrir el curso donde te quedaste). */
function mmszUnidadInicial(mmszCourse: MmszCourse, mmszProgress: MmszProgress): number {
  const mmszI = mmszCourse.units.findIndex((u) => u.lessons.some((l) => !mmszProgress.completed[l.id]));
  return mmszI === -1 ? 0 : mmszI;
}

export default function MmszCourseMap({ mmszCourse, mmszProgress, mmszNav, mmszUnidadElegida }: MmszProps) {
  const [mmszUnidad] = useState(() => mmszUnidadElegida ?? mmszUnidadInicial(mmszCourse, mmszProgress));
  const mmszUnit = mmszCourse.units[mmszUnidad];
  const mmszHechasUnidad = mmszUnit.lessons.filter((l) => mmszProgress.completed[l.id]).length;
  const mmszNoHearts = mmszProgress.hearts <= 0;

  // Cambiar de unidad pasa por la navegación, así el botón "Atrás" vuelve a la unidad anterior.
  function mmszElegirUnidad(mmszI: number) {
    if (mmszI !== mmszUnidad) mmszNav.abrirCurso(mmszCourse.id, mmszI);
  }

  return (
    <div className="page" style={{ ['--accent' as string]: mmszCourse.color }}>
      <MmszBarraSuperior mmszProgreso={mmszProgress} mmszNav={mmszNav} />

      <div className="mmsz-curso-layout">
        {/* ---------- Unidades ---------- */}
        <aside className="mmsz-curso-lateral">
          <div className="mmsz-curso-encabezado">
            <span className="mmsz-curso-icono">{mmszCourse.icon}</span>
            <div>
              <b>{mmszCourse.name}</b>
              <small>{mmszCourse.units.length} UNIDADES</small>
            </div>
          </div>
          {mmszCourse.units.map((u, i) => {
            const mmszHechas = u.lessons.filter((l) => mmszProgress.completed[l.id]).length;
            const mmszNuevoNivel = i === 0 || mmszCourse.units[i - 1].nivel !== u.nivel;
            return (
              <div key={u.title}>
                {mmszNuevoNivel && <p className={`mmsz-nivel-titulo nivel-${u.nivel}`}>{u.nivel.toUpperCase()}</p>}
                <button
                  className={`mmsz-unidad-item ${i === mmszUnidad ? 'activo' : ''}`}
                  onClick={() => mmszElegirUnidad(i)}
                >
                  <small>
                    UNIDAD {i + 1}
                    {mmszHechas === u.lessons.length && <span className="mmsz-ok"> · ✓ COMPLETA</span>}
                  </small>
                  <span>{u.title}</span>
                </button>
              </div>
            );
          })}
          <div className="mmsz-curso-stats">
            <MmszStatsBar progress={mmszProgress} />
          </div>
        </aside>

        {/* ---------- Contenido de la unidad ---------- */}
        <main className="mmsz-curso-main">
          <nav className="mmsz-migas">
            <button onClick={() => mmszNav.irInicio('cursos')} title="Página de inicio">
              ⌂
            </button>
            <span>•</span>
            <button onClick={() => mmszNav.irInicio('cursos')}>Mis cursos</button>
            <span>•</span>
            <button onClick={() => mmszElegirUnidad(0)}>{mmszCourse.name}</button>
          </nav>

          {mmszNoHearts && (
            <div className="notice">
              Te quedaste sin vidas ❤️ para las prácticas. Se recupera una cada 20 minutos. Mientras tanto puedes leer y hacer
              desafíos.
            </div>
          )}

          <h1 className="mmsz-unidad-titulo">
            Unidad {mmszUnidad + 1}: {mmszUnit.title}
          </h1>

          <section className="mmsz-tarjeta mmsz-acerca">
            <h2>
              Acerca de esta unidad <span className={`mmsz-nivel-chip nivel-${mmszUnit.nivel}`}>{mmszUnit.nivel}</span>
            </h2>
            <p>{mmszUnit.description}</p>
            <span className="bar">
              <span className="bar-fill" style={{ width: `${(mmszHechasUnidad / mmszUnit.lessons.length) * 100}%` }} />
            </span>
            <small className="muted">
              {mmszHechasUnidad} de {mmszUnit.lessons.length} prácticas completadas
            </small>
          </section>

          {mmszUnit.lessons.map((mmszLesson, mmszLi) => {
            const mmszDone = Boolean(mmszProgress.completed[mmszLesson.id]);
            return (
              <section key={mmszLesson.id} className="mmsz-tarjeta mmsz-leccion">
                <h2>
                  <span className="muted mmsz-leccion-num">Lección {mmszLi + 1}:</span> {mmszLesson.title}
                  {mmszDone && <span className="mmsz-insignia-ok">✓ Practicada</span>}
                </h2>
                <p>{mmszLesson.intro}</p>

                <div className="mmsz-leccion-grid">
                  <div>
                    <h4>Aprende</h4>
                    {mmszLesson.items.map((it) => (
                      <button
                        key={it.id}
                        className="mmsz-recurso"
                        onClick={() => mmszNav.abrirItem(mmszCourse.id, mmszLesson.id, it.id)}
                      >
                        <span className={`mmsz-recurso-icono ${mmszProgress.completed[it.id] ? 'hecho' : ''}`}>
                          {MMSZ_ICONOS[it.tipo]}
                        </span>
                        {it.titulo}
                      </button>
                    ))}
                  </div>

                  <div>
                    <h4>Practica</h4>
                    <div className="mmsz-practica">
                      <span className={`mmsz-recurso-icono ${mmszDone ? 'hecho' : ''}`}>{MMSZ_ICONOS.practica}</span>
                      <div>
                        <b>{mmszLesson.title}</b>
                        <small>{mmszLesson.exercises.length} preguntas</small>
                      </div>
                      <button
                        className="mmsz-btn mmsz-btn-fuerte"
                        disabled={mmszNoHearts}
                        onClick={() => mmszNav.practicar(mmszCourse.id, mmszLesson.id)}
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
            {mmszUnidad < mmszCourse.units.length - 1 && (
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
