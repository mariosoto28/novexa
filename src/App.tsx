// Autor: MMSZ (Mario Soto Zea)
import { useEffect, useRef, useState } from 'react';
import { mmszUseProgress } from './progress';
import { mmszGetCourse } from './content';
import MmszPanel from './screens/MmszPanel';
import MmszBienvenida from './screens/MmszBienvenida';
import MmszCourseMap from './screens/CourseMap';
import MmszLessonScreen from './screens/LessonScreen';
import MmszVisor from './screens/MmszVisor';
import type { MmszNav, MmszSeccion } from './mmszUtilidades';

type MmszPantalla =
  | { name: 'panel'; seccion: MmszSeccion }
  | { name: 'course'; courseId: string; unidad?: number }
  | { name: 'item'; courseId: string; lessonId: string; itemId: string }
  | { name: 'lesson'; courseId: string; lessonId: string };

export default function MmszApp() {
  const {
    progress: mmszProgress,
    loseHeart: mmszLoseHeart,
    completeLesson: mmszCompleteLesson,
    reset: mmszReset,
    mmszCambiarNombre,
    mmszCambiarSesion,
    mmszCambiarCursosOcultos,
    mmszCambiarTema,
    mmszReemplazar,
    mmszAviso,
    mmszCerrarAviso,
  } = mmszUseProgress();
  const [mmszPantalla, setMmszPantalla] = useState<MmszPantalla>({ name: 'panel', seccion: 'cursos' });
  // Pantallas visitadas, para el botón "Atrás".
  const [mmszHistorial, setMmszHistorial] = useState<MmszPantalla[]>([]);

  // Aplica el tema de colores elegido en Configuración.
  useEffect(() => {
    document.documentElement.dataset.tema = mmszProgress?.tema ?? 'clasico';
  }, [mmszProgress?.tema]);

  // Atajos para volver: Alt + ← y el botón "atrás" del mouse.
  useEffect(() => {
    const mmszTecla = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 'ArrowLeft') mmszAtrasRef.current();
    };
    const mmszMouse = (e: MouseEvent) => {
      if (e.button === 3) mmszAtrasRef.current();
    };
    window.addEventListener('keydown', mmszTecla);
    window.addEventListener('mouseup', mmszMouse);
    return () => {
      window.removeEventListener('keydown', mmszTecla);
      window.removeEventListener('mouseup', mmszMouse);
    };
  }, []);
  const mmszAtrasRef = useRef(() => {});

  if (!mmszProgress) return <div className="loading">Cargando…</div>;

  // Aviso flotante (por ejemplo, si se recuperó una copia de seguridad al abrir la app).
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

  const mmszIguales = (a: MmszPantalla, b: MmszPantalla) => JSON.stringify(a) === JSON.stringify(b);

  // Cada cambio de pantalla empieza desde arriba y se guarda en el historial.
  const mmszIrA = (mmszNueva: MmszPantalla) => {
    if (mmszIguales(mmszNueva, mmszPantalla)) return;
    setMmszHistorial((h) => [...h.slice(-49), mmszPantalla]);
    setMmszPantalla(mmszNueva);
    window.scrollTo({ top: 0 });
  };

  const mmszAtras = () => {
    const mmszAnterior = mmszHistorial[mmszHistorial.length - 1];
    if (!mmszAnterior) return;
    setMmszHistorial((h) => h.slice(0, -1));
    setMmszPantalla(mmszAnterior);
    window.scrollTo({ top: 0 });
  };
  mmszAtrasRef.current = mmszAtras;

  const mmszNav: MmszNav = {
    atras: mmszAtras,
    puedeAtras: mmszHistorial.length > 0,
    irInicio: (mmszSeccion = 'cursos') => mmszIrA({ name: 'panel', seccion: mmszSeccion }),
    abrirCurso: (mmszCourseId, mmszUnidad) => mmszIrA({ name: 'course', courseId: mmszCourseId, unidad: mmszUnidad }),
    abrirItem: (mmszCourseId, mmszLessonId, mmszItemId) =>
      mmszIrA({ name: 'item', courseId: mmszCourseId, lessonId: mmszLessonId, itemId: mmszItemId }),
    practicar: (mmszCourseId, mmszLessonId) => mmszIrA({ name: 'lesson', courseId: mmszCourseId, lessonId: mmszLessonId }),
    cerrarSesion: () => {
      mmszCambiarSesion(false);
      setMmszPantalla({ name: 'panel', seccion: 'cursos' });
    },
  };

  if (!mmszProgress.sesionActiva) {
    return mmszCon(
      <MmszBienvenida
        mmszNombre={mmszProgress.nombre}
        mmszEntrar={(mmszNombre) => {
          if (mmszNombre !== mmszProgress.nombre) mmszCambiarNombre(mmszNombre);
          mmszCambiarSesion(true);
        }}
      />
    );
  }

  if (mmszPantalla.name === 'course') {
    return mmszCon(
      <MmszCourseMap
        key={`${mmszPantalla.courseId}-${mmszPantalla.unidad ?? ''}`}
        mmszCourse={mmszGetCourse(mmszPantalla.courseId)}
        mmszProgress={mmszProgress}
        mmszNav={mmszNav}
        mmszUnidadElegida={mmszPantalla.unidad}
      />
    );
  }

  if (mmszPantalla.name === 'item') {
    return mmszCon(
      <MmszVisor
        mmszCourse={mmszGetCourse(mmszPantalla.courseId)}
        mmszLessonId={mmszPantalla.lessonId}
        mmszItemId={mmszPantalla.itemId}
        mmszProgress={mmszProgress}
        mmszNav={mmszNav}
        mmszCompletar={mmszCompleteLesson}
      />
    );
  }

  if (mmszPantalla.name === 'lesson') {
    const mmszCourse = mmszGetCourse(mmszPantalla.courseId);
    const mmszUnidad = mmszCourse.units.findIndex((u) => u.lessons.some((l) => l.id === mmszPantalla.lessonId));
    const mmszLesson = mmszCourse.units[mmszUnidad].lessons.find((l) => l.id === mmszPantalla.lessonId)!;
    return mmszCon(
      <MmszLessonScreen
        key={mmszLesson.id}
        mmszCourse={mmszCourse}
        mmszLesson={mmszLesson}
        mmszProgress={mmszProgress}
        mmszOnMistake={mmszLoseHeart}
        mmszOnComplete={(xp) => mmszCompleteLesson(mmszLesson.id, xp)}
        mmszOnExit={() => (mmszHistorial.length ? mmszAtras() : mmszNav.abrirCurso(mmszCourse.id, mmszUnidad))}
      />
    );
  }

  return mmszCon(
    <MmszPanel
      mmszProgreso={mmszProgress}
      mmszSeccion={mmszPantalla.seccion}
      mmszNav={mmszNav}
      mmszCambiarNombre={mmszCambiarNombre}
      mmszCambiarCursosOcultos={mmszCambiarCursosOcultos}
      mmszCambiarTema={mmszCambiarTema}
      mmszReemplazar={mmszReemplazar}
      mmszReiniciar={mmszReset}
    />
  );
}
