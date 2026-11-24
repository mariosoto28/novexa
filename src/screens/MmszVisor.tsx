// Autor: MMSZ (Mario Soto Zea)
// Visor de una lección: lista de recursos a la izquierda (lecturas, desafíos, proyecto,
// práctica) y el recurso abierto a la derecha, con el botón "A continuación".
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

export const MMSZ_ICONOS: Record<MmszItem['tipo'] | 'practica', string> = {
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
const MMSZ_NOMBRES: Record<MmszItem['tipo'], string> = {
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
const MMSZ_XP: Record<MmszItem['tipo'], number> = { lectura: 2, consejo: 2, repaso: 2, desafio: 10, proyecto: 20, video: 2, animada: 3, guiado: 5, guia: 4 };

export default function MmszVisor({ mmszCourse, mmszLessonId, mmszItemId, mmszProgress, mmszNav, mmszCompletar }: MmszProps) {
  // Todas las lecciones del curso con su unidad, para moverse con < y >.
  const mmszTodas = mmszCourse.units.flatMap((u, ui) => u.lessons.map((l, li) => ({ l, u, ui, li })));
  const mmszPos = mmszTodas.findIndex((x) => x.l.id === mmszLessonId);
  const { l: mmszLesson, u: mmszUnit, ui: mmszUi, li: mmszLi } = mmszTodas[mmszPos];
  const mmszIdx = Math.max(0, mmszLesson.items.findIndex((it) => it.id === mmszItemId));
  const mmszItem = mmszLesson.items[mmszIdx];
  const mmszSiguiente = mmszLesson.items[mmszIdx + 1];
  const mmszLang = mmszCourse.id as MmszRunnableLang;
  const mmszAnimadaId = mmszLesson.items.find((it) => it.tipo === 'animada')?.id;

  // Las lecturas se marcan como vistas al abrirlas (una sola vez).
  const mmszMarcado = useRef<string | null>(null);
  useEffect(() => {
    if ((mmszItem.tipo === 'lectura' || mmszItem.tipo === 'consejo' || mmszItem.tipo === 'repaso' || mmszItem.tipo === 'video') &&
        !mmszProgress.completed[mmszItem.id] && mmszMarcado.current !== mmszItem.id) {
      mmszMarcado.current = mmszItem.id;
      mmszCompletar(mmszItem.id, MMSZ_XP[mmszItem.tipo]);
    }
    document.querySelector('.mmsz-visor-main')?.scrollTo({ top: 0 });
  }, [mmszItem, mmszProgress.completed, mmszCompletar]);

  const mmszIrLeccion = (mmszDelta: number) => {
    const mmszOtra = mmszTodas[mmszPos + mmszDelta];
    if (mmszOtra) mmszNav.abrirItem(mmszCourse.id, mmszOtra.l.id, mmszOtra.l.items[0].id);
  };

  return (
    <div className="page mmsz-visor-pagina" style={{ ['--accent' as string]: mmszCourse.color }}>
      <MmszBarraSuperior mmszProgreso={mmszProgress} mmszNav={mmszNav} />

      <div className="mmsz-visor">
        {/* ---------- Panel izquierdo ---------- */}
        <aside className="mmsz-visor-lateral">
          <div className="mmsz-visor-curso">
            <span className="mmsz-curso-icono chico">{mmszCourse.icon}</span>
            <b>{mmszCourse.name}</b>
          </div>
          <div className="mmsz-visor-leccion">
            <small>
              <button onClick={() => mmszNav.abrirCurso(mmszCourse.id)}>CURSO: {mmszCourse.name.toUpperCase()}</button>
              {' > '}UNIDAD {mmszUi + 1}
            </small>
            <div className="mmsz-visor-flechas">
              <button disabled={mmszPos === 0} onClick={() => mmszIrLeccion(-1)} title="Lección anterior">
                ‹
              </button>
              <b>
                Lección {mmszLi + 1}: {mmszLesson.title}
              </b>
              <button disabled={mmszPos === mmszTodas.length - 1} onClick={() => mmszIrLeccion(1)} title="Lección siguiente">
                ›
              </button>
            </div>
          </div>

          <nav className="mmsz-visor-items">
            {mmszLesson.items.map((it) => (
              <button
                key={it.id}
                className={it.id === mmszItem.id ? 'activo' : ''}
                onClick={() => mmszNav.abrirItem(mmszCourse.id, mmszLesson.id, it.id)}
              >
                <span className={`mmsz-recurso-icono ${mmszProgress.completed[it.id] ? 'hecho' : ''}`}>
                  {MMSZ_ICONOS[it.tipo]}
                </span>
                <span>{it.titulo}</span>
              </button>
            ))}
            <button onClick={() => mmszNav.practicar(mmszCourse.id, mmszLesson.id)}>
              <span className={`mmsz-recurso-icono ${mmszProgress.completed[mmszLesson.id] ? 'hecho' : ''}`}>
                {MMSZ_ICONOS.practica}
              </span>
              <span>
                Practica: {mmszLesson.title}
                <small className="muted"> · {mmszLesson.exercises.length} preguntas</small>
              </span>
            </button>
          </nav>

          <div className="mmsz-visor-migas">
            <button onClick={() => mmszNav.irInicio('cursos')}>Mis cursos</button> {'>'}{' '}
            <button onClick={() => mmszNav.abrirCurso(mmszCourse.id)}>{mmszCourse.name}</button> {'>'}{' '}
            <button onClick={() => mmszNav.abrirCurso(mmszCourse.id, mmszUi)}>{mmszUnit.title}</button> {'>'}{' '}
            <span>{mmszLesson.title}</span>
          </div>
        </aside>

        {/* ---------- Contenido ---------- */}
        <main className="mmsz-visor-main">
          <div className="mmsz-visor-contenido">
            <span className="tag">{MMSZ_NOMBRES[mmszItem.tipo]}</span>
            <h1>{mmszItem.titulo}</h1>
            {mmszItem.tipo === 'desafio' || mmszItem.tipo === 'proyecto' ? (
              <MmszDesafioVista
                key={mmszItem.id}
                mmszDesafio={mmszItem}
                mmszLang={mmszLang}
                mmszYaCompletado={Boolean(mmszProgress.completed[mmszItem.id])}
                mmszAlCompletar={() => {
                  if (!mmszProgress.completed[mmszItem.id]) mmszCompletar(mmszItem.id, MMSZ_XP[mmszItem.tipo]);
                }}
              />
            ) : mmszItem.tipo === 'guiado' ? (
              <MmszProgramaGuiado
                key={mmszItem.id}
                mmszGuiado={mmszItem}
                mmszLang={mmszLang}
                mmszAlTerminar={() => {
                  if (!mmszProgress.completed[mmszItem.id]) mmszCompletar(mmszItem.id, MMSZ_XP.guiado);
                }}
                mmszIrAlDesafio={
                  mmszSiguiente?.tipo === 'desafio'
                    ? () => mmszNav.abrirItem(mmszCourse.id, mmszLesson.id, mmszSiguiente.id)
                    : undefined
                }
              />
            ) : mmszItem.tipo === 'guia' ? (
              <MmszGuiaPasoAPaso
                key={mmszItem.id}
                mmszGuia={mmszItem}
                mmszLang={mmszLang}
                mmszAlTerminar={() => {
                  if (!mmszProgress.completed[mmszItem.id]) mmszCompletar(mmszItem.id, MMSZ_XP.guia);
                }}
                mmszIrAlGuiado={
                  mmszSiguiente?.tipo === 'guiado'
                    ? () => mmszNav.abrirItem(mmszCourse.id, mmszLesson.id, mmszSiguiente.id)
                    : undefined
                }
              />
            ) : mmszItem.tipo === 'animada' ? (
              <MmszLeccionAnimada
                key={mmszItem.id}
                mmszTitulo={mmszLesson.title}
                mmszIntro={mmszLesson.intro}
                mmszRecuerdo={mmszItem.recuerdo}
                mmszLecturas={mmszItem.lecturas}
                mmszLang={mmszLang}
                mmszAlTerminar={() => {
                  if (!mmszProgress.completed[mmszItem.id]) mmszCompletar(mmszItem.id, MMSZ_XP.animada);
                }}
              />
            ) : mmszItem.tipo === 'video' ? (
              <MmszVideoVista
                key={mmszItem.id}
                mmszVideo={mmszItem}
                mmszAlternativa={
                  mmszAnimadaId ? () => mmszNav.abrirItem(mmszCourse.id, mmszLesson.id, mmszAnimadaId) : undefined
                }
              />
            ) : (
              <article className="mmsz-visor-lectura">
                <MmszLectorVoz mmszTexto={(mmszItem as MmszLectura).contenido} />
                <MmszMarkdown texto={(mmszItem as MmszLectura).contenido} lang={mmszLang} />
              </article>
            )}
          </div>

          <footer className="mmsz-visor-pie">
            {mmszSiguiente ? (
              <button className="mmsz-btn mmsz-btn-fuerte" onClick={() => mmszNav.abrirItem(mmszCourse.id, mmszLesson.id, mmszSiguiente.id)}>
                A continuación: {MMSZ_NOMBRES[mmszSiguiente.tipo]} →
              </button>
            ) : (
              <button className="mmsz-btn mmsz-btn-fuerte" onClick={() => mmszNav.practicar(mmszCourse.id, mmszLesson.id)}>
                A continuación: práctica ({mmszLesson.exercises.length} preguntas) →
              </button>
            )}
          </footer>
        </main>
      </div>
    </div>
  );
}
