"use strict";

// Icona (favicon) dell'anno: PNG 256x256 con l'anno scritto sul colore scelto.

const zlib = require("zlib");
const { coloreInRgb } = require("../base/utilita");

const tabellaCrc = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let x = n;
    for (let k = 0; k < 8; k++) x = x & 1 ? 0xedb88320 ^ (x >>> 1) : x >>> 1;
    t[n] = x >>> 0;
  }
  return t;
})();

const crc32 = (buf) => {
  let x = 0xffffffff;
  for (const b of buf) x = tabellaCrc[(x ^ b) & 0xff] ^ (x >>> 8);
  return (x ^ 0xffffffff) >>> 0;
};

const pezzoPng = (tipo, dati) => {
  const corpo = Buffer.concat([Buffer.from(tipo, "ascii"), dati]);
  const lung = Buffer.alloc(4);
  lung.writeUInt32BE(dati.length);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(corpo));
  return Buffer.concat([lung, corpo, crc]);
};

// Cifre 5x7 (un carattere = un pixel "grande").
const CIFRE = {
  0: ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
  1: ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
  2: ["01110", "10001", "00001", "00010", "00100", "01000", "11111"],
  3: ["11110", "00001", "00001", "01110", "00001", "00001", "11110"],
  4: ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
  5: ["11111", "10000", "11110", "00001", "00001", "10001", "01110"],
  6: ["00110", "01000", "10000", "11110", "10001", "10001", "01110"],
  7: ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
  8: ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
  9: ["01110", "10001", "10001", "01111", "00001", "00010", "01100"],
};

// Icona quadrata 256x256 (PNG): l'anno su due righe ("20" / "27") sul colore dell'anno.
const creaIconaAnno = (anno, colore) => {
  const L = 256;
  const [r, g, b] = coloreInRgb(colore);
  const chiaro = 0.299 * r + 0.587 * g + 0.114 * b > 150;
  const testo = chiaro ? [20, 20, 20] : [255, 255, 255];
  const scala = 13;
  const larg = 5 * scala;
  const spazio = scala;
  const alt = 7 * scala;
  const righeTesto = [String(anno).slice(0, 2), String(anno).slice(2, 4)];
  const totaleAlt = alt * 2 + 2 * scala;
  const y0 = Math.round((L - totaleAlt) / 2);
  const pixel = Buffer.alloc(L * L * 4);
  const raggio = 52;
  const dentro = (x, y) => {
    const cx = Math.min(Math.max(x, raggio), L - 1 - raggio);
    const cy = Math.min(Math.max(y, raggio), L - 1 - raggio);
    return (x - cx) ** 2 + (y - cy) ** 2 <= raggio ** 2;
  };
  const acceso = (x, y) => {
    for (let riga = 0; riga < 2; riga++) {
      const ty = y0 + riga * (alt + 2 * scala);
      const tx = Math.round((L - (larg * 2 + spazio)) / 2);
      if (y < ty || y >= ty + alt) continue;
      for (let c = 0; c < 2; c++) {
        const cx0 = tx + c * (larg + spazio);
        if (x < cx0 || x >= cx0 + larg) continue;
        const cifra = CIFRE[righeTesto[riga][c]];
        if (cifra && cifra[Math.floor((y - ty) / scala)][Math.floor((x - cx0) / scala)] === "1") return true;
      }
    }
    return false;
  };
  for (let y = 0; y < L; y++) {
    for (let x = 0; x < L; x++) {
      // 3x3 campioni per i bordi arrotondati più morbidi
      let cop = 0;
      for (let sy = 0; sy < 3; sy++) for (let sx = 0; sx < 3; sx++) if (dentro(x + (sx + 0.5) / 3 - 0.5, y + (sy + 0.5) / 3 - 0.5)) cop++;
      const o = (y * L + x) * 4;
      const [pr, pg, pb] = acceso(x, y) ? testo : [r, g, b];
      pixel[o] = pr;
      pixel[o + 1] = pg;
      pixel[o + 2] = pb;
      pixel[o + 3] = Math.round((cop / 9) * 255);
    }
  }
  const righeRaw = Buffer.alloc(L * (L * 4 + 1));
  for (let y = 0; y < L; y++) pixel.copy(righeRaw, y * (L * 4 + 1) + 1, y * L * 4, (y + 1) * L * 4);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(L, 0);
  ihdr.writeUInt32BE(L, 4);
  ihdr[8] = 8; // 8 bit
  ihdr[9] = 6; // RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pezzoPng("IHDR", ihdr),
    pezzoPng("IDAT", zlib.deflateSync(righeRaw)),
    pezzoPng("IEND", Buffer.alloc(0)),
  ]);
};

module.exports = { creaIconaAnno };
