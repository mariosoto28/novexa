// Autor: MMSZ (Mario Soto Zea)
// Curso de Python: de lo básico a lo avanzado (9 unidades).
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

export const mmszPython: MmszCourse = {
  id: 'python',
  name: 'Python',
  tagline: 'El lenguaje ideal para empezar',
  color: '#3fb6a8',
  icon: '🐍',
  units: [
    /* =============================== BÁSICO =============================== */
    mmszUnidad('Básico', 'Primeros pasos', 'Qué es programar, cómo mostrar mensajes y cómo guardar datos en variables.', [
      mmszLeccion('py-1-1', 'Hola, mundo', 'Tu primer programa: mostrar texto en pantalla y escribir comentarios.', [
        mmszLectura('¿Qué es programar?', `
          Programar es darle a la computadora una lista de **instrucciones** para que las siga en orden, de arriba hacia abajo. A esa lista se le llama **programa**.

          Python es un lenguaje muy usado en ciencia de datos, inteligencia artificial, automatización y desarrollo web. Su ventaja es que se lee casi como inglés.

          La instrucción más básica es «print()», que muestra algo en pantalla:

          ~~~run
          print("Hola, mundo")
          print("Estoy aprendiendo Python")
          ~~~

          ### Comentarios
          Todo lo que va después de «#» es un **comentario**: Python lo ignora. Sirven para explicar tu código a otras personas (o a ti mismo en el futuro).

          ~~~run
          # Esto es un comentario, no se ejecuta
          print("Los comentarios no se muestran")  # también pueden ir al final
          ~~~

          > Fíjate en las comillas: el texto siempre va entre comillas dobles " " o simples ' '.
        `),
        mmszConsejo('texto vs. números', `
          Si escribes algo **entre comillas**, Python lo trata como texto y lo muestra tal cual. Sin comillas, Python lo calcula.

          ~~~run
          print("2 + 3")
          print(2 + 3)
          ~~~

          La primera línea muestra «2 + 3» y la segunda muestra «5».
        `),
        mmszDesafio('tu tarjeta de presentación', [
          mmszPaso('Saluda', `
            Escribe un programa que muestre exactamente el texto «Hola, soy estudiante».
          `, {
            inicio: '# Escribe tu código aquí\n',
            pista: 'print("...")',
            salida: 'Hola, soy estudiante',
            requiere: ['print'],
            solucion: 'print("Hola, soy estudiante")',
          }),
          mmszPaso('Agrega más líneas', `
            Debajo, agrega dos líneas más para que el programa muestre en total:

            - «Hola, soy estudiante»
            - «Estudio Ingeniería de Sistemas»
            - «Me gusta programar»
          `, {
            pista: 'Cada print() muestra una línea.',
            salida: 'Hola, soy estudiante\nEstudio Ingeniería de Sistemas\nMe gusta programar',
            solucion: 'print("Hola, soy estudiante")\nprint("Estudio Ingeniería de Sistemas")\nprint("Me gusta programar")',
          }),
        ]),
      ], [
        mmszElige('¿Qué función muestra texto en pantalla en Python?', ['*print()', 'echo()', 'console.log()', 'cout'], 'print() es la función de Python para mostrar información.'),
        mmszCompleta('Completa el código para mostrar el saludo.', '___("Hola, mundo")', ['print'], 'Se escribe print seguido de paréntesis.'),
        mmszElige('¿Qué muestra este código?', ['5', '*2 + 3', 'Error'], 'Entre comillas es texto: se muestra tal cual.', 'print("2 + 3")'),
        mmszElige('¿Qué hace la línea «# calcular total»?', ['*Nada: es un comentario', 'Calcula el total', 'Muestra "calcular total"'], 'Todo lo que va después de # es un comentario y se ignora.'),
        mmszEscribe('Muestra exactamente: Python es genial', '', 'Python es genial', 'print("Python es genial")'),
      ]),

      mmszLeccion('py-1-2', 'Variables y tipos de datos', 'Guardar datos con nombre y conocer los tipos: int, float, str y bool.', [
        mmszLectura('Variables', `
          Una **variable** es una caja con nombre donde guardas un dato para usarlo después. Se crea con el signo «=»:

          ~~~run
          nombre = "Ana"
          edad = 19
          print(nombre)
          print(edad)
          ~~~

          El «=» **no significa "igual"** como en matemáticas: significa "guarda el valor de la derecha en la variable de la izquierda". Por eso puedes cambiar el valor:

          ~~~run
          puntos = 10
          puntos = puntos + 5
          print(puntos)
          ~~~

          ### Reglas para los nombres
          - Pueden tener letras, números y guion bajo: «nota_final», «total2».
          - No pueden empezar con número ni tener espacios.
          - Python distingue mayúsculas: «edad» y «Edad» son variables distintas.
        `),
        mmszLectura('Tipos de datos', `
          Cada valor tiene un **tipo**. Los cuatro básicos son:

          - «int»: números enteros, como «7» o «-3».
          - «float»: números con decimales, como «3.14».
          - «str»: texto (string), como «"hola"».
          - «bool»: verdadero o falso: «True» o «False».

          Puedes preguntar el tipo con «type()»:

          ~~~run
          print(type(7))
          print(type(3.14))
          print(type("hola"))
          print(type(True))
          ~~~

          > Python decide el tipo automáticamente según el valor que guardas. Por eso se dice que tiene **tipado dinámico**.
        `),
        mmszDesafio('datos de un estudiante', [
          mmszPaso('Crea las variables', `
            Crea tres variables: «nombre» con el valor «"Luis"», «ciclo» con el valor «3» y «promedio» con el valor «15.5».
            Luego muéstralas en ese orden, cada una con su propio «print()».
          `, {
            inicio: '# Crea tus variables aquí\n',
            pista: 'nombre = "Luis"\nprint(nombre)',
            salida: 'Luis\n3\n15.5',
            requiere: ['nombre', 'ciclo', 'promedio'],
            solucion: 'nombre = "Luis"\nciclo = 3\npromedio = 15.5\nprint(nombre)\nprint(ciclo)\nprint(promedio)',
          }),
          mmszPaso('Pasa al siguiente ciclo', `
            Antes de los «print()», agrega una línea que aumente «ciclo» en 1 usando la misma variable («ciclo = ciclo + 1»). Ahora debe mostrarse 4.
          `, {
            salida: 'Luis\n4\n15.5',
            requiere: ['ciclo = ciclo + 1'],
            solucion: 'nombre = "Luis"\nciclo = 3\npromedio = 15.5\nciclo = ciclo + 1\nprint(nombre)\nprint(ciclo)\nprint(promedio)',
          }),
        ]),
        mmszProyecto('ficha personal', [
          mmszPaso('Tu ficha', `
            Crea las variables «nombre = "Mario"», «carrera = "Sistemas"» y «edad = 20».
            Muestra una ficha con este formato exacto (usa comas en «print» para separar con espacios):

            ~~~
            Nombre: Mario
            Carrera: Sistemas
            Edad: 20
            ~~~
          `, {
            inicio: '',
            pista: 'print("Nombre:", nombre)',
            salida: 'Nombre: Mario\nCarrera: Sistemas\nEdad: 20',
            requiere: ['nombre', 'carrera', 'edad'],
            solucion: 'nombre = "Mario"\ncarrera = "Sistemas"\nedad = 20\nprint("Nombre:", nombre)\nprint("Carrera:", carrera)\nprint("Edad:", edad)',
          }),
          mmszPaso('Cumpleaños', `
            Al final, suma 1 a «edad» y muestra «Edad el próximo año: 21».
          `, {
            salida: 'Nombre: Mario\nCarrera: Sistemas\nEdad: 20\nEdad el próximo año: 21',
            solucion: 'nombre = "Mario"\ncarrera = "Sistemas"\nedad = 20\nprint("Nombre:", nombre)\nprint("Carrera:", carrera)\nprint("Edad:", edad)\nedad = edad + 1\nprint("Edad el próximo año:", edad)',
          }),
        ]),
        mmszRepaso('primeros pasos', `
          - «print()» muestra información; el texto va entre comillas.
          - «#» crea comentarios que Python ignora.
          - Una variable guarda un dato: «nombre = "Ana"».
          - «=» asigna; puedes reasignar: «x = x + 1».
          - Tipos básicos: «int», «float», «str», «bool». Usa «type()» para verlos.
          - Con comas, «print("Edad:", edad)» muestra varios valores separados por espacio.
        `),
      ], [
        mmszElige('¿Qué hace «edad = 20»?', ['*Guarda 20 en la variable edad', 'Compara edad con 20', 'Muestra 20'], 'Un solo = significa asignar.'),
        mmszElige('¿Qué muestra este programa?', ['5', '*7', 'x + 2'], 'x empieza en 5, luego se le suma 2.', 'x = 5\nx = x + 2\nprint(x)'),
        mmszElige('¿De qué tipo es el valor 3.14?', ['int', '*float', 'str', 'bool'], 'Los números con decimales son float.'),
        mmszElige('¿Cuál es un nombre de variable válido?', ['2nota', 'nota final', '*nota_final', 'nota-final'], 'Solo letras, números y _; no puede empezar con número.'),
        mmszOrdena('Ordena para mostrar la suma de a y b.', ['a = 3', 'b = 4', 'print(a + b)'], 'Primero se crean las variables y después se usan.'),
      ]),
    ]),

    mmszUnidad('Básico', 'Operaciones y textos', 'Cálculos con operadores aritméticos y cómo trabajar con textos.', [
      mmszLeccion('py-2-1', 'Operadores aritméticos', 'Sumar, restar, multiplicar, dividir, potencias y residuo.', [
        mmszLectura('Hacer cálculos', `
          Python funciona como una calculadora muy potente:

          - «+» suma, «-» resta, «*» multiplica.
          - «/» divide y **siempre** da un decimal: «7 / 2» es «3.5».
          - «//» es la **división entera**: «7 // 2» es «3».
          - «%» es el **residuo** (módulo): «7 % 2» es «1».
          - «**» es potencia: «2 ** 3» es «8».

          ~~~run
          print(7 / 2)
          print(7 // 2)
          print(7 % 2)
          print(2 ** 3)
          ~~~

          ### Orden de las operaciones
          Igual que en matemáticas: primero potencias, luego multiplicación y división, y al final suma y resta. Usa paréntesis para cambiar el orden.

          ~~~run
          print(2 + 3 * 4)
          print((2 + 3) * 4)
          ~~~
        `),
        mmszConsejo('el residuo sirve para saber si un número es par', `
          Un número es par si al dividirlo entre 2 el residuo es 0:

          ~~~run
          print(10 % 2)
          print(7 % 2)
          ~~~

          Lo usarás mucho con «if» en la unidad de decisiones.
        `),
        mmszDesafio('calculadora de notas', [
          mmszPaso('Promedio', `
            Tienes tres notas: «n1 = 14», «n2 = 17» y «n3 = 11». Calcula el promedio en una variable «promedio» y muéstralo.
          `, {
            inicio: 'n1 = 14\nn2 = 17\nn3 = 11\n',
            pista: 'promedio = (n1 + n2 + n3) / 3',
            salida: '14.0',
            requiere: ['promedio'],
            solucion: 'n1 = 14\nn2 = 17\nn3 = 11\npromedio = (n1 + n2 + n3) / 3\nprint(promedio)',
          }),
          mmszPaso('Puntos que faltan', `
            Para llegar a 20 de promedio, ¿cuántos puntos faltan? Agrega «faltan = 20 - promedio» y muéstralo debajo.
          `, {
            salida: '14.0\n6.0',
            requiere: ['faltan'],
            solucion: 'n1 = 14\nn2 = 17\nn3 = 11\npromedio = (n1 + n2 + n3) / 3\nprint(promedio)\nfaltan = 20 - promedio\nprint(faltan)',
          }),
        ]),
      ], [
        mmszElige('¿Qué muestra «print(7 // 2)»?', ['3.5', '*3', '4', '1'], '// es división entera: descarta los decimales.'),
        mmszElige('¿Qué muestra «print(10 % 3)»?', ['3', '*1', '3.33', '0'], '10 entre 3 da 3 y sobra 1.'),
        mmszElige('¿Qué muestra este código?', ['20', '*14', '10'], 'Primero 3 * 4 = 12 y luego 2 + 12.', 'print(2 + 3 * 4)'),
        mmszCompleta('Completa para calcular 2 elevado a 5.', 'print(2 ___ 5)', ['**'], '** es el operador de potencia.'),
        mmszEscribe('Muestra el resultado de 15 dividido entre 4 (con decimales).', '', '3.75', 'print(15 / 4)'),
      ]),

      mmszLeccion('py-2-2', 'Textos y f-strings', 'Unir textos, conocer su longitud y mezclar texto con variables.', [
        mmszLectura('Trabajar con textos', `
          Los textos (strings) se pueden **unir** con «+» y **repetir** con «*»:

          ~~~run
          nombre = "Ana"
          print("Hola " + nombre)
          print("ja" * 3)
          ~~~

          «len()» te dice cuántos caracteres tiene un texto, y hay métodos útiles como «.upper()» (mayúsculas) y «.lower()» (minúsculas):

          ~~~run
          ciudad = "Lima"
          print(len(ciudad))
          print(ciudad.upper())
          print(ciudad.lower())
          ~~~

          ### Convertir tipos
          No puedes sumar texto con números directamente («"Edad: " + 20» da error). Convierte con «str()», «int()» o «float()»:

          ~~~run
          edad = 20
          print("Edad: " + str(edad))
          print(int("15") + 5)
          ~~~
        `),
        mmszLectura('f-strings: la forma moderna', `
          Una **f-string** empieza con «f» antes de las comillas y te deja meter variables entre llaves «{ }». Es la forma más cómoda de armar mensajes:

          ~~~run
          nombre = "Luis"
          nota = 17
          print(f"{nombre} sacó {nota} en el examen")
          print(f"El doble es {nota * 2}")
          ~~~

          Puedes limitar decimales con «:.2f»:

          ~~~run
          precio = 10 / 3
          print(f"Precio: {precio:.2f}")
          ~~~
        `),
        mmszDesafio('boleta de compra', [
          mmszPaso('Total a pagar', `
            Tienes «producto = "Cuaderno"», «precio = 4.5» y «cantidad = 3».
            Calcula «total = precio * cantidad» y muestra con una f-string: «Cuaderno x3 = 13.5».
          `, {
            inicio: 'producto = "Cuaderno"\nprecio = 4.5\ncantidad = 3\n',
            pista: 'print(f"{producto} x{cantidad} = {total}")',
            salida: 'Cuaderno x3 = 13.5',
            requiere: ['total', 'f"'],
            solucion: 'producto = "Cuaderno"\nprecio = 4.5\ncantidad = 3\ntotal = precio * cantidad\nprint(f"{producto} x{cantidad} = {total}")',
          }),
          mmszPaso('Con IGV', `
            Agrega una línea que muestre el total con 18% de IGV y dos decimales: «Con IGV: 15.93».
          `, {
            pista: 'print(f"Con IGV: {total * 1.18:.2f}")',
            salida: 'Cuaderno x3 = 13.5\nCon IGV: 15.93',
            solucion: 'producto = "Cuaderno"\nprecio = 4.5\ncantidad = 3\ntotal = precio * cantidad\nprint(f"{producto} x{cantidad} = {total}")\nprint(f"Con IGV: {total * 1.18:.2f}")',
          }),
        ]),
        mmszProyecto('conversor de temperatura', [
          mmszPaso('Celsius a Fahrenheit', `
            Con «celsius = 25», calcula «fahrenheit = celsius * 9 / 5 + 32» y muestra «25 °C = 77.0 °F».
          `, {
            inicio: 'celsius = 25\n',
            salida: '25 °C = 77.0 °F',
            requiere: ['fahrenheit'],
            solucion: 'celsius = 25\nfahrenheit = celsius * 9 / 5 + 32\nprint(f"{celsius} °C = {fahrenheit} °F")',
          }),
          mmszPaso('Y a Kelvin', `
            Agrega «kelvin = celsius + 273.15» y muestra «25 °C = 298.15 K».
          `, {
            salida: '25 °C = 77.0 °F\n25 °C = 298.15 K',
            requiere: ['kelvin'],
            solucion: 'celsius = 25\nfahrenheit = celsius * 9 / 5 + 32\nprint(f"{celsius} °C = {fahrenheit} °F")\nkelvin = celsius + 273.15\nprint(f"{celsius} °C = {kelvin} K")',
          }),
        ]),
        mmszRepaso('operaciones y textos', `
          - «/» siempre da decimal; «//» es división entera; «%» es el residuo; «**» es potencia.
          - Los paréntesis cambian el orden de las operaciones.
          - Textos: «+» une, «*» repite, «len()» cuenta caracteres.
          - Convierte con «str()», «int()», «float()».
          - f-strings: «f"Hola {nombre}"» y «{valor:.2f}» para 2 decimales.
        `),
      ], [
        mmszElige('¿Qué muestra «print("ab" * 3)»?', ['*ababab', 'ab3', 'Error'], '* repite el texto.'),
        mmszElige('¿Qué muestra «print(len("Python"))»?', ['5', '*6', '7'], 'Python tiene 6 letras.'),
        mmszCompleta('Completa la f-string.', 'nombre = "Ana"\nprint(___"Hola {nombre}")', ['f'], 'Las f-strings empiezan con f.'),
        mmszElige('¿Qué pasa con «"Edad: " + 20»?', ['Muestra Edad: 20', '*Da error: no se puede sumar str con int', 'Muestra 20'], 'Hay que convertir: "Edad: " + str(20).'),
        mmszEscribe('Con nombre = "Rosa", muestra: Hola, Rosa! (usa f-string)', 'nombre = "Rosa"', 'Hola, Rosa!', 'nombre = "Rosa"\nprint(f"Hola, {nombre}!")'),
      ]),
    ]),

    mmszUnidad('Básico', 'Decisiones', 'Comparar valores y hacer que el programa tome caminos distintos.', [
      mmszLeccion('py-3-1', 'Comparaciones y lógica', 'Operadores de comparación y los operadores and, or y not.', [
        mmszLectura('Comparar valores', `
          Una comparación da como resultado «True» (verdadero) o «False» (falso):

          - «==» igual · «!=» distinto
          - «>» mayor · «<» menor
          - «>=» mayor o igual · «<=» menor o igual

          ~~~run
          print(5 > 3)
          print(10 == 10)
          print(7 != 7)
          ~~~

          > Cuidado: «=» guarda un valor; «==» pregunta si dos valores son iguales. Es el error más común al empezar.

          ### Operadores lógicos
          - «and»: verdadero si **ambas** condiciones lo son.
          - «or»: verdadero si **al menos una** lo es.
          - «not»: invierte el valor.

          ~~~run
          edad = 20
          tiene_dni = True
          print(edad >= 18 and tiene_dni)
          print(edad < 12 or edad > 65)
          print(not tiene_dni)
          ~~~
        `),
        mmszDesafio('¿puede votar?', [
          mmszPaso('Mayor de edad', `
            Con «edad = 17», muestra el resultado de comparar si la edad es mayor o igual a 18.
          `, {
            inicio: 'edad = 17\n',
            salida: 'False',
            requiere: ['>='],
            solucion: 'edad = 17\nprint(edad >= 18)',
          }),
          mmszPaso('Rango de edad', `
            Agrega otra línea que muestre si la edad está **entre 13 y 19** (ambos incluidos) usando «and».
          `, {
            pista: 'print(edad >= 13 and edad <= 19)',
            salida: 'False\nTrue',
            requiere: ['and'],
            solucion: 'edad = 17\nprint(edad >= 18)\nprint(edad >= 13 and edad <= 19)',
          }),
        ]),
      ], [
        mmszElige('¿Qué muestra «print(5 > 3)»?', ['*True', 'False', '5'], '5 es mayor que 3.'),
        mmszElige('¿Cuál es la diferencia entre = y ==?', ['*= asigna, == compara', 'Son lo mismo', '= compara, == asigna'], '= guarda; == pregunta si son iguales.'),
        mmszElige('¿Qué muestra este código?', ['True', '*False'], 'and necesita que ambas sean verdaderas.', 'print(True and False)'),
        mmszElige('¿Qué muestra este código?', ['*True', 'False'], 'or necesita solo una verdadera.', 'print(3 > 5 or 2 < 4)'),
        mmszCompleta('Completa para comprobar si x es distinto de 0.', 'print(x ___ 0)', ['!='], '!= significa distinto.'),
      ]),

      mmszLeccion('py-3-2', 'if, elif y else', 'Ejecutar código solo cuando se cumple una condición.', [
        mmszLectura('Tomar decisiones con if', `
          «if» ejecuta un bloque **solo si** la condición es verdadera. El bloque se marca con **sangría** (4 espacios) y la línea del «if» termina con dos puntos «:».

          ~~~run
          nota = 15
          if nota >= 11:
              print("Aprobado")
          print("Fin")
          ~~~

          «else» es el camino alternativo, y «elif» (else if) permite revisar varias condiciones en orden:

          ~~~run
          nota = 8
          if nota >= 17:
              print("Excelente")
          elif nota >= 11:
              print("Aprobado")
          else:
              print("Desaprobado")
          ~~~

          > Python revisa las condiciones de arriba hacia abajo y ejecuta **solo el primer bloque** que se cumpla.
        `),
        mmszConsejo('la sangría importa', `
          En Python la sangría no es decoración: define qué líneas están **dentro** del «if». Si una línea no tiene sangría, ya está fuera del bloque y se ejecuta siempre.

          ~~~run
          x = 3
          if x > 5:
              print("x es grande")
          print("esta línea siempre se ve")
          ~~~
        `),
        mmszDesafio('par o impar', [
          mmszPaso('Revisa el número', `
            Con «numero = 7», usa «if» y «else» con el operador «%» para mostrar «7 es impar» (o «es par» si fuera par). Usa una f-string.
          `, {
            inicio: 'numero = 7\n',
            pista: 'if numero % 2 == 0:\n    print(f"{numero} es par")',
            salida: '7 es impar',
            requiere: ['if', 'else', '%'],
            solucion: 'numero = 7\nif numero % 2 == 0:\n    print(f"{numero} es par")\nelse:\n    print(f"{numero} es impar")',
          }),
        ]),
        mmszProyecto('sistema de calificaciones', [
          mmszPaso('Letra según la nota', `
            Con «nota = 14», muestra la calificación según esta tabla, usando «if», «elif» y «else»:

            - 18 o más: «A»
            - 14 a 17: «B»
            - 11 a 13: «C»
            - menos de 11: «D»
          `, {
            inicio: 'nota = 14\n',
            salida: 'B',
            requiere: ['if', 'elif', 'else'],
            solucion: 'nota = 14\nif nota >= 18:\n    print("A")\nelif nota >= 14:\n    print("B")\nelif nota >= 11:\n    print("C")\nelse:\n    print("D")',
          }),
          mmszPaso('Mensaje final', `
            Después del bloque anterior, agrega otro «if» que muestre «Aprobado» si la nota es 11 o más, y «Desaprobado» si no.
          `, {
            salida: 'B\nAprobado',
            solucion: 'nota = 14\nif nota >= 18:\n    print("A")\nelif nota >= 14:\n    print("B")\nelif nota >= 11:\n    print("C")\nelse:\n    print("D")\nif nota >= 11:\n    print("Aprobado")\nelse:\n    print("Desaprobado")',
          }),
        ]),
        mmszRepaso('decisiones', `
          - Comparaciones: «==», «!=», «>», «<», «>=», «<=» → dan «True» o «False».
          - Lógicos: «and» (ambas), «or» (al menos una), «not» (invierte).
          - «if condición:» + bloque con sangría.
          - «elif» revisa otra condición; «else» es el caso por defecto.
          - Solo se ejecuta el **primer** bloque cuya condición se cumple.
        `),
      ], [
        mmszElige('¿Qué muestra este programa?', ['*Aprobado', 'Desaprobado', 'Las dos'], '15 >= 11 es verdadero.', 'nota = 15\nif nota >= 11:\n    print("Aprobado")\nelse:\n    print("Desaprobado")'),
        mmszCompleta('Completa la palabra que falta.', 'if lluvia:\n    print("Paraguas")\n___:\n    print("Sol")', ['else'], 'else es el camino cuando la condición es falsa.'),
        mmszElige('¿Qué muestra este programa?', ['Excelente', '*Bien', 'Regular'], 'La primera condición falsa, la segunda verdadera.', 'n = 15\nif n >= 18:\n    print("Excelente")\nelif n >= 12:\n    print("Bien")\nelse:\n    print("Regular")'),
        mmszOrdena('Ordena el programa.', ['edad = 20', 'if edad >= 18:', '    print("Mayor de edad")', 'else:', '    print("Menor de edad")'], 'El if con su bloque y luego el else con el suyo.'),
        mmszEscribe('Con x = -4, muestra "negativo" si x < 0 y "positivo o cero" si no.', 'x = -4', 'negativo', 'x = -4\nif x < 0:\n    print("negativo")\nelse:\n    print("positivo o cero")'),
      ]),
    ]),

    /* ============================= INTERMEDIO ============================= */
    mmszUnidad('Intermedio', 'Bucles', 'Repetir instrucciones con for y while, y controlar los bucles con break y continue.', [
      mmszLeccion('py-4-1', 'Bucle for y range', 'Repetir un bloque un número de veces o recorrer una secuencia.', [
        mmszLectura('Repetir con for', `
          «for» repite un bloque para cada elemento de una secuencia. Con «range(n)» obtienes los números de «0» hasta «n-1»:

          ~~~run
          for i in range(3):
              print("Vuelta", i)
          ~~~

          «range» acepta inicio, fin y paso: «range(inicio, fin, paso)». El fin **nunca se incluye**:

          ~~~run
          for n in range(1, 6):
              print(n)
          for n in range(10, 0, -3):
              print(n)
          ~~~

          También puedes recorrer un texto letra por letra:

          ~~~run
          for letra in "hola":
              print(letra)
          ~~~

          ### Acumuladores
          Un patrón muy común es acumular un resultado dentro del bucle:

          ~~~run
          total = 0
          for n in range(1, 5):
              total = total + n
          print(total)
          ~~~
        `),
        mmszDesafio('tabla de multiplicar', [
          mmszPaso('La tabla del 7', `
            Usa «for» y «range» para mostrar la tabla del 7 del 1 al 5, con el formato «7 x 1 = 7».
          `, {
            inicio: 'numero = 7\n',
            pista: 'for i in range(1, 6):\n    print(f"{numero} x {i} = {numero * i}")',
            salida: '7 x 1 = 7\n7 x 2 = 14\n7 x 3 = 21\n7 x 4 = 28\n7 x 5 = 35',
            requiere: ['for', 'range'],
            solucion: 'numero = 7\nfor i in range(1, 6):\n    print(f"{numero} x {i} = {numero * i}")',
          }),
          mmszPaso('Suma de resultados', `
            Agrega un acumulador «suma» que sume todos los resultados y muéstralo al final como «Suma: 105».
          `, {
            salida: '7 x 1 = 7\n7 x 2 = 14\n7 x 3 = 21\n7 x 4 = 28\n7 x 5 = 35\nSuma: 105',
            requiere: ['suma'],
            solucion: 'numero = 7\nsuma = 0\nfor i in range(1, 6):\n    print(f"{numero} x {i} = {numero * i}")\n    suma = suma + numero * i\nprint(f"Suma: {suma}")',
          }),
        ]),
      ], [
        mmszElige('¿Qué números muestra «for i in range(3): print(i)»?', ['*0, 1, 2', '1, 2, 3', '0, 1, 2, 3'], 'range(3) empieza en 0 y no incluye el 3.'),
        mmszElige('¿Qué números genera «range(2, 10, 3)»?', ['*2, 5, 8', '2, 5, 8, 11', '3, 6, 9'], 'Empieza en 2 y suma 3 mientras sea menor que 10.'),
        mmszCompleta('Completa para repetir 5 veces.', 'for i in ___(5):\n    print(i)', ['range'], 'range(5) da 5 valores.'),
        mmszOrdena('Ordena para sumar 1 + 2 + 3.', ['total = 0', 'for n in range(1, 4):', '    total = total + n', 'print(total)'], 'Acumulador antes, suma dentro, resultado después.'),
        mmszEscribe('Muestra los números pares del 2 al 10, uno por línea.', '', '2\n4\n6\n8\n10', 'for n in range(2, 11, 2):\n    print(n)'),
      ]),

      mmszLeccion('py-4-2', 'while, break y continue', 'Repetir mientras se cumpla una condición y controlar el bucle.', [
        mmszLectura('El bucle while', `
          «while» repite **mientras** la condición sea verdadera. Es útil cuando no sabes cuántas vueltas necesitas:

          ~~~run
          n = 3
          while n > 0:
              print(n)
              n = n - 1
          print("¡Despegue!")
          ~~~

          > Si la condición nunca se vuelve falsa, el bucle no termina (bucle infinito). Novexa corta el programa a los 4 segundos.

          ### break y continue
          - «break» sale del bucle inmediatamente.
          - «continue» salta a la siguiente vuelta.

          ~~~run
          for n in range(1, 10):
              if n == 5:
                  break
              if n % 2 == 0:
                  continue
              print(n)
          ~~~
        `),
        mmszConsejo('+= es un atajo', `
          En vez de «x = x + 1» puedes escribir «x += 1». También existen «-=», «*=» y «/=».

          ~~~run
          puntos = 10
          puntos += 5
          puntos *= 2
          print(puntos)
          ~~~
        `),
        mmszDesafio('ahorro mensual', [
          mmszPaso('¿Cuántos meses?', `
            Ahorras 150 soles por mes y quieres llegar a 1000. Usa «while» para contar los meses necesarios y muestra «Meses: 7».
          `, {
            inicio: 'ahorro = 0\nmeses = 0\n',
            pista: 'while ahorro < 1000:\n    ahorro += 150\n    meses += 1',
            salida: 'Meses: 7',
            requiere: ['while'],
            solucion: 'ahorro = 0\nmeses = 0\nwhile ahorro < 1000:\n    ahorro += 150\n    meses += 1\nprint(f"Meses: {meses}")',
          }),
          mmszPaso('Lo que sobra', `
            Muestra también cuánto ahorraste en total: «Ahorro: 1050».
          `, {
            salida: 'Meses: 7\nAhorro: 1050',
            solucion: 'ahorro = 0\nmeses = 0\nwhile ahorro < 1000:\n    ahorro += 150\n    meses += 1\nprint(f"Meses: {meses}")\nprint(f"Ahorro: {ahorro}")',
          }),
        ]),
        mmszProyecto('adivina el número', [
          mmszPaso('Búsqueda automática', `
            El número secreto es «secreto = 37». Simula intentos desde 1 hacia arriba con «while True» y sal con «break» cuando aciertes. Muestra «Adivinado en 37 intentos».
          `, {
            inicio: 'secreto = 37\nintento = 0\n',
            pista: 'while True:\n    intento += 1\n    if intento == secreto:\n        break',
            salida: 'Adivinado en 37 intentos',
            requiere: ['while', 'break'],
            solucion: 'secreto = 37\nintento = 0\nwhile True:\n    intento += 1\n    if intento == secreto:\n        break\nprint(f"Adivinado en {intento} intentos")',
          }),
          mmszPaso('Búsqueda binaria', `
            Ahora busca más inteligente: entre «bajo = 1» y «alto = 100», prueba siempre el punto medio «(bajo + alto) // 2». Si el medio es menor que el secreto, «bajo = medio + 1»; si es mayor, «alto = medio - 1». Cuenta los intentos y muestra «Binaria: 3 intentos». ¡Mucho mejor que 37!
          `, {
            pista: 'medio = (bajo + alto) // 2',
            salida: 'Adivinado en 37 intentos\nBinaria: 3 intentos',
            requiere: ['bajo', 'alto', '//'],
            solucion: 'secreto = 37\nintento = 0\nwhile True:\n    intento += 1\n    if intento == secreto:\n        break\nprint(f"Adivinado en {intento} intentos")\nbajo = 1\nalto = 100\nintentos = 0\nwhile bajo <= alto:\n    intentos += 1\n    medio = (bajo + alto) // 2\n    if medio == secreto:\n        break\n    elif medio < secreto:\n        bajo = medio + 1\n    else:\n        alto = medio - 1\nprint(f"Binaria: {intentos} intentos")',
          }),
        ]),
        mmszRepaso('bucles', `
          - «for x in secuencia:» recorre cada elemento.
          - «range(inicio, fin, paso)»: el fin no se incluye.
          - «while condición:» repite mientras sea verdadera; cuida que termine.
          - «break» sale del bucle; «continue» salta a la siguiente vuelta.
          - Acumuladores: «total = 0» antes del bucle y «total += x» dentro.
        `),
      ], [
        mmszElige('¿Qué muestra este programa?', ['*3, 2, 1', '3, 2, 1, 0', '1, 2, 3'], 'Cuando n llega a 0 la condición es falsa.', 'n = 3\nwhile n > 0:\n    print(n)\n    n -= 1'),
        mmszElige('¿Qué hace break?', ['*Sale del bucle', 'Salta a la siguiente vuelta', 'Reinicia el bucle'], 'continue salta; break sale.'),
        mmszElige('¿Qué pasa si olvidas «n -= 1» en el programa anterior?', ['*Bucle infinito', 'Muestra 3 una vez', 'Error'], 'n nunca cambia, la condición siempre es verdadera.'),
        mmszCompleta('Completa el atajo de x = x + 2.', 'x ___ 2', ['+='], '+= suma y asigna.'),
        mmszEscribe('Usa while para mostrar 10, 20 y 30 (uno por línea).', 'n = 10', '10\n20\n30', 'n = 10\nwhile n <= 30:\n    print(n)\n    n += 10'),
      ]),
    ]),

    mmszUnidad('Intermedio', 'Listas', 'Guardar muchos datos en una sola variable, modificarlos y recorrerlos.', [
      mmszLeccion('py-5-1', 'Crear y modificar listas', 'Índices, append, insert, remove, pop y len.', [
        mmszLectura('Listas', `
          Una **lista** guarda varios valores en orden, entre corchetes:

          ~~~run
          frutas = ["manzana", "pera", "uva"]
          print(frutas)
          print(frutas[0])
          print(frutas[-1])
          print(len(frutas))
          ~~~

          Cada elemento tiene un **índice** que empieza en **0**. El índice «-1» es el último.

          ### Modificar una lista
          - «lista[i] = valor» cambia un elemento.
          - «.append(x)» agrega al final; «.insert(i, x)» agrega en una posición.
          - «.remove(x)» quita el primer x; «.pop()» quita y devuelve el último.

          ~~~run
          notas = [12, 15, 9]
          notas[2] = 11
          notas.append(18)
          notas.insert(0, 14)
          print(notas)
          ultimo = notas.pop()
          print(ultimo, notas)
          ~~~
        `),
        mmszDesafio('lista de compras', [
          mmszPaso('Agrega productos', `
            Empieza con «compras = ["pan", "leche"]». Agrega «"huevos"» al final con «append» y muestra la lista.
          `, {
            inicio: 'compras = ["pan", "leche"]\n',
            salida: "['pan', 'leche', 'huevos']",
            requiere: ['append'],
            solucion: 'compras = ["pan", "leche"]\ncompras.append("huevos")\nprint(compras)',
          }),
          mmszPaso('Quita y cuenta', `
            Quita «"leche"» con «remove» y muestra la lista y luego «Total: 2» usando «len».
          `, {
            salida: "['pan', 'leche', 'huevos']\n['pan', 'huevos']\nTotal: 2",
            requiere: ['remove', 'len'],
            solucion: 'compras = ["pan", "leche"]\ncompras.append("huevos")\nprint(compras)\ncompras.remove("leche")\nprint(compras)\nprint(f"Total: {len(compras)}")',
          }),
        ]),
      ], [
        mmszElige('Si «a = [10, 20, 30]», ¿qué es «a[1]»?', ['10', '*20', '30'], 'Los índices empiezan en 0.'),
        mmszElige('¿Qué es «a[-1]» en la lista anterior?', ['10', '20', '*30'], '-1 es el último elemento.'),
        mmszCompleta('Completa para agregar 40 al final.', 'a.___(40)', ['append'], 'append agrega al final.'),
        mmszElige('¿Qué muestra este código?', ['*3', '4', '2'], 'La lista tiene 3 elementos.', 'print(len(["a", "b", "c"]))'),
        mmszEscribe('Crea la lista [1, 2, 3], agrega 4 y muéstrala.', '', '[1, 2, 3, 4]', 'numeros = [1, 2, 3]\nnumeros.append(4)\nprint(numeros)'),
      ]),

      mmszLeccion('py-5-2', 'Recorrer listas y slicing', 'Bucles sobre listas, sum, max, min, in y rebanadas.', [
        mmszLectura('Recorrer y analizar listas', `
          Con «for» recorres cada elemento de una lista:

          ~~~run
          notas = [14, 18, 11, 16]
          for nota in notas:
              print(nota)
          ~~~

          Python trae funciones muy útiles: «sum()», «max()», «min()» y el operador «in»:

          ~~~run
          notas = [14, 18, 11, 16]
          print(sum(notas) / len(notas))
          print(max(notas), min(notas))
          print(18 in notas)
          ~~~

          ### Slicing (rebanadas)
          «lista[inicio:fin]» devuelve una parte de la lista (el fin no se incluye):

          ~~~run
          letras = ["a", "b", "c", "d", "e"]
          print(letras[1:3])
          print(letras[:2])
          print(letras[::-1])
          ~~~

          Si necesitas el índice además del valor, usa «enumerate»:

          ~~~run
          for i, nombre in enumerate(["Ana", "Luis"]):
              print(i, nombre)
          ~~~
        `),
        mmszDesafio('estadísticas del salón', [
          mmszPaso('Promedio y máximo', `
            Con «notas = [12, 17, 9, 15, 20]», muestra «Promedio: 14.6» y «Mayor: 20».
          `, {
            inicio: 'notas = [12, 17, 9, 15, 20]\n',
            salida: 'Promedio: 14.6\nMayor: 20',
            requiere: ['sum', 'max'],
            solucion: 'notas = [12, 17, 9, 15, 20]\nprint(f"Promedio: {sum(notas) / len(notas)}")\nprint(f"Mayor: {max(notas)}")',
          }),
          mmszPaso('Aprobados', `
            Recorre la lista con «for» y cuenta cuántas notas son 11 o más. Muestra «Aprobados: 4».
          `, {
            salida: 'Promedio: 14.6\nMayor: 20\nAprobados: 4',
            requiere: ['for'],
            solucion: 'notas = [12, 17, 9, 15, 20]\nprint(f"Promedio: {sum(notas) / len(notas)}")\nprint(f"Mayor: {max(notas)}")\naprobados = 0\nfor n in notas:\n    if n >= 11:\n        aprobados += 1\nprint(f"Aprobados: {aprobados}")',
          }),
        ]),
        mmszProyecto('ranking de puntajes', [
          mmszPaso('Ordena', `
            Con «puntajes = [45, 90, 72, 88, 60]», crea una lista ordenada de mayor a menor con «sorted(puntajes, reverse=True)» y muéstrala.
          `, {
            inicio: 'puntajes = [45, 90, 72, 88, 60]\n',
            salida: '[90, 88, 72, 60, 45]',
            requiere: ['sorted'],
            solucion: 'puntajes = [45, 90, 72, 88, 60]\nranking = sorted(puntajes, reverse=True)\nprint(ranking)',
          }),
          mmszPaso('Podio', `
            Usa slicing para tomar los 3 primeros y muéstralos con su puesto usando «enumerate(…, 1)»:

            ~~~
            1. 90
            2. 88
            3. 72
            ~~~
          `, {
            salida: '[90, 88, 72, 60, 45]\n1. 90\n2. 88\n3. 72',
            requiere: ['[:3]', 'enumerate'],
            solucion: 'puntajes = [45, 90, 72, 88, 60]\nranking = sorted(puntajes, reverse=True)\nprint(ranking)\nfor puesto, p in enumerate(ranking[:3], 1):\n    print(f"{puesto}. {p}")',
          }),
        ]),
        mmszRepaso('listas', `
          - Lista: «[a, b, c]»; índices desde 0; «-1» es el último.
          - Modificar: «append», «insert», «remove», «pop», «lista[i] = x».
          - Analizar: «len», «sum», «max», «min», «in».
          - Slicing: «lista[inicio:fin]», «[::-1]» invierte.
          - «enumerate» da índice y valor; «sorted» devuelve una copia ordenada.
        `),
      ], [
        mmszElige('¿Qué muestra «print([1, 2, 3, 4][1:3])»?', ['*[2, 3]', '[1, 2, 3]', '[2, 3, 4]'], 'Desde el índice 1 hasta antes del 3.'),
        mmszElige('¿Qué muestra «print(5 in [1, 2, 3])»?', ['True', '*False'], '5 no está en la lista.'),
        mmszCompleta('Completa para sumar todos los elementos.', 'print(___(numeros))', ['sum'], 'sum suma los elementos.'),
        mmszElige('¿Qué hace «lista[::-1]»?', ['*La invierte', 'Borra el último', 'Ordena la lista'], 'El paso -1 recorre al revés.'),
        mmszEscribe('Con nums = [4, 8, 15, 16], muestra el mayor.', 'nums = [4, 8, 15, 16]', '16', 'nums = [4, 8, 15, 16]\nprint(max(nums))'),
      ]),
    ]),

    mmszUnidad('Intermedio', 'Funciones', 'Agrupar código reutilizable, recibir parámetros y devolver resultados.', [
      mmszLeccion('py-6-1', 'Crear funciones', 'def, llamar funciones, parámetros y valores por defecto.', [
        mmszLectura('Funciones', `
          Una **función** es un bloque de código con nombre que puedes usar muchas veces. Se crea con «def» y se usa (se "llama") escribiendo su nombre con paréntesis:

          ~~~run
          def saludar():
              print("¡Hola!")
              print("Bienvenido")

          saludar()
          saludar()
          ~~~

          ### Parámetros
          Los **parámetros** son datos que la función recibe:

          ~~~run
          def saludar(nombre):
              print(f"Hola, {nombre}")

          saludar("Ana")
          saludar("Luis")
          ~~~

          Puedes darles un valor **por defecto**, que se usa si no envías el dato:

          ~~~run
          def potencia(base, exponente=2):
              print(base ** exponente)

          potencia(5)
          potencia(2, 10)
          ~~~
        `),
        mmszDesafio('di tu nombre', [
          mmszPaso('Función de saludo', `
            Crea una función «presentar(nombre, carrera)» que muestre «Soy Ana y estudio Sistemas». Llámala con «"Ana"» y «"Sistemas"».
          `, {
            inicio: '',
            pista: 'def presentar(nombre, carrera):\n    print(f"Soy {nombre} y estudio {carrera}")',
            salida: 'Soy Ana y estudio Sistemas',
            requiere: ['def presentar'],
            solucion: 'def presentar(nombre, carrera):\n    print(f"Soy {nombre} y estudio {carrera}")\n\npresentar("Ana", "Sistemas")',
          }),
          mmszPaso('Valor por defecto', `
            Haz que «carrera» tenga el valor por defecto «"Sistemas"» y agrega una llamada «presentar("Luis")».
          `, {
            salida: 'Soy Ana y estudio Sistemas\nSoy Luis y estudio Sistemas',
            requiere: ['carrera="Sistemas"'],
            solucion: 'def presentar(nombre, carrera="Sistemas"):\n    print(f"Soy {nombre} y estudio {carrera}")\n\npresentar("Ana", "Sistemas")\npresentar("Luis")',
          }),
        ]),
      ], [
        mmszElige('¿Con qué palabra se crea una función en Python?', ['*def', 'function', 'func', 'void'], 'def viene de "define".'),
        mmszElige('¿Qué muestra este programa?', ['*Hola dos veces', 'Hola una vez', 'Nada'], 'La función se llama dos veces.', 'def saludar():\n    print("Hola")\n\nsaludar()\nsaludar()'),
        mmszElige('¿Qué muestra este programa?', ['Nada', '*Hola', 'Error'], 'Se define y luego se llama una vez.', 'def f():\n    print("Hola")\nf()'),
        mmszOrdena('Ordena: función que saluda por nombre y su uso.', ['def saludar(nombre):', '    print("Hola", nombre)', 'saludar("Ana")'], 'Primero se define, luego se llama.'),
        mmszEscribe('Crea doble(x) que muestre x * 2 y llámala con 21.', '', '42', 'def doble(x):\n    print(x * 2)\n\ndoble(21)'),
      ]),

      mmszLeccion('py-6-2', 'return y alcance', 'Devolver valores con return y entender variables locales y globales.', [
        mmszLectura('Devolver resultados con return', `
          «return» hace que la función **entregue** un valor a quien la llamó. Así puedes guardarlo o usarlo en otras operaciones:

          ~~~run
          def area_rectangulo(base, altura):
              return base * altura

          a = area_rectangulo(4, 5)
          print(a)
          print(area_rectangulo(2, 3) + 10)
          ~~~

          > «print» solo muestra; «return» entrega el valor. Una función sin «return» devuelve «None».

          ### Alcance de las variables
          Las variables creadas **dentro** de una función son **locales**: solo existen ahí. Las de afuera son **globales**.

          ~~~run
          mensaje = "global"

          def prueba():
              mensaje = "local"
              print(mensaje)

          prueba()
          print(mensaje)
          ~~~

          Lo ideal es que las funciones reciban datos por parámetros y devuelvan resultados con «return», sin depender de variables globales.
        `),
        mmszDesafio('calculadora', [
          mmszPaso('Cuatro operaciones', `
            Crea la función «calcular(a, b, op)» que devuelva la suma, resta, multiplicación o división según «op» sea «"+"», «"-"», «"*"» o «"/"». Muestra «calcular(8, 2, "+")» y «calcular(8, 2, "/")».
          `, {
            inicio: '',
            pista: 'if op == "+":\n    return a + b',
            salida: '10\n4.0',
            requiere: ['def calcular', 'return'],
            solucion: 'def calcular(a, b, op):\n    if op == "+":\n        return a + b\n    elif op == "-":\n        return a - b\n    elif op == "*":\n        return a * b\n    elif op == "/":\n        return a / b\n\nprint(calcular(8, 2, "+"))\nprint(calcular(8, 2, "/"))',
          }),
          mmszPaso('División entre cero', `
            Si «op» es «"/"» y «b» es 0, la función debe devolver el texto «"Error"». Agrega «print(calcular(5, 0, "/"))».
          `, {
            salida: '10\n4.0\nError',
            solucion: 'def calcular(a, b, op):\n    if op == "+":\n        return a + b\n    elif op == "-":\n        return a - b\n    elif op == "*":\n        return a * b\n    elif op == "/":\n        if b == 0:\n            return "Error"\n        return a / b\n\nprint(calcular(8, 2, "+"))\nprint(calcular(8, 2, "/"))\nprint(calcular(5, 0, "/"))',
          }),
        ]),
        mmszProyecto('números primos', [
          mmszPaso('¿Es primo?', `
            Crea «es_primo(n)» que devuelva «True» si n es primo (solo divisible entre 1 y sí mismo) y «False» si no. Muestra «es_primo(7)» y «es_primo(10)».
          `, {
            inicio: '',
            pista: 'for d in range(2, n):\n    if n % d == 0:\n        return False',
            salida: 'True\nFalse',
            requiere: ['def es_primo', 'return'],
            solucion: 'def es_primo(n):\n    if n < 2:\n        return False\n    for d in range(2, n):\n        if n % d == 0:\n            return False\n    return True\n\nprint(es_primo(7))\nprint(es_primo(10))',
          }),
          mmszPaso('Primos hasta 30', `
            Usa tu función para crear una lista con los primos del 1 al 30 y muéstrala.
          `, {
            salida: 'True\nFalse\n[2, 3, 5, 7, 11, 13, 17, 19, 23, 29]',
            solucion: 'def es_primo(n):\n    if n < 2:\n        return False\n    for d in range(2, n):\n        if n % d == 0:\n            return False\n    return True\n\nprint(es_primo(7))\nprint(es_primo(10))\nprimos = []\nfor n in range(1, 31):\n    if es_primo(n):\n        primos.append(n)\nprint(primos)',
          }),
        ]),
        mmszRepaso('funciones', `
          - «def nombre(parámetros):» crea una función; se llama con «nombre(argumentos)».
          - Parámetros con valor por defecto: «def f(x, y=2):».
          - «return» entrega un resultado; sin return, la función devuelve «None».
          - Variables dentro de la función son locales.
          - Buenas funciones: hacen una sola cosa, reciben datos y devuelven resultados.
        `),
      ], [
        mmszElige('¿Qué muestra este código?', ['*8', '4', 'x * 2'], 'doble(4) devuelve 8.', 'def doble(x):\n    return x * 2\n\nprint(doble(4))'),
        mmszCompleta('Completa para devolver la suma.', 'def sumar(a, b):\n    ___ a + b', ['return'], 'return entrega el resultado.'),
        mmszElige('¿Qué devuelve una función sin return?', ['0', '*None', 'Un error'], 'Por defecto devuelve None.'),
        mmszElige('Una variable creada dentro de una función es…', ['*Local: solo existe dentro de la función', 'Global', 'Constante'], 'Las variables internas son locales.'),
        mmszEscribe('Crea cuadrado(n) que devuelva n * n y muestra cuadrado(9).', '', '81', 'def cuadrado(n):\n    return n * n\n\nprint(cuadrado(9))'),
      ]),
    ]),

    /* ============================== AVANZADO ============================== */
    mmszUnidad('Avanzado', 'Diccionarios, tuplas y sets', 'Estructuras de datos para guardar pares clave-valor, datos fijos y elementos únicos.', [
      mmszLeccion('py-7-1', 'Diccionarios', 'Guardar datos con clave y valor, recorrerlos y modificarlos.', [
        mmszLectura('Diccionarios', `
          Un **diccionario** guarda pares **clave: valor**. En vez de un índice numérico, accedes con la clave:

          ~~~run
          alumno = {"nombre": "Ana", "edad": 19, "carrera": "Sistemas"}
          print(alumno["nombre"])
          alumno["edad"] = 20
          alumno["ciclo"] = 4
          print(alumno)
          ~~~

          ### Métodos útiles
          - «.get(clave, defecto)» evita errores si la clave no existe.
          - «.keys()», «.values()» y «.items()» para recorrerlo.
          - «del dic[clave]» borra una clave.

          ~~~run
          precios = {"pan": 0.5, "leche": 4.2, "huevos": 0.6}
          print(precios.get("queso", 0))
          for producto, precio in precios.items():
              print(f"{producto}: {precio}")
          ~~~

          > Las claves deben ser únicas. Si repites una clave, se sobrescribe el valor.
        `),
        mmszDesafio('contador de palabras', [
          mmszPaso('Cuenta', `
            Con la lista «palabras = ["sol", "luna", "sol", "mar", "sol", "luna"]», crea un diccionario «conteo» que diga cuántas veces aparece cada palabra y muéstralo.
          `, {
            inicio: 'palabras = ["sol", "luna", "sol", "mar", "sol", "luna"]\n',
            pista: 'conteo[p] = conteo.get(p, 0) + 1',
            salida: "{'sol': 3, 'luna': 2, 'mar': 1}",
            requiere: ['conteo'],
            solucion: 'palabras = ["sol", "luna", "sol", "mar", "sol", "luna"]\nconteo = {}\nfor p in palabras:\n    conteo[p] = conteo.get(p, 0) + 1\nprint(conteo)',
          }),
          mmszPaso('La más repetida', `
            Recorre «conteo.items()» para encontrar la palabra que más se repite y muestra «Más usada: sol».
          `, {
            salida: "{'sol': 3, 'luna': 2, 'mar': 1}\nMás usada: sol",
            requiere: ['items'],
            solucion: 'palabras = ["sol", "luna", "sol", "mar", "sol", "luna"]\nconteo = {}\nfor p in palabras:\n    conteo[p] = conteo.get(p, 0) + 1\nprint(conteo)\nmejor = ""\nveces = 0\nfor palabra, n in conteo.items():\n    if n > veces:\n        mejor = palabra\n        veces = n\nprint(f"Más usada: {mejor}")',
          }),
        ]),
      ], [
        mmszElige('Si «d = {"a": 1, "b": 2}», ¿qué es «d["b"]»?', ['1', '*2', '"b"'], 'Se accede por clave.'),
        mmszElige('¿Qué devuelve «d.get("z", 0)»?', ['Error', '*0', 'None'], 'get devuelve el valor por defecto si no existe la clave.'),
        mmszCompleta('Completa para recorrer claves y valores.', 'for k, v in d.___():\n    print(k, v)', ['items'], 'items() da pares clave-valor.'),
        mmszElige('¿Qué pasa si asignas una clave que ya existe?', ['*Se reemplaza su valor', 'Se duplica', 'Da error'], 'Las claves son únicas.'),
        mmszEscribe('Crea edades = {"Ana": 20, "Luis": 22} y muestra la edad de Luis.', '', '22', 'edades = {"Ana": 20, "Luis": 22}\nprint(edades["Luis"])'),
      ]),

      mmszLeccion('py-7-2', 'Tuplas y conjuntos', 'Datos que no cambian (tuplas) y colecciones sin repetidos (sets).', [
        mmszLectura('Tuplas', `
          Una **tupla** es como una lista pero **inmutable**: no se puede modificar después de creada. Se escribe con paréntesis:

          ~~~run
          punto = (3, 4)
          print(punto[0])
          x, y = punto
          print(x + y)
          ~~~

          Se usan para datos fijos (coordenadas, fechas) y para que una función devuelva varios valores:

          ~~~run
          def min_max(numeros):
              return min(numeros), max(numeros)

          menor, mayor = min_max([5, 2, 9])
          print(menor, mayor)
          ~~~
        `),
        mmszLectura('Conjuntos (sets)', `
          Un **set** guarda elementos **sin repetir** y sin orden. Es ideal para eliminar duplicados y comparar grupos:

          ~~~run
          numeros = [1, 2, 2, 3, 3, 3]
          unicos = set(numeros)
          print(len(unicos))
          a = {1, 2, 3}
          b = {2, 3, 4}
          print(sorted(a & b))
          print(sorted(a | b))
          print(sorted(a - b))
          ~~~

          - «&» intersección (en ambos), «|» unión, «-» diferencia.
        `),
        mmszDesafio('cursos en común', [
          mmszPaso('Intersección', `
            Ana lleva «{"Cálculo", "Física", "Programación"}» y Luis «{"Programación", "Química", "Cálculo"}». Muestra, ordenados, los cursos que llevan ambos.
          `, {
            inicio: 'ana = {"Cálculo", "Física", "Programación"}\nluis = {"Programación", "Química", "Cálculo"}\n',
            salida: "['Cálculo', 'Programación']",
            requiere: ['&'],
            solucion: 'ana = {"Cálculo", "Física", "Programación"}\nluis = {"Programación", "Química", "Cálculo"}\nprint(sorted(ana & luis))',
          }),
          mmszPaso('Total de cursos distintos', `
            Muestra cuántos cursos distintos hay entre los dos: «Distintos: 4».
          `, {
            salida: "['Cálculo', 'Programación']\nDistintos: 4",
            requiere: ['|'],
            solucion: 'ana = {"Cálculo", "Física", "Programación"}\nluis = {"Programación", "Química", "Cálculo"}\nprint(sorted(ana & luis))\nprint(f"Distintos: {len(ana | luis)}")',
          }),
        ]),
        mmszProyecto('agenda de contactos', [
          mmszPaso('Guardar contactos', `
            Crea un diccionario «agenda» donde cada nombre tenga una tupla «(telefono, correo)». Agrega «"Ana": ("999111222", "ana@mail.com")» y «"Luis": ("988777666", "luis@mail.com")». Muestra el correo de Luis.
          `, {
            inicio: '',
            salida: 'luis@mail.com',
            requiere: ['agenda'],
            solucion: 'agenda = {\n    "Ana": ("999111222", "ana@mail.com"),\n    "Luis": ("988777666", "luis@mail.com"),\n}\nprint(agenda["Luis"][1])',
          }),
          mmszPaso('Listar', `
            Recorre la agenda ordenada por nombre y muestra «Ana - 999111222» y «Luis - 988777666».
          `, {
            salida: 'luis@mail.com\nAna - 999111222\nLuis - 988777666',
            requiere: ['sorted'],
            solucion: 'agenda = {\n    "Ana": ("999111222", "ana@mail.com"),\n    "Luis": ("988777666", "luis@mail.com"),\n}\nprint(agenda["Luis"][1])\nfor nombre in sorted(agenda):\n    telefono, correo = agenda[nombre]\n    print(f"{nombre} - {telefono}")',
          }),
        ]),
        mmszRepaso('estructuras de datos', `
          - Diccionario «{clave: valor}»: acceso por clave, «get», «items», «keys», «values».
          - Tupla «(a, b)»: inmutable; sirve para datos fijos y devolver varios valores.
          - Set «{a, b}»: sin repetidos; «&» intersección, «|» unión, «-» diferencia.
          - Elige la estructura según el problema: orden → lista; búsqueda por nombre → diccionario; únicos → set.
        `),
      ], [
        mmszElige('¿Qué tiene de especial una tupla?', ['*No se puede modificar', 'No tiene orden', 'No permite repetidos'], 'Las tuplas son inmutables.'),
        mmszElige('¿Qué muestra «print(len({1, 1, 2, 2, 3}))»?', ['5', '*3', '2'], 'Los sets no guardan repetidos.'),
        mmszCompleta('Completa para obtener los elementos que están en ambos sets.', 'comunes = a ___ b', ['&'], '& es la intersección.'),
        mmszElige('¿Qué hace «x, y = (3, 4)»?', ['*Guarda 3 en x y 4 en y', 'Da error', 'Guarda la tupla en x'], 'Es desempaquetado de tuplas.'),
        mmszEscribe('Elimina repetidos de [3, 1, 3, 2, 1] y muestra el resultado ordenado.', 'datos = [3, 1, 3, 2, 1]', '[1, 2, 3]', 'datos = [3, 1, 3, 2, 1]\nprint(sorted(set(datos)))'),
      ]),
    ]),

    mmszUnidad('Avanzado', 'Técnicas avanzadas', 'Manejo de errores con try/except, comprensiones de listas y recursión.', [
      mmszLeccion('py-8-1', 'Manejo de errores', 'Evitar que el programa se caiga con try, except, else y finally.', [
        mmszLectura('try y except', `
          Cuando algo sale mal, Python lanza una **excepción** y el programa se detiene. Con «try/except» puedes atraparla y seguir:

          ~~~run
          try:
              resultado = 10 / 0
          except ZeroDivisionError:
              print("No se puede dividir entre cero")
          print("El programa sigue")
          ~~~

          Excepciones comunes:
          - «ZeroDivisionError»: división entre cero.
          - «ValueError»: conversión inválida, como «int("hola")».
          - «KeyError»: clave que no existe en un diccionario.
          - «IndexError»: índice fuera de la lista.

          ### else y finally
          «else» se ejecuta si no hubo error; «finally» se ejecuta **siempre**:

          ~~~run
          try:
              n = int("42")
          except ValueError:
              print("No es un número")
          else:
              print("Convertido:", n)
          finally:
              print("Fin de la validación")
          ~~~

          También puedes lanzar tus propios errores con «raise ValueError("mensaje")».
        `),
        mmszDesafio('conversor seguro', [
          mmszPaso('Convertir textos', `
            Tienes «datos = ["10", "abc", "7"]». Recorre la lista, convierte cada texto con «int()» y súmalos. Si alguno no se puede convertir, muestra «No válido: abc» y continúa. Al final muestra «Suma: 17».
          `, {
            inicio: 'datos = ["10", "abc", "7"]\nsuma = 0\n',
            pista: 'try:\n    suma += int(d)\nexcept ValueError:\n    print(f"No válido: {d}")',
            salida: 'No válido: abc\nSuma: 17',
            requiere: ['try', 'except'],
            solucion: 'datos = ["10", "abc", "7"]\nsuma = 0\nfor d in datos:\n    try:\n        suma += int(d)\n    except ValueError:\n        print(f"No válido: {d}")\nprint(f"Suma: {suma}")',
          }),
        ]),
      ], [
        mmszElige('¿Qué excepción produce «int("hola")»?', ['*ValueError', 'ZeroDivisionError', 'KeyError'], 'El texto no se puede convertir a entero.'),
        mmszElige('¿Cuándo se ejecuta el bloque finally?', ['*Siempre', 'Solo si hay error', 'Solo si no hay error'], 'finally siempre se ejecuta.'),
        mmszCompleta('Completa para atrapar el error.', 'try:\n    x = 1 / 0\n___ ZeroDivisionError:\n    print("error")', ['except'], 'except atrapa la excepción.'),
        mmszElige('¿Qué muestra este código?', ['*Clave no existe', 'None', 'Error y se detiene'], 'Se atrapa el KeyError.', 'd = {}\ntry:\n    print(d["x"])\nexcept KeyError:\n    print("Clave no existe")'),
        mmszEscribe('Intenta dividir 5 entre 0; si falla muestra "Error".', '', 'Error', 'try:\n    print(5 / 0)\nexcept ZeroDivisionError:\n    print("Error")'),
      ]),

      mmszLeccion('py-8-2', 'Comprensiones y recursión', 'Crear listas en una línea y funciones que se llaman a sí mismas.', [
        mmszLectura('Comprensiones de listas', `
          Una **comprensión** crea una lista nueva a partir de otra en una sola línea:

          ~~~run
          numeros = [1, 2, 3, 4, 5]
          cuadrados = [n * n for n in numeros]
          pares = [n for n in numeros if n % 2 == 0]
          print(cuadrados)
          print(pares)
          ~~~

          Equivale a un «for» con «append», pero más corto y legible. También existen para diccionarios:

          ~~~run
          nombres = ["ana", "luis"]
          largos = {n: len(n) for n in nombres}
          print(largos)
          ~~~
        `),
        mmszLectura('Recursión', `
          Una función **recursiva** se llama a sí misma para resolver un problema más pequeño. Siempre necesita un **caso base** que detenga la recursión:

          ~~~run
          def factorial(n):
              if n <= 1:
                  return 1          # caso base
              return n * factorial(n - 1)

          print(factorial(5))
          ~~~

          factorial(5) = 5 × factorial(4) = 5 × 4 × factorial(3)… hasta llegar a 1.

          > Sin caso base, la función se llamaría para siempre y Python lanzaría «RecursionError».
        `),
        mmszDesafio('Fibonacci', [
          mmszPaso('Fibonacci recursivo', `
            La sucesión de Fibonacci empieza 0, 1, 1, 2, 3, 5, 8… (cada número es la suma de los dos anteriores). Crea «fib(n)» recursiva con casos base «fib(0) = 0» y «fib(1) = 1». Muestra «fib(10)».
          `, {
            inicio: '',
            pista: 'return fib(n - 1) + fib(n - 2)',
            salida: '55',
            requiere: ['def fib', 'return'],
            solucion: 'def fib(n):\n    if n < 2:\n        return n\n    return fib(n - 1) + fib(n - 2)\n\nprint(fib(10))',
          }),
          mmszPaso('Lista con comprensión', `
            Usa una comprensión de lista con tu función para mostrar los primeros 10 números: «[0, 1, 1, 2, 3, 5, 8, 13, 21, 34]».
          `, {
            salida: '55\n[0, 1, 1, 2, 3, 5, 8, 13, 21, 34]',
            requiere: ['for', '['],
            solucion: 'def fib(n):\n    if n < 2:\n        return n\n    return fib(n - 1) + fib(n - 2)\n\nprint(fib(10))\nprint([fib(i) for i in range(10)])',
          }),
        ]),
        mmszProyecto('procesador de notas', [
          mmszPaso('Limpia los datos', `
            «crudos = ["15", "x", "18", "", "9", "20"]». Con un bucle y «try/except», crea la lista «notas» solo con los valores numéricos. Muéstrala.
          `, {
            inicio: 'crudos = ["15", "x", "18", "", "9", "20"]\n',
            salida: '[15, 18, 9, 20]',
            requiere: ['try'],
            solucion: 'crudos = ["15", "x", "18", "", "9", "20"]\nnotas = []\nfor c in crudos:\n    try:\n        notas.append(int(c))\n    except ValueError:\n        pass\nprint(notas)',
          }),
          mmszPaso('Aprobados con comprensión', `
            Con una comprensión crea «aprobados» (notas >= 11) y muestra «Aprobados: [15, 18, 20]».
          `, {
            salida: '[15, 18, 9, 20]\nAprobados: [15, 18, 20]',
            requiere: ['aprobados'],
            solucion: 'crudos = ["15", "x", "18", "", "9", "20"]\nnotas = []\nfor c in crudos:\n    try:\n        notas.append(int(c))\n    except ValueError:\n        pass\nprint(notas)\naprobados = [n for n in notas if n >= 11]\nprint(f"Aprobados: {aprobados}")',
          }),
        ]),
        mmszRepaso('técnicas avanzadas', `
          - «try/except» atrapa errores; «else» si no hubo error; «finally» siempre.
          - Excepciones comunes: «ValueError», «ZeroDivisionError», «KeyError», «IndexError».
          - Comprensión: «[expr for x in lista if condición]».
          - Recursión: una función que se llama a sí misma; siempre con **caso base**.
        `),
      ], [
        mmszElige('¿Qué crea «[n * 2 for n in [1, 2, 3]]»?', ['*[2, 4, 6]', '[1, 2, 3, 1, 2, 3]', '[3, 4, 5]'], 'Multiplica cada elemento por 2.'),
        mmszElige('¿Qué necesita siempre una función recursiva?', ['*Un caso base', 'Un bucle while', 'Una variable global'], 'Sin caso base no se detiene.'),
        mmszCompleta('Completa la comprensión para quedarte con los positivos.', 'pos = [x for x in nums ___ x > 0]', ['if'], 'El filtro va con if.'),
        mmszElige('¿Qué muestra este código?', ['*24', '10', '4'], '4 × 3 × 2 × 1 = 24.', 'def f(n):\n    if n <= 1:\n        return 1\n    return n * f(n - 1)\nprint(f(4))'),
        mmszEscribe('Con una comprensión, muestra los cuadrados de 1 a 5.', '', '[1, 4, 9, 16, 25]', 'print([n * n for n in range(1, 6)])'),
      ]),
    ]),

    mmszUnidad('Avanzado', 'Programación orientada a objetos', 'Modelar el mundo con clases, objetos, métodos y herencia.', [
      mmszLeccion('py-9-1', 'Clases y objetos', 'Crear tus propios tipos de datos con atributos y métodos.', [
        mmszLectura('Clases y objetos', `
          Una **clase** es un molde para crear **objetos**. Define qué datos tiene (atributos) y qué puede hacer (métodos).

          ~~~run
          class Perro:
              def __init__(self, nombre, edad):
                  self.nombre = nombre
                  self.edad = edad

              def ladrar(self):
                  print(f"{self.nombre} dice: ¡Guau!")

          firulais = Perro("Firulais", 3)
          firulais.ladrar()
          print(firulais.edad)
          ~~~

          - «__init__» es el **constructor**: se ejecuta al crear el objeto.
          - «self» es el propio objeto; con él accedes a sus atributos.
          - Cada objeto tiene sus propios datos: puedes crear muchos perros distintos.

          ### Métodos que cambian el estado
          ~~~run
          class Cuenta:
              def __init__(self, titular):
                  self.titular = titular
                  self.saldo = 0

              def depositar(self, monto):
                  self.saldo += monto

          c = Cuenta("Ana")
          c.depositar(100)
          c.depositar(50)
          print(c.saldo)
          ~~~
        `),
        mmszDesafio('cuenta bancaria', [
          mmszPaso('Retirar', `
            Completa la clase «Cuenta» con un método «retirar(monto)» que reste el monto **solo si hay saldo suficiente**; si no, que muestre «Saldo insuficiente». Prueba: deposita 100, retira 30, retira 200 y muestra el saldo.
          `, {
            inicio: 'class Cuenta:\n    def __init__(self, titular):\n        self.titular = titular\n        self.saldo = 0\n\n    def depositar(self, monto):\n        self.saldo += monto\n',
            pista: 'def retirar(self, monto):\n    if monto <= self.saldo:\n        self.saldo -= monto',
            salida: 'Saldo insuficiente\n70',
            requiere: ['def retirar'],
            solucion: 'class Cuenta:\n    def __init__(self, titular):\n        self.titular = titular\n        self.saldo = 0\n\n    def depositar(self, monto):\n        self.saldo += monto\n\n    def retirar(self, monto):\n        if monto <= self.saldo:\n            self.saldo -= monto\n        else:\n            print("Saldo insuficiente")\n\nc = Cuenta("Ana")\nc.depositar(100)\nc.retirar(30)\nc.retirar(200)\nprint(c.saldo)',
          }),
        ]),
      ], [
        mmszElige('¿Qué es una clase?', ['*Un molde para crear objetos', 'Una función especial', 'Un tipo de lista'], 'Los objetos se crean a partir de la clase.'),
        mmszElige('¿Para qué sirve __init__?', ['*Inicializa el objeto al crearlo', 'Borra el objeto', 'Imprime el objeto'], 'Es el constructor.'),
        mmszCompleta('Completa para guardar el atributo.', 'def __init__(self, nombre):\n    ___.nombre = nombre', ['self'], 'self es el propio objeto.'),
        mmszElige('¿Qué muestra este código?', ['*Miau', 'Error', 'gato'], 'Se crea el objeto y se llama a su método.', 'class Gato:\n    def hablar(self):\n        print("Miau")\nGato().hablar()'),
        mmszEscribe('Crea la clase Punto con x e y, crea Punto(3, 4) y muestra x + y.', '', '7', 'class Punto:\n    def __init__(self, x, y):\n        self.x = x\n        self.y = y\n\np = Punto(3, 4)\nprint(p.x + p.y)'),
      ]),

      mmszLeccion('py-9-2', 'Herencia y polimorfismo', 'Reutilizar clases con herencia y sobrescribir métodos.', [
        mmszLectura('Herencia', `
          Con la **herencia**, una clase hija recibe todo lo de la clase padre y puede agregar o cambiar cosas:

          ~~~run
          class Animal:
              def __init__(self, nombre):
                  self.nombre = nombre

              def hablar(self):
                  print("...")

          class Perro(Animal):
              def hablar(self):
                  print(f"{self.nombre}: ¡Guau!")

          class Gato(Animal):
              def hablar(self):
                  print(f"{self.nombre}: ¡Miau!")

          for a in [Perro("Rex"), Gato("Tom")]:
              a.hablar()
          ~~~

          Que cada clase responda distinto al mismo método se llama **polimorfismo**.

          ### super()
          Con «super()» llamas al método de la clase padre, por ejemplo para reutilizar su constructor:

          ~~~run
          class Persona:
              def __init__(self, nombre):
                  self.nombre = nombre

          class Estudiante(Persona):
              def __init__(self, nombre, carrera):
                  super().__init__(nombre)
                  self.carrera = carrera

          e = Estudiante("Ana", "Sistemas")
          print(e.nombre, e.carrera)
          ~~~
        `),
        mmszDesafio('figuras geométricas', [
          mmszPaso('Área polimórfica', `
            Crea las clases «Rectangulo(base, altura)» y «Circulo(radio)», ambas hijas de «Figura», cada una con su método «area()». Usa 3.14 para pi. Recorre «[Rectangulo(4, 5), Circulo(2)]» y muestra cada área.
          `, {
            inicio: 'class Figura:\n    def area(self):\n        return 0\n',
            salida: '20\n12.56',
            requiere: ['class Rectangulo(Figura)', 'class Circulo(Figura)'],
            solucion: 'class Figura:\n    def area(self):\n        return 0\n\nclass Rectangulo(Figura):\n    def __init__(self, base, altura):\n        self.base = base\n        self.altura = altura\n\n    def area(self):\n        return self.base * self.altura\n\nclass Circulo(Figura):\n    def __init__(self, radio):\n        self.radio = radio\n\n    def area(self):\n        return 3.14 * self.radio ** 2\n\nfor f in [Rectangulo(4, 5), Circulo(2)]:\n    print(f.area())',
          }),
        ]),
        mmszProyecto('sistema de biblioteca', [
          mmszPaso('Libros', `
            Crea la clase «Libro(titulo, autor)» con un atributo «prestado = False» y los métodos «prestar()» y «devolver()». «prestar()» debe mostrar «No disponible» si ya estaba prestado.
            Crea un libro «Cien años de soledad», préstalo dos veces y muestra el estado de «prestado».
          `, {
            inicio: '',
            salida: 'No disponible\nTrue',
            requiere: ['class Libro', 'def prestar'],
            solucion: 'class Libro:\n    def __init__(self, titulo, autor):\n        self.titulo = titulo\n        self.autor = autor\n        self.prestado = False\n\n    def prestar(self):\n        if self.prestado:\n            print("No disponible")\n        else:\n            self.prestado = True\n\n    def devolver(self):\n        self.prestado = False\n\nlibro = Libro("Cien años de soledad", "García Márquez")\nlibro.prestar()\nlibro.prestar()\nprint(libro.prestado)',
          }),
          mmszPaso('Biblioteca', `
            Crea la clase «Biblioteca» con una lista «libros», un método «agregar(libro)» y otro «disponibles()» que devuelva los títulos no prestados. Agrega tu libro y «Rayuela», y muestra «disponibles()».
          `, {
            salida: "No disponible\nTrue\n['Rayuela']",
            requiere: ['class Biblioteca', 'def disponibles'],
            solucion: 'class Libro:\n    def __init__(self, titulo, autor):\n        self.titulo = titulo\n        self.autor = autor\n        self.prestado = False\n\n    def prestar(self):\n        if self.prestado:\n            print("No disponible")\n        else:\n            self.prestado = True\n\n    def devolver(self):\n        self.prestado = False\n\nlibro = Libro("Cien años de soledad", "García Márquez")\nlibro.prestar()\nlibro.prestar()\nprint(libro.prestado)\n\nclass Biblioteca:\n    def __init__(self):\n        self.libros = []\n\n    def agregar(self, libro):\n        self.libros.append(libro)\n\n    def disponibles(self):\n        return [l.titulo for l in self.libros if not l.prestado]\n\nb = Biblioteca()\nb.agregar(libro)\nb.agregar(Libro("Rayuela", "Cortázar"))\nprint(b.disponibles())',
          }),
        ]),
        mmszRepaso('programación orientada a objetos', `
          - «class Nombre:» define una clase; «Nombre(...)» crea un objeto.
          - «__init__» es el constructor; «self» es el propio objeto.
          - Atributos guardan datos; métodos son funciones del objeto.
          - Herencia: «class Hija(Padre):»; «super()» llama al padre.
          - Polimorfismo: el mismo método se comporta distinto según la clase.
        `),
      ], [
        mmszElige('¿Cómo se indica que Perro hereda de Animal?', ['*class Perro(Animal):', 'class Perro extends Animal:', 'class Perro: Animal'], 'La clase padre va entre paréntesis.'),
        mmszElige('¿Para qué sirve super()?', ['*Para llamar a métodos de la clase padre', 'Para crear una clase', 'Para borrar un objeto'], 'super() accede a la clase padre.'),
        mmszElige('¿Qué es el polimorfismo?', ['*El mismo método se comporta distinto según la clase', 'Tener muchos atributos', 'Copiar una clase'], 'Cada clase responde a su manera.'),
        mmszElige('¿Qué muestra este código?', ['*B', 'A', 'AB'], 'B sobrescribe el método de A.', 'class A:\n    def f(self):\n        print("A")\nclass B(A):\n    def f(self):\n        print("B")\nB().f()'),
        mmszEscribe('Crea Animal con hablar() que muestre "..." y Pato(Animal) que muestre "Cuac". Llama Pato().hablar().', '', 'Cuac', 'class Animal:\n    def hablar(self):\n        print("...")\n\nclass Pato(Animal):\n    def hablar(self):\n        print("Cuac")\n\nPato().hablar()'),
      ]),
    ]),
  ],
};
