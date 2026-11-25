const { app: mmszApp, BrowserWindow: MmszBrowserWindow, dialog: mmszDialog, ipcMain: mmszIpcMain, Menu: MmszMenu, protocol: mmszProtocol, session: mmszSession, shell: mmszShell } = require('electron');
const mmszPath = require('path');
const mmszFs = require('fs');
const mmszCrypto = require('crypto');
const { spawn: mmszSpawn } = require('child_process');

const mmszIsDev = process.argv.includes('--dev');

if (process.env.NOVEXA_DATOS) mmszApp.setPath('userData', process.env.NOVEXA_DATOS);
const mmszDistDir = mmszPath.join(__dirname, '..', 'dist');
const mmszProgressFile = () => mmszPath.join(mmszApp.getPath('userData'), 'progress.json');

mmszProtocol.registerSchemesAsPrivileged([
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
};

function mmszServeApp(mmszRequest) {
  const { pathname: mmszPathname } = new URL(mmszRequest.url);
  const mmszFile = mmszPath.normalize(mmszPath.join(mmszDistDir, decodeURIComponent(mmszPathname)));
  if (!mmszFile.startsWith(mmszDistDir) || !mmszFs.existsSync(mmszFile) || mmszFs.statSync(mmszFile).isDirectory()) {
    return new Response('No encontrado', { status: 404 });
  }
  const mmszType = MMSZ_MIME[mmszPath.extname(mmszFile).toLowerCase()] || 'application/octet-stream';
  return new Response(mmszFs.readFileSync(mmszFile), { headers: { 'content-type': mmszType } });
}

function mmszProgresoAnterior() {
  const mmszCarpetaDatos = mmszPath.dirname(mmszApp.getPath('userData'));
  for (const mmszNombre of ['CodeRuta', 'coderuta']) {
    const mmszArchivo = mmszPath.join(mmszCarpetaDatos, mmszNombre, 'progress.json');
    if (mmszFs.existsSync(mmszArchivo)) return mmszArchivo;
  }
  return null;
}

const MMSZ_COPIAS_DIARIAS = 14;
const mmszCarpetaCopias = () => mmszPath.join(mmszApp.getPath('userData'), 'copias');

function mmszHoy() {
  const mmszD = new Date();
  return `${mmszD.getFullYear()}-${String(mmszD.getMonth() + 1).padStart(2, '0')}-${String(mmszD.getDate()).padStart(2, '0')}`;
}

function mmszEsProgreso(mmszD) {
  return Boolean(mmszD) && typeof mmszD === 'object' && typeof mmszD.mmszXp === 'number' && mmszD.mmszCompleted && typeof mmszD.mmszCompleted === 'object';
}

function mmszMigrarClaves(mmszObj) {
  if (!mmszObj || typeof mmszObj !== 'object' || Array.isArray(mmszObj)) return mmszObj;
  return Object.fromEntries(
    Object.entries(mmszObj).map(([mmszClave, mmszValor]) => [
      /^mmsz/.test(mmszClave) ? mmszClave : 'mmsz' + mmszClave[0].toUpperCase() + mmszClave.slice(1),
      mmszValor,
    ]),
  );
}

function mmszLeerProgreso(mmszArchivo) {
  const mmszD = mmszMigrarClaves(JSON.parse(mmszFs.readFileSync(mmszArchivo, 'utf8')));
  if (!mmszEsProgreso(mmszD)) throw new Error('El archivo no tiene el formato de progreso de Novexa');
  return mmszD;
}

function mmszEscribirSeguro(mmszArchivo, mmszDatos) {
  mmszFs.mkdirSync(mmszPath.dirname(mmszArchivo), { recursive: true });
  const mmszTemporal = mmszArchivo + '.tmp';
  mmszFs.writeFileSync(mmszTemporal, JSON.stringify(mmszDatos, null, 2), 'utf8');
  mmszFs.renameSync(mmszTemporal, mmszArchivo);
}

function mmszCopiaDiaria(mmszDatos) {
  mmszEscribirSeguro(mmszPath.join(mmszCarpetaCopias(), `progreso-${mmszHoy()}.json`), mmszDatos);
  const mmszDiarias = mmszFs
    .readdirSync(mmszCarpetaCopias())
    .filter((mmszF) => /^progreso-\d{4}-\d{2}-\d{2}\.json$/.test(mmszF))
    .sort()
    .reverse();
  for (const mmszF of mmszDiarias.slice(MMSZ_COPIAS_DIARIAS)) mmszFs.unlinkSync(mmszPath.join(mmszCarpetaCopias(), mmszF));
}

function mmszListarCopias() {
  if (!mmszFs.existsSync(mmszCarpetaCopias())) return [];
  return mmszFs
    .readdirSync(mmszCarpetaCopias())
    .filter((mmszF) => /^progreso-[\w-]+\.json$/.test(mmszF))
    .map((mmszF) => {
      const mmszArchivo = mmszPath.join(mmszCarpetaCopias(), mmszF);
      try {
        const mmszD = mmszLeerProgreso(mmszArchivo);
        return { mmszNombre: mmszF, mmszFecha: mmszFs.statSync(mmszArchivo).mtime.toISOString(), mmszDatos: mmszD };
      } catch {
        return null;
      }
    })
    .filter(Boolean)
    .sort((mmszA, mmszB) => mmszB.mmszFecha.localeCompare(mmszA.mmszFecha));
}

mmszIpcMain.handle('progress:load', () => {
  if (mmszFs.existsSync(mmszProgressFile())) {
    try {
      return { mmszDatos: mmszLeerProgreso(mmszProgressFile()), mmszAviso: null };
    } catch {
      mmszFs.renameSync(mmszProgressFile(), mmszProgressFile().replace(/\.json$/, `-danado-${Date.now()}.json`));
      const mmszCopia = mmszListarCopias()[0];
      if (mmszCopia) {
        mmszEscribirSeguro(mmszProgressFile(), mmszCopia.mmszDatos);
        const mmszFecha = new Date(mmszCopia.mmszFecha).toLocaleString('es-PE', { dateStyle: 'long', timeStyle: 'short', hourCycle: 'h23' });
        return { mmszDatos: mmszCopia.mmszDatos, mmszAviso: `Tu archivo de progreso estaba dañado. Se recuperó la copia de seguridad del ${mmszFecha}` };
      }
      return { mmszDatos: null, mmszAviso: 'Tu archivo de progreso estaba dañado y no había copias de seguridad. Se empezó un progreso nuevo.' };
    }
  }
  const mmszAnterior = mmszProgresoAnterior();
  if (mmszAnterior) {
    try {
      return { mmszDatos: mmszLeerProgreso(mmszAnterior), mmszAviso: null };
    } catch {}
  }
  return { mmszDatos: null, mmszAviso: null };
});

mmszIpcMain.handle('progress:save', (mmszEvent, mmszDatos) => {
  if (!mmszEsProgreso(mmszDatos)) return false;
  mmszEscribirSeguro(mmszProgressFile(), mmszDatos);
  try {
    mmszCopiaDiaria(mmszDatos);
  } catch {}
  return true;
});

mmszIpcMain.handle('progress:copias', () =>
  mmszListarCopias().map(({ mmszNombre, mmszFecha, mmszDatos }) => ({ mmszNombre, mmszFecha, mmszDatos })),
);

mmszIpcMain.handle('progress:copiaManual', (mmszEvent, mmszDatos, mmszEtiqueta) => {
  if (!mmszEsProgreso(mmszDatos)) return false;
  const mmszMarca = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const mmszLimpia = String(mmszEtiqueta || 'manual').replace(/[^\w-]/g, '').slice(0, 30);
  mmszEscribirSeguro(mmszPath.join(mmszCarpetaCopias(), `progreso-${mmszLimpia}-${mmszMarca}.json`), mmszDatos);
  return true;
});

mmszIpcMain.handle('progress:exportar', async (mmszEvent, mmszContenido) => {
  const mmszVentana = MmszBrowserWindow.fromWebContents(mmszEvent.sender);
  const { canceled: mmszCanceled, filePath: mmszFilePath } = await mmszDialog.showSaveDialog(mmszVentana, {
    title: 'Exportar progreso de Novexa',
    defaultPath: mmszPath.join(mmszApp.getPath('documents'), `novexa-progreso-${mmszHoy()}.json`),
    filters: [{ name: 'Progreso de Novexa', extensions: ['json'] }],
  });
  if (mmszCanceled || !mmszFilePath) return { mmszOk: false };
  mmszFs.writeFileSync(mmszFilePath, mmszContenido, 'utf8');
  return { mmszOk: true, mmszRuta: mmszFilePath };
});

mmszIpcMain.handle('progress:importar', async (mmszEvent) => {
  const mmszVentana = MmszBrowserWindow.fromWebContents(mmszEvent.sender);
  const { canceled: mmszCanceled, filePaths: mmszFilePaths } = await mmszDialog.showOpenDialog(mmszVentana, {
    title: 'Importar progreso de Novexa',
    defaultPath: mmszApp.getPath('documents'),
    filters: [{ name: 'Progreso de Novexa', extensions: ['json'] }],
    properties: ['openFile'],
  });
  if (mmszCanceled || !mmszFilePaths[0]) return { mmszOk: false };
  if (mmszFs.statSync(mmszFilePaths[0]).size > 5 * 1024 * 1024) return { mmszOk: false, mmszError: 'El archivo es demasiado grande.' };
  return { mmszOk: true, mmszContenido: mmszFs.readFileSync(mmszFilePaths[0], 'utf8') };
});

const mmszUsuariosFile = () => mmszPath.join(mmszApp.getPath('userData'), 'usuarios.json');

mmszIpcMain.handle('usuarios:load', () => {
  try {
    return JSON.parse(mmszFs.readFileSync(mmszUsuariosFile(), 'utf8'));
  } catch {
    return null;
  }
});

mmszIpcMain.handle('usuarios:save', (mmszEvent, mmszDatos) => {
  if (!mmszDatos || !Array.isArray(mmszDatos.mmszUsuarios)) return false;
  mmszEscribirSeguro(mmszUsuariosFile(), mmszDatos);
  return true;
});

function mmszCreateWindow() {
  const mmszWin = new MmszBrowserWindow({
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

  mmszWin.webContents.setWindowOpenHandler(({ url: mmszUrl }) => {
    if (/^https?:\/\//.test(mmszUrl)) mmszShell.openExternal(mmszUrl);
    return { action: 'deny' };
  });

  mmszWin.loadURL(mmszIsDev ? 'http://localhost:5173' : 'app://bundle/index.html');
}

const MMSZ_MODELO_VOZ = 'es_AR-daniela-high.onnx';
const MMSZ_MAXIMO_CACHE_VOZ = 3000;
const mmszCarpetaVoz = () => (mmszApp.isPackaged ? mmszPath.join(process.resourcesPath, 'voz') : mmszPath.join(__dirname, '..', 'voz'));
const mmszCarpetaCacheVoz = () => mmszPath.join(mmszApp.getPath('userData'), 'voz-cache');
let mmszPiper = null;
let mmszBufferVoz = '';
const mmszPendientesVoz = [];

function mmszLimpiarCacheVoz() {
  try {
    const mmszArchivos = mmszFs
      .readdirSync(mmszCarpetaCacheVoz())
      .filter((mmszF) => mmszF.endsWith('.wav'))
      .map((mmszF) => ({ mmszF, mmszT: mmszFs.statSync(mmszPath.join(mmszCarpetaCacheVoz(), mmszF)).mtimeMs }));
    if (mmszArchivos.length <= MMSZ_MAXIMO_CACHE_VOZ) return;
    mmszArchivos
      .sort((mmszA, mmszB) => mmszA.mmszT - mmszB.mmszT)
      .slice(0, mmszArchivos.length - MMSZ_MAXIMO_CACHE_VOZ / 2)
      .forEach((mmszA) => mmszFs.unlinkSync(mmszPath.join(mmszCarpetaCacheVoz(), mmszA.mmszF)));
  } catch {}
}

function mmszIniciarPiper() {
  const mmszBase = mmszCarpetaVoz();
  const mmszExe = mmszPath.join(mmszBase, 'piper', 'piper.exe');
  const mmszModelo = mmszPath.join(mmszBase, MMSZ_MODELO_VOZ);
  if (process.platform !== 'win32' || !mmszFs.existsSync(mmszExe) || !mmszFs.existsSync(mmszModelo)) return null;
  mmszFs.mkdirSync(mmszCarpetaCacheVoz(), { recursive: true });
  mmszLimpiarCacheVoz();
  const mmszProceso = mmszSpawn(mmszExe, ['--model', mmszModelo, '--json-input', '--output_dir', mmszCarpetaCacheVoz()], {
    cwd: mmszPath.join(mmszBase, 'piper'),
    windowsHide: true,
  });
  mmszBufferVoz = '';
  mmszProceso.stdout.on('data', (mmszD) => {
    mmszBufferVoz += mmszD.toString();
    let mmszI;
    while ((mmszI = mmszBufferVoz.indexOf('\n')) >= 0) {
      mmszBufferVoz = mmszBufferVoz.slice(mmszI + 1);
      mmszPendientesVoz.shift()?.mmszListo();
    }
  });
  mmszProceso.stderr.on('data', () => {});
  const mmszCaido = () => {
    if (mmszPiper === mmszProceso) mmszPiper = null;
    mmszPendientesVoz.splice(0).forEach((mmszP) => mmszP.mmszListo());
  };
  mmszProceso.on('exit', mmszCaido);
  mmszProceso.on('error', mmszCaido);
  return mmszProceso;
}

function mmszSintetizarVoz(mmszTexto) {
  const mmszLimpio = String(mmszTexto || '').replace(/\s+/g, ' ').trim().slice(0, 800);
  if (!mmszLimpio) return Promise.resolve(null);
  const mmszClave = mmszCrypto.createHash('sha1').update(MMSZ_MODELO_VOZ + '|' + mmszLimpio).digest('hex');
  const mmszArchivo = mmszPath.join(mmszCarpetaCacheVoz(), mmszClave + '.wav');
  if (mmszFs.existsSync(mmszArchivo)) return Promise.resolve(mmszArchivo);
  if (!mmszPiper) mmszPiper = mmszIniciarPiper();
  if (!mmszPiper) return Promise.resolve(null);
  return new Promise((mmszResolver) => {
    mmszPendientesVoz.push({ mmszListo: () => mmszResolver(mmszFs.existsSync(mmszArchivo) ? mmszArchivo : null) });
    mmszPiper.stdin.write(JSON.stringify({ text: mmszLimpio, output_file: mmszArchivo }) + '\n');
  });
}

mmszIpcMain.handle('voz:sintetizar', async (mmszEvent, mmszTexto) => {
  const mmszArchivo = await mmszSintetizarVoz(mmszTexto);
  return mmszArchivo ? mmszFs.readFileSync(mmszArchivo) : null;
});

mmszApp.on('will-quit', () => {
  if (mmszPiper) mmszPiper.kill();
});

mmszApp.whenReady().then(() => {
  mmszProtocol.handle('app', mmszServeApp);

  mmszSession.defaultSession.webRequest.onBeforeSendHeaders(
    { urls: ['https://*.youtube-nocookie.com/*', 'https://*.youtube.com/*'] },
    (mmszDetalle, mmszResponder) => {
      const mmszCabeceras = mmszDetalle.requestHeaders;
      if (!mmszCabeceras.Referer) mmszCabeceras.Referer = 'https://www.youtube-nocookie.com/';
      mmszResponder({ requestHeaders: mmszCabeceras });
    },
  );
  if (!mmszIsDev) MmszMenu.setApplicationMenu(null);
  mmszCreateWindow();
  mmszApp.on('activate', () => {
    if (MmszBrowserWindow.getAllWindows().length === 0) mmszCreateWindow();
  });
});

mmszApp.on('window-all-closed', () => {
  if (process.platform !== 'darwin') mmszApp.quit();
});
