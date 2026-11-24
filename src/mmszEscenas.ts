// Autor: MMSZ (Mario Soto Zea)
// Convierte las lecturas de una lección en "escenas" para la lección animada:
// cada escena tiene un texto que aparece, código que se escribe solo y la narración.
import { mmszTextoHablado } from './components/MmszLectorVoz';
import type { MmszRecuerdo } from './types';

export interface MmszEscena {
  titular?: string;
  texto?: string; // texto con formato simple («código», **negrita**), viñetas con "• "
  codigo?: string;
  ejecutable?: boolean;
  narracion: string[]; // frases que dice la voz (también se muestran como subtítulos)
}

type MmszBloque =
  | { tipo: 'h' | 'p' | 'nota'; texto: string }
  | { tipo: 'lista'; items: string[] }
  | { tipo: 'codigo'; codigo: string; ejecutable: boolean };

function mmszBloques(mmszTexto: string): MmszBloque[] {
  const mmszLineas = mmszTexto.split('\n');
  const mmszSalida: MmszBloque[] = [];
  let mmszParrafo: string[] = [];
  const mmszCerrar = () => {
    if (mmszParrafo.length) mmszSalida.push({ tipo: 'p', texto: mmszParrafo.join(' ') });
    mmszParrafo = [];
  };
  for (let i = 0; i < mmszLineas.length; i++) {
    const l = mmszLineas[i];
    if (l.startsWith('~~~') || l.startsWith('```')) {
      mmszCerrar();
      const mmszCerca = l.slice(0, 3);
      const mmszEjecutable = l.slice(3).trim() === 'run';
      const mmszCodigo: string[] = [];
      for (i++; i < mmszLineas.length && !mmszLineas[i].startsWith(mmszCerca); i++) mmszCodigo.push(mmszLineas[i]);
      mmszSalida.push({ tipo: 'codigo', codigo: mmszCodigo.join('\n'), ejecutable: mmszEjecutable });
    } else if (l.startsWith('- ')) {
      mmszCerrar();
      const u = mmszSalida[mmszSalida.length - 1];
      if (u?.tipo === 'lista') u.items.push(l.slice(2));
      else mmszSalida.push({ tipo: 'lista', items: [l.slice(2)] });
    } else if (l.startsWith('### ')) {
      mmszCerrar();
      mmszSalida.push({ tipo: 'h', texto: l.slice(4) });
    } else if (l.startsWith('> ')) {
      mmszCerrar();
      mmszSalida.push({ tipo: 'nota', texto: l.slice(2) });
    } else if (!l.trim()) {
      mmszCerrar();
    } else {
      mmszParrafo.push(l.trim());
    }
  }
  mmszCerrar();
  return mmszSalida;
}

/**
 * Arma las escenas: el párrafo que explica un código se muestra junto a ese código,
 * así la voz explica mientras el código se escribe.
 */
export function mmszCrearEscenas(
  mmszTitulo: string,
  mmszIntro: string,
  mmszLecturas: string[],
  mmszRecuerdo?: MmszRecuerdo,
): MmszEscena[] {
  const mmszLista: MmszEscena[] = [];
  // Antes de empezar, se recuerda lo que se vio en la lección anterior.
  if (mmszRecuerdo) {
    mmszLista.push({
      titular: '¿Recuerdas?',
      texto: `En la lección anterior, **${mmszRecuerdo.leccion}**, aprendiste: ${mmszRecuerdo.resumen}

Hoy vamos a construir sobre eso.`,
      narracion: mmszTextoHablado(
        `¿Recuerdas lo que hiciste en la lección ${mmszRecuerdo.leccion}? ${mmszRecuerdo.resumen} Hoy vamos a construir sobre eso.`,
      ),
    });
  }
  mmszLista.push({ titular: mmszTitulo, texto: mmszIntro, narracion: mmszTextoHablado(`${mmszTitulo}. ${mmszIntro}`) });
  const mmszPrimera = mmszLista[mmszLista.length - 1];
  const mmszActual = () => mmszLista[mmszLista.length - 1];

  for (const mmszLectura of mmszLecturas) {
    for (const b of mmszBloques(mmszLectura)) {
      if (b.tipo === 'h') {
        mmszLista.push({ titular: b.texto, narracion: mmszTextoHablado(b.texto) });
      } else if (b.tipo === 'codigo') {
        const e = mmszActual();
        if (e.texto && !e.codigo && e !== mmszPrimera) {
          e.codigo = b.codigo;
          e.ejecutable = b.ejecutable;
        } else {
          mmszLista.push({ codigo: b.codigo, ejecutable: b.ejecutable, narracion: ['Observa este ejemplo de código.'] });
        }
      } else {
        const mmszTexto =
          b.tipo === 'lista' ? b.items.map((t) => `• ${t}`).join('\n') : b.tipo === 'nota' ? `💡 ${b.texto}` : b.texto;
        const mmszVoz = mmszTextoHablado(b.tipo === 'lista' ? b.items.join('.\n') : b.tipo === 'nota' ? `Nota: ${b.texto}` : b.texto);
        const e = mmszActual();
        // Un subtítulo sin texto todavía recibe el párrafo que lo sigue.
        if (e.titular && !e.texto && !e.codigo) {
          e.texto = mmszTexto;
          e.narracion.push(...mmszVoz);
        } else {
          mmszLista.push({ texto: mmszTexto, narracion: mmszVoz });
        }
      }
    }
  }

  mmszLista.push({
    titular: '¡Muy bien!',
    texto: 'Ya viste lo esencial de esta lección. Ahora ponlo en práctica con el desafío y la práctica.',
    narracion: ['¡Muy bien!', 'Ya viste lo esencial de esta lección.', 'Ahora ponlo en práctica con el desafío y la práctica.'],
  });
  return mmszLista;
}
