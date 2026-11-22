# 📋 Aggiornamenti e Manutenzione

Questa guida descrive come aggiornare i file e creare nuove stagioni e anni per mantenere il sito sempre aggiornato.

---

## 🚴 Aggiungere un Giro (il caso più frequente)

Quando fai un giro basta dire: **data, stagione, luogo, link al percorso e km**, ad esempio:

> *Il 22 Novembre 2026, Autunno-Inverno, ho fatto un giro di 95 km a Pinzano, link: https://www.komoot.com/...*

Da terminale (scegli la voce **Aggiungere un GIRO** e rispondi alle domande):

```bash
node scripts/nuovo.js
```

oppure in una riga sola:

```bash
node scripts/nuovo.js --giro --stagione=Autunno_Inverno --data="22 Novembre 2026" \
     --km=95 --luogo="Pinzano" --link="https://www.komoot.com/..."
```

(`--stagione` accetta `Primavera`, `Estate`, `Autunno_Inverno`; la data si può scrivere `22 Novembre`, `22 Novembre 2026` o `22/11/2026`; senza anno usa quello di oggi; `--si` salta la conferma finale, `--prova` mostra cosa farebbe senza scrivere.)

Lo script fa **tutto insieme**, senza toccare il resto dei file:

1. aggiunge il giro nel JSON del periodo giusto (es. [`json/Autunno_Inverno/Periodi/2026-2027.json`](json/Autunno_Inverno/Periodi/2026-2027.json)), **in ordine di data**, con il link al percorso;
2. **somma i km** nel mese giusto dell'**anno giusto** ([`json/Statistiche/anni/2026.json`](json/Statistiche/anni/2026.json)); se quel mese non c'è ancora **lo crea** al posto giusto del calendario;
3. **aumenta di 1 le corse** dell'anno (`numberOfRaces`).

Come sceglie il periodo e l'anno: Primavera/Estate → l'anno della data; Autunno-Inverno → da Settembre a Dicembre è il primo anno del biennio, da Gennaio in poi il secondo (Gennaio 2027 → periodo `2026-2027`, statistiche del `2027`). Se il periodo o l'anno non esistono ancora si ferma senza scrivere nulla e ti dice cosa creare prima.

Prima di scrivere mostra la frase di riepilogo ("Il giorno 22 Novembre 2026 hai fatto un giro di 95 km…"), i km del mese prima → dopo e le corse prima → dopo, e avvisa se la data è nel futuro, se esiste già un giro uguale o se i km del mese non coincidono con la somma dei giri.

Per aggiungere o correggere **solo un mese** di un anno (anche se non c'è) usa la voce **Aggiungere o correggere un MESE**.

---

## ⚡ Creazione Guidata da Terminale

Tutti i passaggi qui sotto (nuova stagione e nuovo anno) si possono fare in automatico con uno script guidato. Serve solo [Node.js](https://nodejs.org), nessuna libreria:

```bash
node scripts/nuovo.js            # menu guidato
node scripts/nuovo.js --prova    # mostra cosa farebbe, senza scrivere nulla
```

Il menu offre: **giro**, **mese**, **nuova stagione** 🌸🌞🍁❄️, **nuovo anno di Statistiche** 📅, **nuovo anno completo** (Statistiche + Primavera + Estate + Autunno-Inverno insieme).

- **Il colore lo scegli sempre tu**: lo script non ne suggerisce nessuno. Ti mostra i colori già usati e tu scrivi un nome CSS (es. `gold`, `teal`) oppure un esadecimale (es. `#ff0060`). Un colore non valido o già usato viene segnalato.
- **Stagione**: crea la pagina HTML (copia dell'ultimo periodo con il nuovo anno), il JSON del periodo con un solo giro d'esempio (o il primo giro che inserisci tu), aggiorna `generale.json` (`subPeriods` e `colors`) e `stagioni.json`.
- **Foto della stagione**: se trascini la cartella con le foto `.jpg` le copia come `1.jpg`, `2.jpg`… in `Img/<Stagione>/<periodo>/` e costruisce nella pagina un blocco galleria per ognuna, con i percorsi e i testi `alt` giusti. Se salti, puoi indicare quante foto avrai (blocchi pronti) oppure lasciare la sezione vuota.
- **Foto in una stagione già esistente**: voce **Aggiungere FOTO** del menu → scegli stagione e periodo, trascini la cartella con i `.jpg`: le copia in `Img/<Stagione>/<periodo>/` continuando la numerazione (non sovrascrive mai le foto già presenti) e aggiunge i blocchi alla galleria della pagina.
- **Anno**: crea la pagina, il JSON dell'anno e aggiorna `Storico.json` (`anni` e `coloriAnni`). Puoi inserire subito il primo mese (anche non Gennaio).
- **Icona (favicon) dell'anno**: se indichi un'immagine `.jpg` la copia in `Img/Statistiche/Anni/<anno>.jpg`; altrimenti **la crea lo script** (`<anno>.png`: l'anno scritto sul colore scelto) e il link `rel="icon"` della pagina punta già al file giusto. Se poi preferisci una tua foto: salvala come `<anno>.jpg` nella stessa cartella e nella pagina cambia `.png` in `.jpg` nel link dell'icona.

Prima di scrivere mostra un riepilogo e chiede conferma; se un file esiste già o un JSON non è valido si ferma senza toccare niente. Nei JSON esistenti viene aggiunta solo la riga nuova, il resto non viene riformattato.

---

## 🗓 Inizio di una Nuova Stagione

### Creazione della Nuova Stagione

### Passaggi da Seguire

1. **Struttura HTML**

   Crea il file HTML per la stagione nelle cartelle di riferimento, seguendo il percorso indicato, e inserendo l'anno della stagione:
   - **Primavera** 🌸: [`Primavera/`](Primavera/)
   - **Estate** 🌞: [`Estate/`](Estate/)
   - **Autunno Inverno** 🍁❄️: [`Autunno_Inverno/`](Autunno_Inverno/)

2. **File JSON per la Nuova Stagione**

   Crea un file JSON per la nuova stagione all'interno della cartella di riferimento con il nome dell'anno:
   - **Primavera** 🌸: [`json/Primavera/Periodi/`](json/Primavera/Periodi/)
   - **Estate** 🌞: [`json/Estate/Periodi/`](json/Estate/Periodi/)
   - **Autunno Inverno** 🍁❄️: [`json/Autunno_Inverno/Periodi/`](json/Autunno_Inverno/Periodi/)

3. **Aggiornamento del File Principale della Stagione 🌸🌞🍁❄️**

   Aggiorna il file principale del nuovo periodo nella stagione in cui hai creato la nuova sottostagione, specificando il percorso del file con il nome e il colore del nuovo periodo come fatto per gli altri. Il percorso da inserire nel campo `subPeriods` deve puntare al file JSON reale sotto `json/`:
   - **Primavera** 🌸: [`json/Primavera/generale.json`](json/Primavera/generale.json)
   - **Estate** 🌞: [`json/Estate/generale.json`](json/Estate/generale.json)
   - **Autunno Inverno** 🍁❄️: [`json/Autunno_Inverno/generale.json`](json/Autunno_Inverno/generale.json)

4. **Sistemazione file Stagioni.json**
   - **Stagione Generale** 🌸🌞🍁❄️: [`json/Statistiche/anni/stagioni/stagioni.json`](json/Statistiche/anni/stagioni/stagioni.json)
     Aggiungi il percorso del nuovo anno nella stagione interessata all'interno dei vari sottoperiodi, usando il percorso reale `json/<Stagione>/Periodi/<anno>.json`.

---

## 📅 Creazione di un Nuovo Anno

### Passaggi da Seguire

1. **Creare la Struttura HTML**
   - Crea un nuovo file HTML per il nuovo anno nella cartella: [`Statistiche/Anni/`](Statistiche/Anni/) con il nome del nuovo anno.

2. **Creare il File JSON**
   - Crea un nuovo file JSON per l'anno nella cartella: [`json/Statistiche/anni/`](json/Statistiche/anni/) con il nome del nuovo anno.

3. **Aggiornare le Immagini**
   - Aggiungi l'icona (favicon) dell'anno in [`Img/Statistiche/Anni/`](img/Statistiche/Anni/) con il nome del nuovo anno (`<anno>.jpg`), e verifica che il link `rel="icon"` della pagina punti a quel file. Con lo script guidato lo fa in automatico.

4. **Aggiornare il File di Storia Generale**
   - Tutte le pagine di Statistiche (Statistiche, Statistiche Totali, Statistiche Mensili, Storico Mensile) leggono ora un unico file: [`json/Statistiche/History/Storico.json`](json/Statistiche/History/Storico.json).
   - Aggiungi il nuovo anno in `anni` con il percorso (`json/Statistiche/anni/<anno>.json`).
   - Aggiungi il colore del nuovo anno in fondo a `coloriAnni` (usato dalle pagine Statistiche e Storico Mensile).
   - `coloriMesi` è la tavolozza usata solo per il grafico mensile a barre e di norma non va toccata quando si aggiunge un anno.

---

## 🔐 Credenziali

1. **Nome Utente**
   - **Percorso:** [`json/About_US/Users.json`](json/About_US/Users.json)

2. **Password Giornaliera**
   - Formato della password: `Giri DD/MM/YYYY`
   - `DD` è il giorno, `MM` il mese e `YYYY` l'anno.
   - I numeri di giorno e mese devono essere preceduti da uno zero se minori di 10 (es. 09 per il 9).

---

## 🌐 Logo e Apertura del Sito

![Logo](Img/logo.jpg)

- Link al sito: [Vai al sito](https://giri-in-bici.netlify.app/)

---

## 👥 Avatar dei Partecipanti

- [Avatar NM](https://www.komoot.com/it-it/user/1372754001803)

  ![Avatar NM](Img/About_US/AvatarNM.jpg)

- [Avatar JR](https://www.komoot.com/it-it/user/1381372752571)

  ![Avatar JR](Img/About_US/AvatarJR.png)

---

## 💻 Tecnologie Utilizzate

Il sito è stato sviluppato utilizzando le seguenti tecnologie:

<p align="left">
  <a href="https://developer.mozilla.org/en-US/docs/Glossary/HTML5" target="_blank" rel="noreferrer">
    <img src="https://raw.githubusercontent.com/danielcranney/readme-generator/main/public/icons/skills/html5-colored.svg" width="36" height="36" alt="HTML5" />
  </a>
  <a href="https://developer.mozilla.org/en-US/docs/Web/CSS" target="_blank" rel="noreferrer">
    <img src="https://raw.githubusercontent.com/danielcranney/readme-generator/main/public/icons/skills/css3-colored.svg" width="36" height="36" alt="CSS3" />
  </a>
  <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank" rel="noreferrer">
    <img src="https://raw.githubusercontent.com/danielcranney/readme-generator/main/public/icons/skills/javascript-colored.svg" width="36" height="36" alt="JavaScript" />
  </a>
</p>
