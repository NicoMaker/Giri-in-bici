const norm = (t) =>
  String(t ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
const dataIt = (valore) => {
  const iso = String(valore || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return iso ? `${iso[3]}/${iso[2]}/${iso[1]}` : String(valore || "");
};
const oggi = () => {
  const d = new Date(),
    p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};
const nomiPaesi = (codici) =>
  (codici || [])
    .map((c) => (paesi.find((p) => p.codice === c) || { nome: c }).nome)
    .join(" ");
let timer;
// ---------- finestre modali ----------
const conferma = (titolo, testo, etichetta = "Elimina") =>
  new Promise((ok) => {
    const d = $("#dlg-conferma");
    $("#conf-titolo").textContent = titolo;
    $("#conf-testo").textContent = testo;
    $("#conf-si").textContent = etichetta;
    const fine = (v) => {
      d.close();
      ok(v);
    };
    $("#conf-si").onclick = () => fine(true);
    $("#conf-no").onclick = () => fine(false);
    d.oncancel = () => ok(false);
    d.showModal();
    $("#conf-no").focus();
  });
const apriDlg = (id, titolo, idTitolo) => {
  const d = $(`#${id}`);
  d.querySelector(".err-dlg").textContent = "";
  if (titolo) $(`#${idTitolo}`).textContent = titolo;
  d.showModal();
};
document.querySelectorAll("dialog").forEach((d) => {
  d.addEventListener("click", (e) => {
    if (e.target === d) d.close();
  });
  d.querySelectorAll("[data-chiudi]").forEach((b) =>
    b.addEventListener("click", () => d.close()),
  );
});
const avvisa = (testo, errore = false) => {
  const box = $("#notifica");
  box.textContent = testo;
  box.classList.toggle("errore", errore);
  box.hidden = false;
  box.classList.remove("mostra");
  void box.offsetWidth; // riavvia la barra del tempo
  box.classList.add("mostra");
  clearTimeout(timer);
  timer = setTimeout(() => {
    box.hidden = true;
  }, 5000);
  const dlg = document.querySelector(
    "dialog[open]:not(#dlg-conferma) .err-dlg",
  );
  if (dlg && errore) dlg.textContent = testo;
  const m = $("#msg");
  m.replaceChildren(
    el("p", {
      class: errore ? "avviso" : "conferma",
      text: `${errore ? "Errore: " : "Fatto: "}${testo}`,
    }),
  );
};
const chiama = async (url, corpo, ok) => {
  const r = await api(url, corpo);
  if (!r.ok) {
    avvisa(r.errore, true);
    return null;
  }
  if (r.messaggio) avvisa(r.messaggio);
  if (ok) await ok(r);
  return r;
};
const opzioni = (sel, lista, primo) =>
  sel.replaceChildren(
    ...(primo ? [el("option", { value: "", text: primo })] : []),
    ...lista.map(([v, t]) => el("option", { value: v, text: t })),
  );

// ---------- giri ----------
let giri = [],
  stagioni = [],
  ordine = "recente";
const selBandiere = bandierePicker($("#f-luogo")),
  selLink = editorLink();
$("#f-bandiere").replaceChildren(selBandiere.nodo);
$("#f-links").replaceChildren(selLink.nodo);
const azzeraGiro = () => {
  $("#id").value = "";
  $("#f-data").value = oggi();
  $("#f-luogo").value = "";
  $("#f-km").value = "";
  selBandiere.aggiorna();
  selLink.set([]);
};
const modificaGiro = (g) => {
  $("#id").value = g.id;
  $("#f-stagione").value = g.stagione;
  $("#f-data").value = g.data;
  $("#f-luogo").value = g.luogo;
  $("#f-km").value = g.km;
  selBandiere.aggiorna();
  selLink.set(g.links);
  apriDlg("dlg-giro", "Modifica giro", "t-giro");
};
// ---------- filtri (select a scelta multipla con ricerca, ricerca testo, ordinamento, intervallo km) ----------
const multi = {}; // nome -> { opzioni:[{v,t}], sel:Set, etichetta }
const anno = (g) => g.data.slice(0, 4);
