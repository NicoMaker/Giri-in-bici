document.addEventListener("DOMContentLoaded", function () {
  const jsonUrl = document.getElementById("json").getAttribute("link");

  fetch(jsonUrl)
    .then((response) => response.json())
    .then((json) => {
      const season = json.season,
        image = json.image,
        path = json.path,
        contorno = json.contorno,
        data = json.data,
        colors = json.colors,
        numberOfRaces = json.numberOfRaces,
        labels = Object.keys(data),
        values = Object.values(data),
        totale = values.reduce((acc, cur) => acc + cur, 0),
        avgValues = labels.map((label) =>
          ((data[label] / totale) * 100).toFixed(2)
        ),
        datasets = [
          {
            label: `km ${season}`,
            backgroundColor: colors,
            borderColor: ["black"],
            borderWidth: 1,
            data: values,
          },
        ],
        doughnutData = {
          labels,
          datasets,
        },
        doughnutConfig = {
          type: "doughnut",
          data: doughnutData,
        },
        doughnutCtx = document
          .getElementById("doughnut-chart")
          .getContext("2d"),
        stampa = labels
          .map(
            (label, index) => `
              <div class="${contorno}contorno">
                <a href="${path}/Periodi/${label}.html">
                   <img class="immaginestagione" src="Icons/${image}">
                  <p class="titoli">
                      ${season} ${label}
                      <p>Totale km  ${data[label]} 
                      <img src="Icons/traguardo.png"></p> 
                      <p> ${avgValues[index]} % </p>
                  </p>
                </a>
              </div>
            `
          )
          .join("");

      document.getElementById(
        "stampa"
      ).innerHTML = `<div class="container">${stampa}</div>`;

      const avgseason = (totale / labels.length).toFixed(2),
        avgcorsa = (totale / numberOfRaces).toFixed(2),
        stampaseason = `
          <div class="colore">
            <p>Totale km percorsi in ${season} ${totale} <img src="Icons/traguardo.png"> </p>
            <p>km medi per corsa in ${season} ${avgcorsa} </p>
            <p>media km per stagione ${avgseason} </p>
          </div>
        `;
      document.getElementById("totale").innerHTML = stampaseason;

      const container = document.querySelector(".container"),
        items = document.querySelectorAll(".Primaveracontorno"),
        isOdd = items.length % 2 !== 0;

      if (isOdd) container.classList.add("odd-items");

      new Chart(doughnutCtx, doughnutConfig);
    })
    .catch((error) => console.error("Error loading the JSON data:", error));
});
