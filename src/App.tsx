import { useEffect, useRef, useState } from 'react';
import { mmszUseProgress } from './progress';
import { mmszCursoSegunModo, mmszGetCourse } from './content';
import MmszPanel from './screens/MmszPanel';
import MmszBienvenida from './screens/MmszBienvenida';
import MmszPrimerInicio from './screens/MmszPrimerInicio';
import MmszCursoDinamico from './screens/MmszCursoDinamico';
import MmszCourseMap from './screens/CourseMap';
import MmszLessonScreen from './screens/LessonScreen';
import MmszVisor from './screens/MmszVisor';
import MmszElegirUsuario from './screens/MmszElegirUsuario';
import { mmszUseUsuarios } from './mmszUsuarios';
import type { MmszNav, MmszSeccion } from './mmszUtilidades';

type MmszPantalla =
  | { mmszName: 'panel'; mmszSeccion: MmszSeccion }
  | { mmszName: 'course'; mmszCourseId: string; mmszUnidad?: number }
  | { mmszName: 'item'; mmszCourseId: string; mmszLessonId: string; mmszItemId: string }
  | { mmszName: 'lesson'; mmszCourseId: string; mmszLessonId: string };

export default function MmszApp() {
  const {
    mmszProgress,
    mmszLoseHeart,
    mmszCompleteLesson,
    mmszReset,
    mmszCambiarNombre,
    mmszCambiarSesion,
    mmszCambiarCursosOcultos,
    mmszCambiarTema,
    mmszReemplazar,
    mmszCompletarBienvenida,
    mmszCambiarDiseno,
    mmszCambiarModo,
    mmszAviso,
    mmszCerrarAviso,
  } = mmszUseProgress();
  const [mmszPantalla, mmszSetPantalla] = useState<MmszPantalla>({ mmszName: 'panel', mmszSeccion: 'cursos' });
  const [mmszHistorial, mmszSetHistorial] = useState<MmszPantalla[]>([]);
  const [mmszUsuarioElegido, mmszSetUsuarioElegido] = useState(false);
  const mmszUsuarios = mmszUseUsuarios(mmszProgress, mmszReemplazar);

  useEffect(() => {
    document.documentElement.dataset.tema = mmszProgress?.mmszTema ?? 'clasico';
  }, [mmszProgress?.mmszTema]);

  useEffect(() => {
    const mmszTecla = (mmszE: KeyboardEvent) => {
      if (mmszE.altKey && mmszE.key === 'ArrowLeft') mmszAtrasRef.current();
    };
    const mmszMouse = (mmszE: MouseEvent) => {
      if (mmszE.button === 3) mmszAtrasRef.current();
    };
    window.addEventListener('keydown', mmszTecla);
    window.addEventListener('mouseup', mmszMouse);
    return () => {
      window.removeEventListener('keydown', mmszTecla);
      window.removeEventListener('mouseup', mmszMouse);
    };
  }, []);
  const mmszAtrasRef = useRef(() => {});

  if (!mmszProgress || !mmszUsuarios.mmszListo) return <div className="loading">Cargando…</div>;

  const mmszCon = (mmszVista: JSX.Element) => (
    <>
      {mmszVista}
      {mmszAviso && (
        <div className="mmsz-aviso-flotante" role="status">
          <span>💾 {mmszAviso}</span>
          <button onClick={mmszCerrarAviso} title="Cerrar">✕</button>
        </div>
      )}
    </>
  );

  const mmszIguales = (mmszA: MmszPantalla, mmszB: MmszPantalla) => JSON.stringify(mmszA) === JSON.stringify(mmszB);

  const mmszIrA = (mmszNueva: MmszPantalla) => {
    if (mmszIguales(mmszNueva, mmszPantalla)) return;
    mmszSetHistorial((mmszH) => [...mmszH.slice(-49), mmszPantalla]);
    mmszSetPantalla(mmszNueva);
    window.scrollTo({ top: 0 });
  };

  const mmszAtras = () => {
    const mmszAnterior = mmszHistorial[mmszHistorial.length - 1];
    if (!mmszAnterior) return;
    mmszSetHistorial((mmszH) => mmszH.slice(0, -1));
    mmszSetPantalla(mmszAnterior);
    window.scrollTo({ top: 0 });
  };
  mmszAtrasRef.current = mmszAtras;

  const mmszCurso = (mmszId: string) => mmszCursoSegunModo(mmszGetCourse(mmszId), mmszProgress.mmszModoOffline);

  const mmszNav: MmszNav = {
    mmszAtras,
    mmszPuedeAtras: mmszHistorial.length > 0,
    mmszIrInicio: (mmszSeccion = 'cursos') => mmszIrA({ mmszName: 'panel', mmszSeccion }),
    mmszAbrirCurso: (mmszCourseId, mmszUnidad) => mmszIrA({ mmszName: 'course', mmszCourseId, mmszUnidad }),
    mmszAbrirItem: (mmszCourseId, mmszLessonId, mmszItemId) =>
      mmszIrA({ mmszName: 'item', mmszCourseId, mmszLessonId, mmszItemId }),
    mmszPracticar: (mmszCourseId, mmszLessonId) => mmszIrA({ mmszName: 'lesson', mmszCourseId, mmszLessonId }),
    mmszCambiarModo,
    mmszCerrarSesion: () => {
      mmszCambiarSesion(false);
      mmszSetUsuarioElegido(false);
      mmszSetPantalla({ mmszName: 'panel', mmszSeccion: 'cursos' });
    },
  };

  const mmszVolverAlInicio = () => {
    mmszSetUsuarioElegido(true);
    mmszSetPantalla({ mmszName: 'panel', mmszSeccion: 'cursos' });
    mmszSetHistorial([]);
  };

  if (mmszUsuarios.mmszFichas.length > 0 && (!mmszUsuarioElegido || !mmszProgress.mmszSesionActiva)) {
    return mmszCon(
      <MmszElegirUsuario
        mmszUsuarios={mmszUsuarios.mmszFichas}
        mmszElegir={(mmszId) => {
          mmszUsuarios.mmszElegir(mmszId);
          if (!mmszProgress.mmszSesionActiva) mmszCambiarSesion(true);
          mmszVolverAlInicio();
        }}
        mmszAgregar={() => {
          mmszUsuarios.mmszAgregar();
          mmszVolverAlInicio();
        }}
        mmszQuitar={mmszUsuarios.mmszQuitar}
      />,
    );
  }

  if (!mmszProgress.mmszBienvenidaCompleta) {
    return mmszCon(
      <MmszPrimerInicio
        mmszTerminar={(mmszNombre, mmszOcultos) => {
          mmszCompletarBienvenida(mmszNombre, mmszOcultos);
          mmszVolverAlInicio();
        }}
      />,
    );
  }

  if (!mmszProgress.mmszSesionActiva) {
    return mmszCon(
      <MmszBienvenida
        mmszNombre={mmszProgress.mmszNombre}
        mmszEntrar={(mmszNombre) => {
          if (mmszNombre !== mmszProgress.mmszNombre) mmszCambiarNombre(mmszNombre);
          mmszCambiarSesion(true);
        }}
      />
    );
  }

  if (mmszPantalla.mmszName === 'course' && mmszProgress.mmszDisenoDinamico) {
    return mmszCon(
      <MmszCursoDinamico
        key={`${mmszPantalla.mmszCourseId}-${mmszPantalla.mmszUnidad ?? ''}`}
        mmszCourse={mmszCurso(mmszPantalla.mmszCourseId)}
        mmszProgress={mmszProgress}
        mmszNav={mmszNav}
        mmszUnidadElegida={mmszPantalla.mmszUnidad}
      />,
    );
  }

  if (mmszPantalla.mmszName === 'course') {
    return mmszCon(
      <MmszCourseMap
        key={`${mmszPantalla.mmszCourseId}-${mmszPantalla.mmszUnidad ?? ''}`}
        mmszCourse={mmszCurso(mmszPantalla.mmszCourseId)}
        mmszProgress={mmszProgress}
        mmszNav={mmszNav}
        mmszUnidadElegida={mmszPantalla.mmszUnidad}
      />
    );
  }

  if (mmszPantalla.mmszName === 'item') {
    return mmszCon(
      <MmszVisor
        mmszCourse={mmszCurso(mmszPantalla.mmszCourseId)}
        mmszLessonId={mmszPantalla.mmszLessonId}
        mmszItemId={mmszPantalla.mmszItemId}
        mmszProgress={mmszProgress}
        mmszNav={mmszNav}
        mmszCompletar={mmszCompleteLesson}
      />
    );
  }

  if (mmszPantalla.mmszName === 'lesson') {
    const mmszCourse = mmszCurso(mmszPantalla.mmszCourseId);
    const mmszUnidad = mmszCourse.mmszUnits.findIndex((mmszU) => mmszU.mmszLessons.some((mmszL) => mmszL.mmszId === mmszPantalla.mmszLessonId));
    const mmszLesson = mmszCourse.mmszUnits[mmszUnidad].mmszLessons.find((mmszL) => mmszL.mmszId === mmszPantalla.mmszLessonId)!;
    return mmszCon(
      <MmszLessonScreen
        key={mmszLesson.mmszId}
        mmszCourse={mmszCourse}
        mmszLesson={mmszLesson}
        mmszProgress={mmszProgress}
        mmszOnMistake={mmszLoseHeart}
        mmszOnComplete={(mmszXp) => mmszCompleteLesson(mmszLesson.mmszId, mmszXp)}
        mmszOnExit={() => (mmszHistorial.length ? mmszAtras() : mmszNav.mmszAbrirCurso(mmszCourse.mmszId, mmszUnidad))}
      />
    );
  }

  return mmszCon(
    <MmszPanel
      mmszProgreso={mmszProgress}
      mmszSeccion={mmszPantalla.mmszSeccion}
      mmszNav={mmszNav}
      mmszCambiarNombre={mmszCambiarNombre}
      mmszCambiarCursosOcultos={mmszCambiarCursosOcultos}
      mmszCambiarTema={mmszCambiarTema}
      mmszReemplazar={mmszReemplazar}
      mmszCambiarDiseno={mmszCambiarDiseno}
      mmszReiniciar={mmszReset}
    />
  );
}
