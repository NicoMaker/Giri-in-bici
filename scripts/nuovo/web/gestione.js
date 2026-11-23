"use strict";
const $ = (selettore) => document.querySelector(selettore);
const el = (tag, props = {}, ...children) => {
  const nodo = document.createElement(tag);
  for (const [chiave, valore] of Object.entries(props)) {
    if (chiave === "text") nodo.textContent = valore;
    else if (chiave === "class") nodo.className = valore;
    else if (chiave.startsWith("on")) nodo.addEventListener(chiave.slice(2), valore);
    else if (chiave === "selected") nodo.selected = Boolean(valore);
    else nodo.setAttribute(chiave, valore);
  }
  children.flat().filter((figlio) => figlio != null).forEach((figlio) => nodo.append(figlio.nodeType ? figlio : document.createTextNode(String(figlio))));
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
const messaggio = (testo, errore = false) => $("#msg").replaceChildren(el("p", { class: errore ? "avviso" : "conferma", text: testo }));
const option = (valore, testo, selected = false) => el("option", { value: valore, selected, text: testo });
const carica = async () => {
  const [listaGiri, listaStagioni] = await Promise.all([richiesta("/api/gestione/giri"), richiesta("/api/gestione/stagioni")]);
  giri = listaGiri.giri;
  stagioni = listaStagioni.stagioni;
  render();
};
const chiaviStagioni = () => [...new Map(stagioni.map((s) => [s.chiave, s.etichetta])).entries()];
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

  const query = $("#filtro").value.trim().toLocaleLowerCase("it");
  const filtrati = giri.filter((g) => `${g.data} ${g.etichetta} ${g.periodo} ${g.luogo}`.toLocaleLowerCase("it").includes(query));
  $("#lista").replaceChildren(...filtrati.map((g) => el("article", { class: "ride" },
    el("div", {}, el("strong", { text: `${g.data} · ${g.luogo}` }), el("p", { text: `${g.etichetta} ${g.periodo} · ${g.km} km${g.link ? " · link presente" : ""}` })),
    el("div", { class: "azioni" },
      el("button", { class: "btn", type: "button", text: "Modifica", onclick: () => compila(g) }),
      el("button", { class: "btn danger", type: "button", text: "Elimina", onclick: async () => {
        if (!confirm(`Eliminare il giro del ${g.data} (${g.km} km)?`)) return;
        try { const risultato = await richiesta("/api/gestione/giri/elimina", { id: g.id }); messaggio(risultato.messaggio); await carica(); }
        catch (e) { messaggio(e.message, true); }
      } }),
    ),
  )));
  $("#conteggio").textContent = `${filtrati.length} giri`;
};
const compila = (giro) => {
  $("#id").value = giro.id;
  $("#f-stagione").value = giro.stagione;
  $("#f-data").value = giro.data;
  $("#f-luogo").value = giro.luogo;
  $("#f-link").value = giro.link;
  $("#f-km").value = giro.km;
  $("#form-giro").scrollIntoView({ behavior: "smooth", block: "start" });
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
    $("#f-data").value = new Date().toISOString().slice(0, 10);
    await carica();
  } catch (e) { messaggio(e.message, true); }
});
$("#annulla").addEventListener("click", () => {
  $("#form-giro").reset();
  $("#id").value = "";
  $("#f-data").value = new Date().toISOString().slice(0, 10);
});
$("#form-colore").addEventListener("submit", async (evento) => {
  evento.preventDefault();
  try {
    const result = await richiesta("/api/gestione/stagioni/colore", {
      stagione: $("#col-stagione").value,
      periodo: $("#col-periodo").value,
      colore: $("#colore").value,
    });
    messaggio(result.messaggio);
    await carica();
  } catch (e) { messaggio(e.message, true); }
});
$("#filtro").addEventListener("input", render);
$("#f-data").value = new Date().toISOString().slice(0, 10);
carica().catch((e) => messaggio(e.message, true));
