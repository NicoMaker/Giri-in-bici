// escape-html.js — Rende sicuro un testo da mettere dentro un attributo o un tag HTML.

const SOSTITUZIONI = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" };

export const escapeHtml = (testo) =>
  String(testo).replace(/[&<>"]/g, (c) => SOSTITUZIONI[c]);
