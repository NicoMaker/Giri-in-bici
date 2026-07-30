// ============================================================
// utils.js — Come si scrivono i numeri in tutto il sito
// Separatore delle migliaia col punto, decimali con la virgola.
// La lettura dei file JSON sta in JS/json.js.
// Includere PRIMA di qualsiasi altro script JS del progetto.
// ============================================================

/**
 * Formatta un numero in stile italiano (separatore migliaia = punto,
 * separatore decimale = virgola).
 * @param {number|string} num
 * @param {boolean} forceDecimals - se true mostra sempre 2 decimali
 * @returns {string}
 */
function formatItalianNumber(num, forceDecimals = false) {
  if (typeof num === "string") num = parseFloat(num);
  if (isNaN(num)) return "0";

  // Arrotonda sempre a 2 decimali prima di decidere se mostrarli,
  // così un valore come 99,999 non genera un ",00" fantasma dopo l'arrotondamento.
  const rounded = Math.round((num + Number.EPSILON) * 100) / 100;

  let decimalString = "";
  // Regola: se i decimali sono ,00 non si mostrano mai, indipendentemente
  // da dove viene chiamata la funzione in tutto il sito.
  if (forceDecimals || !Number.isInteger(rounded)) {
    const decimalPart = rounded.toFixed(2).split(".")[1];
    if (decimalPart !== "00") {
      decimalString = "," + decimalPart;
    }
  }

  let integerPart = Math.trunc(Math.abs(rounded)).toString();
  const sign = rounded < 0 ? "-" : "";

  if (integerPart.length > 3) {
    const groups = [];
    let i = integerPart.length;
    while (i > 0) {
      const start = Math.max(0, i - 3);
      groups.unshift(integerPart.substring(start, i));
      i -= 3;
    }
    integerPart = groups.join(".");
  }

  return sign + integerPart + decimalString;
}

/**
 * Formatta un numero mostrando i decimali solo se sono diversi da ,00.
 * Usato in tutto il sito per tabelle, medie e totali.
 * @param {number|string} value
 * @returns {string}
 */
const formatNumber = (value) => formatItalianNumber(value, false);

/**
 * Formatta una percentuale, senza mostrare mai ",00" se non necessario.
 * @param {number|string} value
 * @returns {string}
 */
function formatPercentage(value) {
  return formatItalianNumber(value, false);
}

// Espone le funzioni globalmente
window.formatItalianNumber = formatItalianNumber;
window.formatNumber = formatNumber;
window.formatPercentage = formatPercentage;
