const controllaCoerenza = (piano, anno, mese, kmMeseAnno) => {
  const { km, giri } = kmDaiGiri(piano, anno, mese);
  if (km !== kmMeseAnno) {
    piano.avvisi.push(
      `${MESI[mese]} ${anno}: nelle statistiche ci sono ${kmMeseAnno} km, ma i giri salvati (${giri}) ne sommano ${km}. Può essere una differenza che c'era già: controlla.`,
    );
  }
};

module.exports = {
  leggiData,
  periodoDelGiro,
  annoDelGiroInPeriodo,
  ordineNelPeriodo,
  leggiDataSalvata,
  oggettiDellArray,
  inserisciGiro,
  kmDaiGiri,
  aggiornaAnno,
  controllaCoerenza,
};
