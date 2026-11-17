// escape-html.js — Rende sicuro un testo da mettere dentro un attributo o un tag HTML.

const SOSTITUZIONI = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" };

export function escapeHtml(testo) {
  return String(testo).replace(/[&<>"]/g, (c) => SOSTITUZIONI[c]);
}
