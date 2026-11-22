// formati.js — Trasforma i dati della pagina in testo, CSV o JSON.
//
// Il parametro `conLink` decide se i collegamenti ai percorsi (Komoot) vanno
// inclusi: di base no, sono link personali e chi riceve i dati non sempre deve averli.

const oggi = () => new Date().toISOString().slice(0, 10);

const senzaTag = (valore) => {
  if (typeof valore !== "string" || !valore.includes("<")) return valore;
  const doc = new DOMParser().parseFromString(valore, "text/html");
  return doc.body.textContent.replace(/\s+/g, " ").trim();
};

// ---------- Testo (per WhatsApp, mail, note...) ----------

export const comeTesto = (dati, conLink) => {
  const righe = [dati.titolo, dati.url, ""];

  if (dati.riepilogo.length) {
    righe.push("Riepilogo");
    dati.riepilogo.forEach((r) => righe.push("• " + r));
    righe.push("");
  }

  dati.tabelle.forEach((t) => {
    if (t.titolo) righe.push(t.titolo);
    if (t.intestazioni.length) righe.push(t.intestazioni.join(" | "));
    t.righe.forEach((r) => {
      let riga = r.celle.join(" | ");
      if (conLink && r.link.length) riga += " → " + r.link.join(" ");
      righe.push(riga);
    });
    righe.push("");
  });

  dati.elenchi.forEach((e) => {
    if (e.titolo) righe.push(e.titolo);
    e.voci.forEach((v, i) => {
      let riga = `${i + 1}. ${v.testo}`;
      if (conLink && v.link.length) riga += " → " + v.link.join(" ");
      righe.push(riga);
    });
    righe.push("");
  });

  dati.grafici.forEach((g) => {
    if (g.titolo) righe.push(g.titolo);
    g.etichette.forEach((etichetta, i) => {
      const valori = g.serie
        .map((s) => (g.serie.length > 1 ? `${s.nome}: ` : "") + s.valori[i])
        .join(" · ");
      righe.push(`${etichetta}: ${valori}`);
    });
    righe.push("");
  });

  return righe
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

// ---------- CSV (Excel italiano: separatore ";" e BOM per gli accenti) ----------

const cella = (v) => {
  const t = String(v == null ? "" : v);
  return /[;"\n\r]/.test(t) ? '"' + t.replace(/"/g, '""') + '"' : t;
};
const rigaCsv = (valori) => valori.map(cella).join(";");

export const comeCsv = (dati, conLink) => {
  const blocchi = [];

  if (dati.riepilogo.length) {
    blocchi.push(
      [rigaCsv(["Riepilogo"]), ...dati.riepilogo.map((r) => rigaCsv([r]))].join(
        "\n",
      ),
    );
  }

  dati.tabelle.forEach((t) => {
    const righe = [];
    if (t.titolo) righe.push(rigaCsv([t.titolo]));
    const intestazioni = [...t.intestazioni];
    if (conLink) intestazioni.push("Link");
    if (intestazioni.length) righe.push(rigaCsv(intestazioni));
    t.righe.forEach((r) =>
      righe.push(rigaCsv(conLink ? [...r.celle, r.link.join(" ")] : r.celle)),
    );
    blocchi.push(righe.join("\n"));
  });

  dati.elenchi.forEach((e) => {
    const righe = [];
    if (e.titolo) righe.push(rigaCsv([e.titolo]));
    righe.push(
      rigaCsv(conLink ? ["Posizione", "Voce", "Link"] : ["Posizione", "Voce"]),
    );
    e.voci.forEach((v, i) =>
      righe.push(
        rigaCsv(
          conLink ? [i + 1, v.testo, v.link.join(" ")] : [i + 1, v.testo],
        ),
      ),
    );
    blocchi.push(righe.join("\n"));
  });

  dati.grafici.forEach((g) => {
    const righe = [];
    if (g.titolo) righe.push(rigaCsv([g.titolo]));
    righe.push(rigaCsv(["", ...g.serie.map((s) => s.nome)]));
    g.etichette.forEach((etichetta, i) =>
      righe.push(rigaCsv([etichetta, ...g.serie.map((s) => s.valori[i])])),
    );
    blocchi.push(righe.join("\n"));
  });

  return "﻿" + blocchi.join("\n\n") + "\n";
};

// ---------- JSON ----------

export const comeJson = (dati, originale, conLink) => {
  const tabelle = dati.tabelle.map((t) => ({
    titolo: t.titolo,
    intestazioni: t.intestazioni,
    righe: t.righe.map((r) => {
      const voce = { celle: r.celle };
      if (conLink && r.link.length) voce.link = r.link;
      return voce;
    }),
  }));
  const elenchi = dati.elenchi.map((e) => ({
    titolo: e.titolo,
    voci: e.voci.map((v) => {
      const voce = { testo: v.testo };
      if (conLink && v.link.length) voce.link = v.link;
      return voce;
    }),
  }));

  const uscita = {
    titolo: dati.titolo,
    pagina: dati.pagina,
    url: dati.url,
    esportatoIl: oggi(),
    riepilogo: dati.riepilogo,
    tabelle,
    elenchi,
    grafici: dati.grafici,
  };

  if (originale) {
    // Dati originali del sito, così come sono salvati nel file JSON.
    // Senza link ai percorsi, il codice HTML dei luoghi diventa testo semplice.
    const pulisciValori = (v) =>
      Array.isArray(v)
        ? v.map(pulisciValori)
        : v && typeof v === "object"
          ? Object.fromEntries(
              Object.entries(v).map(([k, x]) => [k, pulisciValori(x)]),
            )
          : conLink
            ? v
            : senzaTag(v);
    uscita.datiOriginali = {
      file: originale.file,
      dati: pulisciValori(originale.dati),
    };
  }

  return JSON.stringify(uscita, null, 2) + "\n";
};

// ---------- Nome del file ----------

export const nomeFile = (dati, estensione) => {
  const base = (dati.titolo || "dati")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/^giri-in-bici-?/, "")
    .slice(0, 60);
  return `giri-in-bici-${base || "dati"}-${oggi()}.${estensione}`;
};
