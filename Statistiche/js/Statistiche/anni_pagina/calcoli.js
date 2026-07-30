// ============================================================
// calcoli.js — Medie e percentuali dei chilometri
// Richiamato da Statistiche/Js/anni.js
// ============================================================

const calculatekmMedi = (totale, divider, isPercentage = false) => {
  const result = totale / divider;
  return isPercentage ? result * 100 : result;
};

const calculatePercentuali = (chilometri, totale) =>
  chilometri.map((km) => formatNumber(calculatekmMedi(km, totale, true)));
