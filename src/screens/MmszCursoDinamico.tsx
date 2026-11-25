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

export default function MmszCursoDinamico({ mmszCourse: mmszC, mmszProgress: mmszP, mmszNav, mmszUnidadElegida }: MmszProps) {
  const [mmszUnidad] = useState(() => mmszUnidadElegida ?? mmszSiguientePaso(mmszC, mmszP)?.mmszUnidad ?? 0);
  const mmszUnit = mmszC.mmszUnits[mmszUnidad];
  const mmszCurso = mmszAvanceCurso(mmszC, mmszP);
  const mmszAvU = mmszAvanceUnidad(mmszUnit, mmszP);
  const mmszSig = mmszSiguientePaso(mmszC, mmszP, mmszUnidad);
  const mmszSigEnUnidad = mmszSig && mmszSig.mmszUnidad === mmszUnidad ? mmszSig : null;
  const mmszPracticadas = mmszC.mmszUnits.flatMap((mmszU) => mmszU.mmszLessons).filter((mmszL) => mmszP.mmszCompleted[mmszL.mmszId]).length;
  const mmszTotalLecciones = mmszC.mmszUnits.reduce((mmszS, mmszU) => mmszS + mmszU.mmszLessons.length, 0);
  const mmszNoHearts = mmszP.mmszHearts <= 0;

  const mmszElegir = (mmszI: number) => mmszI !== mmszUnidad && mmszNav.mmszAbrirCurso(mmszC.mmszId, mmszI);

  return (
    <div className="page mmsz-din" style={{ ['--accent' as string]: mmszC.mmszColor }}>
      <MmszBarraSuperior mmszProgreso={mmszP} mmszNav={mmszNav} />

      <section className="mmsz-din-portada">
        <span className="mmsz-din-portada-fondo" aria-hidden>
          {mmszC.mmszIcon}
        </span>
        <div className="mmsz-din-portada-contenido">
          <nav className="mmsz-din-migas">
            <button onClick={() => mmszNav.mmszIrInicio('cursos')}>⌂ Mis cursos</button> <span>›</span> <b>{mmszC.mmszName}</b>
          </nav>
          <div className="mmsz-din-portada-fila">
            <span className="mmsz-din-portada-icono">{mmszC.mmszIcon}</span>
            <div className="mmsz-din-portada-texto">
              <h1>{mmszC.mmszName}</h1>
              <p>{mmszC.mmszTagline}</p>
              <div className="mmsz-din-niveles">
                {mmszAvancePorNivel(mmszC, mmszP).map(({ mmszNivel, mmszAvance }) => (
                  <span key={mmszNivel} className={mmszAvance.mmszPct === 100 ? 'completo' : ''}>
                    <b>{mmszNivel}</b>
                    <i>
                      <em style={{ width: `${mmszAvance.mmszPct}%` }} />
                    </i>
                    <small>{mmszAvance.mmszPct}%</small>
                  </span>
                ))}
              </div>
            </div>
            <div className="mmsz-din-portada-stats">
              <MmszAnillo mmszPct={mmszCurso.mmszPct} mmszTam={112} mmszGrosor={11} mmszColor="#fff">
                <b>{mmszCurso.mmszPct}%</b>
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
                    <MmszNumero mmszValor={mmszCurso.mmszHechos} />
                  </b>
                  /{mmszCurso.mmszTotal} actividades
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mmsz-din-curso-cuerpo">
        <aside className="mmsz-din-mapa">
          <h3>Ruta del curso</h3>
          {mmszC.mmszUnits.map((mmszU, mmszI) => {
            const mmszA = mmszAvanceUnidad(mmszU, mmszP);
            const mmszNuevoNivel = mmszI === 0 || mmszC.mmszUnits[mmszI - 1].mmszNivel !== mmszU.mmszNivel;
            return (
              <div key={mmszU.mmszTitle}>
                {mmszNuevoNivel && <p className={`mmsz-din-mapa-nivel nivel-${mmszU.mmszNivel}`}>{mmszU.mmszNivel}</p>}
                <button
                  className={`mmsz-din-mapa-unidad ${mmszI === mmszUnidad ? 'activa' : ''} ${mmszA.mmszPct === 100 ? 'hecha' : ''}`}
                  onClick={() => mmszElegir(mmszI)}
                >
                  <MmszAnillo mmszPct={mmszA.mmszPct} mmszTam={42} mmszGrosor={4}>
                    {mmszA.mmszPct === 100 ? '✓' : mmszI + 1}
                  </MmszAnillo>
                  <span>
                    <b>{mmszU.mmszTitle}</b>
                    <small>
                      {mmszU.mmszLessons.length} lecciones · {mmszA.mmszPct}%
                    </small>
                  </span>
                </button>
              </div>
            );
          })}
        </aside>

        <main className="mmsz-din-unidad" key={mmszUnidad}>
          <header className="mmsz-din-unidad-cabecera mmsz-aparecer">
            <div>
              <small className={`mmsz-nivel-chip nivel-${mmszUnit.mmszNivel}`}>{mmszUnit.mmszNivel}</small>
              <h2>
                Unidad {mmszUnidad + 1}: {mmszUnit.mmszTitle}
              </h2>
              <p>{mmszUnit.mmszDescription}</p>
            </div>
            <MmszAnillo mmszPct={mmszAvU.mmszPct} mmszTam={78} mmszGrosor={8} />
          </header>

          {mmszNoHearts && <div className="notice">Te quedaste sin vidas ❤️ para las prácticas. Se recupera una cada 20 minutos.</div>}

          {mmszAvU.mmszPct === 100 ? (
            <div className="mmsz-din-celebra mmsz-aparecer">
              <span className="mmsz-din-confeti" aria-hidden>
                {['🎉', '✨', '🎊', '⭐', '🎉', '✨', '🎊', '⭐'].map((mmszE, mmszI) => (
                  <i key={mmszI} style={{ left: `${8 + mmszI * 12}%`, animationDelay: `${mmszI * 0.15}s` }}>
                    {mmszE}
                  </i>
                ))}
              </span>
              <b>¡Unidad completada!</b>
              <span>Dominaste «{mmszUnit.mmszTitle}». ¿Seguimos con la siguiente?</span>
              {mmszUnidad < mmszC.mmszUnits.length - 1 && (
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
                  mmszSigEnUnidad.mmszItem
                    ? mmszNav.mmszAbrirItem(mmszC.mmszId, mmszSigEnUnidad.mmszLeccion.mmszId, mmszSigEnUnidad.mmszItem.mmszId)
                    : mmszNav.mmszPracticar(mmszC.mmszId, mmszSigEnUnidad.mmszLeccion.mmszId)
                }
              >
                <span
                  className="mmsz-din-siguiente-icono"
                  style={{ background: MMSZ_COLOR_TIPO[mmszSigEnUnidad.mmszItem?.mmszTipo ?? 'practica'] }}
                >
                  {mmszSigEnUnidad.mmszItem ? MMSZ_ICONOS[mmszSigEnUnidad.mmszItem.mmszTipo] : MMSZ_ICONOS.practica}
                </span>
                <span>
                  <small>SIGUIENTE PASO RECOMENDADO</small>
                  <b>{mmszSigEnUnidad.mmszItem?.mmszTitulo ?? `Practica: ${mmszSigEnUnidad.mmszLeccion.mmszTitle}`}</b>
                </span>
                <span className="mmsz-din-siguiente-flecha">▶</span>
              </button>
            )
          )}

          {mmszUnit.mmszLessons.map((mmszL, mmszLi) => {
            const mmszA = mmszAvanceLeccion(mmszL, mmszP);
            const mmszPracticada = Boolean(mmszP.mmszCompleted[mmszL.mmszId]);
            return (
              <section
                key={mmszL.mmszId}
                className={`mmsz-din-leccion mmsz-aparecer ${mmszA.mmszPct === 100 ? 'hecha' : ''}`}
                style={{ animationDelay: `${120 + mmszLi * 110}ms` }}
              >
                <header>
                  <span className="mmsz-din-leccion-num">{mmszA.mmszPct === 100 ? '✓' : mmszLi + 1}</span>
                  <div>
                    <h3>{mmszL.mmszTitle}</h3>
                    <p>{mmszL.mmszIntro}</p>
                  </div>
                  <span className="mmsz-din-leccion-pct">{mmszA.mmszPct}%</span>
                </header>
                <div className="mmsz-din-barra">
                  <i style={{ width: `${mmszA.mmszPct}%` }} />
                </div>

                <div className="mmsz-din-items">
                  {mmszL.mmszItems.map((mmszIt, mmszK) => {
                    const mmszHecho = Boolean(mmszP.mmszCompleted[mmszIt.mmszId]);
                    return (
                      <button
                        key={mmszIt.mmszId}
                        className={`mmsz-din-item ${mmszHecho ? 'hecho' : ''}`}
                        style={{ ['--tipo' as string]: MMSZ_COLOR_TIPO[mmszIt.mmszTipo], animationDelay: `${200 + mmszLi * 110 + mmszK * 40}ms` }}
                        onClick={() => mmszNav.mmszAbrirItem(mmszC.mmszId, mmszL.mmszId, mmszIt.mmszId)}
                      >
                        <span className="mmsz-din-item-icono">{mmszHecho ? '✓' : MMSZ_ICONOS[mmszIt.mmszTipo]}</span>
                        <span className="mmsz-din-item-texto">{mmszIt.mmszTitulo}</span>
                      </button>
                    );
                  })}
                  <button
                    className={`mmsz-din-item practica ${mmszPracticada ? 'hecho' : ''}`}
                    style={{ ['--tipo' as string]: MMSZ_COLOR_TIPO.practica }}
                    disabled={mmszNoHearts}
                    onClick={() => mmszNav.mmszPracticar(mmszC.mmszId, mmszL.mmszId)}
                  >
                    <span className="mmsz-din-item-icono">{mmszPracticada ? '✓' : MMSZ_ICONOS.practica}</span>
                    <span className="mmsz-din-item-texto">
                      {mmszPracticada ? 'Repasar práctica' : 'Practica'} · {mmszL.mmszExercises.length} preguntas
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
            {mmszUnidad < mmszC.mmszUnits.length - 1 && (
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
