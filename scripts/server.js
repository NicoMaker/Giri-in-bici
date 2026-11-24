#!/usr/bin/env node
/*
 * server.js — Interfaccia WEB per aggiornare Giri in Bici.
 *
 * Uso (dalla cartella principale del progetto):
 *     node scripts/server.js                  apre http://localhost:3000
 *     node scripts/server.js --porta=4000     un'altra porta
 *     node scripts/server.js --prova          mostra le anteprime ma non scrive nulla
 *     node scripts/server.js --senza-browser  non apre il browser da solo
 *
 */
"use strict";

require("./nuovo/server/server");
