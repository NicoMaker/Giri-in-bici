# Giri in Bici — gestionale locale

Guida per usare e modificare il gestionale di giri, stagioni, statistiche, utenti e bandiere. I dati restano nei file del repository: l'interfaccia li legge e li aggiorna tramite il server Node locale.

## Avvio

Serve Node.js 18 o successivo. Dalla cartella principale del repository:

```bash
node scripts/server.js
```

Apri l'indirizzo mostrato nel terminale, normalmente <http://localhost:3000>. Per fermare il gestionale, interrompi il processo con `Ctrl+C`.

Opzioni disponibili:

```bash
node scripts/server.js --porta=4000       # usa la porta 4000; se occupata prova la successiva
node scripts/server.js --prova            # abilita la modalità prova, che impedisce i salvataggi
node scripts/server.js --senza-browser    # non apre automaticamente una finestra del browser
```

Il servizio è pensato per il computer dell'utente e per la rete locale. Non pubblicarlo su Internet e non inoltrare la porta del gestionale.

## Inserire, modificare ed eliminare giri

- **Inserimento** apre il flusso guidato per aggiungere giri, foto, stagioni o dati statistici.
- **Archivio giri** permette di cercare, ordinare, filtrare, creare, modificare ed eliminare le corse già registrate.
- Prima di una scrittura, controlla l'anteprima o il riepilogo e conferma esplicitamente. Le eliminazioni richiedono una conferma separata.
- Scrivere nei campi non modifica subito i file. Il server salva soltanto dopo la conferma; quando un giro cambia, aggiorna insieme anche i chilometri e il numero di corse delle statistiche interessate.
- I campi data dell'inserimento e dell'archivio usano il selettore nativo del browser. Le conferme e le date mostrate nell'archivio usano il formato italiano **gg/mm/aaaa** (per esempio `07/04/2026`); il server controlla che la data esista davvero. I JSON continuano a usare il formato storico già previsto dal sito pubblico, per esempio `07 Aprile` nel file del periodo.

## Bandiere: scegliere o crearne una

Nel campo **Luogo**, posiziona il cursore dove deve apparire la bandiera:

1. Scegli dal menu una bandiera già disponibile: il catalogo comprende le bandiere standard e quelle personalizzate salvate in precedenza.
2. Per aggiungerne una, apri **Crea una bandiera personalizzata**, inserisci il nome visibile e trascina un'immagine nell'area oppure selezionala dal dispositivo.
3. Sono accettati PNG, JPG/JPEG e WebP fino a 5 MB. Premi **Carica e usa bandiera**: il server verifica il file, registra la bandiera e la inserisce nel punto del testo in cui si trova il cursore.

Le immagini personalizzate vengono salvate in `Img/Icons/`; il catalogo con codice, nome e file è `json/Bandiere-personalizzate.json`. Le bandiere caricate restano selezionabili nelle corse successive. Il codice nel testo del luogo mantiene la compatibilità con i JSON e con il sito pubblico.

## Filtri e altre sezioni

I filtri di stagioni, anni e mesi partono con tutte le voci selezionate, così la pagina mostra tutti i dati. Puoi restringere i risultati con la ricerca e le selezioni; **Seleziona tutte** e **Deseleziona tutto** agiscono sulle voci disponibili nel filtro. Il menu include inoltre utenti, colori e periodi: ogni modifica mostra un esito e, quando serve, chiede conferma.

## Dove sono i dati

- Giri, stagioni, statistiche e catalogo delle bandiere: `json/`.
- Immagini del sito e bandiere personalizzate: `Img/` (le nuove bandiere sono in `Img/Icons/`).
- Modelli e operazioni guidate: `scripts/nuovo/programma/` e `scripts/nuovo/azioni/`.
- La struttura e i nomi dei JSON sono mantenuti per non interrompere il sito pubblico.

Fai una copia di sicurezza dei JSON e delle immagini prima di interventi manuali. Per le modifiche normali usa il gestionale, non modificare i dati mentre il server è in funzione.

## Struttura dei sorgenti

L'HTML di `scripts/nuovo/www/index.html` è il punto d'ingresso e resta separato dai fogli di stile e dagli script. I sorgenti JavaScript e CSS del gestionale sono organizzati in file funzionali sotto le 150 righe, con nomi descrittivi e senza prefissi numerici. I moduli server e gli asset del browser vengono assemblati tramite elenchi espliciti in `carica-modulo.js` e `server/risorse.js`, così l'ordine delle dipendenze non dipende dall'ordinamento alfabetico dei file. Per aggiungere un modulo, usa un nome che descriva la sua responsabilità e aggiungilo all'elenco appropriato.

- `scripts/nuovo/www/app/`: flusso guidato, controlli condivisi, selettori ricercabili, bandiere e link.
- `scripts/nuovo/www/gestione/`: archivio giri, filtri, utenti, colori, periodi e finestre di conferma.
- `scripts/nuovo/www/stili/`: CSS per tema, testata, layout, campi, caricamenti, risultati, elenchi, gestione e responsive.
- `scripts/nuovo/base/impostazioni/`, `base/luogo/`, `calcoli/giri-e-statistiche/` e `azioni/stagione/`: configurazione, luoghi e bandiere, date/statistiche e creazione stagioni.
- `scripts/nuovo/server/api/`, `server/gestione/` e `server/server/`: richieste HTTP, validazione e operazioni sui dati, sicurezza della rete locale e avvio del server.
- `scripts/nuovo/carica-modulo.js`: riunisce i frammenti server mantenendo i percorsi e le esportazioni dei moduli esistenti. `server/risorse.js` assembla gli asset del browser.

Le modifiche a giri, utenti, periodi, statistiche e bandiere sono eseguite e validate dal server; il browser invia richieste API e mostra il risultato, ma non scrive i JSON direttamente. Per aggiungere una nuova operazione, collega l'interfaccia a un endpoint in `server/` e conserva validazione e scrittura sul server.

Il progetto pubblico è disponibile su [giri-in-bici.netlify.app](https://giri-in-bici.netlify.app/).
