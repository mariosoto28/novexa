import { useState } from 'react';
import { mmszCourses as mmszTodosLosCursos, mmszAllLessons, mmszCursoSegunModo } from '../content';
import type { MmszProgress } from '../progress';
import type { MmszCourse } from '../types';
import type { MmszNav } from '../mmszUtilidades';
import MmszAnillo from '../components/MmszAnillo';
import { MMSZ_ICONOS } from './MmszVisor';
import {
  mmszAvanceCurso,
  mmszAvanceUnidad,
  mmszNivelActual,
  mmszSiguientePaso,
  type MmszSiguiente,
} from '../mmszEstadisticas';
import '../mmszDinamico.css';

interface MmszProps {
  mmszProgreso: MmszProgress;
  mmszNav: MmszNav;
  mmszCambiarCursosOcultos: (mmszIds: string[]) => void;
}

function mmszIrASiguiente(mmszNav: MmszNav, mmszC: MmszCourse, mmszS: MmszSiguiente | null) {
  if (!mmszS) mmszNav.mmszAbrirCurso(mmszC.mmszId);
  else if (mmszS.mmszItem) mmszNav.mmszAbrirItem(mmszC.mmszId, mmszS.mmszLeccion.mmszId, mmszS.mmszItem.mmszId);
  else mmszNav.mmszPracticar(mmszC.mmszId, mmszS.mmszLeccion.mmszId);
}

export default function MmszCursosDinamico({ mmszProgreso, mmszNav, mmszCambiarCursosOcultos }: MmszProps) {
  const [mmszEditando, mmszSetEditando] = useState(false);
  const mmszCourses = mmszTodosLosCursos.map((mmszC) => mmszCursoSegunModo(mmszC, mmszProgreso.mmszModoOffline));
  const mmszOcultos = mmszProgreso.mmszCursosOcultos;
  const mmszVisibles = mmszEditando ? mmszCourses : mmszCourses.filter((mmszC) => !mmszOcultos.includes(mmszC.mmszId));

  const mmszCandidatos = mmszCourses
    .filter((mmszC) => !mmszOcultos.includes(mmszC.mmszId))
    .map((mmszC) => ({ mmszC, mmszA: mmszAvanceCurso(mmszC, mmszProgreso), mmszS: mmszSiguientePaso(mmszC, mmszProgreso) }))
    .filter((mmszX) => mmszX.mmszS);
  const mmszDestacado = [...mmszCandidatos].sort((mmszA, mmszB) => mmszB.mmszA.mmszPct - mmszA.mmszA.mmszPct)[0];

  function mmszAlternar(mmszId: string) {
    mmszCambiarCursosOcultos(
      mmszOcultos.includes(mmszId) ? mmszOcultos.filter((mmszX) => mmszX !== mmszId) : [...mmszOcultos, mmszId],
    );
  }

  return (
    <div className="mmsz-din">
      <div className="mmsz-titulo-fila">
        <h1>Mis cursos</h1>
        <button className="mmsz-btn" onClick={() => mmszSetEditando(!mmszEditando)}>
          {mmszEditando ? 'Listo' : 'Editar cursos'}
        </button>
      </div>

      {mmszDestacado && !mmszEditando && (
        <section className="mmsz-din-continuar mmsz-aparecer" style={{ ['--accent' as string]: mmszDestacado.mmszC.mmszColor }}>
          <div className="mmsz-din-continuar-icono">{mmszDestacado.mmszC.mmszIcon}</div>
          <div className="mmsz-din-continuar-texto">
            <small>{mmszDestacado.mmszA.mmszHechos === 0 ? 'EMPIEZA AQUÍ' : 'CONTINÚA DONDE TE QUEDASTE'}</small>
            <h2>{mmszDestacado.mmszS!.mmszItem?.mmszTitulo ?? `Práctica: ${mmszDestacado.mmszS!.mmszLeccion.mmszTitle}`}</h2>
            <p>
              {mmszDestacado.mmszC.mmszName} · Unidad {mmszDestacado.mmszS!.mmszUnidad + 1}: {mmszDestacado.mmszC.mmszUnits[mmszDestacado.mmszS!.mmszUnidad].mmszTitle} ·
              Lección: {mmszDestacado.mmszS!.mmszLeccion.mmszTitle}
            </p>
            <button className="mmsz-din-boton" onClick={() => mmszIrASiguiente(mmszNav, mmszDestacado.mmszC, mmszDestacado.mmszS)}>
              {mmszDestacado.mmszA.mmszHechos === 0 ? 'Empezar' : 'Continuar'} →
            </button>
          </div>
          <MmszAnillo mmszPct={mmszDestacado.mmszA.mmszPct} mmszTam={104} mmszGrosor={10} mmszColor="#fff">
            <b>{mmszDestacado.mmszA.mmszPct}%</b>
            <small>del curso</small>
          </MmszAnillo>
        </section>
      )}

      {mmszEditando && <p className="muted">Marca los cursos que quieres ver en tu página de inicio.</p>}

      <div className="mmsz-din-cursos">
        {mmszVisibles.map((mmszC, mmszI) => {
          const mmszA = mmszAvanceCurso(mmszC, mmszProgreso);
          const mmszS = mmszSiguientePaso(mmszC, mmszProgreso);
          const mmszActual = mmszS?.mmszUnidad ?? mmszC.mmszUnits.length;
          return (
            <article
              key={mmszC.mmszId}
              className="mmsz-din-curso mmsz-aparecer"
              style={{ ['--accent' as string]: mmszC.mmszColor, animationDelay: `${mmszI * 90}ms` }}
            >
              <header className="mmsz-din-curso-cabecera">
                <span className="mmsz-din-curso-icono">{mmszC.mmszIcon}</span>
                <div>
                  <h3>{mmszC.mmszName}</h3>
                  <p>{mmszC.mmszTagline}</p>
                </div>
                {mmszEditando ? (
                  <label className="mmsz-check mmsz-din-check">
                    <input type="checkbox" checked={!mmszOcultos.includes(mmszC.mmszId)} onChange={() => mmszAlternar(mmszC.mmszId)} />
                    Mostrar
                  </label>
                ) : (
                  <MmszAnillo mmszPct={mmszA.mmszPct} mmszTam={66} mmszColor="#fff" />
                )}
              </header>

              <div className="mmsz-din-chips">
                <span>📚 {mmszC.mmszUnits.length} unidades</span>
                <span>📝 {mmszAllLessons(mmszC).length} lecciones</span>
                <span className={`mmsz-din-nivel nivel-${mmszNivelActual(mmszC, mmszProgreso)}`}>
                  🎯 Nivel {mmszNivelActual(mmszC, mmszProgreso).toLowerCase()}
                </span>
              </div>

              <ol className="mmsz-din-ruta">
                {mmszC.mmszUnits.map((mmszULocal, mmszUi) => {
                  const mmszU = mmszAvanceUnidad(mmszULocal, mmszProgreso);
                  const mmszEstado = mmszU.mmszPct === 100 ? 'hecha' : mmszUi === mmszActual ? 'actual' : mmszUi < mmszActual ? 'empezada' : 'pendiente';
                  return (
                    <li key={mmszULocal.mmszTitle} className={mmszEstado}>
                      <button onClick={() => mmszNav.mmszAbrirCurso(mmszC.mmszId, mmszUi)} title={`${mmszU.mmszPct}% completado`}>
                        <span className="mmsz-din-ruta-nodo">{mmszEstado === 'hecha' ? '✓' : mmszUi + 1}</span>
                        <span className="mmsz-din-ruta-texto">
                          {mmszULocal.mmszTitle}
                          <small>{mmszULocal.mmszNivel}</small>
                        </span>
                        <span className="mmsz-din-ruta-barra">
                          <i style={{ width: `${mmszU.mmszPct}%` }} />
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>

              {!mmszEditando && (
                <footer className="mmsz-din-curso-pie">
                  <span className="muted small">
                    {mmszA.mmszHechos} de {mmszA.mmszTotal} actividades
                    {mmszS?.mmszItem ? ` · sigue: ${MMSZ_ICONOS[mmszS.mmszItem.mmszTipo]} ${mmszS.mmszItem.mmszTitulo}` : ''}
                  </span>
                  <div>
                    <button className="mmsz-btn" onClick={() => mmszNav.mmszAbrirCurso(mmszC.mmszId)}>
                      Ver curso
                    </button>
                    <button className="mmsz-din-boton chico" onClick={() => mmszIrASiguiente(mmszNav, mmszC, mmszS)}>
                      {mmszA.mmszHechos === 0 ? 'Empezar' : mmszS ? 'Continuar' : 'Repasar'} →
                    </button>
                  </div>
                </footer>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
