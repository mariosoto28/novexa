// Autor: MMSZ (Mario Soto Zea)
// Curso de C++: de lo básico a lo avanzado (9 unidades).
// Las unidades 1 a 7 se ejecutan con el simulador; strings, vectores, structs y clases
// se revisan por el código que escribe el estudiante (el simulador aún no los soporta).
import type { MmszCourse } from '../types';
import {
  mmszCompleta,
  mmszConsejo,
  mmszDesafio,
  mmszElige,
  mmszEscribe,
  mmszLeccion,
  mmszLectura,
  mmszOrdena,
  mmszPaso,
  mmszProyecto,
  mmszRepaso,
  mmszUnidad,
} from './mmszAutor';

const MMSZ_CABECERA = '#include <iostream>\nusing namespace std;\n';

/** Arma un programa completo: cabecera + funciones (opcional) + main con el cuerpo dado. */
function mmszPrograma(mmszCuerpo: string, mmszFunciones = '', mmszIncluir = ''): string {
  const mmszSangrado = mmszCuerpo
    .split('\n')
    .map((l) => (l ? '    ' + l : l))
    .join('\n');
  return (
    (mmszIncluir ? mmszIncluir + '\n' : '') +
    MMSZ_CABECERA +
    '\n' +
    (mmszFunciones ? mmszFunciones + '\n\n' : '') +
    `int main() {\n${mmszSangrado}\n    return 0;\n}`
  );
}

export const mmszCpp: MmszCourse = {
  id: 'cpp',
  name: 'C++',
  tagline: 'El clásico de ingeniería de sistemas',
  color: '#ef7a5a',
  icon: '⚙️',
  units: [
    /* =============================== BÁSICO =============================== */
    mmszUnidad('Básico', 'Primeros pasos', 'La estructura de un programa en C++, cout y variables con tipo.', [
      mmszLeccion('cpp-1-1', 'Estructura de un programa', '#include, main, cout, endl y comentarios.', [
        mmszLectura('Tu primer programa en C++', `
          C++ es un lenguaje **compilado** y muy rápido. Se usa en videojuegos, sistemas operativos, bases de datos y en casi todas las carreras de Ingeniería de Sistemas.

          Todo programa tiene esta estructura:

          ~~~run
          #include <iostream>
          using namespace std;

          int main() {
              cout << "Hola, mundo" << endl;
              return 0;
          }
          ~~~

          - «#include <iostream>» trae la librería de entrada/salida.
          - «using namespace std;» evita escribir «std::cout».
          - «int main()» es donde **empieza** el programa.
          - «cout <<» muestra texto; «endl» hace un salto de línea.
          - Cada instrucción termina en **punto y coma «;»**.
          - «return 0;» indica que el programa terminó bien.

          ### Comentarios
          «//» para una línea y «/* ... */» para varias.
        `),
        mmszConsejo('encadenar con <<', `
          Puedes mostrar varias cosas en una sola instrucción encadenando «<<»:

          ~~~run
          #include <iostream>
          using namespace std;

          int main() {
              cout << "Tengo " << 20 << " años" << endl;
              cout << "Línea 1\\nLínea 2" << endl;
              return 0;
          }
          ~~~

          «\\n» dentro del texto también hace un salto de línea.
        `),
        mmszDesafio('tu tarjeta de presentación', [
          mmszPaso('Saluda', `
            Dentro de «main», muestra «Hola, soy estudiante».
          `, {
            inicio: mmszPrograma('// Escribe tu código aquí'),
            pista: 'cout << "..." << endl;',
            salida: 'Hola, soy estudiante',
            requiere: ['cout'],
            solucion: mmszPrograma('cout << "Hola, soy estudiante" << endl;'),
          }),
          mmszPaso('Más líneas', `
            Agrega «Estudio Ingeniería de Sistemas» y «Me gusta programar», cada una en su línea.
          `, {
            salida: 'Hola, soy estudiante\nEstudio Ingeniería de Sistemas\nMe gusta programar',
            requiere: ['endl'],
            solucion: mmszPrograma('cout << "Hola, soy estudiante" << endl;\ncout << "Estudio Ingeniería de Sistemas" << endl;\ncout << "Me gusta programar" << endl;'),
          }),
        ]),
      ], [
        mmszElige('¿Qué librería necesitas para usar cout?', ['*<iostream>', '<stdio>', '<print>', '<console>'], 'iostream = input/output stream.'),
        mmszCompleta('Completa para mostrar el saludo.', 'cout ___ "Hola, mundo";', ['<<'], '<< envía el texto a cout.'),
        mmszOrdena('Ordena el programa completo.', ['#include <iostream>', 'using namespace std;', 'int main() {', '    cout << "Hola";', '    return 0;', '}'], 'Librerías, main con su código y return 0.'),
        mmszElige('¿Con qué termina cada instrucción?', ['*; (punto y coma)', ': (dos puntos)', '. (punto)', 'Con nada'], 'Olvidar el ; es el error más común.'),
        mmszEscribe('Muestra exactamente: C++ es rapido', mmszPrograma(''), 'C++ es rapido', mmszPrograma('cout << "C++ es rapido" << endl;')),
      ]),

      mmszLeccion('cpp-1-2', 'Variables y tipos', 'int, double, char, bool y const.', [
        mmszLectura('Variables con tipo', `
          En C++ **debes indicar el tipo** de cada variable al crearla:

          - «int»: enteros («20»).
          - «double»: decimales («3.75»).
          - «char»: un solo carácter, entre comillas simples («'A'»).
          - «bool»: «true» o «false» (al mostrarlos salen como 1 y 0).

          ~~~run
          #include <iostream>
          using namespace std;

          int main() {
              int edad = 20;
              double promedio = 15.5;
              char seccion = 'B';
              bool aprobado = true;
              cout << edad << " " << promedio << " " << seccion << " " << aprobado << endl;
              return 0;
          }
          ~~~

          ### Constantes
          «const» crea un valor que no puede cambiar:

          ~~~run
          #include <iostream>
          using namespace std;

          int main() {
              const double PI = 3.14159;
              double radio = 2;
              cout << PI * radio * radio << endl;
              return 0;
          }
          ~~~

          > Si guardas un decimal en un «int», se pierden los decimales: «int n = 5.9;» guarda 5.
        `),
        mmszDesafio('datos de un estudiante', [
          mmszPaso('Crea las variables', `
            Crea «int ciclo = 3», «double promedio = 15.5» y «char seccion = 'A'». Muéstralas en ese orden, cada una en su línea.
          `, {
            inicio: mmszPrograma('// Crea tus variables aquí'),
            salida: '3\n15.5\nA',
            requiere: ['int ciclo', 'double promedio', 'char seccion'],
            solucion: mmszPrograma("int ciclo = 3;\ndouble promedio = 15.5;\nchar seccion = 'A';\ncout << ciclo << endl;\ncout << promedio << endl;\ncout << seccion << endl;"),
          }),
          mmszPaso('Siguiente ciclo', `
            Antes de mostrar, aumenta «ciclo» en 1.
          `, {
            salida: '4\n15.5\nA',
            solucion: mmszPrograma("int ciclo = 3;\ndouble promedio = 15.5;\nchar seccion = 'A';\nciclo = ciclo + 1;\ncout << ciclo << endl;\ncout << promedio << endl;\ncout << seccion << endl;"),
          }),
        ]),
        mmszProyecto('área de un círculo', [
          mmszPaso('Con constante', `
            Declara «const double PI = 3.14;» y «double radio = 5;». Calcula y muestra el área («PI * radio * radio»): «Area: 78.5».
          `, {
            inicio: mmszPrograma(''),
            salida: 'Area: 78.5',
            requiere: ['const double PI'],
            solucion: mmszPrograma('const double PI = 3.14;\ndouble radio = 5;\ndouble area = PI * radio * radio;\ncout << "Area: " << area << endl;'),
          }),
          mmszPaso('Diámetro', `
            Muestra también el diámetro («2 * radio»): «Diametro: 10».
          `, {
            salida: 'Area: 78.5\nDiametro: 10',
            solucion: mmszPrograma('const double PI = 3.14;\ndouble radio = 5;\ndouble area = PI * radio * radio;\ncout << "Area: " << area << endl;\ncout << "Diametro: " << 2 * radio << endl;'),
          }),
        ]),
        mmszRepaso('primeros pasos', `
          - Estructura: «#include <iostream>», «using namespace std;», «int main() { ... return 0; }».
          - «cout << ... << endl;» muestra y salta de línea.
          - Tipos: «int», «double», «char» ('A'), «bool».
          - «const» crea constantes.
          - Todas las instrucciones terminan en «;».
        `),
      ], [
        mmszElige('¿Qué tipo usarías para guardar 3.75?', ['*double', 'int', 'bool', 'char'], 'double guarda decimales.'),
        mmszCompleta('Completa el tipo de la variable.', '___ edad = 20;', ['int'], 'La edad es un entero.'),
        mmszElige('¿Qué se guarda en «int n = 5.9;»?', ['*5', '6', '5.9'], 'int corta los decimales.'),
        mmszElige('¿Cómo se escribe un char?', ["*'A'", '"A"', 'A'], 'Los char van entre comillas simples.'),
        mmszEscribe('Crea int x = 7, súmale 3 y muéstralo.', mmszPrograma(''), '10', mmszPrograma('int x = 7;\nx = x + 3;\ncout << x << endl;')),
      ]),
    ]),

    mmszUnidad('Básico', 'Operadores', 'Operaciones aritméticas, división entera, módulo, atajos y conversión de tipos.', [
      mmszLeccion('cpp-2-1', 'Operadores aritméticos', '+, -, *, /, % y la librería cmath.', [
        mmszLectura('Hacer cálculos', `
          - «+», «-», «*», «/» y «%» (residuo, solo con enteros).
          - **Ojo:** entre dos «int», «/» hace **división entera**: «7 / 2» es «3».
          - Si uno de los dos es «double», el resultado tiene decimales: «7.0 / 2» es «3.5».

          ~~~run
          #include <iostream>
          using namespace std;

          int main() {
              cout << 7 / 2 << endl;
              cout << 7.0 / 2 << endl;
              cout << 7 % 2 << endl;
              cout << 2 + 3 * 4 << endl;
              return 0;
          }
          ~~~

          ### La librería cmath
          ~~~run
          #include <cmath>
          #include <iostream>
          using namespace std;

          int main() {
              cout << sqrt(16) << endl;
              cout << pow(2, 10) << endl;
              return 0;
          }
          ~~~
        `),
        mmszDesafio('calculadora de notas', [
          mmszPaso('Promedio con decimales', `
            Con «int n1 = 14, n2 = 17, n3 = 12, n4 = 16;», calcula el promedio en un «double». Para que no sea división entera, divide entre «4.0». Muestra «Promedio: 14.75».
          `, {
            inicio: mmszPrograma('int n1 = 14, n2 = 17, n3 = 12, n4 = 16;'),
            salida: 'Promedio: 14.75',
            requiere: ['4.0'],
            solucion: mmszPrograma('int n1 = 14, n2 = 17, n3 = 12, n4 = 16;\ndouble promedio = (n1 + n2 + n3 + n4) / 4.0;\ncout << "Promedio: " << promedio << endl;'),
          }),
        ]),
      ], [
        mmszElige('¿Qué muestra «cout << 9 / 2;»?', ['*4', '4.5', '5'], 'Entre enteros la división es entera.'),
        mmszElige('¿Qué muestra «cout << 10 % 3;»?', ['*1', '3', '3.33'], 'Sobra 1.'),
        mmszCompleta('Completa para obtener la raíz cuadrada.', 'cout << ___(25);', ['sqrt'], 'sqrt está en <cmath>.'),
        mmszElige('¿Cómo obtienes 3.5 de 7 entre 2?', ['*7.0 / 2', '7 / 2', '7 % 2'], 'Basta con que uno sea double.'),
        mmszEscribe('Muestra el residuo de 17 entre 5.', mmszPrograma(''), '2', mmszPrograma('cout << 17 % 5 << endl;')),
      ]),

      mmszLeccion('cpp-2-2', 'Atajos y conversión de tipos', '+=, ++, -- y casting entre int y double.', [
        mmszLectura('Asignación compuesta e incrementos', `
          ~~~run
          #include <iostream>
          using namespace std;

          int main() {
              int x = 5;
              x += 3;   // 8
              x *= 2;   // 16
              x--;      // 15
              x++;      // 16
              cout << x << endl;
              return 0;
          }
          ~~~

          ### Conversión de tipos (casting)
          Puedes convertir explícitamente con «(tipo)valor» o «static_cast<tipo>(valor)»:

          ~~~run
          #include <iostream>
          using namespace std;

          int main() {
              int total = 7, partes = 2;
              cout << (double)total / partes << endl;
              double precio = 9.99;
              cout << (int)precio << endl;
              char letra = 'A';
              cout << (int)letra << endl;
              return 0;
          }
          ~~~

          > Los «char» son números por dentro: «'A'» vale 65 en la tabla ASCII.
        `),
        mmszDesafio('reparto de caramelos', [
          mmszPaso('División y residuo', `
            Hay «int caramelos = 47» y «int ninos = 5». Muestra cuántos le tocan a cada niño y cuántos sobran: «Cada uno: 9» y «Sobran: 2».
          `, {
            inicio: mmszPrograma('int caramelos = 47;\nint ninos = 5;'),
            salida: 'Cada uno: 9\nSobran: 2',
            requiere: ['/', '%'],
            solucion: mmszPrograma('int caramelos = 47;\nint ninos = 5;\ncout << "Cada uno: " << caramelos / ninos << endl;\ncout << "Sobran: " << caramelos % ninos << endl;'),
          }),
          mmszPaso('Promedio exacto', `
            Muestra también el reparto exacto con decimales usando casting: «Exacto: 9.4».
          `, {
            salida: 'Cada uno: 9\nSobran: 2\nExacto: 9.4',
            requiere: ['(double)'],
            solucion: mmszPrograma('int caramelos = 47;\nint ninos = 5;\ncout << "Cada uno: " << caramelos / ninos << endl;\ncout << "Sobran: " << caramelos % ninos << endl;\ncout << "Exacto: " << (double)caramelos / ninos << endl;'),
          }),
        ]),
        mmszProyecto('conversor de segundos', [
          mmszPaso('Horas, minutos y segundos', `
            Convierte «int total = 3725;» segundos a horas, minutos y segundos usando «/» y «%». Muestra «1h 2m 5s».
          `, {
            inicio: mmszPrograma('int total = 3725;'),
            pista: 'int horas = total / 3600;\nint minutos = (total % 3600) / 60;',
            salida: '1h 2m 5s',
            requiere: ['%'],
            solucion: mmszPrograma('int total = 3725;\nint horas = total / 3600;\nint minutos = (total % 3600) / 60;\nint segundos = total % 60;\ncout << horas << "h " << minutos << "m " << segundos << "s" << endl;'),
          }),
        ]),
        mmszRepaso('operadores', `
          - Entre «int», «/» es división entera; usa un «double» para decimales.
          - «%» da el residuo (solo enteros).
          - Atajos: «+=», «-=», «*=», «/=», «++», «--».
          - Casting: «(double)x», «(int)x», «static_cast<double>(x)».
          - «<cmath>»: «sqrt», «pow», «abs».
        `),
      ], [
        mmszElige('Si «int x = 10; x -= 4;», ¿cuánto vale x?', ['*6', '14', '-4'], 'x = x - 4.'),
        mmszElige('¿Qué muestra «cout << (int)7.8;»?', ['*7', '8', '7.8'], 'El casting a int corta decimales.'),
        mmszCompleta('Completa para sumar 1 a i.', 'i___;', ['++'], 'i++ incrementa.'),
        mmszElige('¿Qué muestra «cout << (double)5 / 2;»?', ['*2.5', '2', '3'], 'Con un double la división tiene decimales.'),
        mmszEscribe('Con int a = 9, b = 4 muestra a / b y a % b separados por espacio.', mmszPrograma('int a = 9, b = 4;'), '2 1', mmszPrograma('int a = 9, b = 4;\ncout << a / b << " " << a % b << endl;')),
      ]),
    ]),

    mmszUnidad('Básico', 'Decisiones', 'if, else, operadores lógicos, switch y el operador ternario.', [
      mmszLeccion('cpp-3-1', 'if, else y lógica', 'Comparaciones, &&, || y ! en condiciones.', [
        mmszLectura('Condiciones', `
          Comparaciones: «==», «!=», «>», «<», «>=», «<=». Lógicos: «&&» (y), «||» (o), «!» (no).

          ~~~run
          #include <iostream>
          using namespace std;

          int main() {
              int nota = 14;
              if (nota >= 18) {
                  cout << "Excelente" << endl;
              } else if (nota >= 11) {
                  cout << "Aprobado" << endl;
              } else {
                  cout << "Desaprobado" << endl;
              }
              int edad = 17;
              if (edad >= 13 && edad <= 19) {
                  cout << "Adolescente" << endl;
              }
              return 0;
          }
          ~~~

          > Error clásico: escribir «if (x = 5)» en vez de «if (x == 5)». El primero **asigna** 5 y siempre es verdadero.
        `),
        mmszDesafio('par o impar', [
          mmszPaso('Revisa', `
            Con «int numero = 7;», muestra «7 es impar» o «7 es par» usando «if/else» y «%».
          `, {
            inicio: mmszPrograma('int numero = 7;'),
            salida: '7 es impar',
            requiere: ['if', 'else', '%'],
            solucion: mmszPrograma('int numero = 7;\nif (numero % 2 == 0) {\n    cout << numero << " es par" << endl;\n} else {\n    cout << numero << " es impar" << endl;\n}'),
          }),
        ]),
      ], [
        mmszElige('¿Cuál compara si a es igual a b?', ['*a == b', 'a = b', 'a === b'], 'En C++ se usa ==.'),
        mmszCompleta('Completa para comprobar si la nota es menor que 11.', 'if (nota ___ 11) {', ['<'], '< significa menor que.'),
        mmszElige('¿Qué valor tiene «(8 >= 8)»?', ['*true', 'false'], '>= incluye el igual.'),
        mmszElige('¿Qué muestra este código?', ['*Saldo insuficiente', 'Compra aprobada', 'Nada'], '50 no es >= 100.', 'int saldo = 50;\nif (saldo >= 100) {\n    cout << "Compra aprobada";\n} else {\n    cout << "Saldo insuficiente";\n}'),
        mmszEscribe('Con int x = -4 muestra "negativo" si x < 0, si no "positivo o cero".', mmszPrograma('int x = -4;'), 'negativo', mmszPrograma('int x = -4;\nif (x < 0) {\n    cout << "negativo" << endl;\n} else {\n    cout << "positivo o cero" << endl;\n}')),
      ]),

      mmszLeccion('cpp-3-2', 'switch y ternario', 'Elegir entre muchos casos y decisiones en una línea.', [
        mmszLectura('switch', `
          «switch» compara una variable entera o «char» con varios valores. Cada «case» termina con «break»:

          ~~~run
          #include <iostream>
          using namespace std;

          int main() {
              int opcion = 2;
              switch (opcion) {
                  case 1:
                      cout << "Nuevo juego" << endl;
                      break;
                  case 2:
                      cout << "Continuar" << endl;
                      break;
                  default:
                      cout << "Opción inválida" << endl;
              }
              return 0;
          }
          ~~~

          ### Operador ternario
          «condición ? valorSiVerdadero : valorSiFalso»:

          ~~~run
          #include <iostream>
          using namespace std;

          int main() {
              int edad = 20;
              cout << (edad >= 18 ? "adulto" : "menor") << endl;
              return 0;
          }
          ~~~
        `),
        mmszDesafio('menú de cafetería', [
          mmszPaso('Precio por opción', `
            Con «int opcion = 3;», usa «switch» para mostrar: 1 → «Cafe: 5», 2 → «Te: 3», 3 → «Jugo: 7», otro → «No existe».
          `, {
            inicio: mmszPrograma('int opcion = 3;'),
            salida: 'Jugo: 7',
            requiere: ['switch', 'case', 'break'],
            solucion: mmszPrograma('int opcion = 3;\nswitch (opcion) {\n    case 1:\n        cout << "Cafe: 5" << endl;\n        break;\n    case 2:\n        cout << "Te: 3" << endl;\n        break;\n    case 3:\n        cout << "Jugo: 7" << endl;\n        break;\n    default:\n        cout << "No existe" << endl;\n}'),
          }),
        ]),
        mmszProyecto('calculadora con menú', [
          mmszPaso('Operación', `
            Con «double a = 12, b = 4;» y «char op = '/';», usa «switch (op)» con los casos «'+'», «'-'», «'*'» y «'/'» para mostrar el resultado: «Resultado: 3».
          `, {
            inicio: mmszPrograma("double a = 12, b = 4;\nchar op = '/';"),
            salida: 'Resultado: 3',
            requiere: ['switch', "case '/'"],
            solucion: mmszPrograma("double a = 12, b = 4;\nchar op = '/';\nswitch (op) {\n    case '+':\n        cout << \"Resultado: \" << a + b << endl;\n        break;\n    case '-':\n        cout << \"Resultado: \" << a - b << endl;\n        break;\n    case '*':\n        cout << \"Resultado: \" << a * b << endl;\n        break;\n    case '/':\n        cout << \"Resultado: \" << a / b << endl;\n        break;\n    default:\n        cout << \"Operador inválido\" << endl;\n}"),
          }),
          mmszPaso('Sin divisor', `
            Dentro del «case '/'», usa el ternario o un «if» para que, si «b == 0», se muestre «No se puede dividir». (Con b = 4 la salida no cambia.)
          `, {
            salida: 'Resultado: 3',
            requiere: ['b == 0'],
            solucion: mmszPrograma("double a = 12, b = 4;\nchar op = '/';\nswitch (op) {\n    case '+':\n        cout << \"Resultado: \" << a + b << endl;\n        break;\n    case '-':\n        cout << \"Resultado: \" << a - b << endl;\n        break;\n    case '*':\n        cout << \"Resultado: \" << a * b << endl;\n        break;\n    case '/':\n        if (b == 0) {\n            cout << \"No se puede dividir\" << endl;\n        } else {\n            cout << \"Resultado: \" << a / b << endl;\n        }\n        break;\n    default:\n        cout << \"Operador inválido\" << endl;\n}"),
          }),
        ]),
        mmszRepaso('decisiones', `
          - «if (cond) { } else if (cond) { } else { }».
          - «&&», «||», «!»; cuidado con «=» vs «==».
          - «switch (variable) { case valor: ... break; default: ... }» para int y char.
          - Ternario: «cond ? a : b».
        `),
      ], [
        mmszElige('¿Qué tipos acepta switch en C++?', ['*Enteros y char', 'Solo string', 'Cualquier tipo'], 'switch trabaja con valores enteros (incluido char).'),
        mmszElige('¿Qué pasa si olvidas break?', ['*Se ejecuta también el siguiente case', 'Error de compilación', 'Nada'], 'El switch "cae" al siguiente case.'),
        mmszCompleta('Completa el caso por defecto.', 'switch (x) {\n    case 1: cout << "uno"; break;\n    ___: cout << "otro";\n}', ['default'], 'default es el caso restante.'),
        mmszElige('¿Qué muestra «cout << (5 > 3 ? "si" : "no");»?', ['*si', 'no', '1'], 'La condición es verdadera.'),
        mmszOrdena('Ordena el bloque.', ['if (edad >= 18) {', '    cout << "Mayor de edad";', '} else {', '    cout << "Menor de edad";', '}'], 'if con su bloque, luego else.'),
      ]),
    ]),

    /* ============================= INTERMEDIO ============================= */
    mmszUnidad('Intermedio', 'Bucles', 'Repetir instrucciones con for, while y do-while.', [
      mmszLeccion('cpp-4-1', 'Bucle for', 'Inicio; condición; paso. Acumuladores y bucles anidados.', [
        mmszLectura('El bucle for', `
          ~~~run
          #include <iostream>
          using namespace std;

          int main() {
              for (int i = 1; i <= 5; i++) {
                  cout << i << " ";
              }
              cout << endl;
              int suma = 0;
              for (int i = 1; i <= 100; i++) {
                  suma += i;
              }
              cout << "Suma 1..100 = " << suma << endl;
              return 0;
          }
          ~~~

          ### Bucles anidados
          Un bucle dentro de otro sirve para tablas y patrones:

          ~~~run
          #include <iostream>
          using namespace std;

          int main() {
              for (int fila = 1; fila <= 3; fila++) {
                  for (int col = 1; col <= fila; col++) {
                      cout << "*";
                  }
                  cout << endl;
              }
              return 0;
          }
          ~~~
        `),
        mmszDesafio('tabla de multiplicar', [
          mmszPaso('Tabla del 7', `
            Muestra la tabla del 7 del 1 al 5: «7 x 1 = 7» … «7 x 5 = 35».
          `, {
            inicio: mmszPrograma('int numero = 7;'),
            salida: '7 x 1 = 7\n7 x 2 = 14\n7 x 3 = 21\n7 x 4 = 28\n7 x 5 = 35',
            requiere: ['for'],
            solucion: mmszPrograma('int numero = 7;\nfor (int i = 1; i <= 5; i++) {\n    cout << numero << " x " << i << " = " << numero * i << endl;\n}'),
          }),
          mmszPaso('Suma', `
            Acumula los resultados y muestra al final «Suma: 105».
          `, {
            salida: '7 x 1 = 7\n7 x 2 = 14\n7 x 3 = 21\n7 x 4 = 28\n7 x 5 = 35\nSuma: 105',
            solucion: mmszPrograma('int numero = 7;\nint suma = 0;\nfor (int i = 1; i <= 5; i++) {\n    cout << numero << " x " << i << " = " << numero * i << endl;\n    suma += numero * i;\n}\ncout << "Suma: " << suma << endl;'),
          }),
        ]),
      ], [
        mmszElige('¿Qué muestra «for (int i = 0; i < 3; i++) cout << i;»?', ['*012', '123', '0123'], 'Se detiene cuando i llega a 3.'),
        mmszCompleta('Completa para que el bucle se repita 5 veces (i de 0 a 4).', 'for (int i = 0; i ___ 5; i++) {', ['<'], 'i < 5.'),
        mmszOrdena('Ordena para sumar 1 + 2 + 3.', ['int suma = 0;', 'for (int i = 1; i <= 3; i++) {', '    suma += i;', '}', 'cout << suma;'], 'Acumulador antes, suma dentro, resultado después.'),
        mmszElige('¿Cuántos * muestra un for anidado de 3 filas × 4 columnas?', ['*12', '7', '4'], '3 × 4 = 12.'),
        mmszEscribe('Muestra los números pares del 2 al 10 separados por espacios.', mmszPrograma(''), '2 4 6 8 10', mmszPrograma('for (int i = 2; i <= 10; i += 2) {\n    cout << i << " ";\n}\ncout << endl;')),
      ]),

      mmszLeccion('cpp-4-2', 'while y do-while', 'Repetir mientras se cumpla una condición; break y continue.', [
        mmszLectura('while y do-while', `
          ~~~run
          #include <iostream>
          using namespace std;

          int main() {
              int n = 3;
              while (n > 0) {
                  cout << n << " ";
                  n--;
              }
              cout << "Despegue!" << endl;

              int x = 10;
              do {
                  cout << "do-while se ejecuta al menos una vez" << endl;
              } while (x < 5);
              return 0;
          }
          ~~~

          «break» sale del bucle y «continue» salta a la siguiente vuelta.

          > «do-while» es ideal para menús: muestras las opciones al menos una vez y repites mientras el usuario no elija salir.
        `),
        mmszDesafio('suma de dígitos', [
          mmszPaso('Separa los dígitos', `
            Con «int n = 4728;», usa «while (n > 0)»: en cada vuelta suma «n % 10» y luego haz «n /= 10». Muestra «Suma: 21».
          `, {
            inicio: mmszPrograma('int n = 4728;\nint suma = 0;'),
            salida: 'Suma: 21',
            requiere: ['while', '% 10'],
            solucion: mmszPrograma('int n = 4728;\nint suma = 0;\nwhile (n > 0) {\n    suma += n % 10;\n    n /= 10;\n}\ncout << "Suma: " << suma << endl;'),
          }),
        ]),
        mmszProyecto('números primos', [
          mmszPaso('¿Es primo?', `
            Con «int n = 29;», prueba divisores de 2 a n-1; si alguno divide exacto, marca «esPrimo = false» y usa «break». Muestra «29 es primo».
          `, {
            inicio: mmszPrograma('int n = 29;\nbool esPrimo = true;'),
            salida: '29 es primo',
            requiere: ['break'],
            solucion: mmszPrograma('int n = 29;\nbool esPrimo = true;\nfor (int d = 2; d < n; d++) {\n    if (n % d == 0) {\n        esPrimo = false;\n        break;\n    }\n}\nif (esPrimo) {\n    cout << n << " es primo" << endl;\n} else {\n    cout << n << " no es primo" << endl;\n}'),
          }),
          mmszPaso('Primos hasta 20', `
            Agrega un bucle anidado que muestre en una línea los primos del 2 al 20: «2 3 5 7 11 13 17 19 ».
          `, {
            salida: '29 es primo\n2 3 5 7 11 13 17 19',
            solucion: mmszPrograma('int n = 29;\nbool esPrimo = true;\nfor (int d = 2; d < n; d++) {\n    if (n % d == 0) {\n        esPrimo = false;\n        break;\n    }\n}\nif (esPrimo) {\n    cout << n << " es primo" << endl;\n} else {\n    cout << n << " no es primo" << endl;\n}\nfor (int k = 2; k <= 20; k++) {\n    bool primo = true;\n    for (int d = 2; d < k; d++) {\n        if (k % d == 0) {\n            primo = false;\n            break;\n        }\n    }\n    if (primo) cout << k << " ";\n}\ncout << endl;'),
          }),
        ]),
        mmszRepaso('bucles', `
          - «for (int i = 0; i < n; i++) { }»: repetir n veces.
          - «while (cond) { }»: repetir mientras se cumpla.
          - «do { } while (cond);»: al menos una vez (¡con punto y coma al final!).
          - «break» sale; «continue» salta.
          - Truco: «n % 10» da el último dígito y «n /= 10» lo quita.
        `),
      ], [
        mmszElige('¿Qué muestra este código?', ['*3 2 1', '3 2 1 0', '1 2 3'], 'Termina cuando n es 0.', 'int n = 3;\nwhile (n > 0) {\n    cout << n << " ";\n    n--;\n}'),
        mmszElige('¿Qué tiene de especial do-while?', ['*Se ejecuta al menos una vez', 'Es más rápido', 'No usa condición'], 'Revisa la condición al final.'),
        mmszCompleta('Completa para que n aumente.', 'int n = 1;\nwhile (n <= 5) {\n    cout << n;\n    n___;\n}', ['++', '+= 1', '+=1'], 'Sin esto sería infinito.'),
        mmszElige('¿Qué muestra este código?', ['*10', 'Nada', 'Infinito'], 'do-while ejecuta una vez.', 'int x = 10;\ndo {\n    cout << x;\n} while (x < 5);'),
        mmszEscribe('Usa while para mostrar 10 20 30 separados por espacios.', mmszPrograma('int n = 10;'), '10 20 30', mmszPrograma('int n = 10;\nwhile (n <= 30) {\n    cout << n << " ";\n    n += 10;\n}\ncout << endl;')),
      ]),
    ]),

    mmszUnidad('Intermedio', 'Funciones', 'Funciones con tipo de retorno, void, parámetros, prototipos y recursión.', [
      mmszLeccion('cpp-5-1', 'Crear funciones', 'void, parámetros y prototipos.', [
        mmszLectura('Funciones', `
          Una función indica qué **tipo** devuelve («int», «double»…) o «void» si no devuelve nada:

          ~~~run
          #include <iostream>
          using namespace std;

          void saludar(int veces) {
              for (int i = 0; i < veces; i++) {
                  cout << "Hola" << endl;
              }
          }

          int main() {
              saludar(2);
              return 0;
          }
          ~~~

          ### Prototipos
          Si escribes la función **después** de «main», debes declararla antes con un **prototipo**:

          ~~~run
          #include <iostream>
          using namespace std;

          double area(double base, double altura);  // prototipo

          int main() {
              cout << area(4, 5) << endl;
              return 0;
          }

          double area(double base, double altura) {
              return base * altura / 2;
          }
          ~~~
        `),
        mmszDesafio('di tu nombre', [
          mmszPaso('Función void', `
            Crea «void linea(int n)» que muestre «n» guiones seguidos y un salto de línea. Llámala con 5 y luego con 3.
          `, {
            inicio: mmszPrograma('// llama a tu función aquí'),
            salida: '-----\n---',
            requiere: ['void linea'],
            solucion: mmszPrograma('linea(5);\nlinea(3);', 'void linea(int n) {\n    for (int i = 0; i < n; i++) {\n        cout << "-";\n    }\n    cout << endl;\n}'),
          }),
        ]),
      ], [
        mmszElige('¿Qué significa void?', ['*Que la función no devuelve valor', 'Que está vacía', 'Que es privada'], 'void = vacío.'),
        mmszCompleta('Completa el tipo de esta función que solo muestra un mensaje.', '___ saludar() {\n    cout << "Hola";\n}', ['void'], 'No devuelve nada.'),
        mmszOrdena('Ordena el programa.', ['void saludar() {', '    cout << "Hola";', '}', 'int main() {', '    saludar();', '    return 0;', '}'], 'La función antes de main.'),
        mmszElige('¿Qué pasa si defines la función después de main sin prototipo?', ['*Error de compilación', 'Funciona igual', 'Se ignora'], 'main todavía no la conoce.'),
        mmszEscribe('Crea void doble(int x) que muestre x * 2 y llámala con 21.', mmszPrograma(''), '42', mmszPrograma('doble(21);', 'void doble(int x) {\n    cout << x * 2 << endl;\n}')),
      ]),

      mmszLeccion('cpp-5-2', 'return y recursión', 'Devolver valores y funciones que se llaman a sí mismas.', [
        mmszLectura('return', `
          ~~~run
          #include <iostream>
          using namespace std;

          int maximo(int a, int b) {
              if (a > b) return a;
              return b;
          }

          int main() {
              cout << maximo(8, 13) << endl;
              cout << maximo(3, 1) + 10 << endl;
              return 0;
          }
          ~~~

          ### Recursión
          Una función recursiva se llama a sí misma y necesita un **caso base**:

          ~~~run
          #include <iostream>
          using namespace std;

          int factorial(int n) {
              if (n <= 1) return 1;
              return n * factorial(n - 1);
          }

          int main() {
              cout << factorial(5) << endl;
              return 0;
          }
          ~~~
        `),
        mmszDesafio('Fibonacci', [
          mmszPaso('Recursivo', `
            Crea «int fib(int n)» recursiva (fib(0)=0, fib(1)=1) y muestra «fib(10)».
          `, {
            inicio: mmszPrograma('cout << fib(10) << endl;'),
            salida: '55',
            requiere: ['int fib', 'return'],
            solucion: mmszPrograma('cout << fib(10) << endl;', 'int fib(int n) {\n    if (n < 2) return n;\n    return fib(n - 1) + fib(n - 2);\n}'),
          }),
          mmszPaso('Serie', `
            Muestra los primeros 10 valores en una línea: «0 1 1 2 3 5 8 13 21 34».
          `, {
            salida: '55\n0 1 1 2 3 5 8 13 21 34',
            solucion: mmszPrograma('cout << fib(10) << endl;\nfor (int i = 0; i < 10; i++) {\n    cout << fib(i) << " ";\n}\ncout << endl;', 'int fib(int n) {\n    if (n < 2) return n;\n    return fib(n - 1) + fib(n - 2);\n}'),
          }),
        ]),
        mmszProyecto('máximo común divisor', [
          mmszPaso('Algoritmo de Euclides', `
            El MCD de a y b es: si «b == 0», es «a»; si no, es «mcd(b, a % b)». Implementa «int mcd(int a, int b)» recursiva y muestra «mcd(48, 18)».
          `, {
            inicio: mmszPrograma(''),
            salida: '6',
            requiere: ['int mcd'],
            solucion: mmszPrograma('cout << mcd(48, 18) << endl;', 'int mcd(int a, int b) {\n    if (b == 0) return a;\n    return mcd(b, a % b);\n}'),
          }),
          mmszPaso('Mínimo común múltiplo', `
            Usa tu MCD para crear «mcm(a, b) = a / mcd(a, b) * b» y muestra «mcm(4, 6)».
          `, {
            salida: '6\n12',
            requiere: ['int mcm'],
            solucion: mmszPrograma('cout << mcd(48, 18) << endl;\ncout << mcm(4, 6) << endl;', 'int mcd(int a, int b) {\n    if (b == 0) return a;\n    return mcd(b, a % b);\n}\n\nint mcm(int a, int b) {\n    return a / mcd(a, b) * b;\n}'),
          }),
        ]),
        mmszRepaso('funciones', `
          - «tipo nombre(parámetros) { return valor; }»; «void» si no devuelve nada.
          - Define la función antes de «main» o usa un **prototipo**.
          - Cada parámetro lleva su tipo: «int sumar(int a, int b)».
          - Recursión: la función se llama a sí misma; siempre con caso base.
        `),
      ], [
        mmszElige('¿Qué muestra «cout << doble(6);» si doble devuelve x * 2?', ['*12', '6', '62'], 'Devuelve 12.'),
        mmszCompleta('Completa el tipo de retorno.', '___ sumar(int a, int b) {\n    return a + b;\n}', ['int'], 'Sumar dos int da int.'),
        mmszElige('¿Qué muestra «cout << dividir(7, 2);» si dividir devuelve a / b con int?', ['*3', '3.5', '4'], 'División entera.'),
        mmszElige('¿Qué muestra factorial(4)?', ['*24', '10', '16'], '4×3×2×1.'),
        mmszEscribe('Crea int cuadrado(int n) y muestra cuadrado(9).', mmszPrograma(''), '81', mmszPrograma('cout << cuadrado(9) << endl;', 'int cuadrado(int n) {\n    return n * n;\n}')),
      ]),
    ]),

    mmszUnidad('Intermedio', 'Arreglos', 'Arreglos de una y dos dimensiones, recorridos y arreglos en funciones.', [
      mmszLeccion('cpp-6-1', 'Arreglos', 'Declarar, inicializar y recorrer arreglos.', [
        mmszLectura('Arreglos', `
          Un arreglo guarda varios valores **del mismo tipo** con un tamaño fijo:

          ~~~run
          #include <iostream>
          using namespace std;

          int main() {
              int notas[5] = {14, 18, 11, 16, 20};
              cout << notas[0] << " " << notas[4] << endl;
              notas[2] = 13;
              int suma = 0;
              for (int i = 0; i < 5; i++) {
                  suma += notas[i];
              }
              cout << "Promedio: " << suma / 5.0 << endl;
              return 0;
          }
          ~~~

          - Los índices van de **0** a **tamaño - 1**.
          - C++ **no revisa** si te sales del arreglo: «notas[10]» lee basura de memoria. ¡Cuidado!
        `),
        mmszDesafio('estadísticas del salón', [
          mmszPaso('Mayor y menor', `
            Con «int notas[6] = {12, 17, 9, 15, 20, 11};», recorre el arreglo para encontrar la mayor y la menor. Muestra «Mayor: 20» y «Menor: 9».
          `, {
            inicio: mmszPrograma('int notas[6] = {12, 17, 9, 15, 20, 11};'),
            salida: 'Mayor: 20\nMenor: 9',
            requiere: ['for'],
            solucion: mmszPrograma('int notas[6] = {12, 17, 9, 15, 20, 11};\nint mayor = notas[0], menor = notas[0];\nfor (int i = 1; i < 6; i++) {\n    if (notas[i] > mayor) mayor = notas[i];\n    if (notas[i] < menor) menor = notas[i];\n}\ncout << "Mayor: " << mayor << endl;\ncout << "Menor: " << menor << endl;'),
          }),
          mmszPaso('Aprobados', `
            Cuenta las notas >= 11 y muestra «Aprobados: 5».
          `, {
            salida: 'Mayor: 20\nMenor: 9\nAprobados: 5',
            solucion: mmszPrograma('int notas[6] = {12, 17, 9, 15, 20, 11};\nint mayor = notas[0], menor = notas[0];\nfor (int i = 1; i < 6; i++) {\n    if (notas[i] > mayor) mayor = notas[i];\n    if (notas[i] < menor) menor = notas[i];\n}\ncout << "Mayor: " << mayor << endl;\ncout << "Menor: " << menor << endl;\nint aprobados = 0;\nfor (int i = 0; i < 6; i++) {\n    if (notas[i] >= 11) aprobados++;\n}\ncout << "Aprobados: " << aprobados << endl;'),
          }),
        ]),
      ], [
        mmszElige('En «int a[5]», ¿cuál es el último índice válido?', ['*4', '5', '6'], 'Va de 0 a 4.'),
        mmszCompleta('Completa la declaración de 3 enteros.', 'int numeros___ = {1, 2, 3};', ['[3]', '[]'], 'El tamaño va entre corchetes.'),
        mmszElige('¿Qué pasa si lees a[10] en un arreglo de 5?', ['*Comportamiento indefinido (basura)', 'Error siempre', 'Devuelve 0'], 'C++ no revisa los límites.'),
        mmszElige('¿Qué muestra este código?', ['*6', '3', '123'], '1 + 2 + 3.', 'int a[3] = {1, 2, 3};\nint s = 0;\nfor (int i = 0; i < 3; i++) s += a[i];\ncout << s;'),
        mmszEscribe('Con int a[4] = {4, 8, 15, 16}, muestra a[0] + a[3].', mmszPrograma('int a[4] = {4, 8, 15, 16};'), '20', mmszPrograma('int a[4] = {4, 8, 15, 16};\ncout << a[0] + a[3] << endl;')),
      ]),

      mmszLeccion('cpp-6-2', 'Matrices y arreglos en funciones', 'Arreglos de dos dimensiones y cómo pasarlos a funciones.', [
        mmszLectura('Matrices', `
          Una **matriz** es un arreglo de dos dimensiones (filas × columnas):

          ~~~run
          #include <iostream>
          using namespace std;

          int main() {
              int m[2][3] = {{1, 2, 3}, {4, 5, 6}};
              for (int f = 0; f < 2; f++) {
                  for (int c = 0; c < 3; c++) {
                      cout << m[f][c] << " ";
                  }
                  cout << endl;
              }
              return 0;
          }
          ~~~

          ### Arreglos en funciones
          Se pasan junto con su tamaño (la función no sabe cuántos elementos tiene):

          ~~~run
          #include <iostream>
          using namespace std;

          int sumar(int a[], int n) {
              int s = 0;
              for (int i = 0; i < n; i++) s += a[i];
              return s;
          }

          int main() {
              int datos[4] = {5, 10, 15, 20};
              cout << sumar(datos, 4) << endl;
              return 0;
          }
          ~~~

          > Los arreglos se pasan "por referencia": si la función los modifica, el cambio se ve afuera.
        `),
        mmszDesafio('suma de filas', [
          mmszPaso('Total por fila', `
            Con la matriz «ventas[3][4]» (3 vendedores, 4 semanas), muestra el total de cada vendedor: «Vendedor 1: 100», etc.
          `, {
            inicio: mmszPrograma('int ventas[3][4] = {{10, 20, 30, 40}, {5, 5, 5, 5}, {50, 0, 25, 25}};'),
            salida: 'Vendedor 1: 100\nVendedor 2: 20\nVendedor 3: 100',
            requiere: ['for'],
            solucion: mmszPrograma('int ventas[3][4] = {{10, 20, 30, 40}, {5, 5, 5, 5}, {50, 0, 25, 25}};\nfor (int f = 0; f < 3; f++) {\n    int total = 0;\n    for (int c = 0; c < 4; c++) {\n        total += ventas[f][c];\n    }\n    cout << "Vendedor " << f + 1 << ": " << total << endl;\n}'),
          }),
        ]),
        mmszProyecto('ordenamiento burbuja', [
          mmszPaso('Ordena', `
            Implementa «void ordenar(int a[], int n)» con el método burbuja: recorre el arreglo varias veces e intercambia elementos vecinos si están desordenados. Ordena «{5, 2, 9, 1, 7}» y muéstralo: «1 2 5 7 9».
          `, {
            inicio: mmszPrograma('int a[5] = {5, 2, 9, 1, 7};'),
            pista: 'if (a[j] > a[j + 1]) {\n    int tmp = a[j];\n    a[j] = a[j + 1];\n    a[j + 1] = tmp;\n}',
            salida: '1 2 5 7 9',
            requiere: ['void ordenar'],
            solucion: mmszPrograma('int a[5] = {5, 2, 9, 1, 7};\nordenar(a, 5);\nfor (int i = 0; i < 5; i++) cout << a[i] << " ";\ncout << endl;', 'void ordenar(int a[], int n) {\n    for (int i = 0; i < n - 1; i++) {\n        for (int j = 0; j < n - 1 - i; j++) {\n            if (a[j] > a[j + 1]) {\n                int tmp = a[j];\n                a[j] = a[j + 1];\n                a[j + 1] = tmp;\n            }\n        }\n    }\n}'),
          }),
          mmszPaso('Búsqueda binaria', `
            Con el arreglo ya ordenado, implementa «int buscar(int a[], int n, int x)» con búsqueda binaria que devuelva la posición o -1. Muestra «buscar(a, 5, 7)» y «buscar(a, 5, 4)».
          `, {
            salida: '1 2 5 7 9\n3\n-1',
            requiere: ['int buscar'],
            solucion: mmszPrograma('int a[5] = {5, 2, 9, 1, 7};\nordenar(a, 5);\nfor (int i = 0; i < 5; i++) cout << a[i] << " ";\ncout << endl;\ncout << buscar(a, 5, 7) << endl;\ncout << buscar(a, 5, 4) << endl;', 'void ordenar(int a[], int n) {\n    for (int i = 0; i < n - 1; i++) {\n        for (int j = 0; j < n - 1 - i; j++) {\n            if (a[j] > a[j + 1]) {\n                int tmp = a[j];\n                a[j] = a[j + 1];\n                a[j + 1] = tmp;\n            }\n        }\n    }\n}\n\nint buscar(int a[], int n, int x) {\n    int bajo = 0, alto = n - 1;\n    while (bajo <= alto) {\n        int medio = (bajo + alto) / 2;\n        if (a[medio] == x) return medio;\n        if (a[medio] < x) bajo = medio + 1;\n        else alto = medio - 1;\n    }\n    return -1;\n}'),
          }),
        ]),
        mmszRepaso('arreglos', `
          - «tipo nombre[tamaño] = {...};»; índices de 0 a tamaño-1.
          - C++ no revisa límites: ¡cuidado con salirte!
          - Matrices: «int m[filas][columnas]» y dos bucles anidados.
          - En funciones: «void f(int a[], int n)»; los cambios se ven afuera.
          - Algoritmos clásicos: burbuja (ordenar) y búsqueda binaria (buscar en ordenado).
        `),
      ], [
        mmszElige('En «int m[2][3]», ¿cuántos elementos hay?', ['*6', '5', '3'], '2 × 3.'),
        mmszCompleta('Completa el acceso a la fila 1, columna 2.', 'cout << m[1]___;', ['[2]'], 'Se usa m[fila][columna].'),
        mmszElige('¿Por qué se pasa el tamaño junto al arreglo?', ['*La función no sabe cuántos elementos tiene', 'Es opcional por estilo', 'Para copiarlo'], 'El arreglo no guarda su tamaño.'),
        mmszElige('¿Qué necesita la búsqueda binaria?', ['*Que el arreglo esté ordenado', 'Que sea de char', 'Una matriz'], 'Solo funciona en datos ordenados.'),
        mmszEscribe('Muestra la suma de la diagonal de {{1,2},{3,4}}.', mmszPrograma('int m[2][2] = {{1, 2}, {3, 4}};'), '5', mmszPrograma('int m[2][2] = {{1, 2}, {3, 4}};\ncout << m[0][0] + m[1][1] << endl;')),
      ]),
    ]),

    /* ============================== AVANZADO ============================== */
    mmszUnidad('Avanzado', 'Punteros y referencias', 'Direcciones de memoria, punteros, referencias y paso de parámetros.', [
      mmszLeccion('cpp-7-1', 'Punteros', 'El operador &, el operador * y punteros como parámetros.', [
        mmszLectura('¿Qué es un puntero?', `
          Cada variable vive en una **dirección de memoria**. Un **puntero** es una variable que guarda esa dirección.

          - «&x» da la dirección de «x».
          - «int *p = &x;» crea un puntero a «x».
          - «*p» accede (lee o cambia) al valor apuntado.

          ~~~run
          #include <iostream>
          using namespace std;

          int main() {
              int vidas = 3;
              int *p = &vidas;
              *p = 5;
              cout << vidas << " " << *p << endl;
              return 0;
          }
          ~~~

          ### Punteros como parámetros
          Permiten que una función **modifique** variables de quien la llama:

          ~~~run
          #include <iostream>
          using namespace std;

          void duplicar(int *x) {
              *x = *x * 2;
          }

          int main() {
              int n = 21;
              duplicar(&n);
              cout << n << endl;
              return 0;
          }
          ~~~

          > Un puntero que no apunta a nada debe valer «nullptr». Usar un puntero inválido hace que el programa se caiga.
        `),
        mmszDesafio('intercambiar valores', [
          mmszPaso('swap con punteros', `
            Crea «void intercambiar(int *a, int *b)» que intercambie los valores. Con «x = 3» e «y = 8», llámala y muestra «8 3».
          `, {
            inicio: mmszPrograma('int x = 3, y = 8;'),
            pista: 'int tmp = *a;\n*a = *b;\n*b = tmp;',
            salida: '8 3',
            requiere: ['int *a', '&x'],
            solucion: mmszPrograma('int x = 3, y = 8;\nintercambiar(&x, &y);\ncout << x << " " << y << endl;', 'void intercambiar(int *a, int *b) {\n    int tmp = *a;\n    *a = *b;\n    *b = tmp;\n}'),
          }),
        ]),
      ], [
        mmszElige('¿Qué devuelve «&x»?', ['*La dirección de memoria de x', 'El valor de x', 'Una copia de x'], '& obtiene la dirección.'),
        mmszCompleta('Completa para leer el valor apuntado.', 'int *p = &x;\ncout << ___p;', ['*'], '* desreferencia el puntero.'),
        mmszElige('¿Qué muestra este código?', ['*20', '10', 'una dirección'], '*p cambia el valor de v.', 'int v = 10;\nint *p = &v;\n*p = 20;\ncout << v;'),
        mmszElige('¿Qué valor usar para un puntero que no apunta a nada?', ['*nullptr', '0.0', '"vacio"'], 'nullptr indica puntero nulo.'),
        mmszEscribe('Con int a = 5 y un puntero p a a, súmale 10 usando *p y muestra a.', mmszPrograma('int a = 5;\nint *p = &a;'), '15', mmszPrograma('int a = 5;\nint *p = &a;\n*p += 10;\ncout << a << endl;')),
      ]),

      mmszLeccion('cpp-7-2', 'Referencias', 'Alias de variables y paso por referencia.', [
        mmszLectura('Referencias', `
          Una **referencia** es un **alias** (otro nombre) para una variable existente. Se declara con «&» después del tipo:

          ~~~
          int edad = 20;
          int &alias = edad;
          alias = 21;          // también cambia edad
          cout << edad;        // 21
          ~~~

          ### Paso por referencia
          Es la forma moderna (más simple que los punteros) de que una función modifique sus argumentos:

          ~~~
          void incrementar(int &x) {
              x++;
          }

          int main() {
              int n = 5;
              incrementar(n);   // sin &: se pasa normal
              cout << n;        // 6
          }
          ~~~

          - **Por valor** «void f(int x)»: la función recibe una copia; el original no cambia.
          - **Por referencia** «void f(int &x)»: la función trabaja con el original.
          - «const int &x»: evita copiar datos grandes sin permitir modificarlos.

          > El simulador de Novexa todavía no ejecuta referencias; en estos ejercicios se revisa tu código.
        `),
        mmszDesafio('paso por referencia', [
          mmszPaso('Intercambiar con referencias', `
            Reescribe «intercambiar» usando referencias: «void intercambiar(int &a, int &b)». Llámala como «intercambiar(x, y);» (sin «&» en la llamada).
          `, {
            inicio: mmszPrograma('int x = 3, y = 8;\n// llama a intercambiar y muestra x e y'),
            requiere: ['int &a', 'int &b', 'intercambiar(x, y)'],
            solucion: mmszPrograma('int x = 3, y = 8;\nintercambiar(x, y);\ncout << x << " " << y << endl;', 'void intercambiar(int &a, int &b) {\n    int tmp = a;\n    a = b;\n    b = tmp;\n}'),
          }),
        ]),
        mmszProyecto('estadísticas por referencia', [
          mmszPaso('Varios resultados', `
            Crea «void estadisticas(int a[], int n, int &mayor, int &menor, double &promedio)» que calcule los tres valores a la vez. En «main», declara las variables, llama a la función y muéstralas.
          `, {
            inicio: mmszPrograma('int notas[5] = {12, 18, 9, 15, 20};'),
            requiere: ['int &mayor', 'int &menor', 'double &promedio', 'estadisticas(notas'],
            solucion: mmszPrograma('int notas[5] = {12, 18, 9, 15, 20};\nint mayor, menor;\ndouble promedio;\nestadisticas(notas, 5, mayor, menor, promedio);\ncout << mayor << " " << menor << " " << promedio << endl;', 'void estadisticas(int a[], int n, int &mayor, int &menor, double &promedio) {\n    mayor = a[0];\n    menor = a[0];\n    int suma = 0;\n    for (int i = 0; i < n; i++) {\n        if (a[i] > mayor) mayor = a[i];\n        if (a[i] < menor) menor = a[i];\n        suma += a[i];\n    }\n    promedio = (double)suma / n;\n}'),
          }),
        ]),
        mmszRepaso('punteros y referencias', `
          - «&x» dirección; «int *p = &x;» puntero; «*p» valor apuntado.
          - «nullptr» para punteros vacíos.
          - Referencia: «int &r = x;» es otro nombre para x.
          - Parámetros: por valor (copia), por puntero («int *x»), por referencia («int &x»).
          - Usa «const T &» para pasar datos grandes sin copiarlos.
        `),
      ], [
        mmszElige('¿Qué es una referencia?', ['*Otro nombre para una variable existente', 'Una copia', 'Una dirección de memoria'], 'Es un alias.'),
        mmszElige('Con «void f(int x)», si f cambia x, ¿cambia el original?', ['*No, recibe una copia', 'Sí', 'Solo si es int'], 'Paso por valor.'),
        mmszCompleta('Completa para recibir por referencia.', 'void incrementar(int ___x) {\n    x++;\n}', ['&'], 'int &x.'),
        mmszElige('¿Qué muestra este código?', ['*6', '5', 'Error'], 'La función modifica el original.', 'void inc(int &x) { x++; }\n// en main:\nint n = 5;\ninc(n);\ncout << n;'),
        mmszElige('¿Para qué sirve «const string &s» en un parámetro?', ['*Evitar copiar sin permitir modificar', 'Hacer el texto más largo', 'Convertir a número'], 'Eficiente y seguro.'),
      ]),
    ]),

    mmszUnidad('Avanzado', 'Strings y vectores', 'Textos con std::string y listas dinámicas con std::vector.', [
      mmszLeccion('cpp-8-1', 'std::string', 'Textos: unir, comparar, longitud y recorrer.', [
        mmszLectura('La clase string', `
          «string» (de la librería «<string>») guarda texto y crece según lo necesites:

          ~~~
          #include <iostream>
          #include <string>
          using namespace std;

          int main() {
              string nombre = "Ana";
              string saludo = "Hola, " + nombre + "!";
              cout << saludo << endl;
              cout << saludo.length() << endl;     // 10
              cout << saludo[0] << endl;           // H
              cout << saludo.substr(0, 4) << endl; // Hola
              if (nombre == "Ana") cout << "Es Ana" << endl;
              return 0;
          }
          ~~~

          Métodos útiles: «length()», «substr(inicio, cantidad)», «find(texto)», «append()», «empty()», y «getline(cin, linea)» para leer una línea completa.

          ### Recorrer un string
          ~~~
          string palabra = "hola";
          for (char c : palabra) {
              cout << c << "-";
          }
          ~~~

          > El simulador de Novexa todavía no ejecuta «string»; en esta unidad se revisa tu código.
        `),
        mmszDesafio('palíndromo', [
          mmszPaso('¿Se lee igual al revés?', `
            Escribe «bool esPalindromo(string s)» que compare los caracteres desde los extremos hacia el centro. Prueba con «"reconocer"».
          `, {
            inicio: '#include <iostream>\n#include <string>\nusing namespace std;\n\n// tu función aquí\n\nint main() {\n    cout << esPalindromo("reconocer") << endl;\n    return 0;\n}',
            requiere: ['#include <string>', 'bool esPalindromo(string', '.length()'],
            solucion: '#include <iostream>\n#include <string>\nusing namespace std;\n\nbool esPalindromo(string s) {\n    int i = 0, j = s.length() - 1;\n    while (i < j) {\n        if (s[i] != s[j]) return false;\n        i++;\n        j--;\n    }\n    return true;\n}\n\nint main() {\n    cout << esPalindromo("reconocer") << endl;\n    return 0;\n}',
          }),
        ]),
      ], [
        mmszElige('¿Qué librería necesitas para usar string?', ['*<string>', '<text>', '<cstring> solamente'], 'string está en <string>.'),
        mmszElige('Si «s = "Novexa"», ¿qué devuelve «s.length()»?', ['*6', '5', '7'], 'Tiene 6 letras.'),
        mmszCompleta('Completa para obtener "Hola" de "Hola mundo".', 'string t = s.___(0, 4);', ['substr'], 'substr(inicio, cantidad).'),
        mmszElige('¿Cómo unes dos strings a y b?', ['*a + b', 'a . b', 'join(a, b)'], 'El operador + concatena.'),
        mmszElige('¿Qué hace «getline(cin, linea)»?', ['*Lee una línea completa con espacios', 'Lee una palabra', 'Muestra una línea'], 'cin >> lee solo hasta el espacio.'),
      ]),

      mmszLeccion('cpp-8-2', 'std::vector', 'Arreglos dinámicos: push_back, size, recorridos y algoritmos.', [
        mmszLectura('vector', `
          Un «vector» (de «<vector>») es un arreglo que **crece** automáticamente:

          ~~~
          #include <iostream>
          #include <vector>
          #include <algorithm>
          using namespace std;

          int main() {
              vector<int> notas = {14, 9, 18};
              notas.push_back(16);         // agrega al final
              cout << notas.size() << endl; // 4
              for (int n : notas) {
                  cout << n << " ";
              }
              sort(notas.begin(), notas.end());   // ordena
              notas.pop_back();                   // quita el último
              return 0;
          }
          ~~~

          - «push_back», «pop_back», «size», «empty», «clear».
          - Acceso con «v[i]» o «v.at(i)» (este último revisa límites).
          - «<algorithm>» trae «sort», «reverse», «max_element», «find»…

          > Prefiere «vector» en vez de arreglos normales cuando no sabes cuántos datos tendrás.
        `),
        mmszDesafio('lista de notas', [
          mmszPaso('Agrega y promedia', `
            Crea un «vector<int> notas», agrega 15, 18 y 12 con «push_back» y calcula el promedio recorriéndolo con «for (int n : notas)».
          `, {
            inicio: '#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    // tu código aquí\n    return 0;\n}',
            requiere: ['#include <vector>', 'vector<int> notas', 'push_back', 'for (int n : notas)'],
            solucion: '#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    vector<int> notas;\n    notas.push_back(15);\n    notas.push_back(18);\n    notas.push_back(12);\n    int suma = 0;\n    for (int n : notas) suma += n;\n    cout << (double)suma / notas.size() << endl;\n    return 0;\n}',
          }),
        ]),
        mmszProyecto('agenda de contactos', [
          mmszPaso('Nombres', `
            Usa «vector<string> contactos», agrega 3 nombres, ordénalos con «sort(contactos.begin(), contactos.end())» y muéstralos numerados.
          `, {
            inicio: '#include <iostream>\n#include <string>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    // tu código aquí\n    return 0;\n}',
            requiere: ['vector<string> contactos', 'push_back', 'sort(contactos.begin(), contactos.end())'],
            solucion: '#include <iostream>\n#include <string>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    vector<string> contactos;\n    contactos.push_back("Luis");\n    contactos.push_back("Ana");\n    contactos.push_back("Rosa");\n    sort(contactos.begin(), contactos.end());\n    for (int i = 0; i < contactos.size(); i++) {\n        cout << i + 1 << ". " << contactos[i] << endl;\n    }\n    return 0;\n}',
          }),
        ]),
        mmszRepaso('strings y vectores', `
          - «string»: «+» une, «length()», «substr()», «find()», «s[i]».
          - «vector<T>»: «push_back», «pop_back», «size», «v[i]», «at(i)».
          - Recorrido moderno: «for (auto x : v)».
          - «<algorithm>»: «sort(v.begin(), v.end())», «reverse», «max_element».
        `),
      ], [
        mmszElige('¿Qué método agrega al final de un vector?', ['*push_back', 'append', 'add'], 'push_back agrega al final.'),
        mmszCompleta('Completa para declarar un vector de enteros.', '___<int> numeros;', ['vector'], 'vector<int>.'),
        mmszElige('¿Qué devuelve «v.size()» tras 3 push_back en un vector vacío?', ['*3', '2', '0'], 'Tiene 3 elementos.'),
        mmszElige('¿Qué ventaja tiene vector sobre un arreglo normal?', ['*Crece automáticamente', 'Es más antiguo', 'Solo guarda texto'], 'Su tamaño es dinámico.'),
        mmszElige('¿Cómo ordenas un vector v?', ['*sort(v.begin(), v.end())', 'v.sort()', 'order(v)'], 'sort está en <algorithm>.'),
      ]),
    ]),

    mmszUnidad('Avanzado', 'Structs y clases', 'Agrupar datos con struct y programación orientada a objetos con clases.', [
      mmszLeccion('cpp-9-1', 'Structs', 'Agrupar datos relacionados en un solo tipo.', [
        mmszLectura('struct', `
          Un «struct» agrupa variables relacionadas en un nuevo tipo:

          ~~~
          #include <iostream>
          #include <string>
          using namespace std;

          struct Alumno {
              string nombre;
              int edad;
              double promedio;
          };

          int main() {
              Alumno a;
              a.nombre = "Ana";
              a.edad = 19;
              a.promedio = 16.5;
              cout << a.nombre << " tiene " << a.promedio << endl;

              Alumno salon[2] = {{"Luis", 20, 14.0}, {"Rosa", 18, 17.5}};
              cout << salon[1].nombre << endl;
              return 0;
          }
          ~~~

          > Los structs son la base de las clases: en C++ un struct es una clase cuyos miembros son públicos por defecto.
        `),
        mmszDesafio('ficha de producto', [
          mmszPaso('Define el struct', `
            Crea «struct Producto» con «string nombre», «double precio» e «int stock». En «main», crea un producto y muestra su valor total en inventario (precio × stock).
          `, {
            inicio: '#include <iostream>\n#include <string>\nusing namespace std;\n\n// tu struct aquí\n\nint main() {\n    return 0;\n}',
            requiere: ['struct Producto', 'double precio', 'int stock', '.precio * '],
            solucion: '#include <iostream>\n#include <string>\nusing namespace std;\n\nstruct Producto {\n    string nombre;\n    double precio;\n    int stock;\n};\n\nint main() {\n    Producto p;\n    p.nombre = "Cuaderno";\n    p.precio = 4.5;\n    p.stock = 10;\n    cout << p.precio * p.stock << endl;\n    return 0;\n}',
          }),
        ]),
      ], [
        mmszElige('¿Para qué sirve un struct?', ['*Agrupar datos relacionados en un tipo', 'Repetir código', 'Crear bucles'], 'Agrupa variables.'),
        mmszCompleta('Completa para acceder al nombre del alumno a.', 'cout << a___nombre;', ['.'], 'Se usa el punto.'),
        mmszElige('¿Qué falta al final de la definición «struct P { int x; }»?', ['*Un punto y coma ;', 'Nada', 'return 0'], 'struct termina con };'),
        mmszElige('En un struct, los miembros por defecto son…', ['*public', 'private', 'protected'], 'En clases son private.'),
        mmszOrdena('Ordena la definición.', ['struct Punto {', '    int x;', '    int y;', '};'], 'Campos entre llaves y ; al final.'),
      ]),

      mmszLeccion('cpp-9-2', 'Clases y objetos', 'public, private, constructores, métodos y herencia.', [
        mmszLectura('Clases', `
          Una **clase** agrupa datos (atributos) y funciones (métodos) y controla el acceso:

          ~~~
          #include <iostream>
          #include <string>
          using namespace std;

          class Cuenta {
          private:
              string titular;
              double saldo;
          public:
              Cuenta(string t) {        // constructor
                  titular = t;
                  saldo = 0;
              }
              void depositar(double m) { saldo += m; }
              bool retirar(double m) {
                  if (m > saldo) return false;
                  saldo -= m;
                  return true;
              }
              double getSaldo() { return saldo; }
          };

          int main() {
              Cuenta c("Ana");
              c.depositar(100);
              c.retirar(30);
              cout << c.getSaldo() << endl;   // 70
              return 0;
          }
          ~~~

          - «private»: solo la clase puede acceder (**encapsulamiento**).
          - «public»: accesible desde afuera.
          - El **constructor** tiene el mismo nombre que la clase.

          ### Herencia
          ~~~
          class Animal {
          public:
              virtual void hablar() { cout << "..."; }
          };
          class Perro : public Animal {
          public:
              void hablar() override { cout << "Guau"; }
          };
          ~~~

          «virtual» y «override» permiten el **polimorfismo**.

          > El simulador de Novexa todavía no ejecuta clases; en esta lección se revisa tu código.
        `),
        mmszDesafio('clase Rectángulo', [
          mmszPaso('Atributos privados', `
            Crea «class Rectangulo» con «base» y «altura» privados, un constructor «Rectangulo(double b, double h)» y los métodos públicos «area()» y «perimetro()».
          `, {
            inicio: '#include <iostream>\nusing namespace std;\n\n// tu clase aquí\n\nint main() {\n    Rectangulo r(4, 5);\n    cout << r.area() << " " << r.perimetro() << endl;\n    return 0;\n}',
            requiere: ['class Rectangulo', 'private:', 'public:', 'Rectangulo(double b, double h)', 'double area()', 'double perimetro()'],
            solucion: '#include <iostream>\nusing namespace std;\n\nclass Rectangulo {\nprivate:\n    double base;\n    double altura;\npublic:\n    Rectangulo(double b, double h) {\n        base = b;\n        altura = h;\n    }\n    double area() { return base * altura; }\n    double perimetro() { return 2 * (base + altura); }\n};\n\nint main() {\n    Rectangulo r(4, 5);\n    cout << r.area() << " " << r.perimetro() << endl;\n    return 0;\n}',
          }),
        ]),
        mmszProyecto('figuras con herencia', [
          mmszPaso('Clase base y derivadas', `
            Crea «class Figura» con un método «virtual double area()», y las clases «Circulo» y «Cuadrado» que hereden públicamente de «Figura» y sobrescriban «area()» con «override».
          `, {
            inicio: '#include <iostream>\nusing namespace std;\n\n// tus clases aquí\n\nint main() {\n    return 0;\n}',
            requiere: ['class Figura', 'virtual double area()', 'class Circulo : public Figura', 'class Cuadrado : public Figura', 'override'],
            solucion: '#include <iostream>\nusing namespace std;\n\nclass Figura {\npublic:\n    virtual double area() { return 0; }\n};\n\nclass Circulo : public Figura {\n    double r;\npublic:\n    Circulo(double radio) { r = radio; }\n    double area() override { return 3.14 * r * r; }\n};\n\nclass Cuadrado : public Figura {\n    double l;\npublic:\n    Cuadrado(double lado) { l = lado; }\n    double area() override { return l * l; }\n};\n\nint main() {\n    Circulo c(2);\n    Cuadrado q(3);\n    Figura *figuras[2] = {&c, &q};\n    for (int i = 0; i < 2; i++) cout << figuras[i]->area() << endl;\n    return 0;\n}',
          }),
        ]),
        mmszRepaso('structs y clases', `
          - «struct»: agrupa datos; miembros públicos por defecto.
          - «class»: datos + métodos; miembros privados por defecto.
          - Encapsulamiento: atributos «private», métodos «public».
          - Constructor: mismo nombre que la clase, sin tipo de retorno.
          - Herencia: «class Hija : public Padre»; polimorfismo con «virtual» y «override».
        `),
      ], [
        mmszElige('¿Qué hace «private:» en una clase?', ['*Oculta los miembros fuera de la clase', 'Los hace globales', 'Los borra'], 'Encapsulamiento.'),
        mmszElige('¿Cómo se llama el constructor de la clase Cuenta?', ['*Cuenta', 'init', 'constructor'], 'Lleva el nombre de la clase.'),
        mmszCompleta('Completa la herencia pública.', 'class Perro : ___ Animal {', ['public'], 'class Hija : public Padre.'),
        mmszElige('¿Para qué sirve virtual?', ['*Permitir que las clases hijas sobrescriban el método (polimorfismo)', 'Hacer el método privado', 'Hacerlo más rápido'], 'Habilita el polimorfismo.'),
        mmszElige('Diferencia principal entre struct y class en C++:', ['*En struct los miembros son public por defecto; en class, private', 'struct no puede tener funciones', 'class no puede tener datos'], 'Solo cambia el acceso por defecto.'),
      ]),
    ]),
  ],
};
