/**
 * Team Manager - Gestisce la sezione team dinamicamente da JSON
 */
class TeamManager {
    constructor(jsonPath = 'JS/Utenti.json') {
        this.jsonPath = jsonPath;
        this.teamData = null;
    }

    /**
     * Inizializza il team manager
     */
    async init() {
        try {
            await this.loadTeamData();
            this.renderTeamSection();
            this.initializeAnimations();
        } catch (error) {
            console.error('Errore durante l\'inizializzazione del Team Manager:', error);
        }
    }

    /**
     * Carica i dati del team dal file JSON
     */
    async loadTeamData() {
        try {
            const response = await fetch(this.jsonPath);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            this.teamData = data.team;
        } catch (error) {
            console.error('Errore durante il caricamento dei dati del team:', error);
            throw error;
        }
    }

    /**
     * Renderizza l'intera sezione team
     */
    renderTeamSection() {
        const existingTeamSection = document.querySelector('.team-section');
        if (!existingTeamSection) {
            console.error('Sezione team non trovata');
            return;
        }

        const teamGrid = this.createTeamGrid();
        const teamGridContainer = existingTeamSection.querySelector('.team-grid');
        if (teamGridContainer) {
            teamGridContainer.innerHTML = teamGrid;
        }
    }

    /**
     * Crea la griglia dei membri del team
     */
    createTeamGrid() {
        return this.teamData.map(member => this.createTeamMemberCard(member)).join('');
    }

    /**
     * Crea una card per un membro del team
     */
    createTeamMemberCard(member) {
        return `
            <div class="team-member">
                <div class="avatar">
                    <img src="Img/${member.avatar}" alt="Avatar ${member.name}" />
                </div>
                <h3 class="member-name">${member.name}</h3>
                <p>${member.description}</p>
                <a href="${member.komootUrl}" target="_blank" rel="noopener noreferrer" class="member-link">
                    Visualizza Profilo Komoot
                </a>
            </div>
        `;
    }

    /**
     * Inizializza le animazioni per i membri del team
     */
    initializeAnimations() {
        const teamMembers = document.querySelectorAll('.team-member');

        // Aggiungi effetti hover
        teamMembers.forEach(member => {
            member.addEventListener('mouseenter', function () {
                this.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(240, 147, 251, 0.2))';
            });

            member.addEventListener('mouseleave', function () {
                this.style.background = 'rgba(255, 255, 255, 0.5)';
            });
        });
    }
}

// Inizializzazione quando il DOM è carico
document.addEventListener('DOMContentLoaded', () => {
    const teamManager = new TeamManager();
    teamManager.init();
});