import type { MmszLesson, MmszVideo } from '../types';

interface MmszFuente {
  mmszYoutubeId: string;
  mmszCanal: string;
  mmszTitulo: string;
}

const MMSZ_FUENTES = {
  pyBase: { mmszYoutubeId: 'Kp4Mvapo5kc', mmszCanal: 'MoureDev by Brais Moure', mmszTitulo: 'Curso completo de Python desde cero' },
  pyIntermedio: { mmszYoutubeId: 'TbcEqkabAWU', mmszCanal: 'MoureDev by Brais Moure', mmszTitulo: 'Curso de Python desde cero [Intermedio]' },
  js: { mmszYoutubeId: '1glVfFxj8a4', mmszCanal: 'MoureDev by Brais Moure', mmszTitulo: 'Curso completo de JavaScript desde cero' },
  cpp: { mmszYoutubeId: 'jS6wb263CIM', mmszCanal: 'Sinergia | CURSOS', mmszTitulo: 'Curso de C++ desde cero para principiantes' },
} satisfies Record<string, MmszFuente>;

type MmszClaveFuente = keyof typeof MMSZ_FUENTES;

function mmszSegundos(mmszTiempo: string): number {
  return mmszTiempo.split(':').map(Number).reduce((mmszTotal, mmszParte) => mmszTotal * 60 + mmszParte, 0);
}

type MmszFragmento = [string, MmszClaveFuente, string, string?];

const MMSZ_VIDEOS_POR_LECCION: Record<string, MmszFragmento[]> = {
  'py-1-1': [['Hola mundo en Python', 'pyBase', '25:17', '48:57']],
  'py-1-2': [['Variables', 'pyBase', '48:57', '1:34:24']],
  'py-2-1': [['Operadores', 'pyBase', '1:34:24', '2:24:03']],
  'py-2-2': [['Strings (textos)', 'pyBase', '2:24:03', '3:01:12']],
  'py-3-2': [['Condicionales', 'pyBase', '5:57:21', '6:37:02']],
  'py-4-1': [['Bucles for y while', 'pyBase', '6:37:02', '7:23:39']],
  'py-5-1': [['Listas', 'pyBase', '3:01:12', '4:05:11']],
  'py-6-1': [['Funciones', 'pyBase', '7:23:39', '8:08:47']],
  'py-7-1': [['Diccionarios', 'pyBase', '5:08:26', '5:57:21']],
  'py-7-2': [
    ['Tuplas', 'pyBase', '4:05:11', '4:32:15'],
    ['Sets (conjuntos)', 'pyBase', '4:32:15', '5:08:26'],
  ],
  'py-8-1': [
    ['Excepciones', 'pyBase', '8:53:50', '9:36:23'],
    ['Tipos de error', 'pyIntermedio', '3:32:01', '4:18:44'],
  ],
  'py-8-2': [['List comprehension', 'pyIntermedio', '53:59', '1:09:02']],
  'py-9-1': [['Clases', 'pyBase', '8:08:47', '8:53:50']],

  'js-1-1': [
    ['¿Qué es JavaScript? Contexto e historia', 'js', '2:54', '15:31'],
    ['Hola mundo en JavaScript', 'js', '39:50', '50:49'],
  ],
  'js-1-2': [
    ['Variables', 'js', '50:49', '59:59'],
    ['Tipos de datos', 'js', '59:59', '1:18:53'],
  ],
  'js-2-1': [['Operadores', 'js', '1:22:17', '1:47:38']],
  'js-2-2': [['Strings (textos)', 'js', '1:49:25', '2:00:26']],
  'js-3-2': [['Condicionales', 'js', '2:01:17', '2:24:12']],
  'js-4-1': [['Bucles', 'js', '3:12:55', '3:32:12']],
  'js-5-1': [['Arrays', 'js', '2:25:41', '2:45:52']],
  'js-6-1': [['Funciones', 'js', '3:33:49', '3:55:46']],
  'js-7-1': [['Objetos', 'js', '3:57:09', '4:21:15']],
  'js-8-2': [['Desestructuración y propagación', 'js', '4:22:27', '4:40:02']],
  'js-9-1': [
    ['Clases', 'js', '4:41:04', '4:59:59'],
    ['Herencia de clases', 'js', '4:59:59', '5:10:30'],
  ],
  'js-9-2': [['Manejo de errores', 'js', '5:12:31', '5:39:52']],

  'cpp-1-1': [['Nuestro primer programa', 'cpp', '10:16', '16:34']],
  'cpp-1-2': [
    ['Variables', 'cpp', '16:34', '31:08'],
    ['Constantes (const)', 'cpp', '31:08', '39:41'],
  ],
  'cpp-2-1': [['Operadores aritméticos', 'cpp', '57:19', '1:10:48']],
  'cpp-2-2': [['Conversión de tipos', 'cpp', '1:10:48', '1:18:37']],
  'cpp-3-1': [
    ['Instrucciones if', 'cpp', '1:40:10', '1:50:11'],
    ['Operadores lógicos', 'cpp', '2:13:39', '2:21:14'],
  ],
  'cpp-3-2': [
    ['Switch', 'cpp', '1:50:11', '1:59:03'],
    ['Operador ternario', 'cpp', '2:07:09', '2:13:39'],
  ],
  'cpp-4-1': [
    ['Bucle for', 'cpp', '2:52:31', '2:59:32'],
    ['Bucles anidados', 'cpp', '3:02:57', '3:10:53'],
  ],
  'cpp-4-2': [
    ['Bucle while', 'cpp', '2:40:06', '2:45:36'],
    ['Bucle do-while', 'cpp', '2:45:36', '2:52:31'],
  ],
  'cpp-5-1': [['Funciones', 'cpp', '3:27:50', '3:39:55']],
  'cpp-5-2': [
    ['Return', 'cpp', '3:39:55', '3:52:36'],
    ['Recursión', 'cpp', '7:47:18', '7:57:54'],
  ],
  'cpp-6-1': [
    ['Arreglos', 'cpp', '4:43:34', '4:53:26'],
    ['Recorrer un arreglo', 'cpp', '5:02:14', '5:09:49'],
  ],
  'cpp-6-2': [
    ['Arreglos multidimensionales', 'cpp', '6:02:40', '6:12:36'],
    ['Pasar un arreglo a una función', 'cpp', '5:14:53', '5:20:53'],
    ['Ordenar arreglos', 'cpp', '5:30:47', '5:43:16'],
  ],
  'cpp-7-1': [
    ['Dirección de memoria', 'cpp', '6:26:53', '6:31:15'],
    ['Punteros', 'cpp', '6:58:49', '7:05:33'],
  ],
  'cpp-7-2': [['Paso por valor vs. por referencia', 'cpp', '6:31:15', '6:38:52']],
  'cpp-9-1': [['Estructuras (struct)', 'cpp', '8:09:12', '8:17:06']],
  'cpp-9-2': [
    ['Programación orientada a objetos', 'cpp', '8:31:56', '8:44:05'],
    ['Constructores', 'cpp', '8:44:05', '8:56:10'],
    ['Herencia', 'cpp', '9:13:11'],
  ],
};

export function mmszConVideos(mmszLeccion: MmszLesson): MmszLesson {
  const mmszFragmentos = MMSZ_VIDEOS_POR_LECCION[mmszLeccion.mmszId];
  if (!mmszFragmentos) return mmszLeccion;
  const mmszVideos: MmszVideo[] = mmszFragmentos.map(([mmszTitulo, mmszClave, mmszInicio, mmszFin], mmszI) => {
    const mmszFuente = MMSZ_FUENTES[mmszClave];
    return {
      mmszTipo: 'video',
      mmszId: `${mmszLeccion.mmszId}-v${mmszI + 1}`,
      mmszTitulo: `Video: ${mmszTitulo}`,
      mmszYoutubeId: mmszFuente.mmszYoutubeId,
      mmszInicio: mmszSegundos(mmszInicio),
      mmszFin: mmszFin ? mmszSegundos(mmszFin) : undefined,
      mmszCanal: mmszFuente.mmszCanal,
      mmszDescripcion: `Fragmento del video «${mmszFuente.mmszTitulo}» de ${mmszFuente.mmszCanal}, desde el capítulo «${mmszTitulo}».`,
    };
  });
  return { ...mmszLeccion, mmszItems: [...mmszVideos, ...mmszLeccion.mmszItems] };
}
