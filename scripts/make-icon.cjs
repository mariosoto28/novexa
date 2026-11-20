// Autor: MMSZ (Mario Soto Zea)
// Dibuja el ícono de la app (512x512 PNG): un cuadrado morado redondeado con "</>" en blanco.
// No necesita librerías: calcula cada píxel y lo guarda como PNG con zlib.
const fs = require('fs');
const mmszPath = require('path');
const mmszZlib = require('zlib');

const S = 512;
const BG = [139, 108, 255]; // morado de la marca (#8b6cff)
const FG = [255, 255, 255];

// Trazos del símbolo </> (coordenadas en píxeles).
const mmszSegments = [
  [[176, 176], [100, 256]], [[100, 256], [176, 336]], // <
  [[336, 176], [412, 256]], [[412, 256], [336, 336]], // >
  [[286, 160], [226, 352]], // /
];
const MMSZ_STROKE = 19; // medio grosor

function mmszDistToSegment(px, py, [[ax, ay], [bx, by]]) {
  const dx = bx - ax, dy = by - ay;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

function mmszRoundedRectAlpha(x, y) {
  const r = 110, m = 16; // radio de las esquinas y margen
  const cx = Math.min(Math.max(x, m + r), S - m - r);
  const cy = Math.min(Math.max(y, m + r), S - m - r);
  const d = Math.hypot(x - cx, y - cy) - r;
  return Math.max(0, Math.min(1, 0.5 - d));
}

const mmszRaw = Buffer.alloc(S * (S * 4 + 1));
for (let y = 0; y < S; y++) {
  mmszRaw[y * (S * 4 + 1)] = 0; // filtro PNG "none"
  for (let x = 0; x < S; x++) {
    const px = x + 0.5, py = y + 0.5;
    const a = mmszRoundedRectAlpha(px, py);
    const d = Math.min(...mmszSegments.map((s) => mmszDistToSegment(px, py, s)));
    const f = Math.max(0, Math.min(1, MMSZ_STROKE + 0.5 - d)); // cobertura del trazo con suavizado
    const o = y * (S * 4 + 1) + 1 + x * 4;
    for (let c = 0; c < 3; c++) mmszRaw[o + c] = Math.round(BG[c] * (1 - f) + FG[c] * f);
    mmszRaw[o + 3] = Math.round(a * 255);
  }
}

const mmszCrcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const mmszCrc32 = (mmszBuf) => {
  let c = 0xffffffff;
  for (const b of mmszBuf) c = mmszCrcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const mmszChunk = (mmszType, mmszData) => {
  const mmszLen = Buffer.alloc(4);
  mmszLen.writeUInt32BE(mmszData.length);
  const mmszBody = Buffer.concat([Buffer.from(mmszType), mmszData]);
  const mmszCrc = Buffer.alloc(4);
  mmszCrc.writeUInt32BE(mmszCrc32(mmszBody));
  return Buffer.concat([mmszLen, mmszBody, mmszCrc]);
};

const mmszIhdr = Buffer.alloc(13);
mmszIhdr.writeUInt32BE(S, 0);
mmszIhdr.writeUInt32BE(S, 4);
mmszIhdr[8] = 8; // bits por canal
mmszIhdr[9] = 6; // RGBA
const mmszPng = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  mmszChunk('IHDR', mmszIhdr),
  mmszChunk('IDAT', mmszZlib.deflateSync(mmszRaw, { level: 9 })),
  mmszChunk('IEND', Buffer.alloc(0)),
]);

const mmszOut = mmszPath.join(__dirname, '..', 'build', 'icon.png');
fs.mkdirSync(mmszPath.dirname(mmszOut), { recursive: true });
fs.writeFileSync(mmszOut, mmszPng);
console.log('[icono] build/icon.png listo');
