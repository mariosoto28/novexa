# Novexa

App de escritorio para aprender programación (Python, JavaScript y C++) con lecciones cortas,
XP, rachas y vidas.

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Abre la app de escritorio en modo desarrollo (los cambios se ven al instante) |
| `npm run web` | Abre solo la interfaz en el navegador, en http://localhost:5173 |
| `npm start` | Compila y abre la app como quedaría terminada |
| `npm run typecheck` | Revisa errores de tipos en el código |
| `npm run dist` | Crea el instalador de Windows en `release/Novexa-Setup-<versión>.exe` |

### Sobre el instalador

- Para sacar una nueva versión, sube el número de `version` en `package.json` y ejecuta `npm run dist`.
- El instalador no está firmado digitalmente, así que Windows SmartScreen mostrará un aviso
  la primera vez (“Más información” → “Ejecutar de todas formas”). Para quitarlo hace falta un certificado de firma de código.
- Si `npm run dist` falla con *“Cannot create symbolic link”*, es un problema conocido de electron-builder en Windows:
  extrae `winCodeSign-2.6.0.7z` en `%LOCALAPPDATA%\electron-builder\Cache\winCodeSign\winCodeSign-2.6.0` excluyendo la carpeta `darwin`.

## Estructura

- `electron/`: ventana de escritorio y guardado del progreso (`progress.json` en la carpeta de datos del usuario).
- `src/content/`: **las lecciones**. Un archivo por lenguaje; para agregar contenido solo se editan estos archivos.
- `src/screens/`: pantallas (inicio, mapa del curso, lección).
- `src/components/ExerciseView.tsx`: los 4 tipos de ejercicio (opción múltiple, completar, ordenar líneas, escribir código).
- `src/runner.ts`: ejecuta el código JavaScript y Python del estudiante de forma aislada (corta bucles infinitos).
- `public/py-worker.mjs`: ejecuta Python con [Pyodide](https://pyodide.org), sin internet ni Python instalado.
  Los archivos de Pyodide se copian solos a `public/pyodide/` al ejecutar `dev`, `web` o `build`.
- `src/progress.ts`: XP, racha diaria y vidas (1 vida cada 20 minutos).
