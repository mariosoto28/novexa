// Autor: MMSZ (Mario Soto Zea)
// Curso de JavaScript: de lo básico a lo avanzado (9 unidades).
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

export const mmszJavascript: MmszCourse = {
  id: 'javascript',
  name: 'JavaScript',
  tagline: 'El lenguaje de la web',
  color: '#e8b83a',
  icon: '⚡',
  units: [
    /* =============================== BÁSICO =============================== */
    mmszUnidad('Básico', 'Primeros pasos', 'Qué es JavaScript, cómo mostrar mensajes y cómo guardar datos con let y const.', [
      mmszLeccion('js-1-1', 'Hola, mundo', 'Mostrar mensajes con console.log y escribir comentarios.', [
        mmszLectura('¿Qué es JavaScript?', `
          JavaScript es **el lenguaje de la web**: todas las páginas interactivas lo usan. También sirve para crear servidores (Node.js), apps de escritorio y móviles. De hecho, Novexa está hecha con JavaScript.

          Para mostrar información usamos «console.log()». Cada instrucción suele terminar en punto y coma «;».

          ~~~run
          console.log("Hola, mundo");
          console.log("Estoy aprendiendo JavaScript");
          ~~~

          ### Comentarios
          - «//» comenta una línea.
          - «/* ... */» comenta varias líneas.

          ~~~run
          // Esto no se ejecuta
          /* Esto tampoco,
             aunque ocupe varias líneas */
          console.log("Solo se ve esto");
          ~~~
        `),
        mmszConsejo('texto vs. números', `
          Entre comillas es texto; sin comillas, JavaScript calcula:

          ~~~run
          console.log("4 * 2");
          console.log(4 * 2);
          ~~~
        `),
        mmszDesafio('tu tarjeta de presentación', [
          mmszPaso('Saluda', `
            Muestra exactamente «Hola, soy estudiante».
          `, {
            inicio: '// Escribe tu código aquí\n',
            pista: 'console.log("...");',
            salida: 'Hola, soy estudiante',
            requiere: ['console.log'],
            solucion: 'console.log("Hola, soy estudiante");',
          }),
          mmszPaso('Más líneas', `
            Agrega dos líneas para mostrar también «Estudio Ingeniería de Sistemas» y «Me gusta programar».
          `, {
            salida: 'Hola, soy estudiante\nEstudio Ingeniería de Sistemas\nMe gusta programar',
            solucion: 'console.log("Hola, soy estudiante");\nconsole.log("Estudio Ingeniería de Sistemas");\nconsole.log("Me gusta programar");',
          }),
        ]),
      ], [
        mmszElige('¿Cómo se muestra un mensaje en JavaScript?', ['*console.log("Hola")', 'print("Hola")', 'cout << "Hola"', 'echo "Hola"'], 'console.log() escribe en la consola.'),
        mmszCompleta('Completa el código.', 'console.___("Hola, mundo");', ['log'], 'La función completa es console.log.'),
        mmszElige('¿Qué muestra este código?', ['*8', '4 * 2', '42'], 'Sin comillas, JavaScript calcula.', 'console.log(4 * 2);'),
        mmszElige('¿Cómo se escribe un comentario de una línea?', ['*// comentario', '# comentario', '-- comentario'], 'En JavaScript se usa //.'),
        mmszEscribe('Muestra exactamente: JavaScript es genial', '', 'JavaScript es genial', 'console.log("JavaScript es genial");'),
      ]),

      mmszLeccion('js-1-2', 'Variables: let y const', 'Guardar datos con let y const, y conocer los tipos básicos.', [
        mmszLectura('let y const', `
          Las variables se crean con:
          - «let»: su valor **puede cambiar**.
          - «const»: su valor **no puede reasignarse** (constante).

          ~~~run
          let puntos = 0;
          puntos = puntos + 10;
          const nombre = "Ana";
          console.log(nombre, puntos);
          ~~~

          > Regla práctica: usa «const» por defecto y «let» solo cuando la variable vaya a cambiar. Evita «var», que es la forma antigua.

          ### Tipos de datos
          - «number»: números (enteros y decimales): «7», «3.14».
          - «string»: texto: «"hola"».
          - «boolean»: «true» o «false».
          - «undefined»: variable sin valor; «null»: "vacío a propósito".

          ~~~run
          console.log(typeof 42);
          console.log(typeof "hola");
          console.log(typeof true);
          let x;
          console.log(x);
          ~~~
        `),
        mmszDesafio('datos de un estudiante', [
          mmszPaso('Crea las variables', `
            Crea «const nombre = "Luis"», «let ciclo = 3» y «const promedio = 15.5». Muéstralas en ese orden, cada una en su propia línea.
          `, {
            inicio: '',
            salida: 'Luis\n3\n15.5',
            requiere: ['const nombre', 'let ciclo'],
            solucion: 'const nombre = "Luis";\nlet ciclo = 3;\nconst promedio = 15.5;\nconsole.log(nombre);\nconsole.log(ciclo);\nconsole.log(promedio);',
          }),
          mmszPaso('Siguiente ciclo', `
            Antes de mostrar, aumenta «ciclo» en 1 («ciclo = ciclo + 1»).
          `, {
            salida: 'Luis\n4\n15.5',
            requiere: ['ciclo = ciclo + 1'],
            solucion: 'const nombre = "Luis";\nlet ciclo = 3;\nconst promedio = 15.5;\nciclo = ciclo + 1;\nconsole.log(nombre);\nconsole.log(ciclo);\nconsole.log(promedio);',
          }),
        ]),
        mmszProyecto('ficha personal', [
          mmszPaso('Tu ficha', `
            Crea «nombre = "Mario"», «carrera = "Sistemas"» y «edad = 20» y muestra:

            ~~~
            Nombre: Mario
            Carrera: Sistemas
            Edad: 20
            ~~~

            Usa «console.log("Nombre:", nombre)».
          `, {
            inicio: '',
            salida: 'Nombre: Mario\nCarrera: Sistemas\nEdad: 20',
            requiere: ['nombre', 'carrera', 'edad'],
            solucion: 'const nombre = "Mario";\nconst carrera = "Sistemas";\nlet edad = 20;\nconsole.log("Nombre:", nombre);\nconsole.log("Carrera:", carrera);\nconsole.log("Edad:", edad);',
          }),
          mmszPaso('Cumpleaños', `
            Suma 1 a «edad» y muestra «Edad el próximo año: 21». (Si declaraste edad con «const», cámbiala a «let».)
          `, {
            salida: 'Nombre: Mario\nCarrera: Sistemas\nEdad: 20\nEdad el próximo año: 21',
            solucion: 'const nombre = "Mario";\nconst carrera = "Sistemas";\nlet edad = 20;\nconsole.log("Nombre:", nombre);\nconsole.log("Carrera:", carrera);\nconsole.log("Edad:", edad);\nedad = edad + 1;\nconsole.log("Edad el próximo año:", edad);',
          }),
        ]),
        mmszRepaso('primeros pasos', `
          - «console.log()» muestra información.
          - «//» y «/* */» son comentarios.
          - «let» para valores que cambian; «const» para los que no.
          - Tipos: «number», «string», «boolean», «undefined», «null».
          - «typeof» dice el tipo de un valor.
        `),
      ], [
        mmszElige('¿Cuál usarías para un valor que nunca cambia?', ['*const', 'let', 'var'], 'const no se puede reasignar.'),
        mmszCompleta('Completa para crear una variable que luego cambiará.', '___ puntos = 0;\npuntos = puntos + 10;', ['let'], 'Si cambia, se usa let.'),
        mmszElige('¿Qué muestra «console.log(typeof "hola")»?', ['*string', 'text', 'number'], 'Los textos son string.'),
        mmszElige('¿Qué pasa al hacer «const x = 1; x = 2;»?', ['*Da error: no se puede reasignar una constante', 'x vale 2', 'x vale 1 y no pasa nada'], 'const no permite reasignar.'),
        mmszOrdena('Ordena para mostrar el nombre.', ['const nombre = "Ana";', 'console.log(nombre);'], 'Primero se declara y luego se usa.'),
      ]),
    ]),

    mmszUnidad('Básico', 'Operadores y textos', 'Operaciones matemáticas, atajos de asignación y trabajo con textos.', [
      mmszLeccion('js-2-1', 'Operadores', 'Aritmética, residuo, potencia e incrementos.', [
        mmszLectura('Operadores aritméticos', `
          - «+», «-», «*», «/»: suma, resta, multiplicación, división (da decimales: «7 / 2» es «3.5»).
          - «%»: residuo: «7 % 2» es «1».
          - «**»: potencia: «2 ** 3» es «8».

          ~~~run
          console.log(7 / 2);
          console.log(7 % 2);
          console.log(2 ** 10);
          console.log(Math.floor(7 / 2));
          ~~~

          «Math.floor()» redondea hacia abajo; también existen «Math.round()», «Math.ceil()», «Math.max()» y «Math.sqrt()».

          ### Atajos
          ~~~run
          let x = 5;
          x += 3;   // x = x + 3
          x *= 2;   // x = x * 2
          x++;      // x = x + 1
          x--;      // x = x - 1
          console.log(x);
          ~~~
        `),
        mmszDesafio('calculadora de notas', [
          mmszPaso('Promedio', `
            Con «n1 = 14», «n2 = 17» y «n3 = 11», calcula el promedio y muéstralo.
          `, {
            inicio: 'const n1 = 14;\nconst n2 = 17;\nconst n3 = 11;\n',
            salida: '14',
            requiere: ['promedio'],
            solucion: 'const n1 = 14;\nconst n2 = 17;\nconst n3 = 11;\nconst promedio = (n1 + n2 + n3) / 3;\nconsole.log(promedio);',
          }),
          mmszPaso('Redondeo', `
            Ahora calcula el promedio de «13, 15 y 15» en una variable «otro» y muéstralo redondeado con «Math.round()».
          `, {
            pista: 'console.log(Math.round(otro));',
            salida: '14\n14',
            requiere: ['Math.round'],
            solucion: 'const n1 = 14;\nconst n2 = 17;\nconst n3 = 11;\nconst promedio = (n1 + n2 + n3) / 3;\nconsole.log(promedio);\nconst otro = (13 + 15 + 15) / 3;\nconsole.log(Math.round(otro));',
          }),
        ]),
      ], [
        mmszElige('¿Qué muestra «console.log(10 % 4)»?', ['*2', '2.5', '4'], '10 entre 4 da 2 y sobra 2.'),
        mmszElige('¿Qué muestra «console.log(2 ** 3)»?', ['6', '*8', '9'], '** es potencia.'),
        mmszCompleta('Completa el atajo de x = x + 1.', 'x___;', ['++'], 'x++ suma 1.'),
        mmszElige('¿Qué muestra «console.log(Math.floor(9 / 2))»?', ['*4', '4.5', '5'], 'floor redondea hacia abajo.'),
        mmszEscribe('Muestra el residuo de 17 entre 5.', '', '2', 'console.log(17 % 5);'),
      ]),

      mmszLeccion('js-2-2', 'Textos y template literals', 'Unir textos, métodos de strings y plantillas con ${}.', [
        mmszLectura('Trabajar con textos', `
          Los textos se unen con «+» y tienen propiedades y métodos:

          ~~~run
          const ciudad = "Lima";
          console.log("Hola " + ciudad);
          console.log(ciudad.length);
          console.log(ciudad.toUpperCase());
          console.log(ciudad.includes("ma"));
          ~~~

          ### Template literals
          Con comillas invertidas «\`» puedes insertar variables y expresiones con «\${ }». Es la forma moderna y más clara:

          ~~~run
          const nombre = "Luis";
          const nota = 17;
          console.log(\`\${nombre} sacó \${nota}\`);
          console.log(\`El doble es \${nota * 2}\`);
          ~~~

          ### Convertir tipos
          ~~~run
          console.log(Number("15") + 5);
          console.log(String(20) + "!");
          console.log((10 / 3).toFixed(2));
          ~~~

          > Cuidado: «"5" + 3» da «"53"» (une textos), pero «"5" * 3» da «15».
        `),
        mmszDesafio('boleta de compra', [
          mmszPaso('Total', `
            Con «producto = "Cuaderno"», «precio = 4.5» y «cantidad = 3», calcula «total» y muestra con un template literal: «Cuaderno x3 = 13.5».
          `, {
            inicio: 'const producto = "Cuaderno";\nconst precio = 4.5;\nconst cantidad = 3;\n',
            pista: 'console.log(`${producto} x${cantidad} = ${total}`);',
            salida: 'Cuaderno x3 = 13.5',
            requiere: ['`', 'total'],
            solucion: 'const producto = "Cuaderno";\nconst precio = 4.5;\nconst cantidad = 3;\nconst total = precio * cantidad;\nconsole.log(`${producto} x${cantidad} = ${total}`);',
          }),
          mmszPaso('Con IGV', `
            Muestra el total con 18% de IGV y 2 decimales usando «toFixed(2)»: «Con IGV: 15.93».
          `, {
            salida: 'Cuaderno x3 = 13.5\nCon IGV: 15.93',
            requiere: ['toFixed'],
            solucion: 'const producto = "Cuaderno";\nconst precio = 4.5;\nconst cantidad = 3;\nconst total = precio * cantidad;\nconsole.log(`${producto} x${cantidad} = ${total}`);\nconsole.log(`Con IGV: ${(total * 1.18).toFixed(2)}`);',
          }),
        ]),
        mmszProyecto('generador de usuario', [
          mmszPaso('Usuario', `
            Con «nombre = "Mario"» y «apellido = "Soto"», genera un usuario con la primera letra del nombre y el apellido en minúsculas: «msoto». Usa «nombre[0]» y «toLowerCase()».
          `, {
            inicio: 'const nombre = "Mario";\nconst apellido = "Soto";\n',
            salida: 'msoto',
            requiere: ['toLowerCase'],
            solucion: 'const nombre = "Mario";\nconst apellido = "Soto";\nconst usuario = (nombre[0] + apellido).toLowerCase();\nconsole.log(usuario);',
          }),
          mmszPaso('Correo', `
            Muestra también el correo «msoto@novexa.edu» con un template literal.
          `, {
            salida: 'msoto\nmsoto@novexa.edu',
            solucion: 'const nombre = "Mario";\nconst apellido = "Soto";\nconst usuario = (nombre[0] + apellido).toLowerCase();\nconsole.log(usuario);\nconsole.log(`${usuario}@novexa.edu`);',
          }),
        ]),
        mmszRepaso('operadores y textos', `
          - Aritmética: «+ - * / % **»; «Math.floor/round/ceil» para redondear.
          - Atajos: «+=», «-=», «*=», «++», «--».
          - Textos: «length», «toUpperCase()», «toLowerCase()», «includes()», «texto[0]».
          - Template literals: «\`Hola \${nombre}\`».
          - Conversión: «Number()», «String()», «toFixed(n)».
        `),
      ], [
        mmszElige('¿Qué muestra «console.log("5" + 3)»?', ['8', '*53', 'Error'], 'Con un texto, + une.'),
        mmszElige('¿Qué muestra «console.log("hola".length)»?', ['*4', '5', 'hola'], 'length cuenta caracteres.'),
        mmszCompleta('Completa el template literal.', 'console.log(`Hola ___{nombre}`);', ['$'], 'Se usa ${ }.'),
        mmszElige('¿Qué muestra «console.log("abc".toUpperCase())»?', ['*ABC', 'abc', 'Abc'], 'toUpperCase pasa a mayúsculas.'),
        mmszEscribe('Con nombre = "Rosa", muestra: Hola, Rosa! (usa template literal)', 'const nombre = "Rosa";', 'Hola, Rosa!', 'const nombre = "Rosa";\nconsole.log(`Hola, ${nombre}!`);'),
      ]),
    ]),

    mmszUnidad('Básico', 'Decisiones', 'Comparaciones estrictas, operadores lógicos, if/else, switch y el operador ternario.', [
      mmszLeccion('js-3-1', 'Comparaciones y lógica', '===, !==, &&, || y !.', [
        mmszLectura('Comparar en JavaScript', `
          - «===» igual estricto (mismo valor **y** mismo tipo) · «!==» distinto estricto.
          - «>», «<», «>=», «<=».

          ~~~run
          console.log(5 === 5);
          console.log(5 === "5");
          console.log(5 == "5");
          ~~~

          > Usa siempre «===» y «!==». El «==» convierte tipos y da resultados confusos.

          ### Operadores lógicos
          - «&&» (y): ambas verdaderas.
          - «||» (o): al menos una.
          - «!» (no): invierte.

          ~~~run
          const edad = 20;
          const tieneDni = true;
          console.log(edad >= 18 && tieneDni);
          console.log(edad < 12 || edad > 65);
          console.log(!tieneDni);
          ~~~
        `),
        mmszDesafio('¿puede votar?', [
          mmszPaso('Mayor de edad', `
            Con «edad = 17», muestra si la edad es mayor o igual a 18.
          `, {
            inicio: 'const edad = 17;\n',
            salida: 'false',
            requiere: ['>='],
            solucion: 'const edad = 17;\nconsole.log(edad >= 18);',
          }),
          mmszPaso('Adolescente', `
            Muestra si la edad está entre 13 y 19 (incluidos) usando «&&».
          `, {
            salida: 'false\ntrue',
            requiere: ['&&'],
            solucion: 'const edad = 17;\nconsole.log(edad >= 18);\nconsole.log(edad >= 13 && edad <= 19);',
          }),
        ]),
      ], [
        mmszElige('¿Qué muestra «console.log(5 === "5")»?', ['true', '*false'], '=== compara también el tipo.'),
        mmszCompleta('Completa para comprobar si x es distinto de 0.', 'if (x ___ 0) {', ['!=='], '!== es distinto estricto.'),
        mmszElige('¿Qué muestra «console.log(true && false)»?', ['true', '*false'], '&& necesita ambas verdaderas.'),
        mmszElige('¿Qué muestra «console.log(!false)»?', ['*true', 'false'], '! invierte.'),
        mmszEscribe('Muestra el resultado de comparar si 10 es mayor que 3.', '', 'true', 'console.log(10 > 3);'),
      ]),

      mmszLeccion('js-3-2', 'if, else y switch', 'Tomar decisiones con if/else, else if, switch y el ternario.', [
        mmszLectura('if y else', `
          La condición va entre paréntesis y el bloque entre llaves:

          ~~~run
          const nota = 8;
          if (nota >= 17) {
            console.log("Excelente");
          } else if (nota >= 11) {
            console.log("Aprobado");
          } else {
            console.log("Desaprobado");
          }
          ~~~

          ### Operador ternario
          Para decisiones simples: «condición ? siVerdadero : siFalso».

          ~~~run
          const edad = 20;
          const tipo = edad >= 18 ? "adulto" : "menor";
          console.log(tipo);
          ~~~

          ### switch
          Útil para comparar una variable con varios valores exactos. No olvides «break»:

          ~~~run
          const dia = 3;
          switch (dia) {
            case 1:
              console.log("Lunes");
              break;
            case 3:
              console.log("Miércoles");
              break;
            default:
              console.log("Otro día");
          }
          ~~~
        `),
        mmszDesafio('par o impar', [
          mmszPaso('Revisa el número', `
            Con «numero = 7», usa «if/else» y «%» para mostrar «7 es impar» (o «es par»). Usa template literals.
          `, {
            inicio: 'const numero = 7;\n',
            salida: '7 es impar',
            requiere: ['if', 'else', '%'],
            solucion: 'const numero = 7;\nif (numero % 2 === 0) {\n  console.log(`${numero} es par`);\n} else {\n  console.log(`${numero} es impar`);\n}',
          }),
          mmszPaso('Con ternario', `
            Agrega una línea que haga lo mismo con el operador ternario para «numero + 1».
          `, {
            pista: 'const n = numero + 1;\nconsole.log(n % 2 === 0 ? `${n} es par` : `${n} es impar`);',
            salida: '7 es impar\n8 es par',
            requiere: ['?'],
            solucion: 'const numero = 7;\nif (numero % 2 === 0) {\n  console.log(`${numero} es par`);\n} else {\n  console.log(`${numero} es impar`);\n}\nconst n = numero + 1;\nconsole.log(n % 2 === 0 ? `${n} es par` : `${n} es impar`);',
          }),
        ]),
        mmszProyecto('sistema de calificaciones', [
          mmszPaso('Letra', `
            Con «nota = 14», muestra «A» (18+), «B» (14-17), «C» (11-13) o «D» (menos de 11) usando «if / else if / else».
          `, {
            inicio: 'const nota = 14;\n',
            salida: 'B',
            requiere: ['else if'],
            solucion: 'const nota = 14;\nif (nota >= 18) {\n  console.log("A");\n} else if (nota >= 14) {\n  console.log("B");\n} else if (nota >= 11) {\n  console.log("C");\n} else {\n  console.log("D");\n}',
          }),
          mmszPaso('Mensaje con switch', `
            Guarda la letra en una variable «letra» y usa «switch (letra)» para mostrar «Muy bien» para A y B, y «Sigue practicando» para las demás.
          `, {
            pista: 'case "A":\ncase "B":\n  console.log("Muy bien");\n  break;',
            salida: 'B\nMuy bien',
            requiere: ['switch', 'case'],
            solucion: 'const nota = 14;\nlet letra;\nif (nota >= 18) {\n  letra = "A";\n} else if (nota >= 14) {\n  letra = "B";\n} else if (nota >= 11) {\n  letra = "C";\n} else {\n  letra = "D";\n}\nconsole.log(letra);\nswitch (letra) {\n  case "A":\n  case "B":\n    console.log("Muy bien");\n    break;\n  default:\n    console.log("Sigue practicando");\n}',
          }),
        ]),
        mmszRepaso('decisiones', `
          - Usa «===» y «!==» (estrictos).
          - «&&», «||», «!» combinan condiciones.
          - «if (cond) { } else if (cond) { } else { }».
          - Ternario: «cond ? a : b».
          - «switch» compara con valores exactos; cada «case» termina con «break».
        `),
      ], [
        mmszElige('¿Qué muestra este programa?', ['*Desaprobado', 'Aprobado', 'Nada'], '9 no es mayor o igual a 11.', 'let nota = 9;\nif (nota >= 11) {\n  console.log("Aprobado");\n} else {\n  console.log("Desaprobado");\n}'),
        mmszElige('¿Qué devuelve «5 > 3 ? "sí" : "no"»?', ['*"sí"', '"no"', 'true'], 'La condición es verdadera.'),
        mmszElige('¿Qué pasa si olvidas break en un case?', ['*Se ejecuta también el siguiente case', 'Da error', 'No pasa nada'], 'Sin break, el switch "cae" al siguiente case.'),
        mmszOrdena('Ordena el programa.', ['let edad = 20;', 'if (edad >= 18) {', '  console.log("Mayor de edad");', '} else {', '  console.log("Menor de edad");', '}'], 'Cada { tiene su }.'),
        mmszEscribe('temperatura vale 30: muestra "Calor" si es mayor que 25, si no "Fresco".', 'let temperatura = 30;', 'Calor', 'let temperatura = 30;\nif (temperatura > 25) {\n  console.log("Calor");\n} else {\n  console.log("Fresco");\n}'),
      ]),
    ]),

    /* ============================= INTERMEDIO ============================= */
    mmszUnidad('Intermedio', 'Bucles', 'Repetir instrucciones con for, while y do...while.', [
      mmszLeccion('js-4-1', 'Bucle for', 'Inicio, condición y paso; acumuladores.', [
        mmszLectura('El bucle for', `
          «for» tiene tres partes: **inicio; condición; paso**.

          ~~~run
          for (let i = 0; i < 3; i++) {
            console.log("Vuelta", i);
          }
          ~~~

          - Inicio: «let i = 0» se ejecuta una vez.
          - Condición: mientras «i < 3» sea verdadera, se repite.
          - Paso: «i++» se ejecuta al final de cada vuelta.

          ### Acumuladores
          ~~~run
          let total = 0;
          for (let n = 1; n <= 4; n++) {
            total += n;
          }
          console.log(total);
          ~~~

          Puedes contar hacia atrás o de dos en dos:

          ~~~run
          for (let i = 10; i > 0; i -= 3) {
            console.log(i);
          }
          ~~~
        `),
        mmszDesafio('tabla de multiplicar', [
          mmszPaso('Tabla del 7', `
            Muestra la tabla del 7 del 1 al 5 con el formato «7 x 1 = 7».
          `, {
            inicio: 'const numero = 7;\n',
            salida: '7 x 1 = 7\n7 x 2 = 14\n7 x 3 = 21\n7 x 4 = 28\n7 x 5 = 35',
            requiere: ['for'],
            solucion: 'const numero = 7;\nfor (let i = 1; i <= 5; i++) {\n  console.log(`${numero} x ${i} = ${numero * i}`);\n}',
          }),
          mmszPaso('Suma', `
            Acumula los resultados en «suma» y muéstrala al final: «Suma: 105».
          `, {
            salida: '7 x 1 = 7\n7 x 2 = 14\n7 x 3 = 21\n7 x 4 = 28\n7 x 5 = 35\nSuma: 105',
            requiere: ['suma'],
            solucion: 'const numero = 7;\nlet suma = 0;\nfor (let i = 1; i <= 5; i++) {\n  console.log(`${numero} x ${i} = ${numero * i}`);\n  suma += numero * i;\n}\nconsole.log(`Suma: ${suma}`);',
          }),
        ]),
      ], [
        mmszElige('¿Qué números muestra «for (let i = 0; i < 3; i++)»?', ['*0, 1, 2', '1, 2, 3', '0, 1, 2, 3'], 'Se detiene cuando i llega a 3.'),
        mmszCompleta('Completa el paso para que i aumente de 1 en 1.', 'for (let i = 0; i < 5; ___) {', ['i++', 'i += 1', 'i = i + 1', '++i'], 'i++ suma 1.'),
        mmszOrdena('Ordena para sumar 1 + 2 + 3.', ['let total = 0;', 'for (let n = 1; n <= 3; n++) {', '  total += n;', '}', 'console.log(total);'], 'total += n suma dentro del bucle.'),
        mmszElige('¿Cuántas veces se repite «for (let i = 2; i <= 10; i += 2)»?', ['*5', '4', '10'], '2, 4, 6, 8, 10.'),
        mmszEscribe('Muestra los números del 1 al 5, uno por línea.', '', '1\n2\n3\n4\n5', 'for (let i = 1; i <= 5; i++) {\n  console.log(i);\n}'),
      ]),

      mmszLeccion('js-4-2', 'while, do...while, break y continue', 'Repetir mientras se cumpla una condición.', [
        mmszLectura('while y do...while', `
          «while» repite mientras la condición sea verdadera:

          ~~~run
          let n = 3;
          while (n > 0) {
            console.log(n);
            n--;
          }
          console.log("¡Despegue!");
          ~~~

          «do...while» ejecuta el bloque **al menos una vez** y luego revisa la condición:

          ~~~run
          let x = 10;
          do {
            console.log("Se ejecuta una vez:", x);
          } while (x < 5);
          ~~~

          ### break y continue
          ~~~run
          for (let i = 1; i < 10; i++) {
            if (i === 6) break;
            if (i % 2 === 0) continue;
            console.log(i);
          }
          ~~~
        `),
        mmszDesafio('ahorro mensual', [
          mmszPaso('Meses', `
            Ahorras 150 por mes y quieres llegar a 1000. Usa «while» y muestra «Meses: 7».
          `, {
            inicio: 'let ahorro = 0;\nlet meses = 0;\n',
            salida: 'Meses: 7',
            requiere: ['while'],
            solucion: 'let ahorro = 0;\nlet meses = 0;\nwhile (ahorro < 1000) {\n  ahorro += 150;\n  meses++;\n}\nconsole.log(`Meses: ${meses}`);',
          }),
        ]),
        mmszProyecto('números primos', [
          mmszPaso('¿Es primo?', `
            Con «n = 29», usa un bucle que pruebe divisores desde 2 hasta n-1. Si alguno divide exacto, marca «esPrimo = false» y sal con «break». Muestra «29 es primo: true».
          `, {
            inicio: 'const n = 29;\nlet esPrimo = true;\n',
            salida: '29 es primo: true',
            requiere: ['break'],
            solucion: 'const n = 29;\nlet esPrimo = true;\nfor (let d = 2; d < n; d++) {\n  if (n % d === 0) {\n    esPrimo = false;\n    break;\n  }\n}\nconsole.log(`${n} es primo: ${esPrimo}`);',
          }),
          mmszPaso('Primos hasta 20', `
            Debajo, muestra en una sola línea los primos del 2 al 20 separados por espacios: «2 3 5 7 11 13 17 19». Usa un bucle dentro de otro y acumula en un texto.
          `, {
            salida: '29 es primo: true\n2 3 5 7 11 13 17 19',
            solucion: 'const n = 29;\nlet esPrimo = true;\nfor (let d = 2; d < n; d++) {\n  if (n % d === 0) {\n    esPrimo = false;\n    break;\n  }\n}\nconsole.log(`${n} es primo: ${esPrimo}`);\nlet lista = "";\nfor (let k = 2; k <= 20; k++) {\n  let primo = true;\n  for (let d = 2; d < k; d++) {\n    if (k % d === 0) {\n      primo = false;\n      break;\n    }\n  }\n  if (primo) lista += k + " ";\n}\nconsole.log(lista.trim());',
          }),
        ]),
        mmszRepaso('bucles', `
          - «for (inicio; condición; paso) { }» para repetir un número de veces.
          - «while (condición) { }» repite mientras se cumpla.
          - «do { } while (condición);» se ejecuta al menos una vez.
          - «break» sale; «continue» salta a la siguiente vuelta.
        `),
      ], [
        mmszElige('¿Qué muestra este programa?', ['*3, 2, 1', '3, 2, 1, 0', 'Se repite para siempre'], 'n-- resta 1 cada vuelta.', 'let n = 3;\nwhile (n > 0) {\n  console.log(n);\n  n--;\n}'),
        mmszElige('¿Qué tiene de especial do...while?', ['*Se ejecuta al menos una vez', 'Es más rápido', 'No necesita condición'], 'Revisa la condición al final.'),
        mmszElige('¿Qué hace continue?', ['*Salta a la siguiente vuelta', 'Sale del bucle', 'Detiene el programa'], 'break sale, continue salta.'),
        mmszCompleta('Completa para restar 1 a n.', 'n___;', ['--'], 'n-- resta 1.'),
        mmszEscribe('Usa while para mostrar 10, 20 y 30.', 'let n = 10;', '10\n20\n30', 'let n = 10;\nwhile (n <= 30) {\n  console.log(n);\n  n += 10;\n}'),
      ]),
    ]),

    mmszUnidad('Intermedio', 'Arreglos', 'Guardar listas de datos, modificarlas y recorrerlas.', [
      mmszLeccion('js-5-1', 'Crear y modificar arreglos', 'Índices, length, push, pop, includes e indexOf.', [
        mmszLectura('Arreglos', `
          Un **arreglo** (array) guarda varios valores en orden:

          ~~~run
          const frutas = ["manzana", "pera", "uva"];
          console.log(frutas[0]);
          console.log(frutas[frutas.length - 1]);
          console.log(frutas.length);
          ~~~

          Los índices empiezan en **0**. El último es «length - 1».

          ### Modificar
          - «push(x)» agrega al final · «pop()» quita el último.
          - «unshift(x)» agrega al inicio · «shift()» quita el primero.
          - «arr[i] = x» cambia un elemento.

          ~~~run
          const notas = [12, 15, 9];
          notas[2] = 11;
          notas.push(18);
          notas.unshift(14);
          console.log(notas.join(", "));
          console.log(notas.includes(15));
          console.log(notas.indexOf(18));
          ~~~

          > Aunque el arreglo sea «const», puedes modificar su contenido; lo que no puedes es asignarle otro arreglo.
        `),
        mmszDesafio('lista de compras', [
          mmszPaso('Agrega', `
            Con «compras = ["pan", "leche"]», agrega «"huevos"» con «push» y muestra «compras.join(", ")».
          `, {
            inicio: 'const compras = ["pan", "leche"];\n',
            salida: 'pan, leche, huevos',
            requiere: ['push'],
            solucion: 'const compras = ["pan", "leche"];\ncompras.push("huevos");\nconsole.log(compras.join(", "));',
          }),
          mmszPaso('Cuenta', `
            Muestra «Total: 3» usando «length» y si la lista incluye «"queso"» (debe mostrar «false»).
          `, {
            salida: 'pan, leche, huevos\nTotal: 3\nfalse',
            requiere: ['length', 'includes'],
            solucion: 'const compras = ["pan", "leche"];\ncompras.push("huevos");\nconsole.log(compras.join(", "));\nconsole.log(`Total: ${compras.length}`);\nconsole.log(compras.includes("queso"));',
          }),
        ]),
      ], [
        mmszElige('Si «a = [10, 20, 30]», ¿qué es «a[1]»?', ['10', '*20', '30'], 'Los índices empiezan en 0.'),
        mmszCompleta('Completa para agregar 40 al final.', 'a.___(40);', ['push'], 'push agrega al final.'),
        mmszElige('¿Qué devuelve «[1, 2, 3].length»?', ['*3', '2', '4'], 'Hay 3 elementos.'),
        mmszElige('¿Qué hace pop()?', ['*Quita y devuelve el último', 'Quita el primero', 'Agrega al final'], 'pop quita el último.'),
        mmszEscribe('Crea [1, 2, 3], agrega 4 y muestra los elementos unidos por "-".', '', '1-2-3-4', 'const numeros = [1, 2, 3];\nnumeros.push(4);\nconsole.log(numeros.join("-"));'),
      ]),

      mmszLeccion('js-5-2', 'Recorrer arreglos', 'for...of, forEach, máximos, sumas y sort.', [
        mmszLectura('Recorrer arreglos', `
          «for...of» recorre cada elemento:

          ~~~run
          const notas = [14, 18, 11, 16];
          for (const nota of notas) {
            console.log(nota);
          }
          ~~~

          «forEach» hace lo mismo con una función, y te da también el índice:

          ~~~run
          ["Ana", "Luis"].forEach((nombre, i) => {
            console.log(i, nombre);
          });
          ~~~

          ### Calcular con arreglos
          ~~~run
          const notas = [14, 18, 11, 16];
          let suma = 0;
          for (const n of notas) suma += n;
          console.log(suma / notas.length);
          console.log(Math.max(...notas));
          ~~~

          «sort» ordena (¡cuidado! con números necesita una función de comparación):

          ~~~run
          const nums = [10, 2, 33, 4];
          nums.sort((a, b) => a - b);
          console.log(nums.join(" "));
          ~~~
        `),
        mmszDesafio('estadísticas del salón', [
          mmszPaso('Promedio y máximo', `
            Con «notas = [12, 17, 9, 15, 20]», muestra «Promedio: 14.6» y «Mayor: 20» (usa un bucle para sumar y «Math.max(...notas)»).
          `, {
            inicio: 'const notas = [12, 17, 9, 15, 20];\n',
            salida: 'Promedio: 14.6\nMayor: 20',
            requiere: ['for', 'Math.max'],
            solucion: 'const notas = [12, 17, 9, 15, 20];\nlet suma = 0;\nfor (const n of notas) suma += n;\nconsole.log(`Promedio: ${suma / notas.length}`);\nconsole.log(`Mayor: ${Math.max(...notas)}`);',
          }),
          mmszPaso('Aprobados', `
            Cuenta las notas mayores o iguales a 11 y muestra «Aprobados: 4».
          `, {
            salida: 'Promedio: 14.6\nMayor: 20\nAprobados: 4',
            solucion: 'const notas = [12, 17, 9, 15, 20];\nlet suma = 0;\nfor (const n of notas) suma += n;\nconsole.log(`Promedio: ${suma / notas.length}`);\nconsole.log(`Mayor: ${Math.max(...notas)}`);\nlet aprobados = 0;\nfor (const n of notas) {\n  if (n >= 11) aprobados++;\n}\nconsole.log(`Aprobados: ${aprobados}`);',
          }),
        ]),
        mmszProyecto('ranking de puntajes', [
          mmszPaso('Ordena', `
            Con «puntajes = [45, 90, 72, 88, 60]», ordénalos de mayor a menor con «sort((a, b) => b - a)» y muéstralos unidos por espacios.
          `, {
            inicio: 'const puntajes = [45, 90, 72, 88, 60];\n',
            salida: '90 88 72 60 45',
            requiere: ['sort'],
            solucion: 'const puntajes = [45, 90, 72, 88, 60];\npuntajes.sort((a, b) => b - a);\nconsole.log(puntajes.join(" "));',
          }),
          mmszPaso('Podio', `
            Toma los 3 primeros con «slice(0, 3)» y muéstralos con su puesto: «1. 90», «2. 88», «3. 72».
          `, {
            salida: '90 88 72 60 45\n1. 90\n2. 88\n3. 72',
            requiere: ['slice'],
            solucion: 'const puntajes = [45, 90, 72, 88, 60];\npuntajes.sort((a, b) => b - a);\nconsole.log(puntajes.join(" "));\npuntajes.slice(0, 3).forEach((p, i) => {\n  console.log(`${i + 1}. ${p}`);\n});',
          }),
        ]),
        mmszRepaso('arreglos', `
          - «[a, b, c]»; índices desde 0; «length».
          - «push», «pop», «unshift», «shift», «includes», «indexOf», «join».
          - Recorrer: «for...of» o «forEach((x, i) => {})».
          - «Math.max(...arr)» da el mayor; «sort((a, b) => a - b)» ordena números.
          - «slice(inicio, fin)» copia una parte.
        `),
      ], [
        mmszElige('¿Qué muestra «console.log([3, 1, 2].join("-"))»?', ['*3-1-2', '1-2-3', '[3,1,2]'], 'join une los elementos.'),
        mmszCompleta('Completa para recorrer cada elemento.', 'for (const x ___ lista) {', ['of'], 'for...of recorre los valores.'),
        mmszElige('¿Qué devuelve «[1, 2, 3, 4].slice(1, 3)»?', ['*[2, 3]', '[1, 2, 3]', '[2, 3, 4]'], 'Desde el índice 1 hasta antes del 3.'),
        mmszElige('¿Para qué sirve «...» en «Math.max(...nums)»?', ['*Esparce los elementos como argumentos', 'Copia el arreglo', 'Es un comentario'], 'Es el operador spread.'),
        mmszEscribe('Con nums = [4, 8, 15, 16], muestra el mayor.', 'const nums = [4, 8, 15, 16];', '16', 'const nums = [4, 8, 15, 16];\nconsole.log(Math.max(...nums));'),
      ]),
    ]),

    mmszUnidad('Intermedio', 'Funciones', 'Funciones declaradas y flecha, parámetros, return y alcance.', [
      mmszLeccion('js-6-1', 'Crear funciones', 'function, parámetros y valores por defecto.', [
        mmszLectura('Funciones', `
          Una función agrupa código para reutilizarlo:

          ~~~run
          function saludar(nombre) {
            console.log(\`Hola, \${nombre}\`);
          }
          saludar("Ana");
          saludar("Luis");
          ~~~

          Los parámetros pueden tener **valor por defecto**:

          ~~~run
          function potencia(base, exponente = 2) {
            console.log(base ** exponente);
          }
          potencia(5);
          potencia(2, 10);
          ~~~

          > Una función se define una vez y se puede llamar todas las veces que quieras. Si nunca la llamas, su código no se ejecuta.
        `),
        mmszDesafio('di tu nombre', [
          mmszPaso('Presentación', `
            Crea «presentar(nombre, carrera)» que muestre «Soy Ana y estudio Sistemas» y llámala.
          `, {
            inicio: '',
            salida: 'Soy Ana y estudio Sistemas',
            requiere: ['function presentar'],
            solucion: 'function presentar(nombre, carrera) {\n  console.log(`Soy ${nombre} y estudio ${carrera}`);\n}\npresentar("Ana", "Sistemas");',
          }),
          mmszPaso('Por defecto', `
            Haz que «carrera» sea «"Sistemas"» por defecto y agrega «presentar("Luis")».
          `, {
            salida: 'Soy Ana y estudio Sistemas\nSoy Luis y estudio Sistemas',
            requiere: ['carrera = "Sistemas"'],
            solucion: 'function presentar(nombre, carrera = "Sistemas") {\n  console.log(`Soy ${nombre} y estudio ${carrera}`);\n}\npresentar("Ana", "Sistemas");\npresentar("Luis");',
          }),
        ]),
      ], [
        mmszElige('¿Con qué palabra se crea una función?', ['*function', 'def', 'func', 'void'], 'En JavaScript es function.'),
        mmszCompleta('Completa para crear la función.', '___ saludar() {\n  console.log("Hola");\n}', ['function'], 'function saludar() { }.'),
        mmszElige('¿Qué muestra este programa?', ['*Solo "Inicio"', '"¡Cuidado!" y "Inicio"', 'Nada'], 'La función nunca se llama.', 'function avisar() {\n  console.log("¡Cuidado!");\n}\nconsole.log("Inicio");'),
        mmszElige('Si «function f(x = 5)» y llamas «f()», ¿cuánto vale x?', ['*5', 'undefined', '0'], 'Se usa el valor por defecto.'),
        mmszEscribe('Crea saludar() que muestre "Hola" y llámala una vez.', 'function saludar() {\n  \n}', 'Hola', 'function saludar() {\n  console.log("Hola");\n}\nsaludar();'),
      ]),

      mmszLeccion('js-6-2', 'return, flecha y alcance', 'Devolver valores, funciones flecha y variables locales.', [
        mmszLectura('return y funciones flecha', `
          «return» devuelve un resultado:

          ~~~run
          function area(base, altura) {
            return base * altura;
          }
          console.log(area(4, 5));
          console.log(area(2, 3) + 10);
          ~~~

          ### Funciones flecha
          Una forma corta de escribir funciones. Si tienen una sola expresión, el «return» es automático:

          ~~~run
          const doble = (x) => x * 2;
          const sumar = (a, b) => a + b;
          console.log(doble(21), sumar(3, 4));
          ~~~

          ### Alcance (scope)
          Las variables declaradas con «let» o «const» dentro de un bloque «{ }» solo existen ahí:

          ~~~run
          const global = "afuera";
          function prueba() {
            const local = "adentro";
            console.log(global, local);
          }
          prueba();
          console.log(typeof local);
          ~~~
        `),
        mmszDesafio('calculadora', [
          mmszPaso('Operaciones', `
            Crea «calcular(a, b, op)» que devuelva la suma, resta, multiplicación o división según «op». Muestra «calcular(8, 2, "+")» y «calcular(8, 2, "/")».
          `, {
            inicio: '',
            salida: '10\n4',
            requiere: ['return'],
            solucion: 'function calcular(a, b, op) {\n  if (op === "+") return a + b;\n  if (op === "-") return a - b;\n  if (op === "*") return a * b;\n  if (op === "/") return a / b;\n}\nconsole.log(calcular(8, 2, "+"));\nconsole.log(calcular(8, 2, "/"));',
          }),
          mmszPaso('Entre cero', `
            Si «op» es «"/"» y «b» es 0, devuelve «"Error"». Agrega «console.log(calcular(5, 0, "/"))».
          `, {
            salida: '10\n4\nError',
            solucion: 'function calcular(a, b, op) {\n  if (op === "+") return a + b;\n  if (op === "-") return a - b;\n  if (op === "*") return a * b;\n  if (op === "/") {\n    if (b === 0) return "Error";\n    return a / b;\n  }\n}\nconsole.log(calcular(8, 2, "+"));\nconsole.log(calcular(8, 2, "/"));\nconsole.log(calcular(5, 0, "/"));',
          }),
        ]),
        mmszProyecto('conversor de unidades', [
          mmszPaso('Funciones flecha', `
            Crea las funciones flecha «aFahrenheit(c)» (c * 9 / 5 + 32) y «aKelvin(c)» (c + 273.15). Muestra «aFahrenheit(25)» y «aKelvin(25)».
          `, {
            inicio: '',
            salida: '77\n298.15',
            requiere: ['=>'],
            solucion: 'const aFahrenheit = (c) => c * 9 / 5 + 32;\nconst aKelvin = (c) => c + 273.15;\nconsole.log(aFahrenheit(25));\nconsole.log(aKelvin(25));',
          }),
          mmszPaso('Tabla', `
            Recorre «[0, 10, 20]» y muestra para cada uno «0°C = 32°F».
          `, {
            salida: '77\n298.15\n0°C = 32°F\n10°C = 50°F\n20°C = 68°F',
            solucion: 'const aFahrenheit = (c) => c * 9 / 5 + 32;\nconst aKelvin = (c) => c + 273.15;\nconsole.log(aFahrenheit(25));\nconsole.log(aKelvin(25));\nfor (const c of [0, 10, 20]) {\n  console.log(`${c}°C = ${aFahrenheit(c)}°F`);\n}',
          }),
        ]),
        mmszRepaso('funciones', `
          - «function nombre(params) { }» o «const nombre = (params) => expresión».
          - Parámetros por defecto: «(x = 5)».
          - «return» devuelve un resultado; sin return se obtiene «undefined».
          - Variables dentro de una función o bloque son locales.
        `),
      ], [
        mmszElige('¿Qué muestra este código?', ['*10', '5', 'x * 2'], 'doble(5) devuelve 10.', 'function doble(x) {\n  return x * 2;\n}\nconsole.log(doble(5));'),
        mmszCompleta('Completa para devolver el resultado.', 'function restar(a, b) {\n  ___ a - b;\n}', ['return'], 'return entrega el valor.'),
        mmszElige('¿Qué muestra este código?', ['*6', '5', '(x) => x * 3'], 'La flecha devuelve x * 3.', 'const triple = (x) => x * 3;\nconsole.log(triple(2));'),
        mmszElige('¿Qué devuelve una función sin return?', ['*undefined', 'null', '0'], 'Por defecto devuelve undefined.'),
        mmszEscribe('Completa sumar para que devuelva a + b y muestra sumar(3, 4).', 'function sumar(a, b) {\n  \n}', '7', 'function sumar(a, b) {\n  return a + b;\n}\nconsole.log(sumar(3, 4));'),
      ]),
    ]),

    /* ============================== AVANZADO ============================== */
    mmszUnidad('Avanzado', 'Objetos', 'Agrupar datos y comportamiento en objetos, y trabajar con arreglos de objetos y JSON.', [
      mmszLeccion('js-7-1', 'Objetos literales', 'Propiedades, métodos, this y recorrer objetos.', [
        mmszLectura('Objetos', `
          Un **objeto** agrupa datos relacionados en pares **clave: valor**:

          ~~~run
          const alumno = {
            nombre: "Ana",
            edad: 19,
            carrera: "Sistemas",
          };
          console.log(alumno.nombre);
          console.log(alumno["edad"]);
          alumno.ciclo = 4;
          alumno.edad++;
          console.log(alumno.edad, alumno.ciclo);
          ~~~

          ### Métodos y this
          Un objeto puede tener funciones (métodos). Dentro, «this» es el propio objeto:

          ~~~run
          const cuenta = {
            titular: "Luis",
            saldo: 0,
            depositar(monto) {
              this.saldo += monto;
            },
          };
          cuenta.depositar(100);
          console.log(cuenta.saldo);
          ~~~

          ### Recorrer un objeto
          ~~~run
          const precios = { pan: 0.5, leche: 4.2 };
          for (const clave in precios) {
            console.log(clave, precios[clave]);
          }
          console.log(Object.keys(precios).join(", "));
          ~~~
        `),
        mmszDesafio('cuenta bancaria', [
          mmszPaso('Retirar', `
            Agrega al objeto «cuenta» un método «retirar(monto)» que reste solo si hay saldo; si no, que muestre «Saldo insuficiente». Deposita 100, retira 30, retira 200 y muestra el saldo.
          `, {
            inicio: 'const cuenta = {\n  titular: "Ana",\n  saldo: 0,\n  depositar(monto) {\n    this.saldo += monto;\n  },\n};\n',
            salida: 'Saldo insuficiente\n70',
            requiere: ['retirar'],
            solucion: 'const cuenta = {\n  titular: "Ana",\n  saldo: 0,\n  depositar(monto) {\n    this.saldo += monto;\n  },\n  retirar(monto) {\n    if (monto <= this.saldo) {\n      this.saldo -= monto;\n    } else {\n      console.log("Saldo insuficiente");\n    }\n  },\n};\ncuenta.depositar(100);\ncuenta.retirar(30);\ncuenta.retirar(200);\nconsole.log(cuenta.saldo);',
          }),
        ]),
      ], [
        mmszElige('Si «p = { x: 3, y: 4 }», ¿qué es «p.y»?', ['3', '*4', '"y"'], 'Se accede con punto.'),
        mmszCompleta('Completa para acceder a la propiedad del propio objeto.', 'depositar(m) {\n  ___.saldo += m;\n}', ['this'], 'this es el propio objeto.'),
        mmszElige('¿Qué devuelve «Object.keys({ a: 1, b: 2 })»?', ['*["a", "b"]', '[1, 2]', '2'], 'keys da las claves.'),
        mmszElige('¿Cómo agregas la propiedad «ciclo» a un objeto existente?', ['*obj.ciclo = 4', 'obj.push("ciclo")', 'add(obj, ciclo)'], 'Basta con asignarla.'),
        mmszEscribe('Crea persona = { nombre: "Ana", edad: 20 } y muestra "Ana tiene 20 años".', '', 'Ana tiene 20 años', 'const persona = { nombre: "Ana", edad: 20 };\nconsole.log(`${persona.nombre} tiene ${persona.edad} años`);'),
      ]),

      mmszLeccion('js-7-2', 'Arreglos de objetos y JSON', 'Listas de objetos, buscar elementos y convertir a JSON.', [
        mmszLectura('Arreglos de objetos', `
          En aplicaciones reales trabajas con **listas de objetos** (por ejemplo, alumnos de un salón):

          ~~~run
          const alumnos = [
            { nombre: "Ana", nota: 17 },
            { nombre: "Luis", nota: 9 },
            { nombre: "Rosa", nota: 14 },
          ];
          for (const a of alumnos) {
            console.log(\`\${a.nombre}: \${a.nota}\`);
          }
          const luis = alumnos.find((a) => a.nombre === "Luis");
          console.log(luis.nota);
          ~~~

          ### JSON
          **JSON** es el formato de texto que usan las apps y APIs para enviar datos. «JSON.stringify» convierte un objeto a texto y «JSON.parse» hace lo contrario:

          ~~~run
          const dato = { curso: "JS", horas: 40 };
          const texto = JSON.stringify(dato);
          console.log(texto);
          const deVuelta = JSON.parse(texto);
          console.log(deVuelta.horas);
          ~~~
        `),
        mmszDesafio('mejor alumno', [
          mmszPaso('Busca al mejor', `
            Recorre «alumnos» y encuentra el de nota más alta. Muestra «Mejor: Ana (17)».
          `, {
            inicio: 'const alumnos = [\n  { nombre: "Ana", nota: 17 },\n  { nombre: "Luis", nota: 9 },\n  { nombre: "Rosa", nota: 14 },\n];\n',
            salida: 'Mejor: Ana (17)',
            requiere: ['for'],
            solucion: 'const alumnos = [\n  { nombre: "Ana", nota: 17 },\n  { nombre: "Luis", nota: 9 },\n  { nombre: "Rosa", nota: 14 },\n];\nlet mejor = alumnos[0];\nfor (const a of alumnos) {\n  if (a.nota > mejor.nota) mejor = a;\n}\nconsole.log(`Mejor: ${mejor.nombre} (${mejor.nota})`);',
          }),
          mmszPaso('A JSON', `
            Muestra el objeto «mejor» convertido a JSON.
          `, {
            salida: 'Mejor: Ana (17)\n{"nombre":"Ana","nota":17}',
            requiere: ['JSON.stringify'],
            solucion: 'const alumnos = [\n  { nombre: "Ana", nota: 17 },\n  { nombre: "Luis", nota: 9 },\n  { nombre: "Rosa", nota: 14 },\n];\nlet mejor = alumnos[0];\nfor (const a of alumnos) {\n  if (a.nota > mejor.nota) mejor = a;\n}\nconsole.log(`Mejor: ${mejor.nombre} (${mejor.nota})`);\nconsole.log(JSON.stringify(mejor));',
          }),
        ]),
        mmszProyecto('carrito de compras', [
          mmszPaso('Total', `
            Con el arreglo «carrito», calcula el total (precio × cantidad de cada producto) y muestra «Total: 23.1».
          `, {
            inicio: 'const carrito = [\n  { producto: "Cuaderno", precio: 4.5, cantidad: 3 },\n  { producto: "Lapicero", precio: 1.2, cantidad: 5 },\n  { producto: "Regla", precio: 3.6, cantidad: 1 },\n];\n',
            salida: 'Total: 23.1',
            requiere: ['total'],
            solucion: 'const carrito = [\n  { producto: "Cuaderno", precio: 4.5, cantidad: 3 },\n  { producto: "Lapicero", precio: 1.2, cantidad: 5 },\n  { producto: "Regla", precio: 3.6, cantidad: 1 },\n];\nlet total = 0;\nfor (const item of carrito) {\n  total += item.precio * item.cantidad;\n}\nconsole.log(`Total: ${total.toFixed(1)}`);',
          }),
          mmszPaso('Detalle', `
            Antes del total, muestra una línea por producto: «Cuaderno x3 = 13.50» (subtotal con 2 decimales).
          `, {
            salida: 'Cuaderno x3 = 13.50\nLapicero x5 = 6.00\nRegla x1 = 3.60\nTotal: 23.1',
            solucion: 'const carrito = [\n  { producto: "Cuaderno", precio: 4.5, cantidad: 3 },\n  { producto: "Lapicero", precio: 1.2, cantidad: 5 },\n  { producto: "Regla", precio: 3.6, cantidad: 1 },\n];\nlet total = 0;\nfor (const item of carrito) {\n  const sub = item.precio * item.cantidad;\n  console.log(`${item.producto} x${item.cantidad} = ${sub.toFixed(2)}`);\n  total += sub;\n}\nconsole.log(`Total: ${total.toFixed(1)}`);',
          }),
        ]),
        mmszRepaso('objetos', `
          - Objeto: «{ clave: valor }»; acceso con «obj.clave» u «obj["clave"]».
          - Métodos: funciones dentro del objeto; «this» es el propio objeto.
          - «for...in» y «Object.keys()» recorren las claves.
          - Arreglos de objetos: «for...of» y «find()».
          - «JSON.stringify» (objeto → texto) y «JSON.parse» (texto → objeto).
        `),
      ], [
        mmszElige('¿Qué hace «JSON.stringify(obj)»?', ['*Convierte el objeto a texto JSON', 'Convierte texto a objeto', 'Copia el objeto'], 'stringify → texto.'),
        mmszElige('¿Qué devuelve «find» si no encuentra nada?', ['*undefined', 'null', '-1'], 'find devuelve undefined.'),
        mmszCompleta('Completa para convertir texto JSON a objeto.', 'const obj = JSON.___(texto);', ['parse'], 'parse lee JSON.'),
        mmszElige('¿Qué muestra este código?', ['*Luis', 'Ana', 'undefined'], 'find devuelve el primero que cumple.', 'const l = [{ n: "Ana", e: 17 }, { n: "Luis", e: 20 }];\nconsole.log(l.find((x) => x.e > 18).n);'),
        mmszEscribe('Muestra en JSON el objeto { a: 1, b: 2 }.', '', '{"a":1,"b":2}', 'console.log(JSON.stringify({ a: 1, b: 2 }));'),
      ]),
    ]),

    mmszUnidad('Avanzado', 'Programación funcional', 'map, filter, reduce, desestructuración y el operador spread.', [
      mmszLeccion('js-8-1', 'map, filter y reduce', 'Transformar, filtrar y resumir arreglos sin bucles.', [
        mmszLectura('Métodos funcionales', `
          Estos métodos reciben una función y **devuelven un nuevo arreglo o valor**, sin modificar el original:

          - «map»: transforma cada elemento.
          - «filter»: se queda con los que cumplen una condición.
          - «reduce»: combina todos en un solo valor.

          ~~~run
          const nums = [1, 2, 3, 4, 5];
          const dobles = nums.map((n) => n * 2);
          const pares = nums.filter((n) => n % 2 === 0);
          const suma = nums.reduce((acc, n) => acc + n, 0);
          console.log(dobles.join(" "));
          console.log(pares.join(" "));
          console.log(suma);
          ~~~

          Se pueden encadenar:

          ~~~run
          const precios = [10, 25, 8, 40];
          const totalCaros = precios
            .filter((p) => p > 9)
            .map((p) => p * 1.18)
            .reduce((a, b) => a + b, 0);
          console.log(totalCaros.toFixed(2));
          ~~~

          También son útiles «some» (¿alguno cumple?) y «every» (¿todos cumplen?).
        `),
        mmszDesafio('procesar notas', [
          mmszPaso('Aprobados', `
            Con «notas = [15, 8, 18, 10, 20]», usa «filter» para obtener las aprobadas (>= 11) y muéstralas unidas por espacios.
          `, {
            inicio: 'const notas = [15, 8, 18, 10, 20];\n',
            salida: '15 18 20',
            requiere: ['filter'],
            solucion: 'const notas = [15, 8, 18, 10, 20];\nconst aprobadas = notas.filter((n) => n >= 11);\nconsole.log(aprobadas.join(" "));',
          }),
          mmszPaso('Promedio con reduce', `
            Calcula el promedio de **todas** las notas con «reduce» y muestra «Promedio: 14.2».
          `, {
            salida: '15 18 20\nPromedio: 14.2',
            requiere: ['reduce'],
            solucion: 'const notas = [15, 8, 18, 10, 20];\nconst aprobadas = notas.filter((n) => n >= 11);\nconsole.log(aprobadas.join(" "));\nconst promedio = notas.reduce((a, n) => a + n, 0) / notas.length;\nconsole.log(`Promedio: ${promedio}`);',
          }),
        ]),
      ], [
        mmszElige('¿Qué devuelve «[1, 2, 3].map((x) => x * 10)»?', ['*[10, 20, 30]', '60', '[1, 2, 3]'], 'map transforma cada elemento.'),
        mmszElige('¿Qué devuelve «[1, 2, 3, 4].filter((x) => x > 2)»?', ['*[3, 4]', '[1, 2]', 'true'], 'filter se queda con los que cumplen.'),
        mmszCompleta('Completa para sumar todo.', 'const s = nums.___((a, n) => a + n, 0);', ['reduce'], 'reduce acumula.'),
        mmszElige('¿map modifica el arreglo original?', ['*No, devuelve uno nuevo', 'Sí', 'Solo si es const'], 'Devuelve un arreglo nuevo.'),
        mmszEscribe('Con map, muestra los cuadrados de [1, 2, 3] unidos por espacios.', '', '1 4 9', 'console.log([1, 2, 3].map((n) => n * n).join(" "));'),
      ]),

      mmszLeccion('js-8-2', 'Desestructuración y spread', 'Extraer valores de objetos y arreglos, y copiar o combinar datos.', [
        mmszLectura('Desestructuración', `
          La **desestructuración** saca valores de un objeto o arreglo en variables, en una sola línea:

          ~~~run
          const alumno = { nombre: "Ana", edad: 19, carrera: "Sistemas" };
          const { nombre, carrera } = alumno;
          console.log(nombre, carrera);

          const [primero, segundo] = [10, 20, 30];
          console.log(primero + segundo);
          ~~~

          ### Spread «...»
          Copia o combina arreglos y objetos:

          ~~~run
          const a = [1, 2];
          const b = [3, 4];
          const todos = [...a, ...b, 5];
          console.log(todos.join(" "));

          const base = { color: "rojo", talla: "M" };
          const nuevo = { ...base, talla: "L" };
          console.log(nuevo.color, nuevo.talla);
          ~~~

          ### Rest en parámetros
          ~~~run
          function sumarTodo(...numeros) {
            return numeros.reduce((s, n) => s + n, 0);
          }
          console.log(sumarTodo(1, 2, 3, 4));
          ~~~
        `),
        mmszDesafio('perfil de usuario', [
          mmszPaso('Extrae datos', `
            Del objeto «usuario», saca «nombre» y «ciudad» con desestructuración y muestra «Ana vive en Lima».
          `, {
            inicio: 'const usuario = { nombre: "Ana", edad: 22, ciudad: "Lima" };\n',
            salida: 'Ana vive en Lima',
            requiere: ['const {'],
            solucion: 'const usuario = { nombre: "Ana", edad: 22, ciudad: "Lima" };\nconst { nombre, ciudad } = usuario;\nconsole.log(`${nombre} vive en ${ciudad}`);',
          }),
          mmszPaso('Actualiza con spread', `
            Crea «actualizado» copiando «usuario» con spread pero con «ciudad: "Cusco"». Muestra «actualizado.ciudad» y «usuario.ciudad» (el original no cambia).
          `, {
            salida: 'Ana vive en Lima\nCusco\nLima',
            requiere: ['...usuario'],
            solucion: 'const usuario = { nombre: "Ana", edad: 22, ciudad: "Lima" };\nconst { nombre, ciudad } = usuario;\nconsole.log(`${nombre} vive en ${ciudad}`);\nconst actualizado = { ...usuario, ciudad: "Cusco" };\nconsole.log(actualizado.ciudad);\nconsole.log(usuario.ciudad);',
          }),
        ]),
        mmszProyecto('reporte de ventas', [
          mmszPaso('Ventas por vendedor', `
            Con el arreglo «ventas», usa «reduce» para crear un objeto con el total por vendedor y muéstralo con «JSON.stringify». Resultado: «{"Ana":350,"Luis":200}».
          `, {
            inicio: 'const ventas = [\n  { vendedor: "Ana", monto: 200 },\n  { vendedor: "Luis", monto: 120 },\n  { vendedor: "Ana", monto: 150 },\n  { vendedor: "Luis", monto: 80 },\n];\n',
            pista: 'const totales = ventas.reduce((acc, { vendedor, monto }) => {\n  acc[vendedor] = (acc[vendedor] || 0) + monto;\n  return acc;\n}, {});',
            salida: '{"Ana":350,"Luis":200}',
            requiere: ['reduce'],
            solucion: 'const ventas = [\n  { vendedor: "Ana", monto: 200 },\n  { vendedor: "Luis", monto: 120 },\n  { vendedor: "Ana", monto: 150 },\n  { vendedor: "Luis", monto: 80 },\n];\nconst totales = ventas.reduce((acc, { vendedor, monto }) => {\n  acc[vendedor] = (acc[vendedor] || 0) + monto;\n  return acc;\n}, {});\nconsole.log(JSON.stringify(totales));',
          }),
          mmszPaso('Ranking', `
            Convierte «totales» en pares con «Object.entries», ordénalos de mayor a menor y muestra «1. Ana: 350» y «2. Luis: 200».
          `, {
            salida: '{"Ana":350,"Luis":200}\n1. Ana: 350\n2. Luis: 200',
            requiere: ['Object.entries'],
            solucion: 'const ventas = [\n  { vendedor: "Ana", monto: 200 },\n  { vendedor: "Luis", monto: 120 },\n  { vendedor: "Ana", monto: 150 },\n  { vendedor: "Luis", monto: 80 },\n];\nconst totales = ventas.reduce((acc, { vendedor, monto }) => {\n  acc[vendedor] = (acc[vendedor] || 0) + monto;\n  return acc;\n}, {});\nconsole.log(JSON.stringify(totales));\nObject.entries(totales)\n  .sort((a, b) => b[1] - a[1])\n  .forEach(([nombre, total], i) => console.log(`${i + 1}. ${nombre}: ${total}`));',
          }),
        ]),
        mmszRepaso('programación funcional', `
          - «map» transforma, «filter» filtra, «reduce» resume; no cambian el original.
          - «some» y «every» preguntan por la condición.
          - Desestructuración: «const { a, b } = obj» y «const [x, y] = arr».
          - Spread «...»: copiar/combinar arreglos y objetos.
          - Rest «...params»: recibir cualquier cantidad de argumentos.
        `),
      ], [
        mmszElige('Después de «const { x } = { x: 5, y: 2 }», ¿cuánto vale x?', ['*5', '2', 'undefined'], 'Se extrae la propiedad x.'),
        mmszElige('¿Qué es «[...[1, 2], 3]»?', ['*[1, 2, 3]', '[[1, 2], 3]', 'Error'], 'Spread esparce los elementos.'),
        mmszCompleta('Completa para copiar el objeto cambiando la edad.', 'const copia = { ___obj, edad: 30 };', ['...'], 'Spread copia las propiedades.'),
        mmszElige('¿Qué recibe «function f(...args)»?', ['*Todos los argumentos en un arreglo', 'Solo el primero', 'Un objeto'], 'Es el parámetro rest.'),
        mmszEscribe('Desestructura [10, 20] en a y b y muestra a + b.', '', '30', 'const [a, b] = [10, 20];\nconsole.log(a + b);'),
      ]),
    ]),

    mmszUnidad('Avanzado', 'Clases y errores', 'Programación orientada a objetos con clases y manejo de errores con try/catch.', [
      mmszLeccion('js-9-1', 'Clases y herencia', 'class, constructor, métodos, extends y super.', [
        mmszLectura('Clases', `
          Una **clase** es un molde para crear objetos con los mismos datos y métodos:

          ~~~run
          class Perro {
            constructor(nombre, edad) {
              this.nombre = nombre;
              this.edad = edad;
            }
            ladrar() {
              console.log(\`\${this.nombre} dice: ¡Guau!\`);
            }
          }
          const rex = new Perro("Rex", 3);
          rex.ladrar();
          ~~~

          ### Herencia
          «extends» hereda de otra clase y «super» llama al constructor o métodos del padre:

          ~~~run
          class Animal {
            constructor(nombre) {
              this.nombre = nombre;
            }
            hablar() {
              console.log("...");
            }
          }
          class Gato extends Animal {
            hablar() {
              console.log(\`\${this.nombre}: ¡Miau!\`);
            }
          }
          const animales = [new Animal("Genérico"), new Gato("Tom")];
          animales.forEach((a) => a.hablar());
          ~~~
        `),
        mmszDesafio('figuras geométricas', [
          mmszPaso('Área polimórfica', `
            Crea «Rectangulo(base, altura)» y «Circulo(radio)» que extiendan «Figura» y tengan su método «area()». Usa 3.14 para pi. Muestra el área de «new Rectangulo(4, 5)» y «new Circulo(2)».
          `, {
            inicio: 'class Figura {\n  area() {\n    return 0;\n  }\n}\n',
            salida: '20\n12.56',
            requiere: ['extends Figura'],
            solucion: 'class Figura {\n  area() {\n    return 0;\n  }\n}\nclass Rectangulo extends Figura {\n  constructor(base, altura) {\n    super();\n    this.base = base;\n    this.altura = altura;\n  }\n  area() {\n    return this.base * this.altura;\n  }\n}\nclass Circulo extends Figura {\n  constructor(radio) {\n    super();\n    this.radio = radio;\n  }\n  area() {\n    return 3.14 * this.radio ** 2;\n  }\n}\nfor (const f of [new Rectangulo(4, 5), new Circulo(2)]) {\n  console.log(f.area());\n}',
          }),
        ]),
      ], [
        mmszElige('¿Qué palabra crea un objeto a partir de una clase?', ['*new', 'create', 'make'], 'Se usa new Clase().'),
        mmszElige('¿Qué método se ejecuta al crear el objeto?', ['*constructor', 'init', 'start'], 'constructor inicializa el objeto.'),
        mmszCompleta('Completa la herencia.', 'class Gato ___ Animal {', ['extends'], 'extends hereda.'),
        mmszElige('¿Para qué sirve super()?', ['*Llamar al constructor/métodos del padre', 'Crear una clase', 'Borrar el objeto'], 'super accede al padre.'),
        mmszEscribe('Crea la clase Punto con x e y, crea new Punto(3, 4) y muestra x + y.', '', '7', 'class Punto {\n  constructor(x, y) {\n    this.x = x;\n    this.y = y;\n  }\n}\nconst p = new Punto(3, 4);\nconsole.log(p.x + p.y);'),
      ]),

      mmszLeccion('js-9-2', 'Manejo de errores', 'try, catch, finally y throw.', [
        mmszLectura('try y catch', `
          Cuando ocurre un error, el programa se detiene. Con «try/catch» lo atrapas y sigues:

          ~~~run
          try {
            const datos = JSON.parse("esto no es JSON");
          } catch (error) {
            console.log("No se pudo leer:", error.name);
          }
          console.log("El programa sigue");
          ~~~

          ### Lanzar errores con throw
          Puedes crear tus propios errores para validar datos:

          ~~~run
          function dividir(a, b) {
            if (b === 0) throw new Error("No se puede dividir entre cero");
            return a / b;
          }
          try {
            console.log(dividir(10, 2));
            console.log(dividir(5, 0));
          } catch (e) {
            console.log("Error:", e.message);
          } finally {
            console.log("Fin");
          }
          ~~~

          «finally» se ejecuta siempre, haya error o no.
        `),
        mmszDesafio('validador de edad', [
          mmszPaso('Valida', `
            Crea «validarEdad(edad)» que lance «new Error("Edad inválida")» si la edad es menor que 0 o mayor que 120, y si no devuelva «"Edad válida"». Prueba con 25 y con -5 dentro de un «try/catch» (muestra «e.message»).
          `, {
            inicio: '',
            salida: 'Edad válida\nEdad inválida',
            requiere: ['throw', 'catch'],
            solucion: 'function validarEdad(edad) {\n  if (edad < 0 || edad > 120) throw new Error("Edad inválida");\n  return "Edad válida";\n}\nfor (const e of [25, -5]) {\n  try {\n    console.log(validarEdad(e));\n  } catch (err) {\n    console.log(err.message);\n  }\n}',
          }),
        ]),
        mmszProyecto('sistema de inventario', [
          mmszPaso('Clase Inventario', `
            Crea la clase «Inventario» con un objeto «stock» y los métodos «agregar(producto, cantidad)» y «sacar(producto, cantidad)». «sacar» debe lanzar «new Error(\`Sin stock de \${producto}\`)» si no hay suficiente. Agrega 10 lápices, saca 3 y muestra «stock.lapiz».
          `, {
            inicio: '',
            salida: '7',
            requiere: ['class Inventario', 'throw'],
            solucion: 'class Inventario {\n  constructor() {\n    this.stock = {};\n  }\n  agregar(producto, cantidad) {\n    this.stock[producto] = (this.stock[producto] || 0) + cantidad;\n  }\n  sacar(producto, cantidad) {\n    if ((this.stock[producto] || 0) < cantidad) throw new Error(`Sin stock de ${producto}`);\n    this.stock[producto] -= cantidad;\n  }\n}\nconst inv = new Inventario();\ninv.agregar("lapiz", 10);\ninv.sacar("lapiz", 3);\nconsole.log(inv.stock.lapiz);',
          }),
          mmszPaso('Pedido grande', `
            Intenta sacar 20 lápices dentro de un «try/catch» y muestra el mensaje de error: «Sin stock de lapiz».
          `, {
            salida: '7\nSin stock de lapiz',
            requiere: ['try'],
            solucion: 'class Inventario {\n  constructor() {\n    this.stock = {};\n  }\n  agregar(producto, cantidad) {\n    this.stock[producto] = (this.stock[producto] || 0) + cantidad;\n  }\n  sacar(producto, cantidad) {\n    if ((this.stock[producto] || 0) < cantidad) throw new Error(`Sin stock de ${producto}`);\n    this.stock[producto] -= cantidad;\n  }\n}\nconst inv = new Inventario();\ninv.agregar("lapiz", 10);\ninv.sacar("lapiz", 3);\nconsole.log(inv.stock.lapiz);\ntry {\n  inv.sacar("lapiz", 20);\n} catch (e) {\n  console.log(e.message);\n}',
          }),
        ]),
        mmszRepaso('clases y errores', `
          - «class Nombre { constructor() {} metodo() {} }» y «new Nombre()».
          - «extends» para heredar; «super()» para llamar al padre.
          - «try { } catch (e) { } finally { }» atrapa errores.
          - «throw new Error("mensaje")» lanza un error propio; «e.message» lo lee.
        `),
      ], [
        mmszElige('¿Cuándo se ejecuta finally?', ['*Siempre', 'Solo si hay error', 'Nunca'], 'finally siempre se ejecuta.'),
        mmszCompleta('Completa para lanzar un error.', '___ new Error("Algo salió mal");', ['throw'], 'throw lanza el error.'),
        mmszElige('¿Qué muestra este código?', ['*Falló', 'Bien', 'Nada'], 'Se lanza un error y se atrapa.', 'try {\n  throw new Error("x");\n  console.log("Bien");\n} catch (e) {\n  console.log("Falló");\n}'),
        mmszElige('¿Cómo lees el texto de un error atrapado «e»?', ['*e.message', 'e.text', 'e.error'], 'message tiene el texto.'),
        mmszEscribe('Atrapa el error de JSON.parse("{") y muestra "JSON inválido".', '', 'JSON inválido', 'try {\n  JSON.parse("{");\n} catch (e) {\n  console.log("JSON inválido");\n}'),
      ]),
    ]),
  ],
};
