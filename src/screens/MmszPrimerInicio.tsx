// Autor: MMSZ (Mario Soto Zea)
// Bienvenida del primer inicio (cuando alguien instala Novexa):
// paso 1 = nombre y apellido; paso 2 = elegir los cursos que quiere aprender.
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
  const [mmszPaso, setMmszPaso] = useState<1 | 2>(1);
  const [mmszNombre, setMmszNombre] = useState('');
  const [mmszApellido, setMmszApellido] = useState('');
  const [mmszIntento, setMmszIntento] = useState(false);
  const [mmszElegidos, setMmszElegidos] = useState<string[]>([]);
  const mmszDato = useMemo(() => MMSZ_DATOS_CURIOSOS[Math.floor(Math.random() * MMSZ_DATOS_CURIOSOS.length)], []);

  const mmszFaltaNombre = !mmszNombre.trim();
  const mmszFaltaApellido = !mmszApellido.trim();

  function mmszContinuar(e: React.FormEvent) {
    e.preventDefault();
    setMmszIntento(true);
    if (!mmszFaltaNombre && !mmszFaltaApellido) setMmszPaso(2);
  }

  function mmszAlternar(mmszId: string) {
    setMmszElegidos((l) => (l.includes(mmszId) ? l.filter((x) => x !== mmszId) : [...l, mmszId]));
  }

  function mmszEmpezar() {
    const mmszOcultos = mmszCourses.map((c) => c.id).filter((id) => !mmszElegidos.includes(id));
    mmszTerminar(`${mmszNombre.trim()} ${mmszApellido.trim()}`, mmszOcultos);
  }

  return (
    <div className="mmsz-inicio">
      <header className="mmsz-inicio-cabecera">
        <span className="logo">{'</>'}</span> Novexa
      </header>

      {mmszPaso === 1 ? (
        <main className="mmsz-inicio-paso1">
          {/* ---------- Ilustración ---------- */}
          <section className="mmsz-inicio-arte" aria-hidden>
            <div className="mmsz-arte">
              <span className="mmsz-arte-rombo" />
              <span className="mmsz-arte-chispa">✳</span>
              <div className="mmsz-arte-tarjeta">
                <div className="mmsz-arte-puntos">
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
                  {mmszCourses.map((c) => (
                    <span key={c.id} style={{ borderColor: c.color }}>
                      {c.icon}
                    </span>
                  ))}
                </div>
              </div>
              <svg className="mmsz-arte-rulo" viewBox="0 0 240 70" fill="none">
                <path
                  d="M2 60 C 30 10, 60 10, 55 40 S 30 70, 45 40 C 60 10, 95 10, 90 40 S 65 70, 80 40 C 95 10, 130 10, 125 40 S 100 70, 115 40 C 130 15, 180 8, 238 12"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <h3>¿Sabías que…?</h3>
            <p>{mmszDato}</p>
          </section>

          {/* ---------- Formulario ---------- */}
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
                  onChange={(e) => setMmszNombre(e.target.value)}
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
                  onChange={(e) => setMmszApellido(e.target.value)}
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
                {mmszCourses.map((c) => {
                  const mmszMarcado = mmszElegidos.includes(c.id);
                  const mmszLecciones = mmszAllLessons(c).length;
                  return (
                    <label
                      key={c.id}
                      className={`mmsz-opcion-curso ${mmszMarcado ? 'marcado' : ''}`}
                      style={{ ['--accent' as string]: c.color }}
                    >
                      <input type="checkbox" checked={mmszMarcado} onChange={() => mmszAlternar(c.id)} />
                      <span className="mmsz-opcion-icono">{c.icon}</span>
                      <span className="mmsz-opcion-texto">
                        <b>{c.name}</b>
                        <small>{c.tagline}</small>
                        <small className="muted">
                          {c.units.length} unidades · {mmszLecciones} lecciones · básico a avanzado
                        </small>
                      </span>
                    </label>
                  );
                })}
              </div>

              <h3>Próximamente</h3>
              <div className="mmsz-opciones-pronto">
                {MMSZ_PROXIMAMENTE.map((t) => (
                  <label key={t}>
                    <input type="checkbox" disabled /> {t}
                  </label>
                ))}
              </div>
            </div>

            <footer className="mmsz-dialogo-pie">
              <button className="mmsz-enlace" onClick={() => setMmszPaso(1)}>
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
