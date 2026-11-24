# Gestione dati in locale

Dalla radice del progetto avvia l'interfaccia con `node scripts/server.js`. Si apre su `http://localhost:3000` (con `--prova` non scrive nulla).

La pagina è un unico file: `scripts/nuovo/www/index.html` (HTML, CSS e JavaScript insieme).

Sezioni della pagina:

- **Inserimento**: casi raggruppati per categoria — _Giri_ (aggiungi giro con bandiere e più link con titolo), _Statistiche_ (mese, anno), _Stagioni e foto_.
- **Archivio giri**: modifica/elimina giri, con la stessa logica dei filtri del sito: select a scelta multipla con ricerca (Stagione, Anno, Paese), ricerca testo, 6 ordinamenti, intervallo km con MIN/MAX e reset (solo pulsanti, solo ricerca, entrambi).
- **Utenti**: aggiungi, modifica, elimina gli utenti di `json/About_US/Users.json`, con ricerca.
- **Colori e periodi**: colori di periodi, anni e mesi; eliminazione periodi, con ricerca.

Dal telefono sulla stessa rete Wi-Fi apri `http://IP-LOCALE:3000` (indirizzo stampato nel terminale). Il server accetta solo localhost o rete privata; interrompilo con Ctrl+C.

Tutte le select della pagina (stagione, anno, mese, periodo, paese, bandiere…) hanno la ricerca interna: apri la select e scrivi per filtrare le opzioni.

Inserimento ed eliminazione si fanno in finestre modali (Nuovo giro, Nuovo utente, Cambia colore, conferma di eliminazione), così la pagina occupa meno spazio. Le bandiere stanno nel testo del luogo (`Bled {SI}`) e sono immagini in `Img/Icons/`: se manca il file, il programma lo crea.
