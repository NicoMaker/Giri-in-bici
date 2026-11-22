#!/usr/bin/env node
/*
 * nuovo.js — Creazione GUIDATA di una nuova stagione o di un nuovo anno.
 *
 * Uso (dalla cartella principale del progetto):
 *     node scripts/nuovo.js
 *     node scripts/nuovo.js --prova      (mostra cosa farebbe, senza scrivere nulla)
 *
 *     # aggiungere un giro senza menu (quello che mancasse lo chiede):
 *     node scripts/nuovo.js --giro --stagione=Autunno_Inverno --data="22 Novembre 2026" \
 *          --km=95 --luogo="Pinzano" --link="https://www.komoot.com/..." [--si]
 *
 * Segue passo passo la logica del README ("Inizio di una Nuova Stagione" e
 * "Creazione di un Nuovo Anno"). Non servono librerie: basta Node.js.
 *
 *  NUOVA STAGIONE (Primavera / Estate / Autunno-Inverno)
 *    1. crea   <Stagione>/<periodo>.html            (copia dell'ultimo periodo)
 *    2. crea   json/<Stagione>/Periodi/<periodo>.json   (un solo giro d'esempio)
 *    3. aggiorna json/<Stagione>/generale.json      (subPeriods + colors)
 *    4. aggiorna json/Statistiche/anni/stagioni/stagioni.json
 *    5. foto: se indichi la cartella le copia come 1.jpg, 2.jpg... e la
 *       galleria della pagina HTML viene costruita con i blocchi giusti
 *
 *  NUOVO ANNO (Statistiche)
 *    1. crea   Statistiche/Anni/<anno>.html
 *    2. crea   json/Statistiche/anni/<anno>.json
 *    3. aggiorna json/Statistiche/History/Storico.json (anni + coloriAnni)
 *    4. icona (favicon) dell'anno: copia la tua immagine .jpg oppure la
 *       crea con l'anno scritto sul colore scelto, e collega la pagina
 *
 *  NUOVO GIRO  (il caso più frequente)
 *    "Il giorno X ho fatto un giro di N km": dati data, stagione, luogo, link e km
 *    1. aggiunge il giro nel JSON del periodo giusto, in ordine cronologico
 *    2. somma i km nel mese giusto dell'anno giusto (json/Statistiche/anni/<anno>.json);
 *       se quel mese non c'è ancora lo crea
 *    3. aumenta di 1 le corse dell'anno (numberOfRaces)
 *
 *  MESE   aggiunge (o corregge) un mese in un anno già esistente.
 *
 * I COLORI di stagioni e anni li scrivi sempre tu nel terminale (nome CSS, es.
 * gold, oppure #esadecimale): non c'è nessun colore suggerito.
 *
 * Tutte le modifiche vengono preparate in memoria, controllate (JSON valido,
 * nessun file sovrascritto) e scritte solo alla fine, dopo la conferma: se
 * qualcosa non va, non resta niente a metà.
 *
 * Il codice è diviso in componenti, in cartelle per argomento, dentro scripts/nuovo/
 * (base, json, immagini, calcoli, azioni, programma): questo file serve solo ad avviarli.
 */
"use strict";

require("./nuovo/programma/menu");
