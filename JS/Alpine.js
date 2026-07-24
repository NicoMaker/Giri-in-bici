function menuHandler() {
  return {
    search: "",
    items: [],

    // Funzione per caricare i dati dal JSON
    async loadData() {
      const data = await Json.leggi("JS/Menu.json");
      this.items = data.items;
      // Ordina gli elementi alfabeticamente per nome
      this.items = data.items.sort((a, b) => a.name.localeCompare(b.name));
    },

    // Funzione per filtrare gli elementi
    get filteredItems() {
      return this.items.filter((i) =>
        i.name.toLowerCase().startsWith(this.search.toLowerCase()),
      );
    },
  };
}
