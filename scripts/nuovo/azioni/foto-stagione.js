"use strict";

// FOTO: aggiungere immagini a un periodo di stagione gia esistente.

const fs = require("fs");
const { STAGIONI } = require("../base/impostazioni");
const {
  chiedi,
  chiediValido,
  giallo,
  grassetto,
  rosso,
  scegli,
} = require("../base/terminale");
const { leggiJson, ordinaPeriodi } = require("../base/utilita");
const {
  cartellaImg,
  elencaFoto,
  pulisciPercorso,
} = require("../immagini/foto");

const raccogliFoto = async (piano) => {
  const chiave = (
    await scegli(
      "A quale stagione vuoi aggiungere le foto?",
      Object.entries(STAGIONI).map(([k, v]) => ({
        chiave: k,
        testo: v.etichetta,
      })),
    )
  ).chiave;
  const s = STAGIONI[chiave];
  const periodi = Object.keys(
    leggiJson(piano, `json/${s.cartella}/generale.json`).subPeriods,
  ).sort(ordinaPeriodi);
  const periodo = await chiediValido(
    `Periodo (${periodi.join(", ")})`,
    periodi[periodi.length - 1],
    (v) => (periodi.includes(v) ? null : `Scegli tra: ${periodi.join(", ")}.`),
  );

  let foto = [];
  let percorso = await chiedi(
    "Cartella con le foto (.jpg) — trascinala qui",
    "",
  );
  for (;;) {
    if (!percorso) throw new Error("Nessuna cartella indicata.");
    const dir = pulisciPercorso(percorso);
    if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) {
      const r = elencaFoto(dir);
      if (r.ignorati.length)
        console.log(
          giallo(
            `  ⚠ Ignoro ${r.ignorati.length} file non .jpg: ${r.ignorati.slice(0, 5).join(", ")}`,
          ),
        );
      if (r.foto.length) {
        foto = r.foto;
        break;
      }
      console.log(rosso("  ✖ In quella cartella non ci sono file .jpg."));
    } else {
      console.log(rosso("  ✖ Cartella non trovata."));
    }
    percorso = await chiedi("Prova con un'altra cartella", "");
  }
  return { chiave, s, periodo, foto };
};

const applicaFoto = (piano, d) => {
  const { s, periodo, foto } = d;
  const fileHtml = `${s.cartella}/${periodo}.html`;
  let html = piano.leggi(fileHtml);
  const gal = html.match(/(<div class="gallery">)([\s\S]*?)(\n[ \t]*<\/div>)/);
  if (!gal) throw new Error(`In ${fileHtml} non trovo <div class="gallery">.`);

  // le nuove foto continuano la numerazione: non sovrascrivo mai quelle che ci sono
  const img = cartellaImg();
  const cartellaFoto = `${img}/${s.cartella}/${periodo}`;
  const nelHtml = (gal[2].match(/class="shot"/g) || []).length;
  let nelleCartella = 0;
  if (fs.existsSync(piano.assoluto(cartellaFoto))) {
    for (const n of fs.readdirSync(piano.assoluto(cartellaFoto))) {
      const m = n.match(/^(\d+)\.jpe?g$/i);
      if (m) nelleCartella = Math.max(nelleCartella, parseInt(m[1], 10));
    }
  }
  const primo = Math.max(nelHtml, nelleCartella) + 1;

  const rientroDiv = html.slice(
    html.lastIndexOf("\n", gal.index) + 1,
    gal.index,
  );
  const r1 = `${rientroDiv}  `;
  const r2 = `${r1}  `;
  const r3 = `${r2}  `;
  const blocchi = foto.map((origine, i) => {
    const n = primo + i;
    piano.creaBinario(`${cartellaFoto}/${n}.jpg`, fs.readFileSync(origine));
    const src = `/img/${s.cartella}/${periodo}/${n}.jpg`;
    return [
      `${r1}<a`,
      `${r2}class="shot"`,
      `${r2}href="${src}"`,
      `${r2}download`,
      `${r2}target="_blank"`,
      `${r2}rel="noopener"`,
      `${r1}>`,
      `${r2}<img`,
      `${r3}class="immagine"`,
      `${r3}src="${src}"`,
      `${r3}alt="Foto ${s.testo} ${periodo} numero ${n}"`,
      `${r3}loading="lazy"`,
      `${r2}/>`,
      `${r1}</a>`,
    ].join("\n");
  });

  // tolgo il commento segnaposto della galleria vuota, se c'è
  const dentro = gal[2].replace(/\n[ \t]*<!-- Foto:[\s\S]*?-->/, "");
  html =
    html.slice(0, gal.index) +
    gal[1] +
    dentro +
    "\n" +
    blocchi.join("\n") +
    gal[3] +
    html.slice(gal.index + gal[0].length);
  piano.modifica(fileHtml, html);

  piano.note.push(
    grassetto(`${foto.length} foto in ${s.testo} ${periodo}`),
    `• copiate in ${cartellaFoto}/ come ${primo}.jpg … ${primo + foto.length - 1}.jpg (nell'ordine dei nomi)`,
    `• ${fileHtml}: aggiunti ${foto.length} blocchi alla galleria`,
  );
};

module.exports = { raccogliFoto, applicaFoto };
