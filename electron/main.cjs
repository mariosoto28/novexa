// Autor: MMSZ (Mario Soto Zea)
// Proceso principal de Electron: crea la ventana y guarda el progreso en disco.
const { app, BrowserWindow, ipcMain, Menu, protocol, session, shell } = require('electron');
const mmszPath = require('path');
const fs = require('fs');

const mmszIsDev = process.argv.includes('--dev');
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

ipcMain.handle('progress:load', () => {
  try {
    const mmszArchivo = fs.existsSync(mmszProgressFile()) ? mmszProgressFile() : mmszProgresoAnterior();
    return mmszArchivo ? JSON.parse(fs.readFileSync(mmszArchivo, 'utf8')) : null;
  } catch {
    return null;
  }
});

ipcMain.handle('progress:save', (_event, mmszData) => {
  fs.mkdirSync(mmszPath.dirname(mmszProgressFile()), { recursive: true });
  fs.writeFileSync(mmszProgressFile(), JSON.stringify(mmszData, null, 2), 'utf8');
  return true;
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
