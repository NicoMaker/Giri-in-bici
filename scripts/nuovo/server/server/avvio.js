const avvia = () => {
  if (
    !fs.existsSync(path.join(RADICE, "json/Statistiche/History/Storico.json"))
  ) {
    console.error(`\n❌ Non sembra la cartella di Giri in Bici: ${RADICE}`);
    console.error(
      "   Manca json/Statistiche/History/Storico.json.\n" +
        "   Avvia il server dalla cartella principale del progetto (quella con le cartelle json e scripts):\n" +
        "       node scripts/server.js\n" +
        "   oppure indica la cartella a mano:\n" +
        "       node scripts/server.js --radice=/percorso/Giri-in-bici\n",
    );
    process.exit(1);
  }
  api.spazzaCaricamenti();
  if (!argomenti.includes("--prova")) {
    try {
      require("../base/readme-automatico").aggiornaReadme();
    } catch (e) {
      console.error(`Readme non aggiornato: ${e.message}`);
    }
  }
  try {
    gestione.sincronizzaBandiere();
  } catch (e) {
    console.error(`Catalogo bandiere non sincronizzato: ${e.message}`);
  }
  monitor.avvia(gestione.sincronizzaBandiere);
  const base = parseInt(opzione("porta") || process.env.PORT || "3000", 10);
  let porta = base;
  const server = http.createServer((req, res) =>
    gestisci(req, res).catch((e) => {
      if (!res.headersSent) res.writeHead(500);
      res.end(String(e.message));
    }),
  );
  server.on("error", (e) => {
    if (e.code === "EADDRINUSE" && porta < base + 20) {
      porta++;
      server.listen(porta, "0.0.0.0");
    } else {
      console.error(`Impossibile avviare il server: ${e.message}`);
      process.exit(1);
    }
  });
  server.on("listening", () => {
    console.log(
      `\n🚴 Giri in Bici — interfaccia web${argomenti.includes("--prova") ? " (modalità prova)" : ""}`,
    );
    console.log(
      `📊 Gestionale Giri in Bici avviato → http://localhost:${porta}`,
    );
    console.log(
      "🌐 IP Pubblico: non esposto (interfaccia limitata alla rete locale)",
    );
    ipv4Locali().forEach((ip) =>
      console.log(`🏠 IP Locale:   http://${ip}:${porta}`),
    );
    console.log(`📍 Localhost:   http://localhost:${porta}`);
    console.log("\n--------------------------------------");
    console.log(
      "Da telefono collegato alla stessa rete Wi-Fi, apri l'indirizzo IP Locale.",
    );
    console.log("Per fermare il server: Ctrl+C\n");
  });
  server.listen(porta, "0.0.0.0");
};
avvia();
