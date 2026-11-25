import { useEffect, useRef } from 'react';
import type { MmszCourse, MmszItem, MmszLectura } from '../types';
import type { MmszProgress } from '../progress';
import type { MmszRunnableLang } from '../runner';
import type { MmszNav } from '../mmszUtilidades';
import MmszBarraSuperior from '../components/MmszBarraSuperior';
import MmszMarkdown from '../components/MmszMarkdown';
import MmszDesafioVista from '../components/MmszDesafioVista';
import MmszVideoVista from '../components/MmszVideoVista';
import MmszLectorVoz from '../components/MmszLectorVoz';
import MmszLeccionAnimada from '../components/MmszLeccionAnimada';
import MmszProgramaGuiado from '../components/MmszProgramaGuiado';
import MmszGuiaPasoAPaso from '../components/MmszGuiaPasoAPaso';

interface MmszProps {
  mmszCourse: MmszCourse;
  mmszLessonId: string;
  mmszItemId: string;
  mmszProgress: MmszProgress;
  mmszNav: MmszNav;
  mmszCompletar: (mmszId: string, mmszXp: number) => void;
}

export const MMSZ_ICONOS: Record<MmszItem['mmszTipo'] | 'practica', string> = {
  lectura: '≡',
  consejo: '✦',
  repaso: '↺',
  desafio: '★',
  proyecto: '⚑',
  practica: '✎',
  video: '▶',
  animada: '✺',
  guiado: '⚙',
  guia: '⏯',
};
const MMSZ_NOMBRES: Record<MmszItem['mmszTipo'], string> = {
  lectura: 'lectura',
  consejo: 'consejo rápido',
  repaso: 'repaso',
  desafio: 'desafío',
  proyecto: 'proyecto',
  video: 'video',
  animada: 'lección animada',
  guiado: 'programa guiado',
  guia: 'guía paso a paso',
};
const MMSZ_XP: Record<MmszItem['mmszTipo'], number> = { lectura: 2, consejo: 2, repaso: 2, desafio: 10, proyecto: 20, video: 2, animada: 3, guiado: 5, guia: 4 };

export default function MmszVisor({ mmszCourse, mmszLessonId, mmszItemId, mmszProgress, mmszNav, mmszCompletar }: MmszProps) {
  const mmszTodas = mmszCourse.mmszUnits.flatMap((mmszU, mmszUi) => mmszU.mmszLessons.map((mmszL, mmszLi) => ({ mmszL, mmszU, mmszUi, mmszLi })));
  const mmszPos = mmszTodas.findIndex((mmszX) => mmszX.mmszL.mmszId === mmszLessonId);
  const { mmszL: mmszLesson, mmszU: mmszUnit, mmszUi, mmszLi } = mmszTodas[mmszPos];
  const mmszIdx = Math.max(0, mmszLesson.mmszItems.findIndex((mmszIt) => mmszIt.mmszId === mmszItemId));
  const mmszItem = mmszLesson.mmszItems[mmszIdx];
  const mmszSiguiente = mmszLesson.mmszItems[mmszIdx + 1];
  const mmszLang = mmszCourse.mmszId as MmszRunnableLang;
  const mmszAnimadaId = mmszLesson.mmszItems.find((mmszIt) => mmszIt.mmszTipo === 'animada')?.mmszId;

  const mmszMarcado = useRef<string | null>(null);
  useEffect(() => {
    if ((mmszItem.mmszTipo === 'lectura' || mmszItem.mmszTipo === 'consejo' || mmszItem.mmszTipo === 'repaso' || mmszItem.mmszTipo === 'video') &&
        !mmszProgress.mmszCompleted[mmszItem.mmszId] && mmszMarcado.current !== mmszItem.mmszId) {
      mmszMarcado.current = mmszItem.mmszId;
      mmszCompletar(mmszItem.mmszId, MMSZ_XP[mmszItem.mmszTipo]);
    }
    document.querySelector('.mmsz-visor-main')?.scrollTo({ top: 0 });
  }, [mmszItem, mmszProgress.mmszCompleted, mmszCompletar]);

  const mmszIrLeccion = (mmszDelta: number) => {
    const mmszOtra = mmszTodas[mmszPos + mmszDelta];
    if (mmszOtra) mmszNav.mmszAbrirItem(mmszCourse.mmszId, mmszOtra.mmszL.mmszId, mmszOtra.mmszL.mmszItems[0].mmszId);
  };

  return (
    <div className="page mmsz-visor-pagina" style={{ ['--accent' as string]: mmszCourse.mmszColor }}>
      <MmszBarraSuperior mmszProgreso={mmszProgress} mmszNav={mmszNav} />

      <div className="mmsz-visor">
        <aside className="mmsz-visor-lateral">
          <div className="mmsz-visor-curso">
            <span className="mmsz-curso-icono chico">{mmszCourse.mmszIcon}</span>
            <b>{mmszCourse.mmszName}</b>
          </div>
          <div className="mmsz-visor-leccion">
            <small>
              <button onClick={() => mmszNav.mmszAbrirCurso(mmszCourse.mmszId)}>CURSO: {mmszCourse.mmszName.toUpperCase()}</button>
              {' > '}UNIDAD {mmszUi + 1}
            </small>
            <div className="mmsz-visor-flechas">
              <button disabled={mmszPos === 0} onClick={() => mmszIrLeccion(-1)} title="Lección anterior">
                ‹
              </button>
              <b>
                Lección {mmszLi + 1}: {mmszLesson.mmszTitle}
              </b>
              <button disabled={mmszPos === mmszTodas.length - 1} onClick={() => mmszIrLeccion(1)} title="Lección siguiente">
                ›
              </button>
            </div>
          </div>

          <nav className="mmsz-visor-items">
            {mmszLesson.mmszItems.map((mmszIt) => (
              <button
                key={mmszIt.mmszId}
                className={mmszIt.mmszId === mmszItem.mmszId ? 'activo' : ''}
                onClick={() => mmszNav.mmszAbrirItem(mmszCourse.mmszId, mmszLesson.mmszId, mmszIt.mmszId)}
              >
                <span className={`mmsz-recurso-icono ${mmszProgress.mmszCompleted[mmszIt.mmszId] ? 'hecho' : ''}`}>
                  {MMSZ_ICONOS[mmszIt.mmszTipo]}
                </span>
                <span>{mmszIt.mmszTitulo}</span>
              </button>
            ))}
            <button onClick={() => mmszNav.mmszPracticar(mmszCourse.mmszId, mmszLesson.mmszId)}>
              <span className={`mmsz-recurso-icono ${mmszProgress.mmszCompleted[mmszLesson.mmszId] ? 'hecho' : ''}`}>
                {MMSZ_ICONOS.practica}
              </span>
              <span>
                Practica: {mmszLesson.mmszTitle}
                <small className="muted"> · {mmszLesson.mmszExercises.length} preguntas</small>
              </span>
            </button>
          </nav>

          <div className="mmsz-visor-migas">
            <button onClick={() => mmszNav.mmszIrInicio('cursos')}>Mis cursos</button> {'>'}{' '}
            <button onClick={() => mmszNav.mmszAbrirCurso(mmszCourse.mmszId)}>{mmszCourse.mmszName}</button> {'>'}{' '}
            <button onClick={() => mmszNav.mmszAbrirCurso(mmszCourse.mmszId, mmszUi)}>{mmszUnit.mmszTitle}</button> {'>'}{' '}
            <span>{mmszLesson.mmszTitle}</span>
          </div>
        </aside>

        <main className="mmsz-visor-main">
          <div className="mmsz-visor-contenido">
            <span className="tag">{MMSZ_NOMBRES[mmszItem.mmszTipo]}</span>
            <h1>{mmszItem.mmszTitulo}</h1>
            {mmszItem.mmszTipo === 'desafio' || mmszItem.mmszTipo === 'proyecto' ? (
              <MmszDesafioVista
                key={mmszItem.mmszId}
                mmszDesafio={mmszItem}
                mmszLang={mmszLang}
                mmszYaCompletado={Boolean(mmszProgress.mmszCompleted[mmszItem.mmszId])}
                mmszAlCompletar={() => {
                  if (!mmszProgress.mmszCompleted[mmszItem.mmszId]) mmszCompletar(mmszItem.mmszId, MMSZ_XP[mmszItem.mmszTipo]);
                }}
              />
            ) : mmszItem.mmszTipo === 'guiado' ? (
              <MmszProgramaGuiado
                key={mmszItem.mmszId}
                mmszGuiado={mmszItem}
                mmszLang={mmszLang}
                mmszAlTerminar={() => {
                  if (!mmszProgress.mmszCompleted[mmszItem.mmszId]) mmszCompletar(mmszItem.mmszId, MMSZ_XP.guiado);
                }}
                mmszIrAlDesafio={
                  mmszSiguiente?.mmszTipo === 'desafio'
                    ? () => mmszNav.mmszAbrirItem(mmszCourse.mmszId, mmszLesson.mmszId, mmszSiguiente.mmszId)
                    : undefined
                }
              />
            ) : mmszItem.mmszTipo === 'guia' ? (
              <MmszGuiaPasoAPaso
                key={mmszItem.mmszId}
                mmszGuia={mmszItem}
                mmszLang={mmszLang}
                mmszAlTerminar={() => {
                  if (!mmszProgress.mmszCompleted[mmszItem.mmszId]) mmszCompletar(mmszItem.mmszId, MMSZ_XP.guia);
                }}
                mmszIrAlGuiado={
                  mmszSiguiente?.mmszTipo === 'guiado'
                    ? () => mmszNav.mmszAbrirItem(mmszCourse.mmszId, mmszLesson.mmszId, mmszSiguiente.mmszId)
                    : undefined
                }
              />
            ) : mmszItem.mmszTipo === 'animada' ? (
              <MmszLeccionAnimada
                key={mmszItem.mmszId}
                mmszTitulo={mmszLesson.mmszTitle}
                mmszIntro={mmszLesson.mmszIntro}
                mmszRecuerdo={mmszItem.mmszRecuerdo}
                mmszLecturas={mmszItem.mmszLecturas}
                mmszLang={mmszLang}
                mmszAlTerminar={() => {
                  if (!mmszProgress.mmszCompleted[mmszItem.mmszId]) mmszCompletar(mmszItem.mmszId, MMSZ_XP.animada);
                }}
              />
            ) : mmszItem.mmszTipo === 'video' ? (
              <MmszVideoVista
                key={mmszItem.mmszId}
                mmszVideo={mmszItem}
                mmszAlternativa={
                  mmszAnimadaId ? () => mmszNav.mmszAbrirItem(mmszCourse.mmszId, mmszLesson.mmszId, mmszAnimadaId) : undefined
                }
              />
            ) : (
              <article className="mmsz-visor-lectura">
                <MmszLectorVoz mmszTexto={(mmszItem as MmszLectura).mmszContenido} />
                <MmszMarkdown mmszTexto={(mmszItem as MmszLectura).mmszContenido} mmszLang={mmszLang} />
              </article>
            )}
          </div>

          <footer className="mmsz-visor-pie">
            {mmszSiguiente ? (
              <button className="mmsz-btn mmsz-btn-fuerte" onClick={() => mmszNav.mmszAbrirItem(mmszCourse.mmszId, mmszLesson.mmszId, mmszSiguiente.mmszId)}>
                A continuación: {MMSZ_NOMBRES[mmszSiguiente.mmszTipo]} →
              </button>
            ) : (
              <button className="mmsz-btn mmsz-btn-fuerte" onClick={() => mmszNav.mmszPracticar(mmszCourse.mmszId, mmszLesson.mmszId)}>
                A continuación: práctica ({mmszLesson.mmszExercises.length} preguntas) →
              </button>
            )}
          </footer>
        </main>
      </div>
    </div>
  );
}
