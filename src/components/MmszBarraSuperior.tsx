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
  const [mmszMenu, mmszSetMenu] = useState<'explorar' | 'usuario' | null>(null);
  const [mmszCategoria, mmszSetCategoria] = useState<string | null>(null);
  const [mmszVerNotificaciones, mmszSetVerNotificaciones] = useState(false);
  const [mmszBusqueda, mmszSetBusqueda] = useState('');
  const [mmszBuscando, mmszSetBuscando] = useState(false);
  const mmszRef = useRef<HTMLElement>(null);

  const mmszAvisos = mmszNotificaciones(mmszProgreso);
  const mmszResultados = mmszBuscar(mmszBusqueda);

  function mmszCerrarTodo() {
    mmszSetMenu(null);
    mmszSetCategoria(null);
    mmszSetVerNotificaciones(false);
    mmszSetBuscando(false);
  }

  useEffect(() => {
    const mmszClicFuera = (mmszE: MouseEvent) => {
      if (mmszRef.current && !mmszRef.current.contains(mmszE.target as Node)) mmszCerrarTodo();
    };
    const mmszTecla = (mmszE: KeyboardEvent) => mmszE.key === 'Escape' && mmszCerrarTodo();
    document.addEventListener('mousedown', mmszClicFuera);
    document.addEventListener('keydown', mmszTecla);
    return () => {
      document.removeEventListener('mousedown', mmszClicFuera);
      document.removeEventListener('keydown', mmszTecla);
    };
  }, []);

  function mmszIr(mmszAccion: () => void) {
    mmszCerrarTodo();
    mmszSetBusqueda('');
    mmszAccion();
  }

  const mmszCursoElegido = mmszCourses.find((mmszC) => mmszC.mmszId === mmszCategoria);

  return (
    <header className="mmsz-barra" ref={mmszRef}>
      <div className="mmsz-explorar">
        <button
          className="mmsz-atras"
          disabled={!mmszNav.mmszPuedeAtras}
          onClick={() => mmszIr(mmszNav.mmszAtras)}
          title="Volver a la pantalla anterior (Alt + ←)"
        >
          ← Atrás
        </button>
        <button
          className={`mmsz-explorar-btn ${mmszMenu === 'explorar' ? 'activo' : ''}`}
          onClick={() => mmszSetMenu(mmszMenu === 'explorar' ? null : 'explorar')}
        >
          Explorar <span className="mmsz-flecha">{mmszMenu === 'explorar' ? '▴' : '▾'}</span>
        </button>

        {mmszMenu === 'explorar' && (
          <div className="mmsz-menu mmsz-menu-explorar">
            <ul className="mmsz-categorias">
              {mmszCourses.map((mmszC) => (
                <li key={mmszC.mmszId}>
                  <button
                    className={mmszCategoria === mmszC.mmszId ? 'activo' : ''}
                    onMouseEnter={() => mmszSetCategoria(mmszC.mmszId)}
                    onClick={() => mmszSetCategoria(mmszC.mmszId)}
                  >
                    <span>
                      {mmszC.mmszIcon} {mmszC.mmszName}
                    </span>
                    <span>›</span>
                  </button>
                </li>
              ))}
              <li>
                <button
                  className={mmszCategoria === 'pronto' ? 'activo' : ''}
                  onMouseEnter={() => mmszSetCategoria('pronto')}
                  onClick={() => mmszSetCategoria('pronto')}
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
                  <button className="mmsz-subtitulo" onClick={() => mmszIr(() => mmszNav.mmszAbrirCurso(mmszCursoElegido.mmszId))}>
                    Ir a {mmszCursoElegido.mmszName} →
                  </button>
                  {mmszCursoElegido.mmszUnits.map((mmszU, mmszUi) => (
                    <div key={mmszU.mmszTitle} className="mmsz-unidad-lista">
                      <b>
                        Unidad {mmszUi + 1} · {mmszU.mmszTitle}
                      </b>
                      {mmszU.mmszLessons.map((mmszL) => (
                        <button key={mmszL.mmszId} onClick={() => mmszIr(() => mmszNav.mmszAbrirCurso(mmszCursoElegido.mmszId, mmszUi))}>
                          {mmszL.mmszTitle}
                        </button>
                      ))}
                    </div>
                  ))}
                </>
              )}

              {mmszCategoria === 'pronto' && (
                <div className="mmsz-unidad-lista">
                  <b>Cursos en preparación</b>
                  {MMSZ_PROXIMAMENTE.map((mmszT) => (
                    <span key={mmszT} className="mmsz-pronto">
                      {mmszT} <em>Pronto</em>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mmsz-buscar">
        <span className="mmsz-lupa" aria-hidden>
          ⌕
        </span>
        <input
          placeholder="Buscar"
          value={mmszBusqueda}
          onChange={(mmszE) => {
            mmszSetBusqueda(mmszE.target.value);
            mmszSetBuscando(true);
            mmszSetMenu(null);
          }}
          onFocus={() => mmszSetBuscando(true)}
        />
        {mmszBuscando && mmszBusqueda.trim() && (
          <div className="mmsz-menu mmsz-resultados">
            {mmszResultados.length === 0 && <p className="mmsz-pista">No encontré lecciones con “{mmszBusqueda}”.</p>}
            {mmszResultados.map((mmszR, mmszI) => (
              <button key={mmszI} onClick={() => mmszIr(() => mmszNav.mmszAbrirCurso(mmszR.mmszCursoId, mmszR.mmszUnidad))}>
                <span className="mmsz-res-icono">{mmszR.mmszIcono}</span>
                <span>
                  <b>{mmszR.mmszTitulo}</b>
                  <small>{mmszR.mmszDetalle}</small>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <button className="mmsz-marca" onClick={() => mmszIr(() => mmszNav.mmszIrInicio('cursos'))}>
        Novexa
      </button>

      <div className="mmsz-usuario">
        <button
          className={`mmsz-usuario-btn ${mmszMenu === 'usuario' ? 'activo' : ''}`}
          onClick={() => {
            mmszSetMenu(mmszMenu === 'usuario' ? null : 'usuario');
            mmszSetVerNotificaciones(false);
          }}
        >
          <span
            className={`mmsz-modo-chip ${mmszProgreso.mmszModoOffline ? 'offline' : 'online'}`}
            title={mmszProgreso.mmszModoOffline ? 'Modo sin conexión: videos de YouTube ocultos' : 'Modo en línea: con videos de YouTube'}
          >
            {mmszProgreso.mmszModoOffline ? '📴 Offline' : '🌐 Online'}
          </span>
          {mmszProgreso.mmszNombre}
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
                      aria-checked={!mmszProgreso.mmszModoOffline}
                      className={!mmszProgreso.mmszModoOffline ? 'activo' : ''}
                      onClick={() => mmszNav.mmszCambiarModo(false)}
                    >
                      🌐 En línea
                    </button>
                    <button
                      role="radio"
                      aria-checked={mmszProgreso.mmszModoOffline}
                      className={mmszProgreso.mmszModoOffline ? 'activo' : ''}
                      onClick={() => mmszNav.mmszCambiarModo(true)}
                    >
                      📴 Sin conexión
                    </button>
                  </div>
                  <small className="muted">
                    {mmszProgreso.mmszModoOffline
                      ? 'Los videos de YouTube están ocultos. Todo lo demás funciona sin internet.'
                      : `Se muestran los videos de YouTube (necesitan internet${navigator.onLine ? '' : '; ahora no hay conexión'}).`}
                  </small>
                </div>
                <hr />
                <button className="mmsz-item fuerte" onClick={() => mmszSetVerNotificaciones(true)}>
                  <span>
                    Notificaciones {mmszAvisos.length > 0 && <span className="mmsz-contador">{mmszAvisos.length}</span>}
                  </span>
                  <span>›</span>
                </button>
                <hr />
                <button className="mmsz-item" onClick={() => mmszIr(() => mmszNav.mmszIrInicio('cursos'))}>
                  Página de inicio del estudiante
                </button>
                <button className="mmsz-item" onClick={() => mmszIr(() => mmszNav.mmszIrInicio('configuracion'))}>
                  Configuración
                </button>
                <button className="mmsz-item" onClick={() => mmszIr(() => mmszNav.mmszIrInicio('ayuda'))}>
                  Ayuda
                </button>
                <button className="mmsz-item" onClick={() => mmszIr(mmszNav.mmszCerrarSesion)}>
                  Finalizar sesión
                </button>
              </>
            ) : (
              <>
                <button className="mmsz-item fuerte" onClick={() => mmszSetVerNotificaciones(false)}>
                  <span>‹ Notificaciones</span>
                </button>
                <hr />
                {mmszAvisos.length === 0 && <p className="mmsz-pista">No tienes notificaciones nuevas.</p>}
                {mmszAvisos.map((mmszN) => (
                  <button
                    key={mmszN.mmszId}
                    className="mmsz-aviso"
                    disabled={!mmszN.mmszCursoId}
                    onClick={() => mmszN.mmszCursoId && mmszIr(() => mmszNav.mmszAbrirCurso(mmszN.mmszCursoId!, mmszN.mmszUnidad))}
                  >
                    <span>{mmszN.mmszIcono}</span>
                    <span>{mmszN.mmszTexto}</span>
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
