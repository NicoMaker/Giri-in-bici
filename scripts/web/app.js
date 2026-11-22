"use strict";

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// ---------- Tabs ----------
$$(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    $$(".tab").forEach((t) => t.classList.remove("attivo"));
    $$(".pannello").forEach((p) => p.classList.remove("attivo"));
    tab.classList.add("attivo");
    $(`#tab-${tab.dataset.tab}`).classList.add("attivo");
  });
});

// ---------- API ----------
const api = async (azione, body) => {
  const r = await fetch(`/api/${azione}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const dati = await r.json();
  if (!r.ok) throw new Error(dati.errore || "Errore sconosciuto");
  return dati;
};

// ---------- Mostra risultato ----------
const mostra = (el, testo, errore = false) => {
  el.textContent = testo;
  el.classList.toggle("errore", errore);
  el.classList.toggle("ok", !errore);
  el.scrollIntoView({ behavior: "smooth", block: "nearest" });
};

// ---------- Stato e popolamento select ----------
let stato = null;

const caricaStato = async () => {
  const r = await fetch("/api/stato");
  if (!r.ok) throw new Error("Impossibile leggere lo stato del progetto.");
  stato = await r.json();

  // anni
  const selAnno = $("#sel-anno-mese");
  selAnno.innerHTML = "";
  stato.anni.forEach((a) => {
    const o = document.createElement("option");
    o.value = a;
    o.textContent = a;
    selAnno.appendChild(o);
  });
  if (stato.anni.length) selAnno.value = stato.anni[stato.anni.length - 1];

  // stagioni foto
  const selS = $("#sel-stagione-foto");
  selS.innerHTML = "";
  ["Primavera", "Estate", "Autunno_Inverno"].forEach((k) => {
    const o = document.createElement("option");
    o.value = k;
    o.textContent = k === "Autunno_Inverno" ? "Autunno-Inverno" : k;
    selS.appendChild(o);
  });
  aggiornaPeriodiFoto();
};

const aggiornaPeriodiFoto = () => {
  const stagione = $("#sel-stagione-foto").value;
  const selP = $("#sel-periodo-foto");
  selP.innerHTML = "";
  const periodi = stato?.stagioni?.[stagione]?.periodi || [];
  periodi.forEach((p) => {
    const o = document.createElement("option");
    o.value = p;
    o.textContent = p;
    selP.appendChild(o);
  });
};

$("#sel-stagione-foto")?.addEventListener("change", aggiornaPeriodiFoto);

// ---------- Helper submit ----------
const collegaForm = (idForm, idRis, azione, trasforma) => {
  const form = $(idForm);
  if (!form) return;
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = form.querySelector("button");
    const ris = $(idRis);
    btn.disabled = true;
    ris.textContent = "";
    ris.classList.remove("errore", "ok");
    try {
      const fd = new FormData(form);
      const body = trasforma ? trasforma(fd) : Object.fromEntries(fd);
      const r = await api(azione, body);
      mostra(ris, r.output || "✔ Operazione completata.");
      await caricaStato();
    } catch (err) {
      mostra(ris, `✖ ${err.message}`, true);
    } finally {
      btn.disabled = false;
    }
  });
};

// ---------- Form ----------
collegaForm("#form-giro", "#ris-giro", "giro");

collegaForm("#form-mese", "#ris-mese", "mese", (fd) => ({
  anno: fd.get("anno"),
  mese: fd.get("mese"),
  km: parseInt(fd.get("km"), 10),
  corse: parseInt(fd.get("corse"), 10) || 0,
  sostituisci: fd.get("sostituisci") === "on",
}));

collegaForm("#form-stagione", "#ris-stagione", "stagione");

collegaForm("#form-anno", "#ris-anno", "anno");

collegaForm("#form-foto", "#ris-foto", "foto");

// ---------- avvio ----------
caricaStato().catch((e) => console.error(e));