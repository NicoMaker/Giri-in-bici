// ============================================================
// utils.js — Funzioni di utilità condivise in tutto il sito
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

  let decimalString = "";
  if (forceDecimals || !Number.isInteger(num)) {
    const decimalPart = num.toFixed(2).split(".")[1];
    if (decimalPart !== "00") {
      decimalString = "," + decimalPart;
    }
  }

  const parts = num.toString().split(".");
  let integerPart = parts[0];

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

  return integerPart + decimalString;
}

/**
 * Formatta un numero con 2 decimali (alias conveniente).
 * Usato principalmente per tabelle e medie.
 * @param {number|string} value
 * @returns {string}
 */
const formatNumber = (value) => formatItalianNumber(value, true);

/**
 * Formatta una percentuale con esattamente 2 decimali fissi.
 * @param {number|string} value
 * @returns {string}
 */
function formatPercentage(value) {
  if (typeof value === "string") value = parseFloat(value);
  if (isNaN(value)) return "0";

  const fixedNum = value.toFixed(2);
  const parts = fixedNum.split(".");
  let integerPart = parts[0];
  const decimalPart = parts[1];

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

  // Se i decimali sono "00", non mostrarli
  if (decimalPart === "00") return integerPart;
  return integerPart + "," + decimalPart;
}

/**
 * Recupera un file JSON da un URL.
 * @param {string} url
 * @returns {Promise<any>}
 */
async function fetchJSON(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
}

// Espone le funzioni globalmente
window.formatItalianNumber = formatItalianNumber;
window.formatNumber = formatNumber;
window.formatPercentage = formatPercentage;
window.fetchJSON = fetchJSON;