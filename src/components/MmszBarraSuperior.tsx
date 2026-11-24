// Autor: MMSZ (Mario Soto Zea)
// Barra superior: menú Explorar, buscador, logo y menú del usuario.
import { useEffect, useRef, useState } from 'react';
import { mmszCourses } from '../content';
import type { MmszProgress } from '../progress';
import { mmszBuscar, mmszNotificaciones, type MmszNav } from '../mmszUtilidades';

interface MmszProps {
  mmszProgreso: MmszProgress;
  mmszNav: MmszNav;
}

const MMSZ_PROXIMAMENTE = [
  'Estructuras de datos',
  'Programación orientada a objetos',
  'Bases de datos con SQL',
  'Algoritmos y complejidad',
];

export default function MmszBarraSuperior({ mmszProgreso, mmszNav }: MmszProps) {
  const [mmszMenu, setMmszMenu] = useState<'explorar' | 'usuario' | null>(null);
  const [mmszCategoria, setMmszCategoria] = useState<string | null>(null);
  const [mmszVerNotificaciones, setMmszVerNotificaciones] = useState(false);
  const [mmszBusqueda, setMmszBusqueda] = useState('');
  const [mmszBuscando, setMmszBuscando] = useState(false);
  const mmszRef = useRef<HTMLElement>(null);

  const mmszAvisos = mmszNotificaciones(mmszProgreso);
  const mmszResultados = mmszBuscar(mmszBusqueda);

  function mmszCerrarTodo() {
    setMmszMenu(null);
    setMmszCategoria(null);
    setMmszVerNotificaciones(false);
    setMmszBuscando(false);
  }

  // Cierra los menús al hacer clic fuera o al presionar Esc.
  useEffect(() => {
    const mmszClicFuera = (e: MouseEvent) => {
      if (mmszRef.current && !mmszRef.current.contains(e.target as Node)) mmszCerrarTodo();
    };
    const mmszTecla = (e: KeyboardEvent) => e.key === 'Escape' && mmszCerrarTodo();
    document.addEventListener('mousedown', mmszClicFuera);
    document.addEventListener('keydown', mmszTecla);
    return () => {
      document.removeEventListener('mousedown', mmszClicFuera);
      document.removeEventListener('keydown', mmszTecla);
    };
  }, []);

  function mmszIr(mmszAccion: () => void) {
    mmszCerrarTodo();
    setMmszBusqueda('');
    mmszAccion();
  }

  const mmszCursoElegido = mmszCourses.find((c) => c.id === mmszCategoria);

  return (
    <header className="mmsz-barra" ref={mmszRef}>
      {/* ---------- Explorar ---------- */}
      <div className="mmsz-explorar">
        <button
          className="mmsz-atras"
          disabled={!mmszNav.puedeAtras}
          onClick={() => mmszIr(mmszNav.atras)}
          title="Volver a la pantalla anterior (Alt + ←)"
        >
          ← Atrás
        </button>
        <button
          className={`mmsz-explorar-btn ${mmszMenu === 'explorar' ? 'activo' : ''}`}
          onClick={() => setMmszMenu(mmszMenu === 'explorar' ? null : 'explorar')}
        >
          Explorar <span className="mmsz-flecha">{mmszMenu === 'explorar' ? '▴' : '▾'}</span>
        </button>

        {mmszMenu === 'explorar' && (
          <div className="mmsz-menu mmsz-menu-explorar">
            <ul className="mmsz-categorias">
              {mmszCourses.map((c) => (
                <li key={c.id}>
                  <button
                    className={mmszCategoria === c.id ? 'activo' : ''}
                    onMouseEnter={() => setMmszCategoria(c.id)}
                    onClick={() => setMmszCategoria(c.id)}
                  >
                    <span>
                      {c.icon} {c.name}
                    </span>
                    <span>›</span>
                  </button>
                </li>
              ))}
              <li>
                <button
                  className={mmszCategoria === 'pronto' ? 'activo' : ''}
                  onMouseEnter={() => setMmszCategoria('pronto')}
                  onClick={() => setMmszCategoria('pronto')}
                >
                  <span>🚧 Próximamente</span>
                  <span>›</span>
                </button>
              </li>
            </ul>

            <div className="mmsz-subcursos">
              {!mmszCategoria && <p className="mmsz-pista">Selecciona una categoría para ver sus cursos.</p>}

              {mmszCursoElegido && (
                <>
                  <button className="mmsz-subtitulo" onClick={() => mmszIr(() => mmszNav.abrirCurso(mmszCursoElegido.id))}>
                    Ir a {mmszCursoElegido.name} →
                  </button>
                  {mmszCursoElegido.units.map((u, mmszUi) => (
                    <div key={u.title} className="mmsz-unidad-lista">
                      <b>
                        Unidad {mmszUi + 1} · {u.title}
                      </b>
                      {u.lessons.map((l) => (
                        <button key={l.id} onClick={() => mmszIr(() => mmszNav.abrirCurso(mmszCursoElegido.id, mmszUi))}>
                          {l.title}
                        </button>
                      ))}
                    </div>
                  ))}
                </>
              )}

              {mmszCategoria === 'pronto' && (
                <div className="mmsz-unidad-lista">
                  <b>Cursos en preparación</b>
                  {MMSZ_PROXIMAMENTE.map((t) => (
                    <span key={t} className="mmsz-pronto">
                      {t} <em>Pronto</em>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ---------- Buscar ---------- */}
      <div className="mmsz-buscar">
        <span className="mmsz-lupa" aria-hidden>
          ⌕
        </span>
        <input
          placeholder="Buscar"
          value={mmszBusqueda}
          onChange={(e) => {
            setMmszBusqueda(e.target.value);
            setMmszBuscando(true);
            setMmszMenu(null);
          }}
          onFocus={() => setMmszBuscando(true)}
        />
        {mmszBuscando && mmszBusqueda.trim() && (
          <div className="mmsz-menu mmsz-resultados">
            {mmszResultados.length === 0 && <p className="mmsz-pista">No encontré lecciones con “{mmszBusqueda}”.</p>}
            {mmszResultados.map((r, i) => (
              <button key={i} onClick={() => mmszIr(() => mmszNav.abrirCurso(r.cursoId, r.unidad))}>
                <span className="mmsz-res-icono">{r.icono}</span>
                <span>
                  <b>{r.titulo}</b>
                  <small>{r.detalle}</small>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ---------- Logo ---------- */}
      <button className="mmsz-logo" onClick={() => mmszIr(() => mmszNav.irInicio('cursos'))}>
        <span className="logo">{'</>'}</span> Novexa
      </button>

      {/* ---------- Usuario ---------- */}
      <div className="mmsz-usuario">
        <button
          className={`mmsz-usuario-btn ${mmszMenu === 'usuario' ? 'activo' : ''}`}
          onClick={() => {
            setMmszMenu(mmszMenu === 'usuario' ? null : 'usuario');
            setMmszVerNotificaciones(false);
          }}
        >
          <span
            className={`mmsz-modo-chip ${mmszProgreso.modoOffline ? 'offline' : 'online'}`}
            title={mmszProgreso.modoOffline ? 'Modo sin conexión: videos de YouTube ocultos' : 'Modo en línea: con videos de YouTube'}
          >
            {mmszProgreso.modoOffline ? '📴 Offline' : '🌐 Online'}
          </span>
          {mmszProgreso.nombre}
          {mmszAvisos.length > 0 && <span className="mmsz-punto" title={`${mmszAvisos.length} notificaciones`} />}
          <span className="mmsz-flecha">{mmszMenu === 'usuario' ? '▴' : '▾'}</span>
        </button>

        {mmszMenu === 'usuario' && (
          <div className="mmsz-menu mmsz-menu-usuario">
            {!mmszVerNotificaciones ? (
              <>
                <div className="mmsz-modo">
                  <small>Modo de conexión</small>
                  <div className="mmsz-modo-opciones" role="radiogroup" aria-label="Modo de conexión">
                    <button
                      role="radio"
                      aria-checked={!mmszProgreso.modoOffline}
                      className={!mmszProgreso.modoOffline ? 'activo' : ''}
                      onClick={() => mmszNav.cambiarModo(false)}
                    >
                      🌐 En línea
                    </button>
                    <button
                      role="radio"
                      aria-checked={mmszProgreso.modoOffline}
                      className={mmszProgreso.modoOffline ? 'activo' : ''}
                      onClick={() => mmszNav.cambiarModo(true)}
                    >
                      📴 Sin conexión
                    </button>
                  </div>
                  <small className="muted">
                    {mmszProgreso.modoOffline
                      ? 'Los videos de YouTube están ocultos. Todo lo demás funciona sin internet.'
                      : `Se muestran los videos de YouTube (necesitan internet${navigator.onLine ? '' : '; ahora no hay conexión'}).`}
                  </small>
                </div>
                <hr />
                <button className="mmsz-item fuerte" onClick={() => setMmszVerNotificaciones(true)}>
                  <span>
                    Notificaciones {mmszAvisos.length > 0 && <span className="mmsz-contador">{mmszAvisos.length}</span>}
                  </span>
                  <span>›</span>
                </button>
                <hr />
                <button className="mmsz-item" onClick={() => mmszIr(() => mmszNav.irInicio('cursos'))}>
                  Página de inicio del estudiante
                </button>
                <button className="mmsz-item" onClick={() => mmszIr(() => mmszNav.irInicio('configuracion'))}>
                  Configuración
                </button>
                <button className="mmsz-item" onClick={() => mmszIr(() => mmszNav.irInicio('ayuda'))}>
                  Ayuda
                </button>
                <button className="mmsz-item" onClick={() => mmszIr(mmszNav.cerrarSesion)}>
                  Finalizar sesión
                </button>
              </>
            ) : (
              <>
                <button className="mmsz-item fuerte" onClick={() => setMmszVerNotificaciones(false)}>
                  <span>‹ Notificaciones</span>
                </button>
                <hr />
                {mmszAvisos.length === 0 && <p className="mmsz-pista">No tienes notificaciones nuevas.</p>}
                {mmszAvisos.map((n) => (
                  <button
                    key={n.id}
                    className="mmsz-aviso"
                    disabled={!n.cursoId}
                    onClick={() => n.cursoId && mmszIr(() => mmszNav.abrirCurso(n.cursoId!, n.unidad))}
                  >
                    <span>{n.icono}</span>
                    <span>{n.texto}</span>
                  </button>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
