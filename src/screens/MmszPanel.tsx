// Autor: MMSZ (Mario Soto Zea)
// Página de inicio del estudiante: perfil, nivel, racha y secciones (Cursos, Avance, Perfil, Configuración, Ayuda).
import { useState } from 'react';
import { mmszCourses, mmszAllLessons } from '../content';
import { MMSZ_MAX_HEARTS, type MmszProgress } from '../progress';
import MmszBarraSuperior from '../components/MmszBarraSuperior';
import { MMSZ_TEMAS } from '../mmszTemas';
import {
  mmszCalcularNivel,
  mmszIniciales,
  mmszLeccionesHechas,
  mmszLeccionesCompletadas,
  mmszLogros,
  mmszSiguienteLeccion,
  type MmszNav,
  type MmszSeccion,
} from '../mmszUtilidades';

interface MmszProps {
  mmszProgreso: MmszProgress;
  mmszSeccion: MmszSeccion;
  mmszNav: MmszNav;
  mmszCambiarNombre: (n: string) => void;
  mmszCambiarCursosOcultos: (mmszIds: string[]) => void;
  mmszCambiarTema: (mmszTema: string) => void;
  mmszReiniciar: () => void;
}

const MMSZ_MENU_LATERAL: { grupo: string; items: { id: MmszSeccion; texto: string }[] }[] = [
  { grupo: 'Mis cosas', items: [{ id: 'cursos', texto: 'Cursos' }] },
  {
    grupo: 'Mi cuenta',
    items: [
      { id: 'avance', texto: 'Avance' },
      { id: 'perfil', texto: 'Perfil' },
      { id: 'configuracion', texto: 'Configuración' },
      { id: 'ayuda', texto: 'Ayuda' },
    ],
  },
];

export default function MmszPanel(mmszProps: MmszProps) {
  const { mmszProgreso, mmszSeccion, mmszNav } = mmszProps;
  const mmszNivel = mmszCalcularNivel(mmszProgreso.xp);
  const mmszTotalLecciones = mmszLeccionesCompletadas(mmszProgreso);
  const mmszLogrados = mmszLogros(mmszProgreso).filter((l) => l.logrado).length;

  return (
    <div className="page mmsz-pagina">
      <MmszBarraSuperior mmszProgreso={mmszProgreso} mmszNav={mmszNav} />

      {/* Franja de racha y nivel */}
      <div className="mmsz-franja">
        <h2>
          {mmszProgreso.streak > 0
            ? `¡Vas ${mmszProgreso.streak} ${mmszProgreso.streak === 1 ? 'día' : 'días'} seguidos, sigue así!`
            : '¡Empieza a subir de nivel y arma tu racha diaria!'}
        </h2>
        <div className="mmsz-franja-datos">
          <span className="mmsz-racha" title="Días seguidos estudiando">
            🔥 <b>{mmszProgreso.streak}</b>
          </span>
          <span className="mmsz-separador" />
          <div className="mmsz-nivel">
            <span>
              <b>Nivel {mmszNivel.nivel}</b>
            </span>
            <span className="bar">
              <span className="bar-fill" style={{ width: `${(mmszNivel.xpEnNivel / mmszNivel.xpMeta) * 100}%` }} />
            </span>
          </div>
          <span className="mmsz-nivel-xp">
            <b>{mmszNivel.xpEnNivel}</b> / {mmszNivel.xpMeta} XP
          </span>
        </div>
      </div>

      {/* Cabecera del perfil */}
      <section className="mmsz-perfil-cabecera">
        <div className="mmsz-avatar">{mmszIniciales(mmszProgreso.nombre)}</div>
        <div className="mmsz-perfil-texto">
          <h1>{mmszProgreso.nombre}</h1>
          <p>
            Estudiante de Novexa ·{' '}
            <button className="mmsz-enlace" onClick={() => mmszNav.irInicio('configuracion')}>
              Edita tu información
            </button>
          </p>
        </div>
        <div className="mmsz-perfil-lado">
          <button className="mmsz-btn" onClick={() => mmszNav.irInicio('perfil')}>
            Ver tu perfil
          </button>
          <div className="mmsz-insignias">
            <span title="Puntos de experiencia">⭐ {mmszProgreso.xp}</span>
            <span title="Racha">🔥 {mmszProgreso.streak}</span>
            <span title="Lecciones completadas">✅ {mmszTotalLecciones}</span>
            <span title="Logros">🏅 {mmszLogrados}</span>
            <span title="Vidas">❤️ {mmszProgreso.hearts}</span>
          </div>
        </div>
      </section>

      <div className="mmsz-cuerpo">
        <nav className="mmsz-lateral">
          {MMSZ_MENU_LATERAL.map((g) => (
            <div key={g.grupo}>
              <p className="mmsz-lateral-grupo">{g.grupo}</p>
              {g.items.map((i) => (
                <button
                  key={i.id}
                  className={mmszSeccion === i.id ? 'activo' : ''}
                  onClick={() => mmszNav.irInicio(i.id)}
                >
                  {i.texto}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <main className="mmsz-contenido">
          {mmszSeccion === 'cursos' && <MmszCursos {...mmszProps} />}
          {mmszSeccion === 'avance' && <MmszAvance {...mmszProps} />}
          {mmszSeccion === 'perfil' && <MmszPerfil {...mmszProps} />}
          {mmszSeccion === 'configuracion' && <MmszConfiguracion {...mmszProps} />}
          {mmszSeccion === 'ayuda' && <MmszAyuda />}
        </main>
      </div>
    </div>
  );
}

/* ---------------- Mis cursos ---------------- */

function MmszCursos({ mmszProgreso, mmszNav, mmszCambiarCursosOcultos }: MmszProps) {
  const [mmszEditando, setMmszEditando] = useState(false);
  const mmszOcultos = mmszProgreso.cursosOcultos;
  const mmszVisibles = mmszEditando ? mmszCourses : mmszCourses.filter((c) => !mmszOcultos.includes(c.id));

  function mmszAlternar(mmszId: string) {
    mmszCambiarCursosOcultos(
      mmszOcultos.includes(mmszId) ? mmszOcultos.filter((x) => x !== mmszId) : [...mmszOcultos, mmszId],
    );
  }

  return (
    <>
      <div className="mmsz-titulo-fila">
        <h1>Mis cursos</h1>
        <button className="mmsz-btn" onClick={() => setMmszEditando(!mmszEditando)}>
          {mmszEditando ? 'Listo' : 'Editar cursos'}
        </button>
      </div>
      {mmszEditando && <p className="muted">Marca los cursos que quieres ver en tu página de inicio.</p>}
      {!mmszEditando && mmszVisibles.length === 0 && (
        <p className="muted">No tienes cursos visibles. Usa “Editar cursos” para agregarlos.</p>
      )}

      <div className="mmsz-cursos-grid">
        {mmszVisibles.map((c) => {
          const mmszTotal = mmszAllLessons(c).length;
          const mmszHechas = mmszLeccionesHechas(c, mmszProgreso);
          const mmszSiguiente = mmszSiguienteLeccion(c, mmszProgreso);
          const mmszTextoBoton = mmszHechas === 0 ? 'Inicio' : mmszSiguiente ? 'Continuar' : 'Repasar';
          return (
            <article key={c.id} className="mmsz-curso" style={{ ['--accent' as string]: c.color }}>
              <div className="mmsz-curso-cabecera">
                <h3>
                  {c.icon} {c.name}
                </h3>
                {mmszEditando ? (
                  <label className="mmsz-check">
                    <input type="checkbox" checked={!mmszOcultos.includes(c.id)} onChange={() => mmszAlternar(c.id)} />
                    Mostrar
                  </label>
                ) : (
                  <button className="mmsz-enlace" onClick={() => mmszNav.abrirCurso(c.id)}>
                    Ver todo ({mmszTotal})
                  </button>
                )}
              </div>

              <div className="mmsz-curso-cuerpo">
                <ol className="mmsz-linea">
                  {c.units.map((u) => {
                    const mmszU = u.lessons.filter((l) => mmszProgreso.completed[l.id]).length;
                    const mmszLista = mmszU === u.lessons.length;
                    return (
                      <li key={u.title} className={mmszLista ? 'hecho' : ''}>
                        <span className="mmsz-circulo">{mmszLista ? '✓' : c.icon}</span>
                        <button className="mmsz-enlace" onClick={() => mmszNav.abrirCurso(c.id)}>
                          {u.title.replace(/^Unidad \d+ · /, '')}
                        </button>
                        <small>
                          {mmszU}/{u.lessons.length}
                        </small>
                      </li>
                    );
                  })}
                </ol>
                {!mmszEditando && (
                  <button className="mmsz-btn mmsz-btn-inicio" onClick={() => mmszNav.abrirCurso(c.id)}>
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
                  {mmszSiguiente && mmszHechas > 0 ? ` · Sigue: ${mmszSiguiente.title}` : ''}
                </small>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}

/* ---------------- Avance ---------------- */

function MmszAvance({ mmszProgreso, mmszNav }: MmszProps) {
  return (
    <>
      <h1>Avance</h1>
      <p className="muted">Lo que llevas completado en cada curso.</p>
      {mmszCourses.map((c) => {
        const mmszTotal = mmszAllLessons(c).length;
        const mmszHechas = mmszLeccionesHechas(c, mmszProgreso);
        const mmszPct = Math.round((mmszHechas / mmszTotal) * 100);
        return (
          <section key={c.id} className="mmsz-tarjeta" style={{ ['--accent' as string]: c.color }}>
            <div className="mmsz-titulo-fila">
              <h3>
                {c.icon} {c.name}
              </h3>
              <b>{mmszPct}%</b>
            </div>
            <span className="bar">
              <span className="bar-fill" style={{ width: `${mmszPct}%` }} />
            </span>
            <div className="mmsz-avance-unidades">
              {c.units.map((u) => (
                <div key={u.title}>
                  <b>{u.title}</b>
                  {u.lessons.map((l) => {
                    const mmszVeces = mmszProgreso.completed[l.id] || 0;
                    return (
                      <button key={l.id} className="mmsz-avance-leccion" onClick={() => mmszNav.abrirCurso(c.id)}>
                        <span>{mmszVeces ? '✅' : '⬜'}</span>
                        {l.title}
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

/* ---------------- Perfil ---------------- */

function MmszPerfil({ mmszProgreso, mmszNav }: MmszProps) {
  const mmszNivel = mmszCalcularNivel(mmszProgreso.xp);
  const mmszLista = mmszLogros(mmszProgreso);
  return (
    <>
      <div className="mmsz-titulo-fila">
        <h1>Perfil</h1>
        <button className="mmsz-btn" onClick={() => mmszNav.irInicio('configuracion')}>
          Edita tu perfil
        </button>
      </div>
      <div className="mmsz-estadisticas">
        <div><b>{mmszNivel.nivel}</b><span>Nivel</span></div>
        <div><b>{mmszProgreso.xp}</b><span>XP total</span></div>
        <div><b>{mmszProgreso.streak}</b><span>Días de racha</span></div>
        <div><b>{mmszLeccionesCompletadas(mmszProgreso)}</b><span>Lecciones</span></div>
        <div><b>{mmszProgreso.hearts}/{MMSZ_MAX_HEARTS}</b><span>Vidas</span></div>
      </div>

      <h2>Logros</h2>
      <div className="mmsz-logros">
        {mmszLista.map((l) => (
          <div key={l.id} className={`mmsz-logro ${l.logrado ? 'logrado' : ''}`}>
            <span className="mmsz-logro-icono">{l.icono}</span>
            <b>{l.titulo}</b>
            <small>{l.descripcion}</small>
          </div>
        ))}
      </div>
    </>
  );
}

/* ---------------- Configuración ---------------- */

function MmszConfiguracion({ mmszProgreso, mmszCambiarNombre, mmszCambiarTema, mmszReiniciar }: MmszProps) {
  const [mmszNombre, setMmszNombre] = useState(mmszProgreso.nombre);
  const [mmszGuardado, setMmszGuardado] = useState(false);
  return (
    <>
      <h1>Configuración</h1>
      <section className="mmsz-tarjeta">
        <h3>Colores de la app</h3>
        <p className="muted">Elige el tema que más te guste. Se aplica al instante y se guarda para la próxima vez.</p>
        <div className="mmsz-temas">
          {MMSZ_TEMAS.map((t) => (
            <button
              key={t.id}
              className={`mmsz-tema ${mmszProgreso.tema === t.id ? 'activo' : ''}`}
              onClick={() => mmszCambiarTema(t.id)}
              aria-pressed={mmszProgreso.tema === t.id}
            >
              <span className="mmsz-tema-muestra">
                {t.muestra.map((c) => (
                  <span key={c} style={{ background: c }} />
                ))}
              </span>
              <b>
                {t.nombre}
                {mmszProgreso.tema === t.id && <span>✓</span>}
              </b>
              <small>{t.descripcion}</small>
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
            onChange={(e) => {
              setMmszNombre(e.target.value);
              setMmszGuardado(false);
            }}
          />
        </label>
        <div className="mmsz-acciones">
          <button
            className="mmsz-btn"
            disabled={mmszNombre.trim() === mmszProgreso.nombre}
            onClick={() => {
              mmszCambiarNombre(mmszNombre);
              setMmszGuardado(true);
            }}
          >
            Guardar
          </button>
          {mmszGuardado && <span className="muted small">✓ Guardado</span>}
        </div>
      </section>

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

/* ---------------- Ayuda ---------------- */

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
      {mmszPreguntas.map(([p, r]) => (
        <details key={p} className="mmsz-tarjeta mmsz-pregunta">
          <summary>{p}</summary>
          <p>{r}</p>
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
