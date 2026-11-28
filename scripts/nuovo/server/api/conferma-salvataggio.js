const conferma = (azione, dati) => {
  const lavoro = coda.then(async () => {
    if (PROVA)
      throw new ErroreDati("Modalità --prova: non scrivo nessun file.");
    const piano = await costruisciPiano(azione, dati);
    piano.scrivi();
    try {
      require("../base/readme-automatico").aggiornaReadme();
    } catch (e) {
      console.error(`Readme non aggiornato: ${e.message}`);
    }
    pulisciCaricamenti(dati && dati.sid, dati && dati.iconaSid);
    return { ok: true, ...riepilogo(piano) };
  });
  coda = lavoro.catch(() => {});
  return lavoro;
};

module.exports = {
  ErroreDati,
  MAX_FOTO,
  anteprima,
  conferma,
  elenco,
  salvaCaricamento,
  spazzaCaricamenti,
  stato,
};
