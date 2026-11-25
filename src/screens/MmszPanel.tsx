import { useState } from 'react';
import { mmszCourses, mmszAllLessons } from '../content';
import { MMSZ_MAX_HEARTS, type MmszProgress } from '../progress';
import MmszBarraSuperior from '../components/MmszBarraSuperior';
import { MMSZ_TEMAS } from '../mmszTemas';
import MmszCopiasSeguridad from '../components/MmszCopiasSeguridad';
import MmszCursosDinamico from './MmszCursosDinamico';
import {
  mmszCalcularNivel,
  mmszIniciales,
  mmszLeccionesHechas,
  mmszLeccionesCompletadas,
  mmszUnidadDe,
  mmszLogros,
  mmszSiguienteLeccion,
  type MmszNav,
  type MmszSeccion,
} from '../mmszUtilidades';

interface MmszProps {
  mmszProgreso: MmszProgress;
  mmszSeccion: MmszSeccion;
  mmszNav: MmszNav;
  mmszCambiarNombre: (mmszN: string) => void;
  mmszCambiarCursosOcultos: (mmszIds: string[]) => void;
  mmszCambiarTema: (mmszTema: string) => void;
  mmszReemplazar: (mmszP: MmszProgress) => void;
  mmszCambiarDiseno: (mmszDinamico: boolean) => void;
  mmszReiniciar: () => void;
}

const MMSZ_MENU_LATERAL: { mmszGrupo: string; mmszItems: { mmszId: MmszSeccion; mmszTexto: string }[] }[] = [
  { mmszGrupo: 'Mis cosas', mmszItems: [{ mmszId: 'cursos', mmszTexto: 'Cursos' }] },
  {
    mmszGrupo: 'Mi cuenta',
    mmszItems: [
      { mmszId: 'avance', mmszTexto: 'Avance' },
      { mmszId: 'perfil', mmszTexto: 'Perfil' },
      { mmszId: 'configuracion', mmszTexto: 'Configuración' },
      { mmszId: 'ayuda', mmszTexto: 'Ayuda' },
    ],
  },
];

export default function MmszPanel(mmszProps: MmszProps) {
  const { mmszProgreso, mmszSeccion, mmszNav } = mmszProps;
  const mmszNivel = mmszCalcularNivel(mmszProgreso.mmszXp);
  const mmszTotalLecciones = mmszLeccionesCompletadas(mmszProgreso);
  const mmszLogrados = mmszLogros(mmszProgreso).filter((mmszL) => mmszL.mmszLogrado).length;

  return (
    <div className="page mmsz-pagina">
      <MmszBarraSuperior mmszProgreso={mmszProgreso} mmszNav={mmszNav} />

      <div className="mmsz-franja">
        <h2>
          {mmszProgreso.mmszStreak > 0
            ? `¡Vas ${mmszProgreso.mmszStreak} ${mmszProgreso.mmszStreak === 1 ? 'día' : 'días'} seguidos, sigue así!`
            : '¡Empieza a subir de nivel y arma tu racha diaria!'}
        </h2>
        <div className="mmsz-franja-datos">
          <span className="mmsz-racha" title="Días seguidos estudiando">
            🔥 <b>{mmszProgreso.mmszStreak}</b>
          </span>
          <span className="mmsz-separador" />
          <div className="mmsz-nivel">
            <span>
              <b>Nivel {mmszNivel.mmszNivel}</b>
            </span>
            <span className="bar">
              <span className="bar-fill" style={{ width: `${(mmszNivel.mmszXpEnNivel / mmszNivel.mmszXpMeta) * 100}%` }} />
            </span>
          </div>
          <span className="mmsz-nivel-xp">
            <b>{mmszNivel.mmszXpEnNivel}</b> / {mmszNivel.mmszXpMeta} XP
          </span>
        </div>
      </div>

      <section className="mmsz-perfil-cabecera">
        <div className="mmsz-avatar">{mmszIniciales(mmszProgreso.mmszNombre)}</div>
        <div className="mmsz-perfil-texto">
          <h1>{mmszProgreso.mmszNombre}</h1>
          <p>
            Estudiante de Novexa ·{' '}
            <button className="mmsz-enlace" onClick={() => mmszNav.mmszIrInicio('configuracion')}>
              Edita tu información
            </button>
          </p>
        </div>
        <div className="mmsz-perfil-lado">
          <button className="mmsz-btn" onClick={() => mmszNav.mmszIrInicio('perfil')}>
            Ver tu perfil
          </button>
          <div className="mmsz-insignias">
            <span title="Puntos de experiencia">⭐ {mmszProgreso.mmszXp}</span>
            <span title="Racha">🔥 {mmszProgreso.mmszStreak}</span>
            <span title="Lecciones completadas">✅ {mmszTotalLecciones}</span>
            <span title="Logros">🏅 {mmszLogrados}</span>
            <span title="Vidas">❤️ {mmszProgreso.mmszHearts}</span>
          </div>
        </div>
      </section>

      <div className="mmsz-cuerpo">
        <nav className="mmsz-lateral">
          {MMSZ_MENU_LATERAL.map((mmszG) => (
            <div key={mmszG.mmszGrupo}>
              <p className="mmsz-lateral-grupo">{mmszG.mmszGrupo}</p>
              {mmszG.mmszItems.map((mmszI) => (
                <button
                  key={mmszI.mmszId}
                  className={mmszSeccion === mmszI.mmszId ? 'activo' : ''}
                  onClick={() => mmszNav.mmszIrInicio(mmszI.mmszId)}
                >
                  {mmszI.mmszTexto}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <main className="mmsz-contenido">
          {mmszSeccion === 'cursos' &&
            (mmszProps.mmszProgreso.mmszDisenoDinamico ? (
              <MmszCursosDinamico
                mmszProgreso={mmszProps.mmszProgreso}
                mmszNav={mmszProps.mmszNav}
                mmszCambiarCursosOcultos={mmszProps.mmszCambiarCursosOcultos}
              />
            ) : (
              <MmszCursos {...mmszProps} />
            ))}
          {mmszSeccion === 'avance' && <MmszAvance {...mmszProps} />}
          {mmszSeccion === 'perfil' && <MmszPerfil {...mmszProps} />}
          {mmszSeccion === 'configuracion' && <MmszConfiguracion {...mmszProps} />}
          {mmszSeccion === 'ayuda' && <MmszAyuda />}
        </main>
      </div>
    </div>
  );
}

function MmszCursos({ mmszProgreso, mmszNav, mmszCambiarCursosOcultos }: MmszProps) {
  const [mmszEditando, mmszSetEditando] = useState(false);
  const mmszOcultos = mmszProgreso.mmszCursosOcultos;
  const mmszVisibles = mmszEditando ? mmszCourses : mmszCourses.filter((mmszC) => !mmszOcultos.includes(mmszC.mmszId));

  function mmszAlternar(mmszId: string) {
    mmszCambiarCursosOcultos(
      mmszOcultos.includes(mmszId) ? mmszOcultos.filter((mmszX) => mmszX !== mmszId) : [...mmszOcultos, mmszId],
    );
  }

  return (
    <>
      <div className="mmsz-titulo-fila">
        <h1>Mis cursos</h1>
        <button className="mmsz-btn" onClick={() => mmszSetEditando(!mmszEditando)}>
          {mmszEditando ? 'Listo' : 'Editar cursos'}
        </button>
      </div>
      {mmszEditando && <p className="muted">Marca los cursos que quieres ver en tu página de inicio.</p>}
      {!mmszEditando && mmszVisibles.length === 0 && (
        <p className="muted">No tienes cursos visibles. Usa “Editar cursos” para agregarlos.</p>
      )}

      <div className="mmsz-cursos-grid">
        {mmszVisibles.map((mmszC) => {
          const mmszTotal = mmszAllLessons(mmszC).length;
          const mmszHechas = mmszLeccionesHechas(mmszC, mmszProgreso);
          const mmszSiguiente = mmszSiguienteLeccion(mmszC, mmszProgreso);
          const mmszTextoBoton = mmszHechas === 0 ? 'Inicio' : mmszSiguiente ? 'Continuar' : 'Repasar';
          return (
            <article key={mmszC.mmszId} className="mmsz-curso" style={{ ['--accent' as string]: mmszC.mmszColor }}>
              <div className="mmsz-curso-cabecera">
                <h3>
                  {mmszC.mmszIcon} {mmszC.mmszName}
                </h3>
                {mmszEditando ? (
                  <label className="mmsz-check">
                    <input type="checkbox" checked={!mmszOcultos.includes(mmszC.mmszId)} onChange={() => mmszAlternar(mmszC.mmszId)} />
                    Mostrar
                  </label>
                ) : (
                  <button className="mmsz-enlace" onClick={() => mmszNav.mmszAbrirCurso(mmszC.mmszId)}>
                    Ver todo ({mmszTotal})
                  </button>
                )}
              </div>

              <div className="mmsz-curso-cuerpo">
                <ol className="mmsz-linea">
                  {mmszC.mmszUnits.map((mmszULocal, mmszUi) => {
                    const mmszU = mmszULocal.mmszLessons.filter((mmszL) => mmszProgreso.mmszCompleted[mmszL.mmszId]).length;
                    const mmszLista = mmszU === mmszULocal.mmszLessons.length;
                    return (
                      <li key={mmszULocal.mmszTitle} className={mmszLista ? 'hecho' : ''}>
                        <span className="mmsz-circulo">{mmszLista ? '✓' : mmszC.mmszIcon}</span>
                        <button className="mmsz-enlace" onClick={() => mmszNav.mmszAbrirCurso(mmszC.mmszId, mmszUi)}>
                          {mmszULocal.mmszTitle.replace(/^Unidad \d+ · /, '')}
                        </button>
                        <small>
                          {mmszU}/{mmszULocal.mmszLessons.length}
                        </small>
                      </li>
                    );
                  })}
                </ol>
                {!mmszEditando && (
                  <button
                    className="mmsz-btn mmsz-btn-inicio"
                    onClick={() =>
                      mmszNav.mmszAbrirCurso(mmszC.mmszId, mmszSiguiente ? mmszUnidadDe(mmszC, mmszSiguiente.mmszId) : undefined)
                    }
                  >
                    {mmszTextoBoton}
                  </button>
                )}
              </div>

              <div className="mmsz-curso-pie">
                <span className="bar">
                  <span className="bar-fill" style={{ width: `${(mmszHechas / mmszTotal) * 100}%` }} />
                </span>
                <small className="muted">
                  {mmszHechas} de {mmszTotal} lecciones
                  {mmszSiguiente && mmszHechas > 0 ? ` · Sigue: ${mmszSiguiente.mmszTitle}` : ''}
                </small>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}

function MmszAvance({ mmszProgreso, mmszNav }: MmszProps) {
  return (
    <>
      <h1>Avance</h1>
      <p className="muted">Lo que llevas completado en cada curso.</p>
      {mmszCourses.map((mmszC) => {
        const mmszTotal = mmszAllLessons(mmszC).length;
        const mmszHechas = mmszLeccionesHechas(mmszC, mmszProgreso);
        const mmszPct = Math.round((mmszHechas / mmszTotal) * 100);
        return (
          <section key={mmszC.mmszId} className="mmsz-tarjeta" style={{ ['--accent' as string]: mmszC.mmszColor }}>
            <div className="mmsz-titulo-fila">
              <h3>
                {mmszC.mmszIcon} {mmszC.mmszName}
              </h3>
              <b>{mmszPct}%</b>
            </div>
            <span className="bar">
              <span className="bar-fill" style={{ width: `${mmszPct}%` }} />
            </span>
            <div className="mmsz-avance-unidades">
              {mmszC.mmszUnits.map((mmszU, mmszUi) => (
                <div key={mmszU.mmszTitle}>
                  <b>{mmszU.mmszTitle}</b>
                  {mmszU.mmszLessons.map((mmszL) => {
                    const mmszVeces = mmszProgreso.mmszCompleted[mmszL.mmszId] || 0;
                    return (
                      <button key={mmszL.mmszId} className="mmsz-avance-leccion" onClick={() => mmszNav.mmszAbrirCurso(mmszC.mmszId, mmszUi)}>
                        <span>{mmszVeces ? '✅' : '⬜'}</span>
                        {mmszL.mmszTitle}
                        {mmszVeces > 1 && <small className="muted"> · {mmszVeces} veces</small>}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </>
  );
}

function MmszPerfil({ mmszProgreso, mmszNav }: MmszProps) {
  const mmszNivel = mmszCalcularNivel(mmszProgreso.mmszXp);
  const mmszLista = mmszLogros(mmszProgreso);
  return (
    <>
      <div className="mmsz-titulo-fila">
        <h1>Perfil</h1>
        <button className="mmsz-btn" onClick={() => mmszNav.mmszIrInicio('configuracion')}>
          Edita tu perfil
        </button>
      </div>
      <div className="mmsz-estadisticas">
        <div><b>{mmszNivel.mmszNivel}</b><span>Nivel</span></div>
        <div><b>{mmszProgreso.mmszXp}</b><span>XP total</span></div>
        <div><b>{mmszProgreso.mmszStreak}</b><span>Días de racha</span></div>
        <div><b>{mmszLeccionesCompletadas(mmszProgreso)}</b><span>Lecciones</span></div>
        <div><b>{mmszProgreso.mmszHearts}/{MMSZ_MAX_HEARTS}</b><span>Vidas</span></div>
      </div>

      <h2>Logros</h2>
      <div className="mmsz-logros">
        {mmszLista.map((mmszL) => (
          <div key={mmszL.mmszId} className={`mmsz-logro ${mmszL.mmszLogrado ? 'logrado' : ''}`}>
            <span className="mmsz-logro-icono">{mmszL.mmszIcono}</span>
            <b>{mmszL.mmszTitulo}</b>
            <small>{mmszL.mmszDescripcion}</small>
          </div>
        ))}
      </div>
    </>
  );
}

function MmszConfiguracion({
  mmszProgreso,
  mmszCambiarNombre,
  mmszCambiarTema,
  mmszReemplazar,
  mmszCambiarDiseno,
  mmszReiniciar,
}: MmszProps) {
  const [mmszNombre, mmszSetNombre] = useState(mmszProgreso.mmszNombre);
  const [mmszGuardado, mmszSetGuardado] = useState(false);
  return (
    <>
      <h1>Configuración</h1>
      <section className="mmsz-tarjeta">
        <h3>Diseño de cursos</h3>
        <p className="muted">Cambia cómo se ven “Mis cursos” y la página de cada curso. Tu progreso no cambia.</p>
        <div className="mmsz-diseno-opciones">
          {[
            { mmszId: true, mmszNombre: 'Dinámico', mmszDetalle: 'Colores, anillos de progreso, animaciones y siguiente paso recomendado.', mmszIcono: '✨' },
            { mmszId: false, mmszNombre: 'Clásico', mmszDetalle: 'Diseño simple y minimalista, con listas y tarjetas blancas.', mmszIcono: '📄' },
          ].map((mmszO) => (
            <button
              key={mmszO.mmszNombre}
              className={`mmsz-tema ${mmszProgreso.mmszDisenoDinamico === mmszO.mmszId ? 'activo' : ''}`}
              onClick={() => mmszCambiarDiseno(mmszO.mmszId)}
              aria-pressed={mmszProgreso.mmszDisenoDinamico === mmszO.mmszId}
            >
              <span className="mmsz-diseno-icono">{mmszO.mmszIcono}</span>
              <b>
                {mmszO.mmszNombre}
                {mmszProgreso.mmszDisenoDinamico === mmszO.mmszId && <span>✓</span>}
              </b>
              <small>{mmszO.mmszDetalle}</small>
            </button>
          ))}
        </div>
      </section>

      <section className="mmsz-tarjeta">
        <h3>Colores de la app</h3>
        <p className="muted">Elige el tema que más te guste. Se aplica al instante y se guarda para la próxima vez.</p>
        <div className="mmsz-temas">
          {MMSZ_TEMAS.map((mmszT) => (
            <button
              key={mmszT.mmszId}
              className={`mmsz-tema ${mmszProgreso.mmszTema === mmszT.mmszId ? 'activo' : ''}`}
              onClick={() => mmszCambiarTema(mmszT.mmszId)}
              aria-pressed={mmszProgreso.mmszTema === mmszT.mmszId}
            >
              <span className="mmsz-tema-muestra">
                {mmszT.mmszMuestra.map((mmszC) => (
                  <span key={mmszC} style={{ background: mmszC }} />
                ))}
              </span>
              <b>
                {mmszT.mmszNombre}
                {mmszProgreso.mmszTema === mmszT.mmszId && <span>✓</span>}
              </b>
              <small>{mmszT.mmszDescripcion}</small>
            </button>
          ))}
        </div>
      </section>

      <section className="mmsz-tarjeta">
        <h3>Tu información</h3>
        <label className="mmsz-campo">
          Nombre que se muestra
          <input
            value={mmszNombre}
            maxLength={40}
            onChange={(mmszE) => {
              mmszSetNombre(mmszE.target.value);
              mmszSetGuardado(false);
            }}
          />
        </label>
        <div className="mmsz-acciones">
          <button
            className="mmsz-btn"
            disabled={mmszNombre.trim() === mmszProgreso.mmszNombre}
            onClick={() => {
              mmszCambiarNombre(mmszNombre);
              mmszSetGuardado(true);
            }}
          >
            Guardar
          </button>
          {mmszGuardado && <span className="muted small">✓ Guardado</span>}
        </div>
      </section>

      <MmszCopiasSeguridad mmszProgreso={mmszProgreso} mmszReemplazar={mmszReemplazar} />

      <section className="mmsz-tarjeta">
        <h3>Progreso</h3>
        <p className="muted">
          Tu avance se guarda en esta computadora. Reiniciar borra XP, racha y lecciones completadas (tu nombre se mantiene).
        </p>
        <button
          className="mmsz-btn mmsz-btn-peligro"
          onClick={() => {
            if (confirm('¿Borrar todo tu progreso? Esto no se puede deshacer.')) mmszReiniciar();
          }}
        >
          Reiniciar progreso
        </button>
      </section>
    </>
  );
}

function MmszAyuda() {
  const mmszPreguntas = [
    ['¿Cómo funcionan las lecciones?', 'Cada lección tiene una explicación corta y varios ejercicios. Si fallas uno, vuelve a aparecer al final para que lo practiques.'],
    ['¿Qué son las vidas ❤️?', 'Tienes 5. Pierdes una con cada respuesta incorrecta y recuperas una cada 20 minutos. Probar tu código con “Ejecutar” no gasta vidas.'],
    ['¿Cómo funciona la racha 🔥?', 'Suma un día cada vez que completas al menos una lección en un día distinto. Si pasa un día entero sin practicar, vuelve a 0.'],
    ['¿Cómo subo de nivel?', 'Cada lección da 10 XP (15 si no fallas ninguna). Cada 50 XP subes un nivel.'],
    ['¿Necesito internet?', 'No. Novexa funciona sin conexión, incluso para ejecutar Python.'],
  ];
  return (
    <>
      <h1>Ayuda</h1>
      {mmszPreguntas.map(([mmszP, mmszR]) => (
        <details key={mmszP} className="mmsz-tarjeta mmsz-pregunta">
          <summary>{mmszP}</summary>
          <p>{mmszR}</p>
        </details>
      ))}
      <section className="mmsz-tarjeta">
        <h3>Atajos en el editor de código</h3>
        <ul className="mmsz-atajos">
          <li><kbd>Ctrl</kbd> + <kbd>Enter</kbd> Ejecutar tu código</li>
          <li><kbd>Tab</kbd> Agregar sangría</li>
          <li><kbd>Esc</kbd> Cerrar menús</li>
        </ul>
      </section>
    </>
  );
}
