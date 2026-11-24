# Giri in Bici

Guida pratica per aggiungere e correggere giri, stagioni, statistiche e bandiere senza modificare i file a mano.

## Avviare il gestionale

Serve Node.js 18 o successivo. Dalla cartella principale del repository avvia:

```bash
node scripts/server.js
```

Il gestionale si apre su <http://localhost:3000>. Per interromperlo, torna alla finestra del server e premi `Ctrl+C`.

Opzioni utili:

```bash
node scripts/server.js --porta=4000       # usa la porta 4000 (o la successiva libera)
node scripts/server.js --prova            # prova le anteprime senza consentire modifiche ai dati
node scripts/server.js --senza-browser    # avvia il server senza aprire automaticamente il browser
```

Per proteggere i dati, tieni il server sul computer o sulla rete locale: non pubblicarlo su Internet e non inoltrare la porta del gestionale.

## Inserire o correggere un giro

1. Apri **Inserimento** per aggiungere una corsa oppure **Archivio giri** per correggere o rimuovere una corsa già presente.
2. Compila i campi e controlla la bandiera, il luogo, il link e i chilometri.
3. Nel modulo di inserimento guidato, usa **Anteprima** e controlla il riepilogo prima di confermare. Nell'archivio, dopo aver premuto **Crea giro** o **Salva modifiche**, controlla la finestra di conferma.
4. I dati non vengono salvati mentre scrivi: vengono aggiornati solo dopo la conferma esplicita. Le eliminazioni chiedono una conferma separata.

Quando il giro viene confermato, il gestionale aggiorna il periodo e le statistiche del mese e dell'anno corrispondenti. Se trova dati mancanti o incoerenti, mostra un avviso prima di procedere.

## Scegliere o aggiungere una bandiera

Nel campo **Luogo**, posiziona il cursore nel punto in cui vuoi aggiungere la bandiera:

- scegli una bandiera già disponibile dal menu; il codice viene inserito nel luogo e la bandiera compare nell'anteprima;
- per una nuova bandiera, apri **Crea una bandiera personalizzata**, scrivi il nome che vuoi mostrare, poi trascina un'immagine nell'area oppure selezionala dal dispositivo;
- sono accettati file PNG, JPG/JPEG e WebP fino a 5 MB. Premi **Carica e usa bandiera** per salvarla e inserirla nel luogo.

L'immagine viene collocata in `Img/Icons/` con un nome file sicuro; il nome visibile e il collegamento al file vengono registrati in `json/Bandiere-personalizzate.json`. La bandiera sarà disponibile anche nelle corse successive. Se il nome è già usato, scegline uno diverso.

## Filtri e visualizzazione

Nelle pagine di classifica, i filtri partono con tutte le stagioni, gli anni e i mesi selezionati: così vengono mostrati tutti i dati. Puoi restringere i risultati deselezionando le voci che non ti interessano; **Seleziona tutte** e **Deseleziona tutto** agiscono sulle voci visibili nella ricerca del filtro.

## Altre operazioni

Dal menu puoi anche aggiungere o correggere i chilometri di un mese, caricare foto, creare una nuova stagione o preparare un nuovo anno di statistiche. Per queste operazioni il gestionale mostra un riepilogo e chiede conferma prima di scrivere i file.

## Dove vengono salvati i dati

- Dati di giri, periodi e statistiche: cartella `json/`.
- Immagini delle bandiere personalizzate: cartella `Img/Icons/`.
- Pagina del gestionale: `scripts/nuovo/www/index.html`.
- Stili e interazioni del gestionale: `scripts/nuovo/www/styles.css`, `scripts/nuovo/www/app.js` e `scripts/nuovo/www/gestione.js`.

Il progetto pubblico è disponibile su [giri-in-bici.netlify.app](https://giri-in-bici.netlify.app/).
