// Autor: MMSZ (Mario Soto Zea)
// Explica en español qué hace cada línea de código (Python, JavaScript y C++),
// arma pistas con los conceptos necesarios y una "estructura con huecos" de la solución.
import type { MmszRunnableLang } from './runner';

const mmszQuitarPuntoYComa = (s: string) => s.replace(/;\s*$/, '');
const mmszCorto = (s: string, n = 60) => (s.length > n ? s.slice(0, n - 1) + '…' : s);

/** Contenido de los paréntesis más externos de la primera llamada (ej. "print(a, b)" → "a, b"). */
function mmszArgumentos(s: string): string {
  const i = s.indexOf('(');
  if (i < 0) return '';
  let p = 0;
  for (let j = i; j < s.length; j++) {
    if (s[j] === '(') p++;
    else if (s[j] === ')' && --p === 0) return s.slice(i + 1, j).trim();
  }
  return s.slice(i + 1).trim();
}

function mmszQueMuestra(mmszArgs: string): string {
  if (!mmszArgs) return 'una línea vacía';
  if (/^f["']/.test(mmszArgs)) return `un texto con valores de variables dentro de { } (f-string): ${mmszCorto(mmszArgs)}`;
  if (/^`/.test(mmszArgs) && mmszArgs.includes('${')) return `un texto con valores de variables dentro de \${ } (template literal): ${mmszCorto(mmszArgs)}`;
  if (/^["'`][^"'`]*["'`]$/.test(mmszArgs)) return `el texto ${mmszArgs} tal cual`;
  if (/^[A-Za-z_]\w*$/.test(mmszArgs)) return `el valor guardado en la variable «${mmszArgs}»`;
  return `el resultado de ${mmszCorto(mmszArgs)}`;
}

function mmszExplicarPython(l: string): string {
  let m: RegExpMatchArray | null;
  if (l.startsWith('#')) return 'Es un comentario: Python lo ignora; sirve para explicar el código.';
  if ((m = l.match(/^def (\w+)\((.*)\):$/))) return `Define la función «${m[1]}»${m[2] ? ` que recibe: ${m[2]}` : ' (no recibe datos)'}. Su código es el bloque con sangría de abajo.`;
  if ((m = l.match(/^class (\w+)(?:\((\w+)\))?:$/))) return `Define la clase «${m[1]}»${m[2] ? `, que hereda de «${m[2]}»` : ''}: un molde para crear objetos.`;
  if ((m = l.match(/^return\s*(.*)$/))) return m[1] ? `Termina la función y devuelve el resultado de ${mmszCorto(m[1])}.` : 'Termina la función.';
  if ((m = l.match(/^for (\w+(?:, *\w+)*) in range\((.*)\):$/))) {
    const a = m[2].split(',').map((x) => x.trim());
    const mmszDesc = a.length === 1 ? `desde 0 hasta ${a[0]} - 1` : `desde ${a[0]} hasta ${a[1]} - 1${a[2] ? `, de ${a[2]} en ${a[2]}` : ''}`;
    return `Bucle: repite el bloque de abajo; en cada vuelta «${m[1]}» toma un número ${mmszDesc}.`;
  }
  if ((m = l.match(/^for (.+) in (.+):$/))) return `Bucle: recorre ${mmszCorto(m[2])}; en cada vuelta «${m[1]}» toma el siguiente elemento.`;
  if ((m = l.match(/^while (.+):$/))) return m[1] === 'True' ? 'Bucle infinito: repite hasta que un break lo detenga.' : `Bucle: repite el bloque mientras ${m[1]} sea verdadero.`;
  if ((m = l.match(/^if (.+):$/))) return `Condición: el bloque de abajo solo se ejecuta si ${m[1]} es verdadero.`;
  if ((m = l.match(/^elif (.+):$/))) return `Si lo anterior fue falso, revisa otra condición: ${m[1]}.`;
  if (l === 'else:') return 'Si ninguna condición anterior se cumplió, se ejecuta este bloque.';
  if (l === 'try:') return 'Intenta ejecutar el bloque de abajo; si ocurre un error, salta al except.';
  if ((m = l.match(/^except\s*(\w*).*:$/))) return `Si ocurre un error${m[1] ? ` de tipo ${m[1]}` : ''}, se ejecuta este bloque en lugar de detener el programa.`;
  if (l === 'finally:') return 'Este bloque se ejecuta siempre, haya error o no.';
  if (l === 'break') return 'Sale del bucle inmediatamente.';
  if (l === 'continue') return 'Salta a la siguiente vuelta del bucle.';
  if (l === 'pass') return 'No hace nada (se usa cuando Python exige un bloque).';
  if (/^print\(/.test(l)) return `Muestra en pantalla ${mmszQueMuestra(mmszArgumentos(l))}.`;
  if (/^[}\])],?$/.test(l)) return 'Cierra la lista, diccionario o paréntesis que se abrió arriba.';
  if ((m = l.match(/^(["']?[\w ]+["']?):\s*(.+?),?$/))) return `Elemento del diccionario: la clave ${m[1]} tiene el valor ${mmszCorto(m[2])}.`;
  if ((m = l.match(/^self\.(\w+)\s*=\s*(.+)$/))) return `Guarda ${mmszCorto(m[2])} en el atributo «${m[1]}» del objeto (self es el propio objeto).`;
  if ((m = l.match(/^(\w+)\[(.+)\]\s*=\s*(.+)$/))) return `Guarda ${mmszCorto(m[3])} en «${m[1]}» en la posición o clave ${m[2]}.`;
  if ((m = l.match(/^([\w.[\]]+)\s*([+\-*/])=\s*(.+)$/))) {
    const mmszFrase = {
      '+': `Suma ${m[3]} a «${m[1]}»`,
      '-': `Resta ${m[3]} a «${m[1]}»`,
      '*': `Multiplica «${m[1]}» por ${m[3]}`,
      '/': `Divide «${m[1]}» entre ${m[3]}`,
    }[m[2]];
    return `${mmszFrase} y guarda el resultado en la misma variable.`;
  }
  if ((m = l.match(/^([\w, ]+?)\s*=\s*(.+)$/)) && !l.includes('==')) {
    const mmszNombre = m[1].trim();
    if (mmszNombre.includes(',')) return `Guarda varios valores a la vez: ${mmszNombre} reciben ${mmszCorto(m[2])}.`;
    if (new RegExp(`\\b${mmszNombre}\\b`).test(m[2])) return `Actualiza «${mmszNombre}»: calcula ${mmszCorto(m[2])} y guarda el resultado de nuevo en «${mmszNombre}».`;
    if (/^\[.*\]$/.test(m[2])) return `Crea la lista «${mmszNombre}» con los valores ${mmszCorto(m[2])}.`;
    if (/^\{.*\}$/.test(m[2])) return `Crea «${mmszNombre}» con ${mmszCorto(m[2])} (diccionario o conjunto).`;
    if (/^["']/.test(m[2])) return `Crea la variable «${mmszNombre}» y guarda en ella el texto ${mmszCorto(m[2])}.`;
    if (/^-?\d+(\.\d+)?$/.test(m[2])) return `Crea la variable «${mmszNombre}» y guarda en ella el número ${m[2]}.`;
    return `Calcula ${mmszCorto(m[2])} y guarda el resultado en la variable «${mmszNombre}».`;
  }
  if ((m = l.match(/^(\w+)\.append\((.*)\)$/))) return `Agrega ${m[2]} al final de la lista «${m[1]}».`;
  if ((m = l.match(/^(\w+)\.remove\((.*)\)$/))) return `Quita ${m[2]} de la lista «${m[1]}».`;
  if ((m = l.match(/^([\w.]+)\((.*)\)$/))) return `Llama (ejecuta) a «${m[1]}»${m[2] ? ` con los datos: ${mmszCorto(m[2])}` : ''}.`;
  return `Instrucción: ${mmszCorto(l)}.`;
}

function mmszExplicarJs(l: string): string {
  let m: RegExpMatchArray | null;
  const s = mmszQuitarPuntoYComa(l);
  if (s.startsWith('//')) return 'Es un comentario: JavaScript lo ignora.';
  if (/^}\s*(else|catch|finally)?/.test(s) && s.length <= 2) return 'Cierra el bloque abierto con {.';
  if ((m = s.match(/^}\s*else if \((.+)\)\s*{$/))) return `Si lo anterior fue falso, revisa otra condición: ${m[1]}.`;
  if (/^}\s*else\s*{$/.test(s)) return 'Si la condición fue falsa, se ejecuta este otro bloque.';
  if ((m = s.match(/^}\s*catch\s*\((\w+)\)\s*{$/))) return `Si ocurrió un error, se ejecuta este bloque; el error queda en «${m[1]}».`;
  if (/^}\s*finally\s*{$/.test(s)) return 'Este bloque se ejecuta siempre, haya error o no.';
  if ((m = s.match(/^function (\w+)\((.*)\)\s*{$/))) return `Define la función «${m[1]}»${m[2] ? ` que recibe: ${m[2]}` : ''}. Su código va entre las llaves.`;
  if ((m = s.match(/^(?:const|let) (\w+) = \((.*)\) =>\s*(.+)$/))) return `Crea la función flecha «${m[1]}» que recibe (${m[2]}) y devuelve ${mmszCorto(m[3])}.`;
  if ((m = s.match(/^class (\w+)(?: extends (\w+))?\s*{$/))) return `Define la clase «${m[1]}»${m[2] ? `, que hereda de «${m[2]}»` : ''}.`;
  if ((m = s.match(/^constructor\((.*)\)\s*{$/))) return `Constructor: se ejecuta al crear el objeto con new${m[1] ? `, y recibe ${m[1]}` : ''}.`;
  if ((m = s.match(/^return\s*(.*)$/))) return m[1] ? `Termina la función y devuelve ${mmszCorto(m[1])}.` : 'Termina la función.';
  if ((m = s.match(/^for \((let|const) (\w+) = (.+?); (.+?); (.+?)\)\s*{$/))) return `Bucle for: «${m[2]}» empieza en ${m[3]}, se repite mientras ${m[4]} y en cada vuelta hace ${m[5]}.`;
  if ((m = s.match(/^for \((?:const|let) (\w+) of ([^)]+)\)\s*(.*)$/)))
    return `Recorre ${m[2]}; en cada vuelta «${m[1]}» toma el siguiente elemento${m[3] && m[3] !== '{' ? ` y hace ${mmszCorto(m[3])}` : ''}.`;
  if ((m = s.match(/^(let|var) (\w+)$/))) return `Crea la variable «${m[2]}» todavía sin valor (se le dará uno más abajo).`;
  if ((m = s.match(/^switch \((.+)\)\s*{$/))) return `Compara «${m[1]}» con cada case de abajo.`;
  if ((m = s.match(/^case (.+):$/))) return `Si el valor es ${m[1]}, se ejecuta desde aquí hasta el break.`;
  if (s === 'default:') return 'Si ningún case coincidió, se ejecuta desde aquí.';
  if (s === 'break') return 'Sale del switch o del bucle.';
  if (/\.forEach\(/.test(s)) return `Repite la función de abajo para cada elemento de ${mmszCorto(s.split('.forEach(')[0])}.`;
  if ((m = s.match(/^(\w+)\((.*)\)\s*{$/))) return `Define el método «${m[1]}»${m[2] ? ` que recibe: ${m[2]}` : ''} (una función que pertenece al objeto o clase).`;
  if ((m = s.match(/^\{(.+)\},?$/))) return `Un elemento del arreglo: un objeto con ${mmszCorto(m[1].trim())}.`;
  if ((m = s.match(/^(\w+):\s*(.+?),?$/))) return `Propiedad «${m[1]}» del objeto, con el valor ${mmszCorto(m[2])}.`;
  if (/^[}\])]+[,)]*\s*(\{\})?\)?$/.test(s) || s === '];' || s === ']' || /^}, \{\}\)$/.test(s)) return 'Cierra el bloque, arreglo u objeto que se abrió arriba.';
  if ((m = s.match(/^while \((.+)\)\s*{$/))) return `Bucle: repite el bloque mientras ${m[1]} sea verdadero.`;
  if ((m = s.match(/^if \((.+)\)\s*(.*)$/))) return `Condición: ${m[2] && m[2] !== '{' ? `si ${m[1]}, hace ${mmszCorto(m[2])}` : `el bloque solo se ejecuta si ${m[1]} es verdadero`}.`;
  if (/^try\s*{$/.test(s)) return 'Intenta ejecutar este bloque; si ocurre un error, salta al catch.';
  if ((m = s.match(/^throw (.+)$/))) return `Lanza un error a propósito: ${mmszCorto(m[1])}.`;
  if (/^console\.log\(/.test(s)) return `Muestra en la consola ${mmszQueMuestra(mmszArgumentos(s))}.`;
  if ((m = s.match(/^(const|let|var) (\w+) = (.+)$/))) {
    const tipo = m[1] === 'const' ? 'la constante' : 'la variable';
    if (/^\[.*\]$/.test(m[3])) return `Crea ${tipo} «${m[2]}» con el arreglo ${mmszCorto(m[3])}.`;
    if (/^\{/.test(m[3])) return `Crea ${tipo} «${m[2]}» con un objeto (datos clave: valor).`;
    return `Crea ${tipo} «${m[2]}» y guarda en ella ${mmszCorto(m[3])}.`;
  }
  if ((m = s.match(/^(const|let|var) \{(.+)\} = (.+)$/))) return `Saca ${m[2].trim()} de «${m[3]}» en variables con el mismo nombre (desestructuración).`;
  if ((m = s.match(/^([\w.[\]]+)\s*([+\-*/])=\s*(.+)$/))) return `Actualiza «${m[1]}» con la operación ${m[2]}= ${m[3]}.`;
  if ((m = s.match(/^([\w.]+)(\+\+|--)$/))) return `${m[2] === '++' ? 'Suma' : 'Resta'} 1 a «${m[1]}».`;
  if ((m = s.match(/^([\w.[\]]+) = (.+)$/))) return `Cambia el valor de «${m[1]}» por ${mmszCorto(m[2])}.`;
  if ((m = s.match(/^(\w+)\.push\((.*)\)$/))) return `Agrega ${m[2]} al final del arreglo «${m[1]}».`;
  if ((m = s.match(/^([\w.]+)\((.*)\)$/))) return `Llama a «${m[1]}»${m[2] ? ` con: ${mmszCorto(m[2])}` : ''}.`;
  if (s === '}' || s === '});' || s === '};') return 'Cierra el bloque abierto con {.';
  return `Instrucción: ${mmszCorto(s)}.`;
}

function mmszExplicarCpp(l: string): string {
  let m: RegExpMatchArray | null;
  const s = mmszQuitarPuntoYComa(l);
  if (s.startsWith('//')) return 'Es un comentario: el compilador lo ignora.';
  if ((m = s.match(/^#include <(\w+)>$/))) return `Incluye la librería «${m[1]}»${m[1] === 'iostream' ? ' para usar cout (mostrar) y cin (leer)' : ''}.`;
  if (s === 'using namespace std') return 'Permite escribir cout en lugar de std::cout.';
  if (/^int main\(\)\s*{$/.test(s)) return 'Aquí empieza el programa: todo lo que está dentro de main se ejecuta en orden.';
  if (s === 'return 0') return 'Termina main avisando que el programa terminó bien.';
  if (/^}\s*else\s*{$/.test(s)) return 'Si la condición fue falsa, se ejecuta este otro bloque.';
  if ((m = s.match(/^}\s*else if \((.+)\)\s*{$/))) return `Si lo anterior fue falso, revisa otra condición: ${m[1]}.`;
  if (s === '}' || s === '}}') return 'Cierra el bloque abierto con {.';
  if (/^cout\s*<</.test(s)) {
    const partes = s.replace(/^cout\s*<<\s*/, '').split(/\s*<<\s*/).filter((p) => p !== 'endl');
    return `Muestra en pantalla ${partes.join(' + ')}${/endl/.test(s) ? ' y salta a la siguiente línea (endl)' : ''}.`;
  }
  if ((m = s.match(/^(int|double|char|bool|string|void|float) (\w+)\((.*)\)\s*{$/)))
    return `Define la función «${m[2]}» que ${m[1] === 'void' ? 'no devuelve nada' : `devuelve un ${m[1]}`}${m[3] ? ` y recibe: ${m[3]}` : ''}.`;
  if ((m = s.match(/^return (.+)$/))) return `Termina la función y devuelve ${mmszCorto(m[1])}.`;
  if ((m = s.match(/^for \((?:int )?(\w+) = (.+?); (.+?); ([^)]+?)\)\s*(.*)$/)))
    return `Bucle for: «${m[1]}» empieza en ${m[2]}, se repite mientras ${m[3]} y en cada vuelta hace ${m[4]}${m[5] && m[5] !== '{' ? `; en cada vuelta ejecuta ${mmszCorto(m[5])}` : ''}.`;
  if ((m = s.match(/^for \((?:int|auto|double|string) (\w+) : (\w+)\)\s*(.*)$/)))
    return `Recorre «${m[2]}»; en cada vuelta «${m[1]}» toma el siguiente elemento${m[3] && m[3] !== '{' ? ` y hace ${mmszCorto(m[3])}` : ''}.`;
  if ((m = s.match(/^else (.+)$/)) && !/^else if/.test(s) && !/{$/.test(s)) return `Si la condición fue falsa, hace ${mmszCorto(m[1])}.`;
  if (s === 'default:') return 'Si ningún case coincidió, se ejecuta desde aquí.';
  if ((m = s.match(/^vector<(\w+)> (\w+)$/))) return `Crea «${m[2]}», un vector (lista que crece) de elementos ${m[1]}.`;
  if ((m = s.match(/^(\w+)\.push_back\((.+)\)$/))) return `Agrega ${m[2]} al final del vector «${m[1]}».`;
  if ((m = s.match(/^(struct|class) (\w+)(?: : public (\w+))?\s*{$/)))
    return `Define ${m[1] === 'struct' ? 'la estructura' : 'la clase'} «${m[2]}»${m[3] ? `, que hereda de «${m[3]}»` : ''}: un nuevo tipo que agrupa datos${m[1] === 'class' ? ' y funciones' : ''}.`;
  if (s === 'private:') return 'Lo que sigue es privado: solo la propia clase puede usarlo (encapsulamiento).';
  if (s === 'public:') return 'Lo que sigue es público: se puede usar desde fuera de la clase.';
  if ((m = s.match(/^(?:virtual )?(int|double|char|bool|string|void|float) (\w+)\((.*)\)( override)?\s*{\s*return (.+?);?\s*}$/)))
    return `Método «${m[2]}»${m[4] ? ' (reemplaza el de la clase padre)' : ''}: devuelve ${mmszCorto(m[5])}.`;
  if ((m = s.match(/^([A-Z]\w*)\((.*)\)\s*{(.*)}?$/))) return `Constructor de «${m[1]}»: se ejecuta al crear el objeto y recibe ${m[2] || 'nada'}.`;
  if ((m = s.match(/^([A-Z]\w*)(\s*\*)? (\w+)(\[\d+\])?( = .+|\(.*\))?$/)))
    return `Crea ${m[4] ? 'un arreglo' : m[2] ? 'un puntero' : 'el objeto'} «${m[3]}» de tipo ${m[1]}${m[5]?.startsWith('(') ? ` con los datos ${m[5]}` : ''}.`;
  if ((m = s.match(/^while \((.+)\)\s*{?$/))) return `Bucle: repite el bloque mientras ${m[1]} sea verdadero.`;
  if ((m = s.match(/^if \((.+)\)\s*(.*)$/))) return `Condición: ${m[2] && m[2] !== '{' ? `si ${m[1]}, hace ${mmszCorto(m[2])}` : `el bloque solo se ejecuta si ${m[1]} es verdadero`}.`;
  if ((m = s.match(/^switch \((.+)\)\s*{$/))) return `Compara «${m[1]}» con cada case de abajo.`;
  if ((m = s.match(/^case (.+):$/))) return `Si el valor es ${m[1]}, se ejecuta desde aquí hasta el break.`;
  if (s === 'break') return 'Sale del switch o del bucle.';
  if ((m = s.match(/^(const )?(int|double|char|bool|string|float)(\s*\*)? (\w+)((?:\[\d*\])*) = (.+)$/)))
    return `Crea ${m[1] ? 'la constante' : 'la variable'} «${m[4]}» de tipo ${m[2]}${m[3] ? ' (puntero)' : ''}${m[5] ? (m[5].split('[').length > 2 ? ' (matriz: filas y columnas)' : ' (arreglo)') : ''} con el valor ${mmszCorto(m[6])}.`;
  if ((m = s.match(/^(\w+)\[(.+?)\](?:\[(.+?)\])? = (.+)$/))) return `Guarda ${mmszCorto(m[4])} en «${m[1]}» en la posición ${m[2]}${m[3] ? `, ${m[3]}` : ''}.`;
  if ((m = s.match(/^(int|double|char|bool|string|float) ([\w, ]+)$/))) return `Crea las variables ${m[2]} de tipo ${m[1]} (sin valor todavía).`;
  if ((m = s.match(/^([\w.[\]*]+)\s*([+\-*/%])=\s*(.+)$/))) return `Actualiza «${m[1]}» con la operación ${m[2]}= ${m[3]}.`;
  if ((m = s.match(/^([\w.]+)(\+\+|--)$/))) return `${m[2] === '++' ? 'Suma' : 'Resta'} 1 a «${m[1]}».`;
  if ((m = s.match(/^([\w.[\]*]+) = (.+)$/))) return `Cambia el valor de «${m[1]}» por ${mmszCorto(m[2])}.`;
  if ((m = s.match(/^(\w+)\((.*)\)$/))) return `Llama a la función «${m[1]}»${m[2] ? ` con: ${m[2]}` : ''}.`;
  return `Instrucción: ${mmszCorto(s)}.`;
}

/** Explica una línea de código. Devuelve null si la línea está vacía. */
export function mmszExplicarLinea(mmszLinea: string, mmszLang: MmszRunnableLang): string | null {
  const mmszLimpia = mmszLinea.trim();
  if (!mmszLimpia) return null;
  // Comentario al final de la línea: se explica la parte de código.
  const mmszSinComentario =
    mmszLang === 'python' ? mmszLimpia.replace(/\s+#.*$/, '') : mmszLimpia.replace(/\s+\/\/.*$/, '');
  const mmszTexto =
    mmszLang === 'python' ? mmszExplicarPython(mmszSinComentario) : mmszLang === 'javascript' ? mmszExplicarJs(mmszSinComentario) : mmszExplicarCpp(mmszSinComentario);
  const mmszDentro = /^\s+/.test(mmszLinea) && mmszLang === 'python' ? ' (Está dentro del bloque de arriba por la sangría.)' : '';
  return mmszTexto + mmszDentro;
}

/** Conceptos que usa una solución, para la pista 1. */
export function mmszConceptos(mmszCodigo: string, mmszLang: MmszRunnableLang): string[] {
  const c = mmszCodigo;
  const mmszMostrar = mmszLang === 'python' ? 'print()' : mmszLang === 'javascript' ? 'console.log()' : 'cout <<';
  const mmszLista: [boolean, string][] = [
    [/\bdef |\bfunction |=>/.test(c) || /^(int|double|void|bool|char|string)\s+(?!main\b)\w+\s*\(/m.test(c), 'Crear una función'],
    [/\bclass\b/.test(c), 'Crear una clase'],
    [/^\s*(const|let)?\s*\w+\s*=\s*[^=]/m.test(c) || /\b(int|double|char|bool) \w+ =/.test(c), 'Guardar valores en variables'],
    [/\bfor\b/.test(c), 'Un bucle for para repetir'],
    [/\bwhile\b/.test(c), 'Un bucle while (repetir mientras se cumpla algo)'],
    [/\bif\b/.test(c), 'Una condición if para decidir'],
    [/\belse\b|\belif\b/.test(c), 'Un camino alternativo (else / elif)'],
    [/\bswitch\b/.test(c), 'Un switch para elegir entre casos'],
    [c.split('\n').some((l) => /\breturn\b/.test(l) && !/^\s*return 0;\s*$/.test(l)), 'Devolver un resultado con return'],
    [/f["']|\$\{/.test(c), 'Insertar variables dentro de un texto'],
    [/\btry\b/.test(c), 'Manejar errores con try'],
    [/\.append\(|\.push\(/.test(c), 'Agregar elementos a una lista o arreglo'],
    [/print\(|console\.log\(|cout\s*<</.test(c), `Mostrar el resultado en pantalla con ${mmszMostrar}`],
  ];
  return mmszLista.filter(([si]) => si).map(([, texto]) => texto);
}

/** Convierte una línea de la solución en estructura con huecos (pista 2). */
export function mmszHuecoLinea(l: string, mmszLang: MmszRunnableLang): string {
  const mmszSangria = l.match(/^\s*/)![0];
  const s = l.trim();
  if (!s || /^(#include|using namespace|int main\(\)|return 0;|}|else:|else\s*{|try|finally)/.test(s) || /^(\/\/|#)/.test(s)) return l;
  let m: RegExpMatchArray | null;
  if ((m = s.match(/^(print|console\.log)\((.*)\)(;?)$/))) return `${mmszSangria}${m[1]}(___)${m[3]}`;
  if (/^cout\s*<</.test(s)) return `${mmszSangria}cout << ___${/endl/.test(s) ? ' << endl' : ''};`;
  if ((m = s.match(/^(if|elif|while)\s+(.+):$/))) return `${mmszSangria}${m[1]} ___:`;
  if ((m = s.match(/^(}\s*else if|if|while|switch)\s*\((.+)\)\s*{$/))) return `${mmszSangria}${m[1]} (___) {`;
  if ((m = s.match(/^for (.+) in (.+):$/))) return `${mmszSangria}for ___ in ___:`;
  if (/^for \(/.test(s)) return `${mmszSangria}for (___; ___; ___) {`;
  if ((m = s.match(/^return\s+(.+?)(;?)$/))) return `${mmszSangria}return ___${m[2]}`;
  if ((m = s.match(/^(def|function)\s+(\w+)\((.*)\)(:|\s*{)$/))) return `${mmszSangria}${m[1]} ${m[2]}(${m[3] ? '___' : ''})${m[4]}`;
  if ((m = s.match(/^((?:const |let |var |int |double |char |bool |string )?[\w.[\]]+)\s*(=|\+=|-=|\*=|\/=)\s*(.+?)(;?)$/)) && !s.includes('=='))
    return `${mmszSangria}${m[1]} ${m[2]} ___${m[4]}`;
  return l;
}

export function mmszEstructura(mmszSolucion: string, mmszLang: MmszRunnableLang): string {
  return mmszSolucion
    .split('\n')
    .map((l) => mmszHuecoLinea(l, mmszLang))
    .join('\n');
}

/** ¿El código del estudiante ya tiene esta línea? (ignora espacios). */
export function mmszTieneLinea(mmszCodigo: string, mmszLinea: string): boolean {
  const n = (s: string) => s.replace(/\s+/g, '');
  const mmszObjetivo = n(mmszLinea);
  return !mmszObjetivo || mmszCodigo.split('\n').some((l) => n(l) === mmszObjetivo);
}
