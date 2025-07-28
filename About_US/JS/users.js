class TeamManager {
  constructor(jsonPath = "JS/Users.json") {
    this.jsonPath = jsonPath;
    this.data = null;
  }

  async init() {
    try {
      await this.loadData();
      if (localStorage.getItem("hideTeamSection") !== "true") {
        this.renderTeamSection();
      }
      this.initializeAnimations();
    } catch (error) {
      console.error(
        "Errore durante l'inizializzazione del Team Manager:",
        error,
      );
    }
  }

  async loadData() {
    try {
      const response = await fetch(this.jsonPath);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      this.data = await response.json();
    } catch (error) {
      console.error("Errore durante il caricamento dei dati:", error);
      throw error;
    }
  }

  renderTeamSection() {
    const existingTeamSection = document.querySelector(".team-section");
    if (!existingTeamSection) {
      console.error("Sezione team non trovata");
      return;
    }

    const teamGrid = this.createTeamGrid();
    const teamGridContainer = existingTeamSection.querySelector(".team-grid");
    if (teamGridContainer) {
      teamGridContainer.innerHTML = teamGrid;
    }
  }

  createTeamGrid() {
    return this.data.users
      .filter((user) => user.visibleInTeam !== false)
      .map((user) => this.createTeamMemberCard(user))
      .join("");
  }

  createTeamMemberCard(user) {
    const avatarHtml = user.avatar
      ? `<img src="Img/${user.avatar}" alt="Avatar ${user.name}" />`
      : "";
    const descriptionHtml = user.description
      ? `<p>${user.description}</p>`
      : "";
    const linkHtml = user.komootUrl
      ? `
            <a href="${user.komootUrl}" target="_blank" rel="noopener noreferrer" class="member-link">
                Visualizza Profilo Komoot
            </a>`
      : "";

    return `
            <div class="team-member">
                <div class="avatar">${avatarHtml}</div>
                <h3 class="member-name">${user.name || "Sconosciuto"}</h3>
                ${descriptionHtml}
                ${linkHtml}
            </div>
        `;
  }

  initializeAnimations() {
    const teamMembers = document.querySelectorAll(".team-member");
    teamMembers.forEach((member) => {
      member.addEventListener("mouseenter", function () {
        this.style.background =
          "linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(240, 147, 251, 0.2))";
      });
      member.addEventListener("mouseleave", function () {
        this.style.background = "rgba(255, 255, 255, 0.5)";
      });
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const teamManager = new TeamManager();
  teamManager.init();

  const toggle = document.getElementById("toggleTeam");
  if (toggle) {
    toggle.checked = localStorage.getItem("hideTeamSection") === "true";
    toggle.addEventListener("change", function () {
      localStorage.setItem("hideTeamSection", this.checked ? "true" : "false");
      location.reload();
    });
  }
});
