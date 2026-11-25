import type { MmszRunnableLang } from './runner';

const mmszQuitarPuntoYComa = (mmszS: string) => mmszS.replace(/;\s*$/, '');
const mmszCorto = (mmszS: string, mmszN = 60) => (mmszS.length > mmszN ? mmszS.slice(0, mmszN - 1) + '…' : mmszS);

function mmszArgumentos(mmszS: string): string {
  const mmszI = mmszS.indexOf('(');
  if (mmszI < 0) return '';
  let mmszP = 0;
  for (let mmszJ = mmszI; mmszJ < mmszS.length; mmszJ++) {
    if (mmszS[mmszJ] === '(') mmszP++;
    else if (mmszS[mmszJ] === ')' && --mmszP === 0) return mmszS.slice(mmszI + 1, mmszJ).trim();
  }
  return mmszS.slice(mmszI + 1).trim();
}

function mmszQueMuestra(mmszArgs: string): string {
  if (!mmszArgs) return 'una línea vacía';
  if (/^f["']/.test(mmszArgs)) return `un texto con valores de variables dentro de { } (f-string): ${mmszCorto(mmszArgs)}`;
  if (/^`/.test(mmszArgs) && mmszArgs.includes('${')) return `un texto con valores de variables dentro de \${ } (template literal): ${mmszCorto(mmszArgs)}`;
  if (/^["'`][^"'`]*["'`]$/.test(mmszArgs)) return `el texto ${mmszArgs} tal cual`;
  if (/^[A-Za-z_]\w*$/.test(mmszArgs)) return `el valor guardado en la variable «${mmszArgs}»`;
  return `el resultado de ${mmszCorto(mmszArgs)}`;
}

function mmszExplicarPython(mmszL: string): string {
  let mmszM: RegExpMatchArray | null;
  if (mmszL.startsWith('#')) return 'Es un comentario: Python lo ignora; sirve para explicar el código.';
  if ((mmszM = mmszL.match(/^def (\w+)\((.*)\):$/))) return `Define la función «${mmszM[1]}»${mmszM[2] ? ` que recibe: ${mmszM[2]}` : ' (no recibe datos)'}. Su código es el bloque con sangría de abajo.`;
  if ((mmszM = mmszL.match(/^class (\w+)(?:\((\w+)\))?:$/))) return `Define la clase «${mmszM[1]}»${mmszM[2] ? `, que hereda de «${mmszM[2]}»` : ''}: un molde para crear objetos.`;
  if ((mmszM = mmszL.match(/^return\s*(.*)$/))) return mmszM[1] ? `Termina la función y devuelve el resultado de ${mmszCorto(mmszM[1])}.` : 'Termina la función.';
  if ((mmszM = mmszL.match(/^for (\w+(?:, *\w+)*) in range\((.*)\):$/))) {
    const mmszA = mmszM[2].split(',').map((mmszX) => mmszX.trim());
    const mmszDesc = mmszA.length === 1 ? `desde 0 hasta ${mmszA[0]} - 1` : `desde ${mmszA[0]} hasta ${mmszA[1]} - 1${mmszA[2] ? `, de ${mmszA[2]} en ${mmszA[2]}` : ''}`;
    return `Bucle: repite el bloque de abajo; en cada vuelta «${mmszM[1]}» toma un número ${mmszDesc}.`;
  }
  if ((mmszM = mmszL.match(/^for (.+) in (.+):$/))) return `Bucle: recorre ${mmszCorto(mmszM[2])}; en cada vuelta «${mmszM[1]}» toma el siguiente elemento.`;
  if ((mmszM = mmszL.match(/^while (.+):$/))) return mmszM[1] === 'True' ? 'Bucle infinito: repite hasta que un break lo detenga.' : `Bucle: repite el bloque mientras ${mmszM[1]} sea verdadero.`;
  if ((mmszM = mmszL.match(/^if (.+):$/))) return `Condición: el bloque de abajo solo se ejecuta si ${mmszM[1]} es verdadero.`;
  if ((mmszM = mmszL.match(/^elif (.+):$/))) return `Si lo anterior fue falso, revisa otra condición: ${mmszM[1]}.`;
  if (mmszL === 'else:') return 'Si ninguna condición anterior se cumplió, se ejecuta este bloque.';
  if (mmszL === 'try:') return 'Intenta ejecutar el bloque de abajo; si ocurre un error, salta al except.';
  if ((mmszM = mmszL.match(/^except\s*(\w*).*:$/))) return `Si ocurre un error${mmszM[1] ? ` de tipo ${mmszM[1]}` : ''}, se ejecuta este bloque en lugar de detener el programa.`;
  if (mmszL === 'finally:') return 'Este bloque se ejecuta siempre, haya error o no.';
  if (mmszL === 'break') return 'Sale del bucle inmediatamente.';
  if (mmszL === 'continue') return 'Salta a la siguiente vuelta del bucle.';
  if (mmszL === 'pass') return 'No hace nada (se usa cuando Python exige un bloque).';
  if (/^print\(/.test(mmszL)) return `Muestra en pantalla ${mmszQueMuestra(mmszArgumentos(mmszL))}.`;
  if (/^[}\])],?$/.test(mmszL)) return 'Cierra la lista, diccionario o paréntesis que se abrió arriba.';
  if ((mmszM = mmszL.match(/^(["']?[\w ]+["']?):\s*(.+?),?$/))) return `Elemento del diccionario: la clave ${mmszM[1]} tiene el valor ${mmszCorto(mmszM[2])}.`;
  if ((mmszM = mmszL.match(/^self\.(\w+)\s*=\s*(.+)$/))) return `Guarda ${mmszCorto(mmszM[2])} en el atributo «${mmszM[1]}» del objeto (self es el propio objeto).`;
  if ((mmszM = mmszL.match(/^(\w+)\[(.+)\]\s*=\s*(.+)$/))) return `Guarda ${mmszCorto(mmszM[3])} en «${mmszM[1]}» en la posición o clave ${mmszM[2]}.`;
  if ((mmszM = mmszL.match(/^([\w.[\]]+)\s*([+\-*/])=\s*(.+)$/))) {
    const mmszFrase = {
      '+': `Suma ${mmszM[3]} a «${mmszM[1]}»`,
      '-': `Resta ${mmszM[3]} a «${mmszM[1]}»`,
      '*': `Multiplica «${mmszM[1]}» por ${mmszM[3]}`,
      '/': `Divide «${mmszM[1]}» entre ${mmszM[3]}`,
    }[mmszM[2]];
    return `${mmszFrase} y guarda el resultado en la misma variable.`;
  }
  if ((mmszM = mmszL.match(/^([\w, ]+?)\s*=\s*(.+)$/)) && !mmszL.includes('==')) {
    const mmszNombre = mmszM[1].trim();
    if (mmszNombre.includes(',')) return `Guarda varios valores a la vez: ${mmszNombre} reciben ${mmszCorto(mmszM[2])}.`;
    if (new RegExp(`\\b${mmszNombre}\\b`).test(mmszM[2])) return `Actualiza «${mmszNombre}»: calcula ${mmszCorto(mmszM[2])} y guarda el resultado de nuevo en «${mmszNombre}».`;
    if (/^\[.*\]$/.test(mmszM[2])) return `Crea la lista «${mmszNombre}» con los valores ${mmszCorto(mmszM[2])}.`;
    if (/^\{.*\}$/.test(mmszM[2])) return `Crea «${mmszNombre}» con ${mmszCorto(mmszM[2])} (diccionario o conjunto).`;
    if (/^["']/.test(mmszM[2])) return `Crea la variable «${mmszNombre}» y guarda en ella el texto ${mmszCorto(mmszM[2])}.`;
    if (/^-?\d+(\.\d+)?$/.test(mmszM[2])) return `Crea la variable «${mmszNombre}» y guarda en ella el número ${mmszM[2]}.`;
    return `Calcula ${mmszCorto(mmszM[2])} y guarda el resultado en la variable «${mmszNombre}».`;
  }
  if ((mmszM = mmszL.match(/^(\w+)\.append\((.*)\)$/))) return `Agrega ${mmszM[2]} al final de la lista «${mmszM[1]}».`;
  if ((mmszM = mmszL.match(/^(\w+)\.remove\((.*)\)$/))) return `Quita ${mmszM[2]} de la lista «${mmszM[1]}».`;
  if ((mmszM = mmszL.match(/^([\w.]+)\((.*)\)$/))) return `Llama (ejecuta) a «${mmszM[1]}»${mmszM[2] ? ` con los datos: ${mmszCorto(mmszM[2])}` : ''}.`;
  return `Instrucción: ${mmszCorto(mmszL)}.`;
}

function mmszExplicarJs(mmszL: string): string {
  let mmszM: RegExpMatchArray | null;
  const mmszS = mmszQuitarPuntoYComa(mmszL);
  if (mmszS.startsWith('//')) return 'Es un comentario: JavaScript lo ignora.';
  if (/^}\s*(else|catch|finally)?/.test(mmszS) && mmszS.length <= 2) return 'Cierra el bloque abierto con {.';
  if ((mmszM = mmszS.match(/^}\s*else if \((.+)\)\s*{$/))) return `Si lo anterior fue falso, revisa otra condición: ${mmszM[1]}.`;
  if (/^}\s*else\s*{$/.test(mmszS)) return 'Si la condición fue falsa, se ejecuta este otro bloque.';
  if ((mmszM = mmszS.match(/^}\s*catch\s*\((\w+)\)\s*{$/))) return `Si ocurrió un error, se ejecuta este bloque; el error queda en «${mmszM[1]}».`;
  if (/^}\s*finally\s*{$/.test(mmszS)) return 'Este bloque se ejecuta siempre, haya error o no.';
  if ((mmszM = mmszS.match(/^function (\w+)\((.*)\)\s*{$/))) return `Define la función «${mmszM[1]}»${mmszM[2] ? ` que recibe: ${mmszM[2]}` : ''}. Su código va entre las llaves.`;
  if ((mmszM = mmszS.match(/^(?:const|let) (\w+) = \((.*)\) =>\s*(.+)$/))) return `Crea la función flecha «${mmszM[1]}» que recibe (${mmszM[2]}) y devuelve ${mmszCorto(mmszM[3])}.`;
  if ((mmszM = mmszS.match(/^class (\w+)(?: extends (\w+))?\s*{$/))) return `Define la clase «${mmszM[1]}»${mmszM[2] ? `, que hereda de «${mmszM[2]}»` : ''}.`;
  if ((mmszM = mmszS.match(/^constructor\((.*)\)\s*{$/))) return `Constructor: se ejecuta al crear el objeto con new${mmszM[1] ? `, y recibe ${mmszM[1]}` : ''}.`;
  if ((mmszM = mmszS.match(/^return\s*(.*)$/))) return mmszM[1] ? `Termina la función y devuelve ${mmszCorto(mmszM[1])}.` : 'Termina la función.';
  if ((mmszM = mmszS.match(/^for \((let|const) (\w+) = (.+?); (.+?); (.+?)\)\s*{$/))) return `Bucle for: «${mmszM[2]}» empieza en ${mmszM[3]}, se repite mientras ${mmszM[4]} y en cada vuelta hace ${mmszM[5]}.`;
  if ((mmszM = mmszS.match(/^for \((?:const|let) (\w+) of ([^)]+)\)\s*(.*)$/)))
    return `Recorre ${mmszM[2]}; en cada vuelta «${mmszM[1]}» toma el siguiente elemento${mmszM[3] && mmszM[3] !== '{' ? ` y hace ${mmszCorto(mmszM[3])}` : ''}.`;
  if ((mmszM = mmszS.match(/^(let|var) (\w+)$/))) return `Crea la variable «${mmszM[2]}» todavía sin valor (se le dará uno más abajo).`;
  if ((mmszM = mmszS.match(/^switch \((.+)\)\s*{$/))) return `Compara «${mmszM[1]}» con cada case de abajo.`;
  if ((mmszM = mmszS.match(/^case (.+):$/))) return `Si el valor es ${mmszM[1]}, se ejecuta desde aquí hasta el break.`;
  if (mmszS === 'default:') return 'Si ningún case coincidió, se ejecuta desde aquí.';
  if (mmszS === 'break') return 'Sale del switch o del bucle.';
  if (/\.forEach\(/.test(mmszS)) return `Repite la función de abajo para cada elemento de ${mmszCorto(mmszS.split('.forEach(')[0])}.`;
  if ((mmszM = mmszS.match(/^(\w+)\((.*)\)\s*{$/))) return `Define el método «${mmszM[1]}»${mmszM[2] ? ` que recibe: ${mmszM[2]}` : ''} (una función que pertenece al objeto o clase).`;
  if ((mmszM = mmszS.match(/^\{(.+)\},?$/))) return `Un elemento del arreglo: un objeto con ${mmszCorto(mmszM[1].trim())}.`;
  if ((mmszM = mmszS.match(/^(\w+):\s*(.+?),?$/))) return `Propiedad «${mmszM[1]}» del objeto, con el valor ${mmszCorto(mmszM[2])}.`;
  if (/^[}\])]+[,)]*\s*(\{\})?\)?$/.test(mmszS) || mmszS === '];' || mmszS === ']' || /^}, \{\}\)$/.test(mmszS)) return 'Cierra el bloque, arreglo u objeto que se abrió arriba.';
  if ((mmszM = mmszS.match(/^while \((.+)\)\s*{$/))) return `Bucle: repite el bloque mientras ${mmszM[1]} sea verdadero.`;
  if ((mmszM = mmszS.match(/^if \((.+)\)\s*(.*)$/))) return `Condición: ${mmszM[2] && mmszM[2] !== '{' ? `si ${mmszM[1]}, hace ${mmszCorto(mmszM[2])}` : `el bloque solo se ejecuta si ${mmszM[1]} es verdadero`}.`;
  if (/^try\s*{$/.test(mmszS)) return 'Intenta ejecutar este bloque; si ocurre un error, salta al catch.';
  if ((mmszM = mmszS.match(/^throw (.+)$/))) return `Lanza un error a propósito: ${mmszCorto(mmszM[1])}.`;
  if (/^console\.log\(/.test(mmszS)) return `Muestra en la consola ${mmszQueMuestra(mmszArgumentos(mmszS))}.`;
  if ((mmszM = mmszS.match(/^(const|let|var) (\w+) = (.+)$/))) {
    const mmszTipo = mmszM[1] === 'const' ? 'la constante' : 'la variable';
    if (/^\[.*\]$/.test(mmszM[3])) return `Crea ${mmszTipo} «${mmszM[2]}» con el arreglo ${mmszCorto(mmszM[3])}.`;
    if (/^\{/.test(mmszM[3])) return `Crea ${mmszTipo} «${mmszM[2]}» con un objeto (datos clave: valor).`;
    return `Crea ${mmszTipo} «${mmszM[2]}» y guarda en ella ${mmszCorto(mmszM[3])}.`;
  }
  if ((mmszM = mmszS.match(/^(const|let|var) \{(.+)\} = (.+)$/))) return `Saca ${mmszM[2].trim()} de «${mmszM[3]}» en variables con el mismo nombre (desestructuración).`;
  if ((mmszM = mmszS.match(/^([\w.[\]]+)\s*([+\-*/])=\s*(.+)$/))) return `Actualiza «${mmszM[1]}» con la operación ${mmszM[2]}= ${mmszM[3]}.`;
  if ((mmszM = mmszS.match(/^([\w.]+)(\+\+|--)$/))) return `${mmszM[2] === '++' ? 'Suma' : 'Resta'} 1 a «${mmszM[1]}».`;
  if ((mmszM = mmszS.match(/^([\w.[\]]+) = (.+)$/))) return `Cambia el valor de «${mmszM[1]}» por ${mmszCorto(mmszM[2])}.`;
  if ((mmszM = mmszS.match(/^(\w+)\.push\((.*)\)$/))) return `Agrega ${mmszM[2]} al final del arreglo «${mmszM[1]}».`;
  if ((mmszM = mmszS.match(/^([\w.]+)\((.*)\)$/))) return `Llama a «${mmszM[1]}»${mmszM[2] ? ` con: ${mmszCorto(mmszM[2])}` : ''}.`;
  if (mmszS === '}' || mmszS === '});' || mmszS === '};') return 'Cierra el bloque abierto con {.';
  return `Instrucción: ${mmszCorto(mmszS)}.`;
}

function mmszExplicarCpp(mmszL: string): string {
  let mmszM: RegExpMatchArray | null;
  const mmszS = mmszQuitarPuntoYComa(mmszL);
  if (mmszS.startsWith('//')) return 'Es un comentario: el compilador lo ignora.';
  if ((mmszM = mmszS.match(/^#include <(\w+)>$/))) return `Incluye la librería «${mmszM[1]}»${mmszM[1] === 'iostream' ? ' para usar cout (mostrar) y cin (leer)' : ''}.`;
  if (mmszS === 'using namespace std') return 'Permite escribir cout en lugar de std::cout.';
  if (/^int main\(\)\s*{$/.test(mmszS)) return 'Aquí empieza el programa: todo lo que está dentro de main se ejecuta en orden.';
  if (mmszS === 'return 0') return 'Termina main avisando que el programa terminó bien.';
  if (/^}\s*else\s*{$/.test(mmszS)) return 'Si la condición fue falsa, se ejecuta este otro bloque.';
  if ((mmszM = mmszS.match(/^}\s*else if \((.+)\)\s*{$/))) return `Si lo anterior fue falso, revisa otra condición: ${mmszM[1]}.`;
  if (mmszS === '}' || mmszS === '}}') return 'Cierra el bloque abierto con {.';
  if (/^cout\s*<</.test(mmszS)) {
    const mmszPartes = mmszS.replace(/^cout\s*<<\s*/, '').split(/\s*<<\s*/).filter((mmszP) => mmszP !== 'endl');
    return `Muestra en pantalla ${mmszPartes.join(' + ')}${/endl/.test(mmszS) ? ' y salta a la siguiente línea (endl)' : ''}.`;
  }
  if ((mmszM = mmszS.match(/^(int|double|char|bool|string|void|float) (\w+)\((.*)\)\s*{$/)))
    return `Define la función «${mmszM[2]}» que ${mmszM[1] === 'void' ? 'no devuelve nada' : `devuelve un ${mmszM[1]}`}${mmszM[3] ? ` y recibe: ${mmszM[3]}` : ''}.`;
  if ((mmszM = mmszS.match(/^return (.+)$/))) return `Termina la función y devuelve ${mmszCorto(mmszM[1])}.`;
  if ((mmszM = mmszS.match(/^for \((?:int )?(\w+) = (.+?); (.+?); ([^)]+?)\)\s*(.*)$/)))
    return `Bucle for: «${mmszM[1]}» empieza en ${mmszM[2]}, se repite mientras ${mmszM[3]} y en cada vuelta hace ${mmszM[4]}${mmszM[5] && mmszM[5] !== '{' ? `; en cada vuelta ejecuta ${mmszCorto(mmszM[5])}` : ''}.`;
  if ((mmszM = mmszS.match(/^for \((?:int|auto|double|string) (\w+) : (\w+)\)\s*(.*)$/)))
    return `Recorre «${mmszM[2]}»; en cada vuelta «${mmszM[1]}» toma el siguiente elemento${mmszM[3] && mmszM[3] !== '{' ? ` y hace ${mmszCorto(mmszM[3])}` : ''}.`;
  if ((mmszM = mmszS.match(/^else (.+)$/)) && !/^else if/.test(mmszS) && !/{$/.test(mmszS)) return `Si la condición fue falsa, hace ${mmszCorto(mmszM[1])}.`;
  if (mmszS === 'default:') return 'Si ningún case coincidió, se ejecuta desde aquí.';
  if ((mmszM = mmszS.match(/^vector<(\w+)> (\w+)$/))) return `Crea «${mmszM[2]}», un vector (lista que crece) de elementos ${mmszM[1]}.`;
  if ((mmszM = mmszS.match(/^(\w+)\.push_back\((.+)\)$/))) return `Agrega ${mmszM[2]} al final del vector «${mmszM[1]}».`;
  if ((mmszM = mmszS.match(/^(struct|class) (\w+)(?: : public (\w+))?\s*{$/)))
    return `Define ${mmszM[1] === 'struct' ? 'la estructura' : 'la clase'} «${mmszM[2]}»${mmszM[3] ? `, que hereda de «${mmszM[3]}»` : ''}: un nuevo tipo que agrupa datos${mmszM[1] === 'class' ? ' y funciones' : ''}.`;
  if (mmszS === 'private:') return 'Lo que sigue es privado: solo la propia clase puede usarlo (encapsulamiento).';
  if (mmszS === 'public:') return 'Lo que sigue es público: se puede usar desde fuera de la clase.';
  if ((mmszM = mmszS.match(/^(?:virtual )?(int|double|char|bool|string|void|float) (\w+)\((.*)\)( override)?\s*{\s*return (.+?);?\s*}$/)))
    return `Método «${mmszM[2]}»${mmszM[4] ? ' (reemplaza el de la clase padre)' : ''}: devuelve ${mmszCorto(mmszM[5])}.`;
  if ((mmszM = mmszS.match(/^([A-Z]\w*)\((.*)\)\s*{(.*)}?$/))) return `Constructor de «${mmszM[1]}»: se ejecuta al crear el objeto y recibe ${mmszM[2] || 'nada'}.`;
  if ((mmszM = mmszS.match(/^([A-Z]\w*)(\s*\*)? (\w+)(\[\d+\])?( = .+|\(.*\))?$/)))
    return `Crea ${mmszM[4] ? 'un arreglo' : mmszM[2] ? 'un puntero' : 'el objeto'} «${mmszM[3]}» de tipo ${mmszM[1]}${mmszM[5]?.startsWith('(') ? ` con los datos ${mmszM[5]}` : ''}.`;
  if ((mmszM = mmszS.match(/^while \((.+)\)\s*{?$/))) return `Bucle: repite el bloque mientras ${mmszM[1]} sea verdadero.`;
  if ((mmszM = mmszS.match(/^if \((.+)\)\s*(.*)$/))) return `Condición: ${mmszM[2] && mmszM[2] !== '{' ? `si ${mmszM[1]}, hace ${mmszCorto(mmszM[2])}` : `el bloque solo se ejecuta si ${mmszM[1]} es verdadero`}.`;
  if ((mmszM = mmszS.match(/^switch \((.+)\)\s*{$/))) return `Compara «${mmszM[1]}» con cada case de abajo.`;
  if ((mmszM = mmszS.match(/^case (.+):$/))) return `Si el valor es ${mmszM[1]}, se ejecuta desde aquí hasta el break.`;
  if (mmszS === 'break') return 'Sale del switch o del bucle.';
  if ((mmszM = mmszS.match(/^(const )?(int|double|char|bool|string|float)(\s*\*)? (\w+)((?:\[\d*\])*) = (.+)$/)))
    return `Crea ${mmszM[1] ? 'la constante' : 'la variable'} «${mmszM[4]}» de tipo ${mmszM[2]}${mmszM[3] ? ' (puntero)' : ''}${mmszM[5] ? (mmszM[5].split('[').length > 2 ? ' (matriz: filas y columnas)' : ' (arreglo)') : ''} con el valor ${mmszCorto(mmszM[6])}.`;
  if ((mmszM = mmszS.match(/^(\w+)\[(.+?)\](?:\[(.+?)\])? = (.+)$/))) return `Guarda ${mmszCorto(mmszM[4])} en «${mmszM[1]}» en la posición ${mmszM[2]}${mmszM[3] ? `, ${mmszM[3]}` : ''}.`;
  if ((mmszM = mmszS.match(/^(int|double|char|bool|string|float) ([\w, ]+)$/))) return `Crea las variables ${mmszM[2]} de tipo ${mmszM[1]} (sin valor todavía).`;
  if ((mmszM = mmszS.match(/^([\w.[\]*]+)\s*([+\-*/%])=\s*(.+)$/))) return `Actualiza «${mmszM[1]}» con la operación ${mmszM[2]}= ${mmszM[3]}.`;
  if ((mmszM = mmszS.match(/^([\w.]+)(\+\+|--)$/))) return `${mmszM[2] === '++' ? 'Suma' : 'Resta'} 1 a «${mmszM[1]}».`;
  if ((mmszM = mmszS.match(/^([\w.[\]*]+) = (.+)$/))) return `Cambia el valor de «${mmszM[1]}» por ${mmszCorto(mmszM[2])}.`;
  if ((mmszM = mmszS.match(/^(\w+)\((.*)\)$/))) return `Llama a la función «${mmszM[1]}»${mmszM[2] ? ` con: ${mmszM[2]}` : ''}.`;
  return `Instrucción: ${mmszCorto(mmszS)}.`;
}

export function mmszExplicarLinea(mmszLinea: string, mmszLang: MmszRunnableLang): string | null {
  const mmszLimpia = mmszLinea.trim();
  if (!mmszLimpia) return null;
  const mmszSinComentario =
    mmszLang === 'python' ? mmszLimpia.replace(/\s+#.*$/, '') : mmszLimpia.replace(/\s+\/\/.*$/, '');
  const mmszTexto =
    mmszLang === 'python' ? mmszExplicarPython(mmszSinComentario) : mmszLang === 'javascript' ? mmszExplicarJs(mmszSinComentario) : mmszExplicarCpp(mmszSinComentario);
  const mmszDentro = /^\s+/.test(mmszLinea) && mmszLang === 'python' ? ' (Está dentro del bloque de arriba por la sangría.)' : '';
  return mmszTexto + mmszDentro;
}

export function mmszConceptos(mmszCodigo: string, mmszLang: MmszRunnableLang): string[] {
  const mmszC = mmszCodigo;
  const mmszMostrar = mmszLang === 'python' ? 'print()' : mmszLang === 'javascript' ? 'console.log()' : 'cout <<';
  const mmszLista: [boolean, string][] = [
    [/\bdef |\bfunction |=>/.test(mmszC) || /^(int|double|void|bool|char|string)\s+(?!main\b)\w+\s*\(/m.test(mmszC), 'Crear una función'],
    [/\bclass\b/.test(mmszC), 'Crear una clase'],
    [/^\s*(const|let)?\s*\w+\s*=\s*[^=]/m.test(mmszC) || /\b(int|double|char|bool) \w+ =/.test(mmszC), 'Guardar valores en variables'],
    [/\bfor\b/.test(mmszC), 'Un bucle for para repetir'],
    [/\bwhile\b/.test(mmszC), 'Un bucle while (repetir mientras se cumpla algo)'],
    [/\bif\b/.test(mmszC), 'Una condición if para decidir'],
    [/\belse\b|\belif\b/.test(mmszC), 'Un camino alternativo (else / elif)'],
    [/\bswitch\b/.test(mmszC), 'Un switch para elegir entre casos'],
    [mmszC.split('\n').some((mmszL) => /\breturn\b/.test(mmszL) && !/^\s*return 0;\s*$/.test(mmszL)), 'Devolver un resultado con return'],
    [/f["']|\$\{/.test(mmszC), 'Insertar variables dentro de un texto'],
    [/\btry\b/.test(mmszC), 'Manejar errores con try'],
    [/\.append\(|\.push\(/.test(mmszC), 'Agregar elementos a una lista o arreglo'],
    [/print\(|console\.log\(|cout\s*<</.test(mmszC), `Mostrar el resultado en pantalla con ${mmszMostrar}`],
  ];
  return mmszLista.filter(([mmszSi]) => mmszSi).map(([, mmszTexto]) => mmszTexto);
}

export function mmszHuecoLinea(mmszL: string, mmszLang: MmszRunnableLang): string {
  const mmszSangria = mmszL.match(/^\s*/)![0];
  const mmszS = mmszL.trim();
  if (!mmszS || /^(#include|using namespace|int main\(\)|return 0;|}|else:|else\s*{|try|finally)/.test(mmszS) || /^(\/\/|#)/.test(mmszS)) return mmszL;
  let mmszM: RegExpMatchArray | null;
  if ((mmszM = mmszS.match(/^(print|console\.log)\((.*)\)(;?)$/))) return `${mmszSangria}${mmszM[1]}(___)${mmszM[3]}`;
  if (/^cout\s*<</.test(mmszS)) return `${mmszSangria}cout << ___${/endl/.test(mmszS) ? ' << endl' : ''};`;
  if ((mmszM = mmszS.match(/^(if|elif|while)\s+(.+):$/))) return `${mmszSangria}${mmszM[1]} ___:`;
  if ((mmszM = mmszS.match(/^(}\s*else if|if|while|switch)\s*\((.+)\)\s*{$/))) return `${mmszSangria}${mmszM[1]} (___) {`;
  if ((mmszM = mmszS.match(/^for (.+) in (.+):$/))) return `${mmszSangria}for ___ in ___:`;
  if (/^for \(/.test(mmszS)) return `${mmszSangria}for (___; ___; ___) {`;
  if ((mmszM = mmszS.match(/^return\s+(.+?)(;?)$/))) return `${mmszSangria}return ___${mmszM[2]}`;
  if ((mmszM = mmszS.match(/^(def|function)\s+(\w+)\((.*)\)(:|\s*{)$/))) return `${mmszSangria}${mmszM[1]} ${mmszM[2]}(${mmszM[3] ? '___' : ''})${mmszM[4]}`;
  if ((mmszM = mmszS.match(/^((?:const |let |var |int |double |char |bool |string )?[\w.[\]]+)\s*(=|\+=|-=|\*=|\/=)\s*(.+?)(;?)$/)) && !mmszS.includes('=='))
    return `${mmszSangria}${mmszM[1]} ${mmszM[2]} ___${mmszM[4]}`;
  return mmszL;
}

export function mmszEstructura(mmszSolucion: string, mmszLang: MmszRunnableLang): string {
  return mmszSolucion
    .split('\n')
    .map((mmszL) => mmszHuecoLinea(mmszL, mmszLang))
    .join('\n');
}

export function mmszTieneLinea(mmszCodigo: string, mmszLinea: string): boolean {
  const mmszN = (mmszS: string) => mmszS.replace(/\s+/g, '');
  const mmszObjetivo = mmszN(mmszLinea);
  return !mmszObjetivo || mmszCodigo.split('\n').some((mmszL) => mmszN(mmszL) === mmszObjetivo);
}
