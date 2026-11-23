"use strict";
const $ = (selettore) => document.querySelector(selettore);
const el = (tag, props = {}, ...children) => {
  const nodo = document.createElement(tag);
  for (const [chiave, valore] of Object.entries(props)) {
    if (chiave === "text") nodo.textContent = valore;
    else if (chiave === "class") nodo.className = valore;
    else if (chiave.startsWith("on")) nodo.addEventListener(chiave.slice(2), valore);
    else if (chiave === "selected") nodo.selected = Boolean(valore);
    else if (chiave === "value") nodo.value = valore;
    else nodo.setAttribute(chiave, valore);
  }
  const appendi = (figlio) => {
    if (figlio == null || figlio === false) return;
    if (Array.isArray(figlio)) return figlio.forEach(appendi);
    nodo.append(figlio instanceof Node ? figlio : document.createTextNode(String(figlio)));
  };
  children.forEach(appendi);
  return nodo;
};
const richiesta = async (url, body) => {
  const risposta = await fetch(url, body ? { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) } : {});
  const dati = await risposta.json();
  if (!risposta.ok || !dati.ok) throw new Error(dati.errore || "Operazione non riuscita.");
  return dati;
};
let giri = [];
let stagioni = [];
let statistiche = null;
let ordinamento = { campo: "data", verso: "desc" };
let timerNotifica;
const notifica = (testo, errore = false) => {
  const box = $("#notifica");
  box.textContent = testo;
  box.classList.toggle("errore", errore);
  box.hidden = false;
  clearTimeout(timerNotifica);
  timerNotifica = setTimeout(() => { box.hidden = true; }, 5000);
};
const messaggio = (testo, errore = false) => {
  const contenitore = $("#msg");
  contenitore.replaceChildren(el("p", { class: errore ? "avviso" : "conferma", text: `${errore ? "Errore: " : "Fatto: "}${testo}` }));
  contenitore.setAttribute("role", errore ? "alert" : "status");
  notifica(`${errore ? "Errore" : "Fatto"} — ${testo}`, errore);
};
const option = (valore, testo, selected = false) => el("option", { value: valore, selected, text: testo });
const dataItaliana = (iso) => {
  const match = String(iso || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : String(iso || "");
};
const dataLocaleIso = () => {
  const oggi = new Date();
  return `${oggi.getFullYear()}-${String(oggi.getMonth() + 1).padStart(2, "0")}-${String(oggi.getDate()).padStart(2, "0")}`;
};
const carica = async () => {
  const [listaGiri, listaStagioni, coloriStatistiche] = await Promise.all([
    richiesta("/api/gestione/giri"),
    richiesta("/api/gestione/stagioni"),
    richiesta("/api/gestione/statistiche-colori"),
  ]);
  giri = listaGiri.giri;
  stagioni = listaStagioni.stagioni;
  statistiche = coloriStatistiche;
  render();
  renderColoriStatistiche();
};
const chiaviStagioni = () => [...new Map(stagioni.map((s) => [s.chiave, s.etichetta])).entries()];
const ordina = (righe) => [...righe].sort((a, b) => {
  const primo = a[ordinamento.campo] ?? "";
  const secondo = b[ordinamento.campo] ?? "";
  let confronto;
  if (ordinamento.campo === "data") confronto = String(primo).localeCompare(String(secondo));
  else if (ordinamento.campo === "km") confronto = Number(primo) - Number(secondo);
  else confronto = String(primo).localeCompare(String(secondo), "it", { numeric: true, sensitivity: "base" });
  return ordinamento.verso === "asc" ? confronto : -confronto;
});
const compila = (giro) => {
  $("#id").value = giro.id;
  $("#f-stagione").value = giro.stagione;
  $("#f-data").value = giro.data;
  $("#f-luogo").value = giro.luogo;
  $("#f-link").value = giro.link;
  $("#f-km").value = giro.km;
  $("#form-giro").scrollIntoView({ behavior: "smooth", block: "start" });
  $("#f-luogo").focus({ preventScroll: true });
  notifica(`Modifica del giro del ${dataItaliana(giro.data)}: aggiorna i campi e salva.`);
};
const render = () => {
  const stagione = $("#f-stagione");
  const selezionePrecedente = stagione.value;
  stagione.replaceChildren(...chiaviStagioni().map(([valore, testo]) => option(valore, testo, valore === selezionePrecedente)));
  const colorStagione = $("#col-stagione");
  const colorePrecedente = colorStagione.value;
  colorStagione.replaceChildren(...chiaviStagioni().map(([valore, testo]) => option(valore, testo, valore === colorePrecedente)));
  const colorPeriodo = $("#col-periodo");
  const aggiornaPeriodi = () => {
    const selezionato = colorPeriodo.value;
    const periodi = stagioni.filter((s) => s.chiave === colorStagione.value);
    colorPeriodo.replaceChildren(...periodi.map((s) => option(s.periodo, s.periodo, s.periodo === selezionato)));
    const corrente = periodi.find((s) => s.periodo === colorPeriodo.value);
    if (corrente && /^#[\da-f]{6}$/i.test(corrente.colore)) $("#colore").value = corrente.colore;
  };
  colorStagione.onchange = aggiornaPeriodi;
  colorPeriodo.onchange = aggiornaPeriodi;
  aggiornaPeriodi();

  const filtro = $("#filtro").value.trim().toLocaleLowerCase("it");
  const filtrati = ordina(giri.filter((g) => `${dataItaliana(g.data)} ${g.data} ${g.etichetta} ${g.periodo} ${g.luogo} ${g.link}`.toLocaleLowerCase("it").includes(filtro)));
  const lista = $("#lista");
  if (!filtrati.length) {
    lista.replaceChildren(el("div", { class: "empty-state", text: filtro ? "Nessun giro corrisponde alla ricerca. Prova con un altro termine." : "Non ci sono giri da mostrare." }));
  } else {
    lista.replaceChildren(...filtrati.map((g) => el("article", { class: "ride" },
      el("div", { class: "ride-info" },
        el("strong", { text: `${dataItaliana(g.data)} · ${g.luogo}` }),
        el("p", { text: g.link ? "Percorso collegato" : "Nessun link percorso" }),
        el("div", { class: "ride-meta" },
          el("span", { class: "ride-tag", text: `${g.etichetta} · ${g.periodo}` }),
          el("span", { class: "ride-tag", text: `${g.km} km` }),
          g.link ? el("a", { class: "ride-tag", href: g.link, target: "_blank", rel: "noopener noreferrer", text: "Apri percorso ↗" }) : null,
        ),
      ),
      el("div", { class: "azioni" },
        el("button", { class: "btn", type: "button", text: "Modifica", onclick: () => compila(g) }),
        el("button", { class: "btn danger", type: "button", text: "Elimina", onclick: async () => {
          if (!confirm(`Eliminare il giro del ${dataItaliana(g.data)} (${g.km} km)?`)) return;
          try { const risultato = await richiesta("/api/gestione/giri/elimina", { id: g.id }); messaggio(risultato.messaggio); await carica(); }
          catch (e) { messaggio(e.message, true); }
        } }),
      ),
    )));
  }
  $("#conteggio").textContent = `${filtrati.length} di ${giri.length} giri · ordinamento per ${ordinamento.campo} (${ordinamento.verso === "asc" ? "crescente" : "decrescente"})`;
  renderPeriodi();
};
const renderColoriStatistiche = () => {
  if (!statistiche) return;
  $("#colori-anni").replaceChildren(...statistiche.anni.map((anno) => el("label", { class: "colore-stat-card" },
    el("span", { class: "etichetta", text: `Anno ${anno.anno}` }),
    el("input", { type: "color", value: anno.colore, "aria-label": `Colore statistiche ${anno.anno}`, onchange: async (e) => {
      try { const r = await richiesta("/api/gestione/statistiche/colore-anno", { anno: anno.anno, colore: e.target.value }); messaggio(r.messaggio); await carica(); }
      catch (err) { messaggio(err.message, true); }
    } }),
  )));
  $("#colori-mesi").replaceChildren(...statistiche.mesi.map((mese) => el("label", { class: "colore-stat-card" },
    el("span", { class: "etichetta", text: mese.nome }),
    el("input", { type: "color", value: mese.colore, "aria-label": `Colore mese ${mese.nome}`, onchange: async (e) => {
      try { const r = await richiesta("/api/gestione/statistiche/colore-mese", { mese: mese.nome, colore: e.target.value }); messaggio(r.messaggio); await carica(); }
      catch (err) { messaggio(err.message, true); }
    } }),
  )));
};
const renderPeriodi = () => {
  const lista = $("#lista-periodi");
  lista.replaceChildren(...chiaviStagioni().map(([chiave, etichetta]) => el("section", { class: "periodo-gruppo" },
    el("h3", { text: etichetta }),
    el("div", { class: "periodi-grid" }, stagioni.filter((s) => s.chiave === chiave).map((s) => el("article", { class: "periodo-card" },
      el("span", { class: "periodo-chip", style: `--periodo-colore:${s.colore}` }, s.periodo),
      el("button", { class: "btn danger", type: "button", text: "Elimina periodo", onclick: async () => {
        const count = giri.filter((g) => g.stagione === chiave && g.periodo === s.periodo).length;
        if (!confirm(`Eliminare ${etichetta} ${s.periodo}, il relativo HTML, JSON, le foto e ${count} giri? Le statistiche verranno aggiornate.`)) return;
        try { const result = await richiesta("/api/gestione/stagioni/elimina-periodo", { stagione: chiave, periodo: s.periodo }); messaggio(result.messaggio); await carica(); }
        catch (e) { messaggio(e.message, true); }
      } }),
    ))),
  )));
};
$("#form-giro").addEventListener("submit", async (evento) => {
  evento.preventDefault();
  try {
    const result = await richiesta("/api/gestione/giri/salva", {
      id: $("#id").value || undefined,
      stagione: $("#f-stagione").value,
      data: $("#f-data").value,
      luogo: $("#f-luogo").value,
      link: $("#f-link").value,
      km: $("#f-km").value,
    });
    messaggio(result.messaggio);
    evento.currentTarget.reset();
    $("#id").value = "";
    $("#f-data").value = dataLocaleIso();
    await carica();
  } catch (e) { messaggio(e.message, true); }
});
$("#annulla").addEventListener("click", () => {
  $("#form-giro").reset(); $("#id").value = ""; $("#f-data").value = dataLocaleIso();
  notifica("Modulo pronto per inserire un nuovo giro.");
});
$("#form-colore").addEventListener("submit", async (evento) => {
  evento.preventDefault();
  try {
    const result = await richiesta("/api/gestione/stagioni/colore", { stagione: $("#col-stagione").value, periodo: $("#col-periodo").value, colore: $("#colore").value });
    messaggio(result.messaggio); await carica();
  } catch (e) { messaggio(e.message, true); }
});
$("#filtro").addEventListener("input", render);
document.querySelectorAll("[data-ordina]").forEach((b) => b.addEventListener("click", () => {
  const campo = b.dataset.ordina;
  ordinamento = { campo, verso: ordinamento.campo === campo && ordinamento.verso === "asc" ? "desc" : "asc" };
  document.querySelectorAll("[data-ordina]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
  render();
}));
$("#f-data").value = dataLocaleIso();
carica().catch((e) => messaggio(e.message, true));
