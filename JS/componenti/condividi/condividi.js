// condividi.js — Il blocco "Condividi i dati" del menu, presente su ogni pagina.
//
// Quattro modi per portare fuori i dati che la pagina mostra:
//   Condividi    foglio di condivisione del telefono/computer (WhatsApp, mail...)
//   Copia testo  negli appunti, pronto da incollare
//   Scarica CSV  per Excel / Fogli Google
//   Scarica JSON per chi vuole i dati grezzi
//
// L'unica impostazione è "Includi i link ai percorsi": spenta di base, perché
// i link Komoot sono personali. La scelta viene ricordata su questo dispositivo.
//
// Markup e classi: css/assets/componenti/layout/struttura/condividi.css

import { estraiPagina, haDati, leggiOriginale } from "./estrai.js";
import { comeTesto, comeCsv, comeJson, nomeFile } from "./formati.js";

const CHIAVE = "gib:condividi:link";

const leggiScelta = () => {
  try {
    return window.localStorage.getItem(CHIAVE) === "1";
  } catch (e) {
    return false;
  }
};
const salvaScelta = (valore) => {
  try {
    window.localStorage.setItem(CHIAVE, valore ? "1" : "0");
  } catch (e) {
    /* modalità privata: la scelta vale solo per questa visita */
  }
};

// ---------- Avviso a comparsa ----------

let timerAvviso = 0;
const avvisa = (messaggio) => {
  let el = document.getElementById("condividiAvviso");
  if (!el) {
    el = document.createElement("div");
    el.id = "condividiAvviso";
    el.className = "condividi-avviso";
    el.setAttribute("role", "status");
    el.setAttribute("aria-live", "polite");
    document.body.appendChild(el);
  }
  el.textContent = messaggio;
  // forza il ricalcolo così la transizione riparte anche a messaggi ravvicinati
  el.classList.remove("visibile");
  void el.offsetWidth;
  el.classList.add("visibile");
  clearTimeout(timerAvviso);
  timerAvviso = setTimeout(() => el.classList.remove("visibile"), 2800);
};

// ---------- Azioni ----------

const copiaNegliAppunti = async (testo) => {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(testo);
    return;
  }
  // Pagina aperta senza HTTPS: via di riserva
  const campo = document.createElement("textarea");
  campo.value = testo;
  campo.setAttribute("readonly", "");
  campo.style.cssText = "position:fixed;top:-1000px;opacity:0";
  document.body.appendChild(campo);
  campo.select();
  const ok = document.execCommand("copy");
  campo.remove();
  if (!ok) throw new Error("copia non riuscita");
};

const scarica = (contenuto, nome, tipo) => {
  const blob = new Blob([contenuto], { type: tipo });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nome;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const datiOAvviso = () => {
  const dati = estraiPagina();
  if (!haDati(dati)) {
    avvisa("In questa pagina non ci sono dati da condividere");
    return null;
  }
  return dati;
};

const azioni = {
  async condividi(conLink) {
    const dati = datiOAvviso();
    if (!dati) return;
    try {
      await navigator.share({
        title: dati.titolo,
        text: comeTesto(dati, conLink),
        url: dati.url,
      });
    } catch (errore) {
      // Chiudere il foglio di condivisione non è un errore
      if (errore && errore.name !== "AbortError") {
        avvisa("Non sono riuscito ad aprire la condivisione");
      }
    }
  },

  async copia(conLink) {
    const dati = datiOAvviso();
    if (!dati) return;
    try {
      await copiaNegliAppunti(comeTesto(dati, conLink));
      avvisa("Dati copiati negli appunti");
    } catch (errore) {
      avvisa("Non sono riuscito a copiare i dati");
    }
  },

  async csv(conLink) {
    const dati = datiOAvviso();
    if (!dati) return;
    scarica(
      comeCsv(dati, conLink),
      nomeFile(dati, "csv"),
      "text/csv;charset=utf-8",
    );
    avvisa("File CSV scaricato");
  },

  async json(conLink) {
    const dati = datiOAvviso();
    if (!dati) return;
    const originale = await leggiOriginale();
    scarica(
      comeJson(dati, originale, conLink),
      nomeFile(dati, "json"),
      "application/json;charset=utf-8",
    );
    avvisa("File JSON scaricato");
  },
};

// ---------- Il blocco nel menu ----------

const pulsante = (azione, icona, etichetta) =>
  `<button type="button" data-azione="${azione}"><span class="ico-tile" data-icona="${icona}"></span><span>${etichetta}</span></button>`;

export const creaCondividi = () => {
  const blocco = document.createElement("section");
  blocco.className = "menu-condividi";
  blocco.setAttribute("aria-labelledby", "condividiTitolo");
  blocco.innerHTML = `
    <h1 id="condividiTitolo">Condividi i dati</h1>
    <p class="condividi-nota">I dati che stai vedendo in questa pagina.</p>
    <label class="condividi-opzione">
      <input type="checkbox" id="condividiLink" />
      <span>Includi i link ai percorsi</span>
    </label>
    <div class="condividi-azioni">
      ${pulsante("condividi", "condividi", "Condividi")}
      ${pulsante("copia", "copia", "Copia testo")}
      ${pulsante("csv", "scarica", "Scarica CSV")}
      ${pulsante("json", "scarica", "Scarica JSON")}
    </div>`;

  const casella = blocco.querySelector("#condividiLink");
  casella.checked = leggiScelta();
  casella.addEventListener("change", () => salvaScelta(casella.checked));

  // Dove il browser non ha il foglio di condivisione resta "Copia testo"
  if (typeof navigator.share !== "function") {
    blocco.querySelector('[data-azione="condividi"]').hidden = true;
  }

  blocco.addEventListener("click", (ev) => {
    const bottone = ev.target.closest("button[data-azione]");
    if (!bottone) return;
    const azione = azioni[bottone.dataset.azione];
    if (azione) azione(casella.checked);
  });

  if (window.Icone) window.Icone.riempi(blocco);
  return blocco;
};
