# 📋 Aggiornamenti e Manutenzione 

Questa guida descrive come aggiornare i file e creare nuove stagioni e anni per mantenere il sito sempre aggiornato. È pensata per essere semplice e comprensibile, anche per chi non ha esperienza di programmazione.

---

## 📂 Aggiornare i Dati JSON

### Stagione

1. **Aggiorna il file JSON per la stagione Estate 2025**

   - **Percorso:** [`Estate/Periodi/Json/2025.json`](Estate/Periodi/Json/2025.json)
   - Aggiungi i dettagli delle corse seguendo lo stesso schema delle altre corse.

### Statistiche

1. **Aggiorna il file JSON per le statistiche per il 2025**
   - **Percorso:** [`Statistiche/Js/anni/2025.json`](Statistiche/Js/anni/2025.json)
   - Modifica i chilometri (km) di Luglio e aggiorna il numero totale di corse dell'anno.

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

   - **Primavera** 🌸: [`Primavera/Periodi/Json`](Primavera/Periodi/Json)
   - **Estate** 🌞: [`Estate/Periodi/Json`](Estate/Periodi/Json)
   - **Autunno Inverno** 🍁❄️: [`Autunno_Inverno/Periodi/Json`](Autunno_Inverno/Periodi/Json)

3. **Aggiornamento del File Principale della Stagione 🌸🌞🍁❄️**

   Aggiorna il file principale del nuovo periodo nella stagione in cui hai creato la nuova sottostagione, specificando il percorso del file con il nome e il colore del nuovo periodo come fatto per gli altri:

   - **Primavera** 🌸: [`Primavera/primavera.json`](Primavera/primavera.json)
   - **Estate** 🌞: [`Estate/estate.json`](Estate/estate.json)
   - **Autunno Inverno** 🍁❄️: [`Autunno_Inverno/autunno-inverno.json`](Autunno_Inverno/autunno-inverno.json)

4. **Sistemazione file Stagioni.json**

   - **Stagione Generale** 🌸🌞🍁❄️: [`Statistiche/Js/anni/stagioni.json`](Statistiche/Js/anni/stagioni.json)  
     Aggiungi il percorso del nuovo anno nella stagione interessata all’interno dei vari sottoperiodi.

5. **Aggiornamento del Grafico in Base alla Stagione**

   **Grafico**: [`About_US/About_us.html`](About_US/About_us.html)

   a seconda della stagione, devi aggiornare il percorso del nuovo file relativo al grafico nel codice HTML:

   - Primavera 🌸: Inserisci il nuovo percorso per il grafico della Primavera.
   - Estate 🌞: Inserisci il nuovo percorso per il grafico dell'Estate.
   - Autunno-Inverno 🍁❄️: Inserisci il nuovo percorso per il grafico dell'Autunno-Inverno.

---

## 📅 Creazione di un Nuovo Anno

### Passaggi da Seguire

1. **Creare la Struttura HTML**

   - Crea un nuovo file HTML per il nuovo anno nella cartella: [`Statistiche/Anni/`](Statistiche/Anni/) con il nome del nuovo anno.

2. **Creare il File JSON**

   - Crea un nuovo file JSON per l’anno nella cartella: [`Statistiche/Js/anni/`](Statistiche/Js/anni/) con il nome del nuovo anno.

3. **Aggiornare le Immagini**

   - Aggiungi un’immagine per il nuovo anno nella cartella: [`Statistiche/Anni/Img/`](Statistiche/Anni/Img/) con il nome del nuovo anno.

4. **Aggiornare i File di Storia Generale**

   - **Generale:** Modifica [`Statistiche/Js/History/JSON/Generale.json`](Statistiche/Js/History/JSON/Generale.json), aggiungendo il percorso e il colore del nuovo anno.
   - **Grafico Totale:** Modifica [`Statistiche/Js/History/JSON/GraficoTotale.json`](Statistiche/Js/History/JSON/GraficoTotale.json), aggiungendo il percorso corretto del nuovo anno.
   - **Storico Mensile:** Aggiungi un nuovo record con i dati del nuovo anno in [`Statistiche/Js/History/JSON/StoricoMensile.json`](Statistiche/Js/History/JSON/StoricoMensile.json), specificando il percorso corretto.

5. Aggiornamento del Grafico in Base alla Stagione e all'Anno

   **Grafico**: [`About_US/About_us.html`](About_US/About_us.html)

   - Statistica Anno: Dentro la parte delle Statistiche Anno, aggiorni il nuovo percorso del grafico per il nuovo anno nel file HTML.

---

## 🔐 Credenziali

1. **Nome Utente**

   - **Percorso:** [`About_US/JS/Users.json`](About_US/JS/Users.json)

2. **Password Giornaliera**
   - Formato della password: `Giri DD/MM/YYYY`
   - `DD` è il giorno, `MM` il mese e `YYYY` l’anno.
   - I numeri di giorno e mese devono essere preceduti da uno zero se minori di 10 (es. 09 per il 9).

---

## 🌐 Logo e Apertura del Sito

![Logo](Img/logo.jpg)

- Link al sito: [Vai al sito](https://giri-in-bici.netlify.app/)

---

## 🗺 Mappa del Sito

![Mappa del Sito](About_US/Img/Mappa.jpg)

---

## 👥 Avatar dei Partecipanti

- [Avatar NM](https://www.komoot.com/it-it/user/1372754001803)

  ![Avatar NM](About_US/Img/AvatarNM.jpg)

- [Avatar JR](https://www.komoot.com/it-it/user/1381372752571)

  ![Avatar JR](About_US/Img/AvatarJR.png)

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
