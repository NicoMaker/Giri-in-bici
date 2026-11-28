📋 Aggiornamenti e Manutenzione
Questa guida descrive come aggiornare i file e creare nuove stagioni e anni per mantenere il sito sempre aggiornato.

## 🖥️ Gestionale con server (il modo più comodo)

Un piccolo server locale permette di gestire tutto da una pagina web, senza modificare i file a mano: i dati si scrivono da soli nei JSON e nelle cartelle giuste.

### Avvio

1. Installa [Node.js](https://nodejs.org/) (versione 20 o più recente).
2. Dalla cartella principale del progetto (quella con `json` e `scripts`) esegui:

   ```bash
   node scripts/server.js
   ```

3. Apri `http://localhost:3000` nel browser. Da telefono sulla stessa rete Wi-Fi usa l'indirizzo "IP Locale" mostrato nel terminale. Per fermarlo: `Ctrl + C`.
4. Opzioni utili: `--porta=3100` (cambia porta) e `--prova` (modalità prova: non scrive nulla).

### Cosa si può fare

| Sezione              | Funzioni                                                                                                                                     |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **Inserimento**      | Aggiungi giri, mesi, foto, stagioni e anni con una procedura guidata e anteprima prima di scrivere.                                          |
| **Archivio giri**    | Cerca, filtra (stagione, anno, mese, km), ordina, modifica ed elimina uno o più giri insieme (casella a sinistra, Maiusc per un intervallo). |
| **Utenti**           | Elenco con avatar (o icona se manca), modifica ed eliminazione multipla.                                                                     |
| **Bandiere**         | Crea, sostituisci, rinomina ed elimina bandiere. Si possono eliminare più bandiere insieme; quelle ancora usate nei giri vengono protette.   |
| **Colori e periodi** | Nome e colore generale di ogni stagione (es. Estate), colori dei periodi, eliminazione multipla dei periodi.                                 |

Scorciatoia: `Ctrl + K` apre la ricerca comandi.

### Aggiornamento automatico

Il gestionale controlla le cartelle `Img` e `json`: se aggiungi o cambi un file (anche a mano o da codice) i dati si aggiornano da soli, **senza ricaricare la pagina**. Accanto a "Online" compare "live".

### Bandiere con il server

1. Apri la sezione **Bandiere** → **Nuova bandiera**, scrivi il nome (es. `Slovenia`) e scegli l'immagine PNG, JPG o WebP.
2. Il server salva l'immagine in `Img/Icons/Bandiere/Slovenia.png` e la registra in [`json/Bandiere-personalizzate.json`](json/Bandiere-personalizzate.json).
3. Nei giri la bandiera si sceglie dal campo "bandiera" del luogo. Le pagine **Giri** e **About us** mostrano da sole l'elenco dei paesi con le loro bandiere: non serve toccare l'HTML.

Se metti un'immagine direttamente in `Img/Icons/Bandiere/` il server la registra da solo all'avvio e mentre è acceso.

### Stagioni

Dalla sezione **Colori e periodi → Stagioni** si cambiano il nome mostrato e il colore generale di ogni stagione; il colore vale anche nelle schede delle statistiche del sito. I periodi hanno come nome l'anno (`2026`, `2026-2027`) perché le statistiche sono legate a quell'anno, quindi non si rinominano: si creano e si eliminano.

---

## ✋ Senza server (a mano, con i file)

Se preferisci non usare il server, tutto si può fare modificando direttamente i file come descritto qui sotto.

## 📂 Aggiornare i Dati JSON

### Stagione

1. **Aggiorna il file JSON per la stagione Autunno-Inverno 2026-2027**
   - **Percorso:** [`json/Autunno_Inverno/Periodi/2026-2027.json`](json/Autunno_Inverno/Periodi/2026-2027.json)
   - Aggiungi i dettagli delle corse seguendo lo stesso schema delle altre corse.

### Statistiche

1. **Aggiorna il file JSON per le statistiche per il 2026**
   - **Percorso:** [`json/Statistiche/anni/2026.json`](json/Statistiche/anni/2026.json)
   - Modifica i chilometri (km) di Novembre e aggiorna il numero totale di corse dell'anno.

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

## 🚩 Bandiere dei Paesi (senza server)

Le bandiere si inseriscono a mano così:

1. **Metti l'immagine** (PNG, JPG o WebP, con un nome senza spazi né accenti, es. `Slovenia.png`) direttamente in [`Img/Icons/Bandiere/`](Img/Icons/Bandiere).
2. **Registrala nel file di riferimento** [`json/Bandiere-personalizzate.json`](json/Bandiere-personalizzate.json) aggiungendo una voce:

   ```json
   {
     "codice": "CUSTOM_Slovenia",
     "nome": "Slovenia",
     "file": "Slovenia.png"
   }
   ```

   - `codice`: `CUSTOM_` + nome del file in maiuscolo (solo lettere, numeri e `_`).
   - `nome`: come si legge nelle pagine.
   - `file`: nome esatto del file nella cartella (maiuscole comprese).

3. **Usala in un giro** aggiungendo l'immagine nel campo `place` del giro, subito dopo il luogo:

   ```html
   Da Tarvisio a Bled
   <img src="/img/Icons/Bandiere/Slovenia.png" alt="Slovenia" />
   ```

4. Le pagine **Giri** e **About us** leggono `json/Bandiere-personalizzate.json` e mostrano da sole le bandiere registrate: la voce nel file di riferimento è quindi **obbligatoria** anche senza server.

Per eliminarla fai il contrario: togli la voce dal JSON, cancella l'immagine e rimuovi l'`<img>` dai giri che la usano.

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

## 🔎 Filtri nelle pagine delle statistiche

Le pagine **Anni**, **Stagioni**, **Statistiche totali**, **Statistiche mensili** e **Storico mensile** hanno sopra la tabella una barra di filtri:

- scegli **uno o più anni** (o periodi), **uno o più mesi** e, dove serve, le **stagioni**;
- imposta un intervallo di **km** (Da / A);
- tabella, totali, percentuali, medie e grafici si ricalcolano **solo su quello che vedi**, e una riga di sintesi mostra quanti mesi/giri sono inclusi e che percentuale rappresentano;
- le medie che non si possono calcolare su una parte dei dati (per esempio "km medi per corsa" quando i mesi sono filtrati, perché le corse si contano per anno intero) mostrano `n/d`;
- "Reimposta filtri" riporta tutto com'era.

Nelle altre tabelle il campo **Cerca** accetta anche **Da / A km** quando c'è una colonna distanza, e le righe "Totale" seguono i filtri.

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
