const mmszFs = require('fs');
const mmszPath = require('path');
const mmszHttps = require('https');
const { execFileSync: mmszEjecutar } = require('child_process');

const MMSZ_CARPETA = mmszPath.join(__dirname, '..', 'voz');
const MMSZ_PIPER = 'https://github.com/rhasspy/piper/releases/download/2023.11.14-2/piper_windows_amd64.zip';
const MMSZ_VOZ = 'https://huggingface.co/rhasspy/piper-voices/resolve/main/es/es_AR/daniela/high/es_AR-daniela-high.onnx';

function mmszDescargar(mmszUrl, mmszDestino) {
  return new Promise((mmszResolver, mmszRechazar) => {
    mmszHttps
      .get(mmszUrl, (mmszRespuesta) => {
        if (mmszRespuesta.statusCode >= 300 && mmszRespuesta.statusCode < 400 && mmszRespuesta.headers.location) {
          mmszRespuesta.resume();
          mmszDescargar(new URL(mmszRespuesta.headers.location, mmszUrl).toString(), mmszDestino).then(mmszResolver, mmszRechazar);
          return;
        }
        if (mmszRespuesta.statusCode !== 200) {
          mmszRechazar(new Error(`Descarga fallida (${mmszRespuesta.statusCode}): ${mmszUrl}`));
          return;
        }
        const mmszArchivo = mmszFs.createWriteStream(mmszDestino);
        mmszRespuesta.pipe(mmszArchivo);
        mmszArchivo.on('finish', () => mmszArchivo.close(mmszResolver));
      })
      .on('error', mmszRechazar);
  });
}

async function mmszPrincipal() {
  mmszFs.mkdirSync(MMSZ_CARPETA, { recursive: true });
  const mmszExe = mmszPath.join(MMSZ_CARPETA, 'piper', 'piper.exe');
  if (!mmszFs.existsSync(mmszExe)) {
    const mmszZip = mmszPath.join(MMSZ_CARPETA, 'piper.zip');
    console.log('Descargando Piper...');
    await mmszDescargar(MMSZ_PIPER, mmszZip);
    mmszEjecutar('powershell', ['-NoProfile', '-Command', `Expand-Archive -Force -LiteralPath '${mmszZip}' -DestinationPath '${MMSZ_CARPETA}'`]);
    mmszFs.unlinkSync(mmszZip);
  }
  for (const mmszExtension of ['', '.json']) {
    const mmszDestino = mmszPath.join(MMSZ_CARPETA, 'es_AR-daniela-high.onnx' + mmszExtension);
    if (!mmszFs.existsSync(mmszDestino)) {
      console.log('Descargando voz Daniela' + mmszExtension + '...');
      await mmszDescargar(MMSZ_VOZ + mmszExtension, mmszDestino);
    }
  }
  console.log('Voz lista en', MMSZ_CARPETA);
}

mmszPrincipal().catch((mmszError) => {
  console.error(mmszError.message);
  process.exit(1);
});
