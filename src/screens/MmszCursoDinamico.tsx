// Autor: MMSZ (Mario Soto Zea)
// Página de un curso con diseño dinámico: portada con color y progreso,
// ruta de unidades por nivel y lecciones como tarjetas con su avance.
import { useState } from 'react';
import type { MmszCourse } from '../types';
import type { MmszProgress } from '../progress';
import type { MmszNav } from '../mmszUtilidades';
import MmszBarraSuperior from '../components/MmszBarraSuperior';
import MmszAnillo, { MmszNumero } from '../components/MmszAnillo';
import { MMSZ_ICONOS } from './MmszVisor';
import {
  MMSZ_COLOR_TIPO,
  mmszAvanceCurso,
  mmszAvanceLeccion,
  mmszAvancePorNivel,
  mmszAvanceUnidad,
  mmszSiguientePaso,
} from '../mmszEstadisticas';
import '../mmszDinamico.css';

interface MmszProps {
  mmszCourse: MmszCourse;
  mmszProgress: MmszProgress;
  mmszNav: MmszNav;
  mmszUnidadElegida?: number;
}

export default function MmszCursoDinamico({ mmszCourse: c, mmszProgress: p, mmszNav, mmszUnidadElegida }: MmszProps) {
  const [mmszUnidad] = useState(() => mmszUnidadElegida ?? mmszSiguientePaso(c, p)?.unidad ?? 0);
  const mmszUnit = c.units[mmszUnidad];
  const mmszCurso = mmszAvanceCurso(c, p);
  const mmszAvU = mmszAvanceUnidad(mmszUnit, p);
  const mmszSig = mmszSiguientePaso(c, p, mmszUnidad);
  const mmszSigEnUnidad = mmszSig && mmszSig.unidad === mmszUnidad ? mmszSig : null;
  const mmszPracticadas = c.units.flatMap((u) => u.lessons).filter((l) => p.completed[l.id]).length;
  const mmszTotalLecciones = c.units.reduce((s, u) => s + u.lessons.length, 0);
  const mmszNoHearts = p.hearts <= 0;

  const mmszElegir = (i: number) => i !== mmszUnidad && mmszNav.abrirCurso(c.id, i);

  return (
    <div className="page mmsz-din" style={{ ['--accent' as string]: c.color }}>
      <MmszBarraSuperior mmszProgreso={p} mmszNav={mmszNav} />

      {/* ---------- Portada del curso ---------- */}
      <section className="mmsz-din-portada">
        <span className="mmsz-din-portada-fondo" aria-hidden>
          {c.icon}
        </span>
        <div className="mmsz-din-portada-contenido">
          <nav className="mmsz-din-migas">
            <button onClick={() => mmszNav.irInicio('cursos')}>⌂ Mis cursos</button> <span>›</span> <b>{c.name}</b>
          </nav>
          <div className="mmsz-din-portada-fila">
            <span className="mmsz-din-portada-icono">{c.icon}</span>
            <div className="mmsz-din-portada-texto">
              <h1>{c.name}</h1>
              <p>{c.tagline}</p>
              <div className="mmsz-din-niveles">
                {mmszAvancePorNivel(c, p).map(({ nivel, avance }) => (
                  <span key={nivel} className={avance.pct === 100 ? 'completo' : ''}>
                    <b>{nivel}</b>
                    <i>
                      <em style={{ width: `${avance.pct}%` }} />
                    </i>
                    <small>{avance.pct}%</small>
                  </span>
                ))}
              </div>
            </div>
            <div className="mmsz-din-portada-stats">
              <MmszAnillo mmszPct={mmszCurso.pct} mmszTam={112} mmszGrosor={11} mmszColor="#fff">
                <b>{mmszCurso.pct}%</b>
                <small>completado</small>
              </MmszAnillo>
              <div>
                <span>
                  <b>
                    <MmszNumero mmszValor={mmszPracticadas} />
                  </b>
                  /{mmszTotalLecciones} lecciones practicadas
                </span>
                <span>
                  <b>
                    <MmszNumero mmszValor={mmszCurso.hechos} />
                  </b>
                  /{mmszCurso.total} actividades
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mmsz-din-curso-cuerpo">
        {/* ---------- Ruta de unidades ---------- */}
        <aside className="mmsz-din-mapa">
          <h3>Ruta del curso</h3>
          {c.units.map((u, i) => {
            const a = mmszAvanceUnidad(u, p);
            const mmszNuevoNivel = i === 0 || c.units[i - 1].nivel !== u.nivel;
            return (
              <div key={u.title}>
                {mmszNuevoNivel && <p className={`mmsz-din-mapa-nivel nivel-${u.nivel}`}>{u.nivel}</p>}
                <button
                  className={`mmsz-din-mapa-unidad ${i === mmszUnidad ? 'activa' : ''} ${a.pct === 100 ? 'hecha' : ''}`}
                  onClick={() => mmszElegir(i)}
                >
                  <MmszAnillo mmszPct={a.pct} mmszTam={42} mmszGrosor={4}>
                    {a.pct === 100 ? '✓' : i + 1}
                  </MmszAnillo>
                  <span>
                    <b>{u.title}</b>
                    <small>
                      {u.lessons.length} lecciones · {a.pct}%
                    </small>
                  </span>
                </button>
              </div>
            );
          })}
        </aside>

        {/* ---------- Unidad elegida ---------- */}
        <main className="mmsz-din-unidad" key={mmszUnidad}>
          <header className="mmsz-din-unidad-cabecera mmsz-aparecer">
            <div>
              <small className={`mmsz-nivel-chip nivel-${mmszUnit.nivel}`}>{mmszUnit.nivel}</small>
              <h2>
                Unidad {mmszUnidad + 1}: {mmszUnit.title}
              </h2>
              <p>{mmszUnit.description}</p>
            </div>
            <MmszAnillo mmszPct={mmszAvU.pct} mmszTam={78} mmszGrosor={8} />
          </header>

          {mmszNoHearts && <div className="notice">Te quedaste sin vidas ❤️ para las prácticas. Se recupera una cada 20 minutos.</div>}

          {mmszAvU.pct === 100 ? (
            <div className="mmsz-din-celebra mmsz-aparecer">
              <span className="mmsz-din-confeti" aria-hidden>
                {['🎉', '✨', '🎊', '⭐', '🎉', '✨', '🎊', '⭐'].map((e, i) => (
                  <i key={i} style={{ left: `${8 + i * 12}%`, animationDelay: `${i * 0.15}s` }}>
                    {e}
                  </i>
                ))}
              </span>
              <b>¡Unidad completada!</b>
              <span>Dominaste «{mmszUnit.title}». ¿Seguimos con la siguiente?</span>
              {mmszUnidad < c.units.length - 1 && (
                <button className="mmsz-din-boton" onClick={() => mmszElegir(mmszUnidad + 1)}>
                  Ir a la unidad {mmszUnidad + 2} →
                </button>
              )}
            </div>
          ) : (
            mmszSigEnUnidad && (
              <button
                className="mmsz-din-siguiente mmsz-aparecer"
                onClick={() =>
                  mmszSigEnUnidad.item
                    ? mmszNav.abrirItem(c.id, mmszSigEnUnidad.leccion.id, mmszSigEnUnidad.item.id)
                    : mmszNav.practicar(c.id, mmszSigEnUnidad.leccion.id)
                }
              >
                <span
                  className="mmsz-din-siguiente-icono"
                  style={{ background: MMSZ_COLOR_TIPO[mmszSigEnUnidad.item?.tipo ?? 'practica'] }}
                >
                  {mmszSigEnUnidad.item ? MMSZ_ICONOS[mmszSigEnUnidad.item.tipo] : MMSZ_ICONOS.practica}
                </span>
                <span>
                  <small>SIGUIENTE PASO RECOMENDADO</small>
                  <b>{mmszSigEnUnidad.item?.titulo ?? `Practica: ${mmszSigEnUnidad.leccion.title}`}</b>
                </span>
                <span className="mmsz-din-siguiente-flecha">▶</span>
              </button>
            )
          )}

          {mmszUnit.lessons.map((l, li) => {
            const a = mmszAvanceLeccion(l, p);
            const mmszPracticada = Boolean(p.completed[l.id]);
            return (
              <section
                key={l.id}
                className={`mmsz-din-leccion mmsz-aparecer ${a.pct === 100 ? 'hecha' : ''}`}
                style={{ animationDelay: `${120 + li * 110}ms` }}
              >
                <header>
                  <span className="mmsz-din-leccion-num">{a.pct === 100 ? '✓' : li + 1}</span>
                  <div>
                    <h3>{l.title}</h3>
                    <p>{l.intro}</p>
                  </div>
                  <span className="mmsz-din-leccion-pct">{a.pct}%</span>
                </header>
                <div className="mmsz-din-barra">
                  <i style={{ width: `${a.pct}%` }} />
                </div>

                <div className="mmsz-din-items">
                  {l.items.map((it, k) => {
                    const mmszHecho = Boolean(p.completed[it.id]);
                    return (
                      <button
                        key={it.id}
                        className={`mmsz-din-item ${mmszHecho ? 'hecho' : ''}`}
                        style={{ ['--tipo' as string]: MMSZ_COLOR_TIPO[it.tipo], animationDelay: `${200 + li * 110 + k * 40}ms` }}
                        onClick={() => mmszNav.abrirItem(c.id, l.id, it.id)}
                      >
                        <span className="mmsz-din-item-icono">{mmszHecho ? '✓' : MMSZ_ICONOS[it.tipo]}</span>
                        <span className="mmsz-din-item-texto">{it.titulo}</span>
                      </button>
                    );
                  })}
                  <button
                    className={`mmsz-din-item practica ${mmszPracticada ? 'hecho' : ''}`}
                    style={{ ['--tipo' as string]: MMSZ_COLOR_TIPO.practica }}
                    disabled={mmszNoHearts}
                    onClick={() => mmszNav.practicar(c.id, l.id)}
                  >
                    <span className="mmsz-din-item-icono">{mmszPracticada ? '✓' : MMSZ_ICONOS.practica}</span>
                    <span className="mmsz-din-item-texto">
                      {mmszPracticada ? 'Repasar práctica' : 'Practica'} · {l.exercises.length} preguntas
                    </span>
                  </button>
                </div>
              </section>
            );
          })}

          <div className="mmsz-navegacion-unidades">
            {mmszUnidad > 0 ? (
              <button className="mmsz-btn" onClick={() => mmszElegir(mmszUnidad - 1)}>
                ← Unidad {mmszUnidad}
              </button>
            ) : (
              <span />
            )}
            {mmszUnidad < c.units.length - 1 && (
              <button className="mmsz-btn" onClick={() => mmszElegir(mmszUnidad + 1)}>
                Unidad {mmszUnidad + 2} →
              </button>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
