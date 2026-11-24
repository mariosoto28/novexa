// Autor: MMSZ (Mario Soto Zea)
// "Mis cursos" con diseño dinámico: tarjeta "Continúa donde te quedaste",
// tarjetas de curso con color, anillo de progreso y ruta de unidades.
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

/** Abre el siguiente recurso pendiente (o la práctica, o el curso si ya terminó). */
function mmszIrASiguiente(mmszNav: MmszNav, c: MmszCourse, s: MmszSiguiente | null) {
  if (!s) mmszNav.abrirCurso(c.id);
  else if (s.item) mmszNav.abrirItem(c.id, s.leccion.id, s.item.id);
  else mmszNav.practicar(c.id, s.leccion.id);
}

export default function MmszCursosDinamico({ mmszProgreso, mmszNav, mmszCambiarCursosOcultos }: MmszProps) {
  const [mmszEditando, setMmszEditando] = useState(false);
  // En modo Sin conexión, los videos de YouTube no se muestran ni cuentan para el avance.
  const mmszCourses = mmszTodosLosCursos.map((c) => mmszCursoSegunModo(c, mmszProgreso.modoOffline));
  const mmszOcultos = mmszProgreso.cursosOcultos;
  const mmszVisibles = mmszEditando ? mmszCourses : mmszCourses.filter((c) => !mmszOcultos.includes(c.id));

  // Curso para "Continúa donde te quedaste": el visible con más avance que aún no termina.
  const mmszCandidatos = mmszCourses
    .filter((c) => !mmszOcultos.includes(c.id))
    .map((c) => ({ c, a: mmszAvanceCurso(c, mmszProgreso), s: mmszSiguientePaso(c, mmszProgreso) }))
    .filter((x) => x.s);
  const mmszDestacado = [...mmszCandidatos].sort((a, b) => b.a.pct - a.a.pct)[0];

  function mmszAlternar(mmszId: string) {
    mmszCambiarCursosOcultos(
      mmszOcultos.includes(mmszId) ? mmszOcultos.filter((x) => x !== mmszId) : [...mmszOcultos, mmszId],
    );
  }

  return (
    <div className="mmsz-din">
      <div className="mmsz-titulo-fila">
        <h1>Mis cursos</h1>
        <button className="mmsz-btn" onClick={() => setMmszEditando(!mmszEditando)}>
          {mmszEditando ? 'Listo' : 'Editar cursos'}
        </button>
      </div>

      {/* ---------- Continúa donde te quedaste ---------- */}
      {mmszDestacado && !mmszEditando && (
        <section className="mmsz-din-continuar mmsz-aparecer" style={{ ['--accent' as string]: mmszDestacado.c.color }}>
          <div className="mmsz-din-continuar-icono">{mmszDestacado.c.icon}</div>
          <div className="mmsz-din-continuar-texto">
            <small>{mmszDestacado.a.hechos === 0 ? 'EMPIEZA AQUÍ' : 'CONTINÚA DONDE TE QUEDASTE'}</small>
            <h2>{mmszDestacado.s!.item?.titulo ?? `Práctica: ${mmszDestacado.s!.leccion.title}`}</h2>
            <p>
              {mmszDestacado.c.name} · Unidad {mmszDestacado.s!.unidad + 1}: {mmszDestacado.c.units[mmszDestacado.s!.unidad].title} ·
              Lección: {mmszDestacado.s!.leccion.title}
            </p>
            <button className="mmsz-din-boton" onClick={() => mmszIrASiguiente(mmszNav, mmszDestacado.c, mmszDestacado.s)}>
              {mmszDestacado.a.hechos === 0 ? 'Empezar' : 'Continuar'} →
            </button>
          </div>
          <MmszAnillo mmszPct={mmszDestacado.a.pct} mmszTam={104} mmszGrosor={10} mmszColor="#fff">
            <b>{mmszDestacado.a.pct}%</b>
            <small>del curso</small>
          </MmszAnillo>
        </section>
      )}

      {mmszEditando && <p className="muted">Marca los cursos que quieres ver en tu página de inicio.</p>}

      {/* ---------- Tarjetas de cursos ---------- */}
      <div className="mmsz-din-cursos">
        {mmszVisibles.map((c, i) => {
          const mmszA = mmszAvanceCurso(c, mmszProgreso);
          const mmszS = mmszSiguientePaso(c, mmszProgreso);
          const mmszActual = mmszS?.unidad ?? c.units.length;
          return (
            <article
              key={c.id}
              className="mmsz-din-curso mmsz-aparecer"
              style={{ ['--accent' as string]: c.color, animationDelay: `${i * 90}ms` }}
            >
              <header className="mmsz-din-curso-cabecera">
                <span className="mmsz-din-curso-icono">{c.icon}</span>
                <div>
                  <h3>{c.name}</h3>
                  <p>{c.tagline}</p>
                </div>
                {mmszEditando ? (
                  <label className="mmsz-check mmsz-din-check">
                    <input type="checkbox" checked={!mmszOcultos.includes(c.id)} onChange={() => mmszAlternar(c.id)} />
                    Mostrar
                  </label>
                ) : (
                  <MmszAnillo mmszPct={mmszA.pct} mmszTam={66} mmszColor="#fff" />
                )}
              </header>

              <div className="mmsz-din-chips">
                <span>📚 {c.units.length} unidades</span>
                <span>📝 {mmszAllLessons(c).length} lecciones</span>
                <span className={`mmsz-din-nivel nivel-${mmszNivelActual(c, mmszProgreso)}`}>
                  🎯 Nivel {mmszNivelActual(c, mmszProgreso).toLowerCase()}
                </span>
              </div>

              <ol className="mmsz-din-ruta">
                {c.units.map((u, ui) => {
                  const mmszU = mmszAvanceUnidad(u, mmszProgreso);
                  const mmszEstado = mmszU.pct === 100 ? 'hecha' : ui === mmszActual ? 'actual' : ui < mmszActual ? 'empezada' : 'pendiente';
                  return (
                    <li key={u.title} className={mmszEstado}>
                      <button onClick={() => mmszNav.abrirCurso(c.id, ui)} title={`${mmszU.pct}% completado`}>
                        <span className="mmsz-din-ruta-nodo">{mmszEstado === 'hecha' ? '✓' : ui + 1}</span>
                        <span className="mmsz-din-ruta-texto">
                          {u.title}
                          <small>{u.nivel}</small>
                        </span>
                        <span className="mmsz-din-ruta-barra">
                          <i style={{ width: `${mmszU.pct}%` }} />
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>

              {!mmszEditando && (
                <footer className="mmsz-din-curso-pie">
                  <span className="muted small">
                    {mmszA.hechos} de {mmszA.total} actividades
                    {mmszS?.item ? ` · sigue: ${MMSZ_ICONOS[mmszS.item.tipo]} ${mmszS.item.titulo}` : ''}
                  </span>
                  <div>
                    <button className="mmsz-btn" onClick={() => mmszNav.abrirCurso(c.id)}>
                      Ver curso
                    </button>
                    <button className="mmsz-din-boton chico" onClick={() => mmszIrASiguiente(mmszNav, c, mmszS)}>
                      {mmszA.hechos === 0 ? 'Empezar' : mmszS ? 'Continuar' : 'Repasar'} →
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
