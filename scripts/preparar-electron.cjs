const mmszFs = require('fs');
const mmszPath = require('path');
const { execFileSync: mmszEjecutar } = require('child_process');

const MMSZ_ELECTRON = mmszPath.join(__dirname, '..', 'node_modules', 'electron');
const MMSZ_EJECUTABLE = 'electron.exe';

function mmszListo() {
  try {
    return (
      mmszFs.readFileSync(mmszPath.join(MMSZ_ELECTRON, 'path.txt'), 'utf8') === MMSZ_EJECUTABLE &&
      mmszFs.existsSync(mmszPath.join(MMSZ_ELECTRON, 'dist', MMSZ_EJECUTABLE))
    );
  } catch {
    return false;
  }
}

function mmszDescomprimir(mmszZip, mmszDestino) {
  try {
    mmszEjecutar('tar', ['-xf', mmszZip, '-C', mmszDestino], { stdio: 'ignore' });
  } catch {
    mmszEjecutar('powershell', ['-NoProfile', '-Command', `Expand-Archive -Force -LiteralPath '${mmszZip}' -DestinationPath '${mmszDestino}'`]);
  }
}

async function mmszPrincipal() {
  if (process.platform !== 'win32' || !mmszFs.existsSync(MMSZ_ELECTRON) || mmszListo()) return;
  console.log('Preparando Electron...');
  const { version: mmszVersion } = require(mmszPath.join(MMSZ_ELECTRON, 'package.json'));
  const { downloadArtifact: mmszDescargar } = require(require.resolve('@electron/get', { paths: [MMSZ_ELECTRON] }));
  const mmszZip = await mmszDescargar({
    version: mmszVersion,
    artifactName: 'electron',
    platform: 'win32',
    arch: process.arch,
    checksums: require(mmszPath.join(MMSZ_ELECTRON, 'checksums.json')),
  });
  const mmszDist = mmszPath.join(MMSZ_ELECTRON, 'dist');
  mmszFs.mkdirSync(mmszDist, { recursive: true });
  mmszDescomprimir(mmszZip, mmszDist);
  const mmszTipos = mmszPath.join(mmszDist, 'electron.d.ts');
  if (mmszFs.existsSync(mmszTipos)) mmszFs.renameSync(mmszTipos, mmszPath.join(MMSZ_ELECTRON, 'electron.d.ts'));
  mmszFs.writeFileSync(mmszPath.join(MMSZ_ELECTRON, 'path.txt'), MMSZ_EJECUTABLE);
  console.log('Electron listo');
}

mmszPrincipal().catch((mmszError) => {
  console.error('No se pudo preparar Electron:', mmszError.message);
  process.exit(1);
});
