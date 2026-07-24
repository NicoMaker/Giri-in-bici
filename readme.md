# 📋 Aggiornamenti e Manutenzione

Questa guida descrive come aggiornare i file e creare nuove stagioni e anni per mantenere il sito sempre aggiornato.

---

## 📂 Aggiornare i Dati JSON

### Stagione

1. **Aggiorna il file JSON per la stagione Estate 2026**
   - **Percorso:** [`json/Estate/Periodi/2026.json`](json/Estate/Periodi/2026.json)
   - Aggiungi i dettagli delle corse seguendo lo stesso schema delle altre corse.

### Statistiche

1. **Aggiorna il file JSON per le statistiche per il 2026**
   - **Percorso:** [`json/Statistiche/anni/2026.json`](json/Statistiche/anni/2026.json)
   - Modifica i chilometri (km) di Giugno e aggiorna e il numero totale di corse dell'anno.

---

## 🗓 Inizio di una Nuova Stagione

### Creazione della Nuova Stagione

### Passaggi da Seguire

1. **Struttura HTML**

   Crea il file HTML per la stagione nelle cartelle di riferimento, seguendo il percorso indicato, e inserendo l’anno della stagione:
   - **Primavera** 🌸: [`Primavera/Periodi/`](Primavera/Periodi/)
   - **Estate** 🌞: [`Estate/Periodi/`](Estate/Periodi/)
   - **Autunno Inverno** 🍁❄️: [`Autunno_Inverno/Periodi/`](Autunno_Inverno/Periodi/)

2. **File JSON per la Nuova Stagione**

   Crea un file JSON per la nuova stagione all’interno delle cartella di riferimento con il nome dell’anno:
   - **Primavera** 🌸: [`json/Primavera/Periodi/`](json/Primavera/Periodi/)
   - **Estate** 🌞: [`json/Estate/Periodi/`](json/Estate/Periodi/)
   - **Autunno Inverno** 🍁❄️: [`json/Autunno_Inverno/Periodi/`](json/Autunno_Inverno/Periodi/)

3. **Aggiornamento del File Principale della Stagione 🌸🌞🍁❄️**

   Aggiorna il file principale del nuovo periodo nella stagione in cui hai creato la nuova sottostagione, specificando il percorso del file con il nome e il colore del nuovo periodo come fatto per gli altri. Il percorso da inserire nel campo `subPeriods` deve puntare al file JSON reale sotto `json/`, non alla vecchia cartella `Periodi/Json`:
   - **Primavera** 🌸: [`json/Primavera/primavera.json`](json/Primavera/primavera.json)
   - **Estate** 🌞: [`json/Estate/estate.json`](json/Estate/estate.json)
   - **Autunno Inverno** 🍁❄️: [`json/Autunno_Inverno/autunno-inverno.json`](json/Autunno_Inverno/autunno-inverno.json)

4. **Sistemazione file Stagioni.json**
   - **Stagione Generale** 🌸🌞🍁❄️: [`json/Statistiche/anni/stagioni/stagioni.json`](json/Statistiche/anni/stagioni/stagioni.json)  
     Aggiungi il percorso del nuovo anno nella stagione interessata all’interno dei vari sottoperiodi, usando il percorso reale `json/<Stagione>/Periodi/<anno>.json`.

---

## 📅 Creazione di un Nuovo Anno

### Passaggi da Seguire

1. **Creare la Struttura HTML**
   - Crea un nuovo file HTML per il nuovo anno nella cartella: [`Statistiche/Anni/`](Statistiche/Anni/) con il nome del nuovo anno.

2. **Creare il File JSON**
   - Crea un nuovo file JSON per l’anno nella cartella: [`json/Statistiche/anni/`](json/Statistiche/anni/) con il nome del nuovo anno.

3. **Aggiornare le Immagini**
   - Aggiungi un’immagine per il nuovo anno nella cartella: [`img/Statistiche/Anni/`](img/Statistiche/Anni/) con il nome del nuovo anno.

4. **Aggiornare i File di Storia Generale**
   - **Generale:** Modifica [`json/Statistiche/History/Generale.json`](json/Statistiche/History/Generale.json), aggiungendo il percorso (`json/Statistiche/anni/<anno>.json`) e il colore del nuovo anno.
   - **Grafico Totale:** Modifica [`json/Statistiche/History/GraficoTotale.json`](json/Statistiche/History/GraficoTotale.json), aggiungendo il percorso corretto del nuovo anno (`json/Statistiche/anni/<anno>.json`) e il colore.
   - **Storico Mensile:** Aggiungi un nuovo record con i dati del nuovo anno in [`json/Statistiche/History/StoricoMensile.json`](json/Statistiche/History/StoricoMensile.json), specificando il percorso corretto (`json/Statistiche/anni/<anno>.json`) e il colore.

   > ⚠️ In tutti e tre i file i percorsi vanno scritti **relativi alla root del sito** (es. `json/Statistiche/anni/2026.json`), non relativi alla cartella del file (niente `../`).

---

## 🖼️ Convenzione Percorsi Immagini

Tutte le immagini del sito vivono sotto un'unica cartella `img/` in radice, organizzata per categoria (rispecchia la stessa logica di `json/`):

- `img/About_US/` — avatar e mappa
- `img/Autunno_Inverno/`, `img/Estate/`, `img/Primavera/` — foto dei periodi, per anno
- `img/Bici/` — foto e intestazioni della sezione Bici
- `img/Icons/` — icone condivise dall'interfaccia (menu, pulsanti, bandierine)
- `img/Statistiche/Anni/` — copertine delle pagine annuali di Statistiche
- `img/assets/` — grafica dell'interfaccia (es. `stagioni.svg`)
- file di uso generale (logo, animazioni) direttamente in `img/`

**Importante:** ovunque venga referenziata un'immagine — `<img src="...">`, `<link rel="icon" href="...">`, campi nei file JSON (es. `icon` in `Menu.json`, `immagine`/`intestazioni` in `bici.json`) — il percorso va scritto **assoluto dalla root del sito**, con la barra iniziale (es. `/img/Icons/home.png`, `/img/Estate/2026/1.jpg`). In questo modo il riferimento funziona indipendentemente dalla profondità della pagina che lo usa, senza dover calcolare `../` a mano.

---

## 🔐 Credenziali

1. **Nome Utente**
   - **Percorso:** [`json/About_US/Users.json`](json/About_US/Users.json)

2. **Password Giornaliera**
   - Formato della password: `Giri DD/MM/YYYY`
   - `DD` è il giorno, `MM` il mese e `YYYY` l’anno.
   - I numeri di giorno e mese devono essere preceduti da uno zero se minori di 10 (es. 09 per il 9).

---

## 🌐 Logo e Apertura del Sito

![Logo](img/logo.jpg)

- Link al sito: [Vai al sito](https://giri-in-bici.netlify.app/)

---

## 🗺 Mappa del Sito

![Mappa del Sito](img/About_US/Mappa.jpg)

---

## 👥 Avatar dei Partecipanti

- [Avatar NM](https://www.komoot.com/it-it/user/1372754001803)

  ![Avatar NM](img/About_US/AvatarNM.jpg)

- [Avatar JR](https://www.komoot.com/it-it/user/1381372752571)

  ![Avatar JR](img/About_US/AvatarJR.png)

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

---
