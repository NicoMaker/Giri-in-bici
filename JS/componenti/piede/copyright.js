// copyright.js — Riga del copyright e date. Gli span [data-anno] e
// [data-fine-periodo] li riempiono anno-corrente.js e data-odierna.js.

export function copyright() {
  return `<p>
      &copy; 2020&ndash;<span data-anno></span> Giri in Bici &middot; Nico Maker
      <br />
      <span class="footer-dates">Dal 30 Maggio 2020 al <span data-fine-periodo></span></span>
    </p>`;
}
