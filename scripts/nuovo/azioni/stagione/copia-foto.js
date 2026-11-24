  // 5. foto: copiate come 1.jpg, 2.jpg... (così i blocchi della galleria puntano a file veri)
  if (d.fotoDaCopiare && d.fotoDaCopiare.length) {
    const img = cartellaImg();
    d.fotoDaCopiare.forEach((origine, i) => {
      piano.creaBinario(
        `${img}/${s.cartella}/${d.periodo}/${i + 1}.jpg`,
        fs.readFileSync(origine),
      );
    });
  } else if (d.nFoto > 0) {
    piano.cartella(`${cartellaImg()}/${s.cartella}/${d.periodo}`);
    piano.promemoria.push(
      `Aggiungi le ${d.nFoto} foto in ${cartellaImg()}/${s.cartella}/${d.periodo}/ (1.jpg … ${d.nFoto}.jpg)`,
    );
  } else {
    piano.promemoria.push(
      `Quando hai le foto: ${cartellaImg()}/${s.cartella}/${d.periodo}/1.jpg, 2.jpg… e un blocco <a class="shot"> per ognuna nella pagina ${s.cartella}/${d.periodo}.html`,
    );
  }
};

module.exports = {
  costruisciGalleria,
  contaGiroInStatistiche,
  applicaStagione,
};
