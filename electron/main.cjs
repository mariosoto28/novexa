// Autor: MMSZ (Mario Soto Zea)
// Proceso principal de Electron: crea la ventana y guarda el progreso en disco.
const { app, BrowserWindow, dialog, ipcMain, Menu, protocol, session, shell } = require('electron');
const mmszPath = require('path');
const fs = require('fs');

const mmszIsDev = process.argv.includes('--dev');

// Para pruebas: NOVEXA_DATOS=<carpeta> hace que la app use otra carpeta de datos
// y así no se toca el progreso real del estudiante.
if (process.env.NOVEXA_DATOS) app.setPath('userData', process.env.NOVEXA_DATOS);
const mmszDistDir = mmszPath.join(__dirname, '..', 'dist');
const mmszProgressFile = () => mmszPath.join(app.getPath('userData'), 'progress.json');

// En la versión final la interfaz se sirve como app://bundle/... en lugar de file://
// Así funcionan fetch, los workers y WebAssembly (necesarios para ejecutar Python).
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true } },
]);

const MMSZ_MIME = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.wasm': 'application/wasm',
  '.zip': 'application/zip',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
};

function mmszServeApp(mmszRequest) {
  const { pathname: mmszPathname } = new URL(mmszRequest.url);
  const mmszFile = mmszPath.normalize(mmszPath.join(mmszDistDir, decodeURIComponent(mmszPathname)));
  if (!mmszFile.startsWith(mmszDistDir) || !fs.existsSync(mmszFile) || fs.statSync(mmszFile).isDirectory()) {
    return new Response('No encontrado', { status: 404 });
  }
  const mmszType = MMSZ_MIME[mmszPath.extname(mmszFile).toLowerCase()] || 'application/octet-stream';
  return new Response(fs.readFileSync(mmszFile), { headers: { 'content-type': mmszType } });
}

// Si existe progreso guardado con el nombre anterior de la app (CodeRuta), lo usa.
function mmszProgresoAnterior() {
  const mmszCarpetaDatos = mmszPath.dirname(app.getPath('userData'));
  for (const mmszNombre of ['CodeRuta', 'coderuta']) {
    const mmszArchivo = mmszPath.join(mmszCarpetaDatos, mmszNombre, 'progress.json');
    if (fs.existsSync(mmszArchivo)) return mmszArchivo;
  }
  return null;
}

/* ---------------- Progreso: guardado seguro y copias de seguridad ---------------- */

const MMSZ_COPIAS_DIARIAS = 14; // cuántas copias automáticas se conservan
const mmszCarpetaCopias = () => mmszPath.join(app.getPath('userData'), 'copias');

function mmszHoy() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function mmszEsProgreso(d) {
  return Boolean(d) && typeof d === 'object' && typeof d.xp === 'number' && d.completed && typeof d.completed === 'object';
}

function mmszLeerProgreso(mmszArchivo) {
  const d = JSON.parse(fs.readFileSync(mmszArchivo, 'utf8'));
  if (!mmszEsProgreso(d)) throw new Error('El archivo no tiene el formato de progreso de Novexa');
  return d;
}

/** Escribe primero en un archivo temporal y luego lo renombra: si se corta la luz, el original no se daña. */
function mmszEscribirSeguro(mmszArchivo, mmszDatos) {
  fs.mkdirSync(mmszPath.dirname(mmszArchivo), { recursive: true });
  const mmszTemporal = mmszArchivo + '.tmp';
  fs.writeFileSync(mmszTemporal, JSON.stringify(mmszDatos, null, 2), 'utf8');
  fs.renameSync(mmszTemporal, mmszArchivo);
}

/** Una copia por día (se actualiza durante el día) y se borran las más antiguas. */
function mmszCopiaDiaria(mmszDatos) {
  mmszEscribirSeguro(mmszPath.join(mmszCarpetaCopias(), `progreso-${mmszHoy()}.json`), mmszDatos);
  const mmszDiarias = fs
    .readdirSync(mmszCarpetaCopias())
    .filter((f) => /^progreso-\d{4}-\d{2}-\d{2}\.json$/.test(f))
    .sort()
    .reverse();
  for (const f of mmszDiarias.slice(MMSZ_COPIAS_DIARIAS)) fs.unlinkSync(mmszPath.join(mmszCarpetaCopias(), f));
}

function mmszListarCopias() {
  if (!fs.existsSync(mmszCarpetaCopias())) return [];
  return fs
    .readdirSync(mmszCarpetaCopias())
    .filter((f) => /^progreso-[\w-]+\.json$/.test(f))
    .map((f) => {
      const mmszArchivo = mmszPath.join(mmszCarpetaCopias(), f);
      try {
        const d = mmszLeerProgreso(mmszArchivo);
        return { nombre: f, fecha: fs.statSync(mmszArchivo).mtime.toISOString(), datos: d };
      } catch {
        return null;
      }
    })
    .filter(Boolean)
    .sort((a, b) => b.fecha.localeCompare(a.fecha));
}

ipcMain.handle('progress:load', () => {
  // 1) El archivo normal
  if (fs.existsSync(mmszProgressFile())) {
    try {
      return { datos: mmszLeerProgreso(mmszProgressFile()), aviso: null };
    } catch {
      // Está dañado: se aparta (no se borra) y se intenta recuperar desde una copia.
      fs.renameSync(mmszProgressFile(), mmszProgressFile().replace(/\.json$/, `-danado-${Date.now()}.json`));
      const mmszCopia = mmszListarCopias()[0];
      if (mmszCopia) {
        mmszEscribirSeguro(mmszProgressFile(), mmszCopia.datos);
        const mmszFecha = new Date(mmszCopia.fecha).toLocaleString('es-PE', { dateStyle: 'long', timeStyle: 'short', hourCycle: 'h23' });
        return { datos: mmszCopia.datos, aviso: `Tu archivo de progreso estaba dañado. Se recuperó la copia de seguridad del ${mmszFecha}` };
      }
      return { datos: null, aviso: 'Tu archivo de progreso estaba dañado y no había copias de seguridad. Se empezó un progreso nuevo.' };
    }
  }
  // 2) Progreso guardado con el nombre anterior de la app
  const mmszAnterior = mmszProgresoAnterior();
  if (mmszAnterior) {
    try {
      return { datos: mmszLeerProgreso(mmszAnterior), aviso: null };
    } catch {
      /* se ignora */
    }
  }
  return { datos: null, aviso: null };
});

ipcMain.handle('progress:save', (_event, mmszDatos) => {
  if (!mmszEsProgreso(mmszDatos)) return false;
  mmszEscribirSeguro(mmszProgressFile(), mmszDatos);
  try {
    mmszCopiaDiaria(mmszDatos);
  } catch {
    /* una copia fallida no debe impedir guardar */
  }
  return true;
});

ipcMain.handle('progress:copias', () =>
  mmszListarCopias().map(({ nombre, fecha, datos }) => ({ nombre, fecha, datos })),
);

ipcMain.handle('progress:copiaManual', (_event, mmszDatos, mmszEtiqueta) => {
  if (!mmszEsProgreso(mmszDatos)) return false;
  const mmszMarca = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const mmszLimpia = String(mmszEtiqueta || 'manual').replace(/[^\w-]/g, '').slice(0, 30);
  mmszEscribirSeguro(mmszPath.join(mmszCarpetaCopias(), `progreso-${mmszLimpia}-${mmszMarca}.json`), mmszDatos);
  return true;
});

ipcMain.handle('progress:exportar', async (event, mmszContenido) => {
  const mmszVentana = BrowserWindow.fromWebContents(event.sender);
  const { canceled, filePath } = await dialog.showSaveDialog(mmszVentana, {
    title: 'Exportar progreso de Novexa',
    defaultPath: mmszPath.join(app.getPath('documents'), `novexa-progreso-${mmszHoy()}.json`),
    filters: [{ name: 'Progreso de Novexa', extensions: ['json'] }],
  });
  if (canceled || !filePath) return { ok: false };
  fs.writeFileSync(filePath, mmszContenido, 'utf8');
  return { ok: true, ruta: filePath };
});

ipcMain.handle('progress:importar', async (event) => {
  const mmszVentana = BrowserWindow.fromWebContents(event.sender);
  const { canceled, filePaths } = await dialog.showOpenDialog(mmszVentana, {
    title: 'Importar progreso de Novexa',
    defaultPath: app.getPath('documents'),
    filters: [{ name: 'Progreso de Novexa', extensions: ['json'] }],
    properties: ['openFile'],
  });
  if (canceled || !filePaths[0]) return { ok: false };
  if (fs.statSync(filePaths[0]).size > 5 * 1024 * 1024) return { ok: false, error: 'El archivo es demasiado grande.' };
  return { ok: true, contenido: fs.readFileSync(filePaths[0], 'utf8') };
});

function mmszCreateWindow() {
  const mmszWin = new BrowserWindow({
    width: 1100,
    height: 760,
    minWidth: 800,
    minHeight: 600,
    title: 'Novexa',
    backgroundColor: '#14121f',
    webPreferences: {
      preload: mmszPath.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Los enlaces externos (por ejemplo "Ver en YouTube") se abren en el navegador del usuario.
  mmszWin.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });

  mmszWin.loadURL(mmszIsDev ? 'http://localhost:5173' : 'app://bundle/index.html');
}

app.whenReady().then(() => {
  protocol.handle('app', mmszServeApp);

  // YouTube necesita saber desde qué página se inserta el video. Como la app se sirve
  // desde app://, el navegador no envía esa información y el video mostraría un error.
  session.defaultSession.webRequest.onBeforeSendHeaders(
    { urls: ['https://*.youtube-nocookie.com/*', 'https://*.youtube.com/*'] },
    (mmszDetalle, mmszResponder) => {
      const mmszCabeceras = mmszDetalle.requestHeaders;
      if (!mmszCabeceras.Referer) mmszCabeceras.Referer = 'https://www.youtube-nocookie.com/';
      mmszResponder({ requestHeaders: mmszCabeceras });
    },
  );
  if (!mmszIsDev) Menu.setApplicationMenu(null);
  mmszCreateWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) mmszCreateWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
