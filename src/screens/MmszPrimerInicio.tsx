import { useMemo, useState } from 'react';
import { mmszCourses, mmszAllLessons } from '../content';

interface MmszProps {
  mmszTerminar: (mmszNombreCompleto: string, mmszCursosOcultos: string[]) => void;
}

const MMSZ_DATOS_CURIOSOS = [
  'Python se llama así por el grupo de comedia Monty Python, no por la serpiente.',
  'JavaScript se creó en solo 10 días, en 1995.',
  'La primera programadora de la historia fue Ada Lovelace, en el siglo XIX.',
  'El primer "bug" informático fue una polilla real atrapada en una computadora en 1947.',
  'C++ se usa para crear motores de videojuegos como Unreal Engine.',
];

const MMSZ_PROXIMAMENTE = ['SQL y bases de datos', 'HTML y CSS', 'Java', 'Estructuras de datos'];

export default function MmszPrimerInicio({ mmszTerminar }: MmszProps) {
  const [mmszPaso, mmszSetPaso] = useState<1 | 2>(1);
  const [mmszNombre, mmszSetNombre] = useState('');
  const [mmszApellido, mmszSetApellido] = useState('');
  const [mmszIntento, mmszSetIntento] = useState(false);
  const [mmszElegidos, mmszSetElegidos] = useState<string[]>([]);
  const mmszDato = useMemo(() => MMSZ_DATOS_CURIOSOS[Math.floor(Math.random() * MMSZ_DATOS_CURIOSOS.length)], []);

  const mmszFaltaNombre = !mmszNombre.trim();
  const mmszFaltaApellido = !mmszApellido.trim();

  function mmszContinuar(mmszE: React.FormEvent) {
    mmszE.preventDefault();
    mmszSetIntento(true);
    if (!mmszFaltaNombre && !mmszFaltaApellido) mmszSetPaso(2);
  }

  function mmszAlternar(mmszId: string) {
    mmszSetElegidos((mmszL) => (mmszL.includes(mmszId) ? mmszL.filter((mmszX) => mmszX !== mmszId) : [...mmszL, mmszId]));
  }

  function mmszEmpezar() {
    const mmszOcultos = mmszCourses.map((mmszC) => mmszC.mmszId).filter((mmszId) => !mmszElegidos.includes(mmszId));
    mmszTerminar(`${mmszNombre.trim()} ${mmszApellido.trim()}`, mmszOcultos);
  }

  return (
    <div className="mmsz-inicio">
      <header className="mmsz-inicio-cabecera">
        Novexa
      </header>

      {mmszPaso === 1 ? (
        <main className="mmsz-inicio-paso1">
          <section className="mmsz-inicio-arte" aria-hidden>
            <div className="mmsz-arte">
              <span className="mmsz-arte-rombo" />
              <span className="mmsz-arte-chispa">✳</span>
              <div className="mmsz-arte-tarjeta">
                <div className="mmsz-ventana-puntos">
                  <i /> <i /> <i />
                </div>
                <pre>
                  <b>def</b> aprender(tú):{'\n'}
                  {'    '}
                  <b>while</b> curiosidad:{'\n'}
                  {'        '}practicar(){'\n'}
                  {'    '}
                  <b>return</b> <em>"¡programador!"</em>
                </pre>
                <div className="mmsz-arte-iconos">
                  {mmszCourses.map((mmszC) => (
                    <span key={mmszC.mmszId} style={{ borderColor: mmszC.mmszColor }}>
                      {mmszC.mmszIcon}
                    </span>
                  ))}
                </div>
              </div>
              <span className="mmsz-arte-onda" />
            </div>
            <h3>¿Sabías que…?</h3>
            <p>{mmszDato}</p>
          </section>

          <form className="mmsz-inicio-formulario" onSubmit={mmszContinuar} noValidate>
            <h1>¡Bienvenido a Novexa!</h1>
            <p className="muted">
              Aprende a programar en Python, JavaScript y C++ con lecciones cortas. Solo necesitamos saber cómo te llamas para
              configurar tu perfil.
            </p>
            <div className="mmsz-inicio-campos">
              <label className="mmsz-campo">
                <span>
                  Nombre <small className="muted">obligatorio</small>
                </span>
                <input
                  autoFocus
                  value={mmszNombre}
                  maxLength={30}
                  onChange={(mmszE) => mmszSetNombre(mmszE.target.value)}
                  aria-invalid={mmszIntento && mmszFaltaNombre}
                />
                {mmszIntento && mmszFaltaNombre && <small className="mmsz-error">Escribe tu nombre</small>}
              </label>
              <label className="mmsz-campo">
                <span>
                  Apellido <small className="muted">obligatorio</small>
                </span>
                <input
                  value={mmszApellido}
                  maxLength={30}
                  onChange={(mmszE) => mmszSetApellido(mmszE.target.value)}
                  aria-invalid={mmszIntento && mmszFaltaApellido}
                />
                {mmszIntento && mmszFaltaApellido && <small className="mmsz-error">Escribe tu apellido</small>}
              </label>
            </div>
            <button className="mmsz-btn mmsz-btn-principal">Continuar →</button>
            <small className="muted">Tu información se guarda solo en esta computadora.</small>
          </form>
        </main>
      ) : (
        <main className="mmsz-inicio-paso2">
          <div className="mmsz-dialogo">
            <h2>Personaliza Novexa</h2>
            <div className="mmsz-dialogo-banner">
              <span className="mmsz-banner-simbolos" aria-hidden>
                {'{ }  </>  ;  ( )  =>  [ ]  #'}
              </span>
              <b>¿Qué quieres aprender, {mmszNombre.trim()}?</b>
              <span>Elige uno o más cursos y armaremos tu página de inicio con ellos.</span>
            </div>

            <div className="mmsz-dialogo-cuerpo">
              <h3>Lenguajes de programación</h3>
              <div className="mmsz-opciones-cursos">
                {mmszCourses.map((mmszC) => {
                  const mmszMarcado = mmszElegidos.includes(mmszC.mmszId);
                  const mmszLecciones = mmszAllLessons(mmszC).length;
                  return (
                    <label
                      key={mmszC.mmszId}
                      className={`mmsz-opcion-curso ${mmszMarcado ? 'marcado' : ''}`}
                      style={{ ['--accent' as string]: mmszC.mmszColor }}
                    >
                      <input type="checkbox" checked={mmszMarcado} onChange={() => mmszAlternar(mmszC.mmszId)} />
                      <span className="mmsz-opcion-icono">{mmszC.mmszIcon}</span>
                      <span className="mmsz-opcion-texto">
                        <b>{mmszC.mmszName}</b>
                        <small>{mmszC.mmszTagline}</small>
                        <small className="muted">
                          {mmszC.mmszUnits.length} unidades · {mmszLecciones} lecciones · básico a avanzado
                        </small>
                      </span>
                    </label>
                  );
                })}
              </div>

              <h3>Próximamente</h3>
              <div className="mmsz-opciones-pronto">
                {MMSZ_PROXIMAMENTE.map((mmszT) => (
                  <label key={mmszT}>
                    <input type="checkbox" disabled /> {mmszT}
                  </label>
                ))}
              </div>
            </div>

            <footer className="mmsz-dialogo-pie">
              <button className="mmsz-enlace" onClick={() => mmszSetPaso(1)}>
                ← Atrás
              </button>
              <span className="muted">
                Paso 2 de 2 <i className="mmsz-puntos-paso" />
              </span>
              <button className="mmsz-btn mmsz-btn-principal" disabled={mmszElegidos.length === 0} onClick={mmszEmpezar}>
                {mmszElegidos.length === 0
                  ? 'Elige 1 curso para continuar'
                  : `Empezar con ${mmszElegidos.length} ${mmszElegidos.length === 1 ? 'curso' : 'cursos'} →`}
              </button>
            </footer>
          </div>
        </main>
      )}
    </div>
  );
}
