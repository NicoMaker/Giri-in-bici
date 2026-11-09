# 📋 Aggiornamenti e Manutenzione

Questa guida descrive come aggiornare i file e creare nuove stagioni e anni per mantenere il sito sempre aggiornato.

---

## 📂 Aggiornare i Dati JSON

### Stagione

1. **Aggiorna il file JSON per la stagione Autunno-Inverno 2026-2027**
   - **Percorso:** [`json/Autunno_Inverno/Periodi/2026-2027.json`](json/Autunno_Inverno/Periodi/2026-2027.json)
   - Aggiungi i dettagli delle corse seguendo lo stesso schema delle altre corse.

### Statistiche

1. **Aggiorna il file JSON per le statistiche per il 2026**
   - **Percorso:** [`json/Statistiche/anni/2026.json`](json/Statistiche/anni/2026.json)
   - Modifica i chilometri (km) di Novembre e aggiorna il numero totale di corse dell'anno.

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
   - Aggiungi un'immagine per il nuovo anno nella cartella: [`Img/Statistiche/Anni/`](img/Statistiche/Anni/) con il nome del nuovo anno.

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

![Logo](img/logo.jpg)

- Link al sito: [Vai al sito](https://giri-in-bici.netlify.app/)

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

## 🆕 Novità: Classifica → scheda "Giri"

- **Giri per anno** – nella scheda *Giri* di `Statistiche/History/ClassificaMesi.html` il pulsante **Giri per anno** (o `?vista=tappe&modo=anni`) mostra un blocco per ogni anno solare con tutti i giri: data, posto, link al percorso, stagione/periodo, km e quota sul totale dell'anno, più riepilogo (giri, km, media, giro più lungo, km per stagione). Ogni anno ha anche il **podio** dei suoi 3 giri più lunghi. Si possono scegliere uno o più anni (`&anni=2023,2024`), usare la **ricerca avanzata** (più posti, intervalli di date e di km) e raggruppare i giri di ogni anno **per stagione**. I totali coincidono con `json/Statistiche/anni/<anno>.json`.
- **Pagina "Corse per anno" eliminata**: `CorsePerAnno.html` non esiste più, è tutto qui (Classifica → Giri → Giri per anno). I pulsanti "Le corse del <anno>" delle pagine anno e "Vedi tutte le corse" di Statistiche portano a questa vista.
- **Colori per stagione** – 🌸 verde = Primavera, ☀️ arancione = Estate, 🍁❄️ blu = Autunno · Inverno (righe, podio, chip e legenda).
- **Reset a tre vie** (in tutte le schede della Classifica): **Solo pulsanti** (ordine, km, Anno/Stagione/Mese), **Solo ricerca** (campo Cerca), **Entrambi**.

## 📁 Percorsi

Le cartelle `js/` e `img/` sono in **minuscolo**, come richiamate da tutto l'HTML (su Netlify, che distingue maiuscole/minuscole, `JS/` e `Img/` davano 404). Se cloni su Windows/macOS e Git non vede il cambio, usa: `git mv -f JS js_tmp && git mv js_tmp js` (idem per `Img` → `img`).
